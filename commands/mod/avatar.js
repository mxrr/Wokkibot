const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const winston = require('winston');

module.exports = class AvatarCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'avatar',
            aliases: ['setavatar'],
            group: 'mod',
            memberName: 'avatar',
            description: 'Change bot avatar',
            details: 'Enter a link after the command. The image must meet discords avatar requirements and formats',
            examples: [`${client.commandPrefix}avatar https://i.imgur.com/UC1tlQB.png`],
            guildOnly: true,
            args: [
                {
                    key: 'url',
                    prompt: 'Enter URL to new avatar',
                    type: 'string'
                }
            ]
        });
    }

    hasPermission(msg) {
        return this.client.isOwner(msg.author);
    }

    run(msg, { url }) {
        msg.client.user.setAvatar(url)
            .then(user => {
                winston.info(`Avatar changed`);
                const resultEmbed = new MessageEmbed()
                    .setColor('#00ff00')
                    .setTitle('Avatar changed')
                    .setThumbnail(url);
                msg.channel.send(resultEmbed);
            })
            .catch(winston.error);
    }
}