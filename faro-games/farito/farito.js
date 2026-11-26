// Original vector mascot. No remote assets; blink/float respect reduced-motion.
let sequence=0;
export function farito(size='small'){
  const id='farito-'+(++sequence);
  return `<span class="farito ${size}" aria-hidden="true"><svg viewBox="0 0 240 260" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="${id}-body" x1="70" y1="90" x2="185" y2="225" gradientUnits="userSpaceOnUse"><stop stop-color="#DCFFF1"/><stop offset=".48" stop-color="#8BEACE"/><stop offset="1" stop-color="#35B8BA"/></linearGradient>
      <linearGradient id="${id}-roof" x1="87" y1="48" x2="155" y2="90" gradientUnits="userSpaceOnUse"><stop stop-color="#FFBA8E"/><stop offset="1" stop-color="#FC7188"/></linearGradient>
    </defs>
    <ellipse class="farito-shadow" cx="121" cy="240" rx="66" ry="10" fill="#060C23" opacity=".35"/>
    <g class="farito-float">
      <path class="farito-beam" d="M103 74 24 43v74l79-24M140 74l77-31v74l-77-24" fill="#B2FAED" opacity=".22"/>
      <path d="M80 148c-24-8-39 8-35 27 3 13 17 18 31 13" fill="#68D3C2"/>
      <path class="farito-hand" d="M163 154c15-15 26-12 31 0 7 16-1 31-20 32" fill="#7DE1C9"/>
      <path d="M91 97h58l26 115c3 13-8 23-20 23H84c-14 0-25-9-22-23L91 97Z" fill="url(#${id}-body)"/>
      <path d="m146 103 24 109c2 10-5 17-16 18l-13-125" fill="#35ACAE" opacity=".18"/>
      <rect x="87" y="68" width="66" height="33" rx="10" fill="#F8D981"/>
      <path d="M99 70v29m21-29v29m21-29v29" stroke="#A66A4D" stroke-width="5" stroke-linecap="round"/>
      <rect x="82" y="97" width="77" height="11" rx="5.5" fill="#FC8995"/>
      <path d="M80 68c2-9 13-21 29-26h23c16 5 28 17 29 26H80Z" fill="url(#${id}-roof)"/>
      <rect x="113" y="28" width="15" height="18" rx="7" fill="#FDB591"/>
      <path d="M79 194c27 11 57 15 88 5l4 17c-37 13-70 5-95-5l3-17Z" fill="#FFF5DE" opacity=".9"/>
      <g class="farito-eyes"><path d="M95 141c0-6 4-10 8-10s8 4 8 10" stroke="#173749" stroke-width="7" stroke-linecap="round"/><path d="M132 141c0-6 4-10 8-10s8 4 8 10" stroke="#173749" stroke-width="7" stroke-linecap="round"/></g>
      <ellipse cx="87" cy="153" rx="9" ry="5" fill="#F591AD" opacity=".72"/><ellipse cx="153" cy="153" rx="9" ry="5" fill="#F591AD" opacity=".72"/>
      <path d="M110 155c5 9 15 9 21 0" stroke="#173749" stroke-width="5" stroke-linecap="round"/>
      <path d="M114 215a8 8 0 0 1 16 0v17h-16v-17Z" fill="#208A99"/>
      <path d="m83 115-9 43" stroke="#F2FFF5" stroke-width="6" stroke-linecap="round" opacity=".7"/>
    </g>
  </svg></span>`;
}
