# Opportunity Markets

**Opportunity Markets** on the [Seer](https://seer.pm) protocol. Community proposals become market outcomes. Trade on which ideas get chosen, and earn rewards when yours wins. Browse opportunities, open market detail pages, trade on-chain, and follow price charts.

## Features

- **Home**: browse live markets from the Seer API; finalized markets have their own archive
- **Market detail**: outcomes, status, liquidity, and on-chain trading via `@seer-pm/react`
- **Price charts**: outcome probability history with `lightweight-charts`
- **Wallet connect**: ConnectKit + wagmi (Gnosis by default)
- **Styling**: Electric Foundation from the shared `@seer-pm/ui-kit`, with system-aware light and dark themes

## Tech stack

| Layer | Packages |
|-------|----------|
| UI | React 18, React Router, Tailwind CSS |
| Build | Vite, TypeScript |
| Protocol | `@seer-pm/sdk`, `@seer-pm/react` |
| Wallet | wagmi v3, viem v2, ConnectKit |
| Data | TanStack Query |

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Yarn](https://yarnpkg.com/) 1.x (see `packageManager` in `package.json`)

## Getting started

```bash
# Clone the repository
git clone https://github.com/seer-pm/opportunity-markets.git
cd opportunity-markets

# Install dependencies
yarn install

# Copy environment variables
cp .env.example .env
```

Edit `.env` and set your [Reown](https://dashboard.reown.com) (WalletConnect) project ID:

```env
VITE_REOWN_PROJECT_ID=your_project_id_here
```

Optional: custom Gnosis RPC (defaults to public endpoints if unset):

```env
VITE_GNOSIS_RPC_URL=https://your-rpc.example.com
```

Run the dev server:

```bash
yarn dev
```

Open [http://localhost:5173](http://localhost:5173).

## Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Start Vite dev server |
| `yarn build` | Typecheck and production build (`dist/`) |
| `yarn preview` | Serve the production build locally |
| `yarn lint` | Run ESLint |

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_REOWN_PROJECT_ID` | Yes (for wallet connect) | Reown / WalletConnect project ID |
| `VITE_GNOSIS_RPC_URL` | No | Custom RPC URL for Gnosis |

All `VITE_*` variables are exposed to the client bundle. Do not put secrets here.

## Project structure

```
src/
├── pages/
│   ├── Home.tsx              # Markets list + hero
│   └── MarketPage.tsx        # Single market + trading
├── components/
│   ├── SwapWidget.tsx        # Trade UI (Seer AMM)
│   ├── MarketChart/          # Price history chart
│   └── ...
├── config/
│   ├── market.ts             # Default chain + outcome → submission maps
│   ├── submissions.ts        # IPFS manifest helpers / gateway URLs
│   └── wagmi.ts              # Chains, RPC, ConnectKit app metadata
└── hooks/chart/              # Chart data helpers
submissions/                  # Asset packs + IPFS tooling (see below)
├── ipfs-manifest.json        # Tracked: localPath → IPFS CID map
├── upload-to-ipfs.js         # Upload assets, update manifest
└── optimize-*.sh             # Image / PDF compression helpers
```

## Submissions & IPFS

Opportunity-market asset packs (images, PDFs, SVGs) live under `submissions/`:

```
submissions/<market-key>/<submission-id>/…files
```

The app does **not** serve those files from disk. It imports `submissions/ipfs-manifest.json` via `src/config/submissions.ts` and builds gateway URLs. Map each market’s outcomes to folder ids in `src/config/market.ts` (`submissionsMarket` / `submissions`).

### Why assets are gitignored

`submissions/.gitignore` ignores all asset subfolders (`*/`) and `*.log`. Tooling scripts (`*.js`, `*.sh`) and `ipfs-manifest.json` stay in git.

After upload, each file is recorded in the manifest (`name`, `localPath`, `ipfsPath`). Binaries no longer need to live in the repo or on disk: IPFS + the manifest are the source of truth.

### Processing scripts

Run these from `submissions/`:

| Script | Description |
|--------|-------------|
| `./optimize-images.sh [subdir]` | Compress / resize PNG, JPEG, WebP, GIF (sharp; max width 2000). Needs Node. |
| `./optimize-pdfs.sh [subdir]` | Compress PDFs with Ghostscript (`gs`). |
| `./list-by-size.sh` | List files by size (diagnostics). |
| `node upload-to-ipfs.js [subdir]` | Upload allowed extensions (`.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.svg`, `.pdf`) via Kleros IPFS; update the manifest. Skips paths already present. |
| `ipfs-publish.js` | Low-level upload helper (not invoked directly). |

Typical flow: optimize → upload → commit `ipfs-manifest.json` (and `market.ts` if wiring a new outcome). Upload runs write `ipfs-upload-ignored.log` and `ipfs-upload-failed.log` (gitignored).

### Upload a new directory only

To add one pack without re-uploading everything:

1. Place files locally, e.g. `submissions/seer-rebrand/NewArtist-Brand/`.
2. Optionally optimize: `./optimize-images.sh seer-rebrand/NewArtist-Brand` (and `./optimize-pdfs.sh …` if needed).
3. Upload only that path:

```bash
cd submissions
node upload-to-ipfs.js seer-rebrand/NewArtist-Brand
```

The script scans only that subdirectory and **skips** any `localPath` already in the manifest, so existing assets are not re-uploaded. With no argument it walks every market folder under `submissions/`, but still skips entries already in the manifest.

4. Commit `ipfs-manifest.json`. If the pack is a new market outcome, also map it in `src/config/market.ts`.

## Customization

Typical steps when forking for a new site:

1. **Branding**: update copy in `src/pages/Home.tsx`, `src/components/MainHeader.tsx`, `src/components/Footer.tsx`, and `index.html` (`<title>`).
2. **Wallet app info**: edit `appName`, `appDescription`, and `appIcon` in `src/config/wagmi.ts`.
3. **Default chain**: change `DEFAULT_MARKET_CHAIN_ID` in `src/config/market.ts` (must match a chain supported by `@seer-pm/sdk`).
4. **Theme**: map local semantic roles in `tailwind.config.js` and `src/index.css` onto the kit. Change shared values in the kit, never in the site.
5. **Deploy**: build with `yarn build` and host `dist/`. For SPA routing on Netlify, `public/_redirects` is already configured.

## Seer integration

This starter uses official Seer packages for markets, quotes, and trades. For protocol details, hooks, and integration patterns, see the [Seer demo integration docs](https://github.com/seer-pm/demo) and the `@seer-pm/react` / `@seer-pm/sdk` packages on npm.

## License

[MIT](LICENSE)


## Electric Foundation

The app vendors `@seer-pm/ui-kit` 0.4.0 in `vendor/` until the package is published. The kit owns brand values, Open Sans, radii, lockup, footer, line motif, controls and theme toggle. `tailwind.config.js` preserves this app's semantic names over kit variables. Its content paths include the kit's compiled React files; dynamic icon names are safelisted so Tailwind 3 keeps their mask styles.

To update the tarball, build the kit in the Seer monorepo and run `npm pack --pack-destination /path/to/seer-opportunity/vendor` from `packages/seer-pm-ui-kit`. Update the file dependency and run `yarn install`. Once published, replace that dependency with the matching npm version and remove the tarball.

Theme preference uses `seer-opportunity-theme` in localStorage. The head applies it before first paint. The app follows the system until a manual choice; ConnectKit receives the same mode and resolved kit colors, font and radii. Charts read the kit's CSS values again when the theme changes, retain four stable color slots, and draw other available histories in muted context. The naming chart retains its existing top-ten-history fetch policy.

The existing portaled submission lightbox stays in place to preserve transaction toast interaction. All product artwork comes from the existing submission manifest. Head PNG icons are copied from `seer-landing/landing/public/assets/head`; source provenance is embedded in those files.

Validation evidence and production/final screenshots are local under `.impeccable/review/` and ignored by git. The repository currently has no test command or test suite, and `yarn lint` cannot start because ESLint 9 has no config. `yarn build` includes TypeScript and production bundling. Browser checks cover themes, navigation, outcome selection and search, trade controls, chart following, wallet appearance and contrast. Signing real transactions requires a connected wallet.
