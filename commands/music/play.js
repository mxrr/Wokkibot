const { Command } = require('discord.js-commando');
const { Util, MessageEmbed } = require('discord.js');
const YouTube = require('simple-youtube-api');
const ytdl = require('ytdl-core-discord');
const { GOOGLE_API_KEY } = require('../../config');

module.exports = class PlayCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'play',
      group: 'music',
      memberName: 'play',
      description: 'Play YouTube video',
      clientPermissions: ['CONNECT', 'SPEAK', 'SEND_MESSAGES', 'EMBED_LINKS'],
      guildOnly: true,
      args: [
        {
          key: 'url',
          prompt: 'Enter URL or keyword to search with',
          type: 'string'
        }
      ]
    });

    this.queue = new Map();
    this.youtube = new YouTube(GOOGLE_API_KEY)
  }

  async run (msg, { url }) {
    const voiceChannel = msg.member.voice.channel;
    if (!voiceChannel) return msg.reply(`You must be connected to a voice channel to play`);

    try {
      let video = await this.youtube.getVideo(url);
      return this.handleVideo(video, msg, voiceChannel);
    }
    catch (error) {
      try {
        let videos = await this.youtube.searchVideos(url, 1)
          .catch(() => msg.reply(`No results for given keyword`));
        let video = await this.youtube.getVideoByID(videos[0].id);
        return this.handleVideo(video, msg, voiceChannel);
      }
      catch (error) {
        this.client.logger.error(error);
        return msg.reply(`Unable to play video`);
      }
    }
  }

  async handleVideo(video, msg, voiceChannel) {
    const queue = this.queue.get(msg.guild.id);

    const song = {
      id: video.id,
      title: Util.escapeMarkdown(video.title),
      url: `https://www.youtube.com/watch?v=${video.id}`,
      duration: video.durationSeconds ? video.durationSeconds : video.duration / 1000,
      thumbnail: `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`,
      requester: msg.author
    }

    let songEmbed = new MessageEmbed()
      .setColor('#3bff00')
      .setTitle('Song added to queue')
      .setDescription(`[${song.title}](https://www.youtube.com/watch?v=${song.id})\n**Duration:** ${this.timeString(song.duration)}\n**Requested by:** ${msg.author.tag}`)
      .setImage(song.thumbnail);

    if (!queue) {
      const queueConstruct = {
        textChannel: msg.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 0.2,
        playing: true
      };
      this.queue.set(msg.guild.id, queueConstruct);

      queueConstruct.songs.push(song);

      try {
        let connection = await voiceChannel.join();
        queueConstruct.connection = connection;
        msg.channel.send(songEmbed);
        this.play(msg.guild, queueConstruct.songs[0]);
      }
      catch (error) {
        this.client.logger.error(`Couldn't join the voice channel. Do I have required permissions?`, error);
        this.queue.delete(msg.guild.id);
        return msg.reply(`Couldn't join the voice channel. Do I have required permissions?`);
      }
    }
    else {
      queue.songs.push(song);
      return msg.channel.send(songEmbed);
    }
  }

  async play(guild, song) {
    const queue = this.queue.get(guild.id);

    if (!song) {
      queue.textChannel.send(`No more songs in queue`);
      queue.voiceChannel.leave();
      this.queue.delete(guild.id);
      return;
    }

    try {
      const dispatcher = await queue.connection.play(await ytdl(song.url), { type: 'opus' })
        .on('end', reason => {
          this.client.logger.info(reason);
          queue.songs.shift();
          this.play(guild, queue.songs[0]);
        })
        .on('error', error => {
          this.client.logger.error(`Play command error`, error);
          queue.songs.shift();
          this.play(guild, queue.songs[0]);
        });

      dispatcher.setVolume(queue.volume);

      const songEmbed = new MessageEmbed()
        .setColor('#3bff00')
        .setTitle('Now playing')
        .setDescription(`[${song.title}](https://www.youtube.com/watch?v=${song.id})\n**Duration:** ${this.timeString(song.duration)}\n**Requested by:** ${song.requester.tag}`);
      queue.textChannel.send(songEmbed);
    }
    catch (error) {
      this.client.logger.error(error);
      queue.textChannel.send('Song play failed');
    }
  }

  timeString(seconds, forceHours = false) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds % 3600 / 60);

    return `${forceHours || hours >= 1 ? `${hours}:` : ''}${hours >= 1 ? `0${minutes}`.slice(-2) : minutes}:${`0${Math.floor(seconds % 60)}`.slice(-2)}`;
  }
}