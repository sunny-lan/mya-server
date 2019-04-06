const express = require('express');
const path = require('path');
const expressWs = require('express-ws');
const makeCommandHandler = require('./commands');
const handleWebsocket = require('./connection/websocket');

module.exports = function makeApp(pubsub, store) {
    const app = express();
    expressWs(app);

    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');

    app.use(express.static('public'));

    const makeClient = makeCommandHandler(pubsub, store);
    app.ws('/live', (ws, req) => {
        handleWebsocket(ws, makeClient);
    });

    return app;
};
