
module.exports = {
    name: 'four',
    after: 'three',

    async configure(app) {
        app.set('four', 4);
    }
};
