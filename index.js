var _ = require('lodash'),
    path = require('path'),
    caller = require('caller'),
    Initializer = require('./lib/Initializer'),
    ExpressInitializer = require('./lib/ExpressInitializer'),
    /*jshint -W079 */
    Promise = require('bluebird');

function expressInitializers(app, opts, done) {
    opts = _.defaults(opts || {}, {
        // Default to the initializers directory where we were called from
        directory: path.join(path.dirname(caller()), 'initializers')
    });

    var init = new ExpressInitializer(opts);

    return init.configureApp(app)
        .then(function () {
            if (_.isFunction(done)) {
                done(null, app);
            }

            return app;
        })
        .catch(function (err) {
            if (_.isFunction(done)) {
                done(err);
            }

            return Promise.reject(err);
        });
}

expressInitializers.ExpressInitializer = ExpressInitializer;
expressInitializers.Initializer = Initializer;

module.exports = expressInitializers;