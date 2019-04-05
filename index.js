const mosca = require('mosca');
const redis = require('ioredis');

const moscaSettings = {
    port: 1883,			//mosca (mqtt) port
    backend: {
        type: 'redis',
        redis,
        url: process.env.REDIS_URL,
        return_buffers: true, // to handle binary payloads
    }
};

const server = new mosca.Server(moscaSettings);	//here we start mosca
server.on('ready', setup);	//on init it fires up setup()

// fired when the mqtt server is ready
function setup() {
    console.log('Mosca server is up and running')
}
