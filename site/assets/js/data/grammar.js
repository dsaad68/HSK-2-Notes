/* ==========================================================================
   Grammar — the 小语讲堂 grammar points of the textbook, lesson by lesson.

   Sentences are written as tokens joined by " · ":  汉字|pīnyīn|role
   Roles colour the chip:  m = the grammar word itself (吧, 是…的, 请…)
                           f = the focus / describer / chosen option
                           p = pivot or head noun, n = number, w = measure word
   Quiz items:  t: "pick"  → opts[0] is the answer (shown shuffled)
                t: "order" → parts are the answer, in order (shown shuffled)
   The first five quiz items of each point are its own "Check yourself";
   the first two also go into the lesson quiz; all go into the mixed review.
   ========================================================================== */
(function () {
  "use strict";
  window.HSK_GRAMMAR = {
    LESSONS: [
      {
        n: 1, zh: "她请我们吃了北京烤鸭", py: "Tā qǐng wǒmen chīle Běijīng kǎoyā", en: "She treated us to Peking duck",
        points: [
          {
            id: "ba", zh: "语气助词“吧”", en: "吧 for a guess", short: "吧？", vis: "ba",
            formulas: [{ parts: [["a question you can guess", ""], ["吧？", "m"]] }],
            rule: "Put <b class=\"han\">吧</b> at the end of a question when you already think you know the answer. The question becomes a guess: “…, right?” or “I suppose…?”",
            note: "<b class=\"han\">吗</b> asks because you don't know. <b class=\"han\">吧</b> asks because you think you do, and you'd like the other person to say yes.",
            steps: [
              ["A statement", "<span class=\"han\">陈天中是泰国人。</span> You know it, so you just say it."],
              ["吗: a real question", "Add <span class=\"han\">吗</span> when you have no idea. The answer could be yes or no."],
              ["吧: a guess", "Add <span class=\"han\">吧</span> when you think it's true and just want to check: “He's Thai, right?”"]
            ],
            examples: [
              { zh: "你们|nǐmen · 就是|jiù shì · 她的|tā de · 学生|xuésheng · 吧|ba|m · ？", en: "So you must be her students?" },
              { zh: "她|tā · 唱歌|chàng gē · 很|hěn · 好听|hǎotīng · 吧|ba|m · ？", en: "She sings really well, doesn't she?" },
              { zh: "陈天中|Chén Tiānzhōng · 是|shì · 泰国人|Tàiguó rén · 吧|ba|m · ？", en: "Chen Tianzhong is from Thailand, I suppose?" }
            ],
            quiz: [
              { t: "pick", say: "A is fairly sure the phone is B's and just wants to check.", ctx: [["A", "这是你的手机＿＿？"], ["B", "对，是我的手机，谢谢你！"]], opts: ["吧", "吗", "呢"],
                en: "A: This is your phone, right? · B: Yes, it's my phone. Thank you!",
                why: "A already thinks it's B's phone, so the question is a guess: <b class=\"han\">吧</b>. (<span class=\"han\">吗</span> would mean A has no idea.)" },
              { t: "order", ctx: [["A", "很晚了，＿＿？"], ["B", "那我们明天再去学校找她。"]], parts: ["老师|lǎoshī", "回家|huí jiā", "了|le", "吧|ba"],
                en: "A: It's late. The teacher has gone home, I guess? · B: Then let's go to the school to find her tomorrow.",
                why: "It's late, so A guesses: <span class=\"han\">老师回家了<b>吧</b></span>. 吧 always goes at the very end." },
              { t: "pick", ctx: [["A", "你＿＿？认识你很高兴。"], ["B", "是。认识你，我也很高兴。"]], opts: ["是小雪吧", "吧是小雪", "是吧小雪"],
                en: "A: You must be Xiaoxue? Nice to meet you. · B: Yes. Nice to meet you too.",
                why: "First the whole question, then <b class=\"han\">吧</b>: <span class=\"han\">你是小雪吧？</span>" },
              { t: "pick", say: "Which one is a guess? (You think the answer is yes.)", ctx: [], opts: ["你是老师吧？", "你是老师吗？", "你是老师。"],
                en: "You're a teacher, right?",
                why: "<b class=\"han\">吧</b> at the end turns it into a guess. <span class=\"han\">吗</span> is a real question, and the last one is just a statement." },
              { t: "order", ctx: [["A", "＿＿？"], ["B", "是啊，我很喜欢唱歌。"]], parts: ["你|nǐ", "很|hěn", "喜欢|xǐhuan", "唱歌|chàng gē", "吧|ba"],
                en: "A: You love singing, don't you? · B: Yes, I really like singing.",
                why: "A has noticed and guesses: <span class=\"han\">你很喜欢唱歌<b>吧</b></span>, with 吧 at the very end." }
            ]
          },
          {
            id: "shide", zh: "“是……的”句", en: "是……的 for the detail", short: "是……的", vis: "shide",
            formulas: [{ parts: [["是", "m"], ["when · where · how · who · why", "f"], ["verb", ""], ["的", "m"]] }],
            rule: "When something has <b>already happened</b>, <b class=\"han\">是……的</b> puts the spotlight on one detail of it: when, where, how, who or why. The detail goes straight after <span class=\"han\">是</span>, and <span class=\"han\">的</span> closes the sentence.",
            note: "In statements and questions you can drop <span class=\"han\">是</span>. In a negative sentence you can't: it's always <b class=\"han\">不是……的</b>.",
            steps: [
              ["It already happened", "<span class=\"han\">我来北京了。</span> I came to Beijing. That part is old news."],
              ["是 … 的 frames the detail", "Put the detail you want to talk about right after <span class=\"han\">是</span>, and <span class=\"han\">的</span> at the end."],
              ["Swap the detail", "When, how, with whom: the frame stays the same."],
              ["是 can go, except after 不", "In statements and questions <span class=\"han\">是</span> is optional. In <span class=\"han\">不是……的</span> it must stay."]
            ],
            examples: [
              { zh: "我们|wǒmen · 是|shì|m · 来旅游|lái lǚyóu|f · 的|de|m · 。", en: "We came here to travel.", tag: "why" },
              { zh: "苹果|píngguǒ · 在哪儿|zài nǎr|f · 买|mǎi · 的|de|m · ？", en: "Where did you buy the apples?", tag: "where · 是 dropped" },
              { zh: "我们|wǒmen · 不是|bú shì|m · 坐出租车|zuò chūzūchē|f · 去|qù · 的|de|m · 。", en: "We didn't go by taxi.", tag: "how · negative keeps 是" }
            ],
            quiz: [
              { t: "pick", ctx: [["A", "你是坐车来学校的吗？"], ["B", "不，我＿＿走路来的。"]], opts: ["是", "了", "吧"],
                en: "A: Did you come to school by car? · B: No, I walked here.",
                why: "B corrects <i>how</i> they came, so it's <b class=\"han\">是……的</b>: <span class=\"han\">我是走路来的</span>." },
              { t: "order", ctx: [["A", "＿＿？"], ["B", "我是在书店看见安妮的。"]], parts: ["你|nǐ", "是|shì", "在哪儿|zài nǎr", "看见|kànjiàn", "安妮|Ānnī", "的|de"],
                en: "A: Where did you see Annie? · B: I saw Annie at the bookshop.",
                why: "Ask about the place: <span class=\"han\"><b>是</b> + 在哪儿 + 看见安妮 + <b>的</b></span>." },
              { t: "pick", say: "Which sentence is correct?", ctx: [], opts: ["我们不是坐出租车去的。", "我们不坐出租车去的。", "我们没是坐出租车去的。"],
                en: "We didn't go by taxi.",
                why: "In the negative you can't drop <span class=\"han\">是</span>: always <b class=\"han\">不是……的</b>." },
              { t: "order", ctx: [["A", "你今天是几点到学校的？"], ["B", "＿＿。"]], parts: ["我|wǒ", "是|shì", "八点|bā diǎn", "到|dào", "的|de"],
                en: "A: What time did you get to school today? · B: I got here at eight.",
                why: "The detail is the time: <span class=\"han\">我<b>是</b>八点到<b>的</b></span>." },
              { t: "pick", ctx: [["A", "你是什么时候来中国的？"], ["B", "我是去年＿＿。"]], opts: ["来的", "来了", "来吧"],
                en: "A: When did you come to China? · B: I came last year.",
                why: "A asks <i>when</i> with 是……的, so B answers the same way and closes with <b class=\"han\">的</b>: <span class=\"han\">我是去年来的</span>." }
            ]
          },
          {
            id: "pivot", zh: "兼语句", en: "请 · 让 · 叫 + someone + action", short: "请 · 让 · 叫", vis: "pivot",
            formulas: [{ parts: [["someone", ""], ["请 / 让 / 叫", "m"], ["someone else", "p"], ["does something", ""]] }],
            rule: "One person in the middle does two jobs. They are the <b>object</b> of <span class=\"han\">请 / 让 / 叫</span> and the <b>subject</b> of the next verb. That's how you say “invite, let or tell someone to do something”.",
            note: "<b class=\"han\">请</b> qǐng: invite, ask politely · <b class=\"han\">让</b> ràng: let, have someone do · <b class=\"han\">叫</b> jiào: tell someone to do.",
            steps: [
              ["Two actions", "<span class=\"han\">叫</span> tell, and <span class=\"han\">回家</span> go home, in one sentence."],
              ["Tell whom?", "<span class=\"han\">孩子们</span>: they are the object of <span class=\"han\">叫</span>."],
              ["Who goes home?", "<span class=\"han\">孩子们</span> again: now they are the subject of <span class=\"han\">回家</span>."],
              ["One person, two jobs", "That middle person is the pivot. Swap <span class=\"han\">叫</span> for <span class=\"han\">请</span> or <span class=\"han\">让</span> to change the tone."]
            ],
            examples: [
              { zh: "我|wǒ · 想|xiǎng · 请|qǐng|m · 你|nǐ|p · 帮个忙|bāng ge máng · 。", en: "I'd like to ask you for a favour." },
              { zh: "王老师|Wáng lǎoshī · 让|ràng|m · 我们|wǒmen|p · 说中文|shuō Zhōngwén · 。", en: "Teacher Wang has us speak Chinese." },
              { zh: "妈妈|māma · 叫|jiào|m · 孩子们|háizimen|p · 回家|huí jiā · 。", en: "Mum tells the children to come home." }
            ],
            quiz: [
              { t: "order", ctx: [["A", "小雪，你去哪儿？"], ["B", "我去超市。＿＿。"]], parts: ["妈妈|māma", "叫|jiào", "我|wǒ", "买|mǎi", "水果|shuǐguǒ"],
                en: "A: Xiaoxue, where are you going? · B: To the supermarket. Mum told me to buy some fruit.",
                why: "<span class=\"han\">妈妈</span> tells <span class=\"han\">我</span>, and <span class=\"han\">我</span> buys the fruit: <span class=\"han\">我</span> is the pivot." },
              { t: "pick", ctx: [["A", "明天我想＿＿朋友们来家里吃饭。"], ["B", "好的，我下班后去买点儿菜。"]], opts: ["请", "给", "在"],
                en: "A: Tomorrow I'd like to invite some friends over for dinner. · B: OK, I'll buy some food after work.",
                why: "Inviting someone to do something: <b class=\"han\">请</b> + person + action." },
              { t: "pick", ctx: [["A", "家月，王老师让＿＿去找她。"], ["B", "好的，我现在就去找她。"]], opts: ["你", "她", "了"],
                en: "A: Jiayue, Teacher Wang wants you to go and see her. · B: OK, I'll go and find her now.",
                why: "<span class=\"han\">王老师</span> has <b class=\"han\">你</b> go: you're the pivot, the one who does the going." },
              { t: "pick", ctx: [["A", "你今天怎么这么早回家？"], ["B", "老师＿＿我们早点儿回家。"]], opts: ["让", "是", "在"],
                en: "A: Why are you home so early today? · B: The teacher let us go home early.",
                why: "Letting someone do something: <b class=\"han\">让</b> + person + action. <span class=\"han\">我们</span> is the pivot." },
              { t: "order", ctx: [["A", "周末你做什么？"], ["B", "＿＿。"]], parts: ["朋友|péngyou", "请|qǐng", "我|wǒ", "看|kàn", "电影|diànyǐng"],
                en: "A: What are you doing at the weekend? · B: A friend has invited me to a film.",
                why: "<span class=\"han\">朋友</span> invites <span class=\"han\">我</span>, and <span class=\"han\">我</span> watches the film: <span class=\"han\">朋友<b>请</b>我看电影</span>." }
            ]
          }
        ]
      },
      {
        n: 2, zh: "", py: "", en: "",
        points: [
          {
            id: "haishi", zh: "固定格式“还是……吧”", en: "还是……吧 for the better choice", short: "还是……吧", vis: "haishi",
            formulas: [{ parts: [["还是", "m"], ["the better option", "f"], ["吧", "m"]] }],
            rule: "After weighing the options, use <b class=\"han\">还是……吧</b> to suggest the one that seems better: “we'd better…”, “let's just…”.",
            note: "This isn't the “or” <span class=\"han\">还是</span> of questions (<span class=\"han\">你喝茶还是咖啡？</span>). Here it means “all things considered”.",
            steps: [
              ["Two options", "Walk there, or take a taxi?"],
              ["A reason", "<span class=\"han\">太远了</span>: it's too far."],
              ["还是 + choice + 吧", "Put the better option between <span class=\"han\">还是</span> and <span class=\"han\">吧</span>: let's just take a taxi."]
            ],
            examples: [
              { zh: "我们|wǒmen · 还是|háishi|m · 打车去|dǎ chē qù|f · 吧|ba|m · 。", en: "Let's just take a taxi." },
              { zh: "那件衣服|nà jiàn yīfu · 很|hěn · 好看|hǎokàn · ， · 还是|háishi|m · 买那件|mǎi nà jiàn|f · 吧|ba|m · 。", en: "That one looks great. Better buy that one." },
              { zh: "你|nǐ · 第一次|dì-yī cì · 去北京|qù Běijīng · ， · 还是|háishi|m · 找个人接你|zhǎo ge rén jiē nǐ|f · 吧|ba|m · 。", en: "It's your first time in Beijing, so you'd better have someone meet you." }
            ],
            quiz: [
              { t: "order", ctx: [["A", "今天你怎么去公司？"], ["B", "打车太贵了，＿＿。"]], parts: ["我|wǒ", "还是|háishi", "坐地铁|zuò dìtiě", "去|qù", "吧|ba"],
                en: "A: How are you getting to work today? · B: A taxi is too expensive, I'd better take the subway.",
                why: "The better choice sits between the two words: <span class=\"han\">我<b>还是</b>坐地铁去<b>吧</b></span>." },
              { t: "pick", ctx: [["A", "明天有雨，我们＿＿。"], ["B", "好的，那就今天去。"]], opts: ["还是今天去吧", "还是明天去吧", "今天去还是吧"],
                en: "A: It's going to rain tomorrow, we'd better go today. · B: OK, today then.",
                why: "Rain tomorrow makes today the better choice, and the choice goes between <b class=\"han\">还是</b> and <b class=\"han\">吧</b>." },
              { t: "pick", ctx: [["A", "不好意思，我今天太忙了，你＿＿。"], ["B", "好的，我们去找天中帮忙。"]], opts: ["还是找别人吧", "找别人还是吧", "还是吧找别人"],
                en: "A: Sorry, I'm too busy today, you'd better ask someone else. · B: OK, we'll ask Tianzhong for help.",
                why: "<b class=\"han\">还是</b> + the better option + <b class=\"han\">吧</b>: <span class=\"han\">还是找别人吧</span>." },
              { t: "pick", say: "Which one means “Let's just eat at home”?", ctx: [], opts: ["我们还是在家吃吧。", "我们在家吃还是吧。", "我们还是吧在家吃。"],
                en: "Let's just eat at home.",
                why: "The choice <span class=\"han\">在家吃</span> sits between <b class=\"han\">还是</b> and <b class=\"han\">吧</b>." },
              { t: "order", ctx: [["A", "这件衣服太贵了。"], ["B", "那你＿＿。"]], parts: ["还是|háishi", "买|mǎi", "那件|nà jiàn", "吧|ba"],
                en: "A: This one is too expensive. · B: Then you'd better buy that one.",
                why: "Too expensive, so the other one is better: <span class=\"han\"><b>还是</b>买那件<b>吧</b></span>." }
            ]
          },
          {
            id: "duo", zh: "用“多”表达概数", en: "多 for “a bit more than”", short: "二十多 · 五块多", vis: "duo",
            formulas: [
              { cap: "10, 20, 100, 4万…", parts: [["round number", "n"], ["多", "m"], ["measure", "w"]] },
              { cap: "1–9, 15, 22…", parts: [["other number", "n"], ["measure", "w"], ["多", "m"]] }
            ],
            rule: "<b class=\"han\">多</b> after a number means “and a bit more”: twenty-odd, just over five. Where it goes depends on the number.",
            note: "A multiple of ten (10, 20, 100, 4万) takes <span class=\"han\">多</span> straight after the number: <b class=\"han\">二十多个</b>. Any other number takes it after the measure word: <b class=\"han\">五块多</b>.",
            steps: [
              ["多 = a bit more", "Not exactly the number. A little over it."],
              ["Round tens: number + 多 + measure", "<span class=\"han\">二十多个</span>: somewhere from 21 to 29."],
              ["Other numbers: measure + 多", "<span class=\"han\">五块多</span>: five kuai and a bit of change."]
            ],
            examples: [
              { zh: "北京大学|Běijīng Dàxué · 有|yǒu · 四万|sìwàn|n · 多|duō|m · 名|míng|w · 学生|xuésheng · 呢|ne · ！", en: "Peking University has over forty thousand students!" },
              { zh: "教室里|jiàoshì li · 有|yǒu · 二十|èrshí|n · 多|duō|m · 个|ge|w · 学生|xuésheng · 。", en: "There are twenty-odd students in the classroom." },
              { zh: "这两个苹果|zhè liǎng ge píngguǒ · 五|wǔ|n · 块|kuài|w · 多|duō|m · 钱|qián · 。", en: "These two apples cost just over five kuai." }
            ],
            quiz: [
              { t: "pick", ctx: [["A", "你这件衣服多少钱？"], ["B", "＿＿。"]], opts: ["一百多块", "一百块多", "多一百块"],
                en: "A: How much was this jacket? · B: A bit over a hundred kuai.",
                why: "100 is a round number, so <b class=\"han\">多</b> goes right after it: <span class=\"han\">一百<b>多</b>块</span>." },
              { t: "pick", ctx: [["A", "你家的小狗几岁了？"], ["B", "＿＿。"]], opts: ["两岁多", "两多岁", "多两岁"],
                en: "A: How old is your puppy? · B: A bit over two.",
                why: "2 isn't a multiple of ten, so <b class=\"han\">多</b> goes after the measure word <span class=\"han\">岁</span>: <span class=\"han\">两岁<b>多</b></span>." },
              { t: "order", ctx: [["A", "家里还有苹果吗？"], ["B", "还有＿＿。"]], parts: ["十|shí", "多|duō", "个|ge"],
                en: "A: Are there any apples left at home? · B: There are still ten or so.",
                why: "10 is round: <span class=\"han\">十<b>多</b>个</span>." },
              { t: "pick", ctx: [["A", "你们学校有多少老师？"], ["B", "有＿＿老师。"]], opts: ["三十多个", "三十个多", "多三十个"],
                en: "A: How many teachers are there at your school? · B: Thirty-odd.",
                why: "30 is a multiple of ten, so <b class=\"han\">多</b> goes right after it: <span class=\"han\">三十<b>多</b>个</span>." },
              { t: "pick", ctx: [["A", "你学中文多长时间了？"], ["B", "＿＿了。"]], opts: ["一年多", "一多年", "多一年"],
                en: "A: How long have you been learning Chinese? · B: A bit over a year.",
                why: "1 isn't a multiple of ten, so <b class=\"han\">多</b> goes after <span class=\"han\">年</span>: <span class=\"han\">一年<b>多</b></span>." }
            ]
          },
          {
            id: "attr", zh: "动词短语作定语", en: "An action that describes a noun", short: "……的 + noun", vis: "attr",
            formulas: [{ parts: [["(someone) does something", "f"], ["的", "m"], ["noun", "p"]] }],
            rule: "To say <i>which</i> thing you mean, put a whole action (<span class=\"han\">学中文</span>) or “someone does something” (<span class=\"han\">朋友给我</span>) in front of the noun, joined by <b class=\"han\">的</b>.",
            note: "English puts this after the noun: “the cup a friend gave me”. Chinese always puts it first: <b class=\"han\">朋友给我的杯子</b>.",
            steps: [
              ["Start with the thing", "<span class=\"han\">杯子</span>: a cup. But which one?"],
              ["Describe it in front", "<span class=\"han\">朋友给我</span> + <span class=\"han\">的</span>: the one a friend gave me."],
              ["English is the mirror image", "English adds the description after the noun. Chinese puts it before."]
            ],
            examples: [
              { zh: "他们卖|tāmen mài|f · 的|de|m · 电影票|diànyǐngpiào|p · 也|yě · 很|hěn · 便宜|piányi · 。", en: "The film tickets they sell are cheap too." },
              { zh: "现在|xiànzài · 学中文|xué Zhōngwén|f · 的|de|m · 学生|xuésheng|p · 很|hěn · 多|duō · 。", en: "Lots of students are learning Chinese now." },
              { zh: "这|zhè · 是|shì · 朋友给我|péngyou gěi wǒ|f · 的|de|m · 杯子|bēizi|p · 。", en: "This is the cup a friend gave me." }
            ],
            quiz: [
              { t: "order", ctx: [["A", "＿＿？"], ["B", "很好吃，我很喜欢你做的菜。"]], parts: ["我|wǒ", "做|zuò", "的|de", "菜|cài", "好吃吗|hǎochī ma"],
                en: "A: Is the food I made good? · B: It's delicious, I love your cooking.",
                why: "Which food? The food I made: <span class=\"han\">我做<b>的</b>菜</span>, describer first." },
              { t: "pick", ctx: [["A", "这是谁＿＿的苹果？"], ["B", "我买的，很好吃。"]], opts: ["买", "是", "很"],
                en: "A: Who bought these apples? · B: I did, they're really good.",
                why: "Which apples? The ones someone bought: <span class=\"han\">谁<b>买</b>的苹果</span>. B answers <span class=\"han\">我买的</span>." },
              { t: "order", ctx: [["A", "我觉得＿＿很好看。"], ["B", "你穿也好看，想不想买一件？"]], parts: ["小雪|Xiǎoxuě", "穿|chuān", "的|de", "衣服|yīfu"],
                en: "A: I think the clothes Xiaoxue is wearing look nice. · B: They'd look good on you too. Want to buy one?",
                why: "<span class=\"han\">小雪穿</span> describes <span class=\"han\">衣服</span>, so it comes first, then <b class=\"han\">的</b>." },
              { t: "pick", ctx: [["A", "那个＿＿的人是谁？"], ["B", "是我们的新老师。"]], opts: ["在打电话", "打电话在", "电话在打"],
                en: "A: Who's that person on the phone? · B: Our new teacher.",
                why: "The action describes <span class=\"han\">人</span>, so the whole action goes before <b class=\"han\">的</b>: <span class=\"han\">在打电话的人</span>." },
              { t: "order", ctx: [["A", "＿＿在哪儿？"], ["B", "在桌子上。"]], parts: ["昨天|zuótiān", "买|mǎi", "的|de", "书|shū"],
                en: "A: Where's the book I bought yesterday? · B: On the table.",
                why: "Which book? The one bought yesterday: <span class=\"han\">昨天买<b>的</b>书</span>, describer first." }
            ]
          }
        ]
      }
    ]
  };
})();
