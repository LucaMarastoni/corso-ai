'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  AppHeader,
  CourseHeroCard,
  ProfileContent,
  BottomNavigation,
  ProgressSummary,
  JourneyCard,
  ObjectiveCard,
  LessonHeader,
  type Screen,
} from '../components/academy';
import {
  LearningExperience,
  ProgressProfile,
  LevelCard,
  NextMilestone,
} from '../components/learning';
import { courseModules, competencyDefinitions } from './learning-model';
import { learningLevel } from './learning-config';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowRight,
  Check,
  Lock,
  Pause,
  Play,
  Square,
  Download,
  Share2,
} from 'lucide-react';
import { levels } from './journey';
import { achievements, type Achievement } from './achievements';
import {
  initialState,
  score,
  unlock,
  restore,
  type LearningState,
  completionPercent,
  STORE,
  LEGACY_STORE,
  serialize,
  completedActivityCount,
  activityAvailable,
  issueCertificate,
} from './progress';
const levelOutcomes = [
  'Riconosci dove l’AI può aiutarti e dove serve ancora il tuo giudizio.',
  'Trasforma un’idea vaga in una consegna chiara e verificabile.',
  'Correggi una prima bozza con feedback precisi e utilizzabili.',
  'Individua fatti inventati, promesse fragili e dati da verificare.',
  'Lavora con esempi realistici senza esporre informazioni sensibili.',
  'Consegna un kit di contenuti completo, coerente e controllato.',
];

export const dynamic = 'force-static';

function loadCanvasImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function writeWrapped(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (context.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = candidate;
  }
  if (line) lines.push(line);
  lines.forEach((value, index) =>
    context.fillText(value, x, y + index * lineHeight),
  );
  return y + lines.length * lineHeight;
}

function canvasBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error('Immagine non disponibile')),
      'image/png',
    ),
  );
}

