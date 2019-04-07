const ow = require('ow');

module.exports = function (pubsub) {
    function run({device, data}) {
        pubsub.emit(`${device}/send`, data);
    }

    return {
        command: 'SEND',
        paramType: ow.object.exactShape({
            device: ow.string,
            data: () => true,
        }),
        run,
        dispose(){},
    };
};
