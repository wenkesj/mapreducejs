'use strict';
const map = require('async/map');

class Dataset {
  constructor(master, data) {
    this.master = master;
    this.data = data;
  }
  combine(arr, chunkSize) {
    let groups = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      let start = i;
      let end = i + (chunkSize - 1);
      groups.push([].concat.apply(arr[start], arr[end]));
    }
    return groups;
  }
  flatten(arr) {
    var ret = [];
    for (var i = 0; i < arr.length; i++) {
      if (Array.isArray(arr[i])) {
        ret = ret.concat(this.flatten(arr[i]));
      } else {
        ret.push(arr[i]);
      }
    }
    return ret;
  }
  chunk(arr, chunkSize) {
    let groups = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      groups.push(arr.slice(i, i + chunkSize));
    }
    return groups;
  }
  map(mapFunction) {
    let agents = Object.keys(this.master.agents);
    let mapData = this.chunk(this.data, Math.ceil(this.data.length / agents.length));
    return Promise.all(
      agents.map((key, index) => {
        return new Promise((resolve, reject) => {
          this.master.agents[key].emit('map', {
            'map': 'map = ' + mapFunction,
            'data': mapData[index] || null,
          }).once(`map_response_${key.replace(/[\/\#]/g, '')}`, (res) => {
            resolve(res);
          });
        }).then((res) => res);
      })
    ).then((res) => Promise.resolve(new Dataset(this.master, this.flatten(res.filter((res) => !!res)))));
  }
  reduce(reduceFunction) {
    let agents = Object.keys(this.master.agents);
    let reduceData = this.chunk(this.data, 2);
    return Promise.all(
      agents.map((key, index) => {
        return new Promise((resolve, reject) => {
          this.master.agents[key].emit('reduce', {
            'reduce': 'reduce = ' + reduceFunction,
            'data': reduceData[index] || null
          });
          this.master.agents[key].once(`reduce_response_${key.replace(/[\/\#]/g, '')}`, (res) => {
            resolve(res);
          });
        }).then((res) => res);
      })
    ).then((res) => Promise.resolve(new Dataset(this.master, res.filter((res) => !!res))));
  }
}

class Master {
  constructor(io) {
    if (!io) {
      throw new Error('Must supply a socket.io instance.');
    }
    this.agents = io.sockets.connected;
  }
  _setupListeners(socket) {
    if (!socket) {
      throw new Error('Socket must be defined.');
    }
    let events = this._events(socket);
    Object.keys(events).map((event) => {
      socket.on(event, events[event]);
    });
  }
  _events(socket) {
    return {
      'disconnect': this._handleDisconnect.bind(this, socket),
    };
  }
  dataset(dataSet) {
    return new Dataset(this, dataSet);
  }
  connect(socket) {
    return new Promise((resolve, reject) => {
      this._setupListeners(socket);
      resolve();
    });
  }
  _handleDisconnect(socket) {
    console.log(`Agent ${socket.id} disconnected.`);
  }
}

class Agent {
  constructor(options) {
    options = options || {};
  }
  setupListeners(socket) {
    if (!socket) {
      throw new Error('Socket must be defined.');
    }
    let events = this._events();
    Object.keys(events).map((event) => {
      socket.on(event, events[event]);
    });
  }
  _events() {
    return {
      'map': this._handleMap.bind(this),
      'reduce': this._handleReduce.bind(this),
    };
  }
  connect(socket) {
    return new Promise((resolve, reject) => {
      this.socket = socket;
      this.id = this.socket.id;
      this.setupListeners(this.socket);
      resolve();
    });
  }
  _handleMap(mapObj) {
    if (!mapObj.data) {
      this.socket.emit(`map_response_${this.socket.id}`, null);
      return;
    }
    let map;
    eval(mapObj.map);
    this.socket.emit(`map_response_${this.socket.id}`, mapObj.data.map(map));
  }
  _handleReduce(reduceObj) {
    if (!reduceObj.data) {
      this.socket.emit(`reduce_response_${this.socket.id}`, null);
      return;
    }
    let reduce;
    eval(reduceObj.reduce);
    this.socket.emit(`reduce_response_${this.socket.id}`, reduceObj.data.reduce(reduce));
  }
}

module.exports = { Master, Agent };
