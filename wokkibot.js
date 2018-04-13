const Commando = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const path = require('path');
const winston = require('winston');
const moment = require('moment');
const _ = require('lodash');
const request = require('request');
const sqlite = require('sqlite');

// Settings
const enviroinment = process.env.NODE_ENV || "DEVELOPMENT";
winston.info(`Running in ${enviroinment} enviroinment`);
const { OWNER } = require('./config');
const { TOKEN, ACTIVITY, ACTIVITY_TYPE, PREFIX } = require('./config')[enviroinment];

// Create commando client
const client = new Commando.Client({
    owner: OWNER,
    commandPrefix: PREFIX,
    unknownCommandResponse: false
});

// Add inhibitor for command bans
client.dispatcher
    .addInhibitor(msg => {
        if (msg.content.startsWith(client.commandPrefix)) {
            const cmd = msg.content.split(" ")[0].split(client.commandPrefix)[1];
            const cbans = client.provider.get(msg.guild.id, "cbans");
            
            if (cbans) {
                let ban = _.find(cbans, {"user": msg.author.id, "command": cmd});
                if (ban) {
                    if (ban.duration === "0") {
                        return [msg.delete(), winston.info(`User ${msg.author.tag} (${msg.author.id}) tried to run command ${cmd} but they are banned from using the command`)];
                    }
                    else if (moment().diff(moment(ban.duration)) < 0) {
                        return [msg.delete(), winston.info(`User ${msg.author.tag} (${msg.author.id}) tried to run command ${cmd} but they are banned from using the command`)];
                    }
                }
            }
        }
    });

// Client listeners
client.once('ready', () => client.user.setActivity(ACTIVITY, { type: ACTIVITY_TYPE }))
    .on('ready', () => winston.info(`Wokkibot is ready`))
    .on('error', winston.error)
    .on('warn', winston.warn)
    .on('message', msg => {
        // Check for custom commands
        if (msg.content.startsWith(client.commandPrefix)) {
            const commands = client.provider.get(msg.guild.id, "commands");
            if (commands) {
                let cmdTxt = msg.content.split(client.commandPrefix)[1];
                let cmd = _.find(commands, { 'command': cmdTxt });
                if (cmd) msg.channel.send(cmd.output);
            }
        }
    })
    .on('disconnect', () => winston.warn(`Disconnected`))
    .on('reconnect', () => winston.warn(`Reconnected`))
    .on('commandRun', (cmd, promise, msg, args) =>  winston.info(`User ${msg.author.tag} (${msg.author.id}) ran command ${cmd.memberName}`))
    .on('commandError', (cmd, err) => winston.error(`Error in command ${cmd.groupID}:${cmd.memberName}`, err));

client.registry
    // Registers your custom command groups
    .registerGroups([
        ['fun', 'Fun commands'],
        ['mod', 'Moderation commands'],
        ['music', 'Music commands'],
        ['general', 'General commands']
    ])

    // Registers all built-in groups, commands, and argument types
    .registerDefaults()

    // Registers all of your commands in the ./commands/ directory
    .registerCommandsIn(path.join(__dirname, 'commands'));

client.setProvider(
    sqlite.open(path.join(__dirname, 'settings.sqlite3')).then(db => new Commando.SQLiteProvider(db))
).catch(winston.error);

client.login(TOKEN);