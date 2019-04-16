const ow = require('ow');

module.exports = function makeDebug(pubsub) {
    return {
        command: 'DEBUG',
        paramType: ow.object.exactShape({}),
        run(client, {}) {
            function handleMessage(message) {
                client.send(message)
            }

            pubsub.on('message', handleMessage);
            client.once('close', () => pubsub.removeListener('message', handleMessage));
        },
    };
};
