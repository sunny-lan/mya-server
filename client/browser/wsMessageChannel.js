const EventEmitter = require('event-emitter');

module.exports = function makeWsMessageChannel(address, reconnect = 5000) {
    const channel = EventEmitter();

    function connect() {
        const ws = new WebSocket(address);

        ws.onopen = () => channel.emit('open');

        ws.onmessage = function handleMessage(e) {
            channel.emit('message', JSON.parse(e.data));
        };

        channel.send = function send(data) {
            ws.send(JSON.stringify(data));
        };

        function handleClose(e) {
            console.log(`Socket is closed. Reconnect will be attempted in ${reconnect} ms.`, e.reason);
            channel.emit('close');
            setTimeout(connect, reconnect);
        }

        ws.onclose = handleClose;

        ws.onerror = function handleError(err) {
            console.error('Socket encountered error: ', err.message, 'Closing socket');
            ws.close();
        }
    }

    connect();

    return channel;
};
