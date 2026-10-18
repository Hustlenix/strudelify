const tracks = [
  { id: 'afterglow', title: 'Afterglow', artist: 'Strudelify', mood: 'Warm ambient', loop: '78 BPM', codeUrl: 'tracks/afterglow.strudel', group: 'Soft focus', palette: 1 },
  { id: 'greenline', title: 'Greenline', artist: 'Strudelify', mood: 'Night motion', loop: '104 BPM', codeUrl: 'tracks/greenline.strudel', group: 'Night motion', palette: 2 },
  { id: 'paper-moon', title: 'Paper Moon', artist: 'Strudelify', mood: 'Dusty keys', loop: '86 BPM', codeUrl: 'tracks/paper-moon.strudel', group: 'Slow burn', palette: 3 },
  { id: 'soft-focus', title: 'Soft Focus', artist: 'Strudelify', mood: 'Dreamy drift', loop: '68 BPM', codeUrl: 'tracks/soft-focus.strudel', group: 'Soft focus', palette: 4 },
  { id: 'tiny-hours', title: 'Tiny Hours', artist: 'Strudelify', mood: 'Offbeat synth', loop: '112 BPM', codeUrl: 'tracks/tiny-hours.strudel', group: 'Night motion', palette: 5 },
  { id: 'wide-awake', title: 'Wide Awake', artist: 'Strudelify', mood: 'Bright pulse', loop: '96 BPM', codeUrl: 'tracks/wide-awake.strudel', group: 'Slow burn', palette: 6 },
];

const palettes = [
  'linear-gradient(140deg,#b9bd92,#707b55 52%,#303c2a)',
  'linear-gradient(140deg,#b77b62,#694838 54%,#34251f)',
  'linear-gradient(140deg,#8b8191,#574d68 54%,#292631)',
  'linear-gradient(140deg,#789aa0,#46666a 54%,#26373a)',
  'linear-gradient(140deg,#c68f68,#7c523d 54%,#352820)',
  'linear-gradient(140deg,#a4a15f,#626638 54%,#2b321f)',
];
const groups = [
  { name: 'Slow burn', symbol: '◌', note: 'Take the long way home.', palette: 3 },
  { name: 'Night motion', symbol: '↗', note: 'A little light after dark.', palette: 2 },
  { name: 'Soft focus', symbol: '✳', note: 'Let the edges blur.', palette: 4 },
];

