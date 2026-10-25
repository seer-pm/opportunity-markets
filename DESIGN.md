---
name: Seer Opportunity Markets
description: Electric Foundation for live opportunity markets, proposal evidence and trading
colors:
  brand-purple: "#7d33ff"
  brand-purple-hover: "#6925df"
  brand-purple-on-ink: "#8f55f7"
  brand-ink: "#141223"
  brand-white: "#ffffff"
  on-ink: "#f2edff"
  on-ink-muted: "#b9b1ca"
  ink-border: "#39314a"
  page-light: "#f7f7f9"
  surface-light: "#ffffff"
  surface-raised-light: "#f1f1f4"
  text-light: "#17171c"
  muted-light: "#5c5c66"
  border-light: "#e2e2e9"
  accent-soft-light: "#efe9fc"
  accent-text-light: "#6c2bd9"
  positive-light: "#13795b"
  negative-light: "#c0283f"
  series-1-light: "#7d33ff"
  series-2-light: "#b8860b"
  series-3-light: "#2a78d6"
  series-4-light: "#d55181"
  page-dark: "#101013"
  surface-dark: "#1a1a1e"
  surface-raised-dark: "#1f1f24"
  text-dark: "#ededf2"
  muted-dark: "#a8a8b3"
  border-dark: "#34343c"
  accent-soft-dark: "#241e33"
  accent-text-dark: "#b18aff"
  positive-dark: "#3ecf8e"
  negative-dark: "#ff6b81"
  series-1-dark: "#8f55f7"
  series-2-dark: "#b5850f"
  series-3-dark: "#3987e5"
  series-4-dark: "#d55181"
typography:
  display:
    fontFamily: "\"Open Sans Variable\", \"Open Sans\", ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2rem, 3.7vw, 3rem)"
    fontWeight: 600
    lineHeight: 1.16
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "\"Open Sans Variable\", \"Open Sans\", ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 3.4vw, 2.75rem)"
    fontWeight: 600
    lineHeight: 1.18
    letterSpacing: "-0.025em"
  section:
    fontFamily: "\"Open Sans Variable\", \"Open Sans\", ui-sans-serif, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: "32px"
    letterSpacing: "-0.025em"
  title:
    fontFamily: "\"Open Sans Variable\", \"Open Sans\", ui-sans-serif, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: "28px"
  lead:
    fontFamily: "\"Open Sans Variable\", \"Open Sans\", ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.625
  body:
    fontFamily: "\"Open Sans Variable\", \"Open Sans\", ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.625
  compact:
    fontFamily: "\"Open Sans Variable\", \"Open Sans\", ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.625
  small:
    fontFamily: "\"Open Sans Variable\", \"Open Sans\", ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "\"Open Sans Variable\", \"Open Sans\", ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.3
  caption:
    fontFamily: "\"Open Sans Variable\", \"Open Sans\", ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "16px"
  input:
    fontFamily: "\"Open Sans Variable\", \"Open Sans\", ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.4
  button:
    fontFamily: "\"Open Sans Variable\", \"Open Sans\", ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.2
rounded:
  "sm": "4px"
  "md": "10px"
  "full": "9999px"
spacing:
  "4": "4px"
  "8": "8px"
  "12": "12px"
  "16": "16px"
  "20": "20px"
  "24": "24px"
  "32": "32px"
  "40": "40px"
  "48": "48px"
  "64": "64px"
