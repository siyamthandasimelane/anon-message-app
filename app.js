// Main App Logic for Dashboard

// simple API helper that attaches the JWT token
async function api(path, options = {}) {
    const token = localStorage.getItem('token');
    const headers = options.headers || {};
    headers['Content-Type'] = 'application/json';
    if (token) headers['Authorization'] = 'Bearer ' + token;
    options.headers = headers;

    const res = await fetch(path, options);
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || res.statusText);
    }
    return res.json();
}

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
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user || !user.username) return;
    console.log('loadMessages invoked');
    
    const username = user.username;
    const messagesList = document.getElementById('messages-list');

    try {
        const messages = await api(`/api/messages?to=${encodeURIComponent(username)}`);
        if (!messages || messages.length === 0) {
            messagesList.innerHTML = '<p style="text-align: center; color: #999;">No messages yet. Share your username or recipient code with others!</p>';
            return;
        }
        messagesList.innerHTML = '';
        messages.forEach(message => {
            const messageCard = document.createElement('div');
            messageCard.className = 'message-card' + (message.read ? '' : ' unread');

            const dateObj = new Date(message.timestamp);
            const formattedDate = dateObj.toLocaleString();

            messageCard.innerHTML = `
                <p><strong>From:</strong> ${message.from}</p>
                <p><strong>Message:</strong> ${message.text}</p>
                <p class="message-time">${formattedDate}</p>
            `;
            messagesList.appendChild(messageCard);
        });
    } catch (error) {
        console.error('Error loading messages:', error);
        messagesList.innerHTML = `<p style="color: red;">Error loading messages: ${error.message}</p>`;
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


// Load Profile
async function loadProfile() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user || !user.id) return;
    try {
        const userData = await api(`/api/users/${user.id}`);
        document.getElementById('profile-username').textContent = userData.username;
        document.getElementById('profile-email').textContent = userData.email;
        document.getElementById('profile-earnings').textContent = userData.referralEarnings || 0;
        const createdDate = new Date(userData.createdAt);
        document.getElementById('profile-created').textContent = createdDate.toLocaleDateString();
        const themeInput = document.getElementById('theme-color');
        if (themeInput && userData.themeColor) themeInput.value = userData.themeColor;
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

// Load Referral Data
async function loadReferralData() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user || !user.id) return;

    try {
        const userData = await api(`/api/users/${user.id}`);
        const code = userData.referralCode || user.username || '';

        const baseUrl = window.location.origin + window.location.pathname.replace('dashboard.html', 'auth.html');
        const referralLink = baseUrl + '?mode=signup&ref=' + code;

        document.getElementById('referral-link').value = referralLink;
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
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user || !user.id) return;
    const newCode = generateReferralCode(user.id);
    try {
        await api(`/api/users/${user.id}`, {
            method: 'PUT',
            body: JSON.stringify({ referralCode: newCode })
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
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user || !user.id) return;
    try {
        await api(`/api/users/${user.id}`, {
            method: 'PUT',
            body: JSON.stringify({ referralActive: false })
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

// Change Password (calls API)
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
            await api('/api/auth/change-password', {
                method: 'POST',
                body: JSON.stringify({ currentPassword, newPassword })
            });
            alert('Password updated successfully!');
            document.getElementById('change-password-form').reset();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });
}

// Apply Theme Color
async function applyTheme() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user || !user.id) return;
    const themeColor = document.getElementById('theme-color').value;
    try {
        await api(`/api/users/${user.id}`, {
            method: 'PUT',
            body: JSON.stringify({ themeColor })
        });
        document.documentElement.style.setProperty('--primary-color', themeColor);
        alert('Theme color updated!');
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Delete Account
async function deleteAccount() {
    if (!confirm('Are you sure? This action cannot be undone.')) return;
    try {
        await api('/api/auth/delete-account', { method: 'POST' });
        localStorage.clear();
        alert('Account deleted successfully');
        window.location.href = 'index.html';
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Logout
function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}

// load the user's preferred theme color from the backend
async function loadUserTheme() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user || !user.id) return;
    try {
        const data = await api(`/api/users/${user.id}`);
        if (data.themeColor) {
            document.documentElement.style.setProperty('--primary-color', data.themeColor);
        }
    } catch (err) {
        console.error('Error loading theme:', err);
    }
}

// simple login check using token and redirect
if (window.location.pathname.includes('dashboard.html')) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
    } else {
        loadUserTheme();
        showPage('inbox');
    }
}

// Generate referral code (utility function)
function generateReferralCode(userId) {
    return 'REF_' + userId.substring(0, 8).toUpperCase() + '_' + Math.random().toString(36).substr(2, 5).toUpperCase();
}
