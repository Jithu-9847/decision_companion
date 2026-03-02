const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const csv = require('csv-parser');
const { createObjectCsvWriter } = require('csv-writer');
const chalk = require('chalk');
const ora = require('ora');
require('dotenv').config();

const DATA_PATH = path.join(__dirname, '../data/destinations.csv');

const questionsPool = [
    { key: 'adventure_level', message: 'On a scale of 1-5, how much adventure and thrill are you seeking?' },
    { key: 'relaxation_level', message: 'How important is relaxation and unwinding for this trip? (1-5)' },
    { key: 'cultural_immersion', message: 'How deeply do you want to immerse yourself in the local culture? (1-5)' },
    { key: 'nightlife', message: 'How vibrant should the nightlife be at your destination? (1-5)' },
    { key: 'nature_focused', message: 'How important is it to be surrounded by nature? (1-5)' },
    { key: 'family_friendly', message: 'How family-friendly does the destination need to be? (1-5)' },
    { key: 'culinary_experience', message: 'How much do you care about the local culinary experience? (1-5)' },
    { key: 'historical_significance', message: 'How interested are you in visiting historical landmarks? (1-5)' },
    { key: 'modern_infrastructure', message: 'How much do you value modern infrastructure and conveniences? (1-5)' },
    { key: 'budget_friendliness', message: 'How budget-friendly do you need this trip to be? (1-5)' },
    { key: 'safety_level', message: 'How high is your priority for overall safety in the destination? (1-5)' },
    { key: 'shopping_opportunities', message: 'How important are shopping opportunities to you? (1-5)' },
    { key: 'beach_access', message: 'Do you want easy access to beautiful beaches? (1-5)' },
    { key: 'mountain_access', message: 'How much do you want to explore mountains during your trip? (1-5)' },
    { key: 'wildlife_viewing', message: 'How interested are you in wildlife viewing and safaris? (1-5)' },
    { key: 'public_transport_ease', message: 'How crucial is an easy-to-use public transportation system? (1-5)' },
    { key: 'english_speaking_prevalence', message: 'How important is it that English is widely spoken? (1-5)' },
    { key: 'weather_warmth', message: 'Do you prefer cold (1) or hot (5) weather?' },
    { key: 'weather_humidity', message: 'Do you prefer dry (1) or humid (5) climate?' },
    { key: 'photography_appeal', message: 'How important is the destination for stunning photography? (1-5)' },
    { key: 'romantic_vibe', message: 'Are you looking for a romantic vibe? (1-5)' },
    { key: 'solo_travel_friendly', message: 'How important is it that the place is good for solo travelers? (1-5)' },
    { key: 'nightlife_variety', message: 'Do you want a large variety of nightlife options? (1-5)' },
    { key: 'wellness_and_spa', message: 'How much do you prioritize wellness retreats and spas? (1-5)' },
    { key: 'art_and_museums', message: 'Are you looking forward to exploring art galleries and museums? (1-5)' },
    { key: 'outdoor_sports', message: 'How interested are you in outdoor sports like skiing or surfing? (1-5)' },
    { key: 'road_trip_potential', message: 'How likely are you to go on scenic road trips? (1-5)' },
    { key: 'diverse_landscapes', message: 'Do you want to see diverse landscapes in one trip? (1-5)' },
    { key: 'architectural_beauty', message: 'How important is architectural beauty to you? (1-5)' },
    { key: 'local_festivals', message: 'Are you interested in attending local festivals and events? (1-5)' }
];

function loadDestinations() {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(DATA_PATH)
            .pipe(csv())
            .on('data', (data) => {
                const name = data.name;
                const specialties = data.specialties ? data.specialties.split('|') : [];
                const budget_needed = [parseInt(data.budget_needed_min), parseInt(data.budget_needed_max)];
                const adjustmentsCount = parseInt(data.adjustmentsCount) || 0;
                const features = {};
                for (const q of questionsPool) {
                    features[q.key] = parseFloat(data[q.key]) || 3.0;
                }
                results.push({ name, specialties, budget_needed, features, adjustmentsCount });
            })
            .on('end', () => resolve(results))
            .on('error', (err) => reject(err));
    });
}

