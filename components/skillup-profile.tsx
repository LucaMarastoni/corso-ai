'use client';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Award,
  Bell,
  BookOpen,
  Brain,
  Camera,
  ChartNoAxesColumnIncreasing,
  Check,
  ChevronRight,
  CircleHelp,
  FileText,
  Flame,
  Home,
  Link,
  LogOut,
  Monitor,
  PieChart,
  Settings,
  Share2,
  ShieldCheck,
  UserRound,
  CalendarDays,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { LearningState } from '../app/progress';

const skills = [
  {
    title: 'Prompting fondamentale',
    level: 'Fondamentale',
    course: 'Basi di Intelligenza Artificiale',
    icon: Brain,
  },
  {
    title: 'Analisi delle performance',
    level: 'Intermedio',
    course: 'Digital Marketing Strategico',
    icon: PieChart,
  },
  {
    title: 'Strategie digitali',
    level: 'Intermedio',
    course: 'Digital Marketing Strategico',
    icon: ChartNoAxesColumnIncreasing,
  },
  {
    title: 'Web design base',
    level: 'Fondamentale',
    course: 'Web Design con WordPress',
    icon: Monitor,
  },
];
const certificates = [
  {
    title: 'Attestato di partecipazione',
    course: 'Intelligenza Artificiale per tutti',
    date: '12 mar 2024',
    id: 'CERT-IA-2048',
    gold: false,
  },
  {
    title: 'Certificato di completamento',
    course: 'Digital Marketing Strategico',
    date: '3 mag 2024',
    id: 'CERT-DM-1182',
    gold: true,
  },
];
const badges = [
  {
    name: 'Signal Frame',
    rarity: 'Raro',
    text: 'Primi passi, grandi risultati.',
    image: './achievements/signal-frame.png',
    color: 'blue',
  },
  {
    name: 'Prompt Architect',
    rarity: 'Epico',
    text: 'Le idee prendono forma.',
    image: './achievements/prompt-architect.png',
    color: 'purple',
  },
  {
    name: 'Consistency Streak',
    rarity: 'Costanza',
    text: 'La costanza premia sempre.',
    image: '',
    color: 'gold',
  },
];
function CertificatePreview({
  gold = false,
  name,
}: {
  gold?: boolean;
  name: string;
}) {
  return (
    <div className={`sp-certificate-preview ${gold ? 'gold' : ''}`}>
      <strong>
        Skill<span>Up</span>
      </strong>
      <small>ATTESTATO DI FORMAZIONE</small>
      <span className="sp-certificate-name">{name}</span>
      <span className="sp-certificate-rule" />
      <i>Il tuo prossimo passo, oggi.</i>
      <Award aria-hidden="true" />
    </div>
  );
}
export function SkillUpProfile({
  state,
  onName,
  onDownload,
  onCertificate,
}: {
  state: LearningState;
  onName: (name: string) => void;
  onDownload: () => void;
  onCertificate: () => void;
}) {
  const [modal, setModal] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState(
    'Sto costruendo competenze nell’AI e nel digital marketing.',
  );
  const [draftBio, setDraftBio] = useState(bio);
  const [avatar, setAvatar] = useState('');
  const [notice, setNotice] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [featured, setFeatured] = useState(badges.map((b) => b.name));
  const upload = useRef<HTMLInputElement>(null);
  const displayName = state.profileName.trim() || 'Luca Rossi';
  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem('skillup-profile-preferences') || '{}',
      );
      if (typeof saved.bio === 'string') setBio(saved.bio);
      if (typeof saved.avatar === 'string') setAvatar(saved.avatar);
      if (typeof saved.notifications === 'boolean')
        setNotifications(saved.notifications);
      if (Array.isArray(saved.featured))
        setFeatured(
          saved.featured.filter((n: string) =>
            badges.some((b) => b.name === n),
          ),
        );
    } catch {
      /* Defaults remain usable when storage is unavailable. */
    }
  }, []);
  function persist(patch: Record<string, unknown>) {
    try {
      localStorage.setItem(
        'skillup-profile-preferences',
        JSON.stringify({ bio, avatar, notifications, featured, ...patch }),
      );
      return true;
    } catch {
      setNotice(
        'Spazio locale non disponibile. La modifica rimane attiva fino alla chiusura della pagina.',
      );
      return false;
    }
  }
  async function share(title: string) {
    const url = new URL(window.location.href);
    url.hash = 'profile';
    try {
      if (navigator.share) await navigator.share({ title, url: url.href });
      else {
        await navigator.clipboard.writeText(url.href);
        setNotice(
          'Link alla piattaforma copiato. Il profilo personale resta su questo dispositivo.',
        );
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        setModal('Condividi profilo');
      }
    }
  }
  function edit() {
    setName(displayName);
    setDraftBio(bio);
    setModal('Modifica profilo');
  }
  return (
    <div className="skillup-profile">
      <header className="sp-header">
        <a href="#home" className="sp-wordmark">
          Skill<span>Up</span>
        </a>
        <h1>Profilo</h1>
        <button
          aria-label="Apri impostazioni"
          onClick={() =>
            document
              .getElementById('sp-settings')
              ?.scrollIntoView({ behavior: 'smooth' })
          }
        >
          <Settings />
        </button>
      </header>
      <main className="sp-main">
        <section className="sp-card sp-hero" aria-label="Profilo personale">
          <div className="sp-avatar-wrap">
            <div className="sp-avatar">
              {avatar ? (
                <img src={avatar} alt={`Foto di ${displayName}`} />
              ) : (
                <UserRound size={76} strokeWidth={1.1} />
              )}
            </div>
            <button
              className="sp-camera"
              aria-label="Cambia foto profilo"
              onClick={() => upload.current?.click()}
            >
              <Camera size={21} />
            </button>
            <input
              hidden
              ref={upload}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                if (
                  !['image/png', 'image/jpeg', 'image/webp'].includes(
                    file.type,
                  ) ||
                  file.size > 2_000_000
                ) {
                  setNotice(
                    'Scegli una foto PNG, JPG o WebP inferiore a 2 MB.',
                  );
                  return;
                }
                const reader = new FileReader();
                reader.onload = () => {
                  const value = String(reader.result);
                  setAvatar(value);
                  persist({ avatar: value });
                };
                reader.onerror = () =>
                  setNotice('Non è stato possibile leggere la foto. Riprova.');
                reader.readAsDataURL(file);
              }}
            />
          </div>
          <div className="sp-identity">
            <h2>{displayName}</h2>
            <p className="sp-subtitle">Digital learner</p>
            <p className="sp-level">
              <Brain size={24} /> <strong>Livello 3 · Prompt Architect</strong>
            </p>
            <p className="sp-bio">{bio}</p>
            <button
              className="sp-public-link"
              onClick={() => setModal('Condividi profilo')}
            >
              <Link size={19} /> skillup.it/u/
              {displayName.toLowerCase().replace(/\s/g, '')}
            </button>
          </div>
          <div className="sp-hero-actions">
            <button className="sp-primary" onClick={edit}>
              Modifica profilo
            </button>
            <button
              className="sp-outline"
              onClick={() => share('Il mio profilo SkillUp')}
            >
              <Share2 size={20} /> Condividi profilo
            </button>
          </div>
        </section>
        <section className="sp-card">
          <div className="sp-section-heading">
            <h2>Il mio percorso formativo</h2>
            <a href="#progress">
              Vedi tutti i progressi <ArrowRight size={18} />
            </a>
          </div>
          <div className="sp-metrics">
            {[
              { icon: BookOpen, number: 4, text: 'corsi' },
              {
                icon: ChartNoAxesColumnIncreasing,
                number: 8,
                text: 'competenze',
              },
              { icon: Award, number: 2, text: 'certificati' },
            ].map(({ icon: Icon, number, text }) => (
              <div key={text}>
                <span
                  className={`sp-icon ${text === 'certificati' ? 'gold' : ''}`}
                >
                  <Icon />
                </span>
                <p>
                  <strong>{number}</strong>
                  <span>{text}</span>
                </p>
              </div>
            ))}
          </div>
        </section>
        <section className="sp-card">
          <div className="sp-section-heading">
            <h2>Competenze</h2>
            <button onClick={() => setModal('Tutte le competenze')}>
              Vedi tutte le competenze <ChevronRight size={18} />
            </button>
          </div>
          <div className="sp-skills">
            {skills.map(({ title, level, course, icon: Icon }) => (
              <article key={title} className="sp-skill">
                <span className="sp-icon">
                  <Icon />
                </span>
                <h3>{title}</h3>
                <span className="sp-pill">{level}</span>
                <p>Corso: {course}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="sp-card">
          <div className="sp-section-heading">
            <h2>Certificazioni</h2>
            <button onClick={() => setModal('Tutte le certificazioni')}>
              Vedi tutte le certificazioni <ChevronRight size={18} />
            </button>
          </div>
          <div className="sp-certificates">
            {certificates.map((cert) => (
              <article className="sp-certificate" key={cert.id}>
                <CertificatePreview name={displayName} gold={cert.gold} />
                <div className="sp-certificate-info">
                  <h3>{cert.title}</h3>
                  <p>{cert.course}</p>
                  <div className="sp-meta">
                    <span>
                      <CalendarDays size={16} />
                      {cert.date}
                    </span>
                    <span>
                      <FileText size={16} />
                      ID {cert.id}
                    </span>
                  </div>
                  <span className="sp-verified">
                    <Check size={16} /> Verificato
                  </span>
                </div>
                <div className="sp-certificate-actions">
                  <button
                    className="sp-primary"
                    onClick={() => setModal(cert.id)}
                  >
                    Visualizza
                  </button>
                  <div>
                    <button
                      className="sp-outline"
                      onClick={() => setModal(cert.id)}
                    >
                      <Share2 size={17} /> Condividi
                    </button>
                    <button
                      className="sp-outline"
                      onClick={() => setModal(cert.id)}
                    >
                      <span className="sp-linkedin" aria-hidden="true">
                        in
                      </span>{' '}
                      Aggiungi a LinkedIn
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="sp-card">
          <div className="sp-section-heading">
            <h2>Achievement in evidenza</h2>
            <button onClick={() => setModal('Modifica vetrina')}>
              Modifica vetrina <ChevronRight size={18} />
            </button>
          </div>
          <div className="sp-achievements">
            {badges
              .filter((b) => featured.includes(b.name))
              .map((badge) => (
                <button
                  className={`sp-achievement ${badge.color}`}
                  key={badge.name}
                  onClick={() => setModal(badge.name)}
                >
                  {badge.image ? (
                    <img src={badge.image} alt="" />
                  ) : (
                    <span className="sp-flame">
                      <Flame size={42} />
                    </span>
                  )}
                  <span>
                    <strong>{badge.name}</strong>
                    <span className="sp-pill">{badge.rarity}</span>
                    <small>{badge.text}</small>
                  </span>
                </button>
              ))}
          </div>
          {!featured.length && (
            <p>
              Nessun achievement in vetrina. Scegli i tuoi preferiti con
              “Modifica vetrina”.
            </p>
          )}
        </section>
        <section className="sp-card sp-settings" id="sp-settings">
          <h2>Impostazioni</h2>
          {[
            { name: 'Impostazioni account', icon: Settings },
            { name: 'Notifiche', icon: Bell },
            { name: 'Privacy', icon: ShieldCheck },
            { name: 'Supporto', icon: CircleHelp },
            { name: 'Logout', icon: LogOut },
          ].map(({ name: label, icon: Icon }) => (
            <button
              key={label}
              className={label === 'Logout' ? 'sp-logout' : ''}
              onClick={() =>
                label === 'Impostazioni account' ? edit() : setModal(label)
              }
            >
              <Icon size={23} />
              <span>{label}</span>
              <ChevronRight size={21} />
            </button>
          ))}
        </section>
        <p className="sp-demo-note">
          Profilo dimostrativo · Competenze, badge e certificati illustrano un
          percorso di esempio. I tuoi progressi effettivi sono nella sezione
          Progressi.
        </p>
      </main>
      <nav className="sp-nav" aria-label="Navigazione principale">
        {[
          { label: 'Home', href: '#home', icon: Home },
          { label: 'Corsi', href: '#lessons', icon: BookOpen },
          {
            label: 'Progressi',
            href: '#progress',
            icon: ChartNoAxesColumnIncreasing,
          },
          { label: 'Profilo', href: '#profile', icon: UserRound },
        ].map(({ label, href, icon: Icon }) => (
          <a
            key={href}
            href={href}
            aria-current={label === 'Profilo' ? 'page' : undefined}
          >
            <Icon size={25} />
            <span>{label}</span>
          </a>
        ))}
      </nav>
      {notice && (
        <div className="sp-notice" role="status">
          {notice}
          <button aria-label="Chiudi messaggio" onClick={() => setNotice('')}>
            ×
          </button>
        </div>
      )}
      <Dialog open={!!modal} onOpenChange={(open) => !open && setModal('')}>
        <DialogContent className="sp-dialog">
          <DialogHeader>
            <DialogTitle>
              {certificates.find((c) => c.id === modal)?.title || modal}
            </DialogTitle>
            <DialogDescription>
              {modal === 'Modifica profilo'
                ? 'Personalizza il tuo spazio di apprendimento.'
                : 'Il tuo spazio SkillUp.'}
            </DialogDescription>
          </DialogHeader>
          {modal === 'Modifica profilo' && (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (!name.trim()) return;
                onName(name.trim());
                setBio(draftBio);
                const saved = persist({ bio: draftBio });
                setModal('');
                if (saved)
                  setNotice('Profilo aggiornato su questo dispositivo.');
              }}
            >
              <label>
                Nome e cognome
                <input
                  required
                  maxLength={80}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </label>
              <label>
                Bio
                <textarea
                  maxLength={180}
                  value={draftBio}
                  onChange={(event) => setDraftBio(event.target.value)}
                />
              </label>
              <button className="sp-primary" type="submit">
                Salva modifiche
              </button>
            </form>
          )}
          {modal === 'Condividi profilo' && (
            <>
              <p>
                Il profilo è salvato su questo dispositivo. Il link pubblico
                skillup.it è un esempio e non è ancora attivo.
              </p>
              <button className="sp-primary" onClick={() => share('SkillUp')}>
                Condividi la piattaforma
              </button>
            </>
          )}
          {modal === 'Tutte le competenze' && (
            <>
              {skills.map((s) => (
                <div key={s.title}>
                  <h3>{s.title}</h3>
                  <p>
                    {s.level} · {s.course}
                  </p>
                </div>
              ))}
              <p>
                Competenze del profilo dimostrativo. Consulta i progressi per
                quelle acquisite nei tuoi corsi.
              </p>
              <a
                className="sp-primary"
                href="#progress"
                onClick={() => setModal('')}
              >
                Vai ai miei progressi
              </a>
            </>
          )}
          {(modal === 'Tutte le certificazioni' ||
            certificates.some((c) => c.id === modal)) && (
            <>
              {certificates
                .filter(
                  (c) => modal === 'Tutte le certificazioni' || c.id === modal,
                )
                .map((c) => (
                  <div key={c.id}>
                    <CertificatePreview name={displayName} gold={c.gold} />
                    <h3>{c.course}</h3>
                    <p>
                      {c.date} · {c.id}
                    </p>
                  </div>
                ))}
              <p>
                Questi certificati sono esempi dimostrativi e non attestano il
                completamento dei tuoi corsi. Puoi scaricare e condividere il
                tuo attestato dopo aver completato il percorso.
              </p>
              {state.certificateId ? (
                <button
                  className="sp-primary"
                  onClick={() => {
                    setModal('');
                    onCertificate();
                  }}
                >
                  Apri il mio attestato
                </button>
              ) : (
                <a
                  className="sp-primary"
                  href="#progress"
                  onClick={() => setModal('')}
                >
                  Vai ai miei progressi
                </a>
              )}
            </>
          )}
          {modal === 'Modifica vetrina' && (
            <>
              {badges.map((b) => (
                <label className="sp-check" key={b.name}>
                  <input
                    type="checkbox"
                    checked={featured.includes(b.name)}
                    onChange={(event) => {
                      const next = event.target.checked
                        ? [...featured, b.name]
                        : featured.filter((n) => n !== b.name);
                      setFeatured(next);
                      persist({ featured: next });
                    }}
                  />
                  {b.name}
                </label>
              ))}
              <button className="sp-primary" onClick={() => setModal('')}>
                Fine
              </button>
            </>
          )}
          {badges.some((b) => b.name === modal) && (
            <>
              <p>{badges.find((b) => b.name === modal)?.text}</p>
              <p>
                Achievement del profilo dimostrativo. Trovi i badge che hai
                sbloccato nella sezione Progressi.
              </p>
              <a
                href="#progress"
                className="sp-primary"
                onClick={() => setModal('')}
              >
                Scopri i miei achievement
              </a>
            </>
          )}
          {modal === 'Notifiche' && (
            <>
              <label className="sp-check">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(event) => {
                    setNotifications(event.target.checked);
                    persist({ notifications: event.target.checked });
                  }}
                />
                Promemoria di apprendimento
              </label>
              <p>
                Preferenza salvata su questo dispositivo. L’invio di notifiche
                non è ancora disponibile.
              </p>
            </>
          )}
          {modal === 'Privacy' && (
            <>
              <p>
                Nome, foto e progressi sono conservati nel browser di questo
                dispositivo. Non vengono creati account o profili pubblici.
              </p>
              <button className="sp-primary" onClick={onDownload}>
                Esporta i miei dati del corso
              </button>
            </>
          )}
          {modal === 'Supporto' && (
            <>
              <p>
                I progressi vengono salvati automaticamente. Per riprendere il
                corso, apri Corsi o Progressi. Prima di cancellare i dati del
                browser, esporta una copia dalla sezione Privacy.
              </p>
              <a
                href="#lessons"
                className="sp-primary"
                onClick={() => setModal('')}
              >
                Apri i corsi
              </a>
            </>
          )}
          {modal === 'Logout' && (
            <>
              <p>
                Stai usando un profilo locale, senza una sessione di accesso.
                Puoi tornare alla Home: i tuoi progressi rimarranno salvati su
                questo dispositivo.
              </p>
              <a
                className="sp-primary"
                href="#home"
                onClick={() => setModal('')}
              >
                Torna alla Home
              </a>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
