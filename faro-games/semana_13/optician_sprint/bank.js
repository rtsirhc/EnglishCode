export const REVIEW_CARDS = [
  { word: 'glasses', es: 'lentes / anteojos', phrase: 'I need a new pair of glasses.' },
  { word: 'frames', es: 'armazón', phrase: 'I like these black frames.' },
  { word: 'lenses', es: 'micas / cristales', phrase: 'My lenses are scratched.' },
  { word: 'contact lenses', es: 'lentes de contacto', phrase: 'Have you ever worn contacts?' },
  { word: 'glasses case', es: 'estuche', phrase: 'Put your glasses in the case.' },
  { word: 'eye exam', es: 'examen de la vista', phrase: "I'd like an eye exam, please." },
  { word: 'prescription', es: 'receta / graduación', phrase: 'Do you have your prescription?' },
  { word: 'blurry', es: 'borroso', phrase: 'The board looks blurry.' },
  { word: 'near / far', es: 'cerca / lejos', phrase: "I can't see far away clearly." },
  { word: 'Can I try these on?', es: '¿Me puedo probar estos?', phrase: 'Can I try these frames on?' },
  { word: 'How much are they?', es: '¿Cuánto cuestan?', phrase: 'How much are these glasses?' },
  { word: 'Have you ever…?', es: '¿Alguna vez has…?', phrase: 'Have you ever broken your glasses?' }
];

