const ow = require('ow');

module.exports = function (pubsub, store) {
    return {
        command: 'PUSH',
        paramType: ow.object.exactShape({
            device: ow.string,
            data: () => true,
        }),
        run(client, {device, data}) {
            store.lpush(device, data, 1);
            pubsub.emit(`${device}/push`, data);
        },
    };
};
