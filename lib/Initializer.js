
var path = require('path'),
    _ = require('lodash'),
    /*jshint -W079 */
    Promise = require('bluebird');

function Initializer(fileName) {
    this.fileName = fileName;

    _.merge(this, this.loadFile(fileName));

    if (!this.name) {
        this.name = '';
    }

    if (!this.after) {
        this.after = '';
    }
}

_.extend(Initializer.prototype, {
    loadFile: function (fileName) {
        return require(fileName);
    },

    configureApp: function (app) {
        return Promise.resolve(this.configure(app));
    },

    configure: function () {
        throw new Error('Must provide a configure() in ' + path.basename(this.fileName));
    }
});

module.exports = Initializer;
