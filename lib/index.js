var async = require('async')
  , help = require('./help')
  , principal = require('./principal')
  , service = require('./service')
  , store = require('./store')
  , utils = require('./utils');

var execute = function(commands, options, callback) {
    switch(utils.popCommand(commands)) {
        case 'service': {
            service.execute(commands, options, callback);
            break;
        }

        case 'user': {
            principal.execute(commands, options, callback);
            break;
        }

        case 'help':
        default: {
            help.execute(commands, options, callback);
            break;
        }
    }
};

module.exports = {
    execute: execute,
    store: store,

    help: help,
    principal: principal,
    service: service
};