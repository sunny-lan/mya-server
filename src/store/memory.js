/**
 * simple in-memory store for testing purpose
 */
module.exports = function makeStore() {
    const data = {};

    return {
        __data: data,

        lpush(key, value, trim) {
            data[key] = [value].concat(data[key]).slice(0, trim);
        },

        lindex(key, index) {
            if (!data.hasOwnProperty(key)) return;
            return data[key][index];
        },

        lrange(key, start, stop) {
            if (!data.hasOwnProperty(key)) return;
            return data[key].slice(start, stop);
        },

        hset(key, field, value) {
            if (!data.hasOwnProperty(key))
                data[key] = {};
            data[key][field] = value;
        },

        hget(key, field) {
            if (!data.hasOwnProperty(key)) return;
            return data[key][field];
        },

        hdel(key, field) {
            if (!data.hasOwnProperty(key)) return;
            delete data[key][field];
        },

        hexists(key, field) {
            if (!data.hasOwnProperty(key)) return;
            return data[key].hasOwnProperty(field);
        }
    }
};
