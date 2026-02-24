// Main App Logic for Dashboard

// Page Navigation
function showPage(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    // Show selected page
    const selectedPage = document.getElementById(pageId + '-page');
    if (selectedPage) {
        selectedPage.classList.add('active');
    }
    
    // Load page specific data
    if (pageId === 'inbox') {
        loadMessages();
    } else if (pageId === 'profile') {
        loadProfile();
    } else if (pageId === 'referral') {
        loadReferralData();
    }
}

// Load Messages
async function loadMessages() {
    if (!auth.currentUser) return;
    console.log('loadMessages invoked');
    
    const userId = auth.currentUser.uid;
    const messagesList = document.getElementById('messages-list');
    
    try {
        // Get user's username (fall back if field missing)
        const userDoc = await db.collection('users').doc(userId).get();
        let username;
        if (userDoc.exists && userDoc.data()) {
            username = userDoc.data().username || auth.currentUser.displayName || (auth.currentUser.email ? auth.currentUser.email.split('@')[0] : null);
        } else {
            console.warn('User document not found for', userId);
            username = auth.currentUser.displayName || (auth.currentUser.email ? auth.currentUser.email.split('@')[0] : null);
        }

        if (!username) {
            messagesList.innerHTML = '<p style="text-align:center;color:#999;">No username found for your account. Please complete your profile or contact support.</p>';
            return;
        }
        
        // Get messages sent to this user
        const messagesQuery = await db.collection('messages')
            .where('to', '==', username)
            .orderBy('timestamp', 'desc')
            .get();
        
        if (messagesQuery.empty) {
            messagesList.innerHTML = '<p style="text-align: center; color: #999;">No messages yet. Share your username or recipient code with others!</p>';
            return;
        }
        
        messagesList.innerHTML = '';
        messagesQuery.forEach(doc => {
            const message = doc.data();
            const messageCard = document.createElement('div');
            messageCard.className = 'message-card' + (message.read ? '' : ' unread');
            
            // Robust timestamp handling: Firestore Timestamp or JS Date or undefined
            let dateObj;
            try {
                if (message.timestamp && typeof message.timestamp.toDate === 'function') {
                    dateObj = message.timestamp.toDate();
                } else if (message.timestamp) {
                    dateObj = new Date(message.timestamp);
                } else {
                    dateObj = new Date();
                }
            } catch (err) {
                dateObj = new Date();
            }
            const formattedDate = dateObj.toLocaleString();
            
            messageCard.innerHTML = `
                <p><strong>From:</strong> ${message.from}</p>
                <p><strong>Message:</strong> ${message.text}</p>
                <p class="message-time">${formattedDate}</p>
            `;
            
            messagesList.appendChild(messageCard);
            
            // Mark as read
            if (!message.read) {
                db.collection('messages').doc(doc.id).update({ read: true });
            }
        });
    } catch (error) {
        console.error('Error loading messages:', error);
        const messageText = (error && error.message) ? error.message : 'Unknown error';
        // If the client is offline, show offline banner and a retry button
        if (!navigator.onLine || String(messageText).toLowerCase().includes('client is offline')) {
            showOfflineBanner(true, 'You appear to be offline. Check your internet connection and retry.');
            messagesList.innerHTML = '<p style="color: #b91c1c;">You are offline. Connect to the internet and click Retry.</p>';
        } else {
            messagesList.innerHTML = `<p style="color: red;">Error loading messages: ${messageText}</p>`;
        }
    }
}

function showOfflineBanner(show, text) {
    const banner = document.getElementById('offline-banner');
    if (!banner) return;
    if (show) {
        banner.style.display = 'block';
        if (text) banner.firstChild && (banner.firstChild.nodeValue = '');
        // set message inside banner (replace entire content)
        banner.innerHTML = `${text || 'You appear to be offline.'} <button class="btn btn-primary" onclick="retryLoadMessages()">Retry</button>`;
    } else {
        banner.style.display = 'none';
    }
}

function retryLoadMessages() {
    showOfflineBanner(false);
    loadMessages();
}

// Ensure a Firestore user document exists for signed-in users
async function ensureUserDoc(user) {
    if (!user) return;
    const userId = user.uid;
    const userRef = db.collection('users').doc(userId);
    try {
        const doc = await userRef.get();
        if (!doc.exists) {
            const username = user.displayName || (user.email ? user.email.split('@')[0] : ('user_' + userId.substring(0,6)));
            const newReferralCode = generateReferralCode(userId);
            await userRef.set({
                username: username,
                email: user.email || null,
                createdAt: new Date(),
                referralCode: newReferralCode,
                referralEarnings: 0,
                isAdmin: false,
                referredBy: null,
                referralCount: 0,
                totalBonusRewards: 0,
                referralActive: true,
                themeColor: '#6366f1',
                accountActive: true
            });
            console.log('Created missing user doc for', userId);
        }
    } catch (err) {
        console.error('Error ensuring user doc:', err);
    }
}

