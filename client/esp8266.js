const constants = {
    PIN: {
        D0: 16,
        D1: 5,
        D2: 4,
        D3: 0,
        D4: 2,
        D5: 14,
        D6: 12,
        D7: 13,
        D8: 15,
        D9: 3,
        D10: 1,
        A0: 17,
    },
    PIN_MODE: {//TODO add complete list
        INPUT: 0x00,
        INPUT_PULLUP: 0x02,
        OUTPUT: 0x01,
    },
    VALUE: {
        HIGH: 1,
        LOW: 0,
    },
};

module.exports = function makeESP8266Template(DeviceTemplate) {
    class ESP8266 extends DeviceTemplate {
        constructor(init) {
            super(init);
        }

        static get CONSTANTS(){
            return constants;
        }

        pinMode(pin, mode) {
            this.send({
                command: 'pinMode',
                pin, mode,
            });
        }

        digitalWrite(pin, value) {
            this.send({
                command: 'digitalWrite',
                pin, value,
            });
        }

        digitalRead(pin) {
            if (pin === constants.PIN.A0)
                throw new Error('Cannot digitalRead from analog pin');
            return this.data.pinReadings[pin];
        }

        analogRead(pin) {
            if (pin !== constants.PIN.A0)
                throw new Error('Cannot analogRead from digital pin');
            return this.data.pinReadings[pin];
        }
    }

    return ESP8266;
};
