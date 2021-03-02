const express = require('express');
const axios = require('axios');
const path = require('path');
const tar = require('tar');
const fs = require('fs');
const fse = require('fs-extra');

const calculate = require('../resources/calculate_efficiency.js')

const router = express.Router();

const link = (patch) => `https://ddragon.leagueoflegends.com/cdn/dragontail-${patch}.tgz`;

let updating = false;

function removeDir(path) {
    if (fs.existsSync(path)) {
        const files = fs.readdirSync(path);

        if (files.length > 0) {
            files.forEach(function (filename) {
                const dir = `${path}/${filename}`;
                if (fs.statSync(dir).isDirectory()) removeDir(dir);
                else fs.unlinkSync(dir);
            })
            fs.rmdirSync(path);
        } else {
            fs.rmdirSync(path);
        }
    } else {
        console.log("Directory path not found.");
    }
}

function updateTarballFile(patch) {
    console.log('Downloading file ...');
    const file_path = path.resolve(__dirname, '../resources', 'last_lol_data.tgz');
    const writer = fs.createWriteStream(file_path);

    axios.get(link(patch), { responseType: 'stream' })
        .then(response => {
            console.log('Tarball downloaded!\nSaving ...');
            response.data.pipe(writer);

            writer.on('finish', () => {
                console.log('Tarball Saved!');
                decompressTarball(patch);
            });
            writer.on('error', (error) => {
                console.log(error);
            });
        })
        .catch(error => {
            console.log(error);
        });
}

function decompressTarball(patch) {
    console.log('Decompressing Tarball ...');
    const file_path = path.resolve(__dirname, '../resources', 'last_lol_data.tgz');
    const dest_path = path.resolve(__dirname, '../resources/last_lol_data');

    const img_path = path.resolve(__dirname, `../resources/last_lol_data/${patch}/img/item`);
    const img_dest_path = path.resolve(__dirname, '../public/img/item');

    const maps_path = path.resolve(__dirname, `../resources/last_lol_data/${patch}/img/map`);
    const maps_dest_path = path.resolve(__dirname, '../public/img/maps');

    console.log('\tRemoving existing patch files ...');
    removeDir(dest_path);
    removeDir(img_dest_path);
    removeDir(maps_dest_path);

    console.log('\tCreating destination directory ...');
    fs.mkdir(dest_path, (err) => { if (err) throw err; });

    console.log('\tDecompressing ...');
    tar.extract({ file: file_path, C: dest_path, newer: true })
        .then(_ => {
            console.log('Tarball Decompressed!');
            console.log('Moving directories ...');
            console.log('Images ...');
            fse.moveSync(img_path, img_dest_path, { overwrite: true }, (err) => { if (err) throw err });
            console.log('Maps ...');
            fse.moveSync(maps_path, maps_dest_path, { overwrite: true }, (err) => { if (err) throw err });
            console.log('... Directories moved successfully!');
            updating = false;
            calculate.calculateEfficiency(patch)
        })
        .catch(error => { console.log(error); });
}

router.get('/', (req, res) => {
    const patch = req.cookies['patch'];
    if (!updating) {
        updating = true;
        fs.writeFileSync('./resources/lol_patch.json', JSON.stringify({ data: patch }));
        updateTarballFile(patch);
    }
    res.statusCode = 302;
    res.setHeader('Location', '/');
    return res.end();
});

module.exports = router;
