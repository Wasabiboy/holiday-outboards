const { getSql, json, cors, parseBody, requireAuth, mapListing, decodeImageData } = require('./_shared');

exports.handler = async (event) => {
  const preflight = cors(event);
  if (preflight) return preflight;

  try {
    const sql = getSql();

    if (event.httpMethod === 'GET') {
      const authed = requireAuth(event);
      const rows = authed
        ? await sql`
            SELECT o.*,
              COALESCE(
                (SELECT array_agg(i.id ORDER BY i.sort_order, i.created_at)
                 FROM listing_images i WHERE i.listing_id = o.id),
                '{}'::uuid[]
              ) AS image_ids
            FROM second_hand_outboards o
            ORDER BY o.created_at DESC
          `
        : await sql`
            SELECT o.*,
              COALESCE(
                (SELECT array_agg(i.id ORDER BY i.sort_order, i.created_at)
                 FROM listing_images i WHERE i.listing_id = o.id),
                '{}'::uuid[]
              ) AS image_ids
            FROM second_hand_outboards o
            WHERE o.status = 'available'
            ORDER BY o.created_at DESC
          `;

      return json(200, {
        listings: rows.map((r) => mapListing(r, (r.image_ids || []).filter(Boolean)))
      });
    }

    if (event.httpMethod === 'POST') {
      if (!requireAuth(event)) return json(401, { error: 'Unauthorized' });
      const body = parseBody(event);
      const make = String(body.make || '').trim();
      if (!make) return json(400, { error: 'Make is required' });

      const inserted = await sql`
        INSERT INTO second_hand_outboards (
          make, model, hp, year, hours, shaft, price, condition, description, status
        ) VALUES (
          ${make},
          ${String(body.model || '').trim()},
          ${body.hp ?? null},
          ${body.year ?? null},
          ${body.hours ?? null},
          ${body.shaft || null},
          ${body.price ?? null},
          ${body.condition || null},
          ${String(body.description || '').trim()},
          ${body.status === 'sold' ? 'sold' : 'available'}
        )
        RETURNING *
      `;
      const listing = inserted[0];
      const images = Array.isArray(body.images) ? body.images : [];
      const imageIds = [];
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const buf = decodeImageData(img.dataBase64);
        if (!buf.length) continue;
        const contentType = img.contentType || 'image/jpeg';
        const rows = await sql`
          INSERT INTO listing_images (listing_id, content_type, data, sort_order)
          VALUES (${listing.id}, ${contentType}, ${buf}, ${i})
          RETURNING id
        `;
        imageIds.push(rows[0].id);
      }
      return json(201, { listing: mapListing(listing, imageIds) });
    }

    return json(405, { error: 'Method not allowed' });
  } catch (err) {
    return json(500, { error: err.message || 'Server error' });
  }
};
