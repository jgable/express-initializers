
module.exports = {
    name: 'one',

    async configure(app) {
        app.set('one', 1);
    }
};
