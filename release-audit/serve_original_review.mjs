// Local original-only review: explicit routes; no access to commercial reference material.
import fs from 'node:fs';
import path from 'node:path';
import {createServer} from 'node:http';
const artifact=path.resolve(process.argv[2]);
const manifest=JSON.parse(fs.readFileSync(path.join(artifact,'release.json')));
const names=new Set(manifest.files.map(row=>row.path).concat('release.json'));
const ids=['afterglow','greenline','paper-moon','soft-focus','tiny-hours','wide-awake'];
const root=path.resolve('release-audit/private/originals-v2');
const server=createServer((req,res)=>{
  const url=new URL(req.url,'http://local').pathname;
  let file;
  if(url==='/')file=path.resolve('release-audit/originals-review.html');
  if(url.startsWith('/player/')){
    const name=decodeURIComponent(url.slice(8)||'index.html');
    if(names.has(name))file=path.join(artifact,name);
  }
  if(ids.some(id=>url==='/audio/'+id+'.wav'))file=path.join(root,url.split('/').at(-1));
  if(!file){res.writeHead(404).end();return;}
  try{
    const stat=fs.statSync(file),type=({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.wav':'audio/wav','.zip':'application/zip'})[path.extname(file)]||'text/plain';
    res.setHeader('Content-Type',type);res.setHeader('Accept-Ranges','bytes');res.setHeader('Cache-Control','no-store');
    const range=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
    if(range){const start=+range[1],end=range[2]?Math.min(+range[2],stat.size-1):stat.size-1;
      if(start>end||start>=stat.size){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`}).end();return;}
      res.writeHead(206,{'Content-Range':`bytes ${start}-${end}/${stat.size}`,'Content-Length':end-start+1});fs.createReadStream(file,{start,end}).pipe(res);
    }else{res.setHeader('Content-Length',stat.size);fs.createReadStream(file).pipe(res);}
  }catch{res.writeHead(404).end();}
});
server.listen(4190,'127.0.0.1',()=>console.log('Full named original review: http://127.0.0.1:4190/ ; player: http://127.0.0.1:4190/player/ ; commit '+manifest.commit));
