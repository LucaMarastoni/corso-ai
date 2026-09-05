# AI Academy · Basi di Intelligenza Artificiale

Demo frontend di un corso online autonomo di 60 minuti. Progressi, quaderno, nome e certificato rimangono nel `localStorage` del browser usato dallo studente.

## Sviluppo locale

```bash
npm ci
npm run dev
```

## Build

La build normale, usata anche dal deploy Sites, resta disponibile:

```bash
npm run build
```

Per verificare l'export statico destinato a GitHub Pages:

```bash
GITHUB_REPOSITORY=LucaMarastoni/corso-ai npm run build:pages
```

I file pubblicabili vengono generati in `dist/client`. La configurazione applica automaticamente il prefisso `/corso-ai` agli asset soltanto durante la build Pages e prepara anche `.nojekyll` e il fallback `404.html`; lo sviluppo locale continua a usare `/`.

## GitHub Pages

Il workflow `.github/workflows/deploy-pages.yml` esegue automaticamente la build e il deploy dopo ogni push su `main`. Nelle impostazioni della repository, in **Pages → Build and deployment**, la sorgente deve essere impostata su **GitHub Actions**.

La demo non usa un backend. Ogni visitatore vede e conserva i propri progressi esclusivamente nel browser e nel dispositivo corrente.
