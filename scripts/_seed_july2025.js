require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

/** July 2025 Honda Marine RRP — highlighted / representative configs mapped to site SKUs */
const MODELS = [
  {
    sku: 'bf23', name: 'Honda BF2.3', category: 'portable', hp: 2.3, sort_order: 10,
    price: 1795, show_price: true, model_code: 'BF2.3DHSCHD', shaft: '15" Short',
    displacement: '1 cyl · 57cc', prop: '7 1/4 x 4 5/8', fuel_tank: '1.1L inbuilt',
    dry_weight: '13.6kg', amp_charge: '', manual_start: true, electric_start: false,
    power_tilt: false, trim_tilt: false, tiller: true, remote: false, vtec: false, drive_by_wire: false
  },
  {
    // Sheet lists BF6 (replaces older BF5 listing on site)
    sku: 'bf5', name: 'Honda BF6', category: 'portable', hp: 6, sort_order: 20,
    price: 2599, show_price: true, model_code: 'BF6AHSHND', shaft: '15" Short',
    displacement: '1 cyl · 127cc', prop: '7 7/8 x 7 1/2', fuel_tank: '1.5L inbuilt',
    dry_weight: '27kg', amp_charge: 'Optional', manual_start: true, electric_start: false,
    power_tilt: false, trim_tilt: false, tiller: true, remote: false, vtec: false, drive_by_wire: false
  },
  {
    sku: 'bf8', name: 'Honda BF8', category: 'portable', hp: 8, sort_order: 30,
    price: 4545, show_price: true, model_code: 'BF8DK2SHD', shaft: '15" Short',
    displacement: '2 cyl · 222cc', prop: '9 1/4 x 9', fuel_tank: '12.5L',
    dry_weight: '42kg', amp_charge: '6 Amp', manual_start: true, electric_start: false,
    power_tilt: false, trim_tilt: false, tiller: true, remote: false, vtec: false, drive_by_wire: false
  },
  {
    sku: 'bf10', name: 'Honda BF10', category: 'portable', hp: 10, sort_order: 40,
    price: 4995, show_price: true, model_code: 'BF10DK2SHD', shaft: '15" Short',
    displacement: '2 cyl · 222cc', prop: '9 1/4 x 9', fuel_tank: '12.5L',
    dry_weight: '42kg', amp_charge: '6 Amp', manual_start: true, electric_start: false,
    power_tilt: false, trim_tilt: false, tiller: true, remote: false, vtec: false, drive_by_wire: false
  },
  {
    sku: 'bf15', name: 'Honda BF15', category: 'portable', hp: 15, sort_order: 50,
    price: 5945, show_price: true, model_code: 'BF15DK2SHSD', shaft: '15" Short',
    displacement: '2 cyl · 350cc', prop: '9 1/4 x 8', fuel_tank: '12.5L',
    dry_weight: '50kg', amp_charge: '12 Amp', manual_start: true, electric_start: true,
    power_tilt: false, trim_tilt: false, tiller: true, remote: false, vtec: false, drive_by_wire: false
  },
  {
    sku: 'bf20', name: 'Honda BF20', category: 'portable', hp: 20, sort_order: 60,
    price: 5995, show_price: true, model_code: 'BF20DK2SHD', shaft: '15" Short',
    displacement: '2 cyl · 350cc', prop: '9 1/4 x 10', fuel_tank: '12.5L',
    dry_weight: '46.5kg', amp_charge: '6 Amp', manual_start: true, electric_start: false,
    power_tilt: false, trim_tilt: false, tiller: true, remote: false, vtec: false, drive_by_wire: false
  },
  {
    sku: 'bf25', name: 'Honda BF25', category: 'midrange', hp: 25, sort_order: 70,
    price: null, show_price: false, model_code: '', shaft: '',
    displacement: '', prop: '', fuel_tank: '', dry_weight: '', amp_charge: '',
    manual_start: false, electric_start: false, power_tilt: false, trim_tilt: false,
    tiller: false, remote: false, vtec: false, drive_by_wire: false
  },
  {
    sku: 'bf30', name: 'Honda BF30', category: 'midrange', hp: 30, sort_order: 80,
    price: 10145, show_price: true, model_code: 'BF30DK2SHTD', shaft: '15" Short',
    displacement: '3 cyl · 552cc', prop: '9 1/4 x 12', fuel_tank: '25L',
    dry_weight: '78kg', amp_charge: '10 Amp', manual_start: true, electric_start: true,
    power_tilt: false, trim_tilt: true, tiller: true, remote: false, vtec: false, drive_by_wire: false
  },
  {
    sku: 'bf40', name: 'Honda BF40', category: 'midrange', hp: 40, sort_order: 90,
    price: 12195, show_price: true, model_code: 'BF40DK4LHTD', shaft: '20" Long',
    displacement: '3 cyl · 808cc', prop: '11.25 x 15', fuel_tank: '25L',
    dry_weight: '100kg', amp_charge: '17 Amp', manual_start: false, electric_start: true,
    power_tilt: false, trim_tilt: true, tiller: true, remote: false, vtec: false, drive_by_wire: false
  },
  {
    sku: 'bf50', name: 'Honda BF50', category: 'midrange', hp: 50, sort_order: 100,
    price: 13295, show_price: true, model_code: 'BF50DK4LHTD', shaft: '20" Long',
    displacement: '3 cyl · 808cc', prop: '11.25 x 15', fuel_tank: '25L',
    dry_weight: '', amp_charge: '17 Amp', manual_start: false, electric_start: true,
    power_tilt: false, trim_tilt: true, tiller: true, remote: false, vtec: false, drive_by_wire: false
  },
  {
    sku: 'bf60', name: 'Honda BF60', category: 'midrange', hp: 60, sort_order: 110,
    price: 13895, show_price: true, model_code: 'BF60AK1LRTD', shaft: '20" Long',
    displacement: '3 cyl · 998cc', prop: '', fuel_tank: '25L',
    dry_weight: '', amp_charge: '', manual_start: false, electric_start: true,
    power_tilt: false, trim_tilt: true, tiller: false, remote: true, vtec: false, drive_by_wire: false
  },
  {
    sku: 'bf75', name: 'Honda BF75', category: 'midrange', hp: 75, sort_order: 120,
    price: 15995, show_price: true, model_code: 'BF75DK4LRTU', shaft: '20" Long',
    displacement: '4 cyl · 1496cc', prop: '', fuel_tank: '',
    dry_weight: '', amp_charge: '', manual_start: false, electric_start: true,
    power_tilt: false, trim_tilt: true, tiller: false, remote: true, vtec: false, drive_by_wire: false
  },
  {
    sku: 'bf80', name: 'Honda BF80', category: 'midrange', hp: 80, sort_order: 130,
    price: 14995, show_price: true, model_code: 'BF80AK1LRTL', shaft: '20" Long',
    displacement: '4 cyl · 1496cc', prop: '', fuel_tank: '',
    dry_weight: '', amp_charge: '', manual_start: false, electric_start: true,
    power_tilt: false, trim_tilt: true, tiller: false, remote: true, vtec: false, drive_by_wire: false
  },
  {
    sku: 'bf90', name: 'Honda BF90', category: 'midrange', hp: 90, sort_order: 140,
    price: 15995, show_price: true, model_code: 'BF90DK5LRTL', shaft: '20" Long',
    displacement: '4 cyl · 1496cc', prop: '', fuel_tank: '',
    dry_weight: '', amp_charge: '', manual_start: false, electric_start: true,
    power_tilt: false, trim_tilt: true, tiller: false, remote: true, vtec: true, drive_by_wire: false
  },
  {
    sku: 'bf100', name: 'Honda BF100', category: 'midrange', hp: 100, sort_order: 150,
    price: 17295, show_price: true, model_code: 'BF100AK1LRTL', shaft: '20" Long',
    displacement: '4 cyl · 1496cc', prop: '', fuel_tank: '',
    dry_weight: '', amp_charge: '', manual_start: false, electric_start: true,
    power_tilt: false, trim_tilt: true, tiller: false, remote: true, vtec: true, drive_by_wire: false
  },
  {
    sku: 'bf115', name: 'Honda BF115', category: 'inline4', hp: 115, sort_order: 160,
    price: 21995, show_price: true, model_code: 'BF115JK1LDU', shaft: '20" Long',
    displacement: '4 cyl · 2354cc', prop: '', fuel_tank: '',
    dry_weight: '224kg', amp_charge: '55 Amp', manual_start: false, electric_start: true,
    power_tilt: false, trim_tilt: true, tiller: false, remote: true, vtec: false, drive_by_wire: true
  },
  {
    sku: 'bf135', name: 'Honda BF135', category: 'inline4', hp: 135, sort_order: 170,
    price: 24695, show_price: true, model_code: 'BF135DK1LDU', shaft: '20" Long',
    displacement: '4 cyl · 2354cc', prop: '', fuel_tank: '',
    dry_weight: '224kg', amp_charge: '55 Amp', manual_start: false, electric_start: true,
    power_tilt: false, trim_tilt: true, tiller: false, remote: true, vtec: false, drive_by_wire: true
  },
  {
    sku: 'bf150', name: 'Honda BF150', category: 'inline4', hp: 150, sort_order: 180,
    price: 27195, show_price: true, model_code: 'BF150DK1LDU', shaft: '20" Long',
    displacement: '4 cyl · 2354cc', prop: '', fuel_tank: '',
    dry_weight: '224kg', amp_charge: '55 Amp', manual_start: false, electric_start: true,
    power_tilt: false, trim_tilt: true, tiller: false, remote: true, vtec: true, drive_by_wire: true
  },
  {
    sku: 'bf175', name: 'Honda BF175', category: 'highpower', hp: 175, sort_order: 190,
    price: null, show_price: false, model_code: '', shaft: '',
    displacement: 'V6', prop: '', fuel_tank: '', dry_weight: '', amp_charge: '',
    manual_start: false, electric_start: true, power_tilt: false, trim_tilt: true,
    tiller: false, remote: true, vtec: true, drive_by_wire: false
  },
  {
    sku: 'bf200', name: 'Honda BF200', category: 'highpower', hp: 200, sort_order: 200,
    price: 33995, show_price: true, model_code: 'BF200DK1XDU', shaft: '25" X-Long',
    displacement: 'V6 · 3583cc', prop: '', fuel_tank: '',
    dry_weight: '285kg', amp_charge: '90 Amp+', manual_start: false, electric_start: true,
    power_tilt: false, trim_tilt: true, tiller: false, remote: true, vtec: false, drive_by_wire: true
  },
  {
    sku: 'bf200ist', name: 'Honda BF200iST', category: 'highpower', hp: 200, sort_order: 210,
    price: 33995, show_price: true, model_code: 'BF200DK1XDU (iST / DBW)', shaft: '25" X-Long',
    displacement: 'V6 · 3583cc', prop: '', fuel_tank: '',
    dry_weight: '285kg', amp_charge: '90 Amp+', manual_start: false, electric_start: true,
    power_tilt: false, trim_tilt: true, tiller: false, remote: true, vtec: false, drive_by_wire: true
  },
  {
    sku: 'bf225', name: 'Honda BF225', category: 'highpower', hp: 225, sort_order: 220,
    price: 38245, show_price: true, model_code: 'BF225DK1XDU', shaft: '25" X-Long',
    displacement: 'V6 · 3583cc', prop: '', fuel_tank: '',
    dry_weight: '287kg', amp_charge: '90 Amp+', manual_start: false, electric_start: true,
    power_tilt: false, trim_tilt: true, tiller: false, remote: true, vtec: true, drive_by_wire: true
  },
  {
    sku: 'bf225ist', name: 'Honda BF225iST', category: 'highpower', hp: 225, sort_order: 230,
    price: 38245, show_price: true, model_code: 'BF225DK1XDU (iST / DBW)', shaft: '25" X-Long',
    displacement: 'V6 · 3583cc', prop: '', fuel_tank: '',
    dry_weight: '287kg', amp_charge: '90 Amp+', manual_start: false, electric_start: true,
    power_tilt: false, trim_tilt: true, tiller: false, remote: true, vtec: true, drive_by_wire: true
  },
  {
    sku: 'bf250', name: 'Honda BF250', category: 'highpower', hp: 250, sort_order: 240,
    price: 41495, show_price: true, model_code: 'BF250DK1XDU', shaft: '25" X-Long',
    displacement: 'V6 · 3583cc', prop: '', fuel_tank: '',
    dry_weight: '287kg', amp_charge: '90 Amp+', manual_start: false, electric_start: true,
    power_tilt: false, trim_tilt: true, tiller: false, remote: true, vtec: true, drive_by_wire: true
  },
  {
    sku: 'm300', name: 'Honda M300', category: '300plus', hp: 300, sort_order: 250,
    price: null, show_price: false, model_code: 'M300 McLaren Performance', shaft: '',
    displacement: 'V6 · 3583cc', prop: '', fuel_tank: '',
    dry_weight: '', amp_charge: '90 Amp', manual_start: false, electric_start: true,
    power_tilt: false, trim_tilt: true, tiller: false, remote: true, vtec: true, drive_by_wire: true
  },
  {
    sku: 'bf350', name: 'Honda BF350', category: '300plus', hp: 350, sort_order: 260,
    price: 56995, show_price: true, model_code: 'BF350AXDD', shaft: '25" X-Long',
    displacement: 'V8 · 4952cc', prop: '', fuel_tank: '',
    dry_weight: '349kg', amp_charge: '93 Amp+', manual_start: false, electric_start: true,
    power_tilt: false, trim_tilt: true, tiller: false, remote: true, vtec: true, drive_by_wire: true
  }
];

