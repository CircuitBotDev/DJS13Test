const BaseEvent = require('../classes/base/BaseEvent');
const Client = require('../classes/Client');
const { Message } = require('discord.js');

module.exports = class extends BaseEvent {
    constructor() {
        super('message');
    }

    /**
     * 
     * @param {Client} client 
     * @param {Message} message 
     * @returns 
     */
    async run(client, message, run = true) {
        if (message.partial) await message.fetch();
        if (message.author.bot) return;

        if (message.channel.type === 'dm') return client.emit('directMessage', message);
        if (!message.guild) return;

        if (!message.member) await message.member.fetch();

        if (run) await client.CommandHandler.run(message);
    }
}