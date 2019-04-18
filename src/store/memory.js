/**
 * simple in-memory store for testing purpose
 */
module.exports = function makeMemoryStore() {
    const data = {};

    return {
        __data: data,

        exists(key) {
            return data.hasOwnProperty(key);
        },

        lpush(key, value, trim) {
            data[key] = [value].concat(data[key]).slice(0, trim);
        },

        lindex(key, index) {
            if (!this.exists(key)) return;
            return data[key][index];
        },

        lrange(key, start, stop) {
            if (!this.exists(key)) return;
            return data[key].slice(start, stop);
        },

        hset(key, field, value) {
            if (!this.exists(key))
                data[key] = {};
            data[key][field] = value;
        },

        hget(key, field) {
            if (!this.exists(key)) return;
            return data[key][field];
        },

        hdel(key, field) {
            if (!this.exists(key)) return;
            delete data[key][field];
        },

        hexists(key, field) {
            if (!this.exists(key)) return;
            return data[key].hasOwnProperty(field);
        },

        sadd(key, member) {
            if (!this.exists(key))
                data[key] = {};
            data[key][member] = true;
        },

        sismember(key, member) {
            if (!this.exists(key)) return;
            return data[key][member];
        },

        smembers(key) {
            if (!this.exists(key)) return;
            return Object.keys(data[key]);
        }
    }
};
