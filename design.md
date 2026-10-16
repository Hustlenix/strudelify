# Spotify frontend reference audit for Strudelify

Audit date: 2026-10-16. Target: the live Spotify Web Player rendered in Chromium on Windows. Deliverable: a measured design reference for independently implementing Strudelify's interface.

## 1. Reading this specification

This is a rendered-frontend audit: DOM rectangles, computed styles, accessibility states, screenshots inspected during the session, and ordinary navigation. It does not contain Spotify's application source, downloaded fonts, music, album imagery, credentials, or personal library records.

**This document is not a certification of zero pixel difference.** That requires comparing finished implementations at identical viewport, device pixel ratio, browser build, font availability, content, scroll position, sidebar width, and interaction state. A document alone cannot establish that result. The measurements below make that comparison reproducible.

Evidence labels:

- **M — measured:** read from `getBoundingClientRect()` or browser-computed styles in the live page.
- **O — observed:** visible screenshot or accessibility behavior.
- **I — implementation guidance:** an independently authored recommendation derived from measurements.
- **U — unverified:** requires another capture; do not present as an exact Spotify specification.

Coordinates are `[x, y, width, height]` in **CSS pixels**, relative to the viewport. Tables round measurements to two decimals. Fractional values are intentional. Physical screenshot pixels depend on device pixel ratio; 1 CSS pixel is not always 1 device pixel.

## 2. Capture envelope and source pages

The session showed a signed-in account with an empty-library onboarding experience and no selected track. No account settings, saves, follows, purchases, or playback were changed. Home recommendations are personalized and can change independently of layout.

| Surface | Source | Inspected states |
| --- | --- | --- |
| Home | https://open.spotify.com/ | Resting, album-card hover, home filters, onboarding panels |
| Search | https://open.spotify.com/search/ambient | Focused field, autocomplete, results |
| Album | https://open.spotify.com/album/0Rkv5iqjF2uenfL0OVB8hg | Header, action row, track list, row hover, more-options menu |
| Artist | https://open.spotify.com/artist/09UmIX92EUH9hAK4bxvHx6 | Entity header, actions, popular-track table, section hierarchy |
| Playlist | https://open.spotify.com/playlist/37i9dQZF1DX0XUfTFmNBRM | Header, actions, five-column track table |

The first home measurement used 1280 × 720 at DPR 1.25. Controlled desktop viewport samples used 1440 × 900, 1280 × 720, 1024 × 768, 768 × 1024, and 390 × 844 at approximately DPR 1. Desktop emulation was cleared after inspection.

**Capture caveat:** the in-app browser's visible screenshot surface changed size during inspection. An emulated layout viewport can exceed that surface and the displayed screenshot can clip it. The responsive tables use DOM measurements of the declared layout viewport, not dimensions inferred from those clipped screenshots. Responsive samples are desktop rendering with `mobile: false`; they are not captures of Spotify's separate mobile experience.

## 3. Page anatomy: the structural reference

The most important distinction from the current Strudelify layout is the global top navigation. It spans the whole viewport. The library and content panels start beneath it; branding and the Home/Search controls are not stacked down the library panel.

```text
Viewport / black application canvas
├── Global navigation: full width, y=0, height=64
│   ├── Brand symbol
│   ├── Home circle + pill-shaped search + Browse icon
│   └── Upgrade / install / utility icons / avatar
├── Workspace: begins at y=64
│   ├── Library panel
│   ├── 8px resize gutter
│   ├── Independently scrolling main panel
│   ├── 8px gutter
│   └── Optional collapsed right rail, 32px
└── Persistent player: 72px tall, with 8px outer/between-region gutters
```

### Home baseline, 1280 × 720

