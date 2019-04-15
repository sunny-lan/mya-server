module.exports = function makeDeviceTemplate(mya) {
    //TODO prevent multiple apps from trying to setup the same device
    return class DeviceTemplate {
        constructor(initDevice) {
            this.listenerHooks = [];
            this.setupHooks = [];

            if (initDevice) {
                this.setDevice(initDevice);
            }
        }

        setDevice(device) {
            if (this.currentDevice) {
                this.listenerHooks.forEach(callback => mya.removeListener(this.currentDevice, callback));
            }
            this.listenerHooks.forEach(callback => mya.addListener(device, callback));
            this.currentDevice = device;
            if (mya.open) {
                this.setupHooks.forEach(callback => callback());
            }
        }

        setup(callback) {//TODO implement onClose
            this.setupHooks.push(callback);
            mya.onOpen(callback);
        }

        listen(callback) {
            //if current device exists, add it
            if (this.currentDevice)
                mya.addListener(this.currentDevice, callback);
            //else wait for it to be set and add it
            this.listenerHooks.push(callback);
        }

        send(data) {
            if (this.currentDevice) {
                mya.send(this.currentDevice, data);
            } else {
                throw new Error('Cannot send data: Not connected to any device.');
            }
        }

        get data() {
            if (!this.currentDevice)
                throw new Error('Cannot get data: Not connected to any device.');
            return mya.deviceData[this.currentDevice];
        }
    }
};
