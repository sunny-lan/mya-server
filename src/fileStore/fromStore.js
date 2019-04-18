/**
 * creates a filestore using a normal key-value store as a backend
 * @param store the store to store files in
 * @param key the root key to store all files in
 */
module.exports = function makeFileStore(store, key = 'fileStore') {
    return {
        writeFile(path, data) {
            store.hset(key, path, data);
        },
        deleteFile(path) {
            store.hdel(key, path);
        },
        readFile(path) {
            return store.hget(key, path);
        }
    };
};
