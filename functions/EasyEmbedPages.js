const Discord = require('discord.js');

// the array chunking function
const chunk = (array, chunkSize = 0) => {
    if (!Array.isArray(array)) throw new Error('First parameter must be an array');
    return array.reduce((previous, current) => {
        let chunk;
        if (!previous.length || previous[previous.length - 1].length === chunkSize) {
            chunk = [];
            previous.push(chunk);
        } else chunk = previous[previous.length - 1];
        chunk.push(current);
        return previous;
    }, []);
}

module.exports = class EasyEmbedPages {

    /**
     * 
     * @param {Discord.TextChannel} channel 
     * @param {Object} data 
     * @param {Function} pageGen - to change embed using a function
     */

    constructor(channel, data = {}, pageGen = () => { }) {

        this.channel = channel;
        this.time = data.time;                                        // idle time to stop the interactive process
        this.pages = [];                                              // embed pages... automagically generated xD
        this.page = 0;                                                // currect page number
        this.dataPages = data.pages || [];                            // page data for extra configuration
        this.color = data.color;                                      // embed color
        this.url = data.url;                                          // embed url
        this.title = data.title;                                      // embed title
        this.author = data.author;                                    // embed author object
        this.footer = data.footer;                                    // embed footer object
        this.thumbnail = data.thumbnail;                              // embed thumbnail
        this.image = data.image;                                      // embed large image
        this.description = data.content || data.description || null;  // the content to be presented dynamically
        this.pageGen = pageGen;                                       // the function to customize embeds
    }

    generateButtons(size, currentPage) {
        if (size <= 1) return new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageButton()
                    .setCustomId('5')
                    .setStyle('DANGER')
                    .setEmoji('<:trash:852511333165563915>')
            );

        else if (size <= 2) return new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageButton()
                    .setCustomId('2')
                    .setStyle('PRIMARY')
                    .setEmoji('<:previous:852515728514744340>')
                    .setDisabled(currentPage == 0)
            )
            .addComponents(
                new Discord.MessageButton()
                    .setCustomId('3')
                    .setStyle('PRIMARY')
                    .setEmoji('<:next:852515302231375902>')
                    .setDisabled(currentPage == 1)
            )
            .addComponents(
                new Discord.MessageButton()
                    .setCustomId('5')
                    .setStyle('DANGER')
                    .setEmoji('<:trash:852511333165563915>')
            );

        else return new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageButton()
                    .setCustomId('1')
                    .setStyle('PRIMARY')
                    .setEmoji('<:rewind:852515586068185088>')
                    .setDisabled(currentPage == 0)
            )
            .addComponents(
                new Discord.MessageButton()
                    .setCustomId('2')
                    .setStyle('PRIMARY')
                    .setEmoji('<:previous:852515728514744340>')
                    .setDisabled(currentPage == 0)
            )
            .addComponents(
                new Discord.MessageButton()
                    .setCustomId('3')
                    .setStyle('PRIMARY')
                    .setEmoji('<:next:852515302231375902>')
                    .setDisabled(currentPage == size - 1)
            )
            .addComponents(
                new Discord.MessageButton()
                    .setCustomId('4')
                    .setStyle('PRIMARY')
                    .setEmoji('<:fastforward:852515213080395816>')
                    .setDisabled(currentPage == size - 1)
            )
            .addComponents(
                new Discord.MessageButton()
                    .setCustomId('5')
                    .setStyle('DANGER')
                    .setEmoji('<:trash:852511333165563915>')
            );

    }

    /**
     * The magic function which generates the embeds
     */
    generatePages() {
        let text, great, array;

        if (this.description) {
            text = this.description.split("");
            great = text.length > 2000 ? Math.floor(text.length / 2000) : false;
            array = great ? chunk(text, 2000) : [text];
        }

        let x = Math.max(array ? array.length : 0, this.dataPages.length);

        this.pages = [];

        for (let index = 0; index < x; index++) {
            const data = { fields: [] };

            if (this.description && array[index]) {
                let i = array[index].join("");
                if (index < great) i = `${i}...`;
                else if (index) i = `...${i}`;
                data.description = i;

                if (this.dataPages[index] && (this.dataPages[index].description || this.dataPages[index].content)) data.fields.push({ name: "‎\u200b", value: this.dataPages[index].description || this.dataPages[index].content, inline: false });
            }
            else {
                if (this.dataPages[index] && (this.dataPages[index].description || this.dataPages[index].content)) data.description = this.dataPages[index].description || this.dataPages[index].content;
            }

            if ((this.dataPages[index] && this.dataPages[index].color) || this.color) data.color = this.dataPages[index] && this.dataPages[index].color || this.color;
            if ((this.dataPages[index] && this.dataPages[index].url) || this.url) data.url = this.dataPages[index] && this.dataPages[index].url || this.url;
            if ((this.dataPages[index] && this.dataPages[index].title) || this.title) data.title = this.dataPages[index] && this.dataPages[index].title || this.title;
            if ((this.dataPages[index] && this.dataPages[index].author) || this.author) data.author = this.dataPages[index] && this.dataPages[index].author || this.author;
            if ((this.dataPages[index] && this.dataPages[index].footer) || this.footer) data.footer = this.dataPages[index] && this.dataPages[index].footer || this.footer;
            else data.footer = { text: `Page ${index + 1} of ${x} page${x > 1 ? 's' : ''}` };

            if ((this.dataPages[index] && this.dataPages[index].thumbnail) || this.thumbnail) data.thumbnail = this.dataPages[index] && this.dataPages[index].thumbnail || this.thumbnail;
            if ((this.dataPages[index] && this.dataPages[index].image) || this.image) data.image = this.dataPages[index] && this.dataPages[index].image || this.image;
            if (this.dataPages[index] && this.dataPages[index].fields) this.dataPages[index].fields.map(x => data.fields.push({ name: x.name || "\u200b", value: x.value || "\u200b", inline: x.inline || false }));

            const embed = new Discord.MessageEmbed(data);
            this.pageGen(embed);
            this.pages.push(embed);
        };
    }

    /**
     * Function used to start the dynamic embed pagination.
     * 
     * @param {Object} options 
     * @param {Discord.Channel} options.channel
     * @param {Discord.User} options.user
     * @param {Number} page
     */
    async start(options = {}, page = 0) {
        this.page = page;

        if (options instanceof Discord.Channel) options = { channel: options };
        else if (!options || typeof options !== 'object') options = {};
        let condition = () => true;

        if (options.user) this.user = options.user;

        if (options.time) this.time = options.time;

        if (options.channel) this.channel = options.channel;
        if (!this.channel) throw new Error("No text channel specified!");

        this.generatePages();

        if (this.page > this.pages.length) throw new Error("Page number greater than total pages!");

        this.message = await this.channel.send({
            embeds: [this.pages[this.page]],
            components: [this.generateButtons(this.pages.length, this.page)],
            delete: false
        });

        this.collector = this.message.createMessageComponentCollector({ time: this.time, componentType: 'BUTTON' });

        this.collector.on('collect', this._handleInteraction.bind(this));
    }

    /**
     * Reaction handing function - the function which does the magic of changing the embed!
     * @param {Discord.ButtonInteraction} interaction 
     */
    async _handleInteraction(interaction) {
        if (interaction.user.id != this.user.id) {
            return await interaction.reply({
                embeds: [
                    new Discord.MessageEmbed()
                        .setDescription(`Only <@${this.user.id}> can interact with this message.`)
                        .setColor('RED')
                ],
                ephemeral: true
            });
        }

        switch (interaction.customId) {
            case '1':
                if (this.pages.length <= 1) break;
                if (this.page === 0) break;
                this.page = 0;
                this.message.edit({
                    embeds: [this.pages[this.page]],
                    components: [this.generateButtons(this.pages.length, this.page)]
                });
                break;
            case '2':
                if (this.pages.length <= 1) break;
                if (this.page > 0) --this.page;
                this.message.edit({
                    embeds: [this.pages[this.page]],
                    components: [this.generateButtons(this.pages.length, this.page)]
                });
                break;
            case '3':
                if (this.page < this.pages.length - 1) ++this.page;
                this.message.edit({
                    embeds: [this.pages[this.page]],
                    components: [this.generateButtons(this.pages.length, this.page)]
                });
                break;
            case '4':
                if (this.pages.length <= 1) break;
                if (this.page === (this.pages.length - 1)) break;
                this.page = this.pages.length - 1;
                this.message.edit({
                    embeds: [this.pages[this.page]],
                    components: [this.generateButtons(this.pages.length, this.page)]
                });
                break;
            case '5':
                this.message.delete().catch(() => { })
                break;
            default:
                break;
        }

        interaction.deferUpdate();
    }
}