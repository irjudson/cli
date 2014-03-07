var nitrogen = require('nitrogen')
  , cli = require('../lib');

var state = function(callback) {
    var reactorId = cli.nextArgument();

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

            var widths = [26, 8, 12, 10, 25, 17];
            var columns = ['INSTANCE ID','STATE', 'MODULE', 'VERSION', 'EXECUTE AS', 'PARAMS'];
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
                    state[instanceId].version,
                    state[instanceId].execute_as,
                    state[instanceId].params
                ];

                console.log(cli.utils.prettyPrint(columns, widths));
            });

            return callback();
        });
    });
};

module.exports.execute = function(callback) {
    var command = cli.nextArgument();
    switch(command) {
        case 'state' : {
            state(callback);
            break;
        }

        default: {
            console.log('unknown app command: ' + command);
            break;
        }
    }
};