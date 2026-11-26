import assert from 'node:assert/strict';
import test from 'node:test';
import { marketRequest } from '../faro-games/semana_07/mystery_menu/local-market.js';

test('Mystery Menu serializes cashier changes and scores an offline verdict', async () => {
    const data = new Map();
    globalThis.localStorage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
    let pending = Promise.resolve();
    Object.defineProperty(globalThis, 'navigator', { configurable: true, value: {
        locks: { request(_name, work) {
            const next = pending.then(work);
            pending = next.catch(() => {});
            return next;
        } }
    } });
    const submit = (type, revision, extra = {}) => marketRequest('action', { type, revision, ...extra });
    let result = await submit('setup', 0, { names: ['Cloud', 'River'] });
    result = await submit('start', result.state.revision);
    const options = await Promise.allSettled([
        submit('reserve', result.state.revision, { team: 0, id: '710001' }),
        submit('reserve', result.state.revision, { team: 1, id: '710001' })
    ]);
    assert.equal(options.filter(option => option.status === 'fulfilled').length, 1);
    assert.match(options.find(option => option.status === 'rejected').reason.message, /cambió/);
    result = options.find(option => option.status === 'fulfilled').value;
    await assert.rejects(() => marketRequest('action', { type: 'pause', revision: result.state.revision }, 'helper'), /no puede/);
    result = await submit('saveMenu', result.state.revision, { team: 0, value: 8, menu: {
        starter: 'Soup', main: 'Rice', dessert: 'Fruit', uses: {}
    } });
    assert.equal(result.state.teams[0].english, 8);
    const brief = await marketRequest('brief', {});
    assert.equal(brief.revision, result.state.revision);
    assert.ok(!brief.text.includes('Cloud'));
    const judges = ['Traditional', 'Creative', 'Practical'];
    const verdict = { teams: [0, 1].map(id => ({ id, judges: judges.map(name => ({ name, score: 8, comment: 'Test.' })) })) };
    result = await marketRequest('verdict', { revision: brief.revision, data: verdict });
    assert.equal(result.state.results.teams.length, 2);
    assert.equal(result.state.resultsScreen, 'live');
    await assert.rejects(() => marketRequest('verdict', { revision: brief.revision, data: verdict }), /cambió/);
    assert.deepEqual((await marketRequest('shop')).state.basket, []);
});
