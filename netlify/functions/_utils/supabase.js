import { createClient } from '@supabase/supabase-js';

const NETLIFY_ENV_HINT =
  'In Netlify: Site configuration → Environment variables, set SUPABASE_URL and SUPABASE_SERVICE_KEY (see .env.example). Redeploy after saving.';

/**
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function getAdminClient() {
  const url = (process.env.SUPABASE_URL || '').trim();
  const key = (process.env.SUPABASE_SERVICE_KEY || '').trim();

  if (!url || !key) {
    throw new Error(`Database is not configured on the server. ${NETLIFY_ENV_HINT}`);
  }
  if (!/^https:\/\//i.test(url)) {
    throw new Error(`SUPABASE_URL must be an https:// URL. Current value is invalid. ${NETLIFY_ENV_HINT}`);
  }

  return createClient(url, key, { auth: { persistSession: false } });
}

/**
 * @param {import('@supabase/supabase-js').PostgrestError | null | undefined} error
 * @returns {string}
 */
export function formatSupabaseError(error) {
  if (!error) return 'Unknown database error';
  const m = error.message || String(error);
  if (/TypeError:\s*fetch failed|fetch failed|Failed to fetch|NetworkError|ECONNREFUSED|ENOTFOUND|ETIMEDOUT/i.test(m)) {
    return `Could not reach Supabase (${m}). ${NETLIFY_ENV_HINT} In Supabase Dashboard, confirm the project is not paused.`;
  }
  return m;
}

/** @param {Record<string, string>} headers */
export function getAdminClientOr503(headers) {
  try {
    return { supabase: getAdminClient() };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      response: {
        statusCode: 503,
        headers,
        body: JSON.stringify({ error: msg }),
      },
    };
  }
}
