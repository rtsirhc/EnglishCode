import { useRef, useEffect, useCallback } from 'react';

const SEGMENT_COLORS = [
  '#FF6B6B', '#4ECDC4', '#FFD93D', '#A78BFA',
  '#6BCB77', '#FF9F43', '#74C0FC', '#F472B6',
  '#FC5C65', '#26de81', '#FD9644', '#45AAF2',
];

function easeOut(t) {
  return 1 - Math.pow(1 - t, 4);
}

export default function NameWheel({ students, triggerSpin, targetIndex, onSpinEnd, size = 300 }) {
  const canvasRef = useRef(null);
  const rotationRef = useRef(0);
  const animRef = useRef(null);

  const draw = useCallback(
    (rotation) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const size = canvas.width;
      const cx = size / 2;
      const cy = size / 2;
      const r = cx - 8;
      const n = students.length;
      if (n === 0) return;

      ctx.clearRect(0, 0, size, size);

      const arc = (2 * Math.PI) / n;

      // Shadow behind wheel
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.2)';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, 2 * Math.PI);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.restore();

      // Segments
      for (let i = 0; i < n; i++) {
        const startAngle = rotation - Math.PI / 2 + i * arc;
        const endAngle = startAngle + arc;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = SEGMENT_COLORS[i % SEGMENT_COLORS.length];
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Student name labels
      for (let i = 0; i < n; i++) {
        const startAngle = rotation - Math.PI / 2 + i * arc;
        const midAngle = startAngle + arc / 2;
        const labelR = r * 0.62;
        const lx = cx + Math.cos(midAngle) * labelR;
        const ly = cy + Math.sin(midAngle) * labelR;

        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(midAngle + Math.PI / 2);

        const fontSize = Math.max(10, Math.min(15, (r * 0.9) / Math.max(n, 4)));
        ctx.font = `700 ${fontSize}px 'Fredoka', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const name = students[i];
        const display = name.length > 10 ? name.slice(0, 9) + '…' : name;

        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillText(display, 1, 1);
        ctx.fillStyle = '#fff';
        ctx.fillText(display, 0, 0);
        ctx.restore();
      }

      // Outer ring
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, 2 * Math.PI);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 5;
      ctx.stroke();

      // Center hub
      ctx.beginPath();
      ctx.arc(cx, cy, 24, 0, 2 * Math.PI);
      ctx.fillStyle = '#fff';
      ctx.shadowColor = 'rgba(0,0,0,0.15)';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = '20px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🐝', cx, cy);
    },
    [students]
  );

  // Redraw whenever students list changes
  useEffect(() => {
    draw(rotationRef.current);
  }, [draw]);

  // Trigger spin animation
  useEffect(() => {
    if (triggerSpin === 0 || targetIndex === null) return;

    const n = students.length;
    if (n === 0) return;

    const arc = (2 * Math.PI) / n;

    // We want the center of segment `targetIndex` to sit under the top pointer.
    // Segment i's midpoint angle (at rotation=0) relative to 12-o'clock: i * arc + arc/2
    // We need: finalRotation mod (2π) = -( targetIndex * arc + arc/2 ) mod (2π)
    const segMid = targetIndex * arc + arc / 2;
    const desiredMod = ((2 * Math.PI - segMid) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);

    const currentMod = ((rotationRef.current % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    let adjustment = desiredMod - currentMod;
    if (adjustment < 0) adjustment += 2 * Math.PI;

    const startRotation = rotationRef.current;
    const totalChange = 6 * 2 * Math.PI + adjustment;
    const finalRotation = startRotation + totalChange;
    const duration = 4200;
    const startTime = performance.now();

    if (animRef.current) cancelAnimationFrame(animRef.current);

    function animate(now) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      rotationRef.current = startRotation + totalChange * easeOut(t);
      draw(rotationRef.current);

      if (t < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        rotationRef.current = finalRotation;
        draw(finalRotation);
        onSpinEnd(targetIndex);
      }
    }

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [triggerSpin]);

  return (
    <div className="wheel-wrap">
      <div className="wheel-pointer-top">▼</div>
      <canvas ref={canvasRef} width={size} height={size} className="wheel-canvas" />
    </div>
  );
}
