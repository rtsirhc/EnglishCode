export function art(p){
 const line='stroke="#234c3d" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"';
 const circle=(x,y,r,c)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" ${line}/>`;
 let shape='';const n=p.name;
 if(p.category==='fruit'||p.category==='veg'){
  const color={Apple:'#d84b43',Banana:'#f5ce45',Pineapple:'#e4b546',Mango:'#f5b443',Strawberries:'#e34d48',Orange:'#f39935',Lime:'#8fb753',Coconut:'#a0764c',Tamarind:'#aa7849',Raisins:'#77504b',Tomato:'#dc5750',Onion:'#e0b1cb',Garlic:'#efe3c3',Carrot:'#ed963f',Potato:'#caa675',Lettuce:'#87b957',Spinach:'#57a569',Broccoli:'#609c4a',Mushrooms:'#ba9676',Corn:'#f4d55b',Nopales:'#6b9e55',Beetroot:'#b55670',Pumpkin:'#e59a3d',Cucumber:'#5c9855'}[n]||'#88ac5d';
  if(n==='Banana')shape=`<path d="M35 27 Q50 105 119 74 Q78 128 32 72 Q17 47 35 27Z" fill="${color}" ${line}/>`;
  else if(n==='Carrot')shape=`<path d="M50 38 L86 47 L62 115Z" fill="${color}" ${line}/><path d="M57 37L42 17M66 38L67 11M74 40L90 20" ${line}/>`;
  else if(['Cucumber','Tamarind','Corn'].includes(n))shape=`<rect x="45" y="23" width="48" height="96" rx="24" fill="${color}" ${line}/><path d="M61 35V105M77 35V105" ${line}/>`;
  else if(n==='Nopales')shape=`<ellipse cx="72" cy="75" rx="31" ry="43" fill="${color}" ${line}/><path d="M55 52v5M77 47v5M66 73v5M87 85v5M52 96v5M77 106v5" ${line}/>`;
  else if(n==='Mushrooms')shape=`<path d="M60 72h26v44H60Z" fill="#eee0ba" ${line}/><path d="M28 73Q70 -5 116 73Z" fill="${color}" ${line}/>`;
  else if(n==='Broccoli')shape=`<path d="M63 69h20l6 47H56Z" fill="#8ab76e" ${line}/>${circle(49,56,22,color)}${circle(73,38,23,color)}${circle(98,58,23,color)}`;
  else if(n==='Pineapple')shape=`<path d="M50 43L41 16L64 29L73 8L84 28L105 15L92 44" fill="#70a157" ${line}/><rect x="43" y="40" width="59" height="79" rx="27" fill="${color}" ${line}/><path d="M49 58l45 46M49 82l30 32M94 55l-43 46M99 79l-32 35" stroke="#a88534" stroke-width="2"/>`;
  else if(n==='Strawberries')shape=`<path d="M34 47Q73 16 110 47Q106 85 72 121Q37 87 34 47Z" fill="${color}" ${line}/><path d="M46 37L62 27L73 39L87 26L99 38" fill="#719e50" ${line}/><path d="M54 62v4M79 58v4M91 77v4M63 85v4M77 101v4" stroke="#ffe0a1" stroke-width="4"/>`;
  else if(['Lettuce','Spinach'].includes(n))shape=`${circle(54,76,29,color)}${circle(84,56,33,color)}${circle(92,89,26,color)}<path d="M43 107L92 43M58 82l-12-7M75 62l21 7" ${line}/>`;
  else if(n==='Raisins')shape=[ [45,55],[75,47],[100,68],[55,86],[82,100],[33,103] ].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="13" ry="10" fill="${color}" ${line}/>`).join('');
  else if(n==='Garlic')shape=`<path d="M71 22Q66 46 45 52Q17 69 32 98Q50 121 72 110Q97 122 112 97Q124 70 99 52Q77 46 78 22Z" fill="${color}" ${line}/><path d="M70 42Q45 78 62 111M80 42Q102 78 85 111" ${line}/>`;
  else if(n==='Onion')shape=`<path d="M70 24Q69 45 46 55Q19 72 34 101Q71 137 107 101Q124 74 99 57Q80 46 80 24Z" fill="${color}" ${line}/><path d="M72 45Q40 83 64 116M80 45Q109 83 86 116" ${line}/>`;
  else if(n==='Potato')shape=`<path d="M34 45Q85 19 111 53Q132 88 95 111Q47 139 26 98Q12 69 34 45Z" fill="${color}" ${line}/><path d="M47 57h2M93 62h2M66 90h2M42 99h2" ${line}/>`;
  else if(n==='Mango')shape=`<path d="M51 33Q113 24 109 82Q99 126 59 119Q18 108 34 71Z" fill="${color}" ${line}/><path d="M60 32L66 18" ${line}/>`;
  else if(n==='Pumpkin')shape=`${circle(73,81,41,color)}<path d="M71 38L78 23M62 44Q38 82 62 118M83 44Q107 82 83 118M73 43V119" ${line}/>`;
  else if(n==='Coconut')shape=`${circle(73,78,42,color)}${circle(73,78,29,'#fff4d9')}${circle(73,78,17,'#b9d8dd')}`;
  else shape=`${circle(72,76,39,color)}<path d="M71 37L75 20" ${line}/><ellipse cx="89" cy="28" rx="16" ry="8" fill="#719e50" ${line}/>`;
 }else if(p.category==='protein'){
  if(['Fish','Tuna','Sardines'].includes(n))shape=`<path d="M21 75Q67 19 113 75Q66 126 21 75Z" fill="#83bfc0" ${line}/><path d="M109 75L133 50V99Z" fill="#509fa9" ${line}/>${circle(44,65,4,'#234c3d')}<path d="M72 51Q57 75 72 98" ${line}/>`;
  else if(n==='Eggs')shape=`<path d="M17 95h110l-8 23H25Z" fill="#b6a07d" ${line}/><ellipse cx="49" cy="68" rx="23" ry="31" fill="#fff4d9" ${line}/><ellipse cx="94" cy="68" rx="23" ry="31" fill="#fff4d9" ${line}/>`;
  else if(n==='Chicken')shape=`<path d="M35 80Q15 45 53 36Q99 34 102 69L76 91Z" fill="#d99b62" ${line}/><path d="M76 91L98 110Q114 124 121 108Q132 92 112 92L102 77" fill="#f6e7d0" ${line}/>`;
  else if(n==='Shrimp')shape=`<path d="M102 32Q27 12 30 78Q33 114 78 110L66 88Q43 92 49 66Q54 41 93 52Z" fill="#edaa8a" ${line}/><path d="M74 109L98 115L81 91" fill="#edaa8a" ${line}/><path d="M37 49L55 58M31 69L49 72M37 90L55 85" ${line}/>`;
  else if(n==='Tofu')shape=`<path d="M25 49L78 24L121 48L70 73Z" fill="#fff6db" ${line}/><path d="M25 49V102L70 124V73M70 124L121 101V48" fill="#eadcb7" ${line}/>`;
  else shape=`<path d="M34 43Q56 15 104 34Q143 58 116 101Q84 134 39 105Q8 85 34 43Z" fill="#d97872" ${line}/><path d="M46 53Q69 38 99 51Q120 71 100 91Q73 113 47 91Z" fill="#edb39c" ${line}/>`;
 }else if(p.category==='bakery')shape=n==='Bread'?`<path d="M19 65Q19 24 47 34Q75 11 99 35Q126 28 126 64V112H19Z" fill="#dda555" ${line}/><path d="M43 52V75M73 43V75M101 51V75" ${line}/>`:`${circle(71,72,45,'#edd094')}<path d="M47 51h48M40 74h59M51 96h34" stroke="#c79b53" stroke-width="4"/>`;
 else if(n==='Butter')shape=`<path d="M21 56L98 35L126 59L49 79Z" fill="#f7e78a" ${line}/><path d="M21 56V93L49 116V79M49 116L126 94V59" fill="#ead573" ${line}/><path d="M12 110H130" ${line}/>`;
 else if(n==='Cheese')shape=`<path d="M24 74L93 27L124 73V113H24Z" fill="#f3d269" ${line}/><path d="M24 74H124" ${line}/>${circle(54,94,7,'#d4af47')}${circle(96,93,6,'#d4af47')}`;
 else if(['Milk','Coconut milk','Cream'].includes(n))shape=`<path d="M38 44L54 20H98L112 44V120H38Z" fill="#f8f6e7" ${line}/><path d="M38 44H112L98 20M82 20V44" ${line}/><rect x="39" y="57" width="71" height="36" fill="#9ccbd0"/><text x="75" y="79" text-anchor="middle" font-family="Arial" font-size="12" fill="#234c3d">${n==='Coconut milk'?'COCONUT':n.toUpperCase()}</text>`;
 else if(n==='Dark chocolate')shape=`<rect x="32" y="18" width="82" height="103" rx="5" fill="#754d40" ${line}/><path d="M59 20V120M86 20V120M32 53H114M32 87H114" stroke="#b17c5b" stroke-width="4"/>`;
 else if(n==='Chili pepper')shape=`<path d="M111 30Q121 117 31 120Q82 76 83 30Z" fill="#d65d44" ${line}/><path d="M96 30Q91 13 110 13" ${line}/>`;
 else if(n==='Hibiscus')shape=`${circle(58,52,20,'#b14a64')}${circle(88,52,20,'#b14a64')}${circle(99,81,20,'#b14a64')}${circle(73,99,20,'#b14a64')}${circle(46,80,20,'#b14a64')}${circle(72,70,10,'#ecc56b')}`;
 else if(n==='Ginger')shape=`<path d="M31 88L49 63L38 39L53 29L71 50L101 35L112 52L89 68L110 86L100 105L76 87L50 114Z" fill="#d2ae71" ${line}/>`;
 else{const colors={pantry:'#d6b786',sweet:'#d99d67',spice:'#9ea96a',dairy:'#9bbdb0'};shape=`<path d="M42 22H102L116 119H28Z" fill="${colors[p.category]||'#ccc'}" ${line}/><path d="M42 22L50 35H94L102 22" ${line}/><rect x="35" y="53" width="75" height="43" rx="2" fill="#fff7df"/><text x="72" y="72" text-anchor="middle" font-family="Arial" font-size="11" fill="#234c3d">${n.split(' ')[0].toUpperCase()}</text><text x="72" y="86" text-anchor="middle" font-family="Arial" font-size="10" fill="#234c3d">${n.split(' ').slice(1).join(' ').toUpperCase()}</text>`}
 // Product-specific packaging and silhouettes, rather than identical generic bags.
 if(['Tuna','Sardines'].includes(n))shape=`<ellipse cx="72" cy="44" rx="47" ry="17" fill="#d9e1e3" ${line}/><path d="M25 44V101Q72 126 119 101V44" fill="${n==='Tuna'?'#659dae':'#b77758'}" ${line}/><ellipse cx="72" cy="44" rx="39" ry="11" fill="#f1f4f4" stroke="#8b9a9e" stroke-width="2"/><ellipse cx="73" cy="43" rx="10" ry="5" stroke="#6c797e" stroke-width="3"/><path d="M44 81Q63 60 94 81Q64 100 44 81L33 91V70Z" fill="#fff5de"/><text x="72" y="106" text-anchor="middle" font-family="Arial" font-size="11" fill="#fff">${n.toUpperCase()}</text>`;
 if(n==='Crackers')shape=[[-20,-14],[0,0],[20,14]].map(([x,y])=>`<g transform="translate(${x} ${y})"><rect x="46" y="37" width="61" height="66" rx="5" fill="#edce8e" ${line}/>${[0,1,2].flatMap(r=>[0,1,2].map(c=>`<circle cx="${58+c*17}" cy="${49+r*20}" r="2" fill="#a98143"/>`)).join('')}</g>`).join('');
 if(n==='Tortillas')shape=`${[0,1,2].map(i=>`<ellipse cx="72" cy="${87-i*11}" rx="53" ry="27" fill="${i===2?'#efda9e':'#dcc080'}" ${line}/>`).join('')}<path d="M42 54h4M71 60h3M92 47h4M88 73h3M49 77h3" stroke="#ba975c" stroke-width="3"/>`;
 if(['Rice','Pasta','Oats','Chickpeas','Black beans','Lentils','Pumpkin seeds','Peanuts','Sesame seeds'].includes(n)){
  const colors={Rice:'#f5f0d8',Pasta:'#e6b855',Oats:'#c8b285',Chickpeas:'#d4b27b','Black beans':'#4a3937',Lentils:'#a17d52','Pumpkin seeds':'#699a53',Peanuts:'#b37d44','Sesame seeds':'#ded0a2'};
  const grains=Array.from({length:15},(_,i)=>{const x=45+i%5*13,y=64+Math.floor(i/5)*16;return n==='Pasta'?`<path d="M${x} ${y}l7 8" stroke="${colors[n]}" stroke-width="6" stroke-linecap="round"/>`:`<ellipse cx="${x+3}" cy="${y}" rx="${['Rice','Sesame seeds'].includes(n)?2:5}" ry="${n==='Rice'?6:4}" fill="${colors[n]}" stroke="#695640" stroke-width=".8"/>`}).join('');
  shape=`<path d="M35 20h74l9 100H26Z" fill="#f4e9d2" ${line}/><path d="M35 20h74v17H35Z" fill="#bf7045"/><rect x="34" y="51" width="77" height="58" rx="6" fill="#fffaf0" stroke="#ceb796" stroke-width="2"/>${grains}<text x="72" y="47" text-anchor="middle" font-family="Arial" font-size="10" font-weight="bold" fill="#563927">${n.toUpperCase()}</text>`;
 }
 if(n==='Yogurt')shape=`<path d="M33 42h79l-9 77H42Z" fill="#fbf7ed" ${line}/><ellipse cx="72" cy="42" rx="43" ry="12" fill="#b5677c" ${line}/><path d="M37 62h71l-3 30H40Z" fill="#e5b3c3"/><text x="72" y="82" text-anchor="middle" font-family="Arial" font-size="12" fill="#543c42">YOGURT</text>`;
 if(['Honey','Vanilla','Sugar','Cocoa powder','Cinnamon'].includes(n)){
  const color={Honey:'#d9a332',Vanilla:'#704e39',Sugar:'#f5f1e6','Cocoa powder':'#795344',Cinnamon:'#b67646'}[n];shape=`<rect x="45" y="18" width="55" height="15" rx="3" fill="#3d4240" ${line}/><rect x="34" y="33" width="77" height="87" rx="13" fill="${color}" ${line}/><rect x="36" y="60" width="73" height="35" fill="#fff1d9"/><text x="72" y="80" text-anchor="middle" font-family="Arial" font-size="${n.length>10?9:12}" fill="#563927">${n.toUpperCase()}</text>`;
 }
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 140" fill="none" role="img" aria-label="${p.name}"><ellipse cx="72" cy="126" rx="43" ry="5" fill="#17251d" opacity=".09"/>${shape}</svg>`;
}
