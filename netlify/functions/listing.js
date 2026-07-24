const { getSql, json, cors, parseBody, requireAuth, mapListing, decodeImageData } = require('./_shared');

exports.handler = async (event) => {
  const preflight = cors(event);
  if (preflight) return preflight;

  try {
    const sql = getSql();
    const id = event.queryStringParameters && event.queryStringParameters.id;
    if (!id) return json(400, { error: 'Missing id' });

    if (event.httpMethod === 'GET') {
      const rows = await sql`
        SELECT o.*,
          COALESCE(
            (SELECT array_agg(i.id ORDER BY i.sort_order, i.created_at)
             FROM listing_images i WHERE i.listing_id = o.id),
            '{}'::uuid[]
          ) AS image_ids
        FROM second_hand_outboards o
        WHERE o.id = ${id}
        LIMIT 1
      `;
      if (!rows.length) return json(404, { error: 'Not found' });
      const row = rows[0];
      if (row.status !== 'available' && !requireAuth(event)) {
        return json(404, { error: 'Not found' });
      }
      return json(200, { listing: mapListing(row, (row.image_ids || []).filter(Boolean)) });
    }

    if (!requireAuth(event)) return json(401, { error: 'Unauthorized' });

    if (event.httpMethod === 'PUT') {
      const body = parseBody(event);
      const make = String(body.make || '').trim();
      if (!make) return json(400, { error: 'Make is required' });

      const updated = await sql`
        UPDATE second_hand_outboards SET
          make = ${make},
          model = ${String(body.model || '').trim()},
          hp = ${body.hp ?? null},
          year = ${body.year ?? null},
          hours = ${body.hours ?? null},
          shaft = ${body.shaft || null},
          price = ${body.price ?? null},
          condition = ${body.condition || null},
          description = ${String(body.description || '').trim()},
          status = ${body.status === 'sold' ? 'sold' : 'available'}
        WHERE id = ${id}
        RETURNING *
      `;
      if (!updated.length) return json(404, { error: 'Not found' });

      // Keep only image ids still referenced; delete the rest
      const keepIds = Array.isArray(body.keep_image_ids) ? body.keep_image_ids : [];
      if (keepIds.length) {
        await sql`
          DELETE FROM listing_images
          WHERE listing_id = ${id}
            AND NOT (id = ANY(${keepIds}::uuid[]))
        `;
      } else {
        await sql`DELETE FROM listing_images WHERE listing_id = ${id}`;
      }

      const images = Array.isArray(body.images) ? body.images : [];
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const buf = decodeImageData(img.dataBase64);
        if (!buf.length) continue;
        const contentType = img.contentType || 'image/jpeg';
        await sql`
          INSERT INTO listing_images (listing_id, content_type, data, sort_order)
          VALUES (${id}, ${contentType}, ${buf}, ${1000 + i})
        `;
      }

      const rows = await sql`
        SELECT o.*,
          COALESCE(
            (SELECT array_agg(i.id ORDER BY i.sort_order, i.created_at)
             FROM listing_images i WHERE i.listing_id = o.id),
            '{}'::uuid[]
          ) AS image_ids
        FROM second_hand_outboards o
        WHERE o.id = ${id}
        LIMIT 1
      `;
      return json(200, { listing: mapListing(rows[0], (rows[0].image_ids || []).filter(Boolean)) });
    }

    if (event.httpMethod === 'DELETE') {
      const deleted = await sql`
        DELETE FROM second_hand_outboards WHERE id = ${id} RETURNING id
      `;
      if (!deleted.length) return json(404, { error: 'Not found' });
      return json(200, { ok: true });
    }

    if (event.httpMethod === 'PATCH') {
      const body = parseBody(event);
      const status = body.status === 'sold' ? 'sold' : 'available';
      const updated = await sql`
        UPDATE second_hand_outboards SET status = ${status}
        WHERE id = ${id}
        RETURNING *
      `;
      if (!updated.length) return json(404, { error: 'Not found' });
      return json(200, { listing: mapListing(updated[0], []) });
    }

    return json(405, { error: 'Method not allowed' });
  } catch (err) {
    return json(500, { error: err.message || 'Server error' });
  }
};
