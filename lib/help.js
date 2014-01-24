module.exports.execute = function(commands, options) {
    var command;
    
    if (commands && commands.length > 0)
        command = commands.splice(0,1)[0].toLowerCase();

    switch(command) {
        case "principal": {
            console.log('help: display principal help.');
            break;
        }

        default: {
            console.log('help: display general');
            break;
        }
    }
};