import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ArrowRight, Clock3, Layers3 } from 'lucide-react';
import { courses } from '../app/courses';
import {
  completionPercent,
  restore,
  type LearningState,
} from '../app/progress';
import { AcademyCard, AcademyButton, SectionHeader } from './academy';
import { Progress } from './ui/progress';
export function CourseCatalog({
  state,
  ready,
  onResume,
}: {
  state: LearningState;
  ready: boolean;
  onResume: () => void;
}) {
  const [saved, setSaved] = useState<Record<string, number>>({});
  useEffect(() => {
    const read = () => {
      const next: Record<string, number> = {};
      for (const course of courses) {
        try {
          const raw =
            localStorage.getItem(course.storageKey) ||
            (course.legacyStorageKey
              ? localStorage.getItem(course.legacyStorageKey)
              : null);
          next[course.id] = raw
            ? completionPercent(restore(raw, course.id))
            : 0;
        } catch {
          next[course.id] = 0;
        }
      }
      setSaved(next);
    };
    const timer = setTimeout(read, 0);
    window.addEventListener('storage', read);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('storage', read);
    };
  }, []);
  return (
    <section className="course-catalog" aria-label="I tuoi corsi">
      <SectionHeader title="I tuoi corsi" />
      <div className="catalog-grid">
        {courses.map((course) => {
          const active = course.id === state.courseId,
            progress = active
              ? completionPercent(state)
              : saved[course.id] || 0;
          return (
            <AcademyCard
              className={`catalog-card ${active ? 'active-course' : ''}`}
              key={course.id}
            >
              <div className="catalog-cover">
                <Image
                  src={course.cover}
                  width={320}
                  height={200}
                  alt=""
                  unoptimized
                />
                {active && <span>Corso attivo</span>}
              </div>
              <p className="eyebrow">{course.category}</p>
              <h2>{course.title}</h2>
              <p>{course.description}</p>
              <div className="catalog-meta">
                <span>
                  <Clock3 size={16} />
                  {course.duration}
                </span>
                <span>
                  <Layers3 size={16} />
                  {course.modules.length} moduli
                </span>
                <span>Livello {course.level}</span>
              </div>
              <div className="catalog-progress">
                <strong>{progress}% completato</strong>
                <Progress
                  value={progress}
                  aria-label={`Progresso ${course.title}`}
                />
              </div>
              {active ? (
                <AcademyButton
                  className="course-continue"
                  disabled={!ready}
                  onClick={onResume}
                >
                  {progress ? 'Continua' : 'Inizia'}
                  <ArrowRight size={18} />
                </AcademyButton>
              ) : (
                <a
                  className="catalog-select"
                  href={`?course=${course.id}#lesson`}
                >
                  {progress ? 'Continua' : 'Inizia'}
                  <ArrowRight size={18} />
                </a>
              )}
            </AcademyCard>
          );
        })}
      </div>
    </section>
  );
}