const state = {
  current: null,
  playing: false,
  paused: false,
  loading: false,
  liked: readStorage('strudelify-liked', []),
  custom: readStorage('strudelify-custom', []),
  recent: readStorage('strudelify-recent', []),
  libraryFilter: 'all',
  groupFilter: '',
  toastTimer: 0,
};
let enginePromise;
let playbackDuration = 0;
let playbackRevision = 0;
let evaluationQueue = Promise.resolve();
let playbackStartedAt = 0;
let previewing = false;
let playbackError = '';
let playbackAbort;
const playbackChannel = typeof BroadcastChannel === 'function' ? new BroadcastChannel('strudelify-playback') : null;
if (playbackChannel) playbackChannel.onmessage = event => { if (event.data === 'claim') stopTrack(); };
const codeCache = new Map();
const lyricsCache = new Map();
let lyricsRevision = 0;
let lyricsCues = [];
let highlightedLyric = -1;
let detailRevision = 0;
const coverNames = ['afterglow', 'greenline', 'paper-moon', 'soft-focus', 'tiny-hours', 'wide-awake'];
function icon(name) {
  const filled = ['play', 'pause', 'stop', 'previous', 'next'].includes(name);
  return `<svg class="icon${filled ? ' fill' : ''}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
}
function coverUrl(track) { return track.cover ? `tracks/covers/art/${encodeURIComponent(track.id)}.svg` : `assets/covers/${coverNames[((track.palette || 1) - 1) % coverNames.length]}.svg`; }
function coverImage(track) { return `<img src="${coverUrl(track)}" alt="" loading="lazy" decoding="async">`; }

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function readStorage(key, fallback) {
  try { const value = JSON.parse(localStorage.getItem(key)); return Array.isArray(value) ? value : fallback; }
  catch { return fallback; }
}
function saveStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch { showToast('Browser storage is full; this change could not be saved.'); return false; }
}
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
}
function allTracks() { return [...tracks.filter(track=>track.cover), ...state.custom, ...tracks.filter(track=>!track.cover)]; }
function getTrack(id) { return allTracks().find(track => track.id === id) || (state.current?.id === id ? state.current : null); }
function artStyle(track) { return `background:${palettes[((track.palette || 1) - 1) % palettes.length]}`; }
function artMarkup(track, className = 'row-art') {
  return `<span class="${className}" style="${artStyle(track)}" aria-hidden="true">${coverImage(track)}</span>`;
}
function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => toast.classList.remove('visible'), 2600);
}
function setStatus(message, playing = state.playing) {
  $('#playerStatus').textContent = message;
  $('#playerBar').classList.toggle('is-playing', playing);
  $('#mainPlayButton').innerHTML = icon(playing ? 'pause' : 'play');
  $('#mainPlayButton').setAttribute('aria-label', playing ? 'Pause current pattern' : state.paused ? 'Resume current pattern' : 'Play current pattern');
  $('#mainPlayButton').title = playing ? 'Pause current pattern' : state.paused ? 'Resume current pattern' : 'Play current pattern';
}
function getCode(track) {
  if (track.code) return Promise.resolve(track.code);
  if (codeCache.has(track.id)) return codeCache.get(track.id);
  const request = fetch(track.codeUrl, {cache: 'no-cache',signal:AbortSignal.timeout(15000)}).then(response => {
    if (!response.ok) throw new Error(`Could not load ${track.codeUrl} (${response.status}).`);
    return response.text();
  }).catch(error => { codeCache.delete(track.id); throw error; });
  codeCache.set(track.id, request);
  return request;
}
function ensureEngine() {
  if (typeof window.initStrudel !== 'function') throw new Error('The Strudel runtime did not load. Check your connection and refresh.');
  if (!enginePromise) enginePromise = Promise.resolve(window.initStrudel({
    // The release catalog uses native synths. No unverified third-party sample bank is loaded.
    defaultOutput: (hap, deadline, duration, cps, time) => {
      if (!state.playing || hap.value?._strudelifySession !== playbackRevision) return;
      return window.webaudioOutput(hap, deadline, duration, cps, time);
    },
  })).then(async repl => {
    // defaultPrebake exposes this API. Wait for the registered first gesture's audio/worklets
    // before starting a score, so initialization cannot resume a later paused context.
    await window.initAudioOnFirstClick();
    await silenceEngine();
    return repl;
  }).catch(error => { enginePromise = null; throw error; });
  return enginePromise;
}
// Install Strudel's one-time gesture listener before the first delegated app click.
Promise.resolve().then(ensureEngine).catch(() => {});
function getEvalError(repl) { return repl?.state?.evalError || null; }
async function runCode(code) {
  return playTrack({id:'editor-preview', title:'Editor preview', artist:'Unsaved pattern', code, preview:true, palette:5}, true);
}
function silenceEngine() {
  // hush stops future scheduling; resetGlobalEffects disconnects already sounding voices/tails.
  if (window.hush) window.hush();
  if (window.resetGlobalEffects) window.resetGlobalEffects();
  const context=window.getAudioContext?.();
  // Suspending the actual output also silences in-flight sample/effect work during cancellation.
  return context && context.state!=='closed' ? context.suspend() : Promise.resolve();
}
function cancellable(promise, signal) {
  if (signal.aborted) return Promise.reject(signal.reason || new DOMException('Playback canceled','AbortError'));
  return new Promise((resolve,reject)=>{
    const abort=()=>reject(signal.reason || new DOMException('Playback canceled','AbortError'));
    signal.addEventListener('abort',abort,{once:true});
    Promise.resolve(promise).then(value=>{signal.removeEventListener('abort',abort);resolve(value);},error=>{signal.removeEventListener('abort',abort);reject(error);});
  });
}
async function prepareInstruments(pattern, repl, code) {
  const duration=Number(code.match(/const (?:endSeconds|sourceDuration)\s*=\s*([\d.]+)/)?.[1]);
  const cycles=duration>0 ? Math.min(128,duration*repl.scheduler.cps+1) : 16;
  const urls=new Set();
  for (const hap of pattern.queryArc(0,cycles)) {
    const value=hap.value;
    if (!value.s) continue;
    if (typeof value.s!=='string' || (value.bank!=null && typeof value.bank!=='string')) throw new Error('This pattern has an unresolved instrument name.');
    const name=((value.bank?value.bank+'_':'')+value.s).toLowerCase();
    const sound=window.soundMap.get()[name];
    if (!sound) throw new Error(`Instrument unavailable: ${name}`);
    const samples=sound.data?.samples;
    if (samples) for (const url of (Array.isArray(samples)?samples:Object.values(samples)).flat()) urls.add(url);
  }
  await cancellable(Promise.all([...urls].map(url=>window.loadBuffer(url,window.getAudioContext()))),AbortSignal.timeout(15000));
}
async function playTrack(track, isPreview = false) {
  if (!track) return;
  if (!isPreview && (state.playing || state.loading) && state.current?.id === track.id) { await stopTrack(); return; }
  const revision = ++playbackRevision;
  playbackAbort?.abort();
  const abort = playbackAbort = new AbortController();
  playbackChannel?.postMessage('claim');
  previewing = isPreview;
  playbackError = '';
  state.playing = false;
  state.paused = false;
  state.loading = true;
  playbackDuration = 0;
  const muted=silenceEngine();
  state.current = track;
  loadLyrics(track);
  renderPlayer();
  renderAllLists();
  setStatus('Waking the synth…', false);
  try {
    // Initialize during the gesture, then serialize real REPL evaluations.
    const [repl, code] = await cancellable(Promise.all([ensureEngine(), getCode(track),muted]),abort.signal);
    if (revision !== playbackRevision) return;
    const start = evaluationQueue.then(async () => {
      if (revision !== playbackRevision) return false;
      const pattern = await repl.evaluate(code, false);
      const error = getEvalError(repl);
      if (error) throw error;
      if (revision !== playbackRevision) return false;
      if (!pattern?.queryArc) throw new Error('This code did not produce a playable pattern.');
      await cancellable(prepareInstruments(pattern,repl,code),abort.signal);
      if (revision !== playbackRevision) return false;
      const sessionPattern = pattern.withValue(value => ({...value, _strudelifySession:revision}));
      await repl.setPattern(sessionPattern, false);
      if (revision !== playbackRevision) return false;
      await silenceEngine();
      await window.getAudioContext().resume();
      if (revision !== playbackRevision) return false;
      state.playing = true;
      await repl.start();
      if (revision !== playbackRevision) { await silenceEngine(); return false; }
      playbackStartedAt = window.getAudioContext().currentTime;
      return true;
    });
    evaluationQueue = start.catch(() => {});
    if (!await start || revision !== playbackRevision) return;
    // A finite source-timed score ends rather than leaving a silent "playing" state.
    const duration = Number(code.match(/const (?:endSeconds|sourceDuration)\s*=\s*([\d.]+)/)?.[1]);
    playbackDuration = duration > 0 ? duration : 0;
    if (!isPreview) {
      state.recent = [track.id, ...state.recent.filter(id => id !== track.id)].slice(0, 6);
      saveStorage('strudelify-recent', state.recent);
    }
    setStatus('Playing live pattern', true);
    renderPlayer();
    renderAllLists();
  } catch (error) {
    if (revision !== playbackRevision) return;
    state.playing = false;
    state.paused = false;
    await silenceEngine();
    playbackError = error?.name==='TimeoutError' ? 'Loading the song or instruments timed out. Try again or refresh.' : error?.message || 'Strudel could not play this track.';
    renderPlayer();
    showToast(playbackError);
    if (isPreview) throw error;
  } finally { if (revision === playbackRevision) { state.loading = false; renderPlayer(); } }
}
async function stopTrack() {
  ++playbackRevision;
  playbackAbort?.abort();
  playbackDuration = 0;
  state.playing = false;
  state.paused = false;
  state.loading = false;
  previewing = false;
  playbackError = '';
  try { await silenceEngine(); }
  catch { /* The interface can still return to its stopped state. */ }
  setStatus(state.current ? 'Pattern stopped' : 'Ready when you are', false);
  renderPlayer();
  renderAllLists();
}
async function togglePlayback() {
  if (state.loading) return stopTrack();
  if (!state.current) return playRandom();
  if (!state.playing && !state.paused) return playTrack(state.current);
  const revision = playbackRevision;
  const context = window.getAudioContext();
  if (state.playing) {
    // Keep the scheduler and scheduled voices intact. Its clock reads AudioContext.currentTime,
    // so suspending native audio preserves phase, envelopes and the finite ending position.
    await context.suspend();
    if (revision !== playbackRevision) return;
    state.playing = false;
    state.paused = true;
  } else {
    playbackChannel?.postMessage('claim');
    state.loading = true;
    renderPlayer();
    try { await context.resume(); }
    catch (error) {
      if (revision === playbackRevision) {
        state.loading = false;
        playbackError = error.message || 'Audio could not resume. Press Play to retry.';
        renderPlayer();
      }
      return;
    }
    if (revision !== playbackRevision) {
      // A completed old resume must not hush a newer selection. If Stop is still the
      // latest intent, suspend its output; a newer load/start owns its own cleanup.
      if (!state.playing && !state.loading) await context.suspend();
      return;
    }
    state.loading = false;
    state.playing = true;
    state.paused = false;
  }
  renderPlayer();
  renderAllLists();
}
function renderPlayer() {
  const track = state.current;
  $('#nowTitle').textContent = track?.title || 'Choose a track';
  $('#nowArtist').textContent = track?.artist || 'Your next loop is waiting';
  $('#playerArt').innerHTML = coverImage(track || tracks[0]);
  $('#likeButton').disabled = !track || !!track.preview;
  $('#likeButton').classList.toggle('liked', !!track && state.liked.includes(track.id));
  $('#likeButton').innerHTML = icon('heart');
  $('#codeButton').disabled = !track;
  renderQueue();
  $('#mainPlayButton').disabled = !track;
  setStatus(playbackError ? 'Could not play · press Play to retry' : state.loading ? 'Loading · press Play to cancel' : state.paused ? 'Paused · resume where you left off' : state.playing ? (previewing ? 'Previewing editor code' : 'Playing live pattern') : track ? 'Pattern stopped' : 'Ready when you are', state.playing);
  if (state.loading) {
    $('#mainPlayButton').innerHTML = icon('stop');
    $('#mainPlayButton').setAttribute('aria-label', 'Cancel loading');
  }
}
function renderPlaylistNav() {
  const items = [{ name: 'All patterns', filter: '', palette: 1 }, ...groups.map(g => ({...g, filter:g.name})), {name:'Liked tracks', liked:true, palette:3}];
  $('#playlistList').innerHTML = items.map(item => `<button class="playlist-link" data-group="${escapeHtml(item.filter || '')}" data-liked-nav="${!!item.liked}" title="${escapeHtml(item.name)}"><span class="playlist-art" style="background:#45337d">${item.liked ? icon('heart') : coverImage(item)}</span><span class="playlist-copy"><strong>${escapeHtml(item.name)}</strong><small>${item.liked ? 'Collection · Saved by you' : 'Collection · Strudelify'}</small></span></button>`).join('');
}
function rowMarkup(track, index) {
  const active = state.current?.id === track.id;
  const liked = state.liked.includes(track.id);
  return `<div class="track-row${active && state.playing ? ' playing' : ''}" data-track-id="${escapeHtml(track.id)}">
    <span class="row-number">${String(index + 1).padStart(2, '0')}</span>
    <button class="row-play" data-action="play" aria-label="${active && state.playing ? 'Stop' : 'Play'} ${escapeHtml(track.title)}">${icon(active && state.playing ? 'pause' : 'play')}</button>
    <div class="row-track" data-action="open" role="button" tabindex="0" aria-label="View ${escapeHtml(track.title)}">
      ${artMarkup(track)}<span class="row-title"><strong>${escapeHtml(track.title)}</strong><span>${escapeHtml(track.artist)}</span></span>
    </div>
    <span class="row-mood">${escapeHtml(track.mood || (track.created ? 'Your pattern' : 'Live-coded'))}</span>
    <span class="row-loop">${escapeHtml(track.loop || '∞ loop')}</span>
    <button class="row-like${liked ? ' liked' : ''}" data-action="like" aria-label="${liked ? 'Unlike' : 'Like'} ${escapeHtml(track.title)}">${icon('heart')}</button>
  </div>`;
}
function cardMarkup(track) {
  const liked = state.liked.includes(track.id);
  return `<article class="track-card" data-track-id="${escapeHtml(track.id)}">
    <button class="card-like${liked ? ' liked' : ''}" data-action="like" aria-label="${liked ? 'Unlike' : 'Like'} ${escapeHtml(track.title)}">${icon('heart')}</button>
    <div data-action="open" role="button" tabindex="0" aria-label="View ${escapeHtml(track.title)}">${artMarkup(track, 'track-card-art')}</div>
    <button class="card-play" data-action="play" aria-label="Play ${escapeHtml(track.title)}">${icon('play')}</button>
    <div class="track-card-copy" data-action="open" role="button" tabindex="0" aria-label="View ${escapeHtml(track.title)}"><strong>${escapeHtml(track.title)}</strong><span>${escapeHtml(track.cover ? track.artist : track.mood || track.artist)}</span></div>
  </article>`;
}
let homeFilter = 'all';
function renderHome() {
  const recent = state.recent.map(getTrack).filter(Boolean);
  const list = homeFilter === 'created' ? state.custom : homeFilter === 'recent' ? recent : [...new Map([...recent, ...allTracks()].map(t => [t.id,t])).values()];
  $('#quickPicksTitle').textContent = homeFilter === 'created' ? 'Made by you' : homeFilter === 'recent' || recent.length ? 'Jump back in' : 'Start listening';
  $('#quickPickGrid').innerHTML = list.slice(0,8).map(cardMarkup).join('');
  $('#emptyHome').classList.toggle('hidden', list.length > 0);
  $('#gettingStarted').classList.toggle('hidden', homeFilter !== 'all');
  $('#homeTop').classList.toggle('single-shelf', homeFilter !== 'all');
  $('#featureGrid').innerHTML = groups.map(group => `<button class="feature-card" data-group="${escapeHtml(group.name)}" aria-label="Browse ${escapeHtml(group.name)} collection"><span class="feature-art">${coverImage(group)}</span><span class="feature-info"><strong>${escapeHtml(group.name)}</strong><span>${escapeHtml(group.note)}</span></span><span class="feature-play" aria-hidden="true">${icon('play')}</span></button>`).join('');
  $('#homeTrackList').innerHTML = allTracks().map(rowMarkup).join('');
}
function renderQueue() {
  $('#queueList').innerHTML = allTracks().map(track => `<button class="queue-track" data-action="play" data-track-id="${escapeHtml(track.id)}" aria-label="Play ${escapeHtml(track.title)}">${artMarkup(track)}<span style="${state.current?.id === track.id ? 'color:var(--accent)' : ''}">${escapeHtml(track.title)}<small>${escapeHtml(track.artist)}</small></span></button>`).join('');
}
async function loadLyrics(track) {
  if (!$('#lyricsLines')) return; // A cached older page can still load the new transport safely.
  const revision = ++lyricsRevision;
  lyricsCues = [];
  highlightedLyric = -1;
  $('#lyricsTitle').textContent = track.title;
  $('#lyricsArtist').textContent = track.artist;
  $('#lyricsLines').replaceChildren();
  $('#retryLyrics').classList.add('hidden');
  $('#lyricsNotice').textContent = track.cover ? 'Instrumental study. No licensed lyrics are attached.' : 'Original instrumental pattern. No lyrics are attached.';
  if (!track.lyricsUrl || track.lyricsRights !== 'cleared') return;
  try {
    if (!lyricsCache.has(track.id)) lyricsCache.set(track.id,
      fetch(track.lyricsUrl, {cache:'no-cache'}).then(async response => {
        if (!response.ok) throw new Error('Lyrics could not be loaded.');
        const data = await response.json();
        if (data.id !== track.id || !Array.isArray(data.cues) || data.cues.some(cue =>
          typeof cue.text !== 'string' || !Number.isFinite(cue.start) || !Number.isFinite(cue.end) || cue.start < 0 || cue.end < cue.start))
          throw new Error('Lyrics data is invalid.');
        return data;
      }).catch(error => {lyricsCache.delete(track.id);throw error;}));
    const data = await lyricsCache.get(track.id);
    if (revision !== lyricsRevision) return;
    lyricsCues = data.cues;
    $('#lyricsNotice').textContent = data.notice || 'Lyrics draft · timing and words may contain errors.';
    if (!lyricsCues.length) $('#lyricsNotice').textContent = 'No reliable lyric transcript is available for this recording yet.';
    $('#lyricsLines').replaceChildren(...lyricsCues.map(cue => {
      const line = document.createElement('p');
      line.textContent = cue.text;
      return line;
    }));
  } catch (error) {
    if (revision !== lyricsRevision) return;
    $('#lyricsNotice').textContent = error.message;
    $('#retryLyrics').classList.remove('hidden');
  }
}
function updateLyricsPosition() {
  const seconds = (state.playing || state.paused) && window.getAudioContext ? Math.max(0,window.getAudioContext().currentTime-playbackStartedAt) : -1;
  if (playbackDuration > 0 && seconds >= playbackDuration + 1) { stopTrack(); return; }
  const index = lyricsCues.findIndex(cue => seconds >= cue.start && seconds < cue.end);
  if (index === highlightedLyric) return;
  highlightedLyric = index;
  [...$('#lyricsLines').children].forEach((line,i) => {
    line.classList.toggle('current-lyric', i === index);
    if (i === index) line.setAttribute('aria-current','true'); else line.removeAttribute('aria-current');
  });
  const line = $('#lyricsLines').children[index];
  if (line && $('#appShell').classList.contains('lyrics-open')) {
    const scroller=$('#lyricsLines');
    scroller.scrollTo({top:Math.max(0,line.offsetTop-scroller.clientHeight*.32),behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});
  }
}
setInterval(updateLyricsPosition,200);
function searchResults(query = '', group = '') {
  const normalized = query.trim().toLowerCase();
  return allTracks().filter(track => {
    const matchesText = !normalized || [track.title, track.artist, track.mood, track.group].some(value => String(value || '').toLowerCase().includes(normalized));
    const matchesGroup = !group || track.group === group;
    return matchesText && matchesGroup;
  });
}
function renderSearch() {
  const query = $('#searchPageInput').value;
  const result = searchResults(query, state.groupFilter);
  $('#searchTrackList').innerHTML = result.map(cardMarkup).join('');
  $('#emptySearch').classList.toggle('hidden', result.length > 0);
  $('#resultCount').textContent = `${result.length} ${result.length === 1 ? 'pattern' : 'patterns'}`;
  $('#resultTitle').textContent = state.groupFilter || (query ? `Results for “${query}”` : 'All tracks');
}
function renderLibrary() {
  let result = allTracks();
  if (state.libraryFilter === 'liked') result = result.filter(track => state.liked.includes(track.id));
  if (state.libraryFilter === 'created') result = result.filter(track => track.created);
  $('#libraryTrackList').innerHTML = result.map(cardMarkup).join('');
  $('#emptyLibrary').classList.toggle('hidden', result.length > 0);
}
function renderAllLists() {
  renderHome();
  if (!$('#searchView').classList.contains('hidden')) renderSearch();
  if (!$('#libraryView').classList.contains('hidden')) renderLibrary();
  const openTrack = $('[data-track-id].playing');
  if (openTrack && state.current) openTrack.classList.toggle('playing', state.playing);
}
function setView(name, push = true) {
  const views = ['home', 'search', 'library', 'track'];
  if (!views.includes(name)) name = 'home';
  for (const view of views) $(`#${view}View`).classList.toggle('hidden', view !== name);
  $$('.nav-link').forEach(button => button.classList.toggle('active', button.dataset.view === (name === 'track' ? 'library' : name)));
  if (push && location.hash !== `#${name}`) history.pushState({ view: name }, '', `#${name}`);
  $('#homeFilters').classList.toggle('hidden', name !== 'home');
  hideSuggestions();
  if (name === 'search') { renderSearch(); $('#searchInput').focus({preventScroll:true}); }
  if (name === 'library') renderLibrary();
  $('#mainArea').scrollTo({ top: 0, behavior: 'smooth' });
}
async function openTrack(id, push = true) {
  const track = getTrack(id);
  if (!track) {
    setView('home', false);
    showToast('This track is not in the current release. Explore the available original patterns.');
    return;
  }
  const revision = ++detailRevision;
  setView('track', false);
  const href=`#track/${encodeURIComponent(id)}`;
  if (push && location.hash !== href) history.pushState({view:'track',trackId:id},'',href);
  else history.replaceState({view:'track',trackId:id},'',href);
  $('#trackDetail').innerHTML = `<div class="detail-hero">${artMarkup(track,'detail-art')}<div class="detail-copy"><div class="eyebrow">Live-coded pattern</div><h1>${escapeHtml(track.title)}</h1><p><strong>${escapeHtml(track.artist)}</strong> · ${escapeHtml(track.mood || 'Your pattern')} · ${escapeHtml(track.loop || 'Infinite loop')}</p></div></div>
  <div class="detail-actions"><button class="detail-play" data-action="play" data-track-id="${escapeHtml(track.id)}" aria-label="Play ${escapeHtml(track.title)}">${icon('play')}</button><button class="icon-button${state.liked.includes(track.id) ? ' liked' : ''}" data-action="like" data-track-id="${escapeHtml(track.id)}" aria-label="Like ${escapeHtml(track.title)}">${icon('heart')}</button><button class="button button-quiet" data-show-code>View code</button><div style="position:relative"><button class="icon-button" data-track-menu aria-label="More options" aria-expanded="false">${icon('more')}</button><div class="detail-menu hidden" role="menu"><button role="menuitem" data-action="copy" data-track-id="${escapeHtml(track.id)}">Copy Strudel code</button></div></div></div>
  <details class="code-details" id="patternCode"><summary>Inside the pattern</summary><div class="code-panel"><div class="code-panel-heading"><span>${escapeHtml(track.id)}.strudel</span><span>LIVE PATTERN</span></div><pre id="detailCode">Loading pattern…</pre></div></details>
  <section class="section-block"><div class="section-heading"><h2>More to discover</h2></div><div class="shelf-grid">${allTracks().filter(t=>t.id!==track.id).map(cardMarkup).join('')}</div></section>`;
  {
    const note = document.createElement('p');
    note.className = 'empty-state';
    note.textContent = track.cover
      ? 'Instrumental study · human recognition review pending. Not an approved faithful cover.'
      : 'Original instrumental pattern · listener review pending. Generated live from its Strudel code.';
    $('.detail-hero').after(note);
  }
  const reportLink = document.createElement('a');
  reportLink.className = 'button button-quiet';
  reportLink.textContent = 'Report a problem';
  reportLink.dataset.feedback = track.id;
  reportLink.href = feedbackUrl(track);
  reportLink.target = '_blank';
  reportLink.rel = 'noreferrer';
  reportLink.title = 'Opens a public GitHub report; sign-in required to submit';
  $('.detail-actions').append(reportLink);
  try { const code=await getCode(track); if (revision===detailRevision) $('#detailCode').textContent=code; }
  catch (error) { if (revision===detailRevision) $('#detailCode').textContent=error.message; }
}
function likeTrack(track) {
  if (!track) return;
  state.liked = state.liked.includes(track.id) ? state.liked.filter(id => id !== track.id) : [...state.liked, track.id];
  saveStorage('strudelify-liked', state.liked);
  renderPlayer(); renderAllLists();
  showToast(state.liked.includes(track.id) ? 'Added to liked tracks' : 'Removed from liked tracks');
}
async function copyTrackCode(track) {
  try {
    const code = await getCode(track);
    await navigator.clipboard.writeText(code);
    showToast('Strudel code copied');
  } catch {
    showToast('Could not copy code here. Try the app over localhost or HTTPS.');
  }
}
function playRandom(group = '') {
  const candidates = searchResults('', group);
  if (!candidates.length) { showToast('There are no tracks in this collection yet.'); return; }
  const other = candidates.filter(track => track.id !== state.current?.id);
  const choice = (other.length ? other : candidates)[Math.floor(Math.random() * (other.length || candidates.length))];
  playTrack(choice);
}
function openEditor(track = null) {
  $('#editorTitle').value = track?.title || '';
  $('#editorArtist').value = track?.artist || '';
  $('#editorCode').value = track?.code || 'setcps(0.5)\n\n$: note("c3 e3 g3 b3").s("triangle").slow(2).gain(.24).room(.4)';
  $('#editorError').classList.add('hidden');
  $('#editorDialog').showModal();
  $('#editorTitle').focus();
}

