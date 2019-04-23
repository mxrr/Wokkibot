const { Command } = require('discord.js-commando');

module.exports = class AvatarCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'avatar',
      group: 'mod',
      memberName: 'avatar',
      description: 'Change bot avatar',
      clientPermissions: ['SEND_MESSAGES'],
      args: [
        {
          key: 'url',
          prompt: 'URL to avatar',
          type: 'string'
        }
      ]
    });
  }

  hasPermission(msg) {
    return this.client.isOwner(msg.author);
  }

  run(msg, { url }) {
    this.client.user.setAvatar(url)
      .then(user => {
        this.client.logger.info('Avatar changed');
        msg.channel.send('Avatar changed');
      })
      .catch(e => {
        this.client.logger.error(e);
        msg.channel.send('Avatar change failed. More info logged to console.');
      });
  }
}