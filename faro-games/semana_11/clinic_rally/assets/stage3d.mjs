import * as T from './three/three.module.js';
import {actionPose,ACTION_DURATION,IMPACT_TIME,mix,smooth,gait} from './motion.mjs';

// Local realtime scenes. Only the projected board loads the renderer.
const palette=[0x48dfcc,0xffba44,0xec83c9,0x91a9ff,0x95df66];
let active=null,frame=0;
export function pauseRendering(){cancelAnimationFrame(frame);}
export function inspect(){return active?{mode:active.mode,clock:active.clock,drawCalls:active.renderer.info.render.calls,triangles:active.renderer.info.render.triangles,width:active.renderer.domElement.width,height:active.renderer.domElement.height,actors:active.actors.map(a=>({score:a.score,shown:a.shown,queued:a.queue.length,action:a.action?.time,handErrors:a.actor?.ik?.map(r=>r.error),position:a.base.position.toArray()}))}:null;}
export function renderPreview(seconds){if(!active)return;active.renderer.setPixelRatio(1);active.previewDelta=seconds;active.draw(performance.now());cancelAnimationFrame(frame);}
const mat=(color,roughness=.55,metalness=.06)=>new T.MeshStandardMaterial({color,roughness,metalness});
const mats={skin:mat(0xf2b585),dark:mat(0x222d3f),white:mat(0xfffbdf),wood:mat(0x8d4e29),cut:mat(0xf6ca81),boot:mat(0x65432f),gold:mat(0xf8bc41,.3,.35),steel:mat(0xc7dbdf,.25,.6)};
function texture(kind){const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle=kind==='wood'?'#a5754a':kind==='grass'?'#77934e':'#bc9161';x.fillRect(0,0,256,256);let seed=1927;const rand=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};for(let i=0;i<(kind==='wood'?280:7000);i++){const px=rand()*256,py=rand()*256;x.fillStyle=kind==='wood'?`rgba(40,17,5,${rand()*.35})`:kind==='grass'?`rgba(${rand()>.5?'32,61,23':'178,187,97'},${rand()*.4})`:`rgba(${rand()>.5?'76,48,29':'236,204,152'},${rand()*.3})`;x.fillRect(px,py,kind==='wood'?1:rand()*2+1,kind==='wood'?20+rand()*120:rand()*3+1);}const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(kind==='wood'?1:8,kind==='wood'?1:8);return t;}
mats.wood.map=texture('wood');
function mesh(g,m,parent,x=0,y=0,z=0){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;if(parent)parent.add(o);return o;}
function box(parent,m,x,y,z,w,h,d,r=0){const o=mesh(new T.BoxGeometry(w,h,d),m,parent,x,y,z);o.rotation.y=r;return o;}
function ball(parent,m,x,y,z,sx,sy=sx,sz=sx){const o=mesh(new T.SphereGeometry(1,20,14),m,parent,x,y,z);o.scale.set(sx,sy,sz);return o;}
function cyl(parent,m,x,y,z,r,h,rt=r){return mesh(new T.CylinderGeometry(rt,r,h,16),m,parent,x,y,z);}
function group(parent,x=0,y=0,z=0){const o=new T.Group();o.position.set(x,y,z);parent.add(o);return o;}
function lineBetween(parent,a,b,color=0xfff6d2,width=.025){const p=new T.Vector3(...a),q=new T.Vector3(...b),d=q.clone().sub(p);const o=mesh(new T.CylinderGeometry(width,width,d.length(),6),mat(color),parent,...p.clone().add(q).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return o;}
function poseSegment(mesh,a,b){const direction=b.clone().sub(a);mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.scale.y=direction.length();mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),direction.normalize());}
function rigHands(actor){
 actor.ik=actor.arms.map((arm,i)=>{arm.shoulder.visible=false;const upper=mesh(new T.CylinderGeometry(.13,.14,1,12),actor.shirt,actor.body),lower=mesh(new T.CylinderGeometry(.095,.11,1,12),mats.skin,actor.body),joint=ball(actor.body,mats.skin,0,0,0,.115),hand=ball(actor.body,mats.white,0,0,0,.13,.15,.13);return {upper,lower,joint,hand,origin:new T.Vector3(i===0?-.4:.4,.5,0),side:i===0?-1:1};});
}
function reach(actor,index,world){
 const rig=actor.ik[index],target=actor.body.worldToLocal(world.clone()),a=rig.origin,direction=target.clone().sub(a),distance=direction.length();direction.normalize();
 const d=Math.min(.82,Math.max(.07,distance)),wrist=a.clone().addScaledVector(direction,d),along=(.44*.44-.4*.4+d*d)/(2*d),height=Math.sqrt(Math.max(0,.44*.44-along*along));
 const bend=new T.Vector3(rig.side,-.15,-.7);bend.addScaledVector(direction,-bend.dot(direction)).normalize();const elbow=a.clone().addScaledVector(direction,along).addScaledVector(bend,height);
 poseSegment(rig.upper,a,elbow);poseSegment(rig.lower,elbow,wrist);rig.joint.position.copy(elbow);rig.hand.position.copy(wrist);rig.hand.rotation.x=-.3;rig.error=wrist.distanceTo(target);
}
function person(parent,color,x=0,z=0){
 const root=group(parent,x,0,z),shirt=mat(color),pants=mat(0x293c58),helmet=mat(color,.3),skin=mats.skin;
 const body=group(root,0,1.15,0);ball(body,shirt,0,.22,0,.4,.57,.26);ball(body,pants,0,.05,.23,.3,.3,.055);for(const side of [-1,1]){box(body,pants,side*.18,.38,.24,.08,.4,.05);ball(body,mats.gold,side*.18,.36,.28,.027,.027,.015);}ball(body,shirt,0,.65,.02,.21,.08,.23);
 const legs=[];
 for(const side of [-1,1]){const leg=group(root,side*.19,.8,0);mesh(new T.CapsuleGeometry(.15,.43,6,12),pants,leg,0,-.22,0);ball(leg,mats.boot,0,-.66,.12,.19,.15,.3);box(leg,mats.dark,0,-.78,.12,.34,.06,.5);legs.push(leg);}
 const neck=cyl(body,skin,0,.76,0,.12,.17);
 const head=group(body,0,1.04,0);ball(head,skin,0,0,0,.37,.4,.32);ball(head,skin,-.37,-.015,0,.08,.12,.1);ball(head,skin,.37,-.015,0,.08,.12,.1);ball(head,skin,0,-.04,.32,.09,.1,.09);
 const eyes=[];for(const side of [-1,1]){ball(head,mats.white,side*.14,.09,.286,.105,.12,.045);eyes.push(ball(head,mats.dark,side*.13,.085,.33,.045,.065,.026));box(head,mats.boot,side*.14,.25,.28,.18,.035,.04,side*.12);}
 const smile=mesh(new T.TorusGeometry(.115,.018,6,16,Math.PI),mats.boot,head,0,-.13,.305);smile.rotation.z=Math.PI;
 ball(head,helmet,0,.31,-.015,.405,.18,.36);box(head,helmet,0,.27,.18,.85,.055,.5);box(head,mats.white,0,.4,.305,.18,.085,.025);
 const arms=[];for(const side of [-1,1]){const shoulder=group(body,side*.4,.5,0);mesh(new T.CapsuleGeometry(.13,.24,5,10),shirt,shoulder,0,-.17,0);const elbow=group(shoulder,0,-.4,0);mesh(new T.CapsuleGeometry(.105,.2,5,10),skin,elbow,0,-.15,0);ball(elbow,mats.white,0,-.34,0,.13,.15,.13);arms.push({shoulder,elbow});}
 return {root,body,head,eyes,legs,arms,shirt};
}
function cloud(scene,x,y,z,size=1){const g=group(scene,x,y,z),m=new T.MeshStandardMaterial({color:0xffffff,roughness:1});for(let i=0;i<4;i++)ball(g,m,(i-1.5)*.8,Math.sin(i)*.2,0,size*(.55+i%2*.2),size*.4,size*.45);return g;}
function tree(scene,x,z,size=1){const g=group(scene,x,0,z);cyl(g,mats.wood,0,1.5*size,0,.22*size,3*size);const m=mat([0x387950,0x428957,0x6b984f][Math.floor(Math.abs(x+z))%3]);for(let i=0;i<3;i++)mesh(new T.ConeGeometry((1.6-i*.3)*size,2*size,9),m,g,0,(2.5+i*.9)*size,0);return g;}
function terrain(mode,scene,width){
 const ground=mesh(new T.PlaneGeometry(150,150,40,40),mat(mode===3?0x5d853c:mode===4?0x34305b:mode===0?0x78a64f:mode===1?0x0c92ad:0x111a38),scene,0,-.08,0);ground.rotation.x=-Math.PI/2;
 if(mode===3||mode===0){ground.material.map=texture('grass');ground.material.color.set(0xffffff);}
 const deco={ground,clouds:[],trees:[],flags:[],particles:[],water:null,stars:null,crowd:null,meteors:[]};
 if(mode===3){
  scene.background=new T.Color(0xafd9bc);scene.fog=new T.Fog(0xafd9bc,28,75);
  for(let i=0;i<34;i++){const x=(i%17-8)*3.8,z=-7-Math.floor(i/17)*8;deco.trees.push(tree(scene,x,z,1.2+(i%4)*.22));}
  for(let i=0;i<16;i++){const rock=mesh(new T.DodecahedronGeometry(.35+i%3*.12),mat(0x89907c),scene,(i-8)*3.3,.2,-5-i%3);rock.scale.y=.6;}
  for(let i=0;i<5;i++)deco.clouds.push(cloud(scene,(i-2)*12,10,-18-i%2*5,2));
 }else if(mode===4){
  scene.background=new T.Color(0x2a2852);scene.fog=new T.Fog(0x2a2852,40,85);
  box(scene,mat(0x464276),0,-.1,0,width+5,.3,9);
  for(let i=0;i<9;i++){const g=group(scene,(i-4)*4,0,-5);cyl(g,mats.gold,0,3,0,.05,6);ball(g,mat(palette[i%5],.25),0,5.8,0,.75,1,.7);}
  for(const x of [-width/2-1,width/2+1]){cyl(scene,mats.steel,x,3.5,-2,.1,7);const spot=new T.SpotLight(palette[x<0?0:2],100,25,.6,1);spot.position.set(x,7,-2);spot.target.position.set(0,0,1);scene.add(spot,spot.target);}
  for(let i=0;i<12;i++){const x=(i-5.5)*3;box(scene,mat(palette[i%5]),x,.08,-4,2.7,.06,.2);}
 }else if(mode===0){
  scene.background=new T.Color(0x9bd7f0);scene.fog=new T.Fog(0x9bd7f0,45,100);
  const dirt=mat(0xffffff);dirt.map=texture('dirt');box(scene,dirt,0,0,0,width+10,.06,19);
  for(let i=0;i<7;i++)box(scene,mat(0xe5be88),0,.045,-8+i*2.55,width+10,.01,.04);
  for(let side of [-1,1]){for(let i=0;i<4;i++)box(scene,mat(i%2?0x527e9b:0x466781),0,.5+i*.65,side*(12+i*.7),width+18,.6,1.1);for(let i=0;i<20;i++){const x=(i-9.5)*1.9;cyl(scene,mats.white,x,.8,side*10,.035,1.5);}box(scene,mats.white,0,1.4,side*10,width+18,.06,.06);}
  for(let i=0;i<8;i++){const x=(i-3.5)*5;deco.clouds.push(cloud(scene,x,9,-22-i%2*5,1.7));}
  for(let i=0;i<14;i++){const x=(i-6.5)*3.5;const pole=cyl(scene,mats.white,x,2.5,-13,.045,5);const flag=mesh(new T.PlaneGeometry(1,.65,6,2),new T.MeshStandardMaterial({color:palette[i%5],side:T.DoubleSide}),scene,x+.5,4.65,-13);deco.flags.push(flag);}
  const crowd=new T.InstancedMesh(new T.CapsuleGeometry(.11,.2,3,6),mat(0xffffff),400),d=new T.Object3D();for(let i=0;i<400;i++){const row=Math.floor(i/100),col=i%100;d.position.set((col-49.5)*.32,.85+row*.65,-12-row*.7);d.updateMatrix();crowd.setMatrixAt(i,d.matrix);crowd.setColorAt(i,new T.Color(palette[i%5]));}crowd.instanceMatrix.needsUpdate=true;scene.add(crowd);deco.crowd=crowd;
 }else if(mode===1){
  ground.visible=false;
  scene.background=new T.Color(0x91d5ec);scene.fog=new T.Fog(0x91d5ec,45,100);
  const geo=new T.PlaneGeometry(120,100,100,70);geo.rotateX(-Math.PI/2);const water=mesh(geo,new T.MeshStandardMaterial({color:0x087b9f,roughness:.2,metalness:.4}),scene,0,-.05,0);deco.water=water;
  for(let i=0;i<10;i++){const g=group(scene,(i-4.5)*6,0,-25-(i%3)*2);mesh(new T.ConeGeometry(4+i%3,5+i%4,8),mat(0x477d65),g,0,1,0);tree(g,1,1,.7);}
  for(let i=0;i<7;i++)deco.clouds.push(cloud(scene,(i-3)*8,10,-26,2));
 }else{
  scene.background=new T.Color(0x080b21);scene.fog=new T.Fog(0x080b21,50,120);
  ground.visible=false;
  const pts=[];for(let i=0;i<500;i++)pts.push((Math.random()-.5)*180,4+Math.random()*70,-Math.random()*100);const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(pts,3));const stars=new T.Points(geometry,new T.PointsMaterial({color:0xd9ebff,size:.12}));scene.add(stars);deco.stars=stars;
  const planet=ball(scene,mat(0x8b69c4,.4),-width*.45,3,-20,4);const ring=mesh(new T.TorusGeometry(5.6,.16,8,64),mat(0xbaa5e0,.4,.3),scene,-width*.45,3,-20);ring.rotation.x=1.1;ring.rotation.y=.3;
  for(let i=0;i<4;i++){const meteor=group(scene,i*8,5,-10-i*4);ball(meteor,new T.MeshBasicMaterial({color:0xd3f5ff}),0,0,0,.045);const tail=mesh(new T.ConeGeometry(.04,2.5,6),new T.MeshBasicMaterial({color:0x4d8aca,transparent:true,opacity:.35}),meteor,1,0,0);tail.rotation.z=Math.PI/2;deco.meteors.push(meteor);}
 }
 return deco;
}
function lumber(scene,color,x){
 const base=group(scene,x,0,0),actor=person(base,color,-.6,.15);rigHands(actor);actor.root.rotation.y=.12;
 cyl(base,mat(0x344a38),0,-.02,0,1.9,.2);cyl(base,mats.wood,.8,.4,0,.5,.8);cyl(base,mats.cut,.8,.81,0,.5,.035);
 const logs=[];for(let i=0;i<12;i++){const piece=group(base,.8,.86+i*.12,0);cyl(piece,mats.wood,0,0,0,.43,.115);cyl(piece,mats.cut,0,.058,0,.43,.008);for(let k=0;k<2;k++){const ring=mesh(new T.TorusGeometry(.12+k*.13,.008,4,24),mats.wood,piece,0,.064,0);ring.rotation.x=Math.PI/2;}logs.push(piece);}
 const tool=group(base,-.1,2.1,.45);cyl(tool,mats.wood,0,.2,0,.045,1);const head=cyl(tool,mats.cut,0,.7,0,.17,.4);head.rotation.z=Math.PI/2;
 return {base,actor,logs,tool,score:0,value:0,hit:0,balloon:null};
}
function pump(scene,color,x){
 const base=group(scene,x,0,0),actor=person(base,color,-.55,.2);rigHands(actor);actor.root.rotation.y=0;
 cyl(base,mat(0x373154),0,-.02,0,1.9,.2);
 box(base,mats.dark,-.55,.06,.75,.65,.1,.4);cyl(base,mats.gold,-.55,.45,.75,.13,.8);const handle=group(base,-.55,.75,.75);cyl(handle,mats.steel,0,.2,0,.04,.55);box(handle,mats.dark,0,.5,0,.9,.08,.1);
 const balloon=group(base,.95,1.15,0);const latex=new T.MeshPhysicalMaterial({color,roughness:.22,metalness:.04,clearcoat:1,clearcoatRoughness:.12});ball(balloon,latex,0,0,0,.65,.85,.62);mesh(new T.ConeGeometry(.08,.12,8),latex,balloon,0,-.86,0);lineBetween(base,[.95,.1,0],[.95,1.0,0],0xf9efd9,.012);const hose=new T.CatmullRomCurve3([new T.Vector3(.15,.2,.55),new T.Vector3(.65,.1,.6),new T.Vector3(.95,.4,.15),new T.Vector3(.95,1.0,0)]);mesh(new T.TubeGeometry(hose,16,.025,6,false),mats.dark,base);
 return {base,actor,balloon,handle,score:0,value:0,hit:0};
}
function horse(scene,color,z){
 const base=group(scene,-8,0,z),coat=mat(0x9a5938),mane=mat(0x382d2b),h=group(base);
 ball(h,coat,0,1.05,0,.75,.45,.3);const neck=ball(h,coat,.54,1.47,0,.26,.62,.25);neck.rotation.z=-.4;ball(h,coat,.85,1.92,0,.33,.22,.22);ball(h,mane,.98,1.98,.19,.045);ball(h,mane,.98,1.98,-.19,.045);
 for(const zz of [-.18,.18]){const ear=mesh(new T.ConeGeometry(.075,.28,8),coat,h,.72,2.2,zz);ear.rotation.z=-.2;}
 for(let i=0;i<7;i++)ball(h,mane,.34+i*.048,1.7+i*.06,-.025,.08,.11,.26);
 const legs=[];for(const x of [-.5,.46])for(const zz of [-.23,.23]){const leg=group(h,x,.95,zz);cyl(leg,coat,0,-.27,0,.075,.55);const knee=group(leg,0,-.53,0);cyl(knee,coat,0,-.2,0,.06,.4);box(knee,mane,.03,-.43,0,.2,.14,.14);legs.push({leg,knee});}
 const tail=group(h,-.7,1.15,0);const hair=mesh(new T.ConeGeometry(.16,.85,10),mane,tail,-.25,-.16,0);hair.rotation.z=-.8;
 const saddle=ball(h,mat(color),-.05,1.43,0,.4,.08,.36),rider=person(h,color,-.07,0);rider.root.scale.setScalar(.48);rider.root.position.y=1.3;rider.root.rotation.y=Math.PI/2;rider.legs.forEach((l,i)=>{l.rotation.x=i?-.5:.5;l.rotation.z=i?-.3:.3;});
 return {base,horse:h,legs,tail,rider,score:0,value:0,hit:0};
}
function boat(scene,color,z){
 const base=group(scene,-8,.2,z),body=group(base),m=mat(color,.25,.25);
 const shape=new T.Shape();shape.moveTo(-1.2,-.5);shape.lineTo(.85,-.5);shape.quadraticCurveTo(1.8,0,.85,.5);shape.lineTo(-1.2,.5);shape.closePath();const geo=new T.ExtrudeGeometry(shape,{depth:.3,bevelEnabled:true,bevelSize:.12,bevelThickness:.1,bevelSegments:3,steps:1});geo.rotateX(-Math.PI/2);mesh(geo,m,body,0,.25,0);
 ball(body,mats.white,-.25,.55,0,.8,.15,.4);const glass=ball(body,new T.MeshPhysicalMaterial({color:0x8ed4e9,transparent:true,opacity:.75,roughness:.08,metalness:.2}),.08,.75,0,.5,.33,.33);const driver=person(body,color,-.37,0);driver.root.scale.setScalar(.35);driver.root.position.y=.48;driver.root.rotation.y=Math.PI/2;
 const engine=cyl(body,mats.dark,-1.2,.2,0,.16,.4);engine.rotation.z=Math.PI/2;
 const wake=mesh(new T.ConeGeometry(.4,2.1,12,1,true),new T.MeshBasicMaterial({color:0xd8ffff,transparent:true,opacity:.4,side:T.DoubleSide}),base,-2,0,0);wake.rotation.z=Math.PI/2;wake.scale.z=.1;
 return {base,body,wake,driver,score:0,value:0,hit:0};
}
function ship(scene,color,z){
 const base=group(scene,-8,1.3,z),body=group(base),m=mat(color,.25,.65);
 const hull=ball(body,m,0,0,0,1.2,.3,.45);const nose=mesh(new T.ConeGeometry(.3,1.1,16),m,body,1.1,0,0);nose.rotation.z=-Math.PI/2;ball(body,mat(0x254663,.12,.5),.2,.24,0,.42,.22,.3);
 for(const side of [-1,1]){const wing=box(body,mats.white,-.45,0,side*.6,1.1,.1,.7,side*-.4);const engine=cyl(body,mats.dark,-.7,0,side*.55,.13,.55);engine.rotation.z=Math.PI/2;const glow=mesh(new T.ConeGeometry(.12,.9,12),new T.MeshBasicMaterial({color:0x5cf8ff}),body,-1.35,0,side*.55);glow.rotation.z=Math.PI/2;}
 const flame=group(body,-1.1,0,0);for(let i=0;i<3;i++){const o=mesh(new T.ConeGeometry(.2-i*.045,.8+i*.2,12),new T.MeshBasicMaterial({color:[0x48dfff,0x87fbff,0xffffff][i]}),flame,-i*.15,0,0);o.rotation.z=Math.PI/2;}
 return {base,body,flame,score:0,value:0,hit:0};
}
function particles(scene,mode){
 const count=mode===3?90:mode===4?120:60,positions=new Float32Array(count*3),velocities=[];
 for(let i=0;i<count;i++){positions[i*3]=(Math.random()-.5)*40;positions[i*3+1]=Math.random()*12;positions[i*3+2]=(Math.random()-.5)*20;velocities.push(.3+Math.random());}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(positions,3));const material=new T.PointsMaterial({color:mode===3?0xffd478:mode===4?0xffe089:0xb2f6ff,size:mode===3?.07:.045,transparent:true,opacity:.8});const points=new T.Points(geo,material);scene.add(points);return {points,velocities};
}
function makeTrail(actor,mode,color){const n=28,geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(new Float32Array(n*3),3));const material=new T.PointsMaterial({color:mode===0?0xe2bc8a:mode===1?0xe7ffff:0x63e6ff,size:mode===0?.12:.1,transparent:true,opacity:.5,depthWrite:false});const points=new T.Points(geo,material);actor.base.add(points);actor.trail=points;}
function makeHUD(container,g){const hud=document.createElement('div');hud.className='world-hud';hud.innerHTML=g.teams.map(t=>`<div class="world-label" data-world-team="${t.id}" style="--team:#${palette[t.id].toString(16).padStart(6,'0')}"><strong></strong><span></span></div>`).join('');container.append(hud);g.teams.forEach(t=>hud.querySelector(`[data-world-team="${t.id}"] strong`).textContent=t.name);return hud;}
export function dispose(){
 cancelAnimationFrame(frame);if(!active)return;active.observer.disconnect();active.hud.remove();const materials=new Set(),geometries=new Set();active.scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of (Array.isArray(o.material)?o.material:[o.material]))if(m&&!Object.values(mats).includes(m))materials.add(m);});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());active.renderer.dispose();active.renderer.forceContextLoss();active.renderer.domElement.remove();active=null;
}
export function update(g){if(!active)return;active.game=g;g.teams.forEach(t=>{const a=active.actors[t.id];if(!a)return;
 if(t.steps>a.score){for(let score=a.score+1;score<=t.steps;score++)a.queue.push(score);}
 else if(t.steps<a.score){a.queue=[];a.action=null;a.shown=t.steps;a.value=t.steps;}
 a.score=t.steps;const label=active.hud.querySelector(`[data-world-team="${t.id}"]`);if(label){label.querySelector('strong').textContent=t.name;label.querySelector('span').textContent=`${t.steps} / ${g.goal}`;}
 });}
