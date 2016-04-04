'use strict';
const async = require('asyncawait/async');
const await = require('asyncawait/await');

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
  chunk(arr, chunkSize) {
    let groups = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      groups.push(arr.slice(i, i + chunkSize));
    }
    return groups;
  }
  map(mapFunction) {
    let mapFinal = (data, mapFunction) => {
      let agents = Object.keys(this.master.agents);
      let mapData = this.chunk(data, Math.ceil(this.data.length / agents.length));
      let results = async(function(agents, mapData, mapFunction) {
        return await(Promise.all(
          agents.map((key, index) => {
            return new Promise((resolve, reject) => {
              this.master.agents[key].emit('map', {
                'map': 'map = ' + mapFunction,
                'data': mapData[index] || null
              });
              this.master.agents[key].once(`map_response_${key.replace(/[\/\#]/g, '')}`, (res) => {
                resolve(res);
              });
            })
            .then((res) => res);
          }))
          .then((res) => res.filter((res) => !!res))
        );
      }.bind(this));
      return new Dataset(this.master, results(agents, mapData, mapFunction));
    };

    if ('then' in this.data) {
      return this.data.then((data) => {
        return mapFinal(data, mapFunction);
      });
    }
    return mapFinal(this.data, mapFunction);
  }
  reduce(reduceFunction) {
    let reduceFinal = (data, reduceFunction) => {
      let agents = Object.keys(this.master.agents);
      let reduceData = this.combine(data, 2);
      let results = async(function(agents, reduceData, reduceFunction) {
        return await(Promise.all(
          agents.map((key, index) => {
            return new Promise((resolve, reject) => {
              this.master.agents[key].emit('reduce', {
                'reduce': 'reduce = ' + reduceFunction,
                'data': reduceData[index] || null
              });
              this.master.agents[key].once(`reduce_response_${key.replace(/[\/\#]/g, '')}`, (res) => {
                resolve(res);
              });
            })
            .then((res) => res);
          }))
          .then((res) => res.filter((res) => !!res))
        );
      }.bind(this));
      return new Dataset(this.master, results(agents, reduceData, reduceFunction));
    };

    if ('then' in this.data) {
      return this.data.then((data) => {
        return reduceFinal(data, reduceFunction);
      });
    }
    return reduceFinal(this.data, reduceFunction);
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
