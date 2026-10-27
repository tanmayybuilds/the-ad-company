<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# The Ad Company — Project Status & Agent Operating Guide

## 1. Project Context & Identity
- **Company:** The Ad Company (Indian offline advertising and on-ground marketing company).
- **Core Concept:** *"The world is our canvas."*
- **Tagline:** *"Committed to commitments."*
- **Target Launch Date:** November 1, 2026.
- **Audience:** Brand managers, marketing teams, business owners, and campaign decision-makers.
- **Creative Direction:** Youthful, creative, bold, playful, and premium. V4 uses the approved Porcelain & Teal palette: Porcelain (`#F7F9F8`), Pale Teal (`#E5EFF0`), Logo Teal (`#12546B`), Gold (`#D9A328`), and Dark Text (`#102F38`). Use this fixed palette throughout; do not restore the theme picker or add white backings to the transparent logo.

---

## 2. Technical Stack & Architecture
- **Framework & Runtime:** React 19, TypeScript, Vite 8 (with `@vitejs/plugin-react`).
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`), approved typography (`Outfit` display, `General Sans` body, `Satoshi` UI, `RX100` indices, plus `Rajdhani`, `Sora`, `Zodiak` and `Kalam` in defined roles; see `docs/typography.md`), hard shadow borders, and editorial layouts.
- **Animation & Motion:** GSAP 3 with `@gsap/react` and `matchMedia` for responsive animations and full `prefers-reduced-motion` compliance.
- **3D Visualization:** React Three Fiber (`@react-three/fiber` v9) and Three.js (v0.186).
  - Earlier orthographic sculptural micro-city retained in source; V5's active hero uses CSS artwork and GSAP without importing WebGL.
  - Demand frameloop rendering (low power, no unnecessary GPU cycles, pauses when tab is hidden or element is off-screen).
  - Progressive enhancement: high-res static illustration fallback for mobile devices, slow connections, or WebGL-disabled environments.
- **Testing:** Node.js native test runner (`node --test tests/*.test.mjs`) covering enquiry validation and brief formatting.
- **Single Source of Truth for Content:** `src/content/site.ts` (all client names, services, team slots, coverage cities, and placeholder notices are centralized here).

---

## 3. Landing Page Sections & Implementation Status

| Section | Component | Status | Notes & Data Sources |
|---|---|---|---|
| **1. Navigation** | `src/components/site/Header.tsx` |  Implemented | Sticky header, brand wordmark, anchor links (`#services`, `#work`, `#about`, `#coverage`, `#team`), "Let's talk" CTA, accessible mobile drawer with keyboard focus trap. |
| **2. Hero** | `src/components/site/Hero.tsx`<br/>`hero-home.css`, `src/lib/hero-motion.mjs` | Implemented (V5) | Full-screen scatter of letters and six visible CSS campaign panels, automatically assembled once on landing after a brief pause. Normal page scrolling is always available; no hero pin or snap. Reduced motion shows the static completed layout. All copy and image fields live in `src/content/site.ts`. |
| **3. Client Logos** | `src/components/site/ClientStrip.tsx` |  Implemented | Displays 16 confirmed client logos, downloaded from official websites into `public/clients/`. Sources and native dimensions are recorded in `docs/client-logos.md`. |
| **4. Services** | `src/components/site/Services.tsx` |  Implemented | 5 categories: (1) Residential & community (primary focus), (2) Corporate & coworking, (3) Outdoor & transit, (4) Cinema, airports & in-flight, (5) Delivery & in-app. Interactive tabbed preview with persistent format lists and illustrations. |
| **5. Selected Work** | `src/components/site/Sections.tsx` (`Work`) |  Implemented (Pack Pending) | Featured layout with accessible `<dialog>` detail modal. Currently uses illustrative format previews. Real execution photographs and verified metrics pending client handoff. |
| **6. About & Approach** | `src/components/site/Sections.tsx` (`About`) |  Implemented | Editorial quote poster ("The world is our canvas"), core mission copy, and 3-step process cards (Understand brief, Plan placements, Execute campaign). |
| **7. Geographic Coverage** | `src/components/site/Sections.tsx` (`Coverage`) |  Implemented | Interactive selector for 7 regions: Mumbai, Pune, Bengaluru, Hyderabad, Dharashiv, Latur, and Gujarat (Region). No invented claims or inaccurate map pins. |
| **8. Team** | `src/components/site/TeamTour.tsx` | Implemented | Five supplied profiles in order: Yash Nile, Akshay Daundkar, Dilip Janaskar, Mansi Jha, Ashika Jha. Local optimized portraits, bidirectional pointer tour, complete biography dialogs and reduced-motion layout. |
| **9. Contact & Enquiry** | `src/components/site/Contact.tsx`<br/>`src/lib/enquiry.mjs` |  Implemented (Offline Mode) | Accessible form with validation (Name, Phone, Company, Email, Service, Brief). Currently prepares client-side brief file for download with clear disclaimer. Email, call and WhatsApp links use confirmed details from src/content/site.ts. Automatic form delivery still needs a secure destination. |
| **10. Footer** | `src/components/site/Sections.tsx` (`Footer`) |  Implemented | Brand wordmark, tagline, navigation anchors, enquiry CTA, privacy notice modal link, and copyright notice. |

---

## 4. Pending Business Deliverables & Launch Blockers

Before public deployment, the following assets and approvals are required:
1. **Brand Assets:** The supplied transparent logo is installed in `public/brand/`; approved brand guidelines are still pending.
2. **Contact Coordinates:**
   - Confirmed business email: `ad@theadcompany.com`.
   - Confirmed phone and WhatsApp: `+91 77150 01514` (link format `917715001514`).
   - Physical office address and verified Google Maps link.
3. **Client & Work Assets:**
   - Official client logos are installed; see `docs/client-logos.md` for sources and native formats.
   - Real campaign execution photography and approved case study metrics.
4. **Team Roster:** Five names, roles, biographies and portraits supplied October 26, 2026; installed in the existing tour. See `docs/team-portraits.md`.
5. **Enquiry Destination:**
   - Google Sheet integration (secure webhook/proxy without exposing private credentials in frontend code).
   - Confirmation on whether email notification triggers are required.
6. **Legal & Compliance:** Complete business privacy notice and cookie/data processing policy.

---

## 5. Agent & Developer Working Rules

1. **Lovable Sync:** Never force-push or rewrite git history. Always keep the active branch in a working, deployable state.
2. **Never Invent Data:**
   - Do not fabricate client logos, metrics, testimonials, team members, or city coverage not specified in the brief.
   - Keep placeholders clearly marked (`Illustrative concept`, `Pending confirmation`).
3. **Content Updates:** Edit `src/content/site.ts` rather than hardcoding strings inside React components.
4. **Testing & Verification:**
   - Run `npm test` to verify enquiry parsing and formatting logic.
   - Run `npm run build` (`tsc --noEmit && vite build`) to verify bundle and TypeScript integrity.
5. **Browser Inspections:** Do not run automated browser checks or visual subagent loops unless the user explicitly requests a visual verification.
