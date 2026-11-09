# WhatsApp Chat Frontend

Angular client for the Moto Smart WhatsApp platform. The `/` route remains the
existing public chat demo. `/operator/:tenantSlug` is the tenant-specific,
authenticated inbox; for example, `/operator/officina-a`.

The inbox first loads the public tenant display name, logo, colors, and privacy
URL. Its requests and HttpOnly session are then scoped to that tenant slug.
No Meta access token or operator password is stored in browser storage.

Before deploying, configure the backend `WEB_ORIGINS` with the exact HTTPS
origin of this frontend, apply the backend migrations, and provision the tenant
and its initial owner account through the protected backend onboarding API.
Review each tenant's privacy policy and data-retention period before real
customer data is used. Additional operator management and self-service tenant
settings are not yet available in the UI.

For production, serve the frontend and API on the same site (for example,
`app.example.com` and `api.example.com`) so the HttpOnly `SameSite=Strict`
session cookie works reliably. Keep HTTPS enabled on both origins.

## Development

```bash
npm ci
npm start
npm test
npm run build
```

The Angular dev server defaults to `http://localhost:4200`, which must be
included in the backend's local `WEB_ORIGINS` setting. The API URL is set in
`src/environments/environment.ts`; change it only to the intended backend.
