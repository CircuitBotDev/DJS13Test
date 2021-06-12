const {MessageActionRow, MessageButton, Message, MessageEmbed} = require('discord.js');

module.exports = class DeletableMessage{
    constructor(channel, content){
        this.channel = channel;
        this.content = content;

        if(typeof this.content != 'object'){
            this.content = {content: this.content};
        }
    }

    generateButton() {
        return new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setCustomID('5')
                .setStyle('DANGER')
                .setEmoji('<:trash:852511333165563915>')
            );
    }

    async start(user){
        let condition = () => true;

        if(user) this.user = user;

        this.message = await this.channel.send(
            Object.assign({components: [this.generateButton()]}, {delete: false}, this.content)
        );

        this.collector = this.message.createMessageComponentInteractionCollector((i) => condition(i));
        this.collector.on('collect', this._handleReaction.bind(this));

        return this.message;
    }

    async _handleReaction(interaction) {  
        if(interaction.user.id != this.user.id){
            return await interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setDescription(`Only <@${this.user.id}> can interact with this message.`)
                    .setColor('RED')
                ],
                ephemeral: true
            });
        }

        this.message.delete().catch(() => { });
        interaction.deferUpdate();
    }
}