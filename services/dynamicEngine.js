const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');

const DATA_PATH = path.join(__dirname, '../data/dynamicPets.json');

function loadDynamicData() {
    try {
        const rawData = fs.readFileSync(DATA_PATH, 'utf-8');
        return JSON.parse(rawData);
    } catch (e) {
        console.error("System Error: Could not load dynamic data.");
        process.exit(1);
    }
}

function saveDynamicData(data) {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

async function runDynamicSelector() {
    const petsData = loadDynamicData();

    console.log("System: Dynamic decision engine loaded. Let's begin.\n");

    const userAnswers = await inquirer.prompt([
        {
            type: 'list',
            name: 'timeCommitment',
            message: 'How much time can you dedicate daily to pet interaction and care? (1-5)',
            choices: [
                { name: '1. Minimal (under 30 mins)', value: 1 },
                { name: '2. Low (around 30-60 mins)', value: 2 },
                { name: '3. Moderate (1-2 hours)', value: 3 },
                { name: '4. High (2-3 hours)', value: 4 },
                { name: '5. Very High (3+ hours)', value: 5 }
            ]
        },
        {
            type: 'list',
            name: 'spaceRequired',
            message: 'What is your living situation/available space? (1-5)',
            choices: [
                { name: '1. Small tank/cage space only', value: 1 },
                { name: '2. Small apartment', value: 2 },
                { name: '3. Medium apartment/house (no yard)', value: 3 },
                { name: '4. House with small yard', value: 4 },
                { name: '5. House with large secure yard', value: 5 }
            ]
        },
        {
            type: 'list',
            name: 'budget',
            message: 'What is your budget for monthly expenses? (1-5)',
            choices: [
                { name: '1. Very Low ($10-$20)', value: 1 },
                { name: '2. Low ($20-$50)', value: 2 },
                { name: '3. Moderate ($50-$80)', value: 3 },
                { name: '4. High ($80-$150)', value: 4 },
                { name: '5. Very High ($150+)', value: 5 }
            ]
        },
        {
            type: 'list',
            name: 'interactionLevel',
            message: 'How much direct physical interaction do you want? (1-5)',
            choices: [
                { name: '1. Observation only', value: 1 },
                { name: '2. Very occasional handling', value: 2 },
                { name: '3. Moderate interaction/petting', value: 3 },
                { name: '4. Frequent play and cuddling', value: 4 },
                { name: '5. Constant companionship and direct contact', value: 5 }
            ]
        },
        {
            type: 'list',
            name: 'noiseTolerance',
            message: 'How much pet noise can you tolerate? (1-5)',
            choices: [
                { name: '1. Silent', value: 1 },
                { name: '2. Minimal rustling/chirping', value: 2 },
                { name: '3. Occasional vocalizations (meows, low barks)', value: 3 },
                { name: '4. Moderate barking/noise', value: 4 },
                { name: '5. High noise tolerance (frequent barking okay)', value: 5 }
            ]
        }
    ]);

    // Calculate best match based on least distance
    let bestMatch = null;
    let minDistance = Infinity;

    for (const pet of petsData) {
        let distance = 0;
        for (const feature of Object.keys(userAnswers)) {
            distance += Math.abs(pet.features[feature] - userAnswers[feature]);
        }

        if (distance < minDistance) {
            minDistance = distance;
            bestMatch = pet;
        }
    }

    console.log("\n=========================================");
    console.log(`Recommended Decision: ${bestMatch.name}`);
    console.log(`Average Weight Range: ${bestMatch.weight_range_kg[0]} - ${bestMatch.weight_range_kg[1]} kg`);
    console.log(`Match Score Difference: ${minDistance.toFixed(2)} (Lower is better)`);
    console.log("=========================================\n");

    // Dynamic Learning: Adjust weights based on feedback
    const { rating } = await inquirer.prompt([
        {
            type: 'list',
            name: 'rating',
            message: 'Was this recommendation accurate for the inputs given? (1-5)',
            choices: ['1', '2', '3', '4', '5']
        }
    ]);

    const numericRating = parseInt(rating, 10);
    console.log(`\nThank you for your feedback! (Score recorded: ${numericRating}/5)`);

    // Learning Logic:
    // If user rates it 4 or 5, it means the features were a good match.
    // If rated 1 or 2, it was a bad match.
    // We adjust the pet's theoretical features slightly towards the user's answers if good,
    // or slightly away from the user's answers if bad.
    const LEARNING_RATE = 0.15;

    // Find the object
    const petToUpdate = petsData.find(p => p.name === bestMatch.name);

    let adjusted = false;
    if (numericRating >= 4) {
        // Reinforce towards user preferences
        for (const feature of Object.keys(userAnswers)) {
            const currentVal = petToUpdate.features[feature];
            const targetVal = userAnswers[feature];
            petToUpdate.features[feature] = currentVal + (targetVal - currentVal) * LEARNING_RATE;
        }
        adjusted = true;
    } else if (numericRating <= 2) {
        // Penalize away from user preferences
        for (const feature of Object.keys(userAnswers)) {
            const currentVal = petToUpdate.features[feature];
            const targetVal = userAnswers[feature];
            // Move opposite direction. Clamp to 1-5 range.
            let newVal = currentVal - (targetVal - currentVal) * LEARNING_RATE;
            newVal = Math.max(1, Math.min(5, newVal));
            petToUpdate.features[feature] = newVal;
        }
        adjusted = true;
    }

    if (adjusted) {
        petToUpdate.adjustmentsCount = (petToUpdate.adjustmentsCount || 0) + 1;
        saveDynamicData(petsData);
        console.log(`[System: Learning Module] Adapted internal logic based on your feedback (Adjustment #${petToUpdate.adjustmentsCount})`);
    } else {
        console.log("[System: Learning Module] Rating neutral. Logic remains unchanged.");
    }
}

module.exports = { runDynamicSelector };
