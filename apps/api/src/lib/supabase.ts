import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ── Environment Configuration ────────────────────────────────

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let adminClient: SupabaseClient | null = null;

/**
 * Returns a Supabase client configured with the service role key.
 * Used exclusively by the NestJS backend for administrative tasks and bypassing RLS.
 * 
 * SECURITY: This client has full database access.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (adminClient) return adminClient;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      'Missing Supabase credentials. Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.',
    );
  }

  adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return adminClient;
}

