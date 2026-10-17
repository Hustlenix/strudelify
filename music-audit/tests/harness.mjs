const original=AudioNode.prototype.connect;
const taps=[];
AudioNode.prototype.connect=function(dest,...args){
 const result=original.call(this,dest,...args);
 if(dest===this.context.destination&&!taps.some(t=>t.source===this)){
  const analyser=this.context.createAnalyser();analyser.fftSize=2048;
  const stream=this.context.createMediaStreamDestination();
  original.call(this,analyser);original.call(this,stream);
  taps.push({source:this,analyser,stream});
 }
 return result;
};
const web=await import('@strudel/web');
const {soundMap}=web;
const repl=await web.initStrudel();
window.runAudit=async(code,seconds=6,preload=false)=>{
 if(preload) await web.samples('https://raw.githubusercontent.com/tidalcycles/Dirt-Samples/master/strudel.json');
 web.hush();
 const p=await web.evaluate(code,false);
 if(repl.state.evalError) return {status:'FAILED',error:repl.state.evalError.message};
 const events=[];
 for(let c=0;c<256;c+=4)events.push(...p.queryArc(c,c+1).map(h=>h.value));
 const sounds=[...new Set(events.flatMap(e=>String(e.s||'').split(',')).filter(Boolean))];
 const unknown=sounds.filter(s=>!soundMap.get()[s.toLowerCase()]);
 await web.getAudioContext().resume();
 // Warm up the audio controller and lazy-loaded assets before starting capture.
 await web.evaluate(code,true);await new Promise(r=>setTimeout(r,1200));
 const tap=taps.at(-1);let recorder,chunks=[];
 if(tap){recorder=new MediaRecorder(tap.stream.stream);recorder.ondataavailable=e=>chunks.push(e.data);recorder.start();}
 let peak=0,sum=0,frames=0;
 const timer=setInterval(()=>{for(const t of taps){const data=new Float32Array(2048);t.analyser.getFloatTimeDomainData(data);for(const v of data){peak=Math.max(peak,Math.abs(v));sum+=v*v;frames++;}}},40);
 await new Promise(r=>setTimeout(r,seconds*1000));clearInterval(timer);
 let recording=null;
 if(recorder){await new Promise(r=>{recorder.onstop=r;recorder.stop();});const bytes=new Uint8Array(await new Blob(chunks).arrayBuffer());let binary='';for(const b of bytes)binary+=String.fromCharCode(b);recording=btoa(binary);}
 web.hush();
 return {status:!events.length||unknown.length||peak<1e-5?'FAILED':'PASSED',event_count:events.length,sounds,unknown_sounds:unknown,peak,rms:Math.sqrt(sum/(frames||1)),audio_context:web.getAudioContext().state,recording,coverage:'Six seconds of actual WebAudio output; event sampling through cycle 252. Full-track listening remains PENDING.'};
};
window.auditReady=true;
