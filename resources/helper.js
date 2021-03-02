const fs = require('fs');
const path = require('path');

function importItemStats() {
    return JSON.parse(fs.readFileSync('./resources/item_stats.json', 'utf8'));
}

function getRandomBG() {
    const dirPath = path.resolve(__dirname, '../public/img/splash');
    fs.readdir(dirPath, (err, files) => {
        if (err) throw err
        // console.log(files[Math.floor(Math.random() * files.length)]);
        return files[Math.floor(Math.random() * files.length)];
    });
}

module.exports = { importItemStats, getRandomBG };

