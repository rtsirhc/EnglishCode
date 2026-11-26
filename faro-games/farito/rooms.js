import { roomTransport } from '/gallery/shared/room-transport.js';

const namespace='farito';
let peerLibrary;
function loadPeer(){
  if(window.Peer)return Promise.resolve(window.Peer);
  peerLibrary ||= new Promise((resolve,reject)=>{
    const script=document.createElement('script');
    script.src='/grammar-rush/local/vendor/peerjs.min.js';
    script.onload=()=>window.Peer?resolve(window.Peer):reject(new Error('The room library did not start.'));
    script.onerror=()=>reject(new Error('Could not load the room library.'));
    document.head.append(script);
  }).catch(error=>{peerLibrary=null;throw error;});
  return peerLibrary;
}

export async function teacherRoom({code, mode, mission, update}){
  let room;
  let sequence=0;
  const members=new Map();
  function publish(){
    update([...members].map(([id,{sender,...report}])=>({id,...report})));
  }
  const senders=new Map();
  room=await roomTransport({namespace,code,mode,host:true,id:'host',loadPeer,receive(message,sender){
    let report=members.get(senders.get(sender));
    if(message.type==='hello'){
      const id=message.learner;
      if(typeof id!=='string'||!/^[-0-9a-f]{36}$/i.test(id))return;
      report=members.get(id);
      if(!report){
        if(members.size>=50){room.send({type:'full'},sender);return;}
        report={label:'Learner '+(++sequence),phase:'review',progress:0,help:false,connected:true};
        members.set(id,report);
      }
      if(report.sender&&report.sender!==sender)senders.delete(report.sender);
      report.sender=sender;
      senders.set(sender,id);
      report.connected=true;
      room.send({type:'welcome',mission,label:report.label},sender);
      publish();
    }else if(report&&message.type==='progress'&&Number.isFinite(message.progress)&&
      ['review','chat','portrait','done'].includes(message.phase)){
      report.connected=true;
      report.progress=Math.max(0,Math.min(100,Math.round(message.progress)));
      report.phase=message.phase;
      publish();
    }else if(report&&message.type==='help'){
      report.help=true;
      publish();
    }else if(report&&message.type==='participant-left'){
      report.connected=false;
      publish();
    }
  }});
  return {
    close:()=>room.close(),
    acknowledge(id){
      if(!members.has(id))return;
      members.get(id).help=false;
      room.send({type:'help-ack'},members.get(id).sender);
      publish();
    },
  };
}

export async function learnerRoom({code,mode,disconnected,acknowledged}){
  const senderId=mode==='local'?'host':`englishcode-${namespace}-${code}`;
  const storageKey=`englishcode:farito:${code}`;
  let token=crypto.randomUUID();
  try{token=sessionStorage.getItem(storageKey)||token;}catch{}
  let respond;
  const room=await roomTransport({namespace,code,mode,host:false,id:mode==='local'?token:undefined,loadPeer,disconnected,receive(message,sender){
    if(sender!==senderId)return;
    if(message.type==='welcome'||message.type==='full')respond?.(message);
    if(message.type==='help-ack')acknowledged();
  }});
  const id=mode==='local'?room.id:token;
  try{sessionStorage.setItem(storageKey,id);}catch{}
  const hello=()=>room.send({type:'hello',learner:id});
  try{
    const welcome=await new Promise((resolve,reject)=>{
      const interval=setInterval(hello,1000);
      const timeout=setTimeout(()=>{
        clearInterval(interval);respond=null;reject(new Error('Room did not respond. Check that the teacher screen is open.'));
      },5500);
      respond=message=>{clearInterval(interval);clearTimeout(timeout);respond=null;resolve(message);};
      hello();
    });
    if(welcome.type==='full')throw new Error('This classroom room is full.');
    return {id,welcome,send:room.send,close:room.close};
  }catch(error){room.close();throw error;}
}
