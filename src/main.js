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
    30, 80, 180, 400, 800, 1600, 3200, 6400, 12800,
    25600, 51200, 102400, 204800, 409600, 819200,
    1638400, 3276800, 6553600, 13107200, 26214400,
    52428800, 104857600, 209715200, 419430400, 838860800
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
    // Level 1 (80 coins)
    [
        { type: 'flat', effect: 5, cost: 40, desc: '클릭당 +5 코인' },
        { type: 'flat', effect: 7, cost: 50, desc: '클릭당 +7 코인' },
        { type: 'multiplier', effect: 1.8, cost: 45, desc: '클릭 획득량 x1.8' },
        { type: 'critical', effect: { chance: 15 }, cost: 40, desc: '크리티컬 확률 +15%' },
        { type: 'critical', effect: { multiplier: 0.5 }, cost: 35, desc: '크리티컬 배율 +0.5x' },
    ],
    // Level 2 (180 coins)
    [
        { type: 'flat', effect: 12, cost: 90, desc: '클릭당 +12 코인' },
        { type: 'flat', effect: 15, cost: 110, desc: '클릭당 +15 코인' },
        { type: 'multiplier', effect: 2.0, cost: 100, desc: '클릭 획득량 x2.0' },
        { type: 'critical', effect: { chance: 20 }, cost: 85, desc: '크리티컬 확률 +20%' },
        { type: 'critical', effect: { multiplier: 1.0 }, cost: 95, desc: '크리티컬 배율 +1.0x' },
    ],
    // Level 3 (400 coins)
    [
        { type: 'flat', effect: 25, cost: 200, desc: '클릭당 +25 코인' },
        { type: 'flat', effect: 35, cost: 250, desc: '클릭당 +35 코인' },
        { type: 'multiplier', effect: 2.5, cost: 220, desc: '클릭 획득량 x2.5' },
        { type: 'critical', effect: { chance: 25 }, cost: 200, desc: '크리티컬 확률 +25%' },
        { type: 'critical', effect: { multiplier: 1.5 }, cost: 210, desc: '크리티컬 배율 +1.5x' },
    ],
    // Level 4 (800 coins)
    [
        { type: 'flat', effect: 50, cost: 400, desc: '클릭당 +50 코인' },
        { type: 'flat', effect: 70, cost: 500, desc: '클릭당 +70 코인' },
        { type: 'multiplier', effect: 3.0, cost: 450, desc: '클릭 획득량 x3.0' },
        { type: 'critical', effect: { chance: 30 }, cost: 400, desc: '크리티컬 확률 +30%' },
        { type: 'critical', effect: { multiplier: 2.0 }, cost: 420, desc: '크리티컬 배율 +2.0x' },
    ],
    // Level 5 (1600 coins)
    [
        { type: 'flat', effect: 100, cost: 800, desc: '클릭당 +100 코인' },
        { type: 'flat', effect: 150, cost: 1000, desc: '클릭당 +150 코인' },
        { type: 'multiplier', effect: 3.5, cost: 900, desc: '클릭 획득량 x3.5' },
        { type: 'critical', effect: { chance: 35 }, cost: 800, desc: '크리티컬 확률 +35%' },
        { type: 'critical', effect: { multiplier: 2.5 }, cost: 850, desc: '크리티컬 배율 +2.5x' },
    ],
    // Level 6 (3200 coins)
    [
        { type: 'flat', effect: 250, cost: 1600, desc: '클릭당 +250 코인' },
        { type: 'flat', effect: 350, cost: 2000, desc: '클릭당 +350 코인' },
        { type: 'multiplier', effect: 4.0, cost: 1800, desc: '클릭 획득량 x4.0' },
        { type: 'critical', effect: { chance: 40 }, cost: 1600, desc: '크리티컬 확률 +40%' },
        { type: 'critical', effect: { multiplier: 3.0 }, cost: 1700, desc: '크리티컬 배율 +3.0x' },
    ],
    // Level 7 (6400 coins)
    [
        { type: 'flat', effect: 500, cost: 3200, desc: '클릭당 +500 코인' },
        { type: 'flat', effect: 700, cost: 4000, desc: '클릭당 +700 코인' },
        { type: 'multiplier', effect: 5.0, cost: 3600, desc: '클릭 획득량 x5.0' },
        { type: 'critical', effect: { chance: 45 }, cost: 3200, desc: '크리티컬 확률 +45%' },
        { type: 'critical', effect: { multiplier: 4.0 }, cost: 3400, desc: '크리티컬 배율 +4.0x' },
    ],
    // Level 8 (12800 coins)
    [
        { type: 'flat', effect: 1000, cost: 6400, desc: '클릭당 +1000 코인' },
        { type: 'flat', effect: 1500, cost: 8000, desc: '클릭당 +1500 코인' },
        { type: 'multiplier', effect: 6.0, cost: 7200, desc: '클릭 획득량 x6.0' },
        { type: 'critical', effect: { chance: 50 }, cost: 6400, desc: '크리티컬 확률 +50%' },
        { type: 'critical', effect: { multiplier: 5.0 }, cost: 6800, desc: '크리티컬 배율 +5.0x' },
    ],
    // Level 9 (25600 coins)
    [
        { type: 'flat', effect: 2500, cost: 12800, desc: '클릭당 +2500 코인' },
        { type: 'flat', effect: 3500, cost: 16000, desc: '클릭당 +3500 코인' },
        { type: 'multiplier', effect: 7.0, cost: 14400, desc: '클릭 획득량 x7.0' },
        { type: 'critical', effect: { chance: 55 }, cost: 12800, desc: '크리티컬 확률 +55%' },
        { type: 'critical', effect: { multiplier: 6.0 }, cost: 13600, desc: '크리티컬 배율 +6.0x' },
    ],
    // Level 10 (51200 coins)
    [
        { type: 'flat', effect: 5000, cost: 25600, desc: '클릭당 +5000 코인' },
        { type: 'flat', effect: 7500, cost: 32000, desc: '클릭당 +7500 코인' },
        { type: 'multiplier', effect: 8.0, cost: 28800, desc: '클릭 획득량 x8.0' },
        { type: 'critical', effect: { chance: 60 }, cost: 25600, desc: '크리티컬 확률 +60%' },
        { type: 'critical', effect: { multiplier: 7.0 }, cost: 27200, desc: '크리티컬 배율 +7.0x' },
    ],
    // Level 11 (102400 coins)
    [
        { type: 'flat', effect: 10000, cost: 51200, desc: '클릭당 +10000 코인' },
        { type: 'flat', effect: 15000, cost: 64000, desc: '클릭당 +15000 코인' },
        { type: 'multiplier', effect: 10.0, cost: 57600, desc: '클릭 획득량 x10.0' },
        { type: 'critical', effect: { chance: 65 }, cost: 51200, desc: '크리티컬 확률 +65%' },
        { type: 'critical', effect: { multiplier: 8.0 }, cost: 54400, desc: '크리티컬 배율 +8.0x' },
    ],
    // Level 12 (204800 coins)
    [
        { type: 'flat', effect: 25000, cost: 102400, desc: '클릭당 +25000 코인' },
        { type: 'flat', effect: 35000, cost: 128000, desc: '클릭당 +35000 코인' },
        { type: 'multiplier', effect: 12.0, cost: 115200, desc: '클릭 획득량 x12.0' },
        { type: 'critical', effect: { chance: 70 }, cost: 102400, desc: '크리티컬 확률 +70%' },
        { type: 'critical', effect: { multiplier: 10.0 }, cost: 108800, desc: '크리티컬 배율 +10.0x' },
    ],
    // Level 13 (409600 coins)
    [
        { type: 'flat', effect: 50000, cost: 204800, desc: '클릭당 +50000 코인' },
        { type: 'flat', effect: 75000, cost: 256000, desc: '클릭당 +75000 코인' },
        { type: 'multiplier', effect: 15.0, cost: 230400, desc: '클릭 획득량 x15.0' },
        { type: 'critical', effect: { chance: 75 }, cost: 204800, desc: '크리티컬 확률 +75%' },
        { type: 'critical', effect: { multiplier: 12.0 }, cost: 217600, desc: '크리티컬 배율 +12.0x' },
    ],
    // Level 14 (819200 coins)
    [
        { type: 'flat', effect: 100000, cost: 409600, desc: '클릭당 +100000 코인' },
        { type: 'flat', effect: 150000, cost: 512000, desc: '클릭당 +150000 코인' },
        { type: 'multiplier', effect: 20.0, cost: 460800, desc: '클릭 획득량 x20.0' },
        { type: 'critical', effect: { chance: 80 }, cost: 409600, desc: '크리티컬 확률 +80%' },
        { type: 'critical', effect: { multiplier: 15.0 }, cost: 435200, desc: '크리티컬 배율 +15.0x' },
    ],
    // Level 15 (1638400 coins)
    [
        { type: 'flat', effect: 250000, cost: 819200, desc: '클릭당 +250000 코인' },
        { type: 'flat', effect: 350000, cost: 1024000, desc: '클릭당 +350000 코인' },
        { type: 'multiplier', effect: 25.0, cost: 921600, desc: '클릭 획득량 x25.0' },
        { type: 'critical', effect: { chance: 85 }, cost: 819200, desc: '크리티컬 확률 +85%' },
        { type: 'critical', effect: { multiplier: 20.0 }, cost: 870400, desc: '크리티컬 배율 +20.0x' },
    ],
    // Level 16 (3276800 coins)
    [
        { type: 'flat', effect: 500000, cost: 1638400, desc: '클릭당 +500000 코인' },
        { type: 'flat', effect: 750000, cost: 2048000, desc: '클릭당 +750000 코인' },
        { type: 'multiplier', effect: 30.0, cost: 1843200, desc: '클릭 획득량 x30.0' },
        { type: 'critical', effect: { chance: 90 }, cost: 1638400, desc: '크리티컬 확률 +90%' },
        { type: 'critical', effect: { multiplier: 25.0 }, cost: 1740800, desc: '크리티컬 배율 +25.0x' },
    ],
    // Level 17 (6553600 coins)
    [
        { type: 'flat', effect: 1000000, cost: 3276800, desc: '클릭당 +1000000 코인' },
        { type: 'flat', effect: 1500000, cost: 4096000, desc: '클릭당 +1500000 코인' },
        { type: 'multiplier', effect: 40.0, cost: 3686400, desc: '클릭 획득량 x40.0' },
        { type: 'critical', effect: { chance: 95 }, cost: 3276800, desc: '크리티컬 확률 +95%' },
        { type: 'critical', effect: { multiplier: 30.0 }, cost: 3481600, desc: '크리티컬 배율 +30.0x' },
    ],
    // Level 18 (13107200 coins)
    [
        { type: 'flat', effect: 2500000, cost: 6553600, desc: '클릭당 +2500000 코인' },
        { type: 'flat', effect: 3500000, cost: 8192000, desc: '클릭당 +3500000 코인' },
        { type: 'multiplier', effect: 50.0, cost: 7372800, desc: '클릭 획득량 x50.0' },
        { type: 'critical', effect: { chance: 100 }, cost: 6553600, desc: '크리티컬 확률 +100%' },
        { type: 'critical', effect: { multiplier: 40.0 }, cost: 6963200, desc: '크리티컬 배율 +40.0x' },
    ],
    // Level 19 (26214400 coins)
    [
        { type: 'flat', effect: 5000000, cost: 13107200, desc: '클릭당 +5000000 코인' },
        { type: 'flat', effect: 7500000, cost: 16384000, desc: '클릭당 +7500000 코인' },
        { type: 'multiplier', effect: 75.0, cost: 14745600, desc: '클릭 획득량 x75.0' },
        { type: 'critical', effect: { multiplier: 50.0 }, cost: 13107200, desc: '크리티컬 배율 +50.0x' },
        { type: 'critical', effect: { multiplier: 60.0 }, cost: 13926400, desc: '크리티컬 배율 +60.0x' },
    ],
    // Level 20 (52428800 coins)
    [
        { type: 'flat', effect: 10000000, cost: 26214400, desc: '클릭당 +10000000 코인' },
        { type: 'flat', effect: 15000000, cost: 32768000, desc: '클릭당 +15000000 코인' },
        { type: 'multiplier', effect: 100.0, cost: 29491200, desc: '클릭 획득량 x100.0' },
        { type: 'critical', effect: { multiplier: 75.0 }, cost: 26214400, desc: '크리티컬 배율 +75.0x' },
        { type: 'critical', effect: { multiplier: 100.0 }, cost: 27852800, desc: '크리티컬 배율 +100.0x' },
    ],
    // Level 21 (104857600 coins)
    [
        { type: 'flat', effect: 25000000, cost: 52428800, desc: '클릭당 +25000000 코인' },
        { type: 'flat', effect: 35000000, cost: 65536000, desc: '클릭당 +35000000 코인' },
        { type: 'multiplier', effect: 150.0, cost: 58982400, desc: '클릭 획득량 x150.0' },
        { type: 'critical', effect: { multiplier: 125.0 }, cost: 52428800, desc: '크리티컬 배율 +125.0x' },
        { type: 'critical', effect: { multiplier: 150.0 }, cost: 55705600, desc: '크리티컬 배율 +150.0x' },
    ],
    // Level 22 (209715200 coins)
    [
        { type: 'flat', effect: 50000000, cost: 104857600, desc: '클릭당 +50000000 코인' },
        { type: 'flat', effect: 75000000, cost: 131072000, desc: '클릭당 +75000000 코인' },
        { type: 'multiplier', effect: 200.0, cost: 117964800, desc: '클릭 획득량 x200.0' },
        { type: 'critical', effect: { multiplier: 200.0 }, cost: 104857600, desc: '크리티컬 배율 +200.0x' },
        { type: 'critical', effect: { multiplier: 250.0 }, cost: 111411200, desc: '크리티컬 배율 +250.0x' },
    ],
    // Level 23 (419430400 coins)
    [
        { type: 'flat', effect: 100000000, cost: 209715200, desc: '클릭당 +100000000 코인' },
        { type: 'flat', effect: 150000000, cost: 262144000, desc: '클릭당 +150000000 코인' },
        { type: 'multiplier', effect: 300.0, cost: 235929600, desc: '클릭 획득량 x300.0' },
        { type: 'critical', effect: { multiplier: 300.0 }, cost: 209715200, desc: '크리티컬 배율 +300.0x' },
        { type: 'critical', effect: { multiplier: 400.0 }, cost: 222822400, desc: '크리티컬 배율 +400.0x' },
    ],
    // Level 24 (838860800 coins)
    [
        { type: 'flat', effect: 250000000, cost: 419430400, desc: '클릭당 +250000000 코인' },
        { type: 'flat', effect: 500000000, cost: 524288000, desc: '클릭당 +500000000 코인' },
        { type: 'multiplier', effect: 500.0, cost: 471859200, desc: '클릭 획득량 x500.0' },
        { type: 'critical', effect: { multiplier: 500.0 }, cost: 419430400, desc: '크리티컬 배율 +500.0x' },
        { type: 'critical', effect: { multiplier: 1000.0 }, cost: 445644800, desc: '크리티컬 배율 +1000.0x' },
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
            coins: playerStats.totalEarned,
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
