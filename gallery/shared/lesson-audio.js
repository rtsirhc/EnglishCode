export function clipKey(text) {
  let hash=2166136261;
  for(const byte of new TextEncoder().encode(text))hash=Math.imul(hash^byte,16777619);
  return (hash>>>0).toString(16);
}

export function localClipPlayer(directory='audio') {
  const audio=new Audio();
  audio.preload='none';
  let control, label, token=0;
  function stop() {
    token++;
    audio.pause();
    audio.onended=audio.onerror=null;
    if(control)control.textContent=label;
    control=null;
  }
  async function play(text, button) {
    if(!text || !button)return;
    stop();
    const active=token;
    control=button;
    label=button.textContent;
    button.textContent='🔊 Reproduciendo…';
    audio.src=`${directory}/${clipKey(text)}.mp3`;
    const fail=()=>{
      if(active!==token)return;
      stop();
      button.textContent='Reintentar audio';
    };
    audio.onended=()=>{if(active===token)stop();};
    audio.onerror=fail;
    try{await audio.play();}catch{fail();}
  }
  window.addEventListener('pagehide',stop,{once:true});
  return {play,stop};
}
