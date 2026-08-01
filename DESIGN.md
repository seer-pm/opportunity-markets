---
name: Opportunity Markets
description: Auction Lot Wall — dark auction wall with equal lot plaques and violet/red bid motion
colors:
  wall: "#0b0d10"
  plaque: "#161a20"
  plaque-edge: "#2c323c"
  paper: "#f2f4f6"
  muted: "#9aa3b2"
  up: "#8250fe"
  down: "#ea3943"
typography:
  display:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 7vw, 4.5rem)"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Source Sans 3, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  label:
    fontFamily: "Source Sans 3, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.08em"
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
rounded:
  panel: "8px"
  control: "6px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  2xl: "64px"
components:
  button-primary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.wall}"
    rounded: "{rounded.control}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "{colors.up}"
    textColor: "{colors.wall}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "10px 20px"
  filter-selected:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.wall}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
  filter-idle:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
  lot-panel:
    backgroundColor: "{colors.plaque}"
    textColor: "{colors.paper}"
    rounded: "{rounded.panel}"
    padding: "24px"
  status-chip:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.control}"
    padding: "4px 10px"
---

# Design System: Opportunity Markets

## Overview

**Creative North Star: "Auction Lot Wall"**

A matte black auction wall where two to four live opportunities hang as equal lot plaques. The wall is quiet; the lots carry the weight. Violet and red are bid motion (up/down), never decorative accent strips. Composition is Equal Stack: quiet sticky header, product proof, then full-width stacked lots — not a dense catalog grid, not a frost-glass mist world.

Density stays deliberate. Home shows a capped hero set of lots; market detail opens one active lot with outcomes, price history, and a sticky trade plaque. Motion is sparse and meaningful: a short lot-reveal on brand words, a bid-tick when odds move.

**Key Characteristics:**
- Dark wall ground with elevated plaque lots
- Equal hero lots (not a dense card grid)
- Archivo display + Source Sans 3 body + JetBrains Mono odds
- Soft-square plaques and controls (tight radius, no pills)
- Violet up / red down as the live board language

## Colors

Dark auction wall with plaque elevation and signal motion only.

