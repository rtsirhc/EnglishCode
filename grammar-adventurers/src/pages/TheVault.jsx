import React, { useState } from 'react';
import { useControls } from '../controls';
import { Link } from 'react-router-dom';
import blueprintImg from '../assets/bank_blueprint.webp';

const TheVault = () => {
    const [phase, setPhase] = useState(1);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackType, setFeedbackType] = useState('');
    const [gameComplete, setGameComplete] = useState(false);

    // Phase 1: Prepositions of Movement
    const phase1Questions = [
        {
            situation: "🎯 **SWAT TEAM IS AT THE ENTRANCE**\n\nOfficer, the team is standing outside the bank's glass doors. They're wearing night-vision goggles and waiting for your command. What do you tell them?",
            options: [
                { text: "\"Move into the lobby.\"", correct: true },
                { text: "\"Move onto the lobby.\"", correct: false },
                { text: "\"Move at the lobby.\"", correct: false }
            ]
        },
        {
            situation: "🏢 **OBSTACLE AHEAD: RECEPTION DESK**\n\nThe team is inside the lobby. A massive marble reception desk blocks the path to the hallway. It's too wide to go around. Your command?",
            options: [
                { text: "\"Climb over the desk.\"", correct: true },
                { text: "\"Climb through the desk.\"", correct: false },
                { text: "\"Climb in the desk.\"", correct: false }
            ]
        },
        {
            situation: "🌉 **OBSTACLE AHEAD: DECORATIVE BALCONY**\n\nThe team reached the hallway! But there's a decorative balcony railing cutting across the corridor. They need to get to the other side. What's your order?",
            options: [
                { text: "\"Move across the balcony.\"", correct: true },
                { text: "\"Move along the balcony.\"", correct: false },
                { text: "\"Move into the balcony.\"", correct: false }
            ]
        },
        {
            situation: "🔴 **FINAL OBSTACLE: LASER GRID**\n\nAlmost there! A red laser security grid is blocking the vault entrance. The team needs to pass through it without touching the beams. How do they proceed?",
            options: [
                { text: "\"Crawl through the laser grid carefully.\"", correct: true },
                { text: "\"Crawl over the laser grid.\"", correct: false },
                { text: "\"Crawl along the laser grid.\"", correct: false }
            ]
        }
    ];

    // Phase 2: Past Perfect vs Simple Past
    const phase2Questions = [
        {
            situation: "🎙️ **THE ROBBER SPEAKS**\n\n\"I didn't steal the money! The vault was empty when I got here!\"\n\nOfficer, you need to catch him in a lie. Which interrogation question establishes the correct timeline?",
            options: [
                { text: "\"Had the guards already left before you arrived?\"", correct: true },
                { text: "\"Had the guards already leave before you arrived?\"", correct: false },
                { text: "\"Have the guards leave before you arrived?\"", correct: false }
            ]
        },
        {
            situation: "🔍 **THE ROBBER'S ALIBI**\n\n\"I swear, someone else took the money before I entered the building!\"\n\nTime to press harder. Which question challenges his timeline correctly?",
            options: [
                { text: "\"Had you seen anyone suspicious before you went inside?\"", correct: true },
                { text: "\"Did you saw anyone suspicious before you had gone inside?\"", correct: false },
                { text: "\"Have you seen anyone suspicious before you went inside?\"", correct: false }
            ]
        },
        {
            situation: "⏰ **CHECKING THE EVIDENCE**\n\n\"Look, the security cameras were already broken when I arrived!\"\n\nThe tech team just sent you camera logs. Ask the right question to expose his lie:",
            options: [
                { text: "\"Had someone disabled the cameras before 9 PM?\"", correct: true },
                { text: "\"Did someone disabled the cameras before 9 PM?\"", correct: false },
                { text: "\"Has someone disable the cameras before 9 PM?\"", correct: false }
            ]
        }
    ];

    // Phase 3: Mixed Tenses (Press Conference)
    const phase3Questions = [
        {
            situation: "📰 **PRESS CONFERENCE - FINAL STATEMENT**\n\nThe crisis is over! You're addressing the media about how the operation ended. Choose the grammatically correct headline statement:",
            options: [
                { text: "\"The suspect had surrendered before we breached the door.\"", correct: true },
                { text: "\"The suspect surrenders before we had breached the door.\"", correct: false },
                { text: "\"The suspect has surrendered before we breach the door.\"", correct: false }
            ]
        },
        {
            situation: "🏆 **FINAL QUESTION - OPERATION SUMMARY**\n\nA reporter asks: \"How did you ensure everyone's safety?\" Choose your professional response:",
            options: [
                { text: "\"We had established a secure perimeter before entering the building.\"", correct: true },
                { text: "\"We had establish a secure perimeter before entering the building.\"", correct: false },
                { text: "\"We have established a secure perimeter before entering the building.\"", correct: false }
            ]
        }
    ];

    const allPhases = [phase1Questions, phase2Questions, phase3Questions];
    const currentQuestions = allPhases[phase - 1];
    const currentQuestion = currentQuestions[questionIndex];

    const offset = (questionIndex + phase) % currentQuestion.options.length;
    const options = [...currentQuestion.options.slice(offset), ...currentQuestion.options.slice(0, offset)];
    useControls(showFeedback || gameComplete, showFeedback || gameComplete ? 0 : options.length);

    const handleAnswer = (option) => {
        setFeedbackType(option.correct ? 'success' : 'retry');
        setShowFeedback(true);
    };

    const handleContinue = () => {
        setShowFeedback(false);

        if (feedbackType === 'success') {
            // Move to next question or phase
            if (questionIndex < currentQuestions.length - 1) {
                setQuestionIndex(questionIndex + 1);
            } else if (phase < 3) {
                // Move to next phase
                setPhase(phase + 1);
                setQuestionIndex(0);
            } else {
                // Game complete!
                setGameComplete(true);
            }
        }
        // If tragic, stay on same question (retry)
    };

    const getPhaseTitle = () => {
        switch (phase) {
            case 1: return "PHASE 1: THE MOVEMENT";
            case 2: return "PHASE 2: THE INVESTIGATION";
            case 3: return "PHASE 3: THE PRESS CONFERENCE";
            default: return "";
        }
    };

    const getPhaseSubtitle = () => {
        switch (phase) {
            case 1: return "Prepositions of Movement";
            case 2: return "Past Perfect vs Simple Past";
            case 3: return "Mixed Tenses";
            default: return "";
        }
    };

    if (gameComplete) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col items-center justify-center p-8 text-center">
                <div className="bg-gradient-to-br from-green-400/20 to-emerald-500/20 backdrop-blur-xl p-5 sm:p-12 rounded-3xl border-2 border-green-400/50 shadow-2xl max-w-3xl">
                    <div className="text-9xl mb-6 animate-bounce">🏆</div>
                    <h1 className="text-3xl sm:text-6xl font-bold text-green-400 mb-4 drop-shadow-lg">MISSION ACCOMPLISHED!</h1>
                    <p className="text-2xl text-green-200 mb-8">
                        Officer, you've successfully completed "The Vault" operation. Your grammar skills saved the day!
                    </p>

                    <div className="bg-slate-900/50 p-6 rounded-xl mb-8 text-left">
                        <h3 className="text-xl font-bold text-green-300 mb-3">✅ Skills Mastered:</h3>
                        <ul className="text-green-100 space-y-2">
                            <li>✓ Prepositions of Movement (into, over, across, through)</li>
                            <li>✓ Past Perfect vs Simple Past (timeline establishment)</li>
                            <li>✓ Mixed Tenses (professional communication)</li>
                        </ul>
                    </div>

                    <Link
                        to="/index" data-adventure-next
                        className="inline-block px-10 py-4 bg-green-500 hover:bg-green-400 text-slate-900 font-bold rounded-full text-2xl shadow-xl transition transform hover:scale-110 border-2 border-green-300"
                    >
                        Return to Base 🏠
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex flex-col items-center p-4 md:p-8">

            {/* Header */}
            <div className="w-full max-w-6xl mb-6">
                <Link to="/index" className="inline-block text-slate-400 hover:text-slate-200 font-bold mb-4 transition">
                    ← Exit Mission
                </Link>

                <div className="text-center mb-6">
                    <h1 className="text-5xl md:text-6xl font-bold text-red-500 mb-2 drop-shadow-lg tracking-wider">
                        🔐 THE VAULT
                    </h1>
                    <p className="text-xl text-slate-300 italic">High-Stakes Grammar Mission</p>
                </div>
            </div>

            {/* Bank Blueprint */}
            <div className="w-full max-w-4xl mb-8">
                <div className="bg-slate-800/50 backdrop-blur-md p-4 rounded-2xl border-2 border-blue-500/30 shadow-2xl">
                    <img
                        src={blueprintImg}
                        alt="Bank Blueprint"
                        className="w-full h-auto rounded-lg"
                    />
                </div>
            </div>

            {/* Phase Indicator */}
            <div className="w-full max-w-4xl mb-6">
                <div className="bg-gradient-to-r from-red-600/30 to-orange-600/30 backdrop-blur-sm p-6 rounded-xl border border-red-500/50">
                    <h2 className="text-3xl font-bold text-red-400 mb-1 text-center">{getPhaseTitle()}</h2>
                    <p className="text-lg text-orange-300 text-center italic">{getPhaseSubtitle()}</p>
                    <div className="mt-3 flex justify-center gap-2">
                        {[1, 2, 3].map(p => (
                            <div
                                key={p}
                                className={`w-3 h-3 rounded-full ${p === phase ? 'bg-red-500' : 'bg-slate-600'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Question Card */}
            <div className="w-full max-w-4xl mb-8">
                <div className="bg-slate-800/80 backdrop-blur-lg p-8 rounded-2xl border-2 border-slate-600/50 shadow-2xl">
                    <div className="prose prose-invert max-w-none mb-6">
                        <p className="text-xl text-slate-200 whitespace-pre-line leading-relaxed">
                            {currentQuestion.situation.replaceAll("**", "")}
                        </p>
                    </div>

                    <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-500/30 mb-6">
                        <p className="text-sm text-blue-300 text-center italic">
                            📢 Read your choice aloud, then click the matching option below.
                        </p>
                    </div>

                    {/* Options */}
                    <div className="space-y-4">
                        {options.map((option, idx) => (
                            <button
                                key={idx}
                                data-adventure-answer={idx + 1}
                                disabled={showFeedback}
                                onClick={() => handleAnswer(option)}
                                className="w-full p-5 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-blue-600 hover:to-blue-500 text-white font-semibold rounded-xl text-lg transition transform hover:scale-105 hover:shadow-xl border-2 border-slate-500 hover:border-blue-400 text-left"
                            >
                                <span className="text-blue-300 font-bold mr-3">Option {String.fromCharCode(65 + idx)}:</span>
                                {option.text}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Round feedback */}
            {showFeedback && (
                <div className="w-full max-w-4xl mb-6 flex justify-center">
                    <div className={`max-w-2xl w-full p-5 sm:p-10 rounded-3xl border-4 shadow-2xl ${feedbackType === 'success'
                            ? 'bg-gradient-to-br from-green-900/90 to-emerald-900/90 border-green-500'
                            : 'bg-gradient-to-br from-red-900/90 to-orange-900/90 border-red-500'
                        }`}>
                        <p role="status" className={`text-xl sm:text-3xl font-bold mb-6 whitespace-pre-line ${feedbackType === 'success' ? 'text-green-300' : 'text-red-300'
                            }`}>
                            {feedbackType === 'success' ? 'Correct! The mission advances.' : phase === 1 ? 'Try again. Choose the preposition that describes the intended movement.' : 'Try again. Use had + past participle for the earlier past event.'}
                        </p>

                        <button
                            autoFocus data-adventure-next onClick={handleContinue}
                            className={`w-full px-8 py-4 font-bold rounded-full text-xl transition transform hover:scale-105 shadow-lg ${feedbackType === 'success'
                                    ? 'bg-green-500 hover:bg-green-400 text-slate-900'
                                    : 'bg-red-500 hover:bg-red-400 text-white'
                                }`}
                        >
                            {feedbackType === 'success' ? 'Continue Mission →' : 'Try Again ↻'}
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default TheVault;
