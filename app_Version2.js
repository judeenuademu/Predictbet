// ============================================
// PredictBet - Betting Platform Application
// ============================================

// State Management
const appState = {
    currentUser: null,
    users: [],
    predictions: [],
    bets: [],
    notifications: []
};

// ============================================
// Data Storage (Simulated Backend)
// ============================================

function initializeApp() {
    loadDataFromStorage();
    checkAuthStatus();
    renderApp();
}

function loadDataFromStorage() {
    const stored = localStorage.getItem('predictBetData');
    if (stored) {
        const data = JSON.parse(stored);
        appState.users = data.users || [];
        appState.predictions = data.predictions || [];
        appState.bets = data.bets || [];
    } else {
        // Initialize with demo data
        initializeDemoData();
    }
}

function savDataToStorage() {
    localStorage.setItem('predictBetData', JSON.stringify({
        users: appState.users,
        predictions: appState.predictions,
        bets: appState.bets
    }));
}

function initializeDemoData() {
    // Demo users
    appState.users = [
        {
            id: 1,
            username: 'Admin',
            email: 'admin@example.com',
            password: 'admin123',
            balance: 10000,
            isAdmin: true,
            createdAt: new Date().toISOString()
        },
        {
            id: 2,
            username: 'JohnDoe',
            email: 'john@example.com',
            password: 'user123',
            balance: 5000,
            isAdmin: false,
            createdAt: new Date().toISOString()
        },
        {
            id: 3,
            username: 'JaneSmith',
            email: 'jane@example.com',
            password: 'user123',
            balance: 7500,
            isAdmin: false,
            createdAt: new Date().toISOString()
        }
    ];

    // Demo predictions
    appState.predictions = [
        {
            id: 1,
            title: 'Manchester United vs Liverpool',
            sport: 'Football',
            status: 'open',
            options: [
                { name: 'Manchester United', odds: 1.95 },
                { name: 'Draw', odds: 3.20 },
                { name: 'Liverpool', odds: 1.85 }
            ],
            closesAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString()
        },
        {
            id: 2,
            title: 'Lakers vs Celtics',
            sport: 'Basketball',
            status: 'open',
            options: [
                { name: 'Lakers', odds: 2.10 },
                { name: 'Celtics', odds: 1.75 }
            ],
            closesAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString()
        },
        {
            id: 3,
            title: 'Crypto Price BTC Over $50k',
            sport: 'Crypto',
            status: 'open',
            options: [
                { name: 'Yes', odds: 1.50 },
                { name: 'No', odds: 2.50 }
            ],
            closesAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString()
        }
    ];

    // Demo bets
    appState.bets = [
        {
            id: 1,
            userId: 2,
            predictionId: 1,
            option: 'Manchester United',
            amount: 100,
            odds: 1.95,
            potentialWinnings: 195,
            status: 'pending',
            placedAt: new Date().toISOString()
        },
        {
            id: 2,
            userId: 3,
            predictionId: 2,
            option: 'Celtics',
            amount: 150,
            odds: 1.75,
            potentialWinnings: 262.5,
            status: 'pending',
            placedAt: new Date().toISOString()
        }
    ];

    saveDataToStorage();
}

// ============================================
// Authentication
// ============================================

function checkAuthStatus() {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
        appState.currentUser = JSON.parse(stored);
    }
}

function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const user = appState.users.find(u => u.email === email && u.password === password);

    if (user) {
        appState.currentUser = { ...user };
        localStorage.setItem('currentUser', JSON.stringify(appState.currentUser));
        closeAuthModal();
        showNotification('Login successful!', 'success');
        renderApp();
    } else {
        showNotification('Invalid email or password', 'error');
    }
}

function handleSignup(event) {
    event.preventDefault();
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupConfirm').value;

    // Validation
    if (password !== confirm) {
        showNotification('Passwords do not match', 'error');
        return;
    }

    if (appState.users.some(u => u.email === email)) {
        showNotification('Email already registered', 'error');
        return;
    }

    // Create new user
    const newUser = {
        id: appState.users.length + 1,
        username,
        email,
        password,
        balance: 1000, // Starting balance
        isAdmin: false,
        createdAt: new Date().toISOString()
    };

    appState.users.push(newUser);
    saveDataToStorage();
    showNotification('Account created successfully! You can now login.', 'success');
    switchAuthTab('login');
    document.getElementById('loginEmail').value = email;
}

function handleLogout() {
    appState.currentUser = null;
    localStorage.removeItem('currentUser');
    renderApp();
    showNotification('Logged out successfully', 'success');
}

