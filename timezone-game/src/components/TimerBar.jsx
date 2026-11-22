import { useGameStore } from '../store/gameStore'
import { TIMER_DURATION } from '../store/gameStore'
import { cn } from '../utils/cn'
import { Clock, Pause, Play } from 'lucide-react'

/**
 * TimerBar — Visual countdown from 20s to 0s.
 * Progress bar shrinks and changes color (green → yellow → red).
 * Includes a Pause/Resume button to the right.
 */
export default function TimerBar() {
    const timer = useGameStore((s) => s.timer)
    const paused = useGameStore((s) => s.paused)
    const togglePause = useGameStore((s) => s.togglePause)

    // Calculate percentage remaining
    const percent = (timer / TIMER_DURATION) * 100

    // Color transitions: green (>12s) → yellow (6-12s) → red (<6s)
    const barColor =
        timer > 12
            ? 'bg-success'
            : timer > 6
                ? 'bg-accent'
                : 'bg-danger'

    const textColor =
        timer > 12
            ? 'text-success'
            : timer > 6
                ? 'text-accent-dark'
                : 'text-danger'

    return (
        <div className="w-full max-w-2xl mx-auto px-4">
            {/* Timer Label */}
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                    <Clock className={cn('w-4 h-4', textColor)} />
                    <span className={cn('text-sm font-bold', textColor)}>Time</span>
                </div>
                <div className="flex items-center gap-2">
                    <span
                        className={cn(
                            'text-2xl font-black tabular-nums transition-colors duration-300',
                            textColor,
                            timer <= 6 && !paused && 'animate-pulse'
                        )}
                    >
                        {timer}s
                    </span>
                </div>
            </div>

            {/* Progress Bar + Pause Button */}
            <div className="flex items-center gap-3">
                <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                    <div
                        className={cn(
                            'h-full rounded-full transition-all duration-700 ease-linear',
                            barColor,
                            timer <= 6 && !paused && 'animate-pulse',
                            paused && 'opacity-60'
                        )}
                        style={{ width: `${percent}%` }}
                    />
                </div>

                {/* Pause / Resume Button */}
                <button
                    onClick={togglePause}
                    className={cn(
                        'flex items-center justify-center w-10 h-10 rounded-full cursor-pointer',
                        'border-2 shadow-md transition-all duration-200',
                        'hover:scale-110 active:scale-95',
                        paused
                            ? 'bg-success/20 border-success text-success hover:bg-success/30'
                            : 'bg-accent/20 border-accent-dark text-accent-dark hover:bg-accent/30'
                    )}
                    title={paused ? 'Resume Timer' : 'Pause Timer'}
                >
                    {paused ? (
                        <Play className="w-5 h-5 ml-0.5" />
                    ) : (
                        <Pause className="w-5 h-5" />
                    )}
                </button>
            </div>

            {/* Paused Indicator */}
            {paused && (
                <div className="text-center mt-1">
                    <span className="text-sm font-bold text-accent-dark animate-pulse">
                        ⏸ PAUSED
                    </span>
                </div>
            )}
        </div>
    )
}