| Region | M: rectangle | Notes |
| --- | --- | --- |
| Global navigation | `[0, 0, 1280, 64]` | Black background |
| Library | `[8, 64, 280, 568]` | Independent region |
| Library resize gutter | `[288, 64, 8, 568]` | Resting opacity 0 |
| Main region | `[296, 64, 936, 568]` | Rounded enclosing panel, clipped content |
| Player | `[8, 640, 1264, 72]` | Bottom edge y=712; 8px below |
| Player control group | `[387.20, 647.60, 505.60, 56.80]` | Centered within player |

M: the enclosing application grid had 8px padding and 8px gaps. Its columns were `280px 936px 32px`; rows were `0px 40px 568px 72px`. These are computed grid tracks, including internal tracks used by the header. The visually useful global-header height is 64px; do not implement a 40px global bar by reading the grid-row string in isolation.

M: body overflow was hidden on both axes. The main scrolling ancestor used `overflow-x: hidden; overflow-y: scroll`. The rounded main surface used `overflow: hidden`, background `#121212`, and radius 8px. The sidebar contained its own scrolling content region.

I: represent the sidebar width as state. Home was measured at 280px; later detail captures used a 420px library footprint and main x=436. This is a state-dependent layout dimension, not proof of a route-specific width rule.

## 4. Color and surface system

| M: color | Role observed |
| --- | --- |
| `#000000` | Application canvas and global top bar |
| `#121212` | Main panel and lower-page/footer surface |
| `#1f1f1f` | Resting Home circle, resting search field, library Create circle |
| `#2a2a2a` | Focused search field |
| `#282828` | More-options menu surface |
| `#ffffff` | Primary headings, card titles, active icons; white pill interiors |
| `#b3b3b3` | Secondary copy, metadata, resting utility icons |
| `#1ed760` | Card-play button interior |
| `rgba(255,255,255,.1)` | Unselected filter interior and hovered track row |
| `rgba(255,255,255,.3)` | Progress-track background |
| `rgba(255,255,255,.9)` | Menu item foreground |

M: resting cards were transparent in the measured card element; they were not permanently filled with a visibly lighter large tile. A hovered card visibly gained a dark rectangular surface; the exact background-bearing ancestor/pseudo-element was not resolved (**U**). Do not treat the resting element's transparent computed background as evidence that hover has no surface.

M: the inspected album header used artwork-related color: base `rgb(0,59,60)` with `linear-gradient(in oklch, rgb(64,136,136), rgba(0,0,0,0))`. This is a sample for one album, not a universal brand gradient.

I: color should be concentrated in artwork, entity headers, and primary play controls. Neutral black and charcoal supply the frame. Avoid tinting every surface olive or green.

## 5. Typography and text geometry

M: ordinary UI text uses the computed family `SpotifyMixUI`; shelf headings use `SpotifyMixUITitle`. The fallback chain includes regional variants, `Helvetica Neue`, Helvetica, Arial, Japanese system families, and emoji families. Those proprietary font files are not part of this project.

| Element | M: size / weight | M: representative rendered text height |
| --- | --- | --- |
| Body / ordinary UI | 16px / 400 | Depends on element |
| Search text | 16px / 400 | Input line-height computed as `normal` |
| Library heading | 16px / 700 | 22.40px |
| Desktop shelf heading | 24px / 700 | 28.80px |
| Shelf heading at 390px desktop sample | 20px / 700 | 24px |
| Home card title | 16px / 400 | 22.40px |
| Card artist/credit | 14px / 400 | 19.20px |
| Home filter | 14px / 400 | Explicit 14px line-height on chip wrapper |
| Premium pill | 14px / 700 | Native text metrics |
| Album creator credit | 14px / 700 | 19.20px |
| Album title, inspected short title | 96px / 800 | 115.20px |
| Playlist title, inspected longer title | 72px / 800 | 86.40px |
| Track title | 16px / 400 | 22.40px |

M: letter spacing on sampled text computed as `normal`. Many line heights also computed as `normal`; the measured rectangles above describe the resulting geometry, not a universal explicit CSS line-height declaration.

