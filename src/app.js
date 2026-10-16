import { TRACKS, TRACK_BY_ID } from './tracks.js';

const $ = (id) => document.getElementById(id);
const STORAGE_KEY = 'strudelify-library-v1';
const DEFAULT_STATE = { liked: [], playlists: [], overrides: {} };
function readState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!parsed || typeof parsed !== 'object') return structuredClone(DEFAULT_STATE);
    return {
      liked: Array.isArray(parsed.liked) ? parsed.liked.filter(id => TRACK_BY_ID[id]) : [],
      playlists: Array.isArray(parsed.playlists) ? parsed.playlists.filter(p => p && typeof p.name === 'string' && Array.isArray(p.ids)).slice(0, 60) : [],
      overrides: parsed.overrides && typeof parsed.overrides === 'object' ? parsed.overrides : {}
    };
  } catch { return structuredClone(DEFAULT_STATE); }
}
const state = readState();
const session = {
  current: TRACKS[0].id, view: 'home', query: '',
  playing: false, shuffle: false, repeat: false,
  queue: [], source: 'strudel', runtimeReady: false, initialized: false,
  files: new Map(), toastTimer: 0
};
const audio = $('local-player');
audio.volume = .65;
const currentTrack = () => TRACK_BY_ID[session.current];
const codeFor = (track) => typeof state.overrides[track.id] === 'string' ? state.overrides[track.id] : track.code;
const colorFor = (track) => `linear-gradient(135deg,${track.colors[0]},${track.colors[1]})`;
const text = (tag, klass, value) => {
  const e = document.createElement(tag);
  if (klass) e.className = klass;
  e.textContent = value;
  return e;
};
const button = (label, title, onClick, klass = 'small-action') => {
  const el = text('button', klass, label);
  el.type = 'button';
  el.title = title;
  el.setAttribute('aria-label', title);
  el.addEventListener('click', onClick);
  return el;
};
const persist = () => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch { toast('Browser storage is unavailable. Changes last until this tab closes.'); }
};
function toast(message) {
  const node = $('toast');
  node.textContent = message;
  node.classList.add('show');
  clearTimeout(session.toastTimer);
  session.toastTimer = setTimeout(() => node.classList.remove('show'), 3400);
}
function formatTime(seconds) {
  const s = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2,'0')}`;
}
function renderNavigation() {
  document.querySelectorAll('[data-view]').forEach(el => {
    const active = el.dataset.view === session.view;
    el.classList.toggle('active', active);
    if (active) el.setAttribute('aria-current', 'page');
    else el.removeAttribute('aria-current');
  });
  const nav = $('playlist-nav');
  nav.replaceChildren();
  if (!state.playlists.length) nav.append(text('p', 'subtle', 'No playlists yet'));
  state.playlists.forEach((p) => {
    const el = button('▤  ' + p.name, 'Open ' + p.name, () => {
      session.view = 'playlist:' + p.id;
      session.query = '';
      $('search').value = '';
      render();
    }, 'playlist-nav-item');
    el.classList.toggle('active', session.view === 'playlist:' + p.id);
    nav.append(el);
  });
}
const MIXES = [
  {title:'All eight',subtitle:'The original lineup', icon:'◉', colors:['#6c975e','#2e4835'],match:() => true},
  {title:'After hours',subtitle:'Slow & dreamy',icon:'☾',colors:['#826caa','#354769'],match:(t)=>['babydoll','sailor-song','lonely','i-thought-i-saw-your-face'].includes(t.id)},
  {title:'Beat lab',subtitle:'Rhythm-forward',icon:'↯',colors:['#bf8c6b','#753d3e'],match:(t)=>['without-me','normal-guy-2','cant-tell-me-nothing'].includes(t.id)},
  {title:'Soft focus',subtitle:'Easygoing sounds',icon:'✿',colors:['#bba476','#385e55'],match:(t)=>['love-me-not','babydoll','i-thought-i-saw-your-face'].includes(t.id)}
];
function renderCards() {
  const host = $('playlist-cards'); host.replaceChildren();
  MIXES.forEach((mix,i) => {
    const card = button('', 'Show ' + mix.title, () => {
      session.view = 'mix:' + i;
      session.query = '';
      $('search').value = '';
      render();
    }, 'mix-card');
    const art = text('span', 'mix-art', mix.icon);
    art.style.background = `linear-gradient(120deg,${mix.colors.join(',')})`;
    const name = text('span', 'mix-title', mix.title);
    name.append(text('small', 'mix-subtitle', mix.subtitle));
    card.append(art, name); host.append(card);
  });
}
function listForView() {
  let list = TRACKS;
  if (session.view === 'liked') list = list.filter(t => state.liked.includes(t.id));
  else if (session.view.startsWith('playlist:')) {
    const id = session.view.slice(9);
    const collection = state.playlists.find(p => p.id === id);
    list = list.filter(t => collection?.ids.includes(t.id));
  } else if (session.view.startsWith('mix:')) {
    const mix = MIXES[Number(session.view.slice(4))];
    if (mix) list = list.filter(mix.match);
  }
  const q = session.query.trim().toLowerCase();
  if (q) list = list.filter(t => [t.title,t.artist,t.genre,t.mood].some(x => x.toLowerCase().includes(q)));
  return list;
}
function renderTrackTable() {
  const tbody = $('tracks');
  tbody.replaceChildren();
  const filtered = listForView();
  $('no-results').classList.toggle('hidden', filtered.length > 0);
  filtered.forEach((track, index) => {
    const row = document.createElement('tr');
    row.classList.toggle('selected', track.id === session.current);
    const num = text('td','number-col',String(index+1).padStart(2,'0'));
    const titleCell = document.createElement('td');
    const box = document.createElement('div'); box.className = 'track-title';
    const art = text('span','track-art',track.emblem); art.style.background = colorFor(track);
    const labels = document.createElement('div'); labels.className = 'track-label';
    labels.append(
      button(track.title, 'Play ' + track.title, () => selectTrack(track.id, true), 'track-name'),
      text('span','track-artist',track.artist)
    );
    box.append(art,labels);titleCell.append(box);
    const genre = text('td','genre-col subtle',track.genre);
    const bpm = text('td','tempo-col subtle',String(track.bpm));
    const acts = document.createElement('td');acts.className = 'options-col';
    const buttons = document.createElement('div');buttons.className = 'table-actions';
    const liked = state.liked.includes(track.id);
    const like = button(liked?'♥':'♡', liked?'Unlike':'Like', () => toggleLiked(track.id));
    like.classList.toggle('chosen', liked);
    buttons.append(
      like,
      button('＋','Add ' + track.title + ' to playlist', () => openSaveDialog(track.id)),
      button('≡','Queue ' + track.title, () => enqueue(track.id)),
      button('⌘','Edit the code for ' + track.title, () => {selectTrack(track.id,false);toggleStudio(true);})
    );
    acts.append(buttons);
    row.append(num,titleCell,genre,bpm,acts);
    tbody.append(row);
  });
}
function renderViewHeading() {
  let kicker='YOUR STARTING POINT',title='Made for your ears',description='Eight instrumental studies. Your original reference files stay on your device.';
  if (session.view==='liked') { kicker='YOUR COLLECTION';title='Liked songs';description='Saved locally in this browser.'; }
  if (session.view==='library') { kicker='YOUR COLLECTION';title='Your library';description='Your playlists and eight starter tracks.'; }
  if (session.view==='search') { kicker='FIND YOUR SOUND';title='Search the music';description='Discover songs by artist, title, genre or mood.'; }
  if (session.view.startsWith('mix:')) { const m=MIXES[Number(session.view.slice(4))]; if(m){kicker='CURATED MIX';title=m.title;description=m.subtitle;} }
  if (session.view.startsWith('playlist:')) {const p=state.playlists.find(x=>x.id===session.view.slice(9));if(p){kicker='YOUR PLAYLIST';title=p.name;description=`${p.ids.length} saved tracks`;}}
  $('view-kicker').textContent = kicker; $('view-title').textContent = title; $('view-subtitle').textContent = description;
  $('hero').classList.toggle('hidden',session.view!=='home' || !!session.query);
}
function renderQueue() {
  const el=$('queue-items');el.replaceChildren();
  if(!session.queue.length){el.append(text('p','subtle','Nothing queued yet. Use ≡ beside a song to add it.'));return;}
  session.queue.forEach((id,i) => {
    const track=TRACK_BY_ID[id];
    if(!track)return;
    const row=document.createElement('div');row.className='queue-item';
    const start=button(track.title,'Play queued track',()=>{session.queue.splice(i,1);selectTrack(id,true);renderQueue();},'');
    start.append(text('small','',track.artist));
    row.append(start,button('✕','Remove from queue',()=>{session.queue.splice(i,1);renderQueue();},'icon-button'));
    el.append(row);
  });
}
function renderPlayer() {
  const t=currentTrack();
  $('current-title').textContent=t.title;
  $('current-artist').textContent=t.artist;
  $('current-cover').textContent=t.emblem;
  $('current-cover').style.background=colorFor(t);
  $('like-current').textContent=state.liked.includes(t.id)?'♥':'♡';
  $('like-current').classList.toggle('active',state.liked.includes(t.id));
  $('play').textContent=session.playing?'Ⅱ':'▶';
  $('play').setAttribute('aria-label',session.playing?'Pause':'Play');
  $('shuffle').classList.toggle('active',session.shuffle);
  $('shuffle').setAttribute('aria-pressed',String(session.shuffle));
  $('repeat').classList.toggle('active',session.repeat);
  $('repeat').setAttribute('aria-pressed',String(session.repeat));
  $('source-mode').value=session.source;
  $('volume').disabled=session.source!=='local';
  const local=session.source==='local';
  $('elapsed').textContent=local?formatTime(audio.currentTime):'LIVE';
  $('duration').textContent=local&&Number.isFinite(audio.duration)?formatTime(audio.duration):local?'–:––':'∞';
  $('progress-fill').style.width=local&&audio.duration?Math.min(100,audio.currentTime/audio.duration*100)+'%':'0%';
}
function renderStudio() {
  const t=currentTrack();
  $('studio-track').textContent=t.artist+' — '+t.title;
  $('studio-bpm').textContent=t.bpm+' BPM (working tempo)';
  $('code-editor').value=codeFor(t);
  updateStrudelLink();
}
function render() {
  renderNavigation(); renderCards(); renderViewHeading(); renderTrackTable(); renderPlayer(); renderQueue();
}
function toggleLiked(id) {
  const index=state.liked.indexOf(id);
  if(index>=0)state.liked.splice(index,1);else state.liked.push(id);
  persist();render();
}
function selectTrack(id, autoplay=false) {
  if(!TRACK_BY_ID[id])return;
  const wasPlaying=session.playing;
  stopAll();
  session.current=id;
  render();renderStudio();
  if(autoplay||wasPlaying)void startPlayback();
}
function nextId() {
  if(session.queue.length) return session.queue.shift();
  if(session.shuffle) {
    const options=TRACKS.filter(t=>t.id!==session.current);
    return options[Math.floor(Math.random()*options.length)].id;
  }
  const i=TRACKS.findIndex(t=>t.id===session.current);
  return TRACKS[(i+1)%TRACKS.length].id;
}
function skipNext(){const next=nextId();selectTrack(next,true);renderQueue();}
function previous(){
  if(session.source==='local'&&audio.currentTime>3){audio.currentTime=0;return;}
  const i=TRACKS.findIndex(t=>t.id===session.current);
  selectTrack(TRACKS[(i-1+TRACKS.length)%TRACKS.length].id,true);
}
function enqueue(id){session.queue.push(id);renderQueue();toast('Added to queue: '+TRACK_BY_ID[id].title);}
function stopAll() {
  audio.pause();
  try { if(typeof window.hush==='function')window.hush(); }catch(error){console.warn('Strudel stop issue',error);}
  session.playing=false;
  renderPlayer();
}
async function startPlayback() {
  const selected=session.current;
  if(session.source==='local'){
    const entry=session.files.get(selected);
    if(!entry){toast('Import the matching MP3 first. This site never uploads your files.');return;}
    if(audio.src!==entry.url)audio.src=entry.url;
    try{await audio.play();if(session.current===selected&&session.source==='local'){session.playing=true;renderPlayer();}}
    catch(error){console.error(error);toast('The browser could not play this local file.');}
    return;
  }
  if(!session.runtimeReady){toast('Strudel is still loading or unavailable. Check your connection.');return;}
  try{
    // Resume in the click handler before any async boundary (browser autoplay policy).
    if(typeof window.getAudioContext==='function')window.getAudioContext()?.resume();
    const evaluation=window.evaluate(codeFor(currentTrack()));
    await Promise.resolve(evaluation);
    if(session.current===selected&&session.source==='strudel'){session.playing=true;renderPlayer();}
  }catch(error){session.playing=false;renderPlayer();console.error(error);toast('Strudel could not evaluate this pattern. Open the code studio to inspect it.');}
}
function togglePlayback(){if(session.playing){stopAll();return;}void startPlayback();}
function toggleStudio(open=!$('studio').classList.contains('open')){
  $('studio').classList.toggle('open',open);
  if(open){renderStudio();$('code-editor').focus();}
}
function encodeStrudelCode(source) {
  const bytes=new TextEncoder().encode(source);
  let binary='';
  for(const byte of bytes)binary+=String.fromCharCode(byte);
  return encodeURIComponent(btoa(binary));
}
function updateStrudelLink() {
  $('open-strudel').href='https://strudel.cc/#'+encodeStrudelCode($('code-editor').value);
}
function saveCode() {
  const value=$('code-editor').value;
  if(value.length>160000){toast('Code is too large to store in the browser.');return;}
  state.overrides[session.current]=value;persist();updateStrudelLink();
}
async function copyCode() {
  const value=$('code-editor').value;
  try{await navigator.clipboard.writeText(value);toast('Strudel code copied.');}
  catch{ $('code-editor').select();const success=document.execCommand('copy');toast(success?'Code copied.':'Select the code and copy it manually.');}
}
function runtimeBootstrap() {
  if(typeof window.initStrudel==='function'&&!session.initialized){
    try{window.initStrudel();session.initialized=true;}
    catch(error){console.error('Strudel initialization error',error);}
  }
  let checks=0;
  const timer=setInterval(()=>{
    checks++;
    if(typeof window.evaluate==='function'&&typeof window.hush==='function'){
      session.runtimeReady=true;clearInterval(timer);
    }else if(checks>=50){clearInterval(timer);console.warn('Strudel did not become ready; local mode remains available.');}
  },200);
}
function importFiles(files) {
  let mapped=0;
  for(const file of files){
    if(!(file.type.startsWith('audio/')||/\.mp3$/i.test(file.name)))continue;
    const norm=s=>s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'');
    const basename=norm(file.name.replace(/\.[^.]+$/,''));
    const track=TRACKS.find(t=>basename.includes(norm(t.title))||basename.includes(norm(t.id)));
    if(!track)continue;
    const existing=session.files.get(track.id);
    if(existing)URL.revokeObjectURL(existing.url);
    session.files.set(track.id,{file,url:URL.createObjectURL(file)});
    mapped++;
  }
  if(mapped){session.source='local';stopAll();renderPlayer();toast(`Matched ${mapped} local recording${mapped===1?'':'s'}. Nothing was uploaded.`);}
  else toast('No filenames matched the eight starter tracks. Try the original playlist filenames.');
}
function openSaveDialog(id) {
  session.saveTarget=id;
  if(!state.playlists.length){$('playlist-dialog').showModal();return;}
  const list=$('save-list');list.replaceChildren();
  state.playlists.forEach(p=>{
    const selected=p.ids.includes(id);
    list.append(button(p.name+(selected?'  ✓':'  ＋'),(selected?'Remove from ':'Add to ')+p.name,()=>{
      const i=p.ids.indexOf(id);
      if(i>=0)p.ids.splice(i,1);else p.ids.push(id);
      persist();openSaveDialog(id);render();
    },''));
  });
  if (!$('save-dialog').open) $('save-dialog').showModal();
}
function createPlaylist(name) {
  const clean=name.trim().slice(0,48);
  if(!clean)return;
  if(state.playlists.length>=60){toast('Maximum of 60 playlists in this prototype.');return;}
  const id='p'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
  const p={id,name:clean,ids:[]};
  if(session.saveTarget)p.ids.push(session.saveTarget);
  state.playlists.push(p);session.saveTarget=null;
  session.view='playlist:'+p.id;
  persist();render();toast('Playlist created.');
}
document.querySelector('.brand').addEventListener('click',event=>{event.preventDefault();session.view='home';session.query='';$('search').value='';render();});
document.querySelectorAll('[data-view]').forEach(el=>el.addEventListener('click',()=>{
  session.view=el.dataset.view;session.query='';$('search').value='';render();
}));
$('search').addEventListener('input',event=>{
  session.query=event.target.value;
  if(session.query.trim()&&session.view==='home')session.view='search';
  render();
});
$('add-playlist').addEventListener('click',()=>{session.saveTarget=null;$('playlist-name').value='';$('playlist-dialog').showModal();});
$('playlist-dialog').addEventListener('close',()=>{if($('playlist-dialog').returnValue==='create')createPlaylist($('playlist-name').value);});
$('close-save').addEventListener('click',()=>$('save-dialog').close());
$('import-audio').addEventListener('click',()=>$('local-files').click());
$('local-files').addEventListener('change',event=>{importFiles(event.target.files);event.target.value='';});
$('open-queue').addEventListener('click',()=>$('queue-drawer').classList.remove('hidden'));
$('close-queue').addEventListener('click',()=>$('queue-drawer').classList.add('hidden'));
$('toggle-studio').addEventListener('click',()=>toggleStudio());
$('close-studio').addEventListener('click',()=>toggleStudio(false));
$('hero-play').addEventListener('click',()=>selectTrack(TRACKS[0].id,true));
$('hero-code').addEventListener('click',()=>toggleStudio(true));
$('like-current').addEventListener('click',()=>toggleLiked(session.current));
$('play').addEventListener('click',togglePlayback);
$('next').addEventListener('click',skipNext);
$('previous').addEventListener('click',previous);
$('shuffle').addEventListener('click',()=>{session.shuffle=!session.shuffle;renderPlayer();});
$('repeat').addEventListener('click',()=>{session.repeat=!session.repeat;renderPlayer();});
$('source-mode').addEventListener('change',event=>{stopAll();session.source=event.target.value;audio.removeAttribute('src');audio.load();renderPlayer();toast(session.source==='strudel'?'Code-generated playback selected.':'Local reference playback selected. Import your MP3s to begin.');});
$('volume').addEventListener('input',event=>{audio.volume=Number(event.target.value)/100;});
$('code-editor').addEventListener('input',saveCode);
$('run-code').addEventListener('click',()=>{stopAll();void startPlayback();});
$('copy-code').addEventListener('click',copyCode);
$('reset-code').addEventListener('click',()=>{delete state.overrides[session.current];persist();renderStudio();toast('Restored the original study.');});
audio.addEventListener('timeupdate',renderPlayer);
audio.addEventListener('loadedmetadata',renderPlayer);
audio.addEventListener('ended',()=>{session.playing=false;if(session.repeat)selectTrack(session.current,true);else skipNext();});
audio.addEventListener('error',()=>{if(session.source==='local')toast('Unable to read that local recording.');});
document.addEventListener('keydown',event=>{
  const editing=['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName);
  if(event.key==='Escape'){$('queue-drawer').classList.add('hidden');toggleStudio(false);}
  if(editing)return;
  if(event.key==='/'){event.preventDefault();$('search').focus();}
  if(event.code==='Space'){event.preventDefault();togglePlayback();}
});
window.addEventListener('beforeunload',()=>{for(const entry of session.files.values())URL.revokeObjectURL(entry.url);});
render();
renderStudio();
runtimeBootstrap();
