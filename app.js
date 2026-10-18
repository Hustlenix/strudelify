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
  { name: 'Requested covers', symbol: '♫', note: 'Eight instrumental Strudel arrangements, in review.', palette: 1 },
  { name: 'Slow burn', symbol: '◌', note: 'Take the long way home.', palette: 3 },
  { name: 'Night motion', symbol: '↗', note: 'A little light after dark.', palette: 2 },
  { name: 'Soft focus', symbol: '✳', note: 'Let the edges blur.', palette: 4 },
];

const state = {
  current: null,
  playing: false,
  loading: false,
  liked: readStorage('strudelify-liked', []),
  custom: readStorage('strudelify-custom', []),
  recent: readStorage('strudelify-recent', []),
  libraryFilter: 'all',
  groupFilter: '',
  toastTimer: 0,
};
let enginePromise;
let playbackEndTimer;
const codeCache = new Map();
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
function allTracks() { return [...state.custom, ...tracks]; }
function getTrack(id) { return allTracks().find(track => track.id === id); }
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
  $('#mainPlayButton').setAttribute('aria-label', playing ? 'Stop current pattern' : 'Play current pattern');
  $('#mainPlayButton').title = playing ? 'Stop current pattern' : 'Play current pattern';
}
function getCode(track) {
  if (track.code) return Promise.resolve(track.code);
  if (codeCache.has(track.id)) return codeCache.get(track.id);
  const request = fetch(track.codeUrl, {cache: 'no-cache'}).then(response => {
    if (!response.ok) throw new Error(`Could not load ${track.codeUrl} (${response.status}).`);
    return response.text();
  }).catch(error => { codeCache.delete(track.id); throw error; });
  codeCache.set(track.id, request);
  return request;
}
function ensureEngine() {
  if (typeof window.initStrudel !== 'function') throw new Error('The Strudel runtime did not load. Check your connection and refresh.');
  if (!enginePromise) enginePromise = Promise.resolve(window.initStrudel({
    prebake: () => window.samples('https://raw.githubusercontent.com/felixroos/dough-samples/main/tidal-drum-machines.json'),
  })).catch(error => { enginePromise = null; throw error; });
  return enginePromise;
}
function getEvalError(repl) { return repl?.state?.evalError || null; }
async function runCode(code) {
  clearTimeout(playbackEndTimer);
  const repl = await ensureEngine();
  if (typeof window.evaluate !== 'function') throw new Error('Strudel could not start. Refresh the page and try again.');
  await window.hush();
  await window.evaluate(code, true);
  const error = getEvalError(repl);
  if (error) throw error;
}
async function playTrack(track) {
  if (!track || state.loading) return;
  if (state.playing && state.current?.id === track.id) { await stopTrack(); return; }
  state.loading = true;
  clearTimeout(playbackEndTimer);
  state.current = track;
  renderPlayer();
  setStatus('Waking the synth…', false);
  try {
    // Initialize on the click gesture so the browser can unlock Web Audio.
    const repl = await ensureEngine();
    const code = await getCode(track);
    await window.hush();
    await window.evaluate(code, true);
    const error = getEvalError(repl);
    if (error) throw error;
    state.playing = true;
    // A finite source-timed score ends rather than leaving a silent "playing" state.
    const duration = Number(code.match(/const endSeconds\s*=\s*([\d.]+)/)?.[1]);
    if (duration > 0) playbackEndTimer = setTimeout(() => stopTrack(), (duration + 1) * 1000);
    state.recent = [track.id, ...state.recent.filter(id => id !== track.id)].slice(0, 6);
    saveStorage('strudelify-recent', state.recent);
    setStatus('Playing live pattern', true);
    renderPlayer();
    renderAllLists();
  } catch (error) {
    state.playing = false;
    setStatus('Could not play this pattern', false);
    renderPlayer();
    showToast(error?.message || 'Strudel could not play this track.');
  } finally { state.loading = false; renderPlayer(); }
}
async function stopTrack() {
  clearTimeout(playbackEndTimer);
  try { if (window.hush) await window.hush(); }
  catch { /* The interface can still return to its stopped state. */ }
  state.playing = false;
  setStatus(state.current ? 'Pattern stopped' : 'Ready when you are', false);
  renderPlayer();
  renderAllLists();
}
function renderPlayer() {
  const track = state.current;
  $('#nowTitle').textContent = track?.title || 'Choose a track';
  $('#nowArtist').textContent = track?.artist || 'Your next loop is waiting';
  $('#playerArt').innerHTML = coverImage(track || tracks[0]);
  $('#likeButton').disabled = !track;
  $('#likeButton').classList.toggle('liked', !!track && state.liked.includes(track.id));
  $('#likeButton').innerHTML = icon('heart');
  $('#codeButton').disabled = !track;
  renderQueue();
  $('#mainPlayButton').disabled = !track || state.loading;
  setStatus(state.loading ? 'Waking the synth…' : state.playing ? 'Playing live pattern' : track ? 'Pattern stopped' : 'Ready when you are', state.playing);
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
async function openTrack(id) {
  const track = getTrack(id);
  if (!track) return;
  setView('track', false);
  history.replaceState({view:'track', trackId:id}, '', `#track/${encodeURIComponent(id)}`);
  $('#trackDetail').innerHTML = `<div class="detail-hero">${artMarkup(track,'detail-art')}<div class="detail-copy"><div class="eyebrow">Live-coded pattern</div><h1>${escapeHtml(track.title)}</h1><p><strong>${escapeHtml(track.artist)}</strong> · ${escapeHtml(track.mood || 'Your pattern')} · ${escapeHtml(track.loop || 'Infinite loop')}</p></div></div>
  <div class="detail-actions"><button class="detail-play" data-action="play" data-track-id="${escapeHtml(track.id)}" aria-label="Play ${escapeHtml(track.title)}">${icon('play')}</button><button class="icon-button${state.liked.includes(track.id) ? ' liked' : ''}" data-action="like" data-track-id="${escapeHtml(track.id)}" aria-label="Like ${escapeHtml(track.title)}">${icon('heart')}</button><button class="button button-quiet" data-show-code>View code</button><div style="position:relative"><button class="icon-button" data-track-menu aria-label="More options" aria-expanded="false">${icon('more')}</button><div class="detail-menu hidden" role="menu"><button role="menuitem" data-action="copy" data-track-id="${escapeHtml(track.id)}">Copy Strudel code</button></div></div></div>
  <details class="code-details" id="patternCode"><summary>Inside the pattern</summary><div class="code-panel"><div class="code-panel-heading"><span>${escapeHtml(track.id)}.strudel</span><span>LIVE PATTERN</span></div><pre id="detailCode">Loading pattern…</pre></div></details>
  <section class="section-block"><div class="section-heading"><h2>More to discover</h2></div><div class="shelf-grid">${allTracks().filter(t=>t.id!==track.id).map(cardMarkup).join('')}</div></section>`;
  if (track.cover) {
    const note = document.createElement('p');
    note.className = 'empty-state';
    note.textContent = track.status === 'approved'
      ? 'Instrumental Strudel cover. Synthesized live from code.'
      : 'Instrumental Strudel cover · In review. Melody, sound, and musical fidelity are still being improved.';
    $('.detail-hero').after(note);
  }
  try { $('#detailCode').textContent = await getCode(track); }
  catch (error) { $('#detailCode').textContent = error.message; }
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
    event.preventDefault(); if (state.playing) stopTrack(); else if (state.current) playTrack(state.current); else playRandom();
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
$('#mainPlayButton').addEventListener('click', () => state.playing ? stopTrack() : state.current ? playTrack(state.current) : playRandom());
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
  try { await runCode($('#editorCode').value); showToast('Previewing your pattern'); }
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
    $('#editorDialog').close('save'); renderPlaylistNav(); renderAllLists();
    showToast('Saved to your local library');
    openTrack(track.id);
  }
});
$('#editorDialog').addEventListener('close', () => {
  if ($('#editorDialog').returnValue !== 'save' && !state.playing && window.hush) window.hush();
});
function routeFromLocation() {
  if (location.hash.startsWith('#track/')) {
    try { openTrack(decodeURIComponent(location.hash.slice(7))); }
    catch { setView('home', false); }
  }
  else if (location.hash === '#track' && history.state?.trackId) openTrack(history.state.trackId);
  else setView(location.hash.slice(1) || 'home', false);
}
window.addEventListener('popstate', routeFromLocation);

