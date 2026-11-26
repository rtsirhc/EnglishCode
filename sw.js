/* EnglishCode: explicit, complete per-game downloads. No background game caching. */
const BUILD = '__BUILD_ID__';
const SHELL = `englishcode-shell-${BUILD}`;
const GAME_PREFIX = 'englishcode-game-';
const SHELL_ASSETS = __SHELL_ASSETS__;
const locks = new Set();
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(SHELL);await cache.addAll(SHELL_ASSETS);await self.skipWaiting();})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const name of await caches.keys()){if(name.startsWith('englishcode-shell-')&&name!==SHELL)await caches.delete(name);if(name.startsWith('englishcode-pending-'))await caches.delete(name);}await self.clients.claim();})()));
async function manifest(){const cache=await caches.open(SHELL);const response=await cache.match('/catalog/offline.json');if(!response)throw new Error('Offline catalogue unavailable. Reconnect and reload the app.');return response.json();}
async function installed(){const entries=[];for(const name of await caches.keys()){if(!name.startsWith(GAME_PREFIX))continue;const cache=await caches.open(name);const marker=await cache.match('/__englishcode_complete__');if(marker)entries.push({name,...await marker.json()});}return entries;}
async function download(id,port){
 if(locks.has(id))throw new Error('This game is already downloading.');
 locks.add(id);let name,cache;
 try{
  const entry=(await manifest())[id];if(!entry?.assets?.length)throw new Error('This game is not available for offline download.');
  name=GAME_PREFIX+id+'-'+entry.version;
  const existing=await caches.open(name);if(await existing.match('/__englishcode_complete__'))return true;
  cache=existing;let completed=0;
  // Bounded parallelism avoids exhausting connections on audio-heavy games.
  const queue=[...entry.assets];let failed=false;
  async function run(){while(queue.length&&!failed){const path=queue.shift();const url=new URL(path,self.location.origin);if(url.origin!==self.location.origin)throw new Error('Offline assets must be hosted with the game.');const response=await fetch(url,{cache:'reload'});if(!response.ok||response.type==='opaque'||response.redirected)throw new Error(`Could not download ${path}. Reconnect and try again.`);await cache.put(url,response);completed++;port.postMessage({progress:Math.round(completed/entry.assets.length*100)});}}
  const results=await Promise.allSettled([run().catch(error=>{failed=true;throw error;}),run().catch(error=>{failed=true;throw error;}),run().catch(error=>{failed=true;throw error;})]);
  const failure=results.find(result=>result.status==='rejected');if(failure)throw failure.reason;
  await cache.put('/__englishcode_complete__',new Response(JSON.stringify({id,version:entry.version}),{headers:{'Content-Type':'application/json'}}));
  for(const old of await installed())if(old.id===id&&old.name!==name)await caches.delete(old.name);
  return true;
 }catch(error){if(cache)await caches.delete(name);throw new Error(error.name==='QuotaExceededError'?'Not enough storage. Remove a download and try again.':error.message);}finally{locks.delete(id);}
}
self.addEventListener('message',event=>{
 const port=event.ports[0];if(!port)return;
 event.waitUntil((async()=>{try{let result;const {type,id}=event.data||{};
  if(type==='DOWNLOAD')result=await download(id,port);
  else if(type==='LIST')result=[...new Set((await installed()).map(item=>item.id))];
  else if(type==='REMOVE'){if(locks.has(id))throw new Error('Wait for this download to finish before removing it.');for(const item of await installed())if(item.id===id)await caches.delete(item.name);result=true;}
  else throw new Error('Unknown offline operation.');port.postMessage({result});
 }catch(error){port.postMessage({error:error.message});}})());
});
async function withRange(request, response) {
 const range=request.headers?.get('range');
 if(!range)return response;
 const match=/^bytes=(\d*)-(\d*)$/i.exec(range);
 if(!match)return response;
 const blob=await response.blob(), size=blob.size;
 const [, first, last]=match;
 const start=first?Number(first):Math.max(0,size-Number(last));
 const end=first?(last?Math.min(size-1,Number(last)):size-1):size-1;
 if((!first&&!last)||start>=size||start>end)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${size}`}});
 return new Response(blob.slice(start,end+1),{status:206,headers:{
  'Content-Type':response.headers.get('Content-Type')||'application/octet-stream',
  'Content-Length':String(end-start+1),'Content-Range':`bytes ${start}-${end}/${size}`,'Accept-Ranges':'bytes'
 }});
}
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
 event.respondWith((async()=>{
  const pathname=url.pathname;const shell=await caches.open(SHELL);
  const shellAsset=await shell.match(pathname==='/'?'/index.html':pathname);
  if(shellAsset)return shellAsset;
  // Game-specific files use their completed download.
  for(const item of await installed()){const cache=await caches.open(item.name);const cached=await cache.match(pathname);if(cached)return withRange(event.request,cached);}
  try{const response=await fetch(event.request);return response;}catch(error){
   return new Response(event.request.mode==='navigate'?'This game has not been downloaded. Reconnect, open EnglishCode, and download an offline-ready game before class.':'Offline asset unavailable.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
  }
 })());
});
