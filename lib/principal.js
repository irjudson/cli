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

function list(callback) {

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