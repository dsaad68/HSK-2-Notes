#!/usr/bin/env python3
"""
Build site/assets/js/data/vocab.js from the HSK 2 word list (exam-materials/vocab/HSK-2.xls).

Usage:
  pip install openpyxl
  python3 site/tools/build_vocab.py [path/to/HSK-2.xls]

What it does
  1. Reads the sheet (columns 词语 拼音 翻译 词性 所在等级). The file is really .xlsx
     inside, so it is opened through a file handle.
  2. Cleans it: trims stray spaces, merges the duplicated rows (点, 过, 花), fixes the
     typos and wrong glosses listed in EN_FIX / PY_FIX, writes erhua as -r (nǎr) and
     marks the tone changes of 一 and 不 (yíxià, búyào).
  3. Finds the vocabulary graphs: every character that appears in two or more words
     of the list becomes a hub. A character that only ever appears inside one
     two-character word (意 + 思 → 意思, 朋 + 友 → 朋友) is merged into a hub for
     that word; if that leaves fewer than two words, it is dropped.
  4. Adds a meaning for hubs that are not a word on their own (CHAR_GLOSS) and a one-line
     note on what each family has in common (THREAD).

Everything editorial lives in the dictionaries below, so the Excel file stays untouched.
Re-run after changing the word list, then run subset_font.py and build_data.mjs.
"""
import json
import pathlib
import re
import sys
import unicodedata
from collections import OrderedDict, defaultdict

import openpyxl

SITE = pathlib.Path(__file__).resolve().parent.parent
SRC = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else SITE.parent / "exam-materials" / "vocab" / "HSK-2.xls"
OUT = SITE / "assets" / "js" / "data" / "vocab.js"

# ---------------------------------------------------------------------------
# Corrections to the sheet
# ---------------------------------------------------------------------------
PY_FIX = {
    "上去": "shàng qù",  # sheet has shǎng
}

# Typos, glosses that were wrong or unhelpfully vague, and the merged duplicates.
EN_FIX = {
    "吧": "[suggestion particle: let's …]",
    "包": "bag; package",
    "包子": "steamed stuffed bun",
    "还是": "or (in questions); still",
    "中文": "Chinese (language)",
    "奶奶": "grandma (father's mother)",
    "爷爷": "grandpa (father's father)",
    "没事": "it's nothing; it's OK",
    "小孩儿": "kid; child",
    "本子": "notebook",
    "边": "side",
    "不客气": "you're welcome",
    "不要": "don't",
    "菜": "dish; vegetable",
    "次": "[measure word: times]",
    "从": "from",
    "从小": "from childhood",
    "打": "to hit; to play; to make (a call)",
    "打电话": "to make a phone call",
    "的": "[possessive particle: 's]",
    "得": "[links a verb to how it is done]",
    "地": "[links a description to a verb: -ly]",
    "第": "[ordinal prefix: 第一 first]",
    "地铁": "subway; metro",
    "点": "o'clock; a bit; to order",
    "读书": "to read; to study",
    "饭店": "restaurant; hotel",
    "饭馆": "restaurant",
    "个": "[general measure word]",
    "国": "country",
    "过": "to pass; [after a verb: have done before]",
    "过来": "come over",
    "过年": "celebrate the New Year",
    "过去": "go over; the past",
    "还": "still; also",
    "汉语": "Chinese (language)",
    "汉字": "Chinese character",
    "好看": "good-looking; nice",
    "好听": "nice to hear",
    "好玩儿": "fun",
    "花": "flower; to spend",
    "会": "can; know how to",
    "家人": "family members",
    "间": "[measure word for rooms]",
    "就": "just; then",
    "开学": "school starts",
    "考": "to take an exam",
    "块": "piece; [yuan, spoken]",
    "了": "[marks a change or a finished action]",
    "里": "in; inside",
    "楼": "building; floor",
    "路上": "on the way",
    "旅游": "to travel",
    "吗": "[yes/no question particle]",
    "没": "not (have); didn't",
    "没意思": "boring",
    "们": "[plural ending for people]",
    "门口": "doorway; entrance",
    "门票": "entrance ticket",
    "米饭": "(cooked) rice",
    "面": "side; noodles",
    "面条儿": "noodles",
    "名": "name; [measure word for people]",
    "名字": "name",
    "哪个": "which one?",
    "哪里": "where?",
    "哪些": "which ones?",
    "那边": "over there",
    "那里": "there",
    "那么": "so; like that",
    "那样": "like that",
    "呢": "[question particle: and …?]",
    "你们": "you (plural)",
    "起来": "get up; stand up",
    "请问": "excuse me, may I ask …",
    "上班": "go to work",
    "上课": "go to class; class starts",
    "上网": "go online",
    "生病": "fall ill",
    "时": "time; hour",
    "时候": "time; moment",
    "书包": "school bag",
    "说话": "to speak; to talk",
    "岁": "years old",
    "他们": "they; them",
    "它们": "they (things, animals)",
    "她们": "they (women)",
    "太": "too; very",
    "天": "day; sky",
    "外国": "foreign country",
    "晚": "late; evening",
    "位": "[polite measure word for people]",
    "喂": "hello (on the phone)",
    "问题": "question; problem",
    "下班": "finish work",
    "下课": "class is over",
    "下雨": "to rain",
    "姓名": "full name",
    "星期日": "Sunday",
    "星期天": "Sunday",
    "要": "to want; to be going to",
    "一": "one",
    "一下": "a bit; [after a verb: briefly]",
    "有意思": "interesting",
    "游泳": "to swim",
    "怎么样": "how is it?",
    "这边": "this side; here",
    "这个": "this one",
    "这样": "like this",
    "足球": "football; soccer",
    "做饭": "to cook",
    "帮": "to help",
    "出门": "go out; leave home",
}

