import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState } from 'react';

export default function LandingView() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const codeFromUrl = searchParams.get('code');

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(ellipse at top, #1a1a3e 0%, #0a0e1a 60%)',
            padding: '24px',
            textAlign: 'center',
        }}>
            {/* Title */}
            <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '3rem' }}>⚔️</span>
            </div>
            <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2rem, 6vw, 3.5rem)',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #f59e0b, #fbbf24, #f59e0b)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '8px',
                letterSpacing: '-1px',
            }}>
                SENTENCE SHOWDOWN
            </h1>
            <p style={{
                color: 'var(--text-secondary)',
                fontSize: '1rem',
                marginBottom: '48px',
                maxWidth: '360px',
            }}>
                Bet. Buzz. Battle. The ultimate English showdown.
            </p>

            {/* Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '320px' }}>
                <button
                    className="btn btn-gold btn-lg btn-block"
                    onClick={() => navigate('/host')}
                    style={{ fontSize: '1.2rem' }}
                >
                    🎓 Host Game
                </button>
                <button
                    className="btn btn-cyan btn-lg btn-block"
                    onClick={() => navigate(codeFromUrl ? `/play?code=${codeFromUrl}` : '/play')}
                    style={{ fontSize: '1.2rem' }}
                >
                    🎮 Join Game
                </button>
            </div>

            {/* Footer */}
            <p style={{
                position: 'absolute',
                bottom: '24px',
                color: 'var(--text-dim)',
                fontSize: '0.75rem',
            }}>
                ESL Classroom Game · A2–B1 Level
            </p>
        </div>
    );
}