I: choose an available font and measure it before promising matching wraps. Font substitution changes word width, glyph shape, baseline, title fitting, card height, and ellipsis. Match title and metadata hierarchy without applying bold to every card name. Fit entity titles to available space; do not assign 96px to every title.

## 6. Global navigation

### Baseline dimensions

| Component | M: rectangle / style |
| --- | --- |
| Brand glyph | 32 × 32; white |
| Home circle | `[88, 8, 48, 48]`; 12px padding; 24px white glyph |
| Search input | `[144, 8, 474, 48]`; radius 500px |
| Search text padding | `12px 96px 12px 48px` |
| Browse glyph/button | `[578, 20.42, 24, 24]` |
| Premium button | `[855.45, 16, 143.20, 32]` |
| Premium interior | White / black; `4px 16px` padding; pill radius |
| Utility icon samples | 16 × 16 |

O: search includes a left search glyph, text, an optional clear control when populated, a right separator, and Browse. The shape remains a single large pill.

M: Home-circle transition was background/color over 0.2s ease-in-out. Search transitions were box-shadow, background, and color over 0.22s ease-in. Focused search background was `#2a2a2a`, with a white 2px **inset** box-shadow.

M: at 1440px width the Home/search cluster was centered differently: Home `[455,8,48,48]`, search `[511,8,474,48]`. At 1280 it used the left positions above. This proves at least two placement modes; the exact switch point was not measured.

I: use actual SVG icons with consistent view boxes and stroke/fill treatment. Unicode approximations such as house/search/previous glyph characters have different baselines, widths, and rendering across systems.

## 7. Library panel

M: baseline library width 280px, y=64, height 568px. Header `[8,64,280,59]` with padding `16px 16px 8px` and gap 8px. The heading text was `[28,86.30,90.09,22.40]`, 16px/700 and white. Create was `[237,80,35,35]`, background `#1f1f1f`, pill/circle radius, padding 8px, icon/foreground `#b3b3b3`.

O: the empty library had onboarding cards stacked vertically, including an optional import promotion and two creation/discovery prompts. The import promotion was present in initial home/search and absent after later navigation. Do not make it a permanent structural block or hard-code its presence into vertical coordinates.

O: the shell exposes a library-collapse control and an 8px resize gutter with slider semantics. The resizing range, collapse animation, and expanded-library list density were not measured. No playlist was created to populate the library.

I: put library-specific controls in this panel. Keep global branding/Home/Search in the global navigation. Preserve sidebar scroll position independently of main content navigation.

## 8. Home composition and shelves

M: baseline home filter row `[336,82,198.89,36]`. The selected chip was `[336,84,40.61,32]`, white interior and black text, padding `4px 12px`, fully rounded. The next chip began at x=384.61, giving an 8px inter-chip gap. Unselected chip interior used white at 10% opacity with white text.

M: the main panel began at x=296; home content began at x=336, a 40px inset. A visually hidden semantic Home heading existed at approximately `[295,131,1,22.4]`; it was not the prominent visible greeting used by the current Strudelify home screen.

O: initial visible content paired a getting-started module with a popular-albums shelf, then stacked full-width shelves below. This is an onboarding-specific composition; it is not evidence that all signed-in homepages use this composition.

### Album/playlist card specimen at 1280px

| Component | M: geometry / style |
| --- | --- |
| First inspected shelf | `[780.31,132,411.69,328.93]` |
| Shelf heading | `[780.31,151.20,296.91,28.80]`; 24px/700 |
| Card outer element | `[768.31,188,177.73,250.53]`; padding 12px; radius 6px |
| Card interior gap | 8px vertical gap |
| Square cover | `[780.31,200,153.73,153.73]`; radius 6px |
| Cover shadow | `0 8px 24px rgba(0,0,0,.5)` |
| Card title | `[780.31,361.73,75.10,22.40]`; 16px/400 |
| Credit text | Starts y=388.13; 14px/400; `#b3b3b3` |
| Play button | 48 × 48; green interior; black glyph; fully rounded |

