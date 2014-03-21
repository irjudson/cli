var nitrogen = require('nitrogen')
  , cli = require('../lib');

var help = function(callback) {                
    cli.log.help('install <reactor_id> <instance_id> <module-name> [--version]:  Install app into reactor instance.');
    cli.log.help('start <reactor_id> <instance_id> [params]:  Start app in reactor instance.');
    cli.log.help('state <reactor_id>:  Display current state of instances in a reactor.');
    cli.log.help('stop <reactor_id> <instance_id>:  Stop app from reactor instance.');
    cli.log.help('uninstall <reactor_id> <instance_id>:  Uninstall app from reactor instance.');

    return callback();
};

var install = function(callback) {
    var reactorId = cli.nextArgument();
    if (!reactorId) return help(callback);

    var instanceId = cli.nextArgument();
    if (!instanceId) return help(callback);

    var module = cli.nextArgument();
    if (!module) return help(callback);

    cli.globals.startSession(function(err, session, user) {
        if (err) return callback(err);

        var installMsg = new nitrogen.Message({
            to: reactorId,
            type: 'reactorCommand',
            body: {
                command: 'install',
                module: module,
                execute_as: user.id,
                instance_id: instanceId
            }
        });

        if (cli.flags.version) 
            installMsg.body.version = cli.flags.version;

        installMsg.send(session, callback);
    });
};

var sendInstanceCommand = function(action, callback) {
    var reactorId = cli.nextArgument();
    if (!reactorId) return help(callback);

    var instanceId = cli.nextArgument();
    if (!instanceId) return help(callback);

    cli.globals.startSession(function(err, session, user) {
        var msg = new nitrogen.Message({
            to: reactorId,
            type: 'reactorCommand',
            body: {
                command: action,
                instance_id: instanceId
            }
        });

        var params = cli.nextArgument();
        if (params) {
            msg.body.params = JSON.parse(params);
        }

        msg.send(session, callback);
    });
};

var start = function(callback) {
    return sendInstanceCommand('start', callback);
};

var state = function(callback) {
    var reactorId = cli.nextArgument();
    if (!reactorId) return help(callback);

    cli.globals.startSession(function(err, session, user) {
        if (err) return callback(err);

        nitrogen.Message.find(session, { type: 'reactorState', from: reactorId }, 
            { ts: -1, limit: 1 } , function(err, messages) {

            if (err) return callback(err);

            if (messages.length === 0) {
                cli.log.info("couldn't find any reactor state messages for " + reactorId);
                return callback();
            }

            var state = messages[0].body.state;

            cli.log.info('reactor state as of last change on ' + messages[0].ts);

            var widths = [12, 11, 20 , 10, 25, 17];
            var columns = ['INSTANCE','STATE', 'MODULE', 'VERSION', 'EXECUTE AS', 'PARAMS'];
            cli.log.info(cli.utils.prettyPrint(columns, widths));

            if (!state || Object.keys(state).length === 0) {
                cli.log.info("(nothing installed)");
                return callback();
            }

            Object.keys(state).forEach(function(instanceId) {
                var columns = [
                    instanceId,
                    state[instanceId].state,
                    state[instanceId].module,
                    state[instanceId].version || "",
                    state[instanceId].execute_as,
                    state[instanceId].params || ""
                ];

                cli.log.info(cli.utils.prettyPrint(columns, widths));
            });

            return callback();
        });
    });
};

var stop = function(callback) {
    return sendInstanceCommand('stop', callback);
};

var uninstall = function(callback) {
    return sendInstanceCommand('uninstall', callback);
};

module.exports.execute = function(callback) {
    var command = cli.nextArgument();
    switch(command) {
        case 'help': {
            help(callback);
            break;
        }

        case 'install': {
            install(callback);
            break;
        }

        case 'start' : {
            start(callback);
            break;
        }

        case 'state' : {
            state(callback);
            break;
        }

        case 'stop' : {
            stop(callback);
            break;
        }

        case 'uninstall' : {
            uninstall(callback);
            break;
        }

        default: {
            cli.log.error('unknown reactor command: ' + command);
            help(callback);
            break;
        }
    }
};