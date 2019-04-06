const EventEmitter = require('events');

module.exports = function () {
    return new EventEmitter();
};
