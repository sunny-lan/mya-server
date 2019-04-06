const ow=require('ow');

const makeSubscribePush = require('./subscribePush');
const makeSubscribeSend = require('./subscribeSend');
const makePush = require('./push');
const makeSend = require('./send');
const makeGet = require('./get');

module.exports = function makeCommandHandler(pubsub, store) {
    function makeClient(listener) {
        const subscribed = {};
        let disposed = false;

        //wrap pubsub so that it we can dispose listeners on disconnect
        const wrappedPubSub = {
            on(event, listener) {
                if (subscribed[event]) return;
                subscribed[event] = true;
                pubsub.on(event, listener);
            },
            emit(event, data) {
                pubsub.emit(event, data);
            }
        };

        function dispose() {
            if (disposed)
                throw new Error('This handler has already been disposed');

            disposed = true;
            Object.keys(subscribed)
                .forEach(event => pubsub.removeListener(event, listener));
        }

        const commands = {};

        function addCommand(commandModule) {
            commands[commandModule.command] = commandModule;
        }

        addCommand(makeSubscribePush(wrappedPubSub));
        addCommand(makeSubscribeSend(wrappedPubSub));
        addCommand(makePush(wrappedPubSub, store));
        addCommand(makeSend(wrappedPubSub));
        addCommand(makeGet(wrappedPubSub, store));


        function handleMessage(message) {
            if (disposed)
                throw new Error('This handler has already been disposed');

            const commandModule = commands[message.command];
            if (commandModule) {
                delete message.command;
                ow(message, commandModule.paramType);
                commandModule.run(message, listener);
            } else {
                throw new Error(`Command ${message.command} does not exist`);
            }
        }

        function handleMessageError(message) {
            try {
                handleMessage(message);
            } catch (error) {
                listener({
                    command: 'ERROR',
                    error: error.message,
                });
            }
        }

        return {
            handleMessage: handleMessageError,
            dispose,
        }
    }

    return makeClient;
};
