import { useStore, AfterSchoolActivity } from '@/hooks/use-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Plus, Trash2, Pencil, MapPin, Wifi, Clock } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const ACTIVITY_TYPES = ['tuition', 'music', 'sport', 'exam', 'other'] as const;
const TYPE_COLORS: Record<string, string> = {
  tuition: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  music: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  sport: 'bg-green-500/10 text-green-400 border-green-500/30',
  exam: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  other: 'bg-muted text-muted-foreground border-border',
};
const TYPE_DOT: Record<string, string> = {
  tuition: 'bg-blue-500', music: 'bg-purple-500', sport: 'bg-green-500', exam: 'bg-amber-500', other: 'bg-muted-foreground',
};

const EMPTY_FORM = (): Omit<AfterSchoolActivity, 'id'> => ({
  day: 'Monday', name: '', time: '16:30', endTime: '18:00', location: '', type: 'tuition', isOnline: false, notes: '', color: '#3b82f6',
});

export function AfterSchoolTab() {
  const { data, addAfterSchool, updateAfterSchool, removeAfterSchool } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AfterSchoolActivity | null>(null);
  const [form, setForm] = useState<Omit<AfterSchoolActivity, 'id'>>(EMPTY_FORM());

  const today = new Date().toLocaleDateString('en-AU', { weekday: 'long' });

  const openAdd = (day?: string) => {
    setEditing(null);
    setForm({ ...EMPTY_FORM(), day: day || 'Monday' });
    setOpen(true);
  };

  const openEdit = (a: AfterSchoolActivity) => {
    setEditing(a);
    setForm({ day: a.day, name: a.name, time: a.time, endTime: a.endTime, location: a.location, type: a.type, isOnline: a.isOnline, notes: a.notes, color: a.color });
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editing) {
      updateAfterSchool({ ...form, id: editing.id });
    } else {
      addAfterSchool(form);
    }
    setOpen(false);
  };

  const set = (k: keyof typeof form, v: any) => setForm(f => ({ ...f, [k]: v }));

  const totalWeekly = data.afterSchool.length;
  const todayActivities = data.afterSchool.filter(a => a.day === today);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-end flex-wrap gap-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">After School</h2>
          <p className="text-muted-foreground mt-1 font-mono text-xs uppercase tracking-widest">
            Extracurriculars & Tuition — {totalWeekly} weekly activities
          </p>
        </div>
        <Button size="sm" className="font-mono text-xs uppercase gap-1" onClick={() => openAdd()}>
          <Plus size={14} /> Add Activity
        </Button>
      </header>

      {/* Today highlight */}
      {todayActivities.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider">Today — {today}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {todayActivities.map(a => (
              <ActivityRow key={a.id} activity={a} onEdit={() => openEdit(a)} onRemove={() => removeAfterSchool(a.id)} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Weekly grid */}
      <div className="space-y-3">
        {DAYS.map(day => {
          const acts = data.afterSchool.filter(a => a.day === day);
          const isToday = day === today;
          return (
            <Card key={day} className={`bg-card/50 border-border transition-colors ${isToday ? 'border-primary/30' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold font-mono ${isToday ? 'text-primary' : 'text-foreground'}`}>{day}</span>
                    {isToday && <Badge className="text-[9px] px-1.5 h-4 bg-primary/20 text-primary border-primary/30">Today</Badge>}
                    {acts.length === 0 && <span className="text-[10px] font-mono text-muted-foreground">Free</span>}
                  </div>
                  <button onClick={() => openAdd(day)} className="text-muted-foreground hover:text-foreground text-[10px] font-mono hover:text-primary transition-colors flex items-center gap-1">
                    <Plus size={11} /> Add
                  </button>
                </div>
                {acts.length > 0 && (
                  <div className="space-y-2">
                    {acts.sort((a, b) => a.time.localeCompare(b.time)).map(a => (
                      <ActivityRow key={a.id} activity={a} onEdit={() => openEdit(a)} onRemove={() => removeAfterSchool(a.id)} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={o => !o && setOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-mono text-sm uppercase">{editing ? 'Edit Activity' : 'Add Activity'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-mono text-muted-foreground uppercase">Day</label>
                <Select value={form.day} onValueChange={v => set('day', v)}>
                  <SelectTrigger className="mt-1 text-xs font-mono"><SelectValue /></SelectTrigger>
                  <SelectContent>{DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-[10px] font-mono text-muted-foreground uppercase">Type</label>
                <Select value={form.type} onValueChange={v => set('type', v)}>
                  <SelectTrigger className="mt-1 text-xs font-mono capitalize"><SelectValue /></SelectTrigger>
                  <SelectContent>{ACTIVITY_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono text-muted-foreground uppercase">Activity name</label>
              <Input placeholder="e.g. Matrix English Tuition" value={form.name} onChange={e => set('name', e.target.value)} className="mt-1" autoFocus />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-mono text-muted-foreground uppercase">Start</label>
                <Input type="time" value={form.time} onChange={e => set('time', e.target.value)} className="mt-1 font-mono text-xs" />
              </div>
              <div>
                <label className="text-[10px] font-mono text-muted-foreground uppercase">End</label>
                <Input type="time" value={form.endTime} onChange={e => set('endTime', e.target.value)} className="mt-1 font-mono text-xs" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono text-muted-foreground uppercase">Location</label>
              <Input placeholder="e.g. Parramatta / Online" value={form.location} onChange={e => set('location', e.target.value)} className="mt-1 text-sm" />
            </div>

            <div className="flex items-center gap-3">
              <label className="text-[10px] font-mono text-muted-foreground uppercase">Online?</label>
              <button
                onClick={() => set('isOnline', !form.isOnline)}
                className={`w-8 h-4 rounded-full transition-colors relative ${form.isOnline ? 'bg-primary' : 'bg-muted'}`}
              >
                <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-all ${form.isOnline ? 'left-4' : 'left-0.5'}`} />
              </button>
            </div>

            <div>
              <label className="text-[10px] font-mono text-muted-foreground uppercase">Notes (optional)</label>
              <Textarea placeholder="Extra info, travel time, teacher..." value={form.notes} onChange={e => set('notes', e.target.value)} className="mt-1 h-16 text-sm resize-none" />
            </div>

            <Button className="w-full font-mono uppercase text-xs" onClick={handleSave}>
              {editing ? 'Save Changes' : 'Add Activity'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ActivityRow({ activity: a, onEdit, onRemove }: { activity: AfterSchoolActivity; onEdit: () => void; onRemove: () => void }) {
  const dur = (() => {
    if (!a.time || !a.endTime) return '';
    const [sh, sm] = a.time.split(':').map(Number);
    const [eh, em] = a.endTime.split(':').map(Number);
    const mins = (eh * 60 + em) - (sh * 60 + sm);
    if (mins <= 0) return '';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
  })();

  const fmt = (t: string) => {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'pm' : 'am';
    return `${h > 12 ? h - 12 : h || 12}:${String(m).padStart(2, '0')}${ampm}`;
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-card/60 border border-border/50 group hover:border-border transition-colors">
      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${TYPE_DOT[a.type]}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="font-semibold text-sm">{a.name}</span>
            <Badge variant="outline" className={`ml-2 text-[9px] px-1.5 h-4 capitalize ${TYPE_COLORS[a.type]}`}>{a.type}</Badge>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button onClick={onEdit} className="text-muted-foreground hover:text-foreground p-0.5 transition-colors"><Pencil size={12} /></button>
            <button onClick={onRemove} className="text-muted-foreground hover:text-destructive p-0.5 transition-colors"><Trash2 size={12} /></button>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          {a.time && (
            <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
              <Clock size={10} />
              {fmt(a.time)}{a.endTime ? ` – ${fmt(a.endTime)}` : ''}
              {dur && <span className="text-muted-foreground/60">({dur})</span>}
            </div>
          )}
          {a.location && (
            <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
              {a.isOnline ? <Wifi size={10} /> : <MapPin size={10} />}
              {a.location}
            </div>
          )}
        </div>
        {a.notes && <p className="text-[11px] text-muted-foreground mt-1 italic">{a.notes}</p>}
      </div>
    </div>
  );
}
