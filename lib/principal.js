var async = require('async')
  , nitrogen = require('nitrogen')
  , read = require('read')
  , cli = require('../lib');

var claim = function(callback) {
    var code = cli.nextArgument();
    if (!code) return callback('Please provide a claim code.');

    sendClaim(code, callback);
};

var sendClaim = function(code, callback) {
    console.log('sending claim message');

    cli.globals.startSession(function(err, session, user) {
        if (err) return callback(err);

        new nitrogen.Message({
            to: 'service',
            type: 'claim',
            body: {
                claim_code: code.toUpperCase()
            }
        }).send(session, callback);
    });
};

var enterEmail = function(callback) {
    read({ prompt: 'Email: ', silent: true }, function(err, email) {
        if (err) return callback(err);
        if (email.length === 0) return callback('Please enter an email.');

        return callback(null, email);
    });
};

var choosePassword = function(callback) {
    read({ prompt: 'Choose a password: ', silent: true }, function(err, password) {
        if (err) return callback(err);
        if (password.length < 8) return callback('Please enter a password of at least 8 characters.');

        read({ prompt: 'Repeat password: ', silent: true }, function(err, repeatPassword) {
            if (err) return callback(err);
            if (password !== repeatPassword) return callback('Passwords do not match');

            return callback(null, password);
        });
    });
};

var enterName = function(callback) {
    read({ prompt: 'Name: ' }, function(err, name) {
        if (err) return callback(err);
        if (name.length === 0) return callback('Please enter your name.');

        return callback(null, name);
    });
};

var create = function(callback) {
    var type = cli.flags.type || 'user';

    var flow = [];

    flow.push(cli.flags.name ? cli.globals.passthrough(cli.flags.email) : enterName)

    if (type === 'user') {
        flow.push(cli.flags.email ? cli.globals.passthrough(cli.flags.email) : enterEmail);
        flow.push(cli.flags.password ? cli.globals.passthrough(cli.flags.password) : choosePassword);
    }

    async.series(flow, function(err, params) {
        if (err) return callback(err);

        var email, password;
        var name = params[0];

        if (type === 'user') {
            email = params[1];
            password = params[2];
        }

        var principal = new nitrogen.Principal({
            type: type,
            email: email,
            name: name,
            password: password,
        });

        cli.service.getService(function(err, service) {
            if (err) return callback(err);

            service.create(principal, function(err, session, createdPrincipal) {
                if (err) return callback(err);

                if (type !== 'user') {
                    if (cli.flags.claim)
                        return sendClaim(createdPrincipal.claim_code, callback);
                    else
                        return callback();
                }

                cli.store.get('email', function(err, email) {
                    if (err) return callback(err);
                    if (email) return callback();

                    // only set credentials if there are no current credentials.
                    setCredentials(email, password, callback);
                });
            });
        });
    });
};

var help = function(callback) {                
    cli.log.help('claim <code>: Claim an unclaimed principal with the given code.');
    cli.log.help('create: Create principal. Options:');
    cli.log.help('    --email: email for user principal');
    cli.log.help('    --name: name of principal');
    cli.log.help('    --password: password for user principal');
    cli.log.help('    --type: type of principal (default: user)');
    cli.log.help('login <email>: Login with the user principal with this email for service interactions.');
    cli.log.help('ls: List principals. Options:');
    cli.log.help('    --filter: quoted JSON filter for returned principals.');
    cli.log.help('    --limit: number of principals to return.');
    cli.log.help('    --skip: number of principals to skip before return results.');
    cli.log.help('    --sort: field to sort results on.');

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
        case 'claim': {
            claim(callback);
            break;
        }

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