var net = require("net"),
    logger = require('./Logger'),
    config = require('./config');

var server;

exports.start = function() {
  var server = net.createServer(function(socket) {
    socket.write("<?xml version=\"1.0\"?>\n");
    socket.write("<!DOCTYPE cross-domain-policy SYSTEM \"http://www.macromedia.com/xml/dtds/cross-domain-policy.dtd\">\n");
    socket.write("<cross-domain-policy>\n");
    socket.write("<site-control permitted-cross-domain-policies=\"master-only\"/>\n");

    config.domains.forEach(function(domain) {
      var portRange = [config.gamePort, config.gamePort + config.gameRooms];
      socket.write("<allow-access-from domain=\""+config.domain+"\" to-ports=\""+config.lobbyPort+","+portRange[0]+"-"+portRange[1]+"\"/>\n");
    });

    socket.write("</cross-domain-policy>\n");
    socket.end();   
  })
  server.listen(config.policyPort, function() {
    logger.info('Flash policy server running on port ' + config.policyPort);
  });
}

exports.stop = function() {
  logger.info('Flash policy server shutting down.');
  server.close();
}