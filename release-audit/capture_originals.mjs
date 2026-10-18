// Complete real-time application renders. These are measurements, never listening approvals.
import fs from 'node:fs';
import path from 'node:path';
import {createServer} from 'node:http';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';

const root=path.resolve(process.argv[2]);
const out=path.resolve(process.argv[3]||'release-audit/private/originals-v1');
fs.mkdirSync(out,{recursive:true});
const catalog=JSON.parse(fs.readFileSync(path.join(root,'tracks/catalog.json')));
const report={created_at:new Date().toISOString(),kind:'complete actual application WebAudio captures',human_listening:false,tracks:[]};
const server=createServer((req,res)=>{
  const file=path.resolve(root,'.'+new URL(req.url,'http://local').pathname.replace(/\/$/,'/index.html'));
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  try{res.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.json':'application/json','.css':'text/css','.svg':'image/svg+xml'})[path.extname(file)]||'text/plain');res.end(fs.readFileSync(file));}
  catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true,executablePath:process.platform==='win32'?'C:/Program Files/Google/Chrome/Application/chrome.exe':undefined,args:['--mute-audio']});

async function capture(track){
  const fd=fs.openSync(path.join(out,track.id+'.f32'),'wx');
  const context=await browser.newContext();
  const page=await context.newPage();
  const row={id:track.id,duration_seconds:track.durationSeconds,peak:0,clipped_samples:0,nonfinite_samples:0,samples:0,errors:[]};
  row.score_sha256=createHash('sha256').update(fs.readFileSync(path.join(root,'tracks',track.codeUrl))).digest('hex');
  try{
    await page.exposeFunction('recordChunk',(data,peak,clipped,invalid)=>{
      const bytes=Buffer.from(data,'base64');fs.writeSync(fd,bytes);row.samples+=bytes.length/4;
      row.peak=Math.max(row.peak,peak);row.clipped_samples+=clipped;row.nonfinite_samples+=invalid;
    });
    await page.addInitScript(()=>{
      const connect=AudioNode.prototype.connect;
      AudioNode.prototype.connect=function(dest,...args){
        const result=connect.call(this,dest,...args);
        if(this.context instanceof AudioContext&&dest===this.context.destination&&!window.recordTap){
          window.recordTap=true;
          const tap=this.context.createScriptProcessor(4096,2,2);
          tap.onaudioprocess=event=>{
            const left=event.inputBuffer.getChannelData(0),right=event.inputBuffer.getChannelData(1),samples=new Float32Array(left.length*2);
            let peak=0,clipped=0,invalid=0;
            for(let i=0;i<left.length;i++)for(let c=0;c<2;c++){
              const value=c?right[i]:left[i];samples[i*2+c]=value;
              peak=Math.max(peak,Math.abs(value));clipped+=+(Math.abs(value)>=1);invalid+=+!Number.isFinite(value);
            }
            let text='';for(const byte of new Uint8Array(samples.buffer))text+=String.fromCharCode(byte);
            window.recordChunk(btoa(text),peak,clipped,invalid);
          };
          connect.call(this,tap);connect.call(tap,dest);
        }
        return result;
      };
    });
    page.on('pageerror',e=>row.errors.push(e.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/#track/${track.id}`,{waitUntil:'networkidle'});
    await page.waitForFunction(()=>tracks[0]?.rights);
    await page.locator('.detail-play').click();
    await page.waitForFunction(()=>state.playing&&!state.loading,null,{timeout:60000});
    Object.assign(row,await page.evaluate(async()=>{
      const repl=await ensureEngine(),events=repl.scheduler.pattern.queryArc(0,200);
      return {sample_rate:getAudioContext().sampleRate,event_count:events.length,
        last_event_cycle:Math.max(...events.map(h=>+h.whole.end)),
        event_count_after_end:repl.scheduler.pattern.queryArc(128,256).length,
        source_origin:repl.scheduler.seconds_at_cps_change+repl.scheduler.latency,
        voices:[...new Set(events.map(h=>h.value.s))]};
    }));
    console.log('Capturing complete track',track.id,track.durationSeconds);
    for(let remaining=track.durationSeconds+2;remaining>0;remaining-=25){
      await page.waitForTimeout(Math.min(remaining,25)*1000);
      console.log(track.id,Math.round(Math.min(track.durationSeconds+2,track.durationSeconds+2-remaining+25))+'s');
    }
    row.transport=await page.evaluate(()=>({playing:state.playing,paused:state.paused,loading:state.loading,context:getAudioContext().state}));
    row.status=row.peak>0&&!row.clipped_samples&&!row.nonfinite_samples&&!row.errors.length&&!row.transport.playing&&row.transport.context==='suspended'&&!row.event_count_after_end?'PASSED':'FAILED';
  }catch(error){row.status='FAILED';row.errors.push(error.stack);}
  finally{await context.close();fs.closeSync(fd);report.tracks.push(row);console.log(JSON.stringify(row));}
}
try{for(let i=0;i<catalog.length;i+=2)await Promise.all(catalog.slice(i,i+2).map(capture));}
finally{
  await browser.close();await new Promise(resolve=>server.close(resolve));
  report.status=report.tracks.length===catalog.length&&report.tracks.every(t=>t.status==='PASSED')?'PASSED':'FAILED';
  fs.writeFileSync(process.argv[4]||'release-audit/reports/original-full-captures.json',JSON.stringify(report,null,2)+'\n');
}
process.exitCode=report.status==='PASSED'?0:1;
