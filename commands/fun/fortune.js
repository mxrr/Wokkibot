const { Command } = require('discord.js-commando');

module.exports = class FortuneCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'fortune',
      aliases: ['fortunecookie'],
      group: 'fun',
      memberName: 'fortune',
      description: 'Get random fortune'
    });
  }

  run(msg) {
    const fortunes = require('../../utils/fortune-cookies.json');

    const fortune = fortunes[Math.round(Math.random() * fortunes.length)];

    msg.reply(fortune);
  }
}