
module.exports = {
    name: 'four',
    after: 'three',

    configure: function (app) {
        app.set('four', 4);
    }
};