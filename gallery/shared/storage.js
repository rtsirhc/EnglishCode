const PREFIX = 'englishcode:v1:';
export function read(key, fallback) {
  try { const raw = localStorage.getItem(PREFIX + key); return raw === null ? fallback : JSON.parse(raw); }
  catch { return fallback; }
}
export function write(key, value) {
  try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); return true; }
  catch { return false; }
}
export function savedGameIds() {
  const value = read('saved', []);
  return new Set(Array.isArray(value) ? value.filter(id => typeof id === 'string' && id.length) : []);
}
export function toggleSaved(id) {
  const saved = savedGameIds();
  saved.has(id) ? saved.delete(id) : saved.add(id);
  if (!write('saved', [...saved])) throw new Error('Your browser could not save this change. Check available storage.');
  return saved.has(id);
}