# Meaning of hub characters that are not a word on their own in the list.
CHAR_GLOSS = {
    "儿": ("ér", ["名", "后缀"], "child; [-r ending]"),
    "子": ("zǐ", ["名", "后缀"], "child; [noun ending]"),
    "生": ("shēng", ["动", "名"], "be born; life; student"),
    "电": ("diàn", ["名"], "electricity"),
    "中": ("zhōng", ["名"], "middle; China"),
    "么": ("me", ["后缀"], "[ending of question and pointing words]"),
    "色": ("sè", ["名"], "colour"),
    "起": ("qǐ", ["动"], "to rise; to get up"),
    "机": ("jī", ["名"], "machine; plane"),
    "孩": ("hái", ["名"], "child"),
    "午": ("wǔ", ["名"], "noon"),
    "话": ("huà", ["名"], "speech; words"),
    "样": ("yàng", ["名"], "kind; way; look"),
    "奶": ("nǎi", ["名"], "milk; grandma"),
    "白": ("bái", ["形"], "white"),
    "气": ("qì", ["名"], "air; manner"),
    "院": ("yuàn", ["名"], "courtyard; institution"),
    "常": ("cháng", ["副", "形"], "often; ordinary"),
    "公": ("gōng", ["形"], "public"),
    "汉": ("hàn", ["名"], "Chinese; the Han people"),
    "红": ("hóng", ["形"], "red"),
    "场": ("chǎng", ["名"], "open area; field"),
    "今": ("jīn", ["名"], "now; this (day, year)"),
    "经": ("jīng", ["动"], "to pass through"),
    "觉": ("jué", ["动", "名"], "to feel (jué); sleep (jiào)"),
    "可": ("kě", ["动"], "can; may"),
    "以": ("yǐ", ["介"], "by means of; so as to"),
    "绿": ("lǜ", ["形"], "green"),
    "明": ("míng", ["形"], "bright; next (day, year)"),
    "果": ("guǒ", ["名"], "fruit"),
    "商": ("shāng", ["名"], "trade; business"),
    "网": ("wǎng", ["名"], "net; the internet"),
    "服": ("fú", ["名", "动"], "clothes; to suit"),
    "为": ("wèi", ["介"], "for; because of"),
    "医": ("yī", ["名", "动"], "medicine; to treat"),
}

