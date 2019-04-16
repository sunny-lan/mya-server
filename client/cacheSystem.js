module.exports = function makeCacheSystem(messageChannel, mya) {
    const listeners = {};
    const dataCache = {};

    let open = false;

    messageChannel.on('open', function handleOpen() {
        //resend init requests upon ws open
        Object.keys(listeners).forEach(device => {
            if (listeners[device].length > 0) {
                mya.subscribePush(device);
                mya.get(device);
            }
        });
        open = true;
    });

    //TODO implement message history
    messageChannel.on('message', function handleMessage(message) {
        const {device, command, data} = message;
        if (command === 'PUSHED') {
            dataCache[device] = message.data;
            if (listeners.hasOwnProperty(device)) {
                listeners[device].forEach(callback => callback(data));
            }
        }
    });

    messageChannel.on('close', function handleClose() {
        open = false;
    });

    return {
        deviceData: dataCache,
        addListener(device, callback) {
            //run init if not already subscribed
            if (!listeners.hasOwnProperty(device)) {
                listeners[device] = [];
                if (open) {//if channel is open, send request now
                    mya.subscribePush(device);
                    mya.get(device);
                }
            }

            //cannot register same listener twice
            if (listeners[device].includes(callback))
                throw new Error('Cannot register the same listener twice');

            //feed cached data
            if (dataCache[device])
                callback(dataCache[device]);

            //add callback to list
            listeners[device].push(callback);
        },
        removeListener(device, callback) {
            const idx = listeners[device].indexOf(callback);
            if (idx === -1)
                throw new Error('Listener you are trying to remove does not exist');
            listeners[device].splice(callback, 1);
        },
        onOpen(callback) {
            messageChannel.on('open', callback);
        },
        onClose(callback) {
            messageChannel.on('close', callback);
        },
        get open() {
            return open;
        },
    };
};