function handleAction(event) {
  const actionTarget = event.target.closest('[data-action]');
  if (!actionTarget) return;
  const id = actionTarget.dataset.trackId || actionTarget.closest('[data-track-id]')?.dataset.trackId;
  const track = getTrack(id);
  if (actionTarget.dataset.action === 'play') { event.stopPropagation(); playTrack(track); }
  else if (actionTarget.dataset.action === 'like') {
    event.stopPropagation(); likeTrack(track);
    if (track) {
      const liked = state.liked.includes(track.id);
      actionTarget.classList.toggle('liked', liked);
      actionTarget.setAttribute('aria-label', `${liked ? 'Unlike' : 'Like'} ${track.title}`);
    }
  }
  else if (actionTarget.dataset.action === 'open' && track) openTrack(track.id);
  else if (actionTarget.dataset.action === 'copy' && track) copyTrackCode(track);
}

document.addEventListener('click', event => {
  const viewButton = event.target.closest('[data-view]');
  if (viewButton) { setView(viewButton.dataset.view); return; }
  const likedNavigation = event.target.closest('[data-liked-nav="true"]');
  if (likedNavigation) { state.libraryFilter = 'liked'; $$('[data-library-filter]').forEach(item => { const active = item.dataset.libraryFilter === 'liked'; item.classList.toggle('selected', active); item.setAttribute('aria-selected', String(active)); }); setView('library'); return; }
  const groupButton = event.target.closest('[data-group]');
  if (groupButton) {
    state.groupFilter = groupButton.dataset.group || '';
    $('#searchInput').value = '';
    $('#searchPageInput').value = '';
    setView('search');
    return;
  }
  handleAction(event);
});
document.addEventListener('keydown', event => {
  if (['Enter', ' '].includes(event.key) && event.target.matches('[data-action="open"]')) {
    event.preventDefault();
    const id = event.target.closest('[data-track-id]')?.dataset.trackId;
    if (id) openTrack(id);
    return;
  }
  if (event.key === '/' && !/input|textarea/i.test(document.activeElement.tagName) && !$('#editorDialog').open) {
    event.preventDefault(); setView('search'); $('#searchInput').focus();
  }
  if (event.code === 'Space' && !/input|textarea|button/i.test(document.activeElement.tagName) && !$('#editorDialog').open) {
    event.preventDefault(); togglePlayback();
  }
});

