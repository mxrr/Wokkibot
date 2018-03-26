const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const winston = require('winston');
const _ = require('lodash');

module.exports = class QueueCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'queue',
            group: 'music',
            memberName: 'queue',
            description: 'View current song queue',
            details: 'Displays a list of songs in the queue for the current guild',
            examples: [`${client.commandPrefix}queue`],
            guildOnly: true
        });
    }

    run(msg) {
        const queue = this.queue.get(msg.guild.id);
        if (!queue) return msg.channel.send(`Queue is empty`);

        const queueEmbed = new MessageEmbed()
            .setColor('#ffa500')
            .setTitle(`Song queue for ${msg.guild.name}`);

        _.each(queue.songs, song => {
            queueEmbed
                .addField('Song', song.title, true)
                .addField('Duration', this.timeString(song.duration), true);
        });

        return msg.channel.send(queueEmbed);
    }

    get queue() {
        if (!this._queue) this._queue = this.client.registry.resolveCommand('music:play').queue;

        return this._queue;
    }

    timeString(seconds, forceHours = false) {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor(seconds % 3600 / 60);

		return `${forceHours || hours >= 1 ? `${hours}:` : ''}${hours >= 1 ? `0${minutes}`.slice(-2) : minutes}:${`0${Math.floor(seconds % 60)}`.slice(-2)}`;
	}
}