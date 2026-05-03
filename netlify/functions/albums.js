import { verifyToken, unauthorizedResponse, corsHeaders } from './_utils/auth.js';
import { getAdminClient } from './_utils/supabase.js';

function rowToAlbum(row) {
  const ids = row.photo_ids;
  const photoIds = Array.isArray(ids) ? ids : typeof ids === 'string' ? JSON.parse(ids || '[]') : [];
  return {
    id: row.id,
    title: row.title,
    description: row.description || undefined,
    coverUrl: row.cover_url,
    photoIds,
    createdAt: row.created_at,
    order: row.sort_order,
  };
}

export const handler = async (event) => {
  const headers = corsHeaders();

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  const supabase = getAdminClient();
  const idParam = event.queryStringParameters?.id;

  // ── GET — list all albums or one by id (public) ───────────────────────────
  if (event.httpMethod === 'GET') {
    if (idParam) {
      const { data, error } = await supabase.from('albums').select('*').eq('id', idParam).maybeSingle();

      if (error) return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
      if (!data) return { statusCode: 404, headers, body: JSON.stringify({ error: 'Album not found' }) };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(rowToAlbum(data)),
      };
    }

    const { data, error } = await supabase.from('albums').select('*').order('sort_order', { ascending: true });

    if (error) return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify((data || []).map(rowToAlbum)),
    };
  }

  const user = verifyToken(event);
  if (!user) return unauthorizedResponse();

  let body = {};
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  // ── POST ─────────────────────────────────────────────────────────────────
  if (event.httpMethod === 'POST') {
    const { data: existing } = await supabase
      .from('albums')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1);

    const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 1;

    const { error } = await supabase.from('albums').insert({
      id: body.id,
      title: body.title,
      description: body.description ?? null,
      cover_url: body.coverUrl,
      photo_ids: body.photoIds || [],
      created_at: body.createdAt ?? Date.now(),
      sort_order: body.order ?? nextOrder,
    });

    if (error) return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
    return { statusCode: 201, headers, body: JSON.stringify({ success: true }) };
  }

  // ── PATCH ───────────────────────────────────────────────────────────────
  if (event.httpMethod === 'PATCH') {
    const { id, ...updates } = body;
    if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'id required' }) };

    const dbUpdates = {};
    if ('title' in updates) dbUpdates.title = updates.title;
    if ('description' in updates) dbUpdates.description = updates.description;
    if ('coverUrl' in updates) dbUpdates.cover_url = updates.coverUrl;
    if ('photoIds' in updates) dbUpdates.photo_ids = updates.photoIds;
    if ('order' in updates) dbUpdates.sort_order = updates.order;
    if ('createdAt' in updates) dbUpdates.created_at = updates.createdAt;

    const { error } = await supabase.from('albums').update(dbUpdates).eq('id', id);
    if (error) return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  }

  // ── DELETE ──────────────────────────────────────────────────────────────
  if (event.httpMethod === 'DELETE') {
    const { id } = body;
    if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'id required' }) };

    const { error } = await supabase.from('albums').delete().eq('id', id);
    if (error) return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
};
