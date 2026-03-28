import jwt from 'jsonwebtoken';
import { corsHeaders } from './_utils/auth.js';

export const handler = async (event) => {
  const headers = corsHeaders();

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  let password;
  try {
    ({ password } = JSON.parse(event.body || '{}'));
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    // Delay to slow brute-force attempts
    await new Promise((r) => setTimeout(r, 500));
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Invalid password' }) };
  }

  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ token }),
  };
};
