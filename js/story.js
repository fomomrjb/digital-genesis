/* ===========================================================
   DIGITAL GENESIS — story.js
   CHAPTER 1: from the Shibuya subway to the Culling Game.
   Progression is manga-paced: each mission guarantees the
   level (and therefore the techniques) Kenji has in that arc.
   =========================================================== */
'use strict';

/* ---------- tiny cutscene runner ---------- */
function cutscene(steps, done) {
  let i = -1;
  const next = () => {
    i++;
    if (i >= steps.length) { if (done) done(); return; }
    const s = steps[i];
    if (Array.isArray(s)) { Dlg.start(s, next); return; }
    if (typeof s === 'function') { const r = s(next); if (r !== 'wait') next(); return; }
    if (s.dlg) { Dlg.start(s.dlg, next); return; }
    if (s.wait != null) { timers.after(s.wait, next); return; }
    if (s.fn) { s.fn(); next(); return; }
    next();
  };
  next();
  return next;
}

/* ---------- NPC line helpers ---------- */
const NPC_IDLE = {
  yuji: () => [['yuji', pick([
    'Kenji! Megumi said you turned a curse into "a puff of pixels". What does that even mean?',
    'You wanna split a convenience store run later? I\'m buying.',
    'Nanami says I ask too many questions. I have more questions about that.'])]],
  megumi: () => [['megumi', pick([
    'Don\'t wander off during a mission. ...You already wandered off, didn\'t you.',
    'Your technique makes no sense. Keep it away from my shikigami.',
    'Gojo put a 12-year-old on the active roster. I have stopped being surprised.'])]],
  nobara: () => [['nobara', pick([
    'Tokyo is still the best city in the world and I will fight you about it.',
    'Your hoodie is fine. FINE. We\'re going shopping anyway.',
    'If you call me "ma\'am" one more time I\'m using the hammer.'])]],
  nanami: () => [['nanami', pick([
    'It is 7:03 PM. I am technically off the clock. ...What do you need.',
    'A child should not have a domain. A child should not have two. Please be careful.',
    'Eat something that is not candy. That is my professional advice.'])]],
  gojo: () => [['gojo', pick([
    'Kiddo! Did you know the Wi-Fi password is literally "satoru"? I set it.',
    'If anyone from the higher-ups asks: you were with me the whole time.',
    'You\'re the only student who makes me feel old. Stop that.'])]]
};

/* ===========================================================
   MISSIONS
   =========================================================== */
