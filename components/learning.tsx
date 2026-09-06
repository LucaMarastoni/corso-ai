import {
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { ArrowLeft, ArrowRight, Check, Lock } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';
import { Progress } from './ui/progress';
import {
  AcademyButton,
  AcademyCard,
  SectionHeader,
  LessonBlock,
  InsightCard,
  BadgeTile,
  StreakCard,
} from './academy';
import {
  PHASES,
  courseModules,
  competencyDefinitions,
  COURSE_ACTIVITY_COUNT,
  type Activity,
} from '../app/learning-model';
import { learningLevel } from '../app/learning-config';
import { achievements, type Achievement } from '../app/achievements';
import {
  type LearningState,
  activeStreak,
  score,
  completionPercent,
  completedActivityCount,
  isActivityComplete,
  phaseComplete,
  activityAvailable,
  canCompleteActivity,
  completeActivity,
  setDraft,
} from '../app/progress';
export function CompetencyList({ state }: { state: LearningState }) {
  const acquired = competencyDefinitions.filter((item) =>
    Object.hasOwn(state.competencyAwards, item.id),
  );
  return (
    <section className="competency-list" aria-label="Competenze acquisite">
      <SectionHeader title="Competenze acquisite" />
      {acquired.length ? (
        acquired.map((item) => {
          const award = state.competencyAwards[item.id];
          return (
            <article className="competency" key={item.id}>
              <Check size={20} />
              <div>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <small>
                  Modulo {item.sourceModule + 1} ·{' '}
                  {courseModules[item.sourceModule].title}
                </small>
                <small>
                  {award.acquiredAt
                    ? `Acquisita il ${new Date(award.acquiredAt).toLocaleDateString('it-IT')}`
                    : 'Riconosciuta dal percorso precedente'}
                </small>
                <details>
                  <summary>Evidenza dell’apprendimento</summary>
                  <p>{award.evidence}</p>
                </details>
              </div>
            </article>
          );
        })
      ) : (
        <div className="competency-empty">
          <h3>Stai costruendo la tua prima competenza</h3>
          <p>
            Completa il primo modulo per acquisire{' '}
            <strong>Prompting fondamentale</strong>. La pratica e il laboratorio
            saranno le tue evidenze.
          </p>
        </div>
      )}
    </section>
  );
}
export function LevelCard({ xp }: { xp: number }) {
  const { current, next, remaining, progress } = learningLevel(xp);
  return (
    <AcademyCard className="level-card">
      <small className="eyebrow">LIVELLO {current.level}</small>
      <h2>{current.name}</h2>
      <div className="level-xp">
        <strong>{xp} XP totali</strong>
        <span>
          {next ? `Soglia successiva: ${next.minXp} XP` : 'Livello massimo'}
        </span>
      </div>
      <Progress value={progress} aria-label="Avanzamento nel livello" />
      <p>
        {next
          ? `${remaining} XP al livello ${next.level} · ${next.name}`
          : 'Hai raggiunto il livello più alto. Continua ad applicare il tuo metodo.'}
      </p>
    </AcademyCard>
  );
}
export function AchievementGrid({
  state,
  onSelect,
}: {
  state: LearningState;
  onSelect: (item: Achievement) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <section className="achievement-collection">
      <SectionHeader title="Achievement" />
      <div className="academy-badges">
        {achievements
          .slice(0, expanded ? achievements.length : 3)
          .map((item) => (
            <BadgeTile
              key={item.id}
              item={item}
              state={state}
              onSelect={onSelect}
            />
          ))}
      </div>
      <AcademyButton
        variant="ghost"
        aria-expanded={expanded}
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? 'Mostra meno' : 'Vedi tutti gli achievement'}
        <ArrowRight size={16} />
      </AcademyButton>
    </section>
  );
}
export function NextMilestone({ state }: { state: LearningState }) {
  const pending = courseModules.findIndex(
    (item) => !isActivityComplete(state, `${item.id}:unlock`),
  );
  const next = achievements.find((item) => !item.earned(state));
  if (pending < 0 && !next)
    return (
      <AcademyCard tone="success">
        <h2>Tutti i traguardi raggiunti</h2>
        <p>Il tuo prossimo passo è applicare le competenze nel lavoro.</p>
      </AcademyCard>
    );
  const targetModule = pending >= 0 ? courseModules[pending] : null;
  const moduleAchievement = targetModule
    ? achievements.find(
        (item) => item.id === targetModule.achievementId && !item.earned(state),
      )
    : null;
  const name = targetModule
    ? moduleAchievement?.name || competencyDefinitions[pending].name
    : next!.name;
  const total = targetModule
    ? targetModule.activities.filter((a) => a.phase !== 'unlock').length
    : 3;
  const done = targetModule
    ? targetModule.activities.filter(
        (a) => a.phase !== 'unlock' && isActivityComplete(state, a.id),
      ).length
    : Math.min(total, activeStreak(state));
  return (
    <AcademyCard tone="highlight">
      <small className="eyebrow">PROSSIMO TRAGUARDO</small>
      <h2>{name}</h2>
      <p>
        {targetModule
          ? `Completa il Modulo ${pending + 1} · ${targetModule.title}.`
          : next!.criterion}
      </p>
      <small>
        {done}/{total}{' '}
        {targetModule ? 'attività completate' : 'giorni di pratica consecutivi'}
      </small>
      <Progress
        value={(done / total) * 100}
        aria-label={`Avanzamento verso ${name}`}
      />
      {targetModule && done === total && (
        <small>Le attività sono complete: conferma lo step Sblocca.</small>
      )}
    </AcademyCard>
  );
}
export function LearningCertificateCard({
  state,
  onOpen,
  onDownload,
}: {
  state: LearningState;
  onOpen: () => void;
  onDownload: () => void;
}) {
  const remaining =
    competencyDefinitions.length - Object.keys(state.competencyAwards).length;
  return (
    <AcademyCard tone="reward">
      <small className="eyebrow">
        {state.certificateId ? 'ATTESTATO OTTENUTO' : 'OBIETTIVO FINALE'}
      </small>
      <h2>Attestato di partecipazione</h2>
      {state.certificateId ? (
        <>
          <p>
            {state.completionDate &&
              new Date(`${state.completionDate}T12:00:00`).toLocaleDateString(
                'it-IT',
              )}
          </p>
          <div className="certificate-actions">
            <AcademyButton variant="secondary" onClick={onOpen}>
              Visualizza
            </AcademyButton>
            <AcademyButton variant="ghost" onClick={onDownload}>
              Scarica PNG
            </AcademyButton>
          </div>
        </>
      ) : (
        <>
          <p>Completa tutti i moduli per ottenere l’attestato.</p>
          <small>
            {remaining
              ? `${remaining} competenze ancora da acquisire`
              : 'Competenze completate: aggiungi il nome per emettere l’attestato.'}
          </small>
          {!remaining && (
            <AcademyButton variant="secondary" onClick={onOpen}>
              Prepara attestato
            </AcademyButton>
          )}
        </>
      )}
    </AcademyCard>
  );
}
export function ProgressProfile({
  state,
  onContinue,
  onAchievement,
  onCertificate,
  onDownloadCertificate,
}: {
  state: LearningState;
  onContinue: () => void;
  onAchievement: (item: Achievement) => void;
  onCertificate: () => void;
  onDownloadCertificate: () => void;
}) {
  const completion = completionPercent(state);
  return (
    <div className="progress-profile">
      <header>
        <h1>I tuoi progressi</h1>
        <p>Le competenze che stai costruendo nel tuo percorso.</p>
      </header>
      <AcademyCard className="progress-overview">
        <h2>Basi di Intelligenza Artificiale</h2>
        <strong className="progress-display">
          {completion}
          <span>%</span>
        </strong>
        <p>completato</p>
        <Progress value={completion} aria-label="Completamento del corso" />
        <div className="overview-metrics">
          <div>
            <strong>
              {state.completed.length}/{courseModules.length}
            </strong>
            <span>Moduli</span>
          </div>
          <div>
            <strong>
              {completedActivityCount(state)}/{COURSE_ACTIVITY_COUNT}
            </strong>
            <span>Attività</span>
          </div>
        </div>
        <AcademyButton onClick={onContinue}>
          {completion === 100 ? 'Ripassa il corso' : 'Continua il corso'}
          <ArrowRight size={18} />
        </AcademyButton>
      </AcademyCard>
      <LevelCard xp={score(state)} />
      <CompetencyList state={state} />
      <NextMilestone state={state} />
      <AchievementGrid state={state} onSelect={onAchievement} />
      <StreakCard days={activeStreak(state)} />
      <LearningCertificateCard
        state={state}
        onOpen={onCertificate}
        onDownload={onDownloadCertificate}
      />
    </div>
  );
}
export function LearningPhaseHeader({
  state,
  moduleIndex,
}: {
  state: LearningState;
  moduleIndex: number;
}) {
  const courseModule = courseModules[moduleIndex],
    activity = courseModule.activities[state.step];
  const phase = courseModule.phases.find((p) => p.id === activity.phase)!;
  return (
    <header className="learning-phase-header">
      <span className="eyebrow">
        MODULO {moduleIndex + 1} · {courseModule.title}
      </span>
      <h2>{phase.name}</h2>
      <p>{phase.purpose}</p>
      <small>
        {phase.activities.filter((a) => isActivityComplete(state, a.id)).length}
        /{phase.activities.length} attività completate in questa fase
      </small>
    </header>
  );
}
function ActivityText({
  activity,
  state,
  onChange,
}: {
  activity: Activity;
  state: LearningState;
  onChange: Dispatch<SetStateAction<LearningState>>;
}) {
  const checklist = activity.completionRule.checklist || [];
  return (
    <div className="activity-text">
      <label htmlFor={`draft-${activity.id}`}>
        Il tuo {activity.type === 'scenario' ? 'elaborato' : 'primo tentativo'}
      </label>
      <textarea
        id={`draft-${activity.id}`}
        value={state.drafts[activity.id] || ''}
        maxLength={20000}
        rows={6}
        onChange={(event) =>
          onChange((current) =>
            setDraft(current, activity.id, event.target.value),
          )
        }
      />
      <p className="micro-note">
        Controllo locale: almeno {activity.completionRule.minLength} caratteri e
        conferma della checklist. Non è una valutazione AI del contenuto.
      </p>
      <div className="self-check">
        {checklist.map((text, i) => (
          <label key={text}>
            <Checkbox
              checked={(state.activityChecks[activity.id] || []).includes(i)}
              onCheckedChange={(checked) =>
                onChange((current) => ({
                  ...current,
                  activityChecks: {
                    ...current.activityChecks,
                    [activity.id]: checked
                      ? [
                          ...new Set([
                            ...(current.activityChecks[activity.id] || []),
                            i,
                          ]),
                        ]
                      : (current.activityChecks[activity.id] || []).filter(
                          (index) => index !== i,
                        ),
                  },
                }))
              }
            />
            <span>{text}</span>
          </label>
        ))}
      </div>
      {activity.model && (
        <details className="model-example">
          <summary>Confronta un esempio di soluzione</summary>
          <p>{activity.model}</p>
        </details>
      )}
    </div>
  );
}
export function ModuleCompletion({
  state,
  moduleIndex,
}: {
  state: LearningState;
  moduleIndex: number;
}) {
  const courseModule = courseModules[moduleIndex],
    competency = competencyDefinitions[moduleIndex];
  const earned = courseModule.activities.reduce(
    (sum, activity) => sum + (state.completedActivities[activity.id]?.xp || 0),
    0,
  );
  const achievement = achievements.find(
    (item) => item.id === courseModule.achievementId,
  );
  const done = phaseComplete(state, moduleIndex, 'unlock');
  return (
    <AcademyCard
      tone={done ? 'success' : 'highlight'}
      className="module-completion"
    >
      <small className="eyebrow">
        {done ? 'MODULO COMPLETATO' : 'PRONTO A SBLOCCARE'}
      </small>
      <h2>{courseModule.title}</h2>
      <p>
        {done
          ? `${earned} XP ottenuti nel modulo`
          : `Bonus completamento: +${courseModule.xpReward} XP`}
      </p>
      <div>
        <small>COMPETENZA {done ? 'ACQUISITA' : 'IN ARRIVO'}</small>
        <h3>{competency.name}</h3>
        <p>{competency.description}</p>
      </div>
      {achievement && (
        <div>
          <small>ACHIEVEMENT {done ? 'SBLOCCATO' : 'IN ARRIVO'}</small>
          <strong>{achievement.name}</strong>
        </div>
      )}
      <small>
        {state.completed.length}/{courseModules.length} moduli completati
      </small>
    </AcademyCard>
  );
}
export function LearningExperience({
  state,
  ready,
  onChange,
  onNavigate,
  onCertificate,
  audio,
}: {
  state: LearningState;
  ready: boolean;
  onChange: Dispatch<SetStateAction<LearningState>>;
  onNavigate: (module: number, step?: number) => void;
  onCertificate: () => void;
  audio: ReactNode;
}) {
  const [reward, setReward] = useState<{ id: string; xp: number } | null>(null);
  const n = state.level,
    courseModule = courseModules[n],
    activity = courseModule.activities[state.step];
  const done = isActivityComplete(state, activity.id),
    available = activityAvailable(state, n, activity);
  const completion = state.completedActivities[activity.id];
  const finish = () => {
    const next = completeActivity(state, n, activity.id);
    setReward({ id: activity.id, xp: score(next) - score(state) });
    onChange((current) => completeActivity(current, n, activity.id));
  };
  const nextIndex = Math.min(
    courseModule.activities.length - 1,
    state.step + 1,
  );
  return (
    <article className="lesson-panel learning-experience">
      <nav className="learning-phases" aria-label="Fasi del modulo">
        {courseModule.phases.map((phase, i) => (
          <button
            key={phase.id}
            aria-current={phase.id === activity.phase ? 'step' : undefined}
            disabled={
              !ready || !activityAvailable(state, n, phase.activities[0])
            }
            onClick={() =>
              onNavigate(
                n,
                courseModule.activities.indexOf(
                  phase.activities.find(
                    (a) => !isActivityComplete(state, a.id),
                  ) || phase.activities[0],
                ),
              )
            }
          >
            <span>
              {phaseComplete(state, n, phase.id) ? <Check size={16} /> : i + 1}
            </span>
            {phase.name}
          </button>
        ))}
      </nav>
      <LearningPhaseHeader state={state} moduleIndex={n} />
      <div className="activity learning-activity">
        <h1 tabIndex={-1}>{activity.title}</h1>
        {activity.type !== 'microLesson' && activity.type !== 'unlock' && (
          <p className="scenario">{activity.description}</p>
        )}
        {available ? (
          <>
            {activity.slide && (
              <>
                <div className="slide-steps">
                  {activity.slide.steps.map((text, i) => (
                    <LessonBlock key={text} number={i + 1} speaking={false}>
                      {text}
                    </LessonBlock>
                  ))}
                </div>
                <InsightCard speaking={false}>
                  {activity.slide.takeaway}
                </InsightCard>
                {audio}
                <p className="micro-note">
                  Conferma di aver letto e compreso il concetto prima di
                  continuare. Non basta aprire questa pagina.
                </p>
              </>
            )}
            {(activity.type === 'textInput' ||
              activity.type === 'scenario') && (
              <ActivityText
                activity={activity}
                state={state}
                onChange={onChange}
              />
            )}
            {activity.question && (
              <>
                <RadioGroup
                  className="prompt-options"
                  value={
                    state.answers[activity.id] === undefined
                      ? ''
                      : String(state.answers[activity.id])
                  }
                  onValueChange={(value) =>
                    onChange((current) => ({
                      ...current,
                      answers: {
                        ...current.answers,
                        [activity.id]: Number(value),
                      },
                    }))
                  }
                  aria-label="Scegli il prompt più adatto"
                >
                  {activity.question.options.map((text, i) => (
                    <label
                      key={text}
                      className={`prompt-card ${state.answers[activity.id] === i ? 'chosen' : ''}`}
                    >
                      <div className="prompt-top">
                        <strong>PROMPT {String.fromCharCode(65 + i)}</strong>
                        <RadioGroupItem value={String(i)} />
                      </div>
                      <p>{text}</p>
                    </label>
                  ))}
                </RadioGroup>
                {state.answers[activity.id] !== undefined && (
                  <div
                    className={`feedback ${state.answers[activity.id] === activity.question.correct ? 'success' : 'retry'}`}
                    aria-live="polite"
                  >
                    <strong>
                      {state.answers[activity.id] === activity.question.correct
                        ? 'Scelta corretta: ecco perché'
                        : 'Riconsidera la scelta'}
                    </strong>
                    <p>
                      {state.answers[activity.id] === activity.question.correct
                        ? activity.question.why
                        : activity.question.hint}
                    </p>
                  </div>
                )}
              </>
            )}
            {activity.type === 'unlock' && (
              <ModuleCompletion state={state} moduleIndex={n} />
            )}
          </>
        ) : (
          <p>
            <Lock size={18} />
            Completa le fasi precedenti per accedere.
          </p>
        )}
        {done && (
          <p className="activity-completed">
            <Check size={16} />
            {completion?.source === 'exemption'
              ? 'Riconosciuta dal percorso precedente: nuova pratica non svolta.'
              : 'Attività completata. Puoi ripassare senza duplicare gli XP.'}
          </p>
        )}
        {done && activity.type !== 'unlock' && (
          <AcademyButton
            variant="ghost"
            disabled={!canCompleteActivity(state, n, activity)}
            onClick={finish}
          >
            Conferma il ripasso
          </AcademyButton>
        )}
        <output className="xp-reward" aria-live="polite">
          {reward?.id === activity.id
            ? reward.xp > 0
              ? `+${reward.xp} XP · ${activity.type === 'unlock' ? 'Modulo completato' : 'Attività completata'}`
              : 'Ripasso confermato · XP già assegnati'
            : ''}
        </output>
      </div>
      <footer className="activity-footer">
        <AcademyButton
          variant="ghost"
          disabled={!ready || state.step === 0}
          onClick={() => onNavigate(n, state.step - 1)}
        >
          <ArrowLeft size={16} />
          Indietro
        </AcademyButton>
        {!done ? (
          <AcademyButton
            disabled={!ready || !canCompleteActivity(state, n, activity)}
            onClick={finish}
          >
            {activity.type === 'microLesson'
              ? 'Ho letto e compreso'
              : activity.type === 'unlock'
                ? 'Sblocca il risultato'
                : activity.type === 'textInput'
                  ? 'Conferma la pratica'
                  : activity.type === 'comparison'
                    ? 'Conferma la verifica'
                    : 'Completa l’applicazione'}
          </AcademyButton>
        ) : activity.type !== 'unlock' ? (
          <AcademyButton onClick={() => onNavigate(n, nextIndex)}>
            Continua
            <ArrowRight size={18} />
          </AcademyButton>
        ) : n < courseModules.length - 1 ? (
          <AcademyButton onClick={() => onNavigate(n + 1)}>
            Vai al Modulo {n + 2}
            <ArrowRight size={18} />
          </AcademyButton>
        ) : (
          <AcademyButton onClick={onCertificate}>
            Prepara il tuo attestato
            <ArrowRight size={18} />
          </AcademyButton>
        )}
      </footer>
      <nav className="step-nav" aria-label="Attività della fase">
        {courseModule.activities
          .filter((a) => a.phase === activity.phase)
          .map((item, i) => (
            <button
              key={item.id}
              disabled={!ready || !activityAvailable(state, n, item)}
              aria-current={item.id === activity.id ? 'step' : undefined}
              aria-label={`${PHASES.find((p) => p.id === activity.phase)!.name}, attività ${i + 1}`}
              onClick={() =>
                onNavigate(n, courseModule.activities.indexOf(item))
              }
            >
              {isActivityComplete(state, item.id) ? <Check size={16} /> : i + 1}
            </button>
          ))}
      </nav>
      <details className="reference lesson-reference">
        <summary>Il brief di Officina Pedale</summary>
        <p>
          Attività inventata. Ripara bici urbane, esegue manutenzione freni,
          sostituisce camere d’aria. Appuntamenti tramite modulo di contatto.
          Prezzi, orari, indirizzo e tempi non disponibili.
        </p>
      </details>
    </article>
  );
}
