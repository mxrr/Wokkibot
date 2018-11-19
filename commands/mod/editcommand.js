const { Command } = require('discord.js-commando');

module.exports = class EditCommandCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'editcommand',
      aliases: ['editcom', 'editc', 'updatecommand', 'updatecom', 'updatec'],
      group: 'mod',
      memberName: 'editcommand',
      description: 'Edit an existing command on this server',
      guildOnly: true,
      clientPermissions: ['SEND_MESSAGES'],
      userPermissions: ['MANAGE_CHANNELS'],
      args: [
        {
          key: 'command',
          prompt: 'Enter command name',
          type: 'string'
        },
        {
          key: 'output',
          prompt: 'What should this command result in',
          type: 'string'
        }
      ]
    });
  }

  run(msg, { command, output }) {
    this.client.db.getGuild(msg.guild.id)
      .then(data => {
        if (data && data.commands) {
          if (data.commands.find(cmd => cmd.command === command)) {
            let cmd = data.commands.find(cmd => cmd.command === command);
            cmd.output = output;
            this.client.db.updateGuild(msg.guild.id, "commands", data.commands);
            return msg.channel.send(`Command __${command}__ updated!`);
          }
          else {
            return msg.channel.send(`Could not find command __${command}__ from this server`);
          }
        }
      })
      .catch(e => {
        return [this.client.logger.error(e),msg.channel.send('An error occurred. More information logged to console')];
      });
  }
}