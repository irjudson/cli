var cli = require('../lib')
  , fs = require('fs')
  , moment = require('moment')
  , nitrogen = require('nitrogen');

var help = function(callback) {

    cli.utils.displayCommands('Message Commands', [
        ['ls [filter]', 'Show messages matching an optional filter. (eg. ls \'{"type": "image"}\''],
        ['replay <file>', 'Replays a message stream from <file>'],
        ['send [message]', 'Send a message.  (eg. send \'{"type": "_temp", "body": { "temp": 15.5 } }\'']
    ]);

    return callback();
};

var list = function(callback) {
    var filterString = cli.nextArgument();
    var filter;

    if (filterString) {
        filter = JSON.parse(filterString);
    } else {
        filter = {};
    }

    cli.globals.startSession(function(err, session, user) {
        if (err) return callback(err);

        // TODO: Add in limit, sorts, skip flags.
        var options = { limit: 10, sort: { ts: -1 } };

        nitrogen.Message.find(session, filter, options, function(err, messages) {
            if (err) return callback(err);

            var widths = [23, 25, 25, 15, 17];
            var columns = ['TIMESTAMP', 'FROM', 'TO', 'TYPE', 'BODY'];

            cli.log.info(cli.utils.prettyPrint(columns, widths));

            messages.forEach(function(message) {
                var columns = [
                    moment(message.ts).format('MM/DD/YYYY HH:mm:ss.SS'),
                    message.from,
                    message.to || "",
                    message.type,
                    JSON.stringify(message.body || "")
                ];

                cli.log.info(cli.utils.prettyPrint(columns, widths));
            });

            return callback();
        });
    });
};

var replay = function(callback) {
    var filePath = cli.nextArgument();
    fs.readFile(filePath, function(err, jsonString) {
        if (err) return callback(err);

        var messages = JSON.parse(jsonString);

        var lastTimestamp;

        cli.globals.startSession(function(err, session, user) {
            if (err) return callback(err);

            messages.forEach(function(messageObject) {
                var message = new nitrogen.Message(messageObject);

                if (lastTimestamp) {
                    var delta = message.ts - lastTimestamp;
                    sleep(delta);
                }

                lastTimestamp = message.ts;
                message.ts = new Date();

                message.send(session, function(err, messages) {
                    if (err) {
                        cli.log.error('failed to replay message: ' + err);
                    } else {
                        cli.log.info('replayed: ' + JSON.stringify(messages[0]));
                    }
                });
            });

            setTimeout(function() { return callback() }, 100);
        });
    });
};

var send = function(callback) {
    var jsonString = cli.nextArgument();
    var messageJson = JSON.parse(jsonString);

    cli.globals.startSession(function(err, session, user) {
        if (err) return callback(err);

        new nitrogen.Message(messageJson).send(session, callback);
    });
};

module.exports.execute = function(callback) {
    var command = cli.nextArgument();

    switch(command) {
        case 'help': {
            help(callback);
            break;
        }

        case 'ls': {
            list(callback);
            break;
        }

        case 'replay': {
            replay(callback);
            break;
        }

        case 'send': {
            console.log('in message execute send');
            send(callback);
            break;
        }

        default: {
            cli.log.error('unknown message command: ' + command);
            help(callback);
            break;
        }
    }
};