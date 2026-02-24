# Anonymous Message App

A secure, modern web application where users can send anonymous messages to each other and earn rewards through a referral program.

## Features

✅ **Anonymous Messaging** - Send messages without revealing your identity  
✅ **User Accounts** - Secure authentication system  
✅ **Referral Program** - Earn R10 per referral + R50 bonus for every 15 people  
✅ **Rewards System** - Track earnings and referral stats  
✅ **Customizable Theme** - Change primary color to your preference  
✅ **Message Inbox** - Receive and manage messages  
✅ **Account Management** - Change password, delete account, manage settings  
✅ **Contact Info** - Built-in contact links and social channels  
✅ **Responsive Design** - Works on all devices  

## Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript ES6+
- **Backend & Database:** Node/Express API with MongoDB Atlas (previously Firebase)
- **Deployment:** GitHub Pages (frontend) + any Node host (Heroku, Railway, etc.)

## Setup Instructions

(This project originally used Firebase for auth and data. The current version uses a self‑hosted Node/Express backend with MongoDB. If you have old Firebase instructions above, they can be ignored.)

### 3. Set up a MongoDB database

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign in or create an account.
2. Create a new **free cluster**.
3. In **Database Access**, add a user and note the username/password.
4. Under **Network Access** whitelist your local IP (or `0.0.0.0/0` for testing).
5. Click **Connect**, choose "Connect your application", and copy the connection string.
6. Create a new database called `anon-message-app` with two collections: `users` and `messages`.

### 4. Run the API server

1. Enter the `server` directory:
   ```bash
   cd server
   ```
2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` and set `MONGODB_URI` to the Atlas connection string, with user/password included.
   Also set `JWT_SECRET` to a long random string.
4. Install dependencies and start the server:
   ```bash
   npm install
   npm run dev      # or npm start for production
   ```
5. The API will listen on port 3000 by default. You can deploy this server to Heroku/Railway/Vercel, etc.

6. Update your frontend deployment (GitHub Pages etc.). The client now talks to the API endpoints instead of Firebase.

You can remove `firebase-config.js` once you're confident the migration is complete.

### 5. Frontend updates

The client now uses a simple API layer (`auth.js` and `app.js` handle the requests). The login/signup forms POST to `/api/auth/login` and `/api/auth/signup` respectively. Messages and user/profile data are fetched from `/api/messages` and `/api/users/:id`.

Since the backend handles authentication using JWTs, you no longer need any Firebase SDKs or config; those `<script>` tags were removed from the HTML files.

### 6. Deploy to GitHub Pages

1. Create a new GitHub repository: `anon-message-app`
2. Clone your repository locally
3. Copy all files to your local repo
4. Push to GitHub:
```bash
git add .
git commit -m "Initial commit - Anonymous Message App"
git push origin main
```

5. Go to repository **Settings** → **Pages**
6. Under "Source", select **main** branch
7. Click **Save**
8. Your app will be live at: `https://yourusername.github.io/anon-message-app/`

## Database Structure

Using MongoDB the collections look similar:

```json
// users collection document
{
  "_id": ObjectId,
  "username": "alice",
  "email": "alice@example.com",
  "password": "<bcrypt hash>",
  "createdAt": ISODate,
  "referralCode": "REF_...",
  "referralEarnings": 10,
  "referralCount": 0,
  "totalBonusRewards": 0,
  "referralActive": true,
  "isAdmin": false,
  "accountActive": true
}
```

```json
// messages collection document
{
  "_id": ObjectId,
  "from": "Anonymous"|
          "username of sender",
  "to": "recipientUsername",
  "text": "Hello there!",
  "timestamp": ISODate,
  "read": false
}
```

## How Referral System Works

1. **New User Signs Up:** Earns R10
2. **Using Referral Link:** Signer gets R10, referrer gets R10
3. **Bonus Rewards:** Every 15 people who sign up = R50 bonus
4. **Example:**
   - 1-14 people: R10 each = R140
   - 15+ people: Add R50 bonus = R190 total
   - 30+ people: Add another R50 = R240 total

## Features Explained

### 1. Landing Page
- Three options: Send Anonymous Message, Create Account, Login
- Anonymous messaging without account creation

### 2. Dashboard Navigation
- **Inbox:** View all received messages
- **My Profile:** See username, email, creation date, earnings
- **Settings:** Change password, theme color, delete account
- **Referral:** View referral link, stats, earn rewards
- **About Us:** Contact info and social links

### 3. Referral Program
- Generate unique referral link to share
- Regenerate link if needed
- Stop referral program anytime
- Track referral count and earnings

### 4. Theme Customization
- Pick any color for the app theme
- Changes apply immediately
- Saved to your account

### 5. Contact Information
- 📧 Email: silindelwasimelane@gmail.com
- 💬 WhatsApp: https://whatsapp.com/channel/0029Vb7bGEQIHphDP72VD81b

## File Structure

```
anon-message-app/
├── index.html              # Landing page (frontend)
├── auth.html               # Login/Signup page (frontend)
├── dashboard.html          # Main app dashboard (frontend)
├── styles.css              # All styling
├── auth.js                 # Authentication & API helper logic (frontend)
├── app.js                  # Dashboard & app logic (frontend)
├── server/                 # Node/Express API and MongoDB backend
├── .gitignore              # Git ignore file
└── README.md               # This file
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Security Notes

- ⚠️ FirebaseConfig is stored client-side (normal for Firebase apps)
- ⚠️ Enable Firebase Security Rules in production:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /messages/{messageId} {
      // By default this project allows creating anonymous messages.
      // If you want users who are NOT signed in to be able to send anonymous
      // messages, use the rule below. WARNING: this allows anyone (including
      // unauthenticated clients) to create documents in the `messages` collection.
      // Keep read permissions restricted as needed for privacy.
      allow create: if true;
      // Allow reads only for authenticated users (tweak as needed):
      allow read: if request.auth != null;
    }
  }
}
```

## Future Enhancements

- [ ] Email notifications for new messages
- [ ] Message reactions/emojis
- [ ] Message scheduling
- [ ] User blocking/muting
- [ ] Admin dashboard
- [ ] Payment integration for withdrawing earnings

## Support

For issues or questions:
- 📧 Email: silindelwasimelane@gmail.com
- 💬 WhatsApp: https://whatsapp.com/channel/0029Vb7bGEQIHphDP72VD81b

## License

Free to use and modify. Created with ❤️

---

**Made with HTML, CSS, JavaScript & MongoDB** 🚀