### Primary
- **Up** (#8250fe / lch(49 99.84 307.04)): Rising odds, brand highlight on “Markets”, primary hover fill, focus rings, positive bar segments.
- **Down** (#ea3943): Falling odds and negative bar segments. Pair with Up as a motion pair — never as brand chrome alone.

### Neutral
- **Wall** (#0b0d10): Page ground and sticky header wash.
- **Plaque** (#161a20): Lot panels, filter shells, outcome lists, trade surfaces.
- **Plaque Edge** (#2c323c): Reserved edge tone when a harder divider than paper/10 is needed.
- **Paper** (#f2f4f6): Primary text and primary control fill.
- **Muted** (#9aa3b2): Supporting copy, meta labels, idle filter text.

### Named Rules
**The Bid Motion Rule.** Violet and red mark real odds direction and outcome share. Brand may also highlight the wordmark “Markets”, the hero verb phrase (“markets decide”), Active status, and primary hover/focus — not arbitrary chrome fills.

**The Wall/Plaque Rule.** Content sits on Plaque; the page is Wall. Do not invert that stack into light-mode cards on dark chrome.

## Typography

**Display Font:** Archivo (with system-ui)
**Body Font:** Source Sans 3 (with system-ui)
**Odds / Data Font:** JetBrains Mono (with ui-monospace)

**Character:** Archivo is the auctioneer — condensed confidence for brand and lot titles. Source Sans 3 is the catalog voice — readable proof and UI. JetBrains Mono is the ticker — odds and measured liquidity only.

### Hierarchy
- **Display** (700, clamp 2.5rem–4.5rem, line-height 0.95): Home hero brand line; market titles use a slightly smaller display clamp.
- **Title** (600, ~1.25rem–1.85rem clamp on lots): Lot headings and section titles (Outcomes).
- **Body** (400/500, 1rem–1.125rem, relaxed): Product proof, descriptions, empty states.
- **Label** (600, 0.75rem, uppercase, 0.08em tracking): Filters, status chips, meta keys, primary button text.
- **Mono** (600, ~1.125rem–1.875rem tabular): Leading odds and liquidity figures.

### Named Rules
**The Ticker Rule.** Mono is for numbers that move or measure. Do not set marketing sentences in JetBrains Mono.

## Layout

Shell max width 1350px (`max-w-shell`) with horizontal padding 24px / 40px at large breakpoints. Home rhythm: proof row → ~40px gap → Equal Stack of full-width lots with ~20px gutters. Market detail: 8/4 column grid at large screens — narrative + outcomes left, sticky trade plaque right (`top-24` under the sticky header). Vertical density prefers roomy plaque padding (24–32px) over cramped dashboards.

### Named Rules
**The Equal Lot Rule.** Featured opportunities share the same full-width plaque treatment. Do not promote one market into an inset hero card while demoting others to a dense grid.

## Elevation & Depth

Plaque lift: lots rise from the wall with a soft structural shadow and a hairline paper border — not glass mist, not multi-layer glow. Sticky header uses a translucent wall wash plus light blur so lots can scroll underneath without competing chrome.

### Shadow Vocabulary
- **Lot** (`box-shadow: 0 8px 28px rgba(0, 0, 0, 0.35)`): Default lift under `.lot-panel`; strengthens slightly on lot hover with an up-tinted border.
- **Panel** (`box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45)`): Reserved deeper lift when a surface must sit above the lot plane.

### Named Rules
**The No Mist Rule.** Depth is border + shadow on opaque plaque. Do not revive frost glass, shader mist, or heavy backdrop blur on content panels.

## Shapes

Soft-square language throughout: panels at 8px, controls at 6px. Status chips, filter segments, and primary buttons share the control radius. Outcome share bars and probability tracks use the same soft-square clip. Never pill-shaped (`rounded-full`) controls.

### Named Rules
**The Soft-Square Rule.** If a control looks like a capsule, it is wrong for this system.

## Components

### Buttons
- **Shape:** Soft-square (6px)
- **Primary:** Paper fill, Wall text, uppercase label tracking; hover fills Up. Used for Connect Wallet, Retry, and decisive actions.
- **Secondary / Ghost:** Transparent with paper/15 border, Paper text; hover border shifts toward Up/40.
- **Focus:** 2px Up outline, 2px offset on all interactive controls.

### Chips / Filters
- **Filter shell:** Plaque background, paper/15 border, 4px inset padding holding segmented soft-square buttons.
- **Selected:** Paper fill, Wall text.
- **Idle:** Transparent, Muted text; hover to Paper text.
- **Status chip:** Hairline paper/15 border, Muted uppercase label (Active / Closed). Market type on detail can invert to Paper fill / Wall text for hierarchy.

### Cards / Containers (Lot Panel)
- **Corner Style:** Panel radius (8px)
- **Background:** Plaque
- **Shadow Strategy:** Lot shadow (see Elevation)
- **Border:** 1px paper at 10% opacity; hover may tint border toward Up/40
- **Internal Padding:** 24px default; 32px on larger lot previews

### Inputs / Fields
- Trade inputs live inside the trade plaque (SwapWidget). Match plaque ground, soft-square controls, Paper/Muted text, and Up focus — no light-mode form islands.

### Navigation
- Sticky header on Wall/90 with bottom paper/10 rule. Wordmark: Archivo “Opportunity” in Paper + “Markets” in Up. Primary action is the Connect Wallet chip. Footer mirrors the wordmark and a muted “Built on Seer” credit that hovers to Up.

### Lot Preview (signature)
Full-width Equal Stack plaque: status + liquidity meta, Archivo title, segmented outcome strip (Up/Down tones), then leading odds in mono with optional Up/Down tick label. Hover lifts border toward Up and title toward Up.

### Outcome List (signature)
Single lot-panel with divided rows: mono index, Archivo outcome name, mono odds with bid-tick, thin probability track. Held positions wash the row with Up/5.

## Do's and Don'ts

### Do:
- **Do** keep Opportunity Markets product copy and Seer browse/trade flows intact.
- **Do** give each of 2–4 featured markets equal hero presence in the stack.
- **Do** use violet/red only for real odds motion and outcome share.
- **Do** keep controls soft-square (6px) and panels at 8px.
- **Do** credit Seer as protocol (“Built on Seer”, “View on Seer”) without making Seer the product brand.

### Don't:
- **Don't** revive Dusk Shader Mist, frost glass, or misty blur panels as the world.
- **Don't** ship a dense many-card catalog grid as the home default.
- **Don't** add submit-proposal CTAs on marketing or browse surfaces.
- **Don't** use Paradigm scout/sponsor/talent framing.
- **Don't** use pill radii, neon glow, or crypto-HUD chrome; Up violet is bid signal, not decoration.