document.querySelector('a[href="#mainArea"]').addEventListener('click', event => { event.preventDefault(); $('#mainArea').focus(); });
document.addEventListener('keydown', event => { if(event.key==='Escape'){hideSuggestions();$$('.detail-menu').forEach(menu=>menu.classList.add('hidden'));$$('[data-track-menu]').forEach(button=>button.setAttribute('aria-expanded','false'));} });
document.querySelector('[data-close-editor]').addEventListener('click', () => $('#editorDialog').close('cancel'));
$('#createHeaderButton').addEventListener('click', () => openEditor());
$('#librarySearchButton').addEventListener('click', () => { setView('search'); $('#searchInput').focus(); });
$('#clearSearchButton').addEventListener('click', () => { $('#searchInput').value=''; $('#searchPageInput').value=''; renderSearch(); hideSuggestions(); $('#clearSearchButton').classList.add('hidden'); $('#searchInput').focus(); });
$$('[data-home-filter]').forEach(button => button.addEventListener('click', () => { homeFilter=button.dataset.homeFilter; $$('[data-home-filter]').forEach(b=>{b.classList.toggle('selected',b===button); b.setAttribute('aria-pressed',String(b===button));}); renderHome(); }));
$$('[data-toggle-queue]').forEach(button=>button.addEventListener('click',()=>{ const open=$('#appShell').classList.toggle('queue-open'); $$('[data-toggle-queue]').forEach(b=>b.setAttribute('aria-expanded',String(open))); }));
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
if (!location.hash) history.replaceState({ view: 'home' }, '', '#home');

