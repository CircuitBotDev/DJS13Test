const { BaseCommand } = require('../../..');
const { MessageEmbed } = require('discord.js');

module.exports = class Ping extends BaseCommand {
    constructor() {
        super({
            config: {
                name: "sudo",
                aliases: [],
                description: "Sudos a user. Sends a fake message using a user's avatar and name.",
                usage: "<user> <text>",
                nsfw: false,
                cooldown: 15,
                args: true,
                deleteAuthorMessage: false,
                protected: false,
                commandType: 0,
                commandOptions: [
                    {
                        type: 'USER',
                        name: 'user',
                        required: true,
                        description: 'The user to sudo.'
                    }, {
                        type: 'STRING',
                        name: 'text',
                        required: true,
                        description: 'The text to send.'
                    }
                ]
            },
            permissions: {
                userPerms: ['MANAGE_GUILD'],
                clientPerms: [
                    'SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_WEBHOOKS'
                ],
                serverOwnerOnly: false,
                botOwnerOnly: false
            }
        });
    }

    async run(ctx) {
        let member = ctx.isCommand ? await ctx.source.guild.members.fetch(ctx.source.options.get('user')?.value) : await ctx.client.resolve.member(ctx.args.shift(), ctx.source.guild);
        let text = ctx.isCommand ? ctx.source.options.get('text')?.value : ctx.args.join(' ');

        if (!member) {
            let embed = new MessageEmbed()
                .setDescription('Please specify a valid member to sudo.')
                .setColor('RED');

            return await ctx.reply(
                {
                    embed,
                    embeds: [embed],
                    ephemeral: true,
                    allowedMentions: {
                        repliedUser: false
                    }
                }
            );
        }

        if (!text) {
            let embed = new MessageEmbed()
                .setDescription('Please specify the text to send.')
                .setColor('RED');

            return await ctx.reply(
                {
                    embed,
                    embeds: [embed],
                    ephemeral: true
                }
            );
        }

        let webhook = await ctx.source.channel.fetchWebhooks().then((webhooks) => webhooks.find((webhook) => webhook.owner.id === ctx.client.user.id));
        if (!webhook) webhook = await ctx.source.channel.createWebhook(ctx.client.user.username, {
            avatar: ctx.client.user.avatarURL()
        });

        return await webhook.send({
            content: text,
            username: member.nickname ?? member.user.username,
            avatarURL: member.user.avatarURL({ dynamic: true }),
            allowedMentions: {
                parse: []
            }
        }).then(async (data) => {
            if (ctx.isCommand) await ctx.reply({
                content: "Message Sent!",
                ephemeral: true
            });
            return data
        });
    }
}
