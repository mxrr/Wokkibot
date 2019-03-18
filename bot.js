const Commando = require('discord.js-commando');
const request = require('superagent');
const winston = require('winston');
const path = require('path');

const { OWNER, TOKEN, PREFIX } = require('./config');

const client = new Commando.Client({
  owner: OWNER,
  commandPrefix: PREFIX
});

client.logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'DD.MM.YYYY HH:mm:ss'
    }),
    winston.format.printf(info => `[${info.timestamp}] ${info.level}: ${info.message}`)
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'wokkibot.log' })
  ]
});

client
  .on('ready', () => {
    client.logger.info('Wokkibot is running');
    client.user.setActivity("Hopefully fixed", { type: "PLAYING" });
  })
  .on('error', client.logger.error)
  .on('warn', client.logger.warn)
  .on('disconnect', () => client.logger.warn('Disconnected'))
  .on('reconnect', () => client.logger.warn('Reconnected'))
  .on('commandRun', (cmd, promise, msg, args) => client.logger.info(`${msg.author.tag} (${msg.author.id}) ran command ${cmd.groupID}:${cmd.memberName}`))
  .on('commandError', (cmd, err) => client.logger.error(`Error occurred when running command ${cmd.groupID}:${cmd.memberName}`, err))
  // Backend updating
  .on('guildUpdate', (oldGuild, newGuild) => {
    request
      .put(`localhost:3000/guild/${oldGuild.id}`)
      .send({ did: newGuild.id, name: newGuild.name, owner: newGuild.ownerID })
      .end((err, res) => {
        if (err) return client.logger.error('Could not update guild to backend', err);
        client.logger.info('Updated guild to backend');
      });
  });

client.registry
  .registerGroups([
    ['music', 'Music commands'],
    ['fun', 'Fun commands'],
    ['mod', 'Moderation commands'],
    ['general', 'General commands']
  ])
  .registerDefaults()
  .registerCommandsIn(path.join(__dirname, 'commands'));

// Set our own unknown command response
client.registry.unknownCommand = client.registry.commands.get('unknown');

client.login(TOKEN);