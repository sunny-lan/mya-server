#Realtime communication#

Realtime communication is achieved using MQTT and Websockets.

###Device to client (browser)###

A device can send message to server at any time using `push [device] [data]`
command. The server stores last 100 data from each device.

The client (eg. browser) can get data from device in two ways:

 1. Using `get [device] [x]` command to get last x messages from device
 
 2. Using `subcribe [device]` command to receive a update (through websocket etc) 
 every time the device sends a new message
 
The server sends a `pushed [device] [data]` message to the client when
new data is available from device

###Examples###

**get**
```
client to server: get garage_door 1
server to client: pushed garage_door {open:true}
```

**subscribe**
```
client to server: subscribe garage_door
...
device to server: push garage_door {open:false}
server to client: pushed garage_door {open:false}
```

Note that `[device]` represents the ID of the device. It should be kept private,
as anyone with the device ID will be able to control it.

###Client to device###

The client can send a message to control a device 
using the `send [device] [data]` command. Once this is sent,
the device will receive a `sent [client] [data]` message

**Example**
```
client to server: send garage_door open
server to device: sent alice open
```
