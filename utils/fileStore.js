const fs = require('fs');
const path = require('path');

/**
 * Utility to read and write JSON files.
 */

function ensureDirectoryExistence(filePath) {
    const dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}

function readJsonFile(filePath, defaultData = null) {
    try {
        if (!fs.existsSync(filePath)) {
            if (defaultData !== null) {
                writeJsonFile(filePath, defaultData);
                return defaultData;
            }
            return null;
        }
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error.message);
        return defaultData;
    }
}

function writeJsonFile(filePath, data) {
    try {
        ensureDirectoryExistence(filePath);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error(`Error writing ${filePath}:`, error.message);
        return false;
    }
}

module.exports = {
    readJsonFile,
    writeJsonFile
};
