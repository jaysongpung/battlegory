// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAGx_zsnWedGJgGB_MRJQIvbXYMT4owGT4",
    authDomain: "gregory-clickbattle.firebaseapp.com",
    projectId: "gregory-clickbattle",
    storageBucket: "gregory-clickbattle.firebasestorage.app",
    messagingSenderId: "945380280836",
    appId: "1:945380280836:web:12890dbed192587cddc351"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const arcadeButton = document.querySelector('.arcade-button');
const musk1 = document.querySelector('.musk1');
const musk2 = document.querySelector('.musk2');
const muskContainer = document.querySelector('.musk-container');
const coinCountElement = document.querySelector('.coin-count');
const firstPlaceElement = document.querySelector('.firstplace');
const myRankElement = document.querySelector('.myrank');

let resetTimer = null;
let resetTimerSecond = 200;
let lastKnownRank = null;
let playerId = null;

// Player stats
let playerStats = {
    coins: 0,
    totalEarned: 0,
    coinPerClick: 1,
    clickMultiplier: 1,
    criticalChance: 0,
    criticalMultiplier: 2
};

// Shop progression
let currentShopLevel = 0;
const shopThresholds = [
    30, 80, 150, 250, 400, 600, 850, 1200, 1600, 2100,
    2700, 3500, 4500, 6000, 8000, 11000, 15000, 20000, 27000, 36000
];
let visitedShops = new Set();

const comments = [

    { count: 1, text: '일론이 아파합니다' },
    { count: 5, text: '30개 모으면 스킬이 언락돼요' },
    { count: 30, text: '스킬을 하나 선택해주세요' },
]

