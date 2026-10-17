import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
import crypto from 'node:crypto';
const audit=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const root=path.join(audit,'..','tracks','covers');
const report=path.join(audit,'reports');fs.mkdirSync(report,{recursive:true});fs.mkdirSync(path.join(audit,'cache'),{recursive:true});
const manifest=JSON.parse(fs.readFileSync(path.join(audit,'preserved/album-manifest.json'),'utf8'));
function worker(input,name){
 const p=path.join(audit,'cache',name+'.input.json'),out=path.join(report,name+'.runtime.json');
 fs.writeFileSync(p,JSON.stringify(input));if(fs.existsSync(out))fs.unlinkSync(out);
 const proc=spawnSync(process.execPath,['--loader',pathToFileURL(path.join(audit,'tests/esm-loader.mjs')).href,path.join(audit,'tests/runtime-worker.mjs'),p,out],{timeout:60000,encoding:'utf8',cwd:audit});
 return fs.existsSync(out)&&!proc.error?JSON.parse(fs.readFileSync(out,'utf8')):{status:'FAILED',reason:proc.error?.message||proc.stderr};
}
const selftests=[['valid','setcps(.5); $: note("c3 e3 g3").s("sine")','PASSED'],['invalid-method','note("c3").auditInventedMethod()','FAILED'],['invalid-syntax','note(','FAILED'],['silence','silence','FAILED']].map(([name,code,expected])=>{const r=worker({code},'selftest-'+name);return {name,expected,actual:r.status,status:r.status===expected?'PASSED':'FAILED',reason:r.reason};});
const mode=process.argv.includes('--baseline')?'baseline':'final';
const tracks=manifest.map(t=>{
 const file=path.join(mode==='baseline'?path.join(audit,'baseline'):root,t.expected_filename),code=fs.readFileSync(file,'utf8');
 const end=JSON.parse(fs.readFileSync(path.join(audit,'preserved/timelines',t.id+'.json'),'utf8')).usable_segment.end_s;
 const bpm=Number(code.match(/setcps\(\s*([\d.]+)/)?.[1]);
 const windows=Array.from({length:Math.ceil(end*bpm/240)},(_,i)=>({start:i,end:i+1}));
 const runtime=worker({code,windows},mode+'-'+t.id);
 return {...t,file,sha256:crypto.createHash('sha256').update(code).digest('hex'),bpm,status:runtime.status,runtime_report:mode+'-'+t.id+'.runtime.json',event_count:runtime.windows?.reduce((n,w)=>n+w.events.length,0),reason:runtime.reason,empty_windows:runtime.empty_windows};
});
const result={generated_at:new Date().toISOString(),mode,runtime_version:'1.2.6',selftests,tracks,scope:'Music patterns only; every cycle over the usable reference duration. No application or player tested.'};
fs.writeFileSync(path.join(report,mode+'-validation.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify({...result,tracks:tracks.map(({id,status,bpm,event_count,empty_windows,reason})=>({id,status,bpm,event_count,empty_windows,reason}))},null,2));
process.exitCode=selftests.some(x=>x.status==='FAILED')||tracks.some(x=>x.status!=='PASSED')?1:0;
