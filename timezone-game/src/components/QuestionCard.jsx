import { useState, useEffect, useRef } from 'react'
import { useGameStore } from '../store/gameStore'
import { cn } from '../utils/cn'
import { playSound } from '../utils/sounds'
import { Eye, Check, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * QuestionCard — The central game component.
 * Shows the question with teacher-graded controls.
 * Provides visual feedback: shake for wrong, flash for right.
 * Uses framer-motion for entrance slide-in animation.
 */
export default function QuestionCard() {
    const questionCount = useGameStore(s => s.questionCount)
    const getCurrentQuestion = useGameStore((s) => s.getCurrentQuestion)
    const getActiveTeam = useGameStore((s) => s.getActiveTeam)
    const submitAnswer = useGameStore((s) => s.submitAnswer)
    const currentTurn = useGameStore(s => s.currentTurn)
    const feedbackTimer = useRef(null)
    useEffect(() => () => clearTimeout(feedbackTimer.current), [])
    const attemptCount = useGameStore((s) => s.attemptCount)

    const [feedback, setFeedback] = useState(null) // 'correct' | 'wrong' | null
    const [lastPoints, setLastPoints] = useState(0)
    const [showingAnswer, setShowingAnswer] = useState(false)

    const question = getCurrentQuestion()
    const activeTeam = getActiveTeam()

    // Reset answer reveal state when question changes
    useEffect(() => {
        setShowingAnswer(false)
    }, [question?.id, currentTurn])

    if (!question) return null

    const handleAnswer = (isCorrect) => {
        if (feedback) return // prevent double-click during animation

        const result = submitAnswer(isCorrect)

        if (!result) return
        if (result.correct) {
            setFeedback('correct')
            setLastPoints(result.points)
            playSound('correct')
        } else {
            setFeedback('wrong')
            playSound('wrong')
        }

        // Clear feedback after animation
        feedbackTimer.current = setTimeout(() => {
            useGameStore.getState().finishFeedback()
            setFeedback(null)
            setLastPoints(0)
            setShowingAnswer(false)
        }, 1200)
    }

    return (
        <div className="relative z-10 flex flex-col items-center justify-center gap-6 w-full max-w-4xl mx-auto">
            {/* Active Team Label */}
            <motion.div
                key={activeTeam}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-lg font-bold text-text-secondary tracking-wide uppercase"
            >
                {activeTeam}'s Turn
                {attemptCount > 0 && (
                    <span className="ml-2 text-sm text-accent-dark font-normal normal-case">
                        (Retry — 1 point)
                    </span>
                )}
            </motion.div>

            {/* Question Card — Slide in from right on new question */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={question.id}
                    initial={{ opacity: 0, x: 80, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -80, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className={cn(
                        'bg-white/90 backdrop-blur-sm rounded-2xl shadow-card px-10 py-8 max-w-3xl w-full text-center',
                        'border-2 border-white/50',
                        'transition-all duration-200',
                        feedback === 'wrong' && 'animate-[shake_0.5s_ease-in-out]',
                        feedback === 'correct' && 'ring-4 ring-success/50 border-success'
                    )}
                >
                    {/* Question Number */}
                    <div className="text-sm font-semibold text-text-secondary mb-2">
                        Question {question.id} / {questionCount}
                    </div>

                    {/* Question Text */}
                    <p className="text-3xl sm:text-4xl font-extrabold text-text-primary leading-snug mb-8 min-h-[100px] flex items-center justify-center">
                        {question.question}
                    </p>

                    {/* Answer Controls */}
                    <div className="flex flex-col items-center justify-center gap-6 min-h-[120px]">
                        {!showingAnswer ? (
                            <motion.button
                                data-game-action="confirm" onClick={() => { setShowingAnswer(true); useGameStore.setState({ paused: true }); }}
                                disabled={!!feedback}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={cn(
                                    'flex items-center gap-2 px-8 py-4 rounded-xl text-xl font-extrabold',
                                    'bg-secondary text-white shadow-lg cursor-pointer',
                                    'hover:bg-secondary-dark hover:shadow-xl',
                                    'disabled:opacity-50 disabled:cursor-not-allowed',
                                    'border-b-4 border-secondary-dark',
                                    'transition-colors duration-150'
                                )}
                            >
                                <Eye className="w-6 h-6" />
                                REVEAL ANSWER
                            </motion.button>
                        ) : (
                            <div className="flex flex-col items-center gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <div className="text-2xl font-bold text-secondary bg-secondary/10 px-8 py-4 rounded-xl border-2 border-secondary/20 shadow-inner max-w-xl w-full">
                                    {question.answer}
                                </div>
                                <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
                                    <motion.button
                                        data-game-action="answer1" onClick={() => handleAnswer(true)}
                                        disabled={!!feedback}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={cn(
                                            'flex items-center gap-2 px-6 sm:px-8 py-4 rounded-xl text-lg sm:text-xl font-extrabold',
                                            'bg-success text-white shadow-lg cursor-pointer',
                                            'hover:bg-success-dark hover:shadow-xl',
                                            'disabled:opacity-50 disabled:cursor-not-allowed',
                                            'border-b-4 border-success-dark',
                                            'transition-colors duration-150'
                                        )}
                                    >
                                        <Check className="w-6 h-6" />
                                        CORRECT
                                    </motion.button>
                                    <motion.button
                                        data-game-action="answer2" onClick={() => handleAnswer(false)}
                                        disabled={!!feedback}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={cn(
                                            'flex items-center gap-2 px-6 sm:px-8 py-4 rounded-xl text-lg sm:text-xl font-extrabold',
                                            'bg-danger text-white shadow-lg cursor-pointer',
                                            'hover:bg-danger-dark hover:shadow-xl',
                                            'disabled:opacity-50 disabled:cursor-not-allowed',
                                            'border-b-4 border-danger-dark',
                                            'transition-colors duration-150'
                                        )}
                                    >
                                        <X className="w-6 h-6" />
                                        INCORRECT
                                    </motion.button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Feedback Overlay */}
            <AnimatePresence>
                {feedback && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        className="absolute inset-0 flex items-center justify-center rounded-2xl pointer-events-none"
                    >
                        <div
                            className={cn(
                                'text-5xl font-black px-8 py-4 rounded-2xl shadow-2xl',
                                feedback === 'correct'
                                    ? 'bg-success/90 text-white'
                                    : 'bg-danger/90 text-white'
                            )}
                        >
                            {feedback === 'correct'
                                ? `✅ Correct! +${lastPoints} pts`
                                : '❌ Wrong!'}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
