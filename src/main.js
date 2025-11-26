const arcadeButton = document.querySelector('.arcade-button');
const musk1 = document.querySelector('.musk1');
const musk2 = document.querySelector('.musk2');
const muskContainer = document.querySelector('.musk-container');
const coinCountElement = document.querySelector('.coin-count');

let resetTimer = null;
let resetTimerSecond = 200;

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
const shopThresholds = [30, 80, 180, 400, 800, 1600, 3200, 6400, 12800];
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
        { name: '강한 주먹', type: 'flat', effect: 2, cost: 15, desc: '클릭당 +2 코인' },
        { name: '더블 펀치', type: 'flat', effect: 3, cost: 20, desc: '클릭당 +3 코인' },
        { name: '분노', type: 'multiplier', effect: 1.5, cost: 18, desc: '클릭 획득량 x1.5' },
        { name: '크리티컬 시작', type: 'critical', effect: { chance: 10 }, cost: 15, desc: '크리티컬 확률 +10%' },
    ],
    // Level 1 (80 coins)
    [
        { name: '파워 펀치', type: 'flat', effect: 5, cost: 40, desc: '클릭당 +5 코인' },
        { name: '메가 펀치', type: 'flat', effect: 7, cost: 50, desc: '클릭당 +7 코인' },
        { name: '격노', type: 'multiplier', effect: 1.8, cost: 45, desc: '클릭 획득량 x1.8' },
        { name: '날카로운 타격', type: 'critical', effect: { chance: 15 }, cost: 40, desc: '크리티컬 확률 +15%' },
        { name: '치명타 강화', type: 'critical', effect: { multiplier: 0.5 }, cost: 35, desc: '크리티컬 배율 +0.5x' },
    ],
    // Level 2 (180 coins)
    [
        { name: '울트라 펀치', type: 'flat', effect: 12, cost: 90, desc: '클릭당 +12 코인' },
        { name: '거대한 주먹', type: 'flat', effect: 15, cost: 110, desc: '클릭당 +15 코인' },
        { name: '광분', type: 'multiplier', effect: 2.0, cost: 100, desc: '클릭 획득량 x2.0' },
        { name: '정밀 타격', type: 'critical', effect: { chance: 20 }, cost: 85, desc: '크리티컬 확률 +20%' },
        { name: '파괴적 크리티컬', type: 'critical', effect: { multiplier: 1.0 }, cost: 95, desc: '크리티컬 배율 +1.0x' },
    ],
    // Level 3 (400 coins)
    [
        { name: '슈퍼 펀치', type: 'flat', effect: 25, cost: 200, desc: '클릭당 +25 코인' },
        { name: '핵펀치', type: 'flat', effect: 35, cost: 250, desc: '클릭당 +35 코인' },
        { name: '전설의 힘', type: 'multiplier', effect: 2.5, cost: 220, desc: '클릭 획득량 x2.5' },
        { name: '크리티컬 마스터', type: 'critical', effect: { chance: 25 }, cost: 200, desc: '크리티컬 확률 +25%' },
        { name: '치명타 폭발', type: 'critical', effect: { multiplier: 1.5 }, cost: 210, desc: '크리티컬 배율 +1.5x' },
    ],
    // Level 4 (800 coins)
    [
        { name: '하이퍼 펀치', type: 'flat', effect: 50, cost: 400, desc: '클릭당 +50 코인' },
        { name: '신의 주먹', type: 'flat', effect: 70, cost: 500, desc: '클릭당 +70 코인' },
        { name: '무한의 힘', type: 'multiplier', effect: 3.0, cost: 450, desc: '클릭 획득량 x3.0' },
        { name: '완벽한 타격', type: 'critical', effect: { chance: 30 }, cost: 400, desc: '크리티컬 확률 +30%' },
        { name: '크리티컬 신', type: 'critical', effect: { multiplier: 2.0 }, cost: 420, desc: '크리티컬 배율 +2.0x' },
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
