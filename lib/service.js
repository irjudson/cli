var async = require('async')
  , utils = require('./utils')
  , cli = require('./index');

var configureService = function(options, callback) {
    var keys = Object.keys(options);
    console.log('keys: ' + keys);

    async.each(keys, function(key, keyCallback) {
        key = key.toLowerCase();
        console.log('setting key: ' + key + ' with options: ' + options);
        switch(key) {
            case 'host':
            case 'http_port':
            case 'protocol': {
                cli.config.store.set(key, options[key], keyCallback);
                break;
            }

            // ignore other options silently
            default: {
                return keyCallback();
                break;
            }
        }

    }, callback);
};

var listServiceConfig = function(callback) {
    var configuration = {};

    async.each(cli.CONFIG_KEYS, function(configKey, keyCallback) {
        cli.config.store.get(configKey, function(err, value) {
            configuration[configKey] = value;
            return keyCallback();
        });
    }, function(err) {
        for (var configKey in configuration) {
            console.log(configKey + ': ' + configuration[configKey]);
        }

        return callback();
    });
};

module.exports.execute = function(commands, options, callback) {
    var command = utils.popCommand(commands) || 'ls';

    switch(command) {
        case 'config': {
            configureService(options, function() {
                listServiceConfig(callback);
            });
            break;
        }

        case 'ls': {
            listServiceConfig(callback);
            break;
        }

        default: {
            console.log('unknown service command: ' + command);
            break;
        }
    }
};
