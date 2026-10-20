/* Device-local workspace, versioned backup format, and merge-only imports. */
'use strict';
const WorkspaceStorage = (() => {
  const KEY = 'strudelify-workspace-v1';
  const KEYS = ['strudelify-liked','strudelify-custom','strudelify-recent','strudelify-playlists-v1',
    'strudelify-shuffle','strudelify-repeat','strudelify-studio-drafts-v1','strudelify-track-versions-v1'];
  const defaults = { 'strudelify-liked':[], 'strudelify-custom':[], 'strudelify-recent':[],
    'strudelify-playlists-v1':[], 'strudelify-shuffle':false, 'strudelify-repeat':'off',
    'strudelify-studio-drafts-v1':[], 'strudelify-track-versions-v1':{} };
  const clone = value => JSON.parse(JSON.stringify(value));
  function snapshot() {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved?.format!=='strudelify-workspace' || saved.version!==1 || !saved.data || typeof saved.data!=='object')
        throw new Error('Your saved workspace could not be read. Existing data has been preserved.');
      return {...saved, data:{...clone(defaults),...saved.data}};
    }
    const data=clone(defaults);
    for (const key of KEYS) {
      try { const value=JSON.parse(localStorage.getItem(key)); if(value!=null)data[key]=value; }
      catch { /* Keep the original legacy value untouched. */ }
    }
    return {format:'strudelify-workspace',version:1,revision:0,data};
  }
  function read(key, fallback) { try { return snapshot().data[key] ?? fallback; } catch { return fallback; } }
  function update(changes) {
    if (Object.keys(changes).some(key=>!KEYS.includes(key))) throw new Error('Unknown workspace field.');
    const current=snapshot();
    const next={format:'strudelify-workspace',version:1,revision:current.revision+1,
      updatedAt:new Date().toISOString(),data:{...current.data,...clone(changes)}};
    // One write commits the complete change, including track + history + draft cleanup.
    // Legacy keys stay intact for recovery; failed/quota-denied writes do not modify them.
    localStorage.setItem(KEY,JSON.stringify(next));
    return next;
  }
  const write=(key,value)=>update({[key]:value});
  function backup() { return {format:'strudelify-library',version:1,exportedAt:new Date().toISOString(),data:clone(snapshot().data)}; }
  function validateBackup(value) {
    const fail=message=>{throw new Error(message);};
    const array=(value,max,label)=>{if(!Array.isArray(value)||value.length>max)fail(`Invalid ${label}.`);return value;};
    const id=value=>{if(typeof value!=='string'||!/^[a-zA-Z0-9_-]{1,160}$/.test(value)||['__proto__','prototype','constructor'].includes(value))fail('Invalid item identifier.');return value;};
    const text=(value,max,label)=>{if(typeof value!=='string'||value.length>max)fail(`Invalid ${label}.`);return value;};
    const code=value=>text(value,300000,'pattern source');
    const object=value=>value && typeof value==='object' && !Array.isArray(value);
    const unique=(items,label)=>{if(new Set(items.map(x=>x.id)).size!==items.length)fail(`Duplicate ${label} identifiers.`);return items;};
    if(value?.format!=='strudelify-library'||value.version!==1||!object(value.data))fail('Choose a Strudelify library backup (version 1).');
    const d=value.data;
    if(Object.keys(d).some(key=>!KEYS.includes(key)))fail('Backup contains an unsupported workspace field.');
    const clean=clone(defaults);
    clean['strudelify-custom']=unique(array(d['strudelify-custom']??[],300,'tracks').map(t=>{
      if(!object(t))fail('Invalid track.');
      if(!text(t.title,100,'track name').trim() || !code(t.code).trim())fail('A saved track needs a name and pattern.');
      const duration=Number(t.code.match(/const (?:endSeconds|sourceDuration)\s*=\s*([\d.]+)/)?.[1]);
      return {id:id(t.id),title:t.title,artist:text(t.artist||'You',100,'artist'),
        code:code(t.code),created:true,cover:false,mood:'Your pattern',loop:'∞ loop',palette:5,
        ...(duration>0?{durationSeconds:duration}:{}),
        ...(typeof t.forkedFrom==='string'?{forkedFrom:id(t.forkedFrom)}:{})};
    }),'track');
    for(const key of ['strudelify-liked','strudelify-recent'])clean[key]=[...new Set(array(d[key]??[],2000,'track references').map(id))];
    clean['strudelify-playlists-v1']=unique(array(d['strudelify-playlists-v1']??[],300,'playlists').map(p=>{
      if(!object(p))fail('Invalid playlist.');
      return {id:id(p.id),name:text(p.name,100,'playlist name'),description:text(p.description||'',500,'description'),
        entries:unique(array(p.entries,2000,'playlist entries').map(e=>({id:id(e.id),trackId:id(e.trackId)})),'entry')};
    }),'playlist');
    clean['strudelify-studio-drafts-v1']=unique(array(d['strudelify-studio-drafts-v1']??[],100,'drafts').map(t=>({
      id:id(t.id),targetId:t.targetId?id(t.targetId):null,sourceId:t.sourceId?id(t.sourceId):null,
      title:text(t.title||'',100,'draft name'),artist:text(t.artist||'',100,'draft artist'),code:code(t.code),
      modifiedAt:typeof t.modifiedAt==='string'?t.modifiedAt:''})), 'draft');
    const versions=d['strudelify-track-versions-v1']??{};
    if(!object(versions)||Object.keys(versions).length>300)fail('Invalid version history.');
    for(const [key,rows] of Object.entries(versions))clean['strudelify-track-versions-v1'][id(key)]=unique(array(rows,20,'versions').map(v=>({
      id:id(v.id),title:text(v.title,100,'version name'),artist:text(v.artist||'You',100,'version artist'),
      code:code(v.code),createdAt:text(v.createdAt||'',100,'version date')})),'version');
    if(d['strudelify-shuffle']!=null&&typeof d['strudelify-shuffle']!=='boolean')fail('Invalid shuffle preference.');
    clean['strudelify-shuffle']=d['strudelify-shuffle']===true;
    if(d['strudelify-repeat']!=null&&!['off','context','one'].includes(d['strudelify-repeat']))fail('Invalid repeat preference.');
    clean['strudelify-repeat']=d['strudelify-repeat']||'off';
    return clean;
  }
  function planImport(value, reserved=[]) {
    const incoming=validateBackup(value), current=snapshot().data, next=clone(current);
    const mapping=new Map(), addedTracks=[], used=new Set([...reserved,...current['strudelify-custom'].map(t=>t.id)]);
    const stats={tracks:0,playlists:0,likes:0,drafts:0,versions:0,versionsSkipped:0,conflicts:0};
    const sameTrack=(a,b)=>a.title===b.title && a.artist===b.artist && a.code===b.code;
    for(const track of incoming['strudelify-custom']){
      const existing=next['strudelify-custom'].find(t=>t.id===track.id);
      // Re-importing a conflict copy should reuse the copy created by the earlier merge.
      const duplicate=existing && sameTrack(existing,track)?existing:
        used.has(track.id)?next['strudelify-custom'].find(t=>sameTrack(t,track)):null;
      if(duplicate){mapping.set(track.id,duplicate.id);continue;}
      let target=track.id;
      if(used.has(target)){target='custom-'+crypto.randomUUID();stats.conflicts++;}
      used.add(target);mapping.set(track.id,target);
      const copy={...track,id:target};next['strudelify-custom'].push(copy);addedTracks.push(copy);stats.tracks++;
    }
    const remap=id=>mapping.get(id)||id;
    for(const track of addedTracks)if(track.forkedFrom)track.forkedFrom=remap(track.forkedFrom);
    for(const p of incoming['strudelify-playlists-v1']){
      const entries=p.entries.map(e=>({...e,trackId:remap(e.trackId)}));
      const existing=next['strudelify-playlists-v1'].find(x=>x.id===p.id);
      const samePlaylist=x=>x.name===p.name && x.description===p.description && JSON.stringify(x.entries)===JSON.stringify(entries);
      if(existing && next['strudelify-playlists-v1'].some(samePlaylist))continue;
      const id=existing?crypto.randomUUID():p.id;
      if(existing)stats.conflicts++;
      next['strudelify-playlists-v1'].push({...p,id,entries});stats.playlists++;
    }
    const likes=new Set(current['strudelify-liked']);
    for(const id of incoming['strudelify-liked']){const mapped=remap(id);if(!likes.has(mapped)){likes.add(mapped);stats.likes++;}}
    next['strudelify-liked']=[...likes];
    // Preserve this device's playback preferences and recents. Import never starts audio.
    for(const draft of incoming['strudelify-studio-drafts-v1']){
      const targetId=draft.targetId?remap(draft.targetId):null;
      const sourceId=draft.sourceId?remap(draft.sourceId):null;
      const same=next['strudelify-studio-drafts-v1'].find(x=>x.id===draft.id);
      const sameDraft=x=>x.code===draft.code && x.title===draft.title && x.artist===draft.artist && x.targetId===targetId && x.sourceId===sourceId;
      if(same && next['strudelify-studio-drafts-v1'].some(sameDraft))continue;
      if(same)stats.conflicts++;
      next['strudelify-studio-drafts-v1'].push({...draft,id:same?'draft-'+crypto.randomUUID():draft.id,targetId,sourceId});stats.drafts++;
    }
    const histories=next['strudelify-track-versions-v1'];
    for(const [id,versions] of Object.entries(incoming['strudelify-track-versions-v1'])){
      const target=remap(id), list=histories[target]||[];
      // Existing local history stays intact; imported history fills remaining slots.
      const candidates=[];
      for(const version of versions){
        const sameVersion=x=>x.title===version.title && x.artist===version.artist && x.code===version.code && x.createdAt===version.createdAt;
        if(!list.some(sameVersion) && !candidates.some(sameVersion))candidates.push(version);
      }
      const available=Math.max(0,20-list.length);
      stats.versionsSkipped+=Math.max(0,candidates.length-available);
      // If there is room for only part of a backup, keep its newest versions.
      for(const version of available?candidates.slice(-available):[]){
        const conflict=list.some(x=>x.id===version.id);
        if(conflict)stats.conflicts++;
        list.push({...version,id:conflict?crypto.randomUUID():version.id});stats.versions++;
      }
      histories[target]=list;
    }
    if(next['strudelify-custom'].length>300 || next['strudelify-playlists-v1'].length>300 || next['strudelify-studio-drafts-v1'].length>100 ||
      next['strudelify-liked'].length>2000 || Object.keys(histories).length>300)
      throw new Error('This merge exceeds the library limits. Your existing library has not changed.');
    return {data:next,stats};
  }
  // Recompute the merge when applying so another tab's newer local data is preserved.
  function importBackup(value,reserved){const plan=planImport(value,reserved);update(plan.data);return plan.stats;}
  return {read,write,update,backup,planImport,importBackup};
})();
