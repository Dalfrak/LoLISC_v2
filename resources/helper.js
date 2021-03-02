const fs = require('fs');
const path = require('path');

function importItemStats() {
    return JSON.parse(fs.readFileSync('./resources/item_stats.json', 'utf8'));
}

function getRandomBG() {
    files = fs.readdirSync(path.resolve(__dirname, '../public/img/splash'));
    return files[Math.floor(Math.random() * files.length)];
}

module.exports = { importItemStats, getRandomBG };

