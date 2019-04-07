const ow = require('ow');

module.exports = function (pubsub, store) {
    function run({device, data, history = 10}) {
        store.lpush(device, data, history);
        pubsub.emit(`${device}/push`, data);
    }

    return {
        command: 'PUSH',
        paramType: ow.object.exactShape({
            device: ow.string,
            data: ()=>true,
            history: ow.optional.number,
        }),
        run,
        dispose(){},
    };
};
