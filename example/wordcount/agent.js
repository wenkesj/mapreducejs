'use strict';
const client = require('socket.io-client');
const config = require('./config.json');
const Agent = require('../../agent');
const port = config.port;
const connections = config.connections;

const handleConnect = function(agents, socket, id) {
  // Load the network with these agents.
  agents[id] = new Agent();

  // Connect the Agent to the Master.
  agents[id].connect(socket)
    .then(() => console.log('Network connected!'));
};

// Force new websocket connections to the cluster.
const createConnections = function(agents, n) {
  let sockets = [];
  for (var id = 0; id < n; id++) {
    sockets[id] = client('http://0.0.0.0:' + port, {
      transports: ['websocket'],
      'force new connection': true
    });
    sockets[id].on('connect', handleConnect.bind(null, agents, sockets[id], id));
  }
  return sockets;
};

let agents = [];
let sockets = createConnections(agents, connections);
