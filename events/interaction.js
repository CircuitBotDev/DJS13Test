const BaseEvent = require('../classes/base/BaseEvent.js');
const Client = require('../classes/Client');
const {CommandInteraction, MessageEmbed, Collection} = require('discord.js');
const EasyEmbedPages = require('../functions/EasyEmbedPages');
const DeletableMessage = require('../functions/DeletableMessage');
const ms = require('pretty-ms');

const cooldowns = new Collection();

module.exports = class Event extends BaseEvent {
    constructor(){
        super('interaction');
    }

    getErrorEmbed(msg, large = false){
        let embed = new MessageEmbed()
        .setColor('RED')
        .setDescription((!large ? ':x:  ' : '') + (msg ?? "Error"))

        if(large) embed.setAuthor('Error', 'https://i.imgur.com/M6CN1Ft.png')

        return embed;
    }

    /**
     * 
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     * @returns 
     */
    async run(client, interaction){
        if (!interaction.isCommand()) return;
        if(!interaction.guild) return;

        const command = client.commands.get(interaction.commandName)
        if(!command) return;

        async function _reply(content){
            const func = (interaction.replied ? interaction.followUp.bind(interaction) : interaction.reply.bind(interaction));
            await func(content);
            return !content.ephemeral ? await interaction.fetchReply() : null;
        }

        async function send(content) {
            let msg = await content.ephemeral || content.delete == false ? _reply.bind(this)(content) : new DeletableMessage({send: _reply}, content).start(interaction.member ?? null);
            return msg;
        }
        
        async function paginate(options, fn){
            const paginator = new EasyEmbedPages({send}, options, fn);
            await paginator.start({user: interaction.user});
            return paginator;
        }

        const ctx = {
            source: interaction,
            flags: [],
            args: interaction.options.map(o => o.value),
            isCommand: true,
            client,
            send,
            reply: send.bind(interaction),
            paginate
        }

        /**
         * Todo: Interaction checks
         */

        if(command.permissions.botOwnerOnly && !client.owners.includes(ctx.source.user.id)) {
            let embed = await this.getErrorEmbed('This is a owner only command!');
            return ctx.send({
                embeds: [embed],
                ephemeral: true,
            });
        }

        if(command.permissions.serverOwnerOnly && ctx.source.member.id !== ctx.source.guild.ownerID) {
            let embed = await this.getErrorEmbed('This is a server owner only command!');
            return ctx.send({
                embeds: [embed],
                ephemeral: true,
            });
        }

        if (command.permissions.clientPerms) {
            if (!ctx.source.guild.me.permissions.has(command.permissions.clientPerms) || !ctx.source.channel.permissionsFor(ctx.source.guild.me).has(command.permissions.clientPerms)) {
                let embed = await this.getErrorEmbed(
                    `Sorry, but i need the following permisions to perform this command -\n${command.permissions.clientPerms.map(p => `> \`- ${p}\``).join('\n')}`, true
                );
                return ctx.send({
                    embeds: [embed],
                    ephemeral: true,
                }).catch(() => ctx.source.user.send(embed));
            }
        }

        if (command.permissions.userPerms) {
            if (!ctx.source.member.permissions.has(command.permissions.userPerms) || !ctx.source.channel.permissionsFor(ctx.source.user).has(command.permissions.userPerms)) {
                let embed = await this.getErrorEmbed(
                    `Sorry, but you don't have enough permissions to execute this command. You need the following permissions -\n${command.permissions.userPerms.map(p => `> \`- ${p}\``).join('\n')}`,
                    true                   
                );
                return ctx.send({
                    embeds: [embed],
                    ephemeral: true,
                }).catch(() => ctx.source.user.send(embed));
            }
        }

        if (!cooldowns.has(command.config.name)) cooldowns.set(command.config.name, new Collection());
        const now = Date.now();
        const timestamps = cooldowns.get(command.config.name);
        const cooldownAmount = (command.config.cooldown || 3) * 1000;
        if (timestamps.has(ctx.source.user.id)) {
            const expirationTime = timestamps.get(ctx.source.user.id) + cooldownAmount;
            if (now < expirationTime && !client.owners.includes(message.author.id)) {
                const timeLeft = Math.floor(expirationTime - now);
                let embed = await this.getErrorEmbed(`Please wait **${ms(timeLeft)}** before reusing the command again.`);
                return ctx.send({
                    embeds: [embed],
                    ephemeral: true,
                });
            }
        }

        try {
            const success = await command.run(ctx);
            if(success !== false) {
                timestamps.set(ctx.source.user.id, now);
                setTimeout(() => timestamps.delete(ctx.source.user.id), cooldownAmount);
            }
        } catch (e) {
            let embed = await this.getErrorEmbed(`Something went wrong executing that command\nError Message: \`${e.message ? e.message : e}\``, true)
            ctx.reply({
                embeds: [embed],
                allowedMentions: { repliedUser: false },
                ephemeral: true,
            });
            client.log.error(e);
        }
    }
}
