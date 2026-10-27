import { useStore, JournalEntry, JournalMedia } from '@/hooks/use-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import { useState, useRef } from 'react';
import { Plus, Trash2, ChevronLeft, ChevronRight, Info, Video, Image } from 'lucide-react';

type HealthView = 'sleep' | 'hydration' | 'journal';

const EMOTIONS = ['Excited', 'Grateful', 'Stressed', 'Anxious', 'Happy', 'Sad', 'Angry', 'Focused', 'Tired', 'Proud', 'Motivated', 'Calm'];
const DRINK_PRESETS = [
  { name: 'Water', amount: 250 }, { name: 'Water', amount: 500 },
  { name: 'Coffee', amount: 250 }, { name: 'Tea', amount: 250 },
  { name: 'Sports Drink', amount: 500 }, { name: 'Juice', amount: 250 },
];

function today(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toISOString().split('T')[0];
}

export function HealthTab() {
  const { data, addSleep, addDrink, removeDrink, setHydrationGoal, saveJournalEntry } = useStore();
  const [view, setView] = useState<HealthView>('sleep');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-end flex-wrap gap-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Biometrics</h2>
          <p className="text-muted-foreground mt-1 font-mono text-xs uppercase tracking-widest">Health & Wellbeing</p>
        </div>
        <div className="flex gap-2">
          {(['sleep', 'hydration', 'journal'] as HealthView[]).map(v => (
            <Button key={v} variant={view === v ? 'default' : 'outline'} size="sm" className="font-mono text-xs uppercase" onClick={() => setView(v)}>{v}</Button>
          ))}
        </div>
      </header>

      {view === 'sleep' && <SleepView data={data} addSleep={addSleep} />}
      {view === 'hydration' && <HydrationView data={data} addDrink={addDrink} removeDrink={removeDrink} setHydrationGoal={setHydrationGoal} />}
      {view === 'journal' && <JournalView data={data} saveJournalEntry={saveJournalEntry} />}
    </div>
  );
}

