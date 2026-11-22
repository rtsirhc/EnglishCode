
import json

# Define the structure
levels = []

# Helper to add a level
def add_level(lvl_num, title, word_data):
    # word_data is list of dicts now to support options
    # Entry format: {"word": "...", "clue": "...", "options": [...]}
    processed_words = []
    for item in word_data:
        entry = {
            "word": item["word"].upper(),
            "clue": item["clue"]
        }
        if "type" in item:
            entry["type"] = item["type"]
        if "options" in item:
            entry["options"] = item["options"]
        processed_words.append(entry)
        
    levels.append({
        "level": lvl_num,
        "title": title,
        "words": processed_words
    })

# --- LEVEL 1: PREPOSITIONS (Fill in the Blank) ---
l1_data = [
    {"word": "IN", "clue": "The keys are ___ my pocket."},
    {"word": "ON", "clue": "The picture is ___ the wall."},
    {"word": "AT", "clue": "We will meet ___ the station."},
    {"word": "TO", "clue": "I am going ___ the store."},
    {"word": "INTO", "clue": "She walked ___ the room (entering)."},
    {"word": "ONTO", "clue": "The cat jumped ___ the table (movement up)."},
    {"word": "OFF", "clue": "The book fell ___ the shelf."},
    {"word": "OUT OF", "clue": "He walked ___ the house (leaving)."},
    {"word": "AT", "clue": "She is good ___ math."},
    {"word": "IN", "clue": "I live ___ London."},
    {"word": "ON", "clue": "My birthday is ___ Monday."},
    {"word": "TO", "clue": "Happy Birthday ___ you."},
    {"word": "OFF", "clue": "Take your shoes ___."},
    {"word": "INTO", "clue": "Pour the water ___ the glass."},
    {"word": "OUT OF", "clue": "Get ___ bed!"}
]
add_level(1, "PREPOSITION MAZE", l1_data)

# --- LEVEL 2: SCIENCE BASICS (Multiple Choice) ---
l2_data = [
    {"word": "OXYGEN", "clue": "Gas humans breathe?", "type": "choice", "options": ["CARBON", "OXYGEN", "HELIUM"]},
    {"word": "ROOTS", "clue": "Underground plant part?", "type": "choice", "options": ["ROOTS", "LEAVES", "STEM"]},
    {"word": "SOLID", "clue": "Ice is a...", "type": "choice", "options": ["LIQUID", "GAS", "SOLID"]},
    {"word": "GRAVITY", "clue": "Force pulling down?", "type": "choice", "options": ["MAGNETISM", "GRAVITY", "FRICTION"]},
    {"word": "HEART", "clue": "Pumps blood?", "type": "choice", "options": ["LUNGS", "BRAIN", "HEART"]},
    {"word": "SUN", "clue": "Earth orbits the...", "type": "choice", "options": ["MOON", "SUN", "MARS"]},
    {"word": "H2O", "clue": "Formula for water?", "type": "choice", "options": ["CO2", "H2O", "O2"]},
    {"word": "VENUS", "clue": "Hottest planet?", "type": "choice", "options": ["MARS", "VENUS", "EARTH"]},
    {"word": "SKIN", "clue": "Largest organ?", "type": "choice", "options": ["LIVER", "SKIN", "HEART"]},
    {"word": "BLUE", "clue": "Hottest star color?", "type": "choice", "options": ["RED", "BLUE", "YELLOW"]},
    {"word": "LUNGS", "clue": "Organs for breathing?", "type": "choice", "options": ["HEART", "LUNGS", "STOMACH"]},
    {"word": "MOON", "clue": "Earth's satellite?", "type": "choice", "options": ["SUN", "MOON", "MARS"]},
    {"word": "IRON", "clue": "Metal in blood?", "type": "choice", "options": ["GOLD", "IRON", "SILVER"]},
    {"word": "GAS", "clue": "State of matter for air?", "type": "choice", "options": ["SOLID", "LIQUID", "GAS"]},
    {"word": "SEED", "clue": "Baby plant?", "type": "choice", "options": ["LEAF", "SEED", "ROOT"]}
]
add_level(2, "SCIENCE BASICS", l2_data)

# --- LEVEL 3: SPELLING BEE (Typing Challenge) ---
l3_data = [
    {"word": "ACHIEVE", "clue": "To succeed by effort."},
    {"word": "BELIEVE", "clue": "To think something is true."},
    {"word": "FRIEND", "clue": "A person you like."},
    {"word": "RHYTHM", "clue": "A strong regular beat."},
    {"word": "NECESSARY", "clue": "Needed."},
    {"word": "SEPARATE", "clue": "To keep apart."},
    {"word": "DEFINITELY", "clue": "For sure."},
    {"word": "BUSINESS", "clue": "Work or trade."},
    {"word": "TOMORROW", "clue": "The day after today."},
    {"word": "SUCCESS", "clue": "Winning."}
]
add_level(3, "SPELLING BEE", l3_data)

# --- LEVEL 4: GRAMMAR GAUNTLET (Fill in Blank) ---
l4_data = [
    {"word": "WENT", "clue": "Yesterday, I ___ to the park."},
    {"word": "SEEN", "clue": "I have never ___ such a big dog."},
    {"word": "BETTER", "clue": "This book is ___ than that one."},
    {"word": "WORST", "clue": "That was the ___ movie ever."},
    {"word": "HAPPILY", "clue": "They lived ___ ever after."},
    {"word": "RUNNING", "clue": "He is ___ very fast right now."},
    {"word": "MICE", "clue": "One mouse, two ___."},
    {"word": "TEETH", "clue": "One tooth, many ___."},
    {"word": "CHILDREN", "clue": "One child, many ___."},
    {"word": "MINE", "clue": "That bag belongs to me. It is ___."}
]
add_level(4, "GRAMMAR GAUNTLET", l4_data)

