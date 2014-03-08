var arguments;
var flags;

var execute = function(argv, callback) {
    exports.arguments = argv._;
    exports.flags = argv;
    
    delete exports.flags._;
    delete exports.flags.$0;

    var command = nextArgument();

    switch(command) {
        case 'device':
        case 'principals':
        case 'principal':
        case 'user': {
            module.exports.principal.execute(callback);
            break;
        }

        case 'permissions':
        case 'permission': {
            module.exports.permission.execute(callback);
            break;
        }

        case 'reactor': {
            module.exports.reactor.execute(callback);
            break;
        }

        case 'service': {
            module.exports.service.execute(callback);
            break;
        }

        case 'help':
        default: {
            if (command && command !== 'help')
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

exports.globals         = require('./globals');
exports.help            = require('./help');
exports.permission      = require('./permission');
exports.principal       = require('./principal');
exports.reactor         = require('./reactor');
exports.service         = require('./service');
exports.utils           = require('./utils');