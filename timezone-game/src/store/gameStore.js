import { create } from 'zustand'
import { questions } from '../data/questions'

/** Timer duration in seconds */
export const TIMER_DURATION = 20

/**
 * Time Zone Travelers — Game Store (Zustand)
 *
 * STATE:
 *   teams              — Array of 4 team names
 *   scores             — Array of 4 scores [0, 0, 0, 0]
 *   currentTurn        — Index (0–3) of the active team
 *   currentQuestionIndex — Index into the questions array (0–29)
 *   attemptCount       — How many teams have tried the CURRENT question
 *   timer              — Countdown seconds (10 → 0)
 *   gameState          — 'intro' | 'playing' | 'winner'
 *
 * ACTIONS:
 *   startGame()        — Transition from intro → playing
 *   submitAnswer(ans)  — Handle correct/incorrect answer
 *   handleTimeout()    — Timer hit 0 (same as incorrect)
 *   tick()             — Decrement timer by 1
 *   resetGame()        — Full reset for "Play Again"
 */

const INITIAL_STATE = {
    teams: ['Team 1', 'Team 2', 'Team 3', 'Team 4'],
    scores: [0, 0, 0, 0],
    currentTurn: 0,
    currentQuestionIndex: 0,
    attemptCount: 0,
    timer: TIMER_DURATION,
    paused: false,
    gameState: 'intro', // 'intro' | 'playing' | 'winner'
}

export const useGameStore = create((set, get) => ({
    ...INITIAL_STATE,

    // ─── Derived / Helpers ───────────────────────────
    getCurrentQuestion: () => {
        const { currentQuestionIndex } = get()
        return questions[currentQuestionIndex] ?? null
    },

    getActiveTeam: () => {
        const { teams, currentTurn } = get()
        return teams[currentTurn]
    },

    getWinner: () => {
        const { scores, teams } = get()
        let maxScore = -1
        let winnerIndex = 0
        scores.forEach((score, i) => {
            if (score > maxScore) {
                maxScore = score
                winnerIndex = i
            }
        })
        return { team: teams[winnerIndex], score: maxScore, index: winnerIndex }
    },

    // ─── Actions ─────────────────────────────────────

    startGame: () => {
        set({ gameState: 'playing', timer: TIMER_DURATION, paused: false })
    },

    togglePause: () => {
        set((state) => ({ paused: !state.paused }))
    },

    /**
     * submitAnswer — Core game logic
     * @param {boolean} isCorrect
     * @returns {{ correct: boolean, points: number }}
     */
    submitAnswer: (isCorrect) => {
        const state = get()
        const question = questions[state.currentQuestionIndex]

        if (!question) return { correct: false, points: 0 }

        if (isCorrect) {
            // Points: 5 for first attempt, 1 for subsequent
            const points = state.attemptCount === 0 ? 5 : 1
            const newScores = [...state.scores]
            newScores[state.currentTurn] += points

            const nextQuestionIndex = state.currentQuestionIndex + 1
            const isGameOver = nextQuestionIndex >= questions.length

            set({
                scores: newScores,
                currentQuestionIndex: nextQuestionIndex,
                attemptCount: 0,
                timer: TIMER_DURATION,
                paused: false,
                currentTurn: (state.currentTurn + 1) % 4,
                gameState: isGameOver ? 'winner' : 'playing',
            })

            return { correct: true, points }
        } else {
            // Wrong answer: next team gets the SAME question
            set({
                attemptCount: state.attemptCount + 1,
                currentTurn: (state.currentTurn + 1) % 4,
                timer: TIMER_DURATION,
                paused: false,
            })

            return { correct: false, points: 0 }
        }
    },

    /**
     * handleTimeout — Timer reached 0
     * Same logic as an incorrect answer: next team, same question, reset timer.
     */
    handleTimeout: () => {
        const state = get()
        set({
            attemptCount: state.attemptCount + 1,
            currentTurn: (state.currentTurn + 1) % 4,
            timer: TIMER_DURATION,
            paused: false,
        })
    },

    /**
     * tick — Decrement timer by 1 second.
     * Returns the new timer value so components can react.
     */
    tick: () => {
        const { timer } = get()
        const newTimer = Math.max(0, timer - 1)
        set({ timer: newTimer })
        return newTimer
    },

    /**
     * resetGame — Full reset for "Play Again"
     */
    resetGame: () => {
        set({ ...INITIAL_STATE })
    },
}))
