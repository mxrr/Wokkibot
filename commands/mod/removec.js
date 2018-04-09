const { Command } = require('discord.js-commando');
const winston = require('winston');
const _ = require('lodash');

module.exports = class RemoveCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'removec',
            aliases: ['removecommand'],
            group: 'mod',
            memberName: 'removec',
            description: 'Remove a command from the guild',
            details: 'Remove a custom command from the guild',
            examples: [`${client.commandPrefix}removec hello`],
            guildOnly: true,
            clientPermissions: ['SEND_MESSAGES'],
            args: [
                {
                    key: 'command',
                    prompt: 'Command name',
                    type: 'string'
                }
            ]
        });
    }

    hasPermission(msg) {
        const adminRole = this.client.provider.get(msg.guild.id, "adminRole");
        if (adminRole) {
            if (msg.member.roles.find('id', adminRole)) return true;
            else return false;
        }
        else {
            if (msg.author === msg.guild.owner.user) return true;
            else return this.client.isOwner(msg.author);
        }
    }

    async run(msg, { command }) {
        let commands = this.client.provider.get(msg.guild.id, "commands");
        if (commands) {
            if (_.find(commands, {"command": command})) {
                _.remove(commands, {"command": command});
                this.client.provider.set(msg.guild.id, "commands", commands);
            }
            else {
                return msg.reply(`Could not delete command **${this.client.commandPrefix}${command}** because it was not found.`);
            }
        }
        else {
            return msg.reply(`Could not find any commands. Create commands first.`);
        }

        msg.channel.send(`Command **${this.client.commandPrefix}${command}** removed`);
    }
}