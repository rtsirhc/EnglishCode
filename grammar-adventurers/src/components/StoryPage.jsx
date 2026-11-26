import React from 'react';
import { Link } from 'react-router-dom';
import { useControls } from '../controls';
import { useGame } from '../context/GameContext';

const StoryPage = ({ title, ChapterContent, NextChapterPath, PrevChapterPath, CharacterArea }) => {
    const { isTimeMachineActive } = useGame();

    useControls(Boolean(NextChapterPath));
    return (
        <div className={`flex flex-col min-h-screen overflow-hidden ${isTimeMachineActive ? 'bg-gray-200' : 'bg-slate-50'}`}>

            {/* Top Bar with Title */}
            <div className={`p-4 shadow-md z-20 flex justify-between items-center ${isTimeMachineActive ? 'bg-gray-800 text-white' : 'bg-white text-adventure-blue'}`}>
                <h2 className="text-xl md:text-2xl font-comic font-bold truncate">{title}</h2>
                {isTimeMachineActive && <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">TIME MACHINE ACTIVE</span>}
            </div>

            {/* Main Book Content Area */}
            <div className="flex-grow flex flex-col md:flex-row relative">

                {/* Left Page / Top (Mobile): Content & Interactions */}
                <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto flex flex-col justify-start bg-white/50 relative z-10">
                    <div className="max-w-xl mx-auto w-full">
                        {ChapterContent}
                    </div>
                </div>

                {/* Right Page / Bottom (Mobile): Characters & Visuals */}
                <div className={`w-full md:w-1/2 min-h-[40vh] md:min-h-auto relative flex items-center justify-center p-6 border-l-4 border-slate-100 ${isTimeMachineActive ? 'grayscale sepia contrast-125' : ''}`}>
                    {/* Background tint */}
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-50/50 to-transparent pointer-events-none"></div>

                    {/* Character Staging Area */}
                    <div className="w-full h-full flex items-center justify-center gap-2 relative z-0">
                        {CharacterArea}
                    </div>
                </div>

            </div>
            <nav aria-label="Chapter navigation" className="flex gap-3 justify-between px-4 py-4 bg-white border-t border-slate-200">
                {PrevChapterPath && <Link to={PrevChapterPath} className="p-2 font-bold text-slate-800">← Previous</Link>}
                <Link to="/index" className="p-2 font-bold text-slate-800">Contents</Link>
                {NextChapterPath && <Link to={NextChapterPath} data-adventure-next className="p-2 font-bold text-blue-800">Next →</Link>}
            </nav>
        </div>
    );
};

export default StoryPage;