M/O: the play button's resting measured top was y=305.73; on hover it was y=297.73, an 8px upward movement. Hover made the button visibly appear over the artwork's lower-right corner. The settled hovered button right edge sat 8px inside the artwork's right edge; its bottom edge sat 8px above the cover bottom. The exact opacity timing of the reveal wrapper was not measured.

M: button-level transitions included `background-color` and `transform` at 0.15s with `cubic-bezier(0.3,0,0,1)`. This is not evidence that every card animation uses that timing.

O: horizontal shelves show partially clipped cards at the right edge and carousel arrows on hover. A shelf is not simply a grid that always wraps every album into a second row. Headings align with artwork interiors, while card hit areas extend 12px outward from that edge.

O: the visible Show all affordance sits at the heading row's right edge. A selector named `see-all-link` also matched a heading link; do not infer the small Show all typography from that selector alone. **U:** its exact text metrics remain to be captured.

## 9. Search states

O: focusing search expands a combobox; typing opens an autocomplete popup. It includes query suggestions and mixed media results with type-specific actions. Keyboard navigation hints and a view-all-results control are present. Clearing and Browse controls occupy the input's right area.

M: one popup root at the narrower live viewport measured `[130.40,56,379.60,398]`. Its root was transparent; this measurement does not establish its inner surface color or shadow. It is not the 1280px popup width.

O: results were reached through a visible query-suggestion link. Search-result filters were pill controls. The inspected query produced a featured genre result, a horizontal playlist shelf, and vertically stacked media rows. Results depend on query and account/region; do not hard-code this arrangement for all searches.

### Narrow search specimen, live viewport about 510 × 662

| Element | M: rectangle / property |
| --- | --- |
| Results content start | x=298.40 |
| Filter row | `[298.40,80,424,32]` |
| Featured result | `[298.40,128,424,104]` |
| Featured media image | `[314.40,144,72,72]` |
| Secondary shelf heading | 20px; y=272 |
| Shelf card slot | 133.33px wide |
| Shelf cover | 109.33 × 109.33; 12px inset |
| Ordinary result row | 424px wide × 64px high |
| Ordinary result cover | 48 × 48 |
| Trailing action group | 52 × 32 |

These coordinates extend beyond the narrow screenshot because the desktop shell overflows the viewport. They are useful measurements of the rendered desktop layout, not a mobile design recommendation.

## 10. Album and playlist detail

The following specimen used a 1280 × 720 viewport **with a wider sidebar state**: main `[436,64,796,568]`. Do not combine its x coordinates with the 280px-sidebar home baseline.

| Component | M: rectangle / property |
| --- | --- |
| Entity header | `[436,64,796,227.60]` |
| Header bottom padding | 19.6981px |
| Cover / playlist image | `[455.69,95.84,176.07,176.07]` |
| Cover radius | 4px for inspected album cover |
| Cover shadow | `0 4px 60px rgba(0,0,0,.5)` |
| Album title | `[651.45,126.31,556.86,115.20]`; 96px/800 |
| Playlist title | `[651.45,134.31,556.86,86.40]`; 72px/800 |
| Action bar | `[436,291.60,796,95.38]` |
| Action bar padding | 19.6981px |
| Action row | `[455.69,311.29,756.63,56]`; gap 19.6981px |
| Large Play button | 56 × 56 |
| Save / More button boxes | 32 × 56; `12px 0` padding |
| Track grid | Starts `[455.69,386.98,756.63,...]`; radius 4px |

O: the header pairs square art with type, title, description where present, creator credit, and compact metadata. Actions include Play, an explore/preview control, shuffle, save, download, More, and a view-mode selector. Their availability depends on account and entity.

M: non-integer padding was present on this capture. **U:** the formula generating it was not extracted. Preserve measured values for this specimen; use a responsive sizing system rather than rounding every detail inset to a guessed 20px or 24px and calling it exact.

## 11. Track tables

