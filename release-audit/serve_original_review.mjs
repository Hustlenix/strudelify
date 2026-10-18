// Local original-only review: explicit routes; no access to commercial reference material.
import fs from 'node:fs';
import path from 'node:path';
import {createServer} from 'node:http';
import {randomUUID} from 'node:crypto';
import {validateReview} from './review_receipt.mjs';
const artifact=path.resolve(process.argv[2]);
const manifest=JSON.parse(fs.readFileSync(path.join(artifact,'release.json')));
const names=new Set(manifest.files.map(row=>row.path).concat('release.json'));
const ids=['afterglow','greenline','paper-moon','soft-focus','tiny-hours','wide-awake'];
const root=path.resolve('release-audit/private/originals-v2');
const received=path.resolve('release-audit/private/received-original-reviews');
const server=createServer(async(req,res)=>{
  const url=new URL(req.url,'http://local').pathname;
  if(req.method==='POST'&&url==='/reviews'){
    res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');
    try{
      if(!req.headers['content-type']?.startsWith('application/json'))throw Error('JSON required');
      let body='';for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>24000)throw Error('Review is too large');}
      const result=validateReview(JSON.parse(body),manifest),receipt=randomUUID();
      fs.mkdirSync(received,{recursive:true});
      fs.writeFileSync(path.join(received,receipt+'.json'),JSON.stringify({...result,receipt,received_at:new Date().toISOString()},null,2)+'\n',{flag:'wx'});
      res.end(JSON.stringify({receipt}));
    }catch(error){res.writeHead(400).end(JSON.stringify({error:error.message}));}
    return;
  }
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405).end();return;}
  let file;
  if(url==='/')file=path.resolve('release-audit/originals-review.html');
  if(url.startsWith('/player/')){
    const name=decodeURIComponent(url.slice(8)||'index.html');
    if(names.has(name))file=path.join(artifact,name);
  }
  // Retain the WAV URL used by already open local review pages while new pages use MP3.
  if(ids.some(id=>url==='/audio/'+id+'.mp3'||url==='/audio/'+id+'.wav'))file=path.join(root,url.split('/').at(-1));
  if(!file){res.writeHead(404).end();return;}
  try{
    const stat=fs.statSync(file),type=({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.mp3':'audio/mpeg','.wav':'audio/wav','.zip':'application/zip'})[path.extname(file)]||'text/plain';
    res.setHeader('Content-Type',type);res.setHeader('Accept-Ranges','bytes');res.setHeader('Cache-Control','no-store');
    const range=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
    if(range){const start=+range[1],end=range[2]?Math.min(+range[2],stat.size-1):stat.size-1;
      if(start>end||start>=stat.size){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`}).end();return;}
      res.writeHead(206,{'Content-Range':`bytes ${start}-${end}/${stat.size}`,'Content-Length':end-start+1});fs.createReadStream(file,{start,end}).pipe(res);
    }else{res.setHeader('Content-Length',stat.size);fs.createReadStream(file).pipe(res);}
  }catch{res.writeHead(404).end();}
});
const port=Number(process.argv[3]||4190);
server.listen(port,'127.0.0.1',()=>console.log('Full named original review: http://127.0.0.1:'+port+'/ ; player: http://127.0.0.1:'+port+'/player/ ; commit '+manifest.commit));
