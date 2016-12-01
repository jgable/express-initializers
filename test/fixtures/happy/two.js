
var Promise = require('bluebird');

module.exports = {
    name: 'two',
    after: 'one',

    async configure(app) {
      app.set('two', 2);
    }
    /*configure: function (app) {
        return new Promise(function (resolve) {
            app.set('two', 2);

            resolve();
        });
    }*/
};
