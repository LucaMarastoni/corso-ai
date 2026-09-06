import { CompetencyList } from './learning';
import {
  courseModules,
  PHASES,
  COURSE_ACTIVITY_COUNT,
} from '../app/learning-model';
import { learningLevel } from '../app/learning-config';
import Image from 'next/image';
import type { ComponentProps, ReactNode, CSSProperties } from 'react';
import {
  Clock3,
  Layers3,
  Home,
  BookOpen,
  ChartNoAxesColumnIncreasing,
  UserRound,
  ArrowRight,
  Flame,
  Award,
  Target,
  Star,
  ArrowLeft,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import type { Achievement } from '../app/achievements';
import type { LearningState } from '../app/progress';

export type Screen = 'home' | 'lessons' | 'lesson' | 'progress' | 'profile';
export function AcademyButton({
  variant = 'primary',
  className = '',
  ...props
}: Omit<ComponentProps<typeof Button>, 'variant' | 'className'> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
  className?: string;
}) {
  return (
    <Button
      variant={
        variant === 'primary'
          ? 'default'
          : variant === 'secondary'
            ? 'outline'
            : 'ghost'
      }
      className={`academy-button button-${variant} ${className}`}
      {...props}
    />
  );
}
export function AcademyCard({
  tone = 'default',
  className = '',
  ...props
}: ComponentProps<typeof Card> & {
  tone?: 'default' | 'highlight' | 'reward' | 'success' | 'dark';
}) {
  return (
    <Card className={`academy-card card-${tone} ${className}`} {...props} />
  );
}
export function SectionHeader({
  title,
  href,
  action = 'Vedi tutti',
}: {
  title: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="academy-section-heading">
      <h2>{title}</h2>
      {href && (
        <a href={href}>
          {action}
          <ArrowRight size={16} />
        </a>
      )}
    </div>
  );
}
export function XPChip({ xp }: { xp: number }) {
  return (
    <span className="metric-pill xp-pill">
      <Star size={17} /> {xp} <small>XP</small>
    </span>
  );
}
export function BottomNavigation({ screen }: { screen: Screen }) {
  return (
    <nav className="bottom-navigation" aria-label="Navigazione principale">
      {(
        [
          ['home', 'Home', Home],
          ['lessons', 'Lezioni', BookOpen],
          ['progress', 'Progressi', ChartNoAxesColumnIncreasing],
          ['profile', 'Profilo', UserRound],
        ] as const
      ).map(([id, label, Icon]) => (
        <a
          href={`#${id}`}
          key={id}
          aria-current={
            screen === id || (id === 'lessons' && screen === 'lesson')
              ? 'page'
              : undefined
          }
        >
          <Icon size={21} />
          <span>{label}</span>
        </a>
      ))}
    </nav>
  );
}
export function ProgressSummary({
  completion,
  module,
}: {
  completion: number;
  module: number;
}) {
  return (
    <div className="progress-summary">
      <div>
        <strong>{completion}% completato</strong>
        <span>Modulo {module} di 6</span>
      </div>
      <Progress value={completion} aria-label="Completamento del corso" />
    </div>
  );
}
export function JourneyCard({ title }: { title: string }) {
  return (
    <>
      <SectionHeader title="Il tuo percorso" href="#lessons" />
      <AcademyCard>
        <a className="academy-row" href="#lesson">
          <BookOpen />
          <span>
            <strong>{title}</strong>
            <small>Riprendi da dove eri rimasto</small>
          </span>
          <ArrowRight size={18} />
        </a>
      </AcademyCard>
    </>
  );
}
export function ObjectiveCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <AcademyCard tone="highlight">
      <div className="academy-row">
        <Target />
        <span>
          <small className="eyebrow">PROSSIMO OBIETTIVO</small>
          <strong>{title}</strong>
          <small>{children}</small>
        </span>
      </div>
    </AcademyCard>
  );
}
export function StreakCard({ days }: { days: number }) {
  return (
    <AcademyCard tone="success">
      <div className="academy-row">
        <Flame />
        <span>
          <strong>
            {days} {days === 1 ? 'giorno consecutivo' : 'giorni consecutivi'}
          </strong>
          <small>
            {days
              ? 'Continua così. Un passo ogni giorno.'
              : 'Il tuo percorso comincia oggi.'}
          </small>
        </span>
      </div>
    </AcademyCard>
  );
}
export function BadgeTile({
  item,
  state,
  onSelect,
}: {
  item: Achievement;
  state: LearningState;
  onSelect: (item: Achievement) => void;
}) {
  const earned = item.earned(state);
  return (
    <button
      className={`academy-badge ${earned ? 'earned' : ''}`}
      onClick={() => onSelect(item)}
      aria-label={`${item.name}, ${earned ? 'sbloccato' : 'da conquistare'}`}
    >
      <Image src={item.image} alt="" width={84} height={84} unoptimized />
      <strong>{item.name}</strong>
      <small>{item.rarity}</small>
      <span>
        {earned
          ? state.achievementAwards[item.id]?.earnedAt
            ? new Date(
                state.achievementAwards[item.id].earnedAt!,
              ).toLocaleDateString('it-IT')
            : 'Percorso precedente'
          : 'Da conquistare'}
      </span>
    </button>
  );
}
export function CertificateCard({
  available,
  onOpen,
}: {
  available: boolean;
  onOpen: () => void;
}) {
  return (
    <AcademyCard tone="reward">
      <div className="academy-row">
        <Award />
        <span>
          <small className="eyebrow">OBIETTIVO FINALE</small>
          <strong>Attestato di partecipazione</strong>
          <small>
            {available
              ? 'Il tuo attestato è disponibile.'
              : 'Completa tutti i 6 moduli.'}
          </small>
        </span>
      </div>
      {available && (
        <AcademyButton variant="secondary" onClick={onOpen}>
          Apri attestato
          <ArrowRight size={18} />
        </AcademyButton>
      )}
    </AcademyCard>
  );
}
export function LessonHeader({
  module,
  step,
  completed,
}: {
  module: number;
  step: number;
  completed: number;
}) {
  const current = courseModules[module - 1];
  const activity = current.activities[step];
  const phase = current.phases.find((item) => item.id === activity.phase)!;
  const percent = Math.round((completed / current.activities.length) * 100);
  return (
    <header className="mobile-lesson-header">
      <div>
        <a href="#lessons" aria-label="Torna alle lezioni">
          <ArrowLeft size={21} />
        </a>
        <span>
          Modulo {module} · {phase.name} ·{' '}
          {phase.activities.indexOf(activity) + 1}/{phase.activities.length}
        </span>
        <strong>
          {PHASES.findIndex((item) => item.id === activity.phase) + 1}/5
        </strong>
      </div>
      <Progress value={percent} aria-label="Completamento del modulo" />
    </header>
  );
}
export function LessonBlock({
  number,
  children,
  speaking,
}: {
  number: number;
  children: ReactNode;
  speaking: boolean;
}) {
  return (
    <div className={`slide-row ${speaking ? 'speaking' : ''}`}>
      <span className="step-number">{String(number).padStart(2, '0')}</span>
      <p>{children}</p>
    </div>
  );
}
export function InsightCard({
  children,
  speaking,
}: {
  children: ReactNode;
  speaking: boolean;
}) {
  return (
    <div className={`takeaway ${speaking ? 'speaking' : ''}`}>
      <Target size={23} />
      <div>
        <span className="insight-label">DA RICORDARE</span>
        <strong>{children}</strong>
      </div>
    </div>
  );
}

