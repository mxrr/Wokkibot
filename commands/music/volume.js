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

    this.client.db.guilds.findOne({ gid: msg.guild.id }, (err, data) => {
      if (err) return [this.client.logger.error(err),msg.channel.send('An error occurred when trying to fetch guild info. More info logged to console.')];

      if (data) {
        this.client.db.guilds.update({ gid: msg.guild.id }, { $set: { volume: volume } });
      }
      else {
        this.client.db.guilds.insert({ gid: msg.guild.id, volume: volume });
      }

      queue.volume = volume / 100;
      queue.connection.dispatcher.setVolume(volume / 100);

      msg.channel.send(`Volume changed to **${volume}%**`);
    });
  }

  get queue() {
    if (!this._queue) this._queue = this.client.registry.resolveCommand('music:play').queue;

    return this._queue;
  }
}