components:
  button-primary:
    backgroundColor: "{colors.brand-purple}"
    textColor: "{colors.brand-white}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.brand-purple-hover}"
    textColor: "{colors.brand-white}"
  button-secondary:
    backgroundColor: "{colors.accent-soft-light}"
    textColor: "{colors.accent-text-light}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "40px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.text-light}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "40px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-light}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "40px"
  input:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.text-light}"
    typography: "{typography.input}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
    height: "44px"
  card:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.text-light}"
    rounded: "{rounded.md}"
    padding: "20px"
  status-active:
    backgroundColor: "transparent"
    textColor: "{colors.positive-light}"
    typography: "{typography.caption}"
    rounded: "{rounded.sm}"
    padding: "4px 8px"
  navigation-active:
    backgroundColor: "{colors.accent-soft-light}"
    textColor: "{colors.accent-text-light}"
    rounded: "{rounded.sm}"
    padding: "0 12px"
    height: "32px"
  button-secondary-dark:
    backgroundColor: "{colors.accent-soft-dark}"
    textColor: "{colors.accent-text-dark}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "40px"
  button-outline-dark:
    backgroundColor: "transparent"
    textColor: "{colors.text-dark}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "40px"
  button-ghost-dark:
    backgroundColor: "transparent"
    textColor: "{colors.text-dark}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "40px"
  input-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-dark}"
    typography: "{typography.input}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
    height: "44px"
  card-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.md}"
    padding: "20px"
  status-active-dark:
    backgroundColor: "transparent"
    textColor: "{colors.positive-dark}"
    typography: "{typography.caption}"
    rounded: "{rounded.sm}"
    padding: "4px 8px"
  navigation-active-dark:
    backgroundColor: "{colors.accent-soft-dark}"
    textColor: "{colors.accent-text-dark}"
    rounded: "{rounded.sm}"
    padding: "0 12px"
    height: "32px"
---

# Design System: Seer Opportunity Markets

## Overview

**Creative North Star: "Electric Foundation"**

Electric Foundation makes Opportunity Markets read as one Seer application: Open Sans, electric purple actions, neutral reading surfaces and quiet hairlines. The same identity applies to home, archive, market detail, proposal evidence, discussion and wallet controls. The Seer bird and wordmark remain the brand, followed by the exact application name, Opportunity Markets.

Density serves comparison. Names, prices and responsible identities remain readable before the trading action. Light and dark share the same hierarchy; ink sections and the ecosystem footer retain their dark material in both themes. Motion is brief and supports state changes.

**Key Characteristics:**

- One Seer lockup, shared kit controls and an ink ecosystem footer.
- Theme-aware neutral surfaces with electric purple actions and text accents.
- Open Sans throughout, tabular figures and monospace for literal addresses and hashes.
- Hairlines at rest, modest floating shadows and kit radii.
- Four stable chart colors with additional available histories in muted context.

The implementation uses the vendored `@seer-pm/ui-kit` (0.4.0) at `vendor/seer-pm-ui-kit-0.4.0.tgz`. Its `css/tokens.css`, `css/base.css`, `css/components.css`, Tailwind preset and React exports own shared visual decisions. Application mappings live in `tailwind.config.js`; layered imports and discussion/toast integrations live in `src/index.css`. This document records the build; it does not certify a completed visual audit.

## Colors

Electric purple marks actions and emphasis against a neutral reading palette. The frontmatter contains exact kit values; suffixes identify the light and dark versions of a semantic role.

### Primary

- **Electric Purple:** Primary actions use `brand-purple`, with `brand-purple-hover` for an enabled hover and `brand-white` for the label.
- **Readable Accent:** `accent-text-light` and `accent-text-dark` carry links, selected text and focus. `accent-soft` provides the corresponding quiet selection fill.
- **Purple on Ink:** `brand-purple-on-ink` colors the shared line motif within ink sections.

### Secondary

- **Chart series:** Four ordered slots use purple, gold, blue and rose. A name keeps its occupied slot while a peer is sorted or unfollowed. Two-sided readings use slots one and two. Further available histories use muted text color as context.
- **Status:** Positive and negative roles carry gains, losses, errors and the active market state. A status is also written in text.

### Neutral

- **Page:** The reading ground, including the sticky header.
- **Surface:** Opaque market cards, outcome containers, trade panels, inputs and discussion surfaces.
- **Raised surface:** Hover and disabled-control separation, and probability-track grounds.
- **Text / muted:** Main reading and secondary explanation. Odds remain in this palette.
- **Border:** Resting hairlines and section dividers. A stronger application divider mixes border with text at 20%.
- **Ink:** `brand-ink`, `on-ink`, `on-ink-muted` and `ink-border` define the footer and intentional ink fields in both themes.

The system follows the operating-system theme until the reader toggles it. The pre-paint script and the theme hook share `seer-opportunity-theme`; the persisted choice also controls the wallet modal. Do not pin a reading surface to a light value inside dark mode.

