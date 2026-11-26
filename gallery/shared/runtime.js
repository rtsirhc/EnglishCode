import { read, write } from './storage.js';
import { validatePack } from './content.js';
import { listenInput } from './input.js';
export function gameRuntime(id, model, actions = {}) {
  let pack = null;
  try { const stored=read('pack:'+id,null); if(stored) pack=validatePack(stored,model); } catch { /* Invalid browser-local content never prevents built-in play. */ }
  const dispose=bindGameControls(id,actions);
  return { pack, load:fallback=>read('progress:'+id,fallback), save:value=>write('progress:'+id,value), dispose };
}

export function bindGameControls(id, actions) {
  const stopInput = listenInput(action => actions[action]?.(), Object.keys(actions));
  const announce = names => {
    if (window.parent !== window) window.parent.postMessage({ type: 'englishcode-ready', game: id, actions: names }, location.origin);
  };
  function receive(event) {
    if (event.origin === location.origin && event.source === window.parent &&
        event.data?.type === 'englishcode-action' && Object.hasOwn(actions, event.data.action)) {
      actions[event.data.action]();
    }
  }
  function dispose() {
    stopInput();
    window.removeEventListener('message', receive);
    window.removeEventListener('pagehide', dispose);
    announce([]);
  }
  window.addEventListener('message', receive);
  window.addEventListener('pagehide', dispose, { once: true });
  announce(Object.keys(actions));
  return dispose;
}