# What each family has in common (one line, shown under the graph).
THREAD = {
    "儿": "Two jobs. Read ér it means child: 儿子 son, 女儿 daughter. Added as a light -r it only rounds off the word: 哪儿 nǎr, 一会儿 yíhuìr.",
    "学": "School and study: places (大学, 中学, 小学), people (学生, 同学) and actions (上学, 开学, 学习).",
    "上": "Up, on, and going to something: 上班 go to work, 上课 go to class, 上网 go online. At the end it means on (路上, 网上) or a time of day (早上, 晚上).",
    "子": "A light noun ending (zi) with no meaning of its own: 杯子, 桌子, 椅子. In 儿子 son and 孩子 child you can still hear its old meaning, child.",
    "生": "Life and people: 学生 student, 医生 doctor, 先生 Mr; and being alive: 生日 birthday, 生病 fall ill.",
    "面": "At the end, 面 means side: 前面, 后面, 上面, 下面, 里面, 外面. At the start it is flour: 面包 bread, 面条儿 noodles.",
    "下": "Down and finishing: 下来 come down, 下班 finish work, 下课 class is over, 下雨 rain falls. 下午 is the later half of the day.",
    "好": "Good + a verb = good to do: 好吃 tasty, 好看 good-looking, 好听 nice to hear, 好玩儿 fun. In 爱好 hobby it is read hào, to like.",
    "来": "Movement toward the speaker: 进来 come in, 出来 come out, 回来 come back. Swap in 去 to move away.",
    "去": "Movement away from the speaker: 进去 go in, 出去 go out, 回去 go back. 去年 is last year, the year that went.",
    "小": "Small and young: 小孩儿 kid, 小朋友 child, 小学 primary school, 从小 since childhood. 小时 hour is the odd one out.",
    "饭": "Meals: 早饭, 午饭, 晚饭 (breakfast, lunch, dinner), 米饭 rice, 做饭 cook; and places to eat: 饭店, 饭馆.",
    "那": "Pointing at what is far: 那个 that one, 那些 those, 那里 / 那儿 / 那边 there, 那么 / 那样 like that.",
    "这": "Pointing at what is near: 这个 this one, 这些 these, 这里 / 这儿 / 这边 here, 这么 / 这样 like this. Swap in 那 for far.",
    "哪": "The question version of 这 and 那: 哪个 which one, 哪些 which ones, 哪里 / 哪儿 where?",
    "天": "Days: 今天 today, 明天 tomorrow, 昨天 yesterday, 白天 daytime, 星期天 Sunday. 天气 weather comes from 天 sky.",
    "车": "Vehicles: 火车 train, 公交车 bus, 出租车 taxi; and what you do with them: 开车 drive, 打车 take a taxi, 车站 station.",
    "电": "Electricity: everything here runs on power. 电话 phone, 电脑 computer (electric brain), 电视 TV, 电影 film.",
    "中": "Middle: 中午 midday, 中学 middle school, 高中 high school. And China: 中国, the Middle Kingdom, and 中文 Chinese.",
    "边": "Side, always last: 左边 left, 右边 right, 旁边 next to, 外边 outside, 这边 / 那边 this / that side.",
    "么": "A light ending (me) on question and pointing words: 什么 what, 怎么 how, 为什么 why, 这么 / 那么 so.",
    "色": "Colour: 白色, 黑色, 红色, 绿色, and 颜色 colour itself. Colour + 色 = the colour as a noun.",
    "不": "Not: 不错 not bad, 不要 don't, 不客气 you're welcome (don't be polite). 不 becomes bú before a 4th tone.",
    "出": "Out: 出来 come out, 出去 go out, 出门 leave home, 出国 go abroad, 出租车 taxi (a car out for rent).",
    "店": "Shops: 商店 shop, 书店 bookshop, 药店 pharmacy, 饭店 restaurant. Thing + 店 = a shop for it (but 酒店 is a hotel).",
    "些": "An amount: 一些 / 有些 some, 这些 these, 那些 those, 哪些 which ones?",
    "们": "Plural ending for people: 我们 we, 你们 you all, 他们 / 她们 they. 它们 is they for things and animals.",
    "时": "Time: 时间 time, 时候 moment, 小时 hour, 有时 sometimes, 小时候 childhood.",
    "一": "One, a bit: 一下 a moment, 一些 some, 一会儿 a while, 一半 half, 一起 together. Its tone changes: yí before a 4th tone, yì before the others.",
    "有": "Have, there is: 有的 / 有些 some, 有时 sometimes, 有点儿 a bit, 有意思 interesting (has meaning).",
    "意思": "意思 is meaning: 有意思 interesting (has meaning), 没意思 boring, 不好意思 sorry, excuse me (I'm embarrassed).",
    "开": "Open, start, drive: 打开 open, 开始 begin, 开学 school starts, 开车 drive.",
    "起": "Rise: 起床 get out of bed, 起来 get up. Also 一起 together and 对不起 sorry.",
    "机": "Machine and plane: 手机 phone (hand machine), 飞机 plane (flying machine), 机场 airport, 机票 plane ticket.",
    "个": "The everyday measure word: 这个, 那个, 哪个. 个子 is your height.",
    "年": "Year: 今年, 明年, 去年 (this, next, last year), and 过年 celebrate the New Year.",
    "孩": "Child: 孩子, 小孩儿 kid, 男孩儿 boy, 女孩儿 girl.",
    "里": "Inside and place: 里面 inside, 这里 here, 那里 there, 哪里 where?",
    "朋友": "Friend: 男朋友 boyfriend, 女朋友 girlfriend, 小朋友 child (what adults call kids: little friend).",
    "女": "Female: 女儿 daughter, 女孩儿 girl, 女朋友 girlfriend, 女士 Ms, lady. Swap in 男 for the male words.",
    "午": "Noon: 中午 midday, 上午 morning (before noon), 下午 afternoon (after noon), 午饭 lunch.",
    "包": "Bag or bun: 书包 school bag; 包子 steamed bun, 面包 bread.",
    "国": "Country: 中国 China, 外国 foreign country, 出国 go abroad.",
    "门": "Door: 门口 doorway, 出门 leave home, 门票 entrance ticket.",
    "打": "Hit, and many everyday actions: 打电话 make a call, 打车 take a taxi, 打开 open.",
    "话": "Speech: 说话 speak, 电话 phone (electric speech), 打电话 make a call.",
    "大": "Big: 大学 university (big school), 大学生 college student, 大家 everybody (the big family).",
    "书": "Book: 书包 school bag, 书店 bookshop, 读书 read, study.",
    "间": "Room, space: 房间 room, 洗手间 washroom; and a space in time: 时间.",
    "过": "Pass, cross: 过来 come over, 过去 go over or the past, 过年 spend the New Year.",
    "看": "Look: 看见 see, 好看 good-looking, 看病 see a doctor.",
    "茶": "Tea: 红茶 black tea (red in Chinese), 绿茶 green tea, 奶茶 milk tea.",
    "见": "见 is the result, you actually saw or heard it: 看见 see, 听见 hear. 再见 goodbye, see you again.",
    "没": "Not have, no: 没事 it's nothing, 没关系 no problem, 没意思 boring.",
    "样": "Way, kind: 这样 like this, 那样 like that, 怎么样 how is it?",
    "奶": "Milk and grandma: 牛奶 milk, 奶茶 milk tea; 奶奶 grandma.",
    "手": "Hand: 手机 phone, 手表 watch, 洗手间 washroom (wash-hands room).",
    "外": "Outside and foreign: 外面 / 外边 outside, 外国 foreign country.",
    "星期": "Week: 星期天 and 星期日 are both Sunday. Add 一 to 六 for Monday to Saturday.",
    "白": "White and daylight: 白色 white, 白天 daytime.",
    "气": "Air and manner: 天气 weather; 不客气 you're welcome (don't be polite).",
    "要": "Want, going to: 不要 don't, 快要 about to.",
    "家": "Home, family: 大家 everybody, 家人 family members.",
    "是": "Be, inside linking words: 但是 but, 还是 or (in questions).",
    "院": "Courtyard, institution: 医院 hospital, 电影院 cinema.",
    "常": "Often, ordinary: 经常 often; 非常 extremely (not ordinary).",
    "高": "High, tall: 高中 high school, 高兴 happy (high spirits).",
    "公": "Public: 公交车 bus, 公司 company.",
    "汉": "Chinese, after the Han people: 汉语 Chinese language, 汉字 Chinese character.",
    "字": "Character, written word: 汉字 Chinese character, 名字 name.",
    "听": "Listen: 听见 hear, 好听 nice to hear.",
    "红": "Red: 红色 red. 红茶 is black tea, named after the colour of the drink.",
    "回": "Return: 回来 come back, 回去 go back.",
    "场": "An open place with a purpose: 机场 airport, 商场 mall.",
    "得": "A light de that sits after a verb: 觉得 think, feel; 记得 remember.",
    "票": "Ticket: 机票 plane ticket, 门票 entrance ticket.",
    "进": "Enter: 进来 come in, 进去 go in.",
    "今": "This, now: 今天 today, 今年 this year.",
    "经": "Pass through: 已经 already, 经常 often.",
    "觉": "Two readings: jué to feel (觉得 think, feel) and jiào sleep (睡觉 to sleep).",
    "病": "Illness: 生病 fall ill, 看病 see a doctor.",
    "可": "Can, may: 可以 can, may; 可能 maybe.",
    "以": "可以 can, may; 所以 so, therefore.",
    "快": "Fast and happy: 快要 about to, 快乐 happy.",
    "球": "Ball: 足球 football (foot ball), 篮球 basketball (basket ball).",
    "绿": "Green: 绿色 green, 绿茶 green tea.",
    "路": "Road: 走路 walk, 路上 on the way.",
    "游": "Swim, travel: 游泳 swim, 旅游 travel.",
    "事": "Matter: 事情 matter, thing; 没事 it's nothing, it's OK.",
    "明": "Bright, next: 明天 tomorrow, 明年 next year.",
    "名": "Name: 名字 name, 姓名 full name (surname + name).",
    "男": "Male: 男孩儿 boy, 男朋友 boyfriend. Swap in 女 for the female words.",
    "你": "You: 你们 you all, 你好 hello (you good).",
    "果": "Fruit: 水果 fruit, 苹果 apple.",
    "问": "Ask: 问题 question, problem; 请问 excuse me, may I ask.",
    "班": "Work shift: 上班 go to work, 下班 finish work. Same pair as 上课 / 下课.",
    "商": "Trade: 商店 shop, 商场 mall.",
    "课": "Lesson: 上课 class starts, 下课 class is over. Same pair as 上班 / 下班.",
    "网": "The internet: 上网 go online, 网上 online. Same two characters in the other order, a different job.",
    "日": "Day, sun: 生日 birthday, 星期日 Sunday (a bit more formal than 星期天).",
    "服": "Clothes, suit: 衣服 clothes; 舒服 comfortable.",
    "晚": "Late, evening: 晚上 evening, 晚饭 dinner.",
    "为": "Why and because: 为什么 why? 因为 because. The question and its answer share 为.",
    "在": "Be at, be doing: 现在 now; 正在 in the middle of doing.",
    "医": "Medicine: 医生 doctor, 医院 hospital.",
    "早": "Early, morning: 早上 morning, 早饭 breakfast.",
}

