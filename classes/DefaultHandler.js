const Client = require('./Client');
const Utils = require('../utils');
const {Message, Guild, MessageEmbed, Collection} = require('discord.js');
const Middleware = require('../classes/base/Middleware');
const ms = require('pretty-ms');
const EasyEmbedPages = require('../functions/EasyEmbedPages');
const DeletableMessage = require('../functions/DeletableMessage');

const cooldowns = new Collection();

module.exports = class {
    constructor(client){
        this.client = client;
        this.checks = new Middleware();

        this.client.on('messageDelete', async (message) => {
            message.replies.map(async (r) => {
                await message.channel.messages.cache.get(r)?.delete().catch(() => { }); 
            });
        })
    }

    /**
     * 
     * @param {Client} client 
     * @param {Guild} guild 
     */
    async getPrefix(client, guild) {
        return '!';
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
     * @param {Message} message 
     * @param {Function} next 
     */
    async handle(client, message, next, defaultChecks = true) {

        if(message.author.bot) return;

        let prefix = await this.getPrefix(client, message.guild);
        if(prefix == "none") prefix = "";

        const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${Utils.general.escapeRegex(prefix)})\\s*`);
        if (!prefixRegex.test(message.content)) return;

        const [, matchedPrefix] = message.content.match(prefixRegex);

        let args = message.content.slice(matchedPrefix.length).trim().split(/ +/);

        const commandName = args.shift().toLowerCase();
        const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.config.aliases && cmd.config.aliases.includes(commandName));

        if(!command) return;

        let flags = [];
        let argsCopy = [...args];

        args.map((arg) => {
            if(arg[0] === '-' && arg[1] === '-' && arg[2] != undefined){ 
                flags.push(arg.slice(2));
                argsCopy = Utils.general.removeFromArray(argsCopy,arg);
            }
        });
        args = argsCopy;

        async function send(content) {
            if(content.embeds) content.embed = content.embeds[0];
            let del = content.delete;
            const msg = await (del != false ? new DeletableMessage({send: message.channel.send.bind(message.channel)}, content).start(message.member) : message.channel.send(content));
            if(del != false) message.replies.push(msg.id);
            return msg;
        }
    
        async function reply(content){
            if(content.embeds) content.embed = content.embeds[0];
            let del = content.delete;
            const msg = await (del != false ? new DeletableMessage({send: message.reply.bind(message)}, content).start(message.member) : message.reply(content));
            if(del != false) message.replies.push(msg.id);
            return msg;
        }
    
        async function paginate(options, fn){
            const paginator = new EasyEmbedPages({send}, options, fn);
            await paginator.start({user: message.author});
            message.replies.push(paginator.message.id);
            return paginator;
        }

        const ctx = {
            source: message,
            flags,
            isCommand: false,
            args,
            client,
            send,
            reply,
            paginate
        }

        /**
         * Checks
         */

        let timestamps, now, cooldownAmount;
        if(defaultChecks){
            if(command.permissions.botOwnerOnly && !client.owners.includes(ctx.source.member.id)) {
                let embed = await this.getErrorEmbed('This is a owner only command!');
                return ctx.send({
                    embeds: [embed]
                });
            }

            if(command.permissions.serverOwnerOnly && ctx.source.member.id !== ctx.source.guild.ownerID) {
                let embed = await this.getErrorEmbed('This is a server owner only command!');
                return ctx.send({
                    embeds: [embed]
                });
            }
    
            if (command.permissions.clientPerms) {
                if (!message.guild.me.permissions.has(command.permissions.clientPerms) || !message.channel.permissionsFor(ctx.source.guild.me).has(command.permissions.clientPerms)) {
                    let embed = await this.getErrorEmbed(
                        `Sorry, but i need the following permisions to perform this command -\n${command.permissions.clientPerms.map(p => `> \`- ${p}\``).join('\n')}`, true
                    );
                    return ctx.send({
                        embeds: [embed]
                    }).catch(() => ctx.source.member.send(embed));
                }
            }
    
            if (command.permissions.userPerms) {
                if (!message.member.permissions.has(command.permissions.userPerms) || !message.channel.permissionsFor(ctx.source.member).has(command.permissions.userPerms)) {
                    let embed = await this.getErrorEmbed(
                        `Sorry, but you don't have enough permissions to execute this command. You need the following permissions -\n${command.permissions.userPerms.map(p => `> \`- ${p}\``).join('\n')}`,
                        true                   
                    );
                    return ctx.send({
                        embeds: [embed]
                    }).catch(() => ctx.source.member.send(embed));
                }
            }
    
            if (command.config.args && !args.length && command.config.usage) {
                let embed = await this.getErrorEmbed(`You didn't provide any arguments, ${ctx.source.member}!\nThe proper usage would be: \n\`\`\`html\n${command.config.usage}\n\`\`\``, true)
                return ctx.send({
                    embeds: [embed]
                });
            }
    
            if (command.config.nsfw && !ctx.source.channel.nsfw) {
                let embed = await this.getErrorEmbed("Sorry, i can\'t run nsfw commands on a non-nsfw channel.");
                return ctx.send({
                    embeds: [embed],
                });
            }
    
            if (!cooldowns.has(command.config.name)) cooldowns.set(command.config.name, new Collection());
            now = Date.now();
            timestamps = cooldowns.get(command.config.name);
            cooldownAmount = (command.config.cooldown || 3) * 1000;
            if (timestamps.has(message.author.id)) {
                const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
                if (now < expirationTime && !client.owners.includes(message.author.id)) {
                    const timeLeft = Math.floor(expirationTime - now);
                    let embed = await this.getErrorEmbed(`Please wait **${ms(timeLeft)}** before reusing the command again.`);
                    return ctx.send({
                        embeds: [embed],

                    });
                }
            }
        }

        await this.checks.run({ctx, command});

        try {
            const success = await command.run(ctx);
            if (success !== false && defaultChecks) {
                if(command.config.deleteAuthorMessage && message.deletable) message.delete().catch(() => { });
                timestamps.set(message.author.id, now);
                setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
            }
        } catch (e) {
            let embed = await this.getErrorEmbed(`Something went wrong executing that command\nError Message: \`${e.message ? e.message : e}\``, true);
            ctx.reply({
                embeds: [embed],
                allowedMentions: { repliedUser: false }
            });
            Utils.logger.error(e);
        }

        next();
    }
}

/** 
 * async function send(content, options) {
            const msg = await message.channel.send(content, options);
            let del = content?.delete ?? options?.delete;
            Utils.logger.debug(del);
            if(!del == undefined || del != false) message.replies.push(msg.id);
            return msg;
        }
 */