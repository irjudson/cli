var arguments;

var execute = function(callback) {
    switch(nextArgument()) {
        case 'service': {
            module.exports.service.execute(callback);
            break;
        }

        case 'principal':
        case 'principals':
        case 'user': {
            module.exports.principal.execute(callback);
            break;
        }

        case 'help':
        default: {
            module.exports.help.execute(callback);
            break;
        }
    }
};

var nextArgument = function() {
    var argument;
    
    if (exports.arguments && exports.arguments.length > 0) {
        argument = exports.arguments.splice(0,1)[0];
    }

    return argument;
};

exports.execute         = execute;
exports.arguments       = [];
exports.nextArgument    = nextArgument;

exports.store           = require('./store');

exports.help            = require('./help');
exports.principal       = require('./principal');
exports.service         = require('./service');