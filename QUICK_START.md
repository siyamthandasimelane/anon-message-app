# 🚀 Quick Start Guide - Anonymous Message App

This guide covers the new MongoDB/Express backend version. If you are still using
an older Firebase build, refer to the README for legacy instructions.

## Step 1: Prepare the Backend

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free
   cluster.
2. Add a database user and whitelist your IP (0.0.0.0/0 works for development).
3. Copy the connection string (it will look like
   `mongodb+srv://user:pass@cluster0.mongodb.net`).
4. Clone or download this repository and open a terminal in the project root.

```bash
cd server
cp .env.example .env
# edit .env: fill MONGODB_URI and choose a JWT_SECRET
npm install
npm run dev  # starts API on http://localhost:3000
```

The backend exposes the following endpoints:

| Method | Path                | Description                        |
|--------|---------------------|------------------------------------|
| POST   | /api/auth/signup    | create user                        |
| POST   | /api/auth/login     | get JWT token                      |
| POST   | /api/auth/change-password | change password           |
| POST   | /api/auth/delete-account | deactivate account           |
| GET    | /api/users/:id      | get user profile (auth required)   |
| PUT    | /api/users/:id      | update user fields (auth required) |
| GET    | /api/users/lookup   | find username by code              |
| GET    | /api/messages       | fetch messages (`?to=username`)    |
| POST   | /api/messages       | send a message                     |


## Step 2: Configure Frontend

The frontend is pure HTML/CSS/JS and already points to `/api/...` paths. No
additional configuration is required except ensuring the API and frontend are
served from compatible origins (use a proxy or host both together).

Deploy the HTML files to GitHub Pages or any static host, and make sure the
`/api` endpoints are reachable (e.g. serve backend on the same domain or use
CORS).

## Step 3: Deploying

* **Frontend + Backend (recommended free):** Vercel
  1. Install the CLI (`npm install -g vercel`) and run `vercel` in the repo root.
  2. Follow the prompts to deploy; the static files and `/api` functions are
     served from the same URL.
  3. Use `vercel env add MONGODB_URI production` and
     `vercel env add JWT_SECRET production` to configure database and secret.

* **Alternative frontend host:** GitHub Pages – push repository as usual and
  enable Pages in Settings. If you do this, set the API base URL to the Vercel
  domain in your JavaScript or use a proxy.
* **Alternative backend host (optional):** Any Node host (Heroku, Railway, etc.)
  that supports environment variables. Provide `MONGODB_URI` and `JWT_SECRET`.

Once both pieces are live, visiting your frontend URL should allow you to sign
up, log in, and send messages.

## Summary

This application now uses a MongoDB database managed by a lightweight Express
API. All Firebase SDKs/configuration have been removed.

---

Partial legacy instructions may still exist elsewhere; please ignore them when
running the new version.




### Messages not saving?
- Make sure Firestore Database is created
- Check that you're in test mode or have proper rules

### App doesn't load on GitHub Pages?
- Wait 5-10 minutes for deployment to complete
- Try clearing browser cache (Ctrl+Shift+Delete)
- Check GitHub Actions for any build errors

## Need Help?

Contact the developer:
- 📧 Email: silindelwasimelane@gmail.com
- 💬 WhatsApp: https://whatsapp.com/channel/0029Vb7bGEQIHphDP72VD81b

---

**You're all set! Happy coding! 🎉**
