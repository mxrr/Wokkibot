const { Command } = require('discord.js-commando');
const fs = require('fs');
const _ = require('lodash');

module.exports = class LogsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'logs',
      aliases: ['log'],
      group: 'general',
      memberName: 'logs',
      description: 'View logs',
      clientPermissions: ['SEND_MESSAGES'],
      args: [
        {
          key: 'limit',
          prompt: 'How many?',
          type: 'integer',
          default: 10
        }
      ]
    });
  }

  run(msg, { limit }) {
    if (limit > 25) return msg.channel.send(`Maximum is 25 rows due to message limits in Discord. For more rows the file has to be viewed locally.`);

    this.getLines('./wokkibot.log', (err, lines) => {
      if (err) this.client.logger.error(err);

      lines = _.reverse(lines); // Reverse the lines
      lines = _.take(lines, limit + 1) // Take number of lines

      msg.channel.send(`Last ${limit} rows of logs\n\`\`\`css\n${lines.join("\n")}\`\`\``).catch(e => msg.channel.send(`Could not fetch logs. Try with smaller amount.\n\`\`\`\n${e}\n\`\`\``));
    });
  }

  getLines (filename, callback) {
    let stream = fs.createReadStream(filename, {
      flags: 'r',
      encoding: 'utf-8',
      fd: null,
      mode: 438,
      bufferSize: 64 * 1024
    });

    let data = "";
    let lines = [];

    stream.on('data', (moreData) => {
      data += moreData;
      lines = data.split("\n");
    });

    stream.on('error', () => {
      callback("Error");
    });

    stream.on('end', () => {
      callback(false, lines);
    });
  }
}