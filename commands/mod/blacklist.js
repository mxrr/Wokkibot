const { Command } = require('discord.js-commando');

module.exports = class BlacklistCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'blacklist',
      group: 'mod',
      memberName: 'blacklist',
      description: 'Blacklist user from using the bot',
      guildOnly: true,
      clientPermissions: ['SEND_MESSAGES'],
      args: [
        {
          key: 'user',
          prompt: 'Mention user that should be blacklisted',
          type: 'string'
        },
        {
          key: 'reason',
          prompt: 'Why is this user blacklisted?',
          type: 'string'
        }
      ]
    });
  }

  hasPermission(msg) {
    return this.client.isOwner(msg.author);
  }

  run(msg, { user, reason }) {
    user = user ? msg.mentions.users.first(1)[0] : msg.author;

    this.client.blacklist.add(user.id, reason)
      .then(data => {
        if (typeof data === 'string') return msg.channel.send(data);
        else return msg.channel.send(`${user} is now blacklisted`);
      })
      .catch(e => {
        return [this.client.logger.error(e),msg.channel.send('An error occurred. More information logged to console.')];
      });
  }
}