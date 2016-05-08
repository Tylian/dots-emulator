'use strict';

var PolicyServer = require('./src/PolicyServer'),
    LobbyServer = require('./src/LobbyServer'),
    GameServer = require('./src/GameServer');

var package = require('./package.json');

// Set up the logger
var bunyan = require('bunyan')
  , log = bunyan.createLogger({ name: 'app' });

log.info('Begining startup of %s v%s', package.name, package.version);

var policyServer = new PolicyServer();
var lobbyServer = new LobbyServer();
