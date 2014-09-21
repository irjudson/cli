var Log = require('./log');

var arguments;
var flags;

var execute = function(argv, callback) {
    exports.arguments = argv._;
    exports.flags = argv;

    delete exports.flags._;
    delete exports.flags.$0;

    if (process.env.API_KEY && !exports.flags.apiKey) {
        exports.flags.apiKey = process.env.API_KEY;
    }

    var command = nextArgument();

    switch(command) {
        case 'apikeys': {
            module.exports.apikeys.execute(callback);
            break;
        }

        case 'device':
        case 'principal':
        case 'user': {
            module.exports.principal.execute(callback);
            break;
        }

        case 'message': {
            module.exports.message.execute(callback);
            break;
        }

        case 'permissions':
        case 'permission': {
            module.exports.permission.execute(callback);
            break;
        }

        case 'app':
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
                exports.log.error('unknown command: ' + command);

            help(callback);
            break;
        }
    }
};

var help = function(callback) {
    exports.utils.displayCommands('Commands', [
        ['apikeys', 'Manage api keys.'],
        ['app', 'Manage app installation and execution.'],
        ['device', 'Manage devices (alias for principal)'],
        ['message', 'Send and show messages'],
        ['permission', 'Manage permissions between principals.'],
        ['principal', 'Manage principals (devices, users, ...)'],
        ['reactor', 'Manage reactor instances (alias for app)'],
        ['service', 'Manage the Nitrogen service you are working with.'],
        ['user', 'Manage users (alias for principal)']
    ]);

    return callback();
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
};

exports.execute         = execute;
exports.arguments       = [];
exports.nextArgument    = nextArgument;
exports.previousArgument = previousArgument;

exports.log             = new Log(console.log);

exports.store           = require('./store');

exports.globals         = require('./globals');
exports.apikeys         = require('./apikeys');
exports.message         = require('./message');
exports.permission      = require('./permission');
exports.principal       = require('./principal');
exports.reactor         = require('./reactor');
exports.service         = require('./service');
exports.utils           = require('./utils');
