var winston = require('winston');

var logger = new (winston.Logger)({
	transports: [
		new winston.transports.Console({
			colorize: true,
			level: 'info'
		}),
		new winston.transports.File({
			filename: 'log-all.log',
		})
	],
});

module.exports = logger;