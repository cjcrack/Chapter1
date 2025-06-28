# Account Registration Backend

This example project now includes a small Express server to handle account registration.

## Setup

```
npm install express
node server.js
```

The server stores registered accounts and an audit log in the `data/` directory. It exposes two endpoints:

- `GET /api/captcha` – retrieve a simple math CAPTCHA.
- `POST /api/register` – submit registration data with CAPTCHA verification.

Open `index.html` in a browser while the server is running to use the registration form.
