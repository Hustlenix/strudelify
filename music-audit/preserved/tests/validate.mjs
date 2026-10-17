import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
import crypto from 'node:crypto';
const audit=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const root=path.resolve(process.env.ALBUM_ROOT||path.join(audit,'..'));
const report=path.join(audit,'reports');fs.mkdirSync(report,{recursive:true});fs.mkdirSync(path.join(audit,'cache'),{recursive:true});
const manifest=JSON.parse(fs.readFileSync(path.join(audit,'album-manifest.json'),'utf8'));
const normalize=x=>x.toLowerCase().replace(/[^a-z0-9]/g,'');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(d=>{
 const p=path.join(dir,d.name);if(d.isSymbolicLink()||['.git','node_modules','.venv','strudel-album-audit'].includes(d.name))return [];
 return d.isDirectory()?walk(p):[p];});}
const files=walk(root),scripts=files.filter(f=>f.endsWith('.strudel')&&path.basename(f)!=='song.strudel');
function worker(input,name){const p=path.join(audit,'cache',name+'.input.json'),out=path.join(report,name+'.runtime.json');fs.writeFileSync(p,JSON.stringify(input));if(fs.existsSync(out))fs.unlinkSync(out);
 const proc=spawnSync(process.execPath,['--loader',pathToFileURL(path.join(audit,'tests/esm-loader.mjs')).href,path.join(audit,'tests/runtime-worker.mjs'),p,out],{timeout:30000,encoding:'utf8',cwd:audit});
 return fs.existsSync(out)&&!proc.error?JSON.parse(fs.readFileSync(out,'utf8')):{status:'FAILED',reason:proc.error?.message||proc.stderr,stdout:proc.stdout};}
const selftests=[['valid','setcps(0.5); $: note("c3 e3 g3").s("sine")','PASSED',/Real Strudel/],['invalid-method','note("c3").auditInventedMethod()','FAILED',/auditInventedMethod.*not a function/],['invalid-syntax','note(','FAILED',/Unexpected token/],['silence','silence','FAILED',/No events/]].map(([name,code,expected,reason])=>{const r=worker({code},'selftest-'+name);return {name,expected,actual:r.status,status:r.status===expected&&reason.test(r.reason)?'PASSED':'FAILED',reason:r.reason};});
const tracks=manifest.map(t=>{
 const matches=scripts.filter(f=>normalize(path.basename(f)).includes(normalize(t.title))||path.basename(f)===t.expected_filename);
 if(matches.length!==1)return {...t,status:'PENDING',reason:matches.length?'Multiple candidate scripts; set expected_filename to disambiguate':'Implementation not found in album root',matches};
 const file=matches[0],code=fs.readFileSync(file,'utf8'),timelinePath=path.join(audit,'timelines',t.id+'.json');
 const measured=fs.existsSync(timelinePath)?JSON.parse(fs.readFileSync(timelinePath,'utf8')):null;
 const baseline=worker({code},t.id);const cps=Number(baseline.cps)||measured?.tempo?.beat_tracker_bpm/240||.5;
 const windows=measured?.timeline?.map(s=>({start:s.start_s*cps,end:Math.min(s.end_s,s.start_s+8)*cps}));
 const runtime=windows?.length?worker({code,windows},t.id):baseline;
 return {...t,file,sha256:crypto.createHash('sha256').update(code).digest('hex'),filename_check:path.basename(file)===t.expected_filename?'PASSED':'WARNING: suggested name differs; album identity matched by title',status:runtime.status,runtime,audio_playback:'PENDING: run npm run browser',fidelity_score:null,fidelity_status:'PENDING: reference comparison and listening required'};
});
const html=files.filter(f=>f.endsWith('.html')).map(file=>{
 const code=fs.readFileSync(file,'utf8');const refs=[...code.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/gi)].map(x=>x[1]).filter(x=>/\.mp3(?:[?#]|$)/i.test(x));
 const links=refs.map(src=>{let p;try{p=/^file:/i.test(src)?fileURLToPath(src):/^[a-z]:[\\/]/i.test(src)?src:path.resolve(path.dirname(file),decodeURIComponent(src.split(/[?#]/)[0]));}catch{}
 return {src,resolved:p,status:/^https?:/i.test(src)?'PENDING':p&&fs.existsSync(p)?'PASSED':'FAILED',http_serving:/^file:|^[a-z]:/i.test(src)?'FAILED: local-drive URLs need an explicit HTTP media route':'PENDING: browser fetch/decode required'};});
 const shares=[...code.matchAll(/https:\/\/strudel\.cc\/[^\s"'<>]*/g)].map(x=>x[0]);
 return {file,static_mp3_links:links,share_links:shares.map(url=>{try{const u=new URL(url);const content=u.hash?Buffer.from(decodeURIComponent(u.hash.slice(1)),'base64').toString('utf8'):null;return {url,status:content?'DECODED':'PENDING: database share link',decoded_source:content};}catch(e){return {url,status:'FAILED',reason:e.message};}}),status:!refs.length?'PENDING: dynamic source assignments require browser inspection':links.some(x=>x.status==='FAILED')?'FAILED':'PENDING: HTTP browser audio verification'};
});
for(const page of html)for(const link of page.share_links)if(link.decoded_source){link.runtime=worker({code:link.decoded_source},'share-'+crypto.createHash('sha256').update(link.decoded_source).digest('hex').slice(0,12));link.status=link.runtime.status;link.matches_discovered_script=scripts.some(f=>fs.readFileSync(f,'utf8').trim()===link.decoded_source.trim());}
const result={generated_at:new Date().toISOString(),album_root:root,runtime_version:'1.2.6',selftests,discovered_scripts:scripts,tracks,html,html_status:html.length?'SEE_RESULTS':'PENDING: no HTML implementation found',order_status:'PENDING: album UI order must match manifest; discovery order is not album order',limitations:['Node event generation is not audio playback.','No subjective fidelity score is assigned without listening.','Missing implementation is PENDING, never PASSED.','Each file is read into a snapshot before evaluation; runtime report records source SHA256.']};
fs.writeFileSync(path.join(report,'validation.json'),JSON.stringify(result,null,2));
fs.writeFileSync(path.join(report,'VALIDATION.md'),'# Independent validation\n\nGenerated '+result.generated_at+'\n\nRuntime: real Strudel 1.2.6 transpiler, REPL and event queries.\n\n| Track | State | Reason |\n|---|---|---|\n'+tracks.map(t=>`| ${t.artist} — ${t.title} | ${t.status} | ${t.reason||t.runtime?.reason||''} |`).join('\n')+'\n\nSelftests: '+JSON.stringify(selftests)+'\n\nHTML: '+result.html_status+'\n\n'+result.limitations.join('\n\n'));
console.log(JSON.stringify({selftests,tracks:tracks.map(t=>({track:t.title,status:t.status})),html:result.html_status},null,2));
process.exitCode=selftests.some(x=>x.status==='FAILED')||tracks.some(x=>x.status==='FAILED')?1:tracks.some(x=>x.status==='PENDING')||!html.length?2:0;
