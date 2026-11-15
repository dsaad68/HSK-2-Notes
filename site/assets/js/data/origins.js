/* ==========================================================================
   Origins — where each radical comes from, what it means, how to remember it,
   and how it relates to the example characters. Includes two drawings each:
     art   : an illustration of the real-world thing (viewBox 0 0 160 120)
     early : a stylised early (ancient-script-inspired) form (viewBox 0 0 100 100)
   Classes: l = line (draws itself), lt thin, lk thick, la accent, ld dashed,
            f* = fills (fade in after the lines). See styles.css "Illustrations".
   Link strength (rel): strong · partial · sound · form
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- drawing helpers ---------- */
  const f = (n) => +n.toFixed(1);
  const rays = (cx, cy, r1, r2, n, off) => {
    let d = "";
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + (off || 0);
      d += `M${f(cx + Math.cos(a) * r1)} ${f(cy + Math.sin(a) * r1)}L${f(cx + Math.cos(a) * r2)} ${f(cy + Math.sin(a) * r2)}`;
    }
    return d;
  };
  const drop = (x, y, s) => {
    s = s || 1;
    return `<path class="fw l" d="M${x} ${f(y - 12 * s)}C${f(x + 6 * s)} ${f(y - 4 * s)} ${f(x + 8 * s)} ${f(y + s)} ${f(x + 8 * s)} ${f(y + 5 * s)}A${f(8 * s)} ${f(8 * s)} 0 0 1 ${f(x - 8 * s)} ${f(y + 5 * s)}C${f(x - 8 * s)} ${f(y + s)} ${f(x - 6 * s)} ${f(y - 4 * s)} ${x} ${f(y - 12 * s)}Z"/>`;
  };
  const flame = (x, y, s) => {
    s = s || 1;
    const P = (dx, dy) => `${f(x + dx * s)} ${f(y + dy * s)}`;
    return `<path class="ff l" d="M${P(0, -30)}C${P(7, -18)} ${P(13, -10)} ${P(10, 0)}C${P(8, 7)} ${P(-8, 7)} ${P(-10, 0)}C${P(-13, -10)} ${P(-6, -16)} ${P(0, -30)}Z"/>` +
      `<path class="ff2" d="M${P(0, -16)}C${P(4, -9)} ${P(6, -4)} ${P(4, 1)}C${P(3, 4)} ${P(-3, 4)} ${P(-4, 1)}C${P(-6, -4)} ${P(-3, -9)} ${P(0, -16)}Z"/>`;
  };
  const star = (x, y, r) => `<path class="fm" d="M${x} ${f(y - r)}Q${x} ${y} ${f(x + r)} ${y}Q${x} ${y} ${x} ${f(y + r)}Q${x} ${y} ${f(x - r)} ${y}Q${x} ${y} ${x} ${f(y - r)}Z"/>`;
  const foot = (x, y, rot, s) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s || 1})"><ellipse class="fa" rx="4.2" ry="7"/><circle class="fa" cx="-3.4" cy="-9.8" r="1.5"/><circle class="fa" cx="-0.5" cy="-10.8" r="1.5"/><circle class="fa" cx="2.5" cy="-10" r="1.4"/></g>`;
  const crenel = (x0, x1, y, h, w) => {
    let d = `M${x0} ${y}`;
    for (let x = x0; x < x1; x += 2 * w) d += `V${y - h}H${Math.min(x + w, x1)}V${y}H${Math.min(x + 2 * w, x1)}`;
    return d;
  };
  const ground = (y, x0, x1) => `<path class="l lt" d="M${x0 || 8} ${y}H${x1 || 152}"/>`;

  /* ---------- the 38 components ---------- */
  const O = {
    hand: {
      story: "手 began as a picture of a hand with all five fingers spread. On the left side of a character it is squeezed into three strokes, 扌, and its last stroke rises (提) to reach toward the part on the right.",
      means: ["hand", "holding", "hitting", "pushing", "catching"],
      hook: "扌 is a hand gripping a pole: the hook at the bottom is your fingers curling around it.",
      links: {
        "打": { rel: "strong", note: "You hit (打) with your hand. 丁 dīng hints at the sound." },
        "接": { rel: "strong", note: "You receive and catch (接) things with your hands." }
      },
      art: `<path class="la" d="M26 36Q20 46 25 58M17 30Q8 46 15 64"/>
        <rect class="fs l" x="38" y="52" width="11" height="34" rx="5.5" transform="rotate(-38 44 70)"/>
        <rect class="fs l" x="60" y="22" width="11" height="48" rx="5.5"/><rect class="fs l" x="72.5" y="13" width="11" height="57" rx="5.5"/>
        <rect class="fs l" x="85" y="17" width="11" height="53" rx="5.5"/><rect class="fs l" x="97" y="30" width="10" height="40" rx="5"/>
        <path class="fs" d="M57 62H109V92Q107 110 88 111H76Q57 110 57 92Z"/>
        <path class="l" d="M57 64V92Q57 110 76 111H88Q107 110 108 92L109 64"/>
        <path class="l lt" d="M68 84Q82 92 98 80"/>
        <rect class="fr l" x="64" y="108" width="40" height="12" rx="3"/>`,
      early: `<path class="e" d="M50 95Q46 76 50 56"/><path class="e" d="M50 56V12M50 56Q38 40 26 25M50 56Q62 40 74 25M50 62Q36 57 21 50M50 62Q64 57 79 50"/>`
    },
    ice: {
      story: "冫 comes from 仌, an ancient picture of ice: two shards of cracked ice. You still see it in 冰 (ice). As a radical it is just two strokes, a dot and a rising stroke.",
      means: ["ice", "cold", "freezing"],
      hook: "Water (氵) has three drops. When it freezes, one drop gets locked in the ice and only two are left: 冫.",
      links: {
        "冷": { rel: "strong", note: "Cold like ice. 令 lìng hints at the sound (lěng)." },
        "次": { rel: "form", note: "No link to ice. The two strokes in 次 were once 二 (two), hinting at 'second, next'. It's just a lookalike." }
      },
      art: `<rect class="fi l" x="14" y="12" width="132" height="11" rx="5.5"/>
        <path class="fi l" d="M24 23L30 58L36 23M44 23L48 44L52 23M60 23L68 72L76 23M88 23L92 46L96 23M108 23L114 62L120 23M130 23L134 42L138 23"/>
        <ellipse class="fi l" cx="50" cy="104" rx="36" ry="8"/><path class="l lt" d="M36 102L46 106L54 101L62 105"/>
        <path class="l la" d="${rays(120, 92, 3, 16, 6, Math.PI / 6)}"/><circle class="fa" cx="120" cy="92" r="3"/>`,
      early: `<path class="e" d="M24 46L40 20L56 46"/><path class="e" d="M44 82L60 56L76 82"/>`
    },
    door: {
      story: "門 was a picture of a two-leaf door, each leaf in its own frame. Simplified Chinese reduced it to 门: the frame stays and the panels go.",
      means: ["door", "gate", "gap", "inside"],
      hook: "门 is a door frame seen from the front, and the dot on top is the door knocker.",
      links: {
        "间": { rel: "strong", note: "The old form 閒 showed moonlight (月) shining through a gap in the door, which came to mean 'gap', 'between' and 'room' (房间)." },
        "问": { rel: "sound", note: "Here 门 mén is the SOUND part (mén → wèn). The meaning comes from 口, the mouth: you ask with your mouth." }
      },
      art: `<path class="fk l" d="M14 26Q80 6 146 26L146 32H14Z"/>
        <rect class="fk l" x="30" y="32" width="100" height="80"/>
        <rect class="fn l" x="38" y="38" width="41" height="74"/><rect class="fn l" x="81" y="38" width="41" height="74"/>
        <rect class="l lt" x="44" y="44" width="29" height="26" rx="2"/><rect class="l lt" x="44" y="76" width="29" height="30" rx="2"/>
        <rect class="l lt" x="87" y="44" width="29" height="26" rx="2"/><rect class="l lt" x="87" y="76" width="29" height="30" rx="2"/>
        <circle class="fm l" cx="73" cy="74" r="4"/><circle class="fm l" cx="87" cy="74" r="4"/>${ground(112)}`,
      early: `<path class="e" d="M10 14H90"/><path class="e" d="M16 92V24H44V92M16 42H44"/><path class="e" d="M56 92V24H84V92M56 42H84"/>`
    },
    walk: {
      story: "From 辵: 彳 (a road) plus 止 (a foot), together a picture of walking along a road. Squeezed into one long sweep, it now wraps the bottom-left of a character and is always written last.",
      means: ["walking", "roads", "distance", "coming and going"],
      hook: "辶 is a road sweeping under the character. The character rides along it, so the road is written last.",
      links: {
        "过": { rel: "strong", note: "To pass by or through, which you do by walking. It also means 'to spend (time)', as in 过生日." },
        "远": { rel: "strong", note: "Far means a long walk. 元 yuán gives the sound." }
      },
      art: `<path class="lroad" d="M14 112C42 98 44 78 74 72C110 64 116 40 148 26"/>
        <path class="l ld" d="M14 112C42 98 44 78 74 72C110 64 116 40 148 26"/>
        ${foot(26, 96, 55, 1.25)}${foot(46, 96, 50, 1.25)}${foot(60, 72, 70, 1.25)}${foot(84, 78, 75, 1.25)}${foot(100, 54, 55, 1.25)}${foot(120, 56, 50, 1.25)}${foot(132, 30, 60, 1.25)}`,
      early: `<path class="e" d="M30 14L16 30M32 34L16 52M25 44V90"/><path class="e" d="M48 92H88M68 52V92M68 70H82M52 64V92"/>`
    },
    water: {
      story: "水 pictured a flowing stream with drops splashing on either side. On the left side of a character it becomes three drops, 氵.",
      means: ["water", "rivers", "seas", "washing", "swimming"],
      hook: "Three drops of water dripping down the left side of the character.",
      links: {
        "汉": { rel: "strong", note: "汉 was the name of the Han River. The Han dynasty took its name from it, and so did the Chinese people and language (汉语, 汉字)." },
        "洗": { rel: "strong", note: "You wash (洗) with water. 先 xiān hints at the sound." }
      },
      art: `<path class="fw" d="M58 50C84 38 120 62 160 44V120H52C66 96 50 72 58 50Z"/>
        <path class="lw" d="M64 66q10-8 20 0t20 0t20 0t20 0M60 86q10-8 20 0t20 0t20 0t20 0t16 0M70 106q10-8 20 0t20 0t20 0t20 0"/>
        ${drop(30, 28)}${drop(26, 58)}${drop(36, 92, 1.1)}`,
      early: `<path class="e" d="M50 8C38 28 62 44 50 60C38 76 60 84 50 96"/><path class="e" d="M30 22L25 34M28 48L23 60M32 70L27 82M70 22L75 34M72 48L77 60M68 70L73 82"/>`
    },
    roof: {
      story: "A house seen from the side: a pitched roof over two walls. The dot on top is the ridge of the roof.",
      means: ["house", "home", "shelter", "safe inside"],
      hook: "宀 is a roof, and everything under it is at home, safe and complete.",
      links: {
        "家": { rel: "strong", note: "A pig (豕) under a roof. In ancient China a household kept its pigs at home, and that made it a family home." },
        "完": { rel: "partial", note: "Originally a complete, intact house; now 'to finish'. 元 yuán gives the sound." }
      },
      art: `<path class="fr l" d="M12 60Q30 58 40 50L80 26L120 50Q130 58 148 60L141 67H19Z"/>
        <circle class="fa" cx="80" cy="18" r="4.5"/>
        <rect class="fn l" x="34" y="67" width="92" height="43"/><rect class="fk l" x="70" y="82" width="20" height="28"/>
        <rect class="fi l" x="44" y="76" width="16" height="14"/><rect class="fi l" x="100" y="76" width="16" height="14"/>
        <g transform="translate(140 101)"><ellipse class="fs l" rx="11" ry="7.5"/><circle class="fs l" cx="-12" cy="-2" r="4"/><path class="l lt" d="M-6 7V11M6 7V11"/></g>${ground(110)}`,
      early: `<path class="e" d="M50 8V22"/><path class="e" d="M12 52L50 22L88 52"/><path class="e" d="M20 46V90M80 46V90"/>`
    },
    silk: {
      story: "糸 pictured a twisted skein of silk thread with loose ends hanging at the bottom. In simplified Chinese its left-side form is just three strokes: 纟.",
      means: ["silk", "thread", "weaving", "tying", "colours (dyed silk)"],
      hook: "纟 is a thread zig-zagging down: two twists and a rising tail.",
      links: {
        "红": { rel: "partial", note: "Originally the colour of dyed silk, a pinkish red. 工 gōng gives the sound." },
        "绿": { rel: "partial", note: "Green-dyed silk. 录 lù gives the sound." }
      },
      art: `<circle class="l" cx="56" cy="11" r="5"/>
        <path class="la lk" d="M56 16C84 26 28 44 56 56C84 68 28 86 56 98M56 16C28 26 84 44 56 56C28 68 84 86 56 98"/>
        <path class="la" d="M56 98L46 114M56 98V116M56 98L66 114"/>
        <path class="l lt ld" d="M96 72C84 74 78 60 66 56"/>
        <ellipse class="fn l" cx="120" cy="72" rx="25" ry="15"/>
        <path class="l lt" d="M101 64Q120 58 139 66M98 72Q120 66 142 75M101 80Q120 75 139 81"/>`,
      early: `<path class="e" d="M50 8C70 18 30 34 50 46C70 58 30 72 50 80M50 8C30 18 70 34 50 46C30 58 70 72 50 80"/><path class="e" d="M50 80L38 94M50 80V96M50 80L62 94"/>`
    },
    earth: {
      story: "土 was a lump of earth standing on the ground. On the left side of a character its bottom stroke tilts up into a rising stroke (提).",
      means: ["earth", "soil", "ground", "places"],
      hook: "A cross planted in the ground: earth (土) is what you stand on.",
      links: {
        "场": { rel: "strong", note: "Originally a flat open piece of ground, such as a threshing floor. Now any place or field: 机场 (airport)." },
        "块": { rel: "strong", note: "A lump of earth, a clod. Now 'piece', and the word for one yuan (一块钱)." }
      },
      art: `<rect class="fe2" x="0" y="96" width="160" height="24"/>
        <path class="fe l" d="M38 96C44 56 64 34 80 34C96 34 116 56 122 96Z"/>
        <path class="l" d="M80 34V18"/><path class="fp l" d="M80 25Q70 14 64 19Q71 28 80 25ZM80 22Q92 10 98 16Q90 25 80 22Z"/>
        <ellipse class="fn l lt" cx="24" cy="107" rx="6" ry="3.5"/><ellipse class="fn l lt" cx="134" cy="109" rx="5" ry="3"/><ellipse class="fn l lt" cx="62" cy="111" rx="4" ry="2.5"/>
        <path class="l" d="M0 96H160"/>`,
      early: `<path class="e" d="M50 22C64 40 64 64 50 72C36 64 36 40 50 22Z"/><path class="e" d="M14 86H86"/>`
    },
    grass: {
      story: "From 艸: two sprouts of grass side by side. Squeezed onto the top of a character it became 艹.",
      means: ["grass", "plants", "flowers", "herbs", "vegetables"],
      hook: "艹 is a tiny lawn on top of the character: two blades of grass and a line of soil.",
      links: {
        "茶": { rel: "strong", note: "Tea is made from the leaves of a plant." },
        "菜": { rel: "strong", note: "Vegetables are plants. 采 cǎi (to pick) adds the idea of picking them, and hints at the sound." }
      },
      art: `${ground(106)}
        <path class="fp l" d="M50 106C48 80 44 58 36 36C48 56 54 80 56 106ZM46 106C38 90 28 80 14 74C30 78 42 88 52 106ZM54 106C60 90 68 76 82 66C72 80 62 92 58 106Z"/>
        <path class="fp l" d="M108 106C106 80 104 58 98 34C110 56 114 80 114 106ZM104 106C96 92 88 82 76 78C90 80 100 90 110 106ZM112 106C118 90 128 78 144 72C132 84 122 94 116 106Z"/>
        <circle class="ff2 l" cx="132" cy="50" r="5"/><path class="l lt" d="M132 55V66"/>`,
      early: `<path class="e" d="M30 92V24M30 58C20 52 16 44 14 32M30 58C40 52 44 44 46 32"/><path class="e" d="M70 92V24M70 58C60 52 56 44 54 32M70 58C80 52 84 44 86 32"/>`
    },
    shelter: {
      story: "广 pictured a building set against a cliff: the overhang is the roof, the cliff is one wall, and the other side is open.",
      means: ["building", "shop", "hall", "shelter"],
      hook: "广 is a lean-to: a roof and a single wall. A shop (店) is open to the street.",
      links: {
        "店": { rel: "strong", note: "A shop, a building open to the street. 占 zhàn hints at the sound (diàn)." },
        "床": { rel: "partial", note: "A wooden (木) frame under a roof is a bed." }
      },
      art: `<path class="fe l" d="M20 116V30Q20 17 33 16H140Q150 16 150 25V33H40V116Z"/>
        <circle class="fa" cx="96" cy="8" r="4.5"/>
        <path class="l lt" d="M26 52L34 58M24 82L33 86M60 22L70 27M112 22L120 27"/>
        <rect class="fk l" x="54" y="78" width="72" height="10" rx="2"/><path class="l" d="M60 88V116M120 88V116"/>
        <circle class="fm l" cx="70" cy="72" r="6"/><circle class="fr l" cx="86" cy="72" r="6"/><circle class="fp l" cx="102" cy="72" r="6"/>
        <path class="l lt" d="M114 33V44"/><ellipse class="fa" cx="114" cy="51" rx="6" ry="8"/>${ground(116, 10, 150)}`,
      early: `<path class="e" d="M56 8V20"/><path class="e" d="M22 22H86"/><path class="e" d="M24 22C24 50 22 70 12 92"/>`
    },
    bamboo: {
      story: "竹 pictured two bamboo stalks with leaves hanging down. On top of a character it is squeezed into ⺮: two small halves of three strokes each.",
      means: ["bamboo", "writing brushes", "baskets", "bamboo slips"],
      hook: "Two bamboo sprigs on top, each with a stalk, a leaf and a little dot of a leaf.",
      links: {
        "笔": { rel: "strong", note: "A brush is a bamboo (⺮) handle with hair (毛) at the tip." },
        "第": { rel: "partial", note: "Originally the order of bamboo slips bound in a row, which gave 'sequence' and the ordinals 第一, 第二. 弟 dì gives the sound." }
      },
      art: `<rect class="fb l" x="44" y="8" width="10" height="110" rx="4"/><path class="l" d="M44 40H54M44 72H54M44 102H54"/>
        <rect class="fb l" x="104" y="16" width="10" height="102" rx="4"/><path class="l" d="M104 46H114M104 78H114"/>
        <path class="fp l" d="M54 40C64 34 80 36 92 48C78 48 64 46 54 40ZM44 72C34 66 18 68 6 80C20 80 34 78 44 72ZM54 74C62 70 72 74 80 84C70 82 60 80 54 74Z"/>
        <path class="fp l" d="M114 46C124 40 140 42 152 54C138 54 124 52 114 46ZM104 78C94 72 78 74 66 86C80 86 94 84 104 78Z"/>`,
      early: `<path class="e" d="M30 12V60M30 18Q20 32 12 50M30 34Q22 46 18 60"/><path class="e" d="M70 12V60M70 18Q60 32 52 50M70 34Q62 46 58 60"/>`
    },
    heart: {
      story: "心 pictured the heart. In ancient China people believed you felt AND thought with the heart. Standing upright on the left side it became 忄: a vertical stroke with a dot on each side.",
      means: ["feelings", "the mind", "emotions", "thinking"],
      hook: "忄 is a heart standing upright, a beating heart with a drop on each side.",
      links: {
        "快": { rel: "strong", note: "Originally 'pleased, happy', a feeling (快乐). 夬 guài gives the sound." },
        "忙": { rel: "strong", note: "Heart + 亡 (to lose): so busy you lose your mind! 亡 wáng also hints at the sound." }
      },
      art: `<path class="fr2 l" d="M80 108C46 86 30 66 34 46C38 28 58 24 70 36C74 40 78 44 80 48C82 44 86 40 90 36C102 24 122 28 126 46C130 66 114 86 80 108Z"/>
        <path class="la lk" d="M66 34C64 22 70 12 79 12M93 34C95 24 99 16 108 14"/>
        <path class="l lt" d="M80 52C78 68 74 82 70 94"/>
        <path class="fa" d="M136 22c-3-4-9-1-6 4l6 6l6-6c3-5-3-8-6-4Z"/><path class="fa" d="M24 18c-2-3-7-1-5 3l5 5l5-5c2-4-3-6-5-3Z"/>`,
      early: `<path class="e" d="M50 88C20 70 14 44 24 30C34 18 46 26 50 38C54 26 66 18 76 30C86 44 80 70 50 88Z"/><path class="e" d="M50 40V70"/>`
    },
    foot: {
      story: "足 pictured a leg: the circle on top is the knee and the bottom part (止) is the foot. On the left side its last stroke rises (提).",
      means: ["foot", "leg", "running", "jumping", "kicking"],
      hook: "In 𧾷 the box on top is your knee and the rest is your foot stepping forward.",
      links: {
        "跑": { rel: "strong", note: "You run with your feet. 包 bāo hints at the sound (pǎo)." },
        "踢": { rel: "strong", note: "You kick with your foot (踢足球)." }
      },
      art: `<path class="la" d="M18 58H44M24 72H46M16 86H42"/>
        <path class="fs l" d="M58 12H76L75 88C80 96 104 98 118 102C126 104 126 116 118 116H60C54 116 53 106 57 88Z"/>
        <circle class="fs l" cx="67" cy="24" r="13"/>
        <path class="l lt" d="M100 108V116M109 106V116"/>${ground(116, 10, 150)}`,
      early: `<circle class="e" cx="50" cy="26" r="16"/><path class="e" d="M50 42V70M22 90H82M50 70V90M50 76H68M32 72V90"/>`
    },
    step: {
      story: "行 pictured a crossroads (╬). 彳 is its left half, a road or a step, so it marks walking and going.",
      means: ["walking", "roads", "going", "behaviour"],
      hook: "彳 is two people (two 撇) walking along a road together, hence its name 'double person'.",
      links: {
        "往": { rel: "strong", note: "To go toward a place: 往前走 (walk forward)." },
        "很": { rel: "form", note: "Originally 'defiant, refusing to go along', which has nothing to do with today's 'very'. 艮 gěn gives the sound." }
      },
      art: `<rect class="road" x="8" y="46" width="144" height="28"/><rect class="road" x="66" y="6" width="28" height="110"/>
        <rect class="fr" x="8" y="6" width="72" height="110" opacity=".5"/>
        <path class="la lk" d="M8 46H66V6M8 74H66V116"/><path class="l lk" d="M94 6V46H152M94 116V74H152"/>
        <path class="l lt ld" d="M14 60H60M100 60H146M80 12V40M80 80V110"/>`,
      early: `<path class="ea" d="M36 10V36H10M36 90V64H10"/><path class="e" d="M64 10V36H90M64 90V64H90"/>`
    },
    food: {
      story: "食 pictured a food vessel heaped with rice, with a lid on top. Simplified Chinese writes it 饣 on the left side.",
      means: ["food", "eating", "meals", "hungry or full"],
      hook: "饣 is a lid (撇), a bowl (横钩) and a spoon going in (竖提).",
      links: {
        "饭": { rel: "strong", note: "A meal, or cooked rice (吃饭). 反 fǎn gives the sound." },
        "饺": { rel: "strong", note: "Dumplings are food (饺子). 交 jiāo gives the sound." }
      },
      art: `<path class="l lt" d="M38 34C32 26 44 20 38 10M122 34C116 26 128 20 122 10"/>
        <path class="fk l" d="M50 34L80 14L110 34Z"/><circle class="fk l" cx="80" cy="11" r="4"/>
        <path class="fn l" d="M48 56Q80 38 112 56Z"/>
        <path class="fm l" d="M42 56H118C116 80 102 92 80 92C58 92 44 80 42 56Z"/>
        <path class="fm l" d="M68 92H92L96 106H64Z"/><path class="l" d="M54 108H106"/>
        <path class="lk lwood" d="M120 46L142 100M127 44L148 96"/>`,
      early: `<path class="e" d="M20 36L50 10L80 36"/><path class="e" d="M24 46Q50 52 76 46Q74 70 50 72Q26 70 24 46Z"/><path class="e" d="M50 72V84M34 90H66"/>`
    },
    fire: {
      story: "火 pictured flames leaping up. At the bottom of a character it flattens into four dots, 灬, like flames under a cooking pot.",
      means: ["fire", "heat", "cooking", "burning"],
      hook: "Four little flames under the character, like a pot on the stove.",
      links: {
        "点": { rel: "partial", note: "The old form 點 came from 黑 (black), which has fire 灬 at the bottom: soot. A 'dot' was a small black mark." },
        "热": { rel: "strong", note: "Heat from fire." }
      },
      art: `<path class="l lt" d="M62 22C56 16 66 10 60 2M98 22C92 16 102 10 96 2"/>
        <path class="l" d="M36 34C24 34 24 46 38 46M124 34C136 34 136 46 122 46"/>
        <path class="fm l" d="M36 30H124L118 62C114 70 46 70 42 62Z"/><path class="l lk" d="M30 30H130"/>
        ${flame(46, 104)}${flame(68, 102, 1.1)}${flame(92, 102, 1.1)}${flame(114, 104)}
        <path class="lk lwood" d="M32 112H128"/>`,
      early: `<path class="e" d="M14 84C26 70 22 50 24 36C34 52 40 60 42 70C46 50 48 30 50 14C52 30 54 50 58 70C60 60 66 52 76 36C78 50 74 70 86 84Z"/>`
    },
    tree: {
      story: "A tree: branches reaching up, a trunk, and roots spreading down into the ground. On the left side of a character its last stroke shrinks into a dot.",
      means: ["tree", "wood", "wooden things", "plants"],
      hook: "木 is a tree: the horizontal stroke is the branches, the vertical is the trunk, and the 撇 and 点 are the roots.",
      links: {
        "校": { rel: "partial", note: "Originally a wooden fence or enclosure, later a training ground, and today a school (学校). 交 jiāo gives the sound." },
        "样": { rel: "form", note: "Originally the name of a tree, but today it means 'kind, appearance' (怎么样). 羊 yáng gives the sound." }
      },
      art: `<rect class="fe2" x="0" y="98" width="160" height="22"/>
        <path class="fp l" d="M80 8C104 8 122 22 122 40C131 46 131 62 116 66C110 74 50 74 44 66C29 62 29 46 38 40C38 22 56 8 80 8Z"/>
        <rect class="fk l" x="74" y="44" width="12" height="54"/>
        <path class="lk lwood" d="M80 62L56 38M80 56L104 34"/>
        <path class="lk lwood" d="M80 98L54 118M80 98L106 118M80 98V118"/><path class="l" d="M0 98H160"/>`,
      early: `<path class="e" d="M50 8V92M50 36L26 16M50 36L74 16M50 70L26 90M50 70L74 90"/>`
    },
    mouth: {
      story: "An open mouth, which over time became a square box. It marks eating, drinking, speaking and sounds, as well as question particles like 吗, 呢 and 吧.",
      means: ["mouth", "eating", "drinking", "speaking", "sounds"],
      hook: "口 is a wide-open mouth: a square you put food into.",
      links: {
        "吃": { rel: "strong", note: "You eat with your mouth. 乞 qǐ hints at the sound." },
        "喝": { rel: "strong", note: "You drink with your mouth. 曷 hé gives the sound." }
      },
      art: `<rect class="la ld" x="22" y="24" width="116" height="92" rx="6"/>
        <path class="fr2 l" d="M24 60C40 38 60 40 80 50C100 40 120 38 136 60C120 92 100 106 80 106C60 106 40 92 24 60Z"/>
        <path class="fd" d="M38 62C56 58 68 62 80 64C92 62 104 58 122 62C110 84 96 92 80 92C64 92 50 84 38 62Z"/>
        <path class="fn" d="M44 63C60 61 70 65 80 65C90 65 100 61 116 63L112 71C100 69 90 71 80 71C70 71 60 69 48 71Z"/>
        <path class="fr3" d="M60 87C66 79 94 79 100 87C94 93 66 93 60 87Z"/>`,
      early: `<path class="e" d="M16 26C20 70 32 80 50 80C68 80 80 70 84 26"/>`
    },
    speech: {
      story: "言 pictured a mouth (口) with a tongue or a reed pipe above it, making sounds. Simplified Chinese writes it 讠 on the left side.",
      means: ["speech", "words", "language", "asking", "telling"],
      hook: "讠: a dot of sound leaves the mouth, then the words fold down and away.",
      links: {
        "词": { rel: "strong", note: "A word or phrase is a piece of speech (生词 new word). 司 sī hints at the sound." },
        "试": { rel: "partial", note: "To test someone, originally by questioning them. 式 shì gives the sound." }
      },
      art: `<path class="fn l" d="M40 12H134Q146 12 146 24V60Q146 72 134 72H80L62 90L66 72H40Q28 72 28 60V24Q28 12 40 12Z"/>
        <circle class="fa" cx="87" cy="22" r="3.5"/><path class="la lk" d="M52 34H122M58 46H116M52 58H122"/>
        <path class="fr2 l" d="M28 104C38 94 52 94 60 100C56 112 34 114 28 104Z"/><path class="l lt" d="M64 96C70 92 72 88 70 82"/>`,
      early: `<path class="e" d="M28 64C30 86 70 86 72 64"/><path class="e" d="M50 66V18M34 40H66M40 26H60M42 14L50 6L58 14"/>`
    },
    sun: {
      story: "The sun: a circle with a dot in the middle. The circle became a square because a brush makes corners more easily than curves.",
      means: ["sun", "day", "time", "brightness"],
      hook: "日 is a window with the sun shining through it.",
      links: {
        "昨": { rel: "strong", note: "Yesterday, a day (日) that has passed. 乍 zhà hints at the sound." },
        "明": { rel: "strong", note: "Sun (日) + moon (月) = bright. And 明天 is the next bright day: tomorrow." }
      },
      art: `<path class="l la" d="${rays(80, 60, 42, 54, 12)}"/>
        <circle class="fm l" cx="80" cy="60" r="34"/><path class="l lk" d="M68 60H92"/>`,
      early: `<circle class="e" cx="50" cy="50" r="34"/><path class="e" d="M44 50H56"/>`
    },
    person: {
      story: "人 pictured a person in profile, slightly bent forward. On the left side of a character it stands up straight as 亻.",
      means: ["person", "people", "what people do"],
      hook: "亻 is a person standing beside the character: one 撇 for the head and arm, one 竖 for the body.",
      links: {
        "他": { rel: "strong", note: "Another person: he." },
        "体": { rel: "strong", note: "A person (亻) + 本 (root, base) = the body (身体)." }
      },
      art: `<ellipse class="shade" cx="82" cy="116" rx="34" ry="4"/>
        <circle class="fs l" cx="84" cy="22" r="11"/>
        <path class="fr l" d="M80 34C70 50 66 70 62 104H98C96 76 92 54 88 34Z"/>
        <path class="l lk" d="M86 44C98 56 104 66 108 78M70 104L64 116M92 104L100 116"/>`,
      early: `<path class="e" d="M52 12C50 40 48 60 30 92"/><path class="e" d="M50 40C60 50 66 58 70 70"/>`
    },
    sickness: {
      story: "疒 pictured a sick person lying on a bed. The bed (爿) was drawn standing upright, and its legs survive as the dot and the rising stroke on the left of 疒.",
      means: ["illness", "pain", "disease"],
      hook: "疒 is a hospital: a roof (广) with a bed sticking out on the left.",
      links: {
        "病": { rel: "strong", note: "Illness (生病). 丙 bǐng gives the sound." },
        "疼": { rel: "strong", note: "Pain, an ache (头疼). 冬 dōng hints at the sound." }
      },
      art: `<rect class="fr2 l" x="16" y="40" width="9" height="62" rx="2"/><rect class="fk l" x="136" y="60" width="9" height="42" rx="2"/>
        <rect class="fn l" x="24" y="72" width="114" height="14" rx="3"/>
        <path class="la lk" d="M20 102V114M140 102V114"/>
        <ellipse class="fn l" cx="40" cy="67" rx="13" ry="6"/><circle class="fs l" cx="44" cy="58" r="9"/>
        <path class="fr l" d="M54 72C62 54 122 54 136 72Z"/>
        ${drop(30, 36, 0.45)}${drop(58, 40, 0.45)}
        <path class="l lk" d="M62 44L76 34"/><circle class="fa" cx="62" cy="44" r="3"/>`,
      early: `<path class="ea" d="M28 10V92M14 30L28 36M14 62L28 56"/><circle class="e" cx="44" cy="24" r="6"/><path class="e" d="M44 32C58 42 64 58 66 84"/><path class="e" d="M78 30l3 7M84 46l3 7"/>`
    },
    metal: {
      story: "金 showed nuggets of metal (the two dots) buried in the earth (土), with 今 on top giving the sound. Simplified Chinese writes it 钅 on the left side.",
      means: ["metal", "gold", "iron", "money", "tools"],
      hook: "钅 is a little gold sign: a roof with bars of gold stacked underneath.",
      links: {
        "铁": { rel: "strong", note: "Iron is a metal (地铁, the subway, is 'earth iron'). 失 shī gives the sound." },
        "钱": { rel: "strong", note: "Money: coins were made of metal." }
      },
      art: `<path class="fe l" d="M12 114C22 72 50 54 80 54C110 54 138 72 148 114Z"/>
        <path class="l lt" d="M28 94Q80 82 132 94M20 106Q80 96 140 106"/>
        <path class="fm l" d="M50 80L60 72L70 78L66 88H54Z"/><path class="fm l" d="M92 82L102 74L112 82L106 92H96Z"/>
        <path class="l la" d="M74 68l4-4M76 72h6M114 70l4-4"/>
        <circle class="fm l" cx="122" cy="28" r="16"/><rect class="fn l" x="116" y="22" width="12" height="12"/>`,
      early: `<path class="e" d="M16 42L50 14L84 42"/><path class="e" d="M32 56H68M50 46V88M24 88H76"/><path class="e" d="M34 70l-5 7M66 70l5 7"/>`
    },
    hill: {
      story: "From 阜 (fù): a hill with steps cut into its side. On the LEFT of a character it is squeezed into 阝 and means hills, slopes and terrain.",
      means: ["hill", "slope", "terrain", "steps"],
      hook: "The left 阝 is a ladder up a hill. L for left, L for ladder.",
      links: {
        "阴": { rel: "strong", note: "The shady side of a hill, where the moon (月) rules. Its opposite is 阳, the sunny side." },
        "院": { rel: "partial", note: "A courtyard enclosed by earthen walls (医院 hospital). 完 wán gives the sound." }
      },
      art: `<circle class="fm l" cx="136" cy="24" r="12"/><path class="l la" d="${rays(136, 24, 16, 22, 8)}"/>
        <path class="fe l" d="M8 112V98H24V84H40V70H56V56H70V42C98 46 128 80 152 112Z"/>
        <path class="shade" d="M8 112V98H24V84H40V70H56V56H70V42C76 70 70 96 74 112Z"/>
        <path class="la lk" d="M8 98H24V84H40V70H56V56H70V42"/>
        <text class="tx tx-lg" x="44" y="106">阴</text><text class="tx tx-lg" x="110" y="104">阳</text>`,
      early: `<path class="e" d="M30 8V94"/><path class="e" d="M30 16C52 16 52 36 30 36M30 42C52 42 52 62 30 62M30 68C52 68 52 88 30 88"/>`
    },
    city: {
      story: "From 邑 (yì): a walled town (口) above a kneeling person, meaning people living in a town. On the RIGHT side of a character it is squeezed into 阝 and means places, towns and districts.",
      means: ["town", "city", "place", "district"],
      hook: "The right 阝 is a town gate on the right side of the road.",
      links: {
        "都": { rel: "partial", note: "Read dū, it means capital, a big town. The word dōu (all) borrows the same character. 者 zhě gives the sound." },
        "那": { rel: "form", note: "Originally the name of a place (an old state), and now just 'that'." }
      },
      art: `<path class="fe l" d="${crenel(26, 134, 30, 8, 9)}V84H26Z"/>
        <path class="fr l" d="M60 16Q80 2 100 16L95 21H65Z"/><rect class="fn l" x="68" y="21" width="24" height="9"/>
        <path class="fd" d="M66 84V60Q80 46 94 60V84Z"/><path class="l" d="M66 84V60Q80 46 94 60V84"/>
        <rect class="fi l" x="38" y="44" width="12" height="12"/><rect class="fi l" x="110" y="44" width="12" height="12"/>
        <circle class="fs l" cx="40" cy="96" r="5"/><path class="fr l" d="M34 112C34 104 37 101 40 101C43 101 46 104 46 112Z"/>
        <circle class="fs l" cx="122" cy="96" r="5"/><path class="fr l" d="M116 112C116 104 119 101 122 101C125 101 128 104 128 112Z"/>${ground(112, 10, 150)}`,
      early: `<rect class="e" x="28" y="10" width="44" height="32"/><path class="e" d="M34 56H66V76H40V56M40 76V94H70"/>`
    },
    tap: {
      story: "From 攴 (pū): a hand holding a stick, ready to tap or strike. As a radical it marks actions, things people DO.",
      means: ["action", "doing", "striking", "teaching"],
      hook: "攵 is a hand swinging a stick: the 撇 and 横 are the stick, the 撇 and 捺 are the arm in motion.",
      links: {
        "教": { rel: "strong", note: "孝 (a child 子 with an elder) + 攵 (a hand with a stick): teaching, old-school style!" }
      },
      art: `<path class="la" d="M30 14Q24 22 28 32M20 8Q12 22 18 38"/>
        <rect class="fk l" x="72" y="2" width="8" height="104" rx="4" transform="rotate(-45 76 54)"/>
        <path class="fr l" d="M124 92L150 112V120H116Z"/>
        <rect class="fs l" x="96" y="70" width="34" height="28" rx="10"/>
        <path class="l lt" d="M106 70V84M114 70V86M122 72V86"/>
        <path class="fs l" d="M98 78C88 76 86 88 98 90"/>`,
      early: `<path class="e" d="M62 8V46M62 26L76 20"/><path class="e" d="M30 52L64 54C58 72 46 82 28 92M42 62C52 76 64 86 82 92"/>`
    },
    eye: {
      story: "An eye, first drawn lying on its side with the pupil in the middle. Later it was turned upright to fit into the narrow columns of writing on bamboo slips.",
      means: ["eye", "seeing", "looking", "sleeping"],
      hook: "Turn 目 on its side and you'll see an eye with its eyelids.",
      links: {
        "眼": { rel: "strong", note: "The eye itself (眼睛). 艮 gěn gives the sound." },
        "睡": { rel: "strong", note: "Eyes (目) drooping (垂 chuí) means falling asleep. 垂 also hints at the sound." }
      },
      rotate: true,
      art: `<path class="fn l" d="M14 60C40 26 120 26 146 60C120 94 40 94 14 60Z"/>
        <circle class="fiw l" cx="80" cy="60" r="22"/><circle class="fd" cx="80" cy="60" r="10"/><circle class="fn" cx="86" cy="54" r="4"/>
        <path class="l" d="M40 37L34 27M60 31L57 19M80 29V16M100 31L103 19M120 37L126 27"/>`,
      early: `<path class="e" d="M10 50C30 24 70 24 90 50C70 76 30 76 10 50Z"/><circle class="e" cx="50" cy="50" r="12"/>`
    },
    stand: {
      story: "A person (大, arms and legs spread wide) standing on the ground (一).",
      means: ["standing", "position", "establishing"],
      hook: "立 is a person with arms out and both feet planted on the ground line.",
      links: {
        "站": { rel: "strong", note: "To stand, and a station (车站) is where you stand and wait. 占 zhàn gives exactly the same sound." }
      },
      art: `<path class="la lk" d="M20 106H140"/>
        <circle class="fs l" cx="80" cy="22" r="11"/>
        <path class="fr l" d="M72 36H88L94 74H66Z"/>
        <path class="l lk" d="M50 52L74 42M86 42L110 52M74 74L62 104M86 74L98 104"/>`,
      early: `<path class="e" d="M50 12V52M22 30H78M50 52L28 80M50 52L72 80"/><path class="ea" d="M14 90H86"/>`
    },
    woman: {
      story: "An ancient picture of a woman kneeling with her arms crossed in front. On the left side of a character its last stroke rises (提).",
      means: ["woman", "female relatives", "family", "surnames"],
      hook: "女 is a figure with crossed arms, sitting down to talk with the family.",
      links: {
        "姐": { rel: "strong", note: "Elder sister (姐姐). 且 qiě gives the sound." },
        "姓": { rel: "strong", note: "Woman (女) + born (生): in very early China, family names passed down through the mother, so your surname told you whom you were born of." }
      },
      art: `<circle class="fd" cx="64" cy="18" r="6"/><circle class="fs l" cx="74" cy="25" r="11"/>
        <path class="fr l" d="M70 37C58 50 56 72 60 92C62 102 70 108 84 108H118C122 108 122 100 116 98L92 92C94 72 90 50 82 37Z"/>
        <path class="l lk" d="M64 58L94 72M92 56L68 74"/>${ground(110, 30, 140)}`,
      early: `<path class="e" d="M54 10C56 36 48 58 32 88"/><path class="e" d="M26 32L74 62M72 28L34 66"/><path class="e" d="M32 88H72"/>`
    },
    moon: {
      story: "Two different pictures merged into one shape: 月 (the moon, a crescent) and ⺼ (flesh, from 肉 meat). On the left side of a character it is usually FLESH and means a body part.",
      means: ["moon", "month", "time", "body parts (flesh)"],
      hook: "Left side? Think body (脑 腿 脸). About time? Think moon (期 星期).",
      links: {
        "期": { rel: "strong", note: "A period of time measured by the moon's cycle (星期 week). 其 qí gives the sound." },
        "脑": { rel: "strong", note: "Here it's ⺼ flesh: the brain is a body part (电脑, an 'electric brain', is a computer)." }
      },
      art: `<path class="fm l" d="M50 12C26 20 18 56 32 76C42 90 62 96 78 90C56 84 42 64 44 44C45 30 48 22 50 12Z"/>
        ${star(66, 26, 5)}${star(74, 50, 4)}
        <path class="l lt ld" d="M90 10L84 112"/>
        <path class="fr3 l" d="M98 40Q100 30 112 30H140Q150 30 150 42L148 96Q148 108 136 108H106Q94 108 96 96Z"/>
        <path class="lpaper" d="M102 58Q122 52 144 60M102 78Q122 72 144 80"/>`,
      early: `<path class="e" d="M62 10C32 18 24 70 56 90C42 70 42 32 62 10Z"/><path class="e" d="M46 50H56"/>`
    },

    /* ---- components that appear as exam options ---- */
    knife: {
      story: "刀 pictured a knife. Standing upright on the right side of a character it became 刂.",
      means: ["knife", "cutting", "separating"],
      hook: "刂 is two cuts: a short one, and a long one with a hook.",
      links: { "别": { rel: "strong", note: "To cut apart, to separate, which later became 'other' and 'don't'." } },
      art: `<path class="fn l" d="M28 92L102 22C110 14 124 22 118 32L50 106Z"/>
        <path class="fk l" d="M110 26L136 4C142 0 150 8 146 12L120 36Z"/><circle class="fm" cx="132" cy="14" r="2"/>
        <path class="la ld" d="M14 114H146"/><rect class="fp l" x="60" y="104" width="14" height="10" rx="3"/><rect class="fp l" x="82" y="104" width="14" height="10" rx="3"/>`,
      early: `<path class="e" d="M30 12H70C70 50 60 76 42 90"/><path class="e" d="M50 12C50 46 40 70 18 88"/>`
    },
    clothes: {
      story: "衣 pictured a robe: the collar on top with the lapels crossing over. On the left side of a character it is 衤. Note the two dots at the end.",
      means: ["clothes", "cloth"],
      hook: "衤 is 礻 with one extra dot, and that dot is a button on your coat!",
      links: { "裤": { rel: "strong", note: "Trousers are clothing (裤子). 库 kù gives exactly the same sound." } },
      art: `<path class="fr l" d="M58 20L80 30L102 20L134 34L150 64L134 72L120 56V112H40V56L26 72L10 64L26 34Z"/>
        <path class="l lk" d="M58 20L96 70M102 20L80 48"/><rect class="fm l" x="40" y="64" width="80" height="8"/><path class="l lt" d="M40 104H120"/>`,
      early: `<path class="e" d="M50 8V22M18 30H82M50 22L30 60M50 22L70 60M18 30L10 50M82 30L90 50M30 60C28 74 26 82 20 90M70 60C72 74 74 82 80 90"/>`
    },
    jade: {
      story: "玉 pictured three pieces of jade strung on a cord. That looked just like 王 (king), so later a dot was added to 玉. On the left side of a character the dot drops off again, and jade appears as 王.",
      means: ["jade", "precious stones", "beauty"],
      hook: "Three jade pieces on a string: three horizontals threaded on one cord.",
      links: { "球": { rel: "partial", note: "Originally a beautiful round jade, which became a ball. 求 qiú gives exactly the same sound." } },
      art: `<path class="la" d="M60 4V96M60 96L52 116M60 96L68 116"/>
        <rect class="fp2 l" x="36" y="18" width="48" height="12" rx="6"/><rect class="fp2 l" x="36" y="46" width="48" height="12" rx="6"/><rect class="fp2 l" x="36" y="74" width="48" height="12" rx="6"/>
        <circle class="fp2 l" cx="120" cy="60" r="25"/><circle class="fn l" cx="120" cy="60" r="8"/>`,
      early: `<path class="e" d="M50 8V92M24 22H76M24 50H76M24 78H76"/>`
    },
    is: {
      story: "是 combines 日 (sun) and 正 (straight, correct): the sun directly overhead at noon. It came to mean 'correct, right', and later 'to be'.",
      means: ["correct", "to be", "this"],
      hook: "The sun right above your head: exactly right, that's it, 是!",
      links: { "题": { rel: "sound", note: "In 题, 是 is the SOUND part (shì → tí). The meaning comes from 页 (head): 题 first meant 'forehead', then 'title' and 'question'." } },
      art: `<path class="l la" d="${rays(80, 22, 18, 24, 10)}"/><circle class="fm l" cx="80" cy="22" r="14"/>
        <path class="la ld" d="M80 44V88"/><rect class="road" x="8" y="94" width="144" height="14"/>${foot(80, 100, 0)}`,
      early: `<rect class="e" x="30" y="8" width="40" height="28"/><path class="e" d="M30 22H70M14 50H86M50 50V90M50 70H68M30 62V90M12 90H88"/>`
    },
    square: {
      story: "The origin of 方 is debated. In the characters you meet, it mostly works as a SOUND part (fāng, páng, fáng).",
      means: ["square", "direction", "side"],
      hook: "方 sounds like fāng, and 旁 páng, 房 fáng, 放 fàng and 访 fǎng all rhyme with it.",
      links: { "旁": { rel: "sound", note: "方 fāng gives the sound: páng." } },
      art: `<path class="fn l" d="M28 46H46L68 28V92L46 74H28Z"/><path class="la lk" d="M80 46Q90 60 80 74M92 36Q108 60 92 84M104 26Q126 60 104 94"/>`,
      early: `<path class="e" d="M50 8V18M16 26H84M44 26C44 58 36 78 18 92M44 50H72C72 72 68 84 58 90"/>`
    },
    evening: {
      story: "A crescent moon at dusk. It's the same picture as 月 with a stroke missing, and 夕 means evening.",
      means: ["evening", "dusk", "night"],
      hook: "夕 is the moon (月) with a piece missing: the moon only just rising at dusk.",
      links: { "名": { rel: "strong", note: "Evening (夕) + mouth (口): in the dark you can't see faces, so you call out your NAME." } },
      art: `<path class="fm l" d="M96 12C72 20 64 54 76 72C84 84 100 88 114 84C96 78 84 62 86 44C87 32 92 22 96 12Z"/>
        ${star(40, 26, 5)}${star(130, 30, 4)}${star(56, 50, 3)}
        <path class="fp l" d="M0 98C30 82 50 86 70 94C96 78 126 80 160 94V120H0Z"/>`,
      early: `<path class="e" d="M62 12C30 20 24 72 56 90C42 70 42 32 62 12Z"/>`
    },
    west: {
      story: "西 pictured a bird's nest. Birds return to their nests when the sun sets in the west, so the nest came to mean 'west'. On top of a character it is flattened into 覀.",
      means: ["west", "a lid on top"],
      hook: "覀 is a lid on top: 票 (ticket) and 要 (want) both wear it.",
      links: { "票": { rel: "form", note: "Just a shape here: in 票, 覀 doesn't mean 'west'. Remember it with 门票 (ticket)." } },
      art: `<path class="ff l" d="M104 100A26 26 0 0 1 156 100Z"/>${ground(100)}
        <path class="lk lwood" d="M8 70L96 64"/>
        <path class="fk l" d="M26 66C28 86 74 86 76 66Z"/><path class="l lt" d="M32 74Q50 80 70 74"/>
        <ellipse class="fn l" cx="50" cy="56" rx="13" ry="8"/><circle class="fn l" cx="63" cy="48" r="6"/><path class="fa" d="M68 47L76 49L68 51Z"/><path class="l" d="M38 54L28 48"/>`,
      early: `<path class="e" d="M18 40C22 78 78 78 82 40"/><path class="e" d="M26 54Q50 62 74 54M32 66Q50 72 68 66"/><path class="e" d="M36 32Q50 16 64 32"/>`
    },
    ten: {
      story: "Ancient Chinese counted with knotted cords: 十 was a single cord with a knot in the middle, meaning ten. The knot later stretched into a horizontal line.",
      means: ["ten", "complete"],
      hook: "十 is one cord with one knot, and that makes ten.",
      links: { "什": { rel: "partial", note: "Originally a group of ten people (亻 + 十), like a squad. Today it's used in 什么 (what)." } },
      art: `<path class="lk lwood" d="M40 10V108M120 10V108"/><ellipse class="fk l" cx="40" cy="44" rx="7" ry="6"/><ellipse class="fk l" cx="120" cy="76" rx="7" ry="6"/>
        <path class="la lk" d="M80 6V114"/><ellipse class="fr2 l" cx="80" cy="60" rx="13" ry="10"/><path class="l lt" d="M70 56Q80 64 90 56"/>`,
      early: `<path class="e" d="M50 8V92"/><ellipse class="ef" cx="50" cy="50" rx="8" ry="7"/>`
    }
  };

  // Labels for relation strength
  const REL = {
    strong: { label: "Meaning link", desc: "The radical's meaning clearly shows up in the character." },
    partial: { label: "Loose link", desc: "Related through history or a stretch of meaning." },
    sound: { label: "Sound part", desc: "Here this component gives the SOUND, not the meaning." },
    form: { label: "Just a shape", desc: "No real link today: learn the word as a whole." }
  };

  window.HSK_ORIGINS = O;
  window.HSK_REL = REL;
})();
