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

    this.coins = 0;
  }

  run(msg, { user }) {
    user = user ? msg.mentions.users.first(1)[0] : msg.author;

    this.client.db.users.findOne({ did: user.id }, (err, data) => {
      if (err) return [this.client.logger.error(err),msg.channel.send('An error occurred while trying to fetch user data. More information logged to console.')];

      if (data) {
        if (data.coins) {
          this.coins = parseInt(data.coins);
        }
        else {
          this.client.db.users.update({ did: msg.author.id }, { $set: { coins: 100 } });
          this.coins = 100;
        }
      }
      else {
        let row = {
          did: msg.author.id,
          coins: 100
        }

        this.coins = 100;
        this.client.db.users.insert(row);
      }

      if (msg.author !== user) return msg.channel.send(`${user.tag} has ${this.coins} coins`);
      else msg.channel.send(`You have ${this.coins} coins`);
    });
  }
}