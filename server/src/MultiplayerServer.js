'use strict';

var util = require('util'),
    net = require('net'),
    EventEmitter = require('events').EventEmitter;

var MultiplayerUser = require('./MultiplayerUser');

var _slice = Array.prototype.slice;

class MultiplayerServer extends EventEmitter {
  constructor() {
    super();

    this.server = null;
  	this.users = [];
  }
  start(port, callback) {
    this.server = net.createServer(socket => {
      var user = new MultiplayerUser(socket, this);

  		this.users.push(user);
  		this.emit('connection', user);

  		socket.setEncoding('utf8');
  		socket.on('data', data => {
  			data = data.substr(0, data.length - 1);
  			this.emit('data', user, data);
  		});
  		socket.on('close', () => {
  			this.emit('disconnect', user);
  			this.users.splice(this.users.indexOf(user), 1);
  		});
    });
    this.server.on('close', () => {
      this.emit('close');
    })
    this.server.listen(port, callback);
  }
  count() {
    return this.users.length;
  }
  close() {
    this.server.close();
  }
  writeAll() {
    for(var i in this.users) {
  	  this.users[i].write.apply(this.users[i], arguments)
  	}
  }
  writeAllBut(exclude) {
    var args = _slice.call(arguments, 1);
    for(var i in this.users) {
      if(this.users[i] !== exclude) {
        this.users[i].write.apply(this.users[i], arguments);
      }
    }
  }
  writeFiltered() {
    var filter = Array.prototype.pop.call(arguments);
    for(var i in users) {
      if(filter(this.users[i])) {
        this.users[i].write.apply(this.users[i], arguments);
      }
    }
  }
  each(callback, thisArg) {
    this.users.forEach.call(this.users, callback, thisArg);
  }
}

module.exports = MultiplayerServer;
