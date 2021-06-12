const Logger = require('./Logger');
const Merge = require('./Merge');
const General = require('./General');
const Wait = require('util').promisify(setTimeout);

module.exports = class {
    constructor(client){
        this.client = client
    }

    static logger = Logger;
    
    static merge = Merge;

    static wait = Wait;

    static general = General;
}