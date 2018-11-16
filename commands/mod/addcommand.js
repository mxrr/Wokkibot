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

    this.client.db.guilds.findOne({ gid: msg.guild.id }, (err, data) => {
      if (err) return this.client.logger.error(err);

      let newCommand = {
        "command": command,
        "output": output
      }

      if (data) {
        if (data.commands.find(val => val.command === command)) {
          return msg.channel.send(`Command ${command} exists already on this server. Use editcom instead.`);
        }
        this.client.db.guilds.update({ gid: msg.guild.id }, { $push: { commands: newCommand } });
      }
      else {
        let commands = [];
        commands.push(newCommand);
        this.client.db.guilds.insert({
          gid: msg.guild.id,
          commands: commands
        });
      }

      msg.channel.send(`Added command **${command}** to the server`);
    });
  }
}