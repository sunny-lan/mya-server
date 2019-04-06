const app = require('./app');
const makePubsub = require('./pubsub/eventemitter');
const makeStore = require('./store');

const appInstance = app(makePubsub(), makeStore());

appInstance.listen(process.env.PORT || 1234);
