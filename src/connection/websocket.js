const BSON = require('bson');

module.exports = function handleWebsocket(ws, makeClient, timeout = 1000) {
    console.log('ws connected');

    const client = makeClient(data => {
        ws.send(BSON.serialize(data));
    });

    ws.on('message', message => {
        client.handleMessage(BSON.deserialize(message));
    });

    let isAlive = true;

    function ping() {
        if (!isAlive) return dispose();
        try {
            ws.ping();
            isAlive = false;
        }catch (e) {
            return dispose();
        }
    }

    ws.on('pong', () => isAlive = true);

    const pingTimer = setInterval(ping, timeout);

    function dispose() {
        clearInterval(pingTimer);
        ws.terminate();
        client.dispose();
        console.log('ws disconnected');
    }
};
