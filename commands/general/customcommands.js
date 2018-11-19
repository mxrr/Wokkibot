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
    this.client.db.getGuild(msg.guild.id)
      .then(data => {
        if (data && data.commands) {
          return msg.channel.send(`**Custom commands (${data.commands.length})**\n\`\`\`\n${data.commands.map(cmd => cmd.command).join("\n")}\`\`\``);
        }
        else {
          return msg.channel.send('Could not find any custom commands');
        }
      })
      .catch(e => {
        return [this.client.logger.error(e),msg.channel.send('An error occurred. More information logged to console')];
      });
  }
}