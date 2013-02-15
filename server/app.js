var PolicyServer = require('./libs/PolicyServer'),
    LobbyServer = require('./libs/LobbyServer'),
    GameServer = require('./libs/GameServer');
    
// Set up the logger
var winston = require('winston');
winston.cli();

var policyServer = new PolicyServer();
var lobbyServer = new LobbyServer();

// TODO: Graceful shutdown