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

                startSession(function(err, session, user) {
                    if (err) return callback(err);

                    console.log('now using user: ' + user.email);
                    return callback();
                });
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

var list = function(type, callback) {
    startSession(function(err, session, user) {
        if (err) return callback(err);

        var queryJson = cli.nextArgument();

        if (query) {
            var query = JSON.parse(queryJson);
        } else {
            query = {};
        }

        if (type) {
            query.type = type;
        }

        nitrogen.Principal.find(session, query, {}, function(err, principals) {
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
    var command = cli.nextArgument();
    switch(command) {
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
            console.log('unknown principal command: ' + command);
            break;
        }
    }
};