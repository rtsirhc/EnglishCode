let id=0;
// Lose the front teeth first, then alternating upper/lower teeth: recognisable gap-toothed smiles.
export const lossOrder=[1,6,3,4,0,7,2,5];
export function smileSVG(count,color='#62dfce'){
 const clip=`mouth-${++id}`,missing=new Set(lossOrder.slice(0,8-count));
 return `<svg class="row-smile" viewBox="0 0 220 120" role="img" aria-label="Smiling face with ${count} teeth"><defs><clipPath id="${clip}"><path d="M28 54Q110 77 192 54Q186 116 110 116Q34 116 28 54Z"/></clipPath></defs><path d="M19 48Q19 4 64 8L157 8Q204 6 203 48L197 77Q188 120 110 119Q33 120 22 77Z" fill="${color}"/><path d="M50 35q14-14 28 0m65 0q14-14 28 0" stroke="#173243" stroke-width="7" stroke-linecap="round" fill="none"/><ellipse cx="40" cy="52" rx="13" ry="6" fill="#f88f9d" opacity=".6"/><ellipse cx="181" cy="52" rx="13" ry="6" fill="#f88f9d" opacity=".6"/><path d="M28 54Q110 77 192 54Q186 116 110 116Q34 116 28 54Z" fill="#402a48" stroke="#173243" stroke-width="4"/><g clip-path="url(#${clip})"><ellipse cx="111" cy="112" rx="35" ry="15" fill="#ef83a1"/>${Array.from({length:8},(_,i)=>missing.has(i)?'':`<rect data-tooth="${i}" x="${48+(i%4)*32}" y="${i<4?51:96}" width="30" height="30" rx="7" fill="#fff9de" stroke="#253848" stroke-width="2"/>`).join('')}</g></svg>`;
}
