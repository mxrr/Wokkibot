const { Command } = require('discord.js-commando');
const winston = require('winston');

module.exports = class SetChannelCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'setchannel',
            group: 'streams',
            memberName: 'setchannel',
            description: 'Set channel for livestream notifications',
            details: '',
            examples: [`${client.commandPrefix}setchannel`],
            guildOnly: true,
            clientPermissions: ['SEND_MESSAGES']
        });
    }

    hasPermission(msg) {
        const adminRole = this.client.provider.get(msg.guild.id, "adminRole");
        if (adminRole) {
            if (msg.member.roles.find('id', adminRole)) return true;
            else return false;
        }
        else {
            if (msg.author === msg.guild.owner.user) return true;
            else return this.client.isOwner(msg.author);
        }
    }

    run(msg, { channel }) {
        this.client.provider.set(msg.guild.id, "streamsChannel", msg.channel.id);
        msg.channel.send(`Streams channel set to **${msg.channel.name}**`);
    }
}