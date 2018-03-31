const { Command } = require('discord.js-commando');
const winston = require('winston');

module.exports = class TwitchCommand extends Command {
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

    async run(msg, { channel }) {
        this.client.provider.set(msg.guild.id, "notifications", msg.channel.id);
        msg.channel.send(`Notification channel set to **${msg.channel.name}**`);
    }
}