var nitrogen = require('nitrogen')
  , cli = require('../lib');

var add = function(callback) {
    cli.globals.startSession(function(err, session, user) {
        if (err) return callback(err);

        var permission = new nitrogen.Permission();

        if (cli.flags.action) 
            permission.action = cli.flags.action;

        if (cli.flags.priority)
            permission.priority = cli.flags.priority;
        else
            permission.priority = nitrogen.Permission.NORMAL_PRIORITY;

        if (cli.flags.authorized)
            permission.authorized = cli.flags.authorized === 'true';
        else
            permission.authorized = true;

        cli.principal.resolvePrincipalId(cli.flags.issuedTo, function(err, issuedTo) {
            if (err) return callback(err);

            permission.issued_to = issuedTo;

            cli.principal.resolvePrincipalId(cli.flags.principalFor, function(err, principalFor) {
                if (err) return callback(err);

                permission.principal_for = principalFor;

                permission.create(session, callback);
            });
        });
    });
};

var help = function(callback) {                
    cli.log.help('add [--action] [--issuedTo] [--principalFor] [--priority] [--authorized]: Adds a permission.');
    cli.log.help('    --action: action this permission authorizes (default: all)');
    cli.log.help('    --issuedTo: principal this permission is issued to (default: all)');
    cli.log.help('    --principalFor: principal this permission is for (default: all)');
    cli.log.help('    --priority: priority of this permission in the permission list (default: NORMAL_PRIORITY)');
    cli.log.help('    --authorized: boolean flag that indicates if this permission authorizes or forbids (default: true)');

    return callback();
};

module.exports.execute = function(callback) {
    var command = cli.nextArgument();
    switch(command) {
        case 'add': {
            add(callback);
            break;
        }

        case 'help': {
            help(callback);
            break;
        }

        default: {
            cli.log.error('unknown permission command: ' + command);
            help(callback);
            break;
        }
    }
};