$('#searchInput').addEventListener('input', event => {
  $('#searchPageInput').value = event.target.value;
  state.groupFilter = '';
  setView('search');
  renderSearch();
  showSuggestions();
});
$('#searchPageInput').addEventListener('input', () => { $('#searchInput').value = $('#searchPageInput').value; state.groupFilter = ''; renderSearch(); });
$('#newTrackButton').addEventListener('click', () => openEditor());
$('#libraryCreateButton').addEventListener('click', () => openEditor());
$('#heroPlayButton').addEventListener('click', () => playRandom());
$('#starterPlayButton').addEventListener('click', () => playRandom());
$('#mainPlayButton').addEventListener('click', togglePlayback);
$('#stopButton').addEventListener('click', stopTrack);
$('#previousButton').addEventListener('click', () => {
  const list = allTracks(); const index = list.findIndex(track => track.id === state.current?.id);
  playTrack(index < 0 ? list[0] : list[(index - 1 + list.length) % list.length]);
});
$('#nextButton').addEventListener('click', () => {
  const list = allTracks(); const index = list.findIndex(track => track.id === state.current?.id);
  playTrack(list[(index + 1 + list.length) % list.length]);
});
$('#shuffleButton').addEventListener('click', () => { $('#shuffleButton').classList.toggle('active'); playRandom(); });
$('#likeButton').addEventListener('click', () => likeTrack(state.current));
$('#codeButton').addEventListener('click', async () => { if(state.current) { await openTrack(state.current.id); $('#patternCode').open=true; } });
$('#trackBackButton').addEventListener('click', () => setView('search'));
$('#backButton').addEventListener('click', () => history.back());
$('#forwardButton').addEventListener('click', () => history.forward());
$('#profileButton').addEventListener('click', () => showToast('Your tracks and likes are saved only in this browser.'));
$('#volumeButton').addEventListener('click', () => showToast('Adjust the volume with your device controls.'));
$$('[data-library-filter]').forEach(button => button.addEventListener('click', () => {
  state.libraryFilter = button.dataset.libraryFilter;
  $$('[data-library-filter]').forEach(item => { item.classList.toggle('selected', item === button); item.setAttribute('aria-selected', String(item === button)); });
  renderLibrary();
}));

