var help = require('./help');

module.exports.execute = function(commands, options) {
    var command;
    if (commands && commands.length > 0)
        command = commands.splice(0,1);

    switch(command) {
        default: {
            help.execute(commands, options);            
        }
    }
};