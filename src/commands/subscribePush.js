const ow = require('ow');

module.exports = function (pubsub) {
    return {
        command: 'SUBSCRIBE_PUSH',
        paramType: ow.object.exactShape({
            device: ow.string,
        }),
        run(client, {device}) {
            function handlePush(data) {
                client.send({
                    command: 'PUSHED',
                    device, data,
                });
            }

            pubsub.on(`${device}/push`, handlePush);
            client.once('close', () => pubsub.removeListener(`${device}/push`, handlePush));
        },
    };
};
