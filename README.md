# WhatsApp Chat Frontend

Angular client for the WhatsApp bot API. The `/` route remains the existing
public chat demo. `/operator` is a separate, authenticated inbox for Moto Smart
service requests.

## Operator inbox

The inbox uses a server-issued, HttpOnly session cookie. It does not save the
operator password or a bearer token in browser storage. The browser sends the
cookie only to the backend API over credentialed HTTP requests.

Before deploying the inbox, configure the backend's `WEB_ORIGINS` with the
exact HTTPS origin of this frontend, and ensure the backend has operator
credentials. Do not expose the operator API on an
untrusted origin or commit credentials. The backend migration must be applied
and its request data retention/privacy settings reviewed before real customer
data is used.

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
