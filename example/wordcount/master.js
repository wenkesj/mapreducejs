'use strict';
const sio = require('socket.io');
const fs = require('fs');
const config = require('./config.json');
const port = config.port;
const io = sio(port);
const mr = require('../../');
const master = new mr.Master(io);

const dictionary = fs.readFileSync('./data/huckleberryfin.txt', 'utf-8')
  .split(/\n+/)
  .filter((res) => !!res);

console.time('MapReduceSequential');
console.time('MapWordCountSequential');
let result = dictionary.map(function(line) {
  return line.split(/\s+/).length;
});
console.timeEnd('MapWordCountSequential');

console.time('ReduceWordCountSequential');
result = result.reduce(function(prev, current) {
  return prev + current;
});
console.timeEnd('ReduceWordCountSequential');
console.timeEnd('MapReduceSequential');
console.log('Count', result);

let connections = 0;
io.on('connection', function(socket) {
  // Connect all the sockets as they come in.
  connections++;
  master.connect(socket);

  // Wait for all connections.
  if (connections === config.connections) {
    console.time('MapReduceDistributed');
    console.time('MapWordCountDistributed');
    master.source(dictionary)
    .map(function(line) {
      return line.split(/\s+/).length;
    }).then((result) => {
      console.timeEnd('MapWordCountDistributed');
      console.time('ReduceWordCountDistributed');
      result.reduce(function(prev, current) {
        return prev + current;
      }).then((result) => {
        console.timeEnd('ReduceWordCountDistributed');
        console.timeEnd('MapReduceDistributed');
        console.log('Count', result.data[0]);
      });
    });
  }
});
