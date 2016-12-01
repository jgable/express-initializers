import _ from 'lodash';
import path from 'path';
import caller from 'caller';
import Initializer from './lib/initializers';
import ExpressInitializer from './lib/ExpressInitializer';
import bluebird from 'bluebird';

global.Promise = bluebird;

/**
 * @param {Express.Constructor} app
 * @param {Object} - options
 * @returns {Promise}
 */
function expressInitializers(app, options = {}) {
  options = _.defaults(options, {
    // Default to the initializers directory where we were called from
    directory: path.join(path.dirname(caller()), 'initializers')
  });

  const init = new ExpressInitializer(options);

  return init.configureApp(app)
    .then(function() {
      return app;
    })
    .catch(function(error) {
      return Promise.reject(error);
    });
}

expressInitializers.ExpressInitializer = ExpressInitializer;
expressInitializers.Initializer = Initializer;

export default expressInitializers;

