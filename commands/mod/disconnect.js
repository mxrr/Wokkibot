const { Command } = require('discord.js-commando');

module.exports = class DisconnectCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'disconnect',
      aliases: ['dc'],
      group: 'mod',
      memberName: 'disconnect',
      description: 'Force bot to leave voice channel',
      userPermissions: ['ADMINISTRATOR'],
      guildOnly: true
    });
  }

  run(msg) {
    msg.client.voiceConnections.find(val => val.channel.guild.id).channel.leave();
  }
}