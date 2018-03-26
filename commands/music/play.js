const { Command } = require('discord.js-commando');
const { Util, MessageEmbed } = require('discord.js');
const winston = require('winston');
const YouTube = require('simple-youtube-api');
const ytdl = require('ytdl-core');

const { VOLUME, BITRATE, GOOGLE_API_KEY } = require('../../config.json');

module.exports = class PlayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'play',
            group: 'music',
            memberName: 'play',
            description: 'Play song or add song to queue',
            details: 'Adds a song to the queue. If there are no other songs in the queue before, will start playing the song immediately. Requires you to be connected to a voice channel to play. Moving the bot while playing is not recommended, as it may bug the bot.',
            examples: [`${client.commandPrefix}play https://www.youtube.com/watch?v=4aSG_zO7KY8`],
            guildOnly: true,
            clientPermissions: ['CONNECT', 'SPEAK'],
            args: [
                {
                    key: 'url',
                    prompt: 'Enter song url or keyword to search with',
                    type: 'string'
                }
            ]
        });

        this.queue = new Map();
        this.youtube = new YouTube(GOOGLE_API_KEY);
    }

    async run(msg, { url }) {
        const voiceChannel = msg.member.voiceChannel;
        if (!voiceChannel) return msg.reply(`You must be connected to a voice channel to play music`);
        const permissions = voiceChannel.permissionsFor(msg.client.user);
        if (!permissions.has('CONNECT')) return msg.reply(`I don't have permission to connect to your voice channel`);
        if (!permissions.has('SPEAK')) return msg.reply(`I don't have permission to speak in your voice channel`);

        if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
            const playlist = await this.youtube.getPlayList(url);
            const videos = await playlist.getVideos();
            for (const video of Object.values(videos)) {
                const video2 = await this.youtube.getVideoByID(video.id);
                await this.handleVideo(video2, msg, voiceChannel, true);
            }
            return msg.channel.send(`Playlist **${playlist.title}** has been added to the queue`);
        }
        else {
            try {
                let video = await this.youtube.getVideo(url);
                return this.handleVideo(video, msg, voiceChannel);            
            } catch (error) {
                try {
                    let videos = await this.youtube.searchVideos(url, 1)
                        .catch(() => msg.channel.send(`There were no search results`));
                    let video = await this.youtube.getVideoByID(videos[0].id);
                    return this.handleVideo(video, msg, voiceChannel);            
                } catch (error) {
                    winston.error(error);
                    return msg.channel.send(`Couldn't obtain any videos with given string`);
                }
            }
        }
    }

    async handleVideo(video, msg, voiceChannel, playlist = false) {
        const queue = this.queue.get(msg.guild.id);
        const song = {
            id: video.id,
            title: Util.escapeMarkdown(video.title),
            url: `https://www.youtube.com/watch?v=${video.id}`,
            duration: video.durationSeconds ? video.durationSeconds : video.duration / 1000,
            thumbnail: `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`,
            requester: msg.author
        };

        let songEmbed = new MessageEmbed()
            .setColor('#3bff00')
            .setTitle(`Song added to queue`);

        if (!queue) {
            const queueConstruct = {
                textChannel: msg.channel,
                voiceChannel: voiceChannel,
                connection: null,
                songs: [],
                volume: VOLUME,
                playing: true
            };
            this.queue.set(msg.guild.id, queueConstruct);

            queueConstruct.songs.push(song);

            songEmbed
                .setDescription(`[${song.title}](https://www.youtube.com/watch?v=${song.id})\n**Duration:** ${this.timeString(song.duration)}\n**Requested by:** ${msg.author.tag}`)
                .setImage(song.thumbnail);
            msg.channel.send(songEmbed);

            try {
                let connection = await voiceChannel.join();
                queueConstruct.connection = connection;
                this.play(msg.guild, queueConstruct.songs[0]);
            } catch (error) {
                winston.error(`Couldn't join voice channel: ${error}`);
                this.queue.delete(msg.guild.id);
                return msg.channel.send(`Could not join the voice channel: ${error}`);
            }
        }
        else {
            queue.songs.push(song);
            songEmbed
                .setDescription(`[${song.title}](https://www.youtube.com/watch?v=${song.id})\n**Duration:** ${this.timeString(song.duration)}\n**Requested by:** ${msg.author.tag}`)
                .setImage(song.thumbnail);
            if (playlist) return undefined;
            else return msg.channel.send(songEmbed);
        }
        return undefined;
    }

    async play(guild, song) {
        const queue = this.queue.get(guild.id);

        if (!song) {
            queue.textChannel.send(`No more songs in queue`);
            if (queue.voiceChannel.id !== guild.client.voiceConnections.find(val => val.channel.guild.id).channel.id) {
                winston.info(`Bots voice channel was changed mid play, can not disconnect normally`);
                guild.client.voiceConnections.find(val => val.channel.guild.id).channel.leave();
            }
            else {
                queue.voiceChannel.leave();
            }
            this.queue.delete(guild.id);
            return;
        }

        const dispatcher = queue.connection.play(ytdl(song.url))
            .on('end', reason => {
                if (reason === 'Stream is not generating quickly enough.') winston.info(`Stream ended`);
                else winston.info(reason);
                queue.songs.shift();
                this.play(guild, queue.songs[0]);
            })
            .on('error', error => winston.error(error));
        dispatcher.setVolumeLogarithmic(queue.volume / 5);

        const nextSongEmbed = new MessageEmbed()
            .setColor('#3bff00')
            .setTitle('Now playing')
            .setDescription(`[${song.title}](https://www.youtube.com/watch?v=${song.id})\n**Duration:** ${this.timeString(song.duration)}\n**Requested by:** ${song.requester.tag}`);
        queue.textChannel.send(nextSongEmbed);
    }

    timeString(seconds, forceHours = false) {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor(seconds % 3600 / 60);

		return `${forceHours || hours >= 1 ? `${hours}:` : ''}${hours >= 1 ? `0${minutes}`.slice(-2) : minutes}:${`0${Math.floor(seconds % 60)}`.slice(-2)}`;
	}
}