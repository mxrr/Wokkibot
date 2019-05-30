const { Command } = require('discord.js-commando');

module.exports = class WowCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'wow',
      group: 'general',
      memberName: 'wow',
      description: 'Get time until WoW Classic release',
      guildOnly: false,
      clientPermissions: ['SEND_MESSAGES']
    });
  }

  run(msg) {
    const target = new Date('8/27/2019');
    const difference = target.getTime() - new Date().getTime();

    msg.reply(`${this.getDays(difference / 1000)} days, ${this.getHours(difference / 1000)} hours, ${this.getMinutes(difference / 1000)} minutes, ${this.getSeconds(difference / 1000)} seconds until WoW Classic`);
  }

  getDays(seconds) {
    const days = Math.floor(seconds / 86400);
    return days;
  }
  
  getHours(seconds) {
    const hours = Math.floor(seconds % 86400 / 3600);
    return hours;
  }
  
  getMinutes(seconds) {
    const minutes = Math.floor(seconds % 3600 / 60);
    return minutes;
  }
  
  getSeconds(seconds) {
    return Math.floor(seconds % 60);
  }
}