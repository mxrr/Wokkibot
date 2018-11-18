const { Command } = require('discord.js-commando');

module.exports = class RollCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'iq',
      group: 'fun',
      memberName: 'iq',
      description: 'How high is your IQ',
      clientPermissions: ['SEND_MESSAGES'],
      args: [
        {
          key: 'user',
          prompt: 'User to check IQ from',
          type: 'string',
          default: ''
        }
      ]
    });
  }

  run(msg, { user }) {
    // Get user data
    user = user ? msg.mentions.users.first(1)[0] : msg.author;

    let randomIQ = Math.floor(this.random() * 200 + 100) + 1;

    this.client.db.users.findOne({ did: user.id }, (err, data) => {
      if (err) return this.client.logger.error(err);

      if (data) {
        msg.channel.send(`${user.tag}'s IQ is **${data.iq}**`);
      }
      else {
        let row = {
          did: msg.author.id,
          iq: randomIQ
        };
  
        this.client.db.users.insert(row);

        msg.channel.send(`${user.tag}'s IQ is **${randomIQ}**`);
      }
    });
  }

  random() {
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