const MISSIONS = [
/* ---------------- 0 : PROLOGUE ---------------- */
{
  id: 'prologue', title: 'The Glitch in the System', area: 'subway_prologue', minLv: 1,
  objective: 'Survive the station.', xp: 60, money: 120,
  setup() {
    AREAS.subway_prologue.ents = [
      { type: 'sign', x: 300, y: 330, text: 'A dropped handheld console. Battery: 46%. ...It is yours.' },
      { type: 'npc', x: 520, y: 350, spr: 'curseBlob', name: 'survivor?', u: 2, col: '#c79aff',
        lines: [{ who: 'narr', t: 'A man is curled against the pillar, whispering numbers. He does not see you.' }] },
      { type: 'trigger', x: 900, y: 260, w: 60, h: 200, once: true, flag: 'pro_fight', fn: () => Story.m0_fight() }
    ];
  },
  run() {
    Over.enter('subway_prologue', 90, 330);
    Over.locked = true;
    cutscene([
      { fn: () => { FX.flash('#fff', .6, 1); Audio.sfx('alarm'); } },
      [{ who: 'sys', t: 'CHAPTER 1\nDIGITAL GENESIS', big: true },
       { who: 'narr', t: 'SHIBUYA STATION, PLATFORM B3.\nTWO YEARS AGO. KENJI SATO IS TEN YEARS OLD.' },
       { who: 'narr', t: 'The lights are failing. Everyone who could run has run. Something is eating the far end of the platform.' },
       ['kenji', 'Huh. The pillars are only loaded at half resolution down there.'],
       ['kenji', 'That is really sloppy. Whoever coded this should be embarrassed.'],
       { who: 'narr', t: 'He is not describing the station. He is describing the curse.' },
       { who: 'sys', t: 'MOVE RIGHT →  (Arrows / WASD)\nPress Z to look at things.' }],
      { fn: () => { Over.locked = false; } }
    ]);
  }
},
/* ---------------- 1 : GOJO ---------------- */
{
  id: 'recruit', title: 'Unscheduled Maintenance', area: 'rooftop', minLv: 3,
  objective: 'Satoru Gojo wants to see what you can do.', xp: 260, money: 400,
  setup() {
    AREAS.rooftop.ents = [
      { type: 'npc', x: 430, y: 330, spr: 'gojo', name: 'GOJO', u: 3, quest: true, col: '#e8ecf7',
        lines: () => Story.m1_talk() }
    ];
  },
  run() {
    Over.enter('rooftop', 90, 360);
    Over.locked = true;
    cutscene([
      [{ who: 'narr', t: 'TOKYO. A rooftop, two years later. The rain has not stopped since Tuesday.' },
       ['gojo', 'So you\'re the little tech support guy everyone\'s gossiping about.'],
       ['gojo', 'They say you see the world a bit differently. Want to show me what you\'ve got, kiddo?'],
       ['kenji', 'Your space is weird.'],
       ['kenji', 'It looks like a recurring mathematical equation running on an infinite loop. It\'s hogging all the processing power.'],
       ['kenji', 'I\'m going to optimize it.'],
       ['gojo', '...Say that again?'],
       { who: 'sys', t: 'Walk over and talk to Gojo when you are ready.\nHis Infinity blocks physical attacks — you will need NULL.' }],
      { fn: () => { Over.locked = false; } }
    ]);
  }
},
/* ---------------- 2 : JUJUTSU HIGH ---------------- */
{
  id: 'orientation', title: 'Orientation (Fast Wi-Fi)', area: 'jjhigh', minLv: 4,
  objective: 'Settle in at Jujutsu High. Talk to everyone.', xp: 150, money: 300,
  setup() { Story.buildHub(); },
  run() {
    Over.enter('jjhigh', 200, 340);
    Over.locked = true;
    cutscene([
      [{ who: 'narr', t: 'TOKYO JUJUTSU HIGH. The Wi-Fi is, in fact, fast.' },
       ['gojo', 'Kiddo, meet your year. Try not to delete any of them.'],
       ['yuji', 'Whoa, you\'re tiny! I\'m Yuji! Are you really special grade?'],
       ['megumi', 'He is twelve.'],
       ['nobara', 'He\'s TWELVE and special grade? I\'m going to scream.'],
       ['kenji', 'Can I go home.'],
       ['gojo', 'Nope! Oh — and something followed you in.'],
       { who: 'narr', t: 'Something round rolls out of Kenji\'s hood and lands on the stone path with a soft, orange thump.' }],
      { fn: () => { Audio.sfx('orangetalk'); FX.flash(PAL.orange, .4, .6); FX.burst(260, 330, 30, { kind: 'spark', col: PAL.orange, size: 4, life: 1, g: 60 }); } },
      [['orange', 'HI.'],
       ['kenji', '...'],
       ['orange', 'HI!! HELLO!! I AM ORANGE. I LIVE IN YOUR SOUL DIRECTORY. ITS NICE IN THERE.'],
       ['yuji', 'Uh... why is there a pumpkin.'],
       ['megumi', 'It is wiggling.'],
       ['orange', 'they cant hear me. only you can hear me. this is going to be SO funny.'],
       { who: 'sys', t: 'ORANGE SUITE MOUNTED.\nCREATIVE MODE / ADMIN MUTE / HEAL / SURVIVAL / SPECTATOR / TELEPORT / DISGUISE' },
       ['orange', 'all seven. hands free. i already turned them on. you\'re welcome.'],
       ['kenji', 'This is the best thing that has ever happened to me.'],
       { who: 'sys', t: 'TIP: press [/] any time for the command console. [C] menu. [B] emotes.\nSave at the glowing point. Buy skins at Orange\'s shop. Take missions at the board.' }],
      { fn: () => { Over.locked = false; G.codex.kenji = true; G.codex.orange = true; G.codex.orangesuite = true; G.codex.digitalgenesis = true; } }
    ]);
  }
},
/* ---------------- 3 : FIRST ASSIGNMENT ---------------- */
{
  id: 'first', title: 'First Assignment: Grade 4', area: 'detention', minLv: 5,
  objective: 'Clear the curses out of the detention block.', xp: 220, money: 350,
  setup() {
    AREAS.detention.ents = [
      { type: 'sign', x: 300, y: 320, text: 'EXORCISM NOTICE: multiple grade 4 sightings. One grade 2 confirmed. Do not enter alone. (Someone crossed out "alone" and wrote "with a 12 year old".)' },
      { type: 'chest', x: 560, y: 300, id: 'det1', money: 240, item: 'snack' },
      { type: 'trigger', x: 1080, y: 220, w: 70, h: 240, once: true, flag: 'det_boss', fn: () => Story.m3_boss() }
    ];
  },
  run() {
    Over.enter('detention', 70, 340);
    Over.locked = true;
    cutscene([
      [{ who: 'narr', t: 'ABANDONED JUVENILE DETENTION CENTRE. Cursed energy is pooling in the cell block.' },
       ['nanami', 'Grade 4s. Possibly a grade 2. I will take the east wing. You will not die in the west wing.'],
       ['kenji', 'Cool. Can I get paid in dollars instead of "experience"?'],
       ['nanami', 'Both, apparently. Jujutsu High pays per exorcism now. Do not ask me why.'],
       ['orange', 'DOLLARS. KENJI. SKINS COST DOLLARS.'],
       { who: 'sys', t: 'Curses roam this area — walk around to find fights.\nWin them for EXP and dollars. Head east for the grade 2.' }],
      { fn: () => { Over.locked = false; } }
    ]);
  }
},
/* ---------------- 4 : DEATH PAINTING ---------------- */
{
  id: 'womb', title: 'Cursed Womb: Death Painting', area: 'detention', minLv: 7,
  objective: 'Something in the block swallowed a finger.', xp: 320, money: 500,
  setup() {
    AREAS.detention.ents = [
      { type: 'npc', x: 260, y: 330, spr: 'yuji', name: 'YUJI', u: 3, col: '#ff8fa3', lines: NPC_IDLE.yuji },
      { type: 'npc', x: 340, y: 350, spr: 'megumi', name: 'MEGUMI', u: 3, col: '#9ab8ff', lines: NPC_IDLE.megumi },
      { type: 'trigger', x: 1000, y: 220, w: 80, h: 240, once: true, flag: 'womb_boss', fn: () => Story.m4_boss() }
    ];
  },
  run() {
    Over.enter('detention', 70, 340);
    Over.locked = true;
    cutscene([
      [['megumi', 'A special grade womb. One of Sukuna\'s fingers is inside it.'],
       ['yuji', 'I can take it! Probably! ...Mostly probably!'],
       ['kenji', 'Hold on.'],
       { who: 'narr', t: 'Kenji stares at a point in the air about where the thing\'s chest would be, and reads.' },
       ['kenji', 'Its soul data is nested really badly. Like, forty folders deep and they all have the same name.'],
       ['kenji', 'If I set the top folder to zero the whole tree unmounts.'],
       ['megumi', '...Just hit it until it stops. Please.'],
       { who: 'sys', t: 'Head east. The finger bearer is waiting at the end of the block.' }],
      { fn: () => { Over.locked = false; G.codex.binding = true; } }
    ]);
  }
},
/* ---------------- 5 : MAHITO, FIRST CONTACT ---------------- */
{
  id: 'bridge', title: 'Yasohachi Bridge', area: 'bridge', minLv: 8,
  objective: 'Something is remodelling people under the bridge.', xp: 420, money: 650,
  setup() {
    AREAS.bridge.ents = [
      { type: 'sign', x: 240, y: 330, text: 'MISSING PERSON notices. Eleven of them. All from this district. All this month.' },
      { type: 'chest', x: 700, y: 340, id: 'br1', money: 320, emote: 'takeL' },
      { type: 'trigger', x: 1060, y: 280, w: 70, h: 180, once: true, flag: 'bridge_boss', fn: () => Story.m5_boss() }
    ];
  },
  run() {
    Over.enter('bridge', 70, 350);
    Over.locked = true;
    cutscene([
      [{ who: 'narr', t: 'YASOHACHI BRIDGE. 2 AM. The river is very loud and nothing else is.' },
       ['orange', 'kenji there are eleven dead people under this bridge and they are all the WRONG SHAPE.'],
       ['kenji', 'I know. Their biological data has been edited by hand. Badly. Whoever did it is self-taught.'],
       ['orange', 'thats you. you\'re self-taught.'],
       ['kenji', 'Yes but I\'m good at it.'],
       { who: 'sys', t: 'Cross the bridge east.' }],
      { fn: () => { Over.locked = false; } }
    ]);
  }
},
/* ---------------- 6 : KYOTO GOODWILL ---------------- */
{
  id: 'goodwill', title: 'Kyoto Goodwill Event', area: 'arena_kyoto', minLv: 10,
  objective: 'A friendly inter-school exhibition. (It is not friendly.)', xp: 480, money: 700,
  setup() {
    AREAS.arena_kyoto.ents = [
      { type: 'npc', x: 200, y: 300, spr: 'nobara', name: 'NOBARA', u: 3, col: '#ffc08a', lines: NPC_IDLE.nobara },
      { type: 'npc', x: 440, y: 300, spr: 'gakuganji', name: 'PRINCIPAL', u: 3, col: '#cfd6e2',
        lines: [['narr', 'The Kyoto principal looks at Kenji for a long moment.'],
                { who: 'narr', t: '"A twelve-year-old special grade. Tokyo gets stranger every year."' }] },
      { type: 'trigger', x: 300, y: 200, w: 60, h: 60, once: true, flag: 'todo_fight', fn: () => Story.m6_boss() }
    ];
  },
  run() {
    Over.enter('arena_kyoto', 320, 400);
    Over.locked = true;
    cutscene([
      [{ who: 'narr', t: 'KYOTO GOODWILL EVENT. Team battle. The Kyoto school has been told to "test" the new special grade.' },
       ['todo', 'HEY. LITTLE ONE.'],
       ['kenji', 'Oh no.'],
       ['todo', 'WHAT KIND OF WOMAN IS YOUR TYPE?'],
       ['kenji', 'I\'m twelve.'],
       ['todo', 'THAT IS NOT AN ANSWER.'],
       ['orange', 'say "tall". SAY TALL. i want to see what happens.'],
       { who: 'sys', t: 'Step into the centre circle to begin the exhibition match.\nTIP: you can SPARE Todo once he respects you.' }],
      { fn: () => { Over.locked = false; } }
    ]);
  }
},
/* ---------------- 7 : HANAMI ---------------- */
{
  id: 'hanami', title: 'The West Woods', area: 'forest', minLv: 11,
  objective: 'A special grade is growing through the school barrier.', xp: 600, money: 900,
  setup() {
    AREAS.forest.ents = [
      { type: 'chest', x: 420, y: 330, id: 'fo1', money: 400, item: 'battery' },
      { type: 'sign', x: 200, y: 340, text: 'The barrier posts have been cracked open from the inside. Roots are growing through the veil.' },
      { type: 'trigger', x: 1100, y: 200, w: 70, h: 260, once: true, flag: 'hanami_boss', fn: () => Story.m7_boss() }
    ];
  },
  run() {
    Over.enter('forest', 70, 360);
    Over.locked = true;
    cutscene([
      [{ who: 'narr', t: 'JUJUTSU HIGH, WEST WOODS. The veil is broken and the forest has opinions.' },
       ['gojo', 'Special grade. Plant type. It thinks humans are a rendering error.'],
       ['kenji', 'I mean. A little bit?'],
       ['gojo', 'Kiddo.'],
       ['kenji', 'Okay, okay. Deleting it.'],
       { who: 'sys', t: 'Head east through the woods. Curses roam here.' }],
      { fn: () => { Over.locked = false; } }
    ]);
  }
},
/* ---------------- 8 : SHIBUYA I ---------------- */
{
  id: 'shibuya1', title: 'Shibuya Incident: The Veil', area: 'shibuya', minLv: 14,
  objective: 'October 31st. A curtain has dropped over Shibuya.', xp: 700, money: 1100,
  setup() {
    AREAS.shibuya.ents = [
      { type: 'sign', x: 240, y: 330, text: 'TRANSIT NOTICE: all lines suspended. Thousands of civilians are inside the curtain. The curtain only lets non-sorcerers in.' },
      { type: 'chest', x: 820, y: 330, id: 'sh1', money: 600, item: 'icecream' },
      { type: 'npc', x: 420, y: 350, spr: 'nanami', name: 'NANAMI', u: 3, col: '#e3c98a', lines: NPC_IDLE.nanami },
      { type: 'trigger', x: 1500, y: 250, w: 70, h: 230, once: true, flag: 'jogo_boss', fn: () => Story.m8_boss() }
    ];
  },
  run() {
    Over.enter('shibuya', 70, 350);
    Over.locked = true;
    cutscene([
      [{ who: 'narr', t: 'OCTOBER 31ST. 19:00. SHIBUYA.' },
       { who: 'narr', t: 'A curtain has sealed the station. Inside it: four special grade curses, a few thousand civilians, and one sealed Satoru Gojo.' },
       ['nanami', 'Gojo is sealed. Say that back to me so I know you heard it.'],
       ['kenji', 'Gojo is sealed.'],
       ['nanami', 'Correct. Which means tonight is extremely bad. Stay behind me.'],
       ['orange', 'kenji. kenji there are so many of them. this is the best night of my life.'],
       ['kenji', 'Orange.'],
       ['orange', 'sorry. im normal. im being normal.'],
       { who: 'sys', t: 'Fight your way east through the station.' }],
      { fn: () => { Over.locked = false; G.codex.cullinggame = true; } }
    ]);
  }
},
/* ---------------- 9 : SHIBUYA II ---------------- */
{
  id: 'shibuya2', title: 'Shibuya Incident: Death Swarm', area: 'shibuya', minLv: 17,
  objective: 'A newborn special grade has flooded the platform.', xp: 800, money: 1300,
  setup() {
    AREAS.shibuya.ents = [
      { type: 'sign', x: 300, y: 330, text: 'The floor is under four inches of water. There was no water here an hour ago.' },
      { type: 'chest', x: 1000, y: 340, id: 'sh2', money: 700, emote: 'gojopeace' },
      { type: 'trigger', x: 1560, y: 250, w: 70, h: 230, once: true, flag: 'dagon_boss', fn: () => Story.m9_boss() }
    ];
  },
  run() {
    Over.enter('shibuya', 70, 350);
    Over.locked = true;
    cutscene([
      [{ who: 'narr', t: 'The lower platform has become a shoreline. Something newborn is standing in the shallows.' },
       ['kenji', 'It just finished compiling. Look — its soul still has placeholder assets in it.'],
       ['orange', 'it has a DOMAIN though. i can see the barrier flags. be careful. BE CAREFUL.'],
       ['kenji', 'If it expands, I\'ll expand back.'],
       ['orange', '...you can do that now?'],
       ['kenji', 'I\'ve been practising in my room.'],
       { who: 'sys', t: 'WARNING: this enemy can expand a domain. A sure-hit cannot be dodged normally —\nyou will need your own barrier, or ORANGE SURVIVAL will clip you out of it.' }],
      { fn: () => { Over.locked = false; G.codex.domain = true; } }
    ]);
  }
},
/* ---------------- 10 : MAHITO ---------------- */
{
  id: 'shibuya3', title: 'Uninstall Completed', area: 'shibuya', minLv: 20,
  objective: 'Mahito is in the terminal. Finish it.', xp: 1200, money: 2000,
  setup() {
    AREAS.shibuya.ents = [
      { type: 'save', x: 200, y: 330 },
      { type: 'trigger', x: 1600, y: 250, w: 80, h: 230, once: true, flag: 'mahito_boss', fn: () => Story.m10_boss() }
    ];
  },
  run() {
    Over.enter('shibuya', 70, 350);
    Over.locked = true;
    cutscene([
      [{ who: 'narr', t: 'A claustrophobic underground terminal. A stationary train. Mahito is waiting on the platform, grinning with his sewn-up face.' },
       { who: 'narr', t: 'Kenji steps off the train. He is not looking at Mahito\'s face. He is looking at a floating, imaginary UI space around Mahito\'s chest.' },
       ['kenji', 'Your soul data looks like a nested folder full of viruses.'],
       ['kenji', 'Let\'s clean this up.'],
       ['orange', 'OH he is going to HATE that'],
       { who: 'sys', t: 'Save at the glowing point first if you want. Then go east.' }],
      { fn: () => { Over.locked = false; G.codex.mahito = true; } }
    ]);
  }
},
/* ---------------- 11 : SUKUNA ---------------- */
{
  id: 'shinjuku', title: 'The King of Curses', area: 'shinjuku', minLv: 25,
  objective: 'Shinjuku. He is already bored of you.', xp: 2600, money: 4000,
  setup() {
    AREAS.shinjuku.ents = [
      { type: 'save', x: 160, y: 370 },
      { type: 'sign', x: 300, y: 370, text: 'Three city blocks are simply missing. Not destroyed — missing. Cut out and dropped somewhere else.' },
      { type: 'trigger', x: 1120, y: 240, w: 90, h: 240, once: true, flag: 'sukuna_boss', fn: () => Story.m11_boss() }
    ];
  },
  run() {
    Over.enter('shinjuku', 70, 370);
    Over.locked = true;
    cutscene([
      [{ who: 'narr', t: 'SHINJUKU. The ruined wasteland of it, anyway.' },
       { who: 'narr', t: 'A thousand-year-old thing in a borrowed body is standing in the middle of the crater, looking down at a twelve-year-old boy.' },
       ['sukuna', 'They sent a child.'],
       ['kenji', 'They didn\'t send me. I was bored.'],
       ['sukuna', '...'],
       ['sukuna', 'Say that again, brat.'],
       ['orange', 'kenji that is THE guy. that is the final boss guy. that is the one from the ART.'],
       ['kenji', 'I know. Look at his cursed energy though — it\'s all one big uncompressed file. He\'s never optimised anything in his life.'],
       ['orange', 'youre going to make him SO angry'],
       ['kenji', 'Good. Angry people make mistakes. Save your game, by the way.'],
       { who: 'sys', t: 'This is the final fight of Chapter 1.\nSave at the glowing point, then walk east.' }],
      { fn: () => { Over.locked = false; G.codex.sukuna = true; G.codex.blackflash = true; } }
    ]);
  }
},
/* ---------------- 12 : EPILOGUE ---------------- */
{
  id: 'culling', title: 'To Be Continued', area: 'culling', minLv: 30,
  objective: '???', xp: 0, money: 0,
  setup() { AREAS.culling.ents = []; },
  run() { Story.epilogue(); }
}
];

