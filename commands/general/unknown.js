const { Command } = require('discord.js-commando');

module.exports = class UnknownCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'unknown',
      group: 'general',
      memberName: 'unknown',
      description: 'Unknown command response',
      guildOnly: true
    });
  }

  run(msg) {
    // Do absolutely nothing
    // Later on we'll do check for custom commands here...
  }
}