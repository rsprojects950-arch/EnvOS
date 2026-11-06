import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xhlqallwcebupqspkwty.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhobHFhbGx3Y2VidXBxc3Brd3R5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM4ODgzODksImV4cCI6MjEwOTQ2NDM4OX0.7fAA6BObZHw8UTSq8EWSA0PpAh0m9BYAvz0XzlDSd_E";

// Global Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Helper for server-side operations
export function createServerClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });
}

