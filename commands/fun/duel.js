const { Command } = require('discord.js-commando');
const { MessageCollector } = require('discord.js');

module.exports = class DuelCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'duel',
      aliases: ['challenge'],
      group: 'fun',
      memberName: 'duel',
      description: 'Duel against someone',
      guildOnly: true,
      clientPermissions: ['SEND_MESSAGES'],
      args: [
        {
          key: 'user',
          prompt: 'Who would you like to duel against?',
          type: 'string'
        },
        {
          key: 'coins',
          prompt: 'How much would you like to bet?',
          type: 'integer'
        }
      ]
    });

    this.challengerCoins = 0;
    this.challengedCoins = 0;
  }

  run(msg, { user, coins }) {
    user = msg.mentions.users.first(1)[0];
    if (!user) return msg.channel.send(`You must mention the user to duel`);

    if (coins < 0) return msg.channel.send(`Bets must be above 1`);

    this.client.db.users.findOne({ did: msg.author.id }, (err, data) => {
      if (err) return [this.client.logger.error(err),msg.channel.send('An error occurred while trying to fetch user data. More information logged to console.')];

      if (data) {
        if (data.coins) {
          this.challengerCoins = parseInt(data.coins);
        }
        else {
          this.client.db.users.update({ did: msg.author.id }, { $set: { coins: 100 } });
          this.challengerCoins = 100;
        }
      }
      else {
        let row = {
          did: msg.author.id,
          coins: 100
        }

        this.challengerCoins = 100;
        this.client.db.users.insert(row);
      }

      this.client.db.users.findOne({ did: user.id }, (err, data) => {
        if (err) return [this.client.logger.error(err),msg.channel.send('An error occurred while trying to fetch user data, more information logged to console.')];
  
        if (data) {
          if (data.coins) {
            this.challengedCoins = parseInt(data.coins);
          }
          else {
            this.client.db.users.update({ did: user.id }, { $set: { coins: 100 } });
            this.challengedCoins = 100;
          }
        }
        else {
          let row = {
            did: user.id,
            coins: 100
          }
  
          this.challengedCoins = 100;
          this.client.db.users.insert(row);
        }

        if (this.challengerCoins < coins) return msg.channel.send(`You are trying to bet more than you have. You have ${this.challengerCoins} coins.`);
        if (this.challengedCoins < coins) return msg.channel.send(`Target user doesn't have enough coins. They have ${this.challengedCoins} coins.`);
    
        msg.channel.send(`${user} you have been challenged to duel by ${msg.author} for ${coins} coins. Type accept or decline.`);
        const collector = new MessageCollector(msg.channel, m => m.author.id === user.id, { time: 30000 });
        collector.on('collect', message => {
          if (message.content.startsWith("accept")) {
            //msg.channel.send(`A duel between ${msg.author} and ${user} with bet of ${coins} coins is beginning in the #duels channel!`);
            collector.stop('accepted');
            const random = Math.round(Math.random() * 100);
            if (random > 50) {
              this.client.db.users.update({ did: msg.author.id }, { $set: { coins: this.challengerCoins + coins }});
              this.client.db.users.update({ did: user.id }, { $set: { coins: this.challengedCoins - coins }});
              return msg.channel.send(`${msg.author} won ${coins} coins!`);
            }
            else {
              this.client.db.users.update({ did: user.id }, { $set: { coins: this.challengedCoins + coins }});
              this.client.db.users.update({ did: msg.author.id }, { $set: { coins: this.challengerCoins - coins }});
              return msg.channel.send(`${user} won ${coins} coins!`);
            }
          }
          else if (message.content.startsWith("decline")) {
            collector.stop('declined');
          }
        });
        collector.on('end', (collected, reason) => {
          if (reason === 'time') return msg.channel.send(`${user} did not reply in time. Duel cancelled.`);
          else if (reason === 'declined') return msg.channel.send(`${user} pussied out and declined the duel.`);
        });
      });
    });
  }
}