function burst(a,actor,id){
 const origin=actor.base.position.clone();origin.y=a.mode===3?.86+(a.game.goal-actor.shown)*.12:a.mode===4?2: .5;origin.x+=a.mode===3?.8:a.mode===4?.95:-.6;
 const count=a.mode===4&&actor.shown>=a.game.goal?45:14;
 for(let i=0;i<count&&a.sparks.length<110;i++){const p=mesh(new T.BoxGeometry(a.mode===3?.13:.07,a.mode===3?.055:.12,.05),mat(a.mode===3?0xdca266:palette[(id+i)%5],.4),a.scene,...origin.toArray());p.userData.v=new T.Vector3((Math.random()-.5)*4,1.5+Math.random()*3,(Math.random()-.5)*2);p.userData.life=1+Math.random()*.5;a.sparks.push(p);}
 a.kick=.12;
 const label=a.hud.querySelector(`[data-world-team="${id}"]`);label?.classList.remove('world-score-hit');if(label){void label.offsetWidth;label.classList.add('world-score-hit');}
 if(a.mode<3){const ring=mesh(new T.TorusGeometry(.65,.04,6,36),new T.MeshBasicMaterial({color:palette[id],transparent:true,opacity:.8,depthWrite:false}),a.scene,...origin.toArray());ring.rotation.y=Math.PI/2;ring.userData.ring=true;ring.userData.life=.6;ring.userData.v=new T.Vector3(-1,0,0);a.sparks.push(ring);}
}
export function mount(container,g){
 const mode=g.mode??g.arena,key=`${g.id}:${mode}:${g.teams.length}`;
 if(active?.key===key){container.prepend(active.renderer.domElement);active.hud.remove();active.hud=makeHUD(container,g);active.container=container;container.classList.add('world-ready');active.observer.disconnect();active.observer.observe(container);update(g);return true;}
 dispose();container.querySelectorAll('.world-hud').forEach(n=>n.remove());let renderer;try{renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance',alpha:false});}catch{return false;}
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.25));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;renderer.domElement.className='world-canvas';container.prepend(renderer.domElement);container.classList.add('world-ready');
 const scene=new T.Scene(),width=g.teams.length*4.2+2;
 const camera=new T.PerspectiveCamera(38,1,.1,200);camera.position.set(0,10.8,18);camera.lookAt(0,1.5,0);
 const hemi=new T.HemisphereLight(mode===2?0x9ec5ff:0xe6f4ff,mode===3?0x597434:0x5a5667,2);scene.add(hemi);
 const sun=new T.DirectionalLight(mode===2?0x99afff:0xffe8bc,mode===2?2.4:3.5);sun.position.set(-9,18,12);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-width;sun.shadow.camera.right=width;sun.shadow.camera.top=14;sun.shadow.camera.bottom=-14;sun.shadow.normalBias=.04;scene.add(sun);
 const fill=new T.DirectionalLight(0x9acfff,1.2);fill.position.set(8,7,-10);scene.add(fill);
 const environment=terrain(mode,scene,width),actors=[];
 if(mode>=3){g.teams.forEach((t,i)=>actors.push((mode===3?lumber:pump)(scene,palette[i],(i-(g.teams.length-1)/2)*4.2)));}
 else{g.teams.forEach((t,i)=>actors.push((mode===0?horse:mode===1?boat:ship)(scene,palette[i],(i-(g.teams.length-1)/2)*2.8)));for(let i=0;i<13;i++)for(const side of [-1,1])box(scene,mat(i%2?0xffffff:0x202638),9,.2+i*.32,side*(g.teams.length*1.4+.5),.2,.32,.25);box(scene,mats.white,9,4.3,0,.15,.15,g.teams.length*2.8+1);}
 const atmospheric=particles(scene,mode),hud=makeHUD(container,g),observer=new ResizeObserver(()=>resize());
 active={key,mode,renderer,scene,camera,actors,container,environment,atmospheric,hud,observer,game:g,sparks:[],clock:0,kick:0,previewDelta:null};observer.observe(container);resize();actors.forEach((a,i)=>{a.score=g.teams[i].steps;a.value=a.score;a.shown=a.score;a.queue=[];a.action=null;a.boost=0;a.phase=i*.8;if(mode<3)makeTrail(a,mode,palette[i]);});update(g);
 let prev=performance.now(),slowFrames=0,qualityReduced=false;
 function animate(now){frame=requestAnimationFrame(animate);if(!active||active.key!==key||!active.container.isConnected)return;if(document.hidden){prev=now;return;}const elapsed=(now-prev)/1000,dt=active.previewDelta??Math.min(elapsed,.1);active.previewDelta=null;if(elapsed>.12)slowFrames++;else slowFrames=Math.max(0,slowFrames-1);if(slowFrames>=4&&!qualityReduced){renderer.setPixelRatio(.7);renderer.shadowMap.enabled=false;qualityReduced=true;}prev=now;active.clock+=dt;const t=active.clock,game=active.game,hud=active.hud,running=game.phase==='running';
  active.kick=T.MathUtils.damp(active.kick,0,12,dt);camera.position.x=Math.sin(t*.16)*.06+Math.sin(t*95)*active.kick*.25;camera.fov=38+(1-smooth(t/1.3))*1.5;camera.updateProjectionMatrix();camera.lookAt(0,mode>=3?1.6:.6,0);camera.updateMatrixWorld();
  actors.forEach((a,i)=>{
   if(!a.action&&a.queue.length){a.action={time:0,score:a.queue.shift(),impacted:false};}
   if(a.action&&game.phase!=='paused'){a.action.time+=dt;if(a.action.time>=IMPACT_TIME&&!a.action.impacted){a.shown=a.action.score;a.action.impacted=true;a.boost=1;burst(active,a,i);}if(a.action.time>=ACTION_DURATION){a.action=null;}}
   a.boost=T.MathUtils.damp(a.boost,0,3,dt);a.value=T.MathUtils.damp(a.value,a.shown,mode===4?9:6,dt);a.phase+=dt*(game.phase==='running'?7+a.boost*6:1.5);
   const pose=a.action?actionPose(a.action.time):{windup:0,strike:0,shock:0,contact:false},idle=Math.sin(t*2+i),p=a.value/game.goal;
   if(mode>=3){const actor=a.actor;actor.body.position.y=1.15+idle*.02;actor.body.rotation.set(0,0,0);actor.head.rotation.y=Math.sin(t*.7+i)*.08;actor.head.rotation.z=-pose.windup*.06+pose.strike*.1;const blinkPhase=(t+i*.7)%4.1;actor.eyes.forEach(e=>e.scale.y=.065*(blinkPhase<.13?Math.max(.08,Math.abs(blinkPhase-.065)/.065):1));actor.legs.forEach((l,k)=>l.rotation.z=Math.sin(t*1.5+i+k)*.015);
    if(mode===3){
     const lower=Math.max(0,(a.shown-1)/game.goal);actor.root.position.x=-.6+pose.strike*.12;actor.body.position.y-=lower*.42*pose.strike;actor.body.rotation.z=-pose.windup*.07+pose.strike*.14;actor.body.rotation.x=pose.strike*.12;
     a.tool.position.set(mix(-.18,-.42,pose.windup)+pose.strike*.48,mix(1.93,2.13,pose.windup)-pose.strike*(.3+lower*1.15),mix(.48,.3,pose.windup)+pose.strike*.25);
     a.tool.rotation.z=-.25+pose.windup*.65-pose.strike*1.45+pose.shock*.035;a.logs.forEach((log,k)=>{log.visible=k<game.goal-a.shown;log.rotation.z=pose.shock*.025;});
     actor.root.updateWorldMatrix(true,true);a.tool.updateWorldMatrix(true,true);reach(actor,1,a.tool.localToWorld(new T.Vector3(0,0,0)));reach(actor,0,a.tool.localToWorld(new T.Vector3(0,-.24,0)));
    }else{
     const press=pose.strike,breath=idle*.018;a.handle.position.y=1.0-press*.42+breath;actor.body.position.y=1.15-press*.16;actor.body.rotation.x=.04+press*.15;actor.head.rotation.x=press*.07;
     const scale=.27+p*.85,shock=pose.shock*.06;a.balloon.scale.set(scale*(1+shock),scale*(1-shock*.65),scale*(1+shock));a.balloon.position.y=1.15+scale*.74+Math.sin(t*1.7+i)*.025;a.balloon.rotation.z=Math.sin(t*2+i)*.025;a.balloon.visible=a.shown<game.goal;
     actor.root.updateWorldMatrix(true,true);a.handle.updateWorldMatrix(true,true);reach(actor,0,a.handle.localToWorld(new T.Vector3(-.32,.5,0)));reach(actor,1,a.handle.localToWorld(new T.Vector3(.32,.5,0)));
    }
   }else{
    a.base.position.x=-8+p*16;
    if(mode===0){a.horse.position.y=Math.sin(a.phase*2)*.055+a.boost*.08;a.horse.rotation.z=Math.sin(a.phase)*.025;a.legs.forEach(({leg,knee},k)=>{const v=gait(a.phase,k);leg.rotation.z=v.hip;knee.rotation.z=v.knee;});a.tail.rotation.x=Math.sin(t*7)*.25;a.rider.body.rotation.x=-.2-a.boost*.2+Math.sin(a.phase*2)*.04;a.rider.body.position.y=1.15+Math.sin(a.phase*2+.5)*.06;}
    else if(mode===1){a.base.position.y=.2+Math.sin(t*3+i)*.06+a.boost*.1;a.body.rotation.x=Math.sin(t*2+i)*.03;a.body.rotation.z=Math.sin(t*2.4+i)*.025+a.boost*.08;a.wake.scale.y=.8+a.boost*1.2+Math.sin(t*13+i)*.1;a.wake.material.opacity=.25+a.boost*.3;}
    else{a.base.position.y=1.25+Math.sin(t*2.3+i)*.09;a.body.rotation.x=Math.sin(t*2+i)*.04+a.boost*.08;a.body.rotation.z=-a.boost*.08;a.flame.scale.x=1+a.boost*1.4+Math.sin(t*30+i)*.1;}
    const trail=a.trail.geometry.attributes.position;for(let k=0;k<trail.count;k++){const life=((t*(mode===2?1.2:.8)+k/28)%1);trail.setXYZ(k,-1-life*(1.5+a.boost*1.8),mode===0?.08+Math.sin(k*23)*.04+life*.3:Math.sin(k*37+t)*.08,(Math.sin(k*43)*.15)*(1+life*2));}trail.needsUpdate=true;a.trail.material.opacity=(running?.22:.04)+a.boost*.4;
   }
   const point=new T.Vector3(a.base.position.x,3.8,a.base.position.z).project(camera);const label=hud.querySelector(`[data-world-team="${i}"]`);label.style.left=`${mode>=3?(point.x*.5+.5)*100:(i+.5)/actors.length*100}%`;label.style.top=`${mode>=3?Math.max(15,(-point.y*.5+.5)*100):15}%`;
  });
  environment.clouds.forEach((c,i)=>{c.position.x+=dt*(.12+i*.015);if(c.position.x>40)c.position.x=-40;});environment.trees.forEach((tree,i)=>tree.rotation.z=Math.sin(t*.8+i)*.007);
  environment.flags.forEach((flag,i)=>{const pos=flag.geometry.attributes.position;for(let j=0;j<pos.count;j++)pos.setZ(j,Math.sin(t*4+pos.getX(j)*5+i)*.12*(pos.getX(j)+.5));pos.needsUpdate=true;flag.geometry.computeVertexNormals();});
  if(environment.water){const pos=environment.water.geometry.attributes.position;for(let j=0;j<pos.count;j++){const x=pos.getX(j),z=pos.getZ(j);pos.setY(j,Math.sin(x*.65+t*1.7)*.1+Math.cos(z*.8+t*2.1)*.07);}pos.needsUpdate=true;environment.water.geometry.computeVertexNormals();}
  if(environment.stars)environment.stars.rotation.y=t*.003;
  environment.meteors.forEach((m,i)=>{m.position.x=20-((t*3.5+i*10)%45);m.position.y=4+Math.sin(t*.3+i)*.5;});
  if(environment.crowd){const d=new T.Object3D();for(let i=0;i<400;i++){const row=Math.floor(i/100);d.position.set((i%100-49.5)*.32,.85+row*.65+Math.max(0,Math.sin(t*3+i*.2))*.08,-12-row*.7);d.updateMatrix();environment.crowd.setMatrixAt(i,d.matrix);}environment.crowd.instanceMatrix.needsUpdate=true;}
  const pos=atmospheric.points.geometry.attributes.position;for(let i=0;i<pos.count;i++){pos.setY(i,pos.getY(i)-dt*atmospheric.velocities[i]*(mode===3?.4:mode===4?1:.1));pos.setX(i,pos.getX(i)+dt*Math.sin(t+i)*.15);if(pos.getY(i)<0)pos.setY(i,12);}pos.needsUpdate=true;
  active.sparks=active.sparks.filter(s=>{s.userData.life-=dt;if(s.userData.ring){s.scale.multiplyScalar(1+dt*2);s.material.opacity=Math.max(0,s.userData.life);}else{s.userData.v.y-=dt*7;s.rotation.x+=dt*8;s.rotation.z+=dt*4;}s.position.addScaledVector(s.userData.v,dt);if(s.userData.life<=0){scene.remove(s);s.geometry.dispose();s.material.dispose();return false;}return true;});
  renderer.render(scene,camera);
 }
 active.draw=animate;frame=requestAnimationFrame(animate);return true;
}
function resize(){if(!active)return;const {container,renderer,camera,mode}=active;const w=container.clientWidth,h=container.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;const width=mode>=3?active.game.teams.length*4.2+2:23;const dist=width/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2))*camera.aspect);camera.position.z=Math.max(mode>=3?10:17,dist);camera.position.y=camera.position.z*.48;camera.updateProjectionMatrix();}
