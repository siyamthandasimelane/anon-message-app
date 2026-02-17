// Authentication Logic

function toggleForm() {
    const loginForm = document.getElementById('login-form-container');
    const signupForm = document.getElementById('signup-form-container');
    
    loginForm.classList.toggle('active');
    signupForm.classList.toggle('active');
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
            const result = await auth.signInWithEmailAndPassword(email, password);
            console.log('Login successful');
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
            // Check if username already exists
            const userQuery = await db.collection('users').where('username', '==', username).get();
            if (!userQuery.empty) {
                alert('Username already taken');
                return;
            }
            
            // Create user
            const result = await auth.createUserWithEmailAndPassword(email, password);
            const userId = result.user.uid;
            
            // Generate referral code for new user
            const newReferralCode = generateReferralCode(userId);
            
            // Store user data in Firestore
            await db.collection('users').doc(userId).set({
                username: username,
                email: email,
                createdAt: new Date(),
                referralCode: newReferralCode,
                referralEarnings: 10, // User gets R10 for signing up
                isAdmin: false,
                referredBy: referralCode || null,
                referralCount: 0,
                totalBonusRewards: 0,
                referralActive: true,
                themeColor: '#6366f1',
                accountActive: true
            });
            
            // If they used a referral code, update referrer's earnings
            if (referralCode) {
                const referrerQuery = await db.collection('users').where('referralCode', '==', referralCode).get();
                if (!referrerQuery.empty) {
                    const referrer = referrerQuery.docs[0];
                    const referrerData = referrer.data();
                    const newCount = (referrerData.referralCount || 0) + 1;
                    const newEarnings = (referrerData.referralEarnings || 0) + 10;
                    
                    // Calculate bonus rewards (R50 for every 15 people)
                    const bonusRewards = Math.floor(newCount / 15) * 50;
                    
                    await db.collection('users').doc(referrer.id).update({
                        referralCount: newCount,
                        referralEarnings: newEarnings,
                        totalBonusRewards: bonusRewards
                    });
                }
            }
            
            // Ensure the Firebase user state is fully updated before redirecting
            try {
                if (result.user && result.user.reload) await result.user.reload();
            } catch (e) {
                console.warn('Could not reload user immediately:', e.message || e);
            }

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
