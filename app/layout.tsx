import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Primo passo · Basi di Intelligenza Artificiale',
  description:
    'Un percorso professionale in sei moduli per comprendere l’AI, scrivere prompt efficaci e verificare ogni risposta.',
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
