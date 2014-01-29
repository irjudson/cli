var async = require('async')
  , config = require('../config')
  , help = require('./help')
  , service = require('./service')
  , utils = require('./utils');

module.exports.config = config;

var CONFIG_KEYS = [
    'host',
    'http_port', 
    'protocol'
];

module.exports.CONFIG_KEYS = CONFIG_KEYS;

module.exports.load = function(callback) {
	async.each(CONFIG_KEYS, function(key, keyCallback) {
		config.store.get(key, function(err, value) {
			if (!err && value !== null) {
				config[key] = value;	
				return keyCallback();
			} else {
				if (config[key]) {
					config.store.set(key, config[key], keyCallback);
				}
			}
		});
	}, callback);
};

module.exports.execute = function(commands, options, callback) {
	    switch(utils.popCommand(commands)) {
	        case 'service': {
	            service.execute(commands, options, callback);
	            break;
	        }

	        default: {
	            help.execute(commands, options, callback);            
	        }
	    }
};