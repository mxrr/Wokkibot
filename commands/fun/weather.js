const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const weather = require('weather-js');

module.exports = class WeatherCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'weather',
      group: 'fun',
      memberName: 'weather',
      description: 'Get weather for a location',
      clientPermissions: ['SEND_MESSAGES'],
      args: [
        {
          key: 'location',
          prompt: 'Entert location',
          type: 'string'
        }
      ]
    });
  }

  run(msg, { location }) {
    weather.find({search: location, degreeType: 'C'}, (err, result) => {
      if(err) return [this.client.logger.error(err),msg.channel.send('An error occurred while trying to get weather info. More information logged to console.')];
      const embed = new MessageEmbed()
        .setColor('#00ff1d')
        .setTitle(`Weather in ${result[0].location.name}`)
        .addField('Temperature', `${result[0].current.temperature}°C (Feels like ${result[0].current.feelslike}°C)`, true)
        .addField('Sky Text', `${result[0].current.skytext}`, true)
        .addField('Wind Speed', `${result[0].current.windspeed}`, true)
        .setThumbnail(result[0].current.imageUrl);
     
      msg.channel.send(embed);
    });
  }
}