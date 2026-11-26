export async function worker() {
  if (!('serviceWorker' in navigator)) throw new Error('This browser does not support offline downloads.');
  await navigator.serviceWorker.register('/sw.js');
  return navigator.serviceWorker.ready;
}
export async function offlineRequest(type, data = {}, onProgress) {
  const registration = await worker();
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel();
    const timeout = setTimeout(() => { channel.port1.close(); reject(new Error('The offline operation timed out. Retry when your connection is stable.')); }, 180000);
    channel.port1.onmessage = ({ data: message }) => {
      if (message.progress !== undefined) { onProgress?.(message.progress); return; }
      clearTimeout(timeout); channel.port1.close();
      message.error ? reject(new Error(message.error)) : resolve(message.result);
    };
    registration.active.postMessage({ type, ...data }, [channel.port2]);
  });
}
