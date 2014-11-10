var async = require('async'),
    // levelup = require('level'),
    path = require('path'),
    store = require('jfs');

var DEFAULT_CONFIG = {
    'host': 'api.nitrogen.io',
    'http_port': 443,
    'protocol': 'https'
};

function Store() {
    var homeDirectory = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
    var localStorePath = path.join(homeDirectory, '.n2');

    // this.db = levelup(localStorePath);
    this.store = new Store(path.join(localStorePath, "settings.json"));
}

Store.prototype.clear = function(callback) {
    var self = this;

    self.store.all(function(err, objs){
        if (err) return callback(err);
        for (var key in objs) {
            self.delete(key, callback);
        }
    });
 
    // this.getKeys(function(err, keys) {
    //     keys.forEach(function(key) {
    //         self.db.del(key);
    //     });

    //     return callback(err);
    // });
};

Store.prototype.get = function(key, callback) {
    var self = this;
    this.store.get(key, function(err, value){
        if (err) {
            if (err.notFound)
              return callback(null, DEFAULT_CONFIG[key]);
            else
              return callback(err);
        }
        return callback(null, value);
    });

    // this.db.get(key, function(err, value) {
    //     if (err) {
    //         if (err.notFound)
    //           return callback(null, DEFAULT_CONFIG[key]);
    //         else
    //           return callback(err);
    //     }

    //     return callback(null, value);
    // });
};

Store.prototype.getAll = function(callback) {
    var config = {};
    var self = this;

    // get all available objects
    this.store.all(function(err, objs){
        if (err) return callback(err);
        for (var key in objs) {
            config[key] = objs[key];
        }
    });
    // this.getKeys(function(err, keys) {
    //     if (err) return callback(err);

    //     async.each(keys, function(key, keyCallback) {
    //         self.get(key, function(err, value) {
    //             config[key] = value;
    //             keyCallback(err);
    //         });
    //     }, function(err) {
    //         return callback(err, config);
    //     });
    // });
};

// Store.prototype.getKeys = function(callback) {
//     var keys = [];
//     var keystream = this.db.createKeyStream();

//     keystream.on('data', function (key) {
//         keys.push(key);
//     });

//     keystream.on('end', function(err) {
//         callback(err, keys);
//     });
// };

Store.prototype.set = function(key, value, callback) {
    var self = this;
    this.store.save(key, value, callback);
    // this.db.put(key, value, callback);
};

Store.prototype.delete = function(key, callback) {
    var self = this;
    this.store.delete(key, callback);
    // this.db.del(key, callback);
};

module.exports = new Store();