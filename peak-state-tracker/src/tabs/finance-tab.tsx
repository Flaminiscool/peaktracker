import { useStore } from '@/hooks/use-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useState } from 'react';
import { Trash2, Settings, Info } from 'lucide-react';

const EXPENSE_CATS = ['Food', 'Entertainment', 'Transport', 'Clothes', 'Sport', 'Tech', 'Health', 'Other'];
const INCOME_CATS = ['Pocket Money', 'Mowing', 'Babysitting', 'Birthday', 'Job', 'Tutoring', 'Other'];
const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f43f5e', '#84cc16'];

export function FinanceTab() {
  const { data, addTransaction, removeTransaction, updateFinanceGoal } = useStore();
  const [amt, setAmt] = useState('');
  const [cat, setCat] = useState('');
  const [desc, setDesc] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [goalOpen, setGoalOpen] = useState(false);
  const [goalForm, setGoalForm] = useState({ goal: String(data.finance.goal), goalName: data.finance.goalName });

  const progress = data.finance.goal > 0 ? Math.min(100, Math.round((data.finance.balance / data.finance.goal) * 100)) : 0;

  const handleAdd = () => {
    if (!amt || Number(amt) <= 0) return;
    addTransaction({ type, amount: Number(amt), category: cat || 'Other', description: desc, date: new Date().toISOString().split('T')[0] });
    setAmt(''); setCat(''); setDesc('');
  };

  const expenseTotals: Record<string, number> = {};
  data.finance.transactions.filter((t: any) => t.type === 'expense').forEach((t: any) => {
    expenseTotals[t.category] = (expenseTotals[t.category] || 0) + t.amount;
  });
  const pieData = Object.entries(expenseTotals).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Treasury</h2>
          <p className="text-muted-foreground mt-1 font-mono text-xs uppercase tracking-widest">Personal Finance</p>
        </div>
        <Dialog open={goalOpen} onOpenChange={open => { setGoalOpen(open); setGoalForm({ goal: String(data.finance.goal), goalName: data.finance.goalName }); }}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="font-mono text-xs uppercase gap-1">
              <Settings size={13} /> Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xs">
            <DialogHeader><DialogTitle className="font-mono text-sm uppercase">Savings Goal</DialogTitle></DialogHeader>
            <div className="space-y-3 pt-2">
              <Input placeholder="e.g. New Headphones" value={goalForm.goalName} onChange={e => setGoalForm(f => ({ ...f, goalName: e.target.value }))} />
              <Input type="number" placeholder="Target amount ($)" value={goalForm.goal} onChange={e => setGoalForm(f => ({ ...f, goal: e.target.value }))} className="font-mono" />
              <Button className="w-full font-mono uppercase text-xs" onClick={() => { updateFinanceGoal(Number(goalForm.goal), goalForm.goalName); setGoalOpen(false); }}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2 space-y-6">
          <Card className="bg-primary text-primary-foreground border-none overflow-hidden relative">
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_top_right,_white_0%,_transparent_60%)]" />
            <CardContent className="p-8 relative">
              <div className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Net Liquidity</div>
              <div className="text-5xl font-bold font-mono tracking-tighter">${data.finance.balance.toFixed(2)}</div>
              <div className="mt-8 space-y-2">
                <div className="flex justify-between text-sm font-mono font-bold opacity-90">
                  <span>{data.finance.goalName || 'Goal'}: ${data.finance.goal}</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2 bg-primary-foreground/20" />
                <div className="text-xs opacity-60 font-mono">
                  ${Math.max(0, data.finance.goal - data.finance.balance).toFixed(2)} remaining
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border">
            <CardHeader><CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Ledger</CardTitle></CardHeader>
            <CardContent className="p-0">
              {data.finance.transactions.length === 0 && (
                <p className="text-muted-foreground text-sm font-mono px-6 py-4">No transactions yet.</p>
              )}
              {data.finance.transactions.map((t: any) => (
                <div key={t.id} className="flex justify-between items-center px-6 py-3 border-b border-border/50 last:border-0 group hover:bg-muted/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-8 rounded-full ${t.type === 'income' ? 'bg-emerald-500' : 'bg-muted-foreground/20'}`} />
                    <div>
                      <div className="font-medium text-sm">{t.description || t.category}</div>
                      <div className="text-[10px] font-mono text-muted-foreground">{t.category} · {t.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`font-mono font-bold text-sm ${t.type === 'income' ? 'text-emerald-500' : 'text-foreground'}`}>
                      {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                    </div>
                    <button onClick={() => removeTransaction(t.id)} className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-card/50 border-border">
            <CardHeader><CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground">New Transaction</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                {(['expense', 'income'] as const).map(t => (
                  <button key={t} onClick={() => { setType(t); setCat(''); }}
                    className={`flex-1 py-2 rounded-md text-xs font-mono uppercase font-bold transition-colors ${type === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                    {t}
                  </button>
                ))}
              </div>
              <Input type="number" placeholder="Amount ($)" value={amt} onChange={e => setAmt(e.target.value)} className="font-mono" />
              <Select value={cat} onValueChange={setCat}>
                <SelectTrigger className="font-mono text-xs"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  {(type === 'expense' ? EXPENSE_CATS : INCOME_CATS).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input placeholder="Description (optional)" value={desc} onChange={e => setDesc(e.target.value)} className="text-sm" />
              <Button className="w-full font-mono uppercase font-bold text-xs" onClick={handleAdd}>Record</Button>
            </CardContent>
          </Card>

          {pieData.length > 0 && (
            <Card className="bg-card/50 border-border">
              <CardHeader className="pb-0"><CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Spending Breakdown</CardTitle></CardHeader>
              <CardContent className="pt-2">
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="45%" innerRadius={38} outerRadius={65} paddingAngle={2} dataKey="value">
                        {pieData.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', fontSize: 11, fontFamily: 'monospace', color: 'hsl(var(--foreground))' }}
                        formatter={(v: number) => [`$${v.toFixed(2)}`, '']}
                      />
                      <Legend
                        iconSize={8}
                        iconType="circle"
                        formatter={(value) => <span style={{ color: 'hsl(var(--foreground))', fontSize: 10, fontFamily: 'monospace' }}>{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/20 rounded-lg p-3 border border-border/40">
            <Info size={13} className="mt-0.5 shrink-0 text-primary/60" />
            <span>Westpac doesn't offer a public API for personal accounts. Log transactions above to keep your balance accurate.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
