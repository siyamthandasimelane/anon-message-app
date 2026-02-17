// ⚠️ IMPORTANT: Replace these values with your Firebase project credentials
// 
// To get your Firebase config:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project called "anon-message-app"
// 3. Go to Project Settings (gear icon)
// 4. Copy your config from "Your apps" section
// 5. Replace the values below with YOUR config

const firebaseConfig = {
    apiKey: "AIzaSyCjMGPk5gzKxZoOyU8Y0sLefCih3gJpvjY",
    authDomain: "anon-message-app.firebaseapp.com",
    projectId: "anon-message-app",
    storageBucket: "anon-message-app.firebasestorage.app",
    messagingSenderId: "670237650919",
    appId: "1:670237650919:web:2ba1ffaa607c0738a25742",
    measurementId: "G-QW1589ZK38"
};

// BEFORE DEPLOYING:
// ✅ Enable Email/Password in Firebase Authentication
// ✅ Create Firestore Database (Start in test mode)
// ✅ Replace all YOUR_* values above with your actual Firebase config
// ✅ Never commit your real config to GitHub (add to .gitignore)

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Firebase initialization error:', error);
    alert('⚠️ Firebase not configured! Please update firebase-config.js with your credentials.');
}

// Get Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Load user theme preference
function loadUserTheme() {
    const userId = auth.currentUser?.uid;
    if (userId) {
        db.collection('users').doc(userId).get().then(doc => {
            if (doc.exists && doc.data().themeColor) {
                document.documentElement.style.setProperty('--primary-color', doc.data().themeColor);
            }
        }).catch(error => {
            console.error('Error loading theme:', error);
        });
    }
}

// Check auth state on page load
auth.onAuthStateChanged(user => {
    if (user) {
        // User is logged in
        handleUserLoggedIn(user);
    } else {
        // User is not logged in
        handleUserLoggedOut();
    }
});

function handleUserLoggedIn(user) {
    console.log('User logged in:', user.email);
    // Load user theme
    loadUserTheme();
}

function handleUserLoggedOut() {
    // If on dashboard, redirect to home
    if (window.location.pathname.includes('dashboard.html')) {
        window.location.href = 'index.html';
    }
}