function saveDestinations(data) {
    return new Promise((resolve, reject) => {
        const header = [
            { id: 'name', title: 'name' },
            { id: 'specialties', title: 'specialties' },
            { id: 'budget_needed_min', title: 'budget_needed_min' },
            { id: 'budget_needed_max', title: 'budget_needed_max' },
            ...questionsPool.map(q => ({ id: q.key, title: q.key })),
            { id: 'adjustmentsCount', title: 'adjustmentsCount' }
        ];

        const csvWriter = createObjectCsvWriter({
            path: DATA_PATH,
            header: header
        });

        const records = data.map(item => {
            const record = {
                name: item.name,
                specialties: item.specialties.join('|'),
                budget_needed_min: item.budget_needed[0],
                budget_needed_max: item.budget_needed[1],
                adjustmentsCount: item.adjustmentsCount || 0
            };
            for (const q of questionsPool) {
                record[q.key] = item.features[q.key];
            }
            return record;
        });

        csvWriter.writeRecords(records)
            .then(() => resolve())
            .catch(err => reject(err));
    });
}

// Selects N random unique elements from an array
function getRandomQuestions(array, num) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
}

async function runTravelEngine() {
    const destinations = await loadDestinations();

    console.log(chalk.bold.magenta("\n  Welcome to your one and only AI Travel Decision Companion \n"));

    // Mandatory Questions
    const mandatoryQuestions = [
        {
            type: 'input',
            name: 'country',
            message: chalk.cyan('Where do you want to travel? Enter country (or type "any"):'),
            default: 'any'
        },
        {
            type: 'input',
            name: 'state',
            message: chalk.cyan('Enter state or region (or type "any"):'),
            default: 'any'
        },
        {
            type: 'input',
            name: 'budget',
            message: chalk.cyan('What is your expected total budget (in Rupees ₹)?'),
            validate: input => !isNaN(parseInt(input, 10)) ? true : chalk.red('Please enter a valid number')
        },
        {
            type: 'input',
            name: 'persons',
            message: chalk.cyan('How many persons are traveling?'),
            validate: input => !isNaN(parseInt(input, 10)) && parseInt(input, 10) > 0 ? true : chalk.red('Please enter a valid number greater than 0'),
            default: '1'
        }
    ];

    const mandatoryAnswers = await inquirer.prompt(mandatoryQuestions);
    const targetCountry = mandatoryAnswers.country.toLowerCase().trim();
    const targetState = mandatoryAnswers.state.toLowerCase().trim();
    const totalBudget = parseInt(mandatoryAnswers.budget, 10);
    const personsCount = parseInt(mandatoryAnswers.persons, 10);

    // AI Check: Determine if the dataset has anything matching the requested country/state
    let hasMatch = false;
    if (totalBudget == 0 || personsCount == 0 || totalBudget < 100 || totalBudget < 0 || personsCount < 0) {
        console.log(chalk.yellow(`
        The given inputs are invalid. Please try again.
        `));
        return;
    }
    for (const dest of destinations) {
        const destNameLower = dest.name.toLowerCase();
        if (targetCountry !== 'any' && destNameLower.includes(targetCountry)) {
            hasMatch = true;
            break;
        }
        if (targetState !== 'any' && destNameLower.includes(targetState)) {
            hasMatch = true;
            break;
        }
    }

    if ((targetCountry !== 'any' || targetState !== 'any') && !hasMatch) {
        console.log(chalk.yellow(`\nNo destinations found in our database for your specified location.`));
        let apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            const answer = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'apiKey',
                    message: chalk.cyan('Please enter your Gemini API Key (or press enter to skip):')
                }
            ]);
            apiKey = answer.apiKey.trim();
        }

        if (apiKey) {
            const spinner = ora(chalk.yellow('We are fetching some destinations for you, Please step back for a moment...')).start();
            try {
                const { GoogleGenAI } = require('@google/genai');
                const ai = new GoogleGenAI({ apiKey: apiKey });

                const promptText = `
                    I need 10 popular tourist destinations in ${targetState !== 'any' ? targetState : ''} ${targetCountry !== 'any' ? targetCountry : ''}.
                    Respond ONLY with a valid JSON array of objects. Do NOT use markdown code blocks like \`\`\`json. Just the raw JSON.
                    Each object must have exactly these keys:
                    - "name": string (e.g., "City Name, Country")
                    - "specialties": string (e.g., "Item1|Item2|Item3" - separated by pipes, no spaces around pipes)
                    - "budget_needed_min": number (in INR, reasonable minimum group budget)
                    - "budget_needed_max": number (in INR, reasonable maximum group budget)
                    And the following 30 feature keys with numerical values from 1.0 to 5.0 (decimals allowed, e.g. 3.5):
                    ${questionsPool.map(q => `"${q.key}"`).join(', ')}.
                    Make the features realistic for the destination.
                    `;

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: promptText,
                });
                let text = response.text.trim();
                if (text.startsWith('\`\`\`json')) {
                    text = text.substring(7);
                }
                if (text.startsWith('\`\`\`')) {
                    text = text.substring(3);
                }
                if (text.endsWith('\`\`\`')) {
                    text = text.substring(0, text.length - 3);
                }
                text = text.trim();

                const newDestinations = JSON.parse(text);

                let addedCount = 0;
                for (const nd of newDestinations) {
                    const features = {};
                    for (const q of questionsPool) {
                        features[q.key] = Number(nd[q.key]) || 3.0;
                    }

                    let finalName = nd.name;
                    if (targetCountry !== 'any' && !finalName.toLowerCase().includes(targetCountry)) {
                        // Capitalize first letter for visual
                        const displayCountry = targetCountry.charAt(0).toUpperCase() + targetCountry.slice(1);
                        finalName += ` (${displayCountry})`;
                    }
                    if (targetState !== 'any' && !finalName.toLowerCase().includes(targetState)) {
                        const displayState = targetState.charAt(0).toUpperCase() + targetState.slice(1);
                        finalName += ` (${displayState})`;
                    }

                    destinations.push({
                        name: finalName,
                        specialties: nd.specialties ? nd.specialties.split('|') : [],
                        budget_needed: [Number(nd.budget_needed_min) || 1000, Number(nd.budget_needed_max) || 5000],
                        features: features,
                        adjustmentsCount: 0
                    });
                    addedCount++;
                }

                if (addedCount > 0) {
                    await saveDestinations(destinations);
                    spinner.succeed(chalk.green(`Successfully added ${addedCount} new destinations using AI!`));
                } else {
                    spinner.fail(chalk.red('Failed to parse any destinations from AI.'));
                }

            } catch (error) {
                spinner.fail(chalk.red('Error communicating with Gemini API: ' + error.message));
            }
        } else {
            console.log(chalk.yellow('Skipping AI generation.'));
        }

    }

    console.log(chalk.bold.green("\nGreat! Now let's figure out your preferences. I will ask you 10 questions."));
    console.log(chalk.gray("Please answer on a scale from 1 to 5.\n"));

    const selectedQuestions = getRandomQuestions(questionsPool, 10);

    // Build inquiries
    const prompts = selectedQuestions.map(q => ({
        type: 'list',
        name: q.key,
        message: q.message,
        choices: ['1', '2', '3', '4', '5']
    }));

    const rawAnswers = await inquirer.prompt(prompts);
    const userAnswers = {};
    for (const key in rawAnswers) {
        userAnswers[key] = parseInt(rawAnswers[key], 10);
    }

    // Fuzzy matching logic
    // We only compare the features that we actually asked about.
    let bestMatch = null;
    let minDistance = Infinity;

    let candidates = destinations;
    const locationFiltered = destinations.filter(dest => {
        const destNameLower = dest.name.toLowerCase();
        let match = true;
        if (targetCountry !== 'any' && !destNameLower.includes(targetCountry)) match = false;
        if (targetState !== 'any' && !destNameLower.includes(targetState)) match = false;
        return match;
    });

    if (locationFiltered.length > 0) {
        candidates = locationFiltered;
    }

    for (const dest of candidates) {
        let distance = 0;
        for (const feature of Object.keys(userAnswers)) {
            distance += Math.abs(dest.features[feature] - userAnswers[feature]);
        }

        // Approximate cost for the group
        const estimatedGroupMinBudget = dest.budget_needed[0] * personsCount;
        if (totalBudget < estimatedGroupMinBudget) {
            // Add distance penalty proportionally, scaled down
            distance += ((estimatedGroupMinBudget - totalBudget) / 100);
        }

        if (distance < minDistance) {
            minDistance = distance;
            bestMatch = dest;
        }
    }

    const spinner = ora(chalk.yellow('Analyzing your preferences through the fuzzy logic engine...')).start();
    await new Promise(resolve => setTimeout(resolve, 1500)); // Fake realistic delay for UX
    spinner.succeed(chalk.green('Analysis Complete!'));

    console.log(chalk.bold.magenta("\n========================================="));
    console.log(chalk.bold.magenta("                RESULT                   "));
    console.log(chalk.bold.magenta("========================================="));
    console.log(`${chalk.bold.blue('🌍 Recommended Destination:')} ${chalk.bold.white(bestMatch.name)}`);
    console.log(`${chalk.bold.yellow('✨ Specialties:')} ${bestMatch.specialties.join(', ')}`);

    // Scale the estimated budget for the group size
    const groupMin = bestMatch.budget_needed[0] * personsCount;
    const groupMax = bestMatch.budget_needed[1] * personsCount;

    if (totalBudget < groupMin) {
        console.log(chalk.bold.red(`\nNote: There are no places that you can explore using the given budget.`));
        console.log(chalk.bold.red(`Even though by your preferences the place I suggest is this, you will need a higher budget.`));
    }

    console.log(`${chalk.bold.green('💰 Estimated Budget (for ' + personsCount + ' person(s)):')} ₹${groupMin} - ₹${groupMax}`);
    console.log(chalk.bold.magenta("=========================================\n"));

    // Dynamic Learning & Feedback Loop
    const { isGoodDecision } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'isGoodDecision',
            message: 'Is this a good decision / recommendation for you?',
            default: true
        }
    ]);

    const LEARNING_RATE = 0.2;

    if (isGoodDecision) {
        console.log(chalk.bold.green(`\nAwesome! I am glad you liked the recommendation.`));
        console.log(chalk.dim(`[Learning Module] Slightly adjusting ${bestMatch.name} to match these preferences closer.`));

        const destToUpdate = destinations.find(d => d.name === bestMatch.name);
        for (const feature of Object.keys(userAnswers)) {
            const currentVal = destToUpdate.features[feature];
            const targetVal = userAnswers[feature];
            let newVal = currentVal + (targetVal - currentVal) * LEARNING_RATE;
            destToUpdate.features[feature] = Math.max(1, Math.min(5, Number(newVal.toFixed(2))));
        }
        destToUpdate.adjustmentsCount = (destToUpdate.adjustmentsCount || 0) + 1;
        await saveDestinations(destinations);

    } else {
        console.log(chalk.bold.yellow(`\nI see. Let's fix that so I can learn from this!`));

        const { preferredDestName } = await inquirer.prompt([
            {
                type: 'input',
                name: 'preferredDestName',
                message: chalk.cyan('Where do you think you should actually travel based on these preferences?')
            }
        ]);

        let targetDest = destinations.find(d => d.name.toLowerCase() === preferredDestName.toLowerCase());

        if (targetDest) {
            console.log(chalk.dim(`[Learning Module] Found ${targetDest.name} in database. Adjusting its weights significantly towards your answers.`));
        } else {
            console.log(chalk.dim(`[Learning Module] New destination detected: ${preferredDestName}. Adding to database!`));
            // Initialize with default mid values
            const defaultFeatures = {};
            for (const q of questionsPool) {
                defaultFeatures[q.key] = 3.0;
            }

            targetDest = {
                name: preferredDestName,
                specialties: ["User Added Preference"],
                budget_needed: [1000, 5000],
                features: defaultFeatures,
                adjustmentsCount: 0
            };
            destinations.push(targetDest);
        }

        // Apply a stronger learning rate for explicit user preference
        const STRONG_LEARNING_RATE = 0.5;
        for (const feature of Object.keys(userAnswers)) {
            const currentVal = targetDest.features[feature];
            const targetVal = userAnswers[feature];
            let newVal = currentVal + (targetVal - currentVal) * STRONG_LEARNING_RATE;
            targetDest.features[feature] = Math.max(1, Math.min(5, Number(newVal.toFixed(2))));
        }
        targetDest.adjustmentsCount = (targetDest.adjustmentsCount || 0) + 1;

        await saveDestinations(destinations);
        console.log(chalk.bold.green("Database updated successfully! I'll be smarter next time."));
    }
}

module.exports = { runTravelEngine };