/* ===========================================================
   STORY CONTROLLER
   =========================================================== */
const Story = {
  objective() {
    const m = MISSIONS[G.mission];
    return m ? m.objective : '';
  },
  cur() { return MISSIONS[G.mission]; },

  begin() { G.mission = 0; this.jumpTo(0); },

  jumpTo(n) {
    G.mission = clamp(n, 0, MISSIONS.length - 1);
    const m = MISSIONS[G.mission];
    FX.clear(); Battle.active = false; DomainFight.active = false; OrangeFight.active = false;
    Shop.open = false; Menu.open = false;
    this.ensureLevel(m.minLv, true);
    Game.mode = 'over';
    m.setup();
    m.run();
  },

  /* guarantees the techniques the arc expects (manga-paced power curve) */
  ensureLevel(lv, silent) {
    if (!lv || G.lv >= lv) { this.syncUnlocks(); return; }
    const ups = [];
    while (G.lv < lv) {
      const before = G.lv;
      G.gainXP(Math.max(1, xpFor(G.lv + 1) - G.xp));
      if (G.lv === before) break;
      ups.push(G.lv);
    }
    this.syncUnlocks();
    if (!silent && ups.length) LevelUp.trigger(ups);
    else ups.forEach(l => unlocksAt(l).forEach(a => G.unlock(a.id)));
  },
  syncUnlocks() {
    ABILITIES.forEach(a => { if (a.lv <= G.lv) G.unlocked[a.id] = true; });
  },

  complete(extra) {
    const m = MISSIONS[G.mission];
    if (!m) return;
    G.completed[m.id] = true;
    const xp = (m.xp || 0) + (extra && extra.xp || 0);
    const money = (m.money || 0) + (extra && extra.money || 0);
    G.gainMoney(money);
    const ups = G.gainXP(xp);
    this.syncUnlocks();
    Toast.show('MISSION COMPLETE  +' + xp + ' EXP  +$' + fmt(money), PAL.green, 4);
    G.save();
    if (ups.length) LevelUp.trigger(ups);
    const nextN = G.mission + 1;
    timers.after(.6, () => {
      const go = () => {
        if (LevelUp.busy()) { timers.after(.4, go); return; }
        if (nextN < MISSIONS.length) {
          Fade.out(() => { Story.jumpTo(nextN); Fade.in(); }, 2);
        }
      };
      go();
    });
  },

  /* return to the hub between missions */
  toHub() {
    this.buildHub();
    Fade.out(() => { Over.enter('jjhigh', 200, 340); Fade.in(); }, 2.4);
  },

  /* ---------- the Jujutsu High hub ---------- */
  buildHub() {
    AREAS.jjhigh.ents = [
      { type: 'save', x: 330, y: 330 },
      { type: 'shop', x: 560, y: 340, who: 'orange' },
      { type: 'board', x: 700, y: 340 },
      { type: 'terminal', x: 800, y: 340 },
      { type: 'npc', x: 150, y: 350, spr: 'gojo', name: 'GOJO', u: 3, col: '#e8ecf7', lines: NPC_IDLE.gojo },
      { type: 'npc', x: 420, y: 370, spr: 'yuji', name: 'YUJI', u: 3, col: '#ff8fa3', lines: NPC_IDLE.yuji },
      { type: 'npc', x: 480, y: 310, spr: 'megumi', name: 'MEGUMI', u: 3, col: '#9ab8ff', lines: NPC_IDLE.megumi },
      { type: 'npc', x: 900, y: 360, spr: 'nobara', name: 'NOBARA', u: 3, col: '#ffc08a', lines: NPC_IDLE.nobara },
      { type: 'npc', x: 1000, y: 330, spr: 'nanami', name: 'NANAMI', u: 3, col: '#e3c98a', lines: NPC_IDLE.nanami },
      { type: 'sign', x: 240, y: 340, col: PAL.orange,
        text: 'NOTICE BOARD: "Do not let the twelve-year-old near the barrier generators." — signed, everyone.' },
      { type: 'door', x: 620, y: 240, w: 44, h: 20, to: 'dorm', tx: 320, ty: 380 },
      { type: 'warp', x: 1180, y: 340, q: 'Go to Orange\'s Training Void?', to: 'arena_orange', tx: 320, ty: 390 },
      { type: 'npc', x: 1100, y: 350, spr: 'orange', name: 'ORANGE', u: 3, col: PAL.orange,
        lines: () => [['orange', pick([
          'i made a training void. its over there. its mostly legal.',
          'buy the purple guy skin. BUY IT. i need to see it.',
          'if you die i get to drive. just so you know. im ready.',
          'type slash and then "of". thats all im saying.'])]] }
    ];
    AREAS.dorm.ents = [
      { type: 'save', x: 240, y: 300 },
      { type: 'terminal', x: 90, y: 300 },
      { type: 'door', x: 300, y: 440, w: 44, h: 30, to: 'jjhigh', tx: 640, ty: 280 },
      { type: 'sign', x: 500, y: 330, text: 'Kenji\'s bed. Under the pillow: 4 handhelds, 2 chargers, and a melted one he refuses to throw away.' },
      { type: 'chest', x: 150, y: 260, id: 'dorm1', money: 300, emote: 'console', codex: 'weakness' }
    ];
    AREAS.arena_orange.ents = [
      { type: 'npc', x: 320, y: 300, spr: 'orange', name: 'ORANGE', u: 4, quest: true, col: PAL.orange,
        lines: () => [['orange', 'CHALLENGES. pick one. i made them all myself. with my MIND.'],
          { q: 'Open the challenge list?', choice: [
            { t: 'Yes', fn: () => Game.challenges() }, { t: 'No', fn: () => {} }] }] },
      { type: 'warp', x: 320, y: 430, q: 'Return to Jujutsu High?', to: 'jjhigh', tx: 1180, ty: 360 }
    ];
  },

  /* =========================================================
     MISSION SET PIECES
     ========================================================= */
  /* --- 0: the awakening --- */
  m0_fight() {
    cutscene([
      { fn: () => { Audio.sfx('alarm'); FX.shake(8, .6); } },
      [{ who: 'narr', t: 'Something unfolds out of the dark at the end of the platform. It is the size of the ceiling.' },
       { who: 'curse', t: '*SCREEEEE*' },
       { who: 'narr', t: 'A ten-year-old boy looks up at a special grade cursed spirit and does not panic. His brain does something else instead. It adapts.' },
       ['kenji', 'Oh. You\'re not a monster.'],
       ['kenji', 'You\'re a badly coded program.'],
       { who: 'sys', t: 'INNATE TECHNIQUE AWAKENED: DIGITAL GENESIS\nBASIC COMBAT UNLOCKED: PUNCH' },
       { who: 'sys', t: 'HOW TO FIGHT:\nFIGHT → stop the marker in the centre of the bar.\nEvery hit you land makes the bar FASTER. Land all of them for huge damage.' },
       { who: 'sys', t: 'On the enemy\'s turn, dodge inside the box with the arrow keys.\nGrazing attacks builds FOCUS, which powers domains later.' }],
      { fn: () => Game.battle('specialSubway', { bg: 'subway', boss: true, canFlee: false, onWin: () => Story.m0_after() }) }
    ]);
  },
  m0_after() {
    Over.enter('subway_prologue', 900, 330);
    Over.locked = true;
    cutscene([
      { fn: () => { FX.burst(W / 2, 200, 40, { kind: 'pixel', col: '#c79aff', size: 5, life: 1.4 }); Audio.sfx('glitch'); } },
      [{ who: 'narr', t: 'He applied Null to its cursed energy output and set the number to zero. The attack never happened.' },
       { who: 'narr', t: 'Then he took the concrete pillars apart like loose blocks and put them back together through its skull.' },
       { who: 'narr', t: 'When Jujutsu High arrived to pull out survivors, they found a ten-year-old sitting on a pile of rubble, quietly playing a handheld console.' },
       ['kenji', 'Can someone charge this.'],
       { who: 'sys', t: 'CLASSIFICATION: ANOMALOUS SELF-AWAKENED SPECIAL GRADE\nSTATUS: MONITORED' },
       { who: 'narr', t: 'TWO YEARS PASS.' }],
      { fn: () => Story.complete() }
    ]);
  },

  /* --- 1: Gojo --- */
  m1_talk() {
    return [
      ['gojo', 'Ready, kiddo? Go ahead. Try to touch me.'],
      { q: 'Reach for Gojo?', choice: [
        { t: 'Reach out', fn: () => timers.after(.2, () => Story.m1_infinity()) },
        { t: 'Not yet', fn: () => {} }
      ] }
    ];
  },
  m1_infinity() {
    Over.locked = true;
    cutscene([
      { fn: () => { Audio.sfx('block'); FX.shake(4, .3); FX.ring(430, 300, { r: 70, col: PAL.cyan, w: 3, life: .5, kind: 'hex' }); } },
      [{ who: 'narr', t: 'Kenji\'s hand slows down. And down. And down. It never arrives. Infinite spatial division.' },
       ['gojo', 'Nah. Infinity.'],
       ['kenji', 'Oh, it\'s just a division-by-zero error. That\'s easy.'],
       { who: 'sys', t: 'NULL\nTARGET: GOJO.INFINITY — SET CONCEPTUAL OUTPUT TO 0' }],
      { fn: () => { Audio.sfx('null'); FX.flash(PAL.green, .3, .7); FX.glitch(.4); FX.burst(430, 300, 30, { kind: 'code', col: PAL.green, life: 1 }); } },
      [{ who: 'narr', t: 'The invisible wall snaps out of existence like a deleted line of script. Kenji\'s finger continues forward and pokes Gojo on the nose.' },
       ['gojo', '...'],
       ['gojoe', 'He didn\'t neutralise it with Domain Amplification. He turned the rule OFF.'],
       ['gojoe', 'Okay. Okay! Let\'s actually play.'],
       { who: 'sys', t: 'SPARRING MATCH — Gojo is not trying to kill you.\nHis INFINITY blocks all damage. Use NULL (TECH) or READ INFINITY (ACT) to switch it off first.' }],
      { fn: () => Game.battle('gojoSpar', { bg: 'rooftop', boss: true, canFlee: false, onWin: () => Story.m1_after() }) }
    ]);
  },
  m1_after() {
    Over.enter('rooftop', 300, 340);
    Over.locked = true;
    cutscene([
      [{ who: 'narr', t: 'Both of them land back on wet concrete. Steam is actually rising off Kenji\'s scalp.' },
       ['kenji', 'Ugh... my battery died. This fight is stupid anyway. I\'m going home to watch YouTube.'],
       ['gojoe', 'Tell you what, kiddo.'],
       { who: 'narr', t: 'Gojo pulls a fistful of premium sweets out of his pocket.' },
       ['gojoe', 'I\'ll buy you a brand-new supercharged power bank and all the ice cream you can eat.'],
       ['gojoe', 'But in exchange? You\'re coming to Jujutsu High. I think you and I are going to rewrite the rules of this entire world.'],
       ['kenji', 'Fine. But only if your school has fast Wi-Fi.'],
       ['gojoe', 'It has unbelievable Wi-Fi.'],
       { fn: () => { G.items.icecream = (G.items.icecream || 0) + 2; G.items.battery = (G.items.battery || 0) + 3; } },
       { who: 'sys', t: 'RECEIVED: PREMIUM ICE CREAM x2, POWER BANK x3' }],
      { fn: () => { G.codex.gojo = true; G.codex.ce = true; Story.complete(); } }
    ]);
  },

  /* --- 3 --- */
  m3_boss() {
    cutscene([
      [{ who: 'narr', t: 'The west wing opens into the old gymnasium. The grade 2 has made a nest out of the bleachers.' },
       ['orange', 'ok this one is actually kind of big. do the thing. DO THE THING.'],
       ['kenji', 'Which thing.'],
       ['orange', 'THE BLOCK. drop a BLOCK on it.']],
      { fn: () => Game.battle('grade2', { bg: 'subway', boss: true, canFlee: false, onWin: () => Story.m3_after() }) }
    ]);
  },
  m3_after() {
    Over.enter('detention', 1050, 340); Over.locked = true;
    cutscene([
      [['nanami', 'East wing clear. ...You exorcised the grade 2 by dropping a block of obsidian on it.'],
       ['kenji', 'It worked.'],
       ['nanami', 'It did work. I hate that it worked. Here is your pay.'],
       { who: 'sys', t: 'Jujutsu High deposits your exorcism pay in dollars.' },
       ['orange', 'DOLLARS!!! SKIN!!! BUY THE SKIN!!!']],
      { fn: () => Story.complete({ money: 300 }) }
    ]);
  },

  /* --- 4 --- */
  m4_boss() {
    cutscene([
      [{ who: 'narr', t: 'The thing at the end of the block has a finger inside it, and the finger is doing the thinking.' },
       ['yuji', 'That\'s Sukuna\'s! Kenji, don\'t let it swallow anything else!'],
       ['kenji', 'Relax. I can see the finger\'s file. It\'s read-only, which means it\'s also delete-only if you know where to click.']],
      { fn: () => Game.battle('fingerBearer', { bg: 'subway', boss: true, canFlee: false, onWin: () => Story.m4_after() }) }
    ]);
  },
  m4_after() {
    Over.enter('detention', 980, 340); Over.locked = true;
    cutscene([
      [{ who: 'narr', t: 'The curse comes apart into pixelated smoke. A single pale finger clatters onto the concrete.' },
       ['megumi', 'Don\'t touch it.'],
       ['kenji', 'I wasn\'t going to touch it. I was going to read it.'],
       { who: 'narr', t: 'He crouches over the finger and goes very quiet for eleven seconds.' },
       ['kenji', '...Huh.'],
       ['kenji', 'There are nineteen more of these. And they all point at the same save file.'],
       ['yuji', 'That\'s... me. That\'s my save file, isn\'t it.'],
       ['kenji', 'Probably! Anyway I\'m hungry.'],
       { fn: () => { G.flags.copy_dismantle = true; } },
       { who: 'sys', t: 'TECHNIQUE WITNESSED: CLEAVE / DISMANTLE\nVideo Game Copy can replicate it once unlocked.' }],
      { fn: () => Story.complete() }
    ]);
  },

  /* --- 5: Mahito first contact --- */
  m5_boss() {
    cutscene([
      [{ who: 'narr', t: 'Under the far side of the bridge, something with a stitched face is holding a human being like a lump of clay.' },
       ['mahito', 'Oh? A child sorcerer. ...And something ORANGE.'],
       ['orange', 'HE CAN SEE ME?!'],
       ['kenji', 'He can see you. He can\'t hear you. Don\'t get excited.'],
       ['mahito', 'Let me see what shape your soul takes!'],
       { who: 'sys', t: 'MAHITO uses IDLE TRANSFIGURATION on touch.\nYour passive ABSOLUTE SOLVER shield rewrites incoming matter into pixels — but not every time.' }],
      { fn: () => Game.battle('mahito', { bg: 'city', boss: true, canFlee: false, hpScale: .45, onWin: () => Story.m5_after() }) }
    ]);
  },
  m5_after() {
    Over.enter('bridge', 1030, 330); Over.locked = true;
    cutscene([
      { fn: () => { Audio.sfx('warp'); FX.glitch(.5); } },
      [{ who: 'narr', t: 'Mahito tears off a chunk of his own shoulder to break contact and throws himself backwards off the bridge.' },
       ['mahito', 'You are not reshaping the body...'],
       ['mahito', 'You are interrupting the connection between the soul and the world. How INTERESTING.'],
       ['mahito', 'I will see you again, little administrator.'],
       ['kenji', 'Great. Can\'t wait. Love that for me.'],
       { fn: () => { G.flags.copy_transfig = true; } },
       { who: 'sys', t: 'TECHNIQUE WITNESSED: IDLE TRANSFIGURATION' },
       ['orange', 'he RAN. you made the soul guy RUN. im telling everyone.']],
      { fn: () => { G.codex.mahito = true; Story.complete(); } }
    ]);
  },

  /* --- 6: Todo --- */
  m6_boss() {
    cutscene([
      [['todo', 'LITTLE ONE. SHOW ME YOUR TASTE IN BATTLE.'],
       ['kenji', 'I\'m going to lag you so hard your grandparents feel it.'],
       ['todo', 'EXCELLENT ANSWER.'],
       { who: 'sys', t: 'Todo is not an enemy. Wear him down or use ACT → TALK, then SPARE him.' }],
      { fn: () => Game.battle('todo', { bg: 'school', boss: true, canFlee: false, onWin: (r) => Story.m6_after(r) }) }
    ]);
  },
  m6_after(r) {
    Over.enter('arena_kyoto', 320, 330); Over.locked = true;
    cutscene([
      [{ who: 'narr', t: 'Todo plants his feet, breathing hard, and then laughs like a landslide.' },
       ['todo', 'MY BROTHER!!'],
       ['kenji', 'I\'m twelve.'],
       ['todo', 'MY SMALL BROTHER!!'],
       { fn: () => { G.flags.copy_boogie = true; giveEmote('todoclap'); } },
       { who: 'sys', t: 'TECHNIQUE WITNESSED: BOOGIE WOOGIE\nEMOTE UNLOCKED: TODO CLAP' },
       ['orange', 'i love him. hes so loud. hes like me but tall.']],
      { fn: () => Story.complete({ xp: r && r.spared ? 120 : 0 }) }
    ]);
  },

  /* --- 7: Hanami --- */
  m7_boss() {
    cutscene([
      [{ who: 'narr', t: 'The trees at the end of the path are not trees. They are an arm.' },
       ['hanami', '...Jujutsu sorcerer.'],
       ['kenji', 'Your whole body is one asset duplicated nine hundred times. That\'s so lazy.'],
       ['hanami', 'The forest will outlive you.'],
       ['kenji', 'Everything outlives me, I\'m twelve. Doesn\'t make you right.']],
      { fn: () => Game.battle('hanami', { bg: 'school', boss: true, canFlee: false, onWin: () => Story.m7_after() }) }
    ]);
  },
  m7_after() {
    Over.enter('forest', 1060, 340); Over.locked = true;
    cutscene([
      [{ who: 'narr', t: 'Hanami breaks apart into bark and petals and a slow green light that drains out of the clearing.' },
       ['gojo', 'Not bad, kiddo. You copied its Wooden Ravage halfway through, didn\'t you.'],
       ['kenji', 'I modded it. Mine renders faster.'],
       ['gojo', 'You "modded" a special grade\'s innate technique.'],
       ['kenji', 'Yeah?'],
       ['gojo', '...I\'m going to go sit down for a minute.'],
       { fn: () => { G.flags.copy_thorns = true; G.flags.copy_iframes = true; G.flags.copy_savestate = true; } },
       { who: 'sys', t: 'TECHNIQUES WITNESSED: WOODEN RAVAGE, INVINCIBILITY FRAMES, SAVE/LOAD' }],
      { fn: () => Story.complete() }
    ]);
  },

  /* --- 8: Jogo --- */
  m8_boss() {
    cutscene([
      [{ who: 'narr', t: 'The far end of the platform is 200 degrees hotter than the rest of it.' },
       ['jogo', 'Insolent monkey. You will burn with this city.'],
       ['kenji', 'Your fire is just a value. Watch.'],
       { who: 'sys', t: 'TIP: ASSET FLIP can swap the properties of an incoming attack.' }],
      { fn: () => Game.battle('jogo', { bg: 'subway', boss: true, canFlee: false, onWin: () => Story.m8_after() }) }
    ]);
  },
  m8_after() {
    Over.enter('shibuya', 1460, 340); Over.locked = true;
    cutscene([
      { fn: () => { Audio.sfx('glitch'); FX.flash(PAL.cyan, .3, .6); } },
      [{ who: 'narr', t: 'Kenji swaps the property "incinerating fire" with "the freezing cold of an absolute-zero vacuum".' },
       { who: 'narr', t: 'The firestorm turns into an explosion of harmless, freezing digital mist. Jogo does not survive being made cold.' },
       ['nanami', 'That was a special grade.'],
       ['kenji', 'He was badly compressed.'],
       ['nanami', 'Kenji. That was a special grade.'],
       ['kenji', 'I heard you the first time!'],
       { fn: () => { G.flags.copy_fuga = true; } },
       { who: 'sys', t: 'TECHNIQUE WITNESSED: DIVINE FLAME' }],
      { fn: () => Story.complete() }
    ]);
  },

  /* --- 9: Dagon (first enemy domain) --- */
  m9_boss() {
    cutscene([
      [['dagon', '...Shikigami.'],
       { who: 'narr', t: 'The water rises. It does not come from anywhere.' },
       ['orange', 'barrier flags going up. BARRIER FLAGS GOING UP.'],
       ['dagon', 'Domain Expansion: Horizon of the Captivating Skandha.']],
      { fn: () => Game.battle('dagon', { bg: 'subway', boss: true, canFlee: false, onWin: () => Story.m9_after() }) }
    ]);
  },
  m9_after() {
    Over.enter('shibuya', 1520, 340); Over.locked = true;
    cutscene([
      [{ who: 'narr', t: 'The shoreline drains away into nothing. The platform is just a platform again.' },
       ['kenji', 'Okay, that one was actually close. His sure-hit nearly got me.'],
       ['orange', 'nearly. NEARLY. i clipped you out of it. i am the greatest system entity in history.'],
       ['kenji', 'You screamed.'],
       ['orange', 'i screamed HEROICALLY.'],
       { who: 'sys', t: 'Your FOCUS meter now charges from grazing attacks and perfect combo hits.\nAt 50% you can build a barrier of your own.' }],
      { fn: () => Story.complete() }
    ]);
  },

  /* --- 10: Mahito, properly --- */
  m10_boss() {
    cutscene([
      [['mahito', 'A child? Jujutsu High must be truly desperate!'],
       ['kenji', 'Let\'s clean this up.'],
       { who: 'sys', t: 'PHASE 1: his flesh blades will shatter into pixelated bubbles on your passive shield.' }],
      { fn: () => Game.battle('mahito', { bg: 'subway', boss: true, canFlee: false, onWin: () => Story.m10_mid() }) }
    ]);
  },
  m10_mid() {
    cutscene([
      { fn: () => { Audio.sfx('glitch'); FX.glitch(.6); FX.shake(8, .6); } },
      [{ who: 'narr', t: 'Mahito collapses to the floor as a groveling, half-metallic mass of glitching meat. He sheds a piece of himself to break the asset swap.' },
       ['mahito', 'I understand now. You do not touch the body at all...'],
       ['mahito', 'I will become PERFECT. I will shed everything unnecessary!'],
       { who: 'sys', t: 'FINAL PHASE: MAHITO (PERFECTED)' }],
      { fn: () => Game.battle('mahitoFinal', { bg: 'subway', boss: true, canFlee: false, onWin: () => Story.m10_after() }) }
    ]);
  },
  m10_after() {
    Over.enter('shibuya', 1560, 340); Over.locked = true;
    cutscene([
      [['kenji', 'You\'re a really annoying enemy. I\'m formatting this drive.'],
       { who: 'sys', t: 'HAND SIGN: POWER BUTTON' }],
      { fn: () => { FX.domainExpansion(DOMAINS.void404, { x: W / 2, y: 260 }); } },
      { wait: 4.4 },
      [{ who: 'sys', t: 'ERROR 404: COSMOS FORMAT\n3s — SIGHT, HEARING, TOUCH: REVOKED' },
       { who: 'sys', t: '10s — IDLE TRANSFIGURATION NOT FOUND. TECHNIQUE UNINSTALLED.' },
       { who: 'sys', t: '20s — PHYSICAL FORM REDUCED TO TRANSPARENT WIREFRAMES.' },
       { who: 'narr', t: 'For a curse born from human hatred, Mahito finally experiences the cold, unfeeling horror of complete computational deletion. He cannot adapt. He cannot morph. He cannot heal. His existence has an absolute conceptual value of zero.' },
       { who: 'sys', t: '30s — FORMAT COMPLETE. NOTHING REMAINS.' }],
      { fn: () => { Audio.sfx('shatter'); FX.burst(W / 2, 240, 70, { kind: 'pixel', col: PAL.green, size: 5, life: 1.6 }); } },
      [['kenji', 'Ugh, only 14% left. I need to find a charger.'],
       ['orange', 'you just deleted one of humanitys worst nightmares'],
       ['kenji', 'Yeah but my battery.'],
       { fn: () => { G.codex.d404 = true; G.codex.dsandbox = true; giveSkin('shibuya'); } },
       { who: 'sys', t: 'SKIN UNLOCKED: SHIBUYA SURVIVOR' }],
      { fn: () => Story.complete() }
    ]);
  },

  /* --- 11: SUKUNA --- */
  m11_boss() {
    cutscene([
      [['sukuna', 'Is that your best attack?'],
       ['kenji', 'My passive defence takes care of that easily. Let me try a mod I\'ve been working on.'],
       { who: 'sys', t: 'PHASE 1 — his Dismantle is rewritten into harmless 8-bit pixels a foot from your skin.' }],
      { fn: () => Game.battle('sukuna', { bg: 'shinjuku', boss: true, canFlee: false, onWin: () => Story.m11_tantrum() }) }
    ]);
  },
  /* the doc's climax: Sandbox gets shattered, Kenji throws a tantrum, Orange Flash + Error 404 */
  m11_tantrum() {
    Over.locked = true;
    cutscene([
      { fn: () => { Audio.stop(); Audio.sfx('domainbreak'); FX.shake(16, 1.4); FX.flash('#fff', .3, .8); } },
      [{ who: 'narr', t: 'Sukuna uses a binding vow and forces Kenji\'s Sandbox apart from the outside. The colourful voxel world breaks into floating pixels.' },
       ['kenji', '*cough*'],
       { who: 'narr', t: 'Kenji spits blood. His brain is overheating from domain burnout. Steam is coming off his scalp.' },
       ['sukuna', 'You are magnificent, brat.'],
       ['sukuna', 'But a child cannot rewrite the King.'],
       ['kenji', '...'],
       ['kenji', 'You\'re CHEATING!'],
       ['kenji', 'I HATE this game! I\'m DELETING YOUR SAVE FILE!'],
       ['orange', 'THERE HE IS. THERE\'S MY BOY. KENJI\'S MAD. KENJI\'S MAD!!'],
       { who: 'sys', t: 'RESTRICTED DIRECTORY ACCESSED: /ORANGE/FINAL/' }],
      { fn: () => { Story.ensureLevel(30); } },
      { wait: .3 },
      { fn: () => { if (LevelUp.busy()) return 'wait'; } },
      [['orange', 'kenji. kenji listen to me. wind it ALL the way back.'],
       ['orange', 'one hundred black flashes. ONE punch. i\'ll route the engine file through your fist.'],
       ['kenji', 'Do it.'],
       ['orange', 'ORANGE FLASH!!!']],
      { fn: () => { FX.orangeFlash(W / 2, 230, {}); G.orangeFlashes++; } },
      { wait: 3.5 },
      [{ who: 'narr', t: 'The fist lands. Shinjuku\'s remaining skyline simply stops being vertical.' },
       ['sukuna', '...What.'],
       ['kenji', 'And now the other thing.'],
       { who: 'sys', t: 'HAND SIGN: POWER BUTTON' }],
      { fn: () => { FX.domainExpansion(DOMAINS.void404, { x: W / 2, y: 240 }); } },
      { wait: 4.4 },
      [{ who: 'sys', t: 'ERROR 404: COSMOS FORMAT\nTARGET: RYOMEN SUKUNA' },
       { who: 'sys', t: '3s — The King of Curses loses sight, hearing and touch.' },
       { who: 'sys', t: '10s — MALEVOLENT SHRINE NOT FOUND. SHRINE TECHNIQUE UNINSTALLED.\nHe is a normal human being in a white void.' },
       { who: 'sys', t: '20s — His massive physical form begins to glitch into transparent wireframes.' },
       { who: 'narr', t: 'For the first time in a thousand years, the King of Curses feels genuine terror. He cannot fight, cut, or burn his way out — because the very concept of "fighting" has been set to zero.' },
       { who: 'narr', t: 'With a final, desperate burst of pure soul-multiplication, Sukuna uses a hidden soul-splitting binding vow to eject a single piece of himself out through the barrier, one instant before the thirty-second mark.' },
       { who: 'sys', t: '30s — FORMAT COMPLETE.\nSUKUNA\'S MAIN BODY HAS BEEN REMOVED FROM EXISTENCE.' }],
      { fn: () => { Audio.sfx('shatter'); FX.flash('#fff', .5, 1); FX.burst(W / 2, 240, 90, { kind: 'pixel', col: PAL.green, size: 6, life: 2 }); } },
      { wait: 1.2 },
      [{ who: 'narr', t: 'Nothing is left on the ground but a pixelated puff of smoke.' },
       { who: 'narr', t: 'Kenji drops the domain and falls onto his knees, panting. He looks at his console. It has completely melted.' },
       ['kenji', 'Man... that boss fight sucked.'],
       { who: 'narr', t: 'He has no idea that he has just defeated the strongest sorcerer in history.' },
       ['orange', '...'],
       ['orange', 'kenji that was the coolest thing anyone has ever done'],
       ['kenji', 'My console melted.'],
       ['orange', 'I\'LL BUILD YOU A NEW ONE. CREATIVE MODE. LETS GO HOME.'],
       { fn: () => { giveSkin('king'); giveSkin('ghostface'); giveEmote('sukunapoint'); G.flags.copy_purple = true; } },
       { who: 'sys', t: 'SKIN UNLOCKED: KING OF CURSES [MYTHIC]\nSKIN UNLOCKED: GHOST FACE PROTOCOL [MYTHIC]\nEMOTE UNLOCKED: SUKUNA FINGER POINT [LEGENDARY]' }],
      { fn: () => Story.complete() }
    ]);
  },

  /* --- 12: EPILOGUE / CULLING GAME --- */
  epilogue() {
    Over.enter('culling', 120, 360);
    Over.locked = true;
    cutscene([
      { fn: () => { Audio.play('culling'); } },
      [{ who: 'narr', t: 'THREE DAYS LATER.' },
       { who: 'narr', t: 'Jujutsu High is still counting the dead from Shibuya. Nobody can find the body of the man who sealed Gojo.' },
       ['kenji', 'Orange, something\'s wrong with the map.'],
       ['orange', 'what do you mean the map'],
       ['kenji', 'The country. There are new barriers up. Loads of them. They went up all at once while everyone was busy.'],
       ['kenji', 'And they\'re not normal barriers. They have... rules in them. Scoring. Win conditions.'],
       ['orange', '...like a game?'],
       ['kenji', 'Like a game.'],
       { wait: .4 }],
      { fn: () => { Audio.sfx('alarm'); FX.glitch(.6); FX.shake(6, .6); } },
      [{ who: 'sys', t: 'INCOMING BROADCAST. SOURCE: UNSIGNED.\nAUTHOR CERTIFICATE: INVALID. (file has been overwritten many, many times.)' },
       ['kenjaku', 'Hello, little administrator.'],
       ['kenji', '...Who is that.'],
       ['kenjaku', 'A fan. You formatted Sukuna\'s main body out of reality. I watched it happen twice — once live, once in slow motion.'],
       ['kenjaku', 'You have a rare gift: you treat the world as something editable. So do I. We are going to get along beautifully.'],
       ['kenjaku', 'I\'ve set up a little something. A board. Colonies, points, rules, no exits. Sorcerers, non-sorcerers, children, everyone.'],
       ['kenjaku', 'I am calling it the Culling Game.'],
       ['orange', 'kenji. kenji he just registered YOUR NAME as a PLAYER.'],
       { who: 'sys', t: 'PLAYER REGISTERED: SATO, KENJI\nRULES RECEIVED: 10\nPOINTS: 0\nCOLONY: UNASSIGNED' },
       ['kenjaku', 'Rule one: a player who does not play within nineteen days loses their cursed technique.'],
       ['kenji', '...'],
       ['kenjaku', 'Rule ten is my favourite. A player may add a new rule to the game.'],
       ['kenjaku', 'I thought you of all people would appreciate write access.'],
       { wait: .5 },
       ['kenjaku', 'The Culling Game begins now. Do try to keep up.'],
       { who: 'sys', t: 'BROADCAST ENDED.' }],
      { fn: () => { Audio.stop(); FX.flash('#000', .4, 1); } },
      [['orange', '...'],
       ['orange', 'kenji what do we do'],
       { who: 'narr', t: 'Kenji looks out over a city with new, invisible walls growing through it. Somewhere underneath all of it, a scoreboard is waiting for its first entry.' },
       { who: 'narr', t: 'He turns the brand-new handheld console over in his hands. Battery: 100%.' },
       ['kenji', 'He gave himself admin.'],
       ['kenji', 'That\'s fine. I\'m better at this than he is.'],
       ['kenji', 'Orange?'],
       ['orange', 'yeah?'],
       ['kenji', 'Let\'s go break his game.']],
      { fn: () => { G.flags.ch1_done = true; G.save(); Game.toCredits(); } }
    ]);
  }
};

