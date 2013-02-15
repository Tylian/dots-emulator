var net = require("net"),
logger = require('./Logger'),
config = require('./config'),
GameServer = require('./GameServer');

var server;
var users = [];
var history = [];
var roomStarted = {};

exports.start = function() {
  var server = net.createServer(function(socket) {
    var id = getUniqueId();
    var user = new User('User ' + id, id, 'none', socket);
    users.push(user);

    socket.setEncoding('utf8');
    socket.on('data', function(data) {
      data = data.substr(0, data.length - 1);
      logger.debug('Lobby RECV ' + this.id + ' -> ' + data);
      
      switch(data.charAt(0)) {
        case 'r': // User name
          this.name = data.substr(1);
          this.fullname = this.name+'`'+this.id;
          this.write('d' + id, 'g');   // User ID, dequeue
          break;
          
        case 'q': // Quit game room
          if(roomStarted[this.room] !== undefined) {
            delete roomStarted[this.room];
            this.writeAll('r' + this.room); // Send room reset
            for(var i in users) {
              if(users[i].room == this.room) {
                users[i].room = 'none';
                this.writeAll('j'+users[i].room+'`'+users[i].fullname);
              }
            }
          }
          this.write('g');      // De-queue packet
          this.room = 'none';   // The above code should have already done this, but I'll leave this here just incase
          
        case 'o': // Join lobby
          this.writeOthers('j'+this.room+'`'+this.fullname);
          for(i in users) {
            this.write('j'+users[i].room+'`'+users[i].fullname);
          }

          for(i = 0; i < history.length; i++) {
            this.write(history[i]);
          }
          for(var i in roomStarted) {
            this.write('s'+i);
          }
          break;
          
        case 'c': // Chat
          this.writeAll(data);
          history.push(data);
          history = history.slice(-40);
          break;
        
        case 'j': // Join room
          var oldRoom = this.room;
          this.room = data.substr(1);
          this.writeAll('l'+oldRoom+'`'+this.fullname, 'j'+this.room+'`'+this.fullname);
          break;
        
        case 's': // Start game
          var room = parseInt(this.room);
          if(isNaN(room)) {
            logger.warn('Hacking attempt: ' + this.name + ' started invalid room ' + this.room);
            break;
          }

          var gameServer = new GameServer(room);

          roomStarted[this.room] = true;
          this.writeAll('s'+this.room);

          break;
        
        default: logger.warn('Unknown lobby packet: ' + data);
      }
    }.bind(user));
    socket.on('close', function() {
      for(var i in users) {
        if(users[i].id == id) continue;
        users[i].write('l'+users.room+'`'+users.name+'`'+id);
      }
      users.splice(users.indexOf(user), 1);
      delete user;
    });
  });
  server.listen(config.gamePort, function() {
    logger.info('Lobby server running on port ' + config.lobbyPort);
  });
}

function User(name, id, room, socket) {
  this.name = name;
  this.id = id;
  this.fullname = name+'`'+id;
  this.room = room;
  this.socket = socket;
  this.write = function() {
    for(var i = 0; i < arguments.length; i++) {
      logger.debug('Lobby SEND ' + this.id + ' <- ' + arguments[i]);
      this.socket.write.call(this.socket, arguments[i] + '\0');
    }
  }
  this.writeAll = function() {
    for(var i in users) {
      users[i].write.apply(users[i], arguments)
    }
  }
  this.writeOthers = function() {
    for(var i in users) {
      if(users[i] === this) continue;
      users[i].write.apply(users[i], arguments)
    }
  }
}

exports.stop = function() {
  logger.info('Lobby server shutting down.');
  server.close();
}

function getUniqueId() {
  o:while(true) {
    var id = Math.round(Math.random() * 9999);
    for(var i in users) {
      if(users[i].id == id) continue o;
    }
    return id;
  }
}