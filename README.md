# Veita marketing site

Next.js (App Router) marketing site for Veita — the company studio behind Saga,
Kyndred, and the Origin / Transform doors.

## Routes

| Route | What it is |
| --- | --- |
| `/` | Home — the architecture (Studio, Kyn, Kyndred, Saga) and the two doors |
| `/studio` | The company studio and the compounding thesis |
| `/kyn` | What a Kyn is; Origin Kyn vs Transformation Kyn |
| `/kyndred` | The model trained on operating reality |
| `/saga` | The agentic operating platform, with the interactive Kyndred loop diagram |
| `/origin` | The door for companies built from zero |
| `/transform` | The door for established companies |
| `/contact` | Email fallback to the onboarding agent |
| `/start` | The onboarding agent — intake flow, live interview, dimension scores, founder profile |
| `/admin` | Passcode gate for founder sessions |

## Local development

```bash
npm install
npm run dev
```

## Environment

Everything is optional — the site builds and renders without any of it, and the
affected surfaces say what is missing rather than failing silently.

| Variable | Used by | Notes |
| --- | --- | --- |
| `GOOGLE_CLOUD_PROJECT` | `/api/chat` | Vertex AI via ADC — no key. Preferred. |
| `GOOGLE_CLOUD_LOCATION` | `/api/chat` | Defaults to `global` |
| `GEMINI_MODEL` | `/api/chat` | Defaults to `gemini-3.7-flash` |
| `GEMINI_API_KEY` / `GOOGLE_API_KEY` | `/api/chat` | Gemini Developer API, if key auth is available |
| `ANTHROPIC_API_KEY` | `/api/chat` | Claude path |
| `CHAT_PROVIDER` | `/api/chat` | `gemini` \| `anthropic`; auto-selects otherwise |
| `ADMIN_PASSCODE` | `/api/admin` | `/admin` reports it is unconfigured without this |

### The onboarding agent

Runs on Gemini or Claude behind one interface; both stream the same SSE shape,
so the client never knows which answered. Resolution order: an explicit
`CHAT_PROVIDER`, then a configured GCP project, then a Gemini key, then an
Anthropic key.

**Veita's GCP does not permit API keys**, so the Gemini path uses **Vertex AI
with Application Default Credentials**: set `GOOGLE_CLOUD_PROJECT`, supply no
key, and the SDK authenticates through `google-auth-library` — the metadata
server in GCP, `GOOGLE_APPLICATION_CREDENTIALS`, or a local
`gcloud auth application-default login`. `.env.local` is already set up for
this; it is gitignored.

Model availability was probed directly against the project rather than assumed:

| Model | On `saga-496018` |
| --- | --- |
| `gemini-3.8-flash` | available |
| `gemini-3.7-flash` | available — the default |
| `gemini-3.6-flash` | available |
| `gemini-3.5-flash-lite` | available |
| any Pro (`gemini-3.1-pro`, `gemini-3-pro`) | **404 — not enabled** |

`gemini-2.5-pro` and `gemini-2.5-flash` shut down on 16 Oct 2026 and are not
used. An id the project can't reach returns a message saying so, rather than a
generic failure.

The founder dashboard behind `/admin` still needs a datastore; the passcode gate
is in place but unlocks nothing yet.

## Design system

Structure follows SAGA's own theme (`SAGA/packages/frontend/src/theme.ts` and
`MOTION.md`) on Veita's unchanged palette — hairlines in two weights, `§` section
marks, one accent used rarely, a tight grotesque at −0.042em, and SAGA's easings
and durations. Over that sits an atmosphere layer drawn from how Linear, Stripe,
Resend, Railway and Cursor build presence.

Rules of the system:

- **No filled cards, no border radius on content.** Structure is rules and space.
  `IndexList` (numbered rows with a hanging indent) replaces every card grid.
- **Ember is the only fill.** It marks the one action, and underlines one word
  per page (`Mark`) — SAGA's signature move in our accent.
- **Atmosphere, not decoration.** `.atmos` draws two large blooms anchored
  off-canvas and clipped by the section, over a 3.5%-opacity grain. `.sweep` is a
  single raking light across a band. Both are built from the existing palette; no
  new colour is introduced.
- **One anchoring artifact per page.** The Kyndred loop sits in a lifted panel
  (`.panel-lift`) rather than flat on the ground.
- **Motion is one-shot for content.** `Reveal` uses an IntersectionObserver with
  SAGA's outExpo / 320ms / 8px-cap. CSS scroll-driven animation is used *only*
  for the atmosphere: a `view()` timeline is scrubbed rather than one-shot, so
  driving copy with it makes sections render blank at scroll 0 and fade out on
  the way up.
- Everything collapses to a hard cut under `prefers-reduced-motion`.

Tokens live in `src/app/globals.css` (`:root`). Shared furniture is in
`src/components/site/`.

## Assets

Everything is served locally — the site makes **zero external requests**.

- Fonts are self-hosted in `public/fonts` (latin + latin-ext woff2, 220 KB
  total). DM Sans and Outfit are variable fonts, so one file covers each weight
  range. `@font-face` rules are at the top of `globals.css`.
- The logo is inline SVG in `src/components/site/VeitaLogo.tsx` so it inherits
  theme tokens; `public/veita-mark.svg` and `public/favicon.svg` are the
  standalone copies.

## Redesign prototypes

`src/app/lab/` holds the three directions that were compared before picking
Operating Record (`/lab/record`, `/lab/instrument`, `/lab/signal`). They are not
linked from the site. **Delete the directory before deploying** unless you want
them public.