**The Shared Authority Rule.** Shared colors, radii, font stacks, lockup and ecosystem components come from @seer-pm/ui-kit. Local semantic aliases map to those tokens without redefining their values.

**The Series and Status Rule.** Series colors identify outcomes. Positive and negative colors describe gains, losses and errors. Price values use text colors; a series color never stands in for a gain or loss.

## Typography

**Display and body font:** Open Sans Variable, Open Sans, then the kit's sans-serif fallback stack. Font files ship through the kit's fonts import.

**Literal-data font:** `ui-monospace, monospace`, only for addresses and hashes.

The type is direct and readable. Semibold establishes hierarchy without decorative tracking. Tabular figures are enabled globally, so changing amounts remain aligned.

### Hierarchy

- **Display:** Responsive home headline, semibold, with tight tracking and balanced wrapping. The frontmatter records its clamp and line height.
- **Headline:** Responsive market question, semibold. Archive uses a local responsive heading between 30px and 36px.
- **Section / title:** Section headings at 24px; card titles, outcome headings and prominent odds at 20px. Some section titles grow to 30px at wider widths.
- **Lead / body:** Current market reading at 18px; explanatory body text at 16px, with relaxed leading and a typical maximum measure of 65 characters.
- **Compact:** Supporting descriptions, rows and standard small UI text at 14px.
- **Small:** Compact chart legend names and values, trade-notice details, hints and footer support at 13px. Trade-notice details use relaxed leading; legend rows inherit their control's line height.
- **Label:** Field labels and compact buttons use 13px semibold. Labels use sentence case without decorative uppercase tracking.
- **Caption:** Market status, liquidity context and identity labels at 12px.
- **Input / button:** Standard inputs use 15px. Standard buttons use 14px semibold; compact buttons use 13px and large transaction buttons use 15px.

**The Numeric Reading Rule.** Use Open Sans with tabular figures for prices, percentages, counts and balances. Reserve monospace for literal addresses and hashes.

## Layout

The shared shell has a maximum width of 1350px, with horizontal gutters of 16px, 24px from the small breakpoint and 40px from the large breakpoint. Footer edges align with the same column. Common internal spacing follows the frontmatter scale; panels use 20px on small screens and commonly 24px on larger screens. Major detail sections use 32px gaps, with 48px to 64px between home sections.

The header is sticky and opaque with a bottom hairline. At large widths it occupies one row with a minimum height of 72px. Below the large breakpoint, the full lockup occupies its own row and navigation, theme and wallet actions occupy the next. At a 390px viewport, the approximately 326px lockup fits inside the 358px content column without scaling its artwork.

Home uses a two-column desktop introduction: explanatory material on the left and live market evidence on the right. Its mobile and DOM reading order is heading, live market evidence, explanation, then actions. Detail places the question and market brief across the top, then uses an eight-column evidence area and a four-column trading area within a twelve-column desktop grid. Small screens stack these areas; the mobile trade link targets the transaction section. Archive uses a vertical market stack with proposal imagery inside each relevant card.

Tailwind's application breakpoints remain 640px, 768px, 1024px, 1280px and 1536px. Layouts must handle long outcome names, wrapping identity rows and narrow trade controls without horizontal page scrolling. Route changes reset scroll by pathname or hash; changing the selected outcome through query parameters preserves the reader's place.

## Elevation & Depth

Resting cards have no cast shadow. Tonal separation, one-pixel borders and spacing establish the hierarchy. The header stays on the page material. Floating lightboxes, dropdowns and toasts may use the panel shadow recorded in the sidecar. Ink sections use the shared line motif as a bounded background, with text remaining on a readable ink field.

**The Flat Surface Rule.** Resting content surfaces use an opaque theme surface and a hairline. Reserve floating shadows for overlays, menus and notices. An inset outline on a button is a border treatment.

## Shapes

Kit radii have three jobs: compact controls and badges use `sm`; surfaces, inputs and outcome containers use `md`; pills, circular avatars and chart geometry use `full` when their shape requires it. Their exact values are in the frontmatter. Do not introduce page-specific surface radii. Borders stay quiet and thin; emphasis comes from readable text, selection fills and focus rather than heavy ornament.

