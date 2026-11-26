import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
async function environment(failingPath){
 const handlers={},data=new Map();let offline=false;
 const key=url=>new URL(typeof url==='string'?url:(url.href||url.url),'https://englishcode.test').href;
 const caches={async open(name){if(!data.has(name))data.set(name,new Map());const map=data.get(name);return {async match(url){return map.get(key(url))?.clone();},async put(url,response){map.set(key(url),response.clone());},async addAll(urls){for(const url of urls)map.set(key(url),new Response('shell'));}};},async keys(){return [...data.keys()];},async delete(name){return data.delete(name);}};
 const self={location:{origin:'https://englishcode.test'},clients:{async claim(){}},async skipWaiting(){},addEventListener(name,handler){handlers[name]=handler;}};
 const context=vm.createContext({self,caches,Response,URL,Set,Promise,fetch:async url=>{if(offline)throw new Error('Offline');const pathname=new URL(url,'https://englishcode.test').pathname;if(pathname===failingPath)return new Response('missing',{status:404});return new Response(pathname);}});
 const source=(await readFile(new URL('../sw.js',import.meta.url),'utf8')).replace('__BUILD_ID__','test').replace('__SHELL_ASSETS__','[]');vm.runInContext(source,context);
 const shell=await caches.open('englishcode-shell-test');await shell.put('/catalog/offline.json',new Response(JSON.stringify({mission:{version:'v1',assets:['/mission/index.html','/mission/game.js']}})));await shell.put('/index.html',new Response('gallery'));
 return {data,handlers,caches,setOffline(){offline=true;},async message(type,id){const messages=[];let pending;handlers.message({data:{type,id},ports:[{postMessage(message){messages.push(message);}}],waitUntil(promise){pending=promise;}});await pending;return messages.at(-1);},async request(pathname,mode='navigate',headers=new Headers()){let pending;handlers.fetch({request:{url:'https://englishcode.test'+pathname,method:'GET',mode,headers},respondWith(promise){pending=promise;}});return pending;}};
}
test('a downloaded game launches with a query string while fully offline',async()=>{const env=await environment();assert.equal((await env.message('DOWNLOAD','mission')).result,true);env.setOffline();const game=await env.request('/mission/index.html?ecGame=mission');assert.equal(game.status,200);assert.equal(await game.text(),'/mission/index.html');const shell=await env.request('/');assert.equal(await shell.text(),'gallery');});
test('a failed download never appears as installed and leaves no partial game cache',async()=>{const env=await environment('/mission/game.js');assert.match((await env.message('DOWNLOAD','mission')).error,/Could not download/);assert.equal((await env.message('LIST')).result.length,0);assert.equal((await env.caches.keys()).some(key=>key.startsWith('englishcode-game-')),false);});
test('only declared games may be downloaded, and removal makes their assets unavailable offline',async()=>{const env=await environment();assert.match((await env.message('DOWNLOAD','unknown')).error,/not available/);await env.message('DOWNLOAD','mission');assert.equal((await env.message('LIST')).result[0],'mission');await env.message('REMOVE','mission');env.setOffline();assert.equal((await env.request('/mission/index.html')).status,503);});

test('concurrent downloads of one game acquire a single lock', async () => {
 const env = await environment();
 const results = await Promise.all([env.message('DOWNLOAD', 'mission'), env.message('DOWNLOAD', 'mission')]);
 assert.equal(results.filter(message => message.result === true).length, 1);
 assert.equal(results.filter(message => message.error?.includes('already downloading')).length, 1);
});


test('downloaded media serves byte ranges from cache after the network goes away',async()=>{
 const env=await environment();
 await env.message('DOWNLOAD','mission');
 env.setOffline();
 const range=async value=>env.request('/mission/game.js','same-origin',new Headers({Range:value}));
 const partial=await range('bytes=2-5');
 assert.equal(partial.status,206);
 assert.equal(partial.headers.get('Content-Range'),'bytes 2-5/16');
 assert.equal(await partial.text(),'issi');
 assert.equal(await (await range('bytes=-3')).text(),'.js');
 assert.equal((await range('bytes=20-')).status,416);
});
