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
- **Backend & Database:** Firebase (Firestore, Authentication, Storage)
- **Deployment:** GitHub Pages (Free Hosting)

## Setup Instructions

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `anon-message-app`
4. Click "Create project"

### 2. Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click **Get started**
3. Enable **Email/Password** sign-in method
4. Click **Save**

### 3. Create Firestore Database

1. Go to **Firestore Database**
2. Click **Create database**
3. Select **Start in test mode** (for development)
4. Choose location and click **Enable**

### 4. Get Firebase Config

1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps"
3. Click web icon `</>`
4. Copy the config code
5. Open `firebase-config.js` and replace:
```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",           // From config
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 5. Add Firebase SDK

Add this to your HTML files (already included):
```html
<script src="https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.6.11/firebase-auth.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.6.11/firebase-firestore.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.6.11/firebase-storage.js"></script>
```

Add these to `index.html`, `auth.html`, and `dashboard.html` before your script tags.

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

### Users Collection
```
users/{userId}
├── username: string
├── email: string
├── createdAt: timestamp
├── referralCode: string
├── referralEarnings: number (R10 per signup)
├── referredBy: string (referrer's code)
├── referralCount: number
├── totalBonusRewards: number (R50 per 15 people)
├── referralActive: boolean
├── themeColor: string
└── accountActive: boolean
```

### Messages Collection
```
messages/{messageId}
├── from: string ("Anonymous")
├── to: string (recipient username)
├── text: string
├── timestamp: timestamp
└── read: boolean
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
├── index.html              # Landing page
├── auth.html               # Login/Signup page
├── dashboard.html          # Main app dashboard
├── styles.css              # All styling
├── firebase-config.js      # Firebase configuration
├── auth.js                 # Authentication logic
├── app.js                  # Dashboard & app logic
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
      allow create: if request.auth != null;
      allow read: if request.auth.uid != null;
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

**Made with HTML, CSS, JavaScript & Firebase** 🚀
