const app = require('./app');
const makePubsub = require('./pubsub/eventemitter');
const makeStore = require('./store/memory');
const makeFileStore = require('./fileStore/fromStore');

const port = process.env.PORT;
if(!port){
    throw new Error('No port specified');
}

const store = makeStore();
const fileStore = makeFileStore(store);
const appInstance = app(makePubsub(), store, fileStore);

if (process.env.NODE_ENV !== 'production') {
    const debug = require('./debug');
    debug(appInstance, store);
}

appInstance.listen(port, () => console.log(`Listening on port ${port}`));
