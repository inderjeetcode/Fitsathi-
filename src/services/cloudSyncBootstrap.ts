import { supabase } from '../lib/supabaseClient';
import { syncWorkoutData } from './cloudWorkoutSync.service';
import { syncHealthData } from './cloudHealthSync.service';

let intervalId: number | undefined;

export function startCloudSync(): () => void {
  if (!supabase) return () => undefined;

  const run = async (userId: string) => {
    await Promise.allSettled([
      syncWorkoutData(userId),
      syncHealthData(userId),
    ]);
  };

  let activeUserId: string | null = null;

  const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
    activeUserId = session?.user?.id || null;
    if (activeUserId) void run(activeUserId);
    if (event === 'SIGNED_OUT') activeUserId = null;
  });

  intervalId = window.setInterval(() => {
    if (activeUserId) void run(activeUserId);
  }, 30000);

  void supabase.auth.getSession().then(({ data }) => {
    activeUserId = data.session?.user?.id || null;
    if (activeUserId) void run(activeUserId);
  });

  return () => {
    listener.subscription.unsubscribe();
    if (intervalId !== undefined) window.clearInterval(intervalId);
    intervalId = undefined;
  };
}
