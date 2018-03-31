const { Command } = require('discord.js-commando');
const winston = require('winston');

module.exports = class VolumeCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'volume',
            group: 'music',
            memberName: 'volume',
            description: 'Change current song volume',
            details: 'Set the current songs volume between 0% and 100%',
            examples: [`${client.commandPrefix}volume 50`],
            guildOnly: true,
            clientPermissions: ['SEND_MESSAGES'],
            args: [
                {
                    key: 'volume',
                    prompt: 'Enter volume',
                    type: 'integer'
                }
            ]
        });
    }

    run(msg, { volume }) {
        const queue = this.queue.get(msg.guild.id);
        if (!msg.member.voiceChannel) return msg.reply(`You must be in a voice channel to skip a song`);
        if (!queue) return msg.channel.send(`There is nothing playing`);

        if (volume > 100) return msg.channel.send(`Volume can not be higher than 100%`);
        if (volume < 1) return msg.channel.send(`Volume can't be lower than 1`);

        queue.connection.dispatcher.setVolumeLogarithmic((volume / 20) / 5);
        return msg.channel.send(`Volume changed to **${volume}%**`);
    }

    get queue() {
        if (!this._queue) this._queue = this.client.registry.resolveCommand('music:play').queue;

        return this._queue;
    }
}