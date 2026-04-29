import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig, supabaseCookieOptions } from "@/lib/supabase/config";

export function createClient() {
  const { url, publishableKey } = getSupabaseConfig();

  return createBrowserClient(url, publishableKey, {
    cookieOptions: supabaseCookieOptions,
  });
}
