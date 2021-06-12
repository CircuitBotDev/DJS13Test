const {BaseCommand} = require('../../..');
const {MessageEmbed} = require('discord.js');
const ms = require('pretty-ms');

const clean = text => {
    if (typeof(text) === "string")
      return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    else
        return text;
}

module.exports = class extends BaseCommand{
    constructor(){
        super({
            config: {
                name: "eval",
                aliases: [],
                description: "Evals code...",
                usage: "<code>",
                nsfw: false,
                cooldown: 10,
                args: true,
                deleteAuthorMessage: false,
                protected: true,
                commandType: 0,
                commandOptions: [
                    {
                        type: 'STRING',
                        name: 'code',
                        required: true,
                        description: 'The code to evaluate'
                    }
                ]

            },
            permissions: {
                userPerms: [],
                clientPerms: ['SEND_MESSAGES','EMBED_LINKS'],
                serverOwnerOnly: false,
                botOwnerOnly: true
            }
        });
    };

    async run(ctx){
        let output, status = true;
        const now = Date.now();

        try {
            let evaled = eval(ctx.isCommand ? ctx.source.options?.get('code')?.value : ctx.args.join(' '));
            if (evaled instanceof Promise) evaled = await evaled;

            if (typeof evaled !== "string") evaled = require("util").inspect(evaled);
        
            output = clean(evaled).replace(ctx.client.token,'[TOKEN REMOVED]');
        } catch (err) {
            status = false;
            output = require("util").inspect(err);
        }

        const elapsed = Date.now() - now;

        ctx.paginate(
            {   
                color: status ? 'GREEN' : 'RED',
                author: {
                    name: "Evaled Code", 
                    iconURL: status ? "https://iili.io/BxVFZF.png" : "https://iili.io/BxV3j1.png"
                },
                description: output,
            },
            (embed) => {
                embed.setDescription(`\`\`\`xl\n${embed.description}\n\`\`\``)
                embed.setFooter(`Time Elapsed: ${ms(elapsed)} | ${embed.footer.text}`)
            }
        );
    }
}