// Receipts record submitted claims; they do not prove who listened or approve publication.
export const TASK_NAMES=['First Play','Pause and Resume','Stop','Switch tracks','Search','View Code','Portrait and touch controls','Background and return','Device volume','Connectivity loss and retry'];
export function validateReview(data,manifest){
  if(data.kind!=='actual manually submitted original listening feedback'||data.publication_approval!==false||data.personally_performed!==true)
    throw Error('A manually declared review is required; this endpoint never approves publication.');
  if(data.build!==manifest.commit||data.dirty!==false)throw Error('Review names a different or uncommitted candidate. Reload the review page.');
  const allowed=new Map(manifest.files.filter(row=>row.path.startsWith('tracks/')&&row.path.endsWith('.strudel')).map(row=>[row.path.slice(7,-8),row.sha256]));
  if(!Array.isArray(data.tracks)||data.tracks.length!==allowed.size||new Set(data.tracks.map(row=>row.id)).size!==allowed.size)throw Error('Expected the six candidate track responses.');
  for(const row of data.tracks){
    if(allowed.get(row.id)!==row.score_sha256||!['unanswered','yes','needs-correction','unsure'].includes(row.decision)||typeof row.listened_complete!=='boolean'||typeof row.observations!=='string')throw Error('Invalid or stale track response.');
  }
  if(!['phone','laptop','desktop','emulated'].includes(data.device_type)||!['yes','no',''].includes(data.physical_device))throw Error('Select the device type.');
  if(!Array.isArray(data.tasks)||data.tasks.length!==TASK_NAMES.length||new Set(data.tasks.map(row=>row.name)).size!==TASK_NAMES.length||data.tasks.some(row=>!TASK_NAMES.includes(row.name)||!['passed','failed','not-tested'].includes(row.result)))throw Error('Invalid device-check responses.');
  return {recorded_claims:data,publication_approved:false,verification_basis:'Manually submitted listener declaration; not independent identity verification.'};
}
