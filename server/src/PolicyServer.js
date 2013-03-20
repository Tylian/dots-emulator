var net = require("net"),
    logger = require('winston'),
    config = require('../config');

function PolicyServer() {
  var server = net.createServer(function(socket) {
    socket.on('data', function(data) {
      if(data == "<policy-file-request/>\0") {
        logger.info('Responding to policy request from ' + socket.address().address);

        socket.write("<?xml version=\"1.0\"?>\n");
        socket.write("<!DOCTYPE cross-domain-policy SYSTEM \"http://www.macromedia.com/xml/dtds/cross-domain-policy.dtd\">\n");
        socket.write("<cross-domain-policy>\n");
        socket.write("<site-control permitted-cross-domain-policies=\"master-only\" />\n");

        var portRange = [config.gamePort + 1, config.gamePort + 12];
        config.domains.forEach(function(domain) {
          socket.write("<allow-access-from domain=\""+config.domain+"\" to-ports=\""+config.gamePort+","+portRange[0]+"-"+portRange[1]+"\" secure=\"false\" />\n");
        });

        socket.write("</cross-domain-policy>\0");
        socket.end();   
      }
    }); 
  })
  server.listen(config.policyPort, function() {
    logger.info('Flash policy server running on port ' + config.policyPort);
  });
}

module.exports = PolicyServer;