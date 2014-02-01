var async = require('async')
  , help = require('./help')
  , principal = require('./principal')
  , service = require('./service')
  , store = require('./store')
  , utils = require('./utils');

var arguments;

var execute = function(args, callback) {
    arguments = args;

    switch(nextArgument()) {
        case 'service': {
            service.execute(callback);
            break;
        }

        case 'user': {
            principal.execute(callback);
            break;
        }

        case 'help':
        default: {
            help.execute(callback);
            break;
        }
    }
};

var nextArgument = function(commands) {
    var command;
    
    if (commands && commands.length > 0) {
        command = commands.splice(0,1)[0];
    }

    return command;
};

module.exports = {
    execute: execute,
    nextArgument: nextArgument,
    store: store,

    help: help,
    principal: principal,
    service: service
};