// Private actual Strudel capture; source MP3s never enter this browser harness.
import fs from 'node:fs';
import path from 'node:path';
import {createServer} from 'node:http';
import {chromium} from 'playwright';
const source = path.resolve(process.argv[2] || 'release-audit/experiments/01-babydoll-phrasing.strudel');
const seconds = Number(process.argv[3] || 101);
const output = path.resolve('release-audit/private/babydoll-phrasing.f32');
fs.mkdirSync(path.dirname(output), {recursive:true});
if (fs.existsSync(output)) throw Error('Preserve the earlier capture before a new attempt');
const fd = fs.openSync(output, 'wx');
const report = {source, seconds, actual_audio:true, samples:0, peak:0, clipped:0, errors:[]};
const html = `<!doctype html><button id="play">Capture private Strudel experiment</button><script src="https://unpkg.com/@strudel/web@1.2.6"></script><script>
window.ready=initStrudel({prebake:async()=>{const u='https://raw.githubusercontent.com/felixroos/dough-samples/main/tidal-drum-machines.json';const m=await(await fetch(u)).json();await samples(m,m._base||new URL('./',u).href)}});
document.querySelector('#play').onclick=async()=>{try{const repl=await ready;await initAudioOnFirstClick();const code=await(await fetch('/candidate.strudel')).text();await repl.evaluate(code,true);if(repl.state.evalError)throw repl.state.evalError;window.captureStarted=true;window.runtimeInfo={context:getAudioContext().state,sampleRate:getAudioContext().sampleRate,sourceOrigin:repl.scheduler.seconds_at_cps_change+repl.scheduler.latency,patternEvents:repl.scheduler.pattern.queryArc(0,36).length}}catch(error){window.captureError=error.stack||error.message}};
</script>`;
const server = createServer((req,res)=>{res.setHeader('Content-Type',req.url==='/candidate.strudel'?'text/plain':'text/html');res.end(req.url==='/candidate.strudel'?fs.readFileSync(source):html)});
let browser;
try {
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio']});
  const page=await browser.newPage();
  await page.exposeFunction('writeAudioChunk',(encoded,meta)=>{
    const buffer=Buffer.from(encoded,'base64');fs.writeSync(fd,buffer);
    report.samples+=buffer.length/4;report.peak=Math.max(report.peak,meta.peak);report.clipped+=meta.clipped;
    if(report.first_audio_chunk===undefined)report.first_audio_chunk=meta.time;
  });
  await page.addInitScript(()=>{
    const connect=AudioNode.prototype.connect;
    AudioNode.prototype.connect=function(destination,...args){
      const result=connect.call(this,destination,...args);
      if(this.context instanceof AudioContext&&destination===this.context.destination&&!window.hasCapture){
        window.hasCapture=true;const tap=this.context.createScriptProcessor(4096,2,2);
        tap.onaudioprocess=event=>{
          const left=event.inputBuffer.getChannelData(0),right=event.inputBuffer.getChannelData(1),mix=new Float32Array(left.length*2);
          let peak=0,clipped=0;for(let i=0;i<left.length;i++){mix[i*2]=left[i];mix[i*2+1]=right[i];peak=Math.max(peak,Math.abs(left[i]),Math.abs(right[i]));clipped+=Number(Math.abs(left[i])>=1)+Number(Math.abs(right[i])>=1)}
          const bytes=new Uint8Array(mix.buffer);let text='';for(let i=0;i<bytes.length;i++)text+=String.fromCharCode(bytes[i]);
          window.writeAudioChunk(btoa(text),{peak,clipped,time:event.playbackTime});
        };
        connect.call(this,tap);connect.call(tap,destination);
      }return result;
    };
  });
  page.on('pageerror',error=>report.errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/`,{waitUntil:'networkidle'});
  await page.locator('#play').click();
  await page.waitForFunction(()=>window.captureStarted||window.captureError,{timeout:60000});
  const info=await page.evaluate(()=>({error:window.captureError,...window.runtimeInfo}));
  if(info.error)throw Error(info.error);
  report.runtime=info;
  console.log('Real Strudel capture started',info);
  for(let remaining=seconds;remaining>0;remaining-=20){await page.waitForTimeout(Math.min(20,remaining)*1000);console.log('Captured',Math.min(seconds,seconds-remaining+20),'seconds');}
  await page.evaluate(async()=>{hush();await getAudioContext().suspend()});
  await page.waitForTimeout(300);
  report.status=report.peak>.00001&&!report.clipped&&!report.errors.length?'PASSED':'FAILED';
} catch(error) {report.status='FAILED';report.errors.push(error.stack)}
finally {
  await browser?.close();await new Promise(resolve=>server.close(resolve));fs.closeSync(fd);
  fs.writeFileSync('release-audit/reports/babydoll-phrasing-capture.json',JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report));
}
process.exitCode=report.status==='PASSED'?0:1;
