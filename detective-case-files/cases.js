/* =========================================================
   DETECTIVE CASE FILES — case data
   11 murder mysteries written by university ESL students
   (UPRA "Project 2 – A Murder Mystery"). Author names removed.

   HOW TO ADD A CASE: copy one object below and edit it.
   - story: array of paragraphs. A paragraph starting with "## " is a heading.
   - keyEvidence: short phrases that appear EXACTLY in the story.
     Sentences containing them count as "key evidence".
   - questions: answer = index (0-based) of the correct option.
   - openEnding: true = the authors never revealed the culprit.
   ========================================================= */
window.CASES = [
  /* ---------------------------------------------------- 1 */
  {
    id: "summer",
    title: "A Summer Without You Will Be the Same",
    teaser: "A lake-house weekend. Cut boat lines, no phone signal, and a body on the kitchen floor.",
    setting: "A lake house · Saturday night",
    victim: "Joe, Kiara's boyfriend",
    difficulty: 2,
    story: [
      "The lake house smelled of cedar, cheap tequila, and the metallic tang of something ruined. Outside, Saturday night pressed against the glass like a black velvet shroud. Inside, the kitchen was brilliantly, mercilessly lit. Joe lay sprawled across the polished slate floor. His body was built like a brick wall, and entirely dead. His grin, just an hour ago, crossed the youngest one’s mind.",
      "Sky stood over him, her eyes shifting quickly from the defensive bruises on Joe’s neck to Kiara’s damp hair. A heavy, suffocating weight settled in Sky’s chest, a ghost of a memory she had buried years ago, when Joe had stolen something sacred from her before she ever learned how to fight back. She had kept that secret locked away to protect Kiara’s fragile world. Now, Joe was gone, and something in Sky woke up, hungry for truth.",
      "Kiara’s screams tore through the quiet. Her slender figure draped over Joe’s lifeless legs, weeping with a devastating volume that rattled the crystal glassware in the cupboards. “We just got back together!” she sobbed, brushing aside a brief, awkward split they’d had the week before as if it were a minor thing. To Kiara, Joe was a deity, an obsession wrapped in broad shoulders. “We broke up, but it was nothing, he promised!” she wailed, rocking back and forth, her tears staining his shirt. He wouldn’t be annoyed by it anymore. She wouldn’t have to pretend that she didn’t know either.",
      "Matthew didn't move. Kiara’s older brother leaned against the doorframe in immaculate clothing, holding a warm Scotch whisky, and his face looked as if it had been carved from solid rock. He gazed at Joe’s corpse with the mild annoyance of someone who has missed a reservation. Matthew had spent three years biting his tongue, rolling his eyes every time he was left as the default babysitter for this toxic romance, but swallowing his disdain just to keep the peace. When the body dropped, he didn't blink. He just stared, looking less like a grieving brother-in-law and more like a man whose weekend plans had been interrupted by an annoying fly.",
      "Across the room, Leon was losing his mind. Dripping in designer clothes, Leon paced the kitchen like a caged panther. He was sweating through his linen shirt, his eyes flicking frantically from face to face. “We need to leave. Right now. Call the boat, call someone!” Leon’s voice cracked with pure terror. But the mooring lines had been cut, and there was no phone signal. Leon was trapped, and paranoia was eating him alive. His gaze hooked on Sky’s. He knew he’d seen a shadow moving down this hallway an hour ago, right near the kitchen. And in his panic, he was entirely convinced the silhouette belonged to her.",
      "Everyone was in different rooms when it happened. Everyone had a motive.",
      "Sky stepped closer to the body, kneeling beside the kitchen island. Her fingers pinched a faint stain on the marble countertop, near the sink: a trail of high-quality lavender-scented massage oil. The kind Kiara highly recommended. It was mixed with a tiny drop of freshly applied red nail polish, from a peeled manicure.",
      "Sky looked up and, with an analytical gaze, paced the room. Kiara was still weeping loudly, her mascara running in dramatic black tracks, her hands buried in her face. But through her parted fingers, her eyes weren't looking at Joe. They were fixed, with chilling precision, on the doorway.",
      "A notification popped up on Joe’s phone out of the blue. A name that she would recognize showed up. She just kept acting."
    ],
    suspects: [
      { name: "Kiara", role: "Joe's girlfriend", note: "Weeping loudly over the body. They had split up the week before." },
      { name: "Matthew", role: "Kiara's older brother", note: "Calm, annoyed, holding a whisky. Hated the 'toxic romance'." },
      { name: "Leon", role: "Weekend guest", note: "Panicking, desperate to leave. Says he saw a shadow in the hallway." },
      { name: "Sky", role: "The youngest friend", note: "Investigating the scene. Joe hurt her years ago." }
    ],
    keyEvidence: ["lavender-scented massage oil", "red nail polish", "eyes weren't looking at Joe", "Kiara’s damp hair", "pretend that she didn’t know"],
    questions: [
      { q: "Who killed Joe?", options: ["Matthew", "Kiara", "Leon", "Sky"], answer: 1,
        hint: "Look closely at what Sky finds near the sink — and whose product it is." },
      { q: "How did the killer do it?", options: [
          "Poisoned his tequila during dinner",
          "Hit him with a heavy bottle from behind",
          "Caught him off guard with massage oil, then snapped his neck",
          "Pushed him and he hit his head on the kitchen island"], answer: 2,
        hint: "Remember the bruises on Joe's neck and the oil on the counter." },
      { q: "What was the killer's motive?", options: [
          "Joe had hurt her years ago",
          "She discovered Joe was messaging another woman",
          "She wanted Joe's money",
          "Joe had insulted her brother"], answer: 1,
        hint: "Why did they break up the week before? And whose name appears on Joe's phone?" },
      { q: "What was the red herring?", options: [
          "Leon's shadow in the hallway, which pointed at Sky",
          "Matthew's warm whisky",
          "The cut mooring lines",
          "Kiara's mascara"], answer: 0,
        hint: "Which clue made an innocent person look guilty?" },
      { q: "What was the twist?", options: [
          "Joe was still alive",
          "Sky had planned everything",
          "The 'grieving' girlfriend was the killer and her tears were an act",
          "Matthew was not really Kiara's brother"], answer: 2,
        hint: "Where were Kiara's eyes looking while she cried?" }
    ],
    solution: {
      culprit: "Kiara",
      text: [
        "It was Kiara. She had discovered proof that Joe’s promises of “forever” were nothing but lies: she caught him messaging another woman during their brief separation, and this betrayal shattered her illusion that she had everything under control.",
        "Aware of her own physical strength, she turned his arrogance against him. During an intimate moment, she used lavender massage oil to catch him off guard and snapped his neck before he could react. She cut the dock lines to trap everyone, ruining her flawless red manicure in the struggle — and instantly slipped into the role of a woman shattered by grief."
      ],
      redHerring: "Leon was sure the shadow in the hallway was Sky — and Sky had a secret motive. But it was a distraction.",
      twist: "The loudest mourner was the murderer. Her eyes, fixed on the doorway, gave her away."
    },
    report: ["Which action, appearance detail, or mannerism helped you infer an emotion or intention?"]
  },

  /* ---------------------------------------------------- 2 */
  {
    id: "money",
    title: "All for Money",
    teaser: "A red sedan, a bullet hole in the windshield, and a CEO who will never drive home.",
    setting: "Ramos Arizpe, Mexico · 10:00 p.m.",
    victim: "Dante Valenzuela, CEO of ML Steel Coils",
    difficulty: 3,
    story: [
      "It's a cold night in Ramos Arizpe. At this time of night, usually the only vehicles on the street are buses taking the workers home from their companies.",
      "On the side of Venustiano Carranza Road, a red sedan is parked on the shoulder, amber lights blinking slowly. Nothing suspicious, right? That’s the thing nobody notices: the car has been in that same spot for about an hour.",
      "The owner of a local security-equipment shop noticed the peculiar car parked without moving for hours. Something switched on inside him. His head was screaming at him to go and investigate; his body was telling him not to. But who leads the body? The brain.",
      "After closing his store at exactly 10:00 p.m., the owner walks up to the car, peacefully parked on the side of the road. He looks around it first, searching for a flat tire or damage — some reason to pull over and wait for so long.",
      "As he walks to the front of the car, he looks through the windshield and spots a hole, the glass cracked around it. A bullet hole. The innocent civilian feels his skin turn cold in an instant. He runs to the driver's door and begins banging on the window. No response at all.",
      "The fear of finding someone dead, or the relief of finding someone alive, floods his head. He shakes it off, grabs his flashlight and shines it inside the car.",
      "There he is: Dante Valenzuela, head against the steering wheel, motionless. The civilian quickly slams the door shut and calls the police.",
      "## 10 minutes later",
      "Sirens fill the silent night of Ramos Arizpe. Ambulances, police trucks and firefighters respond to the scene. The police tape off the street and redirect traffic towards Saltillo. They keep the civilian who found Dante in custody as the primary suspect.",
      "“Sir, I will have to detain you as the main suspect in the death of Dante,” the police officer said as he approached with the cuffs in his hand.",
      "“Officer, I didn’t do it! I swear to God! I was in my shop all night long! I have security cameras! You can check the tapes! They are not manipulated, they're immaculate!”",
      "The officer narrowed his eyes and stopped, putting the cuffs in his back pocket as he crossed his arms. “Is that so? Take me to your shop. I want to check those tapes with my own eyes. If I realize you're lying, you are coming with me to the station with a murder charge. Got it?”",
      "The civilian swallowed as he took the officer to the surveillance room. The tape starts at 12:00 p.m., when the owner opened the store. He fast-forwards all the way to 8:12 p.m., showing the red car slowly pulling to a stop on the side of the road.",
      "## Police report",
      "Police were dispatched to a 911 call about a homicide outside a store, where a local shop owner found a dead body inside a red car with a bullet hole through the windshield.",
      "The victim: Dante Valenzuela, 31 years old, married to Renata Sotomayor, no kids, CEO of ML Steel Coils. He was famous in the steel-coil world; his company made millions every month, giving him and his wife a lot of power and earning the envy of many of his relatives. The case is still open, and there are 3 main suspects.",
      "Nicolas Frederickson, Dante's friend, was one of the last people to contact Dante. He invited him to a meeting at his house and asked him to stop at the local shop to buy food and drinks first. When asked, he refused to say the reason for the meeting. Renata confirmed this information.",
      "John Lucas is Dante's brother and business partner. Renata told the police that John and Dante had recently argued about the goods, decisions and management of their company. She also said that John was jealous of his brother and was not comfortable with Dante having a higher position. When interrogated, John confirmed the conflict, but said it did not mean he wanted his brother dead.",
      "Pedro Stone was caught on one of the security cameras. His car passed Dante's car and he took a photograph of it. He explained that he was in the area because he often goes to a bar near the store. He recognized the car because he knew it belonged to Renata's husband. Pedro stated that Renata had messaged him asking if he could locate Dante’s car. He took a photograph of the car and sent it to her, but claimed he did not think much of it at the time, because it was late and he wanted to get home.",
      "Renata said she knew Pedro from a relationship years ago. They broke up on good terms and sometimes chat on social media. However, Renata never mentioned asking Pedro to locate Dante’s car or receiving the photograph he took that night."
    ],
    suspects: [
      { name: "The shop owner", role: "Found the body", note: "Arrested first, but has security tapes." },
      { name: "Nicolas Frederickson", role: "Dante's friend", note: "Invited Dante to a secret meeting." },
      { name: "John Lucas", role: "Dante's brother & partner", note: "Argued with Dante about the company." },
      { name: "Pedro Stone", role: "Renata's ex-boyfriend", note: "Photographed Dante's car that night." },
      { name: "Renata Sotomayor", role: "Dante's wife", note: "Gave the police a lot of information." }
    ],
    keyEvidence: ["Renata confirmed this information", "Renata told the police that John", "Renata had messaged him asking", "Renata never mentioned asking Pedro"],
    questions: [
      { q: "Who was behind Dante's murder?", options: ["The shop owner", "John Lucas", "Pedro Stone", "Renata Sotomayor"], answer: 3,
        hint: "Who knew exactly where Dante would be — and kept a secret from the police?" },
      { q: "What was the motive?", options: [
          "Jealousy about a higher position in the company",
          "She wanted all of her husband's money and goods",
          "Revenge for a broken relationship",
          "A robbery that went wrong"], answer: 1,
        hint: "The title of the case is a big clue." },
      { q: "Which suspect seemed most suspicious at first but was innocent?", options: ["Pedro Stone", "Nicolas Frederickson", "Renata Sotomayor", "Dante himself"], answer: 0,
        hint: "Who was caught on camera next to the car?" },
      { q: "What was the red herring, and its real meaning?", options: [
          "The amber lights — the car had broken down",
          "Pedro's photograph — it really showed that Renata wanted to know if Dante was already dead",
          "The security tapes — they were manipulated",
          "Nicolas's meeting — it was a surprise party"], answer: 1,
        hint: "Who asked for that photo, and why would she need it?" },
      { q: "What was the twist?", options: [
          "Dante faked his death",
          "The shop owner was Dante's brother",
          "The killer was never on the list of suspects, so she stayed unnoticed",
          "Nicolas and John worked together"], answer: 2,
        hint: "Count the 3 official suspects. Who is missing?" }
    ],
    solution: {
      culprit: "Renata Sotomayor",
      text: [
        "Renata was behind the murder. She knew about the goods and money her husband had, and she wanted it all.",
        "She knew where Dante was going to be (she confirmed Nicolas's meeting), so she could arrange for him to be killed. She talked about Dante's goods and his fights with his family, and she pointed the police at John to keep herself hidden. She asked Pedro to find the car to check whether her husband was already dead — and then avoided mentioning it."
      ],
      redHerring: "Pedro's photograph made him look like the assassin, but the same photo proves that Renata wanted to know if her husband was dead.",
      twist: "Renata was never listed with the suspects — you had to notice she was the only person who knew the whole situation."
    },
    report: ["Which action, appearance detail, or mannerism helped you infer an emotion or intention?"]
  },

  /* ---------------------------------------------------- 3 */
  {
    id: "badge",
    title: "Beneath the Badge",
    teaser: "A police officer shot dead in a subway station — and a USB full of dirty secrets.",
    setting: "A city subway station · before opening",
    victim: "Officer Edward Montgomery",
    difficulty: 2,
    story: [
      "A dreadful scent engulfed the subway station; no sound emerged until the steps of a woman matched the pacing of her fingers drumming on her legs while she looked at her feet. Suddenly, a strange sensation went through her nerves. She had just seen a body — the body of a police officer!",
      "The victim, identified as Edward Montgomery, was found shot to death. He was on duty when the events took place; we sent him for an autopsy as soon as possible. His unkempt uniform and the scrapes on his fists explained everything. The forensic team told us that the culprit must have a bruise on his face, because Edward seemed to have fought before his death.",
      "In a trash can near the body, we found a USB full of evidence about drug dealing in the area. Every file pointed to one man: Jefferson Gutierritos, a dealer with a long arrest record.",
      "We visited him first. He was dark-haired with prominent cheekbones, and these features highlighted a purple bruise under his eye. “Boxing match last night,” he said, shrugging his shoulders. He didn’t hesitate to answer once we asked. “Edward? He was the best partner I ever had. He was my delivery man in the area.”",
      "Then we went to speak to Edward's partner: tall, blonde, the kind of guy who seemed calm, but he had a bruise on his face, and a grimace was clearly showing. Joseph Johnson. Joseph placidly answered: “Sorry, I don’t know who Edward met last night.” He clenched his fist with great strength. “I will arrest the guy myself! Edward was kind of reserved, such an altruistic person. Maybe he was on a case and didn’t want to put me in danger.”",
      "We searched the police department for clues. We found a letter written by the same woman who found the body: “Tell me where this money is coming from or we will get a divorce!” Why didn't she say anything? Her name is Gretchen; she is the victim’s wife.",
      "“Sorry I didn’t speak before! I was in shock about what happened. After grieving, I am ready to speak up. When I saw Edward’s body, I could not do anything but isolate myself, but I am sure that I saw someone running to the exit right before I arrived. He threw something in the river before disappearing in the mist.” She said it with a haggard look in her eyes, as tears fell on her immaculate dress.",
      "“Why didn't you report the body when you found it?” “I was in shock when I found the body, okay?! My mind already tried to erase what I saw.”",
      "We had pushed this woman to her limit, so we went to the river, and after some diving we found Edward’s pistol. It seems to be the murder weapon.",
      "Then we went back to the very first place where everything started: the subway station. We had to hurry, since it was almost time to open it again to the public. We found a note from Gutierritos: it said Edward could get in trouble if he weren’t more cautious! We ran to Gutierritos's home.",
      "“I’ve already told you, the guy was my partner; he loved dirty money!” “So you wanted to kill him before he became a problem, huh? Before he started asking for more money? You seem like the kind of guy who gets in fights often; look at that bruise on your face!” “Look, I hated the guy, but I wouldn’t have gained anything from killing him.”",
      "It didn’t make sense that such an honest and altruistic man could be part of this. What also didn't make sense was that Joseph, his right-hand man, didn’t know a thing about the crime.",
      "“Did you know Edward got into big problems?” “I know he wasn’t the cop of the year, but why would that matter?” “Of course it matters!” “Look, he had a family! I didn’t want them to see him as a bad guy; he was my best friend!” “Then why didn’t you stop him?!” “I tried, but he didn’t listen, not even ONCE!”",
      "We were close to finding who did this, but we needed a final clue. We knew the killer threw the murder weapon into the river next to the station. That's it! At the river, we saw a security camera; we knew it would lead us to what we were looking for. After analyzing it, we found the truth: a blonde-haired person threw the gun into the river. That means we have our culprit…"
    ],
    suspects: [
      { name: "Jefferson Gutierritos", role: "Drug dealer", note: "Named in every file on the USB. Has a bruise from 'boxing'." },
      { name: "Joseph Johnson", role: "Edward's police partner", note: "Calm, but bruised. Clenches his fist." },
      { name: "Gretchen", role: "Edward's wife", note: "Found the body. Wrote an angry letter about money." }
    ],
    keyEvidence: ["culprit must have a bruise", "tall, blonde", "clenched his fist", "blonde-haired person threw the gun"],
    questions: [
      { q: "Who killed Edward?", options: ["Jefferson Gutierritos", "Gretchen", "Joseph Johnson", "An unknown passenger"], answer: 2,
        hint: "What did the river camera show? Compare it with each suspect's description." },
      { q: "What happened?", options: [
          "He planned the murder for months",
          "He confronted Edward with the USB; Edward pulled his gun, they fought, and he shot Edward in the heat of the moment",
          "He paid the dealer to do it",
          "It was an accident during a training exercise"], answer: 1,
        hint: "The scrapes on Edward's fists show there was a fight first." },
      { q: "Which suspect seemed most suspicious but was innocent?", options: ["Joseph Johnson", "Jefferson Gutierritos", "Edward", "The forensic team"], answer: 1,
        hint: "Who did every file on the USB point to?" },
      { q: "What was the red herring?", options: [
          "Gretchen's late report and angry letter — she was really in shock",
          "The pistol in the river",
          "The subway opening time",
          "Joseph's bruise"], answer: 0,
        hint: "Whose story didn't match at first, but for an innocent reason?" },
      { q: "What was the twist?", options: [
          "Edward was alive",
          "Gretchen was the dealer's partner",
          "The 'honest' victim was corrupt and tried to kill his own partner",
          "The USB was fake"], answer: 2,
        hint: "Who pulled the gun first?" }
    ],
    solution: {
      culprit: "Joseph Johnson",
      text: [
        "Joseph Johnson found out about Edward's crimes and couldn't let him ruin his life. Edward had been his inspiration to become an officer.",
        "Johnson told Edward to meet him at the subway station, showed him a USB with all his crimes and said he was going to report him. Edward laughed in his face and pulled his gun. They fought, and somehow Johnson ended up pointing the gun at Edward. It was the heat of the moment and fear for his life. He threw the pistol in the river — and the camera saw a blonde man."
      ],
      redHerring: "Gretchen seemed suspicious because her version didn't match well, but it was the shock of the moment — in the end she told the truth.",
      twist: "Edward, the 'altruistic' officer, wanted to kill his partner when he said he would report him."
    },
    report: ["Which action, appearance detail, or mannerism helped you infer an emotion or intention?"]
  },

  /* ---------------------------------------------------- 4 */
  {
    id: "deed",
    title: "Business Deeds",
    teaser: "A storm, a blackout, a cup of tea — and a businessman poisoned in his study.",
    setting: "The Carter mansion · October 14",
    victim: "Daniel Carter, businessman (52)",
    difficulty: 3,
    story: [
      "On October 14, the businessman Daniel Carter was found dead in his study. Outside his mansion, a storm had ended, leaving the house silent. Earlier that evening, a dinner had ended in an argument. The electricity failed because of the storm, forcing everyone to walk in the dark for some time.",
      "Daniel's study was immaculate, except for an unfinished letter with financial documents scattered over his desk. Beside them, an empty saucer rested on the desk. There were no signs of struggle. During the dinner, just 4 people were inside the mansion: Jonathan Carter, Hilary Valentine, Haruno Hiobana and Marta Carter.",
      "## Autopsy card",
      "Victim: Daniel Carter, 52 years old. Cause of death: poisoning. Estimated time of death: 11:02 p.m. Body discovered: 12:30 a.m. Notes: the poison was consumed minutes before death.",
      "## Jonathan Carter — brother",
      "Jonathan had asked Daniel for money to pay his debts, but Daniel refused. They fought before dinner. “After dinner I went to my bedroom. I was still mad at Daniel, so I decided to sleep — I don't remember at what time. My nightstand clock said 10:45 p.m. when I woke up to go to the bathroom. The hallway was black, so I used my phone to find my way. There was no one around, but a cup caught my attention as I was about to open the bathroom door. When I finished, the lights had come back, and on my way to my room I saw Hilary at Daniel's door, handing him the tea.” When asked if he entered the study, he shrugged his shoulders and denied it.",
      "## Hilary Valentine — assistant",
      "Hilary managed Daniel's company accounts. Recently, Daniel discovered missing funds and threatened to report her. “I had a call from my workmate at 10:40 and we talked the whole time; I was complaining about Daniel. When the lights came back, I muted the call to go out. There was no one in sight, so I checked the temperature of the tea with my pinky finger. After checking it, I gave Daniel his tea myself.” Hilary looked haggard during questioning, repeatedly checking her watch.",
      "## Haruno Hiobana — housekeeper",
      "In Daniel's bedroom, the police found a letter that was going to be delivered to Haruno. In it, Daniel expressed his anger, accusing Haruno of stealing valuable objects from the mansion. Her money would be withheld until she returned them. In her interview she said: “Before the blackout, I went to give Daniel a cup of tea. Before I knocked on his door, the lights went out on their own. I left the cup on a desk beside the door to go and check the fuse box. I had to feel the box in the dark, and because of that, I accidentally burned my hand slightly. When the lights came back, I returned to the door, but Hilary had already taken the tea in.”",
      "## Marta Carter — Daniel's daughter",
      "She is the daughter of Daniel's first marriage. She lives in the city, and her father abandoned her financially. She claims she arrived during the storm shortly before 10:40 p.m. to demand the money her father owed her. They argued in his study. The conversation only increased the hate inside Marta. She left shortly after the blackout started. Her only words in the interview were: “I haven't spoken to my father in months. I was at home all evening.”",
      "## Investigation notes",
      "Autopsy notes: the poison was consumed in a concentrated quantity. From ingestion to death there were less than 5 minutes.",
      "The cup was recovered, hidden behind the kitchen cleaning supplies. It had been washed thoroughly, with inexperienced speed.",
      "Hilary talked about an “allergic reaction”: her pinky finger was red and she was constantly scratching it.",
      "During his interview, Jonathan mentioned a faint red light coming from the electrical panel. Looking closer, there was a word on it, “Backup”, and a faint noise came from outside a minute after the lights went out.",
      "Even though the tea had the poison, there were no traces of poison on the saucer, the handle or the table.",
      "During her interview, Haruno asked for a bowl of iced water to calm the pain of her burn, but she dipped just the tip of her fingers in it.",
      "Examining the bathroom, there were no signs of the toilet being flushed for at least two days.",
      "Hilary's phone records show that her call connected at 10:40 p.m. and stayed connected until 11:35 p.m. Her workmate was interviewed twice: Hilary complained about Daniel, then somewhere around 10:47 to 10:50 p.m., Hilary went quiet.",
      "A search of Jonathan's bedroom showed that he was hiding inheritance documents.",
      "Ten minutes after the police arrived, the electricity was cut again.",
      "A neighbor saw Marta's bike on the road at 10:35 p.m. There is a visitor entry in the house book for that night, in handwriting that is not Haruno's, crossed out. Marta was wearing bike gloves when she entered the house. A folded paper with a substance was found in her coat pocket. She said it was hers, for her nerves, and that she had carried it for a year. She showed a prescription, but it was out of date and the writing was hard to read."
    ],
    suspects: [
      { name: "Jonathan Carter", role: "Brother", note: "Needed money. Hid inheritance documents." },
      { name: "Hilary Valentine", role: "Assistant", note: "Stole funds. Touched the tea with her pinky." },
      { name: "Haruno Hiobana", role: "Housekeeper (15 years)", note: "About to be accused of theft. 'Burned' her hand." },
      { name: "Marta Carter", role: "Daughter", note: "Lied about being home. Carried a mystery substance." }
    ],
    keyEvidence: ["“Backup”", "dipped just the tip of her fingers", "washed thoroughly, with inexperienced speed", "no traces of poison on the saucer"],
    questions: [
      { q: "Who poisoned Daniel?", options: ["Jonathan Carter", "Hilary Valentine", "Haruno Hiobana", "Marta Carter"], answer: 2,
        hint: "Who knew where the cleaning supplies were — and why didn't she put her whole hand in the iced water?" },
      { q: "What was the motive?", options: [
          "To get an inheritance",
          "Daniel was going to accuse her of stealing and withhold her money",
          "Daniel abandoned her as a child",
          "To hide the missing company funds"], answer: 1,
        hint: "Read the letter found in Daniel's bedroom." },
      { q: "Why was 'fixing the fuse box' suspicious?", options: [
          "The fuse box was on another floor",
          "The mansion had a backup power system, so it could have waited — it was an excuse",
          "She had never worked there before",
          "The fuse box was locked"], answer: 1,
        hint: "What word did Jonathan see on the electrical panel?" },
      { q: "What was the red herring?", options: [
          "Marta's mysterious substance in her coat pocket",
          "The storm",
          "Jonathan's phone light",
          "The unfinished letter"], answer: 0,
        hint: "Which suspicious object had an innocent (if messy) explanation?" },
      { q: "What was the twist?", options: [
          "Daniel poisoned himself",
          "No poison on the saucer or table, so the poison was added BEFORE the blackout — not in the dark",
          "Hilary's workmate was the killer",
          "There were two different poisons"], answer: 1,
        hint: "If you pour poison into a cup in total darkness, what usually happens?" }
    ],
    solution: {
      culprit: "Haruno Hiobana",
      text: [
        "Haruno, the housekeeper, poisoned the tea. Daniel was going to fire her and withhold her money, accusing her of stealing valuable objects without giving any reason or real evidence.",
        "After 15 years in the house, she knew it had a backup power system — so 'fixing the fuse box' was an excuse to leave the poisoned cup by the door. She said she burned her hand, but she only dipped her fingertips in the iced water, because the poison was dangerous to touch. And the cup was hidden and washed in a panic behind the cleaning supplies — a place only someone who knew the kitchen would choose."
      ],
      redHerring: "Marta's mysterious substance made her look guilty, but it was her (old) medicine for her nerves.",
      twist: "With no spill on the saucer or table, the poison could not have been poured in the dark. It was in the tea before the lights went out."
    },
    report: ["Which action, appearance detail, or mannerism helped you infer an emotion or intention?"]
  },

  /* ---------------------------------------------------- 5 */
  {
    id: "history",
    title: "History",
    teaser: "A top surgeon dead in Radiology at 1:23 a.m. Two men with bloody hands. One furious wife.",
    setting: "Saint Claire's Hospital · 1:23 a.m.",
    victim: "Dr. Julian Vance, surgeon",
    difficulty: 3,
    openEnding: true,
    story: [
      "The cold lights of Saint Claire's Hospital flickered softly against the sterile white corridors. It was 1:23 a.m. when Detective Miller and police officer Trinity Santos rushed into the Radiology Department, after someone called about a mysterious murder.",
      "On the cold floor lay Dr. Julian Vance, one of the hospital’s top surgeons, lifeless next to a heavy scatter of medical charts. His brother, Arthur Vance, and another hospital doctor were right next to him. The brother stood nearby trembling, his hands covered in his brother's blood, and his eyes reflected that he was in a state of deep shock and guilt. The other doctor was down on the floor next to the body, his hands and most of the front of his body also covered in blood. His expression almost seemed one of frustration; his gaze was unfocused, and his lips were pressed into a grimace.",
      "“I found him here,” choked out the first man, wiping something from his eye. “I ran in when I heard a crash, but it was too late.” The other doctor just shifted his gaze elsewhere.",
      "The detective and the officer nodded and asked them to go to private rooms to be questioned. They took them to separate rooms and began, when one of the nurses came in and told them that the victim’s wife had arrived at the hospital.",
      "The hospital was swarming with tension. Dr. Vance’s wife, Dana — a senior nurse on the third floor — arrived shortly after. Her expression said she was about to burst into tears, but she held it back, though her eyes betrayed a storm of fury and sadness. When she was face to face with the others, instead of waiting for their condolences, she immediately blamed her husband's mistress.",
      "“She wanted him all to herself,” Dana spat during the interrogation led by Detective Miller. “And she was furious when Julian refused to leave us. She left my daughter without her father just because of her selfishness.”",
      "However, Nurse Beatrice, who had been on duty at the main desk, offered a different perspective. She pulled Detective Miller aside, her voice dropping to a cautious whisper. “Be careful with Dana, Detective. She was on shift tonight, but right before the incident happened… she punched out and left her station early. And let’s not forget Arthur — he has always been fiercely jealous of his brother’s success and his life.”",
      "The detective simply nodded. “I’ll keep that in mind, thank you very much,” he said, and returned to the others. “Alright, we need to continue with the interrogations. Unfortunately, we can’t take you all to the station right now, but I assure you that we’ll do a thorough job right here.”",
      "Meanwhile, the officer took the victim’s wife aside. “Ma'am, I assure you that we are doing our absolute best to solve your husband's murder. However, we also need your cooperation, and please accept my apologies, but you must be interrogated too, just like the others.” The wife nodded and followed her.",
      "During the interrogations, everyone was cooperative except for the mistress, Elena, who seemed annoyed by the mere fact of having to be there. Apart from that, everyone appeared to have a solid alibi. Except for one person.",
      "The wife had clocked out a few moments before the estimated time of the attack. Arthur and Dr. Stephen both had similar cuts; they said they had both been attending to patients when it happened. Nurse Beatrice had been answering calls at the reception desk, and Elena claimed she had been in the cafeteria with a colleague — who had already clocked out.",
      "After the interrogations, they all went into a room that worked as a small dining room for the staff. Some stood closer together than others, and some seemed to repel each other like opposite poles of a magnet. The detective and the officer already seemed to have an idea of who it was…"
    ],
    suspects: [
      { name: "Arthur Vance", role: "Victim's brother", note: "Bloody hands, trembling. Jealous of Julian?" },
      { name: "Dr. Stephen", role: "Hospital doctor", note: "Bloody front, frustrated grimace, has a cut." },
      { name: "Dana Vance", role: "Victim's wife, senior nurse", note: "Clocked out early. Blames the mistress." },
      { name: "Elena", role: "Victim's mistress", note: "Annoyed. Her alibi witness had clocked out." },
      { name: "Nurse Beatrice", role: "Main-desk nurse", note: "Points the finger at Dana and Arthur." }
    ],
    keyEvidence: ["punched out and left her station early", "similar cuts", "had already clocked out", "lips were pressed into a grimace", "clocked out a few moments before"],
    questions: [
      { q: "Whose timeline breaks their alibi?", options: [
          "Nurse Beatrice — she left the main desk",
          "Dana — she punched out just moments before the attack",
          "Detective Miller",
          "Arthur — he arrived after the police"], answer: 1,
        hint: "Who clocked out right before the estimated time?" },
      { q: "What physical evidence connects Arthur and Dr. Stephen to a struggle?", options: [
          "Both had the victim's blood on them and similar cuts",
          "Both wore radiology badges",
          "Both had medical charts in their hands",
          "Both had wet shoes"], answer: 0,
        hint: "Look at their hands — and what they said about how they got hurt." },
      { q: "Who did Dana immediately blame, and why?", options: [
          "Arthur, because of jealousy",
          "Nurse Beatrice, because of a work fight",
          "The mistress, because Julian refused to leave his family",
          "Dr. Stephen, because of a failed surgery"], answer: 2,
        hint: "Read Dana's angry words in the interrogation." },
      { q: "What was the red herring from Nurse Beatrice?", options: [
          "That the lights were flickering",
          "Arthur's jealousy and Dana leaving early — pointing attention at the family",
          "That the victim was not a surgeon",
          "That the cafeteria was closed"], answer: 1,
        hint: "What did Beatrice whisper to the detective?" },
      { q: "What is the flaw in Elena's alibi?", options: [
          "She was seen in Radiology",
          "She has no flaw",
          "Her colleague had already clocked out, so nobody can confirm it",
          "The cafeteria camera shows someone else"], answer: 2,
        hint: "Who could confirm she was in the cafeteria?" }
    ],
    solution: {
      culprit: "Open ending",
      text: [
        "The authors left this case OPEN — the detective 'already had an idea', but the story never names the killer. The solution key focuses on reasoning:",
        "Dana punched out just before the attack, so she was free in the hospital at the exact moment. Arthur and Dr. Stephen both had the victim's blood on their hands and similar cuts they blamed on patients. Dana blamed the mistress (Elena), whose alibi can't be checked because her colleague had already clocked out. Nurse Beatrice's warnings about Arthur's jealousy and Dana's early exit pushed suspicion towards the family. Notice Dr. Stephen: on the floor, covered in blood on his front, with a frustrated, unfocused expression — was he trying to help, or to cover something up?"
      ],
      redHerring: "Nurse Beatrice's whisper about family jealousy and Dana's suspicious timing.",
      twist: "Everyone seemed to have a solid alibi — except for one person. Discuss with your class: who, and why?"
    },
    report: [
      "Which character's emotional display or physical posture seemed deceptive, and why?",
      "Which detail (like the hospital setting or the time of night) limited the investigation the most?",
      "YOUR VERDICT: Who do you think killed Dr. Vance? Defend your answer with the evidence."
    ]
  },

  /* ---------------------------------------------------- 6 */
  {
    id: "thumb",
    title: "The Fall of The Thumb",
    teaser: "The Godfather of a powerful syndicate is poisoned. You are the detective hired to find out who.",
    setting: "The Backstreets of The City · 9:00 a.m.",
    victim: "Emilia Bognatelli, head of The Thumb",
    difficulty: 2,
    story: [
      "## Backstory",
      "The Backstreets are the “dark side” of The City, full of criminals, syndicates and dangers unknown to most people, blessed and cursed by technologies beyond our comprehension. The Thumb is one of the most powerful syndicates in The Backstreets, as strong as The Nest, the City’s “right and correct” side according to its people.",
      "Today, Emilia Bognatelli, the Capo dei Capi (Godfather) and head of The Thumb, was found dead in her office from poisoning. The first person to find the body was Valencina Bognatelli, who arrived at Emilia's office and then told every member in the building not to go near that area.",
      "To avoid problems (mostly to stop The Thumb from collapsing, because of its tight hierarchy), YOU and some of your not-so-fortunate agents were hired by one of the Sottocapos (Underbosses) to solve this mystery and catch the murderer.",
      "## Suspect profiles",
      "Suspect 1: Valencina Bognatelli, 40. Sottocapo of The Thumb and Emilia’s right hand. Reason to be at the scene: to deliver paperwork to Emilia. Relationship with the victim: married to Emilia, and business.",
      "Suspect 2: Roland, 30. Emilia’s personal guard. Reason to be at the scene: keeping Emilia safe. Relationship with the victim: business only.",
      "Suspect 3: Jaxon, 20. Emilia’s personal cook. Reason to be at the scene: to deliver food to Emilia. Relationship with the victim: best friends with Emilia, and business.",
      "## Testimony 1 — Valencina",
      "The suspect entered the room in immaculate clothes before sitting in the chair. “You know… I knew this day was going to arrive sooner or later. Being syndicate scum is not a very good way to live… yet it still hurts to see it unravel before my very eyes!”",
      "The suspect clenched her fist as she tried to keep her usual cocky attitude. “Being the boss here is not an easy task, but she made it look easy… with that smile on her face… and that joyous laugh she always did when something went wrong… no anger or sarcasm in it…”",
      "Her face slowly turned into a displeased scowl. The interviewer asked: “When Emilia was alive, did you want her to give up her position to someone else?” “Ah… sometimes. She did her job really well, but in this hell there is always the chance to disappear very quickly… especially if you are very kind and innocent like her…”",
      "Her general appearance was unkempt and haggard; the only thing stopping her from falling asleep was her sorrow and pain. “Have you seen anything suspicious before her death? Any member unhappy with her?” “That idiot… Jaxon… used cinnamon in the dish he was cooking. I told him a thousand times that Emilia hates cinnamon… and he only shrugged his shoulders… It’s him… It must be him…”",
      "After that, the suspect tried to escape and punched one of the agents before being carried out of the room, sobbing loudly.",
      "## Testimony 2 — Roland",
      "The suspect entered the room in an unkempt black suit, stretching before sitting down and yawning. “You know I have to attend my wife’s funeral in a few days, right? This timing is horrible… oh well, that’s that and this is this…”",
      "The suspect gazed at the camera while drumming his fingers. “The Sottocapo who contacted us said you were found unconscious when a member found the victim’s body. Did something suspicious happen before that?” “Not much really. The morning was very slow. Emilia was dealing with heavy paperwork because of an accident with one of the subsidiaries. Many innocent people died because of that.”",
      "His eyes made contact with the interviewer as he took a deep breath. “Though… I remember eating one of Jaxon’s dishes with her before that… it felt off, like he tried to make something new.”",
      "“Anything else?” “Nah… I wish Emilia had managed The Thumb with a stronger grip. It seems she won’t be able to now, though… May I leave now?” The suspect left the room with an unbothered look, scratching his neck.",
      "## Testimony 3 — Jaxon",
      "The suspect entered slowly, his eyes moving from one object in the room to another, lost in his own world. “Ehh… this is because of Emilia, right? She’s… no longer in the world of the living… that hurts… really bad… She was a really good friend. Emilia gave me a kitchen where I could do whatever I wanted… Now what will happen to me?”",
      "“We were told you made a dish using cinnamon, even though Emilia disliked it. May I ask why?” “I cook one dish for everyone. For example, if I cook a stew, everyone eats stew… no exceptions, even for Emilia!”",
      "“Is Emilia allergic to cinnamon?” “No, she just found my dishes ‘yucky’ when I used cinnamon… BUT today I realized the bag of cinnamon I used was expired, so I decided to use a new bag… I will not cook two dishes…”",
      "“How’s The Thumb these days? We heard there was an incident with one of the subsidiaries.” “It was very messy. There was a fight in a restaurant where many people got killed… And after Roland's wife died some time ago, he’s been whimpering ‘boohoo, my wife is dead!’ all day… Now that I think about it… that fight happened near his house…”",
      "“Any suspicious activity from him?” “He’s been quite distant these days. We used to talk a lot, but since then he hasn’t spoken to anybody… He even took the food I was going to deliver to Emilia, personally, with a strong grip… May I leave now? I need to feed my boys!”",
      "## Timeline",
      "A week before: the restaurant conflict happened. Two days before: Roland found out his wife had died. TODAY — 7:00 a.m.: Jaxon started cooking. 7:30 a.m.: Jaxon's food for Emilia was taken by Roland. 9:00 a.m.: Valencina found Emilia's body."
    ],
    suspects: [
      { name: "Valencina Bognatelli", role: "Sottocapo, Emilia's wife", note: "Heartbroken and furious. Blames the cook." },
      { name: "Roland", role: "Personal guard", note: "'Found unconscious'. His wife just died." },
      { name: "Jaxon", role: "Personal cook", note: "Used cinnamon that Emilia hated." }
    ],
    keyEvidence: ["that fight happened near his house", "took the food I was going to deliver", "found unconscious", "stronger grip", "Jaxon's food for Emilia was taken by Roland"],
    questions: [
      { q: "Who poisoned Emilia?", options: ["Valencina Bognatelli", "Roland", "Jaxon", "A rival from The Nest"], answer: 1,
        hint: "Check the timeline: who had the food last before it reached Emilia?" },
      { q: "What was the motive?", options: [
          "To become the new boss",
          "Revenge: his wife died in the restaurant fight linked to The Thumb",
          "Money from The Nest",
          "He hated cinnamon"], answer: 1,
        hint: "Where did the restaurant fight happen, and who was mourning?" },
      { q: "What was the red herring?", options: [
          "Jaxon's cinnamon — he just used a fresh bag because the old one was expired",
          "Valencina's punch",
          "The heavy paperwork",
          "The funeral"], answer: 0,
        hint: "Which detail did Valencina use to accuse someone?" },
      { q: "Which clue made the guard's story suspicious?", options: [
          "He was wearing a clean suit",
          "He said he loved Emilia",
          "He was 'found unconscious', and he personally took her food with a strong grip",
          "He arrived after 9:00 a.m."], answer: 2,
        hint: "Re-read the end of Jaxon's testimony." },
      { q: "What was the twist?", options: [
          "Emilia faked her death",
          "It was not the cook, but the guard",
          "Valencina and Jaxon were working together",
          "The poison was in the paperwork"], answer: 1,
        hint: "Everyone suspected the person who cooked the food…" }
    ],
    solution: {
      culprit: "Roland",
      text: [
        "Roland, the personal guard, poisoned Emilia. His motive was his wife's death: she died in the restaurant fight caused by The Thumb's subsidiary, near his house.",
        "Main clues: his wife's death and the restaurant fight; he was 'found unconscious' (after eating from the same plate to cover himself); he took Emilia's food from Jaxon with a strong grip; and his last words — he wished Emilia had ruled 'with a stronger grip'."
      ],
      redHerring: "Jaxon's cinnamon. Innocent explanation: he simply opened a fresh bag of cinnamon because the old one was expired.",
      twist: "It was not Jaxon the cook, but Roland the guard."
    },
    report: [
      "Did the actions and emotions of the suspects help you solve the case?",
      "Rate the difficulty: Too Easy Squeasy, Fair and Square, or Hard Like a Brick? Why?"
    ]
  },

  /* ---------------------------------------------------- 7 */
  {
    id: "comfort",
    title: "Murder at the Comfort Inn",
    teaser: "A Christmas staff dinner. The manager leaves to get something… and never comes back.",
    setting: "Comfort Inn Memphis Downtown · December 13",
    victim: "Paul Steine, hotel manager (27)",
    difficulty: 1,
    story: [
      "At the Comfort Inn Memphis Downtown Hotel, on December 13, a dinner was held for the hotel employees. The atmosphere was festive because it was almost Christmas. Everyone was there, even the manager — hated by some because he stole someone’s wife. He was raising his glass to give a speech when he remembered he had forgotten something in his office, so he excused himself to get it. 10 minutes, 20 minutes, 30 minutes, 1 hour, 2 hours. The manager didn't return, so 5 employees decided to go and look for him.",
      "When they arrived at the office door, they noticed blood at the entrance. They opened the door quickly, only to find the manager lying on the floor in a pool of blood.",
      "## Victim profile",
      "Name: Paul Steine. Age: 27. Partner: Claudia S. Roger. Occupation: hotel manager. Birthplace: Memphis, Tennessee. Description: black hair, around 5'7\" to 5'8\".",
      "## The investigation",
      "The police arrived 30 minutes after the body was found. They collected evidence and took photos of the scene. While searching, they found a black button from a suit jacket under the desk.",
      "A few minutes after an investigator arrived, he started asking different employees questions. Everyone told the same story: the manager was about to give his speech when he realized he had forgotten something and went to his office. After that, no one saw him again.",
      "After checking the cameras and questioning as many people as possible, the case was still unsolved. Not a single piece of evidence at the crime scene helped; there was no DNA or biological sample. However, the autopsy determined that the cause of death was fatal stab wounds followed by strangulation.",
      "A few days passed and, despite the lack of evidence, the investigator found 3 main suspects, thanks to exhaustive research on the cameras.",
      "The security guard: he wasn’t in the main room when the manager was going to give his speech, and he didn’t return until 1 hour later.",
      "A resident: he appears on the cameras even though he didn’t come to the dinner. He disappeared from the stairway cameras, which makes him a suspect.",
      "The waiter: he was hired to serve at the dinner. He appears on the cameras carrying a tray, but later he also disappeared, and some employees said they didn’t see him after that.",
      "Even with the cameras, it was very difficult to recognize the killer because of the low quality. But all three had things in common: they were in formal clothes, had a heavy build and black hair. The 3 were detained and taken to the station for questioning. They were wearing the same clothes as that day.",
      "## Interrogations",
      "First, the security guard. He was wearing very immaculate clothes; he didn’t look unkempt.",
      "Policeman 1: “On the cameras, you leave the room a few minutes before the manager. Where were you at that moment?” Security guard (Michael Bennett): “I was doing my job, you know. My job is securing the entire perimeter. I was doing a routine inspection. If you check the security gate logs, you’ll be able to verify that I was carrying out my duties.”",
      "In another room, the resident looked impatient. He was scowling. Policeman 1: “What were you doing at the moment the manager was killed?” Resident (Ethan Walker): “I was arriving from work. I didn’t want to socialize, so I just went to my apartment.” Policeman 2: “Why did you use the stairs instead of the elevator?” Resident: “One of the elevators was out of service, and the other was on the 30th floor, so I decided to use the stairs. I don’t appear on the cameras of the upper floors because I stopped on the middle landing of the stairs.”",
      "And finally, the waiter. He was drumming his fingers, looking around, wearing haggard clothes. Waiter (Christopher Roger): “I was in the area with the kitchen and the pantries. Serving a dinner means refilling drinks, clearing plates and preparing desserts, all out of sight of the guests.”"
    ],
    suspects: [
      { name: "Michael Bennett", role: "Security guard", note: "Left the room before the manager. Immaculate clothes." },
      { name: "Ethan Walker", role: "Hotel resident", note: "Skipped the dinner. Vanished on the stairs." },
      { name: "Christopher Roger", role: "Waiter", note: "Disappeared with a tray. Haggard clothes." }
    ],
    keyEvidence: ["Claudia S. Roger", "black button from a suit jacket", "wearing haggard clothes", "same clothes as that day", "stole someone’s wife"],
    questions: [
      { q: "Who killed Paul Steine?", options: ["Michael Bennett", "Ethan Walker", "Christopher Roger", "One of the 5 employees"], answer: 2,
        hint: "Compare every suspect's surname with the victim profile." },
      { q: "What was the motive?", options: [
          "He wanted the manager's job",
          "The manager stole his wife",
          "The manager fired him",
          "A robbery"], answer: 1,
        hint: "The first paragraph says why the manager was hated." },
      { q: "Which clue in the victim profile connects to the killer?", options: [
          "The birthplace, Memphis",
          "The partner's surname: Claudia S. ROGER",
          "The age, 27",
          "The black hair"], answer: 1,
        hint: "Read the victim profile again, slowly." },
      { q: "Which physical clue points to him?", options: [
          "Blood on his shoes",
          "His haggard clothes — the formal suit of that day, matching the black button found under the desk",
          "A knife in the pantry",
          "A camera photo of his face"], answer: 1,
        hint: "What was found under the desk, and what were the suspects wearing?" },
      { q: "What was the red herring?", options: [
          "The resident disappearing from the stairway cameras",
          "The Christmas dinner",
          "The broken elevator on the 30th floor",
          "The security gate logs"], answer: 0,
        hint: "Which suspect looked guilty because of the cameras, but had a simple explanation?" }
    ],
    solution: {
      culprit: "Christopher Roger (the waiter)",
      text: [
        "The waiter, Christopher Roger, killed the manager because the manager stole his wife.",
        "In the victim profile, the manager's partner is Claudia S. ROGER — the same surname as the waiter. During questioning, the waiter wore 'haggard' clothes, but they were the formal clothes of that day: a suit missing the black button the police found under the desk."
      ],
      redHerring: "The resident's disappearance on the stairs — he just stopped on the middle landing because the elevators weren't working.",
      twist: "The answer was hiding in plain sight, in the victim profile: a surname."
    },
    report: ["What specific detail in the suspect descriptions or testimony helped you realize who the murderer was?"]
  },

  /* ---------------------------------------------------- 8 */
  {
    id: "anna",
    title: "The Anna Pérez Murder",
    teaser: "1984. A young woman found outside Blackwood, a strange symbol, and a note with three names.",
    setting: "Blackwood · October 17, 1984",
    victim: "Anna Pérez (24)",
    difficulty: 2,
    story: [
      "## Young woman found dead",
      "On October 17, 1984, Anna Pérez, a 24-year-old woman with long brown hair, green eyes, and a small scar above her eyebrow, was found dead in an abandoned area outside Blackwood. The scene was disturbing. Anna had severe facial injuries, and her hands and feet had been removed and stitched back in the wrong positions. A mysterious symbol had been carved into her thigh with a knife. According to the forensic report, she died from a cerebral hemorrhage caused by repeated blows to the head. Anna was last seen at The Blue Moon, a local nightclub, where she spoke to a man before leaving alone.",
      "## John Smith: the first suspect",
      "John Smith, 31, was tall and broad-shouldered, with short black hair, dark eyes, and a scar on his chin. He usually wore a black leather jacket. John knew Anna and had reportedly argued with her days before her death. During his interrogation, he crossed his arms and stared at the floor. “I knew her, but I had nothing to do with her death,” he insisted. When the detective mentioned Anna’s name, John clenched his fists and tightened his jaw.",
      "Police discovered a notebook containing Anna’s name and the sentence: “She knows about the letter.” John looked away when asked about it and claimed he could not remember what it meant. That night, John had been seen walking beside Blackwood Lake with Carl Johnson. A witness confirmed seeing both men around 9:40 p.m.",
      "## Carl Johnson: the witness",
      "Carl Johnson, 28, was slim, with curly blond hair, blue eyes, and an old brown coat. He often bites his lower lip when nervous. Carl had no known relationship with Anna. He explained that John had invited him for a walk to discuss a personal problem. “John seemed worried,” Carl said, nervously playing with his sleeve. “He asked me if someone could keep a secret forever.” Carl gave slightly different answers about what time he arrived at the lake. However, police found no direct evidence connecting him to the murder.",
      "## Peter Jefferson: the nightclub connection",
      "Peter Jefferson, 34, was slim, with neatly combed brown hair, gray eyes, and a formal gray suit. He had met Anna at The Blue Moon weeks earlier. Anna’s coworker, Margaret Ellis, remembered Anna complaining about a man who refused to accept that their relationship was over. Peter claimed he had stayed home on the night of the murder, but nobody could confirm his story.",
      "During questioning, he calmly folded his hands until he suddenly asked, “Did you find the notebook?” The detective stopped writing. “We never mentioned a notebook,” he replied. Peter swallowed nervously and forced a small smile. “I meant her personal belongings.” The detectives recorded his reaction.",
      "## The mysterious symbol",
      "Police discovered the same symbol found on Anna’s thigh on a piece of paper among her belongings. Beneath it was written: “Every promise leaves a mark.” Margaret, a short woman with red hair and round glasses, nervously twisted a strand of hair while speaking to detectives. “Anna told me someone was trying to make her look like a liar,” she explained. Investigators also found a note listing three names: John, Carl, and Peter. Beside John’s name was the word “letter,” beside Carl’s was “lake,” and Peter’s name had no explanation.",
      "## The final clue",
      "Detective Thomas Reed, a gray-haired man in his fifties, reviewed the evidence and sighed. “Someone is hiding information,” he said. “We must separate real clues from distractions.” The police considered that Anna might have been killed somewhere else and her body moved afterward. John’s suspicious behavior, Carl’s presence at the lake, and Peter’s strange question all complicated the investigation. The case remained unsolved, and the detective’s final report ended with one question: Who killed Anna Pérez, and who wanted the police to suspect the wrong person?"
    ],
    suspects: [
      { name: "John Smith", role: "Knew Anna", note: "Argued with her. A notebook mentions 'the letter'." },
      { name: "Carl Johnson", role: "Witness", note: "Walked with John at the lake. Nervous." },
      { name: "Peter Jefferson", role: "Met Anna at The Blue Moon", note: "Says he was home. Nobody can confirm it." }
    ],
    keyEvidence: ["Did you find the notebook?", "We never mentioned a notebook", "refused to accept that their relationship was over", "Every promise leaves a mark", "nobody could confirm his story"],
    questions: [
      { q: "Who killed Anna Pérez?", options: ["John Smith", "Carl Johnson", "Peter Jefferson", "Margaret Ellis"], answer: 2,
        hint: "Someone knew something the police never told him." },
      { q: "What was the motive?", options: [
          "To protect a secret letter",
          "He refused to accept their relationship was over and killed her in impulsive rage",
          "Money she owed him",
          "She saw something at the lake"], answer: 1,
        hint: "What did Anna complain about to her coworker Margaret?" },
      { q: "What mistake did the murderer make?", options: [
          "He left his gray suit at the scene",
          "He asked about the notebook, which the police had never mentioned",
          "He gave two different times",
          "He signed his name on the note"], answer: 1,
        hint: "Why did the detective stop writing?" },
      { q: "What was the red herring?", options: [
          "John Smith — he argued with Anna, had the notebook and acted strangely",
          "Carl's blue eyes",
          "The Blue Moon nightclub",
          "Detective Reed"], answer: 0,
        hint: "Who was 'the first suspect'?" },
      { q: "What was the twist?", options: [
          "Anna was still alive",
          "Margaret, the coworker, revealed the key information about the man who couldn't let go",
          "Carl and John were brothers",
          "The detective was the killer"], answer: 1,
        hint: "Which witness gave information that connects to 'Every promise leaves a mark'?" }
    ],
    solution: {
      culprit: "Peter Jefferson",
      text: [
        "Peter Jefferson killed Anna. He refused to accept that their relationship was over, and he killed her in an impulsive rage.",
        "Clues: in his testimony he accidentally revealed key information — he asked about the notebook the police had never mentioned. He looked nervous and forced a smile. And the note in Anna's belongings, “Every promise leaves a mark”, talks about promises — something from a past relationship. Nobody could confirm his alibi."
      ],
      redHerring: "John Smith: he knew Anna, argued with her days before, had a strange notebook and a weird attitude in his interrogation.",
      twist: "Anna's coworker Margaret revealed the key: a man who refused to accept the relationship was over."
    },
    report: [
      "What is the main clue that helps solve the case?",
      "Which one of the suspects has no reason to be accused?"
    ]
  },

  /* ---------------------------------------------------- 9 */
  {
    id: "hotel",
    title: "The Last Night at the Hotel",
    teaser: "A stopped clock, a cold cup of tea, and three staff members with something to hide.",
    setting: "Riverside Hotel · 9:00 p.m., rain",
    victim: "Mr. Brown, hotel owner",
    difficulty: 1,
    story: [
      "Rain hit the windows of the small Riverside Hotel. At 9:00 p.m., the owner, Mr. Brown, was found dead in his office. The police believed he had been murdered, but there were no signs of a fight. The office door was closed, and the wall clock had stopped at 8:30 p.m.",
      "Detective James arrived and spoke to the only three people who had been near the office that evening: Sarah, Tom, and Mark.",
      "Sarah, a slender woman who is the hotel manager, said she had been at the front desk from 8:00 until 8:45. Mr. Brown planned to fire her because some money was missing from the hotel accounts. She looked at the floor as she spoke and kept folding the same piece of paper.",
      "Tom, a big, stout man who was the cook, said he had been in the kitchen making dinner. He had argued with Mr. Brown earlier that day about a late delivery. Tom's sleeves were wet, and there was mud on his shoe. He explained that he had gone outside to bring in a box before the rain became heavy.",
      "Mark, the night cleaner and the stockiest of the three, said he had seen Mr. Brown alive at 8:20. He claimed he had left a cup of tea outside the office and heard Mr. Brown say, “Thank you.” He also said the wall clock was working when he passed it.",
      "At first glance, Tom seemed like the obvious suspect. His wet clothes and muddy shoe made him look suspicious. However, the mud matched the path where deliveries were left, and the back door was beside the kitchen.",
      "Detective James checked the office. The cup of tea was still outside the door, almost full and cold. He also noticed that the clock's battery had been removed. It was inside a wastebasket near the cleaning supplies.",
      "Mark said he had not touched the clock. He explained that he had only cleaned the wall below it. But Sarah remembered seeing Mark leave the office hallway around 8:35. Mark said he had been in the laundry room since 8:15. Both stories could not be true.",
      "James looked at Mark's cleaning cloth. A small brown mark on it matched the polish used on Mr. Brown's desk. Mark had said he never entered the office, yet the cloth suggested he had been inside.",
      "Mark finally admitted that he had entered the office to get a key Mr. Brown had borrowed. The key was found in his pocket. He claimed Mr. Brown was alive when he left, but his story kept changing.",
      "Then James found a note in the front desk book. At 8:32, someone had called asking to speak to Mr. Brown. Sarah remembered the call because nobody answered it. This meant the clock had not stopped by accident. Someone had removed the battery to confuse the timeline. The cold tea also seemed less important now: it did not prove that Mr. Brown was alive at 8:20.",
      "James looked at Mark again. The cleaner stopped talking and stared at the floor. His hands shook as the detective placed the key and the cloth on the desk. All three of them had unsteady eyes, constantly moving from side to side. Sarah especially looked very different from her usual serious personality, while the other two were concerned but didn't show much emotion."
    ],
    suspects: [
      { name: "Sarah", role: "Hotel manager", note: "About to be fired over missing money. Nervous." },
      { name: "Tom", role: "Cook", note: "Argued with Mr. Brown. Wet sleeves, muddy shoe." },
      { name: "Mark", role: "Night cleaner", note: "Says he saw Mr. Brown alive at 8:20." }
    ],
    keyEvidence: ["battery had been removed", "Sarah remembered seeing Mark leave", "matched the polish", "key was found in his pocket", "almost full and cold"],
    questions: [
      { q: "Who killed Mr. Brown?", options: ["Sarah", "Tom", "Mark", "The person who phoned at 8:32"], answer: 2,
        hint: "Whose story changed again and again?" },
      { q: "Why is the stopped clock important?", options: [
          "It shows the exact time of death",
          "Its battery was removed on purpose to confuse the timeline",
          "It was a gift from Sarah",
          "It is not important"], answer: 1,
        hint: "Where was the clock's battery found?" },
      { q: "Does the cold tea prove Mr. Brown was alive at 8:20?", options: [
          "Yes, he said 'Thank you'",
          "No — it was almost full and cold, so maybe nobody ever drank it",
          "Yes, the cup was empty",
          "No, because Tom made it"], answer: 1,
        hint: "Would a living man leave his tea almost full outside the door?" },
      { q: "What was the red herring?", options: [
          "Sarah's folded paper",
          "Tom's wet clothes and muddy shoe — he had brought in a delivery box",
          "The phone call",
          "The rain"], answer: 1,
        hint: "Who 'seemed like the obvious suspect' at first glance?" },
      { q: "Which two clues show the killer entered the office?", options: [
          "The polish mark on his cloth and the key in his pocket",
          "The rain and the mud",
          "The money and the paper",
          "The phone call and the front desk"], answer: 0,
        hint: "He said he never went inside. What did he carry?" }
    ],
    solution: {
      culprit: "Mark, the night cleaner",
      text: [
        "Mark killed Mr. Brown. He was afraid Mr. Brown would discover that he had taken hotel property and report him to the police.",
        "Mark had access to the office and its key. He removed the battery from the wall clock so it looked like it stopped naturally at 8:30, and he left the cup of tea outside to make it seem Mr. Brown was alive when Mark said he saw him. But Sarah saw him leave the hallway at 8:35 while he claimed to be in the laundry room since 8:15, the polish on his cloth matched the desk, and the key was in his pocket."
      ],
      redHerring: "Tom's wet clothes and muddy shoe made him look guilty, but he had gone out to bring in a delivery box. The mud matched the delivery path.",
      twist: "The stopped clock and the tea seemed to support Mark's story — but the clock was tampered with, and the cold tea proves nothing."
    },
    report: [
      "What do you think really happened between 8:15 and 8:45 p.m.?",
      "Which clue helped you reach your final decision?"
    ]
  },

  /* ---------------------------------------------------- 10 */
  {
    id: "lastpage",
    title: "The Last Page",
    teaser: "A stormy night in a New York library. The lights go out. When they come back, someone is dead.",
    setting: "“The Fifth Page” library, New York City",
    victim: "Annie Jefferson",
    difficulty: 3,
    story: [
      "Rain poured over New York City; the evening sun was slowly hiding as the night came to life. On the sidewalk, a couple walked, holding hands.",
      "“How are your feet, Annie?” the man asked, looking at his wife with loving eyes. “I'm good, Conrad. Don't worry,” Annie answered in a soft voice.",
      "They kept walking through the busy street until they reached their destination: “The Fifth Page”, the library where Annie’s sister worked. Conrad opened the door for his wife; she entered, followed by her husband. They were approached by a young woman who looked directly at Conrad.",
      "“Doctor Jefferson! What a coincidence to bump into you here!” the girl said, her arms around a pile of books, with a smile that didn’t reach her eyes. “How have you been?”",
      "Conrad smiled awkwardly, his arm wrapped around his wife's waist. “Hello, Miss Walter. My wife and I have been good, thank you for asking,” he responded coldly, just how a surgeon would.",
      "“Please, just call me Alissa. It's the least I can do after you saved my brother's life.” Alissa suddenly noticed Annie, and how her husband held onto her, which caused a slight frown on her face. “Mrs. Jefferson, nice to see you! How have you been holding up with your high blood pressure?”",
      "Annie's eye twitched slightly, and she forced a smile. “Good, everything's been fine, thank goodness. Thank you for asking,” she said, sneaking glances at her sister at the reception desk.",
      "“I see… well, I don't want to keep you here with chitchat. I'll see you around, Mr. and Mrs. Jefferson,” Alissa answered, before walking to the reception desk with a big smile for her friend. “Here they are, all the books you recommended to me.”",
      "The couple looked at each other before walking in different directions.",
      "A few minutes passed and the storm got stronger. Thunder roared louder by the second. At one point, it got so bad that the floor beneath them shook, and the lights went out.",
      "Annie, scared, ran towards the reception desk, where she met her husband. Conrad was calmer, chatting comfortably with his wife’s sister, while Alissa leaned against the desk, near the computer.",
      "“You two seem oddly comfortable together…” Annie said, her voice breaking slightly as she clenched her fists. “What do you mean, Annie?” her sister asked, confused. Yet her palm was touching Conrad’s.",
      "“I mean that you have been sleeping with my husband, Amy. I know it. I've known it for a while now.” Her eyebrows lowered and a scowl appeared on her face.",
      "“What?! Annie, what are you even talking about?! Of course not! I would never.” Amy grimaced at the thought of betraying her sister’s trust and pulled her hand away as if she had been burnt, walking around the desk toward her sister.",
      "Both sisters started to argue, and it was nasty. During the argument, Annie pulled an object from her purse: a small box, sealed and practically untouched. The picture on the packaging showed the same lipstick color that Amy was wearing.",
      "Annie started to sweat. Her hands trembled and her vision started to blur; soon, she lost her balance and fell to the ground. Her husband caught her, while Amy hurried to grab the water bottle Conrad had in his backpack next to the computer. Alissa tried to say something, but bit her tongue, looking scared at Annie as she drank the whole bottle.",
      "After Annie finished drinking, she seemed better, but just a few minutes later, she passed out. Her husband held her until the lights came back on, and that’s when they noticed.",
      "Annie was ghostly pale and she wasn’t breathing. She was limp in her husband’s arms with her eyes closed. She was dead."
    ],
    suspects: [
      { name: "Conrad Jefferson", role: "Annie's husband, surgeon", note: "Very close to Annie's sister." },
      { name: "Amy", role: "Annie's sister, librarian", note: "Wearing the lipstick from the box. Gave Annie the water." },
      { name: "Alissa Walter", role: "Library visitor", note: "Conrad saved her brother's life. Friend of Amy." }
    ],
    keyEvidence: ["smile that didn’t reach her eyes", "slight frown on her face", "leaned against the desk, near the computer", "backpack next to the computer", "bit her tongue"],
    questions: [
      { q: "Who killed Annie?", options: ["Conrad Jefferson", "Amy", "Alissa Walter", "Nobody — it was her high blood pressure"], answer: 2,
        hint: "Who was standing next to the backpack in the dark — and who almost said something?" },
      { q: "What killed Annie?", options: [
          "A heart attack from the argument",
          "Poisoned lipstick",
          "Cyanide in the water bottle",
          "She hit her head when she fell"], answer: 2,
        hint: "She seemed better after drinking… and then?" },
      { q: "Who was the poison REALLY meant for?", options: ["Annie", "Amy", "Conrad", "Alissa's brother"], answer: 2,
        hint: "Whose backpack was the water bottle in?" },
      { q: "What was the red herring?", options: [
          "The lipstick box — it was a gift Amy asked Conrad to buy for Annie",
          "The storm",
          "Conrad's cold voice",
          "The pile of books"], answer: 0,
        hint: "What made Annie think her sister and husband were having an affair?" },
      { q: "What was the twist?", options: [
          "Amy and Conrad were really having an affair",
          "Annie was not the target — the killer wanted Conrad, and Annie drank the poison by accident",
          "Annie poisoned herself",
          "Alissa's brother was the killer"], answer: 1,
        hint: "The killer's plan backfired." }
    ],
    solution: {
      culprit: "Alissa Walter",
      text: [
        "The autopsy revealed the cause of death: cyanide poisoning. In the interviews, Conrad was devastated, regretting that he had not stayed loyal to his wife. Alissa seemed traumatized and refused to talk. Amy was so overcome with grief that she had to be sedated. Then the culprit confessed: Alissa Walter.",
        "After Conrad saved her brother's life, Alissa became obsessed with him. She befriended Annie's sister Amy to get into his life, and Conrad had an affair with her — until his guilt made him leave her for his marriage. Alissa spiralled: she stalked him and planted love notes so it looked like Amy and Conrad were having an affair. When Conrad threatened legal action, she decided to kill him instead.",
        "She got cyanide and, after learning from Amy that the couple would visit the library, poisoned the water in Conrad's backpack. But her plan backfired: Annie drank it. Alissa wanted to say something, but knew it would be a confession — so she stayed quiet."
      ],
      redHerring: "The lipstick: Amy had asked Conrad to buy it as a gift for Annie, who kept borrowing hers. The hand touching was accidental (they were comparing a birthmark Amy and Annie share).",
      twist: "The victim was never the target. The poison was meant for Conrad."
    },
    report: [
      "Which parts of the story felt odd to you? Why?",
      "Which clue did you notice first?"
    ]
  },

  /* ---------------------------------------------------- 11 */
  {
    id: "okaga",
    title: "The Poisoned Petals of Okaga",
    teaser: "An 82-year-old lady, a cup of lavender tea, and a garden full of beautiful, deadly flowers.",
    setting: "Okaga House garden · late afternoon",
    victim: "Lady Erika (82)",
    difficulty: 2,
    story: [
      "The garden at Okaga House looked soft and pretty in the late-afternoon light. Roses climbed up the stone arbor, and oleander bushes lined the gravel paths. On the bench under the arbor sat Lady Erika, eighty-two years old, still holding her cup of lavender tea. She looked like she had just fallen asleep.",
      "Carlos Vargas, the gardener, found her a little after half past four. His knees hit the ground hard, and he stayed there for a long moment with one gloved hand pressed against the stone, breathing too fast, before he finally ran up to the house.",
      "Detective Jane Juliet arrived while it was still light. She started looking into the three people who had been around the garden that afternoon.",
      "The neighbor, Alan Bowe, lived just on the other side of the low brick wall. He had been arguing with Lady Erika for years about where the wall should be and about the rare orchids that grew near it. That afternoon, he said, he had been in his study writing letters from 2 until 5. Nobody could check if that was true, though. When the detective talked to him, he stood up straight, looking immaculate in a dark jacket, and just shrugged his shoulders when she asked about the old fight over the wall.",
      "Carlos had worked at Okaga for almost 11 years. His boots were heavy with dark soil from the far rose beds, and his clothes looked unkempt after a full day outside. A pair of his pruning shears lay on the gravel just a few steps from the bench. He said he had been alone in the far beds the whole afternoon and hadn’t gone near the arbor until he found her. While he talked, his right hand kept clenching and then slowly opening again.",
      "Belle was the helping lady. She cleaned the house three days a week and always made Lady Erika’s afternoon tea. She had carried the tray out at three o’clock, put it on the little iron table next to the bench, and gone straight back inside to polish the silver. She said she hadn’t stepped into the garden again until she heard shouting. When the detective asked her to say the exact time once more, Belle’s face tightened into a short grimace and she started to drum her fingers on the edge of the kitchen table.",
      "Detective Juliet walked the paths slowly, trying to piece together what had happened. Three things stood out right away.",
      "First, the teacup still had a little liquid in it. Later tests showed a strong dose of oleander extract, the kind you can only get from the leaves of the bushes along the western wall.",
      "Second, there was one expensive leather shoe print, size 43, pressed into the soft earth behind the oleander bushes. It faced the arbor and then turned sharply back towards the low brick wall. Neither Carlos’s work boots nor Belle’s soft indoor shoes matched it.",
      "Third, a small ceramic saucer that usually sat on the iron table was broken on the gravel three meters from the bench. One drop of the same tea was still on a sharp edge.",
      "By evening, the detective had started to narrow down the possibilities. Only one person knew about the poison and had a clear way across the wall. Only one person's shoes matched the print. And only one person had a strong enough reason to take a risk like that.",
      "But one small thing still bothered Detective Juliet. The broken saucer had gone farther from the bench than it should have if it had just fallen. Someone had kicked it or knocked it while moving in a hurry. That one sharp movement made her look at the whole afternoon once again.",
      "The garden grew quiet under the stars. Somewhere on the other side of the brick wall, a single light stayed on in Alan Bowe’s study."
    ],
    suspects: [
      { name: "Alan Bowe", role: "Neighbor", note: "Long fight over the wall and the orchids. Immaculate jacket." },
      { name: "Carlos Vargas", role: "Gardener (11 years)", note: "Found the body. Muddy boots, shears nearby." },
      { name: "Belle", role: "Helping lady", note: "Made the tea. Nervous about the time." }
    ],
    keyEvidence: ["size 43", "along the western wall", "three meters from the bench", "Nobody could check if that was true", "Neither Carlos’s work boots nor Belle’s soft indoor shoes matched it"],
    questions: [
      { q: "Who poisoned Lady Erika?", options: ["Carlos Vargas", "Belle", "Alan Bowe", "Detective Juliet"], answer: 2,
        hint: "Whose shoes could leave an expensive leather print — and who lives behind the wall?" },
      { q: "How did the killer do it?", options: [
          "Put rose thorns in her food",
          "Climbed over the low brick wall and poured oleander extract into her tea",
          "Changed the tea bags in the kitchen",
          "Used the pruning shears"], answer: 1,
        hint: "Where does the poison come from, and where does the shoe print turn?" },
      { q: "What was the motive?", options: [
          "He wanted to be the new gardener",
          "A long fight over the garden land and the rare orchids",
          "She owed him money",
          "She fired him"], answer: 1,
        hint: "What had they argued about for years?" },
      { q: "What was the red herring?", options: [
          "Carlos's muddy boots, unkempt clothes and shears near the body",
          "The lavender tea",
          "The light in the study",
          "Belle polishing silver"], answer: 0,
        hint: "Who looked like the obvious suspect?" },
      { q: "What was the twist?", options: [
          "Lady Erika was only asleep",
          "The broken saucer was too far away — someone left in a hurry",
          "Belle and Carlos were married",
          "The roses were poisoned"], answer: 1,
        hint: "What 'small thing' still bothered the detective?" }
    ],
    solution: {
      culprit: "Alan Bowe, the neighbor",
      text: [
        "Alan Bowe did it. Lady Erika had decided to sell the disputed strip of garden — including the rare orchids — and the papers were going to be signed the next morning. Bowe had fought for years for that land, and the sale would end his chances forever.",
        "At around 3:10 p.m., while Belle was inside polishing silver, Bowe climbed over the low brick wall behind the oleander bushes with strong oleander extract made from the bushes along the shared wall. He poured it into the teacup, knocked the saucer away in his hurry when he heard a noise from the house, and went back the same way. The size-43 leather shoe print is his.",
        "Carlos's heavy work boots and Belle's soft indoor shoes don't match the print. Carlos dropped the shears in shock; Belle's grimace and drumming fingers were just nerves."
      ],
      redHerring: "Carlos's muddy boots, the shears near the body and his unkempt look. He was working in the far beds and dropped the shears in real shock.",
      twist: "The saucer travelled too far to have simply fallen. Once you notice that, the shoe print, the poison source and the timing all fit — and Bowe's immaculate look and shrug become part of the act."
    },
    report: ["Which action, look or little habit helped you figure out how someone was feeling or what they were thinking?"]
  }
];
