// Agent-operated recording of the real public app. No playback mocks or replacement audio.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';

const output=path.resolve(process.argv[2] || 'release-audit/private/public-demo');
fs.mkdirSync(output,{recursive:true});
const raw=path.join(output,'raw'); fs.mkdirSync(raw,{recursive:true});
const browser=await chromium.launch({headless:true,
  executablePath:process.platform==='win32'?'C:/Program Files/Google/Chrome/Application/chrome.exe':undefined,
  args:['--mute-audio']});
const context=await browser.newContext({viewport:{width:1280,height:800},
  recordVideo:{dir:raw,size:{width:1280,height:800}}});
const chunks=[];
await context.exposeFunction('captureProofAudio',chunk=>chunks.push(chunk));
await context.addInitScript(()=>{
  const connect=AudioNode.prototype.connect;
  AudioNode.prototype.connect=function(destination,...args){
    const result=connect.call(this,destination,...args);
    if(this.context instanceof AudioContext && destination===this.context.destination && !this.__proofAudio){
      this.__proofAudio=true;
      const tap=this.context.createScriptProcessor(4096,2,2);
      tap.onaudioprocess=event=>{
        if(!window.proofRecording) return;
        const left=event.inputBuffer.getChannelData(0),right=event.inputBuffer.getChannelData(1);
        const data=new Float32Array(left.length*2);
        let peak=0;
        for(let i=0;i<left.length;i++){data[i*2]=left[i];data[i*2+1]=right[i];peak=Math.max(peak,Math.abs(left[i]),Math.abs(right[i]));}
        if(peak===0)return;
        let text=''; for(const byte of new Uint8Array(data.buffer)) text+=String.fromCharCode(byte);
        window.captureProofAudio({end_ms:Date.now(),sample_rate:this.context.sampleRate,data:btoa(text)});
      };
      connect.call(this,tap); connect.call(tap,destination);
    }
    return result;
  };
});
const page=await context.newPage();
const video=page.video();
const report={recorded_at:new Date().toISOString(),url:'https://hustlenix.github.io/strudelify/',
  capture:'Fresh isolated Chromium session; agent-operated real UI and tapped live WebAudio output.',
  human_listener:false,physical_phone:false,events:[],errors:[]};
