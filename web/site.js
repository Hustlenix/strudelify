/* Catalog discovery and device-local library pages. Audio is owned by app.js. */
const MusicSite = (() => {
  'use strict';
  const preferenceKey = 'strudelify-site-v1';
  const defaults = {artists: [], collections: [], compact: false, reduceMotion: false};
  let pageTracks = [];
  let pageLabel = '';
  let activeGenre = '';
  let exploreSort = 'catalog';
  let renderStamp = '';
  const esc = value => escapeHtml(value);
  const query = selector => document.querySelector(selector);
  const siteGlyph = name => `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${name === 'share' ? '<path d="M12 15V3m-4 4 4-4 4 4M7 11H5a1 1 0 0 0-1 1v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7a1 1 0 0 0-1-1h-2"/>' : '<path d="M9 18V5l11-2v13M9 8l11-2"/><ellipse cx="6" cy="18" rx="3" ry="2"/><ellipse cx="17" cy="16" rx="3" ry="2"/>'}</svg>`;
  const hashFor = (type, value) => `#${type}/${encodeURIComponent(value)}`;
  const count = (n, noun = 'pattern') => `${n} ${noun}${n === 1 ? '' : 's'}`;
  const publicTracks = () => allTracks().filter(track => !track.created);
  const artistTracks = artist => allTracks().filter(track => track.artist === artist);
  const artistNames = () => [...new Set(allTracks().map(track => track.artist).filter(Boolean))];
  const recentTracks = () => state.recent.map(getTrack).filter(Boolean);
  const likedTracks = () => state.liked.map(getTrack).filter(Boolean);

  function preferences() {
    try {
      const saved = WorkspaceStorage.read(preferenceKey, defaults);
      return {artists: Array.isArray(saved?.artists) ? saved.artists.filter(item => typeof item === 'string') : [],
        collections: Array.isArray(saved?.collections) ? saved.collections.filter(item => typeof item === 'string') : [],
        compact: saved?.compact === true, reduceMotion: saved?.reduceMotion === true};
    } catch { return {...defaults, artists: [], collections: []}; }
  }
  function applyPreferences() {
    const saved = preferences();
    query('#appShell')?.classList.toggle('site-density-compact', saved.compact);
    query('#appShell')?.classList.toggle('site-reduce-motion', saved.reduceMotion);
  }
  function savePreferences(next) {
    try { WorkspaceStorage.write(preferenceKey, next); applyPreferences(); return true; }
    catch { showToast('Could not save on this device. Export your library to keep a copy.'); return false; }
  }
  function collections() {
    const map = new Map();
    allTracks().forEach(track => {
      const name = track.created ? 'Made by you' : track.group || 'Original patterns';
      if (!map.has(name)) map.set(name, []);
      map.get(name).push(track);
    });
    return [...map].map(([name, items]) => ({name, tracks: items}));
  }
  function collectionByName(name) { return collections().find(item => item.name === name); }
  function collectionNote(name) {
    return ({'Cover studies': 'Instrumental arrangements of familiar songs, generated with Strudel.',
      'Slow burn': 'Dusty keys and bright pulses. Let the patterns unfold.',
      'Night motion': 'Offbeat synths and a little light after dark.',
      'Soft focus': 'Warm textures and room to drift.',
      'Made by you': 'Your saved patterns and remixes, available on this device.'})[name] || 'A collection from the Strudelify catalog.';
  }
  function mosaic(items, className = 'site-collection-mosaic') {
    const shown = items.slice(0, 4);
    return `<span class="${className}${shown.length === 1 ? ' site-mosaic-single' : ''}" aria-hidden="true">${shown.map(track => coverImage(track)).join('') || icon('book')}</span>`;
  }
  function routeLink(hash, label, className = 'site-secondary') {
    return `<a class="${className}" href="${esc(hash)}" data-site-route="${esc(hash)}">${esc(label)}</a>`;
  }
  function heading(kicker, title, description = '') {
    return `<header class="site-heading"><p class="site-kicker">${esc(kicker)}</p><h1 tabindex="-1">${esc(title)}</h1>${description ? `<p>${esc(description)}</p>` : ''}</header>`;
  }
  function sectionHead(title, hash, linkText = 'Show all') {
    return `<div class="site-section-head"><h2>${esc(title)}</h2>${hash ? routeLink(hash, linkText, 'text-button') : ''}</div>`;
  }
  function collectionCard(collection) {
    const hash = hashFor('collection', collection.name);
    return `<a class="site-collection-card" href="${esc(hash)}" data-site-route="${esc(hash)}">${mosaic(collection.tracks)}<span class="site-collection-copy"><strong>${esc(collection.name)}</strong><small>${esc(count(collection.tracks.length))} · ${collection.tracks.every(track => track.created) ? 'On this device' : 'Collection'}</small></span></a>`;
  }
  function artistCard(artist) {
    const items = artistTracks(artist);
    const hash = hashFor('artist', artist);
    return `<a class="site-artist-card" href="${esc(hash)}" data-site-route="${esc(hash)}"><span class="site-artist-avatar" aria-hidden="true">${items[0] ? coverImage(items[0]) : esc(artist.charAt(0))}</span><strong>${esc(artist)}</strong><small>${esc(count(items.length))} in this library</small></a>`;
  }
  function empty(title, message, actionHash = '#explore', actionLabel = 'Explore music') {
    return `<div class="site-empty"><span class="site-empty-icon" aria-hidden="true">${siteGlyph('music')}</span><h2>${esc(title)}</h2><p>${esc(message)}</p>${routeLink(actionHash, actionLabel, 'site-primary')}</div>`;
  }
  function durationLabel(items) {
    const finite = items.filter(track => Number.isFinite(track.durationSeconds) && track.durationSeconds > 0);
    const seconds = finite.reduce((sum, track) => sum + track.durationSeconds, 0);
    if (!finite.length) return 'Live patterns';
    const duration = seconds < 60 ? `${Math.round(seconds)} sec` : `${Math.round(seconds / 60)} min`;
    return finite.length === items.length ? `${duration} of music` : `${duration} + open-ended patterns`;
  }
  function playButton(key, label = 'Play collection', disabled = false) {
    return `<button class="site-primary" data-site-play="${esc(key)}"${disabled ? ' disabled' : ''}>${icon('play')}${esc(label)}</button>`;
  }
  function shareButton(hash, label = 'Share link') {
    return `<button class="site-secondary" data-site-share="${esc(hash)}">${siteGlyph('share')}${esc(label)}</button>`;
  }
  function trackList(items, label) {
    pageTracks = items;
    pageLabel = label;
    return `<div class="track-table-head"><span>#</span><span>Title</span><span>Mood</span><span>Tempo</span><span></span></div><div class="track-table site-list">${items.map(rowMarkup).join('')}</div>`;
  }
  function playlistCard(playlist) {
    const items = playlist.entries.map(entry => getTrack(entry.trackId)).filter(Boolean);
    return `<button class="site-collection-card" data-open-playlist="${esc(playlist.id)}">${mosaic(items)}<span class="site-collection-copy"><strong>${esc(playlist.name)}</strong><small>${esc(count(playlist.entries.length, 'track'))} · On this device</small></span></button>`;
  }
  function renderDashboard() {
    const target = query('#siteDashboard');
    if (!target) return;
    const saved = preferences();
    const catalog = allTracks();
    const spotlight = getTrack('01-babydoll') || publicTracks()[0] || catalog[0];
    const recent = recentTracks();
    const yourPlaylists = typeof playlists === 'undefined' ? [] : playlists;
    target.className = 'site-dashboard';
    target.innerHTML = `${homeFilter === 'all' ? `<section class="site-hero"><div class="site-hero-copy"><p class="site-kicker">WELCOME TO STRUDELIFY</p><h2>Music you can make your own.</h2><p>Find a sound. Build a collection. Open the code and take it somewhere new.</p><div class="site-action-row">${routeLink('#explore', 'Explore the catalog', 'site-primary')}<button class="site-secondary" data-site-studio>Open Studio</button></div><div class="site-pill-row"><span class="site-pill">${esc(count(publicTracks().length))} in the catalog</span><span class="site-pill">Played live with Strudel</span></div></div>${spotlight ? `<a class="site-hero-art" href="${esc(hashFor('track', spotlight.id))}" data-site-track="${esc(spotlight.id)}" aria-label="View ${esc(spotlight.title)}">${coverImage(spotlight)}<span class="site-hero-caption"><strong>${esc(spotlight.title)}</strong><small>${esc(spotlight.artist)}</small></span></a>` : ''}</section>` : ''}
      <div class="site-quick-grid"><a class="site-quick-card" href="#liked" data-site-route="#liked"><span class="site-quick-icon site-heart-tile">${icon('heart')}</span><span><strong>Liked tracks</strong><small>${esc(count(likedTracks().length))}</small></span></a><a class="site-quick-card" href="#recent" data-site-route="#recent"><span class="site-quick-icon">${icon('previous')}</span><span><strong>Recently played</strong><small>${recent.length ? esc(recent[0].title) : 'Your listening starts here'}</small></span></a><a class="site-quick-card" href="#artists" data-site-route="#artists"><span class="site-quick-icon">${siteGlyph('music')}</span><span><strong>Artists</strong><small>${esc(count(artistNames().length, 'artist'))} to explore</small></span></a></div>
      ${homeFilter === 'all' ? `<section class="site-section">${sectionHead('Collections for your day', '#explore')}<div class="site-collection-grid">${collections().filter(item => item.name !== 'Made by you').map(collectionCard).join('')}</div></section>` : ''}
      ${saved.artists.length && homeFilter === 'all' ? `<section class="site-section">${sectionHead('Your artists', '#profile', 'Your library')}<div class="site-artist-grid">${saved.artists.filter(artist => artistTracks(artist).length).slice(0, 6).map(artistCard).join('')}</div></section>` : ''}
      ${yourPlaylists.length && homeFilter === 'all' ? `<section class="site-section">${sectionHead('Your playlists', '#library')}<div class="site-collection-grid">${yourPlaylists.slice(0, 4).map(playlistCard).join('')}</div></section>` : ''}`;
  }
  function renderLibraryExtras() {
    const target = query('#siteLibraryExtras');
    if (!target) return;
    const saved = preferences();
    const savedCollections = saved.collections.map(collectionByName).filter(Boolean);
    const artists = saved.artists.filter(name => artistTracks(name).length);
    target.innerHTML = `<nav class="site-library-shortcuts" aria-label="Library pages">${routeLink('#liked', `Liked tracks · ${likedTracks().length}`)}${routeLink('#recent', 'Recently played')}${routeLink('#profile', 'Profile & settings')}</nav>
      ${savedCollections.length ? `<section class="site-section">${sectionHead('Saved collections')}<div class="site-collection-grid">${savedCollections.map(collectionCard).join('')}</div></section>` : ''}
      ${artists.length ? `<section class="site-section">${sectionHead('Your artists', '#artists')}<div class="site-artist-grid">${artists.map(artistCard).join('')}</div></section>` : ''}`;
  }
  function renderExplore() {
    const catalog = allTracks();
    const genres = [...new Set(catalog.map(track => track.genre || track.mood).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    if (!genres.includes(activeGenre)) activeGenre = '';
    let items = catalog.filter(track => !activeGenre || (track.genre || track.mood) === activeGenre);
    if (exploreSort === 'title') items.sort((a, b) => a.title.localeCompare(b.title));
    if (exploreSort === 'tempo') items.sort((a, b) => (Number(a.bpm) || Infinity) - (Number(b.bpm) || Infinity));
    if (exploreSort === 'duration') items.sort((a, b) => (Number(a.durationSeconds) || Infinity) - (Number(b.durationSeconds) || Infinity));
    return `${heading('DISCOVER', 'Find your next sound.', 'Browse the full library by collection, artist, or sound. Every pattern opens in Studio.')}
      <section class="site-section">${sectionHead('Browse collections')}<div class="site-collection-grid">${collections().map(collectionCard).join('')}</div></section>
      <section class="site-section">${sectionHead('Artists in the catalog', '#artists')}<div class="site-artist-grid">${artistNames().slice(0, 6).map(artistCard).join('')}</div></section>
      <section class="site-section"><div class="site-section-head"><div><p class="site-kicker">BROWSE BY SOUND</p><h2>${esc(activeGenre || 'All patterns')}</h2></div><label class="sort-control">Sort <select data-site-sort aria-label="Sort explored tracks"><option value="catalog"${exploreSort === 'catalog' ? ' selected' : ''}>Catalog order</option><option value="title"${exploreSort === 'title' ? ' selected' : ''}>Title A–Z</option><option value="tempo"${exploreSort === 'tempo' ? ' selected' : ''}>Tempo</option><option value="duration"${exploreSort === 'duration' ? ' selected' : ''}>Duration</option></select></label></div><div class="site-pill-row site-genre-filters" aria-label="Filter by sound"><button class="filter-chip${!activeGenre ? ' selected' : ''}" data-site-genre="" aria-pressed="${!activeGenre}">All</button>${genres.map(genre => `<button class="filter-chip${genre === activeGenre ? ' selected' : ''}" data-site-genre="${esc(genre)}" aria-pressed="${genre === activeGenre}">${esc(genre)}</button>`).join('')}</div><div class="site-section-head"><p>${esc(count(items.length))}</p>${playButton('page', 'Play these patterns', !items.length)}</div>${items.length ? trackList(items, activeGenre || 'Explore') : empty('No patterns in this sound yet', 'Choose another filter or create your own pattern.')}</section>`;
  }
  function renderArtists() {
    const saved = preferences();
    return `${heading('THE PEOPLE BEHIND THE SONGS', 'Artists', 'Explore patterns by their credited artist. Artwork represents the pattern, not an artist portrait.')}<div class="site-artist-grid">${artistNames().map(artistCard).join('')}</div><p class="site-fine-print">Following saves an artist to your library on this device. ${saved.artists.length ? `${saved.artists.length} followed.` : 'Open an artist to follow them.'}</p>`;
  }
  function renderArtist(name) {
    const items = artistTracks(name);
    const following = preferences().artists.includes(name);
    if (!items.length) return `${heading('ARTIST', name)}${following ? `<button class="site-secondary" data-site-follow="${esc(name)}" aria-pressed="true">Following · Remove</button>` : ''}${empty('No patterns available here', 'This artist is not in the current catalog or local library.', '#artists', 'Browse artists')}`;
    const covers = items.filter(track => track.cover).length;
    const collectionNames = new Set(items.map(track => track.created ? 'Made by you' : track.group || 'Original patterns'));
    return `<section class="site-hero site-detail-hero"><div class="site-hero-art site-artist-hero-art">${coverImage(items[0])}</div><div class="site-hero-copy"><p class="site-kicker">ARTIST</p><h1 tabindex="-1">${esc(name)}</h1><p>${covers ? 'Instrumental Strudel studies of songs credited to this artist.' : items.every(track => track.created) ? 'Patterns saved in your local library.' : 'Original instrumental patterns made with Strudel.'}</p><div class="site-pill-row"><span class="site-pill">${esc(count(items.length))}</span><span class="site-pill">${esc(durationLabel(items))}</span></div><div class="site-action-row">${playButton('page', 'Play patterns')}<button class="site-secondary${following ? ' selected' : ''}" data-site-follow="${esc(name)}" aria-pressed="${following}">${following ? 'Following' : 'Follow artist'}</button>${items.some(track => !track.created) ? shareButton(hashFor('artist', name)) : ''}</div></div></section><section class="site-section">${sectionHead('Patterns')}${trackList(items, name)}</section><section class="site-section">${sectionHead('Appears in')}<div class="site-collection-grid">${collections().filter(item => collectionNames.has(item.name)).map(collectionCard).join('')}</div></section><p class="site-fine-print">${covers ? 'These are synthesized instrumental studies, not the original recordings. Musical recognition review remains pending.' : 'Open a track to explore its code or make your own version.'} Following is saved on this device.</p>`;
  }
  function renderCollection(name) {
    const collection = collectionByName(name);
    const saved = preferences().collections.includes(name);
    if (!collection) return `${heading('COLLECTION', name)}${saved ? `<button class="site-secondary" data-site-save-collection="${esc(name)}" aria-pressed="true">Saved · Remove</button>` : ''}${empty('No patterns in this collection', 'The collection is empty or is not available in this release.')}`;
    const items = collection.tracks;
    const artists = [...new Set(items.map(track => track.artist))];
    return `<section class="site-hero site-detail-hero"><div class="site-hero-art">${mosaic(items)}</div><div class="site-hero-copy"><p class="site-kicker">${items.every(track => track.created) ? 'ON THIS DEVICE' : 'STRUDELIFY COLLECTION'}</p><h1 tabindex="-1">${esc(name)}</h1><p>${esc(collectionNote(name))}</p><div class="site-pill-row"><span class="site-pill">${esc(count(items.length))}</span><span class="site-pill">${esc(durationLabel(items))}</span></div><div class="site-action-row">${playButton('page')}<button class="site-secondary${saved ? ' selected' : ''}" data-site-save-collection="${esc(name)}" aria-pressed="${saved}">${icon('heart')}${saved ? 'Saved to library' : 'Save collection'}</button>${items.some(track => !track.created) ? shareButton(hashFor('collection', name)) : ''}</div></div></section><section class="site-section">${trackList(items, name)}</section><section class="site-section">${sectionHead('Artists in this collection', '#artists')}<div class="site-artist-grid">${artists.map(artistCard).join('')}</div></section>${items.some(track => track.cover) ? '<p class="site-fine-print">Cover studies are synthesized instrumental arrangements. They are not the original recordings or approved faithful reproductions.</p>' : ''}`;
  }
  function renderPersonal(kind) {
    const isLiked = kind === 'liked';
    const items = isLiked ? likedTracks() : recentTracks();
    const title = isLiked ? 'Liked tracks' : 'Recently played';
    return `${heading('YOUR LIBRARY · ON THIS DEVICE', title, isLiked ? 'The sounds you want to come back to. Tap a heart on any pattern to add it here.' : 'Your most recently started patterns, with the newest first. Listening history stays on this device.')}<div class="site-action-row">${playButton('page', isLiked ? 'Play liked tracks' : 'Play recent tracks', !items.length)}${routeLink('#library', 'Your library')}${isLiked ? '<button class="site-secondary" data-site-create-playlist>Create playlist</button>' : ''}</div><section class="site-section">${items.length ? `${sectionHead(count(items.length))}${trackList(items, title)}` : empty(isLiked ? 'Keep the sounds you love' : 'Your next listen starts here', isLiked ? 'Choose the heart on a track. It will appear in this collection instantly.' : 'Play a pattern from Explore, then come back to find it here.')}</section>`;
  }
  function renderProfile() {
    const saved = preferences();
    const yourPlaylists = typeof playlists === 'undefined' ? [] : playlists;
    const artists = saved.artists.filter(name => artistTracks(name).length);
    const savedCollections = saved.collections.map(collectionByName).filter(Boolean);
    return `${heading('PERSONAL SPACE', 'Your library. Your way.', 'Your patterns, playlists, and preferences are saved in this browser. No account is required.')}<div class="site-stat-grid"><div class="site-stat"><strong>${likedTracks().length}</strong><span>Liked tracks</span></div><div class="site-stat"><strong>${state.custom.length}</strong><span>Your patterns</span></div><div class="site-stat"><strong>${yourPlaylists.length}</strong><span>Playlists</span></div><div class="site-stat"><strong>${saved.artists.length}</strong><span>Followed artists</span></div></div><div class="site-profile-grid"><section class="site-panel"><p class="site-kicker">MAKE IT COMFORTABLE</p><h2>Appearance</h2><label class="site-settings-row"><span><strong>Compact layout</strong><small>Fit more tracks in the library.</small></span><input type="checkbox" data-site-setting="compact"${saved.compact ? ' checked' : ''}></label><label class="site-settings-row"><span><strong>Reduce motion</strong><small>Minimize movement and transitions.</small></span><input type="checkbox" data-site-setting="reduceMotion"${saved.reduceMotion ? ' checked' : ''}></label><p class="site-fine-print">Your device’s reduced-motion preference is also respected.</p></section><section class="site-panel"><p class="site-kicker">KEEP YOUR WORK</p><h2>Backup & transfer</h2><p>Export your library before clearing browser data or moving devices. A backup includes patterns, versions, playlists, liked tracks, followed artists, and saved collections.</p><button class="site-primary" data-site-backup>Open library backup</button><p class="site-fine-print">There is no cloud sync. Clearing this site’s browser storage removes local work.</p></section></div>${artists.length ? `<section class="site-section">${sectionHead('Your artists', '#artists')}<div class="site-artist-grid">${artists.map(artistCard).join('')}</div></section>` : ''}${savedCollections.length ? `<section class="site-section">${sectionHead('Saved collections', '#explore')}<div class="site-collection-grid">${savedCollections.map(collectionCard).join('')}</div></section>` : ''}<section class="site-section">${sectionHead('Your playlists', '#library')}<div class="site-collection-grid">${yourPlaylists.map(playlistCard).join('') || '<div class="site-panel"><h3>A home for your next mix</h3><p>Collect tracks in your own order, then keep them in a local playlist.</p><button class="site-primary" data-site-create-playlist>Create a playlist</button></div>'}</div></section><nav class="site-action-row" aria-label="More about Strudelify">${routeLink('#help', 'Help & keyboard shortcuts')}${routeLink('#about', 'About Strudelify')}</nav>`;
  }
  function renderAbout() {
    return `${heading('MUSIC, IN CODE', 'This is Strudelify.', 'A place to listen, collect, and make music from live patterns.')}<section class="site-hero"><div class="site-hero-copy"><h2>Press play. Open the pattern.</h2><p>Each track is a Strudel composition that runs in your browser. Listen to an original, explore an instrumental study, or remix the code into something of your own.</p><div class="site-action-row">${routeLink('#explore', 'Find a pattern', 'site-primary')}<button class="site-secondary" data-site-studio>Make something</button></div></div><div class="site-hero-art">${mosaic(publicTracks().slice(-4))}</div></section><div class="site-step-grid"><article class="site-panel"><p class="site-kicker">01 · LISTEN</p><h2>Live from the pattern</h2><p>Audio is synthesized by Strudel. Internet access is needed for the runtime, catalog, and some instrument samples.</p></article><article class="site-panel"><p class="site-kicker">02 · COLLECT</p><h2>A local-first library</h2><p>Like tracks, follow artists, save collections, and build playlists. Your saved library stays in this browser until you export it.</p></article><article class="site-panel"><p class="site-kicker">03 · CREATE</p><h2>Make it yours</h2><p>Open Studio to write a pattern or remix a track. Save versions locally and download the code whenever you want.</p></article></div><section class="site-panel site-section"><h2>About the music</h2><p>The catalog includes original instrumentals and instrumental cover studies. Cover studies are not the commercial recordings, do not include the original vocals, and have not been approved as faithful reproductions.</p><p>Artist names credit the songs represented in those studies. No partnership or endorsement is implied.</p><div class="site-action-row"><a class="site-secondary" href="SOURCE.html">Source & licenses</a><a class="site-secondary" href="https://github.com/Hustlenix/strudelify" target="_blank" rel="noreferrer">View the project ↗</a><a class="site-secondary" href="https://strudel.cc" target="_blank" rel="noreferrer">Learn Strudel ↗</a></div></section>`;
  }
  function renderHelp() {
    return `${heading('A LITTLE GUIDANCE', 'Make yourself at home.', 'Everything you need to listen, organize, and start creating.')}<div class="site-profile-grid"><section class="site-panel"><h2>Listening</h2><p>Choose a track and press Play. Previous restarts the current pattern after three seconds; otherwise it moves back through your listening queue.</p><p>Use a track’s options menu to add it to the queue. Shuffle changes the upcoming collection order. Repeat cycles through off, collection, and one pattern.</p><p>Progress follows the live audio clock. Seeking is not available for live patterns. Adjust volume with your device controls.</p></section><section class="site-panel"><h2>Your collection</h2><p>Tap a heart to save a track. Follow an artist or save a collection from its page. Create playlists from Your Library and reorder their tracks with the arrow buttons.</p><p>Artist, public collection, and catalog track links can be shared. Local playlists and your own patterns are private to this browser; use a library backup or download their code to transfer them.</p></section><section class="site-panel"><h2>Creating in Studio</h2><p>Choose Remix in Studio on any track, or open an empty Studio. Preview your pattern, edit it, and save it to your local library.</p><p>Drafts autosave on this device. Each save keeps a version; you can reopen an older version as a draft. The latest 20 saved versions are kept.</p><p>Only preview code from a source you trust. Strudel patterns are executable JavaScript in your browser.</p></section><section class="site-panel"><h2>Keyboard shortcuts</h2><dl class="site-shortcut-list"><div><dt><kbd>/</kbd></dt><dd>Focus search</dd></div><div><dt><kbd>Space</kbd></dt><dd>Play or pause outside interactive controls</dd></div><div><dt><kbd>Esc</kbd></dt><dd>Close a dialog or search suggestions</dd></div><div><dt><kbd>Ctrl/⌘ Enter</kbd></dt><dd>Preview in Studio</dd></div><div><dt><kbd>Ctrl/⌘ S</kbd></dt><dd>Save a version in Studio</dd></div><div><dt><kbd>Tab</kbd></dt><dd>Indent inside the Studio code editor</dd></div></dl></section></div><section class="site-panel site-section"><h2>Something sounds wrong?</h2><p>Stop playback, select the track again, and press Play. If instruments do not load, check your connection. Another Strudelify tab starting playback will stop this tab to avoid overlapping audio.</p><p>For a useful report, include the track title, what happened, and the passage or playback position. Review your report before sending it; GitHub reports are public.</p><div class="site-action-row"><a class="site-secondary" href="https://github.com/Hustlenix/strudelify/issues/new" data-feedback="" target="_blank" rel="noreferrer">Report a problem ↗</a><button class="site-secondary" data-site-backup>Back up your library</button></div></section>`;
  }
  function parsedRoute(hash) {
    const simple = ['explore', 'artists', 'liked', 'recent', 'profile', 'about', 'help'];
    if (simple.includes(hash.slice(1))) return {kind: hash.slice(1), value: ''};
    const match = /^#(artist|collection)\/(.*)$/.exec(hash);
    if (!match) return null;
    try { return {kind: match[1], value: decodeURIComponent(match[2])}; }
    catch { return {kind: 'missing', value: ''}; }
  }
  function renderPage(info) {
    pageTracks = []; pageLabel = '';
    const target = query('#siteContent');
    if (!target) return;
    const focused = target.contains(document.activeElement) ? document.activeElement : null;
    const focusKey = element => JSON.stringify([element.tagName, element.id,
      element.getAttribute('href'), element.getAttribute('name'),
      [...element.attributes].filter(attribute => attribute.name.startsWith('data-'))
        .map(attribute => [attribute.name, attribute.value]).sort(),
      element.closest('[data-track-id]')?.getAttribute('data-track-id')]);
    const previousKey = focused ? focusKey(focused) : null;
    const previousRow = focused?.closest('.track-row');
    const rowIndex = previousRow ? [...target.querySelectorAll('.track-row')].indexOf(previousRow) : -1;
    const previousAction = focused?.getAttribute('data-action');
    const pages = {explore: renderExplore, artists: renderArtists, artist: () => renderArtist(info.value),
      collection: () => renderCollection(info.value), liked: () => renderPersonal('liked'), recent: () => renderPersonal('recent'),
      profile: renderProfile, about: renderAbout, help: renderHelp};
    target.innerHTML = `<div class="site-page site-page-${esc(info.kind)}">${pages[info.kind] ? pages[info.kind]() : empty('This page could not be opened', 'Choose a collection or artist from Explore.')}</div>`;
    document.title = `${target.querySelector('h1')?.textContent || 'Explore'} · Strudelify`;
    syncPlayButtons();
    if (focused) {
      const controls = [...target.querySelectorAll('button, a[href], input, select, textarea, [tabindex]')];
      let replacement = controls.find(control => focusKey(control) === previousKey && !control.disabled);
      // Removing a liked track keeps the next row's corresponding action in reach.
      if (!replacement && rowIndex >= 0) {
        const rows = [...target.querySelectorAll('.track-row')];
        const nextRow = rows[Math.min(rowIndex, rows.length - 1)];
        replacement = [...(nextRow?.querySelectorAll('[data-action]') || [])]
          .find(control => control.getAttribute('data-action') === previousAction && !control.disabled);
      }
      (replacement || target.querySelector('h1'))?.focus({preventScroll: true});
    }
  }
  function selectNav(hash) {
    document.querySelectorAll('[data-site-route]').forEach(link => {
      const active = link.dataset.siteRoute === hash;
      link.classList.toggle('selected', active);
      link.classList.toggle('active', active && link.classList.contains('nav-link'));
      if (active) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
    });
  }
  function route(hash = location.hash, push = false) {
    const info = parsedRoute(hash);
    if (!info) return false;
    setView('site', false);
    if (push && location.hash !== hash) history.pushState({view: 'site'}, '', hash);
    renderPage(info); selectNav(hash);
    renderStamp = signature();
    if (push) query('#siteContent h1')?.focus({preventScroll: true});
    return true;
  }
  function signature() {
    return JSON.stringify([location.hash, allTracks().map(track => [track.id, track.title, track.artist, track.group, track.genre, track.mood, track.durationSeconds, track.bpm]), state.liked, state.recent,
      typeof playlists === 'undefined' ? [] : playlists, preferences(), activeGenre, exploreSort]);
  }
  function decorateSearch() {
    const view = query('#searchView');
    if (!view) return;
    let target = query('#siteSearchContext');
    if (!target) {
      target = document.createElement('div'); target.id = 'siteSearchContext'; target.className = 'site-search-context';
      view.querySelector('.discovery-toolbar')?.after(target);
    }
    const search = (query('#searchPageInput')?.value || '').trim().toLocaleLowerCase();
    if (!search) { target.innerHTML = `<div class="site-pill-row">${routeLink('#explore', 'Browse collections', 'site-pill')}${routeLink('#artists', 'Browse artists', 'site-pill')}${routeLink('#liked', 'Your liked tracks', 'site-pill')}</div>`; return; }
    const names = artistNames().filter(name => name.toLocaleLowerCase().includes(search));
    const list = collections().filter(item => item.name.toLocaleLowerCase().includes(search));
    target.innerHTML = `${names.length ? `<div><strong>Artists</strong><div class="site-pill-row">${names.slice(0, 6).map(name => routeLink(hashFor('artist', name), name, 'site-pill')).join('')}</div></div>` : ''}${list.length ? `<div><strong>Collections</strong><div class="site-pill-row">${list.map(item => routeLink(hashFor('collection', item.name), item.name, 'site-pill')).join('')}</div></div>` : ''}`;
  }
  function decorateTrack(track) {
    if (!track || !query('#trackDetail .detail-hero')) return;
    query('#siteTrackContext')?.remove();
    const container = document.createElement('div'); container.id = 'siteTrackContext'; container.className = 'site-track-context';
    const group = track.created ? 'Made by you' : track.group || 'Original patterns';
    container.innerHTML = `<div class="site-pill-row">${routeLink(hashFor('artist', track.artist), track.artist, 'site-pill')}${routeLink(hashFor('collection', group), group, 'site-pill')}${Number(track.durationSeconds) > 0 ? `<span class="site-pill">${esc(formatTime(track.durationSeconds))}</span>` : '<span class="site-pill">Open-ended pattern</span>'}</div><div class="site-action-row">${track.created ? `<button class="site-secondary" data-site-edit="${esc(track.id)}">Edit in Studio</button><small>Local pattern · export your code to share it.</small>` : shareButton(hashFor('track', track.id), 'Share track')}</div>`;
    query('#trackDetail .detail-hero').after(container);
  }
  function refresh() {
    applyPreferences(); renderDashboard(); renderLibraryExtras(); decorateSearch();
    const info = parsedRoute(location.hash);
    const nextStamp = signature();
    if (info && nextStamp !== renderStamp) { renderPage(info); renderStamp = nextStamp; }
    selectNav(location.hash);
  }
  function share(hash) {
    if (!/^#(?:track|artist|collection)\//.test(hash)) return;
    sharePublicUrl(hash, 'Strudelify');
  }
  function playPage(key) {
    let items = pageTracks; let label = pageLabel;
    if (key === 'liked') { items = likedTracks(); label = 'Liked tracks'; }
    if (key === 'recent') { items = recentTracks(); label = 'Recently played'; }
    if (!items.length) { showToast('Choose a pattern to start listening.'); return; }
    startCollection(items.map(track => MusicLibrary.entry(track.id)), items[0].id, label);
  }
  document.addEventListener('click', event => {
    const play = event.target.closest('#siteView [data-action="play"]');
    if (!play) return;
    const id = play.closest('[data-track-id]')?.dataset.trackId;
    const track = getTrack(id);
    if (!track) return;
    event.preventDefault(); event.stopPropagation();
    if (state.current?.id === id && (state.playing || state.paused || state.loading)) { togglePlayback(); return; }
    startCollection(pageTracks.map(item => MusicLibrary.entry(item.id)), id, pageLabel);
  }, true);
  document.addEventListener('click', event => {
    const link = event.target.closest('[data-site-route]');
    if (link) {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      const hash = link.dataset.siteRoute;
      if (!route(hash, true)) {
        if (hash === '#library') setView('library');
        else if (hash === '#home') setView('home');
        else if (hash === '#search') setView('search');
      }
      return;
    }
    const trackLink = event.target.closest('[data-site-track]');
    if (trackLink && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) { event.preventDefault(); openTrack(trackLink.dataset.siteTrack); return; }
    const play = event.target.closest('[data-site-play]'); if (play) { playPage(play.dataset.sitePlay); return; }
    const follow = event.target.closest('[data-site-follow]');
    if (follow) {
      const saved = preferences(); const name = follow.dataset.siteFollow; const has = saved.artists.includes(name);
      saved.artists = has ? saved.artists.filter(item => item !== name) : [...saved.artists, name];
      if (savePreferences(saved)) { refresh(); showToast(has ? 'Artist removed from your library' : 'Artist saved to your library'); }
      return;
    }
    const collection = event.target.closest('[data-site-save-collection]');
    if (collection) {
      const saved = preferences(); const name = collection.dataset.siteSaveCollection; const has = saved.collections.includes(name);
      saved.collections = has ? saved.collections.filter(item => item !== name) : [...saved.collections, name];
      if (savePreferences(saved)) { refresh(); showToast(has ? 'Collection removed from your library' : 'Collection saved to your library'); }
      return;
    }
    const genre = event.target.closest('[data-site-genre]');
    if (genre) { activeGenre = genre.dataset.siteGenre; refresh(); return; }
    const shared = event.target.closest('[data-site-share]'); if (shared) { share(shared.dataset.siteShare); return; }
    const edit = event.target.closest('[data-site-edit]'); if (edit) { openEditor(getTrack(edit.dataset.siteEdit)); return; }
    if (event.target.closest('[data-site-studio]')) { openEditor(); return; }
    if (event.target.closest('[data-site-backup]')) { openLibraryBackup(); return; }
    if (event.target.closest('[data-site-create-playlist]')) query('#libraryCreateButton')?.click();
  });
  document.addEventListener('change', event => {
    const setting = event.target.closest('[data-site-setting]');
    if (setting) {
      const key = setting.dataset.siteSetting;
      if (!['compact', 'reduceMotion'].includes(key)) return;
      const saved = preferences(); saved[key] = setting.checked;
      if (!savePreferences(saved)) setting.checked = !setting.checked;
      else { renderStamp = signature(); showToast('Appearance saved on this device'); }
    }
    if (event.target.matches('[data-site-sort]')) { exploreSort = event.target.value; refresh(); }
  });
  return {refresh, route, decorateTrack, decorateSearch, refreshHome: renderDashboard,
    refreshLibrary: renderLibraryExtras, syncNavigation: () => selectNav(location.hash)};
})();
window.MusicSite = MusicSite;
document.querySelector('#appShell')?.classList.add('site-ready');
MusicSite.refresh();
if (!MusicSite.route(location.hash) && location.hash.startsWith('#track/')) {
  try { MusicSite.decorateTrack(getTrack(decodeURIComponent(location.hash.slice(7)))); }
  catch { /* The normal app router handles malformed or missing track links. */ }
}