# ---------------------------------------------------------------------------
# Pinyin helpers
# ---------------------------------------------------------------------------
TONES = {}
for t, marks in enumerate(["āēīōūǖ", "áéíóúǘ", "ǎěǐǒǔǚ", "àèìòùǜ"], start=1):
    for m in marks:
        TONES[m] = t
PLAIN = str.maketrans({m: b for row in ["āēīōūǖ", "áéíóúǘ", "ǎěǐǒǔǚ", "àèìòùǜ"] for m, b in zip(row, "aeiouü")})


def tone(s):
    return next((TONES[c] for c in s if c in TONES), 0)


def base(s):
    return s.translate(PLAIN)


def clean(s):
    s = unicodedata.normalize("NFC", str(s or ""))
    s = re.sub(r"[​-‍﻿]", "", s)
    return re.sub(r"\s+", " ", s).strip()


def syllables(w, py):
    syl = clean(py).split(" ")
    assert len(syl) == len(w), (w, py)
    out = []
    for i, (ch, s) in enumerate(zip(w, syl)):
        if ch == "儿" and i > 0 and s == "er":
            s = "r"  # erhua: 哪儿 nǎr
        out.append(s)
    # tone changes of 一 and 不 before another syllable
    for i, ch in enumerate(w[:-1]):
        nxt = tone(out[i + 1]) if out[i + 1] != "r" else 0
        if ch == "一" and base(out[i]) == "yi" and nxt:
            out[i] = "yí" if nxt == 4 else "yì"
        if ch == "不" and out[i] in ("bù", "bú") and nxt:
            out[i] = "bú" if nxt == 4 else "bù"
    return out


