# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are community members who submit ideas (design proposals, merch concepts, and similar), traders who bet on which proposals will be chosen, and organizers who resolve markets by selecting winning outcomes.

## Product Purpose

Opportunity Markets turns community proposals into tradeable prediction-market outcomes on the Seer protocol. Submitters earn rewards when their ideas are chosen; anyone can trade on which ideas win. Success means clear discovery of live opportunities, confident trading on outcomes, and honest attribution to Seer as the underlying protocol.

## Positioning

Community proposals become market outcomes. Trade on which ideas get chosen, and earn rewards when yours wins. Neighboring prediction apps that only list generic event odds cannot truthfully claim this submit → multicategorical outcome → organizer-chosen winner → reward loop.

## Operating Context

Users browse opportunity markets in a Vite + React SPA, open a market detail page, connect a wallet (ConnectKit / wagmi, Gnosis by default), trade via Seer AMM hooks, and follow outcome probability charts. Reference use cases include Seer redesign proposal competitions and community-driven merch collections (e.g. Devcon-style flows): submissions become outcomes in a multicategorical market; organizers pick winners.

## Capabilities and Constraints

- Browse markets from the Seer API (active / all filters).
- Market detail: outcomes, status, liquidity, on-chain trading via `@seer-pm/react`, price history charts.
- English UI only; marketing prose must not use em dashes; do not frame markets as private.
- Do not use Paradigm “scout / sponsor / talent / deals / research / startups” language.
- Preserve Seer protocol credit (“Built on Seer”, “View on Seer”) without treating Seer as the product brand.

## Brand Commitments

- Product name: **Opportunity Markets** (mark: Opportunity + highlighted Markets).
- Canonical product sentence: “Community proposals become market outcomes. Trade on which ideas get chosen, and earn rewards when yours wins.”
- Voice: clear, concrete, community-forward; no hype about private scouting or sponsor investigation.

## Evidence on Hand

- Live UI copy in `src/pages/Home.tsx`, `src/components/MainHeader.tsx`, `src/components/Footer.tsx`, `src/config/wagmi.ts`.
- No fabricated testimonials, customer logos, or Devcon/merch landing pages in-repo; do not invent them.

## Product Principles

1. **Proposals are the product** — every explanatory surface should make the submit → outcome → choose → reward loop obvious.
2. **Trade the field** — traders and submitters share the same market; odds reflect belief about organizer choice.
3. **Seer is infrastructure** — brand Opportunity Markets; credit Seer as protocol only.
4. **Public and plain** — markets are public; copy stays short, English, and free of scout/sponsor jargon.
5. **Preserve the trading core** — design work must not break Seer market list, detail, chart, or swap flows.

## Accessibility & Inclusion

No product-specific accessibility standard was locked beyond general web best practice; prefer readable contrast and keyboard-usable trading controls in future work.
