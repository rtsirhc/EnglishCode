export async function roomTransport({ namespace, code, host, mode, id = crypto.randomUUID(), receive, disconnected, loadPeer }) {
    let channel, peer, unlock, closed = false;
    const links = new Map();
    const endpoint = 'englishcode-' + namespace + '-' + code;
    function send(message, recipient) {
        if (closed) return;
        if (channel) channel.postMessage({ from: id, to: recipient, message });
        else if (host) {
            if (recipient) links.get(recipient)?.send(message);
            else for (const link of links.values()) if (link.open) link.send(message);
        } else if (links.get('host')?.open) links.get('host').send(message);
    }
    function close() {
        if (closed) return;
        send({ type: host ? 'room-ended' : 'participant-left' });
        closed = true;
        channel?.close();
        const previous = [...links.values()];
        links.clear();
        for (const link of previous) link.close();
        peer?.destroy(); unlock?.();
        window.removeEventListener('pagehide', close);
    }
    function message(data, sender) {
        if (closed || !data || typeof data !== 'object') return;
        if (!host && data.type === 'room-ended') {
            close(); disconnected?.(); return;
        }
        receive(data, sender);
    }
    try {
        if (mode === 'local') {
            async function reserve(name) {
                return new Promise((resolve, reject) => {
                    navigator.locks.request(name, { ifAvailable: true }, lock => {
                        resolve(Boolean(lock));
                        if (lock) return new Promise(release => { unlock = release; });
                    }).catch(reject);
                });
            }
            if (host) {
                if (!await reserve(endpoint)) throw new Error('Room code already in use. Create another room.');
            } else if (!await reserve(endpoint + ':team:' + id)) {
                id = crypto.randomUUID();
                if (!await reserve(endpoint + ':team:' + id)) throw new Error('Could not reserve this team screen. Try again.');
            }
            channel = new BroadcastChannel(endpoint);
            channel.onmessage = ({ data }) => {
                if (!data || (data.to && data.to !== id)) return;
                message(data.message, data.from);
            };
        } else {
            const Peer = loadPeer ? await loadPeer() : (await import('peerjs')).default;
            peer = new Peer(host ? endpoint : id);
            await new Promise((resolve, reject) => {
                const timer = setTimeout(() => reject(new Error('Signalling unavailable. Check internet or choose Same browser.')), 15000);
                peer.on('open', () => { clearTimeout(timer); resolve(); });
                peer.on('error', error => {
                    clearTimeout(timer);
                    reject(new Error(error.type === 'unavailable-id' ? 'This connection is already open. Close its other tab and retry.' : 'Could not connect to the room service.'));
                });
            });
            function attach(link, key) {
                links.set(key, link);
                link.on('data', data => message(data, link.peer));
                link.on('error', () => link.close());
                link.on('close', () => {
                    if (links.get(key) !== link || closed) return;
                    links.delete(key);
                    if (host) receive({ type: 'participant-left' }, key);
                    else { close(); disconnected?.(); }
                });
            }
            if (host) peer.on('connection', link => attach(link, link.peer));
            else await new Promise((resolve, reject) => {
                const link = peer.connect(endpoint, { reliable: true });
                const timer = setTimeout(() => reject(new Error('Room not found. Check the code and connection mode.')), 15000);
                attach(link, 'host');
                link.on('open', () => { clearTimeout(timer); resolve(); });
                link.on('error', () => { clearTimeout(timer); reject(new Error('Could not reach the host.')); });
            });
        }
        window.addEventListener('pagehide', close, { once: true });
        return { id, send, close };
    } catch (error) { close(); throw error; }
}