// Skill pools for each shop level
const skillPools = [
    // Level 0 (30 coins)
    [
        { type: 'flat', effect: 1, cost: 15, desc: '클릭당 +1 코인' },
        { type: 'flat', effect: 2, cost: 20, desc: '클릭당 +2 코인' },
        { type: 'multiplier', effect: 1.1, cost: 18, desc: '클릭 획득량 x1.1' },
        { type: 'critical', effect: { chance: 5 }, cost: 15, desc: '크리티컬 확률 +5%' },
    ],
    // Level 1 (80 coins)
    [
        { type: 'flat', effect: 2, cost: 40, desc: '클릭당 +2 코인' },
        { type: 'flat', effect: 3, cost: 50, desc: '클릭당 +3 코인' },
        { type: 'multiplier', effect: 1.15, cost: 45, desc: '클릭 획득량 x1.15' },
        { type: 'critical', effect: { chance: 5 }, cost: 40, desc: '크리티컬 확률 +5%' },
        { type: 'critical', effect: { multiplier: 0.2 }, cost: 38, desc: '크리티컬 배율 +0.2x' },
    ],
    // Level 2 (150 coins)
    [
        { type: 'flat', effect: 3, cost: 75, desc: '클릭당 +3 코인' },
        { type: 'flat', effect: 4, cost: 90, desc: '클릭당 +4 코인' },
        { type: 'multiplier', effect: 1.2, cost: 80, desc: '클릭 획득량 x1.2' },
        { type: 'critical', effect: { chance: 6 }, cost: 75, desc: '크리티컬 확률 +6%' },
        { type: 'critical', effect: { multiplier: 0.3 }, cost: 78, desc: '크리티컬 배율 +0.3x' },
    ],
    // Level 3 (250 coins)
    [
        { type: 'flat', effect: 5, cost: 125, desc: '클릭당 +5 코인' },
        { type: 'flat', effect: 7, cost: 150, desc: '클릭당 +7 코인' },
        { type: 'multiplier', effect: 1.25, cost: 135, desc: '클릭 획득량 x1.25' },
        { type: 'critical', effect: { chance: 7 }, cost: 125, desc: '크리티컬 확률 +7%' },
        { type: 'critical', effect: { multiplier: 0.4 }, cost: 130, desc: '크리티컬 배율 +0.4x' },
    ],
    // Level 4 (400 coins)
    [
        { type: 'flat', effect: 8, cost: 200, desc: '클릭당 +8 코인' },
        { type: 'flat', effect: 12, cost: 240, desc: '클릭당 +12 코인' },
        { type: 'multiplier', effect: 1.3, cost: 220, desc: '클릭 획득량 x1.3' },
        { type: 'critical', effect: { chance: 8 }, cost: 200, desc: '크리티컬 확률 +8%' },
        { type: 'critical', effect: { multiplier: 0.5 }, cost: 210, desc: '크리티컬 배율 +0.5x' },
    ],
    // Level 5 (600 coins)
    [
        { type: 'flat', effect: 15, cost: 300, desc: '클릭당 +15 코인' },
        { type: 'flat', effect: 20, cost: 360, desc: '클릭당 +20 코인' },
        { type: 'multiplier', effect: 1.35, cost: 330, desc: '클릭 획득량 x1.35' },
        { type: 'critical', effect: { chance: 9 }, cost: 300, desc: '크리티컬 확률 +9%' },
        { type: 'critical', effect: { multiplier: 0.6 }, cost: 315, desc: '크리티컬 배율 +0.6x' },
    ],
    // Level 6 (850 coins)
    [
        { type: 'flat', effect: 25, cost: 425, desc: '클릭당 +25 코인' },
        { type: 'flat', effect: 35, cost: 510, desc: '클릭당 +35 코인' },
        { type: 'multiplier', effect: 1.4, cost: 470, desc: '클릭 획득량 x1.4' },
        { type: 'critical', effect: { chance: 10 }, cost: 425, desc: '크리티컬 확률 +10%' },
        { type: 'critical', effect: { multiplier: 0.7 }, cost: 448, desc: '크리티컬 배율 +0.7x' },
    ],
    // Level 7 (1200 coins)
    [
        { type: 'flat', effect: 40, cost: 600, desc: '클릭당 +40 코인' },
        { type: 'flat', effect: 55, cost: 720, desc: '클릭당 +55 코인' },
        { type: 'multiplier', effect: 1.45, cost: 660, desc: '클릭 획득량 x1.45' },
        { type: 'critical', effect: { chance: 11 }, cost: 600, desc: '크리티컬 확률 +11%' },
        { type: 'critical', effect: { multiplier: 0.8 }, cost: 630, desc: '크리티컬 배율 +0.8x' },
    ],
    // Level 8 (1600 coins)
    [
        { type: 'flat', effect: 60, cost: 800, desc: '클릭당 +60 코인' },
        { type: 'flat', effect: 85, cost: 960, desc: '클릭당 +85 코인' },
        { type: 'multiplier', effect: 1.5, cost: 880, desc: '클릭 획득량 x1.5' },
        { type: 'critical', effect: { chance: 12 }, cost: 800, desc: '크리티컬 확률 +12%' },
        { type: 'critical', effect: { multiplier: 0.9 }, cost: 840, desc: '크리티컬 배율 +0.9x' },
    ],
    // Level 9 (2100 coins)
    [
        { type: 'flat', effect: 90, cost: 1050, desc: '클릭당 +90 코인' },
        { type: 'flat', effect: 125, cost: 1260, desc: '클릭당 +125 코인' },
        { type: 'multiplier', effect: 1.6, cost: 1155, desc: '클릭 획득량 x1.6' },
        { type: 'critical', effect: { chance: 13 }, cost: 1050, desc: '크리티컬 확률 +13%' },
        { type: 'critical', effect: { multiplier: 1.0 }, cost: 1103, desc: '크리티컬 배율 +1.0x' },
    ],
    // Level 10 (2700 coins)
    [
        { type: 'flat', effect: 130, cost: 1350, desc: '클릭당 +130 코인' },
        { type: 'flat', effect: 180, cost: 1620, desc: '클릭당 +180 코인' },
        { type: 'multiplier', effect: 1.7, cost: 1485, desc: '클릭 획득량 x1.7' },
        { type: 'critical', effect: { chance: 15 }, cost: 1350, desc: '크리티컬 확률 +15%' },
        { type: 'critical', effect: { multiplier: 1.1 }, cost: 1418, desc: '크리티컬 배율 +1.1x' },
    ],
    // Level 11 (3500 coins)
    [
        { type: 'flat', effect: 200, cost: 1750, desc: '클릭당 +200 코인' },
        { type: 'flat', effect: 280, cost: 2100, desc: '클릭당 +280 코인' },
        { type: 'multiplier', effect: 1.8, cost: 1925, desc: '클릭 획득량 x1.8' },
        { type: 'critical', effect: { chance: 17 }, cost: 1750, desc: '크리티컬 확률 +17%' },
        { type: 'critical', effect: { multiplier: 1.3 }, cost: 1838, desc: '크리티컬 배율 +1.3x' },
    ],
    // Level 12 (4500 coins)
    [
        { type: 'flat', effect: 300, cost: 2250, desc: '클릭당 +300 코인' },
        { type: 'flat', effect: 420, cost: 2700, desc: '클릭당 +420 코인' },
        { type: 'multiplier', effect: 1.9, cost: 2475, desc: '클릭 획득량 x1.9' },
        { type: 'critical', effect: { chance: 20 }, cost: 2250, desc: '크리티컬 확률 +20%' },
        { type: 'critical', effect: { multiplier: 1.5 }, cost: 2363, desc: '크리티컬 배율 +1.5x' },
    ],
    // Level 13 (6000 coins)
    [
        { type: 'flat', effect: 450, cost: 3000, desc: '클릭당 +450 코인' },
        { type: 'flat', effect: 620, cost: 3600, desc: '클릭당 +620 코인' },
        { type: 'multiplier', effect: 2.0, cost: 3300, desc: '클릭 획득량 x2.0' },
        { type: 'critical', effect: { chance: 22 }, cost: 3000, desc: '크리티컬 확률 +22%' },
        { type: 'critical', effect: { multiplier: 1.7 }, cost: 3150, desc: '크리티컬 배율 +1.7x' },
    ],
    // Level 14 (8000 coins)
    [
        { type: 'flat', effect: 650, cost: 4000, desc: '클릭당 +650 코인' },
        { type: 'flat', effect: 900, cost: 4800, desc: '클릭당 +900 코인' },
        { type: 'multiplier', effect: 2.2, cost: 4400, desc: '클릭 획득량 x2.2' },
        { type: 'critical', effect: { chance: 25 }, cost: 4000, desc: '크리티컬 확률 +25%' },
        { type: 'critical', effect: { multiplier: 2.0 }, cost: 4200, desc: '크리티컬 배율 +2.0x' },
    ],
    // Level 15 (11000 coins)
    [
        { type: 'flat', effect: 1000, cost: 5500, desc: '클릭당 +1000 코인' },
        { type: 'flat', effect: 1400, cost: 6600, desc: '클릭당 +1400 코인' },
        { type: 'multiplier', effect: 2.5, cost: 6050, desc: '클릭 획득량 x2.5' },
        { type: 'critical', effect: { chance: 28 }, cost: 5500, desc: '크리티컬 확률 +28%' },
        { type: 'critical', effect: { multiplier: 2.3 }, cost: 5775, desc: '크리티컬 배율 +2.3x' },
    ],
    // Level 16 (15000 coins)
    [
        { type: 'flat', effect: 1500, cost: 7500, desc: '클릭당 +1500 코인' },
        { type: 'flat', effect: 2100, cost: 9000, desc: '클릭당 +2100 코인' },
        { type: 'multiplier', effect: 2.8, cost: 8250, desc: '클릭 획득량 x2.8' },
        { type: 'critical', effect: { chance: 32 }, cost: 7500, desc: '크리티컬 확률 +32%' },
        { type: 'critical', effect: { multiplier: 2.7 }, cost: 7875, desc: '크리티컬 배율 +2.7x' },
    ],
    // Level 17 (20000 coins)
    [
        { type: 'flat', effect: 2200, cost: 10000, desc: '클릭당 +2200 코인' },
        { type: 'flat', effect: 3100, cost: 12000, desc: '클릭당 +3100 코인' },
        { type: 'multiplier', effect: 3.2, cost: 11000, desc: '클릭 획득량 x3.2' },
        { type: 'critical', effect: { chance: 35 }, cost: 10000, desc: '크리티컬 확률 +35%' },
        { type: 'critical', effect: { multiplier: 3.0 }, cost: 10500, desc: '크리티컬 배율 +3.0x' },
    ],
    // Level 18 (27000 coins)
    [
        { type: 'flat', effect: 3200, cost: 13500, desc: '클릭당 +3200 코인' },
        { type: 'flat', effect: 4500, cost: 16200, desc: '클릭당 +4500 코인' },
        { type: 'multiplier', effect: 3.5, cost: 14850, desc: '클릭 획득량 x3.5' },
        { type: 'critical', effect: { chance: 40 }, cost: 13500, desc: '크리티컬 확률 +40%' },
        { type: 'critical', effect: { multiplier: 3.5 }, cost: 14175, desc: '크리티컬 배율 +3.5x' },
    ],
    // Level 19 (36000 coins)
    [
        { type: 'flat', effect: 5000, cost: 18000, desc: '클릭당 +5000 코인' },
        { type: 'flat', effect: 7000, cost: 21600, desc: '클릭당 +7000 코인' },
        { type: 'multiplier', effect: 4.0, cost: 19800, desc: '클릭 획득량 x4.0' },
        { type: 'critical', effect: { chance: 45 }, cost: 18000, desc: '크리티컬 확률 +45%' },
        { type: 'critical', effect: { multiplier: 4.0 }, cost: 18900, desc: '크리티컬 배율 +4.0x' },
    ]
];

