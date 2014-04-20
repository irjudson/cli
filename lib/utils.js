var cli = require('./index');

var displayCommands = function(title, commands) {
    var maxColumnWidth = 0;

    cli.log.help(title);
    cli.log.help('');

    commands.forEach(function(command) {
        maxColumnWidth = Math.max(command[0].length, maxColumnWidth);
    });

    maxColumnWidth += 1;

    var widths = [maxColumnWidth, 80 - maxColumnWidth];

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