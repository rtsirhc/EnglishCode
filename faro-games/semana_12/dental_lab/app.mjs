import * as T from '../../semana_11/clinic_rally/assets/three/three.module.js';
import { objectSVG } from '../monster_smiles/art.js';
import { gameRuntime } from '/gallery/shared/runtime.js';
const $=s=>document.querySelector(s);
const slides=[
 ['The dental lab','What can you see?','tooth','WELCOME','Muestra el prototipo al iniciar. Pregunta qué palabras conocen. No reveles todo el vocabulario de golpe.'],
 ['A tooth','One tooth.','tooth','LOOK CLOSELY','Señala un solo diente en el modelo. Tooth /tuːθ/: lengua suave entre dientes. Pide a un alumno completar “This is a tooth”.'],
 ['Teeth','Many teeth.','teeth','ONE OR MANY?','Contrasta one tooth / many teeth. Cambia de diapositiva hacia atrás una vez y comprueba que el singular cambia también la vocal.'],
 ['Gums','These are the gums.','gums','AROUND THE TEETH','Señala la zona rosa y después el prototipo. Gums /ɡʌmz/ termina con sonido /z/. No necesitas enseñar anatomía avanzada.'],
 ['A toothbrush','I use a toothbrush.','brush','TOOLS','Toothbrush es el objeto. Brush es la acción. Pregunta “Is this toothpaste?” para que corrijan con “No, it’s a toothbrush”.'],
 ['Toothpaste','I put toothpaste on my toothbrush.','paste','TOOLS','Toothpaste es incontable: some toothpaste. Contrasta el tubo y el cepillo. Muestra la animación sin pedir que todos repitan al mismo tiempo.'],
 ['Brush my teeth','I brush my teeth.','brushing','AN ACTION','La animación representa la acción, no una técnica clínica completa. Pide completar “Every morning, I…”. B1: “When do you brush your teeth?”'],
 ['Floss','I floss my teeth.','floss','BETWEEN THE TEETH','Floss es hilo dental y también verbo. Enseña “between the teeth”. El hilo se mueve suavemente entre dos dientes.'],
 ['Braces','I have braces.','braces','ON THE TEETH','Braces /ˈbreɪsɪz/: dos sílabas. No pidas que estudiantes muestren sus dientes. Pueden hablar del modelo o de un personaje inventado.'],
 ['A cavity','This tooth has a cavity.','cavity','A PROBLEM','La zona oscura es una caries ilustrativa. Cavity /ˈkævəti/. Aclara: cepillar no rellena un agujero existente. No todas las caries se ven como esta.'],
 ['A toothache','My tooth hurts.','pain','A PROBLEM','Toothache es dolor de diente. “My tooth hurts” singular; “My teeth hurt” plural. No asumas que toda caries duele o que todo dolor es caries.'],
 ['A dental drill','The dentist removes the decay.','drill','AT THE DENTIST','Dental drill, no mill. El instrumento retira tejido cariado en esta secuencia simplificada. Pulir se dice polish. Toca Space para iniciar o repetir la animación.'],
 ['A filling','The dentist fills the cavity.','filling','AT THE DENTIST','Filling /ˈfɪlɪŋ/ = empaste/resina. Fill = rellenar. En esta ilustración se coloca material del color del diente. Space inicia: mira cómo desaparece el espacio oscuro.'],
 ['Polish','The dentist polishes the filling.','polish','AN ACTION','Polish /ˈpɑːlɪʃ/ = pulir. Diferencia: retirar caries, colocar un empaste y pulir son acciones distintas. No se trata de enseñar una intervención clínica.'],
 ['A cleaning','I’m here for a cleaning.','cleaning','AN APPOINTMENT','Cleaning es limpieza dental. Usa “I’m here for…” para recuperar la clínica. La animación solo simboliza una limpieza, no todas sus etapas.'],
 ['An X-ray','We’ll take an X-ray.','xray','LOOK INSIDE','Señala la ilustración y pide la frase “It’s an X-ray”.'],
 ['The real thing','Point. Name it. Use it in a sentence.','teeth','YOUR DENTAL MODEL','5 min con los objetos reales. Señala un diente, los dientes, las encías; pide el nombre o la acción relacionada. Con las placas: “It’s an X-ray”, “I can see teeth”. Evita filas para tocar: tú sostienes y recorres el salón.'],
 ['At the dentist','“What’s the problem?”\n“My tooth hurts.”','pain','A SHORT CONVERSATION','A1: A pregunta y B responde con apoyo. A2: añade “Open your mouth, please”. B1: “How long has it hurt?” / “Since yesterday”, seguido de “Could you repeat that, please?”. Cambian de rol desde su asiento.'],
 ['What is it?','','challenge','YOUR TURN','Usa Next challenge para cambiar sin repetir hasta recorrer el banco. Primero esperan 5 segundos. Luego un alumno responde; otro justifica o corrige. Space muestra la respuesta, botón “Another challenge” cambia.'],
 ['Design a patient','Draw one tooth. Add three clues.','drawing','YOUR TURN','8 min: 3 dibujar, 2 escribir, 2 describir en pareja, 1 revisar. Un diente con tres pistas de esta clase. Permite papel suelto o describir el ejemplo si no traen cuaderno. No evalúes dibujo ni exposición de información personal.'],
 ['Guess my patient','Describe it. Your partner guesses.','drawing','A / B TURNS','A tiene 30 segundos para describir sin mostrar su dibujo. B identifica dos pistas y después ven el dibujo. Cambian. Si es necesario, asigna turnos A/B sin cambiar de asiento. 3° añade una pregunta del dentista.'],
 ['One thing you learned','A word. A sentence.','tooth','BEFORE YOU GO','Cierre de 2 minutos: pide 3 ejemplos de palabras distintas y 2 oraciones. No preguntes únicamente “Did you understand?”. Registra qué necesitan recuperar en la segunda clase.']
].map(([word,phrase,scene,tag,note])=>({word,phrase,scene,tag,note}));
const challengeBank=[
 {scene:'brush',clue:'I use this to brush my teeth.',answer:'A toothbrush.'},
 {scene:'paste',clue:'I put this on my toothbrush.',answer:'Toothpaste.'},
 {scene:'floss',clue:'This goes between my teeth.',answer:'Floss.'},
 {scene:'braces',clue:'These are attached to the teeth.',answer:'Braces.'},
 {scene:'cavity',clue:'This tooth has a small hole.',answer:'It has a cavity.'},
 {scene:'filling',clue:'This repairs the hole in a tooth.',answer:'A filling.'},
 {scene:'xray',clue:'The dentist uses this to see inside.',answer:'An X-ray.'},
 {scene:'gums',clue:'The pink tissue around the teeth.',answer:'The gums.'},
 {scene:'teeth',clue:'One tooth. Many…',answer:'Teeth.'},
 {scene:'brushing',clue:'What am I doing?',answer:'You are brushing your teeth.'},
 {scene:'pain',clue:'Finish: “My tooth…”',answer:'My tooth hurts.'},
 {scene:'cleaning',clue:'Complete: “I’m here for a…”',answer:'A cleaning.'}
];
const controls = gameRuntime('dental-lab','words',{
 next:()=>{if(!$('#notes').open)move(1);},
 confirm:()=>{if(!$('#action').hidden&&!$('#notes').open)action();},
 hint:()=>{if(!$('#notes').open)$('#hide').click();},
});
let legacy={};try{legacy=JSON.parse(localStorage.getItem('dental-lab')||'{}');}catch{}
const saved=controls.load(legacy)||{};
let index=Math.max(0,Math.min(slides.length-1,Math.trunc(Number(saved.index)||0))),grade=[1,2,3].includes(saved.grade)?saved.grade:1;
let paused=false,hidden=false,currentChallenge=null,bag=[],reveal=false,complete=false,drawn=0;
const customDeck=controls.pack?.items.map(item=>({scene:'custom',clue:item.clue,answer:item.word}));
let source=saved.source==='custom'&&customDeck?'custom':'built-in';
const practice=slides.findIndex(slide=>slide.scene==='challenge');
const deck=()=>source==='custom'?customDeck:challengeBank;
const animatedScenes=['drill','filling','polish'];
let renderer,scene,camera,world,clock=0,start=0,sequence=false,drag=0,actors={},previous=performance.now();
const material=(color,roughness=.32,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
const enamel=material('#fff9e8',.2),rootMat=material('#ead7b5',.4),gumMat=material('#ed8995',.58),mint=material('#008a7c'),white=material('#fffdf4'),steel=material('#b6c5cf',.22,.8),dark=material('#4b2c20',.85),fillMat=material('#d5f0ea',.18);
function add(geo,mat,parent,x=0,y=0,z=0){const o=new T.Mesh(geo,mat);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function sphere(p,mat,x,y,z,sx,sy=sx,sz=sx){const o=add(new T.SphereGeometry(1,32,24),mat,p,x,y,z);o.scale.set(sx,sy,sz);return o;}
function tube(p,points,r,mat){return add(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(v=>new T.Vector3(...v))),32,r,10,false),mat,p);}
function group(p,x=0,y=0,z=0){const g=new T.Group();g.position.set(x,y,z);p.add(g);return g;}
// A single continuous crown surface: rounded-square outline and sculpted cusps.
function crownGeometry(front=false){
 const vertices=[],indices=[],rings=48,segments=96;
 for(let j=0;j<=rings;j++){
  const v=j/rings;
  for(let i=0;i<=segments;i++){
   const a=i/segments*Math.PI*2,c=Math.cos(a),s=Math.sin(a);
   let r,h;
   if(v<.62){const u=v/.62;r=.56+.22*Math.sin(u*Math.PI*.78);h=-.65+1.18*u;}
   else{const u=(v-.62)/.38;r=.7*Math.cos(u*Math.PI/2);h=.53+.17*Math.sin(u*Math.PI/2);}
   let x=r*Math.sign(c)*Math.pow(Math.abs(c),.66),z=r*Math.sign(s)*Math.pow(Math.abs(s),.66)*.85;
   if(v>=.62&&!front){let cusp=0;for(const cx of [-.36,.36])for(const cz of [-.28,.28])cusp+=.24*Math.exp(-((x-cx)**2+(z-cz)**2)/.055);h+=cusp*Math.sin((v-.62)/.38*Math.PI);h-=.14*Math.exp(-(x*x+z*z)/.07);}
   if(front){x*=.8;z*=.49;h=v>=.62?.53+.12*Math.sin((v-.62)/.38*Math.PI/2):h;}
   vertices.push(x,h,z);
   if(j<rings&&i<segments){const k=j*(segments+1)+i;indices.push(k,k+segments+1,k+1,k+1,k+segments+1,k+segments+2);}
  }
 }
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();return geo;
}
function tooth(p,x=0,y=0,z=0,size=1,front=false){
 const g=group(p,x,y,z);g.scale.setScalar(size);
 add(crownGeometry(front),enamel,g);
 for(const side of front?[0]:[-1,1]){const rp=[];for(let i=0;i<=24;i++){const u=i/24;rp.push(new T.Vector2(.29*Math.sin(u*Math.PI/2),-1.94+u*1.35));}rp.push(new T.Vector2(0,-.59));const r=add(new T.LatheGeometry(rp,40),rootMat,g,side*.29,0,0);r.rotation.z=side*.14;}
 return g;
}
function mouth(p,brackets=false){const g=group(p);const path=Array.from({length:25},(_,i)=>{const a=(i-12)*.065;return [Math.sin(a)*3.5,-.65,(1-Math.cos(a))*3.5];});const gum=tube(g,path,.43,gumMat);gum.scale.y=1.6;
 for(let i=0;i<8;i++){const a=(i-3.5)*.21,x=Math.sin(a)*3.5,z=(1-Math.cos(a))*3.5;const t=tooth(g,x,0,z,.56,Math.abs(i-3.5)<2.1);t.rotation.y=-a;
 if(brackets){const bracket=group(g,x,.07,z+.27);bracket.rotation.y=-a;add(new T.BoxGeometry(.2,.19,.08),steel,bracket);for(const dx of [-.065,.065])add(new T.BoxGeometry(.035,.24,.05),steel,bracket,dx,0,.055);const band=add(new T.TorusGeometry(.085,.017,8,24),mint,bracket,0,0,.09);band.scale.x=.83;}}
 if(brackets)tube(g,Array.from({length:25},(_,i)=>{const a=(i-12)*.062;return [Math.sin(a)*3.5,.07,(1-Math.cos(a))*3.5+.36];}),.018,steel);return g;}
