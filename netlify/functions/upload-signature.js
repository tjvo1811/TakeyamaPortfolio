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

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const timestamp = Math.round(Date.now() / 1000);
  const params = { timestamp, folder: 'portfolio' };
  const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder: 'portfolio',
    }),
  };
};
