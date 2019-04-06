const ow = require('ow');

module.exports = function (pubsub) {
    function run({device}, listener) {
        pubsub.on(`${device}/send`, data => listener({
            command: 'SENT',
            device, data,
        }));
    }

    return {
        command: 'SUBSCRIBE_SEND',
        paramType: ow.object.exactShape({
            device: ow.string,
        }),
        run,
    };
};
