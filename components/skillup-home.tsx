import { useEffect, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import {
  ArrowRight,
  Bell,
  BookOpen,
  Bookmark,
  ChartNoAxesColumnIncreasing,
  CheckCheck,
  ChevronDown,
  Clock3,
  ClipboardList,
  Crown,
  Home,
  Search,
  Trophy,
  UserRound,
  Quote,
  X,
} from 'lucide-react';
import { AcademyButton, AcademyCard } from './academy';
import { Progress } from './ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { courses, getCourse } from '../app/courses';
import {
  completionPercent,
  restore,
  type LearningState,
} from '../app/progress';
const catalog = [
  {
    id: 'ai',
    courseId: 'ai-basics',
    title: 'Intelligenza Artificiale per tutti',
    description:
      'Scopri come usare l’AI nel lavoro e nella vita quotidiana, con esempi pratici.',
    level: 'Principiante',
    lessons: 12,
  },
  {
    id: 'marketing',
    courseId: 'google-ads',
    title: 'Digital Marketing Strategico',
    description:
      'Dalle strategie ai risultati: impara a creare campagne digitali efficaci.',
    level: 'Intermedio',
    lessons: 18,
  },
  {
    id: 'webdesign',
    title: 'Web Design con WordPress',
    description:
      'Crea siti professionali senza codice, anche se parti da zero.',
    level: 'Principiante',
    lessons: 14,
  },
  {
    id: 'analytics',
    title: 'Data Analysis con Excel e Power BI',
    description:
      'Trasforma i dati in decisioni con strumenti semplici e potenti.',
    level: 'Intermedio',
    lessons: 16,
  },
  {
    id: 'security',
    title: 'Cybersecurity Essentials',
    description:
      'Proteggi i tuoi dati e naviga in sicurezza nel mondo digitale.',
    level: 'Principiante',
    lessons: 10,
  },
  {
    id: 'automation',
    title: 'Automazione con No-Code',
    description:
      'Risparmia tempo e lavora meglio con l’automazione dei processi.',
    level: 'Intermedio',
    lessons: 12,
  },
];
const navigation = [
  { label: 'Home', href: '#home', icon: Home },
  { label: 'Corsi', href: '#skillup-courses', icon: BookOpen },
  {
    label: 'I miei progressi',
    href: '#progress',
    icon: ChartNoAxesColumnIncreasing,
  },
  { label: 'Quiz', href: 'quiz', icon: ClipboardList },
  { label: 'Profilo', href: '#profile', icon: UserRound },
];
export function SkillUpHome({
  state,
  ready,
  onResume,
}: {
  state: LearningState;
  ready: boolean;
  onResume: () => void;
}) {
  const [query, setQuery] = useState(''),
    [expanded, setExpanded] = useState(false),
    [bookmarks, setBookmarks] = useState<string[]>([]),
    [saved, setSaved] = useState<Record<string, LearningState>>({}),
    [dialog, setDialog] = useState<string | null>(null),
    [read, setRead] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const marks = JSON.parse(
          localStorage.getItem('skillup-bookmarks') || '[]',
        );
        if (Array.isArray(marks))
          setBookmarks(
            marks.filter((id): id is string => typeof id === 'string'),
          );
      } catch {}
      const next: Record<string, LearningState> = {};
      for (const course of courses) {
        try {
          next[course.id] = restore(
            localStorage.getItem(course.storageKey) ||
              (course.legacyStorageKey
                ? localStorage.getItem(course.legacyStorageKey)
                : null) ||
              '{}',
            course.id,
          );
        } catch {}
      }
      setSaved(next);
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  const states = courses.map((c) =>
    c.id === state.courseId ? state : saved[c.id] || restore('{}', c.id),
  );
  const percent = Math.round(
      states.reduce((sum, s) => sum + completionPercent(s), 0) / states.length,
    ),
    started = states.filter(
      (s) => Object.keys(s.completedActivities).length > 0,
    ).length,
    completed = states.filter((s) => completionPercent(s) === 100).length;
  const quizzes = states.reduce(
    (sum, s) =>
      sum +
      getCourse(s.courseId)
        .modules.flatMap((m) => m.activities)
        .filter((a) => a.phase === 'verify' && s.completedActivities[a.id])
        .length,
    0,
  );
  const course = getCourse(state.courseId),
    currentModule = course.modules[state.level],
    activity = currentModule.activities[state.step];
  const name = state.profileName.trim() || 'Luca Rossi';
  const visible = catalog.filter((c) =>
    (
      c.title +
      ' ' +
      c.description +
      ' ' +
      (c.courseId ? getCourse(c.courseId).title : '')
    )
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const toggleBookmark = (id: string) => {
    const next = bookmarks.includes(id)
      ? bookmarks.filter((x) => x !== id)
      : [...bookmarks, id];
    setBookmarks(next);
    try {
      localStorage.setItem('skillup-bookmarks', JSON.stringify(next));
    } catch {}
  };
  const explore = () => {
    setExpanded(true);
    document
      .getElementById('skillup-courses')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const resume = () => {
    onResume();
    window.location.hash = 'lesson';
  };
  return (
    <div className="skillup-home">
      <header className="su-topbar">
        <a href="#home" className="su-brand" aria-label="SkillUp Home">
          <Image src="./skillup/logo.svg" width={48} height={48} alt="" />
          <span>
            <strong>
              Skill<span>Up</span>
            </strong>
            <small>
              Competenze oggi.
              <br className="su-mobile-break" /> Opportunità domani.
            </small>
          </span>
        </a>
        <label className="su-search">
          <Search size={20} />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setExpanded(true);
            }}
            placeholder="Cerca corsi, argomenti o docenti..."
            aria-label="Cerca corsi, argomenti o docenti"
          />
          {query && (
            <button onClick={() => setQuery('')} aria-label="Cancella ricerca">
              <X size={17} />
            </button>
          )}
        </label>
        <div className="su-account">
          <button
            className="su-notifications"
            aria-label="Notifiche"
            onClick={() => {
              setRead(true);
              setDialog('notifications');
            }}
          >
            <Bell size={24} />
            {!read && <i />}
          </button>
          <a href="#profile" className="su-user">
            <span className="su-avatar" aria-hidden="true">
              {name
                .split(' ')
                .map((x) => x[0])
                .slice(0, 2)
                .join('')}
            </span>
            <strong>{name}</strong>
            <ChevronDown size={16} />
          </a>
        </div>
      </header>
      <aside className="su-sidebar">
        <nav aria-label="Navigazione principale SkillUp">
          {navigation.map((item) => (
            <a
              key={item.label}
              href={item.href === 'quiz' ? '#home' : item.href}
              className={item.label === 'Home' ? 'active' : ''}
              aria-current={item.label === 'Home' ? 'page' : undefined}
              onClick={(e) => {
                if (item.href === 'quiz') {
                  e.preventDefault();
                  setDialog('quiz');
                }
                if (item.href === '#skillup-courses') {
                  e.preventDefault();
                  explore();
                }
              }}
            >
              <item.icon size={22} />
              {item.label}
            </a>
          ))}
        </nav>
        <AcademyCard className="su-pro">
          <Crown size={24} />
          <strong>Passa a SkillUp Pro</strong>
          <p>Più corsi, certificati e vantaggi esclusivi.</p>
          <AcademyButton onClick={() => setDialog('pro')}>
            Scopri di più <ArrowRight size={17} />
          </AcademyButton>
        </AcademyCard>
      </aside>
      <main className="su-dashboard">
        <div className="su-main">
          <section className="su-hero">
            <Image
              src="./skillup/hero.webp"
              alt="Professionista al laptop in un ufficio luminoso"
              fill
              unoptimized
              priority
            />
            <div className="su-hero-copy">
              <p>
                Bentornato, {name.split(' ')[0]}! <span>👋</span>
              </p>
              <h1>Il tuo futuro digitale inizia qui.</h1>
              <p>
                Scopri nuovi corsi, sviluppa competenze concrete e fai un passo
                più vicino ai tuoi obiettivi professionali.
              </p>
              <AcademyButton onClick={explore}>
                Esplora i corsi <ArrowRight size={19} />
              </AcademyButton>
            </div>
            <span className="su-script">
              Impara
              <br />
              Cresci
              <br />
              Realizza
            </span>
          </section>
          <section
            id="skillup-courses"
            className={expanded ? 'su-courses expanded' : 'su-courses'}
          >
            <div className="su-section-heading">
              <h2>Corsi in evidenza</h2>
              <button onClick={explore}>
                Vedi tutti <ArrowRight size={16} />
              </button>
            </div>
            <div className="su-course-grid">
              {visible.map((item) => {
                const actual = item.courseId ? getCourse(item.courseId) : null;
                const progress = actual
                  ? completionPercent(
                      states.find((s) => s.courseId === actual.id)!,
                    )
                  : 0;
                return (
                  <AcademyCard className="su-course-card" key={item.id}>
                    <div className="su-course-image">
                      <Image
                        src={`./skillup/${item.id}.webp`}
                        width={420}
                        height={220}
                        alt=""
                        unoptimized
                      />
                      <button
                        aria-label={`${bookmarks.includes(item.id) ? 'Rimuovi' : 'Salva'} ${item.title}`}
                        aria-pressed={bookmarks.includes(item.id)}
                        onClick={() => toggleBookmark(item.id)}
                      >
                        <Bookmark
                          size={20}
                          fill={
                            bookmarks.includes(item.id)
                              ? 'currentColor'
                              : 'none'
                          }
                        />
                      </button>
                    </div>
                    <div className="su-course-copy">
                      <h3>
                        {actual ? (
                          <a
                            href={`?course=${actual.id}#lesson`}
                            title={`Apri ${actual.title}`}
                          >
                            {item.title}
                          </a>
                        ) : (
                          <button onClick={() => setDialog(item.id)}>
                            {item.title}
                          </button>
                        )}
                      </h3>
                      <p>{item.description}</p>
                      <div className="su-course-meta">
                        <span
                          className={`su-level ${item.level === 'Intermedio' ? 'intermediate' : ''}`}
                        >
                          {item.level}
                        </span>
                        <small>
                          {actual
                            ? `${actual.modules.length} moduli`
                            : 'In arrivo'}
                        </small>
                        <Progress
                          value={progress}
                          aria-label={`Progresso ${item.title}`}
                        />
                        <small>{progress}%</small>
                      </div>
                    </div>
                  </AcademyCard>
                );
              })}
            </div>
            {!visible.length && (
              <AcademyCard className="su-empty">
                <Search />
                <h3>Nessun corso trovato</h3>
                <p>Prova “AI”, “Google Ads” o “marketing”.</p>
                <button onClick={() => setQuery('')}>
                  Mostra tutti i corsi
                </button>
              </AcademyCard>
            )}
            <p className="su-catalog-note">
              Disponibili: Basi di Intelligenza Artificiale e Google Ads
              Accelerator. Gli altri percorsi sono in arrivo.
            </p>
          </section>
        </div>
        <aside className="su-widgets" aria-label="Il tuo apprendimento">
          <AcademyCard className="su-progress-card">
            <div className="su-section-heading">
              <h2>I tuoi progressi</h2>
              <a href="#progress">
                Vedi dettagli <ArrowRight size={16} />
              </a>
            </div>
            <div className="su-progress-content">
              <div
                className="su-donut"
                style={{ '--percent': percent } as CSSProperties}
              >
                <div>
                  <strong>{percent}%</strong>
                  <small>Completato</small>
                </div>
              </div>
              <dl>
                <div>
                  <BookOpen />
                  <dt>Corsi iniziati</dt>
                  <dd>{started}</dd>
                </div>
                <div>
                  <CheckCheck />
                  <dt>Corsi completati</dt>
                  <dd>{completed}</dd>
                </div>
                <div>
                  <ClipboardList />
                  <dt>Quiz superati</dt>
                  <dd>{quizzes}</dd>
                </div>
                <div>
                  <Clock3 />
                  <dt>Ore di formazione</dt>
                  <dd>—</dd>
                </div>
              </dl>
            </div>
          </AcademyCard>
          <AcademyCard className="su-quote">
            <Quote size={26} />
            <blockquote>
              Piccoli passi ogni giorno
              <br /> portano a grandi risultati.
            </blockquote>
            <span>— SkillUp</span>
          </AcademyCard>
          <AcademyCard className="su-next">
            <h2>Prossima lezione</h2>
            <div className="su-next-content">
              <Image
                src={`./skillup/${catalog.find((item) => item.courseId === course.id)?.id || 'ai'}.webp`}
                width={110}
                height={90}
                alt=""
                unoptimized
              />
              <div>
                <h3>{activity.title}</h3>
                <p>{course.title}</p>
                <div>
                  <span>
                    <BookOpen size={14} />
                    Modulo {state.level + 1} di {course.modules.length}
                  </span>
                  <span>
                    <Clock3 size={14} />
                    Al tuo ritmo
                  </span>
                </div>
              </div>
            </div>
            <AcademyButton
              className="course-continue"
              disabled={!ready}
              onClick={resume}
            >
              <span className="su-desktop-label">Continua il corso</span>
              <span className="su-mobile-label">Continua</span>
              <ArrowRight size={18} />
            </AcademyButton>
          </AcademyCard>
          <button
            className="su-challenge"
            onClick={() => setDialog('challenge')}
          >
            <Trophy size={48} />
            <span>
              <strong>Sfida te stesso!</strong>
              <span>
                Completa 3 lezioni questa settimana e continua a far crescere le
                tue competenze.
              </span>
            </span>
            <ArrowRight size={19} />
          </button>
        </aside>
      </main>
      <nav className="su-bottom" aria-label="Navigazione mobile SkillUp">
        {navigation
          .filter((n) => n.href !== 'quiz')
          .map((item) => (
            <a
              href={item.href === '#skillup-courses' ? '#lessons' : item.href}
              aria-current={item.label === 'Home' ? 'page' : undefined}
              key={item.label}
              onClick={(e) => {
                if (item.href === '#skillup-courses') {
                  e.preventDefault();
                  explore();
                }
              }}
            >
              <item.icon size={25} />
              <span>
                {item.label === 'I miei progressi' ? 'Progressi' : item.label}
              </span>
            </a>
          ))}
      </nav>
      <Dialog
        open={dialog !== null}
        onOpenChange={(open) => !open && setDialog(null)}
      >
        <DialogContent className="su-dialog">
          <DialogHeader>
            <DialogTitle>
              {dialog === 'pro'
                ? 'SkillUp Pro'
                : dialog === 'notifications'
                  ? 'Le tue notifiche'
                  : dialog === 'quiz'
                    ? 'Mettiti alla prova'
                    : dialog === 'challenge'
                      ? 'La tua sfida della settimana'
                      : catalog.find((c) => c.id === dialog)?.title}
            </DialogTitle>
            <DialogDescription>
              {dialog === 'pro'
                ? 'Stiamo preparando nuovi percorsi e vantaggi. Il piano Pro non è ancora disponibile; puoi continuare a usare i corsi attuali.'
                : dialog === 'notifications'
                  ? 'Sei al passo con tutte le novità. I tuoi progressi vengono salvati in questo browser.'
                  : dialog === 'quiz'
                    ? 'Trovi verifiche interattive in ogni modulo. La simulazione Google Ads si sblocca dopo gli argomenti preparatori.'
                    : dialog === 'challenge'
                      ? 'Dedica un momento allo studio e completa tre attività. Gli XP e gli achievement seguono le regole del tuo corso.'
                      : 'Questo percorso è un’anteprima del catalogo e non è ancora disponibile. Nel frattempo puoi iniziare i corsi AI e Google Ads.'}
            </DialogDescription>
          </DialogHeader>
          <AcademyButton
            onClick={() => {
              setDialog(null);
              resume();
            }}
          >
            Continua il tuo percorso <ArrowRight size={18} />
          </AcademyButton>
        </DialogContent>
      </Dialog>
    </div>
  );
}
