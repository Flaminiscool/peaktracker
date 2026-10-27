import { useSyncExternalStore } from 'react';

export type Goal = {
  id: string;
  name: string;
  category: 'school' | 'finance' | 'health' | 'personal';
  target: number;
  current: number;
  unit: string;
  deadline: string;
  history: { date: string; value: number }[];
};

export type Assessment = {
  id: string;
  term: 1 | 2 | 3 | 4;
  name: string;
  description: string;
  distributedDate: string;
  dueDate: string;
  weight: number;
  mark: number | null;
  outOf: number | null;
  fileUrl: string;
};

export type Subject = {
  id: string;
  name: string;
  teacher: string;
  room: string;
  notes: string;
  driveUrl: string;
  assessments: Assessment[];
};

export type Assignment = {
  id: string;
  subject: string;
  name: string;
  description: string;
  url: string;
  dueDate: string;
  status: 'todo' | 'done';
};

export type Todo = {
  id: string;
  text: string;
  done: boolean;
};

export type Habit = {
  id: string;
  name: string;
  streak: number;
  history: Record<string, boolean>;
};

export type SleepEntry = {
  date: string;
  label: string;
  hours: number;
};

export type DrinkLog = {
  id: string;
  name: string;
  amount: number;
  time: string;
};

export type HydrationDay = {
  date: string;
  goal: number;
  logs: DrinkLog[];
};

export type JournalMedia =
  | { type: 'image'; data: string }
  | { type: 'video'; url: string; title: string }
  | { type: 'video-file'; data: string; title: string };

export type JournalEntry = {
  id: string;
  date: string;
  events: string;
  growth: string;
  plan: string;
  emotions: string[];
  mood: number;
  media: JournalMedia[];
};

export type Transaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
};

export type TimetableCell = { subject: string; room: string; teacher: string };
export type WeekTimetable = Record<string, Record<string, TimetableCell>>;

export type AfterSchoolActivity = {
  id: string;
  day: string; // 'Monday'..'Sunday'
  name: string;
  time: string;
  endTime: string;
  location: string;
  type: 'tuition' | 'music' | 'sport' | 'exam' | 'other';
  isOnline: boolean;
  notes: string;
  color: string;
};

export type DashboardData = {
  focus: string;
  todos: Todo[];
  quoteIndex: number;
  goals: Goal[];
  subjects: Subject[];
  assignments: Assignment[];
  habits: Habit[];
  sleep: SleepEntry[];
  hydration: HydrationDay[];
  hydrationGoal: number;
  journal: JournalEntry[];
  timetable: { A: WeekTimetable; B: WeekTimetable };
  afterSchool: AfterSchoolActivity[];
  finance: { balance: number; goal: number; goalName: string; transactions: Transaction[] };
};

