import { describe, expect, test } from 'bun:test';
import { getSupabaseClient } from './supabase';
import { hasSupabaseConfig, resolveSupabaseConfig } from './supabaseConfig';

describe('Supabase public configuration', () => {
  test('accepts a URL and publishable key', () => {
    expect(
      resolveSupabaseConfig({
        VITE_SUPABASE_URL: 'https://project-ref.supabase.co',
        VITE_SUPABASE_PUBLISHABLE_KEY: 'publishable-key',
      }),
    ).toEqual({
      url: 'https://project-ref.supabase.co',
      publishableKey: 'publishable-key',
    });
  });

  test('is not configured when URL is absent', () => {
    expect(hasSupabaseConfig({ VITE_SUPABASE_PUBLISHABLE_KEY: 'publishable-key' })).toBe(false);
  });

  test('is not configured when publishable key is absent', () => {
    expect(hasSupabaseConfig({ VITE_SUPABASE_URL: 'https://project-ref.supabase.co' })).toBe(false);
  });

  test('is not configured when values are empty', () => {
    expect(
      hasSupabaseConfig({ VITE_SUPABASE_URL: ' ', VITE_SUPABASE_PUBLISHABLE_KEY: '' }),
    ).toBe(false);
  });

  test('lazy client fails clearly when configuration is absent', () => {
    expect(() => getSupabaseClient({})).toThrow('Supabase não está configurado');
  });
});
