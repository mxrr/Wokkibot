const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const winston = require('winston');
const moment = require('moment');
const _ = require('lodash');

module.exports = class UnbanCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'unbanc',
            aliases: ['unbancommand'],
            group: 'mod',
            memberName: 'unbanc',
            description: 'Unban user from using a command',
            details: 'The user must be mentioned for the first argument',
            examples: [`${client.commandPrefix}unbanc @Wokki#0001 play`],
            guildOnly: true,
            clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
            args: [
                {
                    key: 'user',
                    prompt: 'Ban target user',
                    type: 'string'
                },
                {
                    key: 'command',
                    prompt: 'Command to ban',
                    type: 'string'
                }
            ]
        });
    }

    hasPermission(msg) {
        if (msg.author === msg.guild.owner.user) return true;
    }

    async run(msg, { user, command }) {
        user = msg.mentions.users.first(1)[0];
        if (!user) return msg.reply(`You must mention the user for the second argument (E.g. @Wokki#0001)`);

        const unbanEmbed = new MessageEmbed()
            .setColor('#00ff00');

        let cbans = this.client.provider.get(msg.guild.id, "cbans");
        if (cbans) {
            if (_.find(cbans, {"user": user.id, "command": command})) {
                _.remove(cbans, {"user": user.id, "command": command});
                this.client.provider.set(msg.guild.id, "cbans", cbans);
            }
            else {
                unbanEmbed
                    .setDescription(`User **${user.tag}** is **not banned** from using **${this.client.commandPrefix}${command}** on this server. Make sure you wrote the command correctly.`)
                    .setThumbnail(user.displayAvatarURL({ format: 'png' }));
                return msg.channel.send(unbanEmbed);
            }
        }
        else {
            unbanEmbed
                .setDescription(`There are no command bans on this server`);
            return msg.channel.send(unbanEmbed);
        }

        unbanEmbed
            .setTitle('Command ban removed')
            .setDescription(`**${user.tag}** has been unbanned from using command **${this.client.commandPrefix}${command}**.`)
            .setThumbnail(user.displayAvatarURL({ format: 'png' }));

        msg.channel.send(unbanEmbed);
    }
}