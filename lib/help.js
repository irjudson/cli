var cli = require('../lib');

module.exports.execute = function(callback) {
    switch(cli.nextArgument()) {
        case 'principal': {
            console.log('help: display principal help.');
            return callback();
            break;
        }

        default: {
            console.log('help: display general');
            return callback();
            break;
        }
    }
};