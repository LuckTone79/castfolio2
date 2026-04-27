# Castfolio PR Page — Google Stitch Structure Guide

## Overview

A single-page personal PR site for Korean broadcasters/talents.
Dark theme throughout. Max content width: 768px (max-w-3xl), centered.
Base background: `#030712` (gray-950). All sections stack vertically.

---

## Design Tokens

| Token | Value |
|---|---|
| Background | `#030712` (gray-950) |
| Surface | `#111827` (gray-900) |
| Border | `#1f2937` (gray-800) |
| Text Primary | `#ffffff` |
| Text Secondary | `#d1d5db` (gray-300) |
| Text Muted | `#6b7280` (gray-500) |
| Accent CTA | white pill button with dark text |
| Border Radius (card) | `12px` (rounded-xl) |
| Font | System sans-serif, bold headings |

---

## Section 1 — Hero

**Purpose:** First impression. Shows talent identity and CTA buttons.

**Layout:** Full-width section, centered vertically. Gradient overlay: top gray-900 → bottom gray-950.

**Components:**
- **Avatar circle** — 112×112px, rounded-full, bg gray-800, ring-4 gray-700. Shows first character of Korean name as fallback (no photo case)
- **Name (H1)** — Korean name, 40–48px bold white. English name below in 18px gray-500 (optional)
- **Position** — 20px gray-300, below name
- **Tagline** — 18px gray-400 italic, wrapped in `"…"` quotes (optional)
- **CTA row** — two pill buttons side by side, gap 12px:
  - Primary: white bg, dark text, "연락하기" (scrolls to #contact)
  - Secondary: border gray-700, white text, "포트폴리오" (scrolls to #portfolio)

**Padding:** py-24 (96px top/bottom), px-24px sides

---

## Section 2 — Profile (소개)

**Purpose:** Bio text and keyword strengths.

**Layout:** max-w-3xl, py-16 (64px), px-24px.

**Components:**
- **Section title** — "소개", 24px bold white, mb-24px
- **Bio paragraph** — gray-300, 16px, line-height 1.75, pre-wrap (multiline)
- **Strength tags** — horizontal flex-wrap, gap-8px:
  - Each tag: pill shape (rounded-full), bg gray-800, border gray-700, 14px gray-300
  - Contains optional emoji icon + label text
  - Example: `🎙 MC 진행력`, `📺 방송 경력 10년`

**Visible only when:** `profile.intro` has content

---

## Section 3 — Career (경력)

**Purpose:** Timeline of work history.

**Layout:** max-w-3xl, py-16, px-24px. Top border: 1px gray-800.

**Components:**
- **Section title** — "경력", 24px bold white, mb-32px
- **Timeline list** — vertical stack, gap-24px. Each row:
  - Left column (112px fixed, right-aligned): period text in 14px gray-500 monospace (e.g. `2020–현재`)
  - Vertical line: 1px gray-800 left border
  - Timeline dot: 10px circle, bg gray-600, absolute -left-5px top-4px
  - Right column (flex-1, pl-24px):
    - Title: 16px semibold white
    - Description: 14px gray-400, mt-4px (optional)

**Visible only when:** `career.items` array has entries

---

## Section 4 — Portfolio (포트폴리오)

**Purpose:** Video links and media samples.

**Layout:** max-w-3xl, py-16, px-24px. Top border: 1px gray-800. Has `id="portfolio"` anchor.

**Components:**
- **Section title** — "포트폴리오", 24px bold white, mb-32px
- **Video card list** — vertical stack, gap-16px. Each card:
  - Container: rounded-xl, bg gray-900, border gray-800, p-16px
  - Title: 14px semibold white, mb-8px
  - Link row: "영상 보기" in 14px blue-400 with ExternalLink icon (12px), opens new tab
  - Platform badge (optional): small pill — YouTube red or NaverTV green

**Visible only when:** `portfolio.videos` or `portfolio.photos` has entries

---

## Section 5 — Strength (강점)

**Purpose:** Key selling points in card grid.

**Layout:** max-w-3xl, py-16, px-24px. Top border: 1px gray-800.

**Components:**
- **Section title** — "강점", 24px bold white, mb-32px
- **3-column card grid** (collapses to 1 column on mobile). Each card:
  - Container: rounded-xl, bg gray-900, border gray-800, p-20px
  - Icon: 24px emoji, mb-12px (optional)
  - Card title: 16px semibold white, mb-8px
  - Description: 14px gray-400

**Visible only when:** `strength.cards` has entries

---

## Section 6 — Contact (연락처)

**Purpose:** Contact channels for casting/booking inquiries.

**Layout:** max-w-3xl, py-16, px-24px. Top border: 1px gray-800. Has `id="contact"` anchor.

**Components:**
- **Section title** — "연락처", 24px bold white, mb-32px
- **2-column contact grid** (1 column on mobile). Each channel card:
  - Container: flex row, align-center, gap-12px, rounded-xl, bg gray-900, border gray-800, p-16px
  - Icon (18px, gray-400) — mapped by type:
    - `email` → Mail icon
    - `phone` → Phone icon
    - `kakao` → MessageCircle icon
    - `instagram` → Instagram icon
    - `youtube` → Youtube icon
    - other → Globe icon
  - Text block:
    - Label: 12px gray-500 uppercase (e.g. "EMAIL", "KAKAO")
    - Value: 14px white (e.g. "contact@agency.com")

**Contact types available:** email, phone, kakao, instagram, youtube, tiktok, blog, other

**Visible only when:** `contact.channels` has entries

---

## Section 7 — Footer

**Purpose:** Branding attribution.

**Layout:** full-width, border-top 1px gray-800, py-32px, text-center.

**Components:**
- Single line: `Powered by ` (12px gray-600) + `Castfolio` (12px gray-500)

---

## Full Page Stack (top → bottom)

```
┌─────────────────────────────────┐
│  HERO                           │  gradient bg, full-width
├─────────────────────────────────┤
│  PROFILE (소개)                  │  conditional
├─────────────────────────────────┤
│  CAREER (경력)                   │  conditional, border-top
├─────────────────────────────────┤
│  PORTFOLIO (포트폴리오)           │  conditional, border-top
├─────────────────────────────────┤
│  STRENGTH (강점)                 │  conditional, border-top
├─────────────────────────────────┤
│  CONTACT (연락처)                │  conditional, border-top
├─────────────────────────────────┤
│  FOOTER                         │  always shown, border-top
└─────────────────────────────────┘
```

---

## Stitch Prompt Template

Use the following prompt when adding a new page variant in Google Stitch:

```
Dark PR page for a Korean broadcaster. Background #030712.
Max content width 768px centered.

Sections (top to bottom):
1. Hero: circular avatar (112px), Korean name H1, English name subtitle,
   position text, italic tagline in quotes, two pill CTA buttons (white + outlined).
   Gradient top section.

2. Profile: "소개" heading, bio paragraph, emoji keyword tags in rounded pills.

3. Career: "경력" heading, vertical timeline with period on left,
   dot + title + description on right, connected by vertical line.

4. Portfolio: "포트폴리오" heading, video link cards with title and blue external link.

5. Strength: "강점" heading, 3-column card grid with emoji icon, title, description.

6. Contact: "연락처" heading, 2-column grid of contact channel cards
   with icon + label + value.

7. Footer: "Powered by Castfolio" centered small text.

All cards: rounded-xl, gray-900 bg, gray-800 border.
Dividers between sections: 1px gray-800 horizontal rule.
Typography: white headings, gray-300 body, gray-400/500 muted.
```

---

## Data Schema Reference

Each page's content follows `PageContent` type (`src/types/page-content.ts`):

```typescript
{
  hero:      { tagline, position, ctaPrimary, ctaSecondary }
  profile:   { intro, strengths: [{ icon, label }] }
  career:    { items: [{ period, title, description }] }
  portfolio: { videos: [{ url, platform, title }], photos, audioSamples }
  strength:  { cards: [{ icon, title, description }] }
  contact:   { channels: [{ type, value, label }] }
}
```
