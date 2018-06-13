const { Command } = require('discord.js-commando');
const winston = require('winston');

module.exports = class SkipCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'skip',
            aliases: ['stop'],
            group: 'music',
            memberName: 'skip',
            description: 'Skip currently playing song',
            details: 'Skips the song and starts playing the next song in the queue if there is any',
            examples: [`${client.commandPrefix}skip`],
            guildOnly: true,
            clientPermissions: ['SEND_MESSAGES']
        });
    }

    async run(msg) {
        const queue = await this.queue.get(msg.guild.id);
        if (!msg.member.voiceChannel) return msg.reply(`You must be in a voice channel to skip a song`);
        if (!queue) return msg.channel.send(`There is nothing playing to skip`);

        queue.connection.dispatcher.end(`Song skipped`);
        msg.channel.send(`Song skipped`);
        return undefined;
    }

    get queue() {
        if (!this._queue) this._queue = this.client.registry.resolveCommand('music:play').queue;

        return this._queue;
    }
}