| Component | M: property |
| --- | --- |
| Header row specimen | `[456.49,387.77,755.03,36.80]` |
| First content row | `[456.49,436.26,755.03,56]` |
| Content row height | 56px |
| Row padding | `0 16px` |
| Column gap | 16px |
| Row corner radius | 4px |
| Hovered row background | `rgba(255,255,255,.1)` |
| Track title | 16px/400, white |
| More button | 16 × 32; `8px 0` padding |

M: album row computed columns were `[index] 16px [first] 538.737px [last] 134.675px` for the measured content row. The album table omits a redundant Album column.

M: playlist content-row columns were `[index] 16px [first] 260.712px [var1] 130.35px [var2] 130.363px [last] 120px`. These represent index, title/artist, album, date-added, and trailing duration/actions. Column headers had slightly different fractional widths; do not copy a header's full computed grid string onto every content row without checking borders and available width.

O: row indexes share their region with hover play controls. Artist links form a secondary line; trailing like and More actions appear in the duration/actions area. Rows expose selection semantics, and headers expose column-resize controls. The number of columns differs by view.

U: actual double-click playback, multi-selection behavior, resize persistence, drag reorder, table keyboard navigation, and sticky-header position after scrolling were not verified. An attempted wheel inspection did not change measured scroll coordinates, so this document does not claim sticky-scroll measurements.

## 12. Artist variant

M: artist header in the inspected state shared the 227.60px entity-header height and the 56px action-row height of the detail specimens. The title used an adaptive-title wrapper. A Popular section heading was 24px/700, and popular-track rows were 56px high. The popular table included artwork and a play-count column, unlike the album table.

O: verification status, a listener statistic, Follow, More, a popular-track section, and further discography/collection sections were visible. Follow was not activated. The current capture is not evidence that every artist always uses a large full-bleed photographic masthead.

U: exact artist-name glyph metrics, responsive hero variants, follow-state appearance, and artist collection-card hover variants need dedicated measurements.

## 13. More-options menu

| Component | M: property |
| --- | --- |
| Menu specimen | `[743,376,191.34,210]` |
| Menu minimum width | 160px |
| Surface | `#282828` |
| Outer padding / radius | 4px / 4px |
| Item height | 40px |
| Item padding | `8px 8px 8px 12px` |
| Item radius | 2px |
| Item color | White at 90% opacity |
| Menu shadow 1 | `0 16px 24px rgba(0,0,0,.3)` |
| Menu shadow 2 | `0 6px 8px rgba(0,0,0,.2)` |

O: the album menu exposed library, radio, playlist, share, and desktop-app actions; some entries had submenus. The menu was inspected without invoking any action. Position is anchored to the trigger and constrained by available space; `[743,376]` is a specimen, not a fixed global menu location.

## 14. Persistent player

M: player `[8,640,1264,72]` at 1280 × 720. Central controls occupied 505.60px, exactly 40% of the player's 1264px width in this capture. The same 40% relationship held in the other recorded desktop samples; treat the broader layout model as an inference until side-region measurements are complete.

| Element | M: rectangle / style |
| --- | --- |
| Central control stack | `[387.20,647.60,505.60,56.80]` |
| Transport row | `[387.20,647.60,505.60,32]`; gap 16px |
| Transport bottom margin | 8px |
| Main Play/Pause | `[624,647.60,32,32]`; white interior, black icon |
| Disabled Play/Pause interior | Opacity .3 in the no-track state |
| Progress container | `[445.20,690,389.60,12]` |
| Visible progress line | `[445.20,694,389.60,4]`; radius 2px |
| Progress line color | White at 30% opacity |
| Timeline row | 16.80px high; 8px gaps |
| Volume group | `[1107,660,125,32]`; 8px right margin |

O: control order is shuffle, previous, central Play/Pause, next, repeat. The right region provides queue, device selection, mute/volume, and fullscreen. No track was selected, so transport controls and progress were disabled and times showed unavailable placeholders. The left artwork/title region was not populated.

