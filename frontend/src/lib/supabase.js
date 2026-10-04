import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://makpetikykbxsfekyyar.supabase.co";

const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_5h2nkYWFMTUoAGzhjVtIYQ_2sez3Cd7";

if (!supabaseUrl || !supabasePublishableKey) {
  console.warn(
    "Supabase configuration missing! Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are defined in environment variables."
  );
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
