
module.exports = {
    name: 'three',
    after: 'two',

    configure: function (app) {
        app.set('three', 3);
    }
};