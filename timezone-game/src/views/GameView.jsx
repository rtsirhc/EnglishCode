import { useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import LayoutContainer from '../components/LayoutContainer'
import Scoreboard from '../components/Scoreboard'
import MapDisplay from '../components/MapDisplay'
import QuestionCard from '../components/QuestionCard'
import TimerBar from '../components/TimerBar'

/**
 * GameView — Main gameplay screen.
 * Mounts Scoreboard (top), MapDisplay (background), QuestionCard (center), Timer (bottom).
 * Drives the countdown with useEffect + setInterval.
 * Respects paused state — interval only ticks when not paused.
 */
export default function GameView() {
    const paused = useGameStore((s) => s.paused)
    const tick = useGameStore((s) => s.tick)
    const handleTimeout = useGameStore((s) => s.handleTimeout)
    const gameState = useGameStore((s) => s.gameState)

    const currentTurn = useGameStore(s => s.currentTurn)
    const turnLocked = useGameStore(s => s.turnLocked)
    useEffect(() => {
        if (gameState !== 'playing' || paused || turnLocked) return
        const interval = setInterval(() => {
            if (tick() <= 0) handleTimeout()
        }, 1000)
        return () => clearInterval(interval)
    }, [gameState, paused, turnLocked, currentTurn, tick, handleTimeout])

    return (
        <LayoutContainer>
            {/* Background Map */}
            <MapDisplay />

            {/* Game Layout */}
            <div className="relative z-10 w-full h-full flex flex-col">
                {/* Top: Scoreboard */}
                <div className="flex-shrink-0 pt-3 pb-1">
                    <Scoreboard />
                </div>

                {/* Center: Question Card */}
                <div className="flex-1 flex items-center justify-center px-4">
                    <QuestionCard />
                </div>

                {/* Bottom: Timer */}
                <div className="flex-shrink-0 pb-6">
                    <TimerBar />
                </div>
            </div>
        </LayoutContainer>
    )
}