# ---------------------------------------------------------------------------
# Read the sheet
# ---------------------------------------------------------------------------
with open(SRC, "rb") as f:  # .xlsx content behind an .xls name
    ws = openpyxl.load_workbook(f, read_only=False).worksheets[0]
rows = list(ws.iter_rows(values_only=True))
head = [clean(h) for h in rows[0]]
col = {k: head.index(k) for k in ["词语", "拼音", "翻译", "词性", "所在等级"]}

words = OrderedDict()
for r in rows[1:]:
    w = clean(r[col["词语"]])
    if not w:
        continue
    py = PY_FIX.get(w, clean(r[col["拼音"]]))
    en = clean(r[col["翻译"]])
    pos = [p for p in re.split(r"[、,，]", clean(r[col["词性"]])) if p]
    lvl = 2 if "New HSK2" in clean(r[col["所在等级"]]) else 1
    if w in words:  # duplicated row: merge parts of speech
        e = words[w]
        e["pos"] += [p for p in pos if p not in e["pos"]]
        e["l"] = min(e["l"], lvl)
        continue
    words[w] = {"w": w, "py": syllables(w, py), "en": EN_FIX.get(w, en), "pos": pos, "l": lvl}

unused = sorted(set(EN_FIX) - set(words)) + sorted(set(PY_FIX) - set(words))
assert not unused, f"fixes for words not in the list: {unused}"

