import path from 'path';
import _ from 'lodash';
import glob from 'glob';
import Initializer from './Initializer';

/**
 * Initialize files in directory
 */
class ExpressInitializer {
  /**
   * @param {Object} options
   */
  constructor(options) {
    this.options = _.defaults(
      options,
      ExpressInitializer.Defaults
    );
  }

  /**
   * For each file matching the glob pattern
   * we initialize a new file.
   * @returns {Promise<Array>} - Returns a array of @see {@link Initializer}.
   */
  getInitializers() {
    const pattern = path.join(
      this.options.directory,
      this.options.fileMatch
    );

    return new Promise(function(resolve, reject) {
      glob(pattern, function(error, files) {
        if (error) {
          const errorMessage = `Failed to load express-initializers files: ${ error.message }`;
          return reject(new Error(errorMessage));
        }

        const initializers = _.map(files, function(file) {
          return new Initializer(file);
        });

        resolve(initializers);
      });
    });
  }

  /**
   * Sort all initializers according to priority.
   * @param {Array<Initializer>} initializers
   * @return {Array}
   */
  sortInitializers(initializers) {
    // Break things down into groups by name and after
    const groups = _.reduce(initializers, function(memo, initializer) {
      memo.name[initializer.name] = memo.name[initializer.name] || [];
      memo.name[initializer.name].push(initializer);

      memo.after[initializer.after] = memo.after[initializer.after] || [];
      memo.after[initializer.after].push(initializer);

      return memo;
    }, {
      name: {},
      after: {}
    });

    const todo = [];
    const added = {};

    const checkGroup = function(initializers, afterName) {
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
  }

  /**
   * We resolve all initializerGroups,
   * since we dont care about the return value we just drop it.
   * I.e. if you resolve values in configure stage we wont return that anywhere.
   * @param {Array<Object>} initializerGroups
   * @param {Express.Constructor} app
   * @returns {Promise<Array>}
   */
  runInitializers(initializerGroups, app) {
    return Promise.reduce(initializerGroups, function(memo, initializers) {
      const configures = _.invokeMap(initializers, 'configureApp', app);

      return Promise.all(configures).then(function() {
        // We don't really reduce anything, just want to do them in series
        return memo;
      });
    }, Object.create(null));
  }

  /**
   * Sort initializers in priority groups @see {@link sortInitializers},
   * then run the initializers.
   * @see https://medium.com/@fagnerbrack/promises-sync-code-disaster-e9d41a3c7279
   * @param {Object}
   * @returns {Promise}
   */
  configureApp(app) {
    return this.getInitializers()
      .then(function(initializers) {
        const initializerGroups = this.sortInitializers(initializers);
        return this.runInitializers(initializerGroups, app);
      }.bind(this));
  }
}

/**
 * @constant
 */
ExpressInitializer.Defaults = {
  directory: 'initializers',
  fileMatch: '**/*.js'
};

export default ExpressInitializer;