export function ProfileContent({
  state,
  xp,
  level,
  storage,
  onName,
  onDownload,
  onCertificate,
}: {
  state: LearningState;
  xp: number;
  level: number;
  achievements: Achievement[];
  storage: boolean;
  onName: (value: string) => void;
  onDownload: () => void;
  onCertificate: () => void;
}) {
  return (
    <div className="profile-content">
      <AcademyCard>
        <div className="academy-row">
          <UserRound />
          <span>
            <strong>
              {state.profileName.trim() || 'Il tuo profilo locale'}
            </strong>
            <small>
              Livello {level} · {learningLevel(xp).current.name} · {xp} XP
            </small>
          </span>
        </div>
        <label className="dialog-name-field">
          Nome e cognome
          <input
            value={state.profileName}
            maxLength={80}
            autoComplete="name"
            onChange={(event) => onName(event.target.value)}
            placeholder="Aggiungi il tuo nome"
          />
        </label>
        <p className="profile-save-note">
          Le modifiche vengono salvate automaticamente.
        </p>
      </AcademyCard>
      <CompetencyList state={state} />
      <CertificateCard
        available={!!state.certificateId}
        onOpen={onCertificate}
      />
      <SectionHeader title="Materiali e dati" />
      <AcademyButton variant="secondary" onClick={onDownload}>
        Scarica il tuo quaderno
        <ArrowRight size={18} />
      </AcademyButton>
      <a
        className="academy-material-link"
        href="./materiali/dispensa.md"
        download
      >
        <BookOpen size={18} />
        Scarica la dispensa
      </a>
      <p className="local-profile-note">
        {storage
          ? 'Profilo e progressi restano in questo browser. Non si sincronizzano tra dispositivi.'
          : 'Salvataggio non disponibile: scarica il quaderno prima di chiudere.'}
      </p>
    </div>
  );
}

