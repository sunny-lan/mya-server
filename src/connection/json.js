const BSON = require('bson');

module.exports = function wrapBSON(makeClient) {
    return function makeClientWrapped(listener) {
        const client = makeClient(data => listener(JSON.stringify(data)));
        return {
            handleMessage(data) {
                client.handleMessage(JSON.parse(data));
            },
            dispose: client.dispose,
        };
    }
};
