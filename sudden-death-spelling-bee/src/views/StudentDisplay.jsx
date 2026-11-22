import React, { useEffect, useState } from 'react';
import { useStudentSync } from '../hooks/useSync';
import confetti from 'canvas-confetti';

const WheelOfNames = ({ activeStudents, isSpinning, currentStudent }) => {
  // A pseudo-wheel that rapidly flips names when spinning, then lands on the target
  const [displayName, setDisplayName] = useState('?');

  useEffect(() => {
    let interval;
    if (isSpinning && activeStudents.length > 0) {
      interval = setInterval(() => {
        const randomName = activeStudents[Math.floor(Math.random() * activeStudents.length)];
        setDisplayName(randomName);
      }, 100);
    } else if (currentStudent) {
      setDisplayName(currentStudent);
    } else {
      setDisplayName('?');
    }

    return () => clearInterval(interval);
  }, [isSpinning, currentStudent, activeStudents]);

  return (
    <div className="glass-panel text-center flex flex-col justify-center items-center relative" style={{ height: '100%', minHeight: '300px' }}>
      <h3 className="mb-4 absolute" style={{ top: '16px', left: 0, right: 0, color: 'var(--primary)' }}>Wheel of Names</h3>
      <div 
        className="flex items-center justify-center"
        style={{
          width: '250px',
          height: '250px',
          borderRadius: '50%',
          background: 'conic-gradient(from 0deg, var(--primary) 0%, var(--secondary) 50%, var(--success) 100%)',
          boxShadow: 'var(--shadow-lg)',
          animation: isSpinning ? 'spin 0.5s linear infinite' : 'none',
          position: 'relative'
        }}
      >
        <div 
          className="flex items-center justify-center"
          style={{
            width: '220px', 
            height: '220px', 
            borderRadius: '50%',
            background: 'var(--bg-panel)',
            border: '4px solid white',
            animation: isSpinning ? 'spin 0.5s linear infinite reverse' : 'none',
          }}
        >
        </div>
        <div style={{ position: 'absolute', fontSize: '2rem', fontWeight: 900, color: 'var(--text-dark)' }}>
          {displayName}
        </div>
      </div>
      
      <div className="mt-4 flex justify-center" style={{ flexWrap: 'wrap', gap: '8px', maxWidth: '100%' }}>
        {activeStudents.map(student => (
          <span 
            key={student} 
            style={{ 
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              color: 'white',
              transition: 'all 0.2s ease',
              background: student === currentStudent && !isSpinning ? 'var(--secondary)' : 'var(--primary-light)',
              transform: student === currentStudent && !isSpinning ? 'scale(1.1)' : 'scale(1)'
            }}
          >
            {student}
          </span>
        ))}
      </div>
    </div>
  );
};

