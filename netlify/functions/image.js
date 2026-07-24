const { getSql } = require('./_shared');

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
    const id = (event.queryStringParameters && event.queryStringParameters.id) || '';
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
    const buf = Buffer.isBuffer(row.data)
      ? row.data
      : Buffer.from(row.data);

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