function SleepView({ data, addSleep }: { data: any; addSleep: any }) {
  const [bedtime, setBedtime] = useState('22:30');
  const [waketime, setWaketime] = useState('06:30');
  const [date, setDate] = useState(today());

  const calcHours = () => {
    const [bh, bm] = bedtime.split(':').map(Number);
    const [wh, wm] = waketime.split(':').map(Number);
    let h = (wh + wm / 60) - (bh + bm / 60);
    if (h < 0) h += 24;
    return +h.toFixed(1);
  };

  const last7 = data.sleep.slice(-7);

  return (
    <div className="space-y-6">
      <Card className="bg-card/50 border-border">
        <CardHeader><CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Sleep — Recent History</CardTitle></CardHeader>
        <CardContent>
          {last7.length === 0 ? (
            <p className="text-muted-foreground text-sm font-mono py-4">No sleep logged yet.</p>
          ) : (
            <>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={last7}>
                    <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', fontSize: 11, fontFamily: 'monospace' }} formatter={(v: number) => [`${v}h`, 'Sleep']} />
                    <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-6 mt-4">
                {[['Avg', (last7.reduce((s: number, e: any) => s + e.hours, 0) / last7.length).toFixed(1) + 'h'],
                  ['Best', Math.max(...last7.map((e: any) => e.hours)) + 'h'],
                  ['Least', Math.min(...last7.map((e: any) => e.hours)) + 'h']].map(([label, val]) => (
                  <div key={label}>
                    <div className="text-xl font-mono font-bold">{val}</div>
                    <div className="text-[10px] text-muted-foreground font-mono uppercase">{label}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border">
        <CardHeader><CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Log Sleep</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
          <div className="space-y-1"><label className="text-[10px] font-mono text-muted-foreground uppercase">Date</label><Input type="date" value={date} onChange={e => setDate(e.target.value)} className="font-mono text-xs" /></div>
          <div className="space-y-1"><label className="text-[10px] font-mono text-muted-foreground uppercase">Bedtime</label><Input type="time" value={bedtime} onChange={e => setBedtime(e.target.value)} className="font-mono text-xs" /></div>
          <div className="space-y-1"><label className="text-[10px] font-mono text-muted-foreground uppercase">Wake</label><Input type="time" value={waketime} onChange={e => setWaketime(e.target.value)} className="font-mono text-xs" /></div>
          <Button className="font-mono uppercase text-xs" onClick={() => addSleep({ date, label: new Date(date).toLocaleDateString('en-AU', { weekday: 'short' }), hours: calcHours() })}>Log {calcHours()}h</Button>
        </CardContent>
      </Card>

      <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/20 rounded-lg p-3 border border-border/40">
        <Info size={13} className="mt-0.5 shrink-0 text-primary/60" />
        <span>Fitbit Inspire sync requires OAuth — log manually above. Data saves to this device only.</span>
      </div>
    </div>
  );
}

function HydrationView({ data, addDrink, removeDrink, setHydrationGoal }: any) {
  const [customName, setCustomName] = useState('');
  const [customAmt, setCustomAmt] = useState('');
  const [goalEdit, setGoalEdit] = useState(false);
  const [goalVal, setGoalVal] = useState(String(data.hydrationGoal));

  const todayStr = today();
  const todayLog = data.hydration.find((h: any) => h.date === todayStr) || { logs: [] };
  const totalMl = todayLog.logs.reduce((s: number, l: any) => s + l.amount, 0);
  const pct = Math.min(100, Math.round((totalMl / data.hydrationGoal) * 100));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card/50 border-border">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Today's Hydration</CardTitle>
              <button onClick={() => setGoalEdit(g => !g)} className="text-[10px] font-mono text-muted-foreground hover:text-foreground">Goal: {data.hydrationGoal}ml</button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {goalEdit && (
              <div className="flex gap-2">
                <Input type="number" value={goalVal} onChange={e => setGoalVal(e.target.value)} className="h-8 text-xs font-mono w-28" placeholder="ml" />
                <Button size="sm" className="h-8 text-xs" onClick={() => { setHydrationGoal(Number(goalVal)); setGoalEdit(false); }}>Save</Button>
              </div>
            )}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-2xl font-mono font-bold">{totalMl}ml</span>
                <span className="text-muted-foreground text-sm font-mono self-end">{pct}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
              <div className="text-[10px] font-mono text-muted-foreground mt-1">Goal: {data.hydrationGoal}ml · Recommended for 15yo: 2000–2500ml</div>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {todayLog.logs.length === 0 && <p className="text-xs font-mono text-muted-foreground">Nothing logged yet today.</p>}
              {todayLog.logs.map((l: any) => (
                <div key={l.id} className="flex items-center justify-between text-sm group">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    <span className="font-medium">{l.name}</span>
                    <span className="text-muted-foreground font-mono text-xs">{l.amount}ml</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="font-mono text-xs">{l.time}</span>
                    <button onClick={() => removeDrink(l.id)} className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"><Trash2 size={11} /></button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardHeader><CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Log a Drink</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {DRINK_PRESETS.map((p, i) => (
                <button key={i} onClick={() => addDrink({ name: p.name, amount: p.amount, time: new Date().toTimeString().slice(0, 5) })}
                  className="p-2.5 border border-border rounded-lg text-left hover:border-primary/50 hover:bg-primary/5 transition-all">
                  <div className="text-xs font-bold">{p.name}</div>
                  <div className="text-[10px] text-muted-foreground font-mono">{p.amount}ml</div>
                </button>
              ))}
            </div>
            <div className="border-t border-border pt-3 space-y-2">
              <p className="text-[10px] font-mono text-muted-foreground uppercase">Custom</p>
              <div className="flex gap-2">
                <Input placeholder="Name" value={customName} onChange={e => setCustomName(e.target.value)} className="text-xs" />
                <Input type="number" placeholder="ml" value={customAmt} onChange={e => setCustomAmt(e.target.value)} className="w-20 text-xs font-mono" />
              </div>
              <Button className="w-full font-mono uppercase text-xs" onClick={() => { if (!customAmt) return; addDrink({ name: customName || 'Water', amount: Number(customAmt), time: new Date().toTimeString().slice(0, 5) }); setCustomName(''); setCustomAmt(''); }}>
                <Plus size={13} className="mr-1" /> Log
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function JournalView({ data, saveJournalEntry }: { data: any; saveJournalEntry: any }) {
  const todayStr = today();
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [filterEmotion, setFilterEmotion] = useState<string | null>(null);
  const [customEmotion, setCustomEmotion] = useState('');
  const [viewMode, setViewMode] = useState<'write' | 'browse'>('write');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoFileError, setVideoFileError] = useState('');
  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const existingEntry: JournalEntry | undefined = data.journal.find((j: JournalEntry) => j.date === selectedDate);
  const [form, setForm] = useState({
    events: existingEntry?.events || '',
    growth: existingEntry?.growth || '',
    plan: existingEntry?.plan || '',
    emotions: existingEntry?.emotions || [] as string[],
    mood: existingEntry?.mood || 3,
    media: existingEntry?.media || [] as JournalMedia[],
  });

  const loadEntry = (e: JournalEntry | undefined) => {
    setForm({ events: e?.events || '', growth: e?.growth || '', plan: e?.plan || '', emotions: e?.emotions || [], mood: e?.mood || 3, media: e?.media || [] });
  };

  const handleDateChange = (d: string) => {
    setSelectedDate(d);
    loadEntry(data.journal.find((j: JournalEntry) => j.date === d));
  };

  const toggleEmotion = (e: string) =>
    setForm(f => ({ ...f, emotions: f.emotions.includes(e) ? f.emotions.filter((x: string) => x !== e) : [...f.emotions, e] }));

  const addCustomEmotion = () => {
    if (!customEmotion.trim()) return;
    const e = customEmotion.trim();
    if (!form.emotions.includes(e)) setForm(f => ({ ...f, emotions: [...f.emotions, e] }));
    setCustomEmotion('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files || []).forEach(file => {
      if (file.size > 800 * 1024) { alert(`"${file.name}" is over 800KB — please compress first.`); return; }
      const reader = new FileReader();
      reader.onload = ev => setForm(f => ({ ...f, media: [...f.media, { type: 'image', data: ev.target?.result as string }] }));
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoFileError('');
    if (file.size > 20 * 1024 * 1024) {
      setVideoFileError('Video is over 20MB. Try a smaller clip or use a link instead.');
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setVideoFileError(`Large file (${(file.size / 1024 / 1024).toFixed(1)}MB). It will be stored but may hit browser storage limits.`);
    }
    const reader = new FileReader();
    reader.onload = ev => {
      setForm(f => ({ ...f, media: [...f.media, { type: 'video-file', data: ev.target?.result as string, title: file.name }] }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const addVideoLink = () => {
    if (!videoUrl.trim()) return;
    setForm(f => ({ ...f, media: [...f.media, { type: 'video', url: videoUrl.trim(), title: videoTitle.trim() || videoUrl.trim() }] }));
    setVideoUrl('');
    setVideoTitle('');
  };

  const removeMedia = (i: number) => setForm(f => ({ ...f, media: f.media.filter((_: JournalMedia, idx: number) => idx !== i) }));
  const handleSave = () => saveJournalEntry({ date: selectedDate, ...form });

  const MOOD_LABELS: Record<number, string> = { 1: 'Rough', 2: 'Meh', 3: 'Okay', 4: 'Good', 5: 'Great' };
  const filteredEntries = filterEmotion ? data.journal.filter((j: JournalEntry) => j.emotions.includes(filterEmotion)) : data.journal;
  const allEmotions = [...EMOTIONS, ...Array.from(new Set<string>(data.journal.flatMap((j: JournalEntry) => j.emotions).filter((e: string) => !EMOTIONS.includes(e))))];

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button variant={viewMode === 'write' ? 'default' : 'outline'} size="sm" className="font-mono text-xs uppercase" onClick={() => setViewMode('write')}>Write</Button>
        <Button variant={viewMode === 'browse' ? 'default' : 'outline'} size="sm" className="font-mono text-xs uppercase" onClick={() => setViewMode('browse')}>Browse ({data.journal.length})</Button>
      </div>

      {viewMode === 'browse' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => setFilterEmotion(null)} className={`px-3 py-1 rounded-full text-xs font-mono border transition-colors ${!filterEmotion ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}>All</button>
            {allEmotions.map(e => (
              <button key={e} onClick={() => setFilterEmotion(filterEmotion === e ? null : e)} className={`px-3 py-1 rounded-full text-xs font-mono border transition-colors ${filterEmotion === e ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}>{e}</button>
            ))}
          </div>
          {filteredEntries.length === 0 && <p className="text-center py-12 text-muted-foreground font-mono text-sm">No entries yet — start writing!</p>}
          <div className="space-y-3">
            {filteredEntries.map((j: JournalEntry) => (
              <Card key={j.id} className="bg-card/50 border-border hover:border-primary/30 cursor-pointer transition-colors" onClick={() => { handleDateChange(j.date); setViewMode('write'); }}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-mono text-sm font-bold">{new Date(j.date + 'T12:00').toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">{MOOD_LABELS[j.mood]}</span>
                      <div className="flex gap-0.5">{[1,2,3,4,5].map(m => <div key={m} className={`w-2 h-2 rounded-sm ${m <= j.mood ? 'bg-primary' : 'bg-muted'}`} />)}</div>
                    </div>
                  </div>
                  {j.events && <p className="text-sm text-foreground/70 line-clamp-2 mb-2">{j.events}</p>}
                  <div className="flex flex-wrap gap-1 mb-2">{j.emotions.map(e => <Badge key={e} variant="outline" className="text-[10px] px-2 py-0">{e}</Badge>)}</div>
                  {j.media.length > 0 && (
                    <div className="flex gap-1.5">
                      {j.media.slice(0, 4).map((m, i) => (
                        m.type === 'image'
                          ? <img key={i} src={m.data} alt="" className="w-10 h-10 rounded object-cover border border-border" />
                          : <div key={i} className="w-10 h-10 rounded bg-muted flex items-center justify-center border border-border"><Video size={14} className="text-muted-foreground" /></div>
                      ))}
                      {j.media.length > 4 && <div className="w-10 h-10 rounded bg-muted flex items-center justify-center text-xs font-mono text-muted-foreground border border-border">+{j.media.length - 4}</div>}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {viewMode === 'write' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); handleDateChange(d.toISOString().split('T')[0]); }} className="text-muted-foreground hover:text-foreground"><ChevronLeft size={16} /></button>
              <Input type="date" value={selectedDate} max={todayStr} onChange={e => handleDateChange(e.target.value)} className="font-mono text-sm flex-1" />
              <button onClick={() => { if (selectedDate < todayStr) { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); handleDateChange(d.toISOString().split('T')[0]); } }} disabled={selectedDate >= todayStr} className="text-muted-foreground hover:text-foreground disabled:opacity-30"><ChevronRight size={16} /></button>
            </div>

            {[
              { key: 'events', label: "Today's Events", placeholder: "What happened? Key moments, conversations, highlights..." },
              { key: 'growth', label: 'Growth & Learning', placeholder: 'What did you learn? What could you do better? Wins?' },
              { key: 'plan', label: "Tomorrow's Plan", placeholder: "Top 3 things to do tomorrow?" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{label}</label>
                <Textarea placeholder={placeholder} className="mt-1.5 h-24 text-sm bg-background/50 resize-none" value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}

            <Button className="w-full font-mono uppercase text-xs" onClick={handleSave}>Save Entry</Button>
          </div>

          <div className="space-y-4">
            {/* Mood */}
            <Card className="bg-card/50 border-border">
              <CardHeader className="pb-2"><CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Mood & Emotions</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-bold mb-2">{MOOD_LABELS[form.mood]}</div>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(m => (
                      <button key={m} onClick={() => setForm(f => ({ ...f, mood: m }))}
                        className={`flex-1 h-8 rounded font-mono font-bold text-xs transition-colors ${m === form.mood ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-muted-foreground uppercase mb-2">Emotions</div>
                  <div className="flex flex-wrap gap-1.5">
                    {EMOTIONS.map(e => (
                      <button key={e} onClick={() => toggleEmotion(e)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${form.emotions.includes(e) ? 'bg-primary/15 text-primary border-primary/30' : 'border-border text-muted-foreground hover:border-primary/30'}`}>
                        {e}
                      </button>
                    ))}
                    {form.emotions.filter((e: string) => !EMOTIONS.includes(e)).map((e: string) => (
                      <button key={e} onClick={() => toggleEmotion(e)} className="px-2.5 py-1 rounded-full text-[11px] font-medium border bg-primary/15 text-primary border-primary/30">{e}</button>
                    ))}
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    <Input placeholder="Add emotion..." value={customEmotion} onChange={e => setCustomEmotion(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustomEmotion()} className="h-7 text-xs" />
                    <Button size="sm" variant="outline" className="h-7 px-2" onClick={addCustomEmotion}><Plus size={12} /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Media */}
            <Card className="bg-card/50 border-border">
              <CardHeader className="pb-2"><CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Photos & Videos</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <input type="file" ref={imageRef} accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                <input type="file" ref={videoRef} accept="video/*" className="hidden" onChange={handleVideoUpload} />

                <Button variant="outline" size="sm" className="w-full text-xs font-mono uppercase gap-1" onClick={() => imageRef.current?.click()}>
                  <Image size={12} /> Upload Photo (max 800KB)
                </Button>

                <Button variant="outline" size="sm" className="w-full text-xs font-mono uppercase gap-1" onClick={() => { setVideoFileError(''); videoRef.current?.click(); }}>
                  <Video size={12} /> Upload Video File (max 20MB)
                </Button>
                {videoFileError && <p className="text-[10px] font-mono text-amber-500">{videoFileError}</p>}

                <div className="space-y-1.5">
                  <p className="text-[10px] font-mono text-muted-foreground">Or paste a video link (YouTube, Google Photos, Drive…)</p>
                  <Input placeholder="https://..." value={videoUrl} onChange={e => setVideoUrl(e.target.value)} className="text-xs" />
                  <Input placeholder="Title (optional)" value={videoTitle} onChange={e => setVideoTitle(e.target.value)} className="text-xs" />
                  <Button variant="outline" size="sm" className="w-full text-xs font-mono uppercase gap-1" onClick={addVideoLink}>
                    <Video size={12} /> Add Link
                  </Button>
                </div>

                {form.media.length > 0 && (
                  <div className="grid grid-cols-3 gap-1.5 mt-2">
                    {form.media.map((m: JournalMedia, i: number) => (
                      <div key={i} className="relative group aspect-square">
                        {m.type === 'image' ? (
                          <img src={m.data} alt="" className="w-full h-full rounded object-cover border border-border" />
                        ) : m.type === 'video-file' ? (
                          <video src={m.data} className="w-full h-full rounded object-cover border border-border" />
                        ) : (
                          <a href={m.url} target="_blank" rel="noopener noreferrer"
                            className="w-full h-full rounded border border-border bg-muted flex flex-col items-center justify-center gap-1 hover:border-primary/50 transition-colors">
                            <Video size={16} className="text-muted-foreground" />
                            <span className="text-[8px] font-mono text-muted-foreground text-center px-1 line-clamp-2">{m.title}</span>
                          </a>
                        )}
                        <button onClick={() => removeMedia(i)}
                          className="absolute top-0.5 right-0.5 w-5 h-5 bg-destructive text-destructive-foreground rounded-full text-[10px] font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
