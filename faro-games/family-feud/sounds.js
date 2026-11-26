// Original, layered game-show cues. No downloads or recordings required.
export function soundPlan(kind) {
  const bell = (frequency, offset = 0) => [
    {frequency, offset, duration: .72, gain: .23, type: 'sine'},
    {frequency: frequency * 2.01, offset, duration: .38, gain: .07, type: 'sine'},
    {frequency: frequency * 3.94, offset, duration: .18, gain: .025, type: 'sine'},
  ];
  const beep = offset => ({frequency: 440, offset, duration: .13, gain: .17, type: 'square', cutoff: 1600});
  switch (kind) {
    case 'correct': return bell(1046.5);
    case 'reveal': return bell(880);
    case 'duplicate': return [beep(0), beep(.23)];
    case 'wrong': return [
      {frequency: 120, offset: 0, duration: .9, gain: .2, type: 'sawtooth', cutoff: 1800, sustain: true},
      {frequency: 123, offset: 0, duration: .9, gain: .12, type: 'sawtooth', cutoff: 1800, sustain: true},
      {frequency: 240, offset: 0, duration: .9, gain: .04, type: 'square', cutoff: 1000, sustain: true},
    ];
    case 'buzz': return [{frequency: 620, offset: 0, duration: .22, gain: .18, type: 'triangle'}];
    case 'ready': return [{frequency: 740, offset: 0, duration: .12, gain: .12, type: 'sine'}];
    default: return [];
  }
}

export function playGameSound(ctx, kind) {
  for (const tone of soundPlan(kind)) {
    const start = ctx.currentTime + tone.offset;
    const end = start + tone.duration;
    const oscillator = ctx.createOscillator();
    const envelope = ctx.createGain();
    oscillator.type = tone.type;
    oscillator.frequency.setValueAtTime(tone.frequency, start);
    envelope.gain.setValueAtTime(.0001, start);
    envelope.gain.exponentialRampToValueAtTime(tone.gain, start + .008);
    if (tone.sustain) envelope.gain.setValueAtTime(tone.gain, end - .055);
    envelope.gain.exponentialRampToValueAtTime(.0001, end);
    oscillator.connect(envelope);
    if (tone.cutoff) {
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(tone.cutoff, start);
      envelope.connect(filter).connect(ctx.destination);
    } else envelope.connect(ctx.destination);
    oscillator.start(start);
    oscillator.stop(end + .025);
  }
}
