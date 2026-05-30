const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export function fmtDate(iso: string): string {
  const d = new Date(iso);
  return `${DAYS[d.getDay()]} ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export function fmtTime(iso: string): string {
  const d = new Date(iso);
  let h = d.getHours();
  const m = d.getMinutes();
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, '0')} ${ap}`;
}

export function relDate(iso: string): string {
  const target = new Date(iso);
  const now = new Date();
  const days = Math.floor(
    (now.setHours(0,0,0,0) - new Date(iso).setHours(0,0,0,0)) / 86400000
  );
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 14) return 'Last week';
  return `${Math.floor(days / 7)} weeks ago`;
}

export function fmtWeight(weight: number, unit: string): string {
  const v = Number.isInteger(weight) ? weight : (Math.round(weight * 10) / 10);
  return `${v} ${unit}`;
}

export function fmtDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function fmtRestTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function fmtVolume(lbs: number): string {
  if (lbs >= 1000) return `${(lbs / 1000).toFixed(1)}k`;
  return `${Math.round(lbs)}`;
}

export function toKg(lbs: number): number {
  return Math.round(lbs / 2.2046 * 10) / 10;
}

export function toLbs(kg: number): number {
  return Math.round(kg * 2.2046 * 10) / 10;
}

export function toUniversalLbs(weight: number, unit: 'lbs' | 'kg'): number {
  return unit === 'kg' ? weight * 2.2046 : weight;
}

export function calcVolumeLbs(
  sets: Array<{ weight: number; reps: number; unit: 'lbs' | 'kg' }>
): number {
  return sets.reduce((acc, s) => acc + toUniversalLbs(s.weight, s.unit) * s.reps, 0);
}

export function calcE1rm(maxWeight: number, repsAtMax: number): number {
  return Math.round(maxWeight * (1 + repsAtMax / 30));
}
