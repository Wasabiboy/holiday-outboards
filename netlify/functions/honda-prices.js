const { getSql, json, cors, parseBody, requireAuth } = require('./_shared');

function mapModel(row) {
  return {
    sku: row.sku,
    name: row.name,
    category: row.category,
    hp: row.hp != null ? Number(row.hp) : null,
    sort_order: row.sort_order,
    price: row.price != null ? Number(row.price) : null,
    show_price: !!row.show_price,
    notes: row.notes || '',
    model_code: row.model_code || '',
    shaft: row.shaft || '',
    displacement: row.displacement || '',
    prop: row.prop || '',
    fuel_tank: row.fuel_tank || '',
    dry_weight: row.dry_weight || '',
    amp_charge: row.amp_charge || '',
    manual_start: !!row.manual_start,
    electric_start: !!row.electric_start,
    power_tilt: !!row.power_tilt,
    trim_tilt: !!row.trim_tilt,
    tiller: !!row.tiller,
    remote: !!row.remote,
    vtec: !!row.vtec,
    drive_by_wire: !!row.drive_by_wire,
    updated_at: row.updated_at
  };
}

exports.handler = async (event) => {
  const preflight = cors(event);
  if (preflight) return preflight;

  try {
    const sql = getSql();

    if (event.httpMethod === 'GET') {
      const rows = await sql`
        SELECT *
        FROM honda_models
        ORDER BY sort_order ASC, sku ASC
      `;
      return json(200, { models: rows.map(mapModel) });
    }

    if (event.httpMethod === 'PUT') {
      if (!requireAuth(event)) return json(401, { error: 'Unauthorized' });
      const body = parseBody(event);
      const items = Array.isArray(body.models) ? body.models : [];
      if (!items.length) return json(400, { error: 'No models to update' });

      const updated = [];
      for (const item of items) {
        const sku = String(item.sku || '').trim();
        if (!sku) continue;
        const priceRaw = item.price;
        const price =
          priceRaw === null || priceRaw === undefined || priceRaw === ''
            ? null
            : Number(priceRaw);
        if (price != null && (Number.isNaN(price) || price < 0)) {
          return json(400, { error: 'Invalid price for ' + sku });
        }
        const showPrice = !!item.show_price && price != null;
        const notes = String(item.notes || '').trim();
        const rows = await sql`
          UPDATE honda_models SET
            price = ${price},
            show_price = ${showPrice},
            notes = ${notes}
          WHERE sku = ${sku}
          RETURNING *
        `;
        if (rows.length) updated.push(mapModel(rows[0]));
      }
      return json(200, { models: updated, saved: updated.length });
    }

    return json(405, { error: 'Method not allowed' });
  } catch (err) {
    return json(500, { error: err.message || 'Server error' });
  }
};
