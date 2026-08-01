# Opportunity Markets

**Opportunity Markets** on the [Seer](https://seer.pm) protocol. Community proposals become market outcomes. Trade on which ideas get chosen, and earn rewards when yours wins. Browse opportunities, open market detail pages, trade on-chain, and follow price charts.

## Features

- **Home** — browse markets from the Seer API with active/all filters
- **Market detail** — outcomes, status, liquidity, and on-chain trading via `@seer-pm/react`
- **Price charts** — outcome probability history with `lightweight-charts`
- **Wallet connect** — ConnectKit + wagmi (Gnosis by default)
- **Styling** — Tailwind CSS; ready to retheme for your vertical

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

Optional — custom Gnosis RPC (defaults to public endpoints if unset):

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
│   ├── market.ts             # Default chain for market queries
│   └── wagmi.ts              # Chains, RPC, ConnectKit app metadata
└── hooks/chart/              # Chart data helpers
```

## Customization

Typical steps when forking for a new site:

1. **Branding** — update copy in `src/pages/Home.tsx`, `src/components/MainHeader.tsx`, `src/components/Footer.tsx`, and `index.html` (`<title>`).
2. **Wallet app info** — edit `appName`, `appDescription`, and `appIcon` in `src/config/wagmi.ts`.
3. **Default chain** — change `DEFAULT_MARKET_CHAIN_ID` in `src/config/market.ts` (must match a chain supported by `@seer-pm/sdk`).
4. **Theme** — adjust design tokens in `tailwind.config.js` and `src/index.css`.
5. **Deploy** — build with `yarn build` and host `dist/`. For SPA routing on Netlify, `public/_redirects` is already configured.

## Seer integration

This starter uses official Seer packages for markets, quotes, and trades. For protocol details, hooks, and integration patterns, see the [Seer demo integration docs](https://github.com/seer-pm/demo) and the `@seer-pm/react` / `@seer-pm/sdk` packages on npm.

## License

[MIT](LICENSE)
