// Music-only WebAudio resource validation and stereo floating-point PCM capture.
const connect=AudioNode.prototype.connect,taps=[];
AudioNode.prototype.connect=function(dest,...args){
 const result=connect.call(this,dest,...args);
 if(this.context instanceof AudioContext&&dest===this.context.destination&&!taps.some(t=>t.source===this)){
  const capture=this.context.createScriptProcessor(4096,2,2),tap={source:this,capture,chunks:[],enabled:false};
  capture.onaudioprocess=e=>{if(tap.enabled)tap.chunks.push([e.inputBuffer.getChannelData(0).slice(),e.inputBuffer.getChannelData(1).slice()]);};
  connect.call(this,capture);connect.call(capture,dest);taps.push(tap);
 }
 return result;
};
const web=await import('@strudel/web'),repl=await web.initStrudel();
window.runAudit=async(code,seconds=24,preload=true)=>{
 if(preload)await web.samples('https://raw.githubusercontent.com/felixroos/dough-samples/main/tidal-drum-machines.json');
 web.hush();const p=await web.evaluate(code,false);
 if(repl.state.evalError)throw repl.state.evalError;
 const events=p.queryArc(0,16).map(h=>h.value);
 const sounds=[...new Set(events.map(e=>(e.bank?e.bank+'_':'')+e.s).filter(x=>x&&!x.endsWith('undefined')))];
 const unknown=sounds.filter(s=>!web.soundMap.get()[s.toLowerCase()]);
 if(unknown.length)return {status:'FAILED',sounds,unknown_sounds:unknown,reason:'Fully qualified bank/sample absent from registry'};
 await web.getAudioContext().resume();
 const assets=sounds.map(s=>({sound:s,data:web.soundMap.get()[s.toLowerCase()]?.data}));
 await web.evaluate(code,true);await new Promise(r=>setTimeout(r,4000));web.hush();
 await new Promise(r=>setTimeout(r,1200));taps.forEach(t=>{t.chunks=[];t.enabled=true;});
 await web.evaluate(code,true);await new Promise(r=>setTimeout(r,seconds*1000));
 taps.forEach(t=>t.enabled=false);web.hush();
 const tap=taps.find(t=>t.chunks.length);if(!tap)return {status:'FAILED',reason:'No PCM tap'};
 const frames=tap.chunks.reduce((n,c)=>n+c[0].length,0),interleaved=new Float32Array(frames*2);
 let frame=0,peak=0,sum=0,over=0;
 for(const c of tap.chunks)for(let i=0;i<c[0].length;i++,frame++)for(let ch=0;ch<2;ch++){
  const v=c[ch][i];interleaved[frame*2+ch]=v;peak=Math.max(peak,Math.abs(v));sum+=v*v;if(Math.abs(v)>=1)over++;
 }
 const bytes=new Uint8Array(interleaved.buffer);let binary='';
 for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
 return {status:peak>1e-5&&!unknown.length?'PASSED':'FAILED',capture_context_type:tap.source.context.constructor.name,sounds,unknown_sounds:unknown,assets,peak,rms:Math.sqrt(sum/(frames*2)),samples_at_or_above_0dbfs:over,frames,sample_rate:web.getAudioContext().sampleRate,channels:2,pcm:btoa(binary),scheduler_error:repl.state.schedulerError?.message||null,coverage:seconds+' seconds of stereo floating-point WebAudio; no perceptual similarity claim'};
};
window.auditReady=true;
