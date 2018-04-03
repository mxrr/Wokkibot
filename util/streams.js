const Commando = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const request = require('request');
const winston = require('winston');
const moment = require('moment');
const _ = require('lodash');
const { TWITCH_CLIENT_ID, GOOGLE_API_KEY } = require('../config');

exports.checkTwitch = async function(client) {
    if (TWITCH_CLIENT_ID === "") return winston.error(`Tried to check twitch channels but Twitch API key is not defined`);

    let sentTwitchStreams = client.provider.get("global", "twitchSent", []);
    let streamsList = client.provider.get("global", "twitch", []);

    let url = "https://api.twitch.tv/helix/streams";
    for (let i = 0; i < streamsList.length; i++) {
        if (i === 0) url += `?user_login=${streamsList[i].user}`;
        else url += `&user_login=${streamsList[i].user}`;
    }

    await request({
        headers: {
            'Client-ID': TWITCH_CLIENT_ID
        },
        uri: url,
        method: 'GET'
    }, (err, res, body) => {
        if (err) return winston.error(err);
        let status = JSON.parse(body);

        _.each(status.data, stream => {
            if (_.find(sentTwitchStreams, { "id": stream.id })) return;
            let streamer = _.find(streamsList, { "id": stream.user_id });
            winston.info(`Twitch streamer ${streamer.user} (${streamer.id}) has gone live. Sending notifications.`);

            _.each(streamer.guilds, g => {
                let guild = client.guilds.find('id', g);
                if (!guild) return;

                const notificationChannelID = client.provider.get(guild.id, "notifications");
                if (!notificationChannelID) return;

                let channel = guild.channels.find('id', notificationChannelID);
                if (!channel) return;

                let liveEmbed = new MessageEmbed()
                    .setColor('#00ff00')
                    .setTitle(`${streamer.user} is live!`)
                    .setDescription(`**Title:** [${stream.title}](https://www.twitch.tv/${streamer.user})\n**Started at:** ${moment(stream.started_at).format("D.M.YYYY H:mm:ss")}\n**Viewers:** ${stream.viewer_count}`)
                    .setImage(stream.thumbnail_url.replace('{width}', '352').replace('{height}', '240'));
                channel.send(liveEmbed);
            });

            let d = {
                "id": stream.id,
                "sentAt": new Date()
            };
            sentTwitchStreams.push(d);
            client.provider.set("global", "twitchSent", sentTwitchStreams);
        });
    });
}

exports.checkYoutube = async function(client) {
    if (GOOGLE_API_KEY === "") return winston.error(`Tried to check youtube channels but Google API key is not defined`);

    let sentYoutubeStreams = client.provider.get("global", "youtubeSent", []);
    let streamsList = client.provider.get("global", "youtube", []);

    await _.each(streamsList, stream => {
        request({
            uri: `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${stream.id}&type=video&eventType=live&key=${GOOGLE_API_KEY}`,
            method: 'GET'
        }, (err, res, body) => {
            if (err) return winston.error(err);
            let status = JSON.parse(body).items;
    
            _.each(status, stream => {
                if (_.find(sentYoutubeStreams, { "id": stream.id.videoId })) return;
                winston.info(`YouTube streamer ${stream.snippet.channelTitle} (${stream.snippet.channelId}) has gone live. Sending notifications.`);
    
                let streamer = _.find(streamsList, { "id": stream.snippet.channelId });
                _.each(streamer.guilds, g => {
                    let guild = client.guilds.find('id', g);
                    if (!guild) return;
    
                    const notificationChannelID = client.provider.get(guild.id, "notifications");
                    if (!notificationChannelID) return;
    
                    let channel = guild.channels.find('id', notificationChannelID);
                    if (!channel) return;
    
                    let liveEmbed = new MessageEmbed()
                        .setColor('#00ff00')
                        .setTitle(`${stream.snippet.channelTitle} is live!`)
                        .setDescription(`**Title:** [${stream.snippet.title}](https://www.youtube.com/watch?v=${stream.id.videoId})`)
                        .setImage(stream.snippet.thumbnails.high.url);
                    channel.send(liveEmbed);
                });
    
                let d = {
                    "id": stream.id.videoId,
                    "sentAt": new Date()
                };
                sentYoutubeStreams.push(d);
                client.provider.set("global", "youtubeSent", sentYoutubeStreams);
            });
        });
    });
}

exports.clearOldIds = async function(client) {
    let sentTwitchStreams = client.provider.get("global", "twitchSent", []);
    let sentYoutubeStreams = client.provider.get("global", "youtubeSent", []);

    let twitchChange = 0;
    let youtubeChange = 0;

    _.each(sentTwitchStreams, stream => {
        if (moment().diff(moment(stream.sentAt)) > 172800000) {
            winston.info(`Twitch stream ID ${stream.id} was sent more than 2 days ago. Removing it from the sent streams list.`);
            _.remove(sentTwitchStreams, { "id": stream.id });
            twitchChange++;
        }
    });

    _.each(sentYoutubeStreams, stream => {
        if (moment().diff(moment(stream.sentAt)) > 172800000) {
            winston.info(`YouTube stream ID ${stream.id} was sent more than 2 days ago. Removing it from the sent streams list.`);
            youtubeChange++;
        }
    });

    if (twitchChange > 0) client.provider.set("global", "twitchSent", sentTwitchStreams);
    if (youtubeChange > 0) client.provider.set("global", "youtubeSent", sentYoutubeStreams);
}