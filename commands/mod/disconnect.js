const { Command } = require('discord.js-commando');
const winston = require('winston');

module.exports = class DisconnectCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'disconnect',
            group: 'mod',
            memberName: 'disconnect',
            description: 'Force disconnect bot from any voice channel in a guild',
            details: 'Command should only be used if the bot is malfunctioning and refusing to leave the channel after ending a playlist. Should not be used as an replacement for skip command',
            examples: [`${client.commandPrefix}disconnect`],
            guildOnly: true,
        });
    }

    hasPermission(msg) {
        return this.client.isOwner(msg.author);
    }

    run(msg) {
        msg.client.voiceConnections.find(val => val.channel.guild.id).channel.leave();
    }
}