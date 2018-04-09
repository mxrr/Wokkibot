const { Command } = require('discord.js-commando');
const winston = require('winston');
const _ = require('lodash');
const request = require('request');

const { TWITCH_CLIENT_ID } = require('../../config.json');

module.exports = class TwitchCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'twitch',
            group: 'streams',
            memberName: 'twitch',
            description: 'Add or remove twitch stream notifications',
            details: '',
            examples: [`${client.commandPrefix}twitch add wokki`, `${client.commandPrefix}twitch remove wokki`],
            guildOnly: true,
            clientPermissions: ['SEND_MESSAGES'],
            args: [
                {
                    key: 'method',
                    prompt: 'Add or remove',
                    type: 'string'
                },
                {
                    key: 'target',
                    prompt: 'Etner streamer name',
                    type: 'string',
                    default: ''
                }
            ]
        });
    }

    hasPermission(msg) {
        const adminRole = this.client.provider.get(msg.guild.id, "adminRole");
        if (adminRole) {
            if (msg.member.roles.find('id', adminRole)) return true;
            else return false;
        }
        else {
            if (msg.author === msg.guild.owner.user) return true;
            else return this.client.isOwner(msg.author);
        }
    }

    async run(msg, { method, target }) {
        target = target.toLowerCase();
        method = method.toLowerCase();

        if (!this.client.provider.get(msg.guild.id, "streamsChannel")) return msg.channel.send(`Please use the **${this.client.commandPrefix}setchanel** command first to set the notification channel.`);

        if (method === "add" || method === "remove" || method === "list") {
            let list = this.client.provider.get(msg.guild.id, "twitch", []);

            if (method === "add") {
                if (target === "") return msg.channel.send(`You must specify a name of the channel`);
                msg.channel.send(`Subscribing to receive notifications of channel **${target}**...`).then(message => {
                    request({
                        headers: {
                            'Client-ID': TWITCH_CLIENT_ID
                        },
                        uri: `https://api.twitch.tv/helix/users?login=${target}`,
                        method: 'GET'
                    }, (err, res, body) => {
                        if (err) return [winston.error(err),message.edit(`An error occurred while attempting to fetch user data from twitch`)];
                        let result = JSON.parse(body).data[0];

                        if (_.find(list, { "user": target })) {
                            let user = _.find(list, { "user": target });
                            if (_.includes(user.guilds, msg.guild.id)) return message.edit(`Already receiving notifications of channel **${target}**`);
                            user.guilds.push(msg.guild.id);
                        }
                        else {
                            let user = {
                                "user": target,
                                "id": result.id,
                                "guilds": [msg.guild.id]
                            };
                            list.push(user);
                        }
                        return [this.client.provider.set(msg.guild.id, "twitch", list),message.edit(`Succesfully subscribed to receive notifications of channel **${target}**!`)];
                    });
                });
            }
            else if (method === "remove") {
                if (target === "") return msg.channel.send(`You must specify a name of the channel`);
                msg.channel.send(`Removing notifications of channel...`).then(message => {
                    let user = _.find(list, { "user": target });
                    if (user) {
                        _.pull(user.guilds, msg.guild.id);
                        if (user.guilds.length === 0) _.remove(list, { "user": target });
                        return [this.client.provider.set(msg.guild.id, "twitch", list),message.edit(`Succesfully removed **${target}** from this servers subscriptions`)];
                    }
                    else {
                        return message.edit(`Could not find **${target}** in the servers subscriptions`);
                    }
                });
            }
            else if (method === "list") {
                let streamers = [];
                _.each(list, value => {
                    if (_.includes(value.guilds, msg.guild.id)) streamers.push(value.user);
                });
                return msg.channel.send(`List of Twitch channels this server is subscribed to:\n${streamers ? streamers.join("\n") : "None"}`);
            }
        }
        else {
            return msg.channel.send(`The valid methods are: **add**, **remove**, **list**`);
        }
    }
}