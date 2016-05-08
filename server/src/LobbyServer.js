'use strict';

var net = require("net")
  , bunyan = require('bunyan')
  , config = require('../config')
  , log = bunyan.createLogger({ name: "lobby" });

var GameServer = require('./GameServer'),
    MultiplayerServer = require('./MultiplayerServer');

class LobbyServer {
  constructor() {
    this.history = [];  // Chat history buffer
    this.rooms = [];    // Array of room data
    this.userIds = [];  // Array of currently in use IDs

    this.rooms['none'] = new Room();
    for(var i = 1; i <= 12; i++) {
      this.rooms[i.toString()] = new Room();
    }

    this.port = config.gamePort;

    var server = new MultiplayerServer();
    this.server = server;

    server.on('connection', user => {
      log.info('Connection from %s', user.socket.address().address);

      user.id = this.getUniqueId();
      user.name = "User";
      user.fullname = user.name + '`' + user.id;
      user.room = 'none';

      user.admin = false;

      this.rooms['none'].users.push(user);
    });

    server.on('data', (user, data) => {
      switch(data[0]) {
        case 'r': // User name
          user.name = data.substr(1);
          user.fullname = user.name + '`' + user.id;
          user.write('d' + user.id, 'g');   // User ID, dequeue
          break;

        case 'q': // Quit game room
          if(this.rooms[user.room].started) {
            var room = user.room;

            this.rooms[room].started = false;
            this.rooms[room].users.forEach(roomUser => {
              server.writeAll('l' + roomUser.room + '`' + roomUser.fullname);
              roomUser.room = 'none';
            });

            server.writeAll('r' + room);
            this.rooms[room].users = [];
          }

          user.write('g');
          break;

        case 'o': // Join lobby
          user.writeOthers('j' + user.room + '`' + user.fullname);
          server.each(u => {
            user.write('j' + u.room + '`' + u.fullname);
          });

          user.write.apply(user, this.history);

          for(var i in this.rooms) {
            if(this.rooms[i].started) {
              user.write('s'+i);
            }
          }
          break;

        case 'c': // Chat
          var chat = data.substr(1);

          if(chat.substr(0, user.name.length + 9) == '<b>' + user.name + '</b>: ') {
            server.emit('chat', user, chat.substr(user.name.length + 9));
          } else {
            log.warn('Malformed chat from %s  %s', user.fullname, chat);
          }
          break;

        case 'j': // Join room
          // There's a bit of a bug-fix in the client here.
          // If the client requests an invalid room, the client still waits for a "join room" response from the server
          // Even worse, if they're in the "none" room, sending them to the current room doesn't unlock the client.
          // So to work around this, we move them to their current room, or the room they requested then back if they're in "none".
          if(!this.isValidRoom(data.substr(1))) {
            if(user.room == 'none')
              user.write('j' + data.substr(1) + '`' + user.fullname);

            user.write('l' + user.room + '`' + user.fullname);
            user.write('j' + user.room + '`' + user.fullname);
            break;
          }

          this.rooms[user.room].removeUser(user);
          server.writeAll('l' + user.room + '`' + user.fullname);

          user.room = data.substr(1);
          this.rooms[user.room].users.push(user)
          server.writeAll('j' + user.room + '`' + user.fullname);
          break;

        case 's': // Start game
          var room = parseInt(user.room);

          this.rooms[user.room].started = true;
          this.rooms[user.room].server = new GameServer(room);

          server.writeAll('s' + user.room);
          break;

        default: log.warn('Unknown lobby packet: %s', data);
      }
    });

    server.on('chat', (user, text) => {
      var message = '<b>' + user.name + '</b>: ' + text;

      if(text[0] != '/') {
        if(user.admin) {
          message = '<font color="#ff0000">' + message + '</font>';
        }

        this.history.push('c' + message);
        this.history = this.history.slice(-40);

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

    server.on('disconnect', user => {
        log.info(' %s disconnected', user.name );
        user.writeOthers('l'+user.room+'`'+user.fullname);

        this.userIds.splice(this.userIds.indexOf(user.id), 1);
    });

    server.start(this.port, () => {
      log.info('Lobby server running on port %d', this.port);
    });
  }
  isValidRoom(id) {
    var numberId = parseInt(id, 10);
    if(isNaN(numberId)) {
      return id == "none";
    }
    return numberId >= 1 && numberId <= 12 && this.rooms[id].users.length < 4;
  }
  getUniqueId() {
    while(true) {
      var id = Math.round(Math.random() * 9999);
      if(this.userIds.indexOf(id) > -1) continue;
      this.userIds.push(id);
      return id;
    }
  }
}

class Room {
  constructor() {
    this.users = [];
    this.started = false;
    this.server = null;
  }
  removeUser(user) {
    var index = this.users.indexOf(user);
    if(index > -1) {
      this.users.splice(this.users.indexOf(user), 1);
    }
  }
}

module.exports = LobbyServer;