page.on('pageerror',error=>report.errors.push(error.message));
let start;
const mark=(name,detail={})=>{report.events.push({seconds:(Date.now()-start)/1000,name,...detail}); console.log(name);};
const until=async seconds=>{await page.waitForTimeout(Math.max(0,start+seconds*1000-Date.now()));};
const playing=()=>page.waitForFunction(()=>state.playing&&!state.loading,null,{timeout:30000});
const hash=text=>createHash('sha256').update(text).digest('hex');
try {
  await page.goto(report.url+'#track/paper-moon',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>tracks[0]?.rights);
  report.release=await page.evaluate(async()=>await (await fetch('release.json',{cache:'no-cache'})).json());
  // Initialize before the recorded segment; the final video trims this real warm-up.
  await page.locator('.detail-play').click(); await playing();
  await page.locator('#stopButton').click();
  await page.waitForFunction(()=>!state.playing&&getAudioContext().state==='suspended');
  start=await page.evaluate(()=>{window.proofRecording=true;return Date.now();});
  mark('Play Paper Moon');
  await page.locator('.detail-play').click(); await playing();
  await until(5); mark('Switch to Soft Focus');
  await page.locator('#nextButton').click(); await playing();
  await page.waitForFunction(()=>state.current.id==='soft-focus');
  await until(8); mark('Pause'); await page.locator('#mainPlayButton').click();
  await page.waitForFunction(()=>state.paused);
  await until(10); mark('Resume'); await page.locator('#mainPlayButton').click(); await playing();
  await until(12); mark('Stop'); await page.locator('#stopButton').click();
  await page.waitForFunction(()=>!state.playing&&getAudioContext().state==='suspended');
  await until(13); mark('View actual Soft Focus source'); await page.locator('#codeButton').click();
  await page.waitForFunction(()=>document.querySelector('#detailCode')?.textContent.includes('setcps(68'));
  const source=await page.locator('#detailCode').textContent();
  const served=await (await page.request.get(report.url+'tracks/soft-focus.strudel')).text();
  if(source.replaceAll('\r\n','\n')!==served.replaceAll('\r\n','\n')) throw new Error('Shown source differs from served score');
  await page.screenshot({path:path.join(output,'desktop-source.png')});
  await until(18); mark('Open local composition editor'); await page.locator('#createHeaderButton').click();
  await page.locator('#editorTitle').fill('Soft Focus — tempo experiment');
  await page.locator('#editorCode').fill(source);
  await page.locator('#editorCode').press('Control+Home');
  await until(23);
  const modified=source.replace('setcps(68/60/4)','setcps(100/60/4)');
  if(modified===source) throw new Error('Tempo edit did not modify source');
  report.edit={operation:'Change only tempo, 68 to 100 BPM',original_sha256:hash(source),modified_sha256:hash(modified),saved_to_catalog:false};
  mark('Change tempo from 68 to 100 BPM');
  await page.locator('#editorCode').fill(modified);
  await page.locator('#editorCode').press('Control+Home');
  await until(26); mark('Preview the changed code live'); await page.locator('#editorPreviewButton').click(); await playing();
  await page.waitForFunction(()=>previewing&&state.current.id==='editor-preview');
  report.edit.actual_scheduler_cps=await page.evaluate(async()=>(await ensureEngine()).scheduler.cps);
  if(Math.abs(report.edit.actual_scheduler_cps-100/60/4)>.00001) throw new Error('Edited tempo did not reach the actual scheduler');
  await page.screenshot({path:path.join(output,'editor-live.png')});
  await until(34); mark('Close preview; its audio stops'); await page.locator('[data-close-editor]').click();
  await page.waitForFunction(()=>!state.playing&&!state.paused);
  if(await page.evaluate(()=>document.querySelector('#appShell').classList.contains('lyrics-open')))
    await page.locator('[aria-label="Close track notes"]').click();
  await until(35); mark('Responsive layout — browser emulation, not physical phone');
  await page.setViewportSize({width:390,height:800});
  await page.goto(report.url+'#track/paper-moon',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>!!document.querySelector('.detail-play'));
  // A navigation creates a fresh capture clock; keep the common wall-clock recording active.
  await page.evaluate(()=>{window.proofRecording=true;});
  await page.locator('.detail-play').click(); await playing();
  await page.screenshot({path:path.join(output,'mobile-player.png')});
  await until(42); mark('Mobile Stop'); await page.locator('#stopButton').click();
  await page.waitForFunction(()=>!state.playing&&getAudioContext().state==='suspended');
  await until(45); report.duration_seconds=(Date.now()-start)/1000;
  report.status=report.errors.length?'FAILED':'PASSED';
} catch(error) {report.status='FAILED';report.errors.push(error.stack);}
finally {
  report.ended_ms=Date.now();
  await page.close();
  report.raw_video=await video.path();
  await context.close(); await browser.close();
  const rate=chunks[0]?.sample_rate||48000;
  const audio=new Float32Array(Math.ceil((report.duration_seconds||45)*rate)*2);
  let peak=0,invalid=0;
  for(const chunk of chunks){
    if(chunk.sample_rate!==rate) throw new Error('Audio sample rate changed');
    const bytes=Buffer.from(chunk.data,'base64'); const data=new Float32Array(bytes.buffer,bytes.byteOffset,bytes.length/4);
    const first=Math.round((chunk.end_ms-data.length/2/rate*1000-start)/1000*rate);
    for(let i=0;i<data.length/2;i++){
      const sample=first+i; if(sample<0||sample>=audio.length/2)continue;
      for(let c=0;c<2;c++){const value=data[i*2+c];invalid+=+!Number.isFinite(value);audio[sample*2+c]+=value;peak=Math.max(peak,Math.abs(audio[sample*2+c]));}
    }
  }
  fs.writeFileSync(path.join(output,'live-audio.f32'),Buffer.from(audio.buffer));
  report.audio={sample_rate:rate,channels:2,peak,nonfinite_samples:invalid,source:'Actual browser synthesis output; wall-clock placement preserves pauses and stops.',synchronization:'Callback wall clock, approximate within one 4096-frame processing block plus browser callback latency.'};
  report.audio.segments=[];
  for(const [first,last,name] of [[1,4,'original'],[6,7.5,'switched'],[10.5,11.5,'resumed'],[27,33,'edited-preview'],[38,41,'mobile']]){
    let segmentPeak=0;
    for(let i=Math.floor(first*rate)*2;i<Math.min(audio.length,Math.floor(last*rate)*2);i++)segmentPeak=Math.max(segmentPeak,Math.abs(audio[i]));
    report.audio.segments.push({name,peak:segmentPeak});
    if(segmentPeak<.00001)report.status='FAILED';
  }
  if(peak===0||peak>=1||invalid)report.status='FAILED';
  fs.writeFileSync(path.join(output,'capture.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({status:report.status,duration:report.duration_seconds,peak,errors:report.errors}));
}
process.exitCode=report.status==='PASSED'?0:1;
