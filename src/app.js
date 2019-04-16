const path = require('path');

const express = require('express');
const expressWs = require('express-ws');

const makeCommandHandler = require('./commands');
const handleWebsocket = require('./connection/websocket');
const wrapJSON = require('./connection/json');
const makeMyapp = require('./myapp');
const generateToken = require('./auth/tokenCrypto');
const makeMyappEndpoint = require('./myapp/expressEndpoint');

module.exports = function makeAppInstance(pubsub, store, fileStore) {
    const app = express();
    expressWs(app);

    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');

    app.use(express.urlencoded({
        extended: true
    }));
    app.use(express.static('public'));

    //handle websocket connections
    const makeClient = makeCommandHandler(pubsub, store);
    app.ws('/ws', (ws, req) => {
        handleWebsocket(ws, wrapJSON(makeClient));
    });

    //myapp stuff
    const myapp = makeMyapp(store, fileStore, generateToken);
    app.use('/myapp', makeMyappEndpoint(myapp));

    return app;
};
