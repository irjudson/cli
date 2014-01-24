var utils = require('./utils');

module.exports.execute = function(commands, options, callback) {
    switch(utils.popCommand(commands)) {
        case "principal": {
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