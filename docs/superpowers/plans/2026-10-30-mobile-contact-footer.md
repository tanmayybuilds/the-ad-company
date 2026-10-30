# Mobile contact, footer and requested reversions

**Goal:** Complete the user's focused mobile follow-up, retaining the approved team layout.
**Approach:** Preserve desktop presentation; add the existing description to all three Work cards; restore About's mobile styling exactly to the state before mobile-polish; give mobile Footer its own compact content grouping; simplify the visible mobile enquiry form to name, phone and message with optional fields collapsed.

**Enquiry integration:** User selected Web3Forms and will provide the API key later. Implement the official client-side JSON submission contract with a public VITE_WEB3FORMS_ACCESS_KEY setting, validation, pending/success/error feedback and duplicate submission protection. No download action. Until configured, do not send or claim success. Do not add private credentials or send a test enquiry.

**Constraints:** Mobile changes at max-width 767px; preserve approved team, hero and clientele behavior; content stays in src/content/site.ts; manual/browser testing remains with the user. Do not implement new Services ideas, present them only. No Git repository: retain source backup.

- [x] Test existing work-card descriptions, real form submission states, unconfigured state and mobile optional fields.
- [x] Restore prior About CSS; add descriptions to all work cards.
- [x] Implement Web3Forms adapter and responsive compact Contact; remove downloads and stale local-only notices.
- [x] Replace mobile footer stacking with compact grouped content and inline nav links, preserve desktop footer.
- [x] Run relevant tests, full suite and production build; review once; record results.