export function AppHeader({
  xp,
  streakDays,
  onProfile,
}: {
  xp: number;
  streakDays: number;
  onProfile: () => void;
}) {
  return (
    <header className="topbar">
      <a className="brand" href="#home">
        <Image
          unoptimized
          className="brand-wordmark"
          src="./brand/ai-academy-wordmark.png"
          alt="AI Academy · Learn, Level up, Go further"
          width={150}
          height={96}
        />
        <Image
          unoptimized
          className="brand-symbol"
          src="./brand/ai-academy-mark.png"
          alt="AI Academy"
          width={48}
          height={48}
        />
      </a>
      <a className="desktop-progress-link" href="#progress">
        Progressi
      </a>
      <div className="scoreboard">
        <XPChip xp={xp} />
        <span
          className="metric-pill streak-pill"
          title="Giorni consecutivi di studio"
        >
          <Flame size={17} /> {streakDays}{' '}
          <small>{streakDays === 1 ? 'giorno' : 'giorni'}</small>
        </span>
      </div>
      <a
        className="profile-trigger"
        href="#profile"
        onClick={(event) => {
          if (window.matchMedia('(min-width: 769px)').matches) {
            event.preventDefault();
            onProfile();
          }
        }}
        aria-label="Apri il profilo"
      >
        <UserRound size={18} />
        <span>Profilo</span>
      </a>
      <a className="download-link" href="./materiali/dispensa.md" download>
        <BookOpen size={18} />
        <span>Dispensa</span>
      </a>
    </header>
  );
}

export function CourseHeroCard({
  completion,
  activityDone,
  moduleNumber,
  finished,
  ready,
  onContinue,
}: {
  completion: number;
  activityDone: number;
  moduleNumber: number;
  finished: boolean;
  ready: boolean;
  onContinue: () => void;
}) {
  return (
    <section className="course-card" aria-labelledby="course-title">
      <div className="course-card-main">
        <div className="course-index">01</div>
        <div>
          <p className="eyebrow">CORSO PROFESSIONALE · LIVELLO BASE</p>
          <h1 id="course-title">Basi di Intelligenza Artificiale</h1>
          <p className="course-promise">
            Comprendi l’AI, scrivi prompt efficaci e verifica le risposte nel
            lavoro.
          </p>
          <div className="course-meta">
            <span>
              <Clock3 size={16} /> 60 minuti
            </span>
            <span>
              <Layers3 size={16} /> 6 moduli
            </span>
            <span>
              <Award size={16} /> Livello base
            </span>
          </div>
          <AcademyButton
            className="course-continue mobile-only"
            disabled={!ready}
            onClick={() => onContinue()}
          >
            {finished ? 'Ripassa il corso' : 'Continua'}
            <ArrowRight size={18} />
          </AcademyButton>
        </div>
      </div>
      <div className="course-progress-card">
        <div
          className="completion-ring"
          style={{ '--completion': `${completion * 3.6}deg` } as CSSProperties}
        >
          <div>
            <strong>{completion}%</strong>
            <span>completato</span>
          </div>
        </div>
        <div className="progress-copy">
          <span>AVANZAMENTO DEL CORSO</span>
          <strong>
            {activityDone} di {COURSE_ACTIVITY_COUNT} attività
          </strong>
          <Progress value={completion} aria-label="Completamento del corso" />
          <small>
            {finished
              ? 'Percorso completato'
              : `Continua dal modulo ${moduleNumber}`}
          </small>
        </div>
      </div>
    </section>
  );
}
