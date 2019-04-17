const ow = require('ow');

const {MyaError, fail} = require('../error');

const makeSubscribePush = require('./subscribePush');
const makeSubscribeSend = require('./subscribeSend');
const makePush = require('./push');
const makeSend = require('./send');
const makeGet = require('./get');
const makeDebug = require('./debug');

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

    /**
     * handles a client
     * @param client the client to handle
     * this must emit the 'message' event when the client sends a message.
     * it must contain a send function which does not throw exceptions
     * it must emit the 'close' event when the client disconnects
     * the close event should only ever be emitted once
     * after close is emitted, send will never be called, and no other events should be emitted
     */
    function handleClient(client) {
        //TODO make this less intrusive
        //replace client.send with anti-exception version
        const oldSend = client.send.bind(client);
        client.send = function sendGuarded(data) {
            try {
                console.log('send', data);
                oldSend(data);
            } catch (error) {
                fail(new MyaError('client.send is not allowed to throw exceptions', 'DEADBEEF', error));
            }
        };

        //listen to when the client closes, to prevent messages from sending after
        let closed = false;
        client.once('close', () => closed = true);

        /**
         * Handles a message from the client
         * @param message the message
         * @throws COMMAND_NOT_FOUND when the command does not exist
         * It can also throw errors when the command fails to run
         */
        function handleMessage(message) {
            if (closed)
                fail(new Error('Client cannot send messages after being closed'));

            //TODO for debugging purposes
            pubsub.emit('message', message);

            const commandName = message.command;
            delete message.command;

            //look for command in list of commands and check if exists
            const commandModule = commands[commandName];
            if (commandModule) {
                //TODO move this into the command modules
                //check params
                try {
                    ow(message, commandModule.paramType);
                } catch (error) {
                    throw new MyaError(`Invalid arguments passed to ${commandModule}`, 'INVALID_ARGUMENTS', error);
                }

                //run the command
                commandModule.run(client, message);
            } else {
                throw new MyaError(`Command ${commandName} does not exist`, 'COMMAND_NOT_FOUND');
            }
        }
        client.on('message', function handleMessageError(message) {
            //catch failed commands and send the error to the client
            try {
                handleMessage(message);
            } catch (error) {
                client.send({
                    command: 'ERROR',
                    error,
                });
            }
        });
    }

    return handleClient;
};
