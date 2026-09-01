module.exports = {
  config: {
    name: "trade",
    aliases: ["quotex", "qx"],
    version: "3.0",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    countDown: 5,
    role: 0,
    shortDescription: "Binary Options Trading Game",
    longDescription: "Predict market movement (up/down) and win virtual money.",
    category: "game",
    guide: "{pn} <amount> <up/down>"
  },

  onStart: async function ({ api, event, args, usersData }) {
    const { threadID, messageID, senderID } = event;

    const userData = await usersData.get(senderID);
    const balance = userData.money || 0;

    if (args.length < 2) {
      return api.sendMessage("❌ Format vul! \nSothik niyom: /quotex <amount> <up/down>", threadID, messageID);
    }

    const betAmount = parseInt(args[0]);
    const prediction = args[1].toLowerCase();

    if (isNaN(betAmount) || betAmount < 10) {
      return api.sendMessage("❌ Minimum $10 trade korte hobe!", threadID, messageID);
    }
    if (betAmount > balance) {
      return api.sendMessage(`❌ Apnar jottheshtho balance nei! Bortoman balance: $${balance}`, threadID, messageID);
    }
    if (prediction !== 'up' && prediction !== 'down') {
      return api.sendMessage("❌ Shudhu 'up' (Call) ba 'down' (Put) prediction korun!", threadID, messageID);
    }

    api.sendMessage(`📈 **QUOTEX TRADE STARTED**\n━━━━━━━━━━━━━━\n🎯 Prediction: ${prediction === 'up' ? '🟢 UP' : '🔴 DOWN'}\n💰 Amount: $${betAmount}\n⏳ Status: Analyzing Market...\n━━━━━━━━━━━━━━`, threadID);

    setTimeout(async () => {
      const isWin = Math.random() > 0.40;
      const payout = 1.20;

      if (isWin) {
        const profit = Math.floor(betAmount * payout);
        await usersData.set(senderID, { money: balance + profit });

        return api.sendMessage(
          `🎉 **PROFIT!**\n━━━━━━━━━━━━━━\n💹 Result: ${prediction.toUpperCase()} ✅\n💰 Payout: +$${profit}\n📈 New Balance: $${balance + profit}\n━━━━━━━━━━━━━━`, 
          threadID, messageID
        );
      } else {
        await usersData.set(senderID, { money: balance - betAmount });

        return api.sendMessage(
          `💀 **LOSS!**\n━━━━━━━━━━━━━━\n💹 Result: ${prediction === 'up' ? 'DOWN' : 'UP'} ❌\n📉 Lost: -$${betAmount}\n📉 New Balance: $${balance - betAmount}\n━━━━━━━━━━━━━━`, 
          threadID, messageID
        );
      }
    }, 10000);
  }
};
