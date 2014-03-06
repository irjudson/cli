var cli = require('../lib')
  , nitrogen = require('nitrogen');

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

module.exports = {
    startSession: startSession
};