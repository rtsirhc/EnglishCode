import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MODELS,validatePack,examplePack,aiPrompt} from '../gallery/shared/content.js';
for(const model of MODELS)test(`${model} content survives import/export without changing gameplay data`,()=>{const pack=examplePack(model);assert.deepEqual(validatePack(JSON.stringify(pack),model),validatePack(pack,model));assert.match(aiPrompt(model),new RegExp('"model": "'+model+'"'));});
test('incorrect quiz answers cannot silently become unwinnable questions',()=>{const pack=examplePack('quiz');pack.items[0].answer='not an option';assert.throws(()=>validatePack(pack),/exactly match/);});
test('duplicate options and survey answers are rejected',()=>{const quiz=examplePack('quiz');quiz.items[0].options=['same','same'];assert.throws(()=>validatePack(quiz),/different/);const survey=examplePack('survey');survey.items[0].answers=[{text:'Board',points:50},{text:'board',points:50}];assert.throws(()=>validatePack(survey),/different/);});
test('malformed content reports a useful error and does not enter game adapters',()=>{for(const value of [null,[],{},'not json'])assert.throws(()=>validatePack(value));const pack=examplePack('words');assert.throws(()=>validatePack(pack,'quiz'),/model/);pack.items=[];assert.throws(()=>validatePack(pack),/1 and 500/);});
test('CEFR and pack size bounds prevent invalid imports',()=>{const pack=examplePack('words');pack.level='3rd grade';assert.throws(()=>validatePack(pack),/Level/);pack.level='C2';pack.items=Array.from({length:501},()=>({word:'a',clue:'b'}));assert.throws(()=>validatePack(pack),/500/);});
test('wrong sentences include a correction and survey scores are valid',()=>{const sentence=examplePack('sentences');sentence.items[0]={text:'She go.',correct:false};assert.throws(()=>validatePack(sentence),/correction/);const survey=examplePack('survey');survey.items[0].answers[0].points=-5;assert.throws(()=>validatePack(survey),/integers/);});
test('untrusted unknown fields are stripped rather than merged into game state',()=>{const pack=examplePack('words');pack.items[0].script='alert(1)';pack.items[0].constructor={polluted:true};const result=validatePack(pack);assert.equal('script' in result.items[0],false);assert.equal(Object.prototype.polluted,undefined);assert.deepEqual(Object.keys(result.items[0]),['word','clue','translation']);});

test('board packs must produce two usable axes', () => {
 const pack = examplePack('axes');
 pack.items[1].subject = pack.items[0].subject;
 assert.throws(() => validatePack(pack), /10 different/);
});

test('quiz packs honor a game’s smaller number of answer buttons', () => {
 const pack=examplePack('quiz');
 pack.items[0].options=['go','goes','going','went','gone'];
 assert.equal(validatePack(pack,'quiz').items[0].options.length,5);
 assert.throws(()=>validatePack(pack,'quiz',4),/2–4 options/);
 assert.match(aiPrompt('quiz',4),/2–4 unique options/);
});

test('dialogues require an order, mistaken reply and model correction', () => {
 const pack = examplePack('dialogues');
 for (const name of ['order', 'reply', 'correction']) {
  assert.throws(() => validatePack({...pack, items: [{...pack.items[0], [name]: ''}]}), new RegExp(name));
 }
 delete pack.items[0].grammar;
 assert.equal(validatePack(pack).items[0].grammar, '');
});
