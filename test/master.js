'use strict';
const sio = require('socket.io');
const config = require('./config.json');
const port = config.port;
const io = sio(port);
const mr = require('../');
const Master = mr.Master;

// Create a new network socket manager.
const master = new Master(io);

const dictionary = [
  'Humpty Dumpty sat on a wall',
  'Humpty Dumpty had a great fall',
  'All the King\'s horses and all the King\'s men',
  'Couldn\'t put Humpty together again',
];

let connections = 0;
io.on('connection', function(socket) {
  // Connect all the sockets as they come in.
  connections++;
  master.connect(socket).then(() => console.log('Agent connected.'));

  // Wait for all connections.
  if (connections === config.connections) {
    master.dataset(dictionary)
    .map(function(line, index) {
      return line.split(/\s+/).length;
    }).then((result) => {
      result.reduce(function(prev, current) {
        return prev + current;
      }).then((result) => {
        console.log(result.data);
      });
    });
  }
});
