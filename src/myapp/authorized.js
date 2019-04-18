//TODO maybe replace with class+inheritance
module.exports = function makeAuthorizedMyapp(myapp, authorizer) {
    return {
        async createApp(zip, appID, client) {
            authorizer.assert('app', client);
            appID = await myapp.createApp(zip, appID);
            authorizer.authorize('app', client, appID);
            return appID;
        },

        getInfo(appID) {
            return myapp.getInfo(appID);
        },

        async createInstance(appID, client) {
            authorizer.assert('instance', client);
            const instanceID = await myapp.createInstance(appID);
            authorizer.authorize('instance', client, instanceID);
            return instanceID;
        },

        getInstanceAppID(instanceID, client) {
            //TODO authorizer.assert('instance', client, instanceID);
            return myapp.getInstanceAppID(instanceID);
        },

        async getUI(instanceID, client) {
            //TODO authorizer.assert('instance', client, instanceID);
            return await myapp.getUI(instanceID);
        },
    };
};
