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
}

var startSession = function(callback) {
    cli.service.getService(function(err, service) {
        if (err) return callback(err);

        cli.store.get('email', function(err, email) {
            if (err) return callback(err);

            cli.store.get('password', function(err, password) {
                if (err) return callback(err);

                var user = new nitrogen.User({
                    nickname: 'current',
                    email: email,
                    password: password
                });

                service.authenticate(user, callback);
            });
        });
    });
};

module.exports = {
    prettyPrint: prettyPrint,
    startSession: startSession
};