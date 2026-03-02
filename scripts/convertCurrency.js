const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { createObjectCsvWriter } = require('csv-writer');

const DATA_PATH = path.join(__dirname, '../data/destinations.csv');

const results = [];
let headersSet = false;
let header = [];

fs.createReadStream(DATA_PATH)
    .pipe(csv())
    .on('headers', (headers) => {
        header = headers.map(h => ({ id: h, title: h }));
        headersSet = true;
    })
    .on('data', (data) => {
        let min = parseInt(data.budget_needed_min);
        let max = parseInt(data.budget_needed_max);
        
        // If max budget is suspiciously low (like USD values often are), multiply by 83
        if (max <= 12000) {
            data.budget_needed_min = min * 83;
            data.budget_needed_max = max * 83;
        }
        results.push(data);
    })
    .on('end', async () => {
        const csvWriter = createObjectCsvWriter({
            path: DATA_PATH,
            header: header
        });
        
        await csvWriter.writeRecords(results);
        console.log('Successfully completed currency conversion.');
    });
