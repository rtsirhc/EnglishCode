export const clamp=v=>Math.max(0,Math.min(1,v));
export const smooth=v=>{v=clamp(v);return v*v*(3-2*v);};
export const outCubic=v=>1-(1-clamp(v))**3;
export const inCubic=v=>clamp(v)**3;
export const mix=(a,b,v)=>a+(b-a)*v;
export const ACTION_DURATION=1.05;
export const IMPACT_TIME=.36;
// Hand-authored anticipation, fast attack, brief contact, slow recovery.
export function actionPose(seconds){
 const t=Math.max(0,seconds);
 let strike,windup;
 if(t<.22){windup=smooth(t/.22);strike=0;}
 else if(t<IMPACT_TIME){windup=1;strike=inCubic((t-.22)/.14);}
 else if(t<.43){windup=1;strike=1;}
 else{const recovery=smooth((t-.43)/.62);windup=1-recovery;strike=1-recovery;}
 const contact=t>=IMPACT_TIME&&t<.43;
 const shock=t>=IMPACT_TIME?Math.exp(-(t-IMPACT_TIME)*11)*Math.sin((t-IMPACT_TIME)*34):0;
 return {windup,strike,contact,shock,done:t>=ACTION_DURATION,progress:clamp(t/ACTION_DURATION)};
}
export function gait(phase,index){
 const offsets=[0,Math.PI*.68,Math.PI*1.05,Math.PI*1.75];
 const p=((phase+offsets[index])%(Math.PI*2)+Math.PI*2)%(Math.PI*2);
 // Hoof contact occupies more of the cycle than the airborne recovery.
 return {hip:Math.sin(p)*.65,knee:Math.max(0,-Math.sin(p-.35))*1.05,lift:Math.max(0,Math.sin(p))};
}
