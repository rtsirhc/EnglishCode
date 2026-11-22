import { useGameStore } from './store/gameStore'
import IntroView from './views/IntroView'
import GameView from './views/GameView'
import WinnerView from './views/WinnerView'
import './index.css'

/**
 * App — Root component.
 * Switches between views based on gameState:
 *   'intro'   → IntroView (3 slides + Start Game)
 *   'playing' → GameView  (Scoreboard + Map + Question + Timer)
 *   'winner'  → WinnerView (Confetti + Winner + Play Again)
 */
function App() {
  const gameState = useGameStore((s) => s.gameState)

  switch (gameState) {
    case 'intro':
      return <IntroView />
    case 'playing':
      return <GameView />
    case 'winner':
      return <WinnerView />
    default:
      return <IntroView />
  }
}

export default App
