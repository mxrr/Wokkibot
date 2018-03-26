const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const winston = require('winston');

module.exports = class ClearCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'clear',
            aliases: ['clean', 'delete'],
            group: 'mod',
            memberName: 'clear',
            description: 'Clear messages from chat',
            details: 'Delete number of messages from the channel the message was posted in',
            examples: [`${client.commandPrefix}clear 10`],
            guildOnly: true,
            clientPermissions: ['MANAGE_MESSAGES'],
            userPermissions: ['MANAGE_MESSAGES'],
            args: [
                {
                    key: 'limit',
                    prompt: 'How many messages should I delete?',
                    type: 'integer'
                }
            ]
        });
    }

    async run(msg, { limit }) {
        limit = limit + 1;
        const messagesToDelete = await msg.channel.messages.fetch({ limit }).catch(err => null);
        msg.channel.bulkDelete(messagesToDelete.array().reverse()).catch(err => null);

        const resultEmbed = new MessageEmbed()
            .setColor('#00ff1d')
            .setTitle('Success!')
            .setDescription(`${msg.author.tag} deleted ${limit - 1} posts`);
        
        msg.channel.send(resultEmbed).then(msg => msg.delete({ timeout: 5000 }));
    }
}