# Source inventory

`catalog/games.json` records 29 upstream games, 20 distinct Faro activities, and Grammar Rush from `betting_game`. The migration ledger records verification separately from catalogue presence.

## Intentional grouping and duplicates

- `monday_numbers_dates_times.html` is the main entry for one activity with A1, A2 and B1 tracks. The three `pizarron_*.html` aliases open the corresponding track.
- Faro `semana_04/second_class_speaking_quest.html` redirects to `semana_03/friday_3c_speaking_quest.html`; it is one Speaking Quest.
- `05_tecnologia/chatbot_misiones/public` and `farito/public` are versions of the same Farito application. The standalone `farito` source is the maintained import. Do not copy `private/codigos-alumnos-2026-2027.html`.
- Grammar Rush has a launcher `index.html`, a game `grammar-auction.html`, and local companion pages. It is distinct from upstream Grammar Auction and Grammar Betting Game.
- `oral_assessment_tool.html`, `oral_assessment_template.html`, seating tools, teacher guides, printable cards, reports, course documents, and archives are teaching/administration materials, not games. They are not included in the public gallery.
- Upstream `libs` is shared runtime code, not a separate game.

## Import boundaries

The original local sources are untouched. `scripts/import-local.py` copies public code/assets and excludes private data, configuration, sessions, archives, reports and dependencies. Do not re-run it after editing imported games without reviewing overwritten changes. The import itself does not prove the source contains no hardcoded students or school assumptions; those require a per-game audit.
