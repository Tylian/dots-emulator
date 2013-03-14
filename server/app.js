var PolicyServer = require('./src/PolicyServer'),
    LobbyServer = require('./src/LobbyServer'),
    GameServer = require('./src/GameServer');
    
// Set up the logger
var winston = require('winston');
winston.cli();

var policyServer = new PolicyServer();
var lobbyServer = new LobbyServer();

// TODO: Graceful shutdown