// Rich illustrated SVG scenes for Mode 1 (Blurry Vision!)
export const BLURRY_ROUNDS = [
  {
    level: ['A1', 'A2', 'B1'],
    svg: `<svg viewBox="0 0 420 260"><rect width="420" height="260" rx="18" fill="#173b4a"/>
      <g stroke="#f5b942" fill="#67e8f9" stroke-width="10" stroke-linecap="round">
        <rect x="46" y="74" width="136" height="92" rx="36"/>
        <rect x="238" y="74" width="136" height="92" rx="36"/>
        <path d="M182 104 Q210 78 238 104" fill="none"/>
      </g>
      <path d="M275 84 L310 120 L292 140 L338 162" stroke="#ef4444" stroke-width="8" fill="none" stroke-linecap="round"/>
      <path d="M310 120 L345 102" stroke="#ef4444" stroke-width="6" fill="none" stroke-linecap="round"/>
      <text x="210" y="226" fill="#fde047" font-family="monospace" font-size="22" font-weight="900" text-anchor="middle">CRACK!</text>
    </svg>`,
    question: 'What happened to these glasses? Say a full sentence!',
    frame: 'The ___ are broken! / I broke my ___ .',
    answer: 'The right lens is broken! / I broke my glasses and I need new lenses.',
    tip: 'Great chance to ask: "Have you ever broken your glasses?"'
  },
  {
    level: ['A1', 'A2', 'B1'],
    svg: `<svg viewBox="0 0 420 260"><rect width="420" height="260" rx="18" fill="#13382e"/>
      <rect x="40" y="24" width="210" height="140" rx="8" fill="#0f5132" stroke="#d97706" stroke-width="8"/>
      <text x="145" y="78" fill="#fff" font-family="monospace" font-size="24" opacity="0.45" text-anchor="middle">HOMEWORK</text>
      <text x="145" y="118" fill="#fff" font-family="monospace" font-size="18" opacity="0.35" text-anchor="middle">PAGE 42 ???</text>
      <circle cx="325" cy="120" r="38" fill="#fde68a" stroke="#0a1d28" stroke-width="5"/>
      <line x1="306" y1="115" x2="318" y2="115" stroke="#0a1d28" stroke-width="5"/>
      <line x1="332" y1="115" x2="344" y2="115" stroke="#0a1d28" stroke-width="5"/>
      <path d="M312 138 Q325 130 338 138" stroke="#0a1d28" stroke-width="4" fill="none"/>
      <text x="210" y="225" fill="#99f6e4" font-family="monospace" font-size="22" font-weight="900" text-anchor="middle">??? BLURRY ???</text>
    </svg>`,
    question: 'Describe this student’s vision problem!',
    frame: 'He/She cannot see the ___ clearly. It looks ___ .',
    answer: 'He cannot see the board clearly—it looks blurry! He needs an eye exam.',
    tip: 'Blurry = borroso · Far away = lejos.'
  },
  {
    level: ['A1', 'A2', 'B1'],
    svg: `<svg viewBox="0 0 420 260"><rect width="420" height="260" rx="18" fill="#1e293b"/>
      <rect x="75" y="30" width="270" height="190" rx="14" fill="#fff8e7" stroke="#f5b942" stroke-width="6"/>
      <text x="108" y="88" fill="#0b7a75" font-family="Georgia,serif" font-size="48" font-weight="900">℞</text>
      <text x="165" y="78" fill="#0a1d28" font-family="monospace" font-size="18" font-weight="900">OPTICIAN</text>
      <line x1="100" y1="115" x2="320" y2="115" stroke="#0a1d28" stroke-width="4"/>
      <text x="105" y="148" fill="#0a1d28" font-family="monospace" font-size="20" font-weight="800">R EYE: -1.75</text>
      <text x="105" y="182" fill="#0a1d28" font-family="monospace" font-size="20" font-weight="800">L EYE: -1.50</text>
    </svg>`,
    question: 'What document is this? Ask or answer like you are in the shop!',
    frame: 'Do you have your ___ ? / Here is my ___ .',
    answer: 'It is a prescription! "Do you have your prescription? Yes, here it is."',
    tip: 'Prescription works at both the pharmacy and the optician!'
  },
  {
    level: ['A1', 'A2', 'B1'],
    svg: `<svg viewBox="0 0 420 260"><rect width="420" height="260" rx="18" fill="#0f2937"/>
      <g fill="#67e8f9" fill-opacity="0.5" stroke="#cffafe" stroke-width="6">
        <path d="M52 125 Q125 205 198 125 Q148 232 76 172 Z"/>
        <ellipse cx="125" cy="125" rx="73" ry="20"/>
        <path d="M222 125 Q295 205 368 125 Q318 232 246 172 Z"/>
        <ellipse cx="295" cy="125" rx="73" ry="20"/>
      </g>
      <text x="210" y="64" fill="#fde047" font-family="monospace" font-size="22" font-weight="900" text-anchor="middle">NO FRAMES!</text>
    </svg>`,
    question: 'What are these? Ask a "Have you ever…?" question about them!',
    frame: 'They are ___ . Have you ever worn ___ ?',
    answer: 'They are contact lenses (contacts)! "Have you ever worn contacts?"',
    tip: 'Wear → wore → worn.'
  },
  {
    level: ['A1', 'A2', 'B1'],
    svg: `<svg viewBox="0 0 420 260"><rect width="420" height="260" rx="18" fill="#2c1d42"/>
      <rect x="65" y="66" width="290" height="122" rx="54" fill="#0b7a75" stroke="#f5b942" stroke-width="8"/>
      <line x1="72" y1="127" x2="348" y2="127" stroke="#f5b942" stroke-width="5"/>
      <circle cx="210" cy="127" r="14" fill="#fde047"/>
      <text x="210" y="232" fill="#fff" font-family="monospace" font-size="20" font-weight="900" text-anchor="middle">PROTECT YOUR GLASSES</text>
    </svg>`,
    question: 'What is this object and what do you put inside it?',
    frame: 'It is a ___ ___ . You put your ___ inside.',
    answer: 'It is a glasses case! You put your glasses in the case to keep them safe.',
    tip: 'Case = estuche.'
  },
  {
    level: ['A1', 'A2', 'B1'],
    svg: `<svg viewBox="0 0 420 260"><rect width="420" height="260" rx="18" fill="#172554"/>
      <g stroke="#ef4444" fill="#1e293b" stroke-width="10">
        <circle cx="135" cy="115" r="48"/><circle cx="285" cy="115" r="48"/>
        <line x1="183" y1="115" x2="237" y2="115"/>
      </g>
      <rect x="135" y="182" width="150" height="44" rx="8" fill="#fde047" stroke="#0a1d28" stroke-width="4"/>
      <text x="210" y="212" fill="#0a1d28" font-family="monospace" font-size="26" font-weight="900" text-anchor="middle">$1,800</text>
    </svg>`,
    question: 'You want to try on these RED round frames and ask the price!',
    frame: 'Can I ___ these red frames ___ ? How ___ are they?',
    answer: 'Can I try these red frames on? How much are they?',
    tip: 'Glasses/frames are plural → "How much ARE they?"'
  }
];

