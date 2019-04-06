module.exports = function makeLogger() {
    return {
        error: console.error,
        log: console.log,
    }
};
