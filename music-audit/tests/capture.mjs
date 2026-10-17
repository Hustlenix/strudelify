import {createServer} from 'vite';
import {chromium} from 'playwright';
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const audit=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const mode=process.argv[2]||'final',seconds=Number(process.argv[3]||24),selection=process.argv.slice(4);
const validation=JSON.parse(fs.readFileSync(path.join(audit,'reports',mode+'-validation.json'),'utf8'));
const output={generated_at:new Date().toISOString(),mode,seconds,runtime_version:'@strudel/web 1.2.6',tracks:[],controls:[],scope:'Isolated music harness only; no player/application files touched.'};
const server=await createServer({configFile:false,root:audit,cacheDir:path.join(audit,'cache/vite'),server:{host:'127.0.0.1',port:0,watch:null,hmr:false},optimizeDeps:{include:['@strudel/web']}});
let browser;
try{
 await server.listen();const port=server.httpServer.address().port;
 browser=await chromium.launch({executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true,args:['--autoplay-policy=no-user-gesture-required','--mute-audio']});
 const cases=[{id:'control-sine',code:'setcps(.5); $: note("c4").s("sine").gain(.2)',expected:'PASSED',preload:false},
 {id:'control-missing-bank',code:'s("bd").bank("audit_missing_bank")',expected:'FAILED',preload:false},
 {id:'control-silence',code:'silence',expected:'FAILED',preload:false},
 ...validation.tracks.filter(t=>!selection.length||selection.includes(t.id.slice(0,2))).map(t=>({id:t.id,code:fs.readFileSync(t.file,'utf8'),sha256:t.sha256,preload:true}))];
 for(const c of cases){
  const page=await browser.newPage(),errors=[],failedRequests=[];let result;
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  page.on('requestfailed',r=>failedRequests.push({url:r.url(),reason:r.failure()?.errorText}));page.on('response',r=>{if(r.status()>=400)failedRequests.push({url:r.url(),status:r.status()});});
  try{
   await page.goto(`http://127.0.0.1:${port}/tests/capture.html`);await page.waitForFunction(()=>window.auditReady,{},{timeout:90000});
   result=await page.evaluate(({code,seconds,preload})=>window.runAudit(code,seconds,preload),{...c,seconds:c.expected?3:seconds});
   if(result.pcm){const dest=path.join(audit,'artifacts',mode+'-'+c.id+'.f32');fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,Buffer.from(result.pcm,'base64'));delete result.pcm;result.pcm_file=path.relative(audit,dest).replaceAll('\\','/');}
  }catch(e){result={status:'FAILED',reason:e.message};}
  result.console_errors=errors;result.failed_requests=failedRequests;
  result.capture_duration_s=result.frames&&result.sample_rate?result.frames/result.sample_rate:0;
  result.capture_duration_valid=!result.frames||result.capture_duration_s>=(c.expected?3:seconds)*.95;
  if(errors.length||failedRequests.length||result.scheduler_error||!result.capture_duration_valid)result.status='FAILED';
  if(c.expected)output.controls.push({id:c.id,status:result.status===c.expected?'PASSED':'FAILED',expected:c.expected,observed:result});else output.tracks.push({id:c.id,sha256:c.sha256,...result});
  await page.close();console.log(c.id,result.status,result.reason||'',result.peak??'');
  fs.writeFileSync(path.join(audit,'reports',mode+'-browser.json'),JSON.stringify(output,null,2));
 }
}catch(e){output.infrastructure={status:'FAILED',reason:e.stack};}
finally{await browser?.close();await server.close();fs.writeFileSync(path.join(audit,'reports',mode+'-browser.json'),JSON.stringify(output,null,2));}
process.exitCode=output.infrastructure||output.controls.some(x=>x.status!=='PASSED')||output.tracks.some(x=>x.status!=='PASSED')?1:0;
