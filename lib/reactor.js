var nitrogen = require('nitrogen')
  , cli = require('../lib');

var install = function(callback) {
    var module = cli.nextArgument();
    if (!module) return help(callback);

    var reactorId = cli.nextArgument();
    if (!reactorId) return help(callback);

    var instanceId = cli.nextArgument();
    if (!instanceId) return help(callback);

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
                console.log("couldn't find any reactor state messages for " + reactorId);
                return callback();
            }

            var state = messages[0].body.state;

            console.log('reactor state as of last change on ' + messages[0].ts);

            var widths = [12, 8, 20 , 10, 25, 17];
            var columns = ['INSTANCE','STATE', 'MODULE', 'VERSION', 'EXECUTE AS', 'PARAMS'];
            console.log(cli.utils.prettyPrint(columns, widths));

            if (!state || Object.keys(state).length === 0) {
                console.log("(nothing installed)");
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

                console.log(cli.utils.prettyPrint(columns, widths));
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
            console.log('unknown app command: ' + command);
            break;
        }
    }
};