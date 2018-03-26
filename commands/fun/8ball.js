const { Command } = require('discord.js-commando');
const winston = require('winston');

module.exports = class EightballCommand extends Command {
    constructor(client) {
        super(client, {
            name: '8ball',
            group: 'fun',
            memberName: '8ball',
            description: 'Ask 8ball a question',
            details: 'Enter a question query for 8ball to answer to from it\'s list of answers',
            examples: [`${client.commandPrefix}8ball Is Kaepis gay?`],
            guildOnly: true,
            args: [
                {
                    key: 'question',
                    prompt: 'Enter your question',
                    type: 'string'
                }
            ]
        });
    }

    async run(msg, { question }) {
        const responses = [
            'it is certain',
            'it is decidedly so',
            'without a doubt',
            'yes — definitely',
            'you may rely on it',
            'as I see it, yes',
            'most likely',
            'outlook good',
            'yes',
            'signs point to yes',
            'reply hazy, try again',
            'ask again later',
            'better not tell you now',
            'cannot predict now',
            'concentrate and ask again',
            'don’t count on it',
            'my reply is no',
            'my sources say no',
            'outlook not so good',
            'very doubtful'
        ];

        if (!question) return msg.reply(`You must ask a question`);
        let answer = responses[Math.floor(responses.length * Math.random())];
        msg.reply(`8ball says, ${answer}`);
    }
}