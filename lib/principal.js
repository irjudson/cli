var nitrogen = require('nitrogen')
  , read = require('read')
  , cliService = require('./service')
  , store = require('./store')
  , utils = require('./utils');

function executeLogin(commands, options, callback) {
    if (commands.length < 1) return callback('Please provide your email to login.');

    var email = utils.popCommand(commands);
    console.log('email: ' + email);

    read({ prompt: 'Password: ', silent: true }, function(err, password) {
        var user = new nitrogen.User({
            nickname: 'current',
            email: email,
            password: password
        });

        cliService.getService(function(err, service) {
            if (err) return callback(err);

            service.authenticate(user, function(err, session, user) {
                if (err) return callback(err);

                store.set('email', email);
                store.set('password', password);

                return callback();
            });

        });
    });
}

module.exports.execute = function(commands, options, callback) {
    var command = utils.popCommand(commands);

    switch(command) {
        case 'login': {
            executeLogin(commands, options, callback);
            break;
        }

        default: {
            console.log('unknown principal command: ' + command);
            break;
        }
    }
};