const {EventEmitter} = require('events');

class Middleware {
    constructor() {
        this.middlewares = [];
    }

    use(fn) {
        this.middlewares.push(fn);
    }

    async executeMiddleware(middlewares, data, next) {
        const composition = await middlewares.reduceRight(async (next, fn) => async v => {
            // collect next data
            info = data;
            await fn(info, next)
        }, next);       
        composition(data);
    }

    async run(data) {
        await this.executeMiddleware(this.middlewares, data, (info, next) => {
            //console.log(data);
        });
    }
}
module.exports = Middleware;