export function computeStreak(history: Record<string, boolean>) {
  let streak = 0;
  const cur = new Date();
  while (true) {
    const key = cur.toISOString().split('T')[0];
    if (history[key]) {
      streak++;
      cur.setDate(cur.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

const C = (subject: string, room = '', teacher = ''): TimetableCell => ({ subject, room, teacher });
const E = (): TimetableCell => ({ subject: '', room: '', teacher: '' });
const ASM = (): TimetableCell => ({ subject: 'Assembly / Wellbeing', room: '', teacher: '' });

// Parsed from iCal: UTC times → AEST (+10h). Z dates like 20260421 UTC = Apr 22 AEST (Wed)
// WEEK A: Mon=May4, Wed=Apr22, Thu=Apr23, Fri=Apr24 (confirmed from iCal)
// WEEK B: Tue=Apr28, Wed=Apr29, Thu=Apr30, Fri=May1
function buildSeedTimetable(): { A: WeekTimetable; B: WeekTimetable } {
  const weekA: WeekTimetable = {
    Monday: {
      P1: C('PDHPE', '26', 'Mr Christopher Kavaliauskas'),
      P2: C('Sport', 'C3', 'Ms Chrystal Player'),
      P3: C('Sport', 'C3', 'Ms Chrystal Player'),
      P4: C('History', '16_A', 'Ms Trisha Millhouse'),
      P5: C('History', '16_A', 'Ms Trisha Millhouse'),
    },
    Tuesday: { P1: E(), P2: E(), P3: E(), P4: E(), P5: E() },
    Wednesday: {
      P1: C('Music', '41-MUS', 'Mr Benjamin Secrett'),
      P2: C('Science', '36-LAB', 'Mr Davendra Goundar'),
      P3: C('Mathematics', '05-FFL', 'Ms Jessica Yu'),
      P4: ASM(),
      P5: C('English', '11', 'Mr Michael Jung'),
    },
    Thursday: {
      P1: C('Science', 'DM_6', 'Mr Davendra Goundar'),
      P2: C('English', 'DM_3', 'Mr Michael Jung'),
      P3: C('Computing Technology', '04-COM', 'Mr Rajneel Prasad'),
      P4: C('Computing Technology', '04-COM', 'Mr Rajneel Prasad'),
      P5: C('History', '16_A', 'Ms Trisha Millhouse'),
    },
    Friday: {
      P1: C('History', '17', 'Mr Mahmoud Hammoud'),
      P2: C('Computing Technology', '04-COM', 'Mr Rajneel Prasad'),
      P3: C('Music', '41-MUS', 'Mr Benjamin Secrett'),
      P4: C('Mathematics', '05-FFL', 'Ms Jessica Yu'),
      P5: C('Science', 'DM_8', 'Mr Davendra Goundar'),
    },
  };

  const weekB: WeekTimetable = {
    Monday: { P1: E(), P2: E(), P3: E(), P4: E(), P5: E() },
    Tuesday: {
      P1: C('PDHPE', 'DM_8', 'Miss Nurcan Yikilmaz'),
      P2: C('English', '11', 'Mr Michael Jung'),
      P3: C('English', '11', 'Mr Michael Jung'),
      P4: C('Music', '41-MUS', 'Mr Benjamin Secrett'),
      P5: C('Computing Technology', '04-COM', 'Mr Rajneel Prasad'),
    },
    Wednesday: {
      P1: C('Mathematics', '05-FFL', 'Ms Jessica Yu'),
      P2: C('English', '16_A', 'Mr Michael Jung'),
      P3: C('Science', '36-LAB', 'Mr Davendra Goundar'),
      P4: ASM(),
      P5: C('English', '14', 'Mr Michael Jung'),
    },
    Thursday: {
      P1: C('History', '17', 'Mr Mahmoud Hammoud'),
      P2: C('Science', 'DM_5', 'Mr Davendra Goundar'),
      P3: C('History', '16_A', 'Ms Trisha Millhouse'),
      P4: C('Mathematics', '05-FFL', 'Ms Jessica Yu'),
      P5: C('Computing Technology', '04-COM', 'Mr Rajneel Prasad'),
    },
    Friday: {
      P1: C('Science', '36-LAB', 'Mr Davendra Goundar'),
      P2: C('Mathematics', '05-FFL', 'Ms Jessica Yu'),
      P3: C('Music', '41-MUS', 'Mr Benjamin Secrett'),
      P4: C('Music', '41-MUS', 'Mr Benjamin Secrett'),
      P5: C('Mathematics', '05-FFL', 'Ms Jessica Yu'),
    },
  };

  return { A: weekA, B: weekB };
}

const DEFAULT_AFTER_SCHOOL: AfterSchoolActivity[] = [
  { id: '1', day: 'Monday', name: 'Matrix English Tuition', time: '16:30', endTime: '18:00', location: 'Parramatta', type: 'tuition', isOnline: false, notes: 'Weekly class', color: '#3b82f6' },
  { id: '2', day: 'Tuesday', name: 'Carnatic Flute', time: '16:30', endTime: '17:30', location: 'Home / Giridhar sir', type: 'music', isOnline: false, notes: 'Giridhar sir', color: '#a855f7' },
  { id: '3', day: 'Wednesday', name: 'Cosmos Maths Tuition', time: '16:30', endTime: '18:30', location: 'Parramatta', type: 'tuition', isOnline: false, notes: '~1hr travel home, back by ~7:30pm', color: '#10b981' },
  { id: '4', day: 'Friday', name: 'Cosmos Maths Tuition', time: '16:30', endTime: '18:30', location: 'Online', type: 'tuition', isOnline: true, notes: 'Online class from home', color: '#10b981' },
  { id: '5', day: 'Sunday', name: 'Cosmos Maths Exam', time: '11:00', endTime: '12:00', location: 'Online / Cosmos', type: 'exam', isOnline: true, notes: 'Weekly practice test', color: '#f59e0b' },
];

function makeSeed(): DashboardData {
  const subjects: Subject[] = [
    { id: '1', name: 'English', teacher: 'Mr Michael Jung', room: '11', notes: '', driveUrl: '', assessments: [] },
    { id: '2', name: 'Mathematics', teacher: 'Ms Jessica Yu', room: '05-FFL', notes: '', driveUrl: '', assessments: [] },
    { id: '3', name: 'Science', teacher: 'Mr Davendra Goundar', room: '36-LAB', notes: '', driveUrl: '', assessments: [] },
    { id: '4', name: 'History', teacher: 'Ms Trisha Millhouse', room: '16_A', notes: '', driveUrl: '', assessments: [] },
    { id: '5', name: 'Computing Technology', teacher: 'Mr Rajneel Prasad', room: '04-COM', notes: '', driveUrl: '', assessments: [] },
    { id: '6', name: 'Music', teacher: 'Mr Benjamin Secrett', room: '41-MUS', notes: '', driveUrl: '', assessments: [] },
    { id: '7', name: 'PDHPE', teacher: 'Miss Nurcan Yikilmaz', room: '', notes: '', driveUrl: '', assessments: [] },
    { id: '8', name: 'Sport', teacher: 'Ms Chrystal Player', room: 'C3', notes: '', driveUrl: '', assessments: [] },
  ];

  return {
    focus: '',
    todos: [],
    quoteIndex: 0,
    goals: [],
    subjects,
    assignments: [],
    habits: [
      { id: '1', name: 'Drink 2L Water', streak: 0, history: {} },
      { id: '2', name: 'Exercise 30min', streak: 0, history: {} },
      { id: '3', name: 'Read 20min', streak: 0, history: {} },
      { id: '4', name: 'No phone before bed', streak: 0, history: {} },
      { id: '5', name: 'Review notes', streak: 0, history: {} },
    ],
    sleep: [],
    hydration: [],
    hydrationGoal: 2000,
    journal: [],
    timetable: buildSeedTimetable(),
    afterSchool: DEFAULT_AFTER_SCHOOL,
    finance: { balance: 0, goal: 500, goalName: 'Savings Goal', transactions: [] },
  };
}

const STORAGE_KEY = 'shreyash-dashboard-v4';

function migrateData(parsed: any): DashboardData {
  const seed = makeSeed();
  // Migrate old journal images→media
  const journal = (parsed.journal || []).map((j: any) => ({
    ...j,
    media: j.media || (j.images ? j.images.map((img: string) => ({ type: 'image', data: img })) : []),
  }));
  // Migrate old timetable (flat → A/B)
  let timetable = parsed.timetable;
  if (!timetable?.A) timetable = seed.timetable;
  // Migrate old subjects (add missing driveUrl)
  const subjects = (parsed.subjects || seed.subjects).map((s: any) => ({
    ...s,
    driveUrl: s.driveUrl || '',
    assessments: s.assessments || [],
  }));

  return {
    ...seed,
    ...parsed,
    journal,
    timetable,
    subjects,
    todos: parsed.todos || [],
    quoteIndex: parsed.quoteIndex || 0,
    afterSchool: parsed.afterSchool || seed.afterSchool,
    finance: { ...seed.finance, ...parsed.finance },
  };
}

// ---------------------------------------------------------------------------
// Shared store. One copy of the data lives at module level so every tab, plus
// the cloud-sync code, always sees the same thing.
// ---------------------------------------------------------------------------
const UPDATED_KEY = 'shreyash-dashboard-v4-updated';

function loadLocal(): DashboardData {
  try {
    const v4 = localStorage.getItem(STORAGE_KEY);
    if (v4) return migrateData(JSON.parse(v4));
    const v3 = localStorage.getItem('shreyash-dashboard-v3');
    if (v3) return migrateData(JSON.parse(v3));
  } catch {}
  return makeSeed();
}

let state: DashboardData = loadLocal();
const listeners = new Set<() => void>();

export function getLocalUpdatedAt(): number {
  return Number(localStorage.getItem(UPDATED_KEY) || 0);
}

function persist(next: DashboardData, updatedAt: number) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    localStorage.setItem(UPDATED_KEY, String(updatedAt));
  } catch {
    console.warn('Storage quota exceeded');
  }
}

function emit() {
  listeners.forEach(l => l());
}

/** Called for every edit the user makes. */
function commitLocalEdit(next: DashboardData) {
  state = next;
  persist(next, Date.now());
  emit();
  changeHandlers.forEach(h => h());
}

/** Called by the sync code when newer data arrives from the cloud. */
export function applyRemoteData(remote: unknown, updatedAt: number) {
  state = migrateData(remote);
  persist(state, updatedAt);
  emit();
}

export function getData(): DashboardData {
  return state;
}

const changeHandlers = new Set<() => void>();
/** Sync code subscribes here to learn about local edits. */
export function onLocalEdit(handler: () => void) {
  changeHandlers.add(handler);
  return () => { changeHandlers.delete(handler); };
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => { listeners.delete(l); };
}

export function useStore() {
  const data = useSyncExternalStore(subscribe, () => state);
  const upd = (fn: (d: DashboardData) => DashboardData) => commitLocalEdit(fn(state));

  return {
    data,
    updateFocus: (focus: string) => upd(d => ({ ...d, focus })),

    // Todos
    addTodo: (text: string) => upd(d => ({ ...d, todos: [...d.todos, { id: Date.now().toString(), text, done: false }] })),
    toggleTodo: (id: string) => upd(d => ({ ...d, todos: d.todos.map(t => t.id === id ? { ...t, done: !t.done } : t) })),
    removeTodo: (id: string) => upd(d => ({ ...d, todos: d.todos.filter(t => t.id !== id) })),
    updateTodo: (id: string, text: string) => upd(d => ({ ...d, todos: d.todos.map(t => t.id === id ? { ...t, text } : t) })),

    // Quote cycling
    nextQuote: (total: number) => upd(d => ({ ...d, quoteIndex: (d.quoteIndex + 1) % total })),
    prevQuote: (total: number) => upd(d => ({ ...d, quoteIndex: (d.quoteIndex - 1 + total) % total })),

    // Goals
    addGoal: (goal: Omit<Goal, 'id' | 'history'>) => upd(d => ({ ...d, goals: [...d.goals, { ...goal, id: Date.now().toString(), history: [{ date: new Date().toISOString().split('T')[0], value: 0 }] }] })),
    updateGoal: (id: string, value: number) => upd(d => ({ ...d, goals: d.goals.map(g => g.id === id ? { ...g, current: value, history: [...g.history, { date: new Date().toISOString().split('T')[0], value }] } : g) })),
    removeGoal: (id: string) => upd(d => ({ ...d, goals: d.goals.filter(g => g.id !== id) })),

    // Subjects
    updateSubjectNotes: (id: string, notes: string) => upd(d => ({ ...d, subjects: d.subjects.map(s => s.id === id ? { ...s, notes } : s) })),
    updateSubjectDriveUrl: (id: string, driveUrl: string) => upd(d => ({ ...d, subjects: d.subjects.map(s => s.id === id ? { ...s, driveUrl } : s) })),

    // Assessments
    addAssessment: (subjectId: string, a: Omit<Assessment, 'id'>) =>
      upd(d => ({ ...d, subjects: d.subjects.map(s => s.id === subjectId ? { ...s, assessments: [...s.assessments, { ...a, id: Date.now().toString() }] } : s) })),
    updateAssessment: (subjectId: string, a: Assessment) =>
      upd(d => ({ ...d, subjects: d.subjects.map(s => s.id === subjectId ? { ...s, assessments: s.assessments.map(x => x.id === a.id ? a : x) } : s) })),
    removeAssessment: (subjectId: string, assessmentId: string) =>
      upd(d => ({ ...d, subjects: d.subjects.map(s => s.id === subjectId ? { ...s, assessments: s.assessments.filter(a => a.id !== assessmentId) } : s) })),

    // Assignments
    addAssignment: (a: Omit<Assignment, 'id' | 'status'>) =>
      upd(d => ({ ...d, assignments: [...d.assignments, { ...a, id: Date.now().toString(), status: 'todo' as const }] })),
    toggleAssignment: (id: string) =>
      upd(d => ({ ...d, assignments: d.assignments.map(a => a.id === id ? { ...a, status: a.status === 'done' ? 'todo' as const : 'done' as const } : a) })),
    removeAssignment: (id: string) =>
      upd(d => ({ ...d, assignments: d.assignments.filter(a => a.id !== id) })),

    // Habits
    toggleHabit: (id: string, dateStr: string) =>
      upd(d => ({ ...d, habits: d.habits.map(h => { if (h.id !== id) return h; const nh = { ...h.history, [dateStr]: !h.history[dateStr] }; return { ...h, history: nh, streak: computeStreak(nh) }; }) })),
    addHabit: (name: string) =>
      upd(d => ({ ...d, habits: [...d.habits, { id: Date.now().toString(), name, streak: 0, history: {} }] })),
    updateHabit: (id: string, name: string) =>
      upd(d => ({ ...d, habits: d.habits.map(h => h.id === id ? { ...h, name } : h) })),
    removeHabit: (id: string) =>
      upd(d => ({ ...d, habits: d.habits.filter(h => h.id !== id) })),

    // Sleep
    addSleep: (entry: SleepEntry) =>
      upd(d => { const existing = d.sleep.find(s => s.date === entry.date); if (existing) return { ...d, sleep: d.sleep.map(s => s.date === entry.date ? entry : s) }; return { ...d, sleep: [...d.sleep.slice(-20), entry].sort((a, b) => a.date.localeCompare(b.date)) }; }),

    // Hydration
    addDrink: (drink: Omit<DrinkLog, 'id'>) =>
      upd(d => { const today = new Date().toISOString().split('T')[0]; const nl: DrinkLog = { ...drink, id: Date.now().toString() }; const ex = d.hydration.find(h => h.date === today); if (ex) return { ...d, hydration: d.hydration.map(h => h.date === today ? { ...h, logs: [...h.logs, nl] } : h) }; return { ...d, hydration: [...d.hydration, { date: today, goal: d.hydrationGoal, logs: [nl] }] }; }),
    removeDrink: (drinkId: string) =>
      upd(d => { const today = new Date().toISOString().split('T')[0]; return { ...d, hydration: d.hydration.map(h => h.date === today ? { ...h, logs: h.logs.filter(l => l.id !== drinkId) } : h) }; }),
    setHydrationGoal: (goal: number) => upd(d => ({ ...d, hydrationGoal: goal })),

    // Journal
    saveJournalEntry: (entry: Omit<JournalEntry, 'id'>) =>
      upd(d => { const ex = d.journal.find(j => j.date === entry.date); if (ex) return { ...d, journal: d.journal.map(j => j.date === entry.date ? { ...j, ...entry } : j) }; return { ...d, journal: [{ ...entry, id: Date.now().toString() }, ...d.journal] }; }),

    // Timetable
    updateTimetableCell: (week: 'A' | 'B', day: string, period: string, cell: TimetableCell) =>
      upd(d => ({ ...d, timetable: { ...d.timetable, [week]: { ...d.timetable[week], [day]: { ...d.timetable[week][day], [period]: cell } } } })),

    // After school
    addAfterSchool: (a: Omit<AfterSchoolActivity, 'id'>) =>
      upd(d => ({ ...d, afterSchool: [...d.afterSchool, { ...a, id: Date.now().toString() }] })),
    updateAfterSchool: (a: AfterSchoolActivity) =>
      upd(d => ({ ...d, afterSchool: d.afterSchool.map(x => x.id === a.id ? a : x) })),
    removeAfterSchool: (id: string) =>
      upd(d => ({ ...d, afterSchool: d.afterSchool.filter(a => a.id !== id) })),

    // Finance
    addTransaction: (t: Omit<Transaction, 'id'>) =>
      upd(d => ({ ...d, finance: { ...d.finance, balance: +(d.finance.balance + (t.type === 'income' ? +t.amount : -+t.amount)).toFixed(2), transactions: [{ ...t, id: Date.now().toString(), amount: +t.amount }, ...d.finance.transactions] } })),
    removeTransaction: (id: string) =>
      upd(d => { const t = d.finance.transactions.find(tx => tx.id === id); if (!t) return d; return { ...d, finance: { ...d.finance, balance: +(d.finance.balance + (t.type === 'income' ? -t.amount : t.amount)).toFixed(2), transactions: d.finance.transactions.filter(tx => tx.id !== id) } }; }),
    updateFinanceGoal: (goal: number, goalName: string) =>
      upd(d => ({ ...d, finance: { ...d.finance, goal, goalName } })),
  };
}
