const fs = require('fs');
const path = require('path');
const { createObjectCsvWriter } = require('csv-writer');

const jsonPath = path.join(__dirname, '../data/destinations.json');
const csvPath = path.join(__dirname, '../data/destinations.csv');

const rawData = fs.readFileSync(jsonPath, 'utf8');
const data = JSON.parse(rawData);

if (data.length === 0) {
    console.error("No data found.");
    process.exit(1);
}

// Extract the feature keys from the first record
const firstRecord = data[0];
const featureKeys = Object.keys(firstRecord.features);

const header = [
    { id: 'name', title: 'name' },
    { id: 'specialties', title: 'specialties' },
    { id: 'budget_needed_min', title: 'budget_needed_min' },
    { id: 'budget_needed_max', title: 'budget_needed_max' },
    ...featureKeys.map(k => ({ id: k, title: k })),
    { id: 'adjustmentsCount', title: 'adjustmentsCount' }
];

const csvWriter = createObjectCsvWriter({
    path: csvPath,
    header: header
});

const records = data.map(item => {
    const record = {
        name: item.name,
        specialties: item.specialties.join('|'), // use | to separate items in CSV
        budget_needed_min: item.budget_needed[0],
        budget_needed_max: item.budget_needed[1],
        adjustmentsCount: item.adjustmentsCount || 0
    };
    featureKeys.forEach(key => {
        record[key] = item.features[key] || 3.0; // default value if missing
    });
    return record;
});

csvWriter.writeRecords(records)
    .then(() => {
        console.log(`Successfully converted JSON to CSV. Dataset saved at ${csvPath}`);
    })
    .catch((err) => {
        console.error("Error writing CSV:", err);
    });
