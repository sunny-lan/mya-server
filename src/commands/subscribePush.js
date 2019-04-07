const ow = require('ow');

module.exports = function (pubsub) {
    const disposer = new WeakMap();

    function run({device}, listener) {
        function handler(data) {
            listener({
                command: 'PUSHED',
                time: 0,
                device, data,
            });
        }

        pubsub.on(`${device}/push`, handler);
        disposer.set(listener, () => pubsub.removeListener(`${device}/push`, handler));
    }

    return {
        command: 'SUBSCRIBE_PUSH',
        paramType: ow.object.exactShape({
            device: ow.string,
        }),
        run,
        dispose(listener) {
            if (disposer.has(listener))
                disposer.get(listener)();
        },
    };
};
