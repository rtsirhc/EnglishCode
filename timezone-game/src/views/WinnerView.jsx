import { useEffect, useState, useRef } from 'react'
import { useGameStore } from '../store/gameStore'
import { cn } from '../utils/cn'
import { playSound } from '../utils/sounds'
import { RotateCcw, Trophy, Star } from 'lucide-react'
import LayoutContainer from '../components/LayoutContainer'

/**
 * Confetti particle component.
 * Generates colorful falling dots/shapes for celebration.
 */
function ConfettiParticle({ delay, color, left }) {
    return (
        <div
            className="absolute top-0 w-3 h-3 rounded-full opacity-90"
            style={{
                left: `${left}%`,
                backgroundColor: color,
                animation: `confettiFall ${2 + Math.random() * 2}s ease-in ${delay}s infinite`,
            }}
        />
    )
}

/**
 * Generate confetti particles.
 */
const CONFETTI_COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FF8E8E', '#6EE0D9', '#A78BFA', '#F472B6', '#34D399']

function generateConfetti(count = 50) {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        delay: Math.random() * 2,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        left: Math.random() * 100,
    }))
}

/**
 * WinnerView — Celebrates the winning team.
 * Shows confetti, big announcement, and Play Again button.
 */
export default function WinnerView() {
    const getWinner = useGameStore((s) => s.getWinner)
    const scores = useGameStore((s) => s.scores)
    const teams = useGameStore((s) => s.teams)
    const resetGame = useGameStore((s) => s.resetGame)

    const [confetti] = useState(() => generateConfetti(60))
    const [showContent, setShowContent] = useState(false)
    const soundPlayed = useRef(false)

    const winner = getWinner()

    // Dramatic reveal delay
    useEffect(() => {
        const timer = setTimeout(() => setShowContent(true), 800)
        return () => clearTimeout(timer)
    }, [])

    // Play win sound once
    useEffect(() => {
        if (!soundPlayed.current) {
            playSound('win', 0.7)
            soundPlayed.current = true
        }
    }, [])

    const TEAM_EMOJIS = ['🦁', '🐬', '🐸', '🦄']
    const TEAM_COLORS_BG = ['from-red-400 to-red-600', 'from-blue-400 to-blue-600', 'from-green-400 to-green-600', 'from-purple-400 to-purple-600']

    return (
        <LayoutContainer className="bg-gradient-to-br from-gray-900 to-gray-800">
            {/* Confetti Layer */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                {confetti.map((p) => (
                    <ConfettiParticle key={p.id} delay={p.delay} color={p.color} left={p.left} />
                ))}
            </div>

            {/* Content */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
                {!showContent ? (
                    /* Loading / Drumroll */
                    <div className="text-center">
                        <span className="text-7xl animate-bounce">🥁</span>
                        <p className="text-3xl text-white/80 font-bold mt-4 animate-pulse">
                            And the winner is...
                        </p>
                    </div>
                ) : (
                    /* Winner Reveal */
                    <div className="flex flex-col items-center text-center animate-[fadeIn_0.8s_ease-out]">
                        {/* Trophy */}
                        <div className="relative mb-4">
                            <Trophy className="w-20 h-20 text-accent animate-bounce" />
                            <Star className="absolute -top-2 -right-2 w-8 h-8 text-accent animate-spin" />
                            <Star className="absolute -top-2 -left-2 w-6 h-6 text-accent-light animate-spin" style={{ animationDirection: 'reverse' }} />
                        </div>

                        {/* Winner Emoji */}
                        <span className="text-8xl mb-2">{TEAM_EMOJIS[winner.index]}</span>

                        {/* Winner Text */}
                        <h1
                            className={cn(
                                'text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r',
                                TEAM_COLORS_BG[winner.index],
                                'mb-2'
                            )}
                        >
                            {winner.team} WINS!
                        </h1>

                        {/* Score */}
                        <p className="text-3xl text-white font-bold mb-8">
                            🏆 {winner.score} points!
                        </p>

                        {/* All Scores Summary */}
                        <div className="flex gap-4 mb-10">
                            {teams.map((team, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        'px-4 py-2 rounded-xl text-white font-bold text-lg',
                                        i === winner.index
                                            ? 'bg-white/20 ring-2 ring-accent scale-110'
                                            : 'bg-white/10 opacity-60'
                                    )}
                                >
                                    <span className="mr-1">{TEAM_EMOJIS[i]}</span>
                                    {team}: {scores[i]}
                                </div>
                            ))}
                        </div>

                        {/* Play Again Button */}
                        <button
                            onClick={resetGame}
                            className={cn(
                                'flex items-center gap-3 px-10 py-5 rounded-2xl',
                                'bg-accent text-text-primary text-2xl font-black',
                                'shadow-lg hover:shadow-xl hover:bg-accent-light',
                                'hover:scale-105 active:scale-95',
                                'transition-all duration-200',
                                'border-b-4 border-accent-dark'
                            )}
                        >
                            <RotateCcw className="w-7 h-7" />
                            PLAY AGAIN!
                        </button>
                    </div>
                )}
            </div>
        </LayoutContainer>
    )
}
