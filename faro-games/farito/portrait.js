export const relations=['Learner','Parent','Grandparent','Sister','Brother','Aunt','Uncle','Cousin','Friend'];
export const settings=['Park','Beach','Garden','Living room'];
export const activities=['A picnic','Playing games','Reading together','Taking a walk'];
export const outfits=['Coral','Mint','Lavender','Gold','Blue'];
const colors=['#ed807e','#78cdb0','#9c83d6','#edbb5c','#6299ce'];
const skins=['#c97e58','#edb27d','#996044','#edc399'];
export const defaultScene=()=>({people:['Learner','Cousin'].map((relation,index)=>({relation,outfit:outfits[index]})),
  setting:settings[0],activity:activities[0],pet:'None'});

export function validScene(scene){
  return scene && settings.includes(scene.setting) && activities.includes(scene.activity) &&
    ['None','Cat','Dog'].includes(scene.pet) && Array.isArray(scene.people) &&
    scene.people.length>0 && scene.people.length<=4 &&
    scene.people.every(person=>relations.includes(person.relation)&&outfits.includes(person.outfit));
}

export function drawPortrait(canvas,scene){
  if(!validScene(scene))return;
  const ctx=canvas.getContext('2d');
  if(!ctx)return;
  const {width:w,height:h}=canvas;
  function shape(color,draw){ctx.fillStyle=color;ctx.beginPath();draw();ctx.fill();}
  const circle=(color,x,y,r)=>shape(color,()=>ctx.arc(x,y,r,0,2*Math.PI));
  function rect(color,x,y,width,height){ctx.fillStyle=color;ctx.fillRect(x,y,width,height);}
  function label(text,x,y,style='700 20px system-ui'){
    ctx.font=style;ctx.textAlign='center';ctx.fillStyle='#203344';ctx.fillText(text,x,y);
  }
  const beach=scene.setting==='Beach';
  const indoor=scene.setting==='Living room';
  const sky=ctx.createLinearGradient(0,0,0,h);
  sky.addColorStop(0,indoor?'#f0d6c6':beach?'#9fdbed':'#b8e2ed');
  sky.addColorStop(1,'#fff2ca');
  ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
  if(!indoor)circle('#ffe083',w-120,85,44);
  rect(indoor?'#cfa782':beach?'#f4d6a1':'#a8d29e',0,h*.68,w,h*.32);
  if(beach)rect('#6fc9d8',0,h*.48,w,h*.2);
  else if(indoor){
    rect('#c89678',0,h*.62,w,7);
    rect('#a3bfcc',w-197,48,120,106);
    rect('#ebd9c7',w-142,48,8,106);
  }else{
    [67,w-86].forEach((x,index)=>{
      rect('#8f684b',x-7,122,14,113);
      circle(scene.setting==='Garden'?'#e9a9ac':'#80b794',x,120,49-index*8);
      if(scene.setting==='Garden')circle('#ffcf78',x+10,107,8);
    });
  }
  if(scene.activity==='A picnic')rect('#f4edef',w*.29,h*.75,w*.42,22);
  if(scene.activity==='Playing games'){circle('#ed8d77',w*.5,h*.76,12);circle('#fff2ba',w*.5+15,h*.76,8);}
  if(scene.activity==='Reading together')rect('#f2e4b8',w*.46,h*.73,w*.08,22);
  if(scene.activity==='Taking a walk')rect(indoor?'#f3d59e':'#edcf9b',0,h*.74,w,24);
  scene.people.forEach(({relation,outfit},index)=>{
    const x=(index+1)*w/(scene.people.length+1);
    const y=h*.36+(beach?40:0)+(relation==='Learner'?11:0);
    const skin=skins[index%skins.length], shirt=colors[outfits.indexOf(outfit)];
    circle(index%2?'#684a3b':'#453745',x,y-8,29);
    circle(skin,x,y+1,25);
    circle('#283441',x-8,y-2,2.7);circle('#283441',x+8,y-2,2.7);
    ctx.strokeStyle='#7b3b3b';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y+6,7,.1,Math.PI-.1);ctx.stroke();
    shape(shirt,()=>{ctx.roundRect(x-33,y+29,66,61,16);});
    rect('#3c4f68',x-19,y+88,15,33);rect('#3c4f68',x+4,y+88,15,33);
    label(relation,x,y+145,'700 15px system-ui');
  });
  if(scene.pet!=='None'){
    const x=w-54,y=h-70;
    circle('#a67563',x,y,14);
    for(const dx of [-9,9]){
      if(scene.pet==='Dog')circle('#765447',x+dx,y-11,7);
      else shape('#a67563',()=>{ctx.moveTo(x+dx-5,y-8);ctx.lineTo(x+dx,y-22);ctx.lineTo(x+dx+5,y-8);ctx.closePath();});
    }
    circle('#523b35',x,y+4,2.5);
  }
  rect('#fffae5',0,h-36,w,36);
  label(scene.setting+' · '+scene.activity,w/2,h-12,'700 17px system-ui');
}
