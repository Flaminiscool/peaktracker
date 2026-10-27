import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStore, Goal } from '@/hooks/use-store';
import { AreaChart, Area, ResponsiveContainer, YAxis, Tooltip } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';

const catColors: Record<string, { badge: string; stroke: string; fill: string }> = {
  school:   { badge: 'text-blue-500 border-blue-500/20 bg-blue-500/10',   stroke: '#3b82f6', fill: '#3b82f620' },
  finance:  { badge: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10', stroke: '#10b981', fill: '#10b98120' },
  health:   { badge: 'text-rose-500 border-rose-500/20 bg-rose-500/10',    stroke: '#f43f5e', fill: '#f43f5e20' },
  personal: { badge: 'text-violet-500 border-violet-500/20 bg-violet-500/10', stroke: '#8b5cf6', fill: '#8b5cf620' },
};

export function GoalsTab() {
  const { data, updateGoal, addGoal, removeGoal } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editVal, setEditVal] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'school', target: '', current: '', unit: '', deadline: '' });

  const handleAdd = () => {
    if (!form.name || !form.target) return;
    addGoal({
      name: form.name,
      category: form.category as Goal['category'],
      target: Number(form.target),
      current: Number(form.current) || 0,
      unit: form.unit || '',
      deadline: form.deadline || '',
    });
    setForm({ name: '', category: 'school', target: '', current: '', unit: '', deadline: '' });
    setAddOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Goals Market</h2>
          <p className="text-muted-foreground mt-1 font-mono text-xs uppercase tracking-widest">Performance Tracker</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="font-mono text-xs uppercase gap-1" data-testid="button-add-goal">
              <Plus size={14} /> New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-mono uppercase tracking-wide text-sm">Add Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <Input
                placeholder="Goal name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                data-testid="input-goal-name"
              />
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger className="font-mono text-xs uppercase"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="school">School</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                </SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Target (e.g. 100)" type="number" value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))} />
                <Input placeholder="Current (e.g. 0)" type="number" value={form.current} onChange={e => setForm(f => ({ ...f, current: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Unit (e.g. %, km, $)" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} />
                <Input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
              </div>
              <Button className="w-full font-mono uppercase text-xs" onClick={handleAdd}>Add Goal</Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      {data.goals.length === 0 && (
        <div className="text-center py-20 text-muted-foreground font-mono text-sm">
          No goals yet. Hit "New Goal" to get started.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.goals.map(g => {
          const chartData = g.history.map((p, i) => ({ i, val: p.value }));
          const progress = Math.min(100, Math.round((g.current / g.target) * 100));
          const isUp = g.history.length > 1 && g.current >= g.history[g.history.length - 2]?.value;
          const colors = catColors[g.category] || catColors.personal;
          const daysLeft = g.deadline ? Math.ceil((new Date(g.deadline).getTime() - Date.now()) / 86400000) : null;

          return (
            <Card
              key={g.id}
              data-testid={`card-goal-${g.id}`}
              className="bg-card/50 overflow-hidden relative border-border hover:border-primary/40 transition-colors"
            >
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <span className={`text-2xl font-mono font-bold ${isUp ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                  {progress}%
                </span>
                <button
                  data-testid={`button-remove-goal-${g.id}`}
                  onClick={() => removeGoal(g.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <CardHeader className="pb-2 pr-24">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className={`uppercase font-mono text-[10px] ${colors.badge}`}>
                    {g.category}
                  </Badge>
                  {isUp ? <TrendingUp size={12} className="text-emerald-500" /> : <TrendingDown size={12} className="text-muted-foreground" />}
                </div>
                <CardTitle className="text-base font-bold leading-tight">{g.name}</CardTitle>
                <div className="text-xs font-mono text-muted-foreground mt-0.5">
                  {g.current}{g.unit} / {g.target}{g.unit}
                  {daysLeft !== null && (
                    <span className={`ml-3 ${daysLeft < 7 ? 'text-destructive' : ''}`}>
                      {daysLeft > 0 ? `${daysLeft}d left` : 'DEADLINE PASSED'}
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pb-4">
                <div className="h-20 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id={`grad-${g.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={colors.stroke} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={colors.stroke} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <YAxis domain={['dataMin - 1', 'dataMax + 1']} hide />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', fontSize: 11, fontFamily: 'monospace' }}
                        formatter={(v: number) => [`${v}${g.unit}`, 'Value']}
                        labelFormatter={() => ''}
                      />
                      <Area
                        type="monotone"
                        dataKey="val"
                        stroke={colors.stroke}
                        fill={`url(#grad-${g.id})`}
                        strokeWidth={2}
                        dot={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  {editingId === g.id ? (
                    <>
                      <Input
                        type="number"
                        value={editVal}
                        onChange={e => setEditVal(e.target.value)}
                        className="w-28 h-8 text-xs font-mono"
                        data-testid={`input-goal-value-${g.id}`}
                        placeholder={`New value (${g.unit})`}
                      />
                      <Button size="sm" className="h-8 text-xs" onClick={() => {
                        if (editVal) updateGoal(g.id, Number(editVal));
                        setEditingId(null);
                      }}>Save</Button>
                      <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setEditingId(null)}>Cancel</Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs font-mono uppercase"
                      data-testid={`button-update-goal-${g.id}`}
                      onClick={() => { setEditingId(g.id); setEditVal(String(g.current)); }}
                    >
                      Log Progress
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
