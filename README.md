# Realtime communication

Realtime communication is achieved using MQTT and Websockets.

### Device to client (browser) 

A device can send message to server at any time using `PUSH [device] [data]`
command. The server stores last 100 data from each device.

The client (eg. browser) can get data from device in two ways:

 1. Using `GET [device] [start] [stop]` command to get message history from device
 
 2. Using `SUBSCRIBE_PUSH [device]` command to receive a update (through websocket etc) 
 every time the device sends a new message
 
The server sends a `PUSHED [device] [data] [time]` message to the client when
new data is available from device

### Examples 

**get**
```
client to server: GET garage_door 0 2
server to client: PUSHED garage_door {open:true} 0
server to client: PUSHED garage_door {open:true} 1
```

**subscribe**
```
client to server: SUBSCRIBE_PUSH garage_door
...
device to server: PUSH garage_door {open:false}
server to client: PUSHED garage_door {open:false} 0
```

Note that `[device]` represents the ID of the device. It should be kept private,
as anyone with the device ID will be able to control it.

### Client to device 

The client can send a message to control a device 
using the `SEND [device] [data]` command. 

In order for a device to receive commands sent by the client, it must subscribe
to commands using the `SUBCRIBE_SEND [device]` command. 

Once this is sent,
the device will receive a `SENT [data]` message

**Example**
```
device to server: SUBSCRIBE_SEND garage_door
client to server: SEND garage_door open
server to device: SENT open
```
