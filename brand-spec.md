# AIRPORTELS × Cafe — brand spec

## Color tokens (OKLch)

| Token | Value | Use |
|---|---|---|
| `--bg`         | `oklch(97% 0.022 88)`   | App background — warm cream / butter |
| `--surface`    | `oklch(99% 0.012 88)`   | Cards, sheets |
| `--surface-2`  | `oklch(93% 0.045 145)`  | Cafe surface — pastel sage (drink cards) |
| `--fg`         | `oklch(26% 0.04 175)`   | Headings — deep cafe teal (from cafe logo) |
| `--ink`        | `oklch(20% 0.018 60)`   | Body text — espresso brown-black |
| `--muted`      | `oklch(50% 0.025 80)`   | Secondary text |
| `--border`     | `oklch(88% 0.022 88)`   | Hairlines |
| `--accent`     | `oklch(82% 0.18 88)`    | AIRPORTELS gold — primary CTA |
| `--accent-ink` | `oklch(20% 0.04 70)`    | Text on gold buttons |
| `--cafe`       | `oklch(38% 0.06 175)`   | Cafe deep teal — staff/admin accent |
| `--cafe-ink`   | `oklch(97% 0.018 145)`  | Text on teal |

## Fonts

- **Display**: `'Newsreader', 'Tiempos Headline', 'Iowan Old Style', Georgia, serif` — warm editorial serif for screen titles, drink names on detail
- **Body**: `-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', system-ui, sans-serif` — quiet reading face
- **Mono**: `'JetBrains Mono', 'IBM Plex Mono', ui-monospace, Menlo, monospace` — order codes, prices

## Layout posture

1. **Cream paper + cafe sage**: cards lift onto sage tile, never gold-on-gold.
2. **Gold reserved for action**: only primary CTAs (`Place order`, `Add to cart`) are gold. Never use gold for headings or cards — gold is the verb.
3. **Deep teal owns admin / staff side**: customer-facing screens stay light; staff/admin views invert to teal-dominant for clear context switch.
4. **Radii**: 16px on cards, 22px on the primary CTA pill, 28px on bottom sheets.
5. **No shadows on content cards** — only on the bottom sheet and the floating cart bar. Borders + cream tint do the work.
6. **Mono numerics**: prices (`฿55`), order codes (`#A7K2`), timestamps (`14:32`).
