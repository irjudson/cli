module.exports.popCommand = function(commands) {
    var command;
    
    if (commands && commands.length > 0)
        command = commands.splice(0,1)[0].toLowerCase();

    return command;
};