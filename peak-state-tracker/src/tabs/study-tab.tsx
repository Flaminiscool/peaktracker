import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStore, Subject, Assessment } from '@/hooks/use-store';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { Play, Square, RefreshCw, Plus, Trash2, Settings, ExternalLink, ChevronDown, ChevronUp, Pencil, FolderOpen } from 'lucide-react';
import { getYearLevel } from '../App';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = ['P1', 'P2', 'P3', 'P4', 'P5'];

const SUBJECT_COLORS: Record<string, string> = {
  English: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  Mathematics: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  Science: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
  History: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  'Computing Technology': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  Music: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  PDHPE: 'bg-lime-500/10 text-lime-400 border-lime-500/30',
  Sport: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  'Assembly / Wellbeing': 'bg-muted/30 text-muted-foreground border-border',
};

function subjectColor(name: string) {
  return SUBJECT_COLORS[name] || 'bg-muted text-muted-foreground border-border';
}

type StudyView = 'subjects' | 'timetable' | 'assignments';

export function StudyTab() {
  const {
    data,
    updateSubjectNotes, updateSubjectDriveUrl,
    addAssessment, updateAssessment, removeAssessment,
    addAssignment, toggleAssignment, removeAssignment,
    updateTimetableCell,
  } = useStore();

  const [view, setView] = useState<StudyView>('subjects');
  const [week, setWeek] = useState<'A' | 'B'>('A');
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{ week: 'A' | 'B'; day: string; period: string } | null>(null);
  const [cellForm, setCellForm] = useState({ subject: '', room: '', teacher: '' });

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({ subject: '', name: '', description: '', url: '', dueDate: '' });

  const [assessOpen, setAssessOpen] = useState<string | null>(null);
  const [assessForm, setAssessForm] = useState({ term: '1', name: '', description: '', distributedDate: '', dueDate: '', weight: '', fileUrl: '' });

  const [editAssess, setEditAssess] = useState<{ subjectId: string; assessment: Assessment } | null>(null);
  const [editAssessForm, setEditAssessForm] = useState<Partial<Assessment>>({});

  const [markEntry, setMarkEntry] = useState<{ subjectId: string; assessmentId: string; mark: string; outOf: string } | null>(null);

  const openCellEdit = (w: 'A' | 'B', day: string, period: string) => {
    const cell = data.timetable[w]?.[day]?.[period] || { subject: '', room: '', teacher: '' };
    setCellForm({ subject: cell.subject || '', room: cell.room || '', teacher: cell.teacher || '' });
    setEditingCell({ week: w, day, period });
  };

  const saveCellEdit = () => {
    if (!editingCell) return;
    updateTimetableCell(editingCell.week, editingCell.day, editingCell.period, { ...cellForm });
    setEditingCell(null);
  };

  const handleAddAssignment = () => {
    if (!assignForm.name || !assignForm.dueDate) return;
    addAssignment({ subject: assignForm.subject || 'General', name: assignForm.name, description: assignForm.description, url: assignForm.url, dueDate: assignForm.dueDate });
    setAssignForm({ subject: '', name: '', description: '', url: '', dueDate: '' });
    setAssignOpen(false);
  };

  const handleAddAssessment = (subjectId: string) => {
    if (!assessForm.name) return;
    addAssessment(subjectId, {
      term: Number(assessForm.term) as 1 | 2 | 3 | 4,
      name: assessForm.name, description: assessForm.description,
      distributedDate: assessForm.distributedDate, dueDate: assessForm.dueDate,
      weight: Number(assessForm.weight) || 0, mark: null, outOf: null, fileUrl: assessForm.fileUrl,
    });
    setAssessForm({ term: '1', name: '', description: '', distributedDate: '', dueDate: '', weight: '', fileUrl: '' });
    setAssessOpen(null);
  };

  const handleMarkSave = () => {
    if (!markEntry) return;
    const a = data.subjects.find(s => s.id === markEntry.subjectId)?.assessments.find(a => a.id === markEntry.assessmentId);
    if (!a) return;
    updateAssessment(markEntry.subjectId, { ...a, mark: markEntry.mark ? Number(markEntry.mark) : null, outOf: markEntry.outOf ? Number(markEntry.outOf) : null });
    setMarkEntry(null);
  };

  const openEditAssess = (subjectId: string, a: Assessment) => {
    setEditAssess({ subjectId, assessment: a });
    setEditAssessForm({ ...a });
  };

  const saveEditAssess = () => {
    if (!editAssess || !editAssessForm.name) return;
    updateAssessment(editAssess.subjectId, { ...editAssess.assessment, ...editAssessForm } as Assessment);
    setEditAssess(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-end flex-wrap gap-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Curriculum</h2>
          <p className="text-muted-foreground mt-1 font-mono text-xs uppercase tracking-widest">{getYearLevel()} · NSW NESA</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['subjects', 'timetable', 'assignments'] as StudyView[]).map(v => (
            <Button key={v} variant={view === v ? 'default' : 'outline'} size="sm" className="font-mono text-xs uppercase" onClick={() => setView(v)}>{v}</Button>
          ))}
          <PomodoroTimer />
        </div>
      </header>

      {/* ── TIMETABLE ── */}
      {view === 'timetable' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground uppercase">Week:</span>
            {(['A', 'B'] as const).map(w => (
              <button key={w} onClick={() => setWeek(w)}
                className={`px-4 py-1.5 rounded text-xs font-mono font-bold uppercase transition-colors ${week === w ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                Week {w}
              </button>
            ))}
            <span className="text-[10px] text-muted-foreground font-mono ml-2">Click any cell to edit</span>
          </div>

          <Card className="bg-card/50 border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 text-[10px] font-mono text-muted-foreground uppercase w-14">Period</th>
                    {DAYS.map(day => (
                      <th key={day} className="text-left px-3 py-3 text-[10px] font-mono text-muted-foreground uppercase">{day.slice(0, 3)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PERIODS.map(period => (
                    <tr key={period} className="border-b border-border/40 last:border-0">
                      <td className="px-4 py-1.5 text-[10px] font-mono text-muted-foreground font-bold">{period}</td>
                      {DAYS.map(day => {
                        const cell = data.timetable[week]?.[day]?.[period] || { subject: '', room: '', teacher: '' };
                        const isAssembly = cell.subject === 'Assembly / Wellbeing';
                        return (
                          <td key={day} className="px-2 py-1">
                            <button
                              onClick={() => openCellEdit(week, day, period)}
                              className={`w-full text-left px-2.5 py-2 rounded text-xs font-medium border transition-all hover:opacity-80 ${
                                cell.subject ? subjectColor(cell.subject) : 'bg-transparent text-muted-foreground border-transparent hover:border-border'
                              }`}
                            >
                              {cell.subject
                                ? <span className={isAssembly ? 'italic' : ''}>{cell.subject}</span>
                                : <span className="opacity-20">—</span>}
                              {cell.room && <span className="block text-[9px] opacity-60 mt-0.5">{cell.room}</span>}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Legend */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(SUBJECT_COLORS).filter(([k]) => k !== 'Assembly / Wellbeing').map(([subject, cls]) => (
              <div key={subject} className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] border font-mono ${cls}`}>
                {subject}
              </div>
            ))}
          </div>

          {/* Cell edit dialog */}
          <Dialog open={!!editingCell} onOpenChange={open => !open && setEditingCell(null)}>
            <DialogContent className="max-w-xs">
              <DialogHeader>
                <DialogTitle className="font-mono text-sm uppercase">
                  Week {editingCell?.week} — {editingCell?.day} {editingCell?.period}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 pt-2">
                <Select value={cellForm.subject || '__free__'} onValueChange={v => setCellForm(f => ({ ...f, subject: v === '__free__' ? '' : v }))}>
                  <SelectTrigger className="font-mono text-xs"><SelectValue placeholder="Subject (or leave blank)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__free__">— Free Period —</SelectItem>
                    <SelectItem value="Assembly / Wellbeing">Assembly / Wellbeing</SelectItem>
                    {data.subjects.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input placeholder="Room (e.g. 05-FFL)" value={cellForm.room} onChange={e => setCellForm(f => ({ ...f, room: e.target.value }))} className="text-sm" />
                <Input placeholder="Teacher" value={cellForm.teacher} onChange={e => setCellForm(f => ({ ...f, teacher: e.target.value }))} className="text-sm" />
                <Button className="w-full font-mono uppercase text-xs" onClick={saveCellEdit}>Save</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* ── SUBJECTS & ASSESSMENTS ── */}
      {view === 'subjects' && (
        <div className="space-y-4">
          {data.subjects.map(s => (
            <SubjectCard
              key={s.id}
              subject={s}
              expanded={expandedSubject === s.id}
              onToggle={() => setExpandedSubject(expandedSubject === s.id ? null : s.id)}
              onNotesChange={v => updateSubjectNotes(s.id, v)}
              onDriveUrlChange={v => updateSubjectDriveUrl(s.id, v)}
              onAddAssessment={() => { setAssessForm({ term: '1', name: '', description: '', distributedDate: '', dueDate: '', weight: '', fileUrl: '' }); setAssessOpen(s.id); }}
              onRemoveAssessment={aid => removeAssessment(s.id, aid)}
              onEditAssessment={a => openEditAssess(s.id, a)}
              onEnterMark={aid => {
                const a = s.assessments.find(x => x.id === aid);
                setMarkEntry({ subjectId: s.id, assessmentId: aid, mark: a?.mark != null ? String(a.mark) : '', outOf: a?.outOf != null ? String(a.outOf) : '' });
              }}
            />
          ))}

          {/* Assessment add dialog */}
          <Dialog open={!!assessOpen} onOpenChange={open => !open && setAssessOpen(null)}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle className="font-mono text-sm uppercase">Add Assessment — {data.subjects.find(s => s.id === assessOpen)?.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-2">
                  <Select value={assessForm.term} onValueChange={v => setAssessForm(f => ({ ...f, term: v }))}>
                    <SelectTrigger className="font-mono text-xs"><SelectValue placeholder="Term" /></SelectTrigger>
                    <SelectContent>{[1, 2, 3, 4].map(t => <SelectItem key={t} value={String(t)}>Term {t}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input placeholder="Weight %" type="number" value={assessForm.weight} onChange={e => setAssessForm(f => ({ ...f, weight: e.target.value }))} className="font-mono text-xs" />
                </div>
                <Input placeholder="Assessment name" value={assessForm.name} onChange={e => setAssessForm(f => ({ ...f, name: e.target.value }))} autoFocus />
                <Textarea placeholder="Description (what is it about?)" value={assessForm.description} onChange={e => setAssessForm(f => ({ ...f, description: e.target.value }))} className="h-16 text-sm resize-none" />
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-[10px] text-muted-foreground font-mono uppercase">Distributed</label><Input type="date" value={assessForm.distributedDate} onChange={e => setAssessForm(f => ({ ...f, distributedDate: e.target.value }))} className="mt-1 text-xs" /></div>
                  <div><label className="text-[10px] text-muted-foreground font-mono uppercase">Due Date</label><Input type="date" value={assessForm.dueDate} onChange={e => setAssessForm(f => ({ ...f, dueDate: e.target.value }))} className="mt-1 text-xs" /></div>
                </div>
                <Input placeholder="Task sheet URL (optional)" value={assessForm.fileUrl} onChange={e => setAssessForm(f => ({ ...f, fileUrl: e.target.value }))} className="text-xs" />
                <Button className="w-full font-mono uppercase text-xs" onClick={() => assessOpen && handleAddAssessment(assessOpen)}>Add Assessment</Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Assessment edit dialog */}
          <Dialog open={!!editAssess} onOpenChange={open => !open && setEditAssess(null)}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle className="font-mono text-sm uppercase">Edit Assessment</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-2">
                  <Select value={String(editAssessForm.term || 1)} onValueChange={v => setEditAssessForm(f => ({ ...f, term: Number(v) as 1|2|3|4 }))}>
                    <SelectTrigger className="font-mono text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{[1, 2, 3, 4].map(t => <SelectItem key={t} value={String(t)}>Term {t}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input placeholder="Weight %" type="number" value={editAssessForm.weight ?? ''} onChange={e => setEditAssessForm(f => ({ ...f, weight: Number(e.target.value) }))} className="font-mono text-xs" />
                </div>
                <Input placeholder="Assessment name" value={editAssessForm.name || ''} onChange={e => setEditAssessForm(f => ({ ...f, name: e.target.value }))} autoFocus />
                <Textarea placeholder="Description" value={editAssessForm.description || ''} onChange={e => setEditAssessForm(f => ({ ...f, description: e.target.value }))} className="h-16 text-sm resize-none" />
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-[10px] text-muted-foreground font-mono uppercase">Distributed</label><Input type="date" value={editAssessForm.distributedDate || ''} onChange={e => setEditAssessForm(f => ({ ...f, distributedDate: e.target.value }))} className="mt-1 text-xs" /></div>
                  <div><label className="text-[10px] text-muted-foreground font-mono uppercase">Due Date</label><Input type="date" value={editAssessForm.dueDate || ''} onChange={e => setEditAssessForm(f => ({ ...f, dueDate: e.target.value }))} className="mt-1 text-xs" /></div>
                </div>
                <Input placeholder="Task sheet URL" value={editAssessForm.fileUrl || ''} onChange={e => setEditAssessForm(f => ({ ...f, fileUrl: e.target.value }))} className="text-xs" />
                <Button className="w-full font-mono uppercase text-xs" onClick={saveEditAssess}>Save Changes</Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Mark entry dialog */}
          <Dialog open={!!markEntry} onOpenChange={open => !open && setMarkEntry(null)}>
            <DialogContent className="max-w-xs">
              <DialogHeader><DialogTitle className="font-mono text-sm uppercase">Enter Mark</DialogTitle></DialogHeader>
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-[10px] font-mono text-muted-foreground uppercase">Mark</label><Input type="number" placeholder="85" value={markEntry?.mark || ''} onChange={e => setMarkEntry(m => m ? { ...m, mark: e.target.value } : null)} className="mt-1 font-mono" autoFocus /></div>
                  <div><label className="text-[10px] font-mono text-muted-foreground uppercase">Out of</label><Input type="number" placeholder="100" value={markEntry?.outOf || ''} onChange={e => setMarkEntry(m => m ? { ...m, outOf: e.target.value } : null)} className="mt-1 font-mono" /></div>
                </div>
                <Button className="w-full font-mono uppercase text-xs" onClick={handleMarkSave}>Save Mark</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* ── ASSIGNMENTS ── */}
      {view === 'assignments' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground font-mono">{data.assignments.filter(a => a.status !== 'done').length} pending</p>
            <Button size="sm" className="font-mono text-xs uppercase gap-1" onClick={() => setAssignOpen(true)}>
              <Plus size={13} /> Add Assignment
            </Button>
          </div>

          <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
            <DialogContent className="max-w-sm">
              <DialogHeader><DialogTitle className="font-mono text-sm uppercase">New Assignment</DialogTitle></DialogHeader>
              <div className="space-y-3 pt-2">
                <Input placeholder="Assignment name" value={assignForm.name} onChange={e => setAssignForm(f => ({ ...f, name: e.target.value }))} autoFocus />
                <Select value={assignForm.subject} onValueChange={v => setAssignForm(f => ({ ...f, subject: v }))}>
                  <SelectTrigger className="font-mono text-xs"><SelectValue placeholder="Subject" /></SelectTrigger>
                  <SelectContent>
                    {data.subjects.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                    <SelectItem value="General">General</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea placeholder="Description / what's required (optional)" value={assignForm.description} onChange={e => setAssignForm(f => ({ ...f, description: e.target.value }))} className="h-16 text-sm resize-none" />
                <Input placeholder="Link / URL (optional)" value={assignForm.url} onChange={e => setAssignForm(f => ({ ...f, url: e.target.value }))} className="text-xs" />
                <Input type="date" value={assignForm.dueDate} onChange={e => setAssignForm(f => ({ ...f, dueDate: e.target.value }))} />
                <Button className="w-full font-mono uppercase text-xs" onClick={handleAddAssignment}>Add</Button>
              </div>
            </DialogContent>
          </Dialog>

          {data.assignments.length === 0 && (
            <div className="text-center py-16 text-muted-foreground font-mono text-sm">No assignments yet.</div>
          )}

          <div className="space-y-3">
            {data.assignments.map(a => {
              const daysLeft = Math.ceil((new Date(a.dueDate).getTime() - Date.now()) / 86400000);
              return (
                <Card key={a.id} className={`bg-card/50 border-border group transition-colors ${a.status === 'done' ? 'opacity-60' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox checked={a.status === 'done'} onCheckedChange={() => toggleAssignment(a.id)} className="mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className={`font-bold text-sm ${a.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>{a.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="outline" className="text-[9px] px-1.5 h-4">{a.subject}</Badge>
                              <span className={`text-[10px] font-mono ${daysLeft <= 3 ? 'text-destructive' : 'text-muted-foreground'}`}>
                                {daysLeft > 0 ? `${daysLeft}d left` : 'OVERDUE'}
                              </span>
                              <span className="text-[10px] font-mono text-muted-foreground">{a.dueDate}</span>
                            </div>
                          </div>
                          <button onClick={() => removeAssignment(a.id)} className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 p-0.5 shrink-0">
                            <Trash2 size={13} />
                          </button>
                        </div>
                        {a.description && <p className="text-xs text-muted-foreground mt-1.5">{a.description}</p>}
                        {a.url && (
                          <a href={a.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline mt-1.5">
                            <ExternalLink size={11} /> Open link
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function SubjectCard({
  subject, expanded, onToggle, onNotesChange, onDriveUrlChange,
  onAddAssessment, onRemoveAssessment, onEditAssessment, onEnterMark,
}: {
  subject: Subject; expanded: boolean; onToggle: () => void;
  onNotesChange: (v: string) => void; onDriveUrlChange: (v: string) => void;
  onAddAssessment: () => void; onRemoveAssessment: (id: string) => void;
  onEditAssessment: (a: Assessment) => void; onEnterMark: (id: string) => void;
}) {
  const termColors: Record<number, string> = { 1: 'text-blue-400', 2: 'text-emerald-400', 3: 'text-amber-400', 4: 'text-rose-400' };

  // Weighted average
  const graded = subject.assessments.filter(a => a.mark !== null && a.outOf && a.outOf > 0);
  const totalWeight = graded.reduce((s, a) => s + a.weight, 0);
  const weightedAvg = totalWeight > 0
    ? graded.reduce((s, a) => s + ((a.mark! / a.outOf!) * a.weight), 0) / totalWeight * 100
    : null;

  // Predicted half-yearly (only Term 1 + Term 2 assessments)
  const halfYearlyAssessed = subject.assessments.filter(a => (a.term === 1 || a.term === 2) && a.mark !== null && a.outOf && a.outOf > 0);
  const halfYearlyWeight = halfYearlyAssessed.reduce((s, a) => s + a.weight, 0);
  const halfYearlyAvg = halfYearlyWeight > 0
    ? halfYearlyAssessed.reduce((s, a) => s + ((a.mark! / a.outOf!) * a.weight), 0) / halfYearlyWeight * 100
    : null;

  const nextAssessment = subject.assessments
    .filter(a => a.dueDate && new Date(a.dueDate) > new Date())
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];

  return (
    <Card className="bg-card/50 border-border">
      <CardHeader className="pb-2 cursor-pointer" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${weightedAvg !== null ? (weightedAvg >= 80 ? 'bg-emerald-500' : weightedAvg >= 60 ? 'bg-amber-500' : 'bg-rose-500') : 'bg-muted-foreground/30'}`} />
            <div>
              <CardTitle className="text-base font-bold">{subject.name}</CardTitle>
              <div className="text-[10px] font-mono text-muted-foreground mt-0.5">{subject.teacher} · {subject.room}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {weightedAvg !== null ? (
              <div className="text-right">
                <div className="text-sm font-mono font-bold">{weightedAvg.toFixed(1)}%</div>
                <div className="text-[9px] font-mono text-muted-foreground">weighted avg</div>
              </div>
            ) : (
              <span className="text-xs font-mono text-muted-foreground">{subject.assessments.length} assessments</span>
            )}
            {expanded ? <ChevronUp size={15} className="text-muted-foreground" /> : <ChevronDown size={15} className="text-muted-foreground" />}
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-2 space-y-5">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-muted/30 rounded-lg p-3 text-center">
              <div className="text-lg font-mono font-bold">{weightedAvg !== null ? `${weightedAvg.toFixed(0)}%` : '—'}</div>
              <div className="text-[9px] font-mono text-muted-foreground uppercase mt-0.5">Overall Avg</div>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 text-center">
              <div className="text-lg font-mono font-bold">{halfYearlyAvg !== null ? `${halfYearlyAvg.toFixed(0)}%` : '—'}</div>
              <div className="text-[9px] font-mono text-muted-foreground uppercase mt-0.5">T1+T2 Avg</div>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 text-center">
              <div className="text-lg font-mono font-bold">{nextAssessment ? `${Math.ceil((new Date(nextAssessment.dueDate).getTime() - Date.now()) / 86400000)}d` : '—'}</div>
              <div className="text-[9px] font-mono text-muted-foreground uppercase mt-0.5">Next Due</div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-[10px] font-mono text-muted-foreground uppercase">Quick Notes</label>
            <Textarea
              placeholder="Reminders, key topics, syllabus dot points..."
              className="mt-1.5 h-16 text-xs bg-background/50 resize-none font-mono"
              value={subject.notes}
              onChange={e => onNotesChange(e.target.value)}
            />
          </div>

          {/* Google Drive link */}
          <div>
            <label className="text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-1">
              <FolderOpen size={11} /> Google Drive Link
            </label>
            <div className="flex gap-2 mt-1.5">
              <Input
                placeholder="Paste your Google Drive folder or Doc link..."
                value={subject.driveUrl}
                onChange={e => onDriveUrlChange(e.target.value)}
                className="text-xs"
              />
              {subject.driveUrl && (
                <a href={subject.driveUrl} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline" className="gap-1 shrink-0 h-9">
                    <ExternalLink size={12} /> Open
                  </Button>
                </a>
              )}
            </div>
            <p className="text-[9px] font-mono text-muted-foreground mt-1">Paste a Google Drive sharing link — opens directly in Drive.</p>
          </div>

          {/* Assessments */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-mono text-muted-foreground uppercase">Assessments</label>
              <Button size="sm" variant="outline" className="h-7 text-[10px] font-mono uppercase gap-1" onClick={onAddAssessment}>
                <Plus size={11} /> Add
              </Button>
            </div>

            {subject.assessments.length === 0 && (
              <p className="text-xs text-muted-foreground font-mono">No assessments added yet.</p>
            )}

            {[1, 2, 3, 4].map(term => {
              const termAs = subject.assessments.filter(a => a.term === term);
              if (termAs.length === 0) return null;
              return (
                <div key={term} className="space-y-2">
                  <div className={`text-[10px] font-mono font-bold uppercase tracking-wider ${termColors[term]}`}>Term {term}</div>
                  {termAs.map(a => (
                    <AssessmentRow key={a.id} assessment={a}
                      onRemove={() => onRemoveAssessment(a.id)}
                      onEdit={() => onEditAssessment(a)}
                      onEnterMark={() => onEnterMark(a.id)} />
                  ))}
                </div>
              );
            })}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function AssessmentRow({ assessment: a, onRemove, onEdit, onEnterMark }: {
  assessment: Assessment; onRemove: () => void; onEdit: () => void; onEnterMark: () => void;
}) {
  const daysLeft = a.dueDate ? Math.ceil((new Date(a.dueDate).getTime() - Date.now()) / 86400000) : null;
  const markPct = a.mark !== null && a.outOf ? Math.round((a.mark / a.outOf) * 100) : null;
  const grade = markPct !== null ? (markPct >= 90 ? 'A+' : markPct >= 80 ? 'A' : markPct >= 70 ? 'B' : markPct >= 60 ? 'C' : 'D') : null;

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-border/60 bg-card/30 group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm">{a.name}</span>
          {a.weight > 0 && <Badge variant="outline" className="text-[9px] px-1.5 h-4">{a.weight}%</Badge>}
          {daysLeft !== null && (
            <span className={`text-[10px] font-mono ${daysLeft < 0 ? 'text-muted-foreground' : daysLeft <= 3 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {daysLeft > 0 ? `${daysLeft}d left` : daysLeft === 0 ? 'Due today' : 'Submitted'}
            </span>
          )}
        </div>
        {a.description && <p className="text-xs text-muted-foreground mt-1">{a.description}</p>}
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          {a.distributedDate && <span className="text-[9px] font-mono text-muted-foreground">Given: {a.distributedDate}</span>}
          {a.dueDate && <span className="text-[9px] font-mono text-muted-foreground">Due: {a.dueDate}</span>}
          {a.fileUrl && (
            <a href={a.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline">
              <ExternalLink size={10} /> Task sheet
            </a>
          )}
        </div>
        {markPct !== null ? (
          <div className="mt-2 flex items-center gap-3">
            <span className="font-mono font-bold text-lg text-emerald-400">{a.mark}/{a.outOf}</span>
            <div>
              <div className="text-xs font-mono font-bold text-emerald-400">{markPct}% · {grade}</div>
              <div className="text-[9px] font-mono text-muted-foreground">
                Predicted: {a.weight > 0 ? `${(markPct * a.weight / 100).toFixed(1)}/${a.weight} weighted marks` : '—'}
              </div>
            </div>
            <button onClick={onEnterMark} className="text-[10px] text-muted-foreground hover:text-foreground font-mono ml-1">edit</button>
          </div>
        ) : (
          <button onClick={onEnterMark} className="mt-1.5 text-[10px] font-mono text-primary hover:underline">+ Enter mark when received</button>
        )}
      </div>
      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit} className="text-muted-foreground hover:text-foreground transition-colors p-0.5"><Pencil size={12} /></button>
        <button onClick={onRemove} className="text-muted-foreground hover:text-destructive transition-colors p-0.5"><Trash2 size={12} /></button>
      </div>
    </div>
  );
}

function PomodoroTimer() {
  const [workMins, setWorkMins] = useState(25);
  const [breakMins, setBreakMins] = useState(5);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning && timeLeft > 0) interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    else if (timeLeft === 0) setIsRunning(false);
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const reset = () => { setIsRunning(false); setTimeLeft(mode === 'work' ? workMins * 60 : breakMins * 60); };
  const switchMode = (m: 'work' | 'break') => { setMode(m); setIsRunning(false); setTimeLeft(m === 'work' ? workMins * 60 : breakMins * 60); };
  const applySettings = () => { setTimeLeft(mode === 'work' ? workMins * 60 : breakMins * 60); setIsRunning(false); setShowSettings(false); };

  const totalSecs = mode === 'work' ? workMins * 60 : breakMins * 60;
  const pct = ((totalSecs - timeLeft) / totalSecs) * 100;
  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');

  return (
    <>
      <Button variant="outline" size="sm" className={`font-mono text-xs uppercase gap-1 ${isRunning ? 'border-primary text-primary' : ''}`} onClick={() => setOpen(true)}>
        {isRunning ? `${mins}:${secs}` : 'Timer'}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="font-mono text-sm uppercase">Focus Timer</DialogTitle>
              <button onClick={() => setShowSettings(s => !s)} className="text-muted-foreground hover:text-foreground"><Settings size={14} /></button>
            </div>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {showSettings && (
              <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                {([['Work', workMins, setWorkMins], ['Break', breakMins, setBreakMins]] as any[]).map(([label, val, setter]) => (
                  <div key={label} className="flex items-center justify-between text-xs font-mono">
                    <span className="text-muted-foreground">{label}</span>
                    <div className="flex items-center gap-1">
                      <Input type="number" value={val} onChange={e => setter(Math.max(1, Number(e.target.value)))} className="w-14 h-6 text-xs font-mono text-center p-1" />
                      <span className="text-muted-foreground">min</span>
                    </div>
                  </div>
                ))}
                <Button size="sm" className="w-full h-7 text-xs font-mono uppercase" onClick={applySettings}>Apply</Button>
              </div>
            )}
            <div className="flex justify-center gap-2">
              {(['work', 'break'] as const).map(m => (
                <button key={m} onClick={() => switchMode(m)} className={`px-3 py-1 rounded text-[10px] font-mono uppercase tracking-wider transition-colors ${mode === m ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                  {m === 'work' ? `Focus ${workMins}m` : `Break ${breakMins}m`}
                </button>
              ))}
            </div>
            <div className="relative w-32 h-32 mx-auto">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                <circle cx="50" cy="50" r="44" fill="none" stroke="hsl(var(--primary))" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 44}`}
                  strokeDashoffset={`${2 * Math.PI * 44 * (1 - pct / 100)}`}
                  className="transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-mono font-bold">{mins}:{secs}</span>
              </div>
            </div>
            <div className="flex justify-center gap-2">
              <Button size="icon" variant={isRunning ? 'destructive' : 'default'} className="w-10 h-10" onClick={() => setIsRunning(r => !r)}>
                {isRunning ? <Square size={15} /> : <Play size={15} />}
              </Button>
              <Button size="icon" variant="outline" className="w-10 h-10" onClick={reset}><RefreshCw size={15} /></Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
