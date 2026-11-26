function renderLocalJoin() {
  const container=document.getElementById('qrCode');
  container.innerHTML='';
  const steps=document.createElement('p');steps.className='local-join-help';
  steps.textContent=window.GRAMMAR_RUSH_WIFI ? '1. Conéctate al Wi-Fi '+window.GRAMMAR_RUSH_WIFI.ssid+' de esta laptop. 2. Escanea el QR del juego.' : 'Conecta el celular a la red de esta laptop y escanea el QR para entrar al juego.';
  container.appendChild(steps);
  function addCode(target, text, label) {
    const block=document.createElement('div');block.className='local-qr-block';
    const title=document.createElement('strong');title.textContent=label;block.appendChild(title);
    const code=document.createElement('div');code.className='local-qr';block.appendChild(code);target.appendChild(block);
    new QRCode(code,{text,width:192,height:192,colorDark:'#000000',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.M});
  }
  if(window.GRAMMAR_RUSH_WIFI) {
    const escape=value=>value.replace(/[\\;,:\"]/g,'\\$&');
    addCode(container,'WIFI:T:WPA;S:'+escape(window.GRAMMAR_RUSH_WIFI.ssid)+';P:'+escape(window.GRAMMAR_RUSH_WIFI.password)+';;','1 · Unirse al Wi-Fi de la laptop');
  }
  addCode(container,joinUrl,'2 · Abrir el juego · Sala '+roomCode);
  const hint=document.createElement('p');hint.className='local-join-help';hint.textContent='Si el celular avisa “sin internet”, elige permanecer conectado. El juego funciona dentro de esta red.';container.appendChild(hint);
  if(!document.getElementById('localJoinDialog')) {
    const dialog=document.createElement('dialog');dialog.id='localJoinDialog';
    dialog.innerHTML='<header><h2>Conectar alumnos</h2><button type="button" onclick="document.getElementById(\'localJoinDialog\').close()">Cerrar ✕</button></header><div id="localJoinDialogContent"></div>';
    document.body.appendChild(dialog);
    const button=document.createElement('button');button.className='btn btn-gold btn-sm';button.textContent='📡 QR · Conectar alumnos';
    button.onclick=()=>{
      const content=document.getElementById('localJoinDialogContent');content.innerHTML='';
      const message=document.createElement('p');message.textContent=steps.textContent;content.appendChild(message);
      if(window.GRAMMAR_RUSH_WIFI) addCode(content,'WIFI:T:WPA;S:'+window.GRAMMAR_RUSH_WIFI.ssid.replace(/[\\;,:\"]/g,'\\$&')+';P:'+window.GRAMMAR_RUSH_WIFI.password.replace(/[\\;,:\"]/g,'\\$&')+';;','1 · Wi-Fi de la laptop');
      addCode(content,joinUrl,'2 · Juego · Sala '+roomCode);
      const link=document.createElement('p');link.textContent=joinUrl;content.appendChild(link);dialog.showModal();
    };
    document.querySelector('.host-header').appendChild(button);
  }
}