## Components

### Buttons

Compact, plain controls use the kit's primary, secondary, outline and ghost APIs. Standard height is at least 40px with 16px horizontal padding; small controls are 32px with 12px padding; large transaction actions are 48px with 22px padding. The primary label is white, the secondary uses accent text on accent soft, and outline/ghost variants use text colors. Enabled hover changes the relevant fill or outline; focus uses the accent outline. Disabled controls halve opacity and stop acting pressable. Busy actions keep their label and add a spinner.

### Chips

Market status uses a compact bordered badge: positive text and a positive-tinted hairline for Active, muted text and the standard border for Closed. Discussion position badges use accent-soft fill and normal text, with a theme border. Filled position badges must not put white text on the accent-text color.

### Cards / Containers

A surface, hairline and medium radius define the market card and trading panel. Market cards show the title, liquidity and either a current ranked reading or a payout-confirmed winner. Historical odds, when retained, are explicitly labeled historical. The whole card reading area links to detail; proposal-image controls and the footer action keep their own interactions. Preview probability tracks use neutral ink and a raised-surface ground.

### Inputs / Fields

Standalone fields use the kit surface, medium radius, one-pixel border, minimum height of 44px and 10px by 12px padding. The focus state strengthens the border and adds a two-pixel accent outline. Placeholder text is muted; disabled fields use the raised surface; invalid fields use the negative border. Amount groups share an outer field and align the token affix or picker without nesting a second box. Search fields have accessible labels.

### Navigation

Use the kit's bird and wordmark followed by the exact `Opportunity Markets` application label behind its separator. Header and footer share this lockup. Active page links use accent-soft fill, readable accent text and `aria-current`. The theme toggle has an accessible action label. The footer retains its ink surface, ecosystem navigation, social links and shared artwork in either theme.

### Market Brief

The current reading follows the market question and precedes proposal evidence and the trade. Active markets show the live leader with the existing cap-aware odds treatment. Finalized markets show winners obtained from verified payout numerators. Creator and resolution arbitrator are labeled separately, with their literal addresses and explorer links when available. Volume and liquidity remain ordinary tabular text. Human-readable identity names require verified attribution.

### Outcome List and Price History

Outcome rows align index, name and price; selecting a row preserves its original transaction outcome index. Search, proposal evidence, selection labels and holdings remain legible without depending on color alone.

Charts provide up to four followed names with stable slots. Additional fetched histories remain muted context; this does not imply that every market outcome has a loaded history. The naming market retains its existing top-ten fetch policy. A searchable legend exposes available chart names and the four-series limit. A selected line is thicker than context; chart values use text colors, and colored last-value axis boxes are hidden. Canvas colors are read from current theme tokens and update with the theme; visible time range is preserved when series are changed.

### Proposal Lightbox and Notices

The lightbox keeps the existing portaled overlay and its focus/keyboard behavior, using kit internals for the panel and controls. Body-level transaction toasts remain operable above it. Toasts use the app surface, border and status roles. Notices name the issue in text with a status icon and hairline; explanatory detail uses the 13px small-text role.

Standard state transitions use the kit's fast duration and easing. The home reading entrance is brief, and transaction notices enter with a small vertical movement. Reduced-motion preferences remove these entrances and the kit's control transitions.

## Do's and Don'ts

### Do:

- **Do** use the shared kit tokens and components across every route and theme.
- **Do** keep the complete Seer | Opportunity Markets lockup on mobile and desktop.
- **Do** use the 13px small-text role for compact legend values, explanatory notices and field support.
- **Do** pair status color with text, and keep numeric prices in the text palette.
- **Do** keep payout-confirmed results distinct from historical prices.
- **Do** keep keyboard focus visible and respect reduced motion.

### Don't:

- **Don't** set odds or balances in monospace.
- **Don't** cycle the four chart colors or imply that every outcome has fetched chart history.
- **Don't** use accent-text tokens as filled badge backgrounds with white text.
- **Don't** add resting card shadows, arbitrary radii, eyebrows or uppercase label tracking.
- **Don't** replace unknown creator or arbitrator identities with invented human names.
- **Don't** redefine shared kit values in application CSS.
