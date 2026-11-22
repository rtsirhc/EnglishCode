import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { cn } from '../utils/cn'
import { ChevronLeft, ChevronRight, Rocket } from 'lucide-react'
import LayoutContainer from '../components/LayoutContainer'
import timezoneMap from '../assets/timezone-map.png'

/**
 * Intro slides content for the "PowerPoint" style intro.
 */
const SLIDES = [
    {
        emoji: '🌍',
        title: 'Welcome to Time Zone Travelers!',
        body: 'Get ready for an amazing adventure around the world!',
        bg: 'from-primary/10 to-secondary/10',
    },
    {
        emoji: '🌅',
        title: 'The World is Big!',
        body: 'When it is morning in Mexico, it might be night in Japan.',
        bg: 'from-accent/10 to-primary/10',
        showMap: true,
    },
    {
        emoji: '🕐',
        title: 'We call these Time Zones!',
        body: "Let's see how well you know them. Are you ready?",
        bg: 'from-secondary/10 to-accent/10',
        showStart: true,
    },
]

/**
 * IntroView — 3 "PowerPoint" slides with Previous/Next navigation.
 * Last slide has a "Start Game" button.
 */
export default function IntroView() {
    const [currentSlide, setCurrentSlide] = useState(0)
    const startGame = useGameStore((s) => s.startGame)

    const slide = SLIDES[currentSlide]
    const isFirst = currentSlide === 0
    const isLast = currentSlide === SLIDES.length - 1

    return (
        <LayoutContainer>
            {/* Slide Content */}
            <div
                className={cn(
                    'w-full h-full flex flex-col items-center justify-center',
                    'bg-gradient-to-br', slide.bg,
                    'transition-all duration-500'
                )}
            >
                {/* Map Background (Slide 2) */}
                {slide.showMap && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <img
                            src={timezoneMap}
                            alt="World Time Zone Map"
                            className="w-3/4 h-3/4 object-contain opacity-20"
                            draggable={false}
                        />
                    </div>
                )}

                {/* Main Content */}
                <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-3xl">
                    {/* Big Emoji */}
                    <span className="text-8xl mb-6 animate-bounce">
                        {slide.emoji}
                    </span>

                    {/* Title */}
                    <h1 className="text-5xl font-black text-text-primary mb-4 leading-tight">
                        {slide.title}
                    </h1>

                    {/* Body */}
                    <p className="text-2xl text-text-secondary font-semibold leading-relaxed mb-8">
                        {slide.body}
                    </p>

                    {/* Start Game Button (Last slide only) */}
                    {slide.showStart && (
                        <button
                            onClick={startGame}
                            className={cn(
                                'flex items-center gap-3 px-10 py-5 rounded-2xl',
                                'bg-primary text-white text-2xl font-black',
                                'shadow-lg hover:shadow-xl hover:bg-primary-dark',
                                'hover:scale-105 active:scale-95',
                                'transition-all duration-200',
                                'border-b-4 border-primary-dark',
                                'animate-pulse'
                            )}
                        >
                            <Rocket className="w-8 h-8" />
                            START GAME!
                        </button>
                    )}
                </div>

                {/* Slide Dots */}
                <div className="absolute bottom-8 flex items-center gap-3">
                    {SLIDES.map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                'w-3 h-3 rounded-full transition-all duration-300',
                                i === currentSlide
                                    ? 'bg-primary scale-125'
                                    : 'bg-gray-300'
                            )}
                        />
                    ))}
                </div>

                {/* Navigation Arrows */}
                {!isFirst && (
                    <button
                        onClick={() => setCurrentSlide((s) => s - 1)}
                        className={cn(
                            'absolute left-6 top-1/2 -translate-y-1/2',
                            'w-14 h-14 rounded-full bg-white/80 shadow-lg',
                            'flex items-center justify-center',
                            'hover:bg-white hover:scale-110 active:scale-95',
                            'transition-all duration-200'
                        )}
                    >
                        <ChevronLeft className="w-8 h-8 text-text-primary" />
                    </button>
                )}
                {!isLast && (
                    <button
                        onClick={() => setCurrentSlide((s) => s + 1)}
                        className={cn(
                            'absolute right-6 top-1/2 -translate-y-1/2',
                            'w-14 h-14 rounded-full bg-white/80 shadow-lg',
                            'flex items-center justify-center',
                            'hover:bg-white hover:scale-110 active:scale-95',
                            'transition-all duration-200'
                        )}
                    >
                        <ChevronRight className="w-8 h-8 text-text-primary" />
                    </button>
                )}
            </div>
        </LayoutContainer>
    )
}
