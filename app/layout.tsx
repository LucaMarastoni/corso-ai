import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Primo passo · Impara l’AI con slide e sfide',description:'Sei livelli gratuiti con slide animate, lettura audio, confronti tra prompt e laboratori. Un percorso per chi parte da zero.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="it"><body>{children}</body></html>}
