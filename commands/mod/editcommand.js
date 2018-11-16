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
    this.client.db.guilds.findOne({ gid: msg.guild.id }, (err, data) => {
      if (err) return [this.client.logger.error(err),msg.channel.send(`An error occurred when trying to fetch guild info. More info logged to console.`)]

      if (data) {
        let cmd = data.commands.find(val => val.command === command);
        if (cmd) {
          cmd.output = output;

          this.client.db.guilds.update({ gid: msg.guild.id }, { $set: { commands: data.commands } });

          return msg.channel.send(`Command ${command} edited`);
        }
      }

      return msg.channel.send(`Could not find a command with name ${command}`);
    });
  }
}