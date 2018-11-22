const { Command } = require('discord.js-commando');

module.exports = class HighScoreCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'highscore',
      group: 'fun',
      memberName: 'highscore',
      description: 'Get IQ highscore',
      clientPermissions: ['SEND_MESSAGES']
    })
  }

  run(msg) {
    let highscores = [];
    this.client.db.getUsers()
      .then(data => {
        data.forEach(user => {
          highscores.push({ name: msg.guild.members.get(user.did).user.username, iq: user.iq })
        });

        highscores.sort((a, b) => a.iq > b.iq);
        highscores.reverse();
        highscores = highscores.slice(0, 10);

        msg.channel.send(`**Highscore**\n${highscores.map(user => `${user.name} - ${user.iq}`).join("\n")}`);
      })
      .catch(e => {
        return [this.client.logger.error(e),msg.channel.send('An error occurred. More information logged to console.')];
      });
  }
}