# Second-hand admin setup (Neon + Netlify)

Staff manage listings at `/admin.html` (not linked in the public menu).

## Architecture

- **Neon Postgres** — listings + photo binaries
- **Netlify Functions** — `/api/login`, `/api/listings`, `/api/listing`, `/api/image/:id`
- **Password auth** — `ADMIN_PASSWORD` + signed token (`ADMIN_SECRET`)

## 1. Database

Tables are already created on the `holidayoutboards` Neon project. Schema reference: [`neon/schema.sql`](neon/schema.sql).

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

Redeploy the Netlify site after pushing so production functions pick up the env vars.

## 4. Use the admin

1. Visit `/admin.html`
2. Sign in with `ADMIN_PASSWORD`
3. Add listings and photos (images are compressed in the browser, then stored in Neon)
4. Available stock appears on [`second-hand.html`](second-hand.html)

Default local password in your `.env` (change it): check `ADMIN_PASSWORD`.