/* ===========================================================
   SIDE CONTENT: mission board + Orange challenges
   =========================================================== */
const SIDE_MISSIONS = [
  { id: 'sm_g4', title: 'Grade 4 Exorcism', grade: '4', eid: 'grade4', area: 'detention',
    desc: 'A grade 4 in a stairwell. Routine. Pays badly.', pay: 120, minLv: 1 },
  { id: 'sm_swarm', title: 'Swarm Clearance', grade: '4', eid: 'swarm', area: 'detention',
    desc: 'Several small curses pretending to be one big curse.', pay: 180, minLv: 2 },
  { id: 'sm_g2', title: 'Grade 2 Removal', grade: '2', eid: 'grade2', area: 'bridge',
    desc: 'A grade 2 under a bridge. Bring a snack.', pay: 320, minLv: 5 },
  { id: 'sm_g1', title: 'Grade 1 Removal', grade: '1', eid: 'grade1', area: 'forest',
    desc: 'Grade 1. It has a mouth where a mouth should not be.', pay: 600, minLv: 9 },
  { id: 'sm_finger', title: 'Finger Bearer Recovery', grade: 'SP', eid: 'fingerBearer', area: 'detention',
    desc: 'Another one swallowed a finger. Recover what is left.', pay: 1100, minLv: 13 },
  { id: 'sm_todo', title: 'Sparring: Aoi Todo', grade: '1', eid: 'todo', area: 'arena_kyoto',
    desc: 'He asks again. He will always ask again.', pay: 900, minLv: 10, repeat: true },
  { id: 'sm_gojo', title: 'Sparring: Satoru Gojo', grade: 'SP', eid: 'gojoSpar', area: 'rooftop',
    desc: 'He is bored. This is dangerous for everyone.', pay: 2000, minLv: 20, repeat: true }
];

