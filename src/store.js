module.exports = function makeStore() {
    const data = {};

    return {
        lpush(key, value, trim ) {
            data[key] = [value].concat(data[key]).slice(0, trim);
        },

        lindex(key, index) {
            return data[key][index];
        },

        lrange(key, start, stop) {
            return data[key].slice(start, stop);
        },
    }
};
