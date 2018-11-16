const { Command } = require('discord.js-commando');
const fs = require('fs');

module.exports = class ActivityCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'activity',
      group: 'mod',
      memberName: 'activity',
      description: 'Change bots activity',
      clientPermissions: ['SEND_MESSAGES'],
      args: [
        {
          key: 'type',
          prompt: 'PLAYING, STREAMING, LISTENING or WATCHING',
          type: 'string'
        },
        {
          key: 'activity',
          prompt: 'Enter activity',
          type: 'string'
        }
      ]
    });

    this.environment = process.env.NODE_ENV || "DEVELOPMENT";
  }

  hasPermission(msg) {
    return this.client.isOwner(msg.author);
  }

  run(msg, { activity, type }) {
    const acceptedTypes = ['PLAYING', 'STREAMING', 'LISTENING', 'WATCHING'];

    if (acceptedTypes.includes(type)) {
      let config = require('../../config.json')[this.environment];
      config[this.environment].ACTIVITY.TYPE = type;
      config[this.environment].ACTIVITY.TEXT = activity;

      fs.writeFile('./config.json', JSON.stringify(config, null, 2), (err) => {
        if (err) return [this.client.logger.error(err),msg.channel.send('Could not change activity. More information logged to console.')];

        this.client.user.setActivity(activity, { type: type });
        return msg.channel.send(`Changed my activity to ${type} ${activity}`);
      });
    }
  }
}