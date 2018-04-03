const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const winston = require('winston');
const moment = require('moment');
require('moment-duration-format');
const { stripIndents } = require('common-tags');

module.exports = class StatsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'stats',
            aliases: ['statistics'],
            group: 'general',
            memberName: 'stats',
            description: 'View bot stats',
            details: 'Display bots uptime, memory usage and list of guilds, channels and users it is listening to',
            examples: [`${client.commandPrefix}stats`],
            guildOnly: true,
            clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS']
        });
    }

    async run(msg) {
        const statsEmbed = new MessageEmbed()
            .setColor('#ffa500')
            .setDescription('**Wokkibot Stats**')
            .addField('❯ Uptime', moment.duration(this.client.uptime).format('d[ days], h[ hours], m[ minutes, and ]s[ seconds]'), true)
            .addField('❯ Memory usage', `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`, true)
            .addField('❯ Spying on', stripIndents`• Guilds: ${this.client.guilds.size}\n• Channels: ${this.client.channels.size}\n• Users: ${this.client.guilds.map(guild => guild.memberCount).reduce((a, b) => a + b)}`, true)
            .setThumbnail(this.client.user.displayAvatarURL({ format: 'png' }));
        
        msg.channel.send(statsEmbed);
    }

    timeString(seconds, forceHours = false) {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor(seconds % 3600 / 60);

		return `${forceHours || hours >= 1 ? `${hours}:` : ''}${hours >= 1 ? `0${minutes}`.slice(-2) : minutes}:${`0${Math.floor(seconds % 60)}`.slice(-2)}`;
	}
}