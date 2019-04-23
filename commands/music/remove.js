const { Command } = require('discord.js-commando');

module.exports = class RemoveCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'remove',
      group: 'music',
      memberName: 'remove',
      description: 'Remove a song from the queue',
      guildOnly: true,
      clientPermissions: ['SEND_MESSAGES'],
      args: [
        {
          key: 'index',
          prompt: 'Song number in queue',
          type: 'integer'
        }
      ]
    });
  }

  async run(msg, { index }) {
    try {
      const queue = await this.queue.get(msg.guild.id);
      if (!queue) return msg.reply('There are no songs in queue');
  
      if (index <= 1) return msg.reply('You can not remove first song. Use skip instead.');
      if (index > queue.songs.length) return msg.reply('No song with given index');
  
      queue.songs.splice(index - 1, 1);
  
      return msg.channel.send(`Removed song ${index} from queue`);
    }
    catch(error) {
      return [console.error('Remove command error', error),msg.reply('Remove command error')];
    }
  }

  get queue() {
    return this.client.registry.resolveCommand('music:play').queue;
  }
}