# ---------------------------------------------------------------------------
# Families
# ---------------------------------------------------------------------------
multi = [w for w in words if len(w) > 1]
fam = defaultdict(list)
for w in multi:
    for ch in dict.fromkeys(w):
        fam[ch].append(w)

hubs = OrderedDict()
bound = {}
for ch, ws_ in fam.items():
    if len(ws_) < 2:
        continue
    # a character glued to the same neighbour in every word → hub for that word
    pairs = None
    for w in ws_:
        here = {w[i:i + 2] for i in range(len(w) - 1) if ch in w[i:i + 2]}
        pairs = here if pairs is None else pairs & here
    glued = sorted(p for p in pairs or [] if p in words)
    if glued:
        bound[ch] = glued[0]
        continue
    hubs[ch] = [w for w in ws_]
for ch, b in sorted(bound.items()):
    leaves = [w for w in multi if b in w and w != b]
    if len(leaves) >= 2 and b not in hubs:
        hubs[b] = leaves

missing = [h for h in hubs if h not in words and h not in CHAR_GLOSS]
assert not missing, f"hubs without a meaning (add to CHAR_GLOSS): {missing}"
no_thread = [h for h in hubs if h not in THREAD]
assert not no_thread, f"hubs without a THREAD note: {no_thread}"
stale = sorted((set(THREAD) | set(CHAR_GLOSS)) - set(hubs))
assert not stale, f"notes for characters that are not hubs: {stale}"


