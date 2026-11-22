/**
 * Sound Utility for Time Zone Travelers
 * 
 * Expected audio files in /public/sounds/:
 *   - correct.mp3  (Ding — plays on correct answer)
 *   - wrong.mp3    (Buzz — plays on wrong answer)
 *   - timer.mp3    (Ticking — plays during countdown)
 *   - win.mp3      (Fanfare — plays on winner screen)
 * 
 * If audio files are not present, sounds will gracefully
 * fall back to console logging instead of crashing.
 */

// Sound file paths (relative to /public)
export const SOUND_PATHS = {
    correct: '/sounds/correct.mp3',
    wrong: '/sounds/wrong.mp3',
    timer: '/sounds/timer.mp3',
    win: '/sounds/win.mp3',
}

/**
 * Play a sound effect safely.
 * Falls back to console.log if the file is missing or audio fails.
 * @param {'correct'|'wrong'|'timer'|'win'} soundName
 * @param {number} volume - Volume from 0.0 to 1.0 (default: 0.5)
 */
export function playSound(soundName, volume = 0.5) {
    const path = SOUND_PATHS[soundName]

    if (!path) {
        console.warn(`[Sound] Unknown sound: "${soundName}"`)
        return
    }

    try {
        const audio = new Audio(path)
        audio.volume = Math.min(1, Math.max(0, volume))
        audio.play().catch(() => {
            console.log(`[Sound] 🔊 ${soundName} (file not found — add ${path})`)
        })
    } catch {
        console.log(`[Sound] 🔊 ${soundName} (audio unavailable)`)
    }
}

/**
 * Stop all currently playing audio.
 * Useful for stopping the timer tick when the round ends.
 */
export function stopAllSounds() {
    // Browser doesn't provide a global stop, so components should
    // manage their own Audio references. This is a placeholder for
    // a more robust implementation if needed.
    console.log('[Sound] stopAllSounds called')
}
