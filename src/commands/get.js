const ow=require('ow');

module.exports = function (pubsub, store) {
    function run({device, start = 0, stop = 1} ) {
        store.lrange(device, start, stop).map((data, index) => listener({
            command: 'PUSHED',
            time: index + start,
            device, data,
        }));
    }

    return {
        command: 'GET',
        paramType: ow.object.exactShape({
            device: ow.string,
            start: ow.optional.number,
            stop: ow.optional.number,
        }),
        run,
    };
};
