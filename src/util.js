const {fail, isFatal} = require("./error");

module.exports.asyncMiddleware = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
        if (isFatal(err))
            fail(err);
        else
            next(err);
    });
};
