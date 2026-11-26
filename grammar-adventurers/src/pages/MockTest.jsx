import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validatePack } from '../../../gallery/shared/content.js';
import { useControls } from '../controls';
import { read, write } from '../../../gallery/shared/storage.js';

const MockTest = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [studentName, setStudentName] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const builtIn = [
        { id: 1, text: "Every day, Leo ______ up at 7 AM.", options: ["wake", "wakes", "waking"], correct: "wakes" },
        { id: 2, text: "I ______ pizza.", options: ["like", "likes", "liking"], correct: "like" },
        { id: 3, text: "She ______ play soccer.", options: ["don't", "doesn't", "isn't"], correct: "doesn't" },
        { id: 4, text: "They ______ my best friends.", options: ["am", "is", "are"], correct: "are" },
        { id: 5, text: "I ______ a student.", options: ["am", "is", "are"], correct: "am" },
        { id: 6, text: "The cat ______ hungry.", options: ["am", "is", "are"], correct: "is" },
        { id: 7, text: "______ you speak English?", options: ["Do", "Does", "Is"], correct: "Do" },
        { id: 8, text: "Where ______ he live?", options: ["do", "does", "is"], correct: "does" },
        { id: 9, text: "______ she have a sister?", options: ["Do", "Does", "Are"], correct: "Does" },
        { id: 10, text: "______ two apples on the table.", options: ["There is", "There are", "It is"], correct: "There are" },
        { id: 11, text: "The cat is ______ the box. (Inside)", options: ["on", "in", "under"], correct: "in" },
        { id: 12, text: "There ______ a map in the bag.", options: ["is", "are", "am"], correct: "is" },
        { id: 13, text: "This is Mia. This is ______ camera.", options: ["his", "her", "your"], correct: "her" },
        { id: 14, text: "I have a bike. It is ______ bike.", options: ["my", "your", "his"], correct: "my" },
        { id: 15, text: "Yesterday, I ______ to the park.", options: ["go", "goed", "went"], correct: "went" },
        {
            id: 16, type: "reading",
            passage: "Leo has a very busy routine. On Mondays, he goes to soccer practice after school. On Tuesdays, he helps his mom cook dinner. But on Wednesdays, he is free! He usually plays video games or reads comic books. His favorite comic book is about a superhero who can fly.",
            text: "What does Leo do on Wednesdays?", options: ["He plays soccer.", "He cooks dinner.", "He plays video games."], correct: "He plays video games."
        },
        {
            id: 17, type: "reading",
            passage: "Mia loves photography. Last weekend, she went to the zoo with her family. It was a sunny day. She took photos of many animals, but she liked the monkeys the best because they were funny. However, she lost her lens cap near the lion cage!",
            text: "Why did Mia like the monkeys?", options: ["They were sunny.", "They were funny.", "They were near the lions."], correct: "They were funny."
        },
        {
            id: 18, type: "reading",
            passage: "Sam wants to be an explorer. He has a big map of the world in his bedroom. He wants to visit the Amazon Rainforest to see colorful birds and tall trees. He is learning Spanish because he wants to travel to South America next year.",
            text: "Why is Sam learning Spanish?", options: ["To talk to his friends.", "To visit South America.", "To read his map."], correct: "To visit South America."
        },
        {
            id: 19, type: "reading",
            passage: "Ivy and her brother, Ben, are very different. Ivy likes science and math, but Ben loves art and music. Ivy is quiet and likes to read, but Ben is loud and likes to sing. Despite their differences, they are best friends and always help each other with homework.",
            text: "How are Ivy and Ben different?", options: ["Ivy is loud, Ben is quiet.", "Ivy likes science, Ben likes art.", "They do not like each other."], correct: "Ivy likes science, Ben likes art."
        },
        {
            id: 20, type: "reading",
            passage: "The Time Machine was not a toy. It was a powerful invention created by Professor Zoom. It could travel 100 years into the past or the future in just one second! But there was one rule: never touch the red button unless it is an emergency.",
            text: "When may someone touch the red button?", options: ["Travel only 100 years.", "Only in an emergency.", "Always visit the future."], correct: "Only in an emergency."
        }
    ];

    const [pack] = useState(() => {
        try { return validatePack(read('pack:grammar-adventurers', null), 'quiz'); }
        catch { return null; }
    });
    const questions = pack?.items.map(item => ({ text: item.question, options: item.options, correct: item.answer, explanation: item.explanation })) ?? builtIn;
    const pending = useRef(null);
    useEffect(() => () => clearTimeout(pending.current), []);
    useControls(false, showResults || selectedAnswer !== null ? 0 : questions[currentQuestion].options.length);

    function handleAnswer(option) {
        if (pending.current !== null || selectedAnswer !== null) return;
        setSelectedAnswer(option);
        if (option === questions[currentQuestion].correct) setScore(value => value + 1);
        pending.current = setTimeout(() => {
            pending.current = null;
            if (currentQuestion + 1 < questions.length) {
                setCurrentQuestion(currentQuestion + 1);
                setSelectedAnswer(null);
            } else setShowResults(true);
        }, 1200);
    }

    const [saveError, setSaveError] = useState('');
    const submitResult = () => {
        const stored = read('grammar-adventurers:scores', []);
        const previous = Array.isArray(stored) ? stored : [];
        const result = { nickname: studentName.trim() || 'Player', score, total: questions.length, at: new Date().toISOString() };
        if (write('grammar-adventurers:scores', [...previous.slice(-49), result])) {
            setSubmitted(true);
            setSaveError('');
        } else setSaveError('Browser storage is unavailable. You can keep playing without saving.');
    };

    const navigate = useNavigate();

    const handleTryAgain = () => {
        setCurrentQuestion(0);
        setScore(0);
        setShowResults(false);
        setSelectedAnswer(null);
        setStudentName('');
        setSubmitted(false);
        setSaveError('');
    };

    if (showResults) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 flex flex-col items-center justify-center p-8 text-white">
                <div className="bg-white text-slate-800 p-5 sm:p-12 rounded-3xl shadow-2xl text-center max-w-2xl w-full">
                    <h1 className="text-5xl font-comic font-bold mb-6 text-adventure-blue">Test Complete! 🎓</h1>
                    <p className="text-2xl mb-4">You scored:</p>
                    <div className="text-5xl sm:text-8xl font-bold text-green-500 mb-8">{score} / {questions.length}</div>

                    {!submitted ? (
                        <div className="mb-8 p-6 bg-slate-50 rounded-xl border-2 border-slate-200">
                            <label htmlFor="adventure-nickname" className="block text-lg font-bold mb-2 text-slate-600">Nickname (optional). Scores stay in this browser:</label>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="text" id="adventure-nickname" maxLength={40}
                                    value={studentName}
                                    onChange={(e) => setStudentName(e.target.value)}
                                    placeholder="Player"
                                    className="min-w-0 flex-grow p-3 border-2 border-slate-300 rounded-lg text-lg focus:border-adventure-blue focus:outline-none"
                                />
                                <button
                                    onClick={submitResult}

                                    className="px-6 py-3 bg-adventure-green text-white font-bold rounded-lg hover:bg-green-600 disabled:opacity-50"
                                >
                                    Save 💾
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-8 p-4 bg-green-100 text-green-700 rounded-xl font-bold text-xl">
                            ✅ Score saved on this device for {studentName.trim() || 'Player'}!
                        </div>
                    )}

                    {saveError && <p role="alert" className="text-red-700">{saveError}</p>}
                    <p className="text-xl mb-8">
                        {score === questions.length ? "PERFECT SCORE! You are a Grammar Master! 🌟" :
                            score >= questions.length * 0.75 ? "Great job! You are a true adventurer! 🚀" :
                                "Good practice! Try again to get a perfect score! 💪"}
                    </p>

                    <div className="flex flex-wrap gap-4 justify-center">
                        <button
                            onClick={handleTryAgain}

                            className={`px-8 py-4 font-bold rounded-full text-xl shadow-lg transition transform bg-blue-500 hover:bg-blue-600 text-white hover:scale-105`}
                        >
                            Try Again 🔄
                        </button>

                        <button
                            onClick={() => navigate('/')}

                            className={`px-8 py-4 font-bold rounded-full text-xl shadow-lg transition transform bg-adventure-yellow hover:bg-yellow-400 text-white hover:scale-105`}
                        >
                            Back to Home 🏠
                        </button>
                    </div>
                    {!submitted && (
                        <p className="mt-4 text-sm text-slate-500 italic">
                            Saving is optional. Your score is never sent to a server.
                        </p>
                    )}
                </div>
            </div>
        );
    }


    const question = questions[currentQuestion];

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
            <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-white">
                {/* Header */}
                <div className="bg-adventure-blue p-6 text-white flex justify-between items-center">
                    <h2 className="text-2xl font-bold">{pack?.title ?? "Mock Test 📝"}</h2>
                    <div className="text-xl font-bold">Question {currentQuestion + 1} / {questions.length}</div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200 h-2">
                    <div className="bg-green-500 h-2 transition-all duration-500" style={{ width: `${((currentQuestion) / questions.length) * 100}%` }}></div>
                </div>

                {/* Content */}
                <div className="p-8 md:p-12">
                    {question.passage && (
                        <div className="bg-yellow-50 p-8 rounded-xl border-l-8 border-yellow-400 mb-8 text-xl font-medium leading-relaxed text-slate-700 shadow-sm">
                            {question.passage}
                        </div>
                    )}

                    <h3 className="text-2xl md:text-3xl font-bold mb-8 text-center text-slate-800">
                        {question.text}
                    </h3>

                    <div className="grid grid-cols-1 gap-4">
                        {question.options.map((option, idx) => (
                            <button
                                key={idx}
                                data-adventure-answer={idx + 1}
                                onClick={() => handleAnswer(option)}
                                disabled={selectedAnswer !== null}
                                className={`
                                    p-4 rounded-xl text-xl font-bold border-2 transition-all text-left px-8
                                    ${selectedAnswer === option
                                        ? (option === question.correct ? "bg-green-100 border-green-500 text-green-700 transform scale-105" : "bg-red-100 border-red-500 text-red-700 transform scale-105")
                                        : "bg-white border-slate-200 hover:bg-blue-50 hover:border-blue-300 text-slate-700 shadow-sm hover:translate-x-2"
                                    }
                                `}
                            >
                                <span className="mr-4 inline-block w-8 h-8 rounded-full bg-slate-200 text-slate-500 text-center text-sm leading-8">{String.fromCharCode(65 + idx)}</span>
                                {option}
                            </button>
                        ))}
                    </div>
                    {selectedAnswer !== null && question.explanation && <p role="status" className="mt-4 text-slate-700">{question.explanation}</p>}
                </div>
            </div>
        </div>
    );
};

export default MockTest;
