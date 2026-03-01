const fs = require('fs');
const path = require('path');

const pets = [
    { label: "Large Dog", f: { timeCommitment: 5, spaceRequired: 5, budget: 4, interactionLevel: 5, noiseTolerance: 4 } },
    { label: "Small Dog", f: { timeCommitment: 4, spaceRequired: 2, budget: 3, interactionLevel: 5, noiseTolerance: 3 } },
    { label: "Cat", f: { timeCommitment: 2, spaceRequired: 3, budget: 3, interactionLevel: 3, noiseTolerance: 1 } },
    { label: "Leopard Gecko", f: { timeCommitment: 1, spaceRequired: 1, budget: 2, interactionLevel: 1, noiseTolerance: 1 } },
    { label: "Hamster", f: { timeCommitment: 2, spaceRequired: 1, budget: 1, interactionLevel: 2, noiseTolerance: 2 } },
    { label: "Betta Fish", f: { timeCommitment: 1, spaceRequired: 1, budget: 1, interactionLevel: 1, noiseTolerance: 1 } },
    { label: "Community Fish Tank", f: { timeCommitment: 3, spaceRequired: 3, budget: 4, interactionLevel: 1, noiseTolerance: 1 } }
];

const generatedData = [];

// Generate variations
for (const pet of pets) {
    // 20 variations per pet
    for (let i = 0; i < 20; i++) {
        const sample = {
            label: pet.label,
            features: {}
        };
        for (const key in pet.f) {
            let val = pet.f[key];
            // 20% chance to vary by +/- 1
            if (Math.random() < 0.2) {
                val += (Math.random() > 0.5 ? 1 : -1);
                val = Math.max(1, Math.min(5, val));
            }
            sample.features[key] = val;
        }
        generatedData.push(sample);
    }
}

// Add some explicitly unique weird combinations so it learns
generatedData.push({ label: "Pet Rock", features: { timeCommitment: 1, spaceRequired: 1, budget: 1, interactionLevel: 1, noiseTolerance: 1 } });
generatedData.push({ label: "Pet Rock", features: { timeCommitment: 1, spaceRequired: 1, budget: 1, interactionLevel: 1, noiseTolerance: 1 } });

fs.writeFileSync(path.join(__dirname, '../data/rfData.json'), JSON.stringify(generatedData, null, 2));
console.log(`Generated ${generatedData.length} training samples.`);
