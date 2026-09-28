# Future You — V1.7

A mobile-first, local-only Progressive Web App for women 40+ focused on evidence-led training, accountability and a deliberately small longevity layer.

## What V1.7 adds: responsive layouts

V1.7 keeps the V1.6 training/Health logic and makes the interface adapt deliberately across phone, tablet and desktop.

### Mobile

- Remains the reference experience
- Single-column content and floating bottom navigation
- Narrow-phone hardening down to 320 px
- Touch-first workout inputs and onboarding controls
- Horizontal weekly strip only where space is genuinely limited

### Tablet

- Wider app canvas instead of a centred 600 px phone column
- Today pairs the main training action with the longevity focus
- Weekly schedule uses all seven columns without horizontal scrolling
- Protein/recovery cards use a two-column layout
- Plan sessions, Evidence and Settings use two-column card layouts
- Health priorities and pillars use the additional width
- Bottom navigation remains thumb-friendly

### Desktop

- Fixed left navigation rail replaces the mobile bottom bar from 1100 px
- Main app canvas expands to roughly 1,000 px of working content
- Today, Plan, Health, Evidence and Settings use desktop-specific grid layouts
- Workout player shows two exercise cards per row from 900 px
- Landing page becomes a two-column editorial layout
- Completion actions use side-by-side controls
- Onboarding remains intentionally narrower so it still reads as a focused decision flow rather than a sprawling form

## Core product features retained

### Smarter training engine

- Primary emphasis: **stay strong / build muscle / bone + power / improve fitness**
- Realistic session length: **25 / 35 / 45 minutes**
- Gym / home / bodyweight programming
- Home programming respects equipment actually owned: dumbbells, resistance bands, bench/step and kettlebell
- 25-minute sessions reduce movement count rather than rushing the same workout
- Goal- and phase-aware rep emphasis
- Fitness-focused conditioning exposure
- Scaled power/impact programming where appropriate
- Persistent exercise swaps within the same movement pattern
- Automatic progression that remains inside the programmed rep range
- 12-minute Minimum Day for planned strength sessions

### Health / longevity layer

Country-independent but Europe-centric guidance around:

- blood pressure, lipids and blood-sugar screening awareness
- preventive screening awareness without hard-coded national timetables
- protein and plant/fibre intake
- sleep
- nicotine and alcohol
- menopause/bone-health context where it changes the recommendation
- conservative supplement guidance, including creatine, B12 and conditional vitamin D/iron/calcium

Future You prioritizes up to three **Do the big things first** actions. It does not calculate biological age, disease risk or a longevity score.

### Accountability + privacy

- Weekly consistency instead of punitive streaks
- Make-up workouts still count toward the intended session
- Missed-session review
- 12-week calendar export with reminders
- Completion screen with logged work and progression
- Profile, Health baseline, training history and check-ins stored only in browser IndexedDB
- No account, analytics SDK or cloud health database in V1.7
- Offline caching / Add-to-Home-Screen support
- Delete-all-local-data control

## Important product boundaries

Future You remains an educational fitness/wellness prototype, not a diagnostic or treatment system.

- It does not interpret laboratory values.
- It does not diagnose hypertension, diabetes, osteoporosis, menopause-related conditions or cancer risk.
- Screening schedules vary across countries and individual risk, so Health prompts the user to check what they are due for rather than hard-coding one timetable.
- A previous fragility fracture, known low bone density, medical restriction or significant injury warrants individualized clinical care rather than app-based self-management.
- Exercise demonstration/video remains an important gap before broad beginner use.

## Run locally

Service workers require HTTP(S), not `file://`.

```bash
cd future-you-v1.7
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Deploy

The release folder is a static site and can be deployed directly to GitHub Pages for prototype/testing use, or to another HTTPS static host.
