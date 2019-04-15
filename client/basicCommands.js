module.exports = function makeBasicCommands(messageChannel) {
    function send(device, data) {
        messageChannel.send({
            command: 'SEND',
            device, data,
        });
    }

    function get(device) {
        messageChannel.send({
            command: 'GET',
            device,
        });
    }

    function subscribePush(device) {
        messageChannel.send({
            command: 'SUBSCRIBE_PUSH',
            device,
        });
    }

    return {send, get, subscribePush};
};
