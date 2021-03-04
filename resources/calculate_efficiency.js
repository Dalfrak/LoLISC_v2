const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');

function determineItemType(item) {
    // Set
    let categoryName = 'default';
    let categoryTitle = 'Default';

    if (item.gold.purchasable) {
        if (item.tags.includes('Consumable')) { // Consumables
            categoryName = 'consumable';
            categoryTitle = 'Consumables';
        } else if (item.tags.includes('Boots')) { // Boots
            categoryName = 'boots';
            categoryTitle = 'Boots';
        } else if (item.tags.includes('Trinket')) { // Trinkets
            categoryName = 'trinket';
            categoryTitle = 'Trinkets';
        } else if (item.description.includes('rarityMythic') && !item.into) { // Mythic
            categoryName = 'mythic';
            categoryTitle = 'Mythic Items';
        } else if ((!item.from || item.from.length == 0) && (!item.into || item.into.length == 0)) { // Starter
            categoryName = 'starter';
            categoryTitle = 'Starter Items';
        } else if (item.name != 'Sheen' && item.into && (!item.from || item.from.length == 0) && item.into.length > 0) { // Basic
            categoryName = 'basic';
            categoryTitle = 'Basic Items';
        } else if (item.from && item.into && (item.description.includes('passive') || item.from.length > 0) && item.into.length > 0) { // Epic
            categoryName = 'epic';
            categoryTitle = 'Epic Items';
        } else { // Legendary
            categoryName = 'legendary';
            categoryTitle = 'Legendary Items';
        }
    } else {
        categoryName = 'special';
        categoryTitle = 'Special Items';
    }
    return [categoryName, categoryTitle];
}

function getItemPriceFromStats(item, baseStatsPrice) {
    let itemPrice = 0;
    try {
        let test = item.description.split('</stats>')[0].split('<stats>')[1];
        if (test) {
            const testSplitted = test.split('<br>');
            for (const statLineNb in testSplitted) {

                const tmp = testSplitted[statLineNb].split('</attention>');
                const statValue = tmp[0].split('<attention>')[1];
                const isPercentage = statValue.substr(-1) == '%';
                const statName = tmp[1].trim();

                const correspondingBaseStat = baseStatsPrice.data.find(o => o.mainName == statName && o.isPercentage == isPercentage);
                itemPrice += correspondingBaseStat.value * parseFloat(statValue);
            }
            return parseFloat(itemPrice).toFixed(2);
        } else return itemPrice;
    } catch (error) {
        return itemPrice;
    }
}

function calculateGoldEfficiency(item, baseStatsPrice) {
    const totalStCost = getItemPriceFromStats(item, baseStatsPrice);
    const GE = totalStCost / item.gold.total;
    const res01 = (Math.round(GE * 100 * 100)) / 100;
    const res02 = -Math.round((item.gold.total - item.gold.total * GE) * 100) / 100;
    return { itemGoldEfficiency: isNaN(res01) ? 0 : res01, itemGoldEq: isNaN(res02) ? 0 : res02 };
}

function saveData(itemsStats) {
    const file = './resources/item_stats.json';
    if (fs.existsSync(file)) fse.moveSync(file, './resources/previous_stats.json', { overwrite: true });
    fs.writeFileSync(file, JSON.stringify(itemsStats), 'utf8');
    console.log('File Saved!');
}

function calculateEfficiency(patch) {
    console.log('Calculating ...');
    const pathBasePrices = path.resolve(__dirname, '../resources', 'base_prices.json');
    const pathItems = path.resolve(__dirname, `../resources/last_lol_data/${patch}/data/en_US`, 'item.json');
    const baseStatsPrice = JSON.parse(fs.readFileSync(pathBasePrices, 'utf8'));
    const items = JSON.parse(fs.readFileSync(pathItems, 'utf8')).data;

    let itemsStatistics = [];

    for (const key in items) {

        const item = items[key];
        const res = determineItemType(item);
        const tmp = calculateGoldEfficiency(item, baseStatsPrice);

        itemTmp = {
            categoryName: res[0],
            categoryTitle: res[1],
            itemName: item.name,
            price: item.gold.total,
            desc: item.description,
            maps: item.maps,
            goldEfficiency: tmp.itemGoldEfficiency,
            equivalentInGolds: tmp.itemGoldEq,
            previousEfficiency: 0, // TODO
            previousGolds: 0, // TODO
            itemImgLink: `/img/item/${item.image.full}`,
            wikiLink: `https://leagueoflegends.fandom.com/wiki/${item.name.replace(/\s+/g, '_').replace(/'/g, '%27')}`
        };

        let cat = itemsStatistics.find(o => o.cat === itemTmp.categoryName)

        if (!cat) cat = itemsStatistics[itemsStatistics.push({ cat: itemTmp.categoryName }) - 1];
        if (cat.itemList) cat.itemList.push(itemTmp);
        else cat.itemList = [itemTmp];
    }
    saveData(itemsStatistics);
}

module.exports = { calculateEfficiency };
