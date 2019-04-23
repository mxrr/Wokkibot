const { Command } = require('discord.js-commando');
const moment = require('moment');

module.exports = class AccountAgeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'accountage',
      aliases: ['age'],
      group: 'general',
      memberName: 'accountage',
      description: 'Get your Discord accounts creation date',
      guildOnly: true,
      clientPermissions: ['SEND_MESSAGES'],
      args: [
        {
          key: 'user',
          prompt: 'Whose account age are we checking?',
          type: 'string',
          default: ''
        }
      ]
    });
  }

  async run(msg, { user }) {
    user = user ? msg.mentions.users.first(1)[0] : msg.author;

    msg.channel.send(`Account **${user.username}** was created at **${moment(user.createdAt).format('DD.MM.YYYY HH:mm:ss')}** which was **${this.numberWithCommas(moment().diff(user.createdAt, 'days'))} days ago**.`);
  }

  numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
}