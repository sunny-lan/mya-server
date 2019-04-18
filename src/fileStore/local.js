const os = require('os');
const fs = require('fs').promises;
const {join, dirname} = require('path');
/**
 * creates a file store in a local folder
 * @param folder the folder to store in, it must exist already (defaults to os temp dir)
 */
module.exports = function makeLocalFileStore(folder = os.tmpdir()) {
    return {
        async writeFile(path, data) {
            path = join(folder, path);
            await fs.mkdir(dirname(path), {recursive: true});
            await fs.writeFile(path, data);
        },
        async deleteFile(path) {
            path = join(folder, path);
            await fs.unlink(path);
        },
        async readFile(path) {
            path = join(folder, path);
            return await fs.readFile(path);
        }
    };
};
