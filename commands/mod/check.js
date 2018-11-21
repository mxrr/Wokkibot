const { Command } = require('discord.js-commando');

module.exports = class CheckCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'check',
      group: 'mod',
      memberName: 'check',
      description: 'Check a value from database',
      guildOnly: true,
      clientPermissions: ['SEND_MESSAGES'],
      userPermissions: ['MANAGE_CHANNELS'],
      args: [
        {
          key: 'field',
          prompt: 'What should we check for?',
          type: 'string'
        }
      ]
    });
  }

  run(msg, { field }) {
    this.client.db.getGuild(msg.guild.id)
      .then(data => {
        if (data[field]) {
            return msg.channel.send(`${field} = ${JSON.stringify(data[field])}`);
        }
        else return msg.channel.send(`Could not find _${field}_ from this server`);
      })
      .catch(e => {
        return [this.client.logger.error(e),msg.channel.send('An error occurred. More information logged to console.')];
      });
  }
}