/*
    Send 1 embed with a list of all streamers and their status, even if they are offline
    Example:

    sodapoppin      🔴 LIVE
    LIRIK           🔴 LIVE
    summit1g        🔴 LIVE
    Greekgodx       OFFLINE
    
    Same for YouTube
*/

const { MessageEmbed } = require('discord.js');
const request = require('request');
const winston = require('winston');
const moment = require('moment');
const _ = require('lodash');
const { TWITCH_CLIENT_ID, GOOGLE_API_KEY } = require('../config');

exports.checkTwitch = async function(client) {
    if (TWITCH_CLIENT_ID === "") return winston.info(`TWITCH_CLIENT_ID is not defined`);

    client.guilds.forEach(guild => {
        let channel = client.provider.get(guild.id, "streamsChannel");
        let message = client.provider.get(guild.id, "message");
        let streamers = client.provider.get(guild.id, "twitch");

        if (!channel || !streamers) return;
        channel = guild.channels.find('id', channel);

        if (!message) channel.send(`Streams placeholder...`).then(msg => {
            winston.info(`Message does not exist so we're creating it`);
            client.provider.set(guild.id, "message", msg.id);
            message = msg.id;
        });

        channel.messages.fetch(message)
            .then(message => {
                let url = "https://api.twitch.tv/helix/streams";
                for (let i = 0; i < streamers.length; i++) {
                    if (i === 0) url += `?user_login=${streamers[i].user}`;
                    else url += `&user_login=${streamers[i].user}`;
                }
        
                _.each(streamers, streamer => {
                    streamer.status = "OFFLINE";
                });
        
                request({
                    headers: {
                        'Client-ID': TWITCH_CLIENT_ID
                    },
                    uri: url,
                    method: 'GET'
                }, (err, res, body) => {
                    if (err) return winston.error(err);
                    let result = JSON.parse(body);
            
                    _.each(result.data, stream => {
                        let streamer = _.find(streamers, { "id": stream.user_id });
                        streamer.status = "ONLINE";
                    });
        
                    let liveEmbed = new MessageEmbed()
                        .setColor('#00ff00')
                        .setTitle('Twitch Streamers');

                    _.each(streamers, streamer => {
                        if (streamer.status === "ONLINE") {
                            liveEmbed.addField("Streamer", streamer.user, true);
                            liveEmbed.addField("Status", `[🔴 LIVE](https://www.twitch.tv/${streamer.user})`, true);
                        }
                        else {
                            liveEmbed.addField("Streamer", streamer.user, true);
                            liveEmbed.addField("Status", `OFFLINE`, true);
                        }
                        liveEmbed.addBlankField();
                    });

                    message.edit(`Last check: ${moment().format('DD.MM.YYYY H:mm:ss')}`, { embed: liveEmbed });
                });
            })
            .catch(winston.error);
    });
}