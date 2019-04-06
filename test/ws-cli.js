const BSON = require('bson');

const WebSocket = require('ws');

const ws = new WebSocket(process.argv[2]||'ws://localhost:1234/ws');

ws.on('open', function open() {
    console.log('-- ok --');
});

// ws.on('ping', ()=>console.log('ping'));

ws.on('message', function incoming(data) {
    console.log('>', BSON.deserialize(data));
});

const lineReader = require('readline').createInterface({
    input: process.stdin
});

lineReader.on('line', function (line) {
    line = line.split(' ');
    if (line[0] === 'sp') {
        ws.send(BSON.serialize({
            command: 'SUBSCRIBE_PUSH',
            device: line[1],
        }));
    }
    if (line[0] === 'ss') {
        ws.send(BSON.serialize({
            command: 'SUBSCRIBE_SEND',
            device: line[1],
        }));
    }
    if (line[0] === 's') {
        ws.send(BSON.serialize({
            command: 'SEND',
            device: line[1],
            data: eval(line.slice(2).join(' ')),
        }));
    }
    if (line[0] === 'p') {
        ws.send(BSON.serialize({
            command: 'PUSH',
            device: line[1],
            data: eval(line.slice(2).join(' ')),
        }));
    }

    if (line[0] === 'g') {
        ws.send(BSON.serialize({
            command: 'GET',
            device: line[1],
            start: parseInt(line[2]),
            stop: parseInt(line[3]),
        }));
    }
});
