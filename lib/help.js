var cli = require('../lib');

module.exports.execute = function(callback) {
    switch(cli.nextArgument()) {
        case 'principal': {
            cli.log.help('display principal help.');
            return callback();
            break;
        }
    }
};