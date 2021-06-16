const Middleware = require('./base/Middleware');
const DefaultHandler = require('./DefaultHandler');

class CommandHandler extends Middleware {
    constructor(client) {
        super();
        this.client = client;
    }

    async executeMiddleware(middlewares, data, next) {
        const composition = await middlewares.reduce((next, fn) => async v => {
            // collect next data
            let info = data;
            await fn(this.client, info, next)
        }, next);
        composition(data);
    }
}

module.exports = CommandHandler;