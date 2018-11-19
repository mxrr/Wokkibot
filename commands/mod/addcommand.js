const { Command } = require('discord.js-commando');

module.exports = class AddCommandCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'addcommand',
      aliases: ['addcom', 'addc'],
      group: 'mod',
      memberName: 'addcommand',
      description: 'Add a custom command to server',
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
    if (this.client.registry.commands.find(c => c.name === command)) return msg.channel.send(`Command name must be unique and it can not replace an existing command`);

    let newCommand = {
      "command": command,
      "outut": output
    };

    this.client.db.getGuild(msg.guild.id)
      .then(data => {
        if (data && data.commands) {
          if (data.commands.find(cmd => cmd.command === command)) return msg.channel.send(`Command __${command}__ already exists`);
          this.client.db.pushGuild(msg.guild.id, "commands", newCommand);
        }
        else {
          this.client.db.updateGuild(msg.guild.id, "commands", [newCommand]);
        }

        return msg.channel.send(`Added command ${command} to guild`);
      })
      .catch(e => {
        return [this.client.logger.error(e),msg.channel.send('An error occurred. More information logged to console.')];
      });
  }
}