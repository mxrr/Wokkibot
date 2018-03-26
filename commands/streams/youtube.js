const { Command } = require('discord.js-commando');
const winston = require('winston');
const _ = require('lodash');
const request = require('request');

const { TWITCH_CLIENT_ID, GOOGLE_API_KEY } = require('../../config.json');

module.exports = class TwitchCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'youtube',
            group: 'streams',
            memberName: 'youtube',
            description: 'Add or remove youtube stream notifications',
            details: '',
            examples: [`${client.commandPrefix}youtube add UCv9Edl_WbtbPeURPtFDo-uA`, `${client.commandPrefix}youtube remove UCv9Edl_WbtbPeURPtFDo-uA`],
            guildOnly: true,
            args: [
                {
                    key: 'method',
                    prompt: 'Add or remove?',
                    type: 'string'
                },
                {
                    key: 'target',
                    prompt: 'Enter YouTube channel ID, not the name of the channel',
                    type: 'string',
                    default: ''
                }
            ]
        });
    }

    async run(msg, { method, target }) {
        method = method.toLowerCase();

        if (!this.client.provider.get(msg.guild.id, "notifications")) return msg.channel.send(`Please use the ${this.client.commandPrefix}setchanel command first to set the notification channel.`);

        if (method === "add" || method === "remove" || method === "list") {
            let list = this.client.provider.get("global", "youtube", []);

            if (method === "add") {
                if (target === "") return msg.channel.send(`You must specify a name of the channel`);
                msg.channel.send(`Subscribing to receive notifications of channel **${target}**...`).then(message => {
                    request({
                        uri: `https://www.googleapis.com/youtube/v3/channels?key=${GOOGLE_API_KEY}&id=${target}&part=snippet`,
                        method: 'GET'
                    }, (err, res, body) => {
                        if (err) return [winston.error(err),message.edit(`An error occurred while attempting to fetch user data from youtube`)];
                        if (JSON.parse(body).items.length < 1) return message.edit(`Couldn't get info from youtube. Maybe the channel ID is wrong?`);
                        let result = JSON.parse(body).items[0];

                        if (_.find(list, { "id": target })) {
                            let user = _.find(list, { "id": target });
                            if (_.includes(user.guilds, msg.guild.id)) return message.edit(`Already receiving notifications of channel **${result.snippet.title}**`);
                            user.guilds.push(msg.guild.id);
                        }
                        else {
                            let user = {
                                "user": result.snippet.title,
                                "id": target,
                                "guilds": [msg.guild.id]
                            };
                            list.push(user);
                        }
                        return [this.client.provider.set("global", "youtube", list),message.edit(`Succesfully subscribed to receive notifications of channel **${result.snippet.title}**!`)];
                    });
                });
            }
            else if (method === "remove") {
                if (target === "") return msg.channel.send(`You must specify a name of the channel`);
                msg.channel.send(`Removing notifications of channel...`).then(message => {
                    let user = _.find(list, { "id": target });
                    if (user) {
                        _.pull(user.guilds, msg.guild.id);
                        if (user.guilds.length === 0) _.remove(list, { "id": target });
                        return [this.client.provider.set("global", "youtube", list),message.edit(`Succesfully removed **${target}** from this servers subscriptions`)];
                    }
                    else {
                        user = _.find(list, { "user": target });
                        if (user) {
                            _.pull(user.guilds, msg.guild.id);
                            if (user.guilds.length === 0) _.remove(list, { "user": target });
                            return [this.client.provider.set("global", "youtube", list),message.edit(`Succesfully removed **${target}** from this servers subscriptions`)];
                        }
                        return message.edit(`Could not find **${target}** in the servers subscriptions`);
                    }
                });
            }
            else if (method === "list") {
                let streamers = [];
                _.each(list, value => {
                    if (_.includes(value.guilds, msg.guild.id)) streamers.push(value.user);
                });
                return msg.channel.send(`List of YouTube channels this server is subscribed to:\n${streamers ? streamers.join("\n") : "None"}`);
            }
        }
        else {
            return msg.channel.send(`The valid methods are: **add**, **remove**, **list**`);
        }
    }
}