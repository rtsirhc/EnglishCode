export const ESCAPE_BANK = [
  {
    "id": "1",
    "name": "A2 · The October Mystery",
    "subtitle": "A little October mystery",
    "mission": "Encuentren las ocho letras y abran la puerta.",
    "instructions": [
      "Resuelvan los ocho acertijos (sección 1). Tomen la letra indicada, contando desde la izquierda.",
      "Los documentos (sección 2) dan cuatro posiciones. Las pistas (sección 3) completan el orden.",
      "Escriban las letras en ese orden y añadan su número de equipo: 04-ABCDEFGH."
    ],
    "codeHash": "d582e27c42c135448d54e163fe16a11b1f9e7a604bb8d3b6f06d75207574c973",
    "puzzle": {
      "riddles": [
        {
          "symbol": "SUN",
          "text": "He is your mother’s brother. Who is he?",
          "length": 5,
          "letter": 1
        },
        {
          "symbol": "MOON",
          "text": "You eat this at a birthday party. It can have candles on top.",
          "length": 4,
          "letter": 1
        },
        {
          "symbol": "STAR",
          "text": "She is your father’s sister. Who is she?",
          "length": 4,
          "letter": 1
        },
        {
          "symbol": "KEY",
          "text": "You wear these on your legs. Use the American English word.",
          "length": 5,
          "letter": 1
        },
        {
          "symbol": "HEART",
          "text": "You use two slices of this food to make a sandwich.",
          "length": 5,
          "letter": 1
        },
        {
          "symbol": "LEAF",
          "text": "A baker puts bread inside me to bake it. I get very hot.",
          "length": 4,
          "letter": 1
        },
        {
          "symbol": "CLOUD",
          "text": "I am a food made of small white grains. You can eat me with chicken.",
          "length": 4,
          "letter": 1
        },
        {
          "symbol": "DIAMOND",
          "text": "A sweet round bakery food with a hole in the middle. Use the 5-letter spelling.",
          "length": 5,
          "letter": 1
        }
      ],
      "documents": [
        {
          "title": "Bakery receipt",
          "intro": "Busca el producto con el precio más bajo. Su símbolo va PRIMERO. Los precios son por una pieza.",
          "rows": [
            [
              "Bread",
              "$30",
              "MOON"
            ],
            [
              "Cookie",
              "$12",
              "LEAF"
            ],
            [
              "Cake",
              "$80",
              "KEY"
            ]
          ]
        },
        {
          "title": "Birthday calendar",
          "intro": "La fiesta de Mia es ANTES que las otras dos. Su símbolo va al FINAL.",
          "rows": [
            [
              "Mia",
              "Monday 19",
              "HEART"
            ],
            [
              "Leo",
              "Wednesday 21",
              "SUN"
            ],
            [
              "Ana",
              "Friday 23",
              "DIAMOND"
            ]
          ]
        },
        {
          "title": "Clothing display",
          "intro": "Encuentra la BLUE JACKET. Su símbolo va en el lugar 3.",
          "rows": [
            [
              "Blue jacket",
              "M",
              "CLOUD"
            ],
            [
              "Red shirt",
              "M",
              "SUN"
            ],
            [
              "Black pants",
              "S",
              "KEY"
            ],
            [
              "Green jacket",
              "L",
              "MOON"
            ]
          ]
        },
        {
          "title": "Morning routine",
          "intro": "¿Qué hace DESPUÉS de desayunar y ANTES de ir a la escuela? Su símbolo va en el lugar 6.",
          "rows": [
            [
              "Have breakfast",
              "7:00",
              "LEAF"
            ],
            [
              "Brush my teeth",
              "7:15",
              "DIAMOND"
            ],
            [
              "Go to school",
              "7:30",
              "STAR"
            ]
          ]
        }
      ],
      "ordering": [
        "MOON va inmediatamente DESPUÉS de LEAF.",
        "SUN va inmediatamente ANTES de KEY.",
        "STAR va inmediatamente ANTES de HEART.",
        "SUN va inmediatamente DESPUÉS de CLOUD."
      ]
    }
  },
  {
    "id": "2",
    "name": "A2–B1 · After Hours",
    "subtitle": "The after-hours case",
    "mission": "Find eight letters. Unlock the door.",
    "instructions": [
      "Solve the eight riddles (section 1). Take the letter shown, counting from the left.",
      "Use the documents (section 2) and the clues (section 3) to order the symbols.",
      "Read the letters in that order. Add your team number: 04-ABCDEFGH."
    ],
    "codeHash": "bc1fab776fd1a950aa5a0de0ff043c4caae9f323c351c8368fe0408b1747e51d",
    "puzzle": {
      "riddles": [
        {
          "symbol": "SUN",
          "text": "Bees make this sweet food. You can put it on toast.",
          "length": 5,
          "letter": 1
        },
        {
          "symbol": "MOON",
          "text": "My dad has a sister. She is my…",
          "length": 4,
          "letter": 1
        },
        {
          "symbol": "STAR",
          "text": "These small grains are often white. We eat them with beans or chicken.",
          "length": 4,
          "letter": 1
        },
        {
          "symbol": "KEY",
          "text": "I am bread made brown and crunchy by heat. People often eat me for breakfast.",
          "length": 5,
          "letter": 1
        },
        {
          "symbol": "HEART",
          "text": "You wear me on your upper body. I usually have a collar and buttons.",
          "length": 5,
          "letter": 1
        },
        {
          "symbol": "LEAF",
          "text": "I am a frozen sweet food. You can eat me in a cone. Write two words.",
          "length": 8,
          "letter": 1
        },
        {
          "symbol": "CLOUD",
          "text": "I am a powder used to make bread. I am not sugar. My name sounds like “flower”.",
          "length": 5,
          "letter": 1
        },
        {
          "symbol": "DIAMOND",
          "text": "You wear a pair of these on your feet, over your socks.",
          "length": 5,
          "letter": 5
        }
      ],
      "documents": [
        {
          "title": "Read the receipt",
          "intro": "Find the item whose TOTAL is sixty pesos, but whose UNIT price is thirty pesos. Its symbol starts the code.",
          "rows": [
            [
              "2 muffins",
              "$30 each / $60 total",
              "STAR"
            ],
            [
              "1 pie",
              "$60 each / $60 total",
              "LEAF"
            ],
            [
              "3 cookies",
              "$10 each / $30 total",
              "SUN"
            ]
          ]
        },
        {
          "title": "Pick-up calendar",
          "intro": "Mia needs her order the day AFTER Wednesday and BEFORE Friday. Put the symbol for that day LAST.",
          "rows": [
            [
              "Wednesday",
              "21 October",
              "CLOUD"
            ],
            [
              "Thursday",
              "22 October",
              "KEY"
            ],
            [
              "Friday",
              "23 October",
              "MOON"
            ]
          ]
        },
        {
          "title": "Clothing display",
          "intro": "Find something you wear on your upper body: it must be BLUE and size M. Its symbol goes in position THREE.",
          "rows": [
            [
              "Blue jacket",
              "M",
              "SUN"
            ],
            [
              "Blue jacket",
              "L",
              "LEAF"
            ],
            [
              "Blue pants",
              "M",
              "KEY"
            ],
            [
              "Red shirt",
              "M",
              "STAR"
            ]
          ]
        },
        {
          "title": "After-school routine",
          "intro": "Find the activity AFTER homework but BEFORE dinner. Its symbol is the SIXTH one.",
          "rows": [
            [
              "Do homework",
              "4:30 p.m.",
              "DIAMOND"
            ],
            [
              "Play football",
              "5:15 p.m.",
              "HEART"
            ],
            [
              "Have dinner",
              "7:00 p.m.",
              "CLOUD"
            ]
          ]
        }
      ],
      "ordering": [
        "DIAMOND goes immediately AFTER STAR. No symbol goes between them.",
        "LEAF goes immediately BEFORE MOON.",
        "CLOUD goes immediately BEFORE KEY.",
        "LEAF goes immediately AFTER SUN."
      ]
    }
  },
  {
    "id": "3",
    "name": "B1 · The School Route",
    "subtitle": "The school-route investigation",
    "mission": "Eight riddles. One locked door.",
    "instructions": [
      "Solve the eight riddles (section 1). Each one has a school place.",
      "Number the places along the upstairs corridor (section 2). Each place’s position tells you which letter to take.",
      "Order the symbols using section 3. Add your team number to the eight letters: 04-ABCDEFGH."
    ],
    "codeHash": "6d5472e4c49de2c1fed053142b3a1857e795b8b77452559126bc945af36ca44d",
    "puzzle": {
      "riddles": [
        {
          "symbol": "SUN",
          "text": "I have loops of wire and a handle. A baker uses me to beat eggs by hand.",
          "length": 5
        },
        {
          "symbol": "MOON",
          "text": "Keep me after paying. I list your purchases and prices. Use the seven-letter word.",
          "length": 7
        },
        {
          "symbol": "STAR",
          "text": "A yellow dairy ingredient you spread on toast. It melts in a warm pan.",
          "length": 6
        },
        {
          "symbol": "KEY",
          "text": "Your sister has a son. What is he to you?",
          "length": 6
        },
        {
          "symbol": "HEART",
          "text": "This farm bird lays eggs. Its meat is often served with rice. Use the seven-letter word.",
          "length": 7
        },
        {
          "symbol": "LEAF",
          "text": "Small individual cakes with frosting on top. Write the plural.",
          "length": 8
        },
        {
          "symbol": "CLOUD",
          "text": "Bread goes inside me to bake. I am not the top of the stove.",
          "length": 4
        },
        {
          "symbol": "DIAMOND",
          "text": "This cultured dairy food can be plain or fruit-flavoured. Use the six-letter spelling without an h.",
          "length": 6
        }
      ],
      "places": {
        "DIAMOND": "Front office",
        "KEY": "East restroom",
        "MOON": "Art room",
        "CLOUD": "Music room",
        "SUN": "Science lab",
        "STAR": "Library",
        "HEART": "West restroom",
        "LEAF": "Study hall"
      },
      "routeInstructions": [
        "Follow the arrows from the front office. Skip the storage room when you number the eight places.",
        "Each riddle’s place gives its letter number. Count from the left: APPLE, letter 4 → L."
      ],
      "documents": [
        {
          "title": "The missing change",
          "intro": "You buy three identical items. You pay $100 and get $10 back. Their symbol goes FIRST. MOON is next to it.",
          "rows": [
            [
              "Muffin",
              "$30 each",
              "STAR"
            ],
            [
              "Cookie",
              "$15 each",
              "MOON"
            ],
            [
              "Bread roll",
              "$25 each",
              "LEAF"
            ]
          ]
        },
        {
          "title": "The pick-up date",
          "intro": "You order on Monday 19. Your order is ready two days later. You collect it the next day. That day's symbol goes LAST. DIAMOND goes immediately before it.",
          "rows": [
            [
              "Wednesday",
              "21 October",
              "CLOUD"
            ],
            [
              "Thursday",
              "22 October",
              "SUN"
            ],
            [
              "Friday",
              "23 October",
              "DIAMOND"
            ]
          ]
        },
        {
          "title": "One jacket fits",
          "intro": "Choose a blue jacket, size M, under $400. Its symbol is in an EVEN position in the FIRST HALF of the code, but not second. LEAF goes immediately before it.",
          "rows": [
            [
              "Blue jacket / M",
              "$350",
              "KEY"
            ],
            [
              "Blue jacket / M",
              "$450",
              "CLOUD"
            ],
            [
              "Blue jacket / L",
              "$300",
              "HEART"
            ]
          ]
        },
        {
          "title": "After the break",
          "intro": "Homework starts at 4:20 p.m. and lasts 40 minutes. Then comes a 15-minute break. Choose the activity starting immediately after the break. Put its symbol TWO places after the symbol you found in 'One jacket fits'.",
          "rows": [
            [
              "Listen to music",
              "4:45 p.m.",
              "CLOUD"
            ],
            [
              "Have dinner",
              "5:00 p.m.",
              "MOON"
            ],
            [
              "Play football",
              "5:15 p.m.",
              "HEART"
            ]
          ]
        }
      ]
    }
  },
  {
    "id": "4",
    "name": "B2 · The Last Collection",
    "subtitle": "The last collection",
    "mission": "Five orders. Eight symbols. One way out.",
    "instructions": [
      "Solve the eight riddles on section 1.",
      "Reconstruct the five bakery orders on section 2. Use every clue.",
      "Use your completed table to calculate which letter to take on section 3.",
      "Solve the final notes on section 4. Enter your team number and eight letters."
    ],
    "codeHash": "cb4769a2804bff2d5eeb1c1085e67d63461fac5e11cb915b51038139184c1023",
    "puzzle": {
      "riddles": [
        {
          "symbol": "SUN",
          "text": "Usually the first meal of the day. You might have eggs, toast and milk.",
          "length": 9
        },
        {
          "symbol": "MOON",
          "text": "A parent's female child. What is she to that parent?",
          "length": 8
        },
        {
          "symbol": "STAR",
          "text": "A warm knitted top with long sleeves, worn over a shirt.",
          "length": 7
        },
        {
          "symbol": "KEY",
          "text": "Small individual cakes, often with blueberries, usually without frosting. Write the plural.",
          "length": 7
        },
        {
          "symbol": "HEART",
          "text": "A shop gives you this after you pay. It lists what you bought and how much you paid.",
          "length": 7
        },
        {
          "symbol": "LEAF",
          "text": "A long green salad vegetable with a pale, watery centre. It is also used to make pickles.",
          "length": 8
        },
        {
          "symbol": "CLOUD",
          "text": "A sweet brown food made from cocoa. You can buy it in bars or melt it into a cake.",
          "length": 9
        },
        {
          "symbol": "DIAMOND",
          "text": "Two slices of bread with a filling between them, such as cheese or chicken.",
          "length": 8
        }
      ],
      "case": {
        "people": [
          "Mia",
          "Leo",
          "Nora",
          "Omar",
          "Eva"
        ],
        "products": [
          "cookies",
          "muffins",
          "cupcakes",
          "donuts",
          "brownies"
        ],
        "times": [
          "3:10 p.m.",
          "3:30 p.m.",
          "3:50 p.m.",
          "4:10 p.m.",
          "4:30 p.m."
        ],
        "clues": [
          "The cookies are collected forty minutes before Mia's order.",
          "Omar collects his order twenty minutes before Mia.",
          "Nora pays twelve pesos less than Mia.",
          "Omar pays twelve pesos more than Mia.",
          "Nora collects her order twenty minutes before the customer with the largest bill.",
          "The first customer pays more than Mia.",
          "The bill for muffins is twelve pesos higher than the bill for cupcakes.",
          "The bill for donuts is higher than the bill for muffins.",
          "The brownies order has the largest bill.",
          "Eva collects her order after Mia."
        ],
        "receipts": [
          {
            "label": "A",
            "description": "Four items at $18 each. No discount."
          },
          {
            "label": "B",
            "description": "Three items at $20 each. Use a $12 voucher."
          },
          {
            "label": "C",
            "description": "Five items at $18 each. Use a $6 voucher."
          },
          {
            "label": "D",
            "description": "Four items at $15 each. No discount."
          },
          {
            "label": "E",
            "description": "Six items at $18 each. Use a $12 voucher."
          }
        ]
      },
      "extraction": [
        [
          "SUN",
          "Mia's bill ÷ 12"
        ],
        [
          "MOON",
          "Nora's bill ÷ 12"
        ],
        [
          "STAR",
          "Minutes between Mia's and Eva's collections ÷ 20"
        ],
        [
          "KEY",
          "(Leo's bill − Nora's bill) ÷ 12"
        ],
        [
          "HEART",
          "(Brownies bill − Leo's bill) ÷ 12"
        ],
        [
          "LEAF",
          "Cookies bill ÷ 12"
        ],
        [
          "CLOUD",
          "(Brownies bill − Donuts bill) ÷ 4"
        ],
        [
          "DIAMOND",
          "Minutes between the first and last collections ÷ 10"
        ]
      ],
      "finalNotes": [
        {
          "title": "The till record",
          "text": "KEY's position = (Donuts bill − Cupcakes bill) ÷ 12. CLOUD appears somewhere before KEY."
        },
        {
          "title": "The baker's note",
          "text": "LEAF is immediately after STAR. SUN is immediately after LEAF."
        },
        {
          "title": "The watchman's note",
          "text": "DIAMOND is exactly two positions before HEART. MOON appears somewhere between DIAMOND and HEART."
        },
        {
          "title": "The torn label",
          "text": "Exactly ONE sentence below is true. The other is false.\n• LEAF is next to KEY.\n• SUN is next to DIAMOND."
        }
      ]
    }
  }
];
