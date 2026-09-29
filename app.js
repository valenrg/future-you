import { db } from './db.js';
import { evidence, safetyCopy, evidenceReviewed } from './content.js';
import {
  buildWeek, scheduleForWeek, todayDayName, dateISO, dateForDayName,
  mondayOf, minimumWorkout, nextProgression, getWeekNumber, nextExerciseAlternative
} from './program.js';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const app = $('#app');

const state = {
  profile: null,
  startDate: null,
  workouts: [],
  checkins: [],
  daily: null,
  health: null,
  healthDraft: null,
  view: 'today',
  onboardingStep: 0,
  draft: {
    menopause: null,
    experience: 'beginner',
    primaryGoal: 'strength',
    equipment: 'home_equipment',
    homeKit: [],
    sessionMinutes: 35,
    exerciseOverrides: {},
    daysPerWeek: 3,
    preferredDays: ['Mon','Wed','Fri'],
    timeSlot: 'after-work',
    goals: ['strong'],
    limitations: [],
    weightKg: '',
    sleepGoal: 8,
    acceptedSafety: false
  },
  activeSession: null,
  completion: null,
  missedReview: null,
  scheduleDraft: null,
  firstRunLanding: true
};

const timeMap = {
  morning: ['07:00', 'Morning'],
  lunch: ['12:30', 'Lunch'],
  'after-work': ['18:00', 'After work'],
  evening: ['20:00', 'Evening']
};

const daySets = {
  2: ['Tue','Fri'],
  3: ['Mon','Wed','Fri'],
  4: ['Mon','Tue','Thu','Sat']
};

function normalizeProfile(profile) {
  if (!profile) return null;
  return {
    ...profile,
    primaryGoal: profile.primaryGoal || profile.goals?.[0] || 'strength',
    sessionMinutes: Number(profile.sessionMinutes || 35),
    homeKit: Array.isArray(profile.homeKit) ? profile.homeKit : [],
    exerciseOverrides: profile.exerciseOverrides || {},
    limitations: profile.limitations || [],
    goals: profile.goals?.length ? profile.goals : ['strong']
  };
}

function defaultHealth() {
  return {
    setupDone: false,
    menopause: 'unsure',
    dietPattern: 'omnivore',
    plantMeals: 'some',
    nicotine: 'none',
    alcohol: 'some',
    bp: 'unknown',
    lipids: 'unknown',
    glucose: 'unknown',
    screening: 'unknown',
    boneFlags: []
  };
}

function normalizeHealth(value) {
  const base = defaultHealth();
  return {...base, ...(value || {}), boneFlags: Array.isArray(value?.boneFlags) ? value.boneFlags : []};
}

async function init() {
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
  state.profile = normalizeProfile(await db.get('profile'));
  state.startDate = await db.get('startDate');
  state.workouts = await db.getWorkouts();
  state.checkins = await db.getCheckins();
  state.daily = await loadDaily();
  state.health = normalizeHealth(await db.get('health'));
  if (state.profile) await db.set('profile', state.profile);
  state.firstRunLanding = !state.profile;
  render();
}

async function loadDaily() {
  const existing = await db.getDaily(dateISO());
  if (existing) {
    const proteinMeals = existing.proteinMeals || existing.proteinAnchors || [false,false,false,false];
    const oldFibre = existing.fibreMeals || existing.plantAnchors || [false,false,false];
    const fibreMeals = [...oldFibre, false, false, false, false].slice(0,4);
    return {...existing, proteinMeals, fibreMeals};
  }
  return {
    date: dateISO(), proteinMeals: [false,false,false,false], fibreMeals: [false,false,false,false], sleepHours: null, movementMinutes: 0
  };
}

function shell(content, active = state.view) {
  return `
    <main class="shell app-shell">
      <header class="topbar">
        <div class="brand">future you<span class="brand-dot">.</span></div>
        <button class="icon-btn" data-action="settings" aria-label="Settings">⚙</button>
      </header>
      ${content}
      ${legalFooter()}
    </main>
    <nav class="bottom-nav" aria-label="Main navigation">
      <div class="nav-brand" aria-hidden="true">FY<span>.</span></div>
      ${navButton('today','⌂','Today',active)}
      ${navButton('plan','▦','Plan',active)}
      ${navButton('health','♡','Health',active)}
      ${navButton('evidence','◎','Why',active)}
      ${navButton('settings','⚙','Settings',active)}
    </nav>`;
}

function navButton(view, icon, label, active) {
  return `<button class="nav-btn ${active===view?'active':''}" data-view="${view}"><b>${icon}</b>${label}</button>`;
}

function legalFooter() {
  return `<footer class="legal-links" aria-label="Legal information">
    <a href="./impressum.html">Legal notice</a>
    <a href="./datenschutz.html">Privacy</a>
    <a href="./health-safety.html">Health &amp; Safety</a>
  </footer>`;
}

function render() {
  if (!state.profile) {
    app.innerHTML = state.firstRunLanding ? landing() : onboarding();
    wireCommon();
    return;
  }
  if (state.completion) app.innerHTML = completionView(state.completion);
  else if (state.activeSession) app.innerHTML = workoutPlayer(state.activeSession);
  else if (state.view === 'today') app.innerHTML = shell(todayView());
  else if (state.view === 'plan') app.innerHTML = shell(planView());
  else if (state.view === 'health') app.innerHTML = shell(healthView());
  else if (state.view === 'evidence') app.innerHTML = shell(evidenceView());
  else app.innerHTML = shell(settingsView());
  wireCommon();
}

function landing() {
  return `<main class="shell landing-shell">
    <section class="hero" style="padding-top:58px">
      <div class="hero-mark">FY</div>
      <div class="eyebrow">Strong for life</div>
      <h1>Train for the woman you want to be at 70.</h1>
      <p class="muted" style="font-size:17px;max-width:500px">A simple training + longevity coach for women 40+. Smarter strength programming plus the health basics that actually matter — without turning longevity into a second job.</p>
      <div class="proof-strip"><span>Smarter training</span><span>Health priorities</span><span>Private by design</span><span>Evidence graded</span></div>
    </section>
    <section class="landing-preview" aria-label="Example week">
      <div class="preview-kicker">Your week, simplified</div>
      <div class="preview-title">Do what matters. Keep going.</div>
      <div class="preview-row">
        <div class="preview-stat"><b>2/3</b><span>strength</span></div>
        <div class="preview-stat"><b>3/4</b><span>protein</span></div>
        <div class="preview-stat"><b>7.8h</b><span>sleep</span></div>
      </div>
    </section>
    <section class="card accent">
      <div class="eyebrow" style="color:#455900">Private by design</div>
      <h3 style="margin-top:8px">Your health data stays on your device.</h3>
      <p style="margin-bottom:0">No account. No cloud health profile. Your plan and training history live in this browser.</p>
    </section>
    <button class="btn primary" data-action="start-onboarding">Build my 12-week plan</button>
    <p class="privacy">About 2 minutes · educational, not medical care</p>
    ${legalFooter()}
  </main>`;
}

function onboarding() {
  const step = state.onboardingStep;
  const steps = [onboard1,onboard2,onboard3];
  const labels = ['Your starting point','Your real week','Make it fit'];
  return `<main class="shell onboarding-shell">
    <header class="topbar onboarding-topbar"><div class="brand">future you<span class="brand-dot">.</span></div><span class="pill">${step+1} of 3</span></header>
    <section class="onboarding-progress" aria-label="Onboarding progress">
      <div><span>BUILD YOUR STRATEGY</span><strong>${labels[step]}</strong></div>
      <div class="stepper">${[0,1,2].map(i=>`<span class="${i<=step?'on':''}"></span>`).join('')}</div>
    </section>
    ${steps[step]()}
    <div class="onboarding-actions">
      ${step ? '<button class="btn secondary onboarding-back" data-action="back-onboarding">Back</button>' : ''}
      <button class="btn primary" data-action="next-onboarding">${step===2?'See my plan':'Continue'}</button>
    </div>
  </main>`;
}

function option(label, field, value, sub='', icon='') {
  const current = state.draft[field];
  const selected = Array.isArray(current) ? current.includes(value) : String(current) === String(value);
  return `<button class="option ${selected?'selected':''}" data-select="${field}" data-value="${value}">${icon?`<span class="option-icon">${icon}</span>`:''}<span class="option-copy"><strong>${label}</strong>${sub?`<small>${sub}</small>`:''}</span></button>`;
}

function strategyPreview() {
  const exp = ({beginner:'Foundation',intermediate:'Build',experienced:'Strength + power'})[state.draft.experience];
  const place = ({gym:'Gym',home_equipment:'Home',none:'Bodyweight'})[state.draft.equipment];
  const goal = ({strength:'Stay strong',muscle:'Build muscle',bone:'Bone + power',fitness:'Fitness'})[state.draft.primaryGoal] || 'Stay strong';
  const days = state.draft.daysPerWeek;
  return `<aside class="strategy-preview">
    <div class="strategy-preview-top"><span class="eyebrow">Your strategy so far</span><span class="pill purple">12 weeks</span></div>
    <h3>${days}-day ${exp.toLowerCase()} plan</h3>
    <div class="strategy-tags"><span>${place}</span><span>${state.draft.sessionMinutes} min</span><span>${goal}</span></div>
  </aside>`;
}