function brush(p,paste=false){const g=group(p);tube(g,[[0,-1.9,0],[-.05,-1.2,0],[0,-.4,0],[.08,.6,0]],.105,mint);sphere(g,mint,-.02,-1.05,0,.16,.75,.12);sphere(g,white,.08,1.02,0,.25,.49,.105);sphere(g,mint,.08,1.02,-.075,.22,.45,.055);
 for(let i=0;i<7;i++)for(let j=0;j<4;j++){const b=add(new T.CylinderGeometry(.023,.028,.28,8),i%3===0?mint:white,g,-.075+j*.105,.69+i*.11,.23);b.rotation.x=Math.PI/2;}
 if(paste)tube(g,[[.04,.77,.41],[.08,.94,.46],[.08,1.13,.46],[.14,1.27,.42]],.078,mint);return g;}
function drill(p,polish=false){const g=group(p);tube(g,[[0,1.7,0],[0,.7,0],[.25,.2,0],[.48,.04,0]],.11,steel);sphere(g,steel,.48,.025,0,.16,.16,.15);for(let i=0;i<6;i++){const ring=add(new T.TorusGeometry(.115,.014,8,32),steel,g,0,.8+i*.1,0);ring.rotation.x=Math.PI/2;}const bit=add(new T.CylinderGeometry(.024,.035,.38,16),steel,g,.48,-.24,0);actors.bit=bit;sphere(g,polish?mint:steel,.48,-.46,0,polish?.12:.045,polish?.065:.075,polish?.12:.045);return g;}
function hole(p){const g=group(p,0,.575,0);sphere(g,dark,0,0,0,.25,.025,.22);sphere(g,dark,.09,.008,.05,.16,.025,.13);sphere(g,material('#251b15'),0,.018,0,.15,.018,.12);return g;}
function clear(){world.traverse(o=>{if(o.geometry)o.geometry.dispose();});world.clear();actors={};drag=0;start=clock;sequence=false;}
function fitModel(){
 if(!world?.children.length)return;
 world.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(world),ball=bounds.getBoundingSphere(new T.Sphere());
 const vertical=T.MathUtils.degToRad(camera.fov/2),horizontal=Math.atan(Math.tan(vertical)*camera.aspect);
 const distance=ball.radius/Math.sin(Math.min(vertical,horizontal))*1.08;
 const direction=actors.viewDirection||new T.Vector3(5,4.4,8).normalize();
 camera.position.copy(ball.center).addScaledVector(direction,distance);camera.lookAt(ball.center);camera.updateProjectionMatrix();
}
function build(mode){if(!world)return;clear();actors.mode=mode;camera.position.set(5,4.4,8);camera.lookAt(0,-.25,0);world.rotation.y=-.2;
 if(['teeth','gums','braces','brushing','floss','cleaning'].includes(mode)){
  actors.mouth=mouth(world,mode==='braces');world.position.y=.2;world.scale.setScalar(1.13);camera.position.set(1,3.2,9);camera.lookAt(0,0,0);
  if(mode==='gums'){world.children[0].children.forEach(o=>{if(o.material===gumMat)o.material=gumMat;});}
  if(mode==='brushing'||mode==='cleaning'){actors.tool=brush(world,true);actors.tool.scale.setScalar(.65);actors.tool.rotation.z=-Math.PI/2;actors.tool.rotation.x=Math.PI;actors.tool.position.set(-.65,.1,.5);}
  if(mode==='floss'){const f=group(world);tube(f,[[-1.6,1.1,.3],[-.35,.7,.28],[0,-.1,.16],[.35,.7,.28],[1.6,1.1,.3]],.018,white);sphere(f,mint,-1.6,1.1,.3,.12);sphere(f,mint,1.6,1.1,.3,.12);actors.floss=f;}
 }else if(mode==='brush'){world.position.y=0;world.scale.setScalar(1.5);actors.tool=brush(world);actors.tool.rotation.z=-.4;}
 else if(mode==='paste'){world.position.y=0;world.scale.setScalar(1.2);const p=group(world,-.6,.6,0);const body=add(new T.CylinderGeometry(.4,.55,2.4,32),mint,p);body.rotation.z=-.35;const cap=add(new T.CylinderGeometry(.25,.25,.5,24),white,p,.47,-1.25,0);cap.rotation.z=-.35;const b=brush(world,true);b.position.set(1.3,-.1,.2);b.rotation.z=.25;}
 else if(mode==='xray'){world.position.y=0;world.scale.setScalar(1);const plate=add(new T.BoxGeometry(4.9,4.1,.1),material('#102b44'),world,0,-.1,-.7);for(const x of [-1.4,0,1.4]){const t=tooth(world,x,.5,-.2,.7);t.traverse(o=>{if(o.isMesh)o.material=material('#afd7d9',.6);});}camera.position.set(1,1.6,9);camera.lookAt(0,-.2,0);}
 else{
  world.scale.setScalar(1.55);world.position.y=.35;actors.tooth=tooth(world);
  if(['cavity','drill','filling','polish'].includes(mode)){actors.hole=hole(world);camera.position.set(4.5,6,7);camera.lookAt(0,.2,0);}
  if(['drill','polish'].includes(mode)){actors.tool=drill(world,mode==='polish');actors.tool.position.set(1.6,2.1,.2);}
  if(['filling','polish'].includes(mode)){actors.filling=sphere(world,enamel,0,.59,0,.26,.035,.23);actors.filling.visible=mode==='polish';}
  if(mode==='filling'){const tool=group(world,1.4,2,0);tube(tool,[[0,1.2,0],[0,.3,0],[-.2,0,0]],.07,steel);sphere(tool,steel,-.2,-.04,0,.1,.045,.1);actors.tool=tool;}
  if(mode==='pain'){actors.rings=[];for(let i=0;i<3;i++){const r=add(new T.TorusGeometry(.85+i*.12,.028,8,64),material('#dc5639'),world);r.rotation.x=.7;r.position.set(0,.2,0);actors.rings.push(r);}}
  if(mode==='drawing'){actors.tooth.rotation.y=.4;actors.hole=hole(world);add(new T.BoxGeometry(.24,.22,.15),steel,world,.3,.15,.71);}
 }
 $('#scene-label').textContent=mode==='xray'?'':mode==='gums'?'GUMS':mode==='drill'?'Ready?':mode==='filling'?'Ready?':'';
 actors.viewDirection=camera.position.clone().normalize();fitModel();
}
function setup(){
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 try{renderer=new T.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.setClearColor(0xffffff,0);$('#stage').prepend(renderer.domElement);
 renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
 scene=new T.Scene();camera=new T.PerspectiveCamera(38,1,.1,60);scene.add(new T.HemisphereLight(0xf3fffd,0x66736f,1.8));const key=new T.DirectionalLight(0xfff3e2,3);key.position.set(3,7,5);scene.add(key);const rim=new T.DirectionalLight(0xb8ede6,2);rim.position.set(-5,3,-3);scene.add(rim);world=new T.Group();scene.add(world);
 const resize=()=>{const b=$('#stage').getBoundingClientRect();renderer.setSize(b.width,b.height,false);camera.aspect=b.width/b.height;camera.updateProjectionMatrix();fitModel();};new ResizeObserver(resize).observe($('#stage'));resize();
 let pointer=null;renderer.domElement.addEventListener('pointerdown',e=>{pointer=e.clientX;renderer.domElement.setPointerCapture(e.pointerId);});renderer.domElement.addEventListener('pointermove',e=>{if(pointer===null)return;drag+=(e.clientX-pointer)*.008;pointer=e.clientX;});renderer.domElement.addEventListener('pointerup',()=>pointer=null);renderer.domElement.addEventListener('pointercancel',()=>pointer=null);
 requestAnimationFrame(animate);
 }catch{renderer?.domElement.remove();renderer=null;world=null;}
}
function animate(now){requestAnimationFrame(animate);const delta=Math.min((now-previous)/1000,.05);previous=now;if(!paused&&!document.hidden)clock+=delta;if(!renderer||!world||renderer.domElement.hidden||document.hidden)return;const t=clock-start,m=actors.mode;world.rotation.y=drag+Math.sin(t*.32)*.12-.15;
 if(actors.tool&&['brushing','cleaning'].includes(m)){const sweep=Math.sin(t*.55)*1.75;actors.tool.position.x=sweep-.65+Math.sin(t*9)*.045;actors.tool.position.y=.05+Math.sin(t*9)*.06;actors.tool.position.z=.5+(1-Math.cos(sweep/3.5))*3.5;actors.tool.rotation.y=-sweep/3.5;}
 if(actors.floss)actors.floss.position.y=Math.sin(t*1.8)*.18;
 if(actors.rings)actors.rings.forEach((r,i)=>{const pulse=(t*.8+i/3)%1;r.scale.setScalar(1+pulse*.45);r.visible=pulse<.85;});
 if(['drill','filling','polish'].includes(m)&&sequence){const p=Math.min(t/8,1),ease=v=>{v=T.MathUtils.clamp(v,0,1);return v*v*(3-2*v);},approach=ease(p/.2),retreat=ease((p-.8)/.2),work=p>.2&&p<.8,lift=1-approach+retreat;
  if(m==='drill'){actors.tool.position.set(-.48+lift*1.3+(work?Math.sin(t*3)*.07:0),1.08+lift*1.2,work?Math.cos(t*3)*.055:0);actors.bit.rotation.y=t*28;actors.hole.scale.setScalar(1-.28*ease((p-.2)/.6));$('#scene-label').textContent=p<.2?'THE DENTAL DRILL':p<.8?'REMOVE THE DECAY':'READY FOR A FILLING';}
  if(m==='filling'){const amount=ease((p-.2)/.6);actors.tool.position.set(.2+lift*1.2,.68+lift*1.3,0);actors.filling.visible=amount>0;actors.filling.scale.set(.26*amount,.035,.23*amount);actors.hole.visible=amount<.98;$('#scene-label').textContent=p<.8?'FILL THE CAVITY':'A FILLING';}
  if(m==='polish'){actors.hole.visible=false;actors.tool.position.set(-.48+lift*1.3+(work?Math.sin(t*4)*.1:0),1.12+lift*1.2,work?Math.cos(t*4)*.075:0);actors.bit.rotation.y=t*20;$('#scene-label').textContent=p<.8?'POLISH THE FILLING':'SMOOTH';}
 }else if(m==='polish'){actors.hole.visible=false;}
 renderer.render(scene,camera);
}
function save(){controls.save({index,grade,source});}
function newChallenge(){
 const choices=deck();
 if(!bag.length&&drawn){
  complete=true;
  render();
  return;
 }
 if(!bag.length)bag=choices.map((_,i)=>i);
 const pick=Math.floor(Math.random()*bag.length);
 currentChallenge=choices[bag.splice(pick,1)[0]];
 drawn++;
 reveal=false;
 render();
}

