// Inventory only: findings require source review, not automatic deletion or publication claims.
import {promises as fs} from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const {games}=JSON.parse(await fs.readFile(path.join(root,'catalog/games.json'),'utf8'));
const skip=new Set(['node_modules','.git','.vercel','dist','libs','vendor','three','browser-control-reports','private']);
async function sources(dir){const result=[];for(const item of await fs.readdir(dir,{withFileTypes:true})){if(item.name.startsWith('.')||skip.has(item.name))continue;const full=path.join(dir,item.name);if(item.isDirectory())result.push(...await sources(full));else if(/\.(?:html|[cm]?js|jsx|ts|tsx)$/.test(item.name))result.push(full);}return result;}
const report=[];
for(const game of games){
 const directory=path.dirname(path.join(root,game.entry));const dependencies=new Map(),findings=[];
 for(const file of await sources(directory)){
  const text=await fs.readFile(file,'utf8');const relative=path.relative(root,file);
  for(const match of text.matchAll(/https?:\/\/[^\s'"<>`)]+/g)){try{const host=new URL(match[0]).host;dependencies.set(host,(dependencies.get(host)||0)+1);}catch{}}
  const checks={localBackend:/localhost|127\.0\.0\.1|(?:fetch|request)\(['"]\/api\//,socket:/socket\.io|socket\.emit\(|new WebSocket\(/,remotePersistence:/supabase\.co|createClient\(|firebase/,hardware:/navigator\.(?:serial|bluetooth|usb)|getGamepads\(/,schoolSpecific:/Instituto Faro|\b[123][°º]\b|(?:[56789](?:th|rd) Grade)|codigos-alumnos/,serviceWorker:/serviceWorker\.register/};
  const flags=Object.keys(checks).filter(key=>checks[key].test(text));if(flags.length)findings.push({file:relative,flags});
 }
 report.push({id:game.id,directory:path.relative(root,directory),externalHosts:Object.fromEntries(dependencies),review:findings});
}
await fs.writeFile(path.join(root,'catalog/source-audit.json'),JSON.stringify({note:'Static source inventory; not a security/privacy/gameplay certification. Matches can include dead code and optional features.',games:report},null,2)+'\n');
console.log(`Audited source references for ${report.length} catalogue entries. See catalog/source-audit.json.`);
