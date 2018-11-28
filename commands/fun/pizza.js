const { Command } = require('discord.js-commando');

module.exports = class PizzaCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'pizza',
      group: 'fun',
      memberName: 'pizza',
      description: 'Get random pizza toppings',
      clientPermissions: ['SEND_MESSAGES'],
      args: [
        {
          key: 'amount',
          prompt: 'How many toppings?',
          type: 'integer',
          default: 4
        }
      ]
    });
  }

  run(msg, { amount }) {
    const toppings = require('../../utils/toppings.json');

    let pizza = [];
    for (let i = 0; i < amount; i++) {

      pizza.push(toppings[Math.round(Math.random() * toppings.length)]);
    }

    return msg.channel.send(`Fantasia pizzasi sisältää **${pizza.join(", ")}**`);
  }
}