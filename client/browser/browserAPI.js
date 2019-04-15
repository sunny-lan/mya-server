const makeMya = require('../mya');
const makeState = require('../state/mock');
const makeWsChannel = require('./wsMessageChannel');

module.exports = function makeBrowserAPI(apiAddress) {
    const channel = makeWsChannel(apiAddress);

    const mya = makeMya(channel);

    return function myadd(app) {
        const scripts = document.getElementsByTagName('script');
        const me = scripts[scripts.length - 1];
        document.addEventListener("DOMContentLoaded", function onLoaded(event) {
            const ui = me.parentElement;
            const appID = ui.getAttribute('appID');
            const state = makeState(appID);
            app(mya, state, ui);
        });
    }
};