const CHALLENGES = [
  { id: 'ch_combo', title: 'Combo Trial', desc: 'Punch the dummy. Orange is grading your timing.',
    eid: 'dummy', pay: 300, minLv: 1,
    hint: 'Land perfect hits. The bar gets faster every time.' },
  { id: 'ch_dodge', title: 'Dodge Trial', desc: 'Orange spawned target drones. Survive them.',
    eid: 'droneSwarm', pay: 500, minLv: 4 },
  { id: 'ch_bf', title: 'Black Flash Trial', desc: 'Land a Black Flash. Orange will cry. In a good way.',
    eid: 'droneSwarm', pay: 900, minLv: 17, need: 'blackflash' },
  { id: 'ch_rush1', title: 'Boss Rush: Special Grades', desc: 'Hanami. Jogo. Dagon. Back to back.',
    rush: ['hanami', 'jogo', 'dagon'], pay: 2400, minLv: 17 },
  { id: 'ch_rush2', title: 'Boss Rush: The Worst Night', desc: 'Mahito, then Mahito again, then the King.',
    rush: ['mahito', 'mahitoFinal', 'sukuna'], pay: 6000, minLv: 25 },
  { id: 'ch_king', title: 'Rematch: King of Curses', desc: 'He is bored of you. Bore him again.',
    eid: 'sukuna', pay: 4000, minLv: 25 }
];
