import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validatePath, validateIndictment } from '../paradox-blackwood/validation.js';

const path = 'He stopped at the gate. He moved into the garden and onto the balcony. He climbed off the wall and stood in the study on the rug.';
const report = 'He had stopped at the gate before the storm began. He had climbed onto the balcony from the rose garden. He had entered the study before the inspector arrived. He moved into the dark room and stood on the rug. Then he climbed off the balcony and disappeared in the rain. The detective collected the muddy footprints and compared them with the marks beside the window. The police confirmed the death time and questioned every suspect about the sequence of events. This report connects the route to the evidence and explains why the nephew gave an alibi that conflicts with the confirmed timeline.';

test('route validation matches complete prepositions and requires the requested sentence count', () => {
    assert.equal(validatePath(path).valid, true);
    assert.equal(validatePath('He stopped at the gate into onto off in on.').valid, false);
    assert.equal(validatePath('The cat went within. The office was quiet. The inspector saw an onion.').valid, false);
});

test('indictment keeps the 100-word threshold and checks distinct sentences before teacher review', () => {
    assert.equal(validateIndictment(report).valid, true);
    assert.equal(validateIndictment(path).valid, false);
    assert.equal(validateIndictment(report.replaceAll('had', 'has')).valid, false);
    assert.equal(validateIndictment(report.replaceAll('.', ',')).valid, false);
    assert.match(validateIndictment(report).message, /teacher/);
});
