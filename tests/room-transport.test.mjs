import { test } from 'node:test';
import assert from 'node:assert/strict';
import { roomTransport } from '../gallery/shared/room-transport.js';

test('classroom channels route private replies, reserve the host and close both participant screens', async () => {
    globalThis.window = new EventTarget();
    const held = new Set();
    Object.defineProperty(globalThis, 'navigator', {
        configurable: true,
        value: {
            locks: {
                request(name, options, callback) {
                    if (held.has(name)) return Promise.resolve(callback(null));
                    held.add(name);
                    return Promise.resolve(callback({ name })).finally(() => held.delete(name));
                }
            }
        }
    });
    const namespace = 'cipher-test-' + crypto.randomUUID();
    const options = {namespace,code:'CLASS123',mode:'local'};
    let reply;
    const requestReceived = new Promise(resolve => { reply = resolve; });
    let firstClosed, secondClosed;
    const firstEnded = new Promise(resolve => { firstClosed = resolve; });
    const secondEnded = new Promise(resolve => { secondClosed = resolve; });
    const firstMessages = [], secondMessages = [];
    let firstReply;
    const privateReply = new Promise(resolve => { firstReply = resolve; });
    let broadcastReceived;
    const broadcast = new Promise(resolve => { broadcastReceived = resolve; });
    const host = await roomTransport({...options,host:true,receive:reply});
    const first = await roomTransport({...options,host:false,id:'copied-tab-id',receive:data => {firstMessages.push(data); firstReply(data);},disconnected:firstClosed});
    const second = await roomTransport({...options,host:false,id:'copied-tab-id',receive:data => { secondMessages.push(data); if (data.type === 'finish-check') broadcastReceived(); },disconnected:secondClosed});
    try {
        await assert.rejects(() => roomTransport({...options,host:true,receive:()=>{}}), /already in use/);
        assert.notEqual(first.id, second.id);
        first.send({type:'join',name:'First'});
        assert.deepEqual(await requestReceived, {type:'join',name:'First'});
        host.send({type:'private-state',clue:'Only the first team sees this'}, first.id);
        assert.equal((await privateReply).clue, 'Only the first team sees this');
        // A broadcast from the same sender follows the private reply on the native channel.
        host.send({type:'finish-check'});
        await broadcast;
        assert.equal(secondMessages.some(message => message.type === 'private-state'), false);
        assert.equal(firstMessages.some(message => message.type === 'private-state'), true);
        host.close();
        await Promise.all([firstEnded,secondEnded]);
    } finally {host.close();first.close();second.close();}
});
