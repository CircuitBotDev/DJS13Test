const BaseEvent = require('easy-slash-commandhandler/classes/base/BaseEvent');
const Client = require('easy-slash-commandhandler/classes/Client');
const { Message } = require('discord.js');

module.exports = class extends BaseEvent {
    constructor() {
        super('messageCreate');
    }

    /**
     * 
     * @param {Client} client 
     * @param {Message} message 
     * @returns 
     */
    async run(client, message, run = true) {
        if (!message) return;
        message.replies = [];
        if (message.partial) await message.fetch();
        if (message.author.bot) return;

        if (message.channel.type === 'dm') return client.emit('directMessage', message);
        if (!message.guild) return;

        if (!message.member) await message.member.fetch();

        await client.TextCommandHandler.run(message);
    }
}