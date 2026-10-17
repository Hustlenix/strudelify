import {createServer} from 'vite';
import {chromium} from 'playwright';
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {spawnSync} from 'node:child_process';
const audit=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const results={generated_at:new Date().toISOString(),selftests:[],tracks:[],player:{status:'PENDING',reason:'PLAYER_URL not provided; no running album player assumed'}};
const server=await createServer({configFile:false,root:audit,cacheDir:path.join(audit,'cache/vite'),server:{host:'127.0.0.1',port:0,watch:{ignored:['**/cache/**','**/reports/**','**/.venv/**']}},optimizeDeps:{include:['@strudel/web','superdough']}});
let context;
try{
 await server.listen();const port=server.httpServer.address().port;
 const chrome=process.env.AUDIT_CHROME||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
 context=await chromium.launchPersistentContext(path.join(audit,'cache','browser-profile-'+Date.now()),{executablePath:chrome,headless:true,args:['--autoplay-policy=no-user-gesture-required']});
 const validation=JSON.parse(fs.readFileSync(path.join(audit,'reports/validation.json'),'utf8'));
 const cases=[{id:'control-sine',code:'setcps(.5); $: note("c3 e3 g3").s("sine").gain(.2)',expected:'PASSED'},
 {id:'control-silence',code:'silence',expected:'FAILED'},
 {id:'control-missing-sample',code:'s("audit_nonexistent_sample")',expected:'FAILED'},
 {id:'control-missing-resource',code:`await samples({audit_broken_resource:'http://127.0.0.1:${port}/missing.wav'}); s('audit_broken_resource')`,expected:'FAILED'},
 ...validation.tracks.filter(t=>t.file).map(t=>({id:t.id,code:fs.readFileSync(t.file,'utf8'),expected:null}))];
 for(const c of cases){
  const page=await context.newPage();const errors=[],network=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push({text:m.text(),location:m.location()});});
  page.on('requestfailed',r=>network.push({url:r.url(),error:r.failure()?.errorText}));page.on('response',r=>{if(r.status()>=400)network.push({url:r.url(),status:r.status()});});
  let r;
  try{await page.goto(`http://127.0.0.1:${port}/tests/harness.html`);await page.waitForFunction(()=>window.auditReady,{},{timeout:60000});r=await page.evaluate(c=>window.runAudit(c.code,6,!c.expected),c);
   if(r.recording){const file=path.join(audit,'reports',c.id+'.webm');fs.writeFileSync(file,Buffer.from(r.recording,'base64'));delete r.recording;r.capture_file=file;
    const m=spawnSync(path.join(audit,'.venv/Scripts/python.exe'),[path.join(audit,'tests/render_metrics.py'),file],{encoding:'utf8',timeout:30000});
    try{r.decoded_audio_metrics=JSON.parse(m.stdout);}catch{r.decoded_audio_metrics={status:'PENDING',reason:m.stderr};}}
  }catch(e){r={status:'FAILED',error:e.message};}
  r.console_errors=errors;r.failed_requests=network;if(errors.length||network.length)r.status='FAILED';
  if(c.expected)results.selftests.push({id:c.id,expected:c.expected,status:r.status===c.expected?'PASSED':'FAILED',observed:r});else results.tracks.push({id:c.id,...r});
  await page.close();console.log(c.id,r.status);
 }
 results.tracks.push(...validation.tracks.filter(t=>!t.file).map(t=>({id:t.id,status:'PENDING',reason:t.reason})));
 if(process.env.PLAYER_URL){
  const p=await context.newPage();const failures=[];p.on('requestfailed',r=>failures.push(r.url()));await p.goto(process.env.PLAYER_URL);
  const media=[];const nodes=p.locator('audio');
  for(let i=0;i<await nodes.count();i++){
   const a=nodes.nth(i);let state;
   try{await a.evaluate(async x=>{x.load();await x.play();});await p.waitForTimeout(1500);state=await a.evaluate(x=>{const v={src:x.currentSrc||x.src,readyState:x.readyState,currentTime:x.currentTime,error:x.error?.message||null};x.pause();return v;});state.status=state.currentTime>0&&state.readyState>=2&&!state.error?'PASSED':'FAILED';}
   catch(e){state={status:'FAILED',error:e.message};}media.push(state);
  }
  const manifest=JSON.parse(fs.readFileSync(path.join(audit,'album-manifest.json'),'utf8'));
  const norm=x=>String(x).toLowerCase().replace(/[^a-z0-9]/g,'');
  const order=media.length===8?media.map((m,i)=>({track:manifest[i].title,source:m.src,status:norm(decodeURIComponent(m.src||'')).includes(norm(manifest[i].id))?'PASSED':'PENDING: loaded audio path does not match its track id'})):[];
  const httpFailures=failures.filter(url=>!url.startsWith('file:'));
  results.player={status:media.some(x=>x.status==='FAILED')||httpFailures.length?'FAILED':media.length===8&&order.every(x=>x.status==='PASSED')?'PASSED':'PENDING: inspect dynamic track selection; expected eight independently mapped sources',media,order,failures:httpFailures,local_file_request_notes:failures.filter(url=>url.startsWith('file:'))};await p.close();
 }
}catch(e){results.infrastructure={status:'FAILED',error:e.stack};}
finally{await context?.close();await server.close();fs.writeFileSync(path.join(audit,'reports/browser.json'),JSON.stringify(results,null,2));}
console.log(JSON.stringify({selftests:results.selftests.map(x=>({id:x.id,status:x.status})),infrastructure:results.infrastructure,tracks:results.tracks.map(x=>({id:x.id,status:x.status}))},null,2));
process.exitCode=results.infrastructure||results.selftests.some(x=>x.status==='FAILED')||results.tracks.some(x=>x.status==='FAILED')||results.player.status==='FAILED'?1:results.tracks.some(x=>x.status==='PENDING')||results.player.status.startsWith('PENDING')?2:0;
