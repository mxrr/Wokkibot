const { Command } = require('discord.js-commando');
const _ = require('lodash');
const fs = require('fs');

module.exports = class IQCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'iq',
            group: 'fun',
            memberName: 'iq',
            description: 'Get your IQ',
            guildOnly: true,
            clientPermissions: ['SEND_MESSAGES'],
            args: [
                {
                    key: 'user',
                    prompt: 'Whose account age are we checking?',
                    type: 'string',
                    default: ''
                }
            ]
        });

        this.spareRandom = null;
    }

    async run(msg, { user }) {
        if (user === "") user = msg.author;
        else user = msg.mentions.users.first(1)[0];

        let gayChance = Math.floor(Math.random() * 100) + 1;

        if (gayChance == 1) {
          msg.reply(`Ai oot homo vai?`);
        }
        else {
          let iqList = JSON.parse(fs.readFileSync('./iqlist.json', 'utf8'));

          if (_.find(iqList, { id: user.id })) {
            const userIq = _.find(iqList, { id: user.id });
            msg.channel.send(`**${user.username}**'s IQ is ${userIq.season1}`);
          }
          else {
            const youStupidFuck = Math.floor(this.normalRandom() * 200 + 100) + 1;

            iqList.push({
              "name": user.username,
              "id": user.id,
              "season1": youStupidFuck
            });

            fs.writeFile('./iqlist.json', JSON.stringify(iqList, null, 2), function (err) {
              if (err) return msg.channel.send(err);
            });

            msg.channel.send(`**${user.username}**'s IQ is ${youStupidFuck}`);
          }
        }
    }

    normalRandom() {
        var val, u, v, s, mul;

        if(this.spareRandom !== null) {
            val = this.spareRandom;
            this.spareRandom = null;
        }
        else {
            do {
                u = Math.random()*2-1;
                v = Math.random()*2-1;
    
                s = u*u+v*v;
            } while(s === 0 || s >= 1);
    
            mul = Math.sqrt(-2 * Math.log(s) / s);
    
            val = u * mul;
            this.spareRandom = v * mul;
        }
        
        return val / 14;
    }
}