U: active-track artwork dimensions, elapsed-time updates, scrub thumb hover, actual volume interactions, repeat/shuffle enabled states, queue panel layout, and playback animation need another authorized playback capture.

I: Strudel patterns are indefinite live compositions. Keep the familiar transport geometry, but represent that timing honestly. Do not draw a seek control that appears operational if there is no meaningful seek operation.

## 15. Responsive measurements

All rows below are controlled **desktop** rendering samples. The left panel remained 280px during this home sampling sequence. These are observations at discrete widths, not a complete breakpoint map.

| Layout viewport | Main rectangle | Player rectangle | Home/search rectangles |
| --- | --- | --- | --- |
| 1440 × 900 | `[296,64,1096,748]` | `[8,820,1424,72]` | Home `[455,8,48,48]`; search `[511,8,474,48]` |
| 1280 × 720 | `[296,64,936,568]` | `[8,640,1264,72]` | Home `[88,8,48,48]`; search `[144,8,474,48]` |
| 1024 × 768 | `[296,64,680,616]` | `[8,688,1008,72]` | Home `[88,8,48,48]`; search `[144,8,447.45,48]` |
| 768 × 1024 | `[296,64,456,872]` | `[8,944,784,72]` | Header extends to 800px; search width 374.65px |
| 390 × 844 | `[296,64,456,692]` | `[8,764,784,72]` | Header extends to 800px; search width 379.60px |

M: at 768px and 390px, the grid retained columns `280px 456px 32px`, creating an 800px shell wider than the viewport. This inspected desktop document did not turn into a mobile bottom-navigation application merely because it was narrow.

M: at 1440px and 1280px the onboarding module and album shelf shared a row. At 1024px they stacked: the album shelf began at y=436 with artwork at y=504. The exact container-width threshold lies between the sampled configurations and remains unmeasured.

M: first home cover sizes were 171.50px at 1440 and 153.73px at 1280. At 1024 and the narrower desktop samples, this specimen remained approximately 153.73px. Headings changed from 24px at the 768px sample to 20px at the 390px sample. Intermediate thresholds remain unmeasured.

U: a real mobile user agent, mobile navigation, touch targets, orientation changes, safe areas, and reduced-motion behavior were not captured. Design a deliberate Strudelify mobile experience, but label it as a project design decision until a matching mobile reference is inspected.

## 16. Footer and lower content

M: the footer navigation surface used `#121212` with padding `8px 24px 40px`. Its measured height depended on the capture: about 423.20px on the earlier home document and 429.60px on the playlist specimen. Content above it changes its y position substantially.

O: it groups organizational, community, product/help, plan, social, and legal links. The footer scrolls with main content rather than occupying the transport region. Detailed footer column widths and line spacing were not sampled.

## 17. Interaction and accessibility inventory

| Component | O: exposed behavior / semantics | Remaining precision work |
| --- | --- | --- |
| Search | Expandable combobox; text input; suggestions; clear; query navigation | Debounce delay, popup interior, keyboard selection geometry |
| Home filters | Checkbox-like selected state; pill interiors | Filter transition timing and loading state |
| Card | Separate navigate and play affordances; hover reveal | Exact hover surface/pseudo-element and fade curve |
| Library | Collapse button, resize slider, separate content scroll | Collapsed width, bounds, populated library |
| Track table | Grid, rows, cells, selectable rows, column splitters | Keyboard, multi-select, drag and sticky state |
| Menu | Menu/menuitems, submenus | Item hover and submenu collision handling |
| Transport | Disabled states, buttons, repeat checkbox, progress slider | Selected and playing states |
| Utility controls | Queue/device/fullscreen controls with named states | Open-panel dimensions |

I: preserve keyboard focus visibility, accessible names for icon-only controls, distinct play/navigation hit targets, and honest disabled states. A visual match that loses these interactions does not reproduce the user experience.

## 18. Mapping the measurements onto Strudelify

