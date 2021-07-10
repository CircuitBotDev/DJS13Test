const { Client, Collection, Intents, Structures, Message } = require('discord.js');
const fs = require('fs').promises;
const { join } = require('path');

const Utils = require('../utils'),
    CommandHandler = require('./CommandHandler'),
    BaseCommand = require('./base/BaseCommand'),
    BaseEvent = require('./base/BaseEvent'),
    Resolve = require('./Resolve');

//const ExtendedMessage = require('./structures/Message'); //rip structures
//Structures.extend('Message', () => ExtendedMessage); //rip structures

const defaultOptions = {
    partials: ['USER', 'GUILD_MEMBER', 'MESSAGE', 'CHANNEL', 'REACTION'],
    messageCacheMaxSize: 100,
    messageSweepInterval: 30,
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
    ]
}

module.exports = class extends Client {
    constructor(options = {}) {
        super(
            Object.assign({}, defaultOptions, options)
        );

        this.debug = options.debug ? true : false;
        this.owners = Array.from(options.owners) || [];
        this.commands = new Collection();
        this.applicationCommands = new Collection();
        this.events = new Collection();
        this.utils = Utils;
        this.log = Utils.logger;
        this.resolve = new Resolve(this);
        this.TextCommandHandler = new CommandHandler(this);
        this.ApplicationCommandHandler = new CommandHandler(this);

        if(!options.disableDefaultReady) this.on('ready', () => {
            this.log.success(`${client.user.tag} ready!`);
        })
    }

    registerCommand(dir, category) {
        try {
            const Command = require(dir);
            if (Command.prototype instanceof BaseCommand) {
                const props = new Command();
                props.config.category = category;
                this.commands.set(props.config.name, props);
                if (this.debug) this.log.debug(`Loaded Command - ${props.config.name}`);
            }
            return false;
        } catch (e) {
            return `Unable to load command ${dir}: ${e}`;
        }
    }

    async registerCommands(dir) {
        const files = await fs.readdir(dir);
        for (const file of files) {
            const filesPath = join(dir, file);
            const commands = await fs.readdir(filesPath);
            for (const command of commands) {
                if (command.endsWith('.js')) {
                    const response = this.registerCommand(join(filesPath, command), file);
                    if (response) this.log.error(response);
                }
            }
        }
    }

    async registerApplicationCommands(guild) {
        let target = this.application;
        if (guild) target = guild;

        return await Promise.all(this.commands.filter(cmd => cmd.config.commandType != 1 && !cmd.config.nsfw && !cmd.permissions.botOwnerOnly).map((command) => {
            let cmd = {
                name: command.config.name,
                description: command.config.description,
                options: command.config.commandOptions,
                defaultPermission: true
            };
            return cmd;

        })).then(async (data) => {
            return await target?.commands.set(data).then((result) => this.applicationCommands.set(guild ? guild.id : '0', result));
        });
    }

    async unregisterApplicationCommands(guild) {
        let target = this.application;
        if (guild) target = guild;

        return await target.commands.set([]);
    }

    async registerEvents(dir) {
        const files = await fs.readdir(dir);
        for (const file of files) {
            if (file.endsWith('.js')) {
                const Event = require(join(dir, file));
                if (Event.prototype instanceof BaseEvent) {
                    const instance = new Event();
                    instance.run = instance.run.bind(instance, this);
                    this.on(instance.name, instance.run);
                    this.events.set(instance.name, instance);
                    if (this.debug) this.log.debug(`Loaded Event - ${instance.name}`);
                }
            }
        }
    }

    init() {
        return Promise.all([
            this.registerEvents(join(__dirname, '..', 'events'))
        ]);
    }
}