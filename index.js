const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch');
const webpush = require('web-push');
const path = require('path');

const vapid = require('./vapid.json');

const port = 8085;
const database = 'http://localhost:3000';

webpush.setVapidDetails('mailto:toto@toto.com', vapid.publicKey, vapid.privateKey);

const app = express();

app.use(bodyparser.json());
app.use(cors('*'));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/subscribe', async (req, res) => {
    const subscription = req.body;
    await fetch(`${database}/clients`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify(subscription)
    });

    res.status(201).json();

});

app.post('/send', async (req, res) => {
    const result = await fetch(`${database}/clients`);
    const data = await result.json();

    const payload = JSON.stringify({
       title: req.body.title,
       body: req.body.body,
    });

    data.map(sub => {
       webpush.sendNotification(sub, payload)
           .catch(console.error);
    });

    res.status(201).json();

});





app.listen(port, () => console.log('App listening on port : ', port));

