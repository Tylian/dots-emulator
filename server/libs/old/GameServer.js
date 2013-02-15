
function GameServer(room) {
  var server = net.createServer(function(socket) {
    var id = usersConnected++;
    var user = new User('User ' + id, id, socket);
    this.addUser

    socket.setEncoding('utf8');
    socket.on('data', function(data) {
      data = data.substr(0, data.length - 1);
      if(data.charAt(0) != 'm') { // For the log of god don't love mouse array packets
        logger.debug('Game' + roomNumber + ' RECV ' + this.id + ' -> ' + data);
      }
      
      switch(data.charAt(0)) {
        case 'i': // Player info
          var arg = data.substr(1).split('`');
          this.name = arg[0]
          this.id = arg[1]
          this.color1 = arg[2]
          this.color2 = arg[3];
          this.fullname = this.name+'`'+this.id;
          this.connected = true;

          this.writeAll('i'+this.name+'`'+this.id+'`'+this.color1+'`'+this.color2+'`'+this.index);
		  
          // TODO: Fix me - Sometimes information doesn't reach the user
          for(var i in users) {
            if(users[i].connected && i !== this.index) {
              this.write('i'+users[i].name+'`'+users[i].id+'`'+users[i].color1+'`'+users[i].color2+'`'+users[i].index);
            }
          }
          
          this.write(dotMap);
          break;
        
        case 'm': // Mouse movement array
          this.writeOthers(data); // TODO: Fix this, lazy hack.
          break;
        
        case 'x': // Dot clicked
          var dot = data.substr(1);
          if(dotsClicked[dot]) break;
          dotsClicked[dot] = true;

          this.score++;
          this.writeAll('x' + this.index + dot);
          if(--dotsRemaining == 0) {
            finishGame();
          }
          break;
          
        case 'e': // Game ended
          finishGame();
          break;
        
        default: logger.warn('Unknown game server packet: ' + data);
      }
    }.bind(users[id]));
    socket.on('close', function() {
      usersConnected--;
      user.connected = false;
      users.splice(users.indexOf(user), 1);
      delete user;
    });
  });
  server.on('close', function() {
    logger.info('Game server ' + (roomNumber + 1) + ' shutting down');
  });
  server.listen(config.gamePort + roomNumber, function() {
    logger.info('Game server ' + (roomNumber + 1) + ' running on port ' + config.gamePort + roomNumber);
  });
}

function generateMap() {
  var result = [];
  
  function random(max, min) {
    if(min === undefined) min = 0;
    return Math.round(Math.random() * (max - min)) + min;
  }

  var sizeModifier = random(5, -5);
  
  var dots = random(70, 20);
  for(var i = 0; i < dots; i++) {
    var size = random(43, 17) + sizeModifier; // 35px to 85px in size
    var dot = [random(550, size), random(400, size), size * 2];
    result.push(dot.join('`'));
  }

  dotsRemaining = dots;
  return 'w' + result.join(',');
}

function User(name, index, socket) {
  this.name = name;
  this.id = '0';
  this.fullname = name+'`0';
  this.color1 = '0xffffff';
  this.color2 = '0x000000';
  
  this.index = index;
  this.score = 0;

  this.socket = socket;
  this.connected = false;

  this.write = function() {
    for(var i = 0; i < arguments.length; i++) {
      if(arguments[i].charAt(0) != "m") { // For the love of god do not log mouse array
        logger.debug('Game' + roomNumber + ' SEND ' + this.id + ' <- ' + arguments[i]);
      }
      this.socket.write.call(this.socket, arguments[i] + '\0');
    }
  }
  this.writeAll = function() {
    for(var i in users) {
      if(users[i].connected) {
        users[i].write.apply(users[i], arguments);
      }
    }
  }
  this.writeOthers = function() {
    for(var i in users) {
      if(users[i] === this || !users[i].connected) continue;
      users[i].write.apply(users[i], arguments)
    }
  }
}