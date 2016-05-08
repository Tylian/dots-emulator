'use strict';

var _slice = Array.prototype.slice;

class MultiplayerUser {
  constructor(socket, parent) {
    this.socket = socket;
  	this.parent = parent;
  }
  write() {
  	for(var i = 0; i < arguments.length; i++) {
  		this.socket.write.call(this.socket, arguments[i] + '\0');
  	}
  }
  writeOthers() {
  	this.parent.writeAllBut.apply(this.parent, [this].concat(_slice.call(arguments)));
  }
}

module.exports = MultiplayerUser;
