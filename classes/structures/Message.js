const {Message} = require('discord.js');

module.exports = class extends Message{
    constructor(...args){
        super(...args);
        this.replies = [];
    }
}