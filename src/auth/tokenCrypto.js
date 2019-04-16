const crypto = require('crypto');
const {promisify} = require('util');
const randomBytes = promisify(crypto.randomBytes);
module.exports = async function generateToken() {
    const buf = await crypto.randomBytes(32);
    return buf.toString('hex');
};
