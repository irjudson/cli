var async = require('async'),
    path = require('path'),
    jfs = require('jfs');

var DEFAULT_CONFIG = {
    'host': 'api.nitrogen.io',
    'http_port': 443,
    'protocol': 'https'
};

function Store() {
    var homeDirectory = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
    var localStoreFile = path.join(homeDirectory, '.n2', 'settings');
    this.db = new jfs(localStoreFile, { type:'single', pretty:true });
}

Store.prototype.clear = function(callback) {
    var self = this;

    self.db.all(function(err, objs){
        if (err) return callback(err);
        for (var key in objs) {
            self.db.delete(key, callback);
        }
        return callback(err);
    });
};

Store.prototype.get = function(key, callback) {
    this.db.get(key, function(err, value){
        if (err) {
            if (err == "Error: could not load data") {
                return callback(null, DEFAULT_CONFIG[key]);
            } else {
                return callback(err);
            }
        }
        return callback(null, value);
    });
};

Store.prototype.getAll = function(callback) {
    var config = {};
    var self = this;

    self.db.all(function(err, objs){
        if (err) return callback(err);
        for (var key in objs) {
            config[key] = objs[key];
        }
        return callback(err, config);
    });
};

Store.prototype.set = function(key, value, callback) {
    this.db.save(key, value, callback);
};

Store.prototype.delete = function(key, callback) {
    this.db.delete(key, callback);
};

module.exports = new Store();