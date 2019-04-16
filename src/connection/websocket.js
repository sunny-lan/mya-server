const EventEmitter = require('events');

module.exports = function makeWebsocketClient(ws, timeout = 1000) {
    console.log('ws connected');
    const emitter = new EventEmitter();

    ws.on('message', message => emitter.emit('message', message));

    let isAlive = true;

    function ping() {
        if (!isAlive) return dispose();
        try {
            ws.ping();
            isAlive = false;
        } catch (e) {
            return dispose();
        }
    }

    ws.on('pong', () => isAlive = true);

    const pingTimer = setInterval(ping, timeout);

    function dispose() {
        clearInterval(pingTimer);
        ws.terminate();
        emitter.emit('close');
        console.log('ws disconnected');
    }

    emitter.send = ws.send.bind(ws);

    return emitter;
};
