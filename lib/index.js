var arguments;

var execute = function(callback) {
    var command = nextArgument();

    switch(command) {
        case 'service': {
            module.exports.service.execute(callback);
            break;
        }

        case 'app':
        case 'device':
        case 'principal':
        case 'user': {
            module.exports.principal.execute(callback);
            break;
        }

        case 'help':
        default: {
            if (command !== 'help')
                console.log('unknown command: ' + command);

            module.exports.help.execute(callback);
            break;
        }
    }
};

var currentArgument = 0;

var nextArgument = function() {
    var argument;
    
    if (exports.arguments && exports.arguments.length > currentArgument) {
        argument = exports.arguments[currentArgument++];
    }

    return argument;
};

var previousArgument = function(back) {
    var previous = exports.arguments[currentArgument-back];

    return previous;
}

exports.execute         = execute;
exports.arguments       = [];
exports.nextArgument    = nextArgument;
exports.previousArgument = previousArgument;

exports.store           = require('./store');

exports.help            = require('./help');
exports.principal       = require('./principal');
exports.service         = require('./service');