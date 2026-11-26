import { promises as fs } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(import.meta.dirname,'..');const {games}=JSON.parse(await fs.readFile(path.join(root,'catalog/games.json'),'utf8'));
assert.equal(new Set(games.map(g=>g.id)).size,games.length,'Duplicate game IDs');
for(const game of games){assert.match(game.id,/^[a-z0-9_-]+$/);assert.ok(game.title&&game.description);assert.ok(game.duration == null || (Number.isFinite(game.duration) && game.duration > 0), game.id+' duration must be positive minutes');if(game.durationLimit)assert.ok(game.duration,game.id+' time limit requires minutes');assert.ok(game.levels.length&&game.levels.every(l=>['A1','A2','B1','B2','C1','C2'].includes(l)),game.id+' has invalid CEFR levels');assert.ok(game.skills.length);assert.match(game.entry,/^\/[a-zA-Z0-9_/-]+\.html$/);await fs.access(path.join(root,game.preview));await fs.access(path.join(root,game.entry));if(game.customizable)assert.ok(game.adapter,game.id+' must have a content adapter');if(game.offline)assert.ok(game.offlineAssets?.length,game.id+' must have reviewed assets');}
console.log(`${games.length} catalogue entries validated. Gameplay verification remains separate.`);