// Load Profile
async function loadProfile() {
    if (!auth.currentUser) return;
    
    const userId = auth.currentUser.uid;
    
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        
        document.getElementById('profile-username').textContent = userData.username;
        document.getElementById('profile-email').textContent = userData.email;
        document.getElementById('profile-earnings').textContent = userData.referralEarnings || 0;
        
        const createdDate = new Date(userData.createdAt.toDate());
        document.getElementById('profile-created').textContent = createdDate.toLocaleDateString();
        // set theme color control value to saved color
        const themeInput = document.getElementById('theme-color');
        if (themeInput && userData.themeColor) themeInput.value = userData.themeColor;
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

// Load Referral Data
async function loadReferralData() {
    if (!auth.currentUser) return;

    const userId = auth.currentUser.uid;

    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            console.warn('Referral data requested but user doc missing:', userId);
            return;
        }
        const userData = userDoc.data() || {};

        // create a safe default for referralCode
        const code = userData.referralCode || auth.currentUser.displayName || (auth.currentUser.email ? auth.currentUser.email.split('@')[0] : '');

        // Create referral link
        const baseUrl = window.location.origin + window.location.pathname.replace('dashboard.html', 'auth.html');
        const referralLink = baseUrl + '?mode=signup&ref=' + code;

        document.getElementById('referral-link').value = referralLink;
        // show recipient code (same as referralCode) for receiving messages
        const recipientEl = document.getElementById('recipient-code-display');
        if (recipientEl) recipientEl.value = code;
        document.getElementById('referral-count').textContent = userData.referralCount || 0;
        document.getElementById('referral-earnings').textContent = userData.referralEarnings || 0;
        document.getElementById('bonus-rewards').textContent = userData.totalBonusRewards || 0;
    } catch (error) {
        console.error('Error loading referral data:', error);
    }
}

// Copy Referral Link
function copyReferralLink() {
    const referralLink = document.getElementById('referral-link');
    referralLink.select();
    document.execCommand('copy');
    alert('Referral link copied to clipboard!');
}

// Regenerate Referral Link
async function regenerateReferralLink() {
    if (!confirm('Generate a new referral link? Your old link will stop working.')) return;
    
    if (!auth.currentUser) return;
    
    const userId = auth.currentUser.uid;
    const newCode = generateReferralCode(userId);
    
    try {
        await db.collection('users').doc(userId).update({
            referralCode: newCode
        });
        alert('New referral link generated!');
        loadReferralData();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Stop Referral Program
async function stopReferralProgram() {
    if (!confirm('Stop your referral program? You can restart it later.')) return;
    
    if (!auth.currentUser) return;
    
    const userId = auth.currentUser.uid;
    
    try {
        await db.collection('users').doc(userId).update({
            referralActive: false
        });
        alert('Referral program stopped');
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Copy recipient code to clipboard
function copyRecipientCode() {
    const el = document.getElementById('recipient-code-display');
    if (!el) return;
    el.select();
    document.execCommand('copy');
    alert('Recipient code copied to clipboard!');
}

// Change Password
if (document.getElementById('change-password-form')) {
    document.getElementById('change-password-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (newPassword !== confirmPassword) {
            alert('New passwords do not match');
            return;
        }
        
        if (newPassword.length < 6) {
            alert('New password must be at least 6 characters');
            return;
        }
        
        try {
            const user = auth.currentUser;
            const email = user.email;
            
            // Re-authenticate user
            const credential = firebase.auth.EmailAuthProvider.credential(email, currentPassword);
            await user.reauthenticateWithCredential(credential);
            
            // Update password
            await user.updatePassword(newPassword);
            alert('Password updated successfully!');
            document.getElementById('change-password-form').reset();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });
}

// Apply Theme Color
function applyTheme() {
    if (!auth.currentUser) return;
    
    const userId = auth.currentUser.uid;
    const themeColor = document.getElementById('theme-color').value;
    
    try {
        db.collection('users').doc(userId).update({
            themeColor: themeColor
        });
        
        // Apply theme immediately
        document.documentElement.style.setProperty('--primary-color', themeColor);
        alert('Theme color updated!');
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Delete Account
async function deleteAccount() {
    const password = prompt('Enter your password to confirm account deletion:');
    if (!password) return;
    
    if (!confirm('Are you sure? This action cannot be undone.')) return;
    
    try {
        const user = auth.currentUser;
        const email = user.email;
        
        // Re-authenticate user
        const credential = firebase.auth.EmailAuthProvider.credential(email, password);
        await user.reauthenticateWithCredential(credential);
        
        // Delete user data from Firestore
        const userId = user.uid;
        await db.collection('users').doc(userId).update({
            accountActive: false,
            deletedAt: new Date()
        });
        
        // Delete user from Firebase Auth
        await user.delete();
        
        alert('Account deleted successfully');
        window.location.href = 'index.html';
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Logout
function logout() {
    auth.signOut().then(() => {
        console.log('User logged out');
        window.location.href = 'index.html';
    }).catch(error => {
        alert('Error logging out: ' + error.message);
    });
}

// Check if user is logged in on dashboard
if (window.location.pathname.includes('dashboard.html')) {
    auth.onAuthStateChanged(async user => {
        if (!user) {
            window.location.href = 'index.html';
        } else {
            // Ensure Firestore user doc exists, then load UI
            await ensureUserDoc(user);
            // Load theme on page load
            loadUserTheme();
            // Show inbox by default
            showPage('inbox');
        }
    });
}

// Generate referral code (utility function)
function generateReferralCode(userId) {
    return 'REF_' + userId.substring(0, 8).toUpperCase() + '_' + Math.random().toString(36).substr(2, 5).toUpperCase();
}
