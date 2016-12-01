import path from 'path';
import _ from 'lodash';

class Initializer {
  constructor(fileName) {
    this.fileName = fileName;

    _.merge(this, this.loadFile(fileName));

    if (!this.name) {
      this.name = '';
    }

    if (!this.after) {
      this.after = '';
    }
  }

  loadFile(fileName) {
    return require(fileName);
  }

  /**
   * Resolve the application code configure.
   * Since we are mixing async and sync code,
   * configureApp just make sure that we resolve the async code,
   * while forcing sync code into the chain.
   * BUT, we should really write all application code as async,
   * i.e. async configure(app) {}
   * @param {Express.Constructor} app
   * @returns {Promise<>}
   */
  configureApp(app) {
    const configure = this.configure(app);
    return Promise.resolve(configure);
  }

  configure() {
    const basename = path.basename(this.fileName);
    const errorMessage = `Must provide a configure() in ${ basename }`;
    throw new Error(errorMessage);
  }
}

export default Initializer;

