const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if ((!supabaseUrl || !supabaseAnonKey) && process.env.NODE_ENV !== "production") {
  // eslint-disable-next-line no-console
  console.warn(
    "[env] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not set — using placeholders. " +
      "Supabase calls will fail until real values are added to .env.local."
  );
}

export const env = {
  supabaseUrl: supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey: supabaseAnonKey || "placeholder-anon-key",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  isSupabaseConfigured: Boolean(supabaseUrl && supabaseAnonKey),
};
