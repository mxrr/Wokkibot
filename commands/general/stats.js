const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const winston = require('winston');
const moment = require('moment');
require('moment-duration-format');
const { stripIndents } = require('common-tags');
const si = require('systeminformation');

module.exports = class StatsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'stats',
      aliases: ['statistics'],
      group: 'general',
      memberName: 'stats',
      description: 'View bot stats',
      clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS']
    });
  }

  run(msg) {
    let that = this;

    si.cpuTemperature(function(data) {
      const statsEmbed = new MessageEmbed()
        .setColor('#ffa500')
        .setDescription('**Wokkibot Stats**')
        .addField(`❯ Uptime`, moment.duration(that.client.uptime).format('d[ days], h[ hours], m[ minutes, and ]s[ seconds]'), true)
        .addField(`❯ Memory usage`, `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`, true)
        .addField(`❯ Spying on`, stripIndents`• Guilds: ${that.client.guilds.size}\n• Channels: ${that.client.channels.size}\n• Users: ${that.client.guilds.map(guild => guild.memberCount).reduce((a, b) => a + b)}`, true)
        .addField(`❯ Temperature`, `${data.main} °C`, true)
        .setThumbnail(that.client.user.displayAvatarURL({ format: 'png' }));

      msg.channel.send(statsEmbed);
    });
  }

  timeString(seconds, forceHours = false) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds % 3600 / 60);

    return `${forceHours || hours >= 1 ? `${hours}:` : ''}${hours >= 1 ? `0${minutes}`.slice(-2) : minutes}:${`0${Math.floor(seconds % 60)}`.slice(-2)}`;
	}
}