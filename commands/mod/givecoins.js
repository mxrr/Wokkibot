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
    if (!user) return msg.channel.send('You must mention the user');

    this.client.db.getUser(user.id)
      .then(data => {
        if (data.coins) {
          this.client.db.updateUser(user.id, "coins", coins + data.coins);
        }
        else {
          this.client.db.updateUser(user.id, "coins", coins);
        }
      })
      .catch(e => {
        return [this.client.logger.error(e),msg.channel.send('An error occurred. More information logged to console.')];
      });
  }
}