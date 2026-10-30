# Mobile homepage refinement implementation plan

**Goal:** Apply the user's requested mobile improvements while retaining desktop presentation.
**Architecture:** Keep the existing desktop team and execution components. Use a shared responsive hook to mount natural-scrolling mobile alternatives. Reuse the Services playback controller and campaign gallery data.
**Tech stack:** Existing React, TypeScript, CSS, Vite, Node tests; no new dependencies.

## Constraints and decisions
- User has delegated layout decisions and requested implementation, and reserves manual visual testing to themselves. No browser automation.
- Five team members in alternating portrait/text strips; preserve roles, responsibility, short copy, full biography access, and contact continuation.
- Execution entries without an image are omitted on mobile. If none remain, omit the whole mobile section and its mobile navigation link.
- Mobile logos open the existing gallery, filtered by matching brand when photos exist, otherwise the full gallery. No empty brand destination.
- Mobile Services retains existing video with explicit playback and still-image fallback, but removes duplicate metadata and bulky framing. Five clearly labelled category controls select the preview and concise formats.
- Work cards display the existing View more control in the media corner on mobile; keep existing detail behavior.
- About is moderately shorter through tighter spacing, a smaller complete brand image and compact process rows, preserving copy.
- Footer navigation retains accessible touch targets with small, explicit grid gaps.
- No Git repository exists here: keep file backups instead of creating a worktree or commits.

## Tasks
- [x] Test mobile roster, conditional execution content, gallery routing and mobile Services structure, including desktop preservation.
- [x] Implement responsive team/execution components and correct mobile navigation.
- [x] Implement direct mobile clientele gallery navigation and visible Work corner actions.
- [x] Refine mobile Services, About and footer CSS without desktop layout changes.
- [x] Run targeted tests, full suite and production build. Review patch once, resolve material defects, report further suggestions separately.
