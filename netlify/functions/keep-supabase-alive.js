import { getAdminClientOr503, formatSupabaseError } from './_utils/supabase.js';

/**
 * Lightweight Supabase ping so the free-tier project does not pause from inactivity.
 * Invoked automatically by Netlify on the schedule in netlify.toml.
 * Safe to call manually: GET /.netlify/functions/keep-supabase-alive
 */
export const handler = async () => {
  const headers = { 'Content-Type': 'application/json' };

  const db = getAdminClientOr503(headers);
  if ('response' in db) return db.response;
  const { supabase } = db;

  const { error } = await supabase.from('content').select('key').limit(1);
  if (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ ok: false, error: formatSupabaseError(error) }),
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ ok: true, pingedAt: new Date().toISOString() }),
  };
};
