var nitrogen = require('nitrogen')
  , cli = require('../lib');

var send = function(callback) {
    var jsonString = cli.nextArgument();
    var messageJson = JSON.parse(jsonString);

    cli.globals.startSession(function(err, session, user) {
        if (err) return callback(err);

        new nitrogen.Message(messageJson).send(session, callback);
    });
};

var help = function(callback) {                
    cli.log.help('send [messageJSON]: Send a message.  (eg. send \'{"type": "_temp", "body": { "temp": 15.5 } }\'');

    return callback();
};

module.exports.execute = function(callback) {
    var command = cli.nextArgument();

    switch(command) {
        case 'send': {
            console.log('in message execute send');
            send(callback);
            break;
        }

        case 'help': {
            help(callback);
            break;
        }

        default: {
            cli.log.error('unknown message command: ' + command);
            help(callback);
            break;
        }
    }
};