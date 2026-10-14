/* ===========================================================
   DIGITAL GENESIS — story2.js
   CHAPTER 2: THE CULLING GAME
   Nineteen days, ten rules, and one of them is write access.
   =========================================================== */
'use strict';

const CHAPTER2 = [

M({ id: 'registration', title: 'Rule Ten', area: 'tengen', minLv: 31,
  objective: 'Someone put the whole country on a board.', xp: 900, money: 1200,
  spawn: [320, 400],
  ents: [
    { type: 'npc', x: 320, y: 300, spr: 'tengen', name: 'TENGEN', u: 4, quest: true, col: '#d9a2ff',
      lines: () => [
        ['narr', 'TENGEN. Four hundred years of barrier maintenance in something that used to be a person.'],
        { who: 'narr', t: '"The barriers went up in a single night. Ten rules. Points scored by killing players. A player who does not play for nineteen days loses their technique."' },
        { who: 'narr', t: '"And rule ten: a player may add a new rule to the game, for one hundred points."' },
        ['kenji', 'He gave the board write access.'],
        { who: 'narr', t: '"He gave EVERYONE write access. He is confident no one else can use it."' },
        ['kenji', 'That’s the most insulting thing anyone has ever said to me.'],
        { q: 'Enter the Culling Game?', choice: [
          { t: 'Register', fn: () => { G.flags.registration_boss = true; Story.runMission(CHAPTER2[0].cfg); } },
          { t: 'Not yet', fn: () => {} }
        ] }
      ] }
  ],
  intro: [
    { who: 'sys', t: 'CHAPTER 2\nTHE CULLING GAME', big: true },
    { who: 'narr', t: 'Under Jujutsu High, past a barrier that has been standing since before Tokyo had a name, something that was once a sorcerer is waiting with a list of rules.' },
    ['orange', 'kenji this room is older than JAPAN'],
    ['kenji', 'It’s older than the idea of Japan, Orange. Go talk to it.'],
    { who: 'sys', t: 'Talk to Tengen.' }
  ],
  pre: [
    { who: 'sys', t: 'PLAYER REGISTERED: SATO, KENJI\nRULES: 10   POINTS: 0   COLONY: TOKYO NO.1' },
    ['orange', 'ok but like. a QUESTION. whats stopping you from using rule ten right now'],
    ['kenji', 'A hundred points. Which means I have to play his game to break his game.'],
    ['kenji', 'Which is exactly what he wants. Which means he’s already losing, he just doesn’t know what to.'],
    ['orange', 'to WHAT'],
    ['kenji', 'To a twelve-year-old who reads patch notes for fun.']
  ],
  boss: [{ eid: 'grade1', opts: { boss: false }, pre: [
    { who: 'narr', t: 'A player steps out of the dark the second the registration completes. In here, you are worth points.' }
  ] }],
  outro: [
    ['kenji', 'Right. Nineteen days.'],
    ['orange', 'and then what'],
    ['kenji', 'And then I own the rules and he owns nothing.'],
    { fn: () => { G.codex.cullinggame = true; G.flags.registered = true; } }
  ] }),

M({ id: 'colony_tokyo1', title: 'Tokyo No.1: The Receipt', area: 'colony1', minLv: 33,
  objective: 'Megumi is already inside. Find him.', xp: 1100, money: 1500,
  spawn: [70, 360],
  ents: [
    { type: 'npc', x: 320, y: 350, spr: 'megumi', name: 'MEGUMI', u: 3, col: '#9ab8ff',
      lines: [['megumi', 'There is a man here who turns receipts into whatever was printed on them.'],
              ['megumi', 'He bought a car this morning. Think about what that means and then stop thinking about it.']] },
    { type: 'chest', x: 600, y: 330, id: 'c1a', money: 800, item: 'ramen' }
  ],
  intro: [
    { who: 'narr', t: 'Tokyo No.1 Colony. The barrier came down over nine wards and everyone inside was told the rules by a voice in their head.' },
    ['megumi', 'Kenji.'],
    ['kenji', 'Megumi. You look terrible.'],
    ['megumi', 'I have been in here four days. There is a man scoring points off civilians.'],
    ['kenji', 'Then let’s go take his points.'],
    { who: 'sys', t: 'Head east through the colony.' }
  ],
  boss: [{ eid: 'reggie', pre: [
    ['reggie', '"Evening. You two are worth, what, ten points together?"'],
    ['reggie', '"Everything has a price, kid. Even you. Especially you."'],
    ['kenji', 'You turn receipts into objects.'],
    ['reggie', '"...How did you —"'],
    ['kenji', 'You print the object’s data and then instantiate it. It’s a spawn command with extra steps.'],
    ['kenji', 'Orange does this better and he’s a vegetable.'],
    ['orange', 'IM RIGHT HERE. also yes i do.']
  ] }],
  outro: [
    { who: 'narr', t: 'Reggie Star goes down surrounded by paper, which is a more dignified end than most people get in here.' },
    ['megumi', 'Points transferred. You have twenty.'],
    ['kenji', 'Eighty to go and then I can write a rule.'],
    ['megumi', 'What rule.'],
    ['kenji', 'Haven’t decided. Something petty first, to see if it works.'],
    { fn: () => { G.flags.points = (G.flags.points || 0) + 20; } },
    { who: 'sys', t: 'CULLING GAME POINTS: 20 / 100' }
  ] }),

M({ id: 'colony_tokyo2', title: 'Tokyo No.2: The Parlour', area: 'colony2', minLv: 35,
  objective: 'Someone has turned a colony into a pachinko floor.', xp: 1200, money: 1700,
  spawn: [70, 370],
  ents: [{ type: 'sign', x: 260, y: 340, col: '#ffd24a',
    text: 'HOUSE RULES, hand-written on a door: 1. No killing on my floor. 2. Seriously. 3. If you want a fight, ASK, and we do it properly.' }],
  intro: [
    { who: 'narr', t: 'Tokyo No.2 Colony is a pachinko parlour that somehow still has power, and it is the only place inside any barrier where nobody has died this week.' },
    ['orange', 'kenji theres MUSIC. and COINS. and someone is WINNING.'],
    ['kenji', 'Somebody is running this colony like a business instead of a hunting ground.'],
    { who: 'narr', t: 'A girl with stars in her hair steps out of the machines and looks at Kenji’s shoes with open hostility.' },
    ['narr', 'KIRARA HOSHI.'],
    { who: 'narr', t: '"Do NOT scuff the floor."' },
    { who: 'sys', t: 'Head into the parlour.' }
  ],
  boss: [
    { eid: 'charles', pre: [
      ['narr', 'A man with a pen behind his ear is already drawing you.'],
      ['narr', 'CHARLES BERNARD. "I can see your next three seconds as panels. Hold still, this is good material."'],
      ['kenji', 'He’s precognitive.'],
      ['orange', 'he is DRAWING YOU. kenji he is drawing you RIGHT NOW.'],
      ['kenji', 'Make me look cool.']
    ] },
    { eid: 'kirara', pre: [
      { who: 'narr', t: '"Right. You beat Charles, so you get me, and I am considerably less polite about it."' },
      { who: 'narr', t: '"Love Rendezvous. Everything I touch gets attached to everything else I touch. Including you. Including the ceiling."' },
      ['kenji', 'That’s a magnet with opinions.'],
      { who: 'narr', t: '"That is the rudest possible description and you are not wrong."' },
      ['orange', 'kenji i think they are DATING'],
      ['kenji', 'Orange.'],
      ['orange', 'IM JUST SAYING. look at the FLOOR. somebody SWEPT.']
    ] }
  ],
  outro: [
    { who: 'narr', t: 'Kirara lands on their feet, brushes the dust off the floor rather than off themselves, and points at a shutter at the back of the parlour.' },
    { who: 'narr', t: '"Fine. You are not a murderer. Congratulations, that puts you in the top one percent of this game."' },
    { who: 'narr', t: '"He is through there. He has been waiting for someone worth the electricity bill."' },
    ['kenji', 'Who is?'],
    { fn: () => { Audio.sfx('alarm'); FX.flash('#ffd24a', .4, .6); } },
    { who: 'narr', t: 'Every machine on the floor pays out at once.' },
    ['orange', '...kenji.'],
    ['orange', 'KENJI THE WHOLE ROOM IS DOING THE JACKPOT NOISE'],
    { fn: () => { G.flags.points = (G.flags.points || 0) + 20; giveEmote('hakari'); } },
    { who: 'sys', t: 'CULLING GAME POINTS: 40 / 100\nEMOTE UNLOCKED: HAKARI DANCE [EPIC]' }
  ] }),

M({ id: 'hakari', title: 'Idle Death Gamble', area: 'colony2', minLv: 37,
  objective: 'Kinji Hakari would like a proper fight, please.', xp: 1600, money: 2400,
  spawn: [70, 370],
  intro: [
    { who: 'narr', t: 'Behind the shutter is a man who has been thrown out of Jujutsu High, re-admitted, thrown out again, and has clearly been enjoying himself the entire time.' },
    ['narr', 'KINJI HAKARI. Special grade, unofficially, because nobody has been able to finish the paperwork on him.'],
    { who: 'narr', t: '"You’re the admin kid! The one who formatted Sukuna’s main body!"' },
    ['kenji', 'Yes.'],
    { who: 'narr', t: '"That’s the coolest thing I’ve ever heard and I want to fight you so badly I can feel it in my teeth."' },
    ['kenji', 'You have a domain.'],
    { who: 'narr', t: '"I have a domain."' },
    ['kenji', 'What does it do?'],
    { who: 'narr', t: '"It gambles."' },
    ['orange', 'KENJI. KENJI I LIKE HIM.'],
    { who: 'sys', t: 'WARNING: if his domain pays out he becomes effectively unkillable for four minutes.\nEnd it before the reels land, or survive the payout.' }
  ],
  boss: [{ eid: 'hakari', pre: [
    { who: 'narr', t: '"Kirara! Watch the floor for me!"' },
    { who: 'narr', t: '"I am ALWAYS watching the floor, Hakari."' },
    { who: 'narr', t: '"DOMAIN EXPANSION: IDLE DEATH GAMBLE."' },
    ['kenji', 'He built a pachinko parlour as a sure-hit.'],
    ['orange', 'and a TRAIN. kenji theres a TRAIN'],
    ['kenji', 'I know. I’m having a complicated feeling about it.']
  ] }],
  outro: [
    { who: 'narr', t: 'The reels stop one symbol short. Hakari looks at them for a long second and then starts laughing so hard he has to sit down on the floor Kirara just swept.' },
    { who: 'narr', t: '"FOUR POINT ONE PERCENT. Do you know how often I hit that? Do you know how often?"' },
    ['kenji', 'Statistically? Often enough to be a problem.'],
    { who: 'narr', t: '"Take the points, kid. Take them, and when this is over come back and I’ll teach you the dance."' },
    ['kenji', 'The what?'],
    { who: 'narr', t: '"THE DANCE."' },
    ['orange', 'YES. YES KENJI. THE DANCE.'],
    { fn: () => { G.flags.points = (G.flags.points || 0) + 30; giveSkin('devbuild'); } },
    { who: 'sys', t: 'CULLING GAME POINTS: 70 / 100\nSKIN UNLOCKED: DEV BUILD KENJI [EPIC]\nTIP: press B and perform the Hakari Dance.' }
  ] }),

M({ id: 'sendai', title: 'Sendai Colony', area: 'sendai', minLv: 39,
  objective: 'Yuta is up north and the players there are a thousand years old.', xp: 1500, money: 2000,
  spawn: [70, 360],
  ents: [{ type: 'npc', x: 340, y: 340, spr: 'yuta', name: 'YUTA', u: 3, col: '#9fe8ff',
    lines: [['narr', '"The players in this colony are not modern sorcerers. Some of them have been reincarnated from the Heian era."'],
            ['narr', '"They do jujutsu the way it was done before anyone wrote any of it down."']] }],
  intro: [
    { who: 'narr', t: 'Sendai. Snow comes through the barrier but nothing else does.' },
    ['narr', '"Kenji. You came."'],
    ['kenji', 'You filed an inaccurate report for me. I owe you one bad idea.'],
    ['narr', '"There are two players here I cannot beat alone."'],
    ['kenji', 'Then we’ll be bad at it together.'],
    { who: 'sys', t: 'Head east with Yuta.' }
  ],
  boss: [
    { eid: 'uro', pre: [
      ['narr', 'TAKAKO URO. "You are very new. All of you are very new."'],
      ['narr', '"I will show you what the sky was for."'],
      ['kenji', 'She’s treating the air itself as a surface. That’s... actually elegant.']
    ] },
    { eid: 'ryu', pre: [
      ['narr', 'RYU ISHIGORI. "GRANITE BLAST."'],
      ['kenji', 'And that one is just output. No technique, no trick, just an absurd amount of output.'],
      ['orange', 'i respect it. i hate it. i respect it.']
    ] }
  ],
  outro: [
    ['narr', '"...You put a building through him."'],
    ['kenji', 'I put a block through him. There’s a difference and the difference is that mine renders faster.'],
    ['narr', '"I am going to write that down."'],
    { fn: () => { G.flags.points = (G.flags.points || 0) + 20; G.flags.copy_skyops = true; } },
    { who: 'sys', t: 'CULLING GAME POINTS: 90 / 100' }
  ] }),

M({ id: 'higuruma', title: 'Deadly Sentencing', area: 'courthouse', minLv: 41,
  objective: 'A man awakened three weeks ago and already has a domain.', xp: 1700, money: 2300,
  spawn: [320, 410], tx: 290,
  intro: [
    { who: 'narr', t: 'A sealed district court. Inside it, a defence lawyer who stopped believing in the system about a month before the system stopped existing.' },
    ['narr', 'HIROMI HIGURUMA. "You are a child."'],
    ['kenji', 'Everybody opens with that.'],
    ['narr', '"You are a child who has killed, what, nine special grades?"'],
    ['kenji', 'Eleven.'],
    ['narr', '"Eleven. And you are twelve years old, and nobody has asked you whether you wanted any of it."'],
    ['kenji', '...'],
    ['narr', '"Sit down. We are going to establish the facts properly."'],
    { who: 'sys', t: 'Enter the court.' }
  ],
  boss: [{ eid: 'higuruma', pre: [
    { who: 'narr', t: '"DOMAIN EXPANSION: DEADLY SENTENCING."' },
    { who: 'sys', t: 'WARNING: inside this barrier the verdict is binding.\nIf it finds against you, it takes your technique or your life.' },
    ['orange', 'kenji he can take DIGITAL GENESIS. he can take it OFF YOU.'],
    ['kenji', 'I know.'],
    ['kenji', 'Good. Finally something with real stakes.']
  ] }],
  outro: [
    { who: 'narr', t: 'The court does not reach a verdict, because the defendant keeps rewriting the evidence while it is being read.' },
    ['narr', '"...You cheated in a courtroom."'],
    ['kenji', 'I had write access to the transcript.'],
    ['narr', '"That is the single most illegal thing I have ever watched anyone do."'],
    ['kenji', 'Are you going to arrest me?'],
    ['narr', '"I am going to help you. Which is worse, for me."'],
    { fn: () => { G.flags.points = (G.flags.points || 0) + 10; G.flags.copy_judge = true; } },
    { who: 'sys', t: 'CULLING GAME POINTS: 100 / 100\nRULE TEN IS NOW AVAILABLE TO YOU.' }
  ] }),

M({ id: 'takaba', title: 'The Bit', area: 'colony1', minLv: 43,
  objective: 'Kenjaku sent a comedian. This is somehow the worst one.', xp: 1400, money: 2000,
  spawn: [70, 360],
  intro: [
    { who: 'narr', t: 'A man in a loud shirt is standing in the middle of a destroyed intersection holding a microphone that was not there a second ago.' },
    ['narr', 'FUMIHIKO TAKABA. "IS THIS A BIT? Are WE a bit?"'],
    ['kenji', 'Orange, read him.'],
    ['orange', 'kenji his technique is "whatever he thinks is funny becomes true"'],
    ['kenji', 'That’s not a technique, that’s a cheat code.'],
    ['orange', 'thats OUR THING. he STOLE OUR THING.'],
    { who: 'sys', t: 'There is no counter to this. There is only playing along.' }
  ],
  boss: [{ eid: 'takaba', pre: [
    ['narr', '"Okay okay okay — what if your fist was a HAND BUZZER."'],
    { fn: () => { FX.glitch(.5); Audio.sfx('glitch'); } },
    ['kenji', 'It’s a hand buzzer.'],
    ['orange', 'KENJI YOUR FIST IS A HAND BUZZER'],
    ['kenji', 'I KNOW.'],
    { who: 'sys', t: 'TIP: you cannot out-damage a joke. SPARE him when he runs out of material.' }
  ] }],
  outro: [
    { who: 'narr', t: 'Takaba runs out of bits eleven minutes later, out of breath, delighted, and still not entirely sure who anybody is.' },
    ['narr', '"That was GREAT. You’re a great audience. Is the pumpkin real?"'],
    ['kenji', 'He can’t hear you.'],
    ['orange', 'TELL HIM IM REAL'],
    ['kenji', 'He’s real.'],
    ['narr', '"KNEW IT."'],
    { fn: () => { giveEmote('takabamic'); } }
  ] }),

M({ id: 'kashimo', title: 'Four Hundred Years', area: 'sendai', minLv: 45,
  objective: 'Someone reincarnated specifically to find a fight worth having.', xp: 2000, money: 2800,
  spawn: [70, 360],
  intro: [
    { who: 'narr', t: 'A man is sitting on a dead traffic light with electricity running between his fingers, and he has been waiting four hundred years to be bored for the last time.' },
    ['narr', 'HAJIME KASHIMO. "Are you the strongest?"'],
    ['kenji', 'No. The strongest is in a box.'],
    ['narr', '"Then are you the most interesting?"'],
    ['kenji', '...Probably, yeah.'],
    ['narr', '"Good enough."'],
    { who: 'sys', t: 'He is not going to let you leave.' }
  ],
  boss: [{ eid: 'kashimo', pre: [
    ['narr', '"I gave up my body, my name and four centuries for one fight that would mean something."'],
    ['narr', '"Mythical Beast Amber."'],
    ['kenji', 'He converted his own soul into a battery.'],
    ['orange', 'thats METAL kenji. thats so metal. i hate how metal that is.']
  ] }],
  outro: [
    { who: 'narr', t: 'Kashimo lands on his back in a crater of his own making and starts laughing at the sky.' },
    ['narr', '"A child. A CHILD. Four hundred years and it is a twelve-year-old with a pumpkin."'],
    ['kenji', 'Does that make it worse?'],
    ['narr', '"It makes it PERFECT."'],
    ['narr', '"When the King comes back out — and he will — call me. I want that one too."'],
    { fn: () => { G.flags.copy_amber = true; G.flags.kashimo_ally = true; } },
    { who: 'sys', t: 'TECHNIQUE WITNESSED: MYTHICAL BEAST AMBER' }
  ] }),

M({ id: 'cliffhanger', title: 'Nineteen Days Left', area: 'tengen', minLv: 47,
  objective: 'A hundred points. Rule ten is yours.', xp: 2400, money: 3000,
  spawn: [320, 400], tx: 470,
  ents: [{ type: 'save', x: 230, y: 360 }],
  intro: [
    { who: 'narr', t: 'Back under the school, with a hundred points logged and nineteen days still on the clock.' },
    ['kenji', 'Rule ten. A player may add a new rule for a hundred points.'],
    ['orange', 'and you HAVE a hundred points'],
    ['kenji', 'And I have a hundred points.'],
    ['orange', 'SO WRITE IT. write "kenji wins". write "orange gets a body". WRITE SOMETHING'],
    ['kenji', 'Not yet.'],
    ['kenji', 'He expects a rule. The second I write one he learns exactly how I think.'],
    ['kenji', 'So I\u2019m going to sit on it until it costs him something.'],
    { who: 'sys', t: 'Talk to Tengen when you are ready to close the chapter.' }
  ],
  boss: [{ eid: 'kenjakuBoss', opts: { hpScale: .55 }, pre: [
    { who: 'narr', t: 'The barrier does not break so much as it politely steps aside for someone who helped design it.' },
    ['kenjaku', '"A hundred points in eleven days. You are well ahead of my projections."'],
    ['kenji', 'You came here yourself.'],
    ['kenjaku', '"I came to look at you properly. You are the only player who treats my rules as an interface rather than a cage."'],
    ['kenjaku', '"I find that genuinely delightful. It is also why I am going to have to take you seriously now."'],
    ['orange', 'kenji that is NOT the whole of him. thats like a THIRD'],
    ['kenji', 'I know. He\u2019s letting me see a third on purpose.']
  ] }],
  outro: [
    { who: 'narr', t: 'Kenjaku withdraws the way a hand withdraws from a chessboard — unhurried, and having learned something.' },
    ['kenjaku', '"Eight days, administrator. Then the board changes shape and I will want to see what you write."'],
    ['kenji', 'You\u2019ll see it.'],
    ['kenjaku', '"I am counting on it."'],
    { who: 'narr', t: 'He leaves. Somewhere north of here a man in a box has nineteen days of nothing left, and somewhere closer than that, two of Kenji\u2019s friends are about to have the worst week of their lives.' },
    ['orange', 'kenji'],
    ['kenji', 'Yeah.'],
    ['orange', 'whats the rule going to be'],
    ['kenji', '...I\u2019ll know it when I need it.'],
    { fn: () => { G.flags.ch2_done = true; G.flags.points = 100; G.save(); } }
  ] })

];

