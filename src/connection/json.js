const EventEmitter = require('events');

module.exports = function wrapJSON(client) {
    const emitter = new EventEmitter();
    client.on('message', message => {
        try {
            message = JSON.parse(message);
        } catch (err) {
            emitter.send('Invalid JSON');
            //TODO better error handling
            console.error('Client sent invalid json', err);
            return;
        }
        emitter.emit('message', message);
    });
    emitter.send = function send(message) {
        client.send(JSON.stringify(message));
    };
    return emitter;
};
