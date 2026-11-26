from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[1]
# id, title, CEFR, skills, theme, description, source entry, content model
UPSTREAM=[
('detective-case-files','Detective Case Files','B1 B2','Reading Speaking','mystery','Read the case files, connect the evidence, and defend your accusation.','index.html','fixed'),
('bio-master','Bio Master','A2 B1','Vocabulary Reading','science','Explore biology through visual quizzes and team challenges.','index.html','quiz'),
('classroom-feud','Classroom Feud','A1 A2 B1 B2','Speaking Vocabulary','show','Guess the most popular answers in a classroom survey showdown.','index.html','survey'),
('compliance-cipher','The Compliance Cipher','B1 B2','Reading Grammar','mystery','Work through an escape-room mission using English clues.','index.html','fixed'),
('escape-planet-earth','Escape Planet Earth','A2 B1 B2','Reading Grammar Speaking','space','Solve English challenges together and escape the planet.','index.html','quiz'),
('flags-and-nationalities','Flags & Nationalities','A1 A2','Vocabulary Speaking','world','Discover countries, flags, and nationalities in a visual quiz.','index.html','fixed'),
('geo-master-primary-edition','Geo Master','A1 A2','Vocabulary Reading','world','Explore geography while practising English vocabulary.','index.html','quiz'),
('grammar-adventurers','Grammar Adventurers','A1 A2','Grammar Reading','adventure','Explore seven illustrated grammar chapters and a final challenge.','index.html','fixed'),
('grammar-auction','Grammar Auction','A2 B1 B2','Grammar Speaking','auction','Bid on sentences and decide which grammar is worth your points.','index.html','sentences'),
('grammar-battleship','Grammar Battleship','A2 B1 B2','Grammar Speaking','ocean','Answer grammar questions to find and sink the opposing fleet.','index.html','quiz'),
('grammar-time-machine','The Grammar Time Machine','A1 A2 B1','Grammar Reading','time','Travel through stories and discover how English tenses work.','index.html','fixed'),
('human-sentence-scramble','Human Sentence Scramble','A1 A2 B1','Grammar Speaking','words','Turn your classroom into a living sentence-building challenge.','index.html','sentences'),
('library-kiosk-buzzer','Memory Court','B1 B2','Reading Listening','mystery','Read, remember, and buzz in with evidence from a text.','index.html','fixed'),
('mega-console','Mega Console','A2 B1 B2','Vocabulary Spelling','space','Unlock the console by solving vocabulary and spelling clues.','index.html','words'),
('mission-30-stage-override','Mission: 30-Stage Override','A2 B1 B2','Vocabulary Spelling','space','Complete a sequence of vocabulary and trivia security challenges.','index.html','words'),
('negotiation-tactics','Operation: Chronos','B1 B2 C1','Speaking Reading','mystery','Negotiate, explain your choices, and complete a tactical mission.','index.html','fixed'),
('paradox-blackwood','The Paradox at Blackwood Manor','B1 B2 C1','Reading Speaking','mystery','Investigate a mysterious manor and unravel its English clues.','index.html','fixed'),
('sentence-auction','Sentence Auction','A2 B1 B2','Grammar Speaking','auction','Compete in an auction where correct sentences win the round.','index.html','sentences'),
('sentence-showdown','Sentence Showdown','A2 B1 B2','Grammar Writing','show','Challenge another team to a fast-paced sentence duel.','index.html','sentences'),
('spelling-bee','Spelling Bee','A1 A2 B1 B2','Spelling Listening','words','Spin, spell, and celebrate a classroom spelling champion.','index.html','words'),
('sudden-death-spelling-bee','Sudden Death Spelling Bee','A1 A2 B1 B2','Spelling Listening','words','Keep your place in a high-energy spelling elimination challenge.','index.html','words'),
('tense-master-sudden-death','Tense Master','A2 B1 B2','Grammar Speaking','time','Choose the right tense and survive the next grammar round.','index.html','quiz'),
('timezone-game','Time Zone Travelers','A1 A2','Vocabulary Speaking','world','Travel around the world while learning to tell the time.','index.html','fixed'),
('transformation-taboo','Transformation Taboo','B1 B2 C1','Grammar Speaking','words','Transform sentences while avoiding the forbidden words.','index.html','sentences'),
('vocab-spelling','Vocab Spelling Bet','A1 A2 B1 B2','Spelling Vocabulary','auction','Bet your points on how well you know the next word.','index.html','words'),
('webrtc-betting-game','Grammar Betting Game','A2 B1 B2','Grammar Speaking','auction','Use points, confidence, and grammar in a classroom betting game.','index.html','quiz'),
('wh-questions-game','WH-Questions Game Show','A1 A2 B1','Grammar Speaking','show','Build confidence with who, what, where, when, why, and how.','index.html','quiz'),
('world-history-quiz','World History Quiz','B1 B2','Reading Vocabulary','world','Explore world history through an English quiz adventure.','index.html','quiz'),
('world_cup','English World Cup','A1 A2 B1 B2','Grammar Vocabulary','sport','Answer English challenges and score in a penalty shootout.','index.html','quiz')]
LOCAL=[
('restaurant-mission','Restaurant Mission','A1 A2','Speaking Vocabulary','food','Practise ordering food and taking orders in a restaurant.','semana_01/restaurant_practice.html','fixed'),
('worst-restaurant','The Worst Restaurant in the World','A2 B1','Speaking Reading','food','Solve the mishaps of a very unusual restaurant service.','semana_01/worst_restaurant_game.html','fixed'),
('family-sprint','Family Sprint','A1 A2','Vocabulary Writing','words','A quick classroom challenge for family vocabulary.','semana_02/family_sprint.html','words'),
('speaking-quest','Speaking Quest','A1 A2 B1','Speaking Listening','adventure','Find guests, ask questions, and build a conversation.','semana_03/friday_3c_speaking_quest.html','fixed'),
('numbers-dates-times','Numbers, Dates & Times','A1 A2 B1','Vocabulary Speaking','time','Learn, play, and pronounce numbers, dates, and times.','semana_03/monday_numbers_dates_times.html','fixed'),
('party-mingle','The Party Invite','A1 A2 B1','Speaking Listening','show','Mingle, invite your classmates, and arrange a party.','semana_04/2026-09-24_party_mingle.html','fixed'),
('daily-routines','Daily Routines','A1 A2','Grammar Speaking','time','Build everyday routines with useful verbs and questions.','semana_05/daily_routines_clase.html','fixed'),
('clothing-store','In a Clothing Store','A1 A2','Speaking Vocabulary','words','Practise asking about clothes, prices, sizes, and colours.','semana_06/clothing_store_class1.html','fixed'),
('clothing-vocabulary','Clothing Vocabulary Lab','A1 A2','Vocabulary Listening','words','Explore and practise the words you need in a clothing store.','semana_06/clothing_store_vocabulary_lab.html','words'),
('mystery-menu','Mystery Menu: Master Chef','A2 B1','Speaking Reading','food','Decode the menu and run a collaborative kitchen challenge.','semana_07/mystery_menu/index.html','fixed'),
('the-missing-key','The Missing Key','A2 B1 B2','Reading Speaking','mystery','Explore an after-hours mystery and find the missing key.','semana_08/the_missing_key/index.html','fixed'),
('s-and-z','S & Z Pronunciation Lab','A1 A2 B1','Pronunciation Listening','sound','Hear and practise the difference between S and Z.','semana_09/S_AND_Z.html','fixed'),
('beer-bird-bear-beard','Beer, Bird, Bear, Beard','A2 B1','Pronunciation Listening','sound','Train your ear with four easily confused English sounds.','semana_09/BEER_BIRD_BEAR_BEARD.html','fixed'),
('guess-the-patient','Guess the Patient','A1 A2 B1','Speaking Vocabulary','health','Describe symptoms and discover the mystery patient.','semana_10/guess_the_patient/index.html','quiz'),
('health-loteria','Health Lotería','A1 A2','Listening Vocabulary','health','Play a visual lotería game with health and symptom vocabulary.','semana_10/health_loteria/index.html','words'),
('clinic-rally','Clinic Rally','A2 B1','Speaking Reading','health','Work through a team rally of English clinic challenges.','semana_11/clinic_rally/index.html','quiz'),
('dental-lab','The Dental Lab','A1 A2 B1','Vocabulary Speaking','health','Explore dental vocabulary through interactive practice.','semana_12/dental_lab/index.html','words'),
('monster-smiles','Monster Smiles','A1 A2','Vocabulary Speaking','health','Help the monsters keep their teeth in a classroom challenge.','semana_12/monster_smiles/index.html','quiz'),
('family-feud-faro','Family Feud: Classroom Edition','A1 A2 B1 B2','Speaking Vocabulary','show','A team survey game with optional buzzers and teacher judging.','family-feud/index.html','survey'),
('farito','Conversation Missions','A1 A2 B1 B2','Speaking Writing','adventure','Practise English through structured conversation missions.','farito/index.html','fixed')]
games=[]
for origin,rows in [('github',UPSTREAM),('faro',LOCAL),('betting', [('grammar-rush','Grammar Rush','A2 B1 B2','Grammar Speaking','auction','Race, bet points, and explain your grammar choices.','grammar-auction.html','quiz')])]:
 for id,title,levels,skills,theme,description,entry,model in rows:
  path=f'{id}/{entry}' if origin=='github' else f'faro-games/{entry}' if origin=='faro' else f'grammar-rush/{entry}'
  games.append(dict(id=id,title=title,levels=levels.split(),skills=skills.split(),theme=theme,description=description,entry='/'+path,source=origin,contentModel=model,duration=20,players='1–class',offline=False,offlineReason='Dependency and cold-offline verification pending',preview=f'/gallery/covers/{id}.svg'))
(ROOT/'catalog/games.json').write_text(json.dumps({'version':1,'games':games},indent=2,ensure_ascii=False)+'\n')
ledger={g['id']:{'source':g['entry'],'privacy':'pending','browser':'pending','contentAdapter':'fixed authored content' if g['contentModel']=='fixed' else 'pending','offline':'pending','notes':[]} for g in games}
(ROOT/'catalog/migration.json').write_text(json.dumps(ledger,indent=2)+'\n')
print(len(games),'games catalogued')
