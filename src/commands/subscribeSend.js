const ow = require('ow');

module.exports = function (pubsub) {
    return {
        command: 'SUBSCRIBE_SEND',
        paramType: ow.object.exactShape({
            device: ow.string,
        }),
        run(client, {device}) {
            function sendHandler(data) {
                client.send({
                    command: 'SENT',
                    device, data,
                });
            }

            pubsub.on(`${device}/send`, sendHandler);
            client.once('close', () => pubsub.removeListener(`${device}/send`, sendHandler));
        },
    };
};
