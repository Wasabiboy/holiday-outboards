# Admin setup (Neon + Netlify)

Staff manage the site at `/admin.html` (not linked in the public menu).

## Architecture

- **Neon Postgres** — second-hand listings, photo binaries, Honda model pricing
- **Netlify Functions** — `/api/login`, `/api/listings`, `/api/listing`, `/api/image/:id`, `/api/honda-prices`
- **Password auth** — `ADMIN_PASSWORD` + signed token (`ADMIN_SECRET`)

## 1. Database

On the `holidayoutboards` Neon project:

- Second-hand schema: [`neon/schema.sql`](neon/schema.sql)
- Honda pricing schema/seed: [`neon/honda-prices.sql`](neon/honda-prices.sql)

## 2. Environment variables

Copy [`.env.example`](.env.example) to `.env` for local `netlify dev`.

On **Netlify → Site settings → Environment variables** set:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon connection string (`sslmode=require`; omit `channel_binding` if needed) |
| `ADMIN_PASSWORD` | Workshop admin password |
| `ADMIN_SECRET` | Long random string used to sign session tokens |

**Security:** Rotate the Neon password if it was shared in chat, and never commit `.env`.

## 3. Deploy / local

```bash
npm install
npx netlify dev
```

Then open `http://localhost:8888/admin.html`.

Redeploy the Netlify site after pushing so production functions pick up code and env vars.

## 4. Use the admin

1. Visit `/admin.html`
2. Sign in with `ADMIN_PASSWORD`
3. **Second-hand stock** — add listings and photos (shown on [`second-hand.html`](second-hand.html))
4. **Honda pricing** — edit model prices and tick **Show on site** to display them on [`honda-outboards.html`](honda-outboards.html)

Leave price blank (or untick Show on site) to keep “Enquire for price” on the public page.
