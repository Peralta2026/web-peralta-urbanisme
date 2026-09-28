# Peralta Urbanisme — Regles de treball per a Claude Code

## Stack

- **Next.js 16** — App Router, TypeScript estricte
- **Tailwind v4** — sense `tailwind.config.js`, via `@theme inline` a globals.css
- **next-intl v4** — `ca` sense prefix, `/es/...`, `/en/...`, `localeDetection: false`
- **Leaflet** — mapa interactiu (ja instal·lat)

## Regles de disseny (NO negociables)

- Paleta estrictament B/N: `#ffffff`, `#000000/#111111`, grisos per jerarquia
- **Mai dark mode** · **Mai gradients** · **Mai border-radius** (excepte elements d'UI menors)
- Tipografia self-hosted única: `Instrument Sans`. **No hi ha mono** (IBM Plex Mono retirada el 2026-09-28)
- **Sense "eyebrows"**: cap mini títol en majúscules espaiades damunt d'un títol. Una etiqueta només existeix si anomena una dada (data, municipi, any, filtre...)
- Etiquetes i metadades: Instrument Sans 400, `var(--size-meta)` (13px), gris, minúscules, sense letter-spacing, `tabular-nums` per a xifres
- Enllaços d'acció: text subratllat (1px, offset 4px) a mida de lectura, sense majúscules
- Variables de disseny sempre de `src/styles/tokens.css` — mai valors màgics inline
- Mapa: fons blanc, cartografia negra, zero color

## Regles de codi

- Components helpers **sempre fora** del component pare (evita errors de reconciliació React)
- **Cap inline style** per a valors de disseny: usar `var(--token-name)` de tokens.css
- Contingut **sempre separat** de forma: JSON → component, mai text hardcoded
- Responsive des del primer moment: definir comportament mobile/tablet/desktop
- **Cap comentari** que descrigui QUÈ fa el codi — només el PER QUÈ si no és obvi

## Multilingüe (next-intl)

- Locale `ca` → sense prefix de ruta (`/`)
- Locales `es`, `en` → prefix (`/es/...`, `/en/...`)
- `localizeHref(href, locale)` helper disponible a Nav i HomeScene
- Traduccions via `next-intl`, mai text hardcoded

## Flux de treball

- **Branca activa:** `main` (Netlify auto-deploya en cada push)
- Netlify falla si TypeScript no compila — verificar `npx tsc --noEmit` abans de push
- Imatges públiques: `public/` (logo, intro PNGs, grid, projectes)
- Contingut dels projectes: `content/projects/[slug].json`

## Estructura de pàgines

| Ruta         | Estat    | Component principal |
|---|---|---|
| `/`          | ✓ actiu  | `HomeScene` (hero + grid + barriga) |
| `/projectes` | pendent  | `ProjectArchive` |
| `/projectes/[slug]` | pendent | `ProjectPage` |
| `/directori` | pendent  | `ProjectMap` (Leaflet) |
| `/persones`  | pendent  | `PersonList` |
| `/intervencions` | pendent | — |
| `/contacte`  | pendent  | — |

## Model de projecte (types.ts)

Camps localitzats (`ca`, `es`, `en`): `title`, `municipality`, `year`, `status`, `tipus`, `premi`, `ambitM2`, `descriptionShort`, `descriptionLong`.
Camps globals: `slug`, `coverImage`, `images[]`, `tags[]`, `coordinates`.

## Arquitectura de la home (HomeScene)

La home usa un **sistema de scroll virtual** (body.overflow hidden, events wheel/touch capturats):
- **Phase 1** (vY 0→900): hero blanc s'encongeix (scale 1→0.44)
- **Phase 2** (vY 900→1600): panell de projectes (barriga blanca) puja des de baix
- **Phase 3** (pendent): explorador de projectes amb navegació scroll entre ells

El Nav del layout retorna `null` a la home — `HomeScene` gestiona la seva pròpia nav interna.
