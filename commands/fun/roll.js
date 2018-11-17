const { Command } = require('discord.js-commando');

module.exports = class RollCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'roll',
      aliases: ['die', 'dice'],
      group: 'fun',
      memberName: 'roll',
      description: 'Roll a number between 0-100 or 0-x if given in arguments',
      clientPermissions: ['SEND_MESSAGES'],
      args: [
        {
          key: 'max',
          prompt: 'Maximum roll',
          type: 'integer',
          default: 100
        }
      ]
    });
  }

  run(msg, { max }) {
    if (max > 10000 || max < 1) return msg.channel.send(`Number must be between 1 and 10,000`);
    const roll = Math.round(Math.random() * max);
    msg.reply(`rolled **${roll}**`);
  }
}