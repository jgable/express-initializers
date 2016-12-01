
var path = require('path'),
    /*jshint -W079 */
    should = require('should'),
    sinon = require('sinon'),
    bluebird = require('bluebird');

/*jshint -W079 */
global.Promise = bluebird;

var ExpressInitializer = require('../src/lib/ExpressInitializer').default;

describe('ExpressInitializer', function () {
    var fixturePath = path.join(__dirname, 'fixtures'),
        app,
        sandbox;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();

        app = {
            set: sandbox.spy(function (name, val) {
                app[name] = val;
            }),
            get: sandbox.spy(function (name) {
                return app[name];
            })
        };
    });
    afterEach(function () {
        sandbox.restore();
    });

    it('can get initializers', function (done) {
        var init = new ExpressInitializer({
            directory: path.join(fixturePath, 'happy')
        });

        init.getInitializers()
            .then(function (initializers) {
                initializers.length.should.equal(5);

                done();
            })
            .catch(function (err) {
                done(err);
            });
    });

    it('can sort initializers', function (done) {
        var init = new ExpressInitializer({
            directory: path.join(fixturePath, 'happy')
        });

        init.getInitializers()
            .then(function (initializers) {
                return init.sortInitializers(initializers);
            })
            .then(function (sorted) {
                sorted[0][0].name.should.equal('one');
                sorted[1][0].name.should.equal('two');
                sorted[2][0].name.should.equal('three');
                sorted[3][0].name.should.equal('four');
                done();
            })
            .catch(function (err) {
                done(err);
            });
    });

    it('can run initializers', function (done) {
        var init = new ExpressInitializer({
            directory: path.join(fixturePath, 'happy')
        });

        init.getInitializers()
            .then(function (initializers) {
                return init.sortInitializers(initializers);
            })
            .then(function (sorted) {
                return init.runInitializers(sorted, app);
            })
            .then(function () {
                app.get('unnamed').should.equal(0);
                app.get('one').should.equal(1);
                app.get('two').should.equal(2);
                app.get('three').should.equal(3);
                app.get('four').should.equal(4);

                should.not.exist(app.get('five'));

                done();
            })
            .catch(function (err) {
                done(err);
            });
    });

    it('can configure an app', function (done) {
        var init = new ExpressInitializer({
            directory: path.join(fixturePath, 'happy')
        });

        init.configureApp(app)
            .then(function () {
                app.get('one').should.equal(1);
                app.get('two').should.equal(2);
                app.get('three').should.equal(3);
                app.get('four').should.equal(4);

                should.not.exist(app.get('five'));

                done();
            })
            .catch(function (err) {
                done(err);
            });
    });
});
