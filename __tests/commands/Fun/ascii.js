const {BaseCommand} = require('../../..');
const {MessageEmbed} = require('discord.js');
const hastebin = require('hastebin');
const Figlet = require('../../functions/figlet-promises');
const figlet = new Figlet();
figlet.loadFonts();

module.exports = class Ping extends BaseCommand{
    constructor() {
        super({
            config: {
                name: "ascii",
                aliases: ['figlet'],
                description: "Makes your text go brr...",
                usage: "[font] <text>",
                nsfw: false,
                cooldown: 10,
                args: false,
                accessibility: 0,
                deleteAuthorMessage: false,
                protected: false,
                commandType: 0,
                commandOptions: [
                    {
                        type: 'STRING',
                        name: 'text',
                        required: false,
                        description: 'The text to asciify.'
                    },
                    {
                        type: 'STRING',
                        name: 'font',
                        required: false,
                        description: 'The ascii font. Run command without any options to see a list of fonts.'
                    }
                ]
            },
            permissions: {
                userPerms: [],
                clientPerms: ['SEND_MESSAGES','EMBED_LINKS'],
                serverOwnerOnly: false,
                botOwnerOnly: false
            }
        });
    }

    async run(ctx){
        let font = ctx.isCommand ? ctx.source.options.get('font')?.value : ctx.args[0];
        
        if(figlet.fonts.has(font)) {
            if(!ctx.isCommand) ctx.args.shift();
        } else font = 'standard';

        if(!ctx.args[0] || (ctx.isCommand && !ctx.source.options.get('text')?.value)){
            let embed = new MessageEmbed()
                .setColor("RANDOM")
                .setTitle("List of available fonts")
                .setDescription(`\`\`\`${Array.from(figlet.fonts.keys()).join(", ")}\`\`\``)
            return ctx.send({
                embeds: [embed],
                embed,
                ephemeral: true,
            });
        }
        let txt = ctx.isCommand ? figlet.write(ctx.source.options.get('text').value, font) : ctx.args.join(" ").split("\n").map(txt => figlet.write(txt,font)).join('');
        
        let hasteURL;
        try {
        	hasteURL = await hastebin.createPaste(txt, {raw: true,contentType: 'text/plain',server: 'https://paste.mod.gg'});
        } catch (e) {
            hasteURL = "https://www.google.com/search?&q=Error+Uploading+Text";
        }

        if(ctx.flags.includes('noembed')){
            return ctx.reply({
                content: `\`\`\`${txt.length > 2000 ? ctx.client.utils.general.shorten(txt,2000) : txt}\`\`\``,
                allowedMentions: {parse: []}
            });
        }

        let embed = new MessageEmbed()
            .setColor('RANDOM')
            .setTitle("Here Is Your ASCII Text")
            .setDescription(
                `\`\`\`${txt.length > 1974 ? ctx.client.utils.general.shorten(txt,1974) : txt}\`\`\``
            )
            .addField("Download",`[Click Here](${hasteURL})`)
            .setFooter("Long ASCII Text Can Be Displayed DiStOrTeD... Open download if it is!");

        ctx.reply({
            embeds: [embed],
            embed,
            allowedMentions: {
                repliedUser: false
            },
        });
    }
}
