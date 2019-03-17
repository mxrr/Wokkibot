const { Command } = require('discord.js-commando');

module.exports = class SkipCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'skip',
      group: 'music',
      memberName: 'skip',
      description: 'Skip currently playing song',
      guildOnly: true,
      clientPermissions: ['CONNECT', 'SPEAK', 'SEND_MESSAGES']
    });
  }

  async run(msg) {
    const queue = await this.queue.get(msg.guild.id);
    if (!queue) return msg.channel.send(`Nothing is playing`);

    queue.connection.dispatcher.end('Skipped');
    return msg.channel.send('Skipped');
  }

  get queue() {
    if (!this._queue) this._queue = this.client.registry.resolveCommand('music:play').queue;

    return this._queue;
  }
}