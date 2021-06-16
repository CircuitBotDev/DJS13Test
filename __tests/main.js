const { Client, DefaultHandler } = require('../');
const { join } = require('path');
const { Intents } = require('discord.js');

const client = new Client({
    owners: ['461756834353774592', '746247931698479234'],
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS
    ],
    debug: false
});

(async () => {
    client.DefaultHandler = new DefaultHandler(client);
    client.CommandHandler.use(client.DefaultHandler.handle.bind(client.DefaultHandler));
    await client.init();
    await client.registerCommands(join(__dirname, 'commands'));
    client.login(require('./config').token);
})();