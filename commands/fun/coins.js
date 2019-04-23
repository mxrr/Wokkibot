const { Command } = require('discord.js-commando');

module.exports = class CoinsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'coins',
      group: 'fun',
      memberName: 'coins',
      description: 'Check your coin wallet',
      clientPermissions: ['SEND_MESSAGES'],
      args: [
        {
          key: 'user',
          prompt: 'User to check IQ from',
          type: 'string',
          default: ''
        }
      ]
    });

    this.default = 100;
  }

  run(msg, { user }) {
    user = user ? msg.mentions.users.first(1)[0] : msg.author;

    this.client.db.getUser(user.id)
      .then(data => {
        if (data && data.coins) {
          return msg.channel.send(`${user} has **${data.coins} coins**`);
        }
        else {
          this.client.db.updateUser(user.id, "coins", this.default);
          return msg.channel.send(`${user} has **${this.default} coins**`);
        }
      })
      .catch(e => {
        return [this.client.logger.error(e),msg.channel.send('An error occurred. More info logged to console.')];
      });
  }
}