const { BaseCommand } = require('../../..');
const { MessageEmbed } = require('discord.js');

module.exports = class Ping extends BaseCommand {
    constructor() {
        super({
            config: {
                name: "ping",
                aliases: ['latency'],
                description: "Displays the ping.",
                usage: "",
                nsfw: false,
                cooldown: 10,
                args: false,
                accessibility: 0,
                deleteAuthorMessage: false,
                protected: false
            },
            permissions: {
                userPerms: [],
                clientPerms: ['SEND_MESSAGES', 'EMBED_LINKS'],
                serverOwnerOnly: false,
                botOwnerOnly: false
            }
        });
    }

    async run(ctx) {
        let time = Date.now();
        let apiLatency = ctx.client.ws.ping;

        let m = await ctx.send({
            content: "Pong!",
        });

        let msgLatency = Date.now() - time;

        if (ctx.flags.includes("noembed")) {
            return m.edit(`Roundtrip Latency: ${msgLatency} ms\nApi Latency: ${apiLatency} ms`);
        }

        let embed = new MessageEmbed()
            .setColor('BLUE')
            .setTimestamp()
            .setAuthor('Ping', ctx.client.user.avatarURL())
            .addField(`Roundtrip`, `${msgLatency} ms`)
            .addField(`Websocket`, `${apiLatency} ms`);

        return m.edit(
            {
                embeds: [embed]
            }
        );
    }
}