const VictoryScreen = ({ podium }) => {
  useEffect(() => {
    const duration = 15 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#8a2be2', '#ff3366', '#ffd700']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#8a2be2', '#ff3366', '#ffd700']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const first = podium.find(p => p.place === 1);
  const second = podium.find(p => p.place === 2);
  const third = podium.find(p => p.place === 3);

  return (
    <div className="flex flex-col items-center justify-center text-center pop-in" style={{ minHeight: '100vh', width: '100%', position: 'relative', zIndex: 10 }}>
      <h1 className="text-giant mb-4" style={{ color: 'var(--accent)', textShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
        VICTORY!
      </h1>
      
      <div className="flex items-center justify-center mt-4" style={{ gap: '16px', height: '256px', alignItems: 'flex-end' }}>
        {/* 2nd Place */}
        {second && (
          <div className="flex flex-col items-center pop-in" style={{ animationDelay: '0.4s' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px', color: 'white' }}>{second.name}</div>
            <div className="flex items-center justify-center" style={{ width: '128px', height: '120px', background: '#ccc', borderTopLeftRadius: '8px', borderTopRightRadius: '8px', fontSize: '2.5rem', fontWeight: 900, color: '#333' }}>
              2
            </div>
          </div>
        )}

        {/* 1st Place */}
        {first && (
          <div className="flex flex-col items-center pop-in" style={{ animationDelay: '0.8s' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '8px', color: 'var(--accent)' }}>{first.name}</div>
            <div className="flex items-center justify-center" style={{ width: '128px', height: '180px', background: 'var(--accent)', borderTopLeftRadius: '8px', borderTopRightRadius: '8px', fontSize: '4rem', fontWeight: 900, color: '#554400', boxShadow: 'var(--shadow-lg)' }}>
              1
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {third && (
          <div className="flex flex-col items-center pop-in" style={{ animationDelay: '0.2s' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '8px', color: 'white' }}>{third.name}</div>
            <div className="flex items-center justify-center" style={{ width: '128px', height: '80px', background: '#cd7f32', borderTopLeftRadius: '8px', borderTopRightRadius: '8px', fontSize: '2rem', fontWeight: 900, color: '#3e2723' }}>
              3
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StudentDisplay = () => {
  const state = useStudentSync(null);

  if (!state || state.phase === 'setup') {
    return (
      <div className="screen-container flex items-center justify-center text-white" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
        Waiting for Teacher to start the game...
      </div>
    );
  }

  if (state.phase === 'podium') {
    return <VictoryScreen podium={state.podium} />;
  }

  return (
    <div className="screen-container flex-col justify-between" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #192a56, #273c75)' }}>
      
      <div className="flex mb-2" style={{ gap: '1.5rem', flex: 1, minHeight: 0 }}>
        
        {/* Left/Center: Target Word & Timer */}
        <div className="flex flex-col" style={{ gap: '1.5rem', flex: 2, minHeight: 0 }}>
          
          <div className="glass-panel flex-col items-center justify-center text-center" style={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden', display: 'flex' }}>
            <h2 style={{ position: 'absolute', top: '16px', left: '24px', fontSize: '1.25rem', fontWeight: 'bold', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '2px', color: '#2d3436' }}>Current Word</h2>
            
            {state.wordVisible ? (
              <div className="text-giant font-black pop-in" style={{ transform: 'scale(1.2)', color: 'var(--primary)' }}>
                {state.currentWord}
              </div>
            ) : (
              <div className="text-giant font-black" style={{ opacity: 0.1, filter: 'blur(4px)' }}>
                ???
              </div>
            )}
          </div>

        </div>

        {/* Right: Wheel of Names & Timer */}
        <div className="flex flex-col" style={{ gap: '1.5rem', flex: 1, minHeight: 0 }}>
          <div className="flex-1" style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
             <WheelOfNames 
               activeStudents={state.activeStudents} 
               isSpinning={state.isSpinning} 
               currentStudent={state.currentStudent} 
             />
          </div>

          <div className="glass-panel text-center flex items-center justify-center">
            <div className={`timer-text my-2 ${state.timer <= 10 ? 'danger-text' : ''}`} style={{ fontSize: '3rem', color: state.timer <= 10 ? 'var(--danger)' : 'var(--primary)', margin: 0 }}>
              0:{state.timer.toString().padStart(2, '0')}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Live Typing Box */}
      <div className="glass-panel text-center" style={{ minHeight: '120px', position: 'relative' }}>
        <h3 style={{ position: 'absolute', top: '12px', left: '24px', fontSize: '1rem', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.5 }}>Live Transcriber</h3>
        <div 
          className="text-giant font-black flex items-center justify-center"
          style={{ width: '100%', backgroundColor: 'transparent', border: 'none', outline: 'none', marginTop: '16px', letterSpacing: '8px', color: 'var(--text-dark)', minHeight: '60px' }}
        >
          {state.typedText.toUpperCase() || <span style={{ opacity: 0.2 }}>...</span>}
        </div>
      </div>

    </div>
  );
};

export default StudentDisplay;