function stage(mode){
 const art=$('#illustration');
 const isVisualFallback=!world||mode==='custom';
 art.hidden=!isVisualFallback;
 if(renderer)renderer.domElement.hidden=isVisualFallback;
 $('#replay').disabled=isVisualFallback;
 $('#pause').disabled=isVisualFallback;
 $('#scene-label').textContent='';
 if(isVisualFallback){
  const artMode={drill:'cavity',polish:'filling',drawing:'tooth',custom:'mystery'}[mode]||mode;
  art.innerHTML=objectSVG(artMode);
  return;
 }
 art.replaceChildren();
 world.position.set(0,0,0);
 world.scale.setScalar(1);
 build(mode);
 if(slides[index].scene==='challenge'&&mode==='filling'){
  actors.filling.visible=true;
  actors.hole.visible=false;
 }
}

function render(){
 const s=slides[index];
 $('#eyebrow').textContent=s.tag;
 $('#word').textContent=s.word;
 let phrase=s.phrase;
 if(s.scene==='drawing')phrase=index===19?['Draw one tooth. Add three clues.\n“This is a tooth. It has…”','Draw one tooth. Add three clues.\n“My tooth hurts. I need…”','Create a patient. Add three clues.\nDescribe the problem and ask a follow-up.'][grade-1]:['“It has…”\n“What is it?”','“My patient has…”\n“What does the patient need?”','“How long has it hurt?”\n“Could you explain that?”'][grade-1];
 if(index===17&&grade===3)phrase='“How long has it hurt?”\n“Since yesterday.”';
 $('#answer').hidden=true;
 $('#action').hidden=true;
 $('#challenge-source').hidden=s.scene!=='challenge'||!customDeck;
 let mode=s.scene;
 if(s.scene==='challenge'){
  if(!currentChallenge&&!complete){newChallenge();return;}
  $('#action').hidden=false;
  if(complete){
   mode='custom';
   $('#word').textContent='Practice complete';
   phrase=`You reviewed ${drawn} clues.`;
   $('#action').textContent='Play again';
  }else{
   mode=currentChallenge.scene;
   phrase=currentChallenge.clue;
   $('#answer').textContent=reveal?currentChallenge.answer:'';
   $('#answer').hidden=!reveal;
   $('#action').textContent=reveal?'Another challenge':'Show answer';
  }
 }else if(world&&animatedScenes.includes(mode)){
  $('#action').hidden=false;
  $('#action').textContent='Play animation';
 }
 $('#phrase').textContent=phrase;
 $('#count').textContent=`${index+1} / ${slides.length}`;
 $('#prev').disabled=index===0;
 $('#next').disabled=index===slides.length-1;
 $('#dots').innerHTML=slides.map((_,i)=>`<i class="${i===index?'active':''}"></i>`).join('');
 document.querySelectorAll('[data-grade]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.grade)===grade)));
 $('#note-title').textContent=s.word;
 $('#note-text').textContent=s.note;
 stage(mode);
 save();
}

function resetPractice(){currentChallenge=null;bag=[];drawn=0;complete=false;reveal=false;newChallenge();}
function action(){
 if(index===practice){
  if(complete){resetPractice();return;}
  if(reveal){newChallenge();return;}
  reveal=true;
  $('#answer').textContent=currentChallenge.answer;
  $('#answer').hidden=false;
  $('#action').textContent='Another challenge';
 }else if(world&&animatedScenes.includes(actors.mode)){
  start=clock;sequence=true;$('#action').textContent='Replay animation';
 }
}
function goTo(slide){
 index=Math.max(0,Math.min(slides.length-1,slide));
 hidden=false;
 $('#copy').classList.remove('word-hidden');
 render();
}
function move(step){goTo(index+step);}

$('#prev').onclick=()=>move(-1);
$('#next').onclick=()=>move(1);
$('#challenge-jump').onclick=()=>goTo(practice);
$('#action').onclick=action;
$('#replay').onclick=()=>{render();if(animatedScenes.includes(actors.mode))action();};
$('#pause').onclick=()=>{paused=!paused;$('#pause').textContent=paused?'Resume':'Pause';};
$('#hide').onclick=()=>{hidden=!hidden;$('#copy').classList.toggle('word-hidden',hidden);$('#hide').setAttribute('aria-pressed',String(hidden));};
function notes(){const dialog=$('#notes');if(dialog.open)dialog.close();else dialog.showModal();}
$('#guide').onclick=notes;
$('#close-notes').onclick=notes;
$('#full').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{}};
document.querySelectorAll('[data-grade]').forEach(button=>button.onclick=()=>{grade=Number(button.dataset.grade);render();});
if(customDeck){
 $('#challenge-bank').append(new Option(controls.pack.title,'custom'));
 $('#challenge-bank').value=source;
 $('#challenge-bank').onchange=event=>{source=event.target.value;resetPractice();};
}
document.addEventListener('keydown',event=>{
 if(event.defaultPrevented||event.altKey||event.metaKey||event.ctrlKey||event.repeat||/INPUT|TEXTAREA|SELECT/.test(event.target.tagName))return;
 const key=event.key.toLowerCase();
 if(key==='t'){notes();return;}
 if($('#notes').open)return;
 if(key==='arrowleft'||key==='pageup'){event.preventDefault();move(-1);}
 if(key==='pagedown'){event.preventDefault();move(1);}
 if(key===' '&&!event.target.closest('button,a[href],summary')&&!$('#action').hidden){event.preventDefault();action();}
 const shortcuts={r:'replay',p:'pause',f:'full'};
 if(shortcuts[key])$('#'+shortcuts[key]).click();
});
setup();
render();