$('#editorPreviewButton').addEventListener('click', async () => {
  const button = $('#editorPreviewButton');
  button.disabled = true; $('#editorError').classList.add('hidden');
  try { await runCode($('#editorCode').value); if (previewing && state.playing && $('#editorDialog').open) showToast('Previewing your pattern'); }
  catch (error) { $('#editorError').textContent = error?.message || 'This pattern could not be played.'; $('#editorError').classList.remove('hidden'); }
  finally { button.disabled = false; }
});
$('#editorForm').addEventListener('submit', event => {
  event.preventDefault();
  const title = $('#editorTitle').value.trim();
  const artist = $('#editorArtist').value.trim() || 'You';
  const code = $('#editorCode').value.trim();
  if (!title || !code) return;
  const track = { id: `custom-${Date.now()}`, title, artist, mood: 'Your pattern', loop: '∞ loop', code, created: true, palette: 5 };
  state.custom = [track, ...state.custom];
  if (saveStorage('strudelify-custom', state.custom)) {
    if (previewing) stopTrack();
    $('#editorDialog').close('save'); renderPlaylistNav(); renderAllLists();
    showToast('Saved to your local library');
    openTrack(track.id);
  }
});
$('#editorDialog').addEventListener('close', () => {
  if (previewing) stopTrack();
});
$('#editorDialog').addEventListener('cancel', () => { if (previewing) stopTrack(); });
window.addEventListener('pagehide', () => stopTrack());
function routeFromLocation() {
  if (location.hash.startsWith('#track/')) {
    try { openTrack(decodeURIComponent(location.hash.slice(7)), false); }
    catch { setView('home', false); }
  }
  else if (location.hash === '#track' && history.state?.trackId) openTrack(history.state.trackId, false);
  else setView(location.hash.slice(1) || 'home', false);
}
window.addEventListener('popstate', routeFromLocation);

