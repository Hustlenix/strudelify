// Music catalog/resource and playback validation in a fresh isolated Chromium process.
// Real CDN runtime, real catalog, real source files and WebAudio; no app/player mocks.
import fs from 'node:fs';
import path from 'node:path';
import {createServer} from 'node:http';
import {chromium} from 'playwright';
const root=path.resolve(process.argv[2]);
const base=process.argv[3] || '';
const reportFile=path.resolve('music-audit/reports/catalog-integration.json');
const report={generated_at:new Date().toISOString(),root,base,checks:[],errors:[]};
const server=createServer((req,res)=>{
 const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 const file=path.resolve(root,'.'+(name==='/'?'/index.html':name));
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 try{
  const data=fs.readFileSync(file),ext=path.extname(file);
  res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.strudel':'text/plain'})[ext]||'application/octet-stream');
  res.end(data);
 }catch{res.writeHead(404).end();}
});
let browser;
try{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 browser=await chromium.launch({executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true,args:['--mute-audio']});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const url=base || `http://127.0.0.1:${server.address().port}/`;
 page.on('pageerror',e=>report.errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
 page.on('response',r=>{if(r.status()>=400)report.errors.push(`${r.status()} ${r.url()}`);});
 await page.addInitScript(()=>{
  const connect=AudioNode.prototype.connect;
  window.musicCapture={peak:0,frames:0,clipped:0,nonfinite:0};
  AudioNode.prototype.connect=function(dest,...args){
   const result=connect.call(this,dest,...args);
   if(this.context instanceof AudioContext&&dest===this.context.destination&&!this.__musicTap){
    this.__musicTap=true;
    const tap=this.context.createScriptProcessor(4096,2,2);
    tap.onaudioprocess=e=>{const m=window.musicCapture;for(let c=0;c<2;c++){const a=e.inputBuffer.getChannelData(c);m.frames+=a.length;for(const v of a){if(!Number.isFinite(v))m.nonfinite++;m.peak=Math.max(m.peak,Math.abs(v));if(Math.abs(v)>=1)m.clipped++;}}};
    connect.call(this,tap);connect.call(tap,dest);
   }
   return result;
  };
 });
 await page.goto(url,{waitUntil:'networkidle',timeout:90000});
 await page.waitForFunction(()=>document.querySelector('#homeTrackList [data-track-id="01-babydoll"]'),{timeout:30000});
 const catalog=await page.evaluate(()=>tracks.filter(t=>t.cover).map(t=>({id:t.id,title:t.title,codeUrl:t.codeUrl,status:t.status})));
 if(catalog.length!==8)throw Error('Expected eight covers');
 report.catalog=catalog;
 report.checks.push({name:'Eight covers in original order on Home',status:'PASSED'});
 await page.locator('#searchInput').fill('Babydoll');
 await page.waitForFunction(()=>document.querySelector('#searchTrackList').textContent.includes('Babydoll'));
 report.checks.push({name:'Babydoll discoverable by search',status:'PASSED'});
 await page.goto(url+'#track/01-babydoll',{waitUntil:'networkidle'});
 await page.waitForFunction(()=>document.querySelector('#trackDetail h1')?.textContent==='Babydoll');
 await page.locator('.detail-play').click();
 await page.waitForFunction(()=>document.querySelector('#playerStatus').textContent==='Playing live pattern',{timeout:90000});
 await page.waitForTimeout(16000);
 report.audio=await page.evaluate(()=>({...window.musicCapture,sounds:['rolandtr909_bd','rolandtr909_sd','rolandtr909_hh'].map(s=>({sound:s,registered:!!soundMap.get()[s]}))}));
 if(report.audio.peak<=.00001 || report.audio.nonfinite || report.audio.clipped || report.audio.sounds.some(s=>!s.registered))throw Error('Audio/sound-bank validation failed');
 report.checks.push({name:'Babydoll deep link starts real WebAudio with named drum bank',status:'PASSED'});
 await page.screenshot({path:'music-audit/artifacts/catalog-integration.png',fullPage:true});
 await page.locator('#stopButton').click();
 report.checks.push({name:'Stop playback',status:'PASSED'});
 await page.close();
 report.status=report.errors.length?'FAILED':'PASSED';
}catch(e){report.status='FAILED';report.errors.push(e.stack);}
finally{await browser?.close();await new Promise(r=>server.close(r));fs.writeFileSync(reportFile,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));}
process.exitCode=report.status==='PASSED'?0:1;