function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function Home() {
  const [screen, setScreen] = useState<Screen>('home');
  const [state, setState] = useState<LearningState>(initialState),
    [ready, setReady] = useState(false),
    [storage, setStorage] = useState(true);
  const [selectedAchievement, setSelectedAchievement] =
      useState<Achievement | null>(null),
    [showProfile, setShowProfile] = useState(false),
    [showCertificate, setShowCertificate] = useState(false),
    [showFinale, setShowFinale] = useState(false),
    [shareStatus, setShareStatus] = useState('');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]),
    [voice, setVoice] = useState(''),
    [audioState, setAudioState] = useState<'idle' | 'playing' | 'paused'>(
      'idle',
    ),
    [audioError, setAudioError] = useState(''),
    [supported, setSupported] = useState(false),
    [_segment, setSegment] = useState(-1);
  const startWatch = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRun = useRef(0),
    utterance = useRef<SpeechSynthesisUtterance | null>(null),
    navTriggered = useRef(false);
  const l = state.level,
    step = state.step,
    level = levels[l],
    xp = score(state),
    slide = courseModules[l].activities[step]?.slide || null,
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
    const syncScreen = () => {
      const value = window.location.hash.slice(1);
      const next: Screen = [
        'home',
        'lessons',
        'lesson',
        'progress',
        'profile',
      ].includes(value)
        ? (value as Screen)
        : 'home';
      setScreen(next);
      stop();
      window.scrollTo(0, 0);
    };
    syncScreen();
    window.addEventListener('hashchange', syncScreen);
    return () => window.removeEventListener('hashchange', syncScreen);
  }, [stop]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE);
      let source = raw || localStorage.getItem(LEGACY_STORE);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
            throw new Error('Stato non valido');
        } catch {
          localStorage.setItem(`${STORE}-recovery`, raw);
          source = localStorage.getItem(LEGACY_STORE);
        }
      }
      setState(source ? restore(source) : initialState);
    } catch {
      setStorage(false);
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORE, serialize(state));
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
    if (navTriggered.current) {
      document.querySelector<HTMLElement>('.learning-activity h1')?.focus();
      navTriggered.current = false;
    }
  }, [l, step, ready, stop, screen]);
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
    const activity = courseModules[levelIndex]?.activities[nextStep];
    if (!ready || !activity || !activityAvailable(state, levelIndex, activity))
      return;
    stop();
    if (window.matchMedia('(max-width: 768px)').matches)
      window.location.hash = 'lesson';
    navTriggered.current = true;
    setState((s) => ({ ...s, level: levelIndex, step: nextStep }));
  }
  function resumeCourse() {
    const current = courseModules[l].activities[step];
    if (!Object.hasOwn(state.completedActivities, current.id))
      return navigate(l, step);
    const nextModule = unlock(state);
    const nextStep = courseModules[nextModule].activities.findIndex(
      (activity) =>
        !Object.hasOwn(state.completedActivities, activity.id) &&
        activityAvailable(state, nextModule, activity),
    );
    navigate(
      nextModule,
      nextStep < 0 ? courseModules[nextModule].activities.length - 1 : nextStep,
    );
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
  function download() {
    const text = levels
      .map(
        (x, n) =>
          `LIVELLO ${n + 1}: ${x.title}\n${x.lab}\n\nIL MIO LAVORO\n${state.notes[n] || '(non ancora svolto)'}\n\nPROVA\n${state.drafts[`module-${n + 1}:practice`] || '(non ancora svolta)'}`,
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
  function setProfileName(value: string) {
    setState((current) => ({ ...current, profileName: value.slice(0, 80) }));
  }
  function issueCompletedCertificate(current: LearningState) {
    const date = new Date().toLocaleDateString('en-CA');
    const certificateId =
      current.certificateId ||
      `PAI-${new Date().getFullYear()}-${crypto.randomUUID().replaceAll('-', '').slice(0, 8).toUpperCase()}`;
    return issueCertificate(
      current,
      current.profileName,
      current.completionDate || date,
      certificateId,
    );
  }
  async function createSocialCard(item: Achievement) {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1500;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas non disponibile');
    const gradient = context.createLinearGradient(0, 0, 1200, 1500);
    gradient.addColorStop(0, '#0e1d39');
    gradient.addColorStop(1, '#18346a');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 1200, 1500);
    context.strokeStyle = 'rgba(255,255,255,.08)';
    context.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      context.beginPath();
      context.arc(1020, 210, 110 + i * 58, 0, Math.PI * 2);
      context.stroke();
    }
    context.fillStyle = '#89a7ff';
    context.font = '700 27px Inter, sans-serif';
    context.letterSpacing = '5px';
    context.fillText('AI ACADEMY · COLLECTIBLE', 80, 105);
    const image = await loadCanvasImage(item.image);
    context.drawImage(image, 300, 160, 600, 600);
    context.textAlign = 'center';
    context.fillStyle = '#e9b55b';
    context.font = '700 24px Inter, sans-serif';
    context.fillText(item.rarity.toUpperCase(), 600, 810);
    context.fillStyle = '#ffffff';
    context.font = '800 66px Inter, sans-serif';
    context.fillText(item.name, 600, 895);
    context.fillStyle = '#bfcce5';
    context.font = '400 30px Inter, sans-serif';
    const resultEnd = writeWrapped(context, item.result, 600, 958, 920, 43);
    context.strokeStyle = 'rgba(255,255,255,.18)';
    context.beginPath();
    context.moveTo(120, resultEnd + 35);
    context.lineTo(1080, resultEnd + 35);
    context.stroke();
    context.fillStyle = '#91a3c3';
    context.font = '700 22px Inter, sans-serif';
    context.fillText('CONQUISTATO DA', 600, resultEnd + 105);
    context.fillStyle = '#ffffff';
    context.font = '700 42px Inter, sans-serif';
    context.fillText(state.profileName.trim(), 600, resultEnd + 160);
    context.fillStyle = '#91a3c3';
    context.font = '400 25px Inter, sans-serif';
    context.fillText('Basi di Intelligenza Artificiale', 600, resultEnd + 220);
    context.textAlign = 'left';
    context.fillStyle = '#ffffff';
    context.font = '800 31px Inter, sans-serif';
    const brandMark = await loadCanvasImage('./brand/ai-academy-mark.png');
    context.drawImage(brandMark, 80, 1320, 90, 90);
    context.fillText('AI Academy', 190, 1380);
    context.textAlign = 'right';
    context.fillStyle = '#91a3c3';
    context.font = '500 22px Inter, sans-serif';
    context.fillText('LEARN · LEVEL UP · GO FURTHER', 1120, 1405);
    return canvasBlob(canvas);
  }
  async function shareAchievement(item: Achievement) {
    if (state.profileName.trim().length < 3) return;
    setShareStatus('Creo la card…');
    try {
      const blob = await createSocialCard(item);
      const file = new File(
        [blob],
        `${item.id}-${state.profileName.trim().replaceAll(' ', '-')}.png`,
        {
          type: 'image/png',
        },
      );
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            title: `${item.name} · AI Academy`,
            text: `Ho conquistato ${item.name} nel corso Basi di Intelligenza Artificiale.`,
            files: [file],
          });
          setShareStatus('Card condivisa.');
        } catch (error) {
          if ((error as Error).name === 'AbortError') {
            setShareStatus('Condivisione annullata.');
            return;
          }
          saveBlob(blob, file.name);
          setShareStatus(
            'Condivisione non disponibile: la card è stata scaricata.',
          );
        }
      } else {
        saveBlob(blob, file.name);
        setShareStatus('Card scaricata: ora puoi pubblicarla sul tuo profilo.');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError')
        setShareStatus('Non sono riuscito a creare la card. Riprova.');
    }
  }
  async function downloadCertificate() {
    if (!state.certificateId || state.profileName.trim().length < 3) return;
    const canvas = document.createElement('canvas');
    canvas.width = 1800;
    canvas.height = 1270;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.fillStyle = '#f8f5ed';
    context.fillRect(0, 0, 1800, 1270);
    context.strokeStyle = '#17305d';
    context.lineWidth = 12;
    context.strokeRect(38, 38, 1724, 1194);
    context.strokeStyle = '#c59a4a';
    context.lineWidth = 2;
    context.strokeRect(58, 58, 1684, 1154);
    context.fillStyle = '#17305d';
    context.font = '800 42px Inter, sans-serif';
    const brandLogo = await loadCanvasImage('./brand/ai-academy-wordmark.png');
    context.drawImage(brandLogo, 115, 82, 150, 96);
    context.textAlign = 'right';
    context.fillStyle = '#7b6847';
    context.font = '700 22px Inter, sans-serif';
    context.fillText('CERTIFICATO DI PARTECIPAZIONE', 1685, 145);
    context.textAlign = 'center';
    context.fillStyle = '#14294f';
    context.font = '700 24px Inter, sans-serif';
    context.fillText('SI ATTESTA CHE', 900, 250);
    context.font = '700 54px Inter, sans-serif';
    writeWrapped(context, state.profileName.trim(), 900, 340, 1450, 64);
    context.font = '400 28px Inter, sans-serif';
    context.fillText('ha completato il corso', 900, 480);
    context.font = '700 42px Inter, sans-serif';
    context.fillText('Basi di Intelligenza Artificiale', 900, 545);
    context.font = '700 24px Inter, sans-serif';
    context.fillText('COMPETENZE ACQUISITE', 900, 630);
    context.font = '400 27px Inter, sans-serif';
    competencyDefinitions
      .filter((item) => Object.hasOwn(state.competencyAwards, item.id))
      .forEach((item, i) => context.fillText(item.name, 900, 690 + i * 43));
    context.font = '400 22px Inter, sans-serif';
    context.fillText(
      `Completato il ${state.completionDate} · ${state.completed.length} moduli`,
      900,
      1000,
    );
    context.textAlign = 'left';
    context.fillStyle = '#7b6847';
    context.font = '700 20px Inter, sans-serif';
    context.fillText('ENTE FORMATORE', 115, 1055);
    context.fillStyle = '#14294f';
    context.font = '700 27px Inter, sans-serif';
    context.fillText('AI Academy · Learn | Level up | Go further', 115, 1095);
    context.textAlign = 'right';
    context.fillStyle = '#7b6847';
    context.font = '700 20px Inter, sans-serif';
    context.fillText('IDENTIFICATIVO UNIVOCO', 1685, 1055);
    context.fillStyle = '#14294f';
    context.font = '700 27px ui-monospace, monospace';
    context.fillText(state.certificateId, 1685, 1095);
    context.textAlign = 'center';
    context.fillStyle = '#8c9199';
    context.font = '400 17px Inter, sans-serif';
    context.fillText(
      'Attestato di partecipazione al percorso; non costituisce una qualifica professionale accreditata.',
      900,
      1180,
    );
    saveBlob(
      await canvasBlob(canvas),
      `certificato-${state.certificateId}.png`,
    );
  }
  const unlocked = unlock(state);
  const completion = completionPercent(state);
  const activityDone = completedActivityCount(state);
  const nextMilestone = achievements.find((item) => !item.earned(state));
  return (
    <div className="academy-app" data-screen={screen}>
      <AppHeader
        xp={xp}
        streakDays={state.streakDays}
        onProfile={() => setShowProfile(true)}
      />
      <LessonHeader
        module={l + 1}
        step={step}
        completed={
          courseModules[l].activities.filter((a) =>
            Object.hasOwn(state.completedActivities, a.id),
          ).length
        }
      />
      <main className="course-shell">
        <section className="home-intro mobile-only" aria-label="Benvenuto">
          <p className="eyebrow">IL TUO PROSSIMO PASSO</p>
          <h2>
            Ciao
            {state.profileName.trim()
              ? `, ${state.profileName.trim().split(' ')[0]}`
              : ''}
            !
          </h2>
          <p>Pronto a continuare il tuo percorso?</p>
          <ProgressSummary completion={completion} module={l + 1} />
        </section>
        <CourseHeroCard
          completion={completion}
          activityDone={activityDone}
          moduleNumber={l + 1}
          finished={finished}
          ready={ready}
          onContinue={resumeCourse}
        />
        <section
          className="home-next mobile-only"
          aria-label="Il prossimo passo"
        >
          <JourneyCard title={finished ? 'Percorso completato' : level.title} />
          <ObjectiveCard
            title={
              finished
                ? 'Porta il tuo metodo nel lavoro'
                : `Completa il Modulo ${unlocked + 1}`
            }
          >
            {nextMilestone
              ? `Prossimo badge: ${nextMilestone.name}`
              : 'Tutti i badge conquistati.'}
          </ObjectiveCard>
        </section>
        <section
          className="progress-screen mobile-only"
          aria-label="Profilo formativo"
        >
          <ProgressProfile
            state={state}
            onContinue={resumeCourse}
            onAchievement={setSelectedAchievement}
            onCertificate={() =>
              state.certificateId
                ? setShowCertificate(true)
                : setShowFinale(true)
            }
            onDownloadCertificate={downloadCertificate}
          />
        </section>
        <section
          className="profile-screen mobile-only"
          aria-labelledby="profile-title"
        >
          <p className="eyebrow">IL TUO SPAZIO</p>
          <h1 id="profile-title">Profilo</h1>
          <ProfileContent
            state={state}
            xp={xp}
            level={learningLevel(xp).current.level}
            achievements={achievements}
            storage={storage}
            onName={setProfileName}
            onDownload={download}
            onCertificate={() => {
              setShowProfile(false);
              setShowCertificate(true);
            }}
          />
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
                <span>
                  {courseModules[n].activities.length} attività · 5 fasi
                </span>
                <span>
                  {state.completed.includes(n)
                    ? '100%'
                    : n === l
                      ? `${Math.round((courseModules[n].activities.filter((a) => Object.hasOwn(state.completedActivities, a.id)).length / courseModules[n].activities.length) * 100)}%`
                      : '0%'}
                </span>
              </span>
            </button>
          ))}
        </nav>
        <div className="lesson-layout">
          <LearningExperience
            state={state}
            ready={ready}
            onChange={setState}
            onNavigate={navigate}
            onCertificate={() =>
              state.certificateId
                ? setShowCertificate(true)
                : setShowFinale(true)
            }
            audio={
              <>
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
            }
          />
          <aside className="mission-aside">
            <LevelCard xp={xp} />
            <NextMilestone state={state} />
            <a className="academy-material-link" href="#progress">
              Apri il profilo formativo <ArrowRight size={18} />
            </a>
            <p className="storage-note">
              {storage
                ? 'Progressi salvati soltanto in questo browser.'
                : 'Salvataggio non disponibile: scarica il quaderno.'}
            </p>
          </aside>
        </div>
        <footer className="site-footer">
          <span>AI Academy · Basi di AI</span>
          <span>
            60 minuti stimati, inclusa la pratica · Attestato di partecipazione
          </span>
        </footer>
      </main>
      <BottomNavigation screen={screen} />
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="profile-dialog">
          <DialogHeader>
            <DialogTitle>Profilo di apprendimento</DialogTitle>
            <DialogDescription>
              Il tuo riepilogo personale su questo dispositivo.
            </DialogDescription>
          </DialogHeader>
          <ProfileContent
            state={state}
            xp={xp}
            level={learningLevel(xp).current.level}
            achievements={achievements}
            storage={storage}
            onName={setProfileName}
            onDownload={download}
            onCertificate={() => {
              setShowProfile(false);
              setShowCertificate(true);
            }}
          />
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!selectedAchievement}
        onOpenChange={(open) => !open && setSelectedAchievement(null)}
      >
        <DialogContent className="collectible-dialog">
          {selectedAchievement && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedAchievement.name}</DialogTitle>
                <DialogDescription>
                  {selectedAchievement.earned(state)
                    ? 'Collectible conquistato. Personalizza la card e condividi il risultato.'
                    : 'Questo collectible è ancora da conquistare.'}
                </DialogDescription>
              </DialogHeader>
              <div
                className={`collectible-preview rarity-${selectedAchievement.rarity.toLowerCase()}`}
              >
                <span className="preview-brand">AI ACADEMY · COLLECTIBLE</span>
                <img
                  src={selectedAchievement.image}
                  alt={`Trofeo ${selectedAchievement.name}`}
                  width={220}
                  height={220}
                />
                <span className="rarity-label">
                  {selectedAchievement.rarity}
                </span>
                <h3>{selectedAchievement.name}</h3>
                <p>{selectedAchievement.result}</p>
                <div>
                  <small>CONQUISTATO DA</small>
                  <strong>{state.profileName.trim() || 'Il tuo nome'}</strong>
                  <span>Basi di Intelligenza Artificiale</span>
                </div>
              </div>
              <div className="collectible-copy">
                <p>{selectedAchievement.description}</p>
                <strong>Criterio di sblocco</strong>
                <span>{selectedAchievement.criterion}</span>
              </div>
              {selectedAchievement.earned(state) && (
                <>
                  <label className="dialog-name-field" htmlFor="share-name">
                    Nome sulla card
                    <input
                      id="share-name"
                      value={state.profileName}
                      maxLength={80}
                      autoComplete="name"
                      onChange={(event) => setProfileName(event.target.value)}
                      placeholder="Nome e cognome"
                    />
                  </label>
                  <button
                    className="primary wide-action"
                    disabled={state.profileName.trim().length < 3}
                    onClick={() => shareAchievement(selectedAchievement)}
                  >
                    <Share2 size={18} /> Condividi o scarica la card
                  </button>
                  <p className="share-status" role="status">
                    {shareStatus}
                  </p>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={showFinale} onOpenChange={setShowFinale}>
        <DialogContent className="finale-dialog">
          <DialogHeader>
            <DialogTitle>Il percorso è completo.</DialogTitle>
            <DialogDescription>
              Hai trasformato sei moduli di teoria e pratica in un metodo che
              puoi usare nel lavoro.
            </DialogDescription>
          </DialogHeader>
          <div className="finale-stage">
            <span className="finale-percent">100%</span>
            <img
              src="./achievements/applied-intelligence.png"
              alt="Trofeo Applied Intelligence"
              width={250}
              height={250}
            />
            <span className="rarity-label">Leggendario</span>
            <h3>Applied Intelligence</h3>
            <p>
              {activityDone} attività completate · {xp} XP conquistati
            </p>
          </div>
          {!state.certificateId && (
            <div className="finale-identity">
              <label htmlFor="finale-name">
                Nome e cognome sul certificato
              </label>
              <input
                id="finale-name"
                value={state.profileName}
                maxLength={80}
                autoComplete="name"
                onChange={(event) => setProfileName(event.target.value)}
                placeholder="Es. Luca Bianchi"
              />
              <button
                className="primary wide-action"
                disabled={state.profileName.trim().length < 3}
                onClick={() => {
                  setState((current) => issueCompletedCertificate(current));
                  setShowFinale(false);
                  setShowCertificate(true);
                }}
              >
                Genera il certificato <ArrowRight size={18} />
              </button>
            </div>
          )}
          <div className="finale-actions">
            {state.certificateId && (
              <button
                className="primary"
                onClick={() => {
                  setShowFinale(false);
                  setShowCertificate(true);
                }}
              >
                Presenta il certificato <ArrowRight size={18} />
              </button>
            )}
            <button
              className="quiet"
              onClick={() => {
                setShowFinale(false);
                setSelectedAchievement(achievements[5]);
              }}
            >
              Guarda il collectible
            </button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={showCertificate} onOpenChange={setShowCertificate}>
        <DialogContent className="certificate-dialog">
          <DialogHeader>
            <DialogTitle>Certificato di partecipazione</DialogTitle>
            <DialogDescription>
              Il file ad alta risoluzione è pronto per il tuo portfolio o
              profilo LinkedIn.
            </DialogDescription>
          </DialogHeader>
          <div className="certificate-preview">
            <div className="certificate-head">
              <img
                src="./brand/ai-academy-wordmark.png"
                alt="AI Academy"
                width={88}
                height={56}
              />
              <span>CERTIFICATO DI PARTECIPAZIONE</span>
            </div>
            <img
              src="./achievements/applied-intelligence.png"
              alt=""
              width={105}
              height={105}
            />
            <small>SI ATTESTA CHE</small>
            <h3>{state.profileName}</h3>
            <p>ha completato il corso online</p>
            <h4>Basi di Intelligenza Artificiale</h4>
            <p>
              {state.completed.length} moduli completati ·{' '}
              {Object.keys(state.competencyAwards).length} competenze acquisite
            </p>
            <ul className="certificate-competencies">
              {competencyDefinitions
                .filter((item) =>
                  Object.hasOwn(state.competencyAwards, item.id),
                )
                .map((item) => (
                  <li key={item.id}>✓ {item.name}</li>
                ))}
            </ul>
            <div className="certificate-foot">
              <span>AI Academy · Learn | Level up | Go further</span>
              <code>{state.certificateId}</code>
            </div>
          </div>
          <button className="primary wide-action" onClick={downloadCertificate}>
            <Download size={18} /> Scarica il certificato PNG
          </button>
          <p className="certificate-note">
            Attestato di partecipazione al percorso; non costituisce una
            qualifica professionale accreditata.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