// ============================================
// Betting Logic
// ============================================

function placeBet(predictionId, option, amount) {
    if (!appState.currentUser) {
        showAuthModal();
        return;
    }

    const amountNum = parseFloat(amount);

    if (amountNum <= 0) {
        showNotification('Bet amount must be greater than 0', 'error');
        return;
    }

    if (amountNum > appState.currentUser.balance) {
        showNotification('Insufficient balance', 'error');
        return;
    }

    const prediction = appState.predictions.find(p => p.id === predictionId);
    const selectedOption = prediction.options.find(o => o.name === option);

    if (!selectedOption) {
        showNotification('Invalid option selected', 'error');
        return;
    }

    // Deduct bet amount from balance
    const userIndex = appState.users.findIndex(u => u.id === appState.currentUser.id);
    appState.users[userIndex].balance -= amountNum;
    appState.currentUser.balance -= amountNum;

    // Create bet record
    const newBet = {
        id: appState.bets.length + 1,
        userId: appState.currentUser.id,
        predictionId,
        option,
        amount: amountNum,
        odds: selectedOption.odds,
        potentialWinnings: amountNum * selectedOption.odds,
        status: 'pending',
        placedAt: new Date().toISOString()
    };

    appState.bets.push(newBet);
    saveDataToStorage();

    // Update UI
    localStorage.setItem('currentUser', JSON.stringify(appState.currentUser));
    showNotification(`Bet placed! Potential winnings: $${(newBet.potentialWinnings).toFixed(2)}`, 'success');
    renderApp();
}

function getUserBets(userId) {
    return appState.bets.filter(b => b.userId === userId);
}

// ============================================
// Leaderboard
// ============================================

function getLeaderboard() {
    return appState.users
        .filter(u => !u.isAdmin)
        .map(u => ({
            ...u,
            totalBets: getUserBets(u.id).length,
            potentialWinnings: getUserBets(u.id).reduce((sum, b) => sum + (b.status === 'pending' ? b.potentialWinnings : 0), 0)
        }))
        .sort((a, b) => b.balance - a.balance);
}

// ============================================
// Admin Functions
// ============================================

function updateUserBalance(userId, newBalance) {
    const userIndex = appState.users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        appState.users[userIndex].balance = parseFloat(newBalance);
        
        // Update current user if it's the logged-in user
        if (appState.currentUser && appState.currentUser.id === userId) {
            appState.currentUser.balance = parseFloat(newBalance);
            localStorage.setItem('currentUser', JSON.stringify(appState.currentUser));
        }

        saveDataToStorage();
        showNotification('User balance updated successfully', 'success');
        renderApp();
    }
}

function createPrediction(title, options, odds) {
    const optionsArray = options.map(opt => ({
        name: opt,
        odds: parseFloat(odds[options.indexOf(opt)])
    }));

    const newPrediction = {
        id: appState.predictions.length + 1,
        title,
        sport: 'Mixed',
        status: 'open',
        options: optionsArray,
        closesAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
    };

    appState.predictions.push(newPrediction);
    saveDataToStorage();
    showNotification('Prediction created successfully', 'success');
}

function updatePredictionStatus(predictionId, status) {
    const prediction = appState.predictions.find(p => p.id === predictionId);
    if (prediction) {
        prediction.status = status;
        saveDataToStorage();
        showNotification('Prediction status updated', 'success');
        renderApp();
    }
}

// ============================================
// UI Rendering
// ============================================

