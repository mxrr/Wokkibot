const { Command } = require('discord.js-commando');
const winston = require('winston');
const _ = require('lodash');

module.exports = class EditCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'editc',
            group: 'mod',
            memberName: 'editc',
            description: 'Edit a command',
            details: 'Edit a previous added custom command',
            examples: [`${client.commandPrefix}editc hello Hello world!!`],
            guildOnly: true,
            clientPermissions: ['SEND_MESSAGES'],
            args: [
                {
                    key: 'command',
                    prompt: 'Command name',
                    type: 'string'
                },
                {
                    key: 'output',
                    prompt: 'Command output',
                    type: 'string'
                }
            ]
        });
    }

    hasPermission(msg) {
        if (msg.author === msg.guild.owner.user) return true;
    }

    async run(msg, { command, output }) {
        let commands = this.client.provider.get(msg.guild.id, "commands");
        if (commands) {
            if (_.find(commands, {"command": command})) {
                let editCommand = _.find(commands, {"command": command});
                editCommand.output = output;
                this.client.provider.set(msg.guild.id, "commands", commands);
            }
            else {
                return msg.reply(`Could not edit command **${this.client.commandPrefix}${command}** because it was not found.`);
            }
        }
        else {
            return msg.reply(`Could not find any commands. Create commands first.`);
        }

        msg.channel.send(`Command **${this.client.commandPrefix}${command}** edited`);
    }
}