const { createCanvas, loadImage } = require('canvas');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

const nx_210 = "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍";

module.exports = {
    config: {
        name: "balance",
        aliases: ["bal"],
        version: "5.0",
        author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
        countDown: 2,
        role: 0,
        description: "View balance card, transfer money, and track 10-day history",
        category: "ECONOMY",
        guide: { en: "{pn} | {pn} transfer @tag [amount] | {pn} history" }
    },

    onStart: async function ({ message, usersData, event, args }) {
        const senderID = event.senderID;
        const today = new Date().toISOString().split('T')[0];

        const formatBalance = (num) => {
            const n = Number(num);
            if (n === Infinity || isNaN(n)) return "∞ Unlimited";
            if (n < 1000) return n.toFixed(0);
            const units = [
                { v: 1e12, s: "T" }, { v: 1e9, s: "B" }, { v: 1e6, s: "M" }, { v: 1e3, s: "K" }
            ];
            for (let i = 0; i < units.length; i++) {
                if (n >= units[i].v) return (n / units[i].v).toFixed(2).replace(/\.00$/, '') + units[i].s;
            }
            return n.toLocaleString();
        };

        const getTargetUID = () => {
            if (event.messageReply) return event.messageReply.senderID;
            if (Object.keys(event.mentions).length > 0) return Object.keys(event.mentions)[0];
            if (args[1] && !isNaN(args[1])) return args[1];
            return null;
        };

        let userData = await usersData.get(senderID);
        let history = userData.balanceHistory || [];
        let currentMoney = Number(userData.money || 0);

        if (history.length === 0 || history[history.length - 1].date !== today) {
            history.push({ date: today, balance: currentMoney });
            if (history.length > 10) history.shift();
            await usersData.set(senderID, { balanceHistory: history });
        }

        if (args[0] === "history") {
            if (history.length < 2) return message.reply("📉 Not enough data yet! Check again tomorrow.");
            
            let historyMsg = `📊 𝗟𝗔𝗦𝗧 𝟭𝟬 𝗗𝗔𝗬𝗦 𝗕𝗔𝗟𝗔𝗡𝗖𝗘 𝗟𝗢𝗚\n━━━━━━━━━━━━━━━━━━\n`;
            const displayHistory = [...history].reverse();
            
            displayHistory.forEach((entry, i) => {
                const prevEntry = displayHistory[i + 1];
                let change = "";
                if (prevEntry) {
                    const diff = entry.balance - prevEntry.balance;
                    if (diff > 0) change = ` 📈 +$${formatBalance(diff)}`;
                    else if (diff < 0) change = ` 📉 -$${formatBalance(Math.abs(diff))}`;
                    else change = ` ➖ No change`;
                }
                historyMsg += `📅 ${entry.date}\n💰 $${formatBalance(entry.balance)}${change}\n──────────────────\n`;
            });
            return message.reply(historyMsg);
        }

        if (args[0] === "transfer") {
            const targetUID = getTargetUID();
            const amountStr = args[args.length - 1];
            let amount = parseInt(amountStr);

            if (amountStr && amountStr.toLowerCase().endsWith('k')) amount *= 1000;
            if (amountStr && amountStr.toLowerCase().endsWith('m')) amount *= 1000000;

            if (!targetUID || targetUID === senderID || isNaN(amount) || amount <= 0) {
                return message.reply("❌ Usage: balance transfer @tag [amount]");
            }

            if (currentMoney < amount) return message.reply("❌ Insufficient balance!");

            const receiverData = await usersData.get(targetUID);
            if (!receiverData) return message.reply("❌ Receiver not found!");

            await usersData.set(senderID, { money: (currentMoney - amount).toString() });
            await usersData.set(targetUID, { money: (Number(receiverData.money || 0) + amount).toString() });

            return message.reply(`✅ Transferred $${formatBalance(amount)} to ${receiverData.name}\nSystem Provider: ${nx_210}`);
        }

        const createUniqueCard = async (name, balance, uid) => {
            const canvas = createCanvas(800, 450);
            const ctx = canvas.getContext('2d');
            const gradient = ctx.createLinearGradient(0, 0, 800, 450);
            gradient.addColorStop(0, '#0f0c29');
            gradient.addColorStop(0.5, '#302b63');
            gradient.addColorStop(1, '#24243e');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.roundRect(0, 0, 800, 450, 30);
            ctx.fill();

            ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
            ctx.lineWidth = 2;
            for (let i = 0; i < 10; i++) {
                ctx.beginPath();
                ctx.moveTo(0, 100 + i * 30);
                ctx.bezierCurveTo(200, 50 + i * 20, 500, 400 + i * 20, 800, 300);
                ctx.stroke();
            }

            ctx.font = "bold 32px Arial";
            ctx.fillStyle = "#ffffff";
            ctx.fillText("GOAT BANK LTD.", 50, 60);

            try {
                const avatarURL = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
                const response = await axios.get(avatarURL, { responseType: 'arraybuffer' });
                const avatarImg = await loadImage(Buffer.from(response.data));
                ctx.save();
                ctx.shadowColor = '#00d2ff';
                ctx.shadowBlur = 20;
                ctx.beginPath();
                ctx.arc(100, 150, 60, 0, Math.PI * 2);
                ctx.clip();
                ctx.drawImage(avatarImg, 40, 90, 120, 120);
                ctx.restore();
                ctx.strokeStyle = "#00d2ff";
                ctx.lineWidth = 3;
                ctx.stroke();
            } catch (e) {}

            ctx.fillStyle = "#ffffff";
            ctx.font = "italic bold 40px sans-serif";
            ctx.fillText("VISA", 650, 60);
            ctx.font = "20px Arial";
            ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
            ctx.fillText("AVAILABLE BALANCE", 60, 260);

            const displayBal = formatBalance(balance);
            ctx.shadowColor = "#00d2ff";
            ctx.shadowBlur = 15;
            ctx.fillStyle = "#00d2ff";
            if (displayBal.length > 12) ctx.font = "bold 45px Arial";
            else if (displayBal.length > 8) ctx.font = "bold 60px Arial";
            else ctx.font = "bold 80px Arial";
            ctx.fillText(`$${displayBal}`, 60, 330);

            ctx.shadowBlur = 0;
            ctx.font = "28px monospace";
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
            const formattedUID = uid.toString().padEnd(16, '0').match(/.{1,4}/g).join("  ");
            ctx.fillText(formattedUID, 60, 385);

            ctx.font = "bold 25px Arial";
            ctx.fillStyle = "#ffffff";
            ctx.fillText(name.toUpperCase(), 60, 420);
            ctx.font = "18px Arial";
            ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
            ctx.fillText("VALID THRU: 12/29", 580, 420);

            const cachePath = path.join(__dirname, "cache");
            if (!fs.existsSync(cachePath)) fs.ensureDirSync(cachePath);
            const cardPath = path.join(cachePath, `premium_card_${uid}.png`);
            fs.writeFileSync(cardPath, canvas.toBuffer());
            return cardPath;
        };

        const targetID = getTargetUID() || senderID;
        const targetData = await usersData.get(targetID);
        if (!targetData) return message.reply("User not found!");

        const cardImg = await createUniqueCard(targetData.name || "Global User", targetData.money || 0, targetID);
        
        return message.reply({
            body: `💰 Balance: $${formatBalance(targetData.money || 0)}`,
            attachment: fs.createReadStream(cardImg)
        }, () => { if(fs.existsSync(cardImg)) fs.unlinkSync(cardImg); });
    }
};
