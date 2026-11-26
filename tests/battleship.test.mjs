import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameManager } from '../grammar-battleship/server/GameManager.js';

function match() {
    const manager = new GameManager();
    const vocabLists = {
        subjects: Array.from({ length: 10 }, (_, index) => 'Subject ' + index),
        pastParticiples: Array.from({ length: 10 }, (_, index) => 'Verb ' + index)
    };
    const code = manager.createRoom(vocabLists);
    manager.joinRoom(code, 'First', 'a');
    manager.joinRoom(code, 'Second', 'b');
    const ships = Array.from({ length: 17 }, (_, index) => ({ x: index % 10, y: Math.floor(index / 10) }));
    return { manager, code, ships };
}

test('invalid fleet data cannot corrupt a partially prepared board', () => {
    const { manager, code, ships } = match();
    assert.equal(manager.placeShips(code, 'a', [...ships.slice(0, 16), { x: -1, y: 0 }]).success, false);
    assert.equal(manager.getRoom(code).players.a.ready, false);
    assert.equal(manager.getRoom(code).players.a.boardStatus.flat().some(Boolean), false);
    assert.equal(manager.placeShips(code, 'a', ships).success, true);
    assert.equal(manager.placeShips(code, 'a', ships).success, false);
});

test('incorrect grammar leaves the hidden fleet intact and the target available for a later turn', () => {
    const { manager, code, ships } = match();
    manager.placeShips(code, 'a', ships);
    manager.placeShips(code, 'b', ships);
    assert.equal(manager.attackTarget(code, 'a', 0, 0).success, true);
    assert.equal(manager.validateAttack(code, 'a', true).success, false);
    assert.equal(manager.validateAttack(code, 'outsider', true).success, false);
    assert.equal(manager.validateAttack(code, 'b', false).success, true);
    assert.equal(manager.getRoom(code).players.b.boardStatus[0][0], 1);
    assert.equal(manager.getRoom(code).status, 'playing');
    manager.attackTarget(code, 'b', 9, 9);
    manager.validateAttack(code, 'a', true);
    assert.equal(manager.getRoom(code).players.a.boardStatus[9][9], 3);
    assert.equal(manager.attackTarget(code, 'a', 0, 0).success, true);
    manager.validateAttack(code, 'b', true);
    assert.equal(manager.getRoom(code).players.b.boardStatus[0][0], 2);
    assert.equal(manager.getRoom(code).players.a.duds.length, 0);
    assert.equal(manager.validateAttack(code, 'b', true).success, false);
});

test('private fleet cells are hidden and a complete legitimate hit sequence ends the game', () => {
    const { manager, code, ships } = match();
    manager.placeShips(code, 'a', ships);
    manager.placeShips(code, 'b', ships);
    const view = manager.hideOpponentState(manager.getRoom(code), 'a');
    assert.equal(view.players.a.ships.length, 17);
    assert.equal(view.players.b.ships.length, 0);
    assert.equal(view.players.b.boardStatus.flat().includes(1), false);
    for (let index = 0; index < ships.length; index++) {
        const cell = ships[index];
        assert.equal(manager.attackTarget(code, 'a', cell.x, cell.y).success, true);
        manager.validateAttack(code, 'b', true);
        if (index < ships.length - 1) {
            // The other player uses different empty cells to pass the turn back.
            const x = index % 10;
            const y = 8 + Math.floor(index / 10);
            manager.attackTarget(code, 'b', x, y);
            manager.validateAttack(code, 'a', true);
        }
    }
    assert.equal(manager.getRoom(code).winner, 'a');
    assert.equal(manager.getRoom(code).status, 'finished');
});
