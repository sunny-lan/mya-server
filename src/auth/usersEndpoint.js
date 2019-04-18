const {Router} = require('express');
const {asyncMiddleware} = require('../util');

module.exports = function makeUsersEndpoint(userManager) {
    const endpoint = Router();

    endpoint.get('/create', (req, res) => {
        res.render('createUser', {err: false});
    });

    endpoint.post('/create', asyncMiddleware(async (req, res) => {
        await userManager.create(req.body.username, req.body.password);
        res.send('ok');
    }));

    endpoint.get('/login', (req, res) => {
        res.render('login', {err: false});
    });

    endpoint.post('/login', asyncMiddleware(async (req, res) => {
        try {
            await userManager.checkLogin(req.body.username, req.body.password);
        } catch (err) {
            if (err.myaCode === 'LOGIN_FAILED') {
                res.render('login', {err});
                return;
            } else {
                throw err;
            }
        }
        req.session.username = req.body.username;
        res.send('ok');
    }));

    endpoint.get('/logout', (req, res) => {
        if (req.session.username) {
            res.send('Logged out');
        } else {
            res.send('Already logged out');
        }
        delete req.session.username;
    });

    return endpoint;
};
