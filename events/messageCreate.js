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

        Reflect.defineProperty(message, 'replies', { value: [] });

        if (message.partial) await message.fetch();
        if (message.channel.type === 'DM') return client.emit('directMessage', message);
        if (message.webhookId) return client.emit('webhookMessage', message);
        
        if (!message.guild) return;

        if (!message.member) await message.member?.fetch();

        await client.TextCommandHandler.run(message);
    }
}