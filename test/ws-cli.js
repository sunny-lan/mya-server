const BSON = require('bson');

const WebSocket = require('ws');

const ws = new WebSocket(process.argv[2] || 'ws://localhost:1234/ws');

ws.on('open', function open() {
    console.log('-- ok --');
});

// ws.on('ping', ()=>console.log('ping'));

ws.on('message', function incoming(data) {
    console.log('>', JSON.parse(data));
});

const lineReader = require('readline').createInterface({
    input: process.stdin
});

lineReader.on('line', function (line) {
    line = line.split(' ');
    if (line[0] === 'sp') {
        ws.send(JSON.stringify({
            command: 'SUBSCRIBE_PUSH',
            device: line[1],
        }));
    } else if (line[0] === 'ss') {
        ws.send(JSON.stringify({
            command: 'SUBSCRIBE_SEND',
            device: line[1],
        }));
    } else if (line[0] === 's') {
        eval(`var data=${line.slice(2).join(' ')};`);
        ws.send(JSON.stringify({
            command: 'SEND',
            device: line[1],
            data
        }));
    } else if (line[0] === 'p') {
        eval(`const data=${line.slice(2).join(' ')}`);
        ws.send(JSON.stringify({
            command: 'PUSH',
            device: line[1],
            data,
        }));
    } else if (line[0] === 'g') {
        ws.send(JSON.stringify({
            command: 'GET',
            device: line[1],
            start: parseInt(line[2]),
            stop: parseInt(line[3]),
        }));
    } else {
        console.error('not a command')
    }
});
