export class SerialButtonParser {
  constructor() { this.buffer = ''; }

  push(chunk) {
    this.buffer += String(chunk);
    if (this.buffer.length > 256) this.buffer = this.buffer.slice(-256);
    const lines = this.buffer.split(/\r?\n/);
    this.buffer = lines.pop();
    return lines.map(line => line.trim().toUpperCase()).filter(line => line === 'A' || line === 'B');
  }
}

export function mappedTeam(button, teamA, teamB) {
  if (button === teamA) return 0;
  if (button === teamB) return 1;
  return null;
}