function onboard1() {
  const showHomeKit = state.draft.equipment === 'home_equipment';
  return `<section class="onboarding-section">
    <div class="onboarding-hero"><div class="eyebrow">Start where you are</div><h1>Build training around your real life.</h1><p>Every answer below changes the program: exercise choice, volume, intensity or session length.</p></div>

    <div class="question-block">
      <div class="question-head"><span>1</span><div><h3>How familiar are you with strength training?</h3><p>We'll use this to set exercise complexity, reps and progression.</p></div></div>
      <div class="option-grid compact">
        ${option('Starting / restarting','experience','beginner','New, inconsistent, or coming back after a break','↗')}
        ${option('I know the basics','experience','intermediate','Comfortable with resistance exercises','→')}
        ${option('I lift regularly','experience','experienced','Used to progressive strength training','↑')}
      </div>
    </div>

    <div class="question-block">
      <div class="question-head"><span>2</span><div><h3>What matters most right now?</h3><p>This changes rep ranges and how much conditioning or power work we emphasize.</p></div></div>
      <div class="grid2">
        ${option('Stay strong','primaryGoal','strength','Strength + independence')}
        ${option('Build muscle','primaryGoal','muscle','A little more hypertrophy work')}
        ${option('Bone + power','primaryGoal','bone','Load + impact where appropriate')}
        ${option('Improve fitness','primaryGoal','fitness','More conditioning emphasis')}
      </div>
    </div>

    <div class="question-block">
      <div class="question-head"><span>3</span><div><h3>Where will most workouts happen?</h3><p>Choose the setup you're most likely to use, not the ideal one.</p></div></div>
      <div class="choice-cards">
        ${option('Gym','equipment','gym','Machines + free weights','G')}
        ${option('Home','equipment','home_equipment','Tell us what you actually own','H')}
        ${option('No equipment','equipment','none','Bodyweight to start','○')}
      </div>
      ${showHomeKit ? `<div class="sub-question"><div class="eyebrow">What is actually available?</div><div class="equipment-chips">
        ${option('Barbell','homeKit','barbell')}
        ${option('Dumbbells','homeKit','dumbbells')}
        ${option('Bands','homeKit','bands')}
        ${option('Bench / sturdy step','homeKit','bench')}
        ${option('Kettlebell','homeKit','kettlebell')}
      </div><p class="muted" style="font-size:12px;margin-bottom:0">The app only uses equipment you select. Barbell movements assume a safe setup, including a rack or bench where required.</p></div>` : ''}
    </div>

    <div class="question-block">
      <div class="question-head"><span>4</span><div><h3>How long can a normal session really be?</h3><p>Shorter sessions get fewer movements, not magically faster workouts.</p></div></div>
      <div class="day-count-grid">
        ${[25,35,45].map(v=>`<button class="day-count ${state.draft.sessionMinutes===v?'selected':''}" data-select="sessionMinutes" data-value="${v}"><strong>${v}</strong><span>minutes</span>${v===25?'<small>Focused essentials</small>':v===35?'<small>Balanced default</small>':'<small>More volume</small>'}</button>`).join('')}
      </div>
    </div>

    <div class="question-block">
      <div class="question-head"><span>5</span><div><h3>How many days can you protect?</h3><p>Pick the number that still works during a busy week.</p></div></div>
      <div class="day-count-grid">
        ${[2,3,4].map(v=>`<button class="day-count ${state.draft.daysPerWeek===v?'selected':''}" data-select="daysPerWeek" data-value="${v}"><strong>${v}</strong><span>days / week</span>${v===2?'<small>Great place to start</small>':v===3?'<small>Balanced default</small>':'<small>More training variety</small>'}</button>`).join('')}
      </div>
    </div>
    ${strategyPreview()}
  </section>`;
}

function schedulePreview() {
  const ordered=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].filter(d=>state.draft.preferredDays.includes(d));
  const titles = state.draft.daysPerWeek===2 ? ['Strength A','Strength B'] : state.draft.daysPerWeek===3 ? ['Strength A','Strength B','Strength C'] : ['Strength A','Intervals','Strength B','Strength C'];
  return `<div class="week-preview">
    <div class="week-preview-head"><span class="eyebrow">Your week</span><span>${timeMap[state.draft.timeSlot][1]}</span></div>
    <div class="week-preview-list">${ordered.map((d,i)=>`<div><b>${d}</b><span>${titles[i]||'Training'}</span></div>`).join('')}</div>
  </div>`;
}

function onboard2() {
  const dayLabel={Mon:'M',Tue:'Tu',Wed:'W',Thu:'Th',Fri:'F',Sat:'Sa',Sun:'Su'};
  return `<section class="onboarding-section">
    <div class="onboarding-hero"><div class="eyebrow">Make it real</div><h1>Put training on your actual week.</h1><p>Choose ${state.draft.daysPerWeek} days you can usually defend. You can move sessions later without losing credit.</p></div>

    <div class="question-block schedule-question">
      <div class="question-head"><span>1</span><div><h3>Which days are yours?</h3><p>Select exactly ${state.draft.daysPerWeek}. We'll build the session order around them.</p></div></div>
      <div class="week-picker">
        ${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=>`<button data-day="${d}" class="${state.draft.preferredDays.includes(d)?'on':''}"><span>${dayLabel[d]}</span><small>${d}</small></button>`).join('')}
      </div>
    </div>

    <div class="question-block">
      <div class="question-head"><span>2</span><div><h3>When is training most likely to happen?</h3><p>This is for planning and calendar reminders, not judgment.</p></div></div>
      <div class="time-grid">
        ${option('Morning','timeSlot','morning','Around 07:00','☀')}${option('Lunch','timeSlot','lunch','Around 12:30','◐')}
        ${option('After work','timeSlot','after-work','Around 18:00','↘')}${option('Evening','timeSlot','evening','Around 20:00','☾')}
      </div>
    </div>
    ${schedulePreview()}
    <div class="principle-note"><span>↺</span><p><strong>No streaks.</strong> If Tuesday becomes Wednesday, the workout still counts. The goal is consistency across months, not perfect weeks.</p></div>
  </section>`;
}

function proteinPreviewText() {
  const w=Number(state.draft.weightKg);
  if(!Number.isFinite(w)||w<=0) return 'Optional — only used to show a practical daily protein target.';
  return `Estimated starting target: about ${Math.round(w*1.6)} g protein/day.`;
}

function onboard3() {
  return `<section class="onboarding-section">
    <div class="onboarding-hero"><div class="eyebrow">Make it fit your body</div><h1>Anything the plan should work around?</h1><p>Select only what applies. Leaving this blank means no current limitation you need the app to design around.</p></div>

    <div class="question-block">
      <div class="question-head"><span>1</span><div><h3>Movement constraints</h3><p>These change exercise selection and power/impact work. This isn't a diagnosis or rehab screen.</p></div></div>
      <div class="limitation-grid">
        ${option('Knee','limitations','knee','Issue / discomfort')}
        ${option('Hip','limitations','hip','Issue / discomfort')}
        ${option('Back','limitations','back','Issue / discomfort')}
        ${option('Shoulder','limitations','shoulder','Issue / discomfort')}
        ${option('Pelvic floor','limitations','pelvic-floor','Concern with impact / pressure')}
        ${option('No jumping','limitations','no-impact','Avoid impact work')}
      </div>
      <button class="medical-flag ${state.draft.limitations.includes('medical-clearance')?'selected':''}" data-select="limitations" data-value="medical-clearance"><span>!</span><div><strong>Pregnancy, recent significant injury/surgery or clinician-imposed restriction</strong><small>Future You won't generate unsupervised training until you have individualized guidance or clearance.</small></div></button>
    </div>

    <div class="question-block">
      <div class="question-head"><span>2</span><div><h3>Want a protein target?</h3><p>Body weight is optional and stays on this device.</p></div></div>
      <div class="weight-row"><input class="input" id="weightKg" type="number" inputmode="decimal" min="35" max="250" step="0.1" value="${state.draft.weightKg}" placeholder="e.g. 68" /><span>kg</span></div>
      <div id="proteinPreview" class="protein-preview">${proteinPreviewText()}</div>
    </div>

    <div class="safety-panel">
      <div class="safety-icon">i</div><div><h3>One safety boundary</h3><p>${safetyCopy}</p></div>
    </div>
    <button class="safety-ack ${state.draft.acceptedSafety?'selected':''}" data-safety><span class="ack-box">${state.draft.acceptedSafety?'✓':''}</span><span>I understand this is educational, not individualized medical care.</span></button>

    <div class="ready-card"><span class="eyebrow">Ready to build</span><h3>${state.draft.daysPerWeek} days · ${({gym:'Gym',home_equipment:'Home equipment',none:'Bodyweight'})[state.draft.equipment]}</h3><p>12 weeks of progressive strength, scaled power and practical accountability.</p></div>
  </section>`;
}
function todayView() {
  const profile = state.profile;
  const week = buildWeek(profile, state.startDate);
  const schedule = scheduleForWeek(profile, state.startDate);
  const todayName = todayDayName();
  const planned = schedule.find(x => x.day === todayName);
  const doneToday = state.workouts.find(w => w.date === dateISO());
  const proteinTarget = proteinTargetText(profile);
  const proteinCount = state.daily.proteinMeals.filter(Boolean).length;
  const fibreCount = state.daily.fibreMeals.filter(Boolean).length;
  const sleep = state.daily.sleepHours;
  const todaySession = planned?.session;
  const healthAction = state.health?.setupDone ? longevityActions(state.health)[0] : null;

  let primary;
  if (doneToday) {
    primary = `<div class="card accent big-action today-primary"><span class="pill good">DONE TODAY</span><h2 style="margin-top:12px">${doneToday.title}</h2><p>You showed up. That's the whole game.</p></div>`;
  } else if (todaySession) {
    primary = `<div class="card dark big-action today-primary">
      <span class="pill purple">WEEK ${week.week} · ${week.phase.toUpperCase()}</span>
      <h2 style="font-size:38px;margin-top:14px">${todaySession.title}</h2>
      <p style="color:#cbc7d5">${todaySession.duration} min · ${todaySession.type==='strength'?'full body + power':'short high-intensity work'}</p>
      <button class="btn lime" data-start-session="${todaySession.id}">Start workout</button>
    </div>`;
  } else {
    const next = nextScheduled(schedule);
    primary = `<div class="card dark big-action today-primary"><span class="pill purple">RECOVERY / MOVEMENT</span><h2 style="font-size:38px;margin-top:14px">No hard session today.</h2><p style="color:#cbc7d5">Walk, move, recover. ${next?`Next: ${next.day} · ${next.session.title}.`:''}</p></div>`;
  }

  return `<section class="view view-today">
    <div class="hero" style="padding-top:20px;padding-bottom:14px">
      <div class="eyebrow">${formatLongDate(new Date())}</div>
      <h1 style="font-size:46px">Here's what matters today.</h1>
    </div>
    ${primary}
    ${weeklyStrip(schedule)}
    <div class="today-metrics">
      <div class="metric"><span class="eyebrow">Protein</span><strong>${proteinCount}/4</strong><span class="muted">meals · ${proteinTarget}</span></div>
      <div class="metric"><span class="eyebrow">Fibre</span><strong>${fibreCount}/4</strong><span class="muted">fibre-rich meals</span></div>
      <div class="metric"><span class="eyebrow">Sleep</span><strong>${sleep ?? '—'}</strong><span class="muted">${sleep?'hours last night':'log last night'}</span></div>
    </div>

    ${state.health?.setupDone ? `<div class="card health-focus"><div class="row between"><div><span class="eyebrow">Longevity focus</span><h3>${healthAction?.title || 'Core foundations covered'}</h3><p class="muted">${healthAction?.short || 'Keep training, eating well, sleeping, and staying on top of prevention.'}</p></div><span class="health-focus-icon">${healthAction?.icon || '✓'}</span></div><button class="btn secondary small" data-view="health">Open Health</button></div>` : `<div class="card health-focus"><span class="eyebrow">Beyond training</span><h3>Set up your longevity basics.</h3><p class="muted">Two minutes to turn diet, prevention, bone health and supplements into a short action list. It stays on this device.</p><button class="btn secondary small" data-view="health">Set up Health</button></div>`}

    <div class="card today-protein" style="margin-top:14px">
      <div class="row between"><div><h3>Protein across the day</h3><p class="muted" style="font-size:13px">Mark meals or snacks that included a meaningful protein source.</p></div><span class="pill">${proteinTarget}</span></div>
      <div class="segment">${['Breakfast','Lunch','Dinner','Snack'].map((x,i)=>`<button data-protein="${i}" class="${state.daily.proteinMeals[i]?'on':''}">${state.daily.proteinMeals[i]?'✓ ':''}${x}</button>`).join('')}</div>
    </div>

    <div class="card today-fibre">
      <div class="row between"><div><h3>Fibre across the day</h3><p class="muted" style="font-size:13px">Mark meals or snacks with a meaningful source of vegetables, fruit, whole grains, legumes, nuts or seeds.</p></div><span class="pill">aim ≥25 g/day</span></div>
      <div class="segment">${['Breakfast','Lunch','Dinner','Snack'].map((x,i)=>`<button data-fibre="${i}" class="${state.daily.fibreMeals[i]?'on':''}">${state.daily.fibreMeals[i]?'✓ ':''}${x}</button>`).join('')}</div>
    </div>

    <div class="card today-recovery">
      <div class="row between"><div><h3>Recovery</h3><p class="muted" style="font-size:13px">How long did you sleep last night?</p></div><span class="pill">target 7–9 h</span></div>
      <input id="sleepRange" type="range" min="4" max="10" step="0.5" value="${sleep ?? 8}" style="width:100%" />
      <div class="row between"><span class="muted">4 h</span><strong id="sleepReadout">${sleep ?? 8} h</strong><span class="muted">10 h</span></div>
      <button class="btn secondary small" style="margin-top:10px" data-action="save-sleep">Save sleep</button>
    </div>

    ${!doneToday && todaySession?.type==='strength'?`<div class="card contrast today-minimum">
      <div class="row between"><div><h3>Bad day? Do the minimum.</h3><p class="muted" style="font-size:13px">A 12-minute full-body session can substitute for today's strength session.</p></div></div>
      <button class="btn secondary" data-action="minimum-day">Do the 12-minute version</button>
    </div>`:''}
  </section>`;
}

