import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useStore } from '@/hooks/use-store';
import { ChevronLeft, ChevronRight, Plus, Trash2, Check } from 'lucide-react';
import { useState } from 'react';

const QUOTES = [
  "The successful warrior is the average man, with laser-like focus.",
  "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.",
  "Discipline equals freedom.",
  "You do not rise to the level of your goals. You fall to the level of your systems.",
  "Hard choices, easy life. Easy choices, hard life.",
  "Don't count the days. Make the days count.",
  "Success is the sum of small efforts, repeated day in and day out.",
  "The pain you feel today will be the strength you feel tomorrow.",
  "Energy and persistence conquer all things.",
  "He who has a why to live can bear almost any how.",
  "The man who moves a mountain begins by carrying away small stones.",
  "What you do today can improve all your tomorrows.",
  "Excellence is not a destination but a continuous journey that never ends.",
  "It's not who you are that holds you back, it's who you think you're not.",
  "Wake up with determination. Go to bed with satisfaction.",
  "Push yourself, because no one else is going to do it for you.",
  "Great things never come from comfort zones.",
  "Work hard in silence. Let success make the noise.",
  "Don't stop when you're tired. Stop when you're done.",
  "Do something today that your future self will thank you for.",
  "The secret of getting ahead is getting started.",
  "Act as if what you do makes a difference. It does.",
  "Believe you can and you're halfway there.",
  "Sometimes we're tested not to show our weaknesses, but to discover our strengths.",
  "The key to success is to focus on goals, not obstacles.",
  "If you want to achieve greatness, stop asking for permission.",
  "Things work out best for those who make the best of how things work out.",
  "To live a creative life, we must lose our fear of being wrong.",
  "If you are not willing to risk the usual, you will have to settle for the ordinary.",
  "All our dreams can come true if we have the courage to pursue them.",
  "Good things come to people who wait, but better things come to those who go out and get them.",
  "If you do what you always did, you will get what you always got.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "Don't watch the clock; do what it does. Keep going.",
  "The harder you work for something, the greater you'll feel when you achieve it.",
  "Dream bigger. Do bigger.",
  "I find that the harder I work, the more luck I seem to have.",
  "Success usually comes to those who are too busy to be looking for it.",
  "Don't be afraid to give up the good to go for the great.",
  "I would rather die of passion than of boredom.",
  "A winner is a dreamer who never gives up.",
  "It's not whether you get knocked down, it's whether you get up.",
  "You've got to get up every morning with determination if you're going to go to bed with satisfaction.",
  "To be successful, you must accept all challenges that come your way.",
  "The difference between a successful person and others is not lack of strength, but lack of will.",
  "The starting point of all achievement is desire.",
  "Opportunities don't happen. You create them.",
  "Try not to become a person of success. Rather become a person of value.",
  "It is not the mountain we conquer, but ourselves.",
  "When everything seems to be going against you, remember that an airplane takes off against the wind.",
  "The only way to do great work is to love what you do.",
  "The future belongs to those who believe in the beauty of their dreams.",
  "Don't let yesterday take up too much of today.",
  "In the middle of difficulty lies opportunity.",
  "It always seems impossible until it's done.",
  "You are never too old to set another goal or to dream a new dream.",
  "Setting goals is the first step in turning the invisible into the visible.",
  "Character consists of what you do on the third and fourth tries.",
  "Whether you think you can or you think you can't — you're right.",
  "The best time to plant a tree was 20 years ago. The second best time is now.",
  "An unexamined life is not worth living.",
  "When you reach the end of your rope, tie a knot in it and hang on.",
  "The only impossible journey is the one you never begin.",
  "Never let the fear of striking out keep you from playing the game.",
  "Life is either a daring adventure or nothing at all.",
  "You will face many defeats in life, but never let yourself be defeated.",
  "The greatest glory in living lies not in never falling, but in rising every time we fall.",
  "In the end, it's not the years in your life that count. It's the life in your years.",
  "If you look at what you have in life, you'll always have more.",
  "If you want to live a happy life, tie it to a goal, not to people or things.",
  "Not how long, but how well you have lived is the main thing.",
  "Definiteness of purpose is the starting point of all achievement.",
  "We become what we think about most of the time, and that's the strangest secret.",
  "The only place where success comes before work is in the dictionary.",
  "Success is walking from failure to failure with no loss of enthusiasm.",
  "All progress takes place outside the comfort zone.",
  "I have not failed. I've just found 10,000 ways that won't work.",
  "Knowing is not enough; we must apply. Wishing is not enough; we must do.",
  "We generate fears while we sit. We overcome them by action.",
  "Thinking should become your capital asset, no matter whatever ups and downs you come across.",
  "You have to expect things of yourself before you can do them.",
  "Nothing is impossible, the word itself says 'I'm possible'.",
  "The question isn't who is going to let me; it's who is going to stop me.",
  "Success is not the key to happiness. Happiness is the key to success.",
  "Too many of us are not living our dreams because we are living our fears.",
  "The real test is not whether you avoid failure — it's whether it builds you.",
  "Challenges are what make life interesting and overcoming them is what makes life meaningful.",
  "Stop chasing the money and start chasing the passion.",
  "Work like there is someone working twenty-four hours a day to take everything away from you.",
  "What seems to us as bitter trials are often blessings in disguise.",
  "When you stop chasing the wrong things, you give the right things a chance to catch you.",
  "Don't raise your voice. Improve your argument.",
  "What you do speaks so loudly that I cannot hear what you say.",
  "What lies inside you is greater than what lies behind or ahead.",
  "Do what you can with all you have, wherever you are.",
  "You don't have to see the whole staircase, just take the first step.",
  "If you're going through hell, keep going.",
  "The ones who are crazy enough to think they can change the world, are the ones that do.",
  "Don't count the days. Make the days count.",
  "Strength does not come from physical capacity. It comes from an indomitable will.",
  "First, have a definite, clear practical ideal — a goal, an objective.",
  "The world is the great gymnasium where we come to make ourselves strong.",
  "The secret of success is to know something nobody else knows.",
  "My biggest motivation? Just to keep challenging myself.",
  "You can't use up creativity. The more you use, the more you have.",
  "Education is the most powerful weapon which you can use to change the world.",
  "Every strike brings me closer to the next home run.",
  "I have learned over the years that when one's mind is made up, this diminishes fear.",
  "If you're offered a seat on a rocket ship, don't ask what seat! Just get on.",
  "Life is what we make it, always has been, always will be.",
  "Every moment is a fresh beginning.",
  "It does not matter how slowly you go as long as you do not stop.",
  "Our greatest weakness lies in giving up. The most certain way to succeed is always to try one more time.",
];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function HomeTab() {
  const { data, addTodo, toggleTodo, removeTodo, nextQuote, prevQuote } = useStore();
  const [newTodo, setNewTodo] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];
  const habitsDone = data.habits.filter(h => h.history[todayStr]).length;
  const activeGoals = data.goals.filter(g => g.current < g.target).length;
  const assignmentsDue = data.assignments.filter(a => a.status !== 'done').length;
  const todosDone = data.todos.filter(t => t.done).length;

  const quote = QUOTES[data.quoteIndex % QUOTES.length];

  const date = new Date().toLocaleDateString('en-AU', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).toUpperCase();

  const handleAddTodo = () => {
    if (!newTodo.trim()) return;
    addTodo(newTodo.trim());
    setNewTodo('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          {getGreeting()}, Shreyash.
        </h2>
        <p className="text-muted-foreground mt-1 font-mono text-xs uppercase tracking-widest">{date}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Today's To-Do List */}
        <Card className="col-span-1 md:col-span-2 bg-card/50 border-primary/20 hover:border-primary/40 transition-colors">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider">Today's Focus</CardTitle>
              <span className="text-[10px] font-mono text-muted-foreground">{todosDone}/{data.todos.length} done</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Add a task for today..."
                className="text-sm"
                value={newTodo}
                onChange={e => setNewTodo(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddTodo()}
              />
              <Button size="icon" className="shrink-0" onClick={handleAddTodo}><Plus size={15} /></Button>
            </div>
            {data.todos.length === 0 && (
              <p className="text-muted-foreground text-xs font-mono py-2">No tasks yet — what do you need to get done today?</p>
            )}
            <div className="space-y-1.5 mt-1">
              {data.todos.map(t => (
                <div key={t.id} className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all group ${t.done ? 'bg-muted/20 opacity-60' : 'bg-muted/40 hover:bg-muted/60'}`}>
                  <button
                    onClick={() => toggleTodo(t.id)}
                    className={`w-5 h-5 rounded flex items-center justify-center border-2 shrink-0 transition-colors ${t.done ? 'border-primary bg-primary' : 'border-muted-foreground hover:border-primary'}`}
                  >
                    {t.done && <Check size={11} className="text-primary-foreground" />}
                  </button>
                  <span className={`flex-1 text-sm ${t.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{t.text}</span>
                  <button onClick={() => removeTodo(t.id)} className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quote with prev/next */}
        <Card className="bg-card/50 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Daily Quote</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <blockquote className="italic border-l-2 border-primary pl-4 text-sm text-foreground/80 leading-relaxed min-h-[80px]">
              "{quote}"
            </blockquote>
            <div className="flex items-center justify-between">
              <button
                onClick={() => prevQuote(QUOTES.length)}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Previous quote"
              >
                <ChevronLeft size={15} />
              </button>
              <span className="text-[10px] font-mono text-muted-foreground">{(data.quoteIndex % QUOTES.length) + 1} / {QUOTES.length}</span>
              <button
                onClick={() => nextQuote(QUOTES.length)}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Next quote"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Tasks Done" value={`${todosDone}/${data.todos.length}`} sub={todosDone === data.todos.length && data.todos.length > 0 ? 'All complete!' : 'today'} />
        <StatCard label="Habits Done" value={`${habitsDone}/${data.habits.length}`} sub={habitsDone === data.habits.length ? 'All clear' : `${data.habits.length - habitsDone} left`} />
        <StatCard label="Assignments" value={String(assignmentsDue)} sub={assignmentsDue === 0 ? 'All clear' : 'pending'} urgent={assignmentsDue > 0} />
        <StatCard label="Savings" value={`$${data.finance.balance.toFixed(0)}`} sub={`Goal: $${data.finance.goal}`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card/50 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Today's Habits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.habits.length === 0 && <p className="text-muted-foreground text-xs font-mono">No habits yet — add some in Protocols.</p>}
            {data.habits.map(h => {
              const done = h.history[todayStr];
              return (
                <div key={h.id} className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${done ? 'bg-primary/10 text-primary' : 'bg-muted/40 text-muted-foreground'}`}>
                  <span>{h.name}</span>
                  <span className="font-mono text-xs">{done ? '✓' : '—'}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Upcoming Assignments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.assignments.filter(a => a.status !== 'done').slice(0, 5).map(a => {
              const daysLeft = Math.ceil((new Date(a.dueDate).getTime() - Date.now()) / 86400000);
              return (
                <div key={a.id} className="flex items-center justify-between px-3 py-2 rounded-md bg-muted/40 text-sm">
                  <div>
                    <span className="font-medium">{a.name}</span>
                    <span className="text-muted-foreground ml-2 text-xs font-mono">{a.subject}</span>
                  </div>
                  <span className={`text-xs font-mono font-bold ${daysLeft <= 3 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {daysLeft > 0 ? `${daysLeft}d` : 'OVERDUE'}
                  </span>
                </div>
              );
            })}
            {data.assignments.filter(a => a.status !== 'done').length === 0 && (
              <p className="text-muted-foreground text-sm px-3 font-mono">All clear — nice work.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, urgent }: { label: string; value: string; sub?: string; urgent?: boolean }) {
  return (
    <Card className={`hover:border-primary/50 transition-colors bg-card/30 ${urgent ? 'border-destructive/30' : ''}`}>
      <CardContent className="p-5">
        <div className={`text-3xl font-bold font-mono ${urgent ? 'text-destructive' : 'text-foreground'}`}>{value}</div>
        <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-bold">{label}</div>
        {sub && <div className="text-[10px] text-muted-foreground/60 mt-0.5 font-mono">{sub}</div>}
      </CardContent>
    </Card>
  );
}
