var net = require("net")
  , logger = require('winston')
  , config = require('../config');

var GameServer = require('./GameServer'),
    MultiplayerServer = require('./MultiplayerServer');

function LobbyServer() {
    this.history = [];  // Chat history buffer
    this.rooms = [];    // Array of room data
    this.userIds = [];  // Array of currently in use IDs

    this.rooms['none'] = new Room();
    for(var i = 1; i <= 12; i++) {
      this.rooms[i.toString()] = new Room();
    }

    this.port = config.gamePort;

    this.server = new MultiplayerServer();

    var server = this.server;
    var lobby = this;

    server.on('connection', function(user) {
      logger.info('Connection from ' + user.socket.address().address);

      user.id = lobby.getUniqueId();
      user.name = "User";
      user.fullname = user.name + '`' + user.id;
      user.room = 'none';

      user.admin = false;

      lobby.rooms['none'].users.push(user);
    });

    server.on('data', function(user, data) {
      switch(data[0]) {
        case 'r': // User name
          user.name = data.substr(1);
          user.fullname = user.name + '`' + user.id;
          user.write('d' + user.id, 'g');   // User ID, dequeue
          break;
          
        case 'q': // Quit game room
          if(lobby.rooms[user.room].started) {
            var room = user.room;

            lobby.rooms[room].started = false;
            lobby.rooms[room].users.forEach(function(roomUser) {
              server.writeAll('l' + roomUser.room + '`' + roomUser.fullname);
              roomUser.room = 'none';
            });
            
            server.writeAll('r' + room);
            lobby.rooms[room].users = [];
          }

          user.write('g');
          break;
          
        case 'o': // Join lobby
          user.writeOthers('j' + user.room + '`' + user.fullname);
          server.each(function(u) {
            user.write('j' + u.room + '`' + u.fullname);
          });

          user.write.apply(user, lobby.history);

          for(var i in lobby.rooms) {
            if(lobby.rooms[i].started) {
              user.write('s'+i);
            }
          }
          break;
          
        case 'c': // Chat
          var chat = data.substr(1);

          if(chat.substr(0, user.name.length + 9) == '<b>' + user.name + '</b>: ') {
            server.emit('chat', user, chat.substr(user.name.length + 9));
          } else {
            logger.warn('Malformed chat from ' + user.fullname + '  ' + chat);
          }
          break;
        
        case 'j': // Join room
          // There's a bit of a bug-fix in the client here.
          // If the client requests an invalid room, the client still waits for a "join room" response from the server
          // Even worse, if they're in the "none" room, sending them to the current room doesn't unlock the client.
          // So to work around this, we move them to their current room, or the room they requested then back if they're in "none".
          if(!lobby.isValidRoom(data.substr(1))) {
            if(user.room == 'none')
              user.write('j' + data.substr(1) + '`' + user.fullname);

            user.write('l' + user.room + '`' + user.fullname);
            user.write('j' + user.room + '`' + user.fullname);
            break;
          }

          lobby.rooms[user.room].removeUser(user);
          server.writeAll('l' + user.room + '`' + user.fullname);

          user.room = data.substr(1);
          lobby.rooms[user.room].users.push(user)
          server.writeAll('j' + user.room + '`' + user.fullname);
          break;
        
        case 's': // Start game
          var room = parseInt(user.room);

          lobby.rooms[user.room].started = true;
          lobby.rooms[user.room].server = new GameServer(room);

          server.writeAll('s' + user.room);
          break;
        
        default: logger.warn('Unknown lobby packet: ' + data);
      }
    });

    server.on('chat', function(user, text) {
      var message = '<b>' + user.name + '</b>: ' + text;

      if(text[0] != '/') {
        if(user.admin) {
          message = '<font color="#ff0000">' + message + '</font>';
        }

        lobby.history.push('c' + message);
        lobby.history = lobby.history.slice(-40);

        server.writeAll('c' + message);
      } else {
        var command = text.split(' ');
        switch(command[0]) {
          case '/admin':
            if(command[1] == config.adminPassword || user.admin) {
              user.admin = !user.admin;
              user.write('c<b>Admin mode ' + (user.admin ? 'enabled' : 'disabled') + '.</b>');
            }
            return;
          case '/debug':
            if(!user.admin) return;
            config.debug = !config.debug;
            server.writeAll('c<b>Debug mode ' + (config.debug ? 'enabled' : 'disabled') + '.</b>');
            return;
        }
      }
    });

    server.on('disconnect', function(user) {
        logger.info(user.name + ' disconnected');
        user.writeOthers('l'+user.room+'`'+user.fullname);

        lobby.userIds.splice(lobby.userIds.indexOf(user.id), 1);
    });

    server.start(lobby.port, function() {
      logger.info('Lobby server running on port ' + lobby.port);
    });
}

LobbyServer.prototype.isValidRoom = function(id) {
  var numberId = parseInt(id, 10);
  if(isNaN(numberId)) {
    return id == "none";
  }
  return numberId >= 1 && numberId <= 12 && this.rooms[id].users.length < 4;
}
LobbyServer.prototype.getUniqueId = function() {
  while(true) {
    var id = Math.round(Math.random() * 9999);
    if(this.userIds.indexOf(id) > -1) continue;
    this.userIds.push(id);
    return id;
  }
}


function Room() {
  this.users = [];
  this.started = false;
  this.server = null;
}

Room.prototype.removeUser = function(user) {
  var index = this.users.indexOf(user);
  if(index > -1) {
    this.users.splice(this.users.indexOf(user), 1);
  }
}

module.exports = LobbyServer;