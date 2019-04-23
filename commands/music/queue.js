const { Command } = require('discord.js-commando');

module.exports = class QueueCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'queue',
      group: 'music',
      memberName: 'queue',
      description: 'View queue',
      guildOnly: true,
      clientPermissions: ['SEND_MESSAGES']
    });
  }

  async run(msg) {
    const queue = await this.queue.get(msg.guild.id);
    if (!queue) return msg.channel.send(`Queue is empty`);

    return msg.channel.send(`**Queue (${queue.songs.length})**\n\`\`\`\n${queue.songs.join("\n")}\n\`\`\``);
  }

  get queue() {
    if (!this._queue) this._queue = this.client.registry.resolveCommand('music:play').queue;

    return this._queue;
  }
}