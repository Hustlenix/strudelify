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
  loading: false,
  liked: readStorage('strudelify-liked', []),
  custom: readStorage('strudelify-custom', []),
  recent: readStorage('strudelify-recent', []),
  libraryFilter: 'all',
  groupFilter: '',
  toastTimer: 0,
};
let enginePromise;
const codeCache = new Map();
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
  return `<span class="${className}" style="${artStyle(track)}" aria-hidden="true">꩜</span>`;
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
  $('#mainPlayButton').textContent = playing ? 'Ⅱ' : '▶';
  $('#mainPlayButton').setAttribute('aria-label', playing ? 'Stop current pattern' : 'Play current pattern');
  $('#mainPlayButton').title = playing ? 'Stop current pattern' : 'Play current pattern';
}
function getCode(track) {
  if (track.code) return Promise.resolve(track.code);
  if (codeCache.has(track.id)) return codeCache.get(track.id);
  const request = fetch(track.codeUrl).then(response => {
    if (!response.ok) throw new Error(`Could not load ${track.codeUrl} (${response.status}).`);
    return response.text();
  });
  codeCache.set(track.id, request);
  return request;
}
function ensureEngine() {
  if (typeof window.initStrudel !== 'function') throw new Error('The Strudel runtime did not load. Check your connection and refresh.');
  if (!enginePromise) enginePromise = Promise.resolve(window.initStrudel());
  return enginePromise;
}
function getEvalError(repl) { return repl?.state?.evalError || null; }
async function runCode(code) {
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
  $('#playerArt').style.background = track ? palettes[((track.palette || 1) - 1) % palettes.length] : palettes[0];
  $('#likeButton').disabled = !track;
  $('#likeButton').classList.toggle('liked', !!track && state.liked.includes(track.id));
  $('#likeButton').textContent = track && state.liked.includes(track.id) ? '♥' : '♡';
  $('#codeButton').disabled = !track;
  $('#mainPlayButton').disabled = !track || state.loading;
  setStatus(state.loading ? 'Waking the synth…' : state.playing ? 'Playing live pattern' : track ? 'Pattern stopped' : 'Ready when you are', state.playing);
}
function renderPlaylistNav() {
  const items = [
    { name: 'All patterns', symbol: '▧', filter: '' },
    ...groups.map(group => ({ name: group.name, symbol: group.symbol, filter: group.name })),
    { name: 'Liked tracks', symbol: '♡', liked: true },
  ];
  $('#playlistList').innerHTML = items.map((item, index) => `
    <button class="playlist-link" data-group="${escapeHtml(item.filter || '')}" data-liked-nav="${item.liked ? 'true' : 'false'}">
      <span class="playlist-art" style="background:${item.liked ? 'linear-gradient(140deg,#7da86e,#394c38)' : palettes[(index + 1) % palettes.length]}">${escapeHtml(item.symbol)}</span>
      <span>${escapeHtml(item.name)}</span>
    </button>`).join('');
}
function rowMarkup(track, index) {
  const active = state.current?.id === track.id;
  const liked = state.liked.includes(track.id);
  return `<div class="track-row${active && state.playing ? ' playing' : ''}" data-track-id="${escapeHtml(track.id)}">
    <span class="row-number">${String(index + 1).padStart(2, '0')}</span>
    <button class="row-play" data-action="play" aria-label="${active && state.playing ? 'Stop' : 'Play'} ${escapeHtml(track.title)}">${active && state.playing ? 'Ⅱ' : '▶'}</button>
    <div class="row-track" data-action="open" role="button" tabindex="0" aria-label="View ${escapeHtml(track.title)}">
      ${artMarkup(track)}<span class="row-title"><strong>${escapeHtml(track.title)}</strong><span>${escapeHtml(track.artist)}</span></span>
    </div>
    <span class="row-mood">${escapeHtml(track.mood || (track.created ? 'Your pattern' : 'Live-coded'))}</span>
    <span class="row-loop">${escapeHtml(track.loop || '∞ loop')}</span>
    <button class="row-like${liked ? ' liked' : ''}" data-action="like" aria-label="${liked ? 'Unlike' : 'Like'} ${escapeHtml(track.title)}">${liked ? '♥' : '♡'}</button>
  </div>`;
}
function quickPickMarkup(track) {
  return `<button class="quick-pick" data-action="play" data-track-id="${escapeHtml(track.id)}" aria-label="Play ${escapeHtml(track.title)}">
    ${artMarkup(track, 'quick-pick-art')}<span class="quick-pick-copy"><strong>${escapeHtml(track.title)}</strong><span>${escapeHtml(track.artist)}</span></span>
    <span class="quick-pick-play" aria-hidden="true">▶</span></button>`;
}
function cardMarkup(track) {
  const liked = state.liked.includes(track.id);
  return `<article class="track-card" data-track-id="${escapeHtml(track.id)}">
    <button class="card-like${liked ? ' liked' : ''}" data-action="like" aria-label="${liked ? 'Unlike' : 'Like'} ${escapeHtml(track.title)}">${liked ? '♥' : '♡'}</button>
    <div class="track-card-art" style="${artStyle(track)}" data-action="open" role="button" tabindex="0" aria-label="View ${escapeHtml(track.title)}">꩜</div>
    <button class="card-play" data-action="play" aria-label="Play ${escapeHtml(track.title)}">▶</button>
    <div class="track-card-copy" data-action="open" role="button" tabindex="0"><strong>${escapeHtml(track.title)}</strong><span>${escapeHtml(track.artist)}</span><p>${escapeHtml(track.mood || 'Your own live-coded pattern')}</p></div>
  </article>`;
}
function renderHome() {
  const hour = new Date().getHours();
  $('#greetingTitle').textContent = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const recentTracks = state.recent.map(getTrack).filter(Boolean);
  const quickPicks = [...new Map([...recentTracks, ...allTracks()].map(track => [track.id, track])).values()].slice(0, 6);
  $('#quickPickGrid').innerHTML = quickPicks.map(quickPickMarkup).join('');
  $('#quickPicksEyebrow').textContent = recentTracks.length ? 'Your recent listening' : 'A few places to start';
  $('#quickPicksTitle').textContent = recentTracks.length ? 'Jump back in' : 'Quick picks';
  $('#featureGrid').innerHTML = groups.map(group => `
    <button class="feature-card" data-group="${escapeHtml(group.name)}" aria-label="Play ${escapeHtml(group.name)} collection">
      <span class="feature-art" style="background:${palettes[group.palette - 1]}">${escapeHtml(group.symbol)}</span>
      <span class="feature-info"><strong>${escapeHtml(group.name)}</strong><span>${escapeHtml(group.note)}</span></span>
      <span class="feature-play">▶</span>
    </button>`).join('');
  $('#homeTrackList').innerHTML = allTracks().map(rowMarkup).join('');
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
  if (name === 'search') { renderSearch(); }
  if (name === 'library') renderLibrary();
  $('#mainArea').scrollTo({ top: 0, behavior: 'smooth' });
}
async function openTrack(id) {
  const track = getTrack(id);
  if (!track) return;
  setView('track');
  const detail = $('#trackDetail');
  detail.innerHTML = `<div class="detail-hero">
    <div class="detail-art" style="${artStyle(track)}">꩜</div>
    <div class="detail-copy"><div class="eyebrow">Live-coded pattern</div><h1>${escapeHtml(track.title)}</h1><p>${escapeHtml(track.artist)} · ${escapeHtml(track.mood || 'Your own pattern')} · ${escapeHtml(track.loop || '∞ loop')}</p>
    <button class="button button-primary" data-action="play" data-track-id="${escapeHtml(track.id)}">▶ Play pattern</button>
    <button class="button button-quiet" data-action="copy" data-track-id="${escapeHtml(track.id)}">Copy code</button></div>
  </div><section class="section-block"><div class="section-heading"><div><div class="eyebrow">The instrument is the source</div><h2>Strudel code</h2></div></div>
    <div class="code-panel"><div class="code-panel-heading"><span>${escapeHtml(track.id)}.strudel</span><span>LIVE PATTERN</span></div><pre id="detailCode">Loading the pattern…</pre></div></section>`;
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
  else if (actionTarget.dataset.action === 'like') { event.stopPropagation(); likeTrack(track); }
  else if (actionTarget.dataset.action === 'open' && track) openTrack(track.id);
  else if (actionTarget.dataset.action === 'copy' && track) copyTrackCode(track);
}

