# 🚀 Quick Start Guide - Anonymous Message App

## Step 1: Get Your Firebase Credentials (5 minutes)

1. Go to https://console.firebase.google.com/
2. Click **"Add project"** and name it `anon-message-app`
3. Click **"Create project"** and wait for it to complete
4. Click the **Web icon** (</>) under "Get started by adding Firebase to your app"
5. Copy the entire config object (looks like the one below):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "anon-message-app-xxxxx.firebaseapp.com",
  projectId: "anon-message-app-xxxxx",
  storageBucket: "anon-message-app-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};
```

6. Open `firebase-config.js` and replace the config (keep the other code)
7. Save the file

## Step 2: Enable Firebase Features

### Enable Email/Password Authentication:
1. In Firebase Console, go to **Authentication** (left sidebar)
2. Click **"Get started"**
3. Click **"Email/Password"**
4. Toggle **"Enable"** and click **Save**

### Create Firestore Database:
1. In Firebase Console, go to **Firestore Database** (left sidebar)
2. Click **"Create database"**
3. Select **"Start in test mode"** (for development)
4. Choose your region and click **"Enable"**

✅ **You're done with Firebase setup!**

## Step 3: Deploy to GitHub Pages (5 minutes)

### If you have Git installed:

1. Create a new folder on your computer:
   ```
   mkdir anon-message-app
   cd anon-message-app
   ```

2. Copy all your files into this folder

3. Initialize Git and upload to GitHub:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/anon-message-app.git
   git push -u origin main
   ```

4. Go to your GitHub repository
5. Click **Settings** → **Pages**
6. Under "Source", select **main** branch
7. Click **Save**

✅ **Your app is now live at:** `https://YOUR_USERNAME.github.io/anon-message-app/`

### If you don't have Git:
1. Create a repository on GitHub
2. Use GitHub's web interface to upload files
3. Enable GitHub Pages in Settings

## Step 4: Test Your App

1. Open your app URL: `https://YOUR_USERNAME.github.io/anon-message-app/`
2. Click **"Create Account"**
3. Sign up with an email and password
4. Explore the dashboard!

## How to Use

### For Users:
- **Send Message:** Click "Send Anonymous Message" on home page
- **Create Account:** Sign up with email and password
- **View Messages:** Check your Inbox in the dashboard
- **Earn Money:** Share your referral link with friends
- **Settings:** Change password, theme color, delete account

### For Admins/Developers:
- **Firebase Firestore:** View all users and messages
- **Firebase Auth:** Manage user accounts
- **Deploy Updates:** Make changes, commit, and push to GitHub

## Important Security Notes

⚠️ **In Test Mode (Development):**
- Anyone can read/write data
- Fine for testing and development

✅ **For Production:**
1. Set up proper Firestore Rules:
   - Go to Firestore → Rules
   - Replace with secure rules (see README.md)

2. Configure Firebase Security Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /messages/{messageId} {
      allow create: if request.auth != null;
      allow read: if request.auth.uid != null;
    }
  }
}
```

## Troubleshooting

### "Firebase not configured" error?
- Check that you properly updated `firebase-config.js`
- Make sure you copied the entire config object
- Check browser console (F12) for specific error

### Can't sign up?
- Make sure Authentication is enabled in Firebase
- Check that email/password auth is turned on

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
