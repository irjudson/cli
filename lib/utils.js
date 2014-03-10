var cli = require('./index');

var displayCommands = function(commands) {
    var widths = [15, 65];

    commands.forEach(function(command) {
        cli.log.help(prettyPrint(command, widths));
    });
};

var prettyPrint = function(columns, widths) {
    var idx;
    var output = "";
    var columnEnd = 0;

    for (idx=0; idx < columns.length; idx++) {
        output += columns[idx];
        columnEnd += widths[idx];

        while (output.length < columnEnd)
            output += " ";
    }

    return output;
};

module.exports = {
    displayCommands: displayCommands,
    prettyPrint: prettyPrint
};