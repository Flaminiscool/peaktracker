import { useStore } from '@/hooks/use-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';
import { Plus, Trash2, Flame, Pencil, Check } from 'lucide-react';

export function HabitsTab() {
  const { data, toggleHabit, addHabit, removeHabit, updateHabit } = useStore();
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [justChecked, setJustChecked] = useState<string | null>(null);

  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  const todayStr = new Date().toISOString().split('T')[0];
  const totalDoneToday = data.habits.filter(h => h.history[todayStr]).length;

  const handleAdd = () => {
    if (!newName.trim()) return;
    addHabit(newName.trim());
    setNewName('');
    setAddOpen(false);
  };

  const handleEdit = () => {
    if (!editId || !editName.trim()) return;
    updateHabit(editId, editName.trim());
    setEditId(null);
  };

  const handleToggle = (habitId: string, dateStr: string) => {
    toggleHabit(habitId, dateStr);
    if (dateStr === todayStr) {
      setJustChecked(habitId);
      setTimeout(() => setJustChecked(null), 600);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Protocols</h2>
          <p className="text-muted-foreground mt-1 font-mono text-xs uppercase tracking-widest">
            Daily Operating System — {totalDoneToday}/{data.habits.length} done today
          </p>
        </div>
        <Button size="sm" className="font-mono text-xs uppercase gap-1" onClick={() => setAddOpen(true)}>
          <Plus size={14} /> Add Habit
        </Button>
      </header>

      {/* Add dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader><DialogTitle className="font-mono uppercase tracking-wide text-sm">New Habit</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <Input placeholder="e.g. Meditate 10min" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} autoFocus />
            <Button className="w-full font-mono uppercase text-xs" onClick={handleAdd}>Add</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editId} onOpenChange={open => !open && setEditId(null)}>
        <DialogContent className="max-w-xs">
          <DialogHeader><DialogTitle className="font-mono uppercase tracking-wide text-sm">Rename Habit</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <Input value={editName} onChange={e => setEditName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleEdit()} autoFocus />
            <Button className="w-full font-mono uppercase text-xs" onClick={handleEdit}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {data.habits.length === 0 && (
        <div className="text-center py-20 text-muted-foreground font-mono text-sm">No habits yet. Add one to start your streak.</div>
      )}

      {/* Heatmap grid */}
      {data.habits.length > 0 && (
        <Card className="bg-card/50 border-border overflow-hidden">
          <div className="overflow-x-auto p-6">
            <div className="min-w-[560px]">
              <div className="flex mb-3">
                <div className="w-52 shrink-0 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Habit</div>
                <div className="flex-1 flex justify-between px-0.5">
                  {days.filter((_, i) => i % 5 === 0).map(d => (
                    <div key={d} className="text-[9px] text-muted-foreground font-mono">{d.slice(5)}</div>
                  ))}
                </div>
              </div>
              <div className="space-y-2.5">
                {data.habits.map(h => (
                  <div key={h.id} className="flex items-center gap-3">
                    <div className="w-52 shrink-0 flex items-center justify-between pr-2">
                      <span className="text-sm font-medium truncate">{h.name}</span>
                      <div className="flex items-center gap-1 text-xs font-mono text-muted-foreground shrink-0 ml-1">
                        <Flame size={11} className="text-orange-500" />
                        {h.streak}
                      </div>
                    </div>
                    <div className="flex-1 flex gap-0.5">
                      {days.map(d => {
                        const isDone = h.history[d];
                        const isToday = d === todayStr;
                        return (
                          <button
                            key={d}
                            onClick={() => handleToggle(h.id, d)}
                            className={`h-5 flex-1 rounded-sm transition-all ${isDone ? 'bg-primary hover:bg-primary/70' : isToday ? 'bg-muted border border-dashed border-primary/60 hover:border-primary' : 'bg-muted/40 hover:bg-muted'}`}
                            title={`${d}: ${isDone ? 'Done' : 'Not done'}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-4 text-[10px] font-mono text-muted-foreground">
                <div className="flex gap-0.5 items-center">
                  <div className="w-3 h-3 rounded-sm bg-muted/40" />
                  <div className="w-3 h-3 rounded-sm bg-primary/60" />
                  <div className="w-3 h-3 rounded-sm bg-primary" />
                </div>
                <span>Less → More</span>
                <span className="ml-3 opacity-60">Dashed = today</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Today's check-in cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.habits.map(h => {
          const isDoneToday = h.history[todayStr];
          const isAnimating = justChecked === h.id;
          return (
            <div
              key={`card-${h.id}`}
              className={`p-4 border rounded-lg transition-all duration-300 ${
                isDoneToday ? 'border-primary bg-primary/5' : 'border-border bg-card/50 hover:border-primary/30'
              } ${isAnimating ? 'scale-[1.04]' : 'scale-100'}`}
              style={{ transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), border-color 0.2s, background-color 0.2s' }}
            >
              <div className="flex justify-between items-start gap-2">
                <span className="font-bold text-sm leading-tight">{h.name}</span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => { setEditId(h.id); setEditName(h.name); }}
                    className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
                    title="Rename"
                  >
                    <Pencil size={11} />
                  </button>
                  <button
                    onClick={() => handleToggle(h.id, todayStr)}
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                      isDoneToday ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground hover:border-primary'
                    } ${isAnimating ? 'scale-125' : 'scale-100'}`}
                    style={{ transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}
                  >
                    {isDoneToday && <Check size={13} />}
                  </button>
                  <button
                    onClick={() => removeHabit(h.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-0.5"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <div className="text-xs font-mono text-muted-foreground mt-2 flex items-center gap-1">
                <Flame size={11} className={h.streak > 0 ? 'text-orange-500' : 'text-muted-foreground/40'} />
                <span>{h.streak} day streak</span>
              </div>
              {isDoneToday && (
                <div className="mt-2 text-[10px] font-mono text-primary font-bold uppercase tracking-wider">✓ Done today</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
