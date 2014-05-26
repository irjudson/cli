var async = require('async')
  , nitrogen = require('nitrogen')
  , read = require('read')
  , cli = require('../lib');

var claim = function(callback) {
    var code = cli.nextArgument();
    if (!code) return callback('Please provide a claim code.');

    sendClaim(code, function(err) {
        return list(null, callback);
    });
};

var sendClaim = function(code, callback) {
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
    read({ prompt: 'Email: ' }, function(err, email) {
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

    flow.push(cli.flags.name ? cli.globals.passthrough(cli.flags.name) : enterName)

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
            email: email,
            type: type,
            name: name,
            nickname: name,
            password: password,
        });

        if (cli.flags.tags) {
            principal.tags = cli.flags.tags.split(',');
        }

        if (cli.flags.api_key) {
            principal.api_key = cli.flags.api_key;
        }

        cli.service.getService(function(err, service) {
            if (err) return callback(err);

            service.create(principal, function(err, session, createdPrincipal) {
                if (err) return callback(err);

                if (type !== 'user') {

                    cli.log.info("");
                    cli.log.info("PUBLIC KEY: " + createdPrincipal.public_key);
                    cli.log.info("");
                    cli.log.info("PRIVATE KEY: " + createdPrincipal.private_key);
                    cli.log.info("");
                    cli.log.info("Please immediately copy the private key and store in a safe location. If lost, this principal will be unrecoverable.");

                    if (cli.flags.claim)
                        return sendClaim(createdPrincipal.claim_code, callback);
                    else
                        return callback();
                }

                list(type, function(err) {
                    if (err) return callback(err);

                    cli.store.get('email', function(err, email) {
                        if (err) return callback(err);
                        setCredentials(email, password, callback);
                    });
                });
            });
        });
    });
};

var help = function(callback) {
    cli.utils.displayCommands('Principal Commands', [
        ['claim <code>',  'Claim an unclaimed principal with the given code.'],
        ['create',        'Create principal.'],
        ['',              '  --tags: comma delimited tags for this principal.'],
        ['',              '  --email: email for user principal'],
        ['',              '  --name: name of principal'],
        ['',              '  --password: password for user principal'],
        ['',              '  --type: type of principal (default: user)'],
        ['login <email>', 'Login with the user principal with this email for service interactions.'],
        ['ls',            'List principals.'],
        ['',              '  --filter: quoted JSON filter for returned principals.'],
        ['',              '  --limit: number of principals to return.'],
        ['',              '  --skip: number of principals to skip before return results.'],
        ['',              '  --sort: field to sort results on.']
    ]);

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
            if (err) return callback(err);

            cli.globals.startSession(function(err, session, user) {
                if (err) return callback(err);

                cli.log.info('now using user: ' + user.email);
                return callback();
            });
        });
    });
};

var objectIdRegExp = new RegExp("^[0-9a-fA-F]{24}$");

module.exports.resolvePrincipalId = function(principalString, callback) {
    if (!principalString) return callback();

    // if it is an ObjectId, just return it.
    if (objectIdRegExp.test(principalString))
        return callback(null, principalString);

    // otherwise, look for a principal with that name.
    cli.globals.startSession(function(err, session, user) {
        if (err) return callback(err);

        nitrogen.Principal.find(session, { name: principalString }, {}, function(err, principals) {
            if (err) return callback(err);
            if (principals.length > 1) return callback('There are multiple principals with the name "' + principalString + '"');
            if (principals.length === 0) return callback('No principal found with the name "' + principalString + '"');

            return callback(null, principals[0].id.toString());
        });
    });
};

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