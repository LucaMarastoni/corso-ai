import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'AI Academy · Basi di Intelligenza Artificiale',
  description:
    'Un percorso professionale in sei moduli per comprendere l’AI, scrivere prompt efficaci e verificare ogni risposta.',
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
