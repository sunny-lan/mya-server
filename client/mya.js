const makeBasicCommands = require('./basicCommands');
const makeCacheSystem = require('./cacheSystem');
const makeDeviceTemplate = require('./deviceTemplate');
const makeESP8266Template = require('./esp8266');

module.exports = function makeMya(messageChannel) {
    const mya = makeBasicCommands(messageChannel);
    Object.assign(mya, makeCacheSystem(messageChannel, mya));
    mya.DeviceTemplate = makeDeviceTemplate(mya);
    mya.ESP8266 = makeESP8266Template(mya.DeviceTemplate);
    return mya;
};
