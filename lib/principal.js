var nitrogen = require('nitrogen')
  , read = require('read')
  , cli = require('../lib');

var help = function(callback) {                
    cli.log.help('ls --filter <json> --limit <count> --skip <count> --sort <field>: List principals matching optional filter.');
    cli.log.help('use <email>: Use the user principal with this email for service interactions.');

    return callback();
};

var list = function(type, callback) {
    cli.globals.startSession(function(err, session, user) {
        if (err) return callback(err);

        var filter = {};
        var options = {};

        if (type) {
            filter = { type: type };
        }

        for (var key in cli.flags) {
            switch (key) {
                case 'limit':
                case 'skip':
                    options[key] = cli.flags[key];
                    break;

                case 'sort':
                    options['sort'] = {};
                    options['sort'][cli.flags[key]] = 1;
                    break;

                case 'filter':
                    filter = JSON.parse(cli.flags['filter']);
                    break;
            }
        }

        nitrogen.Principal.find(session, filter, options, function(err, principals) {
            if (err) return callback(err);

            var widths = [26, 8, 25, 17];
            var columns = ['ID','TYPE', 'NAME', 'LAST IP', 'LAST CONNECTION'];

            cli.log.info(cli.utils.prettyPrint(columns, widths));

            principals.forEach(function(principal) {
                var columns = [
                    principal.id,
                    principal.type,
                    principal.name,
                    principal.last_ip,
                    principal.last_connection
                ];

                cli.log.info(cli.utils.prettyPrint(columns, widths));
            });

            return callback();
        });
    });
};

var use = function(callback) {
    var email = cli.nextArgument();

    if (!email) return callback('Please provide your email to login.');

    read({ prompt: 'Password: ', silent: true }, function(err, password) {
        if (err) return callback(err);

        cli.store.set('email', email, function(err) {
            if (err) return callback(err);

            cli.store.set('password', password, function(err) {
                if (err) return callback(err);

                cli.globals.startSession(function(err, session, user) {
                    if (err) return callback(err);

                    cli.log.info('now using user: ' + user.email);
                    return callback();
                });
            });
        });
    });
}

module.exports.execute = function(callback) {
    var command = cli.nextArgument();
    switch(command) {

        case 'help': {
            help(callback);
            break;
        }

        case 'use': {
            use(callback);
            break;
        }

        case 'ls' : {
            var type = cli.previousArgument(2);
            if (type === 'principal') 
                type = null;

            list(type, callback);
            break;
        }

        default: {
            cli.log.error('unknown principal command: ' + command);
            help(callback);
            break;
        }
    }
};