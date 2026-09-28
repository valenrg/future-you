const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const WEEK_ORDER = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

const gymLibrary = {
  squat: ['Leg press', 'Goblet squat', 'Barbell squat'],
  hinge: ['Romanian deadlift', 'Trap-bar deadlift', 'Cable pull-through'],
  pushH: ['Machine chest press', 'Dumbbell bench press', 'Incline push-up'],
  pullH: ['Seated cable row', 'Chest-supported row', 'One-arm dumbbell row'],
  pushV: ['Dumbbell overhead press', 'Machine shoulder press'],
  pullV: ['Lat pulldown', 'Assisted pull-up'],
  unilateral: ['Split squat', 'Reverse lunge', 'Step-up'],
  hip: ['Hip thrust', 'Glute bridge'],
  carry: ['Farmer carry', 'Suitcase carry'],
  calf: ['Standing calf raise']
};

const bodyweightLibrary = {
  squat: ['Chair squat', 'Sit-to-stand', 'Tempo bodyweight squat'],
  hinge: ['Bodyweight hip hinge', 'Single-leg hip hinge'],
  pushH: ['Wall push-up', 'Counter push-up', 'Knee push-up'],
  pullH: ['Towel isometric row', 'Prone W raise'],
  pushV: ['Wall press', 'Pike press to wall'],
  pullV: ['Prone lat sweep', 'Towel pulldown isometric'],
  unilateral: ['Supported split squat', 'Reverse lunge', 'Step-up'],
  hip: ['Glute bridge', 'Single-leg glute bridge'],
  carry: ['March with loaded backpack', 'Tall march'],
  calf: ['Standing calf raise', 'Single-leg calf raise']
};

const coreExercises = ['Dead bug', 'Side plank', 'Bird dog'];

function unique(items) { return [...new Set(items.filter(Boolean))]; }
function choose(list, index = 0) { return list[index % list.length]; }

export function libraryFor(profile) {
  if (profile.equipment === 'gym') return gymLibrary;
  if (profile.equipment === 'none') return bodyweightLibrary;

  const kit = new Set(profile.homeKit || ['dumbbells','bands']);
  const has = x => kit.has(x);
  return {
    squat: unique([
      has('barbell') ? 'Barbell squat' : null,
      has('dumbbells') ? 'Goblet squat' : null,
      has('kettlebell') ? 'Kettlebell goblet squat' : null,
      has('bench') ? 'Dumbbell squat to box' : null,
      'Chair squat'
    ]),
    hinge: unique([
      has('barbell') ? 'Barbell Romanian deadlift' : null,
      has('dumbbells') ? 'Dumbbell Romanian deadlift' : null,
      has('kettlebell') ? 'Kettlebell deadlift' : null,
      has('bands') ? 'Banded good morning' : null,
      'Bodyweight hip hinge'
    ]),
    pushH: unique([
      has('barbell') ? (has('bench') ? 'Barbell bench press' : 'Barbell floor press') : null,
      has('dumbbells') ? (has('bench') ? 'Dumbbell bench press' : 'Dumbbell floor press') : null,
      has('bands') ? 'Band chest press' : null,
      has('bench') ? 'Incline push-up' : 'Counter push-up'
    ]),
    pullH: unique([
      has('barbell') ? 'Barbell row' : null,
      has('dumbbells') ? 'One-arm dumbbell row' : null,
      has('kettlebell') ? 'One-arm kettlebell row' : null,
      has('bands') ? 'Band row' : null,
      'Towel isometric row'
    ]),
    pushV: unique([
      has('barbell') ? 'Barbell overhead press' : null,
      has('dumbbells') ? 'Dumbbell overhead press' : null,
      has('kettlebell') ? 'Kettlebell overhead press' : null,
      has('bands') ? 'Band overhead press' : null,
      'Wall press'
    ]),
    pullV: unique([
      has('bands') ? 'Band pulldown' : null,
      has('bands') ? 'Band straight-arm pulldown' : null,
      'Prone lat sweep'
    ]),
    unilateral: unique([
      has('dumbbells') ? 'Dumbbell reverse lunge' : null,
      has('bench') ? 'Step-up' : null,
      'Supported split squat',
      'Reverse lunge'
    ]),
    hip: unique([
      has('barbell') ? (has('bench') ? 'Barbell hip thrust' : 'Barbell glute bridge') : null,
      has('dumbbells') ? 'Weighted glute bridge' : null,
      has('kettlebell') ? 'Kettlebell glute bridge' : null,
      has('bench') && has('dumbbells') ? 'Dumbbell hip thrust' : null,
      'Glute bridge'
    ]),
    carry: unique([
      has('dumbbells') ? 'Farmer carry' : null,
      has('kettlebell') ? 'Suitcase carry' : null,
      'March with loaded backpack'
    ]),
    calf: ['Single-leg calf raise','Standing calf raise']
  };
}