function renderApp() {
    const appDiv = document.getElementById('app');

    if (!appState.currentUser) {
        appDiv.innerHTML = `
            <div class="navbar">
                <div class="navbar-brand">🎯 PredictBet</div>
                <div class="navbar-links">
                    <span onclick="showAuthModal()">Login / Sign Up</span>
                </div>
            </div>
            <div class="container">
                <div class="header">
                    <h1>Welcome to PredictBet</h1>
                    <p>Make accurate predictions and win big!</p>
                    <button class="btn btn-primary" onclick="showAuthModal()" style="margin-top: 1rem;">Get Started</button>
                </div>
                <div style="text-align: center; color: var(--text-secondary); margin-top: 3rem;">
                    <p style="font-size: 0.9rem; margin: 1rem 0;">Try the demo account:</p>
                    <p style="font-family: monospace; background: rgba(0,212,255,0.1); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color);">
                        Email: admin@example.com<br>
                        Password: admin123
                    </p>
                </div>
            </div>
        `;
        return;
    }

    const leaderboard = getLeaderboard();
    const userBets = getUserBets(appState.currentUser.id);

    appDiv.innerHTML = `
        <div class="navbar">
            <div class="navbar-brand">🎯 PredictBet</div>
            <div class="navbar-links">
                <span>Welcome, ${appState.currentUser.username}</span>
                ${appState.currentUser.isAdmin ? `<span onclick="showAdminModal()">🛡️ Admin Panel</span>` : ''}
                <span onclick="handleLogout()">Logout</span>
            </div>
        </div>

        <div class="container">
            <div class="header">
                <h1>Active Predictions</h1>
                <p>Select a prediction and place your bet</p>
            </div>

            <div class="main-grid">
                <div class="predictions-section" id="predictionsContainer"></div>
                <div class="sidebar">
                    <div class="sidebar-card">
                        <h3>💰 Your Balance</h3>
                        <div class="balance-display">$${appState.currentUser.balance.toFixed(2)}</div>
                        <div class="user-info">Username: ${appState.currentUser.username}</div>
                        <div class="user-info">Active Bets: ${userBets.length}</div>
                    </div>

                    <div class="sidebar-card">
                        <h3>📊 Your Bets</h3>
                        <div id="userBetsContainer"></div>
                    </div>

                    <div class="sidebar-card">
                        <h3>🏆 Leaderboard</h3>
                        <table class="leaderboard-table">
                            <tr>
                                <th>Rank</th>
                                <th>User</th>
                                <th>Balance</th>
                            </tr>
                            ${leaderboard.slice(0, 5).map((user, idx) => `
                                <tr>
                                    <td class="rank ${idx === 0 ? 'first' : idx === 1 ? 'second' : idx === 2 ? 'third' : ''}">
                                        ${idx + 1}${idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : ''}
                                    </td>
                                    <td>${user.username}</td>
                                    <td class="balance-cell">$${user.balance.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Render predictions
    const predictionsContainer = document.getElementById('predictionsContainer');
    predictionsContainer.innerHTML = appState.predictions
        .filter(p => p.status === 'open')
        .map(prediction => `
            <div class="prediction-card">
                <div class="prediction-header">
                    <div class="prediction-title">${prediction.title}</div>
                    <div class="prediction-status ${prediction.status}">${prediction.status.toUpperCase()}</div>
                </div>
                <div class="prediction-options">
                    ${prediction.options.map(option => `
                        <div class="option-item">
                            <span class="option-name">${option.name}</span>
                            <span class="option-odds">${option.odds.toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="prediction-footer">
                    <div class="prediction-amount">
                        <input type="number" 
                               id="bet-${prediction.id}" 
                               placeholder="Bet amount" 
                               min="1" 
                               step="0.01"
                               value="10">
                    </div>
                    <select id="option-${prediction.id}" style="padding: 0.5rem; background: rgba(255,255,255,0.1); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary);">
                        ${prediction.options.map(opt => `<option value="${opt.name}">${opt.name}</option>`).join('')}
                    </select>
                    <button class="btn btn-primary btn-small" 
                            onclick="placeBet(${prediction.id}, document.getElementById('option-${prediction.id}').value, document.getElementById('bet-${prediction.id}').value)">
                        BET
                    </button>
                </div>
            </div>
        `).join('');

    // Render user bets
    const userBetsContainer = document.getElementById('userBetsContainer');
    if (userBets.length > 0) {
        userBetsContainer.innerHTML = userBets.map(bet => {
            const prediction = appState.predictions.find(p => p.id === bet.predictionId);
            return `
                <div style="font-size: 0.85rem; margin-bottom: 1rem; padding: 0.8rem; background: rgba(255,255,255,0.05); border-radius: 6px;">
                    <div style="color: var(--primary-color); font-weight: 600; margin-bottom: 0.3rem;">${prediction.title}</div>
                    <div style="color: var(--text-secondary);">On: ${bet.option}</div>
                    <div style="color: var(--success-color); font-weight: 600;">$${bet.potentialWinnings.toFixed(2)}</div>
                </div>
            `;
        }).join('');
    } else {
        userBetsContainer.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.9rem;">No bets placed yet</p>';
    }
}

// ============================================
// Admin Panel
// ============================================

function showAdminModal() {
    if (!appState.currentUser?.isAdmin) {
        showNotification('Access denied', 'error');
        return;
    }

    const modal = document.getElementById('adminModal');
    modal.classList.add('active');

    // Load users
    const userSelect = document.getElementById('userSelect');
    userSelect.innerHTML = '<option value="">Select a user...</option>' +
        appState.users
            .filter(u => !u.isAdmin)
            .map(u => `<option value="${u.id}">${u.username} - $${u.balance.toFixed(2)}</option>`)
            .join('');

    // Load users list
    loadUsersList();
    loadPredictionsList();
}

function loadUsersList() {
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = appState.users
        .filter(u => !u.isAdmin)
        .map(u => `
            <div class="user-item">
                <div>
                    <div class="user-name">${u.username}</div>
                    <div class="user-balance">${u.email}</div>
                </div>
                <div class="user-balance">$${u.balance.toFixed(2)}</div>
            </div>
        `).join('');
}

function loadUserData() {
    const userSelect = document.getElementById('userSelect');
    const userId = parseInt(userSelect.value);
    const user = appState.users.find(u => u.id === userId);
    if (user) {
        document.getElementById('balanceInput').value = user.balance;
    }
}

function updateUserBalance() {
    const userSelect = document.getElementById('userSelect');
    const balanceInput = document.getElementById('balanceInput');
    const userId = parseInt(userSelect.value);
    const newBalance = parseFloat(balanceInput.value);

    if (!userId || isNaN(newBalance)) {
        showNotification('Please select a user and enter a balance', 'error');
        return;
    }

    updateUserBalance(userId, newBalance);
    loadUsersList();
}

function createPrediction() {
    const title = document.getElementById('predictionTitle').value;
    const outcome = document.getElementById('predictionOutcome').value;
    const odds = parseFloat(document.getElementById('predictionOdds').value);

    if (!title || !outcome || isNaN(odds)) {
        showNotification('Please fill all fields', 'error');
        return;
    }

    const oppositeOdds = (3 - odds).toFixed(2);
    createPrediction(title, ['Yes', 'No'], [odds, oppositeOdds]);

    // Clear form
    document.getElementById('predictionTitle').value = '';
    document.getElementById('predictionOutcome').value = '';
    document.getElementById('predictionOdds').value = '';

    loadPredictionsList();
}

function loadPredictionsList() {
    const predictionsList = document.getElementById('predictionsList');
    predictionsList.innerHTML = appState.predictions.map(p => `
        <div class="prediction-item">
            <div>
                <div class="prediction-name">${p.title}</div>
                <div class="prediction-info">Status: ${p.status}</div>
            </div>
            <select onchange="updatePredictionStatus(${p.id}, this.value)" style="padding: 0.4rem; background: rgba(255,255,255,0.1); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary);">
                <option value="open" ${p.status === 'open' ? 'selected' : ''}>Open</option>
                <option value="closed" ${p.status === 'closed' ? 'selected' : ''}>Closed</option>
            </select>
        </div>
    `).join('');
}

function closeAdminModal() {
    document.getElementById('adminModal').classList.remove('active');
}

// ============================================
// Auth Modal
// ============================================

function showAuthModal() {
    document.getElementById('authModal').classList.add('active');
}

function closeAuthModal() {
    document.getElementById('authModal').classList.remove('active');
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
}

function switchAuthTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));

    if (tab === 'login') {
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
        document.getElementById('loginForm').classList.add('active');
    } else {
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        document.getElementById('signupForm').classList.add('active');
    }
}

function switchAdminTab(tab) {
    document.querySelectorAll('.admin-tab').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.admin-tab-content').forEach(content => content.classList.remove('active'));

    if (tab === 'users') {
        document.querySelectorAll('.admin-tab')[0].classList.add('active');
        document.getElementById('usersTab').classList.add('active');
    } else {
        document.querySelectorAll('.admin-tab')[1].classList.add('active');
        document.getElementById('predictionsTab').classList.add('active');
    }
}

// ============================================
// Notifications
// ============================================

function showNotification(message, type = 'info') {
    const notification = {
        id: Date.now(),
        message,
        type
    };

    appState.notifications.push(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
        appState.notifications = appState.notifications.filter(n => n.id !== notification.id);
    }, 3000);

    renderNotifications();
}

function renderNotifications() {
    // Find or create notification container
    let container = document.getElementById('notificationContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notificationContainer';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 400px;
        `;
        document.body.appendChild(container);
    }

    container.innerHTML = appState.notifications.map(n => `
        <div class="alert alert-${n.type}">
            ${n.message}
        </div>
    `).join('');
}

// ============================================
// Initialize on Load
// ============================================

document.addEventListener('DOMContentLoaded', initializeApp);

// Close modals on outside click
window.onclick = function(event) {
    const authModal = document.getElementById('authModal');
    const adminModal = document.getElementById('adminModal');
    
    if (event.target === authModal) {
        closeAuthModal();
    }
    if (event.target === adminModal) {
        closeAdminModal();
    }
}