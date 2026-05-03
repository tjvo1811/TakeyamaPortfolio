import { verifyToken, unauthorizedResponse, corsHeaders } from './_utils/auth.js';
import { getAdminClientOr503, formatSupabaseError } from './_utils/supabase.js';

export const handler = async (event) => {
  const headers = corsHeaders();

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  const db = getAdminClientOr503(headers);
  if ('response' in db) return db.response;
  const { supabase } = db;

  // ── GET — read all content keys (public) ─────────────────────────────────
  if (event.httpMethod === 'GET') {
    const { data, error } = await supabase.from('content').select('*');
    if (error) return { statusCode: 500, headers, body: JSON.stringify({ error: formatSupabaseError(error) }) };

    const map = Object.fromEntries((data || []).map((row) => [row.key, row.value]));
    return { statusCode: 200, headers, body: JSON.stringify(map) };
  }

  // ── PATCH — update content keys (auth required) ───────────────────────────
  const user = verifyToken(event);
  if (!user) return unauthorizedResponse();

  if (event.httpMethod === 'PATCH') {
    let updates;
    try {
      updates = JSON.parse(event.body || '{}');
    } catch {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }

    const upserts = Object.entries(updates).map(([key, value]) => ({ key, value: String(value) }));
    const { error } = await supabase.from('content').upsert(upserts, { onConflict: 'key' });
    if (error) return { statusCode: 500, headers, body: JSON.stringify({ error: formatSupabaseError(error) }) };
    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
};
