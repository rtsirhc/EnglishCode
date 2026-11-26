"""One-time/repeatable source import. Never copy classroom state or secrets."""
from pathlib import Path
import shutil, json
ROOT = Path(__file__).resolve().parents[1]
FARO = Path('/home/benjaminrm10/Documents/faro')
EXCLUDED = {'.git','.vercel','node_modules','private','browser-control-reports','tests','test','__pycache__','dist','.local-state.json','iniciar.sh'}
EXTENSIONS = {'.html','.js','.mjs','.cjs','.css','.json','.png','.jpg','.jpeg','.webp','.svg','.gif','.wav','.mp3','.ogg','.woff','.woff2','.glb','.gltf','.bin','.ico'}

def copy_public(source, target):
    for p in source.rglob('*'):
        relative = p.relative_to(source)
        if not p.is_file() or any(part in EXCLUDED or part.startswith('.') for part in relative.parts): continue
        if p.suffix.lower() not in EXTENSIONS or p.name.startswith(('test','server','build_','client.test')) or '.test.' in p.name: continue
        dest=target/relative
        dest.parent.mkdir(parents=True,exist_ok=True)
        shutil.copy2(p,dest)

sources=[]
for folder in sorted((FARO/'02_planeaciones').glob('*/recursos_locales')):
    target=ROOT/'faro-games'/folder.parent.name
    copy_public(folder,target)
    sources.append({'source':str(folder),'destination':str(target.relative_to(ROOT))})
for name in ['family-feud','farito']:
    source=FARO/name/'public'; target=ROOT/'faro-games'/name
    copy_public(source,target)
    sources.append({'source':str(source),'destination':str(target.relative_to(ROOT))})
source=Path('/home/benjaminrm10/repos/betting_game/grammar-auction')
target=ROOT/'grammar-rush'
copy_public(source,target)
# Teacher guides and old archives are not playable assets.
for p in target.glob('*guide.html'): p.unlink()
sources.append({'source':str(source),'destination':str(target.relative_to(ROOT))})
(ROOT/'catalog/local-sources.json').write_text(json.dumps(sources,indent=2)+'\n')
print('Imported',len(sources),'public source trees')
