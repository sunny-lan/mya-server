(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports = function makeBasicCommands(messageChannel) {
    function send(device, data) {
        messageChannel.send({
            command: 'SEND',
            device, data,
        });
    }

    function get(device) {
        messageChannel.send({
            command: 'GET',
            device,
        });
    }

    function subscribePush(device) {
        messageChannel.send({
            command: 'SUBSCRIBE_PUSH',
            device,
        });
    }

    return {send, get, subscribePush};
};

},{}],2:[function(require,module,exports){
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

},{"../mya":8,"../state/mock":9,"./wsMessageChannel":3}],3:[function(require,module,exports){
const EventEmitter = require('event-emitter');

module.exports = function makeWsMessageChannel(address, reconnect = 5000) {
    const channel = EventEmitter();

    function connect() {
        const ws = new WebSocket(address);

        ws.onopen = () => channel.emit('open');

        ws.onmessage = function handleMessage(e) {
            channel.emit('message', JSON.parse(e.data));
        };

        channel.send = function send(data) {
            ws.send(JSON.stringify(data));
        };

        function handleClose(e) {
            console.log(`Socket is closed. Reconnect will be attempted in ${reconnect} ms.`, e.reason);
            channel.emit('close');
            setTimeout(connect, reconnect);
        }

        ws.onclose = handleClose;

        ws.onerror = function handleError(err) {
            console.error('Socket encountered error: ', err.message, 'Closing socket');
            ws.close();
        }
    }

    connect();

    return channel;
};

},{"event-emitter":26}],4:[function(require,module,exports){
const makeBrowserAPI = require('./browserAPI');
window.myapp = makeBrowserAPI('wss://myanee.herokuapp.com/ws');

},{"./browserAPI":2}],5:[function(require,module,exports){
module.exports = function makeCacheSystem(messageChannel, mya) {
    const listeners = {};
    const dataCache = {};

    let open = false;

    messageChannel.on('open', function handleOpen() {
        //resend init requests upon ws open
        Object.keys(listeners).forEach(device => {
            if (listeners[device].length > 0) {
                mya.subscribePush(device);
                mya.get(device);
            }
        });
        open = true;
    });

    messageChannel.on('message', function handleMessage(message) {
        const {device, command, data} = message;
        if (command === 'PUSHED') {
            dataCache[device] = message.data;
            if (listeners.hasOwnProperty(device)) {
                listeners[device].forEach(callback => callback(data));
            }
        }
    });

    messageChannel.on('close', function handleClose() {
        open = false;
    });

    return {
        deviceData: dataCache,
        addListener(device, callback) {
            //run init if not already subscribed
            if (!listeners.hasOwnProperty(device)) {
                listeners[device] = [];
                if (open) {//if channel is open, send request now
                    mya.subscribePush(device);
                    mya.get(device);
                }
            }

            //cannot register same listener twice
            if (listeners[device].includes(callback))
                throw new Error('Cannot register the same listener twice');

            //feed cached data
            if (dataCache[device])
                callback(dataCache[device]);

            //add callback to list
            listeners[device].push(callback);
        },
        removeListener(device, callback) {
            const idx = listeners[device].indexOf(callback);
            if (idx === -1)
                throw new Error('Listener you are trying to remove does not exist');
            listeners[device].splice(callback, 1);
        },
        onOpen(callback) {
            messageChannel.on('open', callback);
        },
        onClose(callback) {
            messageChannel.on('close', callback);
        },
        get open() {
            return open;
        },
    };
};

},{}],6:[function(require,module,exports){
module.exports = function makeDeviceTemplate(mya) {
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

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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

},{"./basicCommands":1,"./cacheSystem":5,"./deviceTemplate":6,"./esp8266":7}],9:[function(require,module,exports){
module.exports=function makeState(appID) {
    return {};
};

},{}],10:[function(require,module,exports){
'use strict';

var assign        = require('es5-ext/object/assign')
  , normalizeOpts = require('es5-ext/object/normalize-options')
  , isCallable    = require('es5-ext/object/is-callable')
  , contains      = require('es5-ext/string/#/contains')

  , d;

d = module.exports = function (dscr, value/*, options*/) {
	var c, e, w, options, desc;
	if ((arguments.length < 2) || (typeof dscr !== 'string')) {
		options = value;
		value = dscr;
		dscr = null;
	} else {
		options = arguments[2];
	}
	if (dscr == null) {
		c = w = true;
		e = false;
	} else {
		c = contains.call(dscr, 'c');
		e = contains.call(dscr, 'e');
		w = contains.call(dscr, 'w');
	}

	desc = { value: value, configurable: c, enumerable: e, writable: w };
	return !options ? desc : assign(normalizeOpts(options), desc);
};

d.gs = function (dscr, get, set/*, options*/) {
	var c, e, options, desc;
	if (typeof dscr !== 'string') {
		options = set;
		set = get;
		get = dscr;
		dscr = null;
	} else {
		options = arguments[3];
	}
	if (get == null) {
		get = undefined;
	} else if (!isCallable(get)) {
		options = get;
		get = set = undefined;
	} else if (set == null) {
		set = undefined;
	} else if (!isCallable(set)) {
		options = set;
		set = undefined;
	}
	if (dscr == null) {
		c = true;
		e = false;
	} else {
		c = contains.call(dscr, 'c');
		e = contains.call(dscr, 'e');
	}

	desc = { get: get, set: set, configurable: c, enumerable: e };
	return !options ? desc : assign(normalizeOpts(options), desc);
};

},{"es5-ext/object/assign":12,"es5-ext/object/is-callable":15,"es5-ext/object/normalize-options":20,"es5-ext/string/#/contains":23}],11:[function(require,module,exports){
"use strict";

// eslint-disable-next-line no-empty-function
module.exports = function () {};

},{}],12:[function(require,module,exports){
"use strict";

module.exports = require("./is-implemented")()
	? Object.assign
	: require("./shim");

},{"./is-implemented":13,"./shim":14}],13:[function(require,module,exports){
"use strict";

module.exports = function () {
	var assign = Object.assign, obj;
	if (typeof assign !== "function") return false;
	obj = { foo: "raz" };
	assign(obj, { bar: "dwa" }, { trzy: "trzy" });
	return (obj.foo + obj.bar + obj.trzy) === "razdwatrzy";
};

},{}],14:[function(require,module,exports){
"use strict";

var keys  = require("../keys")
  , value = require("../valid-value")
  , max   = Math.max;

module.exports = function (dest, src /*, …srcn*/) {
	var error, i, length = max(arguments.length, 2), assign;
	dest = Object(value(dest));
	assign = function (key) {
		try {
			dest[key] = src[key];
		} catch (e) {
			if (!error) error = e;
		}
	};
	for (i = 1; i < length; ++i) {
		src = arguments[i];
		keys(src).forEach(assign);
	}
	if (error !== undefined) throw error;
	return dest;
};

},{"../keys":17,"../valid-value":22}],15:[function(require,module,exports){
// Deprecated

"use strict";

module.exports = function (obj) {
 return typeof obj === "function";
};

},{}],16:[function(require,module,exports){
"use strict";

var _undefined = require("../function/noop")(); // Support ES3 engines

module.exports = function (val) {
 return (val !== _undefined) && (val !== null);
};

},{"../function/noop":11}],17:[function(require,module,exports){
"use strict";

module.exports = require("./is-implemented")() ? Object.keys : require("./shim");

},{"./is-implemented":18,"./shim":19}],18:[function(require,module,exports){
"use strict";

module.exports = function () {
	try {
		Object.keys("primitive");
		return true;
	} catch (e) {
		return false;
	}
};

},{}],19:[function(require,module,exports){
"use strict";

var isValue = require("../is-value");

var keys = Object.keys;

module.exports = function (object) { return keys(isValue(object) ? Object(object) : object); };

},{"../is-value":16}],20:[function(require,module,exports){
"use strict";

var isValue = require("./is-value");

var forEach = Array.prototype.forEach, create = Object.create;

var process = function (src, obj) {
	var key;
	for (key in src) obj[key] = src[key];
};

// eslint-disable-next-line no-unused-vars
module.exports = function (opts1 /*, …options*/) {
	var result = create(null);
	forEach.call(arguments, function (options) {
		if (!isValue(options)) return;
		process(Object(options), result);
	});
	return result;
};

},{"./is-value":16}],21:[function(require,module,exports){
"use strict";

module.exports = function (fn) {
	if (typeof fn !== "function") throw new TypeError(fn + " is not a function");
	return fn;
};

},{}],22:[function(require,module,exports){
"use strict";

var isValue = require("./is-value");

module.exports = function (value) {
	if (!isValue(value)) throw new TypeError("Cannot use null or undefined");
	return value;
};

},{"./is-value":16}],23:[function(require,module,exports){
"use strict";

module.exports = require("./is-implemented")()
	? String.prototype.contains
	: require("./shim");

},{"./is-implemented":24,"./shim":25}],24:[function(require,module,exports){
"use strict";

var str = "razdwatrzy";

module.exports = function () {
	if (typeof str.contains !== "function") return false;
	return (str.contains("dwa") === true) && (str.contains("foo") === false);
};

},{}],25:[function(require,module,exports){
"use strict";

var indexOf = String.prototype.indexOf;

module.exports = function (searchString/*, position*/) {
	return indexOf.call(this, searchString, arguments[1]) > -1;
};

},{}],26:[function(require,module,exports){
'use strict';

var d        = require('d')
  , callable = require('es5-ext/object/valid-callable')

  , apply = Function.prototype.apply, call = Function.prototype.call
  , create = Object.create, defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , hasOwnProperty = Object.prototype.hasOwnProperty
  , descriptor = { configurable: true, enumerable: false, writable: true }

  , on, once, off, emit, methods, descriptors, base;

on = function (type, listener) {
	var data;

	callable(listener);

	if (!hasOwnProperty.call(this, '__ee__')) {
		data = descriptor.value = create(null);
		defineProperty(this, '__ee__', descriptor);
		descriptor.value = null;
	} else {
		data = this.__ee__;
	}
	if (!data[type]) data[type] = listener;
	else if (typeof data[type] === 'object') data[type].push(listener);
	else data[type] = [data[type], listener];

	return this;
};

once = function (type, listener) {
	var once, self;

	callable(listener);
	self = this;
	on.call(this, type, once = function () {
		off.call(self, type, once);
		apply.call(listener, this, arguments);
	});

	once.__eeOnceListener__ = listener;
	return this;
};

off = function (type, listener) {
	var data, listeners, candidate, i;

	callable(listener);

	if (!hasOwnProperty.call(this, '__ee__')) return this;
	data = this.__ee__;
	if (!data[type]) return this;
	listeners = data[type];

	if (typeof listeners === 'object') {
		for (i = 0; (candidate = listeners[i]); ++i) {
			if ((candidate === listener) ||
					(candidate.__eeOnceListener__ === listener)) {
				if (listeners.length === 2) data[type] = listeners[i ? 0 : 1];
				else listeners.splice(i, 1);
			}
		}
	} else {
		if ((listeners === listener) ||
				(listeners.__eeOnceListener__ === listener)) {
			delete data[type];
		}
	}

	return this;
};

emit = function (type) {
	var i, l, listener, listeners, args;

	if (!hasOwnProperty.call(this, '__ee__')) return;
	listeners = this.__ee__[type];
	if (!listeners) return;

	if (typeof listeners === 'object') {
		l = arguments.length;
		args = new Array(l - 1);
		for (i = 1; i < l; ++i) args[i - 1] = arguments[i];

		listeners = listeners.slice();
		for (i = 0; (listener = listeners[i]); ++i) {
			apply.call(listener, this, args);
		}
	} else {
		switch (arguments.length) {
		case 1:
			call.call(listeners, this);
			break;
		case 2:
			call.call(listeners, this, arguments[1]);
			break;
		case 3:
			call.call(listeners, this, arguments[1], arguments[2]);
			break;
		default:
			l = arguments.length;
			args = new Array(l - 1);
			for (i = 1; i < l; ++i) {
				args[i - 1] = arguments[i];
			}
			apply.call(listeners, this, args);
		}
	}
};

methods = {
	on: on,
	once: once,
	off: off,
	emit: emit
};

descriptors = {
	on: d(on),
	once: d(once),
	off: d(off),
	emit: d(emit)
};

base = defineProperties({}, descriptors);

module.exports = exports = function (o) {
	return (o == null) ? create(base) : defineProperties(Object(o), descriptors);
};
exports.methods = methods;

},{"d":10,"es5-ext/object/valid-callable":21}]},{},[4]);
