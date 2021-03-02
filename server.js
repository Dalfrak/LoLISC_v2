// index.js

/**
 * Required External Modules
 */

const express = require('express');

const cookieParser = require('cookie-parser');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const update = require('./routes/update_data');
const calculate = require('./resources/calculate_efficiency.js')

/**
 * App Variables
 */

const app = express();
const port = process.env.port || '8000';

/**
 *  App Configuration
 */

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Routes Definitions
 */

app.get('/', (req, res) => {
    const link = 'https://ddragon.leagueoflegends.com/api/versions.json';
    const lolPatch = JSON.parse(fs.readFileSync('./resources/lol_patch.json', 'utf8'));
    axios.get(link)
        .then(response => {
            if (response.data[0] != lolPatch.data) {
                console.log('Patch is outdated, starting update!');
                res.statusCode = 302;
                res.cookie('patch', response.data[0]);
                res.setHeader('Location', '/update');
                return res.end();
            } else {
                console.log('Patch is OK!');
                res.cookie('patch', response.data[0]);
                res.render('index', { title: 'Home', patch: response.data[0], itemStats: calculate.importItemStats() });
            }
        })
        .catch(error => {
            console.log(error);
        });
});

app.use('/update', update);

/**
 * Server Activation
 */

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
