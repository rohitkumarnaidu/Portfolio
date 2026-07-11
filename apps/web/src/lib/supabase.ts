/**
 * @module supabase
 * @description Supabase client initialization for browser and server usage.
 *
 * Browser client: Uses NEXT_PUBLIC_* environment variables (anon key).
 * Server client: Uses SUPABASE_SERVICE_ROLE_KEY for admin operations.
 *
 * Architecture Reference: docs/09-ARCHITECTURE.md §3.2 (Data Layer)
 * Database Reference: docs/11-DATABASE.md §1 (Supabase Configuration)
 */

import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// ── Environment Validation ──────────────────────────────────

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Allow app to compile without Supabase in development
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required in production.',
    );
  }
}

// ── Browser Client (Singleton) ──────────────────────────────

let browserClient: SupabaseClient | null = null;

/**
 * Returns a Supabase client configured for browser use.
 * Uses the anon key — respects Row Level Security (RLS).
 *
 * Usage:
 * ```ts
 * const supabase = getSupabaseBrowserClient();
 * const { data } = await supabase.from('sections').select('*');
 * ```
 */
export function getSupabaseBrowserClient(): SupabaseClient {
  if (browserClient) return browserClient;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.',
    );
  }

  browserClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return browserClient;
}
