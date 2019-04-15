const ow = require('ow');

const makeSubscribePush = require('./subscribePush');
const makeSubscribeSend = require('./subscribeSend');
const makePush = require('./push');
const makeSend = require('./send');
const makeGet = require('./get');
const makeDebug=require('./debug');

/**
 * Handles mya commands
 * @param pubsub the message broker for the app
 * @param store the store for the app
 * @returns {function(*): {handleMessage, dispose}}
 */
module.exports = function makeCommandHandler(pubsub, store) {
    //initialize commands
    const commands = {};

    function addCommand(commandModule) {
        commands[commandModule.command] = commandModule;
    }

    addCommand(makeSubscribePush(pubsub));
    addCommand(makeSubscribeSend(pubsub));
    addCommand(makePush(pubsub, store));
    addCommand(makeSend(pubsub));
    addCommand(makeGet(pubsub, store));
    addCommand(makeDebug(pubsub));

    //TODO replace listener interface with channel interface (like in browser api)
    return function makeClient(listener) {
        function wrappedListener(data) {
            try {
                listener(data);
            } catch (error) {
                console.error('Error in listener');
                console.error(error);
                console.error(listener.toString());
                //TODO dispose listener
            }
        }

        let disposed = false;

        function dispose() {
            if (disposed)
                throw new Error('This handler has already been disposed');

            disposed = true;
            Object.keys(commands)
                .forEach(commandName => commands[commandName].dispose(wrappedListener))
        }

        function handleMessage(message) {
            if (disposed)
                throw new Error('This handler has already been disposed');

            //look for command in list of commands
            const commandModule = commands[message.command];

            pubsub.emit('message', message);

            //check if it actually exists
            if (commandModule) {
                //remove the command name from the params
                delete message.command;

                //validate params
                ow(message, commandModule.paramType);

                //run the command
                commandModule.run(message, wrappedListener);
            } else {
                throw new Error(`Command ${message.command} does not exist`);
            }
        }

        //wraps the command handler with error catch
        function handleMessageError(message) {
            try {
                handleMessage(message);
            } catch (error) {
                console.error(error);
                wrappedListener({
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
};
