const Discord = require('discord.js');
const Client = require('../Client');

module.exports = class BaseCommand {
    /**
     * @param {Object} props - The props object
     * 
     * @param {Object} props.config - The command info object
     * 
     * @param {String} props.config.name - the name of the command
     * @param {Array<string>} props.config.aliases - the aliases of the command
     * @param {String} props.config.description - the command description
     * @param {String} props.config.usage - the arguments info
     * @param {boolean} props.config.nsfw - if the command is nsfw
     * @param {Number} props.config.cooldown - in seconds
     * @param {boolean} props.config.args - if args are required
     * @param {Number} props.config.commandType - 0 = Both, 1 = Normal, 2 = Slash 
     * @param {Array} props.config.commandOptions - Argument definations for slash commands
     * @param {boolean} prop.config.deleteAuthorMessage - whether to delete the author message after executing the command or not
     * 
     * @param {Object} props.permissions - The permissions info object

     * @param {Array - Discord.Permissions} props.permissions.userPerms - Perms the user needs to have in order to execute the command
     * @param {Array - Discord.Permissions} props.permissions.clientPerms - Perms required to carry out the command
     * @param {boolean} props.permissions.serverOwnerOnly - Only accessable by server owner
     * @param {boolean} props.permissions.botOwnerOnly - Only accessable by bot owner
     */
    constructor(props) {
        this.config = props.config;
        this.permissions = props.permissions;
    }

    /**
     * 
     * @param {Client} client 
     * @param {Discord.Message} message 
     * @param {Array} args 
     */
    
    async run(ctx) {
        ctx.reply({
            content: "This command hasn't yet been defined!",
            allowedMentions: { repliedUser: false }
        });
    }
}