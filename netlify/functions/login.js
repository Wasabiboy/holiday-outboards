const { json, cors, parseBody, signToken } = require('./_shared');

exports.handler = async (event) => {
  const preflight = cors(event);
  if (preflight) return preflight;

  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  try {
    const body = parseBody(event);
    const password = String(body.password || '');
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected) {
      return json(500, { error: 'ADMIN_PASSWORD is not configured on the server' });
    }
    if (!password || password !== expected) {
      return json(401, { error: 'Invalid password' });
    }
    const token = signToken();
    return json(200, { token, expires_in: 60 * 60 * 12 });
  } catch (err) {
    return json(500, { error: err.message || 'Login failed' });
  }
};
