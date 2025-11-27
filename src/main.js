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
    30, 100, 250, 500, 1000, 2000, 4000, 8000, 15000,
    30000, 60000, 120000, 240000, 480000, 1000000
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
        { type: 'flat', effect: 2, cost: 15, desc: '클릭당 +2 코인' },
        { type: 'flat', effect: 3, cost: 20, desc: '클릭당 +3 코인' },
        { type: 'multiplier', effect: 1.5, cost: 18, desc: '클릭 획득량 x1.5' },
        { type: 'critical', effect: { chance: 10 }, cost: 15, desc: '크리티컬 확률 +10%' },
    ],
    // Level 1 (100 coins)
    [
        { type: 'flat', effect: 5, cost: 50, desc: '클릭당 +5 코인' },
        { type: 'flat', effect: 8, cost: 60, desc: '클릭당 +8 코인' },
        { type: 'multiplier', effect: 1.8, cost: 55, desc: '클릭 획득량 x1.8' },
        { type: 'critical', effect: { chance: 15 }, cost: 50, desc: '크리티컬 확률 +15%' },
        { type: 'critical', effect: { multiplier: 0.5 }, cost: 45, desc: '크리티컬 배율 +0.5x' },
    ],
    // Level 2 (250 coins)
    [
        { type: 'flat', effect: 15, cost: 125, desc: '클릭당 +15 코인' },
        { type: 'flat', effect: 20, cost: 150, desc: '클릭당 +20 코인' },
        { type: 'multiplier', effect: 2.0, cost: 135, desc: '클릭 획득량 x2.0' },
        { type: 'critical', effect: { chance: 20 }, cost: 125, desc: '크리티컬 확률 +20%' },
        { type: 'critical', effect: { multiplier: 1.0 }, cost: 130, desc: '크리티컬 배율 +1.0x' },
    ],
    // Level 3 (500 coins)
    [
        { type: 'flat', effect: 35, cost: 250, desc: '클릭당 +35 코인' },
        { type: 'flat', effect: 50, cost: 300, desc: '클릭당 +50 코인' },
        { type: 'multiplier', effect: 2.5, cost: 275, desc: '클릭 획득량 x2.5' },
        { type: 'critical', effect: { chance: 25 }, cost: 250, desc: '크리티컬 확률 +25%' },
        { type: 'critical', effect: { multiplier: 1.5 }, cost: 265, desc: '크리티컬 배율 +1.5x' },
    ],
    // Level 4 (1000 coins)
    [
        { type: 'flat', effect: 80, cost: 500, desc: '클릭당 +80 코인' },
        { type: 'flat', effect: 120, cost: 600, desc: '클릭당 +120 코인' },
        { type: 'multiplier', effect: 3.0, cost: 550, desc: '클릭 획득량 x3.0' },
        { type: 'critical', effect: { chance: 30 }, cost: 500, desc: '크리티컬 확률 +30%' },
        { type: 'critical', effect: { multiplier: 2.0 }, cost: 525, desc: '크리티컬 배율 +2.0x' },
    ],
    // Level 5 (2000 coins)
    [
        { type: 'flat', effect: 200, cost: 1000, desc: '클릭당 +200 코인' },
        { type: 'flat', effect: 300, cost: 1200, desc: '클릭당 +300 코인' },
        { type: 'multiplier', effect: 3.5, cost: 1100, desc: '클릭 획득량 x3.5' },
        { type: 'critical', effect: { chance: 35 }, cost: 1000, desc: '크리티컬 확률 +35%' },
        { type: 'critical', effect: { multiplier: 2.5 }, cost: 1050, desc: '크리티컬 배율 +2.5x' },
    ],
    // Level 6 (4000 coins)
    [
        { type: 'flat', effect: 500, cost: 2000, desc: '클릭당 +500 코인' },
        { type: 'flat', effect: 700, cost: 2400, desc: '클릭당 +700 코인' },
        { type: 'multiplier', effect: 4.0, cost: 2200, desc: '클릭 획득량 x4.0' },
        { type: 'critical', effect: { chance: 40 }, cost: 2000, desc: '크리티컬 확률 +40%' },
        { type: 'critical', effect: { multiplier: 3.0 }, cost: 2100, desc: '크리티컬 배율 +3.0x' },
    ],
    // Level 7 (8000 coins)
    [
        { type: 'flat', effect: 1200, cost: 4000, desc: '클릭당 +1200 코인' },
        { type: 'flat', effect: 1800, cost: 4800, desc: '클릭당 +1800 코인' },
        { type: 'multiplier', effect: 5.0, cost: 4400, desc: '클릭 획득량 x5.0' },
        { type: 'critical', effect: { chance: 45 }, cost: 4000, desc: '크리티컬 확률 +45%' },
        { type: 'critical', effect: { multiplier: 4.0 }, cost: 4200, desc: '크리티컬 배율 +4.0x' },
    ],
    // Level 8 (15000 coins)
    [
        { type: 'flat', effect: 3000, cost: 7500, desc: '클릭당 +3000 코인' },
        { type: 'flat', effect: 4500, cost: 9000, desc: '클릭당 +4500 코인' },
        { type: 'multiplier', effect: 6.0, cost: 8250, desc: '클릭 획득량 x6.0' },
        { type: 'critical', effect: { chance: 50 }, cost: 7500, desc: '크리티컬 확률 +50%' },
        { type: 'critical', effect: { multiplier: 5.0 }, cost: 7875, desc: '크리티컬 배율 +5.0x' },
    ],
    // Level 9 (30000 coins)
    [
        { type: 'flat', effect: 7000, cost: 15000, desc: '클릭당 +7000 코인' },
        { type: 'flat', effect: 10000, cost: 18000, desc: '클릭당 +10000 코인' },
        { type: 'multiplier', effect: 8.0, cost: 16500, desc: '클릭 획득량 x8.0' },
        { type: 'critical', effect: { chance: 60 }, cost: 15000, desc: '크리티컬 확률 +60%' },
        { type: 'critical', effect: { multiplier: 7.0 }, cost: 15750, desc: '크리티컬 배율 +7.0x' },
    ],
    // Level 10 (60000 coins)
    [
        { type: 'flat', effect: 18000, cost: 30000, desc: '클릭당 +18000 코인' },
        { type: 'flat', effect: 25000, cost: 36000, desc: '클릭당 +25000 코인' },
        { type: 'multiplier', effect: 10.0, cost: 33000, desc: '클릭 획득량 x10.0' },
        { type: 'critical', effect: { chance: 70 }, cost: 30000, desc: '크리티컬 확률 +70%' },
        { type: 'critical', effect: { multiplier: 10.0 }, cost: 31500, desc: '크리티컬 배율 +10.0x' },
    ],
    // Level 11 (120000 coins)
    [
        { type: 'flat', effect: 40000, cost: 60000, desc: '클릭당 +40000 코인' },
        { type: 'flat', effect: 60000, cost: 72000, desc: '클릭당 +60000 코인' },
        { type: 'multiplier', effect: 15.0, cost: 66000, desc: '클릭 획득량 x15.0' },
        { type: 'critical', effect: { chance: 80 }, cost: 60000, desc: '크리티컬 확률 +80%' },
        { type: 'critical', effect: { multiplier: 15.0 }, cost: 63000, desc: '크리티컬 배율 +15.0x' },
    ],
    // Level 12 (240000 coins)
    [
        { type: 'flat', effect: 100000, cost: 120000, desc: '클릭당 +100000 코인' },
        { type: 'flat', effect: 150000, cost: 144000, desc: '클릭당 +150000 코인' },
        { type: 'multiplier', effect: 20.0, cost: 132000, desc: '클릭 획득량 x20.0' },
        { type: 'critical', effect: { chance: 90 }, cost: 120000, desc: '크리티컬 확률 +90%' },
        { type: 'critical', effect: { multiplier: 20.0 }, cost: 126000, desc: '크리티컬 배율 +20.0x' },
    ],
    // Level 13 (480000 coins)
    [
        { type: 'flat', effect: 250000, cost: 240000, desc: '클릭당 +250000 코인' },
        { type: 'flat', effect: 350000, cost: 288000, desc: '클릭당 +350000 코인' },
        { type: 'multiplier', effect: 30.0, cost: 264000, desc: '클릭 획득량 x30.0' },
        { type: 'critical', effect: { chance: 100 }, cost: 240000, desc: '크리티컬 확률 +100%' },
        { type: 'critical', effect: { multiplier: 30.0 }, cost: 252000, desc: '크리티컬 배율 +30.0x' },
    ],
    // Level 14 (1000000 coins)
    [
        { type: 'flat', effect: 600000, cost: 500000, desc: '클릭당 +600000 코인' },
        { type: 'flat', effect: 900000, cost: 600000, desc: '클릭당 +900000 코인' },
        { type: 'multiplier', effect: 50.0, cost: 550000, desc: '클릭 획득량 x50.0' },
        { type: 'critical', effect: { multiplier: 50.0 }, cost: 500000, desc: '크리티컬 배율 +50.0x' },
        { type: 'critical', effect: { multiplier: 75.0 }, cost: 525000, desc: '크리티컬 배율 +75.0x' },
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
