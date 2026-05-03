import { v2 as cloudinary } from 'cloudinary';
import { verifyToken, unauthorizedResponse, corsHeaders } from './_utils/auth.js';

export const handler = async (event) => {
  const headers = corsHeaders();

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const user = verifyToken(event);
  if (!user) return unauthorizedResponse();

  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Cloudinary upload is not configured' }),
    };
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });

  const timestamp = Math.round(Date.now() / 1000);
  const params = { timestamp, folder: 'portfolio' };
  const signature = cloudinary.utils.api_sign_request(params, CLOUDINARY_API_SECRET);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      signature,
      timestamp,
      cloudName: CLOUDINARY_CLOUD_NAME,
      apiKey: CLOUDINARY_API_KEY,
      folder: 'portfolio',
    }),
  };
};
