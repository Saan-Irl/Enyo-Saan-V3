const fs = require("fs-extra");
const path = require("path");

const configPath = path.join(__dirname, "cache", "autoreact.json");

if (!fs.existsSync(path.dirname(configPath))) {
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
}
if (!fs.existsSync(configPath)) {
  fs.writeFileSync(configPath, JSON.stringify({}));
}

module.exports = {
  config: {
    name: "autoreact",
    version: "2.3",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    countDown: 6,
    role: 1,
    shortDescription: { en: "Auto react to messages in group" },
    longDescription: { en: "Auto react to specific words in messages" },
    category: "group",
    guide: {
      en: "{pn} on/off - Toggle auto react"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const { threadID } = event;
    const data = JSON.parse(fs.readFileSync(configPath));

    if (!data[threadID]) {
      data[threadID] = { enabled: true };
    }

    const threadData = data[threadID];

    if (args.length === 0) {
      return message.reply(`📌 AutoReact: ${threadData.enabled ? "✅ ON" : "❌ OFF"}`);
    }

    const action = args[0].toLowerCase();

    if (action === "on") {
      threadData.enabled = true;
      fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
      return message.reply("✅ AutoReact is now **ON**.");
    }

    if (action === "off") {
      threadData.enabled = false;
      fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
      return message.reply("❌ AutoReact is now **OFF**.");
    }

    return message.reply(`❌ Use: on or off`);
  },

  onChat: async function ({ api, event }) {
    const { threadID, senderID, body, messageID } = event;

    if (!body || senderID === api.getCurrentUserID()) return;

    const data = JSON.parse(fs.readFileSync(configPath));
    const threadData = data[threadID];
    if (!threadData || !threadData.enabled) return;

    const lowerBody = body.toLowerCase();
    const reactions = getDefaultReactions();

    for (const [emojis, words] of Object.entries(reactions)) {
      const emojiArray = emojis.split(",");
      for (const word of words) {
        if (lowerBody.includes(word)) {
          try {
            const randomEmoji = emojiArray[Math.floor(Math.random() * emojiArray.length)];
            await api.setMessageReaction(randomEmoji, messageID, () => {}, true);
          } catch (e) {}
          return;
        }
      }
    }
  }
};

function getDefaultReactions() {
  return {
    "☑️,✅,💯,🆗,👍": ["ok", "yes", "accha", "thik", "good", "nice", "great", "awesome", "alright", "fine", "okay", "yep", "yeah", "right", "correct", "sure", "absolutely", "definitely", "indeed"],
    "😴,💤,🛌,🥱,😪": ["ghum", "ghumai", "sleep", "tired", "sleepy", "dozing", "yawn", "nap", "rest", "bedtime", "goodnight", "night night", "zzz"],
    "❤️,💕,💖,🥰,😍": ["love", "i love you", "love you", "luv", "lovely", "beloved", "crush", "affection", "heart", "romance", "sweet", "dear"],
    "💕,💖,🥺,😢,😭": ["miss you", "miss u", "missing", "longing", "yearning"],
    "😊,😄,🥳,😁,😃": ["happy", "joy", "cheerful", "glad", "delighted", "pleased", "ecstatic", "elated", "jubilant"],
    "😢,😭,💔,😞,🥺": ["sad", "unhappy", "depressed", "gloomy", "miserable", "heartbroken", "tears", "crying", "weep", "sorrow"],
    "😡,🤬,💢,😤,👿": ["angry", "mad", "furious", "rage", "irritated", "annoyed", "frustrated", "livid", "enraged", "outraged"],
    "😂,🤣,😆,🤪,😹": ["haha", "😂", "funny", "laugh", "hilarious", "amusing", "comical", "humorous", "joke", "laughter", "lol", "rofl"],
    "🥺,😍,🥰,😊,😻": ["cute", "adorable", "charming", "sweet", "lovable", "endearing", "precious", "darling"],
    "😍,🥰,🤩,😊,💖": ["beautiful", "gorgeous", "stunning", "attractive", "pretty", "lovely", "handsome", "goodlooking"],
    "🙏,🥰,☺️,😊,❤️": ["thank", "thanks", "thank you", "tysm", "thx", "grateful", "appreciate", "bless", "blessed"],
    "🥺,😔,🙏,😢,💔": ["sorry", "apologize", "pardon", "forgive", "regret", "remorse", "apologies", "my bad"],
    "🥰,🤍,😊,🩷,❤️": ["welcome", "you're welcome", "wlc", "most welcome"],
    "👋,😊,🥰,☺️,🙂": ["hello", "hi", "hey", "hii", "heyy", "hola", "greetings", "sup", "yo"],
    "👋,✌️,😪,🫂,💨": ["bye", "jaiga", "huss", "gelam", "jai"],
    "🖕,😡,😤,🫦,🤐": ["fuck", "fk", "fak", "fakiu", "f*ck", "fu*k"],
    "🌅,☀️,😊,🥰,🙂": ["morning", "good morning", "gud morning", "gm", "morn", "sunrise"],
    "🌙,🌃,😴,💤,🌌": ["night", "good night", "gud night", "gn", "nighty", "midnight", "evening"],
    "🍕,🍔,🍟,🌭,🍗": ["food", "hungry", "eating", "meal", "dinner", "lunch", "breakfast", "snack", "cuisine"],
    "🥤,🧋,☕,🍺,🍻": ["drink", "thirsty", "beverage", "soda", "juice", "smoothie", "milkshake"],
    "☕,😊,🥰,💪,😋": ["coffee", "caffeine", "espresso", "latte", "cappuccino", "mocha", "brew"],
    "🍵,😊,🥰,☺️,😋": ["tea", "chai", "green tea", "herbal", "oolong", "matcha"],
    "🎵,🎶,🎧,🎼,🎤": ["music", "song", "melody", "tune", "rhythm", "beat", "vibes", "playlist"],
    "💃,🕺,🎵,🎶,💫": ["dance", "groove", "boogie", "choreo", "move"],
    "🎬,🎥,🍿,🎞️,📽️": ["movie", "film", "cinema", "flick", "watch", "show", "binge", "stream"],
    "🎮,🕹️,🎯,🏆,🎲": ["game", "play", "gaming", "gamer", "esports", "tournament", "level", "quest"],
    "🏆,🥇,🎉,🎊,🥳": ["win", "winner", "victory", "champion", "success", "triumph", "1st"],
    "😢,💔,😞,🥺,😭": ["loss", "lose", "defeat", "failure", "losing", "lost"],
    "🎉,🎊,🥳,🎈,🎁": ["party", "celebration", "festive", "gathering", "bash", "clubbing"],
    "🎂,🎉,🎊,🥳,🎁": ["birthday", "bday", "happy birthday", "birth", "cake", "candles"],
    "🎁,🎀,🎉,🎊,💝": ["gift", "present", "surprise", "package", "parcel"],
    "📚,✏️,📝,🎓,📖": ["school", "college", "university", "study", "learn", "class", "teacher", "student", "lesson"],
    "📝,✏️,📚,😰,🤞": ["exam", "test", "quiz", "assessment", "paper", "review", "grade", "score"],
    "📊,📈,🎉,😢,🤞": ["result", "outcome", "conclusion", "findings", "analysis"],
    "💼,👔,💻,📊,💪": ["job", "work", "office", "career", "profession", "business", "company", "employment"],
    "🏠,🏡,❤️,😊,🥰": ["home", "house", "family", "residence", "living", "room"],
    "🚗,🚙,🏎️,🚘,🏁": ["car", "auto", "vehicle", "drive", "transport", "road trip", "highway"],
    "🏍️,🚲,🛵,🚴,💨": ["bike", "cycle", "bicycle", "motorcycle", "scooter", "ride"],
    "🚌,🚍,🚎,🚏,🚦": ["bus", "transit", "public transport", "commute"],
    "🚂,🚆,🚇,🚊,🚄": ["train", "railway", "subway", "metro", "locomotive"],
    "✈️,🛩️,🛫,🛬,🛸": ["plane", "airplane", "flight", "airport", "jet", "travel", "fly"],
    "🚢,🛳️,⛴️,🛥️,⚓": ["ship", "boat", "vessel", "cruise", "voyage", "sail", "ocean"],
    "☀️,🌤️,⛅,🌧️,🌈": ["weather", "forecast", "climate", "temp", "temperature"],
    "🌧️,☔,💧,⛈️,💦": ["rain", "rainy", "downpour", "shower", "storm", "wet", "flood"],
    "☀️,🌤️,😎,🌅,☀️": ["sunny", "bright", "sunshine", "clear", "warm"],
    "☁️,⛅,🌤️,🌥️,☁️": ["cloudy", "overcast", "gray", "gloomy"],
    "🥶,❄️,☃️,🧊,⛄": ["cold", "freezing", "chilly", "cool", "ice", "frost"],
    "🥵,☀️,🔥,🌡️,🥵": ["hot", "heat", "scorching", "boiling", "warm", "summer day"],
    "☀️,🌊,🏖️,😎,🌺": ["summer", "beach", "sun", "season", "sunny"],
    "❄️,☃️,🥶,🧤,🧣": ["winter", "season", "snow", "snowy", "blizzard", "cold"],
    "🌸,🌺,🌻,🌷,🌱": ["spring", "bloom", "blossom", "flowers", "season"],
    "🍂,🍁,🌾,🌅,🍂": ["autumn", "fall", "harvest", "season", "leaves"],
    "🌸,🌺,🌻,🌷,💐": ["flower", "floral", "bouquet", "garden", "petal"],
    "🌳,🌴,🌲,🌵,🌿": ["tree", "forest", "wood", "nature", "jungle", "palm"],
    "🐶,🐱,🐰,🦊,🐼": ["animal", "creature", "fauna", "wildlife", "beast"],
    "🐶,🐕,🦮,🐩,🦴": ["dog", "puppy", "canine", "pup", "hound"],
    "🐱,🐈,🐈‍⬛,😺,🐾": ["cat", "kitten", "feline", "kitty", "meow"],
    "🐦,🕊️,🦅,🦉,🦜": ["bird", "wing", "feather", "avian", "fly"],
    "🐟,🐠,🐡,🎣,🐙": ["fish", "fishing", "aquatic", "marine", "seafood"],
    "🦋,🐛,🐝,🐞,🐜": ["butterfly", "insect", "bug", "caterpillar", "moth"],
    "🐒,🙈,🙉,🙊,🐵": ["monkey", "ape", "primate", "chimpanzee", "gorilla"],
    "🦁,🐯,🐅,🐆,😼": ["lion", "tiger", "big cat", "predator", "wild"],
    "🐻,🐼,🐨,🐻‍❄️,🧸": ["bear", "panda", "koala", "teddy", "grizzly"],
    "🦊,🐺,🐶,🐱,🦝": ["fox", "cunning", "sly", "trickster", "wild"],
    "🐺,🦊,🐶,🐕,🐾": ["wolf", "pack", "howl", "predator", "wild"],
    "🦌,🐾,🌲,🌳,🍂": ["deer", "doe", "stag", "fawn", "antler"],
    "🐰,🐇,🥕,🐾,🌸": ["rabbit", "bunny", "hare", "hop", "fluffy"],
    "🐴,🐎,🐏,🐑,🏇": ["horse", "mare", "stallion", "colt", "pony"],
    "🐏,🐑,🐖,🐄,🐂": ["sheep", "lamb", "ram", "flock", "pasture"],
    "🐄,🐂,🐃,🐮,🥛": ["cow", "cattle", "bull", "moo", "dairy", "milk"],
    "🐷,🐖,🐽,🐗,🥓": ["pig", "hog", "swine", "bacon", "pork"],
    "🐔,🐓,🐣,🐥,🥚": ["chicken", "hen", "rooster", "poultry", "egg"],
    "🦆,🐦,🐤,🐥,🐔": ["duck", "duckling", "mallard", "quack", "pond"],
    "🐸,🐾,🌿,🌱,💚": ["frog", "toad", "amphibian", "hop", "pond"],
    "🐍,🐉,🐲,🦎,🐊": ["snake", "serpent", "python", "cobra", "venom"],
    "🦎,🐍,🐉,🐲,🐊": ["lizard", "reptile", "gecko", "iguana", "chameleon"],
    "🐢,🐚,🌊,🏝️,🐾": ["turtle", "tortoise", "shell", "terrapin", "slow"],
    "🐳,🐋,🐬,🐟,🌊": ["whale", "orca", "mammal", "ocean", "giant"],
    "🐬,🐳,🐋,🐟,🌊": ["dolphin", "porpoise", "cetacean", "ocean", "playful"],
    "🦈,🐟,🐠,🌊,💦": ["shark", "predator", "ocean", "jaws", "fish"],
    "🐙,🐚,🐟,🐠,🌊": ["octopus", "tentacle", "cephalopod", "ocean", "squid"],
    "🦀,🐚,🐟,🐠,🌊": ["crab", "crustacean", "shellfish", "claw", "beach"],
    "🦞,🦐,🦀,🐚,🌊": ["lobster", "shrimp", "seafood", "crustacean", "ocean"],
    "🐌,🐚,🐛,🐜,🐞": ["snail", "gastropod", "shell", "slime", "garden"],
    "🐛,🐜,🐞,🦗,🦟": ["bug", "insect", "creepy", "critter", "pest"],
    "🐝,🐞,🦋,🌺,🌸": ["bee", "honey", "nectar", "hive", "buzz", "sting"],
    "🐜,🐛,🐞,🐝,🦟": ["ant", "colony", "worker", "insect", "tiny"],
    "🕷️,🕸️,🐛,🐜,🐝": ["spider", "web", "arachnid", "eight legs", "creepy"],
    "🌙,🌕,🌖,🌗,🌘": ["moon", "lunar", "moonlight", "crescent", "full moon"],
    "⭐,🌟,✨,🌠,💫": ["star", "stars", "celestial", "astronomy", "twinkle"],
    "☀️,🌞,🌅,🌇,☀️": ["sun", "sunrise", "sunset", "daylight", "morning"],
    "☁️,⛅,🌤️,🌥️,☁️": ["cloud", "clouds", "sky", "overcast", "cloudy"],
    "🌈,☁️,🌧️,☀️,💫": ["rainbow", "color", "arc", "spectrum", "prism"],
    "❄️,☃️,⛄,🌨️,🧊": ["snow", "snowflake", "ice", "frost", "blizzard"],
    "⛈️,⚡,🌩️,💨,☁️": ["thunder", "lightning", "storm", "bolt", "electric"],
    "🔥,👹,💢,😡,🥵": ["fire", "flame", "burn", "blaze", "wildfire"],
    "🌍,🌎,🌏,🌐,🌱": ["earth", "world", "globe", "planet", "nature"],
    "🚀,🛸,👽,🌌,💫": ["rocket", "space", "launch", "orbit", "astronaut"],
    "🤖,👾,🛸,🚀,💻": ["robot", "android", "machine", "ai", "cyborg"],
    "👽,🛸,👾,🚀,🌌": ["alien", "extraterrestrial", "ufo", "space invader", "cosmic"],
    "👻,💀,👽,🕷️,🕸️": ["ghost", "spirit", "haunted", "supernatural", "phantom"],
    "💀,👻,☠️,🕷️,🕸️": ["skull", "death", "mortality", "bone", "grim"],
    "🤡,🎪,🎭,😈,👹": ["clown", "circus", "jester", "funny", "scary"],
    "😈,👿,💢,😡,🔥": ["devil", "demon", "evil", "hell", "satan"],
    "😇,👼,✨,⭐,🌟": ["angel", "heaven", "holy", "divine", "guardian"],
    "👸,👑,💎,✨,💖": ["princess", "royalty", "crown", "tiara", "elegant"],
    "🤴,👑,💎,✨,💖": ["prince", "royal", "crown", "noble", "handsome"],
    "👑,🏆,⚜️,✨,💫": ["king", "monarch", "ruler", "majesty", "sovereign"],
    "👑,👸,💎,✨,💫": ["queen", "royal", "monarch", "sovereign", "regnant"],
    "🦸,🦸‍♂️,🦸‍♀️,⚡,💪": ["superhero", "hero", "superpower", "cape", "avenger"],
    "🧙,🧙‍♂️,🧙‍♀️,🔮,✨": ["wizard", "mage", "sorcerer", "warlock", "enchanter"],
    "🧙,🧙‍♀️,🔮,🕯️,🧹": ["witch", "spell", "broomstick", "cauldron", "coven"],
    "🧚,🧚‍♂️,🧚‍♀️,✨,🌸": ["fairy", "fae", "magical", "enchanting", "tinkerbell"],
    "🧜,🧜‍♂️,🧜‍♀️,🌊,🐚": ["mermaid", "siren", "ocean", "sea", "coral"],
    "🧛,🧛‍♂️,🧛‍♀️,🦇,🩸": ["vampire", "blood", "fang", "undead", "dracula"],
    "🧟,🧟‍♂️,🧟‍♀️,💀,☠️": ["zombie", "undead", "apocalypse", "brain", "horror"],
    "🥷,🐱‍👤,🐱‍💻,🐱‍👓,🗡️": ["ninja", "stealth", "shadow", "shinobi", "kunoichi"],
    "🏴‍☠️,☠️,⚓,🦜,🗡️": ["pirate", "buccaneer", "treasure", "caribbean", "blackbeard"],
    "🎅,🤶,🧑‍🎄,🎄,🎁": ["santa", "santa claus", "christmas", "ho ho ho", "sleigh"],
    "🧝,🧝‍♂️,🧝‍♀️,✨,🎄": ["elf", "elves", "workshop", "elf on a shelf", "toys"],
    "🧌,🗡️,⚔️,🛡️,🏔️": ["dwarf", "dwarves", "mine", "smith", "warrior"],
    "👹,🗡️,⚔️,🛡️,🏔️": ["giant", "ogre", "troll", "monster", "colossus"],
    "🐉,🐲,🔥,🗡️,⚔️": ["dragon", "wyrm", "fire", "mythical", "scales"],
    "🦄,🌈,⭐,✨,💖": ["unicorn", "magical", "mythical", "rainbow", "horn"],
    "🐦‍🔥,🔥,☀️,⭐,✨": ["phoenix", "immortal", "rebirth", "mythical", "fire bird"],
    "🦅,🦁,🐉,🦄,⚜️": ["griffin", "griffon", "mythical", "eagle", "lion"],
    "👁️,🐉,🐲,🗡️,⚔️": ["cyclops", "one eyed", "mythical", "giant", "polyphemus"],
    "🐴,🏹,🗡️,⚔️,🌳": ["centaur", "horse man", "mythical", "archer", "wise"],
    "🦁,👤,🔮,🗿,🏛️": ["sphinx", "riddle", "mythical", "guardian", "egyptian"],
    "🐂,🐉,🗡️,⚔️,🏛️": ["minotaur", "labyrinth", "mythical", "bull", "maze"],
    "🐍,👩,🗡️,⚔️,🏛️": ["medusa", "gorgon", "mythical", "snake hair", "stone"],
    "🐴,🦄,⭐,✨,☁️": ["pegasus", "winged horse", "mythical", "constellation", "white"],
    "🐙,🦑,🌊,⚓,🚢": ["kraken", "sea monster", "mythical", "tentacles", "legend"],
    "🐺,🌙,🐾,🦷,😈": ["werewolf", "wolf man", "lycan", "full moon", "howl"],
    "😑,😐,🥱,😒,🤷": ["bored", "uninterested", "tired", "dull", "monotonous"],
    "⏳,⌛,⏰,🕐,🤞": ["wait", "waiting", "patience", "hold on", "just a sec"],
    "⏳,⌛,⏰,🕐,🏃": ["hurry", "hurry up", "fast", "quick", "speed"],
    "✅,✔️,☑️,💯,🎯": ["done", "complete", "finished", "finished", "completed", "ready"],
    "🚀,🏁,▶️,⏩,✨": ["start", "begin", "initiate", "commence", "launch"],
    "✋,⏹️,🛑,🚫,❌": ["stop", "halt", "cease", "pause", "freeze"],
    "⏸️,✋,⏹️,🛑,⏳": ["pause", "break", "intermission", "hold", "standby"],
    "⏩,▶️,🚀,✨,💪": ["continue", "resume", "proceed", "carry on", "keep going"],
    "🤔,🧐,🤷,😐,🤨": ["maybe", "perhaps", "possibly", "uncertain", "not sure"],
    "🤷,😐,🤔,🧐,😅": ["idk", "dont know", "no idea", "unknown", "unsure"],
    "🤷,😒,😑,😐,🤷‍♂️": ["whatever", "whatevs", "nevermind", "who cares", "anyway"],
    "😐,🧐,🤨,😑,🙄": ["serious", "grave", "solemn", "earnest", "severe"],
    "😳,🤯,😱,🤨,🧐": ["really", "honest", "truly", "seriously", "for real"],
    "😱,🤯,😳,🙀,😨": ["omg", "oh my god", "wow", "astounding", "staggering"],
    "😲,🤩,😮,😯,😱": ["wow", "whoa", "amaze", "marvel", "astonish"],
    "🤩,😲,😮,😯,🌟": ["amazing", "astounding", "phenomenal", "spectacular", "incredible"],
    "😱,🤯,😳,😲,🤩": ["unbelievable", "inconceivable", "mindblowing", "unreal", "mythical"],
    "😱,🤯,😳,😲,🙀": ["shocking", "jarring", "startling", "bombshell", "stunning"],
    "🎉,🎊,🤯,😱,🎁": ["surprise", "unexpected", "stunning", "mystify", "perplex"],
    "🎉,🎊,✅,💯,🎯": ["finally", "at last", "ultimately", "eventually", "lastly"],
    "🎉,🎊,🥳,🎈,🎁": ["congrats", "congratulations", "bravo", "huzzah", "well done"],
    "🏆,🥇,⭐,🌟,💯": ["best", "finest", "greatest", "premium", "superior"],
    "😢,💔,😭,🤮,👎": ["worst", "terrible", "awful", "dreadful", "horrible"],
    "😢,💔,😭,🤮,👎": ["bad", "unpleasant", "poor", "inferior", "substandard"],
    "☑️,✅,💯,👌,👍": ["good", "excellent", "superb", "outstanding", "top notch"],
    "🌟,⭐,💯,🏆,🥇": ["excellent", "exceptionally good", "brilliant", "superb", "unbeatable"],
    "💯,✅,☑️,🌟,⭐": ["perfect", "flawless", "impeccable", "ideal", "supreme"],
    "☑️,✅,💯,👌,🔥": ["awesome", "mindblowing", "fantastic", "unreal", "glorious"],
    "🌟,⭐,💯,🏆,🥇": ["brilliant", "shining", "bright", "vivid", "radiant"],
    "😎,👌,👍,💯,🔥": ["cool", "wicked", "rad", "fresh", "dope"],
    "💪,🔥,✨,🌟,⭐": ["super", "superb", "exemplary", "supreme", "ultimate"],
    "💪,🔥,✨,🌟,⭐": ["ultra", "extreme", "mega", "super", "hyper"],
    "💪,🔥,✨,🌟,⭐": ["mega", "grand", "huge", "massive", "tremendous"],
    "💪,🔥,✨,🌟,⭐": ["huge", "colossal", "enormous", "gigantic", "immense"],
    "🐣,🐥,🐝,🐜,??": ["tiny", "mini", "micro", "petite", "diminutive"],
    "🐣,🐥,🐝,🐜,🐛": ["small", "little", "compact", "modest", "miniature"],
    "🐘,🐳,🐋,🦍,🐻": ["big", "large", "huge", "giant", "massive"],
    "🐘,🐳,🐋,🦍,🐻": ["large", "big", "sizable", "grand", "bulky"],
    "🏃,💨,⚡,🚀,🛸": ["fast", "quick", "rapid", "swift", "speedy"],
    "🐢,🐌,🏃,💨,😴": ["slow", "gradual", "sluggish", "lethargic", "easy"],
    "⚡,💨,🏃,🚀,🛸": ["quick", "fast", "rapid", "brisk", "hasty"],
    "⏳,⌛,⏰,🕐,🤞": ["soon", "shortly", "momentarily", "coming", "proximity"],
    "⏳,⌛,⏰,🕐,🕒": ["later", "eventually", "soon after", "afterward", "following"],
    "⏰,⚡,🔴,⏩,▶️": ["now", "immediately", "instantly", "currently", "presently"],
    "⏰,⚡,🔴,⏩,▶️": ["immediate", "instant", "prompt", "direct", "swift"],
    "⏰,⚡,🔴,🚨,❗": ["urgent", "critical", "pressing", "vital", "paramount"],
    "⭐,🌟,❗,🔴,💯": ["important", "significant", "crucial", "essential", "key"],
    "⭐,🌟,❗,🔴,🚨": ["critical", "crucial", "vital", "serious", "grave"],
    "🚨,⚠️,☣️,☢️,⚡": ["danger", "perilous", "hazardous", "risky", "precarious"],
    "✅,✔️,☑️,🔒,🛡️": ["safe", "secure", "protected", "sure", "reliable"],
    "✅,✔️,☑️,🔒,🛡️": ["secure", "safe", "fortified", "guarded", "shielded"],
    "🛡️,🔒,🚨,⚡,💪": ["protect", "guard", "defend", "safeguard", "preserve"],
    "🛡️,🔒,🚨,⚡,💪": ["guard", "watch", "protect", "shield", "defend"],
    "🤝,👫,👬,👭,💕": ["friend", "pal", "buddy", "companion", "bro"],
    "🤝,👫,👬,👭,💕": ["friendship", "bond", "relationship", "camaraderie", "unity"],
    "👨‍👩‍👦,👪,❤️,💕,🏠": ["family", "kin", "relative", "household", "dynasty"],
    "👦,👨,💪,🤝,❤️": ["brother", "bro", "sibling", "protector", "supporter"],
    "👧,👩,💕,🤝,❤️": ["sister", "sis", "sibling", "friend", "confidante"],
    "👩,👩‍👦,❤️,💕,🌺": ["mother", "mom", "mama", "nurturer", "protector"],
    "👨,👨‍👦,❤️,💕,💪": ["father", "dad", "papa", "father figure", "provider"],
    "👶,🍼,🧸,💕,❤️": ["baby", "infant", "newborn", "toddler", "babe"],
    "👶,🧒,🧑,👦,👧": ["child", "kid", "minor", "youngster", "offspring"],
    "🧑,👦,👧,👨‍🎓,👩‍🎓": ["teen", "teenager", "adolescent", "youth", "youngster"],
    "🧑,👨,👩,💼,👔": ["adult", "grownup", "major", "mature", "fully grown"],
    "👴,👵,🧓,👨‍🦳,👩‍🦳": ["old", "aged", "elderly", "senior", "ancient"],
    "👶,🧒,🧑,👦,👧": ["young", "youthful", "juvenile", "new", "fresh"],
    "🆕,✨,🌟,💫,🎉": ["new", "recent", "novel", "original", "innovative"],
    "🆖,⏳,⌛,🕐,📅": ["old", "ancient", "archaic", "outdated", "vintage"],
    "🆕,✨,🌟,💫,🌿": ["fresh", "new", "recent", "novel", "rejuvenated"],
    "🆕,✨,🌟,💫,🧹": ["clean", "pure", "sanitary", "hygienic", "immaculate"],
    "🤮,😷,🤢,🧹,💩": ["dirty", "unclean", "filthy", "soiled", "grimy"],
    "🤮,😷,🤢,🧹,💩": ["mess", "disorder", "chaos", "clutter", "confusion"],
    "🆕,✨,🌟,💫,🧹": ["tidy", "neat", "orderly", "organized", "clean"],
    "📊,📈,📋,📁,🗂️": ["organized", "structured", "systematic", "orderly", "methodical"],
    "🌀,🌪️,🌊,🔥,💢": ["chaos", "disarray", "turmoil", "anarchy", "havoc"],
    "📊,📈,📋,📁,🗂️": ["order", "sequence", "structure", "arrangement", "system"],
    "🕊️,☮️,✌️,❤️,💕": ["peace", "harmony", "serenity", "tranquility", "calm"],
    "⚔️,🗡️,🔫,💣,🔥": ["war", "conflict", "battle", "combat", "hostility"],
    "⚔️,🗡️,🔫,💣,🤜": ["fight", "brawl", "struggle", "combat", "scuffle"],
    "⚔️,🗡️,🔫,💣,🤜": ["battle", "skirmish", "engagement", "campaign", "war"],
    "🏆,🥇,🎉,🎊,💪": ["victory", "triumph", "conquest", "success", "win"],
    "😢,💔,😭,🤮,👎": ["defeat", "loss", "failure", "defeat", "downfall"],
    "💪,⚡,🔥,🚀,💯": ["power", "strength", "force", "energy", "might"],
    "💪,⚡,🔥,🚀,💯": ["strength", "power", "force", "potency", "energy"],
    "⚡,💫,✨,🌟,🔥": ["energy", "vitality", "vigor", "spirit", "moxie"],
    "💫,✨,🌟,⭐,❤️": ["spirit", "soul", "essence", "heart", "core"],
    "💫,✨,🌟,⭐,❤️": ["soul", "spirit", "essence", "heart", "psyche"],
    "🧠,💡,🤔,🧐,💭": ["mind", "brain", "intellect", "psyche", "consciousness"],
    "🧠,💡,🤔,🧐,💭": ["brain", "mind", "intellect", "cognition", "grey matter"],
    "🤔,🧐,💭,🧠,💡": ["think", "contemplate", "reflect", "ponder", "cogitate"],
    "💭,🤔,🧐,🧠,💡": ["thought", "idea", "notion", "concept", "consideration"],
    "💡,🤔,🧐,💭,✨": ["idea", "concept", "notion", "thought", "inspiration"],
    "📋,📝,📊,📈,🎯": ["plan", "scheme", "strategy", "design", "proposal"],
    "📋,📝,📊,📈,🎯": ["strategy", "tactic", "approach", "plan", "method"],
    "🎯,🏆,🥇,⭐,🌟": ["goal", "objective", "target", "aim", "ambition"],
    "💭,🌙,⭐,🌟,✨": ["dream", "aspiration", "vision", "fantasy", "ambition"],
    "💭,🌙,⭐,🌟,✨": ["wish", "desire", "longing", "hope", "aspiration"],
    "💭,🌙,⭐,🌟,✨": ["hope", "optimism", "aspiration", "expectation", "faith"],
    "💭,🌙,⭐,🌟,✨": ["believe", "faith", "trust", "conviction", "confidence"],
    "💭,🌙,⭐,🌟,✨": ["faith", "belief", "trust", "conviction", "creed"],
    "🤝,💕,❤️,🥰,💖": ["trust", "confidence", "reliance", "depend", "credence"],
    "🤝,💕,❤️,🥰,💖": ["honest", "truthful", "sincere", "candid", "forthright"],
    "🤝,💕,❤️,🥰,💖": ["loyal", "faithful", "devoted", "committed", "steadfast"],
    "🦁,🐯,💪,⚡,🔥": ["brave", "courageous", "fearless", "heroic", "valiant"],
    "🦁,🐯,💪,⚡,🔥": ["courage", "bravery", "valor", "fearlessness", "resolve"],
    "😨,😱,🫣,🙀,😰": ["fear", "afraid", "scared", "terrified", "frightened"],
    "😨,😱,🫣,🙀,😰": ["scared", "afraid", "fearful", "terrified", "panicked"],
    "😰,😥,😬,🫣,😨": ["nervous", "anxious", "uneasy", "apprehensive", "troubled"],
    "🥳,🤩,😁,😄,🎉": ["excited", "enthusiastic", "thrilled", "eager", "passionate"],
    "😰,😥,😬,🫣,😨": ["anxious", "worried", "concerned", "apprehensive", "nervous"],
    "😌,🧘,🕊️,☮️,✌️": ["calm", "serene", "peaceful", "tranquil", "composed"],
    "😌,🧘,🕊️,☮️,✌️": ["relax", "unwind", "rest", "chill", "decompress"],
    "😰,😥,😬,🫣,😨": ["stress", "pressure", "strain", "tension", "worry"],
    "🕊️,☮️,✌️,❤️,💕": ["peaceful", "tranquil", "harmonious", "serene", "calm"],
    "🤫,🫢,😶,❎,❌": ["quiet", "silent", "hushed", "still", "noiseless"],
    "🔊,📢,📣,💥,🔥": ["loud", "boisterous", "noisy", "thundering", "deafening"],
    "🤫,🫢,😶,🕊️,☮️": ["silent", "quiet", "mute", "still", "soundless"],
    "🤷,😒,😑,😐,🤷‍♂️": ["whatever", "whatevs", "nevermind", "who cares", "anyway"],
    "😐,🧐,🤨,😑,🙄": ["serious", "grave", "solemn", "earnest", "severe"]
  };
}
