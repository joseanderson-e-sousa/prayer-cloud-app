import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  // Public pages always use anonymous access, independently of the admin session.
  { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
);
