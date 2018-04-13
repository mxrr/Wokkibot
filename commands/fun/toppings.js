const { Command } = require('discord.js-commando');
const winston = require('winston');
const _ = require('lodash');

module.exports = class ToppingsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'toppings',
            group: 'fun',
            memberName: 'toppings',
            description: 'Add, remove or view pizza toppings in this server',
            details: 'Add, remove or view toppings that are set for this server',
            examples: [`${client.commandPrefix}toppings add kebab`, `${client.commandPrefix}toppings view`],
            guildOnly: true,
            clientPermissions: ['SEND_MESSAGES'],
            args: [
                {
                    key: 'method',
                    prompt: 'Add, remove or view',
                    type: 'string'
                },
                {
                    key: 'topping',
                    prompt: 'Which topping should we add/remove?',
                    type: 'string',
                    default: ''
                }
            ]
        });
    }

    async run(msg, { method, topping }) {
        let serverToppings = this.client.provider.get(msg.guild.id, "pizzaToppings", []);
        topping = topping.toLowerCase();

        if (method === "add") {
            if (topping === "") return msg.channel.send(`The topping can not be blank`);
            if (_.includes(serverToppings, topping)) return msg.channel.send(`${topping} is already in the server toppings`);
            serverToppings.push(topping);
            this.client.provider.set(msg.guild.id, "pizzaToppings", serverToppings);
            msg.channel.send(`${topping} has been added to the toppings list`);
        }
        else if (method === "remove") {
            if (topping === "") return msg.channel.send(`The topping can not be blank`);
            if (!_.includes(serverToppings, topping)) return msg.channel.send(`${topping} is not in the server toppings, nothing to remove`);
            _.pull(serverToppings, topping);
            this.client.provider.set(msg.guild.id, "pizzaToppings", serverToppings);
            msg.channel.send(`${topping} has been removed from the toppings list`);
        }
        else if (method === "view") {
            msg.channel.send(`Toppings in this server: ${serverToppings.join(', ')}`);
        }
        else {
            msg.channel.send(`${method} is not a valid argument for method. Use **add, remove or view**.`);
        }
    }
}