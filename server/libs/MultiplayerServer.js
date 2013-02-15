var util = require('util'),
    net = require('net'),
    events = require('events');

var _slice = Array.prototype.slice;

function MultiplayerServer() {
	events.EventEmitter.call(this);

	this.server = null;
	this.users = [];

	var _parent = this;
	this.User = function(socket) {
		this.socket = socket;
	}
	this.User.prototype.write = function() {
		for(var i = 0; i < arguments.length; i++) {
			this.socket.write.call(this.socket, arguments[i] + '\0');
		}
	}
	this.User.prototype.writeOthers = function() {
		_parent.writeAllBut.apply(_parent, [this].concat(_slice.call(arguments)));
	}
}
util.inherits(MultiplayerServer, events.EventEmitter);

MultiplayerServer.prototype.start = function(port, callback) {
	var self = this; // Just incase?
	this.server = net.createServer(function(socket) {
		var user = new self.User(socket);

		self.users.push(user);
		self.emit('connection', user);
		
		socket.setEncoding('utf8');
		socket.on('data', function(data) {
			data = data.substr(0, data.length - 1);
			self.emit('data', user, data);
		});
		socket.on('close', function() {
			self.emit('disconnect', user);
			self.users.splice(self.users.indexOf(user), 1);
			delete user;
		});
	});
	this.server.on('close', function() {
		self.emit('close');
	})
	this.server.listen(port, callback);
}

MultiplayerServer.prototype.count = function() {
	return this.users.length;
}
MultiplayerServer.prototype.close = function() {
	this.server.close();
}

MultiplayerServer.prototype.writeAll = function() {
	for(var i in this.users) {
	  this.users[i].write.apply(this.users[i], arguments)
	}
}

MultiplayerServer.prototype.writeAllBut = function(exclude) {
	var args = _slice.call(arguments, 1);
	for(var i in this.users) {
		if(this.users[i] === exclude) continue;
		this.users[i].write.apply(this.users[i], arguments);
	}
}

MultiplayerServer.prototype.writeFiltered = function() {
	var filter = Array.prototype.pop.call(arguments);
	for(var i in users) {
		if(!filter(this.users[i])) continue;
		this.users[i].write.apply(this.users[i], arguments);
	}
}

MultiplayerServer.prototype.each = function(callback, thisArg) {
	this.users.forEach.call(this.users, callback, thisArg);
}

module.exports = MultiplayerServer;