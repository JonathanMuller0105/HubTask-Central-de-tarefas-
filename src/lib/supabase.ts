import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseConfig, type SupabasePublicEnv } from './supabaseConfig';

let client: SupabaseClient | null = null;

export function getSupabaseClient(
  env: SupabasePublicEnv = import.meta.env,
): SupabaseClient {
  if (client) return client;

  const config = getSupabaseConfig(env);
  if (!config) {
    throw new Error(
      'Supabase não está configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY.',
    );
  }

  client = createClient(config.url, config.publishableKey);
  return client;
}
