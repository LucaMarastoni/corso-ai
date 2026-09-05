'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import type { CSSProperties } from 'react';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Lock,
  Volume2,
  Pause,
  Play,
  Square,
  Star,
  Trophy,
  BookOpen,
  Lightbulb,
  Flag,
  Download,
  Sparkles,
  Flame,
  Award,
  Target,
  Clock3,
  Layers3,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { levels } from './journey';
import {
  initialState,
  score,
  unlock,
  award,
  canFinish,
  complete,
  restore,
  keyFor,
  type LearningState,
  completionPercent,
  touchStudy,
} from './progress';
const STORE = 'ai-course-journey-v2';
const levelOutcomes = [
  'Riconosci dove l’AI può aiutarti e dove serve ancora il tuo giudizio.',
  'Trasforma un’idea vaga in una consegna chiara e verificabile.',
  'Correggi una prima bozza con feedback precisi e utilizzabili.',
  'Individua fatti inventati, promesse fragili e dati da verificare.',
  'Lavora con esempi realistici senza esporre informazioni sensibili.',
  'Consegna un kit di contenuti completo, coerente e controllato.',
];
export default function Home() {
  const [state, setState] = useState<LearningState>(initialState),
    [ready, setReady] = useState(false),
    [storage, setStorage] = useState(true);
  const [choice, setChoice] = useState(''),
    [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null),
    [hint, setHint] = useState(false),
    [solution, setSolution] = useState(false),
    [celebrate, setCelebrate] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]),
    [voice, setVoice] = useState(''),
    [audioState, setAudioState] = useState<'idle' | 'playing' | 'paused'>(
      'idle',
    ),
    [audioError, setAudioError] = useState(''),
    [supported, setSupported] = useState(false),
    [segment, setSegment] = useState(-1);
  const startWatch = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRun = useRef(0),
    utterance = useRef<SpeechSynthesisUtterance | null>(null),
    heading = useRef<HTMLHeadingElement>(null),
    navTriggered = useRef(false);
  const l = state.level,
    step = state.step,
    level = levels[l],
    xp = score(state),
    slide = step < 3 ? level.slides[step] : null,
    challenge = step >= 3 && step < 6 ? level.challenges[step - 3] : null,
    id = keyFor(l, step - 3),
    solved = state.solved.includes(id),
    finished = state.completed.length === 6;
  const stop = useCallback(() => {
    audioRun.current++;
    if (startWatch.current) clearTimeout(startWatch.current);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window)
      window.speechSynthesis.cancel();
    utterance.current = null;
    setAudioState('idle');
    setSegment(-1);
  }, []);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE);
      const today = new Date().toLocaleDateString('en-CA');
      setState(touchStudy(raw ? restore(raw) : initialState, today));
    } catch {
      setStorage(false);
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORE, JSON.stringify(state));
    } catch {
      setStorage(false);
    }
  }, [state, ready]);
  useEffect(() => {
    const ok =
      'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
    setSupported(ok);
    if (!ok) return;
    const update = () =>
      setVoices(
        window.speechSynthesis
          .getVoices()
          .filter((v) => v.lang.toLowerCase().startsWith('it')),
      );
    update();
    window.speechSynthesis.addEventListener('voiceschanged', update);
    return () => {
      audioRun.current++;
      if (startWatch.current) clearTimeout(startWatch.current);
      window.speechSynthesis.cancel();
      window.speechSynthesis.removeEventListener('voiceschanged', update);
    };
  }, []);
  useEffect(() => {
    stop();
    setAudioError('');
    setChoice('');
    setFeedback(null);
    setHint(false);
    setSolution(false);
    setCelebrate(false);
    if (ready && step < 3)
      setState((s) => ({
        ...s,
        seen: [...new Set([...s.seen, keyFor(l, step)])],
      }));
    if (navTriggered.current) {
      heading.current?.focus();
      navTriggered.current = false;
    }
  }, [l, step, ready, stop]);
  const stateRef = useRef(state);
  stateRef.current = state;
  useEffect(() => {
    const context = (
      document as unknown as {
        modelContext?: {
          registerTool: (tool: unknown, options: unknown) => unknown;
        };
      }
    ).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      Promise.resolve(
        context.registerTool(
          {
            name: 'read_course_progress',
            description:
              'Read local course points, current level and completed activities. Does not complete or grade activities.',
            inputSchema: {
              type: 'object',
              properties: {},
              additionalProperties: false,
            },
            annotations: { readOnlyHint: true },
            execute: (input: unknown) => {
              if (
                !input ||
                typeof input !== 'object' ||
                Array.isArray(input) ||
                Object.keys(input).length
              )
                throw new Error('Expected an empty object');
              const s = stateRef.current;
              return {
                level: s.level + 1,
                step: s.step + 1,
                points: score(s),
                completedLevels: s.completed.map((n) => n + 1),
              };
            },
          },
          { signal: lifecycle.signal },
        ),
      ).catch(() => {});
    } catch {}
    return () => lifecycle.abort();
  }, []);
  function navigate(levelIndex: number, nextStep = 0) {
    if (!ready || levelIndex > unlock(state)) return;
    stop();
    navTriggered.current = true;
    setState((s) => ({ ...s, level: levelIndex, step: nextStep }));
  }
  function listen() {
    if (!slide || !supported) return;
    if (audioState === 'playing') {
      window.speechSynthesis.pause();
      setAudioState('paused');
      return;
    }
    if (audioState === 'paused') {
      window.speechSynthesis.resume();
      setAudioState('playing');
      return;
    }
    stop();
    setAudioError('');
    const run = audioRun.current;
    const parts = [slide.title, ...slide.steps, slide.takeaway];
    const italian = voices.find((v) => v.voiceURI === voice) || voices[0];
    if (!italian) {
      setAudioError(
        'Non è disponibile una voce italiana. Attivane una nelle impostazioni vocali del dispositivo oppure continua con il testo completo qui sotto.',
      );
      return;
    }
    const say = (i: number) => {
      if (run !== audioRun.current) return;
      if (i >= parts.length) {
        setAudioState('idle');
        setSegment(-1);
        return;
      }
      const u = new SpeechSynthesisUtterance(parts[i]);
      utterance.current = u;
      u.lang = 'it-IT';
      u.voice = italian;
      u.rate = 0.94;
      u.onstart = () => {
        if (startWatch.current) clearTimeout(startWatch.current);
        if (run === audioRun.current) {
          setSegment(i);
          setAudioState('playing');
        }
      };
      u.onend = () => {
        if (startWatch.current) clearTimeout(startWatch.current);
        say(i + 1);
      };
      u.onerror = () => {
        if (startWatch.current) clearTimeout(startWatch.current);
        if (run === audioRun.current) {
          setAudioState('idle');
          setSegment(-1);
          setAudioError(
            'La lettura non è partita o si è interrotta. Puoi riprovare o leggere la slide.',
          );
        }
      };
      startWatch.current = setTimeout(() => {
        if (run === audioRun.current) {
          stop();
          setAudioError(
            'La voce non risponde. Riprova con un’altra voce o continua con il testo.',
          );
        }
      }, 8000);
      window.speechSynthesis.speak(u);
    };
    setAudioState('playing');
    say(0);
  }
  function verify() {
    if (!challenge || !choice || solved) return;
    const correct = Number(choice) === challenge.correct;
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) setState((s) => award(s, id));
  }
  function download() {
    const text = levels
      .map(
        (x, n) =>
          `LIVELLO ${n + 1}: ${x.title}\n${x.lab}\n\nIL MIO LAVORO\n${state.notes[n] || '(non ancora svolto)'}`,
      )
      .join('\n\n---\n\n');
    const u = URL.createObjectURL(
      new Blob([text], { type: 'text/plain;charset=utf-8' }),
    );
    const a = document.createElement('a');
    a.href = u;
    a.download = 'il-mio-percorso-ai.txt';
    a.click();
    setTimeout(() => URL.revokeObjectURL(u), 1000);
  }
  const unlocked = unlock(state);
  const completion = completionPercent(state);
  const activityDone =
    state.seen.length + state.solved.length + state.completed.length;
  const achievements = [
    {
      name: 'Primo segnale',
      detail: 'Risolvi la prima sfida',
      earned: state.solved.length >= 1,
      icon: Zap,
    },
    {
      name: 'Metodo in azione',
      detail: 'Completa il primo livello',
      earned: state.completed.length >= 1,
      icon: Target,
    },
    {
      name: 'Occhio critico',
      detail: 'Risolvi 9 confronti',
      earned: state.solved.length >= 9,
      icon: ShieldCheck,
    },
    {
      name: 'Percorso completo',
      detail: 'Conquista tutti i livelli',
      earned: finished,
      icon: Trophy,
    },
  ];
  const earnedCount = achievements.filter((item) => item.earned).length;
  const nextMilestone = achievements.find((item) => !item.earned);
  return (
    <>
      <header className="topbar">
        <a className="brand" href="/">
          <span className="brand-mark">ai.</span>
          <span>
            primo passo<small>LA SCUOLA DEL FARE</small>
          </span>
        </a>
        <div className="scoreboard">
          <span className="metric-pill xp-pill">
            <Star size={17} fill="currentColor" /> {xp} <small>XP</small>
          </span>
          <span
            className="metric-pill streak-pill"
            title="Giorni consecutivi di studio"
          >
            <Flame size={17} /> {state.streakDays}{' '}
            <small>{state.streakDays === 1 ? 'giorno' : 'giorni'}</small>
          </span>
        </div>
        <a className="download-link" href="/materiali/dispensa.md" download>
          <BookOpen size={18} />
          <span>Dispensa</span>
        </a>
      </header>
      <div className="course-shell">
        <section className="course-card" aria-labelledby="course-title">
          <div className="course-card-main">
            <div className="course-index">01</div>
            <div>
              <p className="eyebrow">CORSO PROFESSIONALE · LIVELLO BASE</p>
              <h1 id="course-title">Basi di Intelligenza Artificiale</h1>
              <p className="course-promise">
                Comprendi come ragiona un assistente AI, scrivi prompt efficaci
                e verifica le risposte prima di usarle nel lavoro.
              </p>
              <div className="course-meta">
                <span>
                  <Clock3 size={16} /> 60 minuti
                </span>
                <span>
                  <Layers3 size={16} /> 6 moduli
                </span>
                <span>
                  <Award size={16} /> {earnedCount}/4 badge
                </span>
              </div>
            </div>
          </div>
          <div className="course-progress-card">
            <div
              className="completion-ring"
              style={
                { '--completion': `${completion * 3.6}deg` } as CSSProperties
              }
            >
              <div>
                <strong>{completion}%</strong>
                <span>completato</span>
              </div>
            </div>
            <div className="progress-copy">
              <span>AVANZAMENTO DEL CORSO</span>
              <strong>{activityDone} di 42 attività</strong>
              <Progress
                value={completion}
                aria-label="Completamento del corso"
              />
              <small>
                {finished
                  ? 'Percorso completato'
                  : `Continua dal modulo ${l + 1}`}
              </small>
            </div>
          </div>
        </section>
        <div className="section-heading">
          <div>
            <p className="eyebrow">PERCORSO FORMATIVO</p>
            <h2>I moduli del corso</h2>
          </div>
          <p>Completa ogni modulo per sbloccare il successivo.</p>
        </div>
        <nav className="level-map" aria-label="Livelli del corso">
          {levels.map((x, n) => (
            <button
              key={x.title}
              className={`level-node ${n === l ? 'active' : ''} ${state.completed.includes(n) ? 'done' : ''}`}
              disabled={!ready || n > unlocked}
              aria-current={n === l ? 'step' : undefined}
              onClick={() => navigate(n)}
            >
              <span className="module-card-top">
                <span className="node-number">
                  {state.completed.includes(n) ? (
                    <Check size={18} />
                  ) : n > unlocked ? (
                    <Lock size={16} />
                  ) : (
                    String(n + 1).padStart(2, '0')
                  )}
                </span>
                <span className="module-status">
                  {state.completed.includes(n)
                    ? 'COMPLETATO'
                    : n > unlocked
                      ? 'BLOCCATO'
                      : n === l
                        ? 'IN CORSO'
                        : 'DISPONIBILE'}
                </span>
              </span>
              <span className="node-label">{x.title}</span>
              <span className="node-outcome">{levelOutcomes[n]}</span>
              <span className="module-foot">
                <span>7 attività</span>
                <span>
                  {state.completed.includes(n)
                    ? '100%'
                    : n === l
                      ? `${Math.round(((step + 1) / 7) * 100)}%`
                      : '0%'}
                </span>
              </span>
            </button>
          ))}
        </nav>
        <div className="lesson-layout">
          <main className="lesson-panel">
            <div className="panel-top">
              <span className="eyebrow">
                LIVELLO {l + 1} · {level.tag}
              </span>
              <span>
                {step < 3 ? 'IMPARA' : step < 6 ? 'SCEGLI' : 'CREA'}{' '}
                <b>{step + 1}/7</b>
              </span>
            </div>
            <Progress
              value={((step + 1) / 7) * 100}
              aria-label="Posizione nel livello"
            />
            <div key={`${l}-${step}`} className="activity enter">
              <div className="activity-label">
                {slide ? (
                  <>
                    <Volume2 size={16} /> SLIDE {step + 1} DI 3
                  </>
                ) : challenge ? (
                  <>
                    <Sparkles size={16} /> SFIDA {step - 2} DI 3 · 20 PUNTI
                  </>
                ) : (
                  <>
                    <Flag size={16} /> LABORATORIO · 40 PUNTI
                  </>
                )}
              </div>
              <h2 ref={heading} tabIndex={-1}>
                {slide
                  ? slide.title
                  : challenge
                    ? 'Quale prompt funziona meglio?'
                    : 'Adesso lo crei tu.'}
              </h2>
              {slide && (
                <>
                  <div className="slide-steps">
                    {slide.steps.map((text, i) => (
                      <div
                        key={text}
                        style={{ animationDelay: `${i * 120}ms` }}
                        className={`slide-row ${segment === i + 1 ? 'speaking' : ''}`}
                      >
                        <span className="step-number">0{i + 1}</span>
                        <p>{text}</p>
                      </div>
                    ))}
                  </div>
                  <div
                    className={'takeaway ' + (segment === 4 ? 'speaking' : '')}
                  >
                    <Lightbulb size={23} />
                    <strong>{slide.takeaway}</strong>
                  </div>
                  <div className="audio-controls">
                    <button
                      className="audio-button"
                      onClick={listen}
                      disabled={!supported || !ready}
                    >
                      {audioState === 'playing' ? (
                        <Pause size={18} />
                      ) : (
                        <Play size={18} fill="currentColor" />
                      )}
                      {audioState === 'playing'
                        ? 'Pausa'
                        : audioState === 'paused'
                          ? 'Riprendi'
                          : 'Ascolta la slide'}
                    </button>
                    {audioState !== 'idle' && (
                      <button
                        className="icon-button"
                        onClick={stop}
                        aria-label="Interrompi audio"
                      >
                        <Square size={17} />
                      </button>
                    )}
                    <span className="audio-caption">
                      Testo completo sempre visibile
                    </span>
                  </div>
                  <details className="audio-settings">
                    <summary>Voce e accessibilità</summary>
                    <p>
                      Voce sintetica del browser, senza abbonamenti. Qualità e
                      disponibilità dipendono dal dispositivo. L’audio parte
                      soltanto quando lo richiedi.
                    </p>
                    {voices.length > 0 && (
                      <label>
                        Voce italiana{' '}
                        <select
                          value={voice || voices[0].voiceURI}
                          onChange={(e) => {
                            stop();
                            setVoice(e.target.value);
                          }}
                        >
                          {voices.map((v) => (
                            <option value={v.voiceURI} key={v.voiceURI}>
                              {v.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                    {!supported && ready && (
                      <p>
                        Questo browser non supporta la lettura audio: puoi
                        completare il corso leggendo tutte le slide.
                      </p>
                    )}
                    <a
                      href="https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Informazioni sulla lettura del browser
                    </a>
                  </details>
                  <p role="status" className="audio-error">
                    {audioError}
                  </p>
                </>
              )}
              {challenge && (
                <>
                  <p className="scenario">{challenge.goal}</p>
                  <RadioGroup
                    value={choice}
                    onValueChange={(v) => {
                      if (!solved) {
                        setChoice(String(v));
                        setFeedback(null);
                      }
                    }}
                    aria-label="Scegli il prompt più adatto"
                    className="prompt-options"
                  >
                    {challenge.options.map((text, i) => (
                      <label
                        key={text}
                        className={`prompt-card ${choice === String(i) ? 'chosen' : ''} ${solved && challenge.correct === i ? 'right-answer' : ''}`}
                      >
                        <div className="prompt-top">
                          <span>PROMPT {i === 0 ? 'A' : 'B'}</span>
                          <RadioGroupItem value={String(i)} disabled={solved} />
                        </div>
                        <p>“{text}”</p>
                        {solved && challenge.correct === i && (
                          <span className="correct-tag">
                            <Check size={16} /> Il più adatto al compito
                          </span>
                        )}
                      </label>
                    ))}
                  </RadioGroup>
                  <div aria-live="polite">
                    {(feedback || solved) && (
                      <div
                        className={'feedback ' + (solved ? 'success' : 'retry')}
                      >
                        <strong>
                          {solved
                            ? feedback === 'correct'
                              ? 'Competenza acquisita · +20 XP'
                              : 'Sfida già risolta · 20 XP conquistati'
                            : 'Ci sei quasi. Prova l’altro prompt.'}
                        </strong>
                        <p>{solved ? challenge.why : challenge.hint}</p>
                      </div>
                    )}
                  </div>
                  {!solved && (
                    <div className="challenge-actions">
                      <button className="quiet" onClick={() => setHint(!hint)}>
                        <Lightbulb size={17} />{' '}
                        {hint ? 'Nascondi indizio' : 'Un piccolo indizio'}
                      </button>
                      <button
                        className="primary"
                        onClick={verify}
                        disabled={!choice}
                      >
                        Controlla <Check size={18} />
                      </button>
                    </div>
                  )}
                  {hint && !solved && <p className="hint">{challenge.hint}</p>}
                  <p className="micro-note">
                    Scegli in base all’obiettivo: un prompt può essere valido
                    per un compito e poco adatto a un altro.
                  </p>
                </>
              )}
              {step === 6 && (
                <>
                  <p className="scenario">{level.lab}</p>
                  <div className="lab-meta">
                    <span>◷ 4 minuti indicativi</span>
                    <span>Quaderno personale · nessuna AI collegata</span>
                  </div>
                  <label className="field-label" htmlFor="work">
                    Il tuo lavoro
                  </label>
                  <textarea
                    id="work"
                    maxLength={20000}
                    value={state.notes[l] || ''}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        notes: { ...s.notes, [l]: e.target.value },
                      }))
                    }
                    placeholder="Scrivi il prompt e le tue osservazioni. Usa solo dati inventati…"
                  />
                  <button
                    className="quiet solution-button"
                    onClick={() => setSolution(!solution)}
                  >
                    {solution ? 'Nascondi esempio' : 'Confronta con un esempio'}{' '}
                    <BookOpen size={17} />
                  </button>
                  {solution && (
                    <div className="model-answer">
                      <strong>Una possibile soluzione</strong>
                      <p>{level.model}</p>
                      <small>
                        La tua formulazione può essere diversa: usa i criteri
                        qui sotto.
                      </small>
                    </div>
                  )}
                  <div className="self-check">
                    <h3>Controlla il tuo lavoro</h3>
                    <p>
                      Spunta solo ciò che hai verificato. È un’autovalutazione,
                      non una correzione automatica.
                    </p>
                    {level.criteria.map((c, i) => (
                      <label key={c}>
                        <Checkbox
                          checked={(state.checks[l] || []).includes(i)}
                          onCheckedChange={(checked) =>
                            setState((s) => ({
                              ...s,
                              checks: {
                                ...s.checks,
                                [l]: checked
                                  ? [...new Set([...(s.checks[l] || []), i])]
                                  : (s.checks[l] || []).filter((n) => n !== i),
                              },
                            }))
                          }
                        />
                        <span>{c}</span>
                      </label>
                    ))}
                  </div>
                  {!canFinish(state, l) && !state.completed.includes(l) && (
                    <p className="micro-note">
                      Per completare: visita le 3 slide, risolvi le 3 sfide,
                      scrivi almeno 30 caratteri e verifica i 3 criteri. La
                      lunghezza non valuta la qualità del testo.
                    </p>
                  )}
                  {celebrate && (
                    <div className="celebration" role="status">
                      <Trophy size={36} />
                      <h3>
                        {finished
                          ? 'Missione compiuta!'
                          : 'Livello conquistato!'}
                      </h3>
                      <p>
                        {finished
                          ? 'Hai concluso sei moduli e conquistato 600 XP. Porta con te il metodo: richiesta, revisione, controllo.'
                          : `Hai conquistato 40 XP. Il modulo ${l + 2} è ora disponibile.`}
                      </p>
                      {finished && (
                        <button className="quiet" onClick={download}>
                          <Download size={18} /> Scarica il tuo lavoro
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
            <footer className="activity-footer">
              <button
                className="quiet"
                onClick={() => navigate(l, step - 1)}
                disabled={step === 0 || !ready}
              >
                <ArrowLeft size={17} /> Indietro
              </button>
              {step < 6 ? (
                <button
                  className="primary"
                  disabled={!ready || (!!challenge && !solved)}
                  onClick={() => navigate(l, step + 1)}
                >
                  {step === 2
                    ? 'Inizia le sfide'
                    : step === 5
                      ? 'Vai al laboratorio'
                      : 'Continua'}
                  <ArrowRight size={18} />
                </button>
              ) : !state.completed.includes(l) ? (
                <button
                  className="primary"
                  disabled={!canFinish(state, l)}
                  onClick={() => {
                    setState((s) => complete(s, l));
                    setCelebrate(true);
                  }}
                >
                  <Flag size={18} /> Completa il livello
                </button>
              ) : l < 5 ? (
                <button className="primary" onClick={() => navigate(l + 1)}>
                  Prossimo livello
                  <ArrowRight size={18} />
                </button>
              ) : (
                <span className="end-label">
                  <Trophy size={19} /> Percorso completato
                </span>
              )}
            </footer>
            <nav className="step-nav" aria-label="Attività del livello">
              {Array.from({ length: 7 }, (_, i) => (
                <button
                  key={i}
                  aria-label={
                    i < 3
                      ? `Slide ${i + 1}`
                      : i < 6
                        ? `Sfida ${i - 2}`
                        : 'Laboratorio'
                  }
                  aria-current={step === i ? 'step' : undefined}
                  className={step === i ? 'current' : ''}
                  onClick={() => navigate(l, i)}
                  disabled={!ready}
                >
                  {i < 3 ? (
                    <BookOpen size={14} />
                  ) : i < 6 ? (
                    <Sparkles size={14} />
                  ) : (
                    <Flag size={14} />
                  )}
                </button>
              ))}
            </nav>
          </main>
          <aside className="mission-aside">
            <div className="mission-card">
              <span className="eyebrow">LA TUA MISSIONE</span>
              <h3>{level.title}</h3>
              <p>{level.goal}</p>
              <div className="mission-list">
                <div>
                  <span>01</span>
                  <p>
                    Ascolta e scopri
                    <small>3 slide · circa 3 min con ripasso</small>
                  </p>
                </div>
                <div>
                  <span>02</span>
                  <p>
                    Confronta i prompt
                    <small>3 sfide · circa 3 min con feedback</small>
                  </p>
                </div>
                <div>
                  <span>03</span>
                  <p>
                    Metti in pratica<small>1 laboratorio · circa 4 min</small>
                  </p>
                </div>
              </div>
            </div>
            <div className="points-card">
              <Star size={23} fill="currentColor" />
              <div>
                <span className="eyebrow">PROFILO DI APPRENDIMENTO</span>
                <strong>{xp} / 600 XP</strong>
                <Progress value={xp / 6} aria-label="Punti del corso" />
                <p>
                  {completion}% del corso · {state.completed.length}/6 moduli
                </p>
              </div>
            </div>
            <div className="milestone-card">
              <div className="milestone-icon">
                <Target size={19} />
              </div>
              <div>
                <span>PROSSIMO TRAGUARDO</span>
                <strong>
                  {nextMilestone?.name || 'Tutti i traguardi raggiunti'}
                </strong>
                <small>
                  {nextMilestone?.detail ||
                    'Hai completato il percorso professionale.'}
                </small>
              </div>
            </div>
            <section
              className="achievement-card"
              aria-labelledby="achievement-title"
            >
              <div className="achievement-heading">
                <div>
                  <span className="eyebrow">ACHIEVEMENT</span>
                  <h3 id="achievement-title">Competenze sbloccate</h3>
                </div>
                <strong>{earnedCount}/4</strong>
              </div>
              <div className="badge-grid">
                {achievements.map(({ name, detail, earned, icon: Icon }) => (
                  <div
                    className={`badge-item ${earned ? 'earned' : ''}`}
                    key={name}
                    title={detail}
                  >
                    <span>
                      <Icon size={18} />
                    </span>
                    <small>{name}</small>
                  </div>
                ))}
              </div>
            </section>
            <div className="streak-card">
              <Flame size={21} />
              <div>
                <strong>
                  {state.streakDays}{' '}
                  {state.streakDays === 1
                    ? 'giorno consecutivo'
                    : 'giorni consecutivi'}
                </strong>
                <p>Torna domani per mantenere la continuità.</p>
              </div>
            </div>
            <details className="reference">
              <summary>Il brief di Officina Pedale</summary>
              <p>
                Attività inventata. Ripara bici urbane, esegue manutenzione
                freni, sostituisce camere d’aria. Appuntamenti tramite modulo di
                contatto. Prezzi, orari, indirizzo e tempi non disponibili.
              </p>
            </details>
            <button className="quiet" onClick={download}>
              <Download size={17} /> Scarica il tuo quaderno
            </button>
            <p className="storage-note">
              {storage
                ? 'Progressi e quaderno salvati solo in questo browser. Non si sincronizzano tra dispositivi.'
                : 'Salvataggio non disponibile: scarica il quaderno prima di chiudere.'}
            </p>
          </aside>
        </div>
        <footer className="site-footer">
          <span>Primo passo · Basi di AI</span>
          <span>
            60 minuti stimati, inclusa la pratica · Nessuna certificazione
            professionale
          </span>
        </footer>
      </div>
    </>
  );
}
