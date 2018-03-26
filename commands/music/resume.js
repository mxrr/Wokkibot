const { Command } = require('discord.js-commando');

module.exports = class ResumeCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'resume',
            group: 'music',
            memberName: 'resume',
            description: 'Resumes current song',
            details: 'Resume a song if it is already paused',
            examples: [`${client.commandPrefix}resume`],
            guildOnly: true,
        });
    }

    run(msg) {
        const queue = this.queue.get(msg.guild.id);
        if (!queue) return msg.reply(`The song is not paused`);
        if (!queue.songs[0].dispatcher) {
            return msg.reply(`The song has not yet begun`);
        }
        if (queue.songs[0].playing) return msg.reply(`The song is currently playing. Use !pause instead.`);
        queue.songs[0].dispatcher.resume();
        queue.songs[0].playing = true;

        return msg.reply(`Song resumed`);
    }

    get queue() {
        if (!this._queue) this._queue = this.client.registry.resolveCommand('music:play').queue;

        return this._queue;
    }
}