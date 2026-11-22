import { useMemo } from 'react';

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#FFD93D', '#A78BFA',
  '#6BCB77', '#FF9F43', '#74C0FC', '#F472B6',
  '#FC5C65', '#FD9644', '#26de81', '#45AAF2',
];

const SHAPES = ['square', 'circle', 'strip'];

export default function Confetti() {
  const pieces = useMemo(() =>
    Array.from({ length: 120 }, (_, i) => ({
      id: i,
      color: COLORS[i % COLORS.length],
      shape: SHAPES[i % SHAPES.length],
      left: `${(i * 7.3 + Math.sin(i) * 20 + 100) % 100}%`,
      delay: `${(i * 0.11) % 4}s`,
      duration: `${2.5 + (i % 5) * 0.4}s`,
      width: `${6 + (i % 5) * 2}px`,
      height: `${8 + (i % 4) * 3}px`,
      startRotate: `${(i * 37) % 360}deg`,
    }))
  , []);

  return (
    <div className="confetti-container" aria-hidden="true">
      {pieces.map((p) => (
        <div
          key={p.id}
          className={`confetti-piece confetti-${p.shape}`}
          style={{
            left: p.left,
            backgroundColor: p.color,
            width: p.width,
            height: p.height,
            animationDelay: p.delay,
            animationDuration: p.duration,
            '--start-rotate': p.startRotate,
          }}
        />
      ))}
    </div>
  );
}
