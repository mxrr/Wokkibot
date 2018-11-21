const { Command } = require('discord.js-commando');

module.exports = class VolumeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'volume',
      group: 'music',
      memberName: 'volume',
      description: 'Change volume of songs for this guild',
      guildOnly: true,
      clientPermissions: ['CONNECT', 'SPEAK', 'SEND_MESSAGES'],
      args: [
        {
          key: 'volume',
          prompt: 'Enter volume',
          type: 'integer'
        }
      ]
    });
  }

  async run(msg, { volume }) {
    if (volume > 200 || volume < 1) return msg.channel.send('Volume has to be between 1 and 200');

    const queue = await this.queue.get(msg.guild.id);

    this.client.db.updateGuild(msg.guild.id, "volume", volume)
      .then(() => {
        queue.volume = volume / 100;
        queue.connection.dispatcher.setVolume(volume / 100);
  
        msg.channel.send(`Volume changed to **${volume}%**`);
      })
      .catch(e => {
        queue.volume = volume / 100;
        queue.connection.dispatcher.setVolume(volume / 100);
  
        msg.channel.send(`An error occurred and we were unable to save volume for this server. The volume has still been adjusted for currently playing song. More information logged to console.\nVolume changed to **${volume}%**`);
        return this.client.logger.error(e);
      });
  }

  get queue() {
    if (!this._queue) this._queue = this.client.registry.resolveCommand('music:play').queue;

    return this._queue;
  }
}