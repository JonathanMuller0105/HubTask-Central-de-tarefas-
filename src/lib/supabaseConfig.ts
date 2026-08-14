export interface SupabasePublicConfig {
  url: string;
  publishableKey: string;
}

export interface SupabasePublicEnv {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_PUBLISHABLE_KEY?: string;
}

export function resolveSupabaseConfig(env: SupabasePublicEnv): SupabasePublicConfig | null {
  const url = env.VITE_SUPABASE_URL?.trim();
  const publishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!url || !publishableKey) return null;

  return { url, publishableKey };
}

export function getSupabaseConfig(
  env: SupabasePublicEnv = import.meta.env,
): SupabasePublicConfig | null {
  return resolveSupabaseConfig(env);
}

export function hasSupabaseConfig(env: SupabasePublicEnv = import.meta.env): boolean {
  return getSupabaseConfig(env) !== null;
}
