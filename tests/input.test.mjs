import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ACTIONS, DEFAULT_KEYS, DEFAULT_BUTTONS, resolveMapping } from '../gallery/shared/input.js';
test('new actions preserve existing saved controller choices without assigning duplicate bindings', () => {
    const keys = { ...DEFAULT_KEYS, answer1:'KeyH' };
    const buttons = { ...DEFAULT_BUTTONS, answer1:8 };
    delete keys.hint; delete buttons.hint;
    const result = resolveMapping({keys, buttons});
    assert.equal(result.keys.answer1, 'KeyH');
    assert.equal(result.buttons.answer1, 8);
    for (const type of ['keys', 'buttons']) assert.equal(new Set(Object.values(result[type])).size, ACTIONS.length);
});
test('invalid stored mappings fall back to usable distinct inputs', () => {
    const result = resolveMapping({keys:{confirm:null, answer1:'Digit2',answer2:'Digit2'},buttons:{confirm:999}});
    assert.equal(typeof result.keys.confirm, 'string');
    assert.equal(result.buttons.confirm, DEFAULT_BUTTONS.confirm);
    assert.equal(new Set(Object.values(result.keys)).size, ACTIONS.length);
});
