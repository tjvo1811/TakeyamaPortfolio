import { v2 as cloudinary } from 'cloudinary';
import { verifyToken, unauthorizedResponse, corsHeaders } from './_utils/auth.js';
import { getAdminClient } from './_utils/supabase.js';

function rowToPhoto(row) {
  return {
    id: row.id,
    url: row.url,
    title: row.title || undefined,
    collection: row.collection,
    isPinned: row.is_pinned,
    order: row.sort_order,
    timestamp: row.timestamp || undefined,
    exif: row.exif || undefined,
    cloudinaryPublicId: row.cloudinary_public_id || undefined,
  };
}

export const handler = async (event) => {
  const headers = corsHeaders();

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  const supabase = getAdminClient();

  // ── GET — list all photos (public, no auth) ──────────────────────────────
  if (event.httpMethod === 'GET') {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data.map(rowToPhoto)),
    };
  }

  // ── All write operations require a valid JWT ──────────────────────────────
  const user = verifyToken(event);
  if (!user) return unauthorizedResponse();

  let body = {};
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  // ── POST — save a new photo record (after Cloudinary upload) ─────────────
  if (event.httpMethod === 'POST') {
    const { data: existing } = await supabase
      .from('photos')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1);

    const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 1;

    const { error } = await supabase.from('photos').insert({
      id: body.id,
      url: body.url,
      title: body.title || null,
      collection: body.collection || 'Gallery',
      is_pinned: body.isPinned || false,
      sort_order: body.order ?? nextOrder,
      timestamp: body.timestamp || null,
      exif: body.exif || null,
      cloudinary_public_id: body.cloudinaryPublicId || null,
    });

    if (error) return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
    return { statusCode: 201, headers, body: JSON.stringify({ success: true }) };
  }

  // ── PATCH — update a photo (highlight, order, title, collection) ──────────
  if (event.httpMethod === 'PATCH') {
    const { id, ...updates } = body;
    if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'id required' }) };

    const dbUpdates = {};
    if ('isPinned' in updates) dbUpdates.is_pinned = updates.isPinned;
    if ('order' in updates) dbUpdates.sort_order = updates.order;
    if ('title' in updates) dbUpdates.title = updates.title;
    if ('collection' in updates) dbUpdates.collection = updates.collection;

    const { error } = await supabase.from('photos').update(dbUpdates).eq('id', id);
    if (error) return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  }

  // ── DELETE — remove photo from DB and Cloudinary ─────────────────────────
  if (event.httpMethod === 'DELETE') {
    const { id } = body;
    if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'id required' }) };

    const { data: photo } = await supabase
      .from('photos')
      .select('cloudinary_public_id')
      .eq('id', id)
      .single();

    if (photo?.cloudinary_public_id) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
      await cloudinary.uploader.destroy(photo.cloudinary_public_id).catch(() => {});
    }

    const { error } = await supabase.from('photos').delete().eq('id', id);
    if (error) return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
};
