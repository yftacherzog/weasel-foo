// Available pool of genes (Characters allowed)
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ ";

// Game State Values
let targetPhrase = "";
let currentString = "";
let stepCounter = 0;
let autoRunInterval = null;

// DOM Element Selectors
const targetInput = document.getElementById('target-input');
const stringOutput = document.getElementById('string-output');
const stepsDisplay = document.getElementById('stat-steps');
const fitnessDisplay = document.getElementById('stat-fitness');
const modeDisplay = document.getElementById('stat-mode');
const btnRandom = document.getElementById('btn-random');
const btnWeasel = document.getElementById('btn-weasel');
const autoRunCheck = document.getElementById('auto-run');

// Helper: Generate a single random character
function getRandomChar() {
    return ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
}

// Helper: Build a completely random string of target length
function makeRandomString(length) {
    let result = "";
    for (let i = 0; i < length; i++) {
        result += getRandomChar();
    }
    return result;
}

// Compute fitness score (number of exactly matching character positions)
function getFitness(str, target) {
    let score = 0;
    for (let i = 0; i < target.length; i++) {
        if (str[i] === target[i]) score++;
    }
    return score;
}

// Render the current string to the UI and apply color matching highlights
function renderDisplay() {
    let htmlOutput = "";
    let currentFitness = 0;

    for (let i = 0; i < targetPhrase.length; i++) {
        const currentChar = currentString[i] || " ";
        if (currentChar === targetPhrase[i]) {
            htmlOutput += `<span class="match">${currentChar === " " ? "&nbsp;" : currentChar}</span>`;
            currentFitness++;
        } else {
            htmlOutput += `<span class="mismatch">${currentChar === " " ? "&nbsp;" : currentChar}</span>`;
        }
    }

    stringOutput.innerHTML = htmlOutput;
    stepsDisplay.innerText = stepCounter;
    fitnessDisplay.innerText = `${currentFitness} / ${targetPhrase.length}`;
}

// Reset data array layouts when changing the configuration target word
function resetSimulation() {
    targetPhrase = targetInput.value.toUpperCase().replace(/[^A-Z ]/g, "");
    targetInput.value = targetPhrase; // Sanitize input UI element
    stepCounter = 0;
    currentString = makeRandomString(targetPhrase.length);
    modeDisplay.innerText = "Initialized";
    renderDisplay();
}

// BUTTON LOGIC 1: Complete independent random regeneration
function executeRandomStep() {
    stopAutoRun(); // Kill autorun loop if active
    stepCounter++;
    currentString = makeRandomString(targetPhrase.length);
    modeDisplay.innerText = "Pure Random";
    renderDisplay();
}

// BUTTON LOGIC 2: Dawkins' Cumulative Breeding Loop
function executeWeaselStep() {
    stepCounter++;
    modeDisplay.innerText = "Cumulative (Weasel)";
    
    const copiesCount = 100;
    const mutationRate = 0.05; // 5% chance per character slot
    
    let bestCopy = currentString;
    let bestFitness = getFitness(currentString, targetPhrase);

    // Spawn 100 target organism variations based on current string
    for (let i = 0; i < copiesCount; i++) {
        let mutatedString = "";
        
        for (let j = 0; j < currentString.length; j++) {
            if (Math.random() < mutationRate) {
                mutatedString += getRandomChar(); // Mutate slot
            } else {
                mutatedString += currentString[j]; // Inherit slot unchanged
            }
        }

        let mutantFitness = getFitness(mutatedString, targetPhrase);
        if (mutantFitness > bestFitness) {
            bestFitness = mutantFitness;
            bestCopy = mutatedString;
        }
    }

    currentString = bestCopy;
    renderDisplay();

    // End run criteria check
    if (currentString === targetPhrase) {
        stopAutoRun();
        modeDisplay.innerText = "Target Reached! 🎉";
    }
}

// Auto-run clock toggles
function startAutoRun() {
    if (currentString === targetPhrase) resetSimulation();
    autoRunInterval = setInterval(executeWeaselStep, 40);
}

function stopAutoRun() {
    clearInterval(autoRunInterval);
    autoRunInterval = null;
    autoRunCheck.checked = false;
}

// Event Binding Listeners
targetInput.addEventListener('input', resetSimulation);
btnRandom.addEventListener('click', executeRandomStep);
btnWeasel.addEventListener('click', () => {
    stopAutoRun();
    executeWeaselStep();
});

autoRunCheck.addEventListener('change', (e) => {
    if (e.target.checked) {
        startAutoRun();
    } else {
        stopAutoRun();
    }
});

// Fire script initialization routine on screen draw load
window.onload = resetSimulation;