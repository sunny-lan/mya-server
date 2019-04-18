const {MyaError} = require("../error");
const bcrypt = require('bcrypt');

module.exports = function makeUserManager(store) {
    return {
        async create(username, password, saltRounds = 10) {
            if (store.hexists('users:password', username))
                throw new MyaError('User already exists', 'USER_ALREADY_EXISTS');
            const hashed = await bcrypt.hash(password, saltRounds);
            store.hset('users:password', username, hashed);
        },

        async checkLogin(username, password) {
            const hash = store.hget('users:password', username);
            if (!hash)
                throw new MyaError(`User doesn't exist`, 'LOGIN_FAILED');
            if (await bcrypt.compare(password, hash))
                return true;
            throw new MyaError('Password incorrect', 'LOGIN_FAILED');
        },

        async setPassword(username, password, saltRounds=10){
            if (!store.hexists('user:password', username))
                throw new MyaError(`User doesn't exist`, 'NO_SUCH_USER');
            const hashed = await bcrypt.hash(password, saltRounds);
            store.hset('users:password', username, hashed);
        }
    };
};
