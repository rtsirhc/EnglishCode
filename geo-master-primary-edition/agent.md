# Geo Master: Primary Edition

## Project Definition
A fun, kid-friendly geography quiz game built as a single HTML file. Based on the same game mechanics as Tense Master: Sudden Death, but redesigned with a cute pastel theme and 100 geography questions covering maps, population, resources, migration, industry, and tourism.

## Decisions Made
- **Target**: Primary learners (geography)
- **Theme/Colors**: Cute, kid-friendly — pastel gradient background, white cards, rounded corners, soft shadows, playful fonts (Fredoka + Nunito)
- **Question Types**: 3 types — Multiple Choice (40), Fill in the Blank (30), Correct the Mistake (30)
- **Scoring**: 3 lives, total time tracked for leaderboard
- **Timer**: MC=25s, Fill-in=30s, Fix=40s
- **Images**: None
- **AI Features**: None
- **Data Storage**: localStorage for leaderboard
- **Deployment**: Local HTML file
- **Device Support**: Responsive, works on desktop and tablets

## Technology Stack
- Single HTML file with inline CSS and React (via CDN)
- React 18 + Babel (in-browser transpilation)
- Google Fonts: Fredoka, Nunito
- Canvas-based bubble particles and confetti effects

## Key Features
- 100-question bank (shuffled, 20 per round)
- MC options shuffled each round
- Case-insensitive answer checking with alternative spellings (e.g., marginalization/marginalisation, ecotourism/eco-tourism)
- Encouraging feedback messages (randomized)
- Confetti celebration on victory
- Local leaderboard (top 5 fastest times)
- No base verb/hint shown for fill-in (geography content, not grammar)

## File
- `geo-master-primary-edition.html` — Complete self-contained game