/* ===========================================================
   PARKED: post-anime material.
   Written, but deliberately NOT in CHAPTERS - it covers manga
   beats the anime has not reached. Add CHAPTER2_LOCKED to the
   registry when you are ready to be spoiled.
   =========================================================== */
const CHAPTER2_LOCKED = [
M({ id: 'angel', title: 'Jacob’s Ladder', area: 'colony1', minLv: 47,
  objective: 'Something that can undo the Prison Realm is walking around in a schoolgirl.', xp: 2000, money: 2800,
  spawn: [70, 360],
  intro: [
    { who: 'narr', t: 'Hana Kurusu has been sharing her body with a thousand-year-old sorcerer since she was small, and the sorcerer has opinions about everything.' },
    ['narr', 'ANGEL. "You. Administrator. I have been watching your file."'],
    ['kenji', 'My file.'],
    ['narr', '"You treat the laws of creation as editable text. You are an abomination and I would normally have erased you on sight."'],
    ['kenji', 'And now?'],
    ['narr', '"And now there is something worse out there, and you are the only one who can get me to it."'],
    { who: 'sys', t: 'She can undo the Prison Realm. She needs to see what you are first.' }
  ],
  boss: [{ eid: 'angel', pre: [
    ['narr', '"Jacob’s Ladder. It erases cursed techniques. All of them. Permanently."'],
    ['kenji', 'That’s Null.'],
    ['narr', '"That is NOT —"'],
    ['kenji', 'That’s just Null with a longer name and a thousand years of branding.'],
    ['orange', 'KENJI'],
    ['narr', '"...I am going to enjoy this far more than I expected."']
  ] }],
  outro: [
    { who: 'narr', t: 'Angel stops a hand’s width from Kenji’s face, studies him for a long moment, and then laughs — and it is Hana’s laugh, not hers.' },
    ['narr', '"Fine. FINE. You are an abomination and you are also correct, which is the worst combination."'],
    ['narr', '"Bring me the Prison Realm. I will open it. And then you will owe me a favour you will not enjoy."'],
    ['kenji', 'Deal.'],
    ['orange', 'kenji that was a BINDING VOW. that was a REAL ONE. i felt it SIGN.'],
    ['kenji', 'I know. I read it before I said yes.'],
    { fn: () => { G.flags.angel_deal = true; } }
  ] }),

M({ id: 'megumifalls', title: 'The Vessel', area: 'colony1', minLv: 49,
  objective: 'Sukuna has nineteen fingers and one very specific plan.', xp: 2400, money: 3200,
  spawn: [70, 360],
  intro: [
    { who: 'narr', t: 'Yuji has been missing for six hours. Megumi went to find him. Neither of them has come back.' },
    ['orange', 'kenji somethings wrong with megumis file'],
    ['kenji', 'Wrong how.'],
    ['orange', 'theres TWO of them in there. and ones WRITING.'],
    ['kenji', '...No.'],
    ['kenji', 'No, no, no — the fingers. He fed Megumi the fingers.'],
    { who: 'sys', t: 'RUN.' }
  ],
  boss: [{ eid: 'sukunaMegumi', pre: [
    { who: 'narr', t: 'Megumi Fushiguro turns around with somebody else’s markings on his face and somebody else’s smile underneath them.' },
    ['narr', '"Ah. The little administrator."'],
    ['kenji', 'Get out of him.'],
    ['narr', '"He invited me. Technically. Legally, even — you would appreciate the wording."'],
    ['narr', '"And he is still in here, watching. I made sure of that part."'],
    ['kenji', 'Orange.'],
    ['orange', 'yeah'],
    ['kenji', 'Log everything. I’m going to need to put him back exactly how he was.']
  ] }],
  outro: [
    { who: 'narr', t: 'Sukuna withdraws rather than loses, which is a distinction he makes very clearly before he goes.' },
    ['narr', '"You cannot format me out of this one, boy. Delete this body and you delete your friend with it."'],
    ['kenji', '...'],
    ['narr', '"THAT is the move. Do you see it? I found the one line of code you will not touch."'],
    { who: 'narr', t: 'He walks away wearing Megumi Fushiguro, and Kenji Sato lets him, because the alternative is worse.' },
    ['orange', 'kenji'],
    ['kenji', 'Don’t.'],
    ['orange', 'kenji you did the right thing'],
    ['kenji', 'I know. I hate it. Go get the box.'],
    { fn: () => { G.flags.sukuna_megumi = true; } }
  ] }),

M({ id: 'unseal', title: 'Nineteen Days', area: 'tengen', minLv: 51,
  objective: 'Open the box.', xp: 2200, money: 3000,
  spawn: [320, 400], tx: 480,
  intro: [
    { who: 'narr', t: 'Tengen’s chamber. A plain black cube on the floor, an angel with her arms crossed, and everyone who is left standing in a circle around both.' },
    ['narr', '"Jacob’s Ladder erases techniques. The Prison Realm IS a technique."'],
    ['kenji', 'And Null sets values to zero. If we hit it together, from both sides —'],
    ['narr', '"— then the seal has to be two things at once and it cannot be."'],
    ['kenji', 'Orange. On three.'],
    ['orange', 'kenji ive been ready for nineteen days'],
    { who: 'sys', t: 'Approach the Prison Realm.' }
  ],
  pre: [
    { fn: () => { Audio.stop(); Audio.sfx('domainbreak'); FX.flash('#fff', .8, 1); FX.shake(18, 2); } },
    { wait: 1.0 },
    { who: 'sys', t: 'PRISON REALM: VALUE SET TO ZERO.\nCONTENTS RELEASED.' },
    { who: 'narr', t: 'The cube comes apart like a dropped idea.' },
    ['gojoe', '"...Nineteen days."'],
    ['gojoe', '"Nineteen days in a box and the FIRST thing I see is you lot looking like that."'],
    ['kenji', 'Gojo.'],
    ['gojoe', '"Hey, kiddo."'],
    ['gojoe', '"You got taller."'],
    ['kenji', 'You got sealed.'],
    ['gojoe', '"I DID get sealed, yeah."'],
    { who: 'narr', t: 'He looks around the room, counts the people in it, and notices who is not there.' },
    ['gojoe', '"...Where is Megumi."'],
    ['kenji', '...'],
    ['gojoe', '"Kenji. Where is Megumi."'],
    ['kenji', 'Sukuna is wearing him.'],
    { who: 'narr', t: 'For about four seconds, the strongest sorcerer alive says nothing at all.' },
    ['gojoe', '"Right."'],
    ['gojoe', '"Then let’s go and get him back. One quick spar first — I want to see what you learned while I was in the box."']
  ],
  boss: [{ eid: 'gojoVsSukuna', opts: { intro: '* GOJO wants to see Chapter 2 Kenji.' } }],
  outro: [
    ['gojoe', '"...Okay. Okay! You are genuinely frightening now."'],
    ['kenji', 'I built a second domain.'],
    ['gojoe', '"You WHAT."'],
    ['kenji', 'I can hold both at once. Sandbox writes the rules, 404 formats whatever is standing in them.'],
    ['gojoe', '"Kiddo, nobody in recorded history —"'],
    ['kenji', 'I know. I checked. Twice.'],
    ['gojoe', '"December 24th. Shinjuku. He has already picked the spot."'],
    ['gojoe', '"I go first. You are my second. Deal?"'],
    ['kenji', 'Deal.'],
    { fn: () => { G.flags.gojo_free = true; giveSkin('sixeyes'); } },
    { who: 'sys', t: 'SKIN UNLOCKED: SIX EYES UNSEALED [MYTHIC]' }
  ] }),

M({ id: 'showdown', title: 'Shinjuku Showdown', area: 'shinjuku_showdown', minLv: 53,
  objective: 'December 24th. The strongest, against the King.', xp: 3000, money: 4000,
  spawn: [70, 370],
  ents: [{ type: 'save', x: 200, y: 370 }],
  intro: [
    { who: 'narr', t: 'DECEMBER 24TH. SHINJUKU.' },
    { who: 'narr', t: 'The two strongest things that have ever existed are standing four hundred metres apart in a city that has been evacuated for them, and everyone else is here to watch and to be useful afterwards.' },
    ['gojoe', '"Kenji. Barrier’s mine. You stay outside it until I say."'],
    ['kenji', 'And if you lose?'],
    ['gojoe', '"...Then you were always going to be the one who finished this. You know that, right?"'],
    ['kenji', 'Yeah.'],
    ['gojoe', '"Good. See you in a minute."'],
    { who: 'sys', t: 'Save first. Then go east.' }
  ],
  boss: [{ eid: 'sukunaMegumi', opts: { hpScale: 1.1 }, pre: [
    { who: 'narr', t: 'For six minutes, Satoru Gojo and Ryomen Sukuna fight at a level the rest of the world can only measure afterwards by what is missing.' },
    { who: 'narr', t: 'And then the King of Curses finds the one angle that works, and the sound Shinjuku makes is not a sound anyone wants to describe.' },
    ['gojoe', '"...Huh."'],
    ['gojoe', '"Nah. I’d win."'],
    { who: 'narr', t: 'He does not.' },
    { fn: () => { Audio.stop(); Audio.sfx('death'); FX.flash('#fff', .6, 1); FX.shake(16, 2); } },
    { wait: 1.2 },
    ['kenji', '...'],
    ['kenji', 'Orange.'],
    ['orange', 'kenji'],
    ['kenji', 'Pull his backup.'],
    ['orange', '...'],
    ['kenji', 'ORANGE. PULL HIS BACKUP.'],
    ['orange', 'kenji theres nothing to pull.'],
    ['orange', 'he didnt get corrupted. he didnt get deleted. he FINISHED.'],
    ['orange', 'thats not an error. i cant fix a thing that isnt broken.'],
    { who: 'narr', t: 'Kenji Sato stands in the snow in Shinjuku and discovers the one thing in the universe that is not editable.' },
    ['sukuna', '"Your turn, administrator."']
  ] }],
  outro: [
    { who: 'narr', t: 'Sukuna withdraws into the ruins to reset, the way a thing with a thousand years does when it has all the time it needs.' },
    ['kenji', 'He bought us eleven minutes.'],
    ['narr', '"...Who did?"'],
    ['kenji', 'Gojo. Before. He broke Sukuna’s left side and never told him.'],
    ['kenji', 'He did the maths while he was dying so that we’d have eleven minutes.'],
    { who: 'narr', t: 'Nobody says anything for a while.' },
    ['kenji', 'Right. Everybody who can still stand, listen to me, because I only want to say this once.'],
    { fn: () => { G.flags.gojo_dead = true; } }
  ] }),

M({ id: 'lastline', title: 'The Last Line', area: 'shinjuku_showdown', minLv: 57,
  objective: 'Everyone who is left. All at once.', xp: 3600, money: 5000,
  spawn: [70, 370],
  ents: [
    { type: 'npc', x: 300, y: 350, spr: 'yuta', name: 'YUTA', u: 3, col: '#9fe8ff',
      lines: [['narr', '"I will copy whatever you need me to copy. Say the word and I will be whatever technique you are missing."']] },
    { type: 'npc', x: 420, y: 370, spr: 'maki', name: 'MAKI', u: 3, col: '#8fd9a8',
      lines: [['narr', '"No cursed energy at all. He will not see me coming until I am already there. Ask Toji."']] },
    { type: 'npc', x: 540, y: 350, spr: 'higuruma', name: 'HIGURUMA', u: 3, col: '#c9a227',
      lines: [['narr', '"I will open the court on him. It will not hold. It only has to hold for four seconds."']] },
    { type: 'npc', x: 660, y: 370, spr: 'kashimo', name: 'KASHIMO', u: 3, col: '#7fd9ff',
      lines: [['narr', '"Four hundred years, boy. Do not you dare finish him before I get my turn."']] }
  ],
  intro: [
    { who: 'narr', t: 'Eleven minutes. Six sorcerers. One King.' },
    ['kenji', 'Here’s the plan and it’s a bad plan.'],
    ['kenji', 'Kashimo goes first because he’s been waiting four hundred years and he’ll be insufferable otherwise.'],
    ['narr', '"CORRECT."'],
    ['kenji', 'Maki second — he can’t sense her. Higuruma opens the court for four seconds in the gap. Yuta copies whatever we lose.'],
    ['kenji', 'Yuji takes the hit that has to be taken, because he always does.'],
    ['yuji', 'Yeah.'],
    ['kenji', 'And then I format what’s left. But not the body. Never the body.'],
    { who: 'sys', t: 'Talk to everyone, then head east together.' }
  ],
  boss: [{ eid: 'sukunaMegumi', opts: { hpScale: 1.3 }, pre: [
    ['narr', '"All of you at once, then. How efficient."'],
    ['kenji', 'Orange.'],
    ['orange', 'yeah?'],
    ['kenji', 'Binding vow. Half my max HP for the rest of today.'],
    ['orange', '...kenji'],
    ['kenji', 'Sign it.'],
    { fn: () => { Audio.sfx('charge'); FX.flash('#ff3b3b', .4, .7); } },
    { who: 'sys', t: 'BINDING VOW ACCEPTED. OUTPUT TRIPLED.' }
  ] }],
  outro: [
    { who: 'narr', t: 'Kashimo does not get up. Higuruma’s court closes for the last time. Maki is still standing, barely, which is somehow the least surprising thing about today.' },
    ['kenji', 'He’s down to the shikigami. He’s going to summon it.'],
    ['narr', '"The one that adapts?"'],
    ['kenji', 'The one that adapts.'],
    ['orange', 'kenji it adapted to NULL last time'],
    ['kenji', 'Last time I was twenty.'],
    { fn: () => { G.flags.lastline = true; } }
  ] }),

M({ id: 'mahoraga2', title: 'The Wheel', area: 'shinjuku_showdown', minLv: 58,
  objective: 'It has adapted to everything. Including you.', xp: 4000, money: 5600,
  spawn: [70, 370],
  intro: [
    { who: 'narr', t: 'The wheel on its head has not stopped turning since Shibuya, and it has had a very long time to think about Kenji Sato.' },
    ['orange', 'kenji its already adapted. it adapted BEFORE you hit it. it adapted to the IDEA of you.'],
    ['kenji', 'Then I stop being an idea it’s seen.'],
    ['kenji', 'Every attack, different branch. Null, Solver, Copy, Lag, Flip, in an order it can’t predict — because I’m going to pick them at random.'],
    ['orange', 'you? at RANDOM? you have never done anything at random in your LIFE'],
    ['kenji', 'I know. That’s why it won’t see it coming.'],
    { who: 'sys', t: 'Vary your techniques. Repeating yourself lets it adapt.' }
  ],
  boss: [{ eid: 'mahoragaFinal', pre: [
    { who: 'narr', t: 'DIVINE GENERAL MAHORAGA. Final adaptation.' },
    ['narr', 'The wheel turns one notch and the air where you were standing stops existing.']
  ] }],
  outro: [
    { who: 'narr', t: 'The wheel stops. It does not fall so much as it concludes.' },
    ['kenji', '*coughing* Orange. Status.'],
    ['orange', 'kenji youre at eleven percent and you signed away half your max. please stop.'],
    ['kenji', 'One more.'],
    ['orange', 'KENJI.'],
    ['kenji', 'One more, Orange. He’s out of cards. That’s all of them. He has nothing left but himself.'],
    { fn: () => { G.flags.mahoraga_down = true; } }
  ] }),

M({ id: 'finale', title: 'Delete The Save File', area: 'shinjuku_showdown', minLv: 60,
  objective: 'The King of Curses. No shikigami, no vessel, no tricks.', xp: 9000, money: 12000,
  spawn: [70, 370], tx: 1100,
  ents: [{ type: 'save', x: 180, y: 370 }],
  intro: [
    { who: 'narr', t: 'Sukuna steps out of Megumi Fushiguro the way a man steps out of a coat, because the coat is finished and he has somewhere to be.' },
    { who: 'narr', t: 'His true form unfolds in the snow. Four arms. Two faces. A thousand years with nothing in front of it any more except a twelve-year-old and a pumpkin.' },
    ['sukuna', '"Boy."'],
    ['kenji', 'Yeah.'],
    ['sukuna', '"In a thousand years, you are the first thing I could not read."'],
    ['kenji', 'Funny. You’re the first thing I could.'],
    ['sukuna', '"Then let us both be wrong about each other one last time."'],
    ['orange', 'kenji'],
    ['kenji', 'I know.'],
    ['orange', 'no listen. i have been holding something back since shibuya.'],
    ['orange', 'the engine file. all of it. not a hundred black flashes — the WHOLE THING.'],
    ['kenji', 'Will it kill me?'],
    ['orange', '...probably not.'],
    ['kenji', 'Good enough. Save your game first, by the way.'],
    { who: 'sys', t: 'FINAL BATTLE. Save at the point, then go east.' }
  ],
  boss: [{ eid: 'sukunaFinal', pre: [
    ['sukuna', '"Stand proud, administrator. You are strong."'],
    ['kenji', 'I know.']
  ] }],
  outro: [
    { fn: () => { FX.orangeFlash(W / 2, 230, {}); G.orangeFlashes++; } },
    { wait: 3.4 },
    { who: 'narr', t: 'The last thing Ryomen Sukuna ever sees is a hand sign shaped like a power button.' },
    { fn: () => { FX.domainExpansion(DOMAINS.void404, { x: W / 2, y: 240 }); } },
    { wait: 4.4 },
    { who: 'sys', t: 'ERROR 404: COSMOS FORMAT\nTARGET: RYOMEN SUKUNA\n3s — SENSES REVOKED\n10s — TECHNIQUE UNINSTALLED\n20s — FORM REDUCED TO WIREFRAME' },
    { who: 'narr', t: 'At twenty-eight seconds, the King of Curses does something nobody has ever recorded him doing. He stops fighting it.' },
    ['sukuna', '"...Heh."'],
    ['sukuna', '"A thousand years, and it is a child with a vegetable."'],
    ['sukuna', '"Fine. FINE. Take it."'],
    { who: 'sys', t: '30s — FORMAT COMPLETE.\nNO REMAINS. NO FRAGMENTS. NO BINDING VOW THIS TIME.' },
    { fn: () => { Audio.stop(); Audio.sfx('shatter'); FX.flash('#fff', .7, 1); } },
    { wait: 1.2 },
    { who: 'narr', t: 'The snow comes back first. Then the noise of a city that does not know it was about to end.' },
    ['kenji', 'Megumi.'],
    { who: 'narr', t: 'Megumi Fushiguro is lying in the crater with nobody else inside him for the first time in weeks.' },
    ['kenji', 'Orange. Pull his backup. All of it. Every byte.'],
    ['orange', 'already pulling'],
    { fn: () => { Audio.sfx('orangeheal'); FX.flash(PAL.orange, .6, .8); } },
    ['megumi', '*coughing* ...Kenji?'],
    ['kenji', 'Hey.'],
    ['megumi', 'Did I —'],
    ['kenji', 'No. He did. You were a hostage, not a weapon. I logged the whole thing, and I’ll tell anyone who asks.'],
    ['yuji', 'MEGUMI!'],
    { who: 'narr', t: 'And that is the Culling Game over, three days early, by a player who read rule ten, wrote a new rule, and used it to end the game.' },
    { who: 'sys', t: 'RULE 11, ADDED BY PLAYER SATO, KENJI:\n"THIS GAME IS OVER."' },
    ['orange', 'kenji'],
    ['kenji', 'Yeah?'],
    ['orange', 'your battery is at four percent'],
    ['kenji', '...Take me home, Orange.'],
    { fn: () => { G.flags.ch2_done = true; giveSkin('king'); giveEmote('voidstare'); G.save(); } }
  ] })

];



/* ===========================================================
   CHAPTER REGISTRY
   =========================================================== */
const CHAPTERS = [
  { n: 1, title: "The Strongest's Student", sub: 'From the Shibuya subway to the King of Curses.', missions: MISSIONS },
  { n: 2, title: 'The Culling Game',        sub: 'Nineteen days, ten rules, and one of them is write access.', missions: CHAPTER2 }
];
