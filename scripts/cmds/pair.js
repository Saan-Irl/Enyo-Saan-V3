const axios = require("axios");
const Canvas = require("canvas");
const fs = require("fs");
const path = require("path");

const BACKGROUNDS = [
  "https://i.imgur.com/0aEluTM.jpeg",
  "https://i.imgur.com/0geTIBC.jpeg",
  "https://i.imgur.com/3Y3C1Yr.jpeg",
  "https://i.imgur.com/2zz53lV.jpeg",
  "https://i.imgur.com/S1hIuc7.jpeg",
  "https://i.imgur.com/2lDJNM3.jpeg",
  "https://i.imgur.com/2PrkMNy.jpeg",
  "https://i.imgur.com/TF9diX2.jpeg",
  "https://i.imgur.com/fK7OtYq.jpeg",
  "https://i.imgur.com/5OO802y.jpeg"
];

module.exports = {
  config: {
    name: "pair",
    version: "9.5",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    role: 0,
    countDown: 7,
    shortDescription: "Romantic pair system with random background",
    category: "FUN & SOCIAL"
  },

  onStart: async function ({ api, event, usersData, args }) {
    const { threadID, messageID, senderID, messageReply } = event;

    try {
      let targetID = senderID;
      let targetName = null;

      if (messageReply) {
        targetID = messageReply.senderID;
        try {
          const userData = await usersData.get(targetID);
          targetName = userData.name || "User";
        } catch {
          targetName = "User";
        }
      }

      const [senderData, threadInfo] = await Promise.all([
        usersData.get(targetID),
        api.getThreadInfo(threadID)
      ]);

      const senderName = targetName || senderData.name || "User";
      const senderGender = senderData.gender;

      const members = threadInfo.participantIDs.filter(uid => uid != targetID);
      
      let targetGender;
      if (senderGender === 1) {
        targetGender = 2;
      } else if (senderGender === 2) {
        targetGender = 1;
      } else {
        targetGender = Math.random() > 0.5 ? 1 : 2;
      }

      let partnerList = [];
      const randomMembers = members.sort(() => 0.5 - Math.random());

      for (const uid of randomMembers) {
        try {
          const data = await usersData.get(uid);
          if (data && data.gender === targetGender) {
            partnerList.push({ id: uid, name: data.name, gender: data.gender });
          }
        } catch {}
      }

      let partner;
      
      if (partnerList.length > 0) {
        partner = partnerList[Math.floor(Math.random() * partnerList.length)];
      } else {
        let fallbackPartner = null;
        for (const uid of randomMembers) {
          try {
            const data = await usersData.get(uid);
            if (data && data.gender !== senderGender && data.gender !== undefined) {
              fallbackPartner = { id: uid, name: data.name, gender: data.gender };
              break;
            }
          } catch {}
        }
        if (fallbackPartner) {
          partner = fallbackPartner;
        } else {
          const fallbackId = randomMembers[Math.floor(Math.random() * randomMembers.length)];
          partner = {
            id: fallbackId,
            name: "Someone Special",
            gender: targetGender
          };
        }
      }

      if (partner.gender === senderGender && senderGender !== undefined) {
        for (const uid of randomMembers) {
          try {
            const data = await usersData.get(uid);
            if (data && data.gender !== senderGender && data.gender !== undefined) {
              partner = { id: uid, name: data.name, gender: data.gender };
              break;
            }
          } catch {}
        }
      }

      const match = Math.floor(Math.random() * 31) + 70;

      let x1 = 0.20, y1 = 0.55, x2 = 0.80, y2 = 0.55;
      if (args.length >= 4) {
        const parsed = args.slice(0, 4).map(Number);
        if (parsed.every(n => !isNaN(n) && n >= 0 && n <= 1)) {
          [x1, y1, x2, y2] = parsed;
        }
      }

      const randomBg = BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)];
      const token = "6628568379|c1e620fa708a1d5696fb991c1bde5662";

      const templateResponse = await axios.get(randomBg, {
        responseType: "arraybuffer",
        headers: { "User-Agent": "Mozilla/5.0" }
      });
      const templateImg = await Canvas.loadImage(templateResponse.data);

      const avt1 = `https://graph.facebook.com/${targetID}/picture?width=1024&height=1024&access_token=${token}`;
      const avt2 = `https://graph.facebook.com/${partner.id}/picture?width=1024&height=1024&access_token=${token}`;

      async function loadImage(url) {
        const response = await axios.get(url, {
          responseType: "arraybuffer",
          headers: { "User-Agent": "Mozilla/5.0" }
        });
        return await Canvas.loadImage(response.data);
      }

      const [img1, img2] = await Promise.all([loadImage(avt1), loadImage(avt2)]);

      const canvas = Canvas.createCanvas(templateImg.width, templateImg.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);

      const W = canvas.width;
      const H = canvas.height;
      const centerX1 = W * x1;
      const centerY1 = H * y1;
      const centerX2 = W * x2;
      const centerY2 = H * y2;
      const radius = W * 0.14;

      function drawCircleProfile(img, cx, cy, r) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        const aspect = img.width / img.height;
        let drawW, drawH, dx, dy;
        if (aspect > 1) {
          drawW = r * 2;
          drawH = drawW / aspect;
          dx = cx - r;
          dy = cy - drawH / 2;
        } else {
          drawH = r * 2;
          drawW = drawH * aspect;
          dx = cx - drawW / 2;
          dy = cy - r;
        }
        ctx.drawImage(img, dx, dy, drawW, drawH);
        ctx.restore();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = "#d4af37";
        ctx.lineWidth = 4;
        ctx.stroke();
      }

      drawCircleProfile(img1, centerX1, centerY1, radius);
      drawCircleProfile(img2, centerX2, centerY2, radius);

      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.font = `bold ${Math.round(W * 0.035)}px 'Segoe UI', 'Arial'`;
      ctx.fillStyle = "#ffffff";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#000000";

      const nameY1 = centerY1 + radius + 16;
      const nameY2 = centerY2 + radius + 16;
      const maxNameWidth = W * 0.2;
      function truncateName(name) {
        let w = ctx.measureText(name).width;
        if (w > maxNameWidth) {
          while (ctx.measureText(name + "…").width > maxNameWidth && name.length > 1) {
            name = name.slice(0, -1);
          }
          name += "…";
        }
        return name;
      }

      const displayName1 = truncateName(senderName);
      const displayName2 = truncateName(partner.name);

      ctx.fillStyle = "#ffffff";
      ctx.shadowBlur = 15;
      ctx.shadowColor = "rgba(0,0,0,0.8)";
      ctx.fillText(displayName1, centerX1, nameY1);
      ctx.fillText(displayName2, centerX2, nameY2);

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      const filePath = path.join(cacheDir, `pair_${Date.now()}.png`);
      fs.writeFileSync(filePath, canvas.toBuffer());

      const emoji = match > 85 ? "💞" : match > 75 ? "💗" : "💕";
      const compatibility = match > 85 ? "Perfect" : match > 75 ? "Great" : "Good";
      const genderEmoji1 = senderGender === 1 ? "👦" : senderGender === 2 ? "👧" : "👤";
      const genderEmoji2 = partner.gender === 1 ? "👦" : partner.gender === 2 ? "👧" : "👤";

      const msg = `${emoji} 𝗣𝗮𝗶𝗿 𝗠𝗮𝘁𝗰𝗵

${genderEmoji1} ${senderName} ✦ ${genderEmoji2} ${partner.name}
📊 ${match}% ${compatibility} Match
💘 Status: Matched!`;

      return api.sendMessage(
        {
          body: msg,
          attachment: fs.createReadStream(filePath)
        },
        threadID,
        () => {
          if (fs.existsSync(filePath)) {
            try {
              fs.unlinkSync(filePath);
            } catch {}
          }
        },
        messageID
      );

    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ | Pair system failed! Please try again.", threadID, messageID);
    }
  }
};
