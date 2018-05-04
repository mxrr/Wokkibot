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
            clientPermissions: ['SEND_MESSAGES']
        });
    }

    run(msg) {
        const queue = this.queue.get(msg.guild.id);
        if (!queue) return msg.reply(`The song is not paused`);
        if (!queue.connection.dispatcher || !queue.connection.speaking) return msg.reply(`Song can not be resumed before it has started`);

        if (!queue.connection.dispatcher.paused) return msg.reply(`The song is currently playing. Use pause instead.`);
        else queue.connection.dispatcher.resume();

        return msg.reply(`Song resumed`);
    }

    get queue() {
        if (!this._queue) this._queue = this.client.registry.resolveCommand('music:play').queue;

        return this._queue;
    }
}