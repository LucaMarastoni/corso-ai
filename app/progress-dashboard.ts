import { courses, getCourse } from './courses.ts';
import {
  activityAvailable,
  completionPercent,
  score,
  type LearningState,
} from './progress.ts';
import { lessonActivities } from './learning-model.ts';
import { learningLevel } from './learning-config.ts';

export function localDay(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
function shiftDay(day: string, amount: number): string {
  const date = new Date(`${day}T12:00:00`);
  date.setDate(date.getDate() + amount);
  return localDay(date);
}
export function progressActivity(state: LearningState, activityId?: string) {
  const course = getCourse(state.courseId);
  if (activityId) {
    for (const [moduleIndex, module] of course.modules.entries()) {
      const step = module.activities.findIndex((a) => a.id === activityId);
      if (
        step >= 0 &&
        activityAvailable(state, moduleIndex, module.activities[step])
      )
        return { moduleIndex, step, activity: module.activities[step] };
    }
    return null;
  }
  const current = course.modules[state.level]?.activities[state.step];
  if (
    current &&
    !state.completedActivities[current.id] &&
    activityAvailable(state, state.level, current)
  )
    return { moduleIndex: state.level, step: state.step, activity: current };
  for (const [moduleIndex, module] of course.modules.entries()) {
    const activity = lessonActivities(module.activities).find(
      (a) =>
        !state.completedActivities[a.id] &&
        activityAvailable(state, moduleIndex, a),
    );
    if (activity)
      return {
        moduleIndex,
        step: module.activities.indexOf(activity),
        activity,
      };
  }
  return { moduleIndex: 0, step: 0, activity: course.modules[0].activities[0] };
}

/** Read-only projection of the existing course ledgers. No dashboard storage. */
export function progressDashboard(
  states: LearningState[],
  activeCourseId: string,
  now = new Date(),
) {
  const today = localDay(now);
  const records = states.flatMap((state) =>
    getCourse(state.courseId).modules.flatMap((module, moduleIndex) =>
      module.activities.map((activity) => {
        const completion = state.completedActivities[activity.id];
        const timestamp = completion?.completedAt
          ? new Date(completion.completedAt)
          : null;
        const day =
          timestamp && Number.isFinite(timestamp.getTime()) && timestamp <= now
            ? localDay(timestamp)
            : null;
        return { state, module, moduleIndex, activity, completion, day };
      }),
    ),
  );
  const dated = records.filter((r) => r.day);
  const studiedDays = new Set(dated.map((r) => r.day!));
  // The existing streak stores review days too, even when no new activity is completed.
  for (const state of states) {
    if (!state.lastStudyDate || state.lastStudyDate > today) continue;
    for (let i = 0; i < state.streakDays; i++)
      studiedDays.add(shiftDay(state.lastStudyDate, -i));
  }
  let streak = 0;
  let cursor = studiedDays.has(today) ? today : shiftDay(today, -1);
  while (studiedDays.has(cursor)) {
    streak++;
    cursor = shiftDay(cursor, -1);
  }
  let recordStreak = 0,
    run = 0,
    previous = '';
  for (const day of [...studiedDays].sort()) {
    run = previous && shiftDay(previous, 1) === day ? run + 1 : 1;
    recordStreak = Math.max(recordStreak, run);
    previous = day;
  }
  const monday = shiftDay(today, -((now.getDay() + 6) % 7));
  const week = Array.from({ length: 7 }, (_, index) => {
    const day = shiftDay(monday, index);
    const items = dated.filter((r) => r.day === day);
    return {
      day,
      label: ['L', 'M', 'M', 'G', 'V', 'S', 'D'][index],
      future: day > today,
      today: day === today,
      studied: studiedDays.has(day),
      activities: items.length,
      lessons: items.filter((r) => r.activity.type === 'microLesson').length,
      quizzes: items.filter((r) => r.activity.phase === 'verify').length,
    };
  });
  const month = today.slice(0, 7);
  const previousDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonth = localDay(previousDate).slice(0, 7);
  const monthlyLessons = dated.filter(
    (r) => r.day!.startsWith(month) && r.activity.type === 'microLesson',
  ).length;
  const previousLessons = dated.filter(
    (r) =>
      r.day!.startsWith(previousMonth) && r.activity.type === 'microLesson',
  ).length;
  const xp = states.reduce((total, state) => total + score(state), 0);
  const courseRows = states.map((state) => ({
    course: getCourse(state.courseId),
    state,
    percent: completionPercent(state),
    next: progressActivity(state)!,
  }));
  const topics = new Map<
    string,
    {
      courseId: string;
      moduleIndex: number;
      title: string;
      correct: number;
      total: number;
    }
  >();
  function answer(courseId: string, moduleIndex: number, correct: boolean) {
    const key = `${courseId}:${moduleIndex}`;
    const topic = topics.get(key) || {
      courseId,
      moduleIndex,
      title: getCourse(courseId).modules[moduleIndex].title,
      correct: 0,
      total: 0,
    };
    topic.total++;
    topic.correct += Number(correct);
    topics.set(key, topic);
  }
  for (const { state, activity, moduleIndex } of records) {
    if (activity.question && Object.hasOwn(state.answers, activity.id))
      answer(
        state.courseId,
        moduleIndex,
        state.answers[activity.id] === activity.question.correct,
      );
    if (
      activity.interaction &&
      state.responses[activity.id]?.length ===
        activity.interaction.correct.length &&
      state.responses[activity.id].every(Boolean)
    )
      answer(
        state.courseId,
        moduleIndex,
        activity.interaction.correct.every(
          (id, i) => state.responses[activity.id][i] === id,
        ),
      );
  }
  for (const state of states) {
    const latest = state.examAttempts.filter((a) => a.submittedAt).at(-1);
    if (!latest) continue;
    for (const question of getCourse(state.courseId).exam?.questions || []) {
      if (latest.questionIds.includes(question.id))
        answer(
          state.courseId,
          question.sourceModule,
          latest.answers[question.id] === question.correct,
        );
    }
  }
  const topicRows = [...topics.values()];
  const questionCount = topicRows.reduce((sum, t) => sum + t.total, 0);
  const correctCount = topicRows.reduce((sum, t) => sum + t.correct, 0);
  const reviews = topicRows
    .filter((t) => t.correct < t.total)
    .map((topic) => {
      const state = states.find((s) => s.courseId === topic.courseId)!;
      const module = getCourse(topic.courseId).modules[topic.moduleIndex];
      const first = module.activities.find((a) =>
        activityAvailable(state, topic.moduleIndex, a),
      );
      return {
        ...topic,
        percent: Math.round((topic.correct / topic.total) * 100),
        activityId: first?.id,
      };
    })
    .filter((t) => t.activityId)
    .sort((a, b) => a.percent - b.percent);
  const practice = records.filter(
    (r) => r.activity.phase === 'practice' || r.activity.phase === 'apply',
  );
  const active = states.find((s) => s.courseId === activeCourseId) || states[0];
  const pendingState =
    active && completionPercent(active) < 100
      ? active
      : states.find((s) => completionPercent(s) < 100);
  const pendingCourse = pendingState ? getCourse(pendingState.courseId) : null;
  const pendingIndex =
    pendingCourse && pendingState
      ? pendingCourse.modules.findIndex(
          (m) => !pendingState.completedActivities[`${m.id}:unlock`],
        )
      : -1;
  const pendingModule = pendingCourse?.modules[pendingIndex];
  const achievement = pendingCourse?.achievements.find(
    (a) => a.id === pendingModule?.achievementId,
  );
  const targetActivities =
    pendingModule?.activities.filter((a) => a.phase !== 'unlock') || [];
  const milestone =
    pendingModule && pendingState
      ? {
          name:
            achievement?.name ||
            pendingCourse!.competencies.find(
              (c) => c.id === pendingModule.competencyId,
            )?.name ||
            pendingModule.title,
          image: achievement?.image || './achievements/signal-frame.png',
          description:
            achievement?.criterion ||
            `Completa il Modulo ${pendingIndex + 1} · ${pendingModule.title}.`,
          done: targetActivities.filter(
            (a) => pendingState.completedActivities[a.id],
          ).length,
          total: targetActivities.length,
          xp: pendingModule.activities
            .filter((a) => !pendingState.completedActivities[a.id])
            .reduce((sum, a) => sum + a.xpReward, 0),
        }
      : null;
  const skillTargets = [
    {
      courseId: 'ai-basics',
      id: 'structured-prompting',
      label: 'Prompting strutturato',
      icon: 'brain',
    },
    {
      courseId: 'google-ads',
      id: 'ads-measurement',
      label: 'Analisi delle campagne',
      icon: 'chart',
    },
    {
      courseId: 'ai-basics',
      id: 'critical-evaluation',
      label: 'Valutazione critica dell’AI',
      icon: 'shield',
    },
  ];
  const skills = skillTargets.map((target) => {
    const course = getCourse(target.courseId);
    const state = states.find((s) => s.courseId === course.id);
    const definition = course.competencies.find((c) => c.id === target.id)!;
    const activities = course.modules[definition.sourceModule].activities;
    return {
      ...target,
      percent: state
        ? Math.round(
            (100 *
              activities.filter((a) => state.completedActivities[a.id])
                .length) /
              activities.length,
          )
        : 0,
    };
  });
  return {
    percent: states.length
      ? Math.round(
          states.reduce((sum, s) => sum + completionPercent(s), 0) /
            states.length,
        )
      : 0,
    started: states.filter((s) => Object.keys(s.completedActivities).length > 0)
      .length,
    completed: states.filter((s) => completionPercent(s) === 100).length,
    xp,
    level: learningLevel(xp),
    streak,
    recordStreak,
    week,
    courseRows,
    milestone,
    accuracy: questionCount
      ? Math.round((correctCount / questionCount) * 100)
      : null,
    practiceDone: practice.filter((r) => r.completion).length,
    practiceTotal: practice.length,
    modulesDone: states.reduce((sum, s) => sum + s.completed.length, 0),
    modulesTotal: courses.reduce((sum, c) => sum + c.modules.length, 0),
    reviews,
    skills,
    monthlyLessons,
    monthLabel: now.toLocaleDateString('it-IT', { month: 'long' }),
    previousMonthLabel: previousDate.toLocaleDateString('it-IT', {
      month: 'long',
    }),
    monthlyChange: previousLessons
      ? Math.round(((monthlyLessons - previousLessons) / previousLessons) * 100)
      : null,
    hasUndatedActivities: records.some((r) => r.completion && !r.day),
  };
}
