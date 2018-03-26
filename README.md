# Wokkibot
A JavaScript Discord bot using Discord.js and Commando

# config.json
Create a config.json file in the root directory with the following
```
{
  "OWNER": "",
  "TOKEN": "",
  "DEVTOKEN": "",
  "TWITCH_CLIENT_ID": "",
  "GOOGLE_API_KEY": "",
  "VOLUME": 1,
  "BITRATE": 96,
  "PREFIX": "!",
  "ACTIVITY": "Hello world",
  "PRODUCTION": false,
  "HOST": "",
  "USER": "",
  "DB": "",
  "PASS": "",
  "DEVHOST": "",
  "DEVUSER": "",
  "DEVDB": "",
  "DEVPASS": ""
}
```
OWNER is your Discord account id. You can get this by enabling developer mode in Discord, right clicking your profile and clicking "Copy ID".
TOKEN is your bot token, get this by registering new discord application
TWITCH_CLIENT_ID and GOOGLE_API_KEY can be acquired from Twitch and Google. Twitch API Key is required for stream notifications and Google API Key for playing YouTube videos.