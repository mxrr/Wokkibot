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
      description: 'Play audio from YouTube URL or keyword',
      clientPermissions: ['CONNECT', 'SPEAK', 'SEND_MESSAGES', 'EMBED_LINKS'],
      guildOnly: true,
      args: [
        {
          key: 'url',
          prompt: 'Enter URL or keyword',
          type: 'string'
        }
      ]
    });

    this.queue = new Map();
    this.youtube = new YouTube(GOOGLE_API_KEY);
  }

  async run(msg, { url }) {
    const voiceChannel = msg.member.voice.channel;
    if (!voiceChannel) return msg.reply('You must be connected to a voice channel to run this command');

    try {
      let video = await this.youtube.getVideo(url);
      return this.handleVideo(msg, video);
    }
    catch(error) {
      try {
        let videos = await this.youtube.searchVideos(url, 1).catch(() => msg.reply('No results for given keyword'));
        let video = await this.youtube.getVideoByID(videos[0].id);
        return this.handleVideo(msg, video);
      }
      catch(error) {
        return [this.client.logger.error('Unable to play video', error),msg.reply('Video play failed due to an error')];
      }
    }
  }

  handleVideo(msg, video) {
    const voiceChannel = msg.member.voice.channel;
    if (!voiceChannel) return msg.reply('You must be connected to a voice channel to run this command');

    const queue = this.queue.get(msg.guild.id);

    const song = {
      id: video.id,
      title: Util.escapeMarkdown(video.title),
      url: `https://www.youtube.com/watch?v=${video.id}`,
      thumbnail: `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`,
      duration: video.durationSeconds ? video.durationSeconds : video.duration / 1000,
      requester: msg.author
    }

    if (!queue) {
      try {
        voiceChannel.join()
          .then(connection => {
            this.queue.set(msg.guild.id, {
              voiceChannel: voiceChannel,
              connection: connection,
              songs: [song]
            });
            this.play(msg);
          });
      }
      catch(error) {
        return [this.client.logger.error('Failed to create queue', error),msg.reply('Failed to create queue')];
      }
    }
    else {
      try {
        this.client.logger.info(`Adding ${song.title} to queue in ${msg.guild.name} (${msg.guild.id})`);
        let queueEmbed = new MessageEmbed()
          .setColor('#1a2b3c')
          .setTitle('Song added to queue')
          .setDescription(`[${song.title}](https://www.youtube.com/watch?v=${song.id})\n**Duration:** ${this.timeString(song.duration)}\n**Requested by:** ${msg.author}`)
          .setImage(song.thumbnail);
        msg.channel.send(queueEmbed);
        return queue.songs.push(song);
      }
      catch(error) {
        return [this.client.logger.error('Pushing song to queue failed', error),msg.reply('Could not push song to queue')];
      }
    }
  }

  async play(msg) {
    const queue = this.queue.get(msg.guild.id);

    if (queue.songs.length === 0) {
      msg.channel.send('No more songs in queue');
      queue.voiceChannel.leave();
      return this.queue.delete(msg.guild.id);
    }

    try {
      const playEmbed = new MessageEmbed()
        .setColor('#1a2b3c')
        .setTitle('Now playing')
        .setDescription(`[${queue.songs[0].title}](https://www.youtube.com/watch?v=${queue.songs[0].id})\n**Duration:** ${this.timeString(queue.songs[0].duration)}\n**Requested by:** ${queue.songs[0].requester}`)
        .setImage(queue.songs[0].thumbnail);

      this.client.logger.info(`Playing ${queue.songs[0].title} in ${msg.guild.name} (${msg.guild.id})`);

      const dispatcher = await queue.connection.play(await ytdl(queue.songs[0].url), { type: 'opus', volume: 0.2 })
        .on('end', reason => {
          if (reason === 'skipped') msg.channel.send('Song skipped');
          queue.songs.shift();
          this.play(msg);
        })
        .on('error', error => {
          queue.songs.shift();
          this.play(msg);
          return this.client.logger.error('Dispatcher error', error);
        });

        msg.channel.send(playEmbed);
    }
    catch(error) {
      return [this.client.logger.error('Play function error', error),msg.channel.send('Playing song failed')];
    }
  }

  timeString(seconds, forceHours = false) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds % 3600 / 60);

    return `${forceHours || hours >= 1 ? `${hours}:` : ''}${hours >= 1 ? `0${minutes}`.slice(-2) : minutes}:${`0${Math.floor(seconds % 60)}`.slice(-2)}`;
  }
}