const path = require('path');

const express = require('express');
const expressWs = require('express-ws');
const session = require('express-session');

const generateToken = require('./auth/tokenCrypto');

const makeClientHandler = require('./commands');
const handleWebsocket = require('./connection/websocket');
const wrapJSON = require('./connection/json');

const makeAuthorizer = require('./auth/authorizer');

const makeMyapp = require('./myapp/myapp');
const makeAuthorizedMyapp = require('./myapp/authorized');
const makeMyappEndpoint = require('./myapp/expressEndpoint');

const makeUserManager = require('./auth/users');
const makeUsersEndpoint = require('./auth/usersEndpoint');

/**
 *
 * @param pubsub
 * @param store
 * @param fileStore
 * @param sessionStore optional
 */
module.exports = function makeAppInstance(pubsub, store, fileStore, sessionStore) {
    const app = express();
    expressWs(app);

    app.set('views', path.join(__dirname, '../views'));
    app.set('view engine', 'ejs');

    app.use(express.urlencoded({
        extended: true
    }));
    app.use(express.static('public'));
    app.use(session({
        secret: process.env.SESSION_SECRET,
        saveUninitialized: false,
        sessionStore,
        resave: false,
    }));

    const authorizer = makeAuthorizer(store);

    //handle websocket connections
    const handleClient = makeClientHandler(pubsub, store);
    app.ws('/ws', ws => handleClient(wrapJSON(handleWebsocket(ws))));

    //user stuff
    const userManager = makeUserManager(store);
    app.use('/user', makeUsersEndpoint(userManager));

    //myapp stuff
    const myapp = makeMyapp(store, fileStore, generateToken);
    const authMyapp = makeAuthorizedMyapp(myapp, authorizer);
    app.use('/myapp', makeMyappEndpoint(authMyapp));

    //TODO add error handler to express

    return app;
};
