const app = require('./app');
const makePubsub = require('./pubsub/eventemitter');
const makeStore = require('./store/memory');
const makeLocalFileStore = require('./fileStore/local');
const {fail} = require("./error");

const port = process.env.PORT;
if (!port) {
    throw new Error('No port specified');
}

const store = makeStore();
const fileStore = makeLocalFileStore();
const appInstance = app(makePubsub(), store, fileStore);

if (process.env.NODE_ENV !== 'production') {
    const debug = require('./debug');
    debug(appInstance, store);
}

appInstance.listen(port, () => console.log(`Listening on port ${port}`));

process.on('uncaughtException', (err) => {
    fail(err);
});

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at:', p, 'reason:', reason);
    fail(p);
});
