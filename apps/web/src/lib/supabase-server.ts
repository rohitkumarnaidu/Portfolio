/**
 * @module supabase-server
 * @description Supabase server client for Server Components and API routes.
 * Uses the service role key to bypass Row Level Security (RLS).
 *
 * SECURITY: This module must ONLY be imported in:
 * - Server Components (files without 'use client')
 * - API route handlers (app/api/**)
 * - Server Actions
 *
 * NEVER import this in client components — it exposes the service role key.
 *
 * Architecture Reference: docs/09-ARCHITECTURE.md §3.2 (Data Layer)
 * Security Reference: docs/14-SECURITY.md §4 (Server-Side Security)
 */

import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// ── Environment Validation ──────────────────────────────────

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ── Server Client Factory ───────────────────────────────────

/**
 * Creates a Supabase client with the service role key.
 * This client bypasses all RLS policies — use with caution.
 *
 * A new client is created per-request to ensure isolation.
 *
 * Usage (Server Component):
 * ```ts
 * import { getSupabaseServerClient } from '@/lib/supabase-server';
 *
 * export default async function Page() {
 *   const supabase = getSupabaseServerClient();
 *   const { data } = await supabase.from('sections').select('*').eq('is_live', true);
 *   return <div>{JSON.stringify(data)}</div>;
 * }
 * ```
 */
export function getSupabaseServerClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      'Supabase server client requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. ' +
        'Set these in your .env.local file.',
    );
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
