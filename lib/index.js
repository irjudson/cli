var config = require('../config')
  , help = require('./help')
  , service = require('./service')
  , utils = require('./utils');

module.exports.config = config;

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