document.querySelector('a[href="#mainArea"]').addEventListener('click', event => { event.preventDefault(); $('#mainArea').focus(); });
document.addEventListener('keydown', event => { if(event.key==='Escape'){hideSuggestions();$$('.detail-menu').forEach(menu=>menu.classList.add('hidden'));$$('[data-track-menu]').forEach(button=>button.setAttribute('aria-expanded','false'));} });
document.querySelector('[data-close-editor]').addEventListener('click', () => { if (previewing) stopTrack(); $('#editorDialog').close('cancel'); });
$('#createHeaderButton').addEventListener('click', () => openEditor());
$('#librarySearchButton').addEventListener('click', () => { setView('search'); $('#searchInput').focus(); });
$('#clearSearchButton').addEventListener('click', () => { $('#searchInput').value=''; $('#searchPageInput').value=''; renderSearch(); hideSuggestions(); $('#clearSearchButton').classList.add('hidden'); $('#searchInput').focus(); });
$$('[data-home-filter]').forEach(button => button.addEventListener('click', () => { homeFilter=button.dataset.homeFilter; $$('[data-home-filter]').forEach(b=>{b.classList.toggle('selected',b===button); b.setAttribute('aria-pressed',String(b===button));}); renderHome(); }));
function setRightPanel(panel) {
  $('#appShell').classList.toggle('queue-open',panel==='queue');
  $('#appShell').classList.toggle('lyrics-open',panel==='lyrics');
  $$('[data-toggle-queue]').forEach(button=>button.setAttribute('aria-expanded',String(panel==='queue')));
  $$('[data-toggle-lyrics]').forEach(button=>button.setAttribute('aria-expanded',String(panel==='lyrics')));
}
$$('[data-toggle-queue]').forEach(button=>button.addEventListener('click',()=>setRightPanel($('#appShell').classList.contains('queue-open')?'':'queue')));
$$('[data-toggle-lyrics]').forEach(button=>button.addEventListener('click',()=>setRightPanel($('#appShell').classList.contains('lyrics-open')?'':'lyrics')));
$('#retryLyrics')?.addEventListener('click',()=>{if(state.current)loadLyrics(state.current);});
$('#collapseSidebarButton').addEventListener('click',()=>{ const collapsed=$('#appShell').classList.toggle('library-collapsed'); $('#appShell').style.removeProperty('--library-width'); const label=collapsed?'Expand your library':'Collapse your library'; $('#collapseSidebarButton').setAttribute('aria-expanded',String(!collapsed)); $('#collapseSidebarButton').setAttribute('aria-label',label); $('#collapseSidebarButton').title=label; });
let libraryWidth = 280;
const resizer=$('#libraryResizer');
function resizeLibrary(width) { libraryWidth=Math.max(220,Math.min(420,width)); $('#appShell').classList.remove('library-collapsed'); $('#appShell').style.setProperty('--library-width',libraryWidth+'px'); resizer.setAttribute('aria-valuenow',String(libraryWidth)); $('#collapseSidebarButton').setAttribute('aria-expanded','true'); $('#collapseSidebarButton').setAttribute('aria-label','Collapse your library'); $('#collapseSidebarButton').title='Collapse your library'; }
resizer.addEventListener('pointerdown',e=>{ if(e.button!==0)return; resizer.setPointerCapture(e.pointerId); resizer.dataset.dragging='true'; });
resizer.addEventListener('pointermove',e=>{if(resizer.dataset.dragging==='true')resizeLibrary(e.clientX-8);});
resizer.addEventListener('pointerup',()=>delete resizer.dataset.dragging);
resizer.addEventListener('lostpointercapture',()=>delete resizer.dataset.dragging);
resizer.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();resizeLibrary(libraryWidth+(e.key==='ArrowLeft'?-10:10));}});
function hideSuggestions(){ $('#searchSuggestions').classList.add('hidden'); $('#searchInput').setAttribute('aria-expanded','false'); }
function showSuggestions(){
  const query=$('#searchInput').value.trim();
  $('#clearSearchButton').classList.toggle('hidden',!query);
  if(!query){hideSuggestions();return;}
  const result=searchResults(query).slice(0,5);
  $('#searchSuggestions').innerHTML='<div class="suggestion-heading">Patterns</div>'+result.map(track=>`<button class="suggestion" data-action="open" data-track-id="${escapeHtml(track.id)}">${artMarkup(track)}<span><strong>${escapeHtml(track.title)}</strong><small>${escapeHtml(track.artist)}</small></span></button>`).join('')+`<button class="suggestion-all" data-view="search">Show all results for “${escapeHtml(query)}”</button>`;
  $('#searchSuggestions').classList.remove('hidden'); $('#searchInput').setAttribute('aria-expanded','true');
}
$('#searchInput').addEventListener('focus',showSuggestions);
$('#searchInput').addEventListener('keydown',e=>{if(e.key==='Escape')hideSuggestions();if(e.key==='Enter'){hideSuggestions();$('#mainArea').focus();}if(e.key==='ArrowDown'){e.preventDefault();$('#searchSuggestions button')?.focus();}});
$('#searchSuggestions').addEventListener('keydown',e=>{const buttons=$$('button',$('#searchSuggestions')),i=buttons.indexOf(document.activeElement);if(e.key==='Escape'){hideSuggestions();$('#searchInput').focus();hideSuggestions();}else if(['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();buttons[(i+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length]?.focus();}});
document.addEventListener('click',e=>{
  if(!e.target.closest('.search-wrap'))hideSuggestions();
  if(e.target.closest('[data-show-code]')){ $('#patternCode').open=!$('#patternCode').open; }
  const trigger=e.target.closest('[data-track-menu]');
  if(trigger){const menu=trigger.nextElementSibling;menu.classList.toggle('hidden');trigger.setAttribute('aria-expanded',String(!menu.classList.contains('hidden')));}
  else $$('.detail-menu').forEach(menu=>menu.classList.add('hidden'));
});
renderPlaylistNav();
renderHome();
renderPlayer();
setRightPanel($('#lyricsLines') && matchMedia('(min-width:1101px)').matches ? 'lyrics' : '');
if (!location.hash) history.replaceState({ view: 'home' }, '', '#home');

async function loadCoverCatalog() {
  const catalogUrl = new URL('tracks/catalog.json', document.baseURI);
  const response = await fetch(catalogUrl, {cache: 'no-cache'});
  if (!response.ok) throw new Error(`Music catalog unavailable (${response.status}).`);
  const catalog = await response.json();
  const statuses = ['draft', 'runtime-verified', 'listening-reviewed', 'approved'];
  if (!Array.isArray(catalog) || !catalog.length) throw new Error('Music catalog is empty.');
  const ids = new Set();
  const covers = catalog.map((entry, index) => {
    if (!entry.id || ids.has(entry.id) || !entry.title || !entry.artist || !entry.genre ||
        !Number.isFinite(entry.bpm) || entry.bpm <= 0 || !statuses.includes(entry.status))
      throw new Error('Music catalog contains an invalid entry.');
    ids.add(entry.id);
    const codeUrl = new URL(entry.codeUrl, catalogUrl);
    if (!entry.codeUrl || codeUrl.origin !== catalogUrl.origin ||
        !codeUrl.pathname.startsWith(new URL('./', catalogUrl).pathname) ||
        !codeUrl.pathname.endsWith('.strudel')) throw new Error('Invalid track code path.');
    if (!['project-original', 'cleared'].includes(entry.rights?.status) ||
        !entry.rights.evidence || !entry.rights.license ||
        (entry.kind !== 'original' && (entry.status !== 'approved' || !entry.humanReview)))
      throw new Error('A track has not passed the public release gate.');
    if (entry.lyricsUrl) throw new Error('Lyrics are not enabled in this release.');
    return {...entry, codeUrl: codeUrl.href, cover: entry.kind !== 'original', mood: entry.genre,
      loop: `${entry.bpm} BPM`, group: entry.group || 'Original patterns', palette: entry.palette || index % palettes.length + 1};
  });
  // Preserve older saved copies under distinct IDs so they cannot shadow a deployed cover.
  const canonical = new Set(covers.map(track=>track.id));
  const used = new Set([...canonical,...tracks.map(track=>track.id),...state.custom.map(track=>track.id)]);
  let migrated = false;
  state.custom = state.custom.map((track,index)=>{
    if (!canonical.has(track.id)) return track;
    let suffix=index,id=`saved-${track.id}-${suffix}`;
    while (used.has(id)) id=`saved-${track.id}-${++suffix}`;
    used.add(id);
    codeCache.delete(track.id);
    const saved={...track,id,title:`${track.title} (saved version)`};
    if (state.liked.includes(track.id) && !state.liked.includes(id)) state.liked.push(id);
    if (state.current===track) state.current=saved;
    migrated=true;
    return saved;
  });
  if (migrated) {
    saveStorage('strudelify-custom',state.custom);
    saveStorage('strudelify-liked',state.liked);
  }
  tracks.splice(0, tracks.length, ...covers);
  $('#catalogStatus')?.classList.add('hidden');
  if ($('#catalogIntro')) $('#catalogIntro').textContent = `${covers.length} original instrumental patterns. Drafts for listening and feedback; commercial-song studies remain in private review.`;
  renderAllLists();
  renderPlayer();
  showSuggestions();
}
loadCoverCatalog().catch(error => {
  const status=$('#catalogStatus');
  if (status) {status.textContent = `${error.message} Reload to try again. Original patterns are still available.`;status.setAttribute('role', 'alert');}
  else showToast(error.message);
}).finally(routeFromLocation);

function feedbackUrl(track = state.current) {
  const seconds = window.getAudioContext && (state.playing || state.paused)
    ? Math.max(0, window.getAudioContext().currentTime - playbackStartedAt).toFixed(1) : 'not playing';
  const body = `Track: ${track?.title || 'General feedback'} (${track?.id || 'none'})\n` +
    `Playback position: ${seconds}\nBuild: ${window.releaseVersion || 'review candidate'}\n` +
    `Browser: ${navigator.userAgent}\nViewport: ${innerWidth} x ${innerHeight}\n\n` +
    'What happened?\n\nWhat did you expect?\n\nSteps to reproduce:\n1. \n\n' +
    'Music feedback (optional): describe timing, melody, sound, or the passage that needs work.\n\n' +
    'This report is public. Remove anything personal before submitting. No report is sent automatically.';
  return 'https://github.com/Hustlenix/strudelify/issues/new?' + new URLSearchParams({
    title: `[Listener feedback] ${track?.title || 'Player'}`, body,
  });
}
document.addEventListener('click', event => {
  const link = event.target.closest('[data-feedback]');
  if (link) link.href = feedbackUrl(getTrack(link.dataset.feedback) || state.current);
});
fetch('release.json', {cache:'no-cache'}).then(response => response.ok ? response.json() : null)
  .then(data => { if (data) window.releaseVersion = data.commit + (data.dirty ? ' (working copy)' : ''); }).catch(() => {});
