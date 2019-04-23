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
    this.client.db.getGuild(msg.guild.id)
      .then(data => {
        if (data && data.commands) {
          let cmd = data.commands.find(cmd => cmd.command === command);
          this.client.db.pullGuild(msg.guild.id, "commands", cmd)
            .then(data => {
              return msg.channel.send(`Command __${command}__ removed`);
            })
            .catch(e => {
              return [this.client.logger.error(e),msg.channel.send('An error occurred. More information logged to console.')];
            });
        }
        else {
          return msg.channel.send('This server has no commands');
        }
      })
      .catch(e => {
        return [this.client.logger.error(e),msg.channel.send('An error occurred. More information logged to console.')];
      });
  }
}