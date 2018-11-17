const { Command } = require('discord.js-commando');

module.exports = class GiveCoinsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'givecoins',
      group: 'fun',
      memberName: 'givecoins',
      description: 'Give coins to a user',
      guildOnly: true,
      clientPermissions: ['SEND_MESSAGES'],
      args: [
        {
          key: 'user',
          prompt: 'Who should receive these coins?',
          type: 'string'
        },
        {
          key: 'coins',
          prompt: 'How many coins?',
          type: 'integer'
        }
      ]
    });
  }

  hasPermission(msg) {
    return this.client.isOwner(msg.author);
  }

  run(msg, { user, coins }) {
    user = msg.mentions.users.first(1)[0];
    if (!user) return msg.channel.send(`You must mention the user`);

    this.client.db.users.findOne({ did: msg.author.id }, (err, data) => {
      if (err) return [this.client.logger.error(err),msg.channel.send('An error occurred while trying to fetch user data. More information logged to console.')];
    
      if (data) {
        if (data.coins) {
          this.client.db.users.update({ did: user.id }, { $set: { coins: data.coins + coins } });
        }
        else {
          this.client.db.users.update({ did: user.id }, { $set: { coins: 100 + coins } });
        }
      }
      else {
        let row = {
          did: msg.author.id,
          coins: 100 + coins
        }

        this.client.db.users.insert(row);
      }
    });
  }
}