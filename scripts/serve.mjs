import http from 'node:http';
import path from 'node:path';
import { promises as fs, createReadStream } from 'node:fs';
import { spawnSync } from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
if(process.argv.includes('--build')||!process.argv.includes('--no-build')){const build=spawnSync(process.execPath,[path.join(root,'scripts/build.mjs')],{stdio:'inherit'});if(build.status!==0)process.exit(build.status||1);}
const directory=await fs.realpath(path.join(root,'dist'));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json','.webmanifest':'application/manifest+json','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.wav':'audio/wav','.mp3':'audio/mpeg','.webm':'video/webm','.mp4':'video/mp4','.ttf':'font/ttf','.otf':'font/otf','.ogg':'audio/ogg','.woff2':'font/woff2'};
const server=http.createServer(async(req,res)=>{try{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
 const url=new URL(req.url,'http://localhost');let pathname=decodeURIComponent(url.pathname);
 if(pathname.includes('\0')||pathname.split('/').some(part=>part.startsWith('.'))){res.writeHead(404);res.end();return;}
 let file=path.resolve(directory,'.'+pathname);if(!file.startsWith(directory+path.sep)&&file!==directory){res.writeHead(404);res.end();return;}
 let stat=await fs.stat(file);
 if(stat.isDirectory()){if(!pathname.endsWith('/')){res.writeHead(302,{Location:pathname+'/'+url.search});res.end();return;}file=path.join(file,'index.html');stat=await fs.stat(file);}
 const real=await fs.realpath(file);if(!real.startsWith(directory+path.sep)){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Content-Length':stat.size,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});if(req.method==='HEAD')res.end();else createReadStream(file).pipe(res);
 }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Not found');}});
const port=Number(process.env.PORT||4173);server.listen(port,'127.0.0.1',()=>console.log(`EnglishCode preview: http://127.0.0.1:${port}`));
