const { Command } = require('discord.js-commando');
const winston = require('winston');
const _ = require('lodash');

module.exports = class PizzaCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'pizza',
            group: 'fun',
            memberName: 'pizza',
            description: 'Get random pizza toppings',
            details: 'Get random pizza toppings from an array of toppings in random order. Maximum toppings is the amount of toppings in the array. If there are more than 50 toppings in the array, toppings will be split into several messages.',
            examples: [`${client.commandPrefix}pizza 4`],
            guildOnly: true,
            clientPermissions: ['SEND_MESSAGES'],
            args: [
                {
                    key: 'numToppings',
                    prompt: 'Kuinka monta täytettä?',
                    type: 'integer'
                }
            ]
        });
    }

    async run(msg, { numToppings }) {
        if (numToppings <= 0) return msg.reply(`Tee sudoku homo. Tai tilaa pizzas ilman täytteitä.`);

        let toppings = [
            "kinkku", "kebab", "ananas", "salami", "pepperoni", "aurajuusto", "herkkusieni",
            "fetajuusto", "tuplajuusto", "smetana", "BBQ-kastike", "simpukka", "anjovis",
            "oliivi", "sipuli", "paprika", "tonnikala", "mozzarellajuusto", "jauheliha",
            "tomaatti", "kananmuna", "kana", "katkarapu", "jalapeno", "pekoni"
        ];

        if (numToppings > toppings.length) numToppings = toppings.length;

        let setti = await [];

        while(setti.length < numToppings) {
            let topping = toppings[Math.floor((Math.random() * toppings.length))];
            if (!_.includes(setti, topping)) {
                setti.push(topping);
            }
        }

        if (setti.length > 50) {
            let setit = _.chunk(setti, 50);
            msg.reply(`Tilaat pizzan, jonka täytteet ovat:`);

            for (var i = 0; i < setit.length; i++) {
                msg.channel.send(`**${setit[i].join(", ")}**`);
            }
        }
        else {
            msg.reply(`Tilaat pizzan jonka täytteet ovat: **${setti.join(", ")}**`);
        }
    }
}