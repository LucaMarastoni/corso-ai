'use client';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  Check,
  CircleCheck,
  ClipboardCheck,
  Clock3,
  FileSearch,
  Flame,
  Megaphone,
  ShieldCheck,
  Target,
  TrendingUp,
} from 'lucide-react';
import { AcademyButton, AcademyCard, SectionHeader } from './academy';
import { Progress } from './ui/progress';
import { courses, getCourse } from '../app/courses';
import { restore, type LearningState } from '../app/progress';
import { progressDashboard } from '../app/progress-dashboard';

export function SkillUpProgress({
  state,
  ready,
  onActivity,
}: {
  state: LearningState;
  ready: boolean;
  onActivity: (courseId: string, activityId: string) => void;
}) {
  const [saved, setSaved] = useState<Record<string, LearningState>>({});
  const [loaded, setLoaded] = useState(false);
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  useEffect(() => {
    const read = () => {
      const next: Record<string, LearningState> = {};
      let unavailable = false;
      for (const course of courses) {
        if (course.id === state.courseId) continue;
        try {
          next[course.id] = restore(
            localStorage.getItem(course.storageKey) ||
              (course.legacyStorageKey
                ? localStorage.getItem(course.legacyStorageKey)
                : null) ||
              '{}',
            course.id,
          );
        } catch {
          unavailable = true;
        }
      }
      setSaved(next);
      setLoaded(true);
      setStorageUnavailable(unavailable);
    };
    const timer = window.setTimeout(read, 0);
    window.addEventListener('storage', read);
    window.addEventListener('focus', read);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('storage', read);
      window.removeEventListener('focus', read);
    };
  }, [state.courseId]);
  const states = courses.map((course) =>
    course.id === state.courseId
      ? state
      : saved[course.id] || restore('{}', course.id),
  );
  const data = progressDashboard(states, state.courseId);
  const waiting = !ready || !loaded;
  const maxDay = Math.max(1, ...data.week.map((day) => day.activities));
  const fmt = (value: number) => value.toLocaleString('it-IT');
  const activeCourses = data.courseRows.filter(
    (row) => row.percent > 0 && row.percent < 100,
  );
  const displayedCourses = [
    ...activeCourses,
    ...data.courseRows.filter((row) => !activeCourses.includes(row)),
  ].slice(0, 2);
  const reviews = showAllReviews ? data.reviews : data.reviews.slice(0, 2);
  return (
    <div className="skillup-progress" aria-busy={waiting}>
      <header className="sg-header">
        <span aria-hidden="true" />
        <h1>Progressi</h1>
        <button
          aria-label="Vai all’attività di questa settimana"
          onClick={() =>
            document
              .getElementById('sg-week')
              ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        >
          <CalendarDays size={25} />
        </button>
      </header>
      <main className="sg-layout">
        <AcademyCard className="sg-overview">
          <h2>Il tuo percorso</h2>
          <p className="sg-intro">
            Ogni passo ti porta più vicino al prossimo livello.
          </p>
          <div className="sg-overview-grid">
            <div
              className="sg-ring"
              role="img"
              aria-label={`Percorso complessivo: ${data.percent}%`}
            >
              <svg viewBox="0 0 120 120" aria-hidden="true">
                <circle className="sg-ring-track" cx="60" cy="60" r="52" />
                <circle
                  className="sg-ring-value"
                  cx="60"
                  cy="60"
                  r="52"
                  pathLength="100"
                  strokeDasharray={`${data.percent} 100`}
                />
              </svg>
              <div>
                <strong>{waiting ? '—' : `${data.percent}%`}</strong>
                <span>
                  Percorso
                  <br />
                  complessivo
                </span>
              </div>
            </div>
            <div className="sg-overview-metric">
              <span className="sg-mini-icon">
                <BookOpen size={21} />
              </span>
              <strong>{waiting ? '—' : data.started}</strong>
              <span>Corsi iniziati</span>
            </div>
            <div className="sg-overview-metric">
              <span className="sg-mini-icon positive">
                <CircleCheck size={23} />
              </span>
              <strong>{waiting ? '—' : data.completed}</strong>
              <span>
                {data.completed === 1 ? 'Corso completato' : 'Corsi completati'}
              </span>
            </div>
            <div className="sg-overview-metric">
              <span className="sg-mini-icon">
                <Clock3 size={22} />
              </span>
              <strong>—</strong>
              <span>
                Formazione<small>Tempo non rilevato</small>
              </span>
            </div>
          </div>
        </AcademyCard>
        <AcademyCard className="sg-level">
          <img src="./achievements/prompt-architect.png" alt="" />
          <div className="sg-level-content">
            <div className="sg-level-top">
              <div>
                <h2>Livello {waiting ? '—' : data.level.current.level}</h2>
                <h3>{data.level.current.name}</h3>
              </div>
              <span className="sg-next-level">
                {data.level.next
                  ? `Prossimo livello: ${data.level.next.name}`
                  : 'Livello massimo raggiunto'}
              </span>
            </div>
            <p>
              <strong>{fmt(data.xp)}</strong>
              {data.level.next ? ` / ${fmt(data.level.next.minXp)}` : ''} XP
            </p>
            <Progress
              value={data.level.progress}
              aria-label="Avanzamento al prossimo livello"
            />
            <p className="sg-level-remaining">
              {data.level.next
                ? `${fmt(data.level.remaining)} XP al prossimo livello`
                : 'Continua a far crescere le tue competenze.'}
            </p>
          </div>
        </AcademyCard>
        <AcademyCard className="sg-streak">
          <div className="sg-streak-copy">
            <span className="sg-flame">
              <Flame size={36} />
            </span>
            <div>
              <h2>
                {data.streak}{' '}
                {data.streak === 1
                  ? 'giorno consecutivo'
                  : 'giorni consecutivi'}
              </h2>
              <p>
                Il tuo record registrato è di {data.recordStreak}{' '}
                {data.recordStreak === 1 ? 'giorno' : 'giorni'}
              </p>
            </div>
          </div>
          <div
            className="sg-streak-week"
            aria-label="Continuità questa settimana"
          >
            {data.week.map((day) => (
              <div
                key={day.day}
                aria-label={`${day.day}: ${day.studied ? 'studio completato' : day.future ? 'in programma' : 'nessuna attività'}`}
                className={day.today ? 'today' : ''}
              >
                <span>{day.label}</span>
                <i className={day.studied ? 'done' : ''}>
                  {day.studied && <Check size={14} />}
                </i>
              </div>
            ))}
          </div>
        </AcademyCard>
        <AcademyCard className="sg-courses">
          <SectionHeader title="Corsi in corso" href="#lessons" />
          <div className="sg-course-grid">
            {displayedCourses.map(({ course, next, percent }) => (
              <article className="sg-course" key={course.id}>
                <img
                  src={
                    course.id === 'ai-basics'
                      ? './skillup/ai.webp'
                      : course.cover
                  }
                  alt=""
                />
                <div className="sg-course-details">
                  <div className="sg-course-title">
                    <h3>{course.title}</h3>
                    <strong>{percent}%</strong>
                  </div>
                  <Progress
                    value={percent}
                    aria-label={`Avanzamento ${course.title}`}
                  />
                  <p>
                    Modulo {next.moduleIndex + 1} di {course.modules.length}
                  </p>
                </div>
                <p className="sg-course-next">
                  {percent === 100
                    ? 'Percorso completato · Ripassa quando vuoi'
                    : `Prossimo step: ${next.activity.title}`}
                </p>
                <AcademyButton
                  disabled={waiting}
                  onClick={() => onActivity(course.id, next.activity.id)}
                >
                  {percent === 100
                    ? 'Ripassa'
                    : percent > 0
                      ? 'Continua'
                      : 'Inizia'}
                  <ArrowRight size={19} />
                </AcademyButton>
              </article>
            ))}
          </div>
        </AcademyCard>
        <AcademyCard className="sg-milestone">
          <h2>Prossimo traguardo</h2>
          {data.milestone ? (
            <div className="sg-milestone-body">
              <img src={data.milestone.image} alt="" />
              <div className="sg-milestone-copy">
                <h3>{data.milestone.name}</h3>
                <p>{data.milestone.description}</p>
                <div>
                  <span>
                    <strong>
                      {data.milestone.done} / {data.milestone.total}
                    </strong>{' '}
                    attività
                  </span>
                  <Progress
                    value={(data.milestone.done / data.milestone.total) * 100}
                    aria-label={`Avanzamento verso ${data.milestone.name}`}
                  />
                </div>
              </div>
              <span className="sg-xp">
                +{data.milestone.xp} XP<small>da ottenere</small>
              </span>
            </div>
          ) : (
            <div className="sg-complete">
              <Award size={36} />
              <div>
                <h3>Tutti i moduli completati</h3>
                <p>Hai raggiunto i traguardi dei tuoi corsi.</p>
              </div>
            </div>
          )}
        </AcademyCard>
        <div className="sg-analysis-grid">
          <AcademyCard className="sg-week" id="sg-week">
            <h2>Questa settimana</h2>
            <div
              className="sg-chart"
              role="img"
              aria-label={`Attività completate nella settimana: ${data.week.map((d) => `${d.day}: ${d.activities}`).join(', ')}`}
            >
              <div className="sg-bars">
                {data.week.map((day) => (
                  <div key={day.day}>
                    <div
                      className={`sg-bar-column ${day.future ? 'future' : ''}`}
                    >
                      <span
                        style={{
                          height: `${(day.activities / maxDay) * 100}%`,
                        }}
                      />
                    </div>
                    <span className={day.today ? 'today' : ''}>
                      {day.label}
                    </span>
                  </div>
                ))}
              </div>
              <p>Attività completate al giorno</p>
            </div>
            <div className="sg-week-metrics">
              <div>
                <strong>—</strong>
                <span>
                  tempo di studio<small>non rilevato</small>
                </span>
              </div>
              <div>
                <strong>
                  {data.week.reduce((sum, day) => sum + day.lessons, 0)}
                </strong>
                <span>lezioni completate</span>
              </div>
              <div>
                <strong>
                  {data.week.reduce((sum, day) => sum + day.quizzes, 0)}
                </strong>
                <span>quiz superati</span>
              </div>
            </div>
          </AcademyCard>
          <AcademyCard className="sg-performance">
            <h2>Le tue performance</h2>
            {[
              {
                label: 'Quiz',
                value: data.accuracy === null ? '—' : `${data.accuracy}%`,
                percent: data.accuracy || 0,
                detail: 'risposte salvate',
                icon: Target,
              },
              {
                label: 'Attività pratiche',
                value: `${data.practiceDone} / ${data.practiceTotal}`,
                percent: data.practiceTotal
                  ? (100 * data.practiceDone) / data.practiceTotal
                  : 0,
                detail: 'completate',
                icon: ClipboardCheck,
              },
              {
                label: 'Moduli',
                value: `${data.modulesDone} / ${data.modulesTotal}`,
                percent: (100 * data.modulesDone) / data.modulesTotal,
                detail: 'completati',
                icon: BookOpen,
              },
            ].map(({ label, value, percent, detail, icon: Icon }) => (
              <div className="sg-performance-row" key={label}>
                <Icon size={23} />
                <span>{label}</span>
                <Progress value={percent} aria-label={label} />
                <div>
                  <strong>{value}</strong>
                  <small>{detail}</small>
                </div>
              </div>
            ))}
          </AcademyCard>
        </div>
        <AcademyCard className="sg-review">
          <div className="sg-section-heading">
            <h2>Da ripassare</h2>
            {data.reviews.length > 2 && (
              <button onClick={() => setShowAllReviews(!showAllReviews)}>
                {showAllReviews ? 'Mostra meno' : 'Vedi tutti'}
                <ArrowRight size={17} />
              </button>
            )}
          </div>
          {reviews.length ? (
            <div className="sg-review-grid">
              {reviews.map((review) => {
                const Icon =
                  review.courseId === 'google-ads' ? Megaphone : FileSearch;
                return (
                  <article
                    className="sg-review-item"
                    key={`${review.courseId}-${review.moduleIndex}`}
                  >
                    <span className="sg-review-icon">
                      <Icon size={28} />
                    </span>
                    <div>
                      <h3>{review.title}</h3>
                      <p>{getCourse(review.courseId).title}</p>
                      <span>
                        Accuratezza quiz: <strong>{review.percent}%</strong>
                      </span>
                    </div>
                    <AcademyButton
                      disabled={waiting}
                      onClick={() =>
                        onActivity(review.courseId, review.activityId!)
                      }
                    >
                      Ripassa
                    </AcademyButton>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="sg-review-empty">
              <FileSearch size={29} />
              <p>
                {data.accuracy === null
                  ? 'Completa i quiz per individuare gli argomenti da ripassare.'
                  : 'Nessun argomento da ripassare nelle risposte salvate.'}
              </p>
            </div>
          )}
        </AcademyCard>
        <AcademyCard className="sg-skills">
          <h2>Competenze in crescita</h2>
          {data.skills.map((skill) => {
            const Icon =
              skill.icon === 'brain'
                ? Brain
                : skill.icon === 'chart'
                  ? ChartNoAxesColumnIncreasing
                  : ShieldCheck;
            return (
              <div className="sg-skill" key={skill.id}>
                <Icon size={24} />
                <span>{skill.label}</span>
                <Progress value={skill.percent} aria-label={skill.label} />
                <strong>{skill.percent}%</strong>
              </div>
            );
          })}
        </AcademyCard>
        <AcademyCard className="sg-month">
          <CalendarDays size={29} />
          <div>
            <h2>{data.monthLabel}</h2>
            <p>
              Questo mese hai completato{' '}
              <strong>
                {data.monthlyLessons}{' '}
                {data.monthlyLessons === 1 ? 'lezione' : 'lezioni'}
              </strong>
              . Il tempo di studio non è ancora rilevato.
            </p>
          </div>
          <div
            className={`sg-month-change ${data.monthlyChange !== null && data.monthlyChange > 0 ? 'positive' : ''}`}
          >
            <TrendingUp size={25} />
            <div>
              <strong>
                {data.monthlyChange === null
                  ? '—'
                  : `${data.monthlyChange > 0 ? '+' : ''}${data.monthlyChange}%`}
              </strong>
              <span>
                {data.monthlyChange === null
                  ? `Nessuna lezione a ${data.previousMonthLabel}`
                  : `lezioni rispetto a ${data.previousMonthLabel}`}
              </span>
            </div>
          </div>
        </AcademyCard>
        {(storageUnavailable || data.hasUndatedActivities) && (
          <p className="sg-data-note" role="status">
            {storageUnavailable
              ? 'Alcuni progressi locali non sono accessibili in questo browser. '
              : ''}
            {data.hasUndatedActivities
              ? 'Le attività senza data sono incluse nei totali, ma non nei riepiloghi settimanali e mensili.'
              : ''}
          </p>
        )}
      </main>
    </div>
  );
}
