const BaseEvent = require('../classes/base/BaseEvent.js');

module.exports = class Event extends BaseEvent {
    constructor(){
        super('ready');
    }

    async run(client){
        /*await client.utils.wait(1000);
        await Promise.all(
            client.guilds.cache.map(async guild => {
                await guild.members.fetch();
                await guild.fetchInvites().then(async invites => {
                    client.db.invites.set(guild.id,invites);
                }).catch(() => {});
        }));*/

        client.log.success(`${client.user.tag} ready!`);
    }
}
