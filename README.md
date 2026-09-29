# Future You — V1.13

A responsive, local-only Progressive Web App for women 40+ focused on evidence-led training, accountability and a deliberately small longevity layer.

## What V1.13 changes

### Aubergine contrast cards

The secondary emphasis palette now uses deep aubergine **#700353** as its accent, paired with a pale aubergine card background (**#F2E7EF**) and softer matching border. It is used for Minimum Day, missed-session recovery, menopause/bone context, interval finishers and power emphasis.

The existing violet, acid green, black and warm off-white palette is unchanged. True warning/error states remain red so colour keeps a clear semantic meaning.

## What V1.10 changed

V1.10 introduced a separate secondary-emphasis colour role; V1.13 refines that role from steel-blue/slate to aubergine.

## What V1.9 changes

### Training setup can now be changed in Settings

The user can switch at any time between:

- **Gym**
- **Home**
- **Bodyweight / no equipment**

Changing setup does not delete workout history. It changes future exercise selection. Exercise swaps that are not available in the new setup are ignored until they become compatible again.

### Home equipment is more complete

Home equipment is now explicitly selected rather than assumed. The list is shown in this order:

1. **Barbell**
2. Dumbbells
3. Resistance bands
4. Bench / sturdy step
5. Kettlebell

Selecting a barbell unlocks barbell variants for squat, Romanian deadlift, bench/floor press, row, overhead press and hip thrust / glute bridge. Barbell programming assumes an appropriate safe setup, including a rack or bench where required.

### Protein + fibre tracking

The user-facing term **protein anchors** has been removed.

Today now includes:

- **Protein across the day** — Breakfast / Lunch / Dinner / Snack
- **Fibre across the day** — Breakfast / Lunch / Dinner / Snack
- A simple daily fibre reference of **at least 25 g/day**, while the tracker remains food-pattern based rather than pretending the meal checkboxes measure grams

The Health/Fuel card is informational only. Daily protein and fibre meal check-ins live exclusively on the Today screen, where they are tracked separately. Existing V1.7 daily data still migrates locally from the previous `proteinAnchors` / `plantAnchors` fields.

### Power work now reflects training experience

**Fast sit-to-stand is now a beginner entry-point only** (or used where a beginner also has an impact constraint).

- Beginner, early weeks: fast sit-to-stand → low pogo hops → low squat jumps
- Intermediate: low pogo hops → low squat jumps
- Experienced / regular lifter: **countermovement jumps from week 1**, kept low-volume and high-quality
- Experienced lifters with a no-impact constraint get a non-impact power drill rather than sit-to-stand

This keeps the Stacy Sims–informed emphasis on power while scaling the drill to training age and constraints.

## Core product features retained

### Training engine

- Primary emphasis: stay strong / build muscle / bone + power / improve fitness
- 25 / 35 / 45-minute sessions
- 2 / 3 / 4 training days
- Gym / home / bodyweight exercise libraries
- Equipment-aware home programming
- Experience-appropriate power work
- Short-intensity programming
- Persistent exercise swaps
- Automatic progression inside the prescribed rep range
- 12-minute Minimum Day for planned strength sessions

### Health / longevity layer

Country-independent but Europe-centric guidance around:

- blood pressure, lipids and blood-sugar screening awareness
- preventive screening awareness without hard-coded national timetables
- protein and fibre-rich eating
- sleep
- nicotine and alcohol
- menopause/bone-health context where it changes the recommendation
- conservative supplement guidance, including creatine, B12 and conditional vitamin D/iron/calcium

Future You prioritizes up to three **Do the big things first** actions. It does not calculate biological age, disease risk or a longevity score.

### Privacy + deployment

- No account
- No cloud health database
- Profile, workout history, daily check-ins and Health baseline stored in browser IndexedDB
- Existing local data is retained when the static site is updated
- Offline caching / Add-to-Home-Screen support
- Static build suitable for GitHub Pages prototype deployment

## Run locally

Service workers require HTTP(S), not `file://`.

```bash
cd future-you-v1.8
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Product boundary

Future You remains an educational fitness/wellness prototype, not individualized medical care. Exercise demonstrations/video remain an important gap before broad beginner use.


## V1.13 legal/privacy layer

- Bilingual `impressum.html`, `datenschutz.html`, and `health-safety.html`.
- Legal links on the landing page, in every main app view footer, and in Settings.
- Privacy notice documents GitHub Pages hosting, local-only IndexedDB/Cache Storage, no app analytics/ads, and the current no-tracking-cookie-banner setup.
- Pregnancy is explicitly grouped with medical/clinical restrictions in onboarding and Health & Safety guidance.
- Provider: private individual, Germany; free public beta.


## V1.13 — English-only app UI

The main app is explicitly marked as English and opt-outs of automatic browser translation (`translate="no"`, `notranslate`, and Google notranslate metadata). The PWA manifest also declares `lang: en`. Legal documents remain bilingual German/English.
