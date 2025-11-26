// Game state
let score = 0;
let clickPower = 1;
let perSecond = 0;

// Upgrades
const upgrades = {
    autoClicker: {
        count: 0,
        cost: 10,
        costMultiplier: 1.15,
        perSecond: 1
    },
    clickMultiplier: {
        count: 0,
        cost: 50,
        costMultiplier: 1.5,
        multiplier: 2
    },
    megaClicker: {
        count: 0,
        cost: 100,
        costMultiplier: 1.2,
        perSecond: 10
    }
};

// DOM elements
const scoreElement = document.getElementById('score');
const perSecondElement = document.getElementById('perSecond');
const clickButton = document.getElementById('clickButton');

// Upgrade buttons
const autoClickerButton = document.getElementById('autoClicker');
const clickMultiplierButton = document.getElementById('clickMultiplier');
const megaClickerButton = document.getElementById('megaClicker');

// Cost elements
const autoClickerCostElement = document.getElementById('autoClickerCost');
const clickMultiplierCostElement = document.getElementById('clickMultiplierCost');
const megaClickerCostElement = document.getElementById('megaClickerCost');

// Count elements
const autoClickerCountElement = document.getElementById('autoClickerCount');
const clickMultiplierCountElement = document.getElementById('clickMultiplierCount');
const megaClickerCountElement = document.getElementById('megaClickerCount');

// Update display
function updateDisplay() {
    scoreElement.textContent = Math.floor(score);
    perSecondElement.textContent = perSecond.toFixed(1);

    // Update costs
    autoClickerCostElement.textContent = Math.floor(upgrades.autoClicker.cost);
    clickMultiplierCostElement.textContent = Math.floor(upgrades.clickMultiplier.cost);
    megaClickerCostElement.textContent = Math.floor(upgrades.megaClicker.cost);

    // Update counts
    autoClickerCountElement.textContent = upgrades.autoClicker.count;
    clickMultiplierCountElement.textContent = upgrades.clickMultiplier.count;
    megaClickerCountElement.textContent = upgrades.megaClicker.count;

    // Enable/disable upgrade buttons
    autoClickerButton.disabled = score < upgrades.autoClicker.cost;
    clickMultiplierButton.disabled = score < upgrades.clickMultiplier.cost;
    megaClickerButton.disabled = score < upgrades.megaClicker.cost;
}

// Calculate per second income
function calculatePerSecond() {
    perSecond =
        (upgrades.autoClicker.count * upgrades.autoClicker.perSecond) +
        (upgrades.megaClicker.count * upgrades.megaClicker.perSecond);
}

// Handle click
clickButton.addEventListener('click', () => {
    score += clickPower;
    updateDisplay();

    // Add click animation
    clickButton.style.transform = 'scale(0.95)';
    setTimeout(() => {
        clickButton.style.transform = '';
    }, 100);
});

// Buy auto clicker
autoClickerButton.addEventListener('click', () => {
    if (score >= upgrades.autoClicker.cost) {
        score -= upgrades.autoClicker.cost;
        upgrades.autoClicker.count++;
        upgrades.autoClicker.cost = Math.floor(upgrades.autoClicker.cost * upgrades.autoClicker.costMultiplier);
        calculatePerSecond();
        updateDisplay();
    }
});

// Buy click multiplier
clickMultiplierButton.addEventListener('click', () => {
    if (score >= upgrades.clickMultiplier.cost) {
        score -= upgrades.clickMultiplier.cost;
        upgrades.clickMultiplier.count++;
        clickPower *= upgrades.clickMultiplier.multiplier;
        upgrades.clickMultiplier.cost = Math.floor(upgrades.clickMultiplier.cost * upgrades.clickMultiplier.costMultiplier);
        updateDisplay();
    }
});

// Buy mega clicker
megaClickerButton.addEventListener('click', () => {
    if (score >= upgrades.megaClicker.cost) {
        score -= upgrades.megaClicker.cost;
        upgrades.megaClicker.count++;
        upgrades.megaClicker.cost = Math.floor(upgrades.megaClicker.cost * upgrades.megaClicker.costMultiplier);
        calculatePerSecond();
        updateDisplay();
    }
});

// Game loop - add passive income
setInterval(() => {
    if (perSecond > 0) {
        score += perSecond / 10;
        updateDisplay();
    }
}, 100);

// Initial display update
updateDisplay();
