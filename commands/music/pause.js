const { Command } = require('discord.js-commando');
const winston = require('winston');

module.exports = class PauseCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'pause',
            group: 'music',
            memberName: 'pause',
            description: 'Pauses current song',
            details: 'Pause the currently playing song and resume it by using the resume command',
            examples: [`${client.commandPrefix}pause`],
            guildOnly: true,
            clientPermissions: ['SEND_MESSAGES']
        });
    }

    run(msg) {
        const queue = this.queue.get(msg.guild.id);
        if (!msg.member.voiceChannel) return msg.reply(`You must be in a voice channel to pause a song`);
        if (!queue) return msg.channel.send(`There is nothing playing to pause`);
        if (!queue.connection.dispatcher || !queue.connection.speaking) return msg.reply(`Song can not be paused before it has started`);

        if (queue.connection.dispatcher.paused) return msg.reply(`The song is already paused. Use resume instead.`);
        else queue.connection.dispatcher.pause();

        return msg.reply(`Song paused`);
    }

    get queue() {
        if (!this._queue) this._queue = this.client.registry.resolveCommand('music:play').queue;

        return this._queue;
    }
}