const { Command } = require('discord.js-commando');

module.exports = class CustomcommandsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'customcommands',
      aliases: ['ccommands'],
      group: 'general',
      memberName: 'customcommands',
      description: 'List all custom commands for this server',
      guildOnly: true,
      clientPermissions: ['SEND_MESSAGES']
    });
  }

  run(msg) {
    this.client.db.guilds.findOne({ gid: msg.guild.id }, (err, data) => {
      if (err) return [this.client.logger.error(err),msg.channel.send(`Error occurred when trying to fetch guild info. More information logged to console.`)]

      if (data) {
        if (data.commands) {
          let commands = [];
          data.commands.forEach(command => {
            commands.push(command.command);
          });

          return msg.channel.send(`**Custom commands (${data.commands.length})**\n\`\`\`\n${commands.join("\n")}\`\`\``);
        }
      }

      return msg.channel.send(`There are no custom commands on this server`);
    });
  }
}