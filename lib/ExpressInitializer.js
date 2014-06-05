
var path = require('path'),
    _ = require('lodash'),
    glob = require('glob'),
    /*jshint -W079 */
    Promise = require('bluebird'),
    Initializer = require('./Initializer');

function ExpressInitializer(opts) {
    this.options = _.defaults(opts, ExpressInitializer.Defaults);
}

_.extend(ExpressInitializer.prototype, {
    Initializer: Initializer,

    getInitializers: function () {
        var self = this;

        return new Promise(function (resolve, reject) {
            glob(path.join(self.options.directory, self.options.fileMatch), function (err, files) {
                if (err) {
                    return reject(new Error('Failed to load express-initializers files: ' + err.message));
                }

                var initializers = _.map(files, function (file) {
                    return new self.Initializer(file);
                });

                resolve(initializers);
            });
        });
    },

    sortInitializers: function (initializers) {
        // Break things down into groups by name and after
        var groups = _.reduce(initializers, function (memo, initializer) {
            memo.name[initializer.name] = memo.name[initializer.name] || [];
            memo.name[initializer.name].push(initializer);

            memo.after[initializer.after] = memo.after[initializer.after] || [];
            memo.after[initializer.after].push(initializer);

            return memo;
        }, {
            name: {},
            after: {}
        });

        var todo = [],
            added = { },
            checkGroup = function (initializers, afterName) {
                // If no initializers, skip
                if (_.isUndefined(initializers)) {
                    return;
                }

                // If the after name does exist and we haven't added it yet, skip
                if (groups.name[afterName] && !added[afterName]) {
                    return;
                }

                // Add to be done
                todo.push(initializers);
                _.each(initializers, function (i) {
                    added[i.name] = true;
                });
                groups.after[afterName] = undefined;
            };

        // If no after is specified, run it first
        if (groups.after['']) {
            todo.push(groups.after['']);
            
            _.each(groups.after[''], function (i) {
                added[i.name] = true;
            });

            groups.after[''] = undefined;
        }

        var warn = 0;
        // Loop through and add any after groups whose dependencies have loaded
        while (_.flatten(todo).length !== initializers.length) {
            var beforeLength = todo.length;

            _.each(groups.after, checkGroup);

            // Check for an infinite loop situation
            if (beforeLength === todo.length) {
                if (warn === 0) {
                    console.warn('No initializers were added');
                }
                
                warn += 1;
            }

            if (warn === 3) {
                throw new Error('Initializers failed to complete; infinite loop detected');
            }
        }

        return todo;
    },

    runInitializers: function (initializerGroups, app) {
        return Promise.reduce(initializerGroups, function (memo, initializers) {
            var configures = _.invoke(initializers, 'configureApp', app);

            return Promise.all(configures).then(function () {
                // We don't really reduce anything, just want to do them in series
                return memo;
            });
        }, {});
    },

    configureApp: function (app) {
        var self = this;

        return this.getInitializers()
            .then(function (initializers) {
                return self.sortInitializers(initializers);
            })
            .then(function (initializerGroups) {
                return self.runInitializers(initializerGroups, app);
            });
    }
});

ExpressInitializer.Defaults = {
    directory: 'initializers',
    fileMatch: '**/*.js'
};

module.exports = ExpressInitializer;
