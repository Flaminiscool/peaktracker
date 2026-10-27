import { useSyncExternalStore } from 'react';
import { createClient, type RealtimeChannel, type Session } from '@supabase/supabase-js';
import { applyRemoteData, getData, getLocalUpdatedAt, onLocalEdit } from '@/hooks/use-store';

/**
 * Cloud sync (optional).
 *
 * - The app ALWAYS reads/writes localStorage first, so it works offline.
 * - If Supabase env vars are set and you're signed in, the whole dashboard is
 *   also saved as one JSON row in `dashboard_state`, and pulled back down on
 *   your other devices.
 * - Conflict rule: newest edit wins (compared by timestamp).
 */

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const syncEnabled = Boolean(url && anonKey);
export const supabase = syncEnabled ? createClient(url!, anonKey!) : null;

export type SyncStatus = 'disabled' | 'signed-out' | 'syncing' | 'synced' | 'offline' | 'error';

const LINKED_KEY = 'shreyash-dashboard-linked-user';
const BACKUP_KEY = 'shreyash-dashboard-backup-before-link';

let status = (syncEnabled ? 'signed-out' : 'disabled') as SyncStatus;
let userEmail: string | null = null;
let session: Session | null = null;
const listeners = new Set<() => void>();
let snapshot: { status: SyncStatus; userEmail: string | null } = { status, userEmail };

function setStatus(next: SyncStatus) {
  status = next;
  snapshot = { status, userEmail };
  listeners.forEach(l => l());
}

export function useSyncStatus() {
  return useSyncExternalStore(
    l => { listeners.add(l); return () => { listeners.delete(l); }; },
    () => snapshot,
  );
}

let running = false;
let rerun = false;
let pushTimer: ReturnType<typeof setTimeout> | undefined;

async function push(userId: string) {
  const ts = getLocalUpdatedAt() || Date.now();
  const { error } = await supabase!.from('dashboard_state').upsert({
    user_id: userId,
    data: getData(),
    updated_at: new Date(ts).toISOString(),
  });
  if (error) throw error;
}

/** Compare local vs cloud and move data whichever way is newer. */
async function reconcile() {
  if (!supabase || !session) return;
  if (running) { rerun = true; return; }
  running = true;
  try {
    if (!navigator.onLine) { setStatus('offline'); return; }
    setStatus('syncing');
    const userId = session.user.id;
    const { data: row, error } = await supabase
      .from('dashboard_state')
      .select('data, updated_at')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;

    const localTs = getLocalUpdatedAt();
    const firstLinkOnThisDevice = localStorage.getItem(LINKED_KEY) !== userId;

    if (!row) {
      await push(userId);
    } else {
      const remoteTs = Date.parse(row.updated_at);
      if (firstLinkOnThisDevice || remoteTs > localTs) {
        // Keep a copy of whatever was on this device before the cloud copy replaces it.
        if (firstLinkOnThisDevice && localTs > 0) {
          try { localStorage.setItem(BACKUP_KEY, JSON.stringify(getData())); } catch {}
        }
        applyRemoteData(row.data, remoteTs);
      } else if (localTs > remoteTs) {
        await push(userId);
      }
    }
    localStorage.setItem(LINKED_KEY, userId);
    setStatus('synced');
  } catch (e) {
    console.warn('Sync failed', e);
    setStatus(navigator.onLine ? 'error' : 'offline');
  } finally {
    running = false;
    if (rerun) { rerun = false; void reconcile(); }
  }
}

function schedulePush() {
  if (!supabase || !session) return;
  clearTimeout(pushTimer);
  if (!navigator.onLine) { setStatus('offline'); return; }
  pushTimer = setTimeout(() => void reconcile(), 1500);
}

let channel: RealtimeChannel | null = null;

function watchRemote(userId: string) {
  if (!supabase) return;
  if (channel) void supabase.removeChannel(channel);
  channel = supabase
    .channel(`dashboard_state:${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'dashboard_state', filter: `user_id=eq.${userId}` },
      () => void reconcile(),
    )
    .subscribe();
}

export function initSync() {
  if (!supabase) return;

  supabase.auth.onAuthStateChange((_event, s) => {
    session = s;
    userEmail = s?.user.email ?? null;
    if (s) {
      watchRemote(s.user.id);
      void reconcile();
    } else {
      if (channel) { void supabase.removeChannel(channel); channel = null; }
      setStatus('signed-out');
    }
  });

  onLocalEdit(schedulePush);
  window.addEventListener('online', () => void reconcile());
  window.addEventListener('offline', () => { if (session) setStatus('offline'); });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void reconcile();
  });
}

export async function signIn(email: string, password: string) {
  const { error } = await supabase!.auth.signInWithPassword({ email, password });
  return error?.message ?? null;
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase!.auth.signUp({ email, password });
  if (error) return { error: error.message, needsConfirm: false };
  return { error: null, needsConfirm: !data.session };
}

export async function signOut() {
  await supabase!.auth.signOut();
}

export function syncNow() {
  void reconcile();
}
