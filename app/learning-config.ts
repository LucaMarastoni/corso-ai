export const XP_REWARDS = {
  microLesson: 5,
  practice: 20,
  verification: 30,
  application: 50,
  module: 50,
} as const;
// 225 XP per module, 1350 XP for the course. All five ranks are reachable.
export const LEARNING_LEVELS = [
  { level: 1, name: 'Esploratore', minXp: 0 },
  { level: 2, name: 'Operatore', minXp: 150 },
  { level: 3, name: 'Prompt Architect', minXp: 450 },
  { level: 4, name: 'Analista', minXp: 750 },
  { level: 5, name: 'Applied Intelligence', minXp: 1050 },
] as const;
export function learningLevel(xp: number) {
  const current =
    [...LEARNING_LEVELS].reverse().find((level) => xp >= level.minXp) ||
    LEARNING_LEVELS[0];
  const next = LEARNING_LEVELS.find(
    (level) => level.level === current.level + 1,
  );
  return {
    current,
    next,
    remaining: next ? Math.max(0, next.minXp - xp) : 0,
    progress: next
      ? Math.min(
          100,
          ((xp - current.minXp) / (next.minXp - current.minXp)) * 100,
        )
      : 100,
  };
}
