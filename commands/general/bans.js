const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const winston = require('winston');
const moment = require('moment');
const _ = require('lodash');

module.exports = class BansCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'bans',
            group: 'general',
            memberName: 'bans',
            description: 'View your command bans',
            details: 'List of commands that you are banned from using, or if user mentioned after the command will display the mentioned users bans',
            examples: [`${client.commandPrefix}bans`, `${client.commandPrefix}bans @Wokki#0001`],
            guildOnly: true,
            clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
            args: [
                {
                    key: 'user',
                    prompt: 'User to check bans from',
                    type: 'string',
                    default: ''
                }
            ]
        });
    }

    async run(msg, { user }) {
        if (user === "") user = msg.author;
        else user = msg.mentions.users.first(1)[0];

        let cbans = this.client.provider.get(msg.guild.id, "cbans");
        if (!cbans) return msg.channel.send(`No command bans found.`);

        let banEmbed = new MessageEmbed()
            .setDescription(`**Command bans for ${user.tag}**`)
            .setThumbnail(user.displayAvatarURL({ format: 'png' }));

        let bans = _.filter(cbans, {"user": user.id});
        if (!bans) {
            banEmbed
                .addField('No command bans found', 'You\'re good to go!')
                .setColor('#00ff00');
        }
        else {
            banEmbed
                .setColor('#ff0000');
            _.each(bans, ban => {
                if (moment().diff(moment(ban.duration)) < 0) {
                    banEmbed
                        .addField('Command', ban.command, true)
                        .addField('Banned until', moment(ban.duration).format("d.M.YYYY H:mm:ss"), true);
                }
                if (ban.duration === "0") {
                    banEmbed
                        .addField('Command', ban.command, true)
                        .addField('Banned until', 'Permanently', true);
                }
            });

            if (banEmbed.fields.length === 0) {
                banEmbed
                    .addField('No command bans found', 'You\'re good to go!')
                    .setColor('#00ff00');
            }
        }

        msg.channel.send(banEmbed);
    }
}