function showMusk2() {
    musk1.style.display = 'none';
    musk2.style.display = 'block';

    // Clear any existing timer
    if (resetTimer) {
        clearTimeout(resetTimer);
    }

    // Set new timer to return to musk1 after 1 second
    resetTimer = setTimeout(() => {
        musk1.style.display = 'block';
        musk2.style.display = 'none';
        resetTimer = null;
    }, resetTimerSecond);
}

function createFlyingCoin(gainAmount, isCritical = false) {
    const flyingCoin = document.createElement('div');
    flyingCoin.className = 'flying-coin';

    // Position at top right of musk container
    const muskRect = muskContainer.getBoundingClientRect();
    flyingCoin.style.left = (muskRect.left + muskRect.width) + 'px';
    flyingCoin.style.top = (muskRect.top + 200) + 'px';

    // Make coin reddish if critical
    if (isCritical) {
        flyingCoin.style.filter = 'hue-rotate(280deg) saturate(2)';
    }

    document.body.appendChild(flyingCoin);

    // Create flying text showing gain amount
    const flyingText = document.createElement('div');
    flyingText.className = 'flying-text';
    flyingText.textContent = gainAmount;
    flyingText.style.left = (muskRect.left + muskRect.width + 50) + 'px';
    flyingText.style.top = (muskRect.top + 200) + 'px';

    // Make text red if critical
    if (isCritical) {
        flyingText.style.color = '#FF0000';
    }

    document.body.appendChild(flyingText);

    // Remove coin and text after animation completes
    setTimeout(() => {
        flyingCoin.remove();
        flyingText.remove();
    }, 800);
}