// Mode 2: "Better 1 or Better 2?" (Simultaneous all-class voting!)
export const AB_ROUNDS = [
  {
    l1: 'How much IS these glasses?',
    l2: 'How much ARE these glasses?',
    correct: 2,
    explain: 'LENS 2 is clear! "Glasses" is always plural → ARE these glasses.'
  },
  {
    l1: 'Have you ever BROKEN your glasses?',
    l2: 'Have you ever BROKE your glasses?',
    correct: 1,
    explain: 'LENS 1 is clear! "Have you ever" + past participle (break → broke → BROKEN).'
  },
  {
    l1: 'I need a new pair of glasses.',
    l2: 'I need a new glass for reading.',
    correct: 1,
    explain: 'LENS 1 is clear! "A glass" is a cup for water; lenses are "a pair of glasses".'
  },
  {
    l1: 'Have you ever GONE to an optician?',
    l2: 'Have you ever BEEN to an optician?',
    correct: 2,
    explain: 'LENS 2 is clear! Use "BEEN to" for a place you visited and came back from.'
  },
  {
    l1: 'Can I try these frames on?',
    l2: 'Can I prove these frames?',
    correct: 1,
    explain: 'LENS 1 is clear! "Try on" = probarse ropa o lentes (never "prove"!).'
  },
  {
    l1: 'My lenses is very blurry.',
    l2: 'My lenses are very blurry.',
    correct: 2,
    explain: 'LENS 2 is clear! "Lenses" is plural (len-ziz) → ARE blurry.'
  },
  {
    l1: 'Have you ever WORN contact lenses?',
    l2: 'Have you ever WORE contact lenses?',
    correct: 1,
    explain: 'LENS 1 is clear! wear → wore → WORN (past participle).'
  },
  {
    l1: 'I ate at the breakfast buffet (buh-FAY).',
    l2: 'I ate at the breakfast buffet (buh-FET).',
    correct: 1,
    explain: 'LENS 1 is clear! Silent final T in buffet, ballet and valet.'
  }
];

// Mode 3: Snellen Eye-Chart Dialogues (lines shrink and reveal step-by-step!)
export const SNELLEN_ROUNDS = [
  {
    task: 'Complete the Customer’s request and read all 4 lines aloud!',
    hint: 'Missing words: glasses · prescription · try · much',
    lines: [
      'I NEED NEW _______.',
      'HERE IS MY ___________.',
      'CAN I ___ THESE FRAMES ON?',
      'HOW ____ ARE THEY?'
    ],
    answer: 'I need new GLASSES. Here is my PRESCRIPTION. Can I TRY these frames on? How MUCH are they?',
    tip: 'Classic 4-line optician survival dialogue!'
  },
  {
    task: 'Complete the Vision Problem & Eye Exam chart!',
    hint: 'Missing words: blurry · far · exam · lenses',
    lines: [
      'THE BOARD LOOKS ______.',
      'I CANNOT SEE ___ AWAY.',
      "I'D LIKE AN EYE ____.",
      'DO YOU SELL CONTACT ______?'
    ],
    answer: 'The board looks BLURRY. I cannot see FAR away. I’d like an eye EXAM. Do you sell contact LENSES?',
    tip: 'Pronounce lenses with 2 syllables: len-ziz.'
  },
  {
    task: 'Complete the "Have You Ever…?" Story Switch chart!',
    hint: 'Missing words: worn · wore · lost · case',
    lines: [
      'HAVE YOU EVER ____ GLASSES?',
      'YES! I ____ THEM IN 6TH GRADE.',
      'I ____ THEM AT SCHOOL ONCE.',
      'NOW I ALWAYS USE A ____!'
    ],
    answer: 'Have you ever WORN glasses? Yes, I WORE them in 6th grade. I LOST them at school once. Now I always use a CASE!',
    tip: 'Notice the switch: Present Perfect (Have you ever worn) → Simple Past (I wore / I lost).'
  }
];
