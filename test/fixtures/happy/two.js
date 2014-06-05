
var Promise = require('bluebird');

module.exports = {
    name: 'two',
    after: 'one',

    configure: function (app) {
        return new Promise(function (resolve) {
            app.set('two', 2);

            resolve();
        });
    }
};