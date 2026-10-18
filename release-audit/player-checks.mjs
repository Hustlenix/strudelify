// Actual Strudel/WebAudio and user controls. No playback engine or audio output mocks.
import fs from 'node:fs';
import path from 'node:path';
import {createServer} from 'node:http';
import {createHash} from 'node:crypto';
import {chromium, firefox} from 'playwright';

const root = path.resolve(process.argv[2] || 'release-preview');
const browserName = process.argv[3] || 'chromium';
const report = {started_at: new Date().toISOString(), browser: browserName, checks: [], errors: [], requests: []};
const assert = (value, message) => { if (!value) throw new Error(message); };
const check = (name, detail = {}) => { report.checks.push({name, status:'PASSED', ...detail}); console.log('PASS', name); };
const server = createServer((req, res) => {
  const file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname.replace(/\/$/, '/index.html')));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  try {
    res.setHeader('Content-Type', ({'.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.strudel':'text/plain', '.svg':'image/svg+xml'})[path.extname(file)] || 'text/plain');
    res.end(fs.readFileSync(file));
  } catch { res.writeHead(404).end(); }
});
let browser;
let diagnosticPage;
let expectedError = false;
try {
  report.build = JSON.parse(fs.readFileSync(path.join(root, 'release.json')));
  for (const entry of report.build.files) assert(createHash('sha256').update(fs.readFileSync(path.join(root, entry.path))).digest('hex') === entry.sha256, 'Artifact changed: ' + entry.path);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}/`;
  let executablePath;
  if (process.platform === 'win32' && browserName === 'chromium')
    executablePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
  // Firefox must match this lockfile's patched Playwright revision; arbitrary newer installed
  // Firefox builds can hang its input protocol even when a control is visible and enabled.
  browser = await (browserName === 'firefox' ? firefox : chromium).launch({headless:true, executablePath,
    args: browserName === 'chromium' ? ['--mute-audio'] : []});
  report.browser_version = browser.version();
  const context = await browser.newContext({viewport:{width:1280,height:900}});
  await context.addInitScript(() => {
    window.audioProbe = {peak:0, frames:0};
    window.resumeCalls = [];
    const resume = AudioContext.prototype.resume;
    AudioContext.prototype.resume = function (...args) {
      window.resumeCalls.push({time:this.currentTime, stack:new Error().stack});
      return resume.apply(this, args);
    };
    const connect = AudioNode.prototype.connect;
    AudioNode.prototype.connect = function (destination, ...args) {
      const result = connect.call(this, destination, ...args);
      if (this.context instanceof AudioContext && destination === this.context.destination && !this.__releaseProbe) {
        this.__releaseProbe = true;
        const tap = this.context.createScriptProcessor(2048, 2, 2);
        tap.onaudioprocess = event => {
          for (let channel = 0; channel < 2; channel++) {
            const values = event.inputBuffer.getChannelData(channel);
            window.audioProbe.frames += values.length;
            for (const value of values) window.audioProbe.peak = Math.max(window.audioProbe.peak, Math.abs(value));
          }
        };
        connect.call(this, tap); connect.call(tap, destination);
      }
      return result;
    };
  });
  const page = await context.newPage();
  diagnosticPage = page;
  report.console_diagnostics = [];
  page.on('console', message => {if(['error','warning'].includes(message.type())) report.console_diagnostics.push(message.text().slice(0,1500));});
  page.on('pageerror', error => { if (!expectedError) report.errors.push(error.message); });
  page.on('request', request => report.requests.push(request.url()));
  await page.goto(url, {waitUntil:'networkidle', timeout:90000});
  await page.waitForFunction(() => !!tracks[0]?.rights);
  const ids = await page.evaluate(() => tracks.map(track => track.id));
  assert(ids.length === 6 && ids.includes('afterglow'), 'Original catalog did not load');
  assert(!report.requests.some(item => /tracks\/covers\/|dough-samples|lyrics\/[^?]+\.json/.test(item)), 'Uncleared commercial payload or bank was requested');
  check('Original catalog loads without commercial scores, lyrics or sample banks', {ids});

  await page.evaluate(() => openTrack('afterglow'));
  await page.goBack(); assert(new URL(page.url()).hash === '#home', 'Back failed');
  await page.goForward(); assert(new URL(page.url()).hash === '#track/afterglow', 'Forward failed');
  await page.locator('[data-show-code]').click();
  await page.waitForFunction(() => document.querySelector('#detailCode').textContent.includes('setcps(78'));
  const shownCode = (await page.locator('#detailCode').textContent()).replaceAll('\r\n', '\n');
  assert(shownCode === fs.readFileSync(path.join(root, 'tracks/afterglow.strudel'), 'utf8').replaceAll('\r\n', '\n'), 'View code differs from actual score');
  check('Back/Forward and complete actual View code');

  await page.locator('.detail-play').click();
  await page.waitForFunction(() => state.playing && !state.loading, null, {timeout:60000});
  await page.waitForFunction(() => audioProbe.peak > .00001, {timeout:20000});
  await page.waitForTimeout(700);
  const before = await page.evaluate(() => ({time:getAudioContext().currentTime, revision:playbackRevision, peak:audioProbe.peak}));
  await page.locator('#mainPlayButton').click();
  await page.waitForFunction(() => state.paused && !state.playing);
  const frozen = await page.evaluate(() => getAudioContext().currentTime);
  await page.waitForTimeout(1000);
  report.pause_observation = await page.evaluate(() => ({time:getAudioContext().currentTime, context:getAudioContext().state,
    paused:state.paused, playing:state.playing, revision:playbackRevision, resumes:window.resumeCalls.slice(-4)}));
  assert(Math.abs(report.pause_observation.time - frozen) < .05, 'Pause advanced the audio clock: ' + JSON.stringify({frozen, ...report.pause_observation}));
  await page.locator('#mainPlayButton').click();
  await page.waitForFunction(() => state.playing && !state.paused);
  await page.waitForTimeout(650);
  const resumed = await page.evaluate(() => ({time:getAudioContext().currentTime, revision:playbackRevision}));
  assert(resumed.revision === before.revision && resumed.time > frozen + .3, 'Resume restarted or failed to advance');
  check('Trusted click audio and true pause/resume preserve scheduler/session', {before, frozen, resumed});
  await page.locator('#stopButton').click();
  await page.waitForFunction(() => !state.playing && !state.paused && getAudioContext().state === 'suspended');

  await page.evaluate(() => { codeCache.delete('greenline'); });
  await page.route('**/greenline.strudel', async route => { await new Promise(resolve => setTimeout(resolve, 1200)); await route.continue(); });
  await page.evaluate(() => { playTrack(getTrack('greenline')); stopTrack(); });
  await page.waitForTimeout(2000);
  assert(await page.evaluate(() => !state.playing && !state.loading), 'Canceled fetch resumed music');
  await page.unroute('**/greenline.strudel');
  check('Stop cancels a delayed real source request');
  await page.evaluate(() => codeCache.delete('greenline'));
  await page.route('**/greenline.strudel', route => route.fulfill({status:503, body:'Injected network failure'}));
  await page.evaluate(() => playTrack(getTrack('greenline')));
  assert(await page.evaluate(() => !state.playing && !state.loading && playbackError.includes('503')), 'Source error has no actionable stopped state');
  await page.unroute('**/greenline.strudel');
  await page.locator('#mainPlayButton').click();
  await page.waitForFunction(() => state.playing && !state.loading && !playbackError);
  check('Injected source failure clears its cache and retries successfully');
  await page.evaluate(() => { playTrack(getTrack('greenline')); playTrack(getTrack('paper-moon')); playTrack(getTrack('tiny-hours')); });
  await page.waitForFunction(() => state.playing && !state.loading && state.current.id === 'tiny-hours');
  assert(await page.evaluate(async () => (await enginePromise).scheduler.pattern.queryArc(0, 8).every(hap => hap.value._strudelifySession === playbackRevision)), 'Old session events remain');
  await page.locator('#nextButton').click();
  await page.waitForFunction(() => state.current.id === 'wide-awake' && state.playing && !state.loading);
  await page.locator('#previousButton').click();
  await page.waitForFunction(() => state.current.id === 'tiny-hours' && state.playing && !state.loading);
  check('Rapid switching, Next and Previous retain a single current session');
  await page.locator('#mainPlayButton').click();
  await page.waitForFunction(() => state.paused);
  await page.evaluate(async () => { await Promise.all([togglePlayback(), stopTrack(), playTrack(getTrack('afterglow'))]); });
  try {
    await page.waitForFunction(() => state.playing && !state.loading && state.current.id === 'afterglow' && getAudioContext().state === 'running');
  } catch (error) {
    report.resume_race_failure_state = await page.evaluate(() => ({playing:state.playing, paused:state.paused,
      loading:state.loading, current:state.current?.id, context:getAudioContext().state, error:playbackError}));
    throw error;
  }
  await page.evaluate(() => stopTrack());
  check('Resume/Stop/new selection race leaves the latest track active');

  for (const id of ids) {
    await page.evaluate(() => { audioProbe.peak = 0; audioProbe.frames = 0; });
    await page.evaluate(id => playTrack(getTrack(id)), id);
    await page.waitForFunction(() => state.playing && !state.loading);
    await page.waitForTimeout(2200);
    const audio = await page.evaluate(() => ({...audioProbe, current:state.current.id, error:playbackError}));
    assert(audio.current === id && audio.peak > .00001 && audio.peak < 1 && !audio.error, id + ' output failed');
    await page.evaluate(async () => { await stopTrack(); });
    // Allow callbacks for buffers recorded before suspension to leave the probe queue.
    await page.waitForTimeout(250);
    await page.evaluate(() => { audioProbe.peak = 0; audioProbe.frames = 0; });
    await page.waitForTimeout(700);
    assert(await page.evaluate(() => audioProbe.peak === 0 && getAudioContext().state === 'suspended'), id + ' Stop failed');
    check(id + ' real audio and silent Stop', audio);
  }
  expectedError = true;
  await page.evaluate(async () => { try { await runCode('const = invalid'); } catch {} });
  assert(await page.evaluate(() => !state.playing && !!playbackError), 'Syntax failure has no recoverable stopped state');
  expectedError = false;
  await page.evaluate(() => openEditor());
  await page.locator('#editorCode').fill('const endSeconds = 0.7;\n$: note("c4").s("sine").gain(.05)');
  await page.locator('#editorPreviewButton').click();
  await page.waitForFunction(() => state.playing);
  await page.waitForFunction(() => !state.playing && !state.loading && getAudioContext().state === 'suspended', {timeout:10000});
  assert(await page.evaluate(() => getAudioContext().state === 'suspended'), 'Finite end leaves audio active');
  await page.locator('#editorCode').fill('note("c4 e4 g4").s("sine").gain(.05)');
  await page.locator('#editorPreviewButton').click();
  await page.waitForFunction(() => state.playing);
  await page.locator('[data-close-editor]').click();
  await page.waitForFunction(() => !state.playing && !state.paused);
  check('Syntax recovery, finite-ending fixture and editor-close cleanup');

  await page.evaluate(() => setView('search'));
  await page.locator('#searchInput').fill('paper');
  assert(await page.locator('#searchTrackList .track-card').count() === 1, 'Search result failed');
  await page.evaluate(() => openTrack('paper-moon'));
  const feedback = await page.locator('[data-feedback="paper-moon"]').getAttribute('href');
  assert(feedback.startsWith('https://github.com/Hustlenix/strudelify/issues/new?') && new URL(feedback).searchParams.get('body').includes('Paper Moon'), 'Feedback link missing context');
  check('Search and explicit public GitHub feedback link');
  fs.mkdirSync('release-audit/artifacts', {recursive:true});
  await page.evaluate(() => playTrack(getTrack('paper-moon')));
  await page.waitForFunction(() => state.playing && !state.loading);
  await page.locator('[data-show-code]').click();
  await page.waitForTimeout(1000);
  await page.screenshot({path:`release-audit/artifacts/${browserName}-desktop.png`, fullPage:true});
  await page.evaluate(() => stopTrack());
  const mobile = await context.newPage();
  await mobile.setViewportSize({width:390,height:844});
  await mobile.goto(url + '#track/paper-moon', {waitUntil:'networkidle'});
  await mobile.waitForFunction(() => !!document.querySelector('.detail-play'));
  assert(await mobile.evaluate(() => !document.querySelector('#appShell').classList.contains('lyrics-open')), 'Track notes block the fresh mobile page');
  await mobile.locator('.detail-play').click();
  await mobile.waitForFunction(() => state.playing && !state.loading);
  await mobile.locator('#mainPlayButton').click();
  await mobile.waitForFunction(() => state.paused && getAudioContext().state === 'suspended');
  await mobile.locator('#mainPlayButton').click();
  await mobile.waitForFunction(() => state.playing && getAudioContext().state === 'running');
  await mobile.locator('#nextButton').click();
  await mobile.waitForFunction(() => state.current.id === 'soft-focus' && state.playing && !state.loading);
  await mobile.locator('#previousButton').click();
  await mobile.waitForFunction(() => state.current.id === 'paper-moon' && state.playing && !state.loading);
  await mobile.locator('[data-show-code]').click();
  await mobile.locator('#stopButton').click();
  await mobile.waitForFunction(() => !state.playing && getAudioContext().state === 'suspended');
  await mobile.screenshot({path:`release-audit/artifacts/${browserName}-mobile.png`, fullPage:true});
  assert(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Mobile horizontal overflow');
  assert(await mobile.locator('#mainPlayButton').isVisible() && await mobile.locator('[data-show-code]').isVisible(), 'Mobile essential controls hidden');
  await mobile.close();
  check('Desktop 1280px and fresh mobile 390px Play/Pause/Stop/Next/Previous and code controls');
  const other = await context.newPage();
  await page.evaluate(() => playTrack(getTrack('afterglow')));
  await page.waitForFunction(() => state.playing);
  await other.goto(url, {waitUntil:'networkidle'});
  await other.locator('#starterPlayButton').click();
  await other.waitForFunction(() => state.playing && !state.loading);
  await page.waitForFunction(() => !state.playing && !state.paused);
  await other.evaluate(() => stopTrack()); await other.close();
  check('Cooperating browser tabs hand off playback ownership');
  await page.goto(url + '#track/01-babydoll', {waitUntil:'networkidle'});
  await page.waitForFunction(() => !!tracks[0]?.rights);
  assert(await page.locator('#homeView').isVisible(), 'Withheld legacy track link leaves an empty detail page');
  check('Older withheld-track links return to the available catalog');
  assert(!report.errors.length, report.errors.join('\n'));
  report.status = 'PASSED';
} catch (error) {
  report.status = 'FAILED'; report.errors.push(error.stack);
  if (diagnosticPage) report.failure_state = await diagnosticPage.evaluate(() => ({
    playing:typeof state !== 'undefined' && state.playing,
    loading:typeof state !== 'undefined' && state.loading,
    error:typeof playbackError !== 'undefined' ? playbackError : '',
    audio_context:window.getAudioContext?.().state,
    activation:navigator.userActivation ? {active:navigator.userActivation.isActive,previous:navigator.userActivation.hasBeenActive} : null,
  })).catch(error => ({diagnostic_error:error.message}));
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
  report.finished_at = new Date().toISOString();
  fs.mkdirSync('release-audit/reports', {recursive:true});
  fs.writeFileSync(`release-audit/reports/player-${browserName}.json`, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({status:report.status, checks:report.checks.length, errors:report.errors, browser:browserName}));
}
process.exitCode = report.status === 'PASSED' ? 0 : 1;