# --- LEVEL 5: SCIENCE PRO (Multiple Choice) ---
l5_data = [
    {"word": "ELECTRON", "clue": "Negative particle?", "type": "choice", "options": ["PROTON", "ELECTRON", "NEUTRON"]},
    {"word": "PHOTOSYNTHESIS", "clue": "Plants making food?", "type": "choice", "options": ["RESPIRATION", "PHOTOSYNTHESIS", "DIGESTION"]},
    {"word": "EVAPORATION", "clue": "Liquid to gas?", "type": "choice", "options": ["MELTING", "EVAPORATION", "FREEZING"]},
    {"word": "JUPITER", "clue": "Largest planet?", "type": "choice", "options": ["SATURN", "JUPITER", "SUN"]},
    {"word": "CELL", "clue": "Basic unit of life?", "type": "choice", "options": ["ATOM", "CELL", "TISSUE"]},
    {"word": "DNA", "clue": "Genetic code?", "type": "choice", "options": ["RNA", "DNA", "ATP"]},
    {"word": "ATOM", "clue": "Smallest unit of matter?", "type": "choice", "options": ["CELL", "ATOM", "MOLECULE"]},
    {"word": "MAGMA", "clue": "Hot rock underground?", "type": "choice", "options": ["LAVA", "MAGMA", "ASH"]},
    {"word": "LAVA", "clue": "Hot rock above ground?", "type": "choice", "options": ["MAGMA", "LAVA", "DIRT"]},
    {"word": "FOSSIL", "clue": "Old bone in rock?", "type": "choice", "options": ["STONE", "FOSSIL", "GEM"]},
    {"word": "MARS", "clue": " The Read Planet?", "type": "choice", "options": ["VENUS", "MARS", "JUPITER"]},
    {"word": "NEPTUNE", "clue": "Furthest planet?", "type": "choice", "options": ["URANUS", "NEPTUNE", "PLUTO"]},
    {"word": "ACID", "clue": "Low pH substance?", "type": "choice", "options": ["BASE", "ACID", "WATER"]},
    {"word": "BASE", "clue": "High pH substance?", "type": "choice", "options": ["ACID", "BASE", "SALT"]},
    {"word": "ECOSYSTEM", "clue": "Community of life?", "type": "choice", "options": ["HABITAT", "ECOSYSTEM", "BIOME"]}
]
add_level(5, "SCIENCE PRO", l5_data)

# --- LEVEL 6: COSMIC SCIENCE (Advanced Multiple Choice) ---
l6_data = [
    {"word": "GALAXY", "clue": "System of stars?", "type": "choice", "options": ["SOLAR SYSTEM", "GALAXY", "UNIVERSE"]},
    {"word": "BLACK HOLE", "clue": "Nothing escapes it?", "type": "choice", "options": ["BLACK HOLE", "SUPERNOVA", "NEBULA"]},
    {"word": "LIGHT YEAR", "clue": "Distance light travels in a year?", "type": "choice", "options": ["PARSEC", "LIGHT YEAR", "AU"]},
    {"word": "SUPERNOVA", "clue": "Exploding star?", "type": "choice", "options": ["DWARF", "SUPERNOVA", "COMET"]},
    {"word": "ASTEROID", "clue": "Rock orbiting sun?", "type": "choice", "options": ["COMET", "ASTEROID", "PLANET"]},
    {"word": "COMET", "clue": "Icy body with tail?", "type": "choice", "options": ["ASTEROID", "COMET", "METEOR"]},
    {"word": "ECLIPSE", "clue": "Moon blocks sun?", "type": "choice", "options": ["ECLIPSE", "PHASE", "TIDE"]},
    {"word": "ORBIT", "clue": "Path around planet?", "type": "choice", "options": ["SPIN", "ORBIT", "AXIS"]},
    {"word": "AXIS", "clue": "Earth spins on its...", "type": "choice", "options": ["POLE", "AXIS", "EQUATOR"]},
    {"word": "EQUATOR", "clue": "Middle line of Earth?", "type": "choice", "options": ["MERIDIAN", "EQUATOR", "TROPIC"]},
    {"word": "TELESCOPE", "clue": "Tool to see stars?", "type": "choice", "options": ["MICROSCOPE", "TELESCOPE", "BINOCULARS"]},
    {"word": "SATELLITE", "clue": "Machine orbiting Earth?", "type": "choice", "options": ["ROCKET", "SATELLITE", "PROBE"]},
    {"word": "VACUUM", "clue": "Space has no air, it is a...", "type": "choice", "options": ["GAS", "VACUUM", "VOID"]},
    {"word": "NEBULA", "clue": "Cloud of gas and dust?", "type": "choice", "options": ["GALAXY", "NEBULA", "STAR"]},
    {"word": "BIG BANG", "clue": "Start of universe?", "type": "choice", "options": ["BIG BANG", "BIG CRUNCH", "GENESIS"]}
]
add_level(6, "COSMIC SCIENCE", l6_data)

# Write to file
js_content = "window.gameLevels = " + json.dumps(levels, indent=4) + ";"
with open("words.js", "w") as f:
    f.write(js_content)

print(f"Generated words.js with 6 Levels (More Science than Spelling).")
