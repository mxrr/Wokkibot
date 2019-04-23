const { Command } = require('discord.js-commando');

module.exports = class VolumeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'volume',
      group: 'music',
      memberName: 'volume',
      description: 'Change dispatcher volume',
      clientPermissions: ['SEND_MESSAGES'],
      guildOnly: true,
      args: [
        {
          key: 'volume',
          prompt: 'Volume percentage (1-100%)',
          type: 'integer'
        }
      ]
    });
  }

  async run(msg, { volume }) {
    try {
      const queue = await this.queue.get(msg.guild.id);
      if (!queue) return msg.reply('There are no songs in queue');

      if (volume < 1 || volume > 100) return msg.reply('Only use volume between 1 and 100');

      queue.connection.dispatcher.setVolume(volume / 100);
      return msg.reply(`Volume set to ${volume}%`);
    }
    catch(error) {
      return [console.error('Volume error', error),msg.reply('Volume error')];
    }
  }

  get queue() {
    return this.client.registry.resolveCommand('music:play').queue;
  }
}