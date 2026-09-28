# Future You V1.9 — Test notes

## Automated program regression

Passed **324 generated-program combinations** covering:

- beginner / intermediate / experienced
- gym / home / bodyweight
- 2 / 3 / 4 training days
- stay strong / build muscle / bone + power / improve fitness
- 25 / 35 / 45-minute sessions

Assertions included:

- every strength session contains exercises
- experienced users never receive Fast sit-to-stand as their standard power drill
- program generation remains valid after the V1.9 equipment changes

## Barbell-specific checks

With Home + Barbell + Bench selected, the home library correctly prioritizes:

- Barbell squat
- Barbell Romanian deadlift
- Barbell bench press
- Barbell row
- Barbell overhead press
- Barbell hip thrust

Barbell is first in the Home equipment UI in both onboarding and Settings.

## Power-scaling checks

Week 1 verified:

- Beginner → Fast sit-to-stand
- Experienced / regular lifter → Countermovement jump
- Experienced + no-impact constraint → non-impact fast squat-to-calf-raise drill, not sit-to-stand

## Settings / tracker integration checks

Static integration assertions passed for:

- Gym / Home / Bodyweight setup selector in Settings
- Home equipment visibility after choosing Home
- Barbell listed before other home equipment
- removal of user-visible “Protein anchors” wording
- Protein across the day tracker
- Fibre across the day tracker
- local migration from legacy `proteinAnchors` and `plantAnchors`
- V1.9 calendar export identifier

## Release integrity

Passed:

- `app.js` JavaScript syntax check
- `program.js` JavaScript syntax check
- manifest JSON validation
- release asset presence check
- service-worker cache bumped to `future-you-v1.8.0`

## Remaining real-device checks

Before a beta release, still test on physical iPhone/iPad/Android devices for:

- IndexedDB persistence across normal browser/app restarts
- setup switching and Home equipment touch ergonomics
- protein/fibre tracker touch targets
- Add to Home Screen
- calendar export
- service-worker update from V1.7 → V1.9


## V1.9 Health/Fuel cleanup

- Health → Protein + fibre card is informational only.
- No meal checkboxes or tappable fibre controls appear in Health.
- Protein and fibre daily tracking remains on Today as two separate trackers.
- Existing local daily data is unchanged.
