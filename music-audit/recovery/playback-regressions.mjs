// Owner-requested music/player regressions. Fresh isolated browser, real app and Strudel.
import fs from 'node:fs';import path from 'node:path';import {createServer} from 'node:http';import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
const root=path.resolve(process.argv[2]),base=process.argv[3];
const report={generated_at:new Date().toISOString(),base:base||'local integration',checks:[],errors:[]};
report.probe_scope='Real AudioContext output only; OfflineAudioContext impulse generation is excluded. Native context suspension is asserted after Stop.';
const hashes=()=>Object.fromEntries(['app.js','index.html','styles.css'].map(name=>[name,createHash('sha256').update(fs.readFileSync(path.join(root,name))).digest('hex')]));
report.local_source_sha256=hashes();
const server=createServer((req,res)=>{
 const file=path.resolve(root,'.'+(new URL(req.url,'http://localhost').pathname==='/'?'/index.html':decodeURIComponent(new URL(req.url,'http://localhost').pathname)));
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 try{res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.strudel':'text/plain'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}
});
let browser,expectedEvalError=false;
const assert=(v,message)=>{if(!v)throw Error(message);};
try{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 browser=await chromium.launch({executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true,args:['--mute-audio']});
 const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();
 const url=base||`http://127.0.0.1:${server.address().port}/`;
 page.on('pageerror',e=>{if(!expectedEvalError)report.errors.push(e.message);});
 page.on('console',m=>{if(m.type()==='error'&&!expectedEvalError)report.errors.push(m.text());});
 await page.addInitScript(()=>{
  window.musicProbe={peak:0,frames:0};const connect=AudioNode.prototype.connect;
  AudioNode.prototype.connect=function(dest,...args){const r=connect.call(this,dest,...args);if(this.context instanceof AudioContext&&dest===this.context.destination&&!this.__probe){this.__probe=true;const tap=this.context.createScriptProcessor(4096,2,2);tap.onaudioprocess=e=>{let peak=0;for(let c=0;c<2;c++){const a=e.inputBuffer.getChannelData(c);window.musicProbe.frames+=a.length;for(const v of a)peak=Math.max(peak,Math.abs(v));}window.musicProbe.peak=Math.max(window.musicProbe.peak,peak);if(peak>.00001)window.musicProbe.last_nonzero_context={type:tap.context.constructor.name,state:tap.context.state,same:tap.context===window.getAudioContext?.(),time:tap.context.currentTime};};connect.call(this,tap);connect.call(tap,dest);}return r;};
 });
 await page.goto(url,{waitUntil:'networkidle',timeout:90000});
 await page.waitForFunction(()=>tracks.filter(t=>t.cover).length===8);
 await page.evaluate(()=>openTrack('01-babydoll'));
 await page.goBack();assert(new URL(page.url()).hash==='#home','Song navigation replaced the Home history entry');
 await page.goForward();assert(new URL(page.url()).hash==='#track/01-babydoll','Forward navigation did not restore the song');
 await page.route('**/01-babydoll.strudel',async route=>{await new Promise(r=>setTimeout(r,1200));await route.continue();});
 await page.evaluate(async()=>{codeCache.delete('01-babydoll');const older=openTrack('01-babydoll');const newer=openTrack('08-lonely');await Promise.all([older,newer]);});
 report.detail_after_concurrent=await page.evaluate(()=>({title:document.querySelector('#trackDetail h1').textContent,code:document.querySelector('#detailCode').textContent.slice(0,100),hash:location.hash}));
 assert(report.detail_after_concurrent.title==='Lonely'&&report.detail_after_concurrent.code.includes('// title: Lonely'),'Concurrent detail responses did not retain the latest song: '+JSON.stringify(report.detail_after_concurrent));
 await page.unroute('**/01-babydoll.strudel');
 report.checks.push({name:'Back/forward routes work; stale code fetch cannot replace newer song details',status:'PASSED'});
 await page.evaluate(()=>{setView('home');codeCache.delete('01-babydoll');});
 const waitPlaying=()=>page.waitForFunction(()=>state.playing&&!state.loading,{timeout:90000});
 const stopped=()=>page.evaluate(async()=>{await stopTrack();await new Promise(r=>setTimeout(r,250));window.musicProbe.peak=0;window.musicProbe.frames=0;await new Promise(r=>setTimeout(r,700));return {...window.musicProbe,playing:state.playing,loading:state.loading,context_state:window.getAudioContext().state};});
 // Delay a real response; a canceled fetch must never restart audio when it completes.
 await page.route('**/01-babydoll.strudel',async route=>{await new Promise(r=>setTimeout(r,1500));await route.continue();});
 await page.evaluate(()=>{playTrack(getTrack('01-babydoll'));stopTrack();});
 await page.waitForTimeout(3500);
 assert(await page.evaluate(()=>!state.playing&&!state.loading),'Stop during loading restarted playback');
 report.checks.push({name:'Stop cancels pending initialization and code load',status:'PASSED'});
 await page.unroute('**/01-babydoll.strudel');
 await page.locator('#homeTrackList [data-track-id="01-babydoll"]').hover();
 await page.locator('#homeTrackList [data-track-id="01-babydoll"] .row-play').click();
 await waitPlaying();await page.waitForFunction(()=>window.musicProbe.peak>0.00001,{timeout:20000});
 report.checks.push({name:'Trusted first click starts audible WebAudio under normal autoplay policy',status:'PASSED'});
 await stopped();
 await page.evaluate(()=>{playTrack(getTrack('01-babydoll'));playTrack(getTrack('06-love-me-not'));playTrack(getTrack('08-lonely'));});
 await waitPlaying();
 assert(await page.evaluate(()=>state.current.id==='08-lonely'),'Rapid switching did not keep the last selection');
 let quiet=await stopped();assert(quiet.peak<.000001,'Old voices or effect tails continue after Stop');
 report.checks.push({name:'Rapid switching keeps newest song; Stop silences the output',status:'PASSED',after_stop:quiet});
 const catalog=await page.evaluate(()=>tracks.filter(t=>t.cover).map(t=>({id:t.id,title:t.title})));
 for(const track of catalog){
  await page.evaluate(id=>playTrack(getTrack(id)),track.id);await waitPlaying();
  await page.waitForTimeout(3500);
  await page.waitForFunction(()=>window.musicProbe.peak>0.00001,{timeout:20000});
  const result=await page.evaluate(async()=>({id:state.current.id,playing:state.playing,error:playbackError,session:playbackRevision,lyric_title:document.querySelector('#lyricsTitle').textContent,
    lyric_count:lyricsCues.length,before_stop_peak:window.musicProbe.peak,all_current:(await enginePromise).scheduler.pattern.queryArc(0,8).every(h=>h.value._strudelifySession===playbackRevision)}));
  assert(result.id===track.id&&!result.error&&result.playing,track.id+' did not play');
  assert(result.all_current,track.id+' contains stale playback session events');
  assert(result.lyric_title===track.title&&result.lyric_count>0,track.id+' lyrics did not load');
  quiet=await stopped();report.last_stop={id:track.id,...quiet};assert(quiet.peak<.000001 && quiet.context_state==='suspended',track.id+' Stop evidence: '+JSON.stringify(quiet));
  report.checks.push({name:track.id+' playback, matching lyrics and hard Stop',status:'PASSED',...result,after_stop:quiet});
 }
 await page.evaluate(()=>{openEditor();document.querySelector('#editorCode').value='note("c4").s("sine").gain(.2)';});
 await page.locator('#editorPreviewButton').click();await waitPlaying();
 await page.locator('[data-close-editor]').click();
 assert(await page.evaluate(()=>!state.playing&&!state.loading),'Closing editor left preview playing');
 report.checks.push({name:'Editor preview uses the single transport and stops on close',status:'PASSED'});
 expectedEvalError=true;
 await page.evaluate(async()=>{try{await runCode('const = broken');}catch{}});
 assert(await page.evaluate(()=>!state.playing&&!state.loading&&!!playbackError),'Invalid preview did not return to stopped error state');
 expectedEvalError=false;
 await page.evaluate(()=>playTrack(getTrack('01-babydoll')));await waitPlaying();
 const other=await context.newPage();await other.goto(url,{waitUntil:'networkidle'});await other.waitForFunction(()=>tracks.some(t=>t.id==='08-lonely'));
 await other.locator('#homeTrackList [data-track-id="08-lonely"]').hover();
 await other.locator('#homeTrackList [data-track-id="08-lonely"] .row-play').click();await other.waitForFunction(()=>state.playing&&!state.loading,{timeout:90000});
 assert(await page.evaluate(()=>!state.playing&&!state.loading),'Another Strudelify tab did not release the old player');
 await other.evaluate(()=>stopTrack());await other.close();
 report.checks.push({name:'Playback recovers after syntax error; another app tab takes audio ownership',status:'PASSED'});
 await page.goto(url+'#track/01-babydoll',{waitUntil:'networkidle'});await page.waitForFunction(()=>document.querySelector('#trackDetail h1')?.textContent==='Babydoll');
 await page.locator('.detail-play').click();await waitPlaying();
 await page.locator('[data-show-code]').click();
 assert(await page.locator('#detailCode').innerText().then(t=>t.includes('eventsAtSeconds')),'View code no longer shows the complete actual source');
 await page.waitForTimeout(11000);
 await page.screenshot({path:'music-audit/artifacts/playback-lyrics-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(400);
 await page.screenshot({path:'music-audit/artifacts/playback-lyrics-mobile.png',fullPage:true});
 await stopped();
  const mobile=await context.newPage({viewport:{width:390,height:844}});
  await mobile.setViewportSize({width:390,height:844});
  await mobile.goto(url+'#track/01-babydoll',{waitUntil:'networkidle'});
  await mobile.waitForFunction(()=>document.querySelector('#trackDetail h1')?.textContent==='Babydoll');
  assert(await mobile.evaluate(()=>!document.querySelector('#appShell').classList.contains('lyrics-open')),'Lyrics initially blocks the mobile song controls');
  await mobile.locator('.nav-actions [data-toggle-lyrics]').click();
  assert(await mobile.locator('.lyrics-panel').isVisible(),'Mobile lyrics cannot be opened');
  await mobile.locator('[aria-label="Close lyrics"]').click();
  assert(await mobile.locator('[data-show-code]').isVisible(),'Mobile View code is blocked after closing lyrics');
  await mobile.close();
  report.checks.push({name:'Fresh mobile route leaves controls accessible; lyrics open and close',status:'PASSED'});
  const migration=await context.newPage();
  await migration.addInitScript(()=>localStorage.setItem('strudelify-custom',JSON.stringify([{id:'01-babydoll',title:'Babydoll',artist:'Saved draft',code:'note("c4").s("sine").gain(.1)',created:true}])));
  await migration.goto(url,{waitUntil:'networkidle'});await migration.waitForFunction(()=>tracks.some(t=>t.cover));
  const saved=await migration.evaluate(()=>({canonical:!!getTrack('01-babydoll').codeUrl,preserved:state.custom.some(t=>t.id.startsWith('saved-01-babydoll')&&t.code.includes('sine')),unique:new Set(allTracks().map(t=>t.id)).size===allTracks().length}));
  assert(saved.canonical&&saved.preserved&&saved.unique,'A browser-saved old cover shadows the deployed song');
  await migration.close();
  report.checks.push({name:'Older saved cover is preserved without shadowing the current catalog',status:'PASSED',...saved});
 report.checks.push({name:'Deep link, right-side lyrics and complete View code',status:'PASSED'});
 if(JSON.stringify(hashes())!==JSON.stringify(report.local_source_sha256))throw Error('Application files changed during validation; rerun on the final revision');
 report.status=report.errors.length?'FAILED':'PASSED';
}catch(e){report.status='FAILED';report.errors.push(e.stack);}
finally{await browser?.close();await new Promise(r=>server.close(r));fs.writeFileSync('music-audit/reports/playback-regressions'+(base?'-live':'')+'.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));}
process.exitCode=report.status==='PASSED'?0:1;
