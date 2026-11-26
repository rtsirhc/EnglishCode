import { promises as fs } from 'node:fs';
import path from 'node:path';
import { build } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';
import legacyTailwind from 'tailwindcss3';
import autoprefixer from 'autoprefixer';
const root=path.resolve(import.meta.dirname,'..');
export async function appGames(catalog){const result=[];for(const game of catalog.games){const folder=game.entry.split('/')[1];if(['vite-react','vite-tailwind','vite-static'].includes(game.build)){result.push({...game,folder,react:game.build==='vite-react'});continue;}try{const pkg=JSON.parse(await fs.readFile(path.join(root,folder,'package.json'),'utf8'));if(pkg.devDependencies?.vite)result.push({...game,folder,react:!!pkg.dependencies?.react});}catch{}}return result;}
export async function buildAppGames(games,out){
 for(const game of games){
  const directory=path.join(root,game.folder),legacy=game.id==='transformation-taboo';
  const plugins=game.react?[react()]:[];
  if(game.build==='vite-tailwind')plugins.push(tailwind());
  let css='';try{css=await fs.readFile(path.join(directory,'src/index.css'),'utf8');}catch{}
  if(css.includes('"tailwindcss"')||css.includes("'tailwindcss'"))plugins.push(tailwind());
  let postcss=[];
  if(legacy){const config=(await import(path.join(directory,'tailwind.config.js'))).default;config.content=[path.join(directory,'index.html'),path.join(directory,'src/**/*.{js,jsx,ts,tsx}')];postcss=[legacyTailwind(config),autoprefixer()];}
  await build({root:directory,configFile:false,publicDir:game.publicAssets ? false : undefined,base:`/${game.folder}/`,plugins,css:{postcss:{plugins:postcss}},build:{rollupOptions:game.pages?{input:game.pages.map(page=>path.join(directory,page))}:undefined,outDir:path.join(out,game.folder),emptyOutDir:true,reportCompressedSize:false,chunkSizeWarningLimit:2000},logLevel:'warn'});
  for (const file of game.publicAssets ?? []) {
   const destination = path.join(out, game.folder, file);
   await fs.mkdir(path.dirname(destination), { recursive: true });
   await fs.copyFile(path.join(directory, 'public', file), destination);
  }
  console.log(`Compiled ${game.id}`);
 }
}
