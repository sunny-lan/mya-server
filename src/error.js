module.exports.MyaError = class MyaError extends Error {
    constructor(message, myaCode, cause) {

        // Calling parent constructor of base Error class.
        super(message);

        // Saving class name in the property of our custom error as a shortcut.
        this.name = 'MyaError';

        // Capturing stack trace, excluding constructor call from it.
        Error.captureStackTrace(this, this.constructor);

        this.myaCode = myaCode;
        this.cause = cause;
    }

    toString() {
        let res = super.toString();
        if (this.cause)
            res += `. Cause:\n    ${this.cause.toString()}`;
        return res;
    }
};

module.exports.isFatal=function isFatal(error){
    return error.name === 'MyaError' || error.myaCode === 'DEADBEEF';
};

/**
 * Used to handle fatal errors and implementation errors
 * Logs the error and then kills the program
 * @param error the error
 */
module.exports.fail = function fail(error) {
    console.error(error);
    process.exit(-1);
};
