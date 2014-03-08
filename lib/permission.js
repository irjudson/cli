var nitrogen = require('nitrogen')
  , cli = require('../lib');

var add = function(callback) {
    cli.globals.startSession(function(err, session, user) {
        if (err) return callback(err);

        var permission = new nitrogen.Permission();

        if (cli.flags.action) 
            permission.action = cli.flags.action;

        if (cli.flags.issuedTo)
            permission.issued_to = cli.flags.issuedTo;

        if (cli.flags.principalFor)
            permission.principal_for = cli.flags.principalFor;

        if (cli.flags.priority)
            permission.priority = cli.flags.priority;
        else
            permission.priority = nitrogen.Permission.NORMAL_PRIORITY;

        if (cli.flags.authorized)
            permission.authorized = cli.flags.authorized === 'true';
        else
            permission.authorized = true;

        console.dir(permission);

        permission.create(session, callback);
    });
};

module.exports.execute = function(callback) {
    var command = cli.nextArgument();
    switch(command) {
        case 'add': {
            add(callback);
            break;
        }

//        case 'ls': {
//            ls(callback);
//            break;
//        }

        default: {
            console.log('unknown app command: ' + command);
            break;
        }
    }
};