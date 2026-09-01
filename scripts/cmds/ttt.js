const fs = require("fs");
const { loadImage, createCanvas } = require("canvas");

var AIMove;

module.exports = {
  config: {
    name: "ttt",
    version: "2.6.0",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    countDown: 6,
    role: 0,
    description: "Play Tic-Tac-Toe with a chance to win!",
    category: "GAMES",
    guide: "{pn} x/o/delete/continue"
  },

  onStart: async function ({ event, message, args }) {
    if (!global.moduleData) global.moduleData = {};
    if (!global.moduleData.tictactoe) global.moduleData.tictactoe = new Map();

    let { threadID, senderID } = event;
    let data = global.moduleData.tictactoe.get(threadID) || { "gameOn": false };

    if (args[0] == "delete") {
      global.moduleData.tictactoe.delete(threadID);
      return message.reply("🗑️ | Board deleted!");
    }

    if (args[0] == "continue") {
      if (!data.gameOn) return message.reply("❌ | No game in progress.");
      const attachment = await displayBoard(data);
      return message.reply({ body: "🎮 | Continued!\nReply with cell (1-9).", attachment }, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          messageID: info.messageID,
          author: senderID
        });
      });
    }

    if (!data.gameOn) {
      let choice = args[0]?.toLowerCase();
      if (choice !== "x" && choice !== "o") return message.reply("❓ | Choose 'ttt x' or 'ttt o'");

      let newData = startBoard({ isX: (choice === "x"), data: {} });
      if (choice === "x") AIStart(newData);

      newData.player = senderID;
      global.moduleData.tictactoe.set(threadID, newData);

      const attachment = await displayBoard(newData);
      return message.reply({ body: `🎮 | Started! You have a chance to win now.\nReply with (1-9).`, attachment }, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          messageID: info.messageID,
          author: senderID
        });
      });
    } else return message.reply("⚠️ | Game running. Use 'ttt continue' or 'ttt delete'.");
  },

  onReply: async function ({ event, Reply, message }) {
    let { body, threadID, senderID } = event;
    let data = global.moduleData.tictactoe.get(threadID);

    if (!data || data.gameOn == false || senderID !== Reply.author) return;

    let num = parseInt(body);
    if (isNaN(num) || num < 1 || num > 9) return message.reply("🔢 | Choose 1-9.");

    let row = num < 4 ? 0 : num < 7 ? 1 : 2;
    let col = (num - 1) % 3;

    let moveStatus = move(row, col, data);
    if (typeof moveStatus === "string") return message.reply(moveStatus);

    let statusMsg = "";
    let isGameOver = false;

    if (checkGameOver(data)) {
      isGameOver = true;
      if (checkAIWon(data)) statusMsg = "💀 | YOU LOST! 😎";
      else if (checkPlayerWon(data)) statusMsg = "🎉 | YOU WON! 🏆";
      else statusMsg = "🤝 | DRAW! 🤝";
      global.moduleData.tictactoe.delete(threadID);
    } else statusMsg = "🎮 | Your turn (1-9):";

    const attachment = await displayBoard(data);
    message.reply({ body: statusMsg, attachment }, (err, info) => {
      if (!isGameOver) {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          messageID: info.messageID,
          author: senderID
        });
      }
    });
  }
};

async function displayBoard(data) {
  const canvas = createCanvas(600, 600);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#0f0c29"; 
  ctx.fillRect(0, 0, 600, 600);
  ctx.strokeStyle = "#00d2ff";
  ctx.lineWidth = 10;
  ctx.shadowBlur = 20;
  ctx.shadowColor = "#00d2ff";
  for(let i=1; i<3; i++) {
    ctx.beginPath(); ctx.moveTo(i*200, 40); ctx.lineTo(i*200, 560); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(40, i*200); ctx.lineTo(560, i*200); ctx.stroke();
  }
  ctx.font = "bold 130px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let val = data.board[i][j];
      if (val !== 0) {
        let char = val == 1 ? (data.isX ? "O" : "X") : (data.isX ? "X" : "O");
        ctx.fillStyle = char === "X" ? "#ff0055" : "#00ff99";
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 25;
        ctx.fillText(char, j*200 + 100, i*200 + 100);
      }
    }
  }
  const path = __dirname + `/cache/ttt_${Date.now()}.png`;
  if (!fs.existsSync(__dirname + "/cache")) fs.mkdirSync(__dirname + "/cache");
  fs.writeFileSync(path, canvas.toBuffer("image/png"));
  return fs.createReadStream(path);
}

function startBoard({isX, data}) {
  data.board = Array.from({ length: 3 }, () => new Array(3).fill(0));
  data.isX = isX;
  data.gameOn = true;
  return data;
}

function checkWin(data, player) {
  const b = data.board;
  for(let i=0; i<3; i++) {
    if(b[i][0] == player && b[i][1] == player && b[i][2] == player) return true;
    if(b[0][i] == player && b[1][i] == player && b[2][i] == player) return true;
  }
  if(b[0][0] == player && b[1][1] == player && b[2][2] == player) return true;
  if(b[0][2] == player && b[1][1] == player && b[2][0] == player) return true;
  return false;
}

function checkAIWon(data) { return checkWin(data, 1); }
function checkPlayerWon(data) { return checkWin(data, 2); }

function move(x, y, data) {
  if (data.board[x][y] !== 0) return "❌ | Cell occupied!";
  data.board[x][y] = 2;
  
  if (!checkGameOver(data)) {
    // 60% chance to be smart, 40% chance to make a random mistake
    if (Math.random() > 0.4) {
      solveAIMove({depth: 0, turn: 1, data});
    } else {
      let available = getAvailable(data);
      AIMove = available[Math.floor(Math.random() * available.length)];
    }
    data.board[AIMove[0]][AIMove[1]] = 1;
  }
}

function solveAIMove({depth, turn, data}) {
  if (checkAIWon(data)) return +1;
  if (checkPlayerWon(data)) return -1;
  let availablePoint = getAvailable(data);
  if (availablePoint.length == 0) return 0;
  var min = 100, max = -100;
  for (var i = 0; i < availablePoint.length; i++) {
    var point = availablePoint[i];
    if (turn == 1) {
      data.board[point[0]][point[1]] = 1;
      var score = solveAIMove({depth: depth + 1, turn: 2, data});
      if (score >= max) { max = score; if (depth == 0) AIMove = point; }
    } else {
      data.board[point[0]][point[1]] = 2;
      var score = solveAIMove({depth: depth + 1, turn: 1, data});
      min = Math.min(score, min);
    }
    data.board[point[0]][point[1]] = 0;
  }
  return turn == 1 ? max : min;
}

function getAvailable(data) {
  let moves = [];
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      if (data.board[i][j] == 0) moves.push([i, j]);
  return moves;
}

function checkGameOver(data) { return (getAvailable(data).length == 0 || checkAIWon(data) || checkPlayerWon(data)); }

function AIStart(data) {
  const moves = getAvailable(data);
  let point = moves[Math.floor(Math.random() * moves.length)];
  data.board[point[0]][point[1]] = 1;
}
