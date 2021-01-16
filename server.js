require("dotenv").config();
const discord = require("discord.js");
const schedule = require("node-schedule");
const client = new discord.Client();

const server_id = process.env.DISCORD_SERVER;

const sendInvitation = () => {
  client.channels
    .get(server_id)
    .send("今日参加する人〜")
    .then((message) => {
      const registeredUsers = new Set();
      message.react("👍");
      message.react("😇");
      const filter = (reaction, user) => {
        switch (reaction.emoji.name) {
          case "👍":
            registeredUsers.add(user.id);
            break;
          case "😇":
            registeredUsers.delete(user.id);
            break;
          default:
            break;
        }
        console.log(reaction.emoji.name, user.id);
        return ["👍", "😇"].includes(reaction.emoji.name);
      };

      const date = new Date();
      const hour = date.getHours();
      const minute = date.getMinutes();
      const second = date.getSeconds();

      // const due = 21 * 3600 + 55 * 60 + 0; //21:55:00
      const due = 3 * 3600 + 9 * 60 + 0; //21:55:00
      const timezoneOffsetSec = new Date().getTimezoneOffset() * 60; // UTC = 0, JST = -9 * 60 * 60
      const now =
        hour * 3600 + minute * 60 + second + 9 * 60 * 60 + timezoneOffsetSec; // JST
      console.log("通知まで", due - now, "秒");
      const collector = message.createReactionCollector(filter, {
        time: (due - now) * 1000,
      });

      collector.on("end", (collected) => {
        sendMsg(
          server_id,
          "おはよーーーーーー！！！！！！朝だよーーーーーー！！！！！！"
        );
        for (const user of registeredUsers) {
          sendMsg(server_id, "<@" + user + ">");
        }
        console.log(users);
      });
    })
    .catch(console.error);
};

client.on("ready", (message) => {
  console.log("Bot準備完了～");
  client.user.setActivity("ごちうさ", {
    type: "WATCHING",
  });

  const timezoneOffsetHour = new Date().getTimezoneOffset() / 60;
  const scheduleHour = 3 + (9 + timezoneOffsetHour);

  schedule.scheduleJob(`30 7 ${scheduleHour} * * 5`, sendInvitation);
});

client.on("message", (message) => {
  if (message.author.id == client.user.id || message.author.bot) {
    return;
  }
  if (message.content.match(/にゃ～ん|にゃーん|にゃ〜ん/)) {
    sendReply(message, "にゃ～んにゃん❤️");
    return;
  }
});

if (process.env.DISCORD_BOT_TOKEN == undefined) {
  console.log("DISCORD_BOT_TOKENが設定されていません。");
  process.exit(0);
}

client.login(process.env.DISCORD_BOT_TOKEN);

function sendReply(message, text) {
  message
    .reply(text)
    .then(console.log("リプライ送信: " + text))
    .catch(console.error);
}

function sendMsg(channelId, text, option = {}) {
  client.channels
    .get(channelId)
    .send(text, option)
    .then(console.log("メッセージ送信: " + text + JSON.stringify(option)))
    .catch(console.error);
}
