const ow = require('ow');

module.exports = function (pubsub) {
    const disposer = new WeakMap();

    function run({device}, listener) {
        function handler(data) {
            listener({
                command: 'SENT',
                device, data,
            });
        }

        pubsub.on(`${device}/send`, handler);
        disposer.set(listener, () => pubsub.removeListener(`${device}/send`, handler));
    }

    return {
        command: 'SUBSCRIBE_SEND',
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
