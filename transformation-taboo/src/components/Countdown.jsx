import { useState, useEffect, useRef } from 'react';

export default function Countdown({ totalSeconds, startedAt, color = 'sky', active = true }) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!active || !startedAt) {
      setRemaining(totalSeconds);
      return;
    }

    const tick = () => {
      const elapsed = (Date.now() - startedAt) / 1000;
      const rem = Math.max(0, totalSeconds - elapsed);
      setRemaining(rem);
      if (rem > 0) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, startedAt, totalSeconds]);

  const size = 120;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = remaining / totalSeconds;
  const dashOffset = circumference * (1 - progress);

  const colorMap = {
    sky:     { stroke: '#0ea5e9', text: '#0284c7', bg: '#e0f2fe' },
    violet:  { stroke: '#8b5cf6', text: '#7c3aed', bg: '#ede9fe' },
    orange:  { stroke: '#f97316', text: '#ea580c', bg: '#fff7ed' },
    emerald: { stroke: '#10b981', text: '#059669', bg: '#d1fae5' },
    rose:    { stroke: '#f43f5e', text: '#e11d48', bg: '#ffe4e6' },
    // legacy aliases
    blue:    { stroke: '#0ea5e9', text: '#0284c7', bg: '#e0f2fe' },
    purple:  { stroke: '#8b5cf6', text: '#7c3aed', bg: '#ede9fe' },
  };

  const isUrgent = remaining <= Math.min(10, totalSeconds * 0.25);
  const colors = colorMap[isUrgent ? 'rose' : color] || colorMap.sky;
  const displaySeconds = Math.ceil(remaining);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={colors.bg} strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="countdown-ring"
          style={{ transition: 'stroke-dashoffset 0.1s linear, stroke 0.3s' }}
        />
        <text
          x="50%" y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          fill={colors.text}
          fontSize="26"
          fontWeight="800"
          fontFamily="Inter, sans-serif"
        >
          {displaySeconds}
        </text>
      </svg>
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">seconds</span>
    </div>
  );
}