function checkAndOpenShop() {
    for (let i = 0; i < shopThresholds.length; i++) {
        if (playerStats.totalEarned >= shopThresholds[i] && !visitedShops.has(i)) {
            visitedShops.add(i);
            openShop(i);
            break;
        }
    }
}

function openShop(level) {
    const shopContainer = document.getElementById('shopContainer');
    const skillList = document.getElementById('skillList');

    // Get skill pool for this level
    const pool = skillPools[level] || skillPools[skillPools.length - 1];

    // Randomly select 3 skills from the pool
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const selectedSkills = shuffled.slice(0, 3);

    // Clear previous skills
    skillList.innerHTML = '';

    // Create skill cards
    selectedSkills.forEach(skill => {
        const card = document.createElement('div');
        card.className = 'skill-card';

        if (playerStats.coins < skill.cost) {
            card.classList.add('disabled');
        }

        card.innerHTML = `
            <div class="skill-desc">${skill.desc}</div>
            <div class="skill-cost">
                <img src="./src/coin.png" class="coin-icon"> ${skill.cost}
            </div>
        `;

        card.addEventListener('click', () => {
            if (playerStats.coins >= skill.cost) {
                purchaseSkill(skill);
                shopContainer.style.visibility = 'hidden';
            }
        });

        skillList.appendChild(card);
    });

    shopContainer.style.visibility = 'visible';
}

function purchaseSkill(skill) {
    // Deduct cost
    playerStats.coins -= skill.cost;

    // Apply skill effect
    switch (skill.type) {
        case 'flat':
            playerStats.coinPerClick += skill.effect;
            break;
        case 'multiplier':
            playerStats.clickMultiplier *= skill.effect;
            break;
        case 'critical':
            if (skill.effect.chance) {
                playerStats.criticalChance += skill.effect.chance;
            }
            if (skill.effect.multiplier) {
                playerStats.criticalMultiplier += skill.effect.multiplier;
            }
            break;
    }

    // Update display
    updateCoinDisplay();
}

function updateCoinDisplay() {
    coinCountElement.textContent = Math.floor(playerStats.coins);

    // Update arcade button text with current per-click value
    const perClickValue = Math.floor(playerStats.coinPerClick * playerStats.clickMultiplier);
    arcadeButton.textContent = `1펀치 ${perClickValue}코인`;

    // Update subtitle based on total earned coins
    updateSubtitle();
}

