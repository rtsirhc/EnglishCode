import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { cn } from '../utils/cn'
import { Trophy } from 'lucide-react'
import { motion } from 'framer-motion'

/**
 * Team colors for visual distinction.
 */
const TEAM_COLORS = [
    { bg: 'bg-red-100', border: 'border-red-400', text: 'text-red-700', glow: 'shadow-[0_0_25px_rgba(239,68,68,0.5)]', icon: '🦁' },
    { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-700', glow: 'shadow-[0_0_25px_rgba(59,130,246,0.5)]', icon: '🐬' },
    { bg: 'bg-green-100', border: 'border-green-400', text: 'text-green-700', glow: 'shadow-[0_0_25px_rgba(34,197,94,0.5)]', icon: '🐸' },
    { bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-700', glow: 'shadow-[0_0_25px_rgba(168,85,247,0.5)]', icon: '🦄' },
]

/**
 * AnimatedScore — Counts up/down to the target score number.
 */
function AnimatedScore({ value, className }) {
    const [display, setDisplay] = useState(value)
    const prevValue = useRef(value)

    useEffect(() => {
        if (prevValue.current === value) return

        const start = prevValue.current
        const end = value
        const duration = 400 // ms
        const startTime = Date.now()

        const tick = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)
            // Ease-out
            const eased = 1 - Math.pow(1 - progress, 3)
            setDisplay(Math.round(start + (end - start) * eased))

            if (progress < 1) {
                requestAnimationFrame(tick)
            }
        }

        requestAnimationFrame(tick)
        prevValue.current = value
    }, [value])

    return <span className={className}>{display}</span>
}

/**
 * Scoreboard — Displays 4 team cards with animations.
 * Active team scales up with glow; score counts up on change.
 */
export default function Scoreboard() {
    const teams = useGameStore((s) => s.teams)
    const scores = useGameStore((s) => s.scores)
    const currentTurn = useGameStore((s) => s.currentTurn)

    return (
        <div className="flex flex-wrap items-center justify-center gap-3 px-4 py-2 w-full">
            {teams.map((team, i) => {
                const isActive = i === currentTurn
                const colors = TEAM_COLORS[i]

                return (
                    <motion.div
                        key={i}
                        animate={{
                            scale: isActive ? 1.1 : 0.95,
                            opacity: isActive ? 1 : 0.7,
                        }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className={cn(
                            'flex items-center gap-2 px-4 py-2 rounded-xl border-2',
                            colors.bg, colors.border,
                            isActive && [
                                'border-3 font-extrabold',
                                colors.glow,
                                'ring-2 ring-offset-1',
                                i === 0 ? 'ring-red-300' : i === 1 ? 'ring-blue-300' : i === 2 ? 'ring-green-300' : 'ring-purple-300',
                            ],
                        )}
                    >
                        {/* Team Icon */}
                        <span className="text-2xl">{colors.icon}</span>

                        {/* Team Info */}
                        <div className="flex flex-col items-start leading-tight">
                            <span className={cn('text-sm font-bold', colors.text)}>
                                {team}
                            </span>
                            <div className="flex items-center gap-1">
                                <Trophy className={cn('w-3.5 h-3.5', colors.text)} />
                                <AnimatedScore
                                    value={scores[i]}
                                    className={cn('text-xl font-extrabold', colors.text)}
                                />
                            </div>
                        </div>

                        {/* Active Indicator */}
                        {isActive && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="ml-1 text-xs"
                            >
                                🎯
                            </motion.span>
                        )}
                    </motion.div>
                )
            })}
        </div>
    )
}
