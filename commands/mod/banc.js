const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const winston = require('winston');
const moment = require('moment');
const _ = require('lodash');

module.exports = class BanCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'banc',
            group: 'mod',
            memberName: 'banc',
            description: 'Ban user from using a command',
            details: 'The user string requires the user to be mentioned by using the @User#0000. Command to ban should not include the command prefix. Duration must be given in a format number+string, where the string is s for second, m for minute, h for hour, d for day, M (must be capital) for month and y for year. For permanent bans you should use 0 as the duration.',
            examples: [`${client.commandPrefix}banc @Wokki#0001 play 1M`, `${client.commandPrefix}banc @Wokki#0001 play 7d`],
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
                },
                {
                    key: 'duration',
                    prompt: 'Ban duration (Example: 5m = 5 minutes, you can use s,m,h,d,M,y)',
                    type: 'string'
                }
            ]
        });
    }

    hasPermission(msg) {
        if (msg.author === msg.guild.owner.user) return true;
    }

    async run(msg, { user, command, duration }) {
        user = msg.mentions.users.first(1)[0];
        if (!user) return msg.reply(`You must mention the user for the second argument (E.g. @Wokki#0001)`);

        if (user === this.client.user) return msg.reply(`Banning the bot from using commands doens't make sense. The bot does not use commands.`);

        if (this.client.isOwner(user)) {
            if (msg.author === user) {
                winston.info(`The ban is authorized as the author is the target`);
            }
            else {
                return msg.reply(`You can not ban the almighty Wokki`);
            }
        }

        if (duration !== "0") {
            let num = duration.split(/[^0-9]/)[0];
            let exp = duration.split(/[^smhdMy]/)[num.length];
            duration = moment().add(num, exp);
        }

        let cbans = this.client.provider.get(msg.guild.id, "cbans");
        if (cbans) {
            if (_.find(cbans, {"user": user.id, "command": command})) _.remove(cbans, {"user": user.id, "command": command});

            let cban = {
                "user": user.id,
                "command": command,
                "duration": duration
            };
            cbans.push(cban);
            this.client.provider.set(msg.guild.id, "cbans", cbans);
        }
        else {
            let cbans = [
                {
                    "user": user.id,
                    "command": command,
                    "duration": duration
                }
            ];
            this.client.provider.set(msg.guild.id, "cbans", cbans);
        }

        const banEmbed = new MessageEmbed()
            .setColor('#00ff00')        
            .setTitle('Command ban added')
            .addField('User', user.tag, true)
            .addField('Command', `${this.client.commandPrefix}${command}`, true)
            .setThumbnail(user.displayAvatarURL({ format: 'png' }));

        if (duration === "0") banEmbed.addField('Duration', 'Permanently', true);
        else banEmbed.addField('Duration', duration.fromNow(true), true);

        msg.channel.send(banEmbed);
    }
}