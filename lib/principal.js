var nitrogen = require('nitrogen')
  , read = require('read')
  , cli = require('../lib');

var startSession = function(callback) {
    cli.service.getService(function(err, service) {
        if (err) return callback(err);

        cli.store.get('email', function(err, email) {
            if (err) return callback(err);

            cli.store.get('password', function(err, password) {
                if (err) return callback(err);

                var user = new nitrogen.User({
                    nickname: 'current',
                    email: email,
                    password: password
                });

                service.authenticate(user, callback);
            });
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

                startSession(callback);
            });
        });
    });
}

function prettyPrint(columns, widths) {
    var idx;
    var output = "";
    var columnEnd = 0;

    for (idx=0; idx < columns.length; idx++) {
        output += columns[idx];
        columnEnd += widths[idx];

        while (output.length < columnEnd)
            output += " ";
    }

    return output;
}

function list(callback) {
    startSession(function(err, session, user) {
        if (err) return callback(err);

        nitrogen.Principal.find(session, {}, {}, function(err, principals) {
            if (err) return callback(err);

            var widths = [26, 8, 25, 17];
            var columns = ['ID','TYPE', 'NAME', 'LAST IP', 'LAST CONNECTION'];

            console.log(prettyPrint(columns, widths));

            principals.forEach(function(principal) {
                var columns = [
                    principal.id,
                    principal.type,
                    principal.name,
                    principal.last_ip,
                    principal.last_connection
                ];

                console.log(prettyPrint(columns, widths));
            });

            return callback();
        });
    });
};

module.exports.execute = function(callback) {
    switch(cli.nextArgument()) {
        case 'use': {
            use(callback);
            break;
        }

        case 'ls' : {
            list(callback);
            break;
        }

        default: {
            console.log('unknown principal command: ' + command);
            break;
        }
    }
};