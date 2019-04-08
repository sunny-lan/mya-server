const ow = require('ow');

module.exports = function makeDebug(pubsub) {
    const disposer = new WeakMap();

    function run({}, listener) {
        pubsub.on('message', listener);
        disposer.set(listener, () => pubsub.removeListener('message', listener));
    }

    return {
        command: 'DEBUG',
        paramType: ow.object.exactShape({
        }),
        run,
        dispose(listener) {
            if (disposer.has(listener))
                disposer.get(listener)();
        },
    };
};
