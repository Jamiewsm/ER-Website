# ER Business

Independent corporate training and team consulting site for
`https://business.er-coaching.com`.

## Routes

- `/` — service overview
- `/programs` — four program details and proposal scope
- `/about` — approach, facilitator, and assessment ethics
- `/contact` — structured proposal inquiry
- `/privacy` — privacy policy
- `/terms` — service terms

The contact page posts inquiries to `POST /api/contact` on this Worker.
Cloudflare Email Routing delivers them to `restoration.son@gmail.com`, with
`Reply-To` set to the visitor's address. Public display still uses
`hello@er-coaching.com`, which also forwards to the same inbox.

## Local development

```bash
npm ci
npm run dev
```

## Verification

```bash
npm run verify
```

The build uses vinext static export and produces the deployable site in
`dist/client`. Cloudflare Worker configuration is generated into
`dist/server/wrangler.json`.

## Production deployment

Production deployment is owned by
`.github/workflows/deploy-business.yml`. A merge to `main` that changes
`business/**` builds and deploys the isolated `er-business-site` Worker, then
verifies every public route and the sitemap at
`https://business.er-coaching.com`.

The root `er-coaching-site` deploy bundle explicitly excludes `business/`, so
the personal/coaching site and this Worker cannot overwrite one another.

Required GitHub Actions secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

The token needs Workers Scripts: Edit, Workers Routes: Edit, Zone: Read, and
SSL Certificates: Edit for the `er-coaching.com` zone. Never commit the token
or place it in a `.env` file.
