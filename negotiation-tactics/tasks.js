
// --- DATA ---

// Phase 1: 10 Tactical Navigation Tasks (Sector Clearance)
export const P1_TASKS = [
    {
        img: 'tactical_blueprint.png', desc: "Sector 1: Main Entrance Breach. Double doors ahead.",
        opts: [
            { t: "Stack UP on the door", ok: false, msg: "We need entry, not a waiting position." },
            { t: "Move THROUGH the doors", ok: true, msg: "Breach successful. Entry secured." },
            { t: "Go AROUND the doors", ok: false, msg: "Wall is reinforced concrete. Impossible." },
            { t: "Look INTO the doors", ok: false, msg: "Opaque steel. No visibility." }
        ]
    },
    {
        img: 'messy_desk_blocking_hallway.png', desc: "Sector 2: Administration. Barricade detected (Desks/Chairs).",
        opts: [
            { t: "Vault OVER the barricade", ok: true, msg: "Athletic clearance. Momentum maintained." },
            { t: "Crawl UNDER the barricade", ok: false, msg: "Too slow. Exposed to potential fire." },
            { t: "Walk THROUGH the barricade", ok: false, msg: "It's solid furniture. You can't phase through." },
            { t: "Push AGAINST the barricade", ok: false, msg: "It's wedged tight. No movement." }
        ]
    },
    {
        img: 'tactical_blueprint.png', desc: "Sector 3: T-Junction. Map indicates Vault is North.",
        opts: [
            { t: "Turn LEFT towards East Wing", ok: false, msg: "Dead end. Check your compass." },
            { t: "Proceed ALONG the North Hall", ok: true, msg: "Correct vector. Moving to target." },
            { t: "Go ACROSS the junction", ok: false, msg: "That leads to the cafeteria. Wrong way." },
            { t: "Back UP the hallway", ok: false, msg: "Retreat is not authorized." }
        ]
    },
    {
        img: 'broken_balcony_railing.png', desc: "Sector 4: Industrial Catwalk. Structural failure ahead.",
        opts: [
            { t: "Rappel DOWN the shaft", ok: false, msg: "Ropes not rigged. Fatal fall." },
            { t: "Jump ACROSS the gap", ok: true, msg: "Gap cleared. Team is across." },
            { t: "Walk ONTO the gap", ok: false, msg: "Gravity takes over immediately." },
            { t: "Run ALONG the railing", ok: false, msg: "Railing is unstable. It collapsed." }
        ]
    },
    {
        img: 'tactical_blueprint.png', desc: "Sector 5: Stairwell Access. Target is on Sub-Level 2.",
        opts: [
            { t: "Go UP the stairs", ok: false, msg: "That leads to the roof." },
            { t: "Descend DOWN the stairs", ok: true, msg: "Moving to lower levels." },
            { t: "Jump OVER the railing", ok: false, msg: "30-foot drop. Legs broken." },
            { t: "Walk ACROSS the landing", ok: false, msg: "You're just pacing in circles." }
        ]
    },
    {
        img: 'laser_grid_near_floor.png', desc: "Sector 6: Laser Tripwires detected at ankle height.",
        opts: [
            { t: "Crawl UNDER the lasers", ok: false, msg: "They are AT floor level. Detector triggered." },
            { t: "Step OVER the lasers", ok: true, msg: "Clean step. No trigger." },
            { t: "Walk THROUGH the lasers", ok: false, msg: "Alarm triggered immediately." },
            { t: "Slide INTO the lasers", ok: false, msg: "Why would you do that?" }
        ]
    },
    {
        img: 'tactical_blueprint.png', desc: "Sector 7: Ventilation Duct. Shortcut to Vault Antechamber.",
        opts: [
            { t: "Crawl INTO the vent", ok: true, msg: "Accessing maintenance tunnels." },
            { t: "Walk AROUND the vent", ok: false, msg: "No alternate route visible." },
            { t: "Step ON the vent", ok: false, msg: "It's on the wall. Physics error." },
            { t: "Look FROM the vent", ok: false, msg: "You need to enter it, not just look." }
        ]
    },
    {
        img: 'tactical_blueprint.png', desc: "Sector 8: Server Room. Narrow passage between racks.",
        opts: [
            { t: "Squeeze BETWEEN the servers", ok: true, msg: "Tight fit, but through." },
            { t: "Climb ON TOP of the servers", ok: false, msg: "Equipment damage. Alarm triggered." },
            { t: "Walk AROUND the room", ok: false, msg: "Detour too long. Time wasted." },
            { t: "Push THROUGH the racks", ok: false, msg: "Toppled a $50k server stack." }
        ]
    },
    {
        img: 'tactical_blueprint.png', desc: "Sector 9: Security Checkpoint. Glass partition.",
        opts: [
            { t: "Smash THROUGH the glass", ok: true, msg: "Dynamic entry. Quickest path." },
            { t: "Walk INTO the glass", ok: false, msg: "Faceplant. Embarrassing." },
            { t: "Look BEHIND the glass", ok: false, msg: "Yes, the vault is there. Go get it." },
            { t: "Go OVER the glass", ok: false, msg: "It's ceiling-high. Impossible." }
        ]
    },
    {
        img: 'tactical_blueprint.png', desc: "Sector 10: The Vault Door. Massive steel blast door.",
        opts: [
            { t: "Place charge ON the door", ok: true, msg: "Breach charge set. Fire in the hole!" },
            { t: "Knock ON the door", ok: false, msg: "No one is home." },
            { t: "Slide UNDER the door", ok: false, msg: "Clearance is 0mm." },
            { t: "Walk OF the door", ok: false, msg: "Grammar error. Operation failed." }
        ]
    }
];

// Phase 2: 10 Strict Input Tasks (ALL MUST USE 'BEFORE')
export const P2_TASKS = [
    {
        e1: "10:00 PM - Police Arrived", e2: "9:50 PM - Ate Sandwich",
        answers: ["You had eaten the sandwich before the police arrived.", "I had eaten the sandwich before the police arrived."]
    },
    {
        e1: "Now - Vault Open", e2: "5 Mins Ago - Code Entered",
        answers: ["We had entered the code before the vault opened.", "I had entered the code before the vault opened."]
    },
    {
        e1: "Morning - Guards Woke Up", e2: "Night - Gas Released",
        answers: ["The gas had been released before the guards woke up.", "We had released the gas before the guards woke up."]
    },
    {
        e1: "12:00 - Alarm Rang", e2: "11:59 - Wire Cut",
        answers: ["I had cut the wire before the alarm rang.", "We had cut the wire before the alarm rang."]
    },
    {
        e1: "She felt sick", e2: "She ate bad sushi",
        answers: ["She had eaten bad sushi before she felt sick."]
    },
    {
        e1: "The movie started", e2: "We arrived",
        answers: ["The movie had started before we arrived."]
    },
    {
        e1: "He passed the test", e2: "He studied hard",
        answers: ["He had studied hard before he passed the test."]
    },
    {
        e1: "The road became wet", e2: "It rained heavily",
        answers: ["It had rained heavily before the road became wet."]
    },
    {
        e1: "I called for help", e2: "I lost my key",
        answers: ["I had lost my key before I called for help."]
    },
    {
        e1: "They were hungry", e2: "They missed lunch",
        answers: ["They had missed lunch before they were hungry."]
    }
];

