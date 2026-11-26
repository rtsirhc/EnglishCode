import { getRandomGameSet } from '../data/questions.js';
import { read } from '../../../gallery/shared/storage.js';
import { validatePack } from '../../../gallery/shared/content.js';

function questionSet() {
  try {
    const pack = validatePack(read('pack:sentence-auction', null), 'sentences');
    return pack.items.map((item, index) => ({
      id: index + 1, sentence: item.text, status: item.correct ? 'Perfect' : 'Toxic',
      tense: pack.title, explanation: [item.correction, item.explanation].filter(Boolean).join(' ')
    }));
  } catch { return getRandomGameSet(); }
}

function bidderView(state) {
  const { bankroll, streak, isRevealed, currentQuestionIndex, currentBid, hasBid, settledLots } = state;
  const { sentence, tense } = state.questions[currentQuestionIndex];
  return { bankroll, streak, isRevealed, currentQuestionIndex, currentBid, hasBid, settled: !!settledLots[currentQuestionIndex], currentQuestion: { sentence, tense } };
}

// The dealer owns the bank, question deck and scoring. The bidder can submit one bid per lot.
export async function openRoom({ roomId, role, mode, onState, onClose }) {
  const dealer = role === 'Dealer';
  const endpoint = 'englishcode-sentence-auction-' + roomId;
  const clientId = crypto.randomUUID();
  let state = dealer ? { questions: questionSet(), currentQuestionIndex: 0, isRevealed: true,
    bankroll: 1000, currentBid: 50, hasBid: false, streak: 0, settledLots: {} } : null;
  let channel, peer, link, unlock, timer, bidder, closed = false;
  let ready, fail;
  const joined = new Promise((resolve, reject) => { ready = resolve; fail = reject; });
  // A late async connection or heartbeat must never update an abandoned lobby.
  function send(message, to) {
    if (channel) channel.postMessage({ ...message, from: clientId, to });
    else if (link?.open) link.send(message);
  }
  function publish() {
    onState(state);
    if (bidder) send({ type: 'state', value: bidderView(state) }, bidder);
  }
  function receive(message, from) {
    if (closed || !message || (message.to && message.to !== clientId)) return;
    if (dealer) {
      if (message.type === 'join') {
        if (bidder && bidder !== from) { send({ type: 'busy' }, from); return; }
        bidder = from;
        publish();
      } else if (from === bidder && message.type === 'leave') bidder = null;
      else if (from === bidder && message.type === 'bid' && !state.hasBid && !state.settledLots[state.currentQuestionIndex] &&
          message.index === state.currentQuestionIndex && Number.isSafeInteger(message.amount) &&
          message.amount >= Math.min(50, state.bankroll) && message.amount > 0 && message.amount <= state.bankroll) {
        state = { ...state, currentBid: message.amount, hasBid: true };
        publish();
      }
    } else if (message.type === 'state') {
      state = message.value; onState(state); ready();
    } else if (message.type === 'busy') fail(new Error('A bidder is already in this room.'));
    else if (message.type === 'end') lost();
  }
  function close() {
    if (closed) return;
    closed = true;
    send({ type: dealer ? 'end' : 'leave' }, dealer ? bidder : undefined);
    clearTimeout(timer); channel?.close(); link?.close(); peer?.destroy(); unlock?.();
    window.removeEventListener('pagehide', close);
  }
  function lost() {
    if (closed) return;
    const message = 'The room connection closed. Open the lobby to reconnect.';
    fail(new Error(message)); close(); onClose(message);
  }
  window.addEventListener('pagehide', close);
  try {
    if (mode === 'local') {
      if (dealer) {
        const acquired = new Promise((resolve, reject) => {
          navigator.locks.request(endpoint, { ifAvailable: true }, lock => {
            if (!lock) { reject(new Error('This room code is in use. Choose another.')); return; }
            resolve();
            return new Promise(release => { unlock = release; });
          }).catch(reject);
        });
        await acquired;
      }
      channel = new BroadcastChannel(endpoint);
      channel.onmessage = ({ data }) => receive(data, data.from);
      if (dealer) { publish(); ready(); } else send({ type: 'join' });
    } else {
      const { default: Peer } = await import('peerjs');
      peer = dealer ? new Peer(endpoint) : new Peer();
      function attach(connection) {
        link = connection;
        connection.on('open', () => { if (!dealer) send({ type: 'join' }); });
        connection.on('data', message => receive(message, connection.peer));
        connection.on('close', () => {
          if (link !== connection || closed) return;
          bidder = null; link = null; if (!dealer) lost();
        });
        connection.on('error', () => { connection.close(); });
      }
      peer.on('open', () => {
        if (dealer) { publish(); ready(); }
        else attach(peer.connect(endpoint, { reliable: true }));
      });
      peer.on('connection', connection => {
        if (dealer && !link) attach(connection);
        else connection.on('open', () => { connection.send({ type: 'busy' }); setTimeout(() => connection.close(), 200); });
      });
      peer.on('error', error => {
        const message = error.type === 'unavailable-id' ? 'Room code already in use.' :
          'Could not reach the room. Check the code and connection, or choose Same browser on both screens.';
        fail(new Error(message));
        if (state && !closed && error.type !== 'peer-unavailable') { close(); onClose(message); }
      });
    }
    timer = setTimeout(() => fail(new Error('Room unavailable. Start the dealer first and use the same code and connection mode.')), mode === 'local' ? 3500 : 15000);
    await joined; clearTimeout(timer);
    return { close, state, update(patch) {
      if (closed) return;
      if (dealer) {
        if (patch.verdict && state.settledLots[state.currentQuestionIndex]) return;
        const { verdict, ...changes } = patch;
        const bankroll = Math.max(0, changes.bankroll ?? state.bankroll);
        state = { ...state, ...changes, bankroll,
          currentBid: Math.max(0, Math.min(bankroll, changes.currentBid ?? state.currentBid)),
          settledLots: verdict ? { ...state.settledLots, [state.currentQuestionIndex]: verdict } : state.settledLots };
        publish();
      } else send({ type: 'bid', amount: patch.currentBid, index: state.currentQuestionIndex });
    }};
  } catch (error) { close(); throw error; }
}
