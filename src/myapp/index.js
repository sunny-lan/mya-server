const os = require('os');
const util = require('util');
const fs = require('fs');
const ow = require('ow');
const path = require('path');

const uniqueFilename = require('unique-filename');
const decompress = require('decompress');
const uuid = require('uuid/v4');

const {MyaError}=require('../error');

const readFile = util.promisify(fs.readFile);

async function readGuard(file, errMessage) {
    try {
        return await readFile(file);
    } catch (err) {
        throw new MyaError(errMessage, 'FILE_READ_FAIL');
    }
}

module.exports = function makeMyapp(store, fileStore, generateToken) {
    return {
        async createApp(zip, appID) {
            //decompress to random dir
            const extractDir = uniqueFilename(os.tmpdir());
            const files = await decompress(zip, extractDir);

            //check for app.json
            const appJSONFile = await readGuard(path.join(extractDir, 'app.json'), 'Could not find app.json file');
            const appInfo = JSON.parse(appJSONFile);

            //verify app.json
            ow(appInfo, ow.object.exactShape({
                ui: ow.string,
            }));

            // ^^--- All verification passed ---^^

            if (appID) {//if app already exists
                if (!store.hexists('myapp:apps', appID))
                    throw new MyaError(`App doesn't exist: ${appID}`, 'APP_NOT_FOUND');
            } else {//if app is new
                appID = uuid();//generate new id for app
            }

            appInfo.files = [];//stores list of files this app contains

            //write all files to storage
            await Promise.all(files.map(async file => {
                await fileStore.writeFile(`${appID}/${file.path}`, file.data);
                //add to list of files for easy deletion
                appInfo.files.push(file.path);
            }));

            //store appInfo
            store.hset('myapp:apps', appID, appInfo);

            return appID;
        },

        getInfo(appID) {
            const appInfo=store.hget('myapp:apps', appID);
            if (!appInfo)//check if app exists
                throw new MyaError(`App doesn't exist: ${appID}`);
            return appInfo;
        },

        getInstanceAppID(instanceID) {
            return store.hget('myapp:instanceApp', instanceID);
        },

        async createInstance(appID) {
            const appInfo = this.getInfo(appID);

            //create new private ID for this app
            const instanceID = await generateToken();

            store.hset('myapp:instanceApp', instanceID, appID);

            return instanceID;
        },

        async getUI(instanceID) {
            const appID = this.getInstanceAppID(instanceID);

            if (!appID)
                throw new Error(`Instance doesn't exist: ${instanceID}`);

            //get app info so we can get the file
            const appInfo = this.getInfo(appID);

            return await fileStore.readFile(`${appID}/${appInfo.ui}`);
        },
    };
};