// Phase 3: 25 Science Questions (Harder Levels)
export const P3_TASKS = [
    // Level 1 (Warm up)
    { q: "What is the powerhouse of the cell?", opts: ["Mitochondria", "Nucleus", "Ribosome"], a: 0 },
    { q: "What is the chemical symbol for Gold?", opts: ["Au", "Ag", "Fe"], a: 0 },
    { q: "Which planet is known as the Red Planet?", opts: ["Venus", "Mars", "Jupiter"], a: 1 },
    { q: "What is the hardest natural substance?", opts: ["Steel", "Diamond", "Gold"], a: 1 },
    { q: "What is the boiling point of water at sea level (C)?", opts: ["90", "100", "212"], a: 1 },

    // Level 2 (Intermediate)
    { q: "What is the most abundant gas in Earth's atmosphere?", opts: ["Oxygen", "Nitrogen", "Carbon Dioxide"], a: 1 },
    { q: "Which subatomic particle has a negative charge?", opts: ["Proton", "Neutron", "Electron"], a: 2 },
    { q: "What is the pH level of pure water?", opts: ["0", "7", "14"], a: 1 },
    { q: "Which organ produces insulin?", opts: ["Liver", "Pancreas", "Kidney"], a: 1 },
    { q: "What is the speed of light in a vacuum (approx)?", opts: ["300,000 km/s", "150,000 km/s", "1,000 km/s"], a: 0 },
    { q: "What is the chemical formula for table salt?", opts: ["NaCl", "KCl", "NaOH"], a: 0 },
    { q: "Which Newton's Law states 'Action = Reaction'?", opts: ["First", "Second", "Third"], a: 2 },
    { q: "What type of rock is formed from lava?", opts: ["Sedimentary", "Metamorphic", "Igneous"], a: 2 },
    { q: "Which vitamin is produced by sunlight on skin?", opts: ["Vitamin C", "Vitamin D", "Vitamin A"], a: 1 },
    { q: "Which blood type is the universal donor?", opts: ["AB+", "O-", "A+"], a: 1 },

    // Level 3 (Hard / Mad Scientist - Adjusted)
    { q: "What carries genetic information in most living organisms?", opts: ["DNA", "RNA", "Protein"], a: 0 },
    { q: "What is the most common element in the universe?", opts: ["Hydrogen", "Helium", "Oxygen"], a: 0 },
    { q: "Which planet is the largest in our solar system?", opts: ["Saturn", "Jupiter", "Uranus"], a: 1 },
    { q: "What is the process by which plants release water vapor?", opts: ["Transpiration", "Respiration", "Photosynthesis"], a: 0 },
    { q: "Which part of the atom has no electric charge?", opts: ["Neutron", "Proton", "Electron"], a: 0 },
    { q: "What is the speed of sound in dry air at 20C (approx)?", opts: ["343 m/s", "1000 m/s", "300,000 km/s"], a: 0 },
    { q: "What is the main gas found in the air we breathe?", opts: ["Nitrogen", "Oxygen", "Argon"], a: 0 },
    { q: "Who developed the Theory of Relativity?", opts: ["Einstein", "Newton", "Tesla"], a: 0 },
    { q: "What is the largest bone in the human body?", opts: ["Femur", "Tibia", "Humerus"], a: 0 },
    { q: "Which blood cells fight infection?", opts: ["White Blood Cells", "Red Blood Cells", "Platelets"], a: 0 }
];

// Phase 4: 10 Correction Tasks
export const P4_TASKS = [
    { draft: "The suspect shoots at us before we entered.", ans: "The suspect had shot at us before we entered." },
    { draft: "By the time backup arrives, they escaped.", ans: "By the time backup arrived, they had escaped." },
    { draft: "I have finish the report yesterday.", ans: "I finished the report yesterday." },
    { draft: "She live here since 2010.", ans: "She has lived here since 2010." },
    { draft: "If I was you, I will go.", ans: "If I were you, I would go." },
    { draft: "I look forward to meet you.", ans: "I look forward to meeting you." },
    { draft: "He is married with a doctor.", ans: "He is married to a doctor." },
    { draft: "I am agree with you.", ans: "I agree with you." },
    { draft: "She is good in math.", ans: "She is good at math." },
    { draft: "It depend on the weather.", ans: "It depends on the weather." }
];


