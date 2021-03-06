'use strict';

var net = require("net")
  , bunyan = require('bunyan')
  , config = require('../config')
  , log = bunyan.createLogger({ name: "policy" });

function PolicyServer() {
  var policyFile = "<?xml version=\"1.0\"?>\n";
  policyFile += "<!DOCTYPE cross-domain-policy SYSTEM \"http://www.adobe.com/xml/dtds/cross-domain-policy.dtd\">\n";
  policyFile += "<cross-domain-policy>\n";
  policyFile += "<site-control permitted-cross-domain-policies=\"master-only\" />\n";

  for(var i in config.domains) {
    policyFile += "<allow-access-from domain=\""+config.domains[i]+"\" to-ports=\""+config.gamePort+","+(config.gamePort + 1)+"-"+(config.gamePort + 12)+"\" secure=\"false\" />\n";
  }

  policyFile += "</cross-domain-policy>";

  // Start the server
  var server = net.createServer(function(socket) {
    socket.setEncoding('utf8');
    socket.on('data', function(data) {
      if(data.indexOf("<policy-file-request/>") > -1) {
        log.info('Responding to policy request from %s', socket.address().address);

        socket.write(policyFile + "\0");
        socket.end();
      }
    });
    socket.on('end', function() {
      socket.end();
    })
  })
  server.listen(config.policyPort, function() {
    log.info('Flash policy server running on port %d', config.policyPort);
  });
}

module.exports = PolicyServer;