export function alternativesFor(profile, pattern) {
  return libraryFor(profile)[pattern] || [];
}

function bodyweightLike(name, profile) {
  if (profile.equipment === 'none') return true;
  return /push-up|plank|dead bug|bird dog|sit-to-stand|chair squat|bodyweight|bridge|raise|march|step-up|split squat|reverse lunge|wall press|prone|towel/i.test(name) && !/barbell|dumbbell|kettlebell|weighted/i.test(name);
}

export function makeExercise(name, pattern, profile, opts = {}) {
  return {
    id: `${pattern}-${name.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`,
    name,
    pattern,
    sets: opts.sets || 3,
    repsMin: opts.repsMin || 6,
    repsMax: opts.repsMax || 10,
    bodyweight: bodyweightLike(name, profile),
    cue: opts.cue || cueFor(pattern)
  };
}

function cueFor(pattern) {
  return ({
    squat: 'Move with control. Keep the whole foot connected to the floor.',
    hinge: 'Push the hips back and keep the load close to you.',
    pushH: 'Keep ribs stacked; press without shrugging.',
    pullH: 'Lead with the elbows and finish without twisting.',
    pushV: 'Press smoothly overhead without forcing range.',
    pullV: 'Pull elbows toward your sides; keep the neck relaxed.',
    unilateral: 'Use support if needed and keep the front foot stable.',
    hip: 'Finish with the glutes, not an exaggerated back arch.',
    carry: 'Stand tall and move slowly without leaning.',
    calf: 'Rise under control; pause briefly at the top.',
    core: 'Breathe and brace without holding your breath.'
  })[pattern] || 'Use a pain-free range and controlled technique.';
}

function powerBlock(profile, week) {
  const noImpact = profile.limitations.includes('no-impact') || profile.limitations.includes('pelvic-floor') || profile.limitations.includes('knee') || profile.limitations.includes('hip') || profile.limitations.includes('medical-clearance');
  const beginner = profile.experience === 'beginner';
  const experienced = profile.experience === 'experienced';

  if (noImpact) {
    if (beginner) return { name: 'Fast sit-to-stand', sets: 3, reps: 5, note: 'Stand up quickly; lower with control. Stop well before fatigue.' };
    return { name: 'Fast squat to calf raise', sets: 3, reps: 5, note: 'Use a familiar pain-free squat depth, drive up fast, finish tall onto the toes, and keep it non-impact.' };
  }

  if (beginner && week <= 2) {
    return { name: 'Fast sit-to-stand', sets: 3, reps: 5, note: 'Stand up quickly; lower with control. Stop well before fatigue.' };
  }
  if (beginner && week <= 4) return { name: 'Low pogo hops', sets: 3, reps: 6, note: 'Small, quiet contacts. Stop if impact is uncomfortable.' };

  if (experienced) {
    if (profile.primaryGoal === 'bone') return { name: 'Countermovement jump', sets: 4, reps: 4, note: 'Jump with intent, land softly, fully reset, and keep every rep crisp.' };
    return { name: 'Countermovement jump', sets: 3, reps: 4, note: 'High intent, low fatigue: jump, land softly, fully reset, repeat.' };
  }

  if (week <= 2) return { name: 'Low pogo hops', sets: 3, reps: 8, note: 'Small, springy contacts with a quiet landing. Stop well before fatigue.' };
  if (week <= 4) return { name: 'Low squat jump', sets: 3, reps: 4, note: 'Jump with intent, land softly, and fully reset between reps.' };
  if (profile.primaryGoal === 'bone') return { name: 'Low squat jump', sets: 4, reps: 5, note: 'Jump with intent, land softly, and fully reset. Quality over fatigue.' };
  return { name: 'Low squat jump', sets: 3, reps: 5, note: 'Jump with intent, land softly, fully reset between reps.' };
}

