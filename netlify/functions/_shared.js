const { neon } = require('@neondatabase/serverless');
const crypto = require('crypto');

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  // channel_binding can break some serverless drivers
  const cleaned = url.replace(/([&?])channel_binding=require&?/, '$1').replace(/[?&]$/, '');
  return neon(cleaned);
}

function json(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      ...extraHeaders
    },
    body: JSON.stringify(body)
  };
}

function cors(event) {
  if (event.httpMethod === 'OPTIONS') {
    return json(204, {});
  }
  return null;
}

function parseBody(event) {
  if (!event.body) return {};
  const raw = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString('utf8')
    : event.body;
  return JSON.parse(raw);
}

function getAdminSecret() {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) throw new Error('ADMIN_SECRET is not set');
  return secret;
}

function signToken(ttlSeconds = 60 * 60 * 12) {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = `admin:${exp}`;
  const sig = crypto.createHmac('sha256', getAdminSecret()).update(payload).digest('base64url');
  return Buffer.from(`${payload}:${sig}`).toString('base64url');
}

function verifyToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  try {
    const token = authHeader.slice(7);
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const parts = decoded.split(':');
    if (parts.length !== 3) return false;
    const [role, expStr, sig] = parts;
    if (role !== 'admin') return false;
    const exp = Number(expStr);
    if (!exp || exp < Math.floor(Date.now() / 1000)) return false;
    const payload = `${role}:${exp}`;
    const expected = crypto.createHmac('sha256', getAdminSecret()).update(payload).digest('base64url');
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function requireAuth(event) {
  return verifyToken(event.headers.authorization || event.headers.Authorization || '');
}

function mapListing(row, imageIds = []) {
  return {
    id: row.id,
    make: row.make,
    model: row.model,
    hp: row.hp != null ? Number(row.hp) : null,
    year: row.year,
    hours: row.hours,
    shaft: row.shaft,
    price: row.price != null ? Number(row.price) : null,
    condition: row.condition,
    description: row.description,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
    image_ids: imageIds,
    image_urls: imageIds.map((id) => `/api/image/${id}`)
  };
}

function decodeImageData(dataBase64) {
  const cleaned = String(dataBase64 || '').replace(/^data:[^;]+;base64,/, '');
  return Buffer.from(cleaned, 'base64');
}

module.exports = {
  getSql,
  json,
  cors,
  parseBody,
  signToken,
  requireAuth,
  mapListing,
  decodeImageData
};
