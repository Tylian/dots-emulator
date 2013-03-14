var PolicyServer = require('./src/PolicyServer'),
    LobbyServer = require('./src/LobbyServer'),
    GameServer = require('./src/GameServer');
    
var package = require('./package.json');

// Set up the logger
var winston = require('winston');
winston.cli();

winston.info('Begining startup of ' + package.name + ' v' + package.version);

var policyServer = new PolicyServer();
var lobbyServer = new LobbyServer();