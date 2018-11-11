const { Command } = require('discord.js-commando');
const _ = require('lodash');
const fs = require('fs');

module.exports = class HighScoreCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'highscore',
            group: 'fun',
            memberName: 'highscore',
            description: 'View IQ highscore',
            guildOnly: true,
            clientPermissions: ['SEND_MESSAGES']
        });
    }

    async run(msg) {
      let iqList = JSON.parse(fs.readFileSync('./iqlist.json', 'utf8'));
      iqList = _.orderBy(iqList, ['season1'], ['desc']);

      let top10 = "";
      _.forEach(iqList, iq => {
        top10 += `${iq.name} - ${iq.season1}\n`;
      });

      msg.channel.send(`**Season 1**\n${top10}`);
    }
}