const { Command } = require('discord.js-commando');
const winston = require('winston');
const _ = require('lodash');

module.exports = class AddCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'addc',
            group: 'mod',
            memberName: 'addc',
            description: 'Add a command to the guild',
            details: `Add a custom command to the guild that will be triggered by using ${client.commandPrefix}command`,
            examples: [`${client.commandPrefix}addc hello Hello world!`],
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
        if (this.client.registry.commands.find("name", command)) return msg.reply(`Can not replace existing commands with a custom command`);

        let commands = this.client.provider.get(msg.guild.id, "commands");
        if (commands) {
            if (_.find(commands, {"command": command})) return msg.reply(`Command ${command} already exists. Use ${this.client.commandPrefix}editc to edit the command instead.`);
            let cmd = {
                "command": command,
                "output": output
            };
            commands.push(cmd);
            this.client.provider.set(msg.guild.id, "commands", commands);
        }
        else {
            let commands = [
                {
                    "command": command,
                    "output": output
                }
            ];
            this.client.provider.set(msg.guild.id, "commands", commands);
        }

        msg.channel.send(`Command **${this.client.commandPrefix}${command}** created`);
    }
}