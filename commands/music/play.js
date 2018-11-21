const { Command } = require('discord.js-commando');
const { Util, MessageEmbed } = require('discord.js');
const YouTube = require('simple-youtube-api');
const ytdl = require('ytdl-core');

module.exports = class PlayCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'play',
      group: 'music',
      memberName: 'play',
      description: 'Add YouTube video to the queue',
      clientPermissions: ['CONNECT', 'SPEAK', 'SEND_MESSAGES', 'EMBED_LINKS'],
      guildOnly: true,
      args: [
        {
          key: 'url',
          prompt: 'Enter YouTube URL or a keyword to search with',
          type: 'string'
        }
      ]
    });

    this.queue = new Map();
    this.youtube = new YouTube(client.config["GLOBAL"].GOOGLE_API_KEY);
    this.volume = 0.2;
  }

  async run (msg, { url }) {
    const voiceChannel = msg.member.voice.channel;
    if (!voiceChannel) return msg.reply(`Connect to a voice channel to use command`);

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
          this.client.logger.error(error);
          return msg.channel.send(`Couldn't obtain any videos with given string`);
        }
      }
    }
  }

  async handleVideo(video, msg, voiceChannel, playlist = false) {
    const queue = this.queue.get(msg.guild.id);

    this.client.db.getGuild(msg.guild.id)
      .then(async data => {
        if (data && data.volume) this.volume = data.volume / 100;

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
            volume: this.volume,
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
            this.client.logger.error(`Couldn't join voice channel: ${error}`);
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
      })
      .catch(async e => {
        this.client.logger.error(e);

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
            volume: this.volume,
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
            this.client.logger.error(`Couldn't join voice channel: ${error}`);
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
      });
  }

  async play(guild, song) {
    const queue = this.queue.get(guild.id);

    if (!song) {
      queue.textChannel.send(`No more songs in queue`);
      if (queue.voiceChannel.id !== guild.client.voiceConnections.find(val => val.channel.guild.id).channel.id) {
        this.client.logger.info(`Bots voice channel was changed mid play, can not disconnect normally`);
        guild.client.voiceConnections.find(val => val.channel.guild.id).channel.leave();
      }
      else {
        queue.voiceChannel.leave();
      }
      this.queue.delete(guild.id);
      return;
    }

    const dispatcher = await queue.connection.play(ytdl(song.url))
      .on('end', reason => {
          if (reason === 'Stream is not generating quickly enough.') this.client.logger.info(`Stream ended`);
          else if (reason === undefined) this.client.logger.info(`Song skipped`);
          else this.client.logger.info(reason);
          queue.songs.shift();
          this.play(guild, queue.songs[0]);
      })
      .on('error', error => this.client.logger.error(error));

    dispatcher.setVolume(queue.volume);

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