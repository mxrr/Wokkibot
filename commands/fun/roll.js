const { Command } = require('discord.js-commando');
const winston = require('winston');

module.exports = class RollCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'roll',
            group: 'fun',
            memberName: 'roll',
            description: 'Roll a number',
            details: 'Roll regularly 0-100 or by giving a value to set max roll',
            examples: [`${client.commandPrefix}roll`, `${client.commandPrefix}roll 50`],
            guildOnly: true,
            clientPermissions: ['SEND_MESSAGES'],
            args: [
                {
                    key: 'max',
                    prompt: 'Maximum roll',
                    type: 'integer',
                    default: 0
                }
            ]
        });
    }

    run(msg, { max }) {
        const rollMax = max ? max : 100;
        msg.reply(`You rolled **${Math.round(Math.random() * (rollMax - 0) + 0)}**!`);
    }
}