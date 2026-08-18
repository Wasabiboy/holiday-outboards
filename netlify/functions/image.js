const { getSql } = require('./_shared');

function getImageId(event) {
  const q = event.queryStringParameters || {};
  if (q.id) return String(q.id).trim();

  // Support /api/image/:id and /.netlify/functions/image/:id rewrites
  const candidates = [event.path, event.rawPath, event.rawUrl]
    .filter(Boolean)
    .map(String);
  for (const raw of candidates) {
    try {
      const pathOnly = raw.includes('://') ? new URL(raw).pathname : raw;
      const parts = pathOnly.split('/').filter(Boolean);
      const idx = parts.findIndex((p) => p === 'image');
      if (idx >= 0 && parts[idx + 1]) return decodeURIComponent(parts[idx + 1]).trim();
      const last = parts[parts.length - 1];
      if (last && last !== 'image') return decodeURIComponent(last).trim();
    } catch (_) {
      /* ignore */
    }
  }
  return '';
}

function toBuffer(data) {
  if (!data) return Buffer.alloc(0);
  if (Buffer.isBuffer(data)) return data;
  if (data instanceof Uint8Array) return Buffer.from(data);
  if (typeof data === 'string') {
    // Neon may return hex-encoded bytea as \x...
    if (data.startsWith('\\x')) return Buffer.from(data.slice(2), 'hex');
    if (/^[0-9a-fA-F]+$/.test(data) && data.length % 2 === 0) {
      try { return Buffer.from(data, 'hex'); } catch (_) { /* fall through */ }
    }
    return Buffer.from(data, 'base64');
  }
  if (Array.isArray(data)) return Buffer.from(data);
  return Buffer.from(data);
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const id = getImageId(event);
    if (!id) return { statusCode: 400, body: 'Missing id' };

    const sql = getSql();
    const rows = await sql`
      SELECT content_type, data
      FROM listing_images
      WHERE id = ${id}
      LIMIT 1
    `;
    if (!rows.length) return { statusCode: 404, body: 'Not found' };

    const row = rows[0];
    const buf = toBuffer(row.data);
    if (!buf.length) return { statusCode: 404, body: 'Empty image' };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': row.content_type || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*'
      },
      isBase64Encoded: true,
      body: buf.toString('base64')
    };
  } catch (err) {
    return { statusCode: 500, body: err.message || 'Server error' };
  }
};
