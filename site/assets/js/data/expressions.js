/* ==========================================================================
   HSK 2 · Expressions (学一学 Learn the new expressions)
   Transcribed from exam-materials/expressions (lessons 1–5, 7–15; there is
   no page for lesson 6). Each new expression is built from two words the
   learner already knows: keep one piece of each and join them.
   ========================================================================== */
(function () {
  "use strict";

  /* Word-building patterns. `ends` = the characters that mark the pattern. */
  const PATTERNS = {
    kind: {
      zh: "哪种 + 什么", label: "Kind + thing", short: "Kind + thing",
      formula: ["which kind", "what it is"],
      desc: "The last character names the thing; whatever comes first says which kind. The first part can be another thing (茶杯) or a description (白猫, 大楼).",
      icon: "tag"
    },
    place: {
      zh: "地方", label: "Place words", short: "Place",
      formula: ["what's there", "站 · 店 · 馆 · 室"],
      ends: { "站": ["zhàn", "station, stop"], "店": ["diàn", "shop"], "馆": ["guǎn", "house, hall"], "室": ["shì", "room"] },
      desc: "End with a place character and you have somewhere to go: a station, a shop, a teahouse, a room.",
      icon: "place"
    },
    people: {
      zh: "人", label: "People words", short: "People",
      formula: ["what kind", "生 · 师"],
      ends: { "生": ["shēng", "student"], "师": ["shī", "master"] },
      desc: "生 (from 学生) makes a student, 师 (from 老师) makes a master of a skill.",
      icon: "person"
    },
    action: {
      zh: "做什么", label: "Do + what", short: "Do + what",
      formula: ["action", "what / how"],
      desc: "An action, then what it's done to (洗车, 等车, 回国) or how it turned out (说错).",
      icon: "action"
    },
    pair: {
      zh: "一对", label: "Pairs", short: "Pair",
      formula: ["A", "B"],
      desc: "Two things that belong together become one word for both: husband + wife, table + chair.",
      icon: "pair"
    },
    position: {
      zh: "在哪儿", label: "Where", short: "Where",
      formula: ["thing", "前 · 后 · 旁"],
      ends: { "前": ["qián", "in front"], "后": ["hòu", "behind"], "旁": ["páng", "beside"] },
      desc: "A thing, then a position: 楼前 in front of the building, 门后 behind the door, 身旁 by your side.",
      icon: "pin"
    },
    helper: {
      zh: "小帮手", label: "Helper words", short: "Helper",
      formula: ["好 · 请 · 下", "word"],
      ends: { "好": ["hǎo", "nice to …"], "请": ["qǐng", "please …"], "下": ["xià", "next …"] },
      desc: "A small helper word in front changes the meaning: 好 nice to …, 请 please …, 下 next ….",
      icon: "spark"
    }
  };

  /* One source word: [word, per-character pinyin, English, kept indices, gloss of the kept piece] */
  const src = (a) => ({ w: a[0], py: a[1].split(" "), en: a[2], keep: a[3], g: a[4] });

  /* One expression. o.rp overrides a result syllable (tone that comes back). */
  function x(w, py, en, pat, a, b, s, o) {
    o = o || {};
    const A = src(a), B = src(b);
    const rp = [...A.keep.map((i) => A.py[i]), ...B.keep.map((i) => B.py[i])];
    Object.entries(o.rp || {}).forEach(([i, v]) => { rp[+i] = v; });
    return { w, py, en, pat, from: [A, B], rp, s: { zh: s[0], py: s[1], en: s[2] }, note: o.note || "" };
  }

  const LESSONS = [
    { n: 1, items: [
      x("好喝", "hǎohē", "tasty (to drink)", "helper",
        ["好吃", "hǎo chī", "delicious (food)", [0], "good to"],
        ["喝", "hē", "to drink", [0], "drink"],
        ["这杯茶很好喝。", "Zhè bēi chá hěn hǎohē.", "This cup of tea is really nice."],
        { note: "好吃 is for food, 好喝 for drinks. Same idea: 好看 (nice to look at), 好听 (nice to hear)." }),
      x("茶杯", "chábēi", "teacup", "kind",
        ["茶", "chá", "tea", [0], "tea"],
        ["杯子", "bēi zi", "cup", [0], "cup"],
        ["桌子上有两个茶杯。", "Zhuōzi shang yǒu liǎng ge chábēi.", "There are two teacups on the table."]),
      x("雨衣", "yǔyī", "raincoat", "kind",
        ["雨", "yǔ", "rain", [0], "rain"],
        ["衣服", "yī fu", "clothes", [0], "clothes"],
        ["下雨了，穿上雨衣吧。", "Xià yǔ le, chuānshang yǔyī ba.", "It's raining. Put on your raincoat."])
    ], quiz: [
      { type: "build", x: 1 },
      { type: "meaning", x: 2, opts: ["raincoat", "umbrella", "rainy day", "swimsuit"],
        why: "雨 rain + 衣 clothes: clothes for the rain. (An umbrella is 雨伞 yǔsǎn.)" },
      { type: "cloze", x: 0, s: ["这个奶茶很＿＿，你也喝一点儿吧。", "Zhège nǎichá hěn hǎohē, nǐ yě hē yìdiǎnr ba.", "This milk tea is really nice. Have some too."],
        why: "It's a drink, so it's 好喝, not 好吃." }
    ] },

    { n: 2, items: [
      x("公交站", "gōngjiāozhàn", "bus stop", "place",
        ["公交车", "gōng jiāo chē", "bus", [0, 1], "bus"],
        ["车站", "chē zhàn", "station, stop", [1], "stop"],
        ["公交站就在学校旁边。", "Gōngjiāozhàn jiù zài xuéxiào pángbiān.", "The bus stop is right next to the school."]),
      x("火车站", "huǒchēzhàn", "train station", "place",
        ["火车", "huǒ chē", "train", [0, 1], "train"],
        ["车站", "chē zhàn", "station, stop", [1], "station"],
        ["我们几点去火车站？", "Wǒmen jǐ diǎn qù huǒchēzhàn?", "What time are we going to the train station?"]),
      x("下次", "xià cì", "next time", "helper",
        ["下", "xià", "below; next", [0], "next"],
        ["次", "cì", "time (occurrence)", [0], "time"],
        ["今天太晚了，我们下次再去吧。", "Jīntiān tài wǎn le, wǒmen xià cì zài qù ba.", "It's too late today. Let's go next time."])
    ], quiz: [
      { type: "build", x: 0 },
      { type: "meaning", x: 2, opts: ["next time", "last time", "next stop", "get off"],
        why: "下 next + 次 time. “Last time” is 上次 shàng cì: 上 and 下 work as a pair." },
      { type: "cloze", x: 1, s: ["我要坐火车去北京，先去＿＿。", "Wǒ yào zuò huǒchē qù Běijīng, xiān qù huǒchēzhàn.", "I'm taking the train to Beijing, so first I go to the train station."],
        why: "A train leaves from the 火车站. Buses stop at the 公交站." }
    ] },

    { n: 3, items: [
      x("书桌", "shūzhuō", "desk", "kind",
        ["书", "shū", "book", [0], "book"],
        ["桌子", "zhuō zi", "table", [0], "table"],
        ["我的书桌上有很多书。", "Wǒ de shūzhuō shang yǒu hěn duō shū.", "There are lots of books on my desk."]),
      x("洗车", "xǐchē", "to wash a car", "action",
        ["洗", "xǐ", "to wash", [0], "wash"],
        ["公交车", "gōng jiāo chē", "bus", [2], "vehicle"],
        ["爸爸星期六去洗车。", "Bàba xīngqīliù qù xǐchē.", "Dad goes to wash the car on Saturday."]),
      x("回国", "huí guó", "to return to one's country", "action",
        ["回来", "huí lái", "to come back", [0], "return"],
        ["中国", "Zhōng guó", "China", [1], "country"],
        ["他下个月回国。", "Tā xià ge yuè huí guó.", "He's going back to his country next month."])
    ], quiz: [
      { type: "build", x: 2 },
      { type: "meaning", x: 0, opts: ["desk", "bookshelf", "bookshop", "dining table"],
        why: "书 book + 桌 table: the table you read and write at." },
      { type: "cloze", x: 1, s: ["爸爸的车不干净了，他要去＿＿。", "Bàba de chē bù gānjìng le, tā yào qù xǐchē.", "Dad's car isn't clean any more, so he's going to wash it."],
        why: "A dirty car needs 洗车: 洗 wash + 车 car." }
    ] },

    { n: 4, items: [
      x("休息室", "xiūxishì", "lounge, break room", "place",
        ["休息", "xiū xi", "to rest", [0, 1], "rest"],
        ["教室", "jiào shì", "classroom", [1], "room"],
        ["老师们在休息室喝茶。", "Lǎoshīmen zài xiūxishì hē chá.", "The teachers are drinking tea in the staff room."]),
      x("饭菜", "fàncài", "meal, food", "pair",
        ["米饭", "mǐ fàn", "cooked rice", [1], "rice"],
        ["菜", "cài", "dish", [0], "dishes"],
        ["妈妈做的饭菜很好吃。", "Māma zuò de fàncài hěn hǎochī.", "The food Mum makes is delicious."]),
      x("白猫", "bái māo", "white cat", "kind",
        ["白色", "bái sè", "white", [0], "white"],
        ["猫", "māo", "cat", [0], "cat"],
        ["我家有一只白猫。", "Wǒ jiā yǒu yì zhī bái māo.", "We have a white cat at home."])
    ], quiz: [
      { type: "build", x: 1 },
      { type: "meaning", x: 0, opts: ["lounge, break room", "classroom", "bedroom", "restroom (toilet)"],
        why: "休息 rest + 室 room: a room for resting. Careful: a toilet is 洗手间 xǐshǒujiān." },
      { type: "cloze", x: 2, s: ["我家有两只猫，一只黑猫，一只＿＿。", "Wǒ jiā yǒu liǎng zhī māo, yì zhī hēi māo, yì zhī bái māo.", "We have two cats at home: a black one and a white one."],
        why: "黑猫 black cat and 白猫 white cat: colour + 猫." }
    ] },

    { n: 5, items: [
      x("等车", "děng chē", "to wait for the bus", "action",
        ["等", "děng", "to wait", [0], "wait"],
        ["公交车", "gōng jiāo chē", "bus", [2], "bus"],
        ["很多人在公交站等车。", "Hěn duō rén zài gōngjiāozhàn děng chē.", "Lots of people are waiting at the bus stop."]),
      x("请进", "qǐng jìn", "please come in", "helper",
        ["请", "qǐng", "please", [0], "please"],
        ["进来", "jìn lái", "to come in", [0], "enter"],
        ["门开着，请进！", "Mén kāizhe, qǐng jìn!", "The door's open. Please come in!"]),
      x("奶茶店", "nǎichádiàn", "milk-tea shop", "place",
        ["奶茶", "nǎi chá", "milk tea", [0, 1], "milk tea"],
        ["商店", "shāng diàn", "shop", [1], "shop"],
        ["学校旁边新开了一家奶茶店。", "Xuéxiào pángbiān xīn kāi le yì jiā nǎichádiàn.", "A new milk-tea shop has opened next to the school."])
    ], quiz: [
      { type: "build", x: 2 },
      { type: "meaning", x: 1, opts: ["please come in", "please sit down", "please wait", "please come back"],
        why: "请 please + 进 enter. “Please sit down” is 请坐 qǐng zuò." },
      { type: "cloze", x: 0, s: ["公交车还没来，我们在这儿＿＿。", "Gōngjiāochē hái méi lái, wǒmen zài zhèr děng chē.", "The bus hasn't come yet, so we're waiting here."],
        why: "The bus isn't here yet, so we 等 wait for the 车." }
    ] },

    { n: 7, items: [
      x("鱼肉", "yúròu", "fish (as food)", "kind",
        ["鱼", "yú", "fish", [0], "fish"],
        ["肉", "ròu", "meat", [0], "meat"],
        ["鱼肉很好吃，你多吃点儿。", "Yúròu hěn hǎochī, nǐ duō chī diǎnr.", "The fish is tasty. Have some more."]),
      x("运动服", "yùndòngfú", "sportswear", "kind",
        ["运动", "yùn dòng", "sport, exercise", [0, 1], "sport"],
        ["衣服", "yī fu", "clothes", [1], "clothes"],
        ["他每天穿运动服去跑步。", "Tā měi tiān chuān yùndòngfú qù pǎobù.", "He goes running in sportswear every day."],
        { rp: { 2: "fú" }, note: "服 is light (fu) in 衣服 but gets its full tone back here: yùndòngfú. Here the word keeps 服, not 衣." }),
      x("画师", "huàshī", "painter, artist", "people",
        ["画", "huà", "to paint; painting", [0], "paint"],
        ["老师", "lǎo shī", "teacher", [1], "master"],
        ["他是一个很有名的画师。", "Tā shì yí ge hěn yǒumíng de huàshī.", "He is a very famous painter."])
    ], quiz: [
      { type: "build", x: 1 },
      { type: "meaning", x: 2, opts: ["painter", "a painting", "teacher", "art class"],
        why: "画 paint + 师 master: someone whose skill is painting." },
      { type: "cloze", x: 0, s: ["我不爱吃牛肉，我爱吃＿＿。", "Wǒ bú ài chī niúròu, wǒ ài chī yúròu.", "I don't like beef. I like fish."],
        why: "牛肉 beef, 鱼肉 fish: animal + 肉 meat." }
    ] },

    { n: 8, items: [
      x("夫妻", "fūqī", "husband and wife", "pair",
        ["丈夫", "zhàng fu", "husband", [1], "husband"],
        ["妻子", "qī zi", "wife", [0], "wife"],
        ["他们是一对夫妻。", "Tāmen shì yí duì fūqī.", "They are a married couple."],
        { rp: { 0: "fū" }, note: "夫 is light (fu) in 丈夫 but gets its full tone back in 夫妻: fūqī." }),
      x("桌椅", "zhuōyǐ", "tables and chairs", "pair",
        ["桌子", "zhuō zi", "table", [0], "tables"],
        ["椅子", "yǐ zi", "chair", [0], "chairs"],
        ["教室里的桌椅都是新的。", "Jiàoshì li de zhuōyǐ dōu shì xīn de.", "The desks and chairs in the classroom are all new."]),
      x("茶馆", "cháguǎn", "teahouse", "place",
        ["茶", "chá", "tea", [0], "tea"],
        ["饭馆", "fàn guǎn", "restaurant", [1], "house"],
        ["下午我们去茶馆喝茶吧。", "Xiàwǔ wǒmen qù cháguǎn hē chá ba.", "Let's go to a teahouse this afternoon."])
    ], quiz: [
      { type: "build", x: 0 },
      { type: "meaning", x: 1, opts: ["tables and chairs", "desk", "dining table", "sofa"],
        why: "桌 table + 椅 chair: a pair, so it means both together." },
      { type: "cloze", x: 2, s: ["我们去＿＿喝茶、聊天儿吧。", "Wǒmen qù cháguǎn hē chá, liáotiānr ba.", "Let's go to the teahouse to drink tea and chat."],
        why: "You drink tea at a 茶馆: 茶 tea + 馆 house." }
    ] },

    { n: 9, items: [
      x("咖啡店", "kāfēidiàn", "coffee shop", "place",
        ["咖啡", "kā fēi", "coffee", [0, 1], "coffee"],
        ["商店", "shāng diàn", "shop", [1], "shop"],
        ["我在咖啡店等你。", "Wǒ zài kāfēidiàn děng nǐ.", "I'll wait for you at the coffee shop."]),
      x("男生", "nánshēng", "boy, male student", "people",
        ["男孩儿", "nán hái r", "boy", [0], "male"],
        ["学生", "xué shēng", "student", [1], "student"],
        ["我们班有十个男生。", "Wǒmen bān yǒu shí ge nánshēng.", "There are ten boys in our class."]),
      x("咖啡杯", "kāfēibēi", "coffee cup", "kind",
        ["咖啡", "kā fēi", "coffee", [0, 1], "coffee"],
        ["杯子", "bēi zi", "cup", [0], "cup"],
        ["这个咖啡杯是谁的？", "Zhège kāfēibēi shì shéi de?", "Whose coffee cup is this?"])
    ], quiz: [
      { type: "build", x: 1 },
      { type: "meaning", x: 2, opts: ["coffee cup", "coffee shop", "a cup of coffee", "coffee beans"],
        why: "The last character is the thing: a 杯 cup for 咖啡 coffee. “A cup of coffee” is 一杯咖啡." },
      { type: "cloze", x: 0, s: ["我们在＿＿喝咖啡吧。", "Wǒmen zài kāfēidiàn hē kāfēi ba.", "Let's have a coffee at the coffee shop."],
        why: "在 + a place: the 咖啡店 is somewhere you can be." }
    ] },

    { n: 10, items: [
      x("说错", "shuōcuò", "to say something wrong", "action",
        ["说话", "shuō huà", "to speak", [0], "say"],
        ["错", "cuò", "wrong", [0], "wrong"],
        ["对不起，我说错了。", "Duìbuqǐ, wǒ shuōcuò le.", "Sorry, I said it wrong."]),
      x("门后", "mén hòu", "behind the door", "position",
        ["门", "mén", "door", [0], "door"],
        ["后面", "hòu miàn", "behind", [0], "behind"],
        ["小猫在门后。", "Xiǎo māo zài mén hòu.", "The kitten is behind the door."]),
      x("汉字本", "hànzìběn", "character exercise book", "kind",
        ["汉字", "Hàn zì", "Chinese character", [0, 1], "characters"],
        ["本子", "běn zi", "notebook", [0], "notebook"],
        ["我的汉字本在书包里。", "Wǒ de hànzìběn zài shūbāo li.", "My character book is in my schoolbag."])
    ], quiz: [
      { type: "build", x: 2 },
      { type: "meaning", x: 1, opts: ["behind the door", "back door", "in front of the door", "at the door"],
        why: "Order matters! 门后 (door + behind) is behind the door; 后门 (back + door) is the back door." },
      { type: "cloze", x: 0, s: ["不是“四”，是“十”，我＿＿了。", "Bú shì “sì”, shì “shí”, wǒ shuōcuò le.", "Not “four”, it's “ten”. I said it wrong."],
        why: "说 say + 错 wrong: what you said came out wrong." }
    ] },

    { n: 11, items: [
      x("身旁", "shēn páng", "by one's side", "position",
        ["身体", "shēn tǐ", "body", [0], "body"],
        ["旁边", "páng biān", "beside", [0], "beside"],
        ["妈妈坐在我身旁。", "Māma zuò zài wǒ shēn páng.", "Mum is sitting by my side."]),
      x("水果店", "shuǐguǒdiàn", "fruit shop", "place",
        ["水果", "shuǐ guǒ", "fruit", [0, 1], "fruit"],
        ["药店", "yào diàn", "pharmacy", [1], "shop"],
        ["我去水果店买苹果。", "Wǒ qù shuǐguǒdiàn mǎi píngguǒ.", "I'm going to the fruit shop to buy apples."]),
      x("泳裤", "yǒngkù", "swimming trunks", "kind",
        ["游泳", "yóu yǒng", "to swim", [1], "swim"],
        ["裤子", "kù zi", "trousers", [0], "trousers"],
        ["去游泳要带泳裤。", "Qù yóuyǒng yào dài yǒngkù.", "Take your swimming trunks when you go swimming."],
        { note: "This one keeps the second character of 游泳: 泳 is the one with the water radical 氵." })
    ], quiz: [
      { type: "build", x: 2 },
      { type: "meaning", x: 0, opts: ["by one's side", "body", "behind someone", "next door"],
        why: "身 body + 旁 beside: right next to someone." },
      { type: "cloze", x: 1, s: ["我想买苹果，我们去＿＿吧。", "Wǒ xiǎng mǎi píngguǒ, wǒmen qù shuǐguǒdiàn ba.", "I want to buy apples. Let's go to the fruit shop."],
        why: "Apples are fruit, so you buy them at the 水果店." }
    ] },

    { n: 12, items: [
      x("阴天", "yīn tiān", "cloudy day", "kind",
        ["阴", "yīn", "cloudy, overcast", [0], "cloudy"],
        ["天气", "tiān qì", "weather", [0], "day"],
        ["今天是阴天，可能会下雨。", "Jīntiān shì yīn tiān, kěnéng huì xià yǔ.", "It's cloudy today. It might rain."]),
      x("晴天", "qíng tiān", "sunny day", "kind",
        ["晴", "qíng", "sunny, clear", [0], "sunny"],
        ["天气", "tiān qì", "weather", [0], "day"],
        ["晴天的时候，我们去公园跑步。", "Qíng tiān de shíhou, wǒmen qù gōngyuán pǎobù.", "On sunny days we go running in the park."]),
      x("地铁站", "dìtiězhàn", "subway station", "place",
        ["地铁", "dì tiě", "subway", [0, 1], "subway"],
        ["车站", "chē zhàn", "station, stop", [1], "station"],
        ["地铁站离这儿不远。", "Dìtiězhàn lí zhèr bù yuǎn.", "The subway station isn't far from here."])
    ], quiz: [
      { type: "build", x: 2 },
      { type: "meaning", x: 0, opts: ["cloudy day", "sunny day", "rainy day", "hot day"],
        why: "阴 cloudy + 天 day. Its opposite is 晴天, a sunny day." },
      { type: "cloze", x: 1, s: ["今天是＿＿，太阳很好，我们去公园吧。", "Jīntiān shì qíng tiān, tàiyáng hěn hǎo, wǒmen qù gōngyuán ba.", "It's a sunny day and the sun is lovely. Let's go to the park."],
        why: "The sun is out, so it's 晴天, not 阴天." }
    ] },

    { n: 13, items: [
      x("网名", "wǎngmíng", "username, online name", "kind",
        ["上网", "shàng wǎng", "to go online", [1], "online"],
        ["名字", "míng zi", "name", [0], "name"],
        ["你的网名是什么？", "Nǐ de wǎngmíng shì shénme?", "What's your username?"],
        { note: "上网 gives its second character, 网 (net), not 上." }),
      x("红花", "hóng huā", "red flower", "kind",
        ["红色", "hóng sè", "red", [0], "red"],
        ["花", "huā", "flower", [0], "flower"],
        ["公园里有很多红花。", "Gōngyuán li yǒu hěn duō hóng huā.", "There are lots of red flowers in the park."]),
      x("大楼", "dàlóu", "tall building", "kind",
        ["大", "dà", "big", [0], "big"],
        ["楼", "lóu", "building", [0], "building"],
        ["我爸爸在这个大楼里工作。", "Wǒ bàba zài zhège dàlóu li gōngzuò.", "My dad works in this building."])
    ], quiz: [
      { type: "build", x: 0 },
      { type: "meaning", x: 2, opts: ["tall building", "big house", "upstairs", "floor (storey)"],
        why: "大 big + 楼 building. “Upstairs” is 楼上 lóushàng." },
      { type: "cloze", x: 1, s: ["公园里开了很多＿＿，很漂亮。", "Gōngyuán li kāi le hěn duō hóng huā, hěn piàoliang.", "Lots of red flowers are blooming in the park. They're beautiful."],
        why: "Flowers 开 bloom: 红 red + 花 flower." }
    ] },

    { n: 14, items: [
      x("女生", "nǚshēng", "girl, female student", "people",
        ["女孩儿", "nǚ hái r", "girl", [0], "female"],
        ["学生", "xué shēng", "student", [1], "student"],
        ["那个女生是我的同学。", "Nàge nǚshēng shì wǒ de tóngxué.", "That girl is my classmate."]),
      x("楼前", "lóu qián", "in front of the building", "position",
        ["楼", "lóu", "building", [0], "building"],
        ["前面", "qián miàn", "in front", [0], "in front"],
        ["楼前有一个小花园。", "Lóu qián yǒu yí ge xiǎo huāyuán.", "There's a small garden in front of the building."]),
      x("钱包", "qiánbāo", "wallet, purse", "kind",
        ["钱", "qián", "money", [0], "money"],
        ["包", "bāo", "bag", [0], "bag"],
        ["我的钱包不见了！", "Wǒ de qiánbāo bú jiàn le!", "My wallet is gone!"])
    ], quiz: [
      { type: "build", x: 2 },
      { type: "meaning", x: 1, opts: ["in front of the building", "behind the building", "upstairs", "the front door"],
        why: "楼 building + 前 in front. Behind it would be 楼后." },
      { type: "cloze", x: 0, s: ["我们班有十五个男生，二十个＿＿。", "Wǒmen bān yǒu shíwǔ ge nánshēng, èrshí ge nǚshēng.", "Our class has fifteen boys and twenty girls."],
        why: "男生 boys and 女生 girls: both end in 生 student." }
    ] },

    { n: 15, items: [
      x("车票", "chēpiào", "bus or train ticket", "kind",
        ["车", "chē", "vehicle", [0], "vehicle"],
        ["机票", "jī piào", "plane ticket", [1], "ticket"],
        ["我已经买好车票了。", "Wǒ yǐjīng mǎihǎo chēpiào le.", "I've already bought the ticket."]),
      x("书名", "shūmíng", "book title", "kind",
        ["书", "shū", "book", [0], "book"],
        ["姓名", "xìng míng", "full name", [1], "name"],
        ["这本书的书名是什么？", "Zhè běn shū de shūmíng shì shénme?", "What's the title of this book?"]),
      x("高中生", "gāozhōngshēng", "high-school student", "people",
        ["高中", "gāo zhōng", "high school", [0, 1], "high school"],
        ["学生", "xué shēng", "student", [1], "student"],
        ["我姐姐是高中生。", "Wǒ jiějie shì gāozhōngshēng.", "My older sister is a high-school student."])
    ], quiz: [
      { type: "build", x: 0 },
      { type: "meaning", x: 1, opts: ["book title", "author", "bookshop", "signature"],
        why: "书 book + 名 name: a book's name is its title." },
      { type: "cloze", x: 2, s: ["我哥哥十六岁，是＿＿。", "Wǒ gēge shíliù suì, shì gāozhōngshēng.", "My older brother is sixteen. He's a high-school student."],
        why: "At sixteen you're at 高中 high school, so you're a 高中生." }
    ] }
  ];

  const ZH_NUM = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二", "十三", "十四", "十五"];
  LESSONS.forEach((L) => { L.zh = "第" + ZH_NUM[L.n] + "课"; L.items.forEach((e, i) => { e.lesson = L.n; e.i = i; }); });

  /* Rule cards on the overview page */
  const RULES = {
    boss: ["茶杯", "火车站", "高中生"],
    drop: [["杯子", "杯"], ["桌子", "桌"], ["椅子", "椅"], ["裤子", "裤"], ["本子", "本"], ["妻子", "妻"]],
    pick: { from: "衣服", py: ["yī", "fu"], to: [["雨衣", 0, "yǔyī", "raincoat"], ["运动服", 1, "yùndòngfú", "sportswear"]] },
    tone: [["衣服", "yīfu", "运动服", "yùndòngfú", "服"], ["丈夫", "zhàngfu", "夫妻", "fūqī", "夫"]]
  };

  window.HSK_EXPR = { PATTERNS, LESSONS, RULES };
})();
