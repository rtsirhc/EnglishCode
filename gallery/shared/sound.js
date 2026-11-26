let audio;
export async function tone(kind='correct') {
 try {audio ||= new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')await audio.resume();const notes=kind==='correct'?[523,659,784]:[220,165];notes.forEach((frequency,index)=>{const oscillator=audio.createOscillator(),gain=audio.createGain(),start=audio.currentTime+index*.1;oscillator.frequency.value=frequency;gain.gain.setValueAtTime(.08,start);gain.gain.exponentialRampToValueAtTime(.001,start+.18);oscillator.connect(gain).connect(audio.destination);oscillator.start(start);oscillator.stop(start+.2);});}catch{/* Sound is optional; a muted/unavailable audio device never blocks play. */}
}