async function main() {
  let url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL missing');
  url = url.replace(/([&?])channel_binding=require&?/, '$1').replace(/[?&]$/, '');
  const sql = neon(url);

  await sql`
    ALTER TABLE public.honda_models
      ADD COLUMN IF NOT EXISTS model_code text NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS shaft text NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS displacement text NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS prop text NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS fuel_tank text NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS dry_weight text NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS amp_charge text NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS manual_start boolean NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS electric_start boolean NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS power_tilt boolean NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS trim_tilt boolean NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS tiller boolean NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS remote boolean NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS vtec boolean NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS drive_by_wire boolean NOT NULL DEFAULT false
  `;
  console.log('columns ok');

  for (const m of MODELS) {
    await sql`
      INSERT INTO honda_models (
        sku, name, category, hp, sort_order, price, show_price,
        model_code, shaft, displacement, prop, fuel_tank, dry_weight, amp_charge,
        manual_start, electric_start, power_tilt, trim_tilt, tiller, remote, vtec, drive_by_wire
      ) VALUES (
        ${m.sku}, ${m.name}, ${m.category}, ${m.hp}, ${m.sort_order}, ${m.price}, ${m.show_price},
        ${m.model_code}, ${m.shaft}, ${m.displacement}, ${m.prop}, ${m.fuel_tank}, ${m.dry_weight}, ${m.amp_charge},
        ${m.manual_start}, ${m.electric_start}, ${m.power_tilt}, ${m.trim_tilt}, ${m.tiller}, ${m.remote}, ${m.vtec}, ${m.drive_by_wire}
      )
      ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        category = EXCLUDED.category,
        hp = EXCLUDED.hp,
        sort_order = EXCLUDED.sort_order,
        price = EXCLUDED.price,
        show_price = EXCLUDED.show_price,
        model_code = EXCLUDED.model_code,
        shaft = EXCLUDED.shaft,
        displacement = EXCLUDED.displacement,
        prop = EXCLUDED.prop,
        fuel_tank = EXCLUDED.fuel_tank,
        dry_weight = EXCLUDED.dry_weight,
        amp_charge = EXCLUDED.amp_charge,
        manual_start = EXCLUDED.manual_start,
        electric_start = EXCLUDED.electric_start,
        power_tilt = EXCLUDED.power_tilt,
        trim_tilt = EXCLUDED.trim_tilt,
        tiller = EXCLUDED.tiller,
        remote = EXCLUDED.remote,
        vtec = EXCLUDED.vtec,
        drive_by_wire = EXCLUDED.drive_by_wire
    `;
    console.log('upsert', m.sku, m.price);
  }

  const rows = await sql`SELECT sku, price, show_price, model_code FROM honda_models ORDER BY sort_order`;
  console.log(JSON.stringify(rows, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });
