import { getCourse } from './courses.ts';
import { lessonActivities, type Activity } from './learning-model.ts';
import {
  activityAvailable,
  completeActivity,
  isActivityComplete,
  type LearningState,
} from './progress.ts';

export function lessonPosition(state: LearningState) {
  const module = getCourse(state.courseId).modules[state.level];
  const activity = module.activities[state.step];
  const ordered = lessonActivities(module.activities);
  const position = ordered.indexOf(activity);
  const group = ordered.filter((a) => a.phase === activity.phase);
  return {
    module,
    activity,
    ordered,
    position,
    group,
    current: group.indexOf(activity) + 1,
    total: group.length,
  };
}
export function advanceLesson(
  state: LearningState,
  moduleIndex: number,
  activityId: string,
  at?: string,
): LearningState {
  const module = getCourse(state.courseId).modules[moduleIndex];
  if (
    !module ||
    state.level !== moduleIndex ||
    module.activities[state.step]?.id !== activityId
  )
    return state;
  const next = completeActivity(state, moduleIndex, activityId, at);
  if (!isActivityComplete(next, activityId)) return state;
  const ordered = lessonActivities(module.activities);
  const following = ordered[ordered.findIndex((a) => a.id === activityId) + 1];
  if (!following || !activityAvailable(next, moduleIndex, following))
    return next;
  return { ...next, step: module.activities.indexOf(following) };
}
export function activityKind(activity: Activity) {
  if (activity.slide) return 'slide';
  if (activity.question)
    return activity.type === 'comparison' ? 'comparison' : 'multipleChoice';
  if (activity.interaction) return 'structured';
  if (activity.type === 'textInput' || activity.type === 'scenario')
    return 'textInput';
  return activity.type;
}
export function slideSwipe(
  dx: number,
  dy: number,
  milliseconds: number,
): 'next' | 'back' | null {
  if (
    milliseconds > 700 ||
    Math.abs(dx) < 55 ||
    Math.abs(dx) < Math.abs(dy) * 1.5
  )
    return null;
  return dx < 0 ? 'next' : 'back';
}
