// ⚠️ IMPORTANT: Replace these values with your Firebase project credentials
// 
// To get your Firebase config:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project called "anon-message-app"
// 3. Go to Project Settings (gear icon)
// 4. Copy your config from "Your apps" section
// 5. Replace the values below with YOUR config

const firebaseConfig = {
    apiKey: "AIzaSyCjMGPk5gzKxZooUy8Y0sLefCih3gJpvjY",
    authDomain: "anon-message-app.firebaseapp.com",
    projectId: "anon-message-app",
    storageBucket: "anon-message-app.appspot.com",
    messagingSenderId: "670237650919",
    appId: "1:670237650919:web:2ba1ffaa607c0738a25742",
    measurementId: "G-QW1589ZK38",
    databaseURL: "https://anon-message-app.firebaseio.com"
};

// BEFORE DEPLOYING:
// ✅ Enable Email/Password in Firebase Authentication
// ✅ Create Firestore Database (Start in test mode)
// ✅ Replace all YOUR_* values above with your actual Firebase config
// ✅ Never commit your real config to GitHub (add to .gitignore)

// Initialize Firebase
// Initialize Firebase (safe: only initialize once)
try {
    if (!firebase.apps || !firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        console.log('Firebase initialized successfully');
    } else {
        console.log('Firebase already initialized');
    }
} catch (error) {
    console.error('Firebase initialization error:', error);
    // Do not alert repeatedly in production; keep console info for debugging
}

// Get Firebase services (guard against missing firebase)
const auth = window.firebase?.auth ? firebase.auth() : null;
const db = window.firebase?.firestore ? firebase.firestore() : null;
const storage = window.firebase?.storage ? firebase.storage() : null;

// A promise that resolves when firebase services appear available.
// Other scripts can await `firebaseReadyPromise` before calling `db`.
let _resolveFirebaseReady;
const firebaseReadyPromise = new Promise(resolve => { _resolveFirebaseReady = resolve; });

function _checkFirebaseReady() {
    if (window.firebase && firebase.auth && firebase.firestore) {
        _resolveFirebaseReady();
    }
}

// Immediately check; also re-check after short delay to catch late loads
_checkFirebaseReady();
setTimeout(_checkFirebaseReady, 500);

// Expose the ready promise globally for other scripts to await
window.firebaseReadyPromise = firebaseReadyPromise;

// --- Query / localStorage helpers for referral and recipient codes ---
function getQueryParam(name) {
    try {
        return new URLSearchParams(window.location.search).get(name);
    } catch (e) {
        return null;
    }
}

function getStoredReferral() {
    return localStorage.getItem('referralCode') || null;
}

function setStoredReferral(code) {
    if (!code) return;
    localStorage.setItem('referralCode', String(code));
}

function getStoredRecipient() {
    return localStorage.getItem('recipientCode') || null;
}

function setStoredRecipient(code) {
    if (!code) return;
    localStorage.setItem('recipientCode', String(code));
}

// Prefill helpers for forms: call after DOM ready
function prefillReferralInput(selector) {
    const el = document.querySelector(selector);
    if (!el) return;
    const q = getQueryParam('ref');
    if (q) {
        el.value = q;
        setStoredReferral(q);
        return;
    }
    const s = getStoredReferral();
    if (s) el.value = s;
}

function prefillRecipientInputs(selector) {
    const el = document.querySelector(selector);
    if (!el) return;
    const s = getStoredRecipient();
    if (s) el.value = s;
}

window.refHelpers = {
    getQueryParam,
    getStoredReferral,
    setStoredReferral,
    getStoredRecipient,
    setStoredRecipient,
    prefillReferralInput,
    prefillRecipientInputs
};

// If a referral code is present in the URL, persist it to localStorage immediately
try {
    const qref = getQueryParam('ref');
    if (qref) setStoredReferral(qref);
} catch (e) {
    // ignore
}

// --- Ensure user document exists with safe defaults ---
async function ensureUserDoc(user) {
    if (!db || !user) return;
    try {
        const docRef = db.collection('users').doc(user.uid);
        const snap = await docRef.get();
        const now = firebase.firestore.FieldValue.serverTimestamp ? firebase.firestore.FieldValue.serverTimestamp() : new Date();
        // helper to pick a sensible username
        const deriveUsername = () => {
            if (user.displayName) return user.displayName;
            if (user.email) return user.email.split('@')[0];
            return 'user_' + user.uid.substring(0, 6);
        };

        if (!snap.exists) {
            const base = {
                username: deriveUsername(),
                email: user.email || null,
                createdAt: now,
                displayName: user.displayName || null,
                referralCode: getStoredReferral() || null,
                referralEarnings: 0,
                referralCount: 0,
                isAdmin: false,
                accountActive: true
            };
            await docRef.set(base);
            console.log('Created missing user doc for', user.uid);
        } else {
            // ensure required fields exist even if doc was coerced into existence earlier
            const data = snap.data() || {};
            const updates = {};
            if (!data.username) updates.username = deriveUsername();
            if (updates.username) {
                await docRef.update(updates);
                console.log('Updated user doc with missing fields for', user.uid, updates);
            }
        }
    } catch (err) {
        console.error('ensureUserDoc error:', err);
    }
}

window.ensureUserDoc = ensureUserDoc;

// Load user theme preference (waits for firebase to be ready)
async function loadUserTheme() {
    try {
        await window.firebaseReadyPromise;
        if (!auth || !db) return;
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        const doc = await db.collection('users').doc(userId).get();
        if (doc.exists && doc.data().themeColor) {
            document.documentElement.style.setProperty('--primary-color', doc.data().themeColor);
        }
    } catch (err) {
        console.error('Error loading theme:', err);
    }
}

// Check auth state on page load (wait for firebase to be ready first)
window.firebaseReadyPromise.then(() => {
    if (!auth) {
        console.warn('Auth not available after firebase ready');
        return;
    }
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            try {
                await ensureUserDoc(user);
            } catch (e) {
                console.error('ensureUserDoc failed during auth state change', e);
            }
            handleUserLoggedIn(user);
        } else {
            handleUserLoggedOut();
        }
    });
}).catch(err => console.error('firebaseReadyPromise rejected', err));

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