This section is implementation guidance, not a claim that Spotify uses Strudelify's architecture.

| Current Strudelify difference | I: concrete next change |
| --- | --- |
| Brand and primary navigation stacked in the left panel | Build a 64px global navigation spanning the viewport |
| Main panel starts at the top application gutter | Move library and main region starts to y=64 in desktop layout |
| 264px static library sizing | Use a configurable library width, with 280px reference baseline |
| 88px player | Match a 72px content region with the measured outer gutters |
| 14px bold collection names | Use the measured 16px regular card-title hierarchy |
| Permanently filled large collection tiles | Use compact shelf cards, artwork-led hierarchy, and hover surfaces |
| Card padding 14px and image corners around 5px | Reference 12px card padding and 6px shelf artwork corners |
| Text-character navigation and transport glyphs | Replace with original SVG icons using measured 16/24/32px geometry |
| One greeting/quick-pick home composition | Support reusable shelf compositions and explicit empty/recent states |
| Small detail page with code as its main visual emphasis | Use a larger entity header and an action row; offer code as a deliberate view |
| Layered style overrides | Consolidate tokens and component rules before another visual implementation pass |

I: independently authored starting tokens from the measured values:

```css
:root {
  --canvas: #000;
  --surface: #121212;
  --control-rest: #1f1f1f;
  --control-focus: #2a2a2a;
  --menu-surface: #282828;
  --text-primary: #fff;
  --text-secondary: #b3b3b3;
  --play-accent: #1ed760;
  --shell-gap: 8px;
  --global-nav-height: 64px;
  --player-content-height: 72px;
  --library-reference-width: 280px;
  --surface-radius: 8px;
  --shelf-card-padding: 12px;
  --shelf-art-radius: 6px;
  --track-row-height: 56px;
  --small-filter-height: 32px;
}
```

Use original Strudelify branding, artwork, text, and SVG drawings. These tokens reproduce observed geometry and surface relationships; they do not import Spotify's application assets or create a Spotify integration.

## 19. Pixel-comparison procedure and outstanding audit work

Before making any zero-pixel claim, use this procedure:

1. Fix viewport dimensions, DPR, browser version, zoom, sidebar width, right-panel state, scroll positions, and account/page variant.
2. Wait for fonts and images. Disable comparison noise from dynamic recommendations, animation, cursor hover, notifications, and loading placeholders by choosing the same stable state in each capture.
3. Use content with matching line lengths and artwork aspect ratios when evaluating geometry. Original artwork and branding will naturally differ in their pixels.
4. Compare region edges and bounding rectangles first: nav, library, main, player. Then compare card slots, art, typography baselines, controls, and gaps.
5. Use a transparent screenshot overlay and a difference image at 100% scale. Document every remaining deviation and its cause. A suggested geometry target is at most 0.5 CSS px displacement for measured anchors; this is an acceptance target, not an achieved result.
6. Repeat resting, hover, focus, disabled, selected, menu-open, scrolled, and playing states at matching viewport samples.

Outstanding measurements, in priority order:

- Global-navigation placement switch between 1280 and 1440.
- Stable sidebar-width normalization and exact collapse/resize behavior.
- Exact home-card hover surface, reveal opacity, Show all text, and carousel scroll distance.
- Search-popup inner surface, row sizing at 1280px, suggestion keyboard state, and no-results state.
- Detail-header sizing formula and sticky/scrolled table state.
- Active transport, time/progress, volume, queue, device panel, and populated now-playing region.
- Populated library, sorting/filtering, playlist creation dialog, and submenu placement.
- Actual mobile rendering, zoom behavior, reduced motion, focus-visible outlines, and touch interactions.

**Audit completion boundary:** the listed pages and measured states were inspected live. The complete Spotify site, every personalized experiment, every interaction state, and every breakpoint were not scraped. Unverified states remain explicitly identified above. No finished Strudelify pixel-difference comparison was performed as part of this documentation task.
