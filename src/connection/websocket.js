
module.exports = function handleWebsocket(ws, makeClient, timeout = 1000) {
    console.log('ws connected');

    const client = makeClient(data =>ws.send(data));

    ws.on('message', message => {
        try {
            client.handleMessage(message);
        }catch (error) {
            console.error('client did not respect protocol', error);
            dispose();
        }
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
