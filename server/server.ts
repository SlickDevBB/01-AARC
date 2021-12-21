require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });
import { Socket } from 'socket.io';
const server = require('express')();

const https = process.env.NODE_ENV === "production"
  ? require('https').createServer()
  : require('http').createServer(server);

const io = require('socket.io')(https, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const port = process.env.PORT || 443;

const connectedGotchis = {};

io.on('connection', function (socket: Socket) {
    const userId = socket.id;

    console.log('A user connected: ' + userId);
    connectedGotchis[userId] = {id: userId};

    socket.on('handleDisconnect', () => {
      socket.disconnect();
    })

    // lets try mod this so we can set different gotchis for the connected user
    socket.on('setGotchiDataA', (gotchi) => {
      connectedGotchis[userId].gotchiA = gotchi;
    })

    socket.on('setGotchiDataB', (gotchi) => {
      connectedGotchis[userId].gotchiB = gotchi;
    })

    socket.on('setGotchiDataC', (gotchi) => {
      connectedGotchis[userId].gotchiC = gotchi;
    })

    socket.on('disconnect', function () {
      console.log('A user disconnected: ' + userId);
      delete connectedGotchis[userId];
    });
});

https.listen(port, function () {
    console.log(`Listening on - PORT:${port}`);
});

