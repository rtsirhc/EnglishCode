import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
process.env.RAYON_NUM_THREADS ||= '2';
process.env.UV_THREADPOOL_SIZE ||= '2';
const { appGames, buildAppGames } = await import('./build-app-games.mjs');
const root=path.resolve(import.meta.dirname,'..'), out=path.join(root,'dist');
const catalog=JSON.parse(await fs.readFile(path.join(root,'catalog/games.json'),'utf8'));
const applications=await appGames(catalog);
const applicationFolders=new Set(applications.map(game=>game.folder));
const ignored=new Set(['node_modules','.git','.vercel','private','browser-control-reports','tests','test','src','server','scripts','dist','.agent']);
const extensions=new Set(['.html','.js','.mjs','.css','.json','.png','.jpg','.jpeg','.webp','.svg','.gif','.wav','.mp3','.ogg','.woff','.woff2','.ttf','.otf','.glb','.gltf','.bin','.ico']);
const forbidden=/^(?:server\.|test[._-]|build[._-]|client\.test\.|teacher[-_])|(?:guide|guia)[-_].*\.html$/i;
async function files(dir){const result=[];for(const entry of await fs.readdir(dir,{withFileTypes:true})){if(entry.name.startsWith('.')||ignored.has(entry.name))continue;const full=path.join(dir,entry.name);if(entry.isSymbolicLink())continue;if(entry.isDirectory())result.push(...await files(full));else if(extensions.has(path.extname(entry.name).toLowerCase())&&!forbidden.test(entry.name)&&!entry.name.includes('.test.')&&!['package.json','package-lock.json','vercel.json','eslint.config.js','vite.config.js','postcss.config.js','tailwind.config.js','sources.json'].includes(entry.name))result.push(full);}return result;}
async function copy(source,destination){await fs.mkdir(path.dirname(destination),{recursive:true});await fs.copyFile(source,destination);}
await fs.rm(out,{recursive:true,force:true});await fs.mkdir(out,{recursive:true});
for(const file of ['index.html','play.html','manifest.webmanifest'])await copy(path.join(root,file),path.join(out,file));
for(const folder of ['gallery','libs',...new Set(catalog.games.map(g=>g.entry.split('/')[1]))]){if(applicationFolders.has(folder)||folder==='faro-games')continue;for(const file of await files(path.join(root,folder)))await copy(file,path.join(out,path.relative(root,file)));}
// Faro imports keep production and authoring materials together in the source tree.
const faroAssets=new Set(catalog.games.filter(game=>game.entry.startsWith('/faro-games/'))
 .flatMap(game=>[game.entry,...(game.offlineAssets||[]),...(game.publicAssets||[])])
 .filter(asset=>asset.startsWith('/faro-games/')));
for(const asset of faroAssets){
 if(path.posix.normalize(asset)!==asset)throw new Error('Invalid Faro asset path: '+asset);
 const source=path.join(root,asset);
 if(!(await fs.lstat(source)).isFile())throw new Error('Expected a regular Faro asset: '+asset);
 await copy(source,path.join(out,asset));
}
// Grammar Rush loads signalling only when a teacher or student chooses an online room.
await copy(path.join(root,'node_modules/peerjs/dist/peerjs.min.js'),path.join(out,'grammar-rush/local/vendor/peerjs.min.js'));
await copy(path.join(root,'node_modules/peerjs/LICENSE'),path.join(out,'grammar-rush/local/vendor/peerjs-LICENSE.txt'));
await buildAppGames(applications,out);
await copy(path.join(root,'catalog/games.json'),path.join(out,'catalog/games.json'));
// Only proven games get an offline manifest. A populated catalogue is not proof.
const offline={};
for(const game of catalog.games.filter(g=>g.offline)){
 if(!game.offlineAssets?.length)throw new Error(`${game.id}: offline assets must be explicitly reviewed`);
 let assets=game.offlineAssets;
 if(game.offlineBundle){
  const folder=game.entry.split('/')[1];
  if(!applicationFolders.has(folder))throw new Error(game.id+' has no production bundle');
  const generated=await files(path.join(out,folder,'assets'));
  assets=[...new Set([...assets,...generated.map(file=>'/'+path.relative(out,file))])].sort();
 }
 const digest=crypto.createHash('sha256');for(const file of assets){const data=await fs.readFile(path.join(out,file));digest.update(file).update(data);}offline[game.id]={assets,version:digest.digest('hex').slice(0,16)};
}
await fs.writeFile(path.join(out,'catalog/offline.json'),JSON.stringify(offline));
const shell=['/','/index.html','/play.html','/manifest.webmanifest','/catalog/games.json','/catalog/offline.json',...(await files(path.join(out,'gallery'))).map(file=>'/'+path.relative(out,file))];
const hash=crypto.createHash('sha256');for(const file of shell.filter(file=>file!=='/'))hash.update(await fs.readFile(path.join(out,file)));
const worker=(await fs.readFile(path.join(root,'sw.js'),'utf8')).replace('__BUILD_ID__',hash.digest('hex').slice(0,16)).replace('__SHELL_ASSETS__',JSON.stringify(shell));
await fs.writeFile(path.join(out,'sw.js'),worker);
console.log(`Built gallery and public assets for ${catalog.games.length} games. ${Object.keys(offline).length} offline manifests.`);
console.log('Migration evidence: catalog/migration.json. A source copy does not verify gameplay.');
