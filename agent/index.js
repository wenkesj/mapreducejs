'use strict';
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
    this.socket.emit(`map_response_${this.socket.id}${mapObj.id}`, map(mapObj.data));
  }
  _handleReduce(reduceObj) {
    if (!reduceObj.data) {
      this.socket.emit(`reduce_response_${this.socket.id}`, null);
      return;
    }
    let reduce;
    eval(reduceObj.reduce);
    this.socket.emit(`reduce_response_${this.socket.id}${reduceObj.id}`, reduceObj.data.reduce(reduce));
  }
}

module.exports = Agent;