function weekStartDate() {
  return mondayOf();
}

function programStartDate() {
  return new Date(`${state.startDate}T00:00:00`);
}

function isProgramActiveOnDate(d) {
  return d >= programStartDate();
}

function plannedSessionsThisWeek(schedule) {
  return schedule.filter(s => isProgramActiveOnDate(dateForDayName(s.day)));
}

function workoutsThisWeek() {
  const mon = weekStartDate();
  const sun = new Date(mon); sun.setDate(mon.getDate()+7);
  const start = programStartDate() > mon ? programStartDate() : mon;
  return state.workouts.filter(w => {
    const d = new Date(`${w.date}T12:00:00`);
    return d >= start && d < sun;
  });
}

function creditedSessionIdsThisWeek() {
  return new Set(workoutsThisWeek().map(w => w.creditedSessionId || w.sessionId));
}

function weeklyStrip(schedule) {
  const mon = mondayOf();
  const activePlanned = plannedSessionsThisWeek(schedule);
  const days = Array.from({length:7},(_,i)=>{ const d=new Date(mon); d.setDate(mon.getDate()+i); return d; });
  return `<div class="card week-card"><div class="row between" style="margin-bottom:12px"><h3>This week</h3><span class="pill">${completedPlannedThisWeek(schedule)}/${activePlanned.length} sessions</span></div>
    <div class="session-strip">${days.map(d=>{
      const name = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
      const active = isProgramActiveOnDate(d);
      const planned = active ? schedule.find(x=>x.day===name) : null;
      const done = state.workouts.some(w=>w.date===dateISO(d));
      return `<div class="day ${done?'done':''} ${dateISO(d)===dateISO()?'today':''} ${active?'':'inactive'}"><div class="dname">${name}</div><div class="status">${done?'✓':planned?'●':'·'}</div><div class="muted" style="font-size:10px">${planned?planned.session.title.replace('Strength ','S'):active?'Move':'—'}</div></div>`;
    }).join('')}</div>
  </div>`;
}

function completedPlannedThisWeek(schedule) {
  const credited = creditedSessionIdsThisWeek();
  return plannedSessionsThisWeek(schedule).filter(s=>credited.has(s.session.id)).length;
}

function nextScheduled(schedule) {
  const todayIdx = new Date().getDay();
  const order = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  return schedule.map(x=>({...x,delta:(order.indexOf(x.day)-todayIdx+7)%7})).filter(x=>x.delta>0).sort((a,b)=>a.delta-b.delta)[0];
}

function planView() {
  const profile=state.profile;
  const week=buildWeek(profile,state.startDate);
  const schedule=scheduleForWeek(profile,state.startDate);
  const missed = missedSessions(schedule);
  return `<section class="view view-plan">
    <div class="hero" style="padding-top:20px"><div class="eyebrow">12-week program</div><h1 style="font-size:48px">Build strength. Keep power.</h1><p class="muted">Week ${week.week} of 12 · ${week.phase}</p></div>
    <div class="card dark plan-summary">
      <div class="row between"><div><span class="eyebrow" style="color:#a9a0ff">Your rhythm</span><h2>${profile.daysPerWeek} training days</h2></div><div class="big-number">${profile.daysPerWeek}</div></div>
      <p style="color:#cbc7d5">${schedule.map(s=>s.day).join(' · ')} · ${timeMap[profile.timeSlot][1]}</p>
      <button class="btn lime" data-action="calendar">Add next 12 weeks to calendar</button>
    </div>
    ${state.missedReview ? missedReviewCard(schedule) : ''}
    ${missed.length ? `<div class="card contrast plan-missed"><h3>Missed session?</h3><p class="muted">No guilt. Review what got in the way, then do it today or leave it behind deliberately.</p>${missed.map(m=>{
      const checkin=state.checkins.find(c=>c.date===m.date && c.sessionId===m.session.id);
      return `<button class="btn secondary" style="margin-top:8px" data-missed="${m.date}" data-session="${m.session.id}">${m.day}: ${m.session.title}${checkin?' · reviewed':''} →</button>`;
    }).join('')}</div>`:''}
    ${schedule.map((s,i)=>`<div class="card plan-session"><div class="row between"><div><span class="pill">${s.day}</span><h3 style="margin-top:10px">${s.session.title}</h3></div><strong>${s.session.duration} min</strong></div>
      ${s.session.power?`<p class="muted">⚡ ${s.session.power.name} + ${s.session.exercises.length} strength movements</p>`:`<p class="muted">${s.session.interval.reps} × ${s.session.interval.work}s hard intervals with full recovery</p>`}
      <button class="btn secondary small" data-start-session="${s.session.id}">Preview / start</button></div>`).join('')}
    <div class="card accent plan-philosophy"><h3>Programming philosophy</h3><p>Strength first. Power scaled to ability. Short intensity. Easy movement around it. Progress gradually enough to keep doing it for years.</p></div>
  </section>`;
}

function missedReviewCard(schedule) {
  const r=state.missedReview;
  const item=schedule.find(s=>s.session.id===r.sessionId);
  if(!item) return '';
  const reasons=[['no-time','No time'],['tired','Too tired'],['work-family','Work / family'],['sore','Too sore'],['sick','Sick'],['not-motivated','Not motivated'],['other','Something else']];
  return `<div class="card" style="border:2px solid var(--accent)">
    <div class="row between"><div><span class="eyebrow">Review, don't judge</span><h3 style="margin-top:8px">${item.session.title}</h3><p class="muted">What got in the way?</p></div><button class="icon-btn" data-action="close-missed" aria-label="Close">×</button></div>
    <div class="grid2">${reasons.map(([value,label])=>`<button class="option ${r.reason===value?'selected':''}" data-missed-reason="${value}">${label}</button>`).join('')}</div>
    ${r.reason?`<div class="install-tip" style="margin-top:12px">Reason saved. You can still do the session today, or leave it and continue the week.</div>`:''}
    <button class="btn primary" style="margin-top:14px" data-action="missed-start">Do this session now</button>
  </div>`;
}

function missedSessions(schedule) {
  const today = new Date();
  const credited = creditedSessionIdsThisWeek();
  return plannedSessionsThisWeek(schedule)
    .map(s=>({ ...s, date:dateISO(dateForDayName(s.day)) }))
    .filter(s=> new Date(`${s.date}T23:59:59`) < today && !credited.has(s.session.id));
}


function healthChoice(field, value, label, sub='') {
  const h = state.healthDraft || state.health || defaultHealth();
  const current = h[field];
  const selected = Array.isArray(current) ? current.includes(value) : current === value;
  return `<button class="option ${selected?'selected':''}" data-health-select="${field}" data-value="${value}"><span class="option-copy"><strong>${label}</strong>${sub?`<small>${sub}</small>`:''}</span></button>`;
}

function longevityActions(h) {
  if (!h?.setupDone) return [];
  const actions=[];
  const add=(priority,icon,title,short,detail,kind='protect')=>actions.push({priority,icon,title,short,detail,kind});

  if (h.nicotine === 'yes') add(100,'○','Make nicotine the priority','No nicotine is one of the biggest prevention levers.','If you smoke, vape or use nicotine, getting support to stop is a higher-value health action than optimizing supplements.','protect');
  if (h.bp !== 'known') add(95,'♥','Know your blood pressure','Put a recent blood-pressure check on the list.','Blood pressure is a major cardiovascular risk factor. A single high reading is not a diagnosis; persistent elevation should be assessed by a healthcare professional.','protect');
  const bonePriority = h.boneFlags.length>0;
  if (bonePriority) add(92,'◇','Review bone health','Something in your history makes bone health worth bringing forward.','A previous fragility fracture, early menopause or known low bone density are reasons to discuss bone health with a qualified healthcare professional. Future You does not apply a single age-based screening rule across Europe.','protect');
  if (h.screening !== 'known') add(90,'□','Check your preventive screening','Know whether you are up to date with the screening recommended for you where you live.','Breast, cervical and colorectal screening programmes vary across Europe. Future You keeps this country-independent and prompts you to check your national programme or healthcare provider.','protect');
  if (h.lipids !== 'known') add(85,'≈','Know your lipids','A lipid panel belongs in the cardiovascular basics.','Cholesterol and related lipid measures help clinicians assess cardiovascular risk. Ask whether you are due based on your history and local guidance.','protect');
  if (h.glucose !== 'known') add(72,'·','Check whether blood sugar screening is due','This matters particularly when diabetes risk factors are present.','Screening recommendations depend on age, weight and other risk factors. Future You prompts the question rather than assuming every user needs the same schedule.','protect');
  if (h.plantMeals !== 'most') add(80,'✦','Push plants + fibre up the list','Aim to put wholegrains, vegetables, fruit or legumes into most meals.','EFSA considers 25 g/day adequate for normal bowel function in adults, with additional health benefits associated with higher intakes. Future You focuses on food patterns rather than gram-perfect tracking.','fuel');
  if (h.alcohol === 'frequent') add(78,'↓','Reduce alcohol','Less alcohol means less alcohol-related risk.','Future You does not present alcohol as heart-protective or a longevity strategy. Reduce frequency/amount; zero carries the lowest alcohol-related cancer risk.','protect');
  else if (h.alcohol === 'some') add(42,'↓','Keep alcohol low','Alcohol is not a longevity intervention.','If you drink, less is better for alcohol-related health risk. Future You never recommends adding alcohol for health.','protect');
  if (state.daily?.sleepHours && state.daily.sleepHours < 7) add(76,'☾','Protect sleep tonight','Last night was below the 7–9 h target.','One short night is not a problem to score. Repeated short sleep is a useful signal to change the routine or seek help if sleep problems persist.','recover');
  if (h.dietPattern === 'vegan') add(65,'B12','Plan vitamin B12','A vegan diet requires a reliable B12 source.','This is a nutritional requirement, not a longevity hack. Choose an appropriate fortified-food/supplement strategy with professional guidance when needed.','supplement');

  if (!actions.length) add(20,'✓','Keep the foundations boring','Your current answers cover the major basics.','Keep training, eating a plant-rich diet with enough protein, sleeping, and staying current with preventive care.','all');
  return actions.sort((a,b)=>b.priority-a.priority);
}

function healthFoundations() {
  const h=state.health;
  if(!h?.setupDone) return {done:0,total:6};
  const schedule=scheduleForWeek(state.profile,state.startDate);
  const planned=plannedSessionsThisWeek(schedule);
  const training=planned.length>0 && completedPlannedThisWeek(schedule) >= Math.min(2,planned.length);
  const values=[training,h.plantMeals==='most',h.nicotine==='none',h.bp==='known',h.lipids==='known',h.screening==='known'];
  return {done:values.filter(Boolean).length,total:values.length};
}

function healthSetupView() {
  const h=state.healthDraft || state.health || defaultHealth();
  return `<section>
    <div class="hero" style="padding-top:20px"><div class="eyebrow">Health baseline · local only</div><h1 style="font-size:46px">Turn longevity into a short list.</h1><p class="muted">No lab values. No biological-age score. Just enough context to decide what deserves attention.</p></div>

    <div class="card"><span class="eyebrow">1 · Life stage</span><h3>What context should Health use?</h3>
      <label class="form-label">Menopause stage</label><div class="grid2">${healthChoice('menopause','regular','Regular cycles')}${healthChoice('menopause','peri','Perimenopause')}${healthChoice('menopause','post','Postmenopause')}${healthChoice('menopause','unsure','Not sure')}</div>
      <p class="muted" style="font-size:12px">Future You uses life stage only where it changes useful context, such as bone health and menopause education. It does not automatically make your training easier.</p>
    </div>

    <div class="card"><span class="eyebrow">2 · Protect</span><h3>Which basics are already on your radar?</h3><p class="muted">“Known” means you have checked it / know whether you are due — not that the result is necessarily normal.</p>
      <div class="health-status-grid">
        <div><strong>Blood pressure</strong><div class="mini-choice">${healthChoice('bp','known','Known / checked')}${healthChoice('bp','unknown','Not sure')}</div></div>
        <div><strong>Blood lipids</strong><div class="mini-choice">${healthChoice('lipids','known','Known / checked')}${healthChoice('lipids','unknown','Not sure')}</div></div>
        <div><strong>Blood sugar screening</strong><div class="mini-choice">${healthChoice('glucose','known','Know if I’m due')}${healthChoice('glucose','unknown','Not sure')}</div></div>
        <div><strong>Preventive screening</strong><div class="mini-choice">${healthChoice('screening','known','I know what I’m due for')}${healthChoice('screening','unknown','Not sure')}</div></div>
      </div>
    </div>

    <div class="card"><span class="eyebrow">3 · Fuel + exposures</span><h3>What does normal life look like?</h3>
      <label class="form-label">Plant-rich / high-fibre foods in meals</label><div class="grid2">${healthChoice('plantMeals','most','Most meals')}${healthChoice('plantMeals','some','Some meals')}${healthChoice('plantMeals','rare','Rarely')}</div>
      <label class="form-label">Diet pattern</label><div class="grid2">${healthChoice('dietPattern','omnivore','Omnivore')}${healthChoice('dietPattern','vegetarian','Vegetarian')}${healthChoice('dietPattern','vegan','Vegan')}</div>
      <label class="form-label">Nicotine</label><div class="grid2">${healthChoice('nicotine','none','None')}${healthChoice('nicotine','yes','I use nicotine')}</div>
      <label class="form-label">Alcohol</label><div class="grid2">${healthChoice('alcohol','none','None')}${healthChoice('alcohol','some','Sometimes')}${healthChoice('alcohol','frequent','Most days / frequent')}</div>
    </div>

    <div class="card"><span class="eyebrow">4 · Bone context</span><h3>Any reason to bring bone health forward?</h3><p class="muted">Select only what you already know. This is not an osteoporosis risk calculator.</p>
      <div class="grid2">${healthChoice('boneFlags','fragility','Previous fragility fracture')}${healthChoice('boneFlags','early-menopause','Menopause before 45')}${healthChoice('boneFlags','low-bone','Told I have low bone density')}</div>
    </div>

    <div class="notice">Future You does not diagnose cardiovascular disease, diabetes, osteoporosis or cancer risk. It helps you remember high-value prevention questions to take to appropriate healthcare services.</div>
    <button class="btn primary" data-action="save-health">${h.setupDone?'Save Health baseline':'Build my Health priorities'}</button>
    ${state.health?.setupDone?'<button class="btn secondary" style="margin-top:10px" data-action="cancel-health-edit">Cancel</button>':''}
  </section>`;
}

function healthView() {
  if (!state.health?.setupDone || state.healthDraft) return healthSetupView();
  const h=state.health;
  const actions=longevityActions(h).slice(0,3);
  const foundation=healthFoundations();
  const schedule=scheduleForWeek(state.profile,state.startDate);
  const proteinTarget=proteinTargetText(state.profile);
  const sleep=state.daily.sleepHours;
  const supplementCards=[
    `<div class="supplement-line"><div><strong>Creatine monohydrate</strong><p>Worth considering with resistance training. The EU has an authorised muscle-strength claim for adults over 55 at 3 g/day alongside regular progressive resistance training.</p></div><span class="pill good">Consider</span></div>`,
    h.dietPattern==='vegan'?`<div class="supplement-line"><div><strong>Vitamin B12</strong><p>A reliable source is essential with a vegan diet.</p></div><span class="pill good">Plan it</span></div>`:`<div class="supplement-line"><div><strong>Vitamin B12</strong><p>Usually conditional on diet, absorption and clinical context.</p></div><span class="pill">Conditional</span></div>`,
    `<div class="supplement-line"><div><strong>Vitamin D / iron / calcium</strong><p>Use context, diet and deficiency/risk — not a default anti-aging stack.</p></div><span class="pill">Conditional</span></div>`
  ].join('');

  return `<section class="view view-health">
    <div class="hero" style="padding-top:20px"><div class="eyebrow">Longevity, without the theater</div><h1 style="font-size:46px">Protect the future you.</h1><p class="muted">Training is the engine. These are the other foundations worth keeping visible.</p></div>

    <div class="card dark health-score"><div><span class="eyebrow" style="color:#b8afff">Foundations this week</span><h2>${foundation.done}/${foundation.total} on track</h2><p style="color:#cbc7d5">Not a longevity score. Just a quick check that the big levers are not being crowded out by marginal ones.</p></div><div class="health-ring"><strong>${foundation.done}</strong><span>of ${foundation.total}</span></div></div>

    <div class="section-head"><div><span class="eyebrow">Your next moves</span><h2>Do the big things first.</h2></div><button class="btn secondary small" data-action="edit-health">Edit baseline</button></div>
    <div class="action-stack">${actions.map((a,i)=>`<div class="health-action ${i===0?'top':''}"><span class="health-action-icon">${a.icon}</span><div><span class="eyebrow">${i===0?'Priority now':'Next'}</span><h3>${a.title}</h3><p>${a.detail}</p></div></div>`).join('')}</div>

    <div class="health-pillar-grid">
      <div class="card pillar-card"><span class="eyebrow">Train</span><h3>${completedPlannedThisWeek(schedule)}/${plannedSessionsThisWeek(schedule).length} planned sessions</h3><p class="muted">Strength is the anchor. Keep easy aerobic movement around it; public-health guidance targets 150–300 min moderate or 75–150 min vigorous activity/week.</p><button class="btn secondary small" data-view="plan">Open training plan</button></div>

      <div class="card pillar-card"><span class="eyebrow">Fuel</span><h3>Protein + fibre.</h3><p class="muted">Protein target: ${proteinTarget}. Fibre: aim for at least 25 g/day overall, mainly from wholegrains, vegetables, fruit, legumes, nuts and seeds.</p><p class="muted" style="font-size:12px;margin-bottom:0">Track today’s protein and fibre separately on the Today screen.</p></div>

      <div class="card pillar-card"><span class="eyebrow">Recover</span><h3>${sleep ? `${sleep} h last night` : 'Sleep is not logged'}</h3><p class="muted">Aim for 7–9 hours most nights. Persistent insomnia, loud snoring or suspected sleep apnoea deserve proper assessment, not a readiness score.</p></div>

      <div class="card pillar-card"><span class="eyebrow">Protect</span><h3>Know the basics.</h3><div class="protect-list">
        <div><span>Blood pressure</span><strong>${h.bp==='known'?'On radar':'Check'}</strong></div>
        <div><span>Blood lipids</span><strong>${h.lipids==='known'?'On radar':'Check'}</strong></div>
        <div><span>Blood sugar screening</span><strong>${h.glucose==='known'?'On radar':'Ask if due'}</strong></div>
        <div><span>Preventive screening</span><strong>${h.screening==='known'?'On radar':'Check'}</strong></div>
        <div><span>Nicotine</span><strong>${h.nicotine==='none'?'None':'Priority'}</strong></div>
        <div><span>Alcohol</span><strong>${h.alcohol==='none'?'None':h.alcohol==='frequent'?'Reduce':'Less is better'}</strong></div>
      </div></div>
    </div>

    <div class="card health-supplements"><span class="eyebrow">Supplements</span><h3>A filter, not a stack.</h3>${supplementCards}<button class="btn secondary small" data-view="evidence">Why these?</button></div>

    ${(h.menopause==='peri'||h.menopause==='post'||h.boneFlags.length)?`<div class="card contrast health-menopause"><span class="eyebrow">Menopause + bone</span><h3>Use life stage where it actually changes decisions.</h3><p class="muted">Future You uses menopause context for bone and prevention prompts, not to assume you are weaker or to downshift your training automatically. Symptoms that disrupt sleep, quality of life or training are reasonable reasons to discuss menopause care with a qualified clinician.</p></div>`:''}

    <div class="notice health-disclaimer">Future You is Europe-centric but country-independent. Screening and lab schedules vary across countries, medical history and individual risk, so Health gives prompts rather than universal test intervals or diagnostic interpretation.</div>
  </section>`;
}

function evidenceView() {
  return `<section class="view view-evidence">
    <div class="hero" style="padding-top:20px"><div class="eyebrow">Evidence, not wellness theater</div><h1 style="font-size:48px">Why you're doing this.</h1><p class="muted">Recommendations are labeled by evidence strength. European sources are preferred where they fit; expert guidance is not silently presented as settled science.</p></div>
    <div class="reviewed-strip"><span>Evidence library reviewed</span><strong>${evidenceReviewed}</strong></div>
    ${evidence.map(e=>`<article class="card evidence-card"><span class="pill ${e.grade==='Strong'?'good':'purple'}">${e.grade}</span><h3 style="font-size:23px;margin-top:12px">${e.title}</h3><p class="muted">${e.summary}</p>${e.sources.map(([label,url])=>`<a class="source" href="${url}" target="_blank" rel="noreferrer">↗ ${label}</a>`).join('')}</article>`).join('')}
    <div class="notice">Evidence evolves. Future You should review this library on a defined cadence and keep female-specific claims explicitly sourced and graded.</div>
  </section>`;
}

function settingsView() {
  const p=state.profile;
  const sd=state.scheduleDraft;
  const swaps=Object.keys(p.exerciseOverrides||{}).length;
  const kitOrder=['barbell','dumbbells','bands','bench','kettlebell'];
  const kitNames={barbell:'Barbell',dumbbells:'Dumbbells',bands:'Bands',bench:'Bench / step',kettlebell:'Kettlebell'};
  const kitLabel=kitOrder.filter(x=>(p.homeKit||[]).includes(x)).map(x=>kitNames[x]).join(' · ') || 'Household / bodyweight fallbacks';
  return `<section class="view view-settings">
    <div class="hero" style="padding-top:20px"><div class="eyebrow">Settings</div><h1 style="font-size:48px">Your app. Your device.</h1></div>
    <div class="card settings-privacy"><h3>Privacy</h3><p class="muted">Future You stores your profile, training history, Health baseline and check-ins in this browser's IndexedDB. V1 has no account, analytics SDK or cloud health database.</p><div class="install-tip">If you clear browser/site data, your history disappears. That's part of the privacy trade-off.</div></div>
    <div class="card settings-install"><h3>Add to Home Screen</h3><p class="muted">Optional. On iPhone: Share → Add to Home Screen. The website then opens like an app. The normal website still works without this.</p></div>
    <div class="card settings-training"><div class="row between"><div><h3>Training setup</h3><p><strong>${experienceLabel(p.experience)}</strong> · ${p.daysPerWeek} days/week · ${equipmentLabel(p.equipment)}</p><p class="muted">${goalLabel(p.primaryGoal)} · ${p.sessionMinutes} min sessions${p.equipment==='home_equipment'?` · ${kitLabel}`:''}</p></div></div>
      <label class="form-label">Where you train</label><div class="grid3 setup-options">${[['gym','Gym'],['home_equipment','Home'],['none','Bodyweight']].map(([v,l])=>`<button class="option ${p.equipment===v?'selected':''}" data-profile-set="equipment" data-value="${v}">${l}</button>`).join('')}</div>
      ${p.equipment==='home_equipment'?`<label class="form-label">Home equipment</label><div class="equipment-chips">${[['barbell','Barbell'],['dumbbells','Dumbbells'],['bands','Bands'],['bench','Bench / step'],['kettlebell','Kettlebell']].map(([v,l])=>`<button class="option ${(p.homeKit||[]).includes(v)?'selected':''}" data-profile-toggle="homeKit" data-value="${v}">${l}</button>`).join('')}</div><p class="muted" style="font-size:12px;margin:9px 0 0">Barbell movements assume a safe setup, including a rack or bench where required.</p>`:''}
      <label class="form-label">Primary emphasis</label><div class="grid2">${[['strength','Stay strong'],['muscle','Build muscle'],['bone','Bone + power'],['fitness','Fitness']].map(([v,l])=>`<button class="option ${p.primaryGoal===v?'selected':''}" data-profile-set="primaryGoal" data-value="${v}">${l}</button>`).join('')}</div>
      <label class="form-label">Normal session length</label><div class="segment">${[25,35,45].map(v=>`<button class="${p.sessionMinutes===v?'on':''}" data-profile-set="sessionMinutes" data-value="${v}">${v} min</button>`).join('')}</div>
      ${swaps?`<div class="install-tip" style="margin-top:12px">${swaps} exercise preference${swaps===1?' is':'s are'} saved from workout swaps.</div><button class="btn secondary small" style="margin-top:10px" data-action="reset-swaps">Reset exercise swaps</button>`:''}
    </div>
    <div class="card settings-schedule"><div class="row between"><div><h3>Schedule</h3><p class="muted">${scheduleForWeek(p,state.startDate).map(x=>x.day).join(', ')} · ${timeMap[p.timeSlot][1]}</p></div></div><button class="btn secondary small" data-action="edit-schedule">Change days / time</button></div>
    ${sd?scheduleEditor(sd):''}
    <div class="card settings-health"><h3>Health baseline</h3><p class="muted">${state.health?.setupDone?'Health priorities are set up and stored locally.':'Not set up yet.'}</p><button class="btn secondary small" data-view="health">${state.health?.setupDone?'Review Health':'Set up Health'}</button></div>
    <div class="card settings-safety"><h3>Safety</h3><p class="muted">${safetyCopy}</p><a class="text-link" href="./health-safety.html">Read Health &amp; Safety →</a></div>
    <div class="card settings-legal"><h3>Legal &amp; privacy</h3><p class="muted">Future You is a free public beta operated from Germany. Legal information is available in German and English.</p><div class="legal-card-links"><a href="./impressum.html">Legal notice</a><a href="./datenschutz.html">Privacy</a><a href="./health-safety.html">Health &amp; Safety</a></div></div>
    <div class="card settings-reset"><h3>Start fresh</h3><p class="muted">This permanently deletes your profile, plan history, workouts, Health baseline and check-ins from this browser.</p><button class="btn danger" data-action="delete-data">Delete all local data</button></div>
  </section>`;
}

function scheduleEditor(sd) {
  const dayLabel={Mon:'M',Tue:'Tu',Wed:'W',Thu:'Th',Fri:'F',Sat:'Sa',Sun:'Su'};
  return `<div class="card schedule-editor" style="border:2px solid var(--accent)"><div class="row between"><div><span class="eyebrow">Adjust your real week</span><h3 style="margin-top:8px">When can you actually train?</h3></div><button class="icon-btn" data-action="cancel-schedule" aria-label="Close">×</button></div>
    <label class="form-label">Training days per week</label>
    <div class="grid2">${[2,3,4].map(n=>`<button class="option ${sd.daysPerWeek===n?'selected':''}" data-schedule-count="${n}">${n} days</button>`).join('')}</div>
    <label class="form-label">Choose ${sd.daysPerWeek} days</label>
    <div class="segment" style="grid-template-columns:repeat(7,1fr)">${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=>`<button data-schedule-day="${d}" class="${sd.preferredDays.includes(d)?'on':''}">${dayLabel[d]}</button>`).join('')}</div>
    <label class="form-label">Usual time</label>
    <div class="grid2">${Object.entries(timeMap).map(([key,val])=>`<button class="option ${sd.timeSlot===key?'selected':''}" data-schedule-time="${key}">${val[1]}</button>`).join('')}</div>
    <button class="btn primary" style="margin-top:14px" data-action="save-schedule">Save schedule</button>
  </div>`;
}

function workoutPlayer(session) {
  const history = state.workouts;
  if (session.type === 'interval') return intervalPlayer(session);
  return `<main class="shell workout-shell">
    <header class="topbar workout-topbar"><button class="icon-btn" data-action="close-workout" aria-label="Close workout">←</button><div class="brand">${session.title}</div><span class="pill">${session.duration} min</span></header>
    <section class="hero workout-hero"><div class="eyebrow">${session.phase}</div><h2>${session.title}</h2><p class="muted">${session.phaseNote || 'Quality first.'}</p><div class="workout-meta"><span class="pill purple">${session.exercises.length} movements</span><span class="pill">Log only what you do</span></div></section>
    ${session.creditTitle?`<div class="card accent"><span class="eyebrow">Minimum day credit</span><p style="margin:6px 0 0">Finish this and it counts toward today’s <strong>${session.creditTitle}</strong> for weekly consistency.</p></div>`:''}
    ${state.profile.limitations?.length?`<div class="notice"><strong>You flagged a training constraint.</strong> V1 does not diagnose pain or rehab injuries. Use a symptom-free range, skip any movement that provokes symptoms, and follow individualized clinical guidance where relevant.</div>`:''}
    ${session.power?`<div class="card power"><span class="eyebrow" style="color:var(--contrast)">Power first</span><h3 style="margin-top:8px">${session.power.name}</h3><p style="margin-bottom:0">${session.power.sets} × ${session.power.reps} · ${session.power.note}</p></div>`:''}
    <form id="workoutForm" class="workout-stack">
      ${session.exercises.map((ex,ei)=>exerciseForm(ex,ei,history)).join('')}
    </form>
    ${session.intervalFinisher?`<div class="card contrast"><span class="eyebrow">Optional intensity finisher</span><h3 style="margin-top:8px">${session.intervalFinisher.reps} × ${session.intervalFinisher.work}s</h3><p class="muted" style="margin-bottom:0">${session.intervalFinisher.note} Recover ${Math.round(session.intervalFinisher.recovery/60*10)/10} min between efforts.</p></div>`:''}
    <div class="card dark workout-finish-card"><span class="eyebrow" style="color:#b8afff">One tap to progress</span><h3 style="font-size:24px;margin-top:8px">How did the strength work feel?</h3><p style="color:#cbc7d5">This sets the next workout. No RPE math required.</p><div class="grid2">
      <button type="button" class="btn lime" data-finish="easy">Easier than planned</button>
      <button type="button" class="btn secondary" style="color:white;border-color:#555;background:rgba(255,255,255,.04)" data-finish="right">About right</button>
      <button type="button" class="btn secondary" style="color:white;border-color:#555;background:rgba(255,255,255,.04)" data-finish="hard">Very hard</button>
      <button type="button" class="btn secondary" style="color:white;border-color:#555;background:rgba(255,255,255,.04)" data-finish="couldnt">Couldn't finish</button>
    </div></div>
  </main>`;
}

function exerciseForm(ex, ei, history) {
  const last = lastExercise(history, ex.id);
  const suggestedLoad = last?.suggested?.load ?? last?.load ?? '';
  const suggestedReps = Math.max(ex.repsMin, Math.min(ex.repsMax, last?.suggested?.reps ?? ex.repsMin));
  return `<div class="exercise" data-exercise="${ex.id}" data-name="${escapeAttr(ex.name)}" data-reps-min="${ex.repsMin}" data-reps-max="${ex.repsMax}">
    <div class="row between exercise-heading"><div><h3>${ex.name}</h3><p class="muted" style="font-size:12px;margin-bottom:0">${ex.cue}</p></div><div class="exercise-head-actions"><span class="pill">${ex.sets} × ${ex.repsMin}–${ex.repsMax}</span><button type="button" class="swap-btn" data-swap-exercise="${ei}">Swap</button></div></div>
    ${last?`<div class="install-tip" style="margin-top:12px;padding:9px 11px">Last: ${last.load?`<strong>${last.load} kg</strong> · `:''}${last.reps} reps ${last.suggested?.message?`· ${last.suggested.message}`:''}</div>`:''}
    <div class="set-labels"><span>Set</span><span>kg</span><span>reps</span><span>done</span></div>
    ${Array.from({length:ex.sets},(_,si)=>`<div class="set-row">
      <strong>${si+1}</strong>
      <input aria-label="Load kg" name="load-${ei}-${si}" type="number" inputmode="decimal" step="0.5" min="0" placeholder="—" value="${suggestedLoad}" />
      <input aria-label="Reps" name="reps-${ei}-${si}" type="number" inputmode="numeric" step="1" min="1" max="50" value="${suggestedReps}" />
      <button type="button" class="set-done" data-set-done aria-label="Mark set complete">✓</button>
    </div>`).join('')}
  </div>`;
}

function intervalPlayer(session) {
  return `<main class="shell workout-shell interval-shell"><header class="topbar"><button class="icon-btn" data-action="close-workout">←</button><div class="brand">${session.title}</div><span class="pill">${session.duration} min</span></header>
    <section class="hero"><div class="eyebrow">Short intensity</div><h1 style="font-size:48px">Quality, then recover.</h1><p class="muted">Warm up 8–10 minutes first. Use a stable modality you can perform safely.</p></section>
    <div class="card dark"><div class="big-number">${session.interval.reps}×</div><h2>${session.interval.work}s hard</h2><p style="color:#cbc7d5">${Math.round(session.interval.recovery/60*10)/10} min easy recovery between efforts.</p></div>
    <div class="card"><h3>How hard?</h3><p class="muted">${session.interval.note}</p></div>
    <div class="notice">Pain, dizziness, chest symptoms or unusual breathlessness are stop signals, not a challenge to push through.</div>
    <div class="card" style="margin-top:14px"><button class="btn primary" data-finish="right">Mark session complete</button></div>
  </main>`;
}


function completionView(c) {
  const isInterval = c.type === 'interval';
  const consistency = c.weekPlanned ? `${c.weekCompleted}/${c.weekPlanned}` : '—';
  const lead = !c.weekPlanned
    ? 'Session logged. Your scheduled week starts next.'
    : c.weekCompleted >= c.weekPlanned
      ? 'Week complete. That is consistency.'
      : c.weekCompleted === 1
        ? 'One session down. Keep the week moving.'
        : `${c.weekCompleted} sessions done this week.`;
  const progressCopy = c.progressed.length
    ? `<div class="progress-list">${c.progressed.slice(0,4).map(p=>`<div class="progress-item"><span class="progress-arrow">↗</span><div><strong>${p.name}</strong><p>${p.message}</p></div></div>`).join('')}</div>`
    : `<div class="baseline"><span>◎</span><div><strong>${c.hadPrevious ? 'You matched the work.' : 'Baseline set.'}</strong><p>${c.hadPrevious ? 'Not every session needs a personal best. The next target is already set.' : 'Next time, Future You will show what moved forward.'}</p></div></div>`;
  const next = c.nextSession
    ? `<div class="next-session"><div><span class="eyebrow">Next up</span><h3>${c.nextSession.title}</h3><p>${c.nextSession.day} · ${c.nextSession.duration} min</p></div><span class="next-arrow">→</span></div>`
    : `<div class="next-session"><div><span class="eyebrow">Next up</span><h3>Recovery.</h3><p>Your planned training for this week is complete.</p></div><span class="next-arrow">✓</span></div>`;

  return `<main class="shell completion-shell">
    <header class="topbar completion-topbar"><div class="brand">future you<span class="brand-dot">.</span></div><span class="pill purple">Week ${c.week}</span></header>
    <section class="completion-hero">
      <div class="completion-check" aria-hidden="true">✓</div>
      <div class="eyebrow">Session complete</div>
      <h1>You did<br>the work.</h1>
      <p>${lead}</p>
    </section>

    <section class="completion-stats" aria-label="Workout summary">
      ${isInterval
        ? `<div class="completion-stat"><strong>${c.intervalEfforts}</strong><span>hard efforts</span></div><div class="completion-stat"><strong>${c.duration}</strong><span>minutes</span></div>`
        : `<div class="completion-stat"><strong>${c.completedSets}</strong><span>working sets</span></div><div class="completion-stat"><strong>${c.totalReps}</strong><span>reps logged</span></div>`}
      <div class="completion-stat highlight"><strong>${consistency}</strong><span>this week</span></div>
    </section>

    ${!isInterval ? `<section class="card completion-progress"><div class="row between"><div><span class="eyebrow">Compared with last time</span><h2>${c.progressed.length ? `${c.progressed.length} movement${c.progressed.length===1?'':'s'} moved forward.` : (c.hadPrevious ? 'Progress is not only more weight.' : 'Now we have a starting point.')}</h2></div></div>${progressCopy}</section>` : ''}

    <section class="card dark completion-consistency">
      <span class="eyebrow" style="color:#b8afff">Consistency &gt; streaks</span>
      <div class="consistency-row"><div><strong>${c.weekCompleted}</strong><span>done</span></div><div class="consistency-line"><i style="width:${Math.min(100,Math.round((c.weekCompleted/Math.max(1,c.weekPlanned))*100))}%"></i></div><div><strong>${c.weekPlanned}</strong><span>planned</span></div></div>
      <p>${!c.weekPlanned ? 'This session sits outside the current scheduled week; your normal plan starts with the next scheduled day.' : c.weekCompleted >= c.weekPlanned ? 'No streak to protect. Just recover and come back next week.' : 'Missing a day never resets anything. Keep building the average.'}</p>
    </section>

    ${next}
    <div class="completion-actions">
      <button class="btn primary" data-action="completion-done">Back to Today</button>
      <button class="btn secondary" data-action="completion-plan">See my plan</button>
    </div>
    <p class="privacy">Saved only on this device.</p>
  </main>`;
}

function previousComparableWorkout(sessionId) {
  return [...state.workouts].sort((a,b)=>b.timestamp-a.timestamp).find(w=>w.sessionId===sessionId) || null;
}

function movementProgress(log, previousExercise) {
  if (!previousExercise) return null;
  const loadDiff = +(Number(log.load||0) - Number(previousExercise.load||0)).toFixed(1);
  const repDiff = Number(log.reps||0) - Number(previousExercise.reps||0);
  const currentSets = Number(log.setsCompleted||0);
  const previousSets = Number(previousExercise.setsCompleted||0);
  const setDiff = currentSets - previousSets;
  const comparableVolume = currentSets >= previousSets;
  if (comparableVolume && loadDiff > 0 && repDiff >= -1) return {name:log.name, message:`+${loadDiff} kg at similar working reps.`};
  if (comparableVolume && repDiff > 0 && Number(log.load||0) >= Number(previousExercise.load||0)) return {name:log.name, message:`+${repDiff} rep${repDiff===1?'':'s'} on average.`};
  if (setDiff > 0) return {name:log.name, message:`+${setDiff} completed set${setDiff===1?'':'s'}.`};
  return null;
}

function nextPlannedSession(profile, startDate) {
  const schedule = scheduleForWeek(profile, startDate);
  const credited = creditedSessionIdsThisWeek();
  const today = new Date(); today.setHours(0,0,0,0);
  const pending = plannedSessionsThisWeek(schedule)
    .filter(item=>!credited.has(item.session.id))
    .map(item=>({ ...item, date:dateForDayName(item.day) }))
    .sort((a,b)=>a.date-b.date);
  const upcoming = pending.find(item=>item.date >= today);
  if (upcoming) return {day:upcoming.day, title:upcoming.session.title, duration:upcoming.session.duration};
  if (pending.length) return {day:'Make-up', title:pending[0].session.title, duration:pending[0].session.duration};
  const first=schedule[0];
  return first ? {day:`Next ${first.day}`, title:first.session.title, duration:first.session.duration} : null;
}

function lastExercise(history, id) {
  const sorted=[...history].sort((a,b)=>b.timestamp-a.timestamp);
  for (const w of sorted) {
    const e=w.exercises?.find(x=>x.id===id);
    if(e) return e;
  }
  return null;
}

function wireCommon() {
  $$('[data-action]').forEach(el=>el.addEventListener('click',handleAction));
  $$('[data-view]').forEach(el=>el.addEventListener('click',()=>{state.view=el.dataset.view; state.activeSession=null; render(); scrollTo(0,0);}));
  $$('[data-select]').forEach(el=>el.addEventListener('click',handleSelect));
  $$('[data-day]').forEach(el=>el.addEventListener('click',handleDay));
  $$('[data-start-session]').forEach(el=>el.addEventListener('click',()=>startSession(el.dataset.startSession)));
  $$('[data-protein]').forEach(el=>el.addEventListener('click',()=>toggleProtein(+el.dataset.protein)));
  $$('[data-fibre]').forEach(el=>el.addEventListener('click',()=>toggleFibre(+el.dataset.fibre)));
  $$('[data-health-select]').forEach(el=>el.addEventListener('click',handleHealthSelect));
  $$('[data-swap-exercise]').forEach(el=>el.addEventListener('click',()=>swapActiveExercise(Number(el.dataset.swapExercise))));
  $$('[data-profile-set]').forEach(el=>el.addEventListener('click',()=>updateProfileField(el.dataset.profileSet,el.dataset.value)));
  $$('[data-profile-toggle]').forEach(el=>el.addEventListener('click',()=>toggleProfileArray(el.dataset.profileToggle,el.dataset.value)));
  $$('[data-set-done]').forEach(el=>el.addEventListener('click',()=>el.classList.toggle('on')));
  $$('[data-finish]').forEach(el=>el.addEventListener('click',()=>finishWorkout(el.dataset.finish)));
  $$('[data-missed]').forEach(el=>el.addEventListener('click',()=>reviewMissed(el.dataset.missed,el.dataset.session)));
  $$('[data-missed-reason]').forEach(el=>el.addEventListener('click',()=>saveMissedReason(el.dataset.missedReason)));
  $$('[data-schedule-count]').forEach(el=>el.addEventListener('click',()=>changeScheduleCount(Number(el.dataset.scheduleCount))));
  $$('[data-schedule-day]').forEach(el=>el.addEventListener('click',()=>toggleScheduleDay(el.dataset.scheduleDay)));
  $$('[data-schedule-time]').forEach(el=>el.addEventListener('click',()=>{state.scheduleDraft.timeSlot=el.dataset.scheduleTime;render();}));
  const sr=$('#sleepRange'); if(sr) sr.addEventListener('input',()=>$('#sleepReadout').textContent=`${sr.value} h`);
  const weight=$('#weightKg'); if(weight) weight.addEventListener('input',()=>{state.draft.weightKg=weight.value; const pp=$('#proteinPreview'); if(pp) pp.textContent=proteinPreviewText();});
  const safety=$('[data-safety]'); if(safety) safety.addEventListener('click',()=>{state.draft.acceptedSafety=!state.draft.acceptedSafety; render();});
}

async function handleAction(e) {
  const a=e.currentTarget.dataset.action;
  if(a==='start-onboarding'){state.firstRunLanding=false;render();}
  if(a==='back-onboarding'){state.onboardingStep=Math.max(0,state.onboardingStep-1);render();}
  if(a==='next-onboarding') await advanceOnboarding();
  if(a==='settings'){state.view='settings';state.activeSession=null;render();}
  if(a==='minimum-day') startMinimumDay();
  if(a==='close-workout'){state.activeSession=null;render();}
  if(a==='close-missed'){state.missedReview=null;render();}
  if(a==='missed-start'){const id=state.missedReview?.sessionId;state.missedReview=null;if(id)startSession(id);}
  if(a==='completion-done'){state.completion=null;state.view='today';render();scrollTo(0,0);}
  if(a==='completion-plan'){state.completion=null;state.view='plan';render();scrollTo(0,0);}
  if(a==='save-sleep'){state.daily.sleepHours=Number($('#sleepRange').value);await db.setDaily(state.daily);toast('Sleep saved');render();}
  if(a==='calendar') downloadCalendar();
  if(a==='edit-schedule'){state.scheduleDraft={daysPerWeek:state.profile.daysPerWeek,preferredDays:[...state.profile.preferredDays],timeSlot:state.profile.timeSlot};render();}
  if(a==='cancel-schedule'){state.scheduleDraft=null;render();}
  if(a==='save-schedule') await saveSchedule();
  if(a==='edit-health'){state.healthDraft=normalizeHealth(state.health);render();scrollTo(0,0);}
  if(a==='cancel-health-edit'){state.healthDraft=null;render();scrollTo(0,0);}
  if(a==='save-health') await saveHealth();
  if(a==='reset-swaps'){state.profile.exerciseOverrides={};await db.set('profile',state.profile);toast('Exercise swaps reset');render();}
  if(a==='delete-data') await deleteData();
}

function handleSelect(e) {
  const field=e.currentTarget.dataset.select; let value=e.currentTarget.dataset.value;
  if(field==='daysPerWeek' || field==='sessionMinutes') value=Number(value);
  if(field==='goals') {
    state.draft.goals=[value];
  } else if(field==='limitations' || field==='homeKit') {
    const arr=state.draft[field]; const idx=arr.indexOf(value); idx>=0?arr.splice(idx,1):arr.push(value);
  } else state.draft[field]=value;
  if(field==='daysPerWeek') state.draft.preferredDays=[...daySets[value]];
  render();
}

async function updateProfileField(field, value) {
  let parsed=value;
  if(field==='sessionMinutes') parsed=Number(value);
  state.profile={...state.profile,[field]:parsed};
  await db.set('profile',state.profile);
  toast('Training setup updated');
  render();
}

async function toggleProfileArray(field, value) {
  const arr=[...(state.profile[field]||[])];
  const idx=arr.indexOf(value);
  idx>=0?arr.splice(idx,1):arr.push(value);
  state.profile={...state.profile,[field]:arr};
  await db.set('profile',state.profile);
  toast('Equipment updated');
  render();
}

function handleHealthSelect(e) {
  const field=e.currentTarget.dataset.healthSelect;
  const value=e.currentTarget.dataset.value;
  state.healthDraft=normalizeHealth(state.healthDraft || state.health);
  if(field==='boneFlags') {
    const arr=state.healthDraft.boneFlags;
    const idx=arr.indexOf(value);
    idx>=0?arr.splice(idx,1):arr.push(value);
  } else state.healthDraft[field]=value;
  render();
}

async function saveHealth() {
  const source=normalizeHealth(state.healthDraft || state.health);
  state.health={...source,setupDone:true};
  await db.set('health',state.health);
  state.healthDraft=null;
  toast('Health priorities updated');
  render(); scrollTo(0,0);
}

function handleDay(e) {
  const d=e.currentTarget.dataset.day; const arr=state.draft.preferredDays; const idx=arr.indexOf(d);
  if(idx>=0) arr.splice(idx,1); else if(arr.length < state.draft.daysPerWeek) arr.push(d); else { toast(`Choose ${state.draft.daysPerWeek} days`); return; }
  render();
}

function changeScheduleCount(n) {
  if(!state.scheduleDraft) return;
  state.scheduleDraft.daysPerWeek=n;
  state.scheduleDraft.preferredDays=[...daySets[n]];
  render();
}

function toggleScheduleDay(day) {
  const d=state.scheduleDraft; if(!d) return;
  const idx=d.preferredDays.indexOf(day);
  if(idx>=0) d.preferredDays.splice(idx,1);
  else if(d.preferredDays.length < d.daysPerWeek) d.preferredDays.push(day);
  else { toast(`Choose ${d.daysPerWeek} days`); return; }
  render();
}

async function saveSchedule() {
  const d=state.scheduleDraft; if(!d) return;
  if(d.preferredDays.length!==d.daysPerWeek){toast(`Choose exactly ${d.daysPerWeek} training days`);return;}
  state.profile={...state.profile,daysPerWeek:d.daysPerWeek,preferredDays:[...d.preferredDays],timeSlot:d.timeSlot};
  await db.set('profile',state.profile);
  state.scheduleDraft=null;
  toast('Schedule updated');
  render();
}

async function advanceOnboarding() {
  if(state.onboardingStep===1 && state.draft.preferredDays.length!==state.draft.daysPerWeek){toast(`Choose exactly ${state.draft.daysPerWeek} training days`);return;}
  if(state.onboardingStep<2){state.onboardingStep++;render();scrollTo(0,0);return;}
  if(!state.draft.acceptedSafety){toast('Please acknowledge the safety note');return;}
  if(state.draft.limitations.includes('medical-clearance')){toast('Get individualized guidance or clearance before Future You generates an unsupervised training plan.');return;}
  const weight=Number(state.draft.weightKg);
  state.profile={...state.draft, weightKg:Number.isFinite(weight)&&weight>0?weight:null, preferredDays:[...state.draft.preferredDays], goals:[...state.draft.goals], limitations:[...state.draft.limitations]};
  state.startDate=dateISO();
  await db.set('profile',state.profile); await db.set('startDate',state.startDate);
  state.daily=await loadDaily(); state.view='today'; render();
}

function startSession(id) {
  const week=buildWeek(state.profile,state.startDate);
  const session=week.sessions.find(s=>s.id===id);
  if(session){state.activeSession={...session,creditSessionId:session.id};render();scrollTo(0,0);}
}

function startMinimumDay() {
  const schedule=scheduleForWeek(state.profile,state.startDate);
  const today=todayDayName();
  const planned=schedule.find(s=>s.day===today && isProgramActiveOnDate(new Date()));
  const credit = planned?.session.type==='strength' ? planned.session : null;
  state.activeSession={...minimumWorkout(state.profile),creditSessionId:credit?.id||null,creditTitle:credit?.title||null};
  render(); scrollTo(0,0);
}

async function toggleProtein(i) {
  state.daily.proteinMeals[i]=!state.daily.proteinMeals[i];
  await db.setDaily(state.daily); render();
}

async function toggleFibre(i) {
  state.daily.fibreMeals = state.daily.fibreMeals || [false,false,false,false];
  state.daily.fibreMeals[i]=!state.daily.fibreMeals[i];
  await db.setDaily(state.daily); render();
}

function captureWorkoutDraft() {
  const snapshot={};
  $$('.exercise').forEach(el=>{
    snapshot[el.dataset.exercise]=$$('.set-row',el).map(row=>({
      load:$('input[aria-label="Load kg"]',row)?.value ?? '',
      reps:$('input[aria-label="Reps"]',row)?.value ?? '',
      done:$('[data-set-done]',row)?.classList.contains('on') || false
    }));
  });
  return snapshot;
}

function restoreWorkoutDraft(snapshot) {
  $$('.exercise').forEach(el=>{
    const sets=snapshot[el.dataset.exercise];
    if(!sets) return;
    $$('.set-row',el).forEach((row,i)=>{
      if(!sets[i]) return;
      const load=$('input[aria-label="Load kg"]',row); const reps=$('input[aria-label="Reps"]',row); const done=$('[data-set-done]',row);
      if(load) load.value=sets[i].load;
      if(reps) reps.value=sets[i].reps;
      if(done) done.classList.toggle('on',sets[i].done);
    });
  });
}

async function swapActiveExercise(index) {
  const s=state.activeSession;
  if(!s?.exercises?.[index]) return;
  const snapshot=captureWorkoutDraft();
  const current=s.exercises[index];
  const next=nextExerciseAlternative(state.profile,current);
  if(next.name===current.name){toast('No other suitable option in this equipment setup');return;}
  s.exercises[index]=next;
  if(s.id.startsWith('strength-')) {
    state.profile.exerciseOverrides={...(state.profile.exerciseOverrides||{}),[`${s.id}:${current.pattern}`]:next.name};
    await db.set('profile',state.profile);
    toast(`${next.name} saved for future ${s.title} sessions`);
  } else toast(`Swapped to ${next.name}`);
  render();
  restoreWorkoutDraft(snapshot);
}

async function finishWorkout(difficulty) {
  const s=state.activeSession;
  const previous=previousComparableWorkout(s.id);
  const logs=[];
  if(s.exercises?.length) {
    $$('.exercise').forEach((el,ei)=>{
      const loads=$$(`input[name^="load-${ei}-"]`); const reps=$$(`input[name^="reps-${ei}-"]`);
      const doneButtons=$$('[data-set-done]',el);
      const sets=loads.map((input,si)=>({
        load:Number(input.value)||0,
        reps:Number(reps[si]?.value)||0,
        done:doneButtons[si]?.classList.contains('on') || false
      }));
      const doneSets=sets.filter(x=>x.done);
      const completed=doneSets.length;
      const values=doneSets.length ? doneSets : sets;
      const avgLoad=+(values.reduce((a,b)=>a+b.load,0)/Math.max(1,values.length)).toFixed(1);
      const avgReps=Math.round(values.reduce((a,b)=>a+b.reps,0)/Math.max(1,values.length));
      const log={id:el.dataset.exercise,name:el.dataset.name,load:avgLoad,reps:avgReps,setsCompleted:completed,sets};
      log.suggested=nextProgression(log,difficulty,{min:Number(el.dataset.repsMin),max:Number(el.dataset.repsMax)}); logs.push(log);
    });
  }
  const completedBeforeSave=logs.reduce((n,e)=>n+e.setsCompleted,0);
  if(s.exercises?.length && completedBeforeSave===0){toast('Mark at least one set as done before finishing');return;}
  const record={id:`${dateISO()}-${Date.now()}`,date:dateISO(),timestamp:Date.now(),sessionId:s.id,creditedSessionId:s.creditSessionId||s.id,title:s.title,type:s.type,difficulty,exercises:logs};
  await db.addWorkout(record);
  state.workouts=await db.getWorkouts();

  const completedSets=logs.reduce((n,e)=>n+e.setsCompleted,0);
  const totalReps=logs.reduce((n,e)=>n+(e.sets?.filter(x=>x.done).reduce((a,x)=>a+x.reps,0)||0),0);
  const progressed=logs.map(log=>movementProgress(log,previous?.exercises?.find(e=>e.id===log.id))).filter(Boolean);
  const schedule=scheduleForWeek(state.profile,state.startDate);
  const weekCompleted=completedPlannedThisWeek(schedule);
  state.completion={
    title:s.title,type:s.type,duration:s.duration,week:getWeekNumber(state.startDate),
    completedSets,totalReps,progressed,hadPrevious:Boolean(previous),
    intervalEfforts:s.interval?.reps||0,
    weekCompleted,weekPlanned:plannedSessionsThisWeek(schedule).length,
    nextSession:nextPlannedSession(state.profile,state.startDate)
  };
  state.activeSession=null;
  state.view='today';
  render();
  scrollTo(0,0);
}

function reviewMissed(date, sessionId) {
  const existing=state.checkins.find(c=>c.date===date && c.sessionId===sessionId);
  state.missedReview={date,sessionId,reason:existing?.reason||null};
  render();
  setTimeout(()=>document.querySelector('[data-missed-reason]')?.scrollIntoView({behavior:'smooth',block:'center'}),0);
}

async function saveMissedReason(reason) {
  const r=state.missedReview;
  if(!r) return;
  await db.addCheckin({id:`${r.date}-${r.sessionId}`,date:r.date,sessionId:r.sessionId,reason,timestamp:Date.now()});
  state.checkins=await db.getCheckins();
  state.missedReview={...r,reason};
  toast('Reason saved');
  render();
}

async function deleteData() {
  if(!confirm('Delete all Future You data from this browser? This cannot be undone.')) return;
  await db.clearAll(); location.reload();
}

function proteinTargetText(profile) {
  if(!profile.weightKg) return '3–4 protein-rich meals';
  const g=Math.round(profile.weightKg*1.6/5)*5;
  return `~${g} g/day`;
}

function labelMenopause(v){return ({regular:'regular cycles',peri:'perimenopause',post:'postmenopause',unsure:'stage unsure'})[v]||v;}
function experienceLabel(v){return ({beginner:'Starting / restarting',intermediate:'Knows the basics',experienced:'Regular lifter'})[v]||v;}
function goalLabel(v){return ({strength:'Stay strong',muscle:'Build muscle',bone:'Bone + power',fitness:'Improve fitness'})[v]||v;}
function equipmentLabel(v){return ({gym:'gym',home_equipment:'home',none:'bodyweight / no equipment'})[v]||v;}
function formatLongDate(d){return new Intl.DateTimeFormat(undefined,{weekday:'long',day:'numeric',month:'long'}).format(d);}
function escapeAttr(s){return String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');}

function toast(message){const old=$('.toast');if(old)old.remove();const t=document.createElement('div');t.className='toast';t.textContent=message;document.body.append(t);setTimeout(()=>t.remove(),2500);}

function downloadCalendar() {
  const schedule=scheduleForWeek(state.profile,state.startDate);
  const [time]=timeMap[state.profile.timeSlot]; const [hh,mm]=time.split(':').map(Number);
  const now=new Date(); const start=programStartDate();
  const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Future You//V1.8//EN','CALSCALE:GREGORIAN'];
  for(const item of schedule){
    let first=dateForDayName(item.day,now); first.setHours(hh,mm,0,0);
    while(first <= now || first < start) first.setDate(first.getDate()+7);
    for(let w=0;w<12;w++){
      const d=new Date(first); d.setDate(first.getDate()+w*7);
      const end=new Date(d.getTime()+item.session.duration*60000);
      lines.push(
        'BEGIN:VEVENT',
        `UID:${item.session.id}-${d.getTime()}@futureyou.local`,
        `DTSTAMP:${icsDate(new Date())}`,
        `DTSTART:${icsDate(d)}`,
        `DTEND:${icsDate(end)}`,
        `SUMMARY:Future You — ${item.session.title}`,
        'DESCRIPTION:Your scheduled Future You training session.',
        'BEGIN:VALARM','TRIGGER:-PT30M','ACTION:DISPLAY','DESCRIPTION:Future You training','END:VALARM',
        'END:VEVENT'
      );
    }
  }
  lines.push('END:VCALENDAR');
  const blob=new Blob([lines.join('\r\n')],{type:'text/calendar;charset=utf-8'}); const url=URL.createObjectURL(blob); const a=document.createElement('a');a.href=url;a.download='future-you-next-12-weeks.ics';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  toast('Calendar created with 30-minute reminders');
}

function icsDate(d){return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}T${String(d.getHours()).padStart(2,'0')}${String(d.getMinutes()).padStart(2,'0')}00`;}

init();
