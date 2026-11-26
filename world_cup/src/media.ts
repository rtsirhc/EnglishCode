export const videos = {
  idle: 'stadium_loop_v2',
  quiz: 'quiz_idle',
  penaltyPrep: 'penalty_prep_extended',
  goal: 'goal',
  save: 'save',
  championship: 'championship',
} as const;

export const audio = {
  'stadium-loop-v2-audio': 'stadium_loop_v2_audio',
  'goal-audio': 'goal_audio',
  'save-audio': 'save_audio',
  'championship-audio': 'championship_audio',
} as const;

export function mediaPath(file: string) {
  return import.meta.env.BASE_URL + 'assets/optimized/' + file;
}