async function loadCoverCatalog() {
  const catalogUrl = new URL('tracks/covers/catalog.json', document.baseURI);
  const response = await fetch(catalogUrl, {cache: 'no-cache'});
  if (!response.ok) throw new Error(`Music catalog unavailable (${response.status}).`);
  const catalog = await response.json();
  const statuses = ['draft', 'runtime-verified', 'listening-reviewed', 'approved'];
  if (!Array.isArray(catalog) || !catalog.length) throw new Error('Music catalog is empty.');
  const ids = new Set(tracks.map(track => track.id));
  const covers = catalog.map((entry, index) => {
    if (!entry.id || ids.has(entry.id) || !entry.title || !entry.artist || !entry.genre ||
        !Number.isFinite(entry.bpm) || entry.bpm <= 0 || !statuses.includes(entry.status))
      throw new Error('Music catalog contains an invalid entry.');
    ids.add(entry.id);
    const codeUrl = new URL(entry.codeUrl, catalogUrl);
    if (!entry.codeUrl || codeUrl.origin !== catalogUrl.origin ||
        !codeUrl.pathname.startsWith(new URL('./', catalogUrl).pathname) ||
        !codeUrl.pathname.endsWith('.strudel')) throw new Error('Invalid cover code path.');
    return {...entry, codeUrl: codeUrl.href, cover: true, mood: entry.genre,
      loop: `${entry.bpm} BPM`, group: 'Requested covers', palette: index % palettes.length + 1};
  });
  tracks.unshift(...covers);
  $('#catalogStatus').classList.add('hidden');
  $('#catalogIntro').textContent = `${covers.length} instrumental covers in review. Six original patterns to explore.`;
  renderAllLists();
  renderPlayer();
  showSuggestions();
}
loadCoverCatalog().catch(error => {
  $('#catalogStatus').textContent = `${error.message} Reload to try again. Original patterns are still available.`;
  $('#catalogStatus').setAttribute('role', 'alert');
}).finally(routeFromLocation);
