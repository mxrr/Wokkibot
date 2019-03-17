const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class ClearCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'clear',
      group: 'mod',
      memberName: 'clear',
      description: 'Clear messages from channel',
      guildOnly: true,
      clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES', 'EMBED_LINKS'],
      userPermissions: ['MANAGE_MESSAGES'],
      args: [
        {
          key: 'limit',
          prompt: 'How many messages should be deleted?',
          type: 'integer'
        }
      ]
    });
  }

  async run(msg, { limit }) {
    await msg.channel.messages.fetch({ limit: limit + 1 }).then(messages => {
      msg.channel.bulkDelete(messages.array().reverse()).then(msgs => {
        const embed = new MessageEmbed()
          .setColor('#00ff1d')
          .setTitle('Clear')
          .setDescription(`Deleted ${msgs.size - 1} messages`)
          .setFooter('This message will be deleted automatically in 5 seconds');
        
        msg.channel.send(embed).then(msg => msg.delete({ timeout: 5000 }));
      }).catch(err => {
        return [this.client.logger.error(err),msg.channel.send('Could not bulk delete messages. More information logged to console.')];
      });
    }).catch(err => {
      return [this.client.logger.error(err),msg.channel.send('Could not fetch messages. More information logged to console.')];
    });
  }
}