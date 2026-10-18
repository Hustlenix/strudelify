// Synthetic schema tests only. No requests are posted to the live review endpoint.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {validateReview,TASK_NAMES} from './review_receipt.mjs';
const root=path.resolve(process.argv[2]);
const manifest=JSON.parse(fs.readFileSync(path.join(root,'release.json')));
const catalog=JSON.parse(fs.readFileSync(path.join(root,'tracks/catalog.json')));
const fixture={kind:'actual manually submitted original listening feedback',publication_approval:false,
  personally_performed:true,build:manifest.commit,dirty:false,device_type:'emulated',physical_device:'no',
  reviewer:'AUTOMATED SCHEMA FIXTURE; NOT HUMAN FEEDBACK',device:'AUTOMATED',usability:'AUTOMATED',
  tasks:TASK_NAMES.map(name=>({name,result:'not-tested'})),
  tracks:catalog.map(row=>({id:row.id,score_sha256:manifest.files.find(f=>f.path==='tracks/'+row.id+'.strudel').sha256,
    decision:'unanswered',listened_complete:false,observations:'AUTOMATED FIXTURE'}))};
assert.equal(validateReview(fixture,manifest).publication_approved,false);
for(const mutation of [
  row=>row.personally_performed=false,
  row=>row.publication_approval=true,
  row=>row.build='0'.repeat(40),
  row=>row.dirty=true,
  row=>row.tracks[0].score_sha256='0'.repeat(64),
  row=>row.tracks.pop(),
  row=>row.device_type='unsupported',
  row=>row.tasks[0].result='invented-result',
  row=>row.tasks[0].name='Unrecognized check'
]){const copy=structuredClone(fixture);mutation(copy);assert.throws(()=>validateReview(copy,manifest));}
const report={status:'PASSED',checks:10,human_review:false,endpoint_submissions:0,kind:'synthetic schema tests only'};
fs.writeFileSync('release-audit/reports/review-receipt-checks.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
