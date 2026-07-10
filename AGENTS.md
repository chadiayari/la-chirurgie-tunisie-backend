# AGENTS.md — AI Onboarding Guide

This is a Cloudflare Workers backend using Hono + D1 (SQLite). When reusing this as a starting point for a new project, change the following:

---

## 1. `wrangler.jsonc`

```jsonc
{
  "name": "CHANGE_ME",                        // Worker name (becomes subdomain: name.account.workers.dev)
  "account_id": "CHANGE_ME",                  // Cloudflare account ID (dash.cloudflare.com → top-right)
  "d1_databases": [{
    "binding": "CHANGE_ME_db",               // How you reference the DB in code: c.env.CHANGE_ME_db
    "database_name": "CHANGE_ME-db",         // Name shown in Cloudflare dashboard
    "database_id": "CHANGE_ME"               // Get after: npx wrangler d1 create CHANGE_ME-db
  }]
}
```

## 2. Create the D1 Database

Run once to create the database in Cloudflare, then copy the `database_id` into `wrangler.jsonc`:
```bash
npx wrangler d1 create CHANGE_ME-db
```

Then apply the schema:
```bash
npx wrangler d1 execute CHANGE_ME-db --local --file=./schema.sql   # local dev
npx wrangler d1 execute CHANGE_ME-db --remote --file=./schema.sql  # production
```

## `schema.sql`

Rewrite all tables for the new project's data model. Keep the SQLite-compatible syntax (no `ENUM`, use `TEXT`; use `INTEGER` for booleans; default timestamps with `datetime('now')`). Example:
```sql
CREATE TABLE IF NOT EXISTS example (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

## 3. `app.js`

Update route prefixes and imported routers to match the new project's structure.

## 4. Controllers (`controllers/`)

Rewrite all controllers. Every handler receives a Hono context `c`:
- `c.req.json()` — parse request body
- `c.req.query("key")` — query string param
- `c.req.param("key")` — URL param
- `c.req.header("key")` — request header
- `c.env.BINDING_NAME` — access D1, secrets, etc.
- `c.json({ ... }, statusCode)` — send response
- `c.get("key")` / `c.set("key", val)` — per-request context state (used for auth)

## 5. `middleware/authMiddleware.js`

Update the DB query to match the new project's users/admins table name and columns.

## 6. `utils/emailService.js`

Update sender name, sender email, and email templates to match the new project.
Email is sent via Brevo REST API using `c.env.BREVO_API_KEY`.

## 7. Secrets (set once per project, never committed to git)

```bash
npx wrangler secret put JWT_SECRET       # any long random string
npx wrangler secret put BREVO_API_KEY    # from app.brevo.com → SMTP & API → API Keys
```

For local dev create `.dev.vars` (already in `.gitignore`):
```
JWT_SECRET=local-dev-secret
BREVO_API_KEY=your-key-here
```

## 8. Seed first admin user

```bash
node -e "import('bcryptjs').then(b => b.default.hash('yourpassword', 10).then(console.log))"
npx wrangler d1 execute CHANGE_ME-db --remote \
  --command="INSERT INTO admins (username, email, password, role) VALUES ('admin', 'you@email.com', '<hash>', 'admin')"
```

## 9. `.github/workflows/deploy.yml` & GitHub Repo Secrets

Update `accountId` to match the new Cloudflare account.

### CLOUDFLARE_API_TOKEN (required for GitHub Actions → Cloudflare Pages)

1. **Create the token in Cloudflare:**
   - Go to [https://dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)
   - Click **Create Token**
   - Use the **"Cloudflare Pages — Edit"** template (or custom with permissions: `Account > Cloudflare Pages > Edit`)
   - Set **Account Resources** → include your account
   - Click **Continue to summary → Create Token**
   - Copy the token — you will only see it once

2. **Add the token to the GitHub repository:**
   - Go to the GitHub repo → **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret**
   - Name: `CLOUDFLARE_API_TOKEN`
   - Value: paste the token from step 1
   - Click **Add secret**

3. **Use it in `deploy.yml`** (frontend workflow for Pages):
   ```yaml
   - name: Deploy to Cloudflare Pages
     uses: cloudflare/pages-action@v1
     with:
       apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
       accountId: CHANGE_ME_ACCOUNT_ID
       projectName: CHANGE_ME-frontend
       directory: dist
       gitHubToken: ${{ secrets.GITHUB_TOKEN }}
   ```

> Note: Workers CI/CD uses `CLOUDFLARE_API_TOKEN` as well but with the `npx wrangler deploy` command via `cloudflare/wrangler-action`. Pages and Workers deployments can share the same token as long as it has both permissions.

## 10. Deploy

```bash
npx wrangler deploy
```

---

## Stack Reference

| Layer | Technology |
|---|---|
| Runtime | Cloudflare Workers |
| Framework | Hono |
| Database | Cloudflare D1 (SQLite) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Email | Brevo REST API (fetch, no SDK) |
| Deploy | wrangler / GitHub Actions |

## Things NOT to change

- Hono routing patterns — `new Hono()`, `router.get/post/put`, `app.route()`
- D1 query API — `.prepare().bind().first()` / `.all()` / `.run()`
- Auth middleware pattern — `c.set("user", ...)` then `c.get("user")` in handlers
- Export style — `export default app` in `app.js`
