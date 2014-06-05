express-initializers
====================

An Express App initializer pattern to tame large apps.

### Example

Usually your `server.js` or `app.js` is cluttered with a bunch of `app.use` and `app.set` middlewares:

```js
var path = require('path'),
    exphbs = require('express3-handlebars'),
    express = require('express'),
    favicon = require('serve-favicon'),
    port = process.env.PORT || 3000,
    app = express();

// Set the port for easy access
app.set('port', port);

// Set up favicon serving
app.use(favicon('favicon.ico'));

// Set up the handlebars view engine
var hbs = exphbs.create({
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    partialsDir: path.join(__dirname, 'views', 'partials'),
    defaultLayout: path.join(__dirname, 'views', 'layouts', 'layout.stache'),
    extname: '.stache',
    // Specify helpers here
    helpers: {
        foo: function () { return 'FOO!'; },
        bar: function () { return 'BAR!'; }
    }
});
app.engine('.stache', hbs.engine);
rname, 'views'));
app.set('view engine', '.stache');

/* etc. */

app.listen(app.get('port'), function () {
    console.log('Now listening on port ' + app.get('port')); 
});
```

This module aims to let you break each individual middleware configuration into their own file for tidier code.  Given an example directory structure like this:

```shell
├── app.js
├── initializers
│   ├── favicon.js
│   ├── port.js
│   ├── routes.js
│   └── views.js
```

Your app setup file would look something like this:

```js
var express  = require('express'),
    initialize = require('express-initializers'),

    app = express();

// Let the initializers run
initialize(app)
    .then(function () {
        // Start listening for requests
        app.listen(app.get('port'), function () {
            console.log('Now listening on port ' + app.get('port'));
        });
    })
    .catch(function (err) {
        console.log('Unable to initialize app: ' + err.message);
        console.log(err.stack);
    });
```

And each middleware configuration is moved into its own file.  From simple examples like `port.js`:

```js
// initializers/port.js
module.exports = {
    configure: function (app) {
        app.set('port', process.env.PORT || 3000);
    }
};
```

To more complex things like view engines or db initialization:

```js
// initializers/views.js
var path = require('path'),
    exphbs = require('express3-handlebars');

module.exports = {
    name: 'views',
    after: 'static',

    configure: function (app) {
        // Set up the handlebars view engine
        var hbs = exphbs.create({
            layoutsDir: path.join(__dirname, 'views', 'layouts'),
            partialsDir: path.join(__dirname, 'views', 'partials'),
            defaultLayout: path.join(__dirname, 'views', 'layouts', 'layout.stache'),
            extname: '.stache',
            // Specify helpers here
            helpers: {
                foo: function () { return 'FOO!'; },
                bar: function () { return 'BAR!'; }
            }
        });
        app.engine('.stache', hbs.engine);

        app.set('views', path.join(__dirname, 'views'));
        app.set('view engine', '.stache');
    }
};
```

```js
// initializers/db.js
var db = require('../models/db'),
    Promise = require('bluebird');

module.exports = {
    configure: function (app) {
        return new Promise(function (resolve, reject) {
            // Start the db connection
            db.init(function (err) {
                if (err) {
                    return reject(new Error('Failed to initialize database: ' + err.message));
                }

                // Sync all the associations
                db.sync(function (err) {
                    if (err) {
                        return reject(new Error('Failed to sync database: ' + err.message));
                    }

                    app.set('db', db.instance);

                    resolve();
                });
            });
        });
    }
};
```

A more thorough implementation can be seen at [node-site](https://github.com/jgable/node-site).

### Configuration

The `initializers` function returned from `require('express-initializers')` can accept options as the second parameter, and an optional callback as the third parameter (if you really hate promises).

```js
initialize(app, {
    // Defaults to the 'initializers' directory relative to the calling file
    directory: path.join(__dirname, 'configurers'),
    // Defaults to '**/*.js'
    fileMatch: '**/*.coffee'
}, function (err) {
    if (err) {
        throw err;
    }

    app.listen(app.get('port'));
});
```

### Initializers

Each individual initializer must be a module that exports an object of the form:

```js
module.exports = {
    name: 'something',
    after: 'otherthing',

    configure: function (app) {
        app.set('something', 42);
    } 
};
```

The `name` property can be unique or shared amongst a group of initializers.

The `after` property allows you to order your initializers, it signals that this initializer should be ran after another or a group of other initializers.

The `configure` method can optionally return a promise for asynchronous configuration.

### LICENSE

MIT License, Copyright 2014 [Jacob Gable](https://jacobgable.com)
