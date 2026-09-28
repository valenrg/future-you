# Future You V1.7 — test notes

Test date: 2026-09-28

## Responsive regression

The V1.7 responsive pass completed **126 layout/flow checks with 0 JavaScript page errors**.

Widths tested:

- 320 px
- 360 px
- 390 px
- 430 px
- 700 px
- 768 px
- 820 px
- 1024 px
- 1099 px
- 1100 px
- 1280 px
- 1440 px

Flows/screens checked for horizontal overflow and runtime errors:

- landing
- all three onboarding steps
- Today
- Plan
- Health setup
- Health dashboard after baseline setup
- Evidence
- Settings
- strength workout player
- completion screen

Behavior assertions included:

- no horizontal document overflow at any tested width
- mobile/tablet navigation remains a five-item horizontal bottom bar below 1100 px
- desktop navigation switches to a single-column left rail at 1100 px and above
- workout player remains one exercise column below 900 px
- workout player switches to two exercise columns at 900 px and above
- tablet/desktop weekly schedule renders all seven days without horizontal scrolling
- onboarding stays readable and overflow-free down to 320 px

A real mobile-width issue was found during the pass: two-column Health setup options could force the document wider than 390 px. V1.7 fixes this by allowing grid children and option text to shrink/wrap correctly.

## Training-engine regression retained from V1.6

The training engine itself is unchanged in V1.7. V1.6 passed **324 generated-plan combinations** across:

- 3 experience levels
- 3 training locations/equipment modes
- 2 / 3 / 4 days per week
- 4 training priorities
- 25 / 35 / 45 minute sessions

Those tests covered session counts, duration/volume scaling, interval-session placement, equipment-aware exercise selection, movement-pattern-safe swaps and rep-range-safe progression.

## Static checks

- `app.js`, `program.js` and `content.js` pass JavaScript syntax checks
- service-worker cache bumped to V1.7
- calendar PRODID updated to V1.7
- no V1.6 version string remains in runtime code

## Still required before public launch

- physical iPhone Safari testing, especially on-screen keyboard behavior
- physical Android Chrome testing
- VoiceOver / TalkBack and keyboard accessibility
- Add-to-Home-Screen and long-running IndexedDB persistence on real devices
- `.ics` import/duplicate behavior across Apple Calendar, Google Calendar and Outlook
- clinician review of Health priority logic and exercise programming
- exercise-video / technique experience
- public-host privacy/security and legal review
