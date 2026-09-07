import type { Dispatch, SetStateAction } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { AcademyButton, AcademyCard } from './academy';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { getCourse } from '../app/courses';
import {
  startExam,
  answerExam,
  submitExam,
  examResult,
  type LearningState,
} from '../app/progress';
import type { Activity } from '../app/learning-model';
export function StructuredInteraction({
  activity,
  state,
  onChange,
}: {
  activity: Activity;
  state: LearningState;
  onChange: Dispatch<SetStateAction<LearningState>>;
}) {
  const interaction = activity.interaction!;
  const values =
    state.responses[activity.id] ||
    (activity.type === 'ordering'
      ? interaction.items.map((item) => item.id)
      : interaction.items.map(() => ''));
  const update = (values: string[]) =>
    onChange((current) => ({
      ...current,
      responses: { ...current.responses, [activity.id]: values },
    }));
  const correct = interaction.correct.every((id, i) => values[i] === id);
  const answered =
    activity.type === 'ordering'
      ? !!state.responses[activity.id]
      : values.every(Boolean);
  return (
    <div className="structured-interaction">
      {activity.type === 'matching' ? (
        interaction.items.map((item, i) => (
          <label key={item.id} className="matching-row">
            <strong>{item.label}</strong>
            <select
              aria-label={`Abbina ${item.label}`}
              value={values[i]}
              onChange={(event) =>
                update(
                  values.map((value, n) =>
                    n === i ? event.target.value : value,
                  ),
                )
              }
            >
              <option value="">Scegli la formula</option>
              {interaction.options?.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ))
      ) : (
        <ol className="ordering-list">
          {values.map((id, i) => (
            <li key={id}>
              <span>
                {interaction.items.find((item) => item.id === id)?.label}
              </span>
              <AcademyButton
                variant="icon"
                aria-label={`Sposta su ${interaction.items.find((item) => item.id === id)?.label}`}
                disabled={i === 0}
                onClick={() => {
                  const next = [...values];
                  [next[i - 1], next[i]] = [next[i], next[i - 1]];
                  update(next);
                }}
              >
                <ArrowUp size={18} />
              </AcademyButton>
              <AcademyButton
                variant="icon"
                aria-label={`Sposta giù ${interaction.items.find((item) => item.id === id)?.label}`}
                disabled={i === values.length - 1}
                onClick={() => {
                  const next = [...values];
                  [next[i + 1], next[i]] = [next[i], next[i + 1]];
                  update(next);
                }}
              >
                <ArrowDown size={18} />
              </AcademyButton>
            </li>
          ))}
        </ol>
      )}
      {answered && (
        <div
          className={`feedback ${correct ? 'success' : 'retry'}`}
          aria-live="polite"
        >
          <strong>
            {correct ? 'Corretto: ecco perché' : 'Rivedi la tua scelta'}
          </strong>
          <p>{correct ? interaction.explanation : interaction.hint}</p>
        </div>
      )}
    </div>
  );
}
export function ExamMode({
  state,
  onChange,
  onReview,
}: {
  state: LearningState;
  onChange: Dispatch<SetStateAction<LearningState>>;
  onReview: (module: number, step?: number) => void;
}) {
  const course = getCourse(state.courseId),
    exam = course.exam!,
    attempt = state.examAttempts.at(-1);
  if (!attempt)
    return (
      <AcademyCard className="exam-intro">
        <h2>Metti alla prova la preparazione</h2>
        <p>
          {exam.questionCount} domande originali, nessun timer. Le soluzioni
          compariranno soltanto dopo la consegna. Puoi interrompere e riprendere
          in questo browser.
        </p>
        <small>
          Simulazione AI Academy non ufficiale. La soglia dell’80% è un
          obiettivo di questo percorso, non un riconoscimento Google.
        </small>
        <AcademyButton
          onClick={() => onChange((current) => startExam(current))}
        >
          Inizia simulazione
        </AcademyButton>
      </AcademyCard>
    );
  const questions = attempt.questionIds.map((id) =>
    exam.questions.find((q) => q.id === id)!,
  );
  if (attempt.submittedAt) {
    const result = examResult(state, attempt),
      weak = result.topics.filter((t) => t.weak);
    return (
      <div className="exam-result">
        <AcademyCard
          tone={result.percent >= exam.passPercent ? 'success' : 'highlight'}
        >
          <strong className="progress-display">{result.percent}%</strong>
          <h2>
            {result.percent >= exam.passPercent
              ? 'Buona preparazione su questo test'
              : 'Consolida gli argomenti prima di riprovare'}
          </h2>
          <p>
            {result.correct}/{result.total} risposte corrette. Un campione breve
            non garantisce l’esito della certificazione ufficiale.
          </p>
          <h3>
            {weak.length
              ? 'Da ripassare'
              : 'Tutti gli argomenti del tentativo sono corretti'}
          </h3>
          {weak.map((topic) => (
            <div className="exam-topic" key={topic.sourceModule}>
              <span>
                {topic.title}: {topic.correct}/{topic.total}
              </span>
              <AcademyButton
                variant="ghost"
                onClick={() => onReview(topic.sourceModule)}
              >
                Ripassa {topic.title}
              </AcademyButton>
            </div>
          ))}
          <AcademyButton
            variant="secondary"
            onClick={() => onChange((current) => startExam(current))}
          >
            Riprova con un nuovo test
          </AcademyButton>
        </AcademyCard>
        <details className="exam-solutions">
          <summary>Rivedi risposte e spiegazioni</summary>
          {questions.map((q, i) => (
            <article key={q.id}>
              <h3>
                {i + 1}. {q.title}
              </h3>
              <p>La tua risposta: {q.options[attempt.answers[q.id]]}</p>
              <strong>
                {attempt.answers[q.id] === q.correct
                  ? 'Corretta'
                  : 'Da rivedere'}{' '}
                · Risposta: {q.options[q.correct]}
              </strong>
              <p>{q.explanation}</p>
            </article>
          ))}
        </details>
      </div>
    );
  }
  const answered = questions.filter(
    (q) => attempt.answers[q.id] !== undefined,
  ).length;
  return (
    <div className="exam-running">
      <p className="exam-status">
        {answered}/{questions.length} risposte selezionate · Tentativo salvato
        in questo browser
      </p>
      {questions.map((q, i) => (
        <fieldset className="exam-question" key={q.id}>
          <legend>
            {i + 1}. {q.title}
          </legend>
          <RadioGroup
            aria-label={`Domanda ${i + 1}`}
            value={
              attempt.answers[q.id] === undefined
                ? ''
                : String(attempt.answers[q.id])
            }
            onValueChange={(value) =>
              onChange((current) => answerExam(current, q.id, Number(value)))
            }
          >
            {q.options.map((option, n) => (
              <label key={option}>
                <RadioGroupItem value={String(n)} />
                <span>{option}</span>
              </label>
            ))}
          </RadioGroup>
        </fieldset>
      ))}
      <AcademyButton
        disabled={answered !== questions.length}
        onClick={() => onChange((current) => submitExam(current))}
      >
        Consegna e vedi il risultato
      </AcademyButton>
      <p className="micro-note">
        Nessuna risposta corretta viene mostrata durante il tentativo.
      </p>
    </div>
  );
}
