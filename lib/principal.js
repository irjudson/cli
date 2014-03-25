var nitrogen = require('nitrogen')
  , read = require('read')
  , cli = require('../lib');

var create = function(callback) {
    var email = cli.nextArgument();
    if (!email) return callback('Please provide email address for.');

    read({ prompt: 'Choose a password: ', silent: true }, function(err, password) {
        if (err) return callback(err);
        if (password.length < 8) return callback('Please enter a password of at least 8 characters.');

        read({ prompt: 'Repeat password: ', silent: true }, function(err, repeatPassword) {
            if (err) return callback(err);
            if (password !== repeatPassword) return callback('Passwords do not match');

            read({ prompt: 'Full name: ' }, function(err, name) {
                if (err) return callback(err);
                if (name.length === 0) return callback('Please enter your name.');

                var user = new nitrogen.User({
                    name: name,
                    email: email,
                    password: password,
                    nickname: 'current'
                });

                cli.service.getService(function(err, service) {
                    if (err) return callback(err);

                    service.create(user, function(err) {
                        if (err) return callback(err);

                        setCredentials(email, password, callback);
                    });
                });
            });
        });
    });
};

var help = function(callback) {                
    cli.log.help('create <email>: Create user principal with the given email address.');
    cli.log.help('login <email>: Use the user principal with this email for service interactions.');
    cli.log.help('ls --filter <json> --limit <count> --skip <count> --sort <field>: List principals matching optional filter.');

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

var login = function(callback) {
    var email = cli.nextArgument();

    if (!email) return callback('Please provide your email to login.');

    read({ prompt: 'Password: ', silent: true }, function(err, password) {
        if (err) return callback(err);

        setCredentials(email, password, function(err) {
            cli.globals.startSession(function(err, session, user) {
                if (err) return callback(err);

                cli.log.info('now using user: ' + user.email);
                return callback();
            });
        });

    });
}

var setCredentials = function(email, password, callback) {
    cli.store.set('email', email, function(err) {
        if (err) return callback(err);

        cli.store.set('password', password, callback);
    });
};

module.exports.execute = function(callback) {
    var command = cli.nextArgument();

    switch(command) {
        case 'create': {
            create(callback);
            break;
        }

        case 'help': {
            help(callback);
            break;
        }

        case 'login': {
            login(callback);
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