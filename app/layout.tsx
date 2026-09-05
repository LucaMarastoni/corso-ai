import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Basi di AI · Da zero, in 60 minuti',description:'Corso autonomo con spiegazioni, esercizi e quiz per imparare a usare l’intelligenza artificiale.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="it"><body>{children}</body></html>}