function updateSubtitle() {
    const subtitle = document.querySelector('.subtitle');

    // Don't update if shop is visible
    const shopContainer = document.getElementById('shopContainer');
    if (shopContainer.style.visibility === 'visible') {
        return;
    }

    // Find the appropriate comment based on total earned
    let currentComment = comments[0].text;
    for (let i = comments.length - 1; i >= 0; i--) {
        if (playerStats.totalEarned >= comments[i].count) {
            currentComment = comments[i].text;
            break;
        }
    }

    // Only update if not showing critical effect
    if (!subtitle.textContent.includes('크리티컬')) {
        subtitle.textContent = currentComment;
    }
}

function calculateClickGain() {
    let gain = playerStats.coinPerClick * playerStats.clickMultiplier;
    let isCritical = false;

    // Check for critical hit
    if (Math.random() * 100 < playerStats.criticalChance) {
        gain *= playerStats.criticalMultiplier;
        isCritical = true;

        // Show critical effect
        showCriticalEffect();
    }

    return { gain: Math.floor(gain), isCritical };
}

function showCriticalEffect() {
    // Flash the subtitle to show critical
    const subtitle = document.querySelector('.subtitle');
    subtitle.textContent = '💥 크리티컬 히트! 💥';
    subtitle.style.color = '#FFD700';

    setTimeout(() => {
        updateSubtitle();
        subtitle.style.color = 'white';
    }, 500);
}

function handleTouchDown(e) {
    e.preventDefault();

    // Calculate coin gain with stats
    const { gain, isCritical } = calculateClickGain();
    playerStats.coins += gain;
    playerStats.totalEarned += gain;

    // Update display
    updateCoinDisplay();

    // Create flying coin animation
    createFlyingCoin(gain, isCritical);

    // Check if we should open shop
    checkAndOpenShop();

    // Update leaderboard
    updateLeaderboard();

    // If musk2 is already displayed, apply shake effect
    if (musk2.style.display === 'block') {
        muskContainer.style.transform = 'translateX(-10px)';

        // Reset the 1-second timer
        if (resetTimer) {
            clearTimeout(resetTimer);
        }
        resetTimer = setTimeout(() => {
            musk1.style.display = 'block';
            musk2.style.display = 'none';
            resetTimer = null;
        }, resetTimerSecond);
    } else {
        // First touch, show musk2
        showMusk2();
    }
}

function handleTouchUp(e) {
    e.preventDefault();
    // Reset transform
    muskContainer.style.transform = 'translateX(0)';
}

arcadeButton.addEventListener('mousedown', handleTouchDown);
arcadeButton.addEventListener('mouseup', handleTouchUp);
arcadeButton.addEventListener('mouseleave', handleTouchUp);

// Touch events for mobile
arcadeButton.addEventListener('touchstart', handleTouchDown);
arcadeButton.addEventListener('touchend', handleTouchUp);

// Leaderboard functions
function generatePlayerId() {
    // Check if player ID exists in localStorage
    let id = localStorage.getItem('playerId');
    if (!id) {
        id = 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('playerId', id);
    }
    return id;
}

async function updateLeaderboard() {
    try {
        await db.collection('leaderboard').doc(playerId).set({
            coins: playerStats.coins,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
    } catch (error) {
        console.error('Error updating leaderboard:', error);
    }
}

async function getFirstPlace() {
    try {
        const snapshot = await db.collection('leaderboard')
            .orderBy('coins', 'desc')
            .limit(1)
            .get();

        if (!snapshot.empty) {
            const firstPlace = snapshot.docs[0].data();
            firstPlaceElement.textContent = `현재 1순위 : ${firstPlace.coins.toLocaleString()} 코인`;
        }
    } catch (error) {
        console.error('Error getting first place:', error);
    }
}

async function getPlayerRank() {
    try {
        // Get all players with higher scores
        const snapshot = await db.collection('leaderboard')
            .where('coins', '>', playerStats.totalEarned)
            .get();

        const rank = snapshot.size + 1;

        // Update myrank element
        if (rank !== lastKnownRank) {
            lastKnownRank = rank;
            myRankElement.textContent = `내 순위 : ${rank}등`;
        }
    } catch (error) {
        console.error('Error getting player rank:', error);
    }
}

// Initialize player ID
playerId = generatePlayerId();

// Update first place every 5 seconds
setInterval(getFirstPlace, 5000);
getFirstPlace();

// Check player rank every 3 seconds
setInterval(getPlayerRank, 3000);
