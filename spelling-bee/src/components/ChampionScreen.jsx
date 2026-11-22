import Confetti from './Confetti';

const MEDALS = ['🥇', '🥈', '🥉'];
const PODIUM_HEIGHTS = ['180px', '130px', '100px'];
const PODIUM_COLORS = [
  'linear-gradient(160deg,#FFD700,#FFA500)',
  'linear-gradient(160deg,#C0C0C0,#A0A0A0)',
  'linear-gradient(160deg,#CD7F32,#A0522D)',
];
const PODIUM_ORDER = [1, 0, 2]; // display left→right: 2nd, 1st, 3rd

export default function ChampionScreen({ state, onReset, isTeacher }) {
  const { podium = [] } = state;

  const handlePlayAgain = () => {
    if (onReset && window.confirm('Start a new game?')) onReset();
  };

  return (
    <div className="champion-page">
      <Confetti />

      <div className="champion-content">
        <div className="champion-trophy">🏆</div>
        <h1 className="champion-title">Spelling Bee Champion!</h1>
        {podium[0] && (
          <p className="champion-name">{podium[0]}</p>
        )}

        {/* Podium — order: 2nd (left), 1st (center), 3rd (right) */}
        <div className="podium-row">
          {PODIUM_ORDER.map((rank) => {
            const name = podium[rank];
            if (!name) return <div key={rank} className="podium-slot podium-empty" />;
            return (
              <div key={rank} className="podium-slot">
                <div className="podium-label">
                  <span className="podium-medal">{MEDALS[rank]}</span>
                  <span className="podium-player-name">{name}</span>
                </div>
                <div
                  className="podium-block"
                  style={{
                    height: PODIUM_HEIGHTS[rank],
                    background: PODIUM_COLORS[rank],
                  }}
                >
                  <span className="podium-rank-num">{rank + 1}</span>
                </div>
              </div>
            );
          })}
        </div>

        {isTeacher && (
          <button className="play-again-btn" onClick={handlePlayAgain}>
            🔄 Play Again
          </button>
        )}
      </div>
    </div>
  );
}
