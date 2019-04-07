const BSON = require('bson');

module.exports = function wrapBSON(makeClient) {
    return function makeClientWrapped(listener) {
        const client = makeClient(data => listener(BSON.serialize(data)));
        return {
            handleMessage(data) {
                client.handleMessage(BSON.deserialize(data));
            },
            dispose: client.dispose,
        };
    }
};
