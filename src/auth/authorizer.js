const {MyaError} = require("../error");

/**
 * utility thing to make authorization easy
 * @param store
 */
module.exports = function makeAuthorizer(store) {
    function key(tag, client) {
        if (!tag) throw new Error('Auth calls must use tag');
        return `auth:${tag}:${client}`;
    }

    function isAuthorized(tag, client, object) {
        return store.sismember(key(tag, client), object);
    }

    return {
        isAuthorized,
        authorize(tag, client, object) {
            store.sadd(key(tag, client), object);
        },
        assert(tag, client, object) {
            if (!tag) throw new Error('Auth calls must use tag');
            if (!client) throw new MyaError(`Cannot access ${tag} anonymously`, 'NOT_LOGGED_IN');
            if (object && !isAuthorized(tag, client, object)) {
                throw new MyaError(`${client} is not allowed to access ${tag}:${object}`, 'NOT_AUTHORIZED');
            }
            return true;
        },
        list(tag, client) {
            return store.smembers(key(tag, client));
        },
    };
};
