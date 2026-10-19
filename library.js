/* Local collection and transport state. Audio remains owned by app.js. */
'use strict';
const MusicLibrary = (() => {
  const uid = () => crypto.randomUUID();
  const entry = trackId => ({id: uid(), trackId});
  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  }
  function playlists() {
    const saved = read('strudelify-playlists-v1', []);
    const ids = new Set();
    return (Array.isArray(saved) ? saved : []).filter(p => {
      if (!p || typeof p.id !== 'string' || ids.has(p.id) || typeof p.name !== 'string' || !Array.isArray(p.entries)) return false;
      ids.add(p.id); return true;
    }).map(p => {
      const seen = new Set();
      return {id:p.id, name:p.name.slice(0,100), description:String(p.description || '').slice(0,500),
        entries:p.entries.filter(e => {
          if (!e || typeof e.id !== 'string' || typeof e.trackId !== 'string' || seen.has(e.id)) return false;
          seen.add(e.id); return true;
        }).map(e => ({id:e.id, trackId:e.trackId}))};
    });
  }
  class Queue {
    constructor() {
      this.manual = []; this.context = []; this.order = []; this.current = null;
      this.cursor = -1; this.history = []; this.label = 'All patterns';
      this.shuffle = read('strudelify-shuffle', false) === true;
      const repeat = read('strudelify-repeat', 'off');
      this.repeat = ['off','context','one'].includes(repeat) ? repeat : 'off';
    }
    shuffled(entries) {
      const result = [...entries];
      for (let i=result.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [result[i],result[j]]=[result[j],result[i]]; }
      return result;
    }
    start(entries, selectedId, label) {
      this.context = entries.map(e=>({...e})); this.label = label;
      const selected = this.context.find(e=>e.id===selectedId) || this.context[0];
      this.order = this.shuffle && selected ? [selected,...this.shuffled(this.context.filter(e=>e.id!==selected.id))] : [...this.context];
      this.cursor = this.order.findIndex(e=>e.id===selected?.id);
      return this.select(selected);
    }
    select(item) {
      if (!item) return null;
      if (this.current) this.history.push({...this.current});
      this.history = this.history.slice(-100);
      this.current = {...item}; return this.current;
    }
    next(automatic=false) {
      if (automatic && this.repeat==='one' && this.current) return this.current;
      if (this.manual.length) return this.select(this.manual.shift());
      if (this.cursor+1<this.order.length) return this.select(this.order[++this.cursor]);
      if (this.repeat==='context' && this.order.length) {
        this.order = this.shuffle ? this.shuffled(this.context) : [...this.context];
        this.cursor = 0; return this.select(this.order[0]);
      }
      return null;
    }
    previous() {
      const previous = this.history.pop();
      if (!previous) return null;
      // Put the interrupted occurrence back next; context position stays intact.
      if (this.current) this.manual.unshift({...this.current});
      this.current = previous; return previous;
    }
    setShuffle(enabled) {
      this.shuffle = enabled;
      const played = this.order.slice(0,this.cursor+1);
      const pending = this.order.slice(this.cursor+1);
      const remaining = enabled ? this.shuffled(pending) : this.context.filter(e=>pending.some(p=>p.id===e.id));
      this.order = [...played,...remaining];
    }
    upcoming() { return this.order.slice(this.cursor+1); }
  }
  return {uid,entry,playlists,Queue};
})();
