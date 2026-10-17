import fs from 'node:fs';
import * as core from '@strudel/core';
import * as mini from '@strudel/mini';
import * as tonal from '@strudel/tonal';
import {transpiler} from '@strudel/transpiler';
const input=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
await core.evalScope(core,mini,tonal);
const r=core.repl({getTime:()=>0,transpiler,defaultOutput:()=>{}});
let result;
try {
  transpiler(input.code); // real Strudel parser/transpiler, including mini notation
  const p=await r.evaluate(input.code,false);
  if(r.state.evalError) throw r.state.evalError;
  if(!p?.queryArc) throw Error('Evaluation did not return a pattern');
  const windows=input.windows||Array.from({length:16},(_,i)=>({start:i,end:i+1}));
  const events=windows.map(w=>({start:w.start,end:w.end,events:p.queryArc(w.start,w.end).map(h=>({begin:Number(h.part.begin),end:Number(h.part.end),value:h.value}))}));
  result={status:events.some(w=>w.events.length)?'PASSED':'FAILED',reason:events.some(w=>w.events.length)?'Real Strudel transpilation, REPL evaluation, and queryArc; audio is a separate check':'No events in requested windows',empty_windows:events.filter(w=>!w.events.length).map(w=>({start:w.start,end:w.end})),windows:events,cps:r.scheduler.cps};
} catch(e) {result={status:'FAILED',reason:e.message,stack:e.stack};}
fs.writeFileSync(process.argv[3],JSON.stringify(result,null,2));
r.stop();
process.exit(result.status==='FAILED'?1:0);
