import { useEffect } from 'react'
import { bindGameControls } from '../../gallery/shared/runtime.js'
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
  useEffect(() => bindGameControls('timezone-game', Object.fromEntries(
    ['confirm', 'answer1', 'answer2'].map(action => [action, () =>
      document.querySelector('[data-game-action="' + action + '"]')?.click()
    ])
  )), [])
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
