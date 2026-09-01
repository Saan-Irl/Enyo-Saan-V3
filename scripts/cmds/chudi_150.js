module.exports.config = {
    name: "tormarechudi",
    version: "4.0",
    role: 2,
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    description: "150 Unique Banglish tag list (3.5s gap)",
    category: "nsfw",
    guide: "{pn} @mention ba reply",
    coolDown: 30
};

module.exports.onStart = async function({ api, event, args }) {
    const { threadID, messageID, mentions, type, messageReply } = event;
    let targetID, name;

    if (type === "message_reply") targetID = messageReply.senderID;
    else if (Object.keys(mentions).length > 0) targetID = Object.keys(mentions)[0];

    if (!targetID) return api.sendMessage("Kire vodai, jare gali dibi tare mention de!", threadID, messageID);

    const userInfo = await api.getUserInfo(targetID);
    name = userInfo[targetID].name;
    const arraytag = [{ id: targetID, tag: name }];

    api.sendMessage(`Target: ${name}\nEbar real 150 shot shuru... tui thak ebar!`, threadID);

    const insults = [
        "Tor ammur kochi vuday amar gorom mal dimu.", "Khankir pola tor boner vuda ekhon amar dokhole.",
        "Tor maire chudte chudte nodite vashaya dimu.", "Maderchod tor boner vuday kukur diya chudamu.",
        "Tor ammu re hotel e pathaya taka kamamu ami.", "Tor boner vuda kete kukur ke khawamu.",
        "Tor maire chude lungi khule dimu maderchod.", "Tor ammur vuday petrol dhele agun jalamu.",
        "Khankir chele tor bon re niye park e chudbo.", "Tor maire chude pitha banamu nishi rate.",
        "Tor ammur hoda diya train chalamu vodai.", "Tor boner vuday lathi diya khuciye dimu.",
        "Tor maire chudte chudte pichon diya dim ber korbo.", "Tor ammur vuday bombay morich er gura dimu.",
        "Tor bon re chude dhaka sohor ghuramu khankir po.", "Tor maire chude shara dunya dekhamu.",
        "Tor ammur vuday ekhon o dhon dukhle tui rag korish.", "Tor boner kochi vuday kukur er mal out korbo.",
        "Tor maire chude bucket vore mal ber korbo.", "Tor ammu re bus stand e line dhoraya chudmu.",
        "Khankir pola tor boner vuday moricher gura dimu.", "Kire jaroj tor bap ki ekhono rasta te vaat khay?",
        "Tor boner kochi vuday amar dula bhai er gari chalamu.", "Tor ammur vuday pichon diya bash dukamu.",
        "Tor maire chude achar banamu ami maderchod.", "Tor boner vuday kaktarua dhukaya dimu.",
        "Tor ammu re launch er cabin e chudche amar bondhura.", "Tor boner hoda diya rasta banamu maderchod.",
        "Tor ammur kala vuday amar lal dhon dukamu ekhoni.", "Tor maire chudte chudte chader deshe niye jamu.",
        "Tor ammu re gorur gari te tule chudmu gramer moddhe.", "Maderchod tor bon ke mela te niye chude aslam.",
        "Tor mar buira voday ekhon o ros ache magir pola.", "Tokai magir pola tor maire chude ammer achar banamu.",
        "Tor boner vuday lathi diye chudmu kuttar baccha.", "Magir chele tor maire chudte chudte mal out korbo.",
        "Tor mare dhaka sohorer rasta te shuyaya chudbo.", "Kire jaroj tor ammu re ki ekhon o vut e chude?",
        "Tor ammur kochi voday gorom tel dhele chudamu.", "Tor boner pichone boma mariye fatiye dimu.",
        "Tor maire chudte chudte paharer upor niye jamu.", "Gadha magir pola tor mar voday dhon dukhle moja pash?",
        "Tor ammur vuday kapor kachar shaban diya chudmu.", "Tor boner vuday electric shock dimu khankir pola.",
        "Tor maire chude vatar banamu ami tor notun bap.", "Tor ammur vuday murgir baccha chash korum.",
        "Tor boner vuda fakiye lal morich er guira dimu.", "Tor maire chude shara gayer manush ke dawat dimu.",
        "Khankir chele tor ammu re chudte amar khub valo lage.", "Tor boner vuday kochi bash er killa dukamu.",
        "Tor maire chude stadium e pathaya dimu shobar jonno.", "Tor ammur vuday pichon diya rasta banamu.",
        "Tor boner vuday moricher jhal dimu magir pola.", "Tor maire chude bucket vore mal ber korbo.",
        "Tor ammu re rasta te nengto kore chudmu.", "Tor boner vuday kukur er baccha jonmo dawamu.",
        "Tor maire chude lungi fira banamu maderchod.", "Tor ammur vuday gorom teler pitha banamu.",
        "Tor boner vuday dhon dhukale kemon lage re?", "Tor maire chude ammer tel banamu magir pola.",
        "Tor ammu re bazarer manush diye chudamu.", "Tor boner vuday kaktarua dhukaya dimu.",
        "Tor maire chude pitha banamu maderchod.", "Tor ammur vuday bash diya khuchamu.",
        "Tor boner vuday kukur er mal out korbo.", "Tor maire chudte chudte paharer upor niye jamu.",
        "Tor ammur vuday petrol dhele agun jalaya dimu.", "Tor boner vuday lathi diya khuciye dimu.",
        "Tor maire chude dhaka sohor ghuramu khankir po.", "Tor ammur vuday ekhon o dhon dukhle tui rag korish.",
        "Tor boner kochi vuday kukur er mal out korbo.", "Tor maire chude bucket vore mal ber korbo.",
        "Tor ammu re bus stand e line dhoraya chudmu.", "Khankir pola tor boner vuday moricher gura dimu.",
        "Kire jaroj tor bap ki ekhono rasta te vaat khay?", "Tor boner kochi vuday amar gari chalamu.",
        "Tor ammur vuday pichon diya bash dukamu.", "Tor maire chude achar banamu ami maderchod.",
        "Tor boner vuday kaktarua dhukaya dimu.", "Tor ammu re launch er cabin e chudche amar bondhura.",
        "Tor boner hoda diya rasta banamu maderchod.", "Tor ammur kala vuday amar lal dhon dukamu ekhoni.",
        "Tor maire chudte chudte chader deshe niye jamu.", "Tor ammu re gorur gari te tule chudmu gramer moddhe.",
        "Maderchod tor bon ke mela te niye chude aslam.", "Tor mar buira voday ekhon o ros ache magir pola.",
        "Tokai magir pola tor maire chude ammer achar banamu.", "Tor boner vuday lathi diye chudmu kuttar baccha.",
        "Magir chele tor maire chudte chudte mal out korbo.", "Tor mare dhaka sohorer rasta te shuyaya chudbo.",
        "Kire jaroj tor ammu re ki ekhon o vut e chude?", "Tor ammur kochi voday gorom tel dhele chudamu.",
        "Tor boner pichone boma mariye fatiye dimu.", "Tor maire chudte chudte paharer upor niye jamu.",
        "Gadha magir pola tor mar voday dhon dukhle moja pash?", "Tor ammur vuday kapor kachar shaban diya chudmu.",
        "Tor boner vuday electric shock dimu khankir pola.", "Tor maire chude vatar banamu ami tor notun bap.",
        "Tor ammur vuday murgir baccha chash korum.", "Tor boner vuda fakiye lal morich er guira dimu.",
        "Tor maire chude rasta porishkar korbo magir chele.", "Tor ammur vuday dhon dhukaye dhol banamu.",
        "Tor boner vuda ekhon bogurar doiye thake maderchod.", "Tor maire chudte chudte pichon diya dhua ber korbo.",
        "Tor ammu re niye jabo shob bondhuder party te.", "Tor boner vuday boro size er kathal dukamu.",
        "Tor maire chude kacha moricher jhal khawamu.", "Tor ammur hoda fatiye lal kore dimu magir po.",
        "Tor bon re chudbo tui shamne bose dekhbi harami.", "Tor maire chude dhakar rasta te nengto korbo.",
        "Tor ammur vuday ekhon o amar nam lekha vodai.", "Tor boner kochi vuday boro mochi dukamu.",
        "Tor maire chude chira kathi diya khuciye khire banamu.", "Tor boner vuday kuler acharer moto mosla dimu.",
        "Tor maire chudte chudte chader upor niye dhakkamu.", "Tor ammu re rasta te nengto kore dance koramu.",
        "Tor boner vuda kete shidaler shutki banamu.", "Tor maire chude bishal boro gadda banamu voday.",
        "Tor ammur hoda te electric fan chalaia dimu.", "Tor boner vuday kukur er taja mal out korbo.",
        "Tor maire chudte chudte nodir pani shukaia felmu.", "Tor ammu re chudbo ekhon rasta rasta ghuraia.",
        "Tor boner vuday gorom teler bora bhajmu maderchod.", "Tor maire chude dhaka sohorer main road e rakhmu.",
        "Tor ammur vuday kapor kachar brash diya ghoshmu.", "Tor boner vuda ekhon bogurar doiye thake harami.",
        "Tor maire chude rasta porishkar korbo besha magir pola.", "Tor ammu re chudte chudte shara rasta lal korbo.",
        "Tor boner vuday boro size er kathal dukamu.", "Tor maire chude kacha moricher jhal khawamu.",
        "Tor ammur hoda fatiye lal kore dimu magir po.", "Tor bon re chudbo tui shamne bose dekhbi harami.",
        "Tor maire chude dhakar rasta te nengto korbo.", "Tor ammur vuday ekhon o amar nam lekha vodai.",
        "Tor boner kochi vuday boro mochi dukamu.", "Tor maire chude chira kathi diya khuciye khire banamu.",
        "Tor boner vuday kuler acharer moto mosla dimu.", "Tor maire chudte chudte chader upor niye dhakkamu.",
        "Tor ammu re rasta te nengto kore dance koramu.", "Tor boner vuda kete shidaler shutki banamu.",
        "Tor maire chude bishal boro gadda banamu voday.", "Tor ammur hoda te electric fan chalaia dimu.",
        "Tor boner vuday kukur er taja mal out korbo.", "Tor maire chudte chudte nodir pani shukaia felmu.",
        "Tor ammu re chudbo ekhon rasta rasta ghuraia.", "Tor boner vuday gorom teler bora bhajmu maderchod.",
        "Tor maire chude dhaka sohorer main road e rakhmu.", "Tor ammur vuday kapor kachar brash diya ghoshmu.",
        "Tor boner vuda ekhon bogurar doiye thake harami.", "Tor maire chude rasta porishkar korbo besha magir pola.",
        "Tor ammu re chudte chudte shara rasta lal korbo.", "Tor boner vuday boro size er kathal dukamu.",
        "Tor maire chude kacha moricher jhal khawamu.", "Tor ammur hoda fatiye lal kore dimu magir po.",
        "Tor bon re chudbo tui shamne bose dekhbi harami.", "Tor maire chude dhakar rasta te nengto korbo.",
        "Tor ammur vuday ekhon o amar nam lekha vodai.", "Tor boner kochi vuday boro mochi dukamu.",
        "Tor maire chude chira kathi diya khuciye khire banamu.", "Tor boner vuday kuler acharer moto mosla dimu."
    ];

    let delay = 4000; 
    insults.forEach((text) => {
        setTimeout(() => {
            api.sendMessage({ body: `${text} ${name}`, mentions: arraytag }, threadID);
        }, delay);
        delay += 4000; 
    });

    setTimeout(() => {
        api.sendMessage("~ Mission Over! 150 unique shot complete. Tui ebar palaili koi!", threadID);
    }, delay);
};
