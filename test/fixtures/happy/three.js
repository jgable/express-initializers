
module.exports = {
    name: 'three',
    after: 'two',

    async configure(app) {
        app.set('three', 3);
    }
};
