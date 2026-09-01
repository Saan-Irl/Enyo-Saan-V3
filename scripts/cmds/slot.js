module.exports = {
    config: {
        name: "slot",
        version: "7.2",
        author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
        role: 0,
        countDown: 10,
        category: "game",
        guide: {
            en: "{pn} <amount>"
        }
    },

    onStart: async ({ message, event, args, usersData }) => {

        const { senderID } = event;

        if (!global.slotCooldown)
            global.slotCooldown = {};

        if (
            global.slotCooldown[senderID] &&
            Date.now() - global.slotCooldown[senderID] < 15000
        ) {
            return message.reply("⏱️ Please wait 15 seconds before playing again.");
        }

        global.slotCooldown[senderID] = Date.now();

        const formatMoney = (num) => {
            const n = Number(num);
            if (n < 1000) return n.toFixed(0);

            const units = [
                { v: 1e12, s: "T" },
                { v: 1e9, s: "B" },
                { v: 1e6, s: "M" },
                { v: 1e3, s: "K" }
            ];

            for (let i = 0; i < units.length; i++) {
                if (n >= units[i].v) {
                    return (n / units[i].v)
                        .toFixed(2)
                        .replace(/\.00$/, '') + units[i].s;
                }
            }
            return n.toLocaleString();
        };

        function parseAmount(input) {
            if (!input) return NaN;

            let amount = input.toLowerCase();

            if (amount.endsWith('k')) return parseFloat(amount) * 1e3;
            if (amount.endsWith('m')) return parseFloat(amount) * 1e6;
            if (amount.endsWith('b')) return parseFloat(amount) * 1e9;

            return parseInt(amount);
        }

        const betAmount = parseAmount(args[0]);

        const minBet = 100;
        const maxBet = 20000000;

        if (isNaN(betAmount) || betAmount < minBet) {
            return message.reply(`🎰 Minimum bet is 100$\nExample: /slot 1k`);
        }

        if (betAmount > maxBet) {
            return message.reply(`🚫 Maximum bet limit is ${formatMoney(maxBet)}$`);
        }

        const userData = await usersData.get(senderID);
        const currentMoney = Number(userData.money || 0);

        if (betAmount > currentMoney) {
            return message.reply(`💸 Not enough balance!\nBalance: ${formatMoney(currentMoney)}$`);
        }

        // 🔥 12 hour limit system (NOW 10)
        if (!global.slotLimit)
            global.slotLimit = {};

        const now = Date.now();

        if (
            !global.slotLimit[senderID] ||
            (now - global.slotLimit[senderID].lastReset > 43200000)
        ) {
            global.slotLimit[senderID] = {
                count: 0,
                lastReset: now
            };
        }

        if (global.slotLimit[senderID].count >= 15) {
            return message.reply(
                `🚫 You reached the maximum slot limit!\n⏳ Try again after 12 hours.`
            );
        }

        global.slotLimit[senderID].count++;

        const items = ["🍎","🍐","🍑","🍒","🍓","🍇","🍉","🍊","🍋","🍌"];

        const slots = Array.from(
            { length: 6 },
            () => items[Math.floor(Math.random() * items.length)]
        );

        // 🎰 WIN RATE REDUCED (40%)
        const chance = Math.random() * 100;

        if (chance <= 40) {
            const lucky = items[Math.floor(Math.random() * items.length)];

            slots[0] = lucky;
            slots[1] = lucky;
            slots[2] = lucky;

            if (Math.random() < 0.25) slots[3] = lucky;
            if (Math.random() < 0.08) slots[4] = lucky;
        }

        const counts = {};
        slots.forEach(item => {
            counts[item] = (counts[item] || 0) + 1;
        });

        const maxMatch = Math.max(...Object.values(counts));

        const win = maxMatch >= 3;

        // 💰 FIXED 2X SYSTEM
        let multiplier = 0;
        if (maxMatch >= 3) multiplier = 2;

        const reward = win
            ? Math.floor(betAmount * multiplier)
            : 0;

        let finalMoney = win
            ? currentMoney - betAmount + reward
            : currentMoney - betAmount;

        // small refund chance
        if (!win && Math.random() < 0.20) {
            finalMoney += Math.floor(betAmount * 0.25);
        }

        await usersData.set(senderID, {
            money: finalMoney.toString()
        });

        return message.reply(
`🎰 | SLOT MACHINE
━━━━━━━━━━━━━━
[ ${slots.join(" | ")} ]
━━━━━━━━━━━━━━

${win
? `🎉 WINNER (${maxMatch} Match)
💰 Won: ${formatMoney(reward)}$ (2x)`
: `💀 LOST
💸 Lost: ${formatMoney(betAmount)}$`
}

💳 Balance: ${formatMoney(finalMoney)}$
📊 Usage: ${global.slotLimit[senderID].count}/15`
        );
    }
};