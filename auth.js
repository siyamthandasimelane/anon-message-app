// Authentication Logic

function toggleForm() {
    const loginForm = document.getElementById('login-form-container');
    const signupForm = document.getElementById('signup-form-container');
    
    loginForm.classList.toggle('active');
    signupForm.classList.toggle('active');
}

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

// Handle URL parameters for auto-selecting form
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const ref = urlParams.get('ref');
    // If referral code present in URL, prefill signup field
    if (ref && document.getElementById('referral-code')) {
        document.getElementById('referral-code').value = ref;
    }
    
    if (mode === 'signup' && document.getElementById('signup-form-container')) {
        toggleForm(); // Switch to signup if coming from landing page
    }
});

// Login Form Handler
if (document.getElementById('login-form')) {
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        try {
            const data = await api('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = 'dashboard.html';
        } catch (error) {
            alert('Login failed: ' + error.message);
        }
    });
}

// Signup Form Handler
if (document.getElementById('signup-form')) {
    document.getElementById('signup-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('signup-username').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const referralCode = document.getElementById('referral-code').value;
        
        // Validate password length
        if (password.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }
        
        try {
            const data = await api('/api/auth/signup', {
                method: 'POST',
                body: JSON.stringify({ username, email, password, referralCode })
            });
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            alert('Account created successfully! You earned R10');
            window.location.href = 'dashboard.html';
        } catch (error) {
            alert('Signup failed: ' + error.message);
        }
    });
}

// Generate unique referral code
function generateReferralCode(userId) {
    return 'REF_' + userId.substring(0, 8).toUpperCase() + '_' + Math.random().toString(36).substr(2, 5).toUpperCase();
}
