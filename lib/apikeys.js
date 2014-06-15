var nitrogen = require('nitrogen')
  , cli = require('../lib');

var help = function(callback) {
    cli.utils.displayCommands('ApiKey Commands', [
        ['ls',  'Display all api keys.']
    ]);

    return callback();
};

var list = function(callback) {
    cli.globals.startSession(function(err, session, user) {
        if (err) return callback(err);

        nitrogen.ApiKey.find(session, {}, {}, function(err, apiKeys) {
            if (err) return callback(err);

            var widths = [26, 15, 34, 17];
            var columns = ['ID', 'NAME', 'KEY', 'OWNER'];

            cli.log.info(cli.utils.prettyPrint(columns, widths));

            apiKeys.forEach(function(apiKey) {
                var columns = [
                    apiKey.id,
                    apiKey.name ? apiKey.name : "",
                    apiKey.key,
                    apiKey.owner
                ];

                cli.log.info(cli.utils.prettyPrint(columns, widths));
            });

            return callback();
        });
    });
};

module.exports.execute = function(callback) {
    var command = cli.nextArgument();
    switch(command) {
        case 'ls': {
            list(callback);
            break;
        }

        case 'help': {
            help(callback);
            break;
        }

        default: {
            cli.log.error('unknown permission command: ' + command);
            help(callback);
            break;
        }
    }
};