document.addEventListener('click', event => {
  const viewButton = event.target.closest('[data-view]');
  if (viewButton) { setView(viewButton.dataset.view); return; }
  const likedNavigation = event.target.closest('[data-liked-nav="true"]');
  if (likedNavigation) { state.libraryFilter = 'liked'; $$('.filter-chip').forEach(item => { const active = item.dataset.libraryFilter === 'liked'; item.classList.toggle('selected', active); item.setAttribute('aria-selected', String(active)); }); setView('library'); return; }
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
  if (event.key === 'Enter' && event.target.matches('[data-action="open"]')) {
    event.preventDefault();
    const id = event.target.closest('[data-track-id]')?.dataset.trackId;
    if (id) openTrack(id);
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
});
$('#searchPageInput').addEventListener('input', () => { $('#searchInput').value = $('#searchPageInput').value; state.groupFilter = ''; renderSearch(); });
$('#newTrackButton').addEventListener('click', () => openEditor());
$('#libraryCreateButton').addEventListener('click', () => openEditor());
$('#heroPlayButton').addEventListener('click', () => playRandom());
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
$('#codeButton').addEventListener('click', () => state.current && openTrack(state.current.id));
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
window.addEventListener('popstate', event => setView(event.state?.view || location.hash.slice(1) || 'home', false));

renderPlaylistNav();
renderHome();
renderPlayer();
if (!location.hash) history.replaceState({ view: 'home' }, '', '#home');
else setView(location.hash.slice(1), false);
