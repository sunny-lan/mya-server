const ow = require('ow');

module.exports = function (pubsub) {
    return {
        command: 'SEND',
        paramType: ow.object.exactShape({
            device: ow.string,
            data: () => true,
        }),
        run(client, {device, data}) {
            pubsub.emit(`${device}/send`, data);
        },
    };
};
