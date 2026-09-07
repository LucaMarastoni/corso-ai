'use client';
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  Check,
  FileText,
  Files,
  Lightbulb,
  Mail,
  MessageSquareText,
  PanelsTopLeft,
  SlidersHorizontal,
  Sparkles,
  Target,
} from 'lucide-react';
import { createStepFlow, quizFlowDelay } from '../app/lesson-flow';
import { AcademyButton } from './academy';
import { ActivityText, ModuleCompletion } from './learning';
import { StructuredInteraction } from './exam';
import { Progress } from './ui/progress';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { getCourse } from '../app/courses';
import type { LessonSlide } from '../app/lesson-content';
import {
  score,
  activityAvailable,
  canCompleteActivity,
  completeActivity,
  isActivityComplete,
  startExam,
  answerExam,
  submitExam,
  examResult,
  type LearningState,
} from '../app/progress';
import {
  activityKind,
  advanceLesson,
  lessonPosition,
  slideSwipe,
} from '../app/lesson-player-model';

type Change = Dispatch<SetStateAction<LearningState>>;
function LessonHeader({
  moduleNumber,
  title,
  current,
  total,
  progressValue,
}: {
  moduleNumber: number;
  title: string;
  current: number;
  total: number;
  progressValue?: number;
}) {
  return (
    <header className="lp-header">
      <div>
        <a href="#lessons" aria-label="Torna ai moduli">
          <ArrowLeft />
        </a>
        <div>
          <p>MODULO {moduleNumber}</p>
          <h2>{title}</h2>
        </div>
        <span>
          {current} / {total}
        </span>
      </div>
      <Progress
        value={progressValue ?? (100 * current) / total}
        aria-label={
          progressValue === undefined
            ? `Avanzamento: ${current} di ${total}`
            : `Modulo completato al ${Math.round(progressValue)}%`
        }
      />
    </header>
  );
}
function LessonNavigation({
  current,
  total,
  dots,
  onBack,
  onNext,
  label,
  disabled,
  prompt,
}: {
  current: number;
  total: number;
  dots?: boolean;
  onBack: () => void;
  onNext: () => void;
  label: string;
  disabled?: boolean;
  prompt?: string;
}) {
  return (
    <footer className="lp-navigation">
      <AcademyButton variant="ghost" onClick={onBack}>
        <ArrowLeft size={20} />
        <span>Indietro</span>
      </AcademyButton>
      <div className="lp-pagination" aria-label={`${current} di ${total}`}>
        {dots && (
          <div aria-hidden="true">
            {Array.from({ length: total }, (_, i) => (
              <i key={i} className={i + 1 === current ? 'active' : ''} />
            ))}
          </div>
        )}
        <span>
          {current} di {total}
        </span>
      </div>
      {prompt ? (
        <span className="lp-answer-prompt">{prompt}</span>
      ) : (
        <AcademyButton disabled={disabled} onClick={onNext}>
          <span>{label}</span>
          <ArrowRight size={20} />
        </AcademyButton>
      )}
    </footer>
  );
}
function LessonFrame({
  moduleNumber,
  title,
  current,
  total,
  children,
  navigation,
  focusKey,
  type,
  onSwipe,
  progressValue,
  direction = 'next',
  pulse,
  onInteraction,
  journey,
}: {
  moduleNumber: number;
  title: string;
  current: number;
  total: number;
  children: ReactNode;
  navigation: ReactNode;
  focusKey: string;
  type: string;
  onSwipe?: (direction: 'next' | 'back') => void;
  progressValue?: number;
  direction?: 'next' | 'back';
  pulse?: ReactNode;
  journey?: ReactNode;
  onInteraction?: () => void;
}) {
  const body = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number; at: number } | null>(null);
  useEffect(() => {
    if (body.current) {
      body.current.scrollTop = 0;
      body.current
        .querySelector<HTMLElement>('h1')
        ?.focus({ preventScroll: true });
    }
  }, [focusKey]);
  return (
    <article
      className="lesson-player"
      data-activity-type={type}
      data-direction={direction}
    >
      <LessonHeader
        moduleNumber={moduleNumber}
        title={title}
        current={current}
        total={total}
        progressValue={progressValue}
      />
      {journey}
      <div
        className="lp-body"
        ref={body}
        onPointerDown={onInteraction}
        onKeyDown={onInteraction}
        onTouchStart={(event) => {
          if (
            !onSwipe ||
            event.touches.length !== 1 ||
            (event.target as HTMLElement).closest(
              'button,a,input,textarea,select,summary',
            )
          ) {
            touch.current = null;
            return;
          }
          touch.current = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY,
            at: Date.now(),
          };
        }}
        onTouchCancel={() => {
          touch.current = null;
        }}
        onTouchEnd={(event) => {
          const start = touch.current;
          touch.current = null;
          if (
            !start ||
            !onSwipe ||
            window.getSelection()?.toString() ||
            !event.changedTouches[0]
          )
            return;
          const direction = slideSwipe(
            event.changedTouches[0].clientX - start.x,
            event.changedTouches[0].clientY - start.y,
            Date.now() - start.at,
          );
          if (direction) onSwipe(direction);
        }}
      >
        <div className="lp-content" key={focusKey}>
          {children}
        </div>
      </div>
      {pulse}
      {navigation}
    </article>
  );
}
export function TakeawayCard({
  children,
  label = 'DA RICORDARE',
}: {
  children: ReactNode;
  label?: string;
}) {
  return (
    <aside className="lp-takeaway">
      <span className="lp-bulb">
        <Lightbulb strokeWidth={1.5} />
      </span>
      <div>
        <p>{label}</p>
        <strong>{children}</strong>
      </div>
    </aside>
  );
}
const nodeIcons = {
  data: Files,
  result: FileText,
  input: MessageSquareText,
  mail: Mail,
  ai: Sparkles,
};
function FlowVisual({ slide }: { slide: LessonSlide }) {
  return (
    <div
      className={`lp-flow ${slide.layout === 'process' ? 'is-process' : ''}`}
      aria-label={slide.nodes?.map((n) => n.label).join(' → ')}
    >
      {slide.nodes?.map((node, index) => {
        const Icon = nodeIcons[node.icon];
        return (
          <div className="lp-flow-node" key={node.label}>
            <div className="lp-visual-tile">
              {node.icon === 'ai' ? (
                <img
                  src="./learning/ai-chip.png"
                  alt=""
                  width={160}
                  height={160}
                />
              ) : (
                <span className="lp-document-icon">
                  <Icon strokeWidth={1.3} />
                </span>
              )}
              {slide.layout === 'process' && (
                <>
                  <h3>{node.label}</h3>
                  {node.text && <p>{node.text}</p>}
                </>
              )}
            </div>
            {slide.layout !== 'process' && (
              <>
                <h3>{node.label}</h3>
                <p>{node.text}</p>
              </>
            )}
            {index < (slide.nodes?.length || 0) - 1 && (
              <ArrowRight
                className="lp-flow-arrow"
                size={23}
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
function ComparisonSlide({ slide }: { slide: LessonSlide }) {
  const icons = [Target, FileText, PanelsTopLeft, SlidersHorizontal];
  return (
    <>
      <div className="lp-comparison">
        {slide.comparison?.map((item, i) => (
          <div
            className={`lp-compare-panel ${i ? 'clear' : 'vague'}`}
            key={item.label}
          >
            <h3>{item.label}</h3>
            <blockquote>{item.prompt}</blockquote>
            <ArrowDown size={22} aria-hidden="true" />
            <div className="lp-output" aria-label={item.output}>
              {[45, 94, 94, 78, 64].map((width, n) => (
                <i key={n} style={{ width: `${width}%` }} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="lp-principles">
        {slide.principles?.map((principle, i) => {
          const Icon = icons[i % icons.length];
          return (
            <div key={principle.title}>
              <Icon size={25} strokeWidth={1.6} />
              <h3>{principle.title}</h3>
              <p>{principle.text}</p>
            </div>
          );
        })}
      </div>
    </>
  );
}
function HighlightText({
  text,
  keywords = [],
}: {
  text: string;
  keywords?: string[];
}) {
  if (!keywords.length) return <>{text}</>;
  const parts = text.split(
    new RegExp(
      '(' +
        keywords
          .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
          .join('|') +
        ')',
      'gi',
    ),
  );
  return (
    <>
      {parts.map((part, i) =>
        keywords.some((word) => word.toLowerCase() === part.toLowerCase()) ? (
          <strong key={i}>{part}</strong>
        ) : (
          part
        ),
      )}
    </>
  );
}
export function SlideRenderer({
  slide,
  category,
}: {
  slide: LessonSlide;
  category: string;
}) {
  const layout = slide.layout || 'editorial';
  const paragraphs = (texts: string[]) =>
    texts.map((text) => (
      <p key={text}>
        <HighlightText text={text} keywords={slide.keywords} />
      </p>
    ));
  return (
    <section className={`lp-slide lp-slide-${layout}`}>
      <p className="lp-eyebrow">{slide.eyebrow || category}</p>
      <h1 tabIndex={-1}>{slide.title}</h1>
      {layout === 'article' ? (
        <div className="lp-article">{paragraphs(slide.steps)}</div>
      ) : layout === 'sequence' ? (
        <ol className="lp-sequence">
          {slide.sequence?.map((step, i) => (
            <li key={step.title}>
              <span>{i + 1}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <>
          <p className="lp-explanation">{slide.steps[0]}</p>
          {layout === 'comparison' ? (
            <ComparisonSlide slide={slide} />
          ) : slide.nodes ? (
            <FlowVisual slide={slide} />
          ) : layout === 'diagram' ? (
            <>
              <div className="lp-diagram">
                {slide.principles?.map((item, i) => (
                  <div key={item.title}>
                    <span>{i + 1}</span>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                    {i < (slide.principles?.length || 0) - 1 && (
                      <ArrowRight aria-hidden="true" />
                    )}
                  </div>
                ))}
              </div>
              <div className="lp-article">
                {paragraphs(slide.steps.slice(1))}
              </div>
            </>
          ) : layout === 'example' ? (
            <div className="lp-example">
              <p className="lp-eyebrow">
                {slide.exampleLabel || 'ESEMPIO PRATICO'}
              </p>
              {paragraphs(slide.steps.slice(1))}
            </div>
          ) : (
            <div
              className={
                layout === 'insight' ? 'lp-insight' : 'lp-editorial-visual'
              }
            >
              <span>
                <Lightbulb size={44} strokeWidth={1.3} />
              </span>
              <div>{paragraphs(slide.steps.slice(1))}</div>
            </div>
          )}
        </>
      )}
      {slide.caption && <p className="lp-caption">{slide.caption}</p>}
      <TakeawayCard label={slide.calloutLabel}>{slide.takeaway}</TakeawayCard>
      {slide.source && (
        <aside className="lp-source">
          <span>Fonte · {slide.source.publisher}</span>
          <p>{slide.source.title}</p>
          <a href={slide.source.url} target="_blank" rel="noopener noreferrer">
            Apri la fonte ↗
          </a>
        </aside>
      )}
    </section>
  );
}
export function MultipleChoiceActivity({
  title,
  options,
  value,
  onValue,
  disabled = false,
  feedback,
}: {
  title: string;
  options: string[];
  feedback?: boolean;
  value?: number;
  onValue: (index: number) => void;
  disabled?: boolean;
}) {
  return (
    <RadioGroup
      className="lp-options"
      aria-label={title}
      value={value === undefined ? '' : String(value)}
      onValueChange={(value) => onValue(Number(value))}
      disabled={disabled}
    >
      {options.map((option, index) => (
        <label
          key={option}
          className={`lp-option ${value === index ? 'selected' : ''} ${value === index && feedback !== undefined ? (feedback ? 'is-correct' : 'is-wrong') : ''}`}
        >
          <span className="lp-option-letter">
            {value === index && feedback === true ? (
              <Check size={20} />
            ) : value === index && feedback === false ? (
              '×'
            ) : (
              String.fromCharCode(65 + index)
            )}
          </span>
          <span>{option}</span>
          <RadioGroupItem value={String(index)} />
        </label>
      ))}
    </RadioGroup>
  );
}
function QuizFeedback({
  correct,
  children,
}: {
  correct: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`lp-feedback ${correct ? 'correct' : 'retry'}`}
      role="status"
    >
      <strong>
        {correct ? (
          <>
            <Check size={20} /> Ottimo
          </>
        ) : (
          'Quasi'
        )}
      </strong>
      <p>{children}</p>
    </div>
  );
}
function ExamPlayer({
  state,
  ready,
  onChange,
  onBack,
  onContinue,
}: {
  state: LearningState;
  ready: boolean;
  onChange: Change;
  onBack: () => void;
  onContinue: () => void;
}) {
  const course = getCourse(state.courseId),
    exam = course.exam!,
    attempt = state.examAttempts.at(-1);
  const [cursor, setCursor] = useState<{
    attemptId: string;
    index: number;
  } | null>(null);
  const questions =
    attempt?.questionIds
      .map((id) => exam.questions.find((q) => q.id === id)!)
      .filter(Boolean) || [];
  const firstUnanswered = questions.findIndex(
    (q) => attempt?.answers[q.id] === undefined,
  );
  const index = Math.min(
    questions.length - 1,
    cursor?.attemptId === attempt?.id
      ? cursor?.index || 0
      : firstUnanswered >= 0
        ? firstUnanswered
        : Math.max(0, questions.length - 1),
  );
  const question = questions[index];
  const result = attempt?.submittedAt ? examResult(state, attempt) : null;
  const completed = isActivityComplete(
    state,
    course.modules[state.level].activities[state.step].id,
  );
  const start = () => {
    setCursor(null);
    onChange((current) => startExam(current));
  };
  const next = () => {
    if (!attempt) return start();
    if (result) return completed ? onContinue() : start();
    if (!question || attempt.answers[question.id] === undefined) return;
    if (index < questions.length - 1)
      setCursor({ attemptId: attempt.id, index: index + 1 });
    else onChange((current) => submitExam(current));
  };
  return (
    <LessonFrame
      moduleNumber={state.level + 1}
      title={result ? 'Risultato della verifica' : 'Verifica'}
      current={result ? questions.length : Math.max(1, index + 1)}
      total={questions.length || exam.questionCount}
      type="exam"
      focusKey={`${attempt?.id || 'exam'}-${index}-${!!result}`}
      navigation={
        <LessonNavigation
          current={result ? questions.length : Math.max(1, index + 1)}
          total={questions.length || exam.questionCount}
          onBack={() => {
            if (attempt && !result && index > 0)
              setCursor({ attemptId: attempt.id, index: index - 1 });
            else onBack();
          }}
          onNext={next}
          disabled={
            !ready ||
            !!(
              attempt &&
              !result &&
              (!question || attempt.answers[question.id] === undefined)
            )
          }
          label={
            !attempt
              ? 'Inizia verifica'
              : result
                ? completed
                  ? 'Continua'
                  : 'Riprova'
                : index === questions.length - 1
                  ? 'Consegna'
                  : 'Continua'
          }
        />
      }
    >
      <section className="lp-quiz">
        <p className="lp-eyebrow">
          {result ? 'VERIFICA COMPLETATA' : 'SIMULAZIONE ESAME'}
        </p>
        {!attempt ? (
          <>
            <h1 tabIndex={-1}>Metti alla prova ciò che sai.</h1>
            <p className="lp-explanation">
              {exam.questionCount} domande, una alla volta. Le risposte restano
              salvate e le soluzioni compariranno dopo la consegna.
            </p>
            <TakeawayCard label="COME FUNZIONA">
              Nessun timer. Obiettivo: {exam.passPercent}% di risposte corrette.
            </TakeawayCard>
            <p className="lp-small-note">
              Simulazione di preparazione non ufficiale; non rilascia una
              certificazione Google.
            </p>
          </>
        ) : result ? (
          <>
            <h1 tabIndex={-1}>{result.percent}% di risposte corrette.</h1>
            <p className="lp-explanation">
              {result.correct} su {result.total}.{' '}
              {result.percent >= exam.passPercent
                ? 'Hai superato la verifica.'
                : 'Ripassa gli argomenti e riprova.'}
            </p>
            <div className="lp-exam-topics">
              {result.topics
                .filter((t) => t.weak)
                .map((topic) => (
                  <p key={topic.sourceModule}>
                    {topic.title}
                    <strong>
                      {topic.correct} / {topic.total}
                    </strong>
                  </p>
                ))}
            </div>
            <details className="lp-solutions">
              <summary>Rivedi risposte e spiegazioni</summary>
              {questions.map((q, n) => (
                <div key={q.id}>
                  <h3>
                    {n + 1}. {q.title}
                  </h3>
                  <p>La tua risposta: {q.options[attempt.answers[q.id]]}</p>
                  <p>
                    <strong>Risposta corretta:</strong> {q.options[q.correct]}
                  </p>
                  <p>{q.explanation}</p>
                </div>
              ))}
            </details>
            {completed && (
              <AcademyButton variant="ghost" onClick={start}>
                Riprova con un nuovo test
              </AcademyButton>
            )}
          </>
        ) : (
          question && (
            <>
              <h1 tabIndex={-1}>{question.title}</h1>
              <MultipleChoiceActivity
                title={question.title}
                options={question.options}
                value={attempt.answers[question.id]}
                onValue={(value) => {
                  setCursor({ attemptId: attempt.id, index });
                  onChange((current) =>
                    answerExam(current, question.id, value),
                  );
                }}
              />
              <p className="lp-small-note">
                Le soluzioni saranno visibili dopo la consegna.
              </p>
            </>
          )
        )}
      </section>
    </LessonFrame>
  );
}
export function LessonPlayer({
  state,
  ready,
  onChange,
  onNavigate,
  onCertificate,
}: {
  state: LearningState;
  ready: boolean;
  onChange: Change;
  onNavigate: (module: number, step?: number) => void;
  onCertificate: () => void;
}) {
  const { module, activity, ordered, position, current, total } =
    lessonPosition(state);
  const course = getCourse(state.courseId),
    kind = activityKind(activity);
  const done = isActivityComplete(state, activity.id),
    available = activityAvailable(state, state.level, activity);
  const valid = canCompleteActivity(state, state.level, activity);
  const signature = JSON.stringify(
    activity.question
      ? state.answers[activity.id]
      : state.responses[activity.id],
  );
  const [checked, setChecked] = useState<{
    id: string;
    signature: string;
    correct: boolean;
    xp: number;
    attempts: number;
    token: number;
  } | null>(null);
  const feedback =
    checked?.id === activity.id && checked.signature === signature
      ? checked
      : done && valid
        ? { correct: true, xp: 0, attempts: 0, token: 0 }
        : null;
  const attempts = useRef<Record<string, number>>({});
  const [direction, setDirection] = useState<'next' | 'back'>('next');
  const [pulse, setPulse] = useState<{
    id: string;
    xp: number;
    label: string;
  } | null>(null);
  const [pending, setPending] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const flow = useRef(
    createStepFlow({
      schedule: (run, delay) => setTimeout(run, delay),
      clear: (handle) => clearTimeout(handle as ReturnType<typeof setTimeout>),
    }),
  );
  const cancelFlow = () => {
    flow.current.cancel();
    setPending(false);
  };
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const cancel = () => {
      flow.current.cancel();
      setPending(false);
    };
    const update = () => {
      setReducedMotion(motion.matches);
      cancel();
    };
    update();
    motion.addEventListener('change', update);
    window.addEventListener('hashchange', cancel);
    window.addEventListener('blur', cancel);
    document.addEventListener('visibilitychange', cancel);
    return () => {
      flow.current.cancel();
      motion.removeEventListener('change', update);
      window.removeEventListener('hashchange', cancel);
      window.removeEventListener('blur', cancel);
      document.removeEventListener('visibilitychange', cancel);
    };
  }, []);
  useEffect(() => {
    flow.current.cancel();
    setPending(false);
    setPulse(null);
    return () => flow.current.cancel();
  }, [activity.id, state.courseId]);
  const scheduleAdvance = (delay: number) => {
    setPending(true);
    flow.current.schedule(activity.id, delay, () => {
      setPending(false);
      setDirection('next');
      onChange((value) => advanceLesson(value, state.level, activity.id));
    });
  };
  const isQuiz = !!activity.question || !!activity.interaction;
  const back = () => {
    cancelFlow();
    setDirection('back');
    const previous = ordered[position - 1];
    if (previous && activityAvailable(state, state.level, previous))
      onNavigate(state.level, module.activities.indexOf(previous));
    else window.location.hash = 'lessons';
  };
  const advance = () => {
    cancelFlow();
    setDirection('next');
    if (ready && available)
      onChange((current) => advanceLesson(current, state.level, activity.id));
  };
  const submit = (candidate: LearningState = state) => {
    if (!ready || !available) return;
    cancelFlow();
    const correct = canCompleteActivity(candidate, candidate.level, activity);
    const candidateSignature = JSON.stringify(
      activity.question
        ? candidate.answers[activity.id]
        : candidate.responses[activity.id],
    );
    if (!correct)
      attempts.current[activity.id] = (attempts.current[activity.id] || 0) + 1;
    const completed = correct
      ? completeActivity(candidate, candidate.level, activity.id)
      : candidate;
    setChecked({
      id: activity.id,
      signature: candidateSignature,
      correct,
      xp: score(completed) - score(state),
      attempts: attempts.current[activity.id] || 0,
      token: Date.now(),
    });
    onChange(completed);
    if (correct) {
      const explanation =
        activity.question?.why || activity.interaction?.explanation || '';
      const delay = quizFlowDelay(
        explanation,
        reducedMotion,
        (attempts.current[activity.id] || 0) >= 2,
      );
      if (delay !== null && !done) scheduleAdvance(delay);
    }
  };
  const next = () => {
    if (!ready || !available) return;
    if (flow.current.finish(activity.id)) return;
    if (isQuiz)
      return feedback?.correct
        ? advance()
        : activity.question
          ? undefined
          : submit();
    if (activity.type === 'unlock') {
      if (!done) {
        onChange((value) => completeActivity(value, state.level, activity.id));
        return;
      }
      if (state.level < course.modules.length - 1)
        onNavigate(state.level + 1, 0);
      else onCertificate();
    } else if (done) advance();
    else if (valid) {
      const completed = completeActivity(state, state.level, activity.id);
      onChange((value) => completeActivity(value, state.level, activity.id));
      setPulse({
        id: activity.id,
        xp: score(completed) - score(state),
        label:
          kind === 'slide'
            ? current === total
              ? 'Lezione completata'
              : 'Letto'
            : 'Attività completata',
      });
      scheduleAdvance(reducedMotion ? 200 : kind === 'slide' ? 400 : 650);
    }
  };
  const answered = activity.question
    ? state.answers[activity.id] !== undefined
    : activity.interaction
      ? !!state.responses[activity.id]?.length &&
        state.responses[activity.id].every(Boolean)
      : true;
  const lastSlide = kind === 'slide' && current === total;
  const label =
    kind === 'slide'
      ? lastSlide
        ? 'Continua alla verifica'
        : 'Continua'
      : isQuiz
        ? feedback?.correct
          ? 'Continua'
          : activity.question
            ? feedback
              ? 'Scegli un’altra risposta'
              : 'Scegli una risposta'
            : 'Completa le risposte'
        : activity.type === 'unlock'
          ? done
            ? state.level < course.modules.length - 1
              ? `Inizia modulo ${state.level + 2}`
              : 'Apri attestato'
            : 'Completa il modulo'
          : 'Continua';
  if (activity.type === 'exam')
    return (
      <ExamPlayer
        state={state}
        ready={ready && available}
        onChange={onChange}
        onBack={back}
        onContinue={advance}
      />
    );
  return (
    <LessonFrame
      moduleNumber={state.level + 1}
      title={
        kind === 'slide'
          ? module.title
          : activity.phase === 'verify'
            ? 'Verifica'
            : activity.phase === 'unlock'
              ? 'Completamento'
              : 'Attività pratica'
      }
      current={current}
      total={total}
      focusKey={activity.id}
      type={kind}
      direction={direction}
      progressValue={
        (100 *
          module.activities.filter((item) => isActivityComplete(state, item.id))
            .length) /
        module.activities.length
      }
      onInteraction={cancelFlow}
      journey={
        <div className="lp-course-journey" aria-label="Avanzamento del corso">
          <div>
            <strong>
              Modulo {state.level + 1} di {course.modules.length}
            </strong>
            <span>{state.completed.length} completati</span>
          </div>
          <ol>
            {course.modules.map((item, index) => (
              <li
                key={item.id}
                className={
                  state.completed.includes(index)
                    ? 'complete'
                    : index === state.level
                      ? 'current'
                      : ''
                }
                aria-current={index === state.level ? 'step' : undefined}
                aria-label={`Modulo ${index + 1}: ${item.title}, ${state.completed.includes(index) ? 'completato' : index === state.level ? 'in corso' : 'da completare'}`}
              >
                {state.completed.includes(index) ? (
                  <Check size={14} />
                ) : (
                  index + 1
                )}
              </li>
            ))}
          </ol>
          <p>
            {module.title} ·{' '}
            {Math.round(
              (100 *
                module.activities.filter((item) =>
                  isActivityComplete(state, item.id),
                ).length) /
                module.activities.length,
            )}
            % completato
          </p>
        </div>
      }
      pulse={
        pulse?.id === activity.id ? (
          <div className="lp-micro-reward" role="status">
            <Check size={18} />
            <span>{pulse.label}</span>
            {pulse.xp > 0 && <strong>+{pulse.xp} XP</strong>}
          </div>
        ) : undefined
      }
      onSwipe={
        kind === 'slide'
          ? (direction) => {
              if (direction === 'next') next();
              else if (position > 0) back();
            }
          : undefined
      }
      navigation={
        <LessonNavigation
          current={current}
          total={total}
          dots={kind === 'slide'}
          prompt={
            activity.question && !feedback?.correct
              ? feedback
                ? 'Tocca un’altra risposta'
                : 'Tocca una risposta'
              : undefined
          }
          onBack={back}
          onNext={next}
          label={label}
          disabled={
            !ready ||
            !available ||
            (isQuiz
              ? activity.question
                ? !feedback?.correct
                : !answered
              : !done && !valid)
          }
        />
      }
    >
      {!available ? (
        <section className="lp-quiz">
          <h1 tabIndex={-1}>Completa il passo precedente.</h1>
          <p className="lp-explanation">
            Torna ai moduli per riprendere dal punto disponibile.
          </p>
          <a href="#lessons" className="lp-return">
            Torna ai moduli <ArrowRight size={20} />
          </a>
        </section>
      ) : kind === 'slide' && activity.slide ? (
        <>
          {current === 1 && (
            <div className="lp-module-entry">
              <span>
                MODULO {state.level + 1} / {course.modules.length}
              </span>
              <strong>
                {state.completed.includes(state.level)
                  ? 'Ripassa questo modulo'
                  : state.level > 0
                    ? 'Un nuovo passo nel tuo percorso'
                    : 'Il tuo percorso comincia qui'}
              </strong>
              {state.level > 0 && (
                <p>
                  Hai completato {state.completed.length}{' '}
                  {state.completed.length === 1 ? 'modulo' : 'moduli'}. Ora:{' '}
                  {module.title}.
                </p>
              )}
            </div>
          )}
          <SlideRenderer
            slide={activity.slide}
            category={
              course.id === 'ai-basics'
                ? 'AI · IL METODO'
                : 'GOOGLE ADS · IL METODO'
            }
          />
        </>
      ) : (
        <section
          className={`lp-quiz ${activity.type === 'unlock' ? 'lp-completion' : ''}`}
        >
          <p className="lp-eyebrow">
            {isQuiz
              ? 'VERIFICA RAPIDA'
              : activity.type === 'unlock'
                ? 'IL TUO RISULTATO'
                : 'IN PRATICA'}
          </p>
          <h1 tabIndex={-1}>
            {activity.type === 'unlock'
              ? done
                ? `Modulo ${state.level + 1} completato!`
                : 'Hai raggiunto il traguardo.'
              : activity.question?.goal || activity.title}
          </h1>
          {!activity.question && activity.type !== 'unlock' && (
            <p className="lp-explanation">{activity.description}</p>
          )}
          {activity.question && (
            <MultipleChoiceActivity
              feedback={feedback?.correct}
              title={activity.question.goal}
              options={activity.question.options}
              value={state.answers[activity.id]}
              onValue={(value) => {
                submit({
                  ...state,
                  answers: { ...state.answers, [activity.id]: value },
                });
              }}
            />
          )}
          {activity.interaction && (
            <StructuredInteraction
              activity={activity}
              state={state}
              onChange={(value) => {
                cancelFlow();
                setChecked(null);
                const candidate =
                  typeof value === 'function' ? value(state) : value;
                const response = candidate.responses[activity.id];
                if (
                  response?.length === activity.interaction?.correct.length &&
                  response.every(Boolean)
                )
                  submit(candidate);
                else onChange(candidate);
              }}
              showFeedback={false}
            />
          )}
          {isQuiz && feedback && (
            <QuizFeedback key={feedback.token} correct={feedback.correct}>
              {activity.question
                ? feedback.correct
                  ? activity.question.why
                  : activity.question.hint
                : feedback.correct
                  ? activity.interaction?.explanation
                  : activity.interaction?.hint}
              {feedback.correct && feedback.xp > 0 && (
                <span className="lp-xp">+{feedback.xp} XP</span>
              )}
              {!feedback.correct && feedback.attempts >= 2 && (
                <span className="lp-solution">
                  <strong>La soluzione</strong>
                  {activity.question
                    ? activity.question.options[activity.question.correct]
                    : activity.interaction?.correct
                        .map(
                          (id) =>
                            [
                              ...(activity.interaction?.options || []),
                              ...(activity.interaction?.items || []),
                            ].find((item) => item.id === id)?.label || id,
                        )
                        .join(' → ')}
                  <br />
                  {activity.question?.why || activity.interaction?.explanation}
                </span>
              )}
              {pending && feedback.correct && (
                <button
                  type="button"
                  className="lp-read-feedback"
                  onClick={cancelFlow}
                >
                  Leggi con calma
                </button>
              )}
            </QuizFeedback>
          )}
          {(kind === 'textInput' || kind === 'checklist') && (
            <>
              <ActivityText
                activity={activity}
                state={state}
                onChange={onChange}
              />
              <details className="lp-reference">
                <summary>{course.reference.title}</summary>
                <p>{course.reference.text}</p>
              </details>
            </>
          )}
          {activity.type === 'unlock' && (
            <>
              <ModuleCompletion state={state} moduleIndex={state.level} />
              {done && (
                <div className="lp-next-module" role="status">
                  <span className="lp-module-seal">
                    <Check size={30} />
                  </span>
                  <div>
                    <p>
                      {state.completed.length} di {course.modules.length} moduli
                      completati
                    </p>
                    <strong>
                      {course.modules[state.level + 1]
                        ? `Sbloccato: modulo ${state.level + 2}`
                        : 'Percorso completato'}
                    </strong>
                    <p>
                      {course.modules[state.level + 1]?.title ||
                        'Il tuo attestato è pronto.'}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      )}
    </LessonFrame>
  );
}
