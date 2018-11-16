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

    this.client.db.blacklist.findOne({ did: user.id }, (err, data) => {
      if (err) return [this.client.logger.error(err),msg.channel.send(`An error occurred when trying to fetch blacklist data. More info logged to console.`)];
      if (data) return msg.channel.send(`${user.tag} is already blacklisted`);
    });

    this.client.db.blacklist.insert({ did: user.id, reason: reason });
  }
}