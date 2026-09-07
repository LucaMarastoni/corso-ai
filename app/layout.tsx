import type { Metadata, Viewport } from 'next';
import './globals.css';
import './mobile.css';
import './skillup.css';
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};
export const metadata: Metadata = {
  title: 'SkillUp · Competenze oggi. Opportunità domani.',
  description:
    'Scopri corsi sul mondo digitale, sviluppa competenze concrete e continua il tuo percorso di apprendimento.',
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <head>
        <link rel="icon" href="./brand/ai-academy-mark.png" type="image/png" />
        <link rel="apple-touch-icon" href="./brand/ai-academy-mark.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
