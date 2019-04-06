const ow = require('ow');

module.exports = function (pubsub) {
    function run({device}, listener) {
        pubsub.on(`${device}/push`, data => listener({
            command: 'PUSHED',
            time: 0,
            device, data,
        }));
    }

    return {
        command: 'SUBSCRIBE_PUSH',
        paramType: ow.object.exactShape({
            device: ow.string,
        }),
        run,
    };
};
