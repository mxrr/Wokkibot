const { Command } = require('discord.js-commando');

module.exports = class DeleteCommandCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'deletecommand',
      aliases: ['delcom', 'delc', 'removecommand', 'removecom', 'removec'],
      group: 'mod',
      memberName: 'deletecommand',
      description: 'Delete a command from this server',
      guildOnly: true,
      clientPermissions: ['SEND_MESSAGES'],
      userPermissions: ['MANAGE_CHANNELS'],
      args: [
        {
          key: 'command',
          prompt: 'Enter command name',
          type: 'string'
        }
      ]
    });
  }

  run (msg, { command }) {
    this.client.db.guilds.findOne({ gid: msg.guild.id }, (err, data) => {
      if (err) return [this.client.logger.error(err),msg.channel.send(`An error occurred when trying to fetch guild info. More info logged to console.`)]

      if (data) {
        let cmd = data.commands.find(val => val.command === command);
        if (cmd) {
          this.client.db.guilds.update({ gid: msg.guild.id }, { $pull: { commands: cmd } });
          return msg.channel.send(`Command ${command} removed`);
        }
      }

      return msg.channel.send(`Could not find a command ${command} on this server`);
    });
  }
}