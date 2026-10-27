import { useState } from 'react';
import { Cloud, CloudOff, CloudAlert, RefreshCw, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { signIn, signOut, signUp, syncNow, useSyncStatus } from '@/lib/sync';

const LABELS = {
  disabled: 'Local only',
  'signed-out': 'Sign in to sync',
  syncing: 'Syncing…',
  synced: 'Synced',
  offline: 'Offline · saved on device',
  error: 'Sync error · tap to retry',
} as const;

export function SyncButton() {
  const { status, userEmail } = useSyncStatus();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const Icon =
    status === 'synced' ? Check :
    status === 'syncing' ? RefreshCw :
    status === 'offline' ? CloudOff :
    status === 'error' ? CloudAlert : Cloud;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    if (mode === 'in') {
      const err = await signIn(email, password);
      if (err) setMsg(err); else setOpen(false);
    } else {
      const r = await signUp(email, password);
      if (r.error) setMsg(r.error);
      else if (r.needsConfirm) setMsg('Check your email to confirm, then sign in.');
      else setOpen(false);
    }
    setBusy(false);
  }

  function onClick() {
    if (status === 'disabled') { setOpen(true); return; }
    if (status === 'signed-out') { setOpen(true); return; }
    if (status === 'error' || status === 'synced' || status === 'offline') { setOpen(true); }
  }

  return (
    <>
      <button
        onClick={onClick}
        className="flex items-center gap-2 px-2 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        title={LABELS[status]}
      >
        <Icon size={13} className={status === 'syncing' ? 'animate-spin' : ''} />
        <span className="hidden md:inline">{LABELS[status]}</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {status === 'disabled' ? 'Cloud sync not set up' : userEmail ? 'Sync' : mode === 'in' ? 'Sign in' : 'Create account'}
            </DialogTitle>
            <DialogDescription>
              {status === 'disabled'
                ? 'Your data is saved on this device only. Add the Supabase keys in Vercel (see README) to sync between laptop and phone.'
                : userEmail
                  ? `Signed in as ${userEmail}. Changes sync automatically when you are online.`
                  : 'Sign in on every device with the same account to share your data.'}
            </DialogDescription>
          </DialogHeader>

          {status !== 'disabled' && userEmail && (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => { syncNow(); setOpen(false); }}>Sync now</Button>
              <Button variant="outline" onClick={async () => { await signOut(); setOpen(false); }}>Sign out</Button>
            </div>
          )}

          {status !== 'disabled' && !userEmail && (
            <form onSubmit={submit} className="space-y-3">
              <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
              <Input type="password" placeholder="Password (min 6 characters)" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} autoComplete={mode === 'in' ? 'current-password' : 'new-password'} />
              {msg && <p className="text-xs text-muted-foreground">{msg}</p>}
              <Button type="submit" className="w-full" disabled={busy}>{mode === 'in' ? 'Sign in' : 'Create account'}</Button>
              <button type="button" className="text-xs text-muted-foreground underline w-full" onClick={() => { setMode(mode === 'in' ? 'up' : 'in'); setMsg(null); }}>
                {mode === 'in' ? 'First time? Create an account' : 'Have an account? Sign in'}
              </button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
