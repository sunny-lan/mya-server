const ow = require('ow');

module.exports = function (pubsub, store) {
    return {
        command: 'GET',
        paramType: ow.object.exactShape({
            device: ow.string,
        }),
        run(client, {device}) {
            store.lrange(device, 0, 1).map((data, index) => client.send({
                command: 'PUSHED',
                device, data,
            }));
        },
    };
};
