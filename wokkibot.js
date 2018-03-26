const Commando = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const path = require('path');
const winston = require('winston');
const moment = require('moment');
const _ = require('lodash');
const request = require('request');

// Stream notifications
const streams = require('./util/streams.js');

// MySQL
const MySQL = require('mysql2/promise');
const MySQLProvider = require('discord.js-commando-mysqlprovider');

// Settings
const { OWNER, TOKEN, DEVTOKEN, PREFIX, ACTIVITY, PRODUCTION,
        HOST, USER, DB, PASS,
        DEVHOST, DEVUSER, DEVDB, DEVPASS } = require('./config');

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
client.once('ready', () => {
        client.user.setActivity(ACTIVITY);
    })
    .on('ready', () => {
        winston.info(`Wokkibot is ready`);
    })
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
    .on('commandRun', (cmd, promise, msg, args) => {
        winston.info(`User ${msg.author.tag} (${msg.author.id}) ran command ${cmd.memberName}`);
    })
    .on('commandError', (cmd, err) => {
        winston.error(`Error in command ${cmd.groupID}:${cmd.memberName}`, err);
    });

client.registry
    // Registers your custom command groups
    .registerGroups([
        ['fun', 'Fun commands'],
        ['mod', 'Moderation commands'],
        ['music', 'Music commands'],
        ['general', 'General commands'],
        ['streams', 'Stream nofitication related commands']
    ])

    // Registers all built-in groups, commands, and argument types
    .registerDefaults()

    // Registers all of your commands in the ./commands/ directory
    .registerCommandsIn(path.join(__dirname, 'commands'));

// Send requests to twitch and youtube every 2 minutes to check if channels are live
setInterval(() => {
    streams.checkTwitch(client);
    streams.checkYoutube(client);
}, 120000);

// Run clearOldIds function every day to check for stream ID's that were sent > 2 days ago
setInterval(() => {
    streams.clearOldIds();
}, 86400000);

// Create MySQL connection
MySQL.createConnection({
    host: PRODUCTION ? HOST : DEVHOST,
    user: PRODUCTION ? USER : DEVUSER,
    password: PRODUCTION ? PASS : DEVPASS,
    database: PRODUCTION ? DB : DEVDB
}).then((db) => {
    client.setProvider(new MySQLProvider(db));
    client.login(PRODUCTION ? TOKEN : DEVTOKEN);
});