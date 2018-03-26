const { Command } = require('discord.js-commando');

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
        });
    }

    run(msg) {
        const queue = this.queue.get(msg.guild.id);
        if (!queue) return msg.reply(`There is no song playing`);
        if (!queue.songs[0].dispatcher) return msg.reply(`The song has not even begun yet`);
        if (!queue.songs[0].playing) return msg.reply(`The song is already paused. Use !resume instead.`);
        queue.songs[0].dispatcher.pause();
        queue.songs[0].playing = false;

        return msg.reply(`Song paused. Use !resume to resume.`);
    }

    get queue() {
        if (!this._queue) this._queue = this.client.registry.resolveCommand('music:play').queue;

        return this._queue;
    }
}