function phaseForWeek(week, goal = 'strength') {
  const muscle = goal === 'muscle';
  if (week <= 4) return { name: 'Foundation', reps: muscle ? [8,12] : [8,10], sets: 3, note: 'Own the movement and finish with good form.' };
  if (week <= 8) return { name: 'Build', reps: muscle ? [8,10] : [6,8], sets: 3, note: 'Gradually increase resistance while keeping reps crisp.' };
  return { name: 'Strength + power', reps: muscle ? [6,10] : [4,6], sets: 3, note: muscle ? 'Keep building useful muscle with progressively harder sets.' : 'Experienced lifters move heavier; beginners can stay at 6–8 reps.' };
}

function adaptPhase(profile, phase) {
  if (profile.experience === 'beginner' && phase.reps[0] < 6) return {...phase, reps:[6,8]};
  if (profile.equipment === 'none') return {...phase, reps:[8,12]};
  return phase;
}

function movementCount(profile) {
  const minutes = Number(profile.sessionMinutes || 35);
  if (minutes <= 25) return 4;
  if (minutes >= 45) return 6;
  return 5;
}

function durationFor(profile) {
  return Number(profile.sessionMinutes || (profile.experience === 'beginner' ? 30 : 35));
}

function selectedName(profile, sessionKey, pattern, fallbackList, idx) {
  const saved = profile.exerciseOverrides?.[`${sessionKey}:${pattern}`];
  if (saved && fallbackList.includes(saved)) return saved;
  return choose(fallbackList, idx);
}

function buildStrengthSession(key, profile, week) {
  const lib = libraryFor(profile);
  const phase = adaptPhase(profile, phaseForWeek(week, profile.primaryGoal));
  const r = phase.reps;
  const s = phase.sets;
  const variants = {
    A: [['squat',0], ['pullH',0], ['hinge',0], ['pushH',0], ['carry',0], ['pullV',0]],
    B: [['unilateral',0], ['pushV',0], ['hip',0], ['pullV',0], ['calf',0], ['pullH',0]],
    C: [['squat',1], ['pullH',1], ['hinge',1], ['pushH',1], ['unilateral',1], ['hip',0]]
  };
  const count = movementCount(profile);
  const exs = variants[key].slice(0,count).map(([pattern, idx]) => {
    const options = lib[pattern];
    const name = selectedName(profile, `strength-${key}`, pattern, options, idx);
    return makeExercise(name, pattern, profile, {sets:s, repsMin:r[0], repsMax:r[1]});
  });
  if (profile.sessionMinutes >= 35) exs.push(makeExercise(coreExercises[(key.charCodeAt(0)-65)%coreExercises.length], 'core', profile, {sets:2, repsMin:6, repsMax:10}));
  return {
    id: `strength-${key}`,
    type: 'strength',
    title: `Strength ${key}`,
    duration: durationFor(profile),
    phase: phase.name,
    phaseNote: phase.note,
    power: powerBlock(profile, week),
    exercises: exs
  };
}

export function buildIntervalSession(profile, week) {
  const beginner = profile.experience === 'beginner' || profile.limitations.includes('medical-clearance');
  const reps = beginner ? 3 : Math.min(5, 3 + Math.floor((week-1)/4));
  return {
    id: 'interval', type: 'interval', title: beginner ? 'Short intervals' : 'Sprint intervals', duration: beginner ? 20 : 24,
    phase: phaseForWeek(week, profile.primaryGoal).name,
    power: null,
    exercises: [],
    interval: {
      reps,
      work: beginner ? 20 : 30,
      recovery: beginner ? 120 : 150,
      note: beginner
        ? 'Choose a bike, incline walk or other stable mode. Work hard but controlled — not all-out.'
        : 'Choose a safe mode such as bike, rower or hill. Each effort is very hard, with enough recovery to keep quality high.'
    }
  };
}

export function getWeekNumber(startDateISO) {
  const start = new Date(`${startDateISO}T00:00:00`);
  const now = new Date();
  const days = Math.floor((strip(now)-strip(start))/86400000);
  return Math.max(1, Math.min(12, Math.floor(days/7)+1));
}

function strip(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); }

export function buildWeek(profile, startDateISO) {
  const week = getWeekNumber(startDateISO);
  const strengthKeys = profile.daysPerWeek === 2 ? ['A','B'] : ['A','B','C'];
  let sessions = strengthKeys.map(k => buildStrengthSession(k, profile, week));
  if (profile.daysPerWeek === 4) sessions.splice(1,0,buildIntervalSession(profile, week));
  else if (profile.daysPerWeek >= 2 && !profile.limitations.includes('medical-clearance')) {
    const finisher = buildIntervalSession(profile, week).interval;
    sessions = sessions.map((s, i) => {
      const shouldAdd = profile.primaryGoal === 'fitness' ? i <= 1 : i === 0;
      return shouldAdd ? {...s, intervalFinisher: finisher} : s;
    });
  }
  return { week, phase: phaseForWeek(week, profile.primaryGoal).name, sessions };
}

export function scheduleForWeek(profile, startDateISO) {
  const built = buildWeek(profile, startDateISO);
  const orderedDays = [...profile.preferredDays].sort((a,b)=>WEEK_ORDER.indexOf(a)-WEEK_ORDER.indexOf(b));
  return orderedDays.map((day, i) => ({ day, session: built.sessions[i % built.sessions.length] }));
}

export function todayDayName() { return DAY_NAMES[new Date().getDay()]; }

export function mondayOf(date = new Date()) {
  const d = new Date(date); const day = d.getDay(); const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

export function dateISO(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export function dateForDayName(dayName, reference = new Date()) {
  const idx = DAY_NAMES.indexOf(dayName);
  const mon = mondayOf(reference);
  const offset = idx === 0 ? 6 : idx - 1;
  const d = new Date(mon); d.setDate(mon.getDate()+offset); return d;
}

export function minimumWorkout(profile) {
  const lib = libraryFor(profile);
  return {
    id: 'minimum', type:'minimum', title:'12-minute minimum', duration:12,
    phase:'Minimum day', phaseNote:'Two focused rounds. Meaningful beats perfect.', power:null,
    exercises:[
      makeExercise(choose(lib.squat,0),'squat',profile,{sets:2,repsMin:8,repsMax:10}),
      makeExercise(choose(lib.pullH,0),'pullH',profile,{sets:2,repsMin:8,repsMax:10}),
      makeExercise(choose(lib.pushH,0),'pushH',profile,{sets:2,repsMin:8,repsMax:10}),
      makeExercise(choose(lib.hinge,0),'hinge',profile,{sets:2,repsMin:8,repsMax:10})
    ]
  };
}

export function nextExerciseAlternative(profile, ex) {
  const list = alternativesFor(profile, ex.pattern);
  if (!list.length) return ex;
  const idx = Math.max(0, list.indexOf(ex.name));
  const name = list[(idx + 1) % list.length];
  return makeExercise(name, ex.pattern, profile, {sets:ex.sets,repsMin:ex.repsMin,repsMax:ex.repsMax});
}

export function nextProgression(exerciseLog, difficulty, target = {min:6,max:10}) {
  const reps = Number(exerciseLog.reps || 0);
  const load = Number(exerciseLog.load || 0);
  const min = Number(target.min || 6);
  const max = Number(target.max || 10);
  const clamped = Math.max(min, Math.min(max, reps || min));
  const smallIncrease = load ? Math.round((load * 1.05) * 2) / 2 : 0;

  if (difficulty === 'couldnt') {
    return {
      reps: Math.max(min, clamped - 1),
      load: load ? Math.max(0, Math.round((load * 0.9) * 2) / 2) : 0,
      message:'Reduce slightly and rebuild inside the target range.'
    };
  }
  if (difficulty === 'hard') return { reps:clamped, load, message:'Repeat this target next time.' };

  if (clamped < max) {
    return { reps:clamped + 1, load, message:'Add one rep next time if form stays solid.' };
  }

  if (load > 0) {
    return { reps:min, load:smallIncrease, message:'You reached the top of the rep range — add a small amount of load and reset reps.' };
  }

  return { reps:max, load, message:'You reached the top of the rep range — choose a slightly harder variation next time.' };
}