def reading_info(h, leaves):
    """Readings of a one-character hub across its words, light tones and tone changes."""
    if len(h) != 1:
        return {}
    cite = words[h]["py"][0] if h in words else CHAR_GLOSS[h][0]
    groups = OrderedDict()
    light = []
    for w in leaves:
        for i, ch in enumerate(w):
            if ch != h:
                continue
            s = words[w]["py"][i]
            if tone(s) == 0 and s != "r" and tone(cite) != 0:
                light.append(w)
            key = s if s == "r" else (base(s) if h in "一不" else (s if tone(s) else None))
            if key is None:
                continue
            groups.setdefault(key, []).append(w)
    info = {}
    if h in "一不":
        changed = OrderedDict()
        for w in leaves:
            s = words[w]["py"][w.index(h)]
            if tone(s) and s != cite:
                changed.setdefault(s, []).append(w)
        if changed:
            info["sandhi"] = [{"py": k, "w": v} for k, v in changed.items()]
    elif len(groups) > 1:
        order = sorted(groups.items(), key=lambda kv: (kv[0] != cite, -len(kv[1])))
        info["readings"] = [{"py": k, "w": v} for k, v in order]
    light = list(dict.fromkeys(light))
    if light:
        info["light"] = light
    return info


out_hubs = []
for h, leaves in hubs.items():
    e = words.get(h)
    py, pos, en = (" ".join(e["py"]), e["pos"], e["en"]) if e else CHAR_GLOSS[h]
    if h == "觉":
        py = "jué jiào"
    hub = {"h": h, "py": py, "pos": pos, "en": en, "word": bool(e), "leaves": leaves, "note": THREAD[h]}
    if e:
        hub["l"] = e["l"]
    hub.update(reading_info(h, leaves))
    out_hubs.append(hub)

data = {
    "source": "exam-materials/vocab/HSK-2.xls",
    "words": list(words.values()),
    "hubs": out_hubs,
}
banner = (f"/* HSK 2 vocabulary ({len(words)} words) and its character graphs.\n"
          "   Generated by site/tools/build_vocab.py from exam-materials/vocab/HSK-2.xls — do not edit by hand. */\n")
js = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
js = js.replace('{"w":', '\n{"w":').replace('{"h":', '\n{"h":')
OUT.write_text(banner + "window.HSK_VOCAB=" + js + ";\n", encoding="utf8")

linked = {w for hub in out_hubs for w in hub["leaves"]} | {h["h"] for h in out_hubs if h["word"]}
print(f"{len(words)} words ({sum(1 for w in words.values() if w['l'] == 2)} new in HSK 2), "
      f"{len(out_hubs)} graphs, {len(linked)} words linked")
print("merged into word hubs:", ", ".join(f"{c}→{b}" for c, b in sorted(bound.items())))
for hub in out_hubs:
    for k in ("readings", "sandhi"):
        if k in hub:
            print(f"  {hub['h']} {k}: " + " · ".join(f"{g['py']} {'/'.join(g['w'])}" for g in hub[k]))
print(f"wrote {OUT.relative_to(SITE.parent)} ({OUT.stat().st_size // 1024} KB)")
