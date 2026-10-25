# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Who asks

Teams, DAOs and organizers running a selection process ask which community submissions are likely to be chosen. The configured opportunities are Seer's rebrand, Devcon Mumbai merch and the name of Seer's AI job board. Market prices inform review; the responsible team makes the selection.

## Users

Reviewers use the market as a signal to prioritize submissions. Community members explore proposals and may have submitted one. Traders buy and sell outcome shares according to the selection they expect. Holders of winning shares redeem them after finalization.

## Product purpose

Opportunity Markets turns a selection process into a market on Seer. The useful answer is the current priced field of submissions, followed by the evidence behind each proposal and the actions available to a trader. Success means understanding what is being selected, what the market says, who decides and how to inspect or trade an outcome.

## Operating context

A Vite and React 18 SPA on Gnosis with Tailwind 3. Routes: home (`/`), archive (`/archive`) and market detail (`/markets/:chainId/:marketId`). ConnectKit and wagmi connect wallets. The Seer SDK and React hooks supply markets, prices, liquidity, charts and transactions. The naming opportunity flattens three conditional markets into one list; its original outcome indices and transaction routing must remain intact.

## Capabilities and constraints

- Home lists live opportunities. Archive lists finalized markets and links to their redemption panels.
- Detail includes ranked outcomes, search, images, proposals, portfolios, history, discussion, swap and redemption.
- Preserve trading, authentication, credits, balances, mint-to-cover, quote, slippage and redemption behavior.
- Preserve existing factual copy, market descriptions, submissions, prizes, rights and selection terms. Ask before adding or changing a factual claim.
- Requester and resolver attribution must come from verified market or local configuration. An unknown identity stays unknown, never inferred from a wallet address or invented.
- Prices, counts and monetary values must come from live data. Preserve liquidity-edge odds caps and their explanation. A finalized price is not proof of the winning payout; final results come from payout data.
- No invented testimonials, customers, rewards, resolution dates or links. No private scouting or talent-deal framing.
- English interface. No em dashes in copy, comments or repository prose. No eyebrows above headings.

## Brand commitments

Confirmed on 2026-10-23:

- Electric Foundation from the shared `@seer-pm/ui-kit`, initially vendored version 0.4.0. The kit owns shared values and components; local code maps semantic roles without redefining shared values.
- `Seer | Opportunity Markets` in the header and footer, matching `seerApps`.
- The entire app adopts the brand. Redesign market detail, home and archive wherever required for alignment.
- Open Sans throughout, tabular figures; monospace only for literal addresses and hashes.
- Light and dark follow the system until the user chooses. A persisted toggle and a pre-paint head script apply the same theme to the app and wallet modal.
- Hairlines for resting surfaces; shadows for floating UI. Kit radii: compact controls and badges, surfaces and inputs, pills.
- Charts use up to four fixed series slots; further lines are muted context and the reader chooses what to follow. Two sides use series 1 and 2, while gains, losses and errors use status colors. Values use text colors.

## Evidence

Product behavior and factual copy: `src/pages`, `src/config/market.ts`, `src/config/submissions.ts`, `src/hooks/useChainedMarket.ts`, `src/lib/chainedMarket.ts`, swap and redeem widgets. Production baseline captured on 2026-10-23 at 1440 and 390 pixels for all three routes under `.impeccable/review/baseline/` (local, ignored).

## Accessibility

Readable contrast measured in both themes, keyboard access to outcome selection and proposal evidence, semantic headings, labeled controls, visible focus, reduced motion and layouts verified at 390 and 1440 pixels. Color never carries a price or status alone.

## Verification baseline

Base commit: `c213f69` on `main`. There is no test script or tracked test suite. `yarn lint` fails before analysis because ESLint 9 has no configuration file. Record build and lint outcomes per phase under the ignored `.impeccable/review/checks/` directory and compare them with this baseline.
