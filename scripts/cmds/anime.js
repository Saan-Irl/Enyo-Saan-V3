const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const cacheDir = path.join(__dirname, 'cache');

module.exports = {
  config: {
    name: "guess",
    aliases: ["enemy","anime"],
    version: "1.2",
    author: "Mahu",
    role: 0,
    shortDescription: "Guess the anime character",
    longDescription: "Guess the name of the anime character based on traits and tags with random images.",
    category: "GAMES",
    guide: {
      en: "{p}guess"
    }
  },

  onStart: async function ({ event, message, usersData, api }) {
    try {
      // Fetch a random anime character data
      const response = await axios.get('https://global-prime-mahis-apis.vercel.app');
      const characters = response.data.data;
      
      // Ensure we have an array of characters, if not, wrap the single character in an array
      const charactersArray = Array.isArray(characters) ? characters : [characters];
      
      // Select a random character
      const randomIndex = Math.floor(Math.random() * charactersArray.length);
      const { image, traits, tags, fullName, firstName } = charactersArray[randomIndex];

      const imagePath = path.join(cacheDir, "character.jpg");
      const imageRes = await axios.get(image, { responseType: 'arraybuffer' });
      await fs.ensureDir(cacheDir);
      await fs.writeFile(imagePath, imageRes.data);
      const imageStream = fs.createReadStream(imagePath);

      const gameMsg = `Guess this handsome character:\n\nTraits: ${traits}\nTags: ${tags}`;
      const sentMsg = await message.reply({ body: gameMsg, attachment: imageStream });

      global.GoatBot.onReply.set(sentMsg.messageID, {
        commandName: this.config.name,
        messageID: sentMsg.messageID,
        correctAnswer: [fullName, firstName],
        senderID: event.senderID
      });

      setTimeout(() => {
        api.unsendMessage(sentMsg.messageID);
        fs.unlink(imagePath).catch(console.error);
      }, 15000);

    } catch (err) {
      console.error("Error:", err);
      message.reply("An error occurred while starting the game.");
    }
  },

  onReply: async function ({ message, event, Reply, api, usersData }) {
    try {
      if (event.senderID !== Reply.senderID) return;

      const userAnswer = event.body.trim().toLowerCase();
      const correctAnswers = Reply.correctAnswer.map(ans => ans.toLowerCase());

      if (correctAnswers.includes(userAnswer)) {
        const reward = 1000;
        const current = await usersData.get(event.senderID, "money") || 0;
        const newBalance = current + reward;
        await usersData.set(event.senderID, { money: newBalance });

        await message.reply(
          `✨____________________✨

✨Your answer right 👍🏻 

✨Your balance: ${newBalance}$

✨_____________________✨`
        );
      } else {
        await message.reply(`❌ Wrong! The correct answer was: ${Reply.correctAnswer.join(" or ")}`);
      }

      await api.unsendMessage(Reply.messageID);
      await api.unsendMessage(event.messageID);

    } catch (err) {
      console.error("onReply Error:", err);
    }
  }
};
