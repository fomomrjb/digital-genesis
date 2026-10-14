/* ===========================================================
   DIGITAL GENESIS — enemies.js
   Enemy stats, bullet-pattern playlists, barks, boss phases
   =========================================================== */
'use strict';

/* pattern ids are implemented in battle.js :: runPattern() */
const ENEMIES = {
  /* ---------- fodder ---------- */
  grade4: {
    name: 'Grade 4 Curse', spr: 'curseBlob', hp: 40, atk: 7, def: 1, xp: 26, money: 55,
    scale: 3, patterns: ['bullets', 'homing'], music: 'battle', grade: '4',
    check: 'A badly coded program. 40 HP. It smells like a wet gym bag.',
    barks: ['*gurgling*', 'The curse wobbles menacingly.', 'It tries to look big.'],
    spareAt: .3
  },
  swarm: {
    name: 'Curse Swarm', spr: 'curseBug', hp: 60, atk: 8, def: 2, xp: 40, money: 80,
    scale: 3, patterns: ['bugs', 'bullets'], music: 'battle', grade: '4',
    check: 'Several small curses pretending to be one big curse.',
    barks: ['*skittering*', 'They are arguing about who leads.', 'Chitter chitter.']
  },
  grade2: {
    name: 'Grade 2 Curse', spr: 'curseBlob', hp: 110, atk: 12, def: 4, xp: 85, money: 150,
    scale: 4, patterns: ['bullets', 'homing', 'rain'], music: 'battle', grade: '2',
    check: '110 HP. Actually finished its tutorial, unlike the last one.',
    barks: ['It roars with real weight.', 'The air gets heavy.', '*SHRIEK*']
  },
  grade1: {
    name: 'Grade 1 Curse', spr: 'curseBig', hp: 210, atk: 17, def: 7, xp: 180, money: 300,
    scale: 4, patterns: ['cleave', 'rain', 'homing', 'spin'], music: 'battle', grade: '1',
    check: 'Grade 1. 210 HP. It has a mouth where a mouth should not be.',
    barks: ['It grins with a hundred teeth.', 'The floor cracks under it.', '*ROAAAR*']
  },
  fingerBearer: {
    name: 'Finger Bearer', spr: 'curseBig', hp: 300, atk: 20, def: 9, xp: 240, money: 420,
    scale: 5, patterns: ['cleave', 'spin', 'rain', 'grid'], music: 'boss', grade: 'SP',
    check: 'It swallowed one of Sukuna\'s fingers. The finger is doing the thinking.',
    barks: ['The finger pulses.', 'It moves like something else is driving.', '*WET GURGLE*']
  },
  specialSubway: {
    name: 'Special Grade Curse', spr: 'curseBig', hp: 100, atk: 22, def: 6, xp: 150, money: 200,
    scale: 5, patterns: ['cleave', 'rain', 'homing'], music: 'boss', grade: 'SP',
    check: 'Special Grade. 100 HP. It is killing everyone in this station. ...It is also very poorly coded.',
    barks: ['It tears a pillar out of the ceiling.', 'Screaming echoes down the platform.', '*HOWLING*'],
    tutorial: true
  },

  /* ---------- orange challenge targets ---------- */
  dummy: {
    name: 'Training Dummy', spr: 'curseBlob', hp: 999, atk: 0, def: 0, xp: 5, money: 5,
    scale: 3, patterns: [], music: 'battle', grade: 'T',
    check: 'A straw dummy. Orange drew a face on it. The face is rude.',
    barks: ['The dummy says nothing.', 'Orange is holding it upright.', 'It judges your combo timing.'],
    noDeath: true
  },
  droneSwarm: {
    name: 'Orange Target Drones', spr: 'curseBug', hp: 320, atk: 14, def: 3, xp: 150, money: 260,
    scale: 3, patterns: ['bullets', 'grid', 'laser', 'spin'], music: 'orange', grade: 'C',
    check: 'Orange spawned these out of Creative Mode. He insists they are "legally distinct".',
    barks: ['ORANGE: "dodge this one!! DODGE IT"', 'The drones re-render.', 'ORANGE: "im not even trying yet"']
  },

  /* ---------- named ---------- */
  todo: {
    name: 'Aoi Todo', spr: 'todo', hp: 360, atk: 19, def: 8, xp: 300, money: 500,
    scale: 4, patterns: ['cleave', 'homing', 'spin'], music: 'boss', grade: '1',
    check: 'Grade 1 sorcerer. 360 HP. Will ask you about your type of woman mid-swing.',
    barks: ['"WHAT KIND OF WOMAN IS YOUR TYPE?"', '"Boogie Woogie."', '"My brother!!"'],
    friendly: true, spareAt: .35
  },
  hanami: {
    name: 'Hanami', spr: 'hanami', hp: 520, atk: 22, def: 12, xp: 420, money: 700,
    scale: 5, patterns: ['thorns', 'rain', 'homing', 'grid'], music: 'boss', grade: 'SP',
    check: 'Special Grade. 520 HP. It wants the humans gone so the forest can breathe.',
    barks: ['"...Jujutsu sorcerer."', 'Wooden branches creak outward.', 'Flower buds open — poison.'],
    phases: [{ at: .5, bark: 'Hanami hardens its bark. Defence up.', buff: { def: 6 } }]
  },
  jogo: {
    name: 'Jogo', spr: 'jogo', hp: 500, atk: 26, def: 10, xp: 400, money: 680,
    scale: 5, patterns: ['fire', 'rain', 'homing'], music: 'boss', grade: 'SP',
    check: 'Special Grade. 500 HP. Claims to be as strong as Hanami. Nobody agrees.',
    barks: ['"Insolent monkey."', 'The air shimmers at 200°C.', '"I will erase this city."'],
    phases: [{ at: .4, bark: 'Jogo prepares MAXIMUM: METEOR.', pattern: 'meteor' }]
  },
  dagon: {
    name: 'Dagon', spr: 'dagon', hp: 560, atk: 24, def: 11, xp: 430, money: 720,
    scale: 5, patterns: ['water', 'homing', 'grid'], music: 'boss', grade: 'SP',
    check: 'Special Grade. 560 HP. Newly born. Already drowning a whole district.',
    barks: ['"...Shikigami."', 'Water rises out of nothing.', 'Death Swarm: fish.'],
    domain: 'selfembodiment'
  },
  mahito: {
    name: 'Mahito', spr: 'mahito', hp: 650, atk: 25, def: 10, xp: 520, money: 900,
    scale: 5, patterns: ['hands', 'homing', 'bugs', 'grid'], music: 'shibuya', grade: 'SP',
    check: 'Special Grade. 650 HP. Souls are toys to him. Your soul is a toy he cannot open.',
    barks: ['"A child? Jujutsu High must be desperate!"', '"Let me see what shape your soul takes!"',
            '"Idle Transfiguration!"'],
    phases: [
      { at: .6, bark: 'Mahito scatters into a swarm of insects.', pattern: 'bugs' },
      { at: .3, bark: 'Mahito forms the hand signs inside his mouth.', domain: 'selfembodiment' }
    ]
  },
  mahitoFinal: {
    name: 'Mahito (Perfected)', spr: 'mahito', hp: 560, atk: 32, def: 14, xp: 600, money: 1100,
    scale: 5, patterns: ['hands', 'grid', 'cleave'], music: 'shibuya', grade: 'SP',
    check: 'He has shed everything unnecessary. 560 HP of pure transfiguration.',
    barks: ['"I understand now. You are not changing the body."', '"You interrupt the connection!"',
            '"I will become perfect!"']
  },
  gojoSpar: {
    name: 'Satoru Gojo', spr: 'gojo', hp: 360, atk: 26, def: 10, xp: 700, money: 1200,
    scale: 5, patterns: ['purple', 'homing', 'laser', 'grid'], music: 'boss', grade: 'SP',
    check: 'The strongest. Infinity means you cannot touch him. ...Unless you turn the rule off.',
    barks: ['"Go ahead. Try to touch me."', '"Nah, Infinity."', '"Hollow Technique: Purple."'],
    infinity: true, sparring: true, endAt: .55,
    phases: [
      { at: .8, bark: 'Gojo pulls the blindfold off. Six Eyes.', swap: 'gojoEyes' },
      { at: .5, bark: 'Gojo forms a one-handed sign.', domain: 'infinitevoid' }
    ]
  },
  sukuna: {
    name: 'Ryomen Sukuna', spr: 'sukuna', hp: 1500, atk: 38, def: 18, xp: 2000, money: 3000,
    scale: 6, patterns: ['cleave', 'slashrain', 'fuga', 'spin', 'grid'], music: 'sukuna', grade: 'SP+',
    check: 'The King of Curses. 1500 HP. A thousand years of winning. He is already bored of you.',
    barks: ['"Is that your best attack?"', '"Stand proud. You are strong."', '"Cleave."', '"Dismantle."',
            '"A child cannot rewrite the King."'],
    phases: [
      { at: .72, bark: 'Sukuna stops smiling. "Enough games."', buff: { atk: 6 } },
      { at: .45, bark: 'Sukuna brings his hands together.', domain: 'shrine' },
      { at: .18, bark: 'Sukuna uses a binding vow. His output doubles.', buff: { atk: 10, def: 6 } }
    ]
  },
  /* ===== Chapter 1 additions ===== */
  junpeiMahito: {
    name: 'Mahito (Theatre)', spr: 'mahito', hp: 240, atk: 18, def: 6, xp: 260, money: 380,
    scale: 5, patterns: ['hands', 'homing'], music: 'shibuya', grade: 'SP',
    check: 'He is not fighting you. He is showing you something he made.',
    barks: ['"Do you like him? I made him myself."', '"Souls are so easy to fold."', '"Junpei. Say hello."']
  },
  eso: {
    name: 'Eso & Kechizu', spr: 'curseBig', hp: 300, atk: 19, def: 8, xp: 320, money: 480,
    scale: 4, patterns: ['rain', 'homing', 'bugs'], music: 'battle', grade: '1',
    check: 'Death Painting Wombs. Brothers. Their blood is poison and they are very proud of that.',
    barks: ['"Brother, it is a child."', '"Decay."', '"Our blood will rot you from inside."']
  },
  choso: {
    name: 'Choso', spr: 'curseBig', hp: 420, atk: 23, def: 11, xp: 420, money: 620,
    scale: 5, patterns: ['cleave', 'homing', 'rain', 'spin'], music: 'boss', grade: 'SP',
    check: 'The eldest Death Painting. He just watched you kill his brothers.',
    barks: ['"Blood Manipulation: Piercing Blood."', '"You took my brothers."', '"Convergence."'],
    phases: [{ at: .4, bark: 'Choso turns his own blood supersonic.', buff: { atk: 6 } }]
  },
  mechamaru: {
    name: 'Mechamaru', spr: 'curseBig', hp: 380, atk: 21, def: 14, xp: 380, money: 560,
    scale: 5, patterns: ['laser', 'grid', 'rain'], music: 'boss', grade: '1',
    check: 'A puppet piloted from a hospital bed. The body is scrap. The aim is not.',
    barks: ['"Ultimate Mechamaru: Mode - Absolute."', '"I made a deal with a curse."', '"Forgive me."']
  },
  toji: {
    name: 'Toji Fushiguro', spr: 'toji', hp: 560, atk: 30, def: 12, xp: 700, money: 1000,
    scale: 5, patterns: ['cleave', 'spin', 'homing', 'slashrain'], music: 'boss', grade: '??',
    check: 'No cursed energy at all. Zero. The Heavenly Restriction gave him everything else.',
    barks: ['"Sorcerer Killer."', '"Playful Cloud."', '"You read data? I read bodies."'],
    phases: [{ at: .45, bark: 'Toji pulls the Inverted Spear of Heaven.', buff: { atk: 8 } }]
  },
  getoPast: {
    name: 'Suguru Geto', spr: 'geto', hp: 520, atk: 26, def: 13, xp: 640, money: 900,
    scale: 5, patterns: ['homing', 'rain', 'bugs', 'grid'], music: 'boss', grade: 'SP',
    check: 'Curse Manipulation. He is carrying a thousand curses and all of his certainty.',
    barks: ['"Are monkeys worth protecting?"', '"Uzumaki."', '"Night Parade of a Hundred Demons."']
  },
  yutaDuel: {
    name: 'Yuta Okkotsu', spr: 'yuta', hp: 620, atk: 28, def: 14, xp: 800, money: 1200,
    scale: 5, patterns: ['cleave', 'purple', 'homing', 'grid'], music: 'boss', grade: 'SP',
    check: 'Special grade. Copies techniques, carries a cursed spirit that loved him, and was sent here to execute a friend.',
    barks: ['"I was ordered to execute Yuji Itadori."', '"Rika."', '"Pure Love Whip."'],
    friendly: true, spareAt: .3,
    phases: [{ at: .5, bark: 'Rika manifests behind him.', buff: { atk: 7 } }]
  },
  nobaraFight: {
    name: 'Grade 1 Curse (Shibuya)', spr: 'curseBig', hp: 320, atk: 22, def: 9, xp: 340, money: 520,
    scale: 4, patterns: ['cleave', 'rain', 'homing'], music: 'shibuya', grade: '1',
    check: 'One of hundreds let in through the curtain tonight.',
    barks: ['*screaming from the platform*', 'It is feeding.', '*SHRIEK*']
  },
  jogoShibuya: {
    name: 'Jogo (Enraged)', spr: 'jogo', hp: 620, atk: 30, def: 12, xp: 620, money: 900,
    scale: 5, patterns: ['fire', 'meteor', 'rain', 'homing'], music: 'shibuya', grade: 'SP',
    check: 'He has stopped posturing. This is everything he has.',
    barks: ['"MAXIMUM: METEOR."', '"BURN."', '"I will not be looked down on again."']
  },
  mahoragaC1: {
    name: 'Divine General Mahoraga', spr: 'mahoraga', hp: 900, atk: 34, def: 20, xp: 1400, money: 2200,
    scale: 6, patterns: ['cleave', 'spin', 'slashrain', 'grid'], music: 'sukuna', grade: 'SP+',
    check: 'The Ten Shadows\' last resort. It adapts to anything that hits it. Anything.',
    barks: ['The wheel on its head turns one notch.', 'It has already seen that attack.', 'It adapts.'],
    phases: [
      { at: .66, bark: 'The wheel turns. It has adapted to your technique.', buff: { def: 8 } },
      { at: .33, bark: 'The wheel turns again. World-Cutting Slash.', buff: { atk: 10 } }
    ]
  },

  /* ===== Chapter 2 : the Culling Game ===== */
  reggie: {
    name: 'Reggie Star', spr: 'reggie', hp: 520, atk: 24, def: 11, xp: 600, money: 900,
    scale: 5, patterns: ['rain', 'homing', 'grid', 'laser'], music: 'boss', grade: '1',
    check: 'Turns receipts into whatever was printed on them. A man who weaponised paperwork.',
    barks: ['"Everything has a price, kid."', '"I bought a car this morning."', '"Receipts never lie."']
  },
  charles: {
    name: 'Charles Bernard', spr: 'charles', hp: 460, atk: 25, def: 10, xp: 520, money: 800,
    scale: 5, patterns: ['cleave', 'homing', 'spin'], music: 'battle', grade: '1',
    check: 'He can see your next three seconds drawn as manga panels. He is also just a guy who wants to finish his series.',
    barks: ['"I can see your next panel."', '"My serialisation depends on this!"', '"Draw!"'],
    friendly: true, spareAt: .35
  },
  kirara: {
    name: 'Kirara Hoshi', spr: 'kirara', hp: 480, atk: 22, def: 12, xp: 560, money: 860,
    scale: 5, patterns: ['grid', 'homing', 'spin', 'laser'], music: 'boss', grade: '1',
    check: 'Love Rendezvous. Everything they touch gets magnetised to everything else. Hakari\'s partner, and extremely not interested in you.',
    barks: ['"Do NOT scuff the floor."', '"Love Rendezvous."', '"Hakari, this one is rude."'],
    friendly: true, spareAt: .3
  },
  hakari: {
    name: 'Kinji Hakari', spr: 'hakari', hp: 900, atk: 30, def: 15, xp: 1400, money: 2000,
    scale: 5, patterns: ['cleave', 'spin', 'homing', 'grid'], music: 'boss', grade: 'SP',
    check: 'Special grade. Infinite cursed energy and immortality for 4 minutes 11 seconds \u2014 if the machine pays out.',
    barks: ['"Let\'s gamble!"', '"Domain Expansion: Idle Death Gamble."', '"JACKPOT!"'],
    domain: 'purelove',
    phases: [
      { at: .6, bark: 'Hakari throws the shutter. The reels start spinning.', domain: 'purelove' },
      { at: .3, bark: 'JACKPOT. He is unkillable for the next four minutes.', buff: { atk: 10, def: 10 } }
    ]
  },
  higuruma: {
    name: 'Hiromi Higuruma', spr: 'higuruma', hp: 760, atk: 28, def: 14, xp: 1100, money: 1700,
    scale: 5, patterns: ['grid', 'cleave', 'laser', 'homing'], music: 'boss', grade: 'SP',
    check: 'Awakened three weeks ago. Already has a domain. Inside it, the court decides what you deserve.',
    barks: ['"Domain Expansion: Deadly Sentencing."', '"The defendant will be seated."', '"Judgeman."'],
    domain: 'judgeman',
    phases: [{ at: .5, bark: 'Higuruma opens the trial.', domain: 'judgeman' }]
  },
  takaba: {
    name: 'Fumihiko Takaba', spr: 'takaba', hp: 999, atk: 20, def: 5, xp: 900, money: 1500,
    scale: 5, patterns: ['bullets', 'homing', 'spin'], music: 'orange', grade: '??',
    check: 'Whatever he finds funny becomes real. There is no counter to this. There is only playing along.',
    barks: ['"Is this a bit? Is this a bit??"', '"COMEDY."', '"Wait, wait, I have one \u2014"'],
    friendly: true, spareAt: .5
  },
  kashimo: {
    name: 'Hajime Kashimo', spr: 'kashimo', hp: 1050, atk: 34, def: 16, xp: 1800, money: 2600,
    scale: 5, patterns: ['laser', 'grid', 'spin', 'homing', 'cleave'], music: 'boss', grade: 'SP',
    check: 'Four hundred years old. Reincarnated to find a fight worth having. Electricity, and a very low opinion of everyone.',
    barks: ['"Mythical Beast Amber."', '"Are you the strongest?"', '"Four hundred years and still bored."'],
    phases: [{ at: .4, bark: 'Kashimo discharges everything at once.', buff: { atk: 10 } }]
  },
  uro: {
    name: 'Takako Uro', spr: 'kirara', hp: 640, atk: 27, def: 13, xp: 820, money: 1200,
    scale: 5, patterns: ['cleave', 'spin', 'grid'], music: 'boss', grade: 'SP',
    check: 'A thousand-year-old sorcerer who treats the sky itself as a surface she can hit you with.',
    barks: ['"Sky Manipulation."', '"You are very new."', '"Thin Ice Breaker."']
  },
  ryu: {
    name: 'Ryu Ishigori', spr: 'curseBig', hp: 700, atk: 31, def: 12, xp: 900, money: 1300,
    scale: 6, patterns: ['laser', 'meteor', 'rain'], music: 'boss', grade: 'SP',
    check: 'Output. That is the whole technique. Just an enormous amount of output.',
    barks: ['"GRANITE BLAST."', '"MORE."', '"Is that all you have?"']
  },
  angel: {
    name: 'Angel (Hana Kurusu)', spr: 'angel', hp: 820, atk: 29, def: 15, xp: 1300, money: 1900,
    scale: 5, patterns: ['laser', 'rain', 'homing', 'grid'], music: 'boss', grade: 'SP',
    check: 'A sorcerer from a thousand years ago riding in a schoolgirl. Her technique erases cursed techniques outright.',
    barks: ['"Jacob\'s Ladder."', '"You are an abomination, little administrator."', '"I can undo the Prison Realm."'],
    friendly: true, spareAt: .3
  },
  sukunaMegumi: {
    name: 'Sukuna (Megumi\'s Body)', spr: 'megumiSukuna', hp: 1600, atk: 38, def: 20, xp: 3000, money: 4200,
    scale: 6, patterns: ['cleave', 'slashrain', 'spin', 'grid', 'fuga'], music: 'sukuna', grade: 'SP+',
    check: 'He is wearing your friend. The Ten Shadows answer to him now.',
    barks: ['"The brat is still in here. He is watching."', '"Cleave."', '"Divine Dogs."'],
    phases: [
      { at: .7, bark: 'Sukuna calls the Ten Shadows.', buff: { atk: 6 } },
      { at: .4, bark: 'Sukuna brings his hands together.', domain: 'shrine' },
      { at: .2, bark: '"Enough. I will use the brat\'s last card."', buff: { atk: 10, def: 8 } }
    ]
  },
  gojoVsSukuna: {
    name: 'Satoru Gojo (Unsealed)', spr: 'gojoEyes', hp: 1200, atk: 34, def: 18, xp: 2200, money: 3000,
    scale: 5, patterns: ['purple', 'laser', 'grid', 'homing'], music: 'boss', grade: 'SP+',
    check: 'Nineteen days in a box and he came out smiling. He wants to see how far you have come.',
    barks: ['"Hollow Technique: Purple."', '"Nah, I\'d win."', '"Show me, kiddo."'],
    sparring: true, endAt: .5, friendly: true,
    phases: [{ at: .7, bark: 'Gojo expands Unlimited Void.', domain: 'infinitevoid' }]
  },
  sukunaFinal: {
    name: 'Ryomen Sukuna (True Form)', spr: 'sukuna', hp: 2400, atk: 42, def: 24, xp: 6000, money: 9000,
    scale: 6, patterns: ['cleave', 'slashrain', 'fuga', 'spin', 'grid', 'meteor'], music: 'sukuna', grade: 'SP+',
    check: 'Four arms. Two faces. A thousand years. He has stopped being bored.',
    barks: ['"Stand proud. You are strong."', '"Malevolent Shrine."', '"Fuga."', '"Open."'],
    phases: [
      { at: .8, bark: 'Sukuna unfolds his second pair of arms.', buff: { atk: 6 } },
      { at: .55, bark: 'Sukuna expands Malevolent Shrine.', domain: 'shrine' },
      { at: .3, bark: 'Sukuna summons Mahoraga.', buff: { atk: 8, def: 8 } },
      { at: .12, bark: '"...You. You are the first thing in a thousand years I could not read."', buff: { atk: 12 } }
    ]
  },
  kenjakuBoss: {
    name: 'Kenjaku', spr: 'kenjaku', hp: 1400, atk: 33, def: 18, xp: 2600, money: 3800,
    scale: 5, patterns: ['bugs', 'rain', 'homing', 'grid', 'cleave'], music: 'culling', grade: 'SP+',
    check: 'A thousand years of wearing other people. He wrote the rules of the game you are standing in.',
    barks: ['"Hello again, little administrator."', '"Uzumaki."', '"You are the most interesting variable on my board."'],
    phases: [
      { at: .6, bark: 'Kenjaku releases a thousand curses at once.', buff: { atk: 7 } },
      { at: .3, bark: 'Kenjaku uses Geto\'s face to smile at you.', domain: 'selfembodiment' }
    ]
  },
  mahoragaFinal: {
    name: 'Mahoraga (Adapted)', spr: 'mahoraga', hp: 1500, atk: 40, def: 26, xp: 3200, money: 4600,
    scale: 6, patterns: ['cleave', 'spin', 'slashrain', 'grid', 'laser'], music: 'sukuna', grade: 'SP+',
    check: 'It has adapted to every technique used on it today, including yours. The wheel is still turning.',
    barks: ['The wheel turns.', 'It has adapted.', 'World-Cutting Slash.'],
    phases: [{ at: .5, bark: 'It has adapted to Digital Genesis itself.', buff: { def: 12 } }]
  },

  kenjaku: {
    name: '???', spr: 'kenjaku', hp: 1, atk: 0, def: 0, xp: 0, money: 0,
    scale: 5, patterns: [], music: 'culling', grade: '??',
    check: 'The stitched man. You cannot read his data. Something is wrong with the file.',
    barks: ['"Hello, little administrator."']
  }
};
/* enemy techniques referenced by Video Game Copy (things Kenji has witnessed) */
const COPYABLE = [
  { id: 'dismantle', name: 'Cleave / Dismantle', from: 'sukuna', power: 2.2, col: '#ff3b3b',
    jp: '解 / 捌', flavour: 'Neon retro laser cuts. Zero wasted energy.' },
  { id: 'purple', name: 'Hollow Purple', from: 'gojo', power: 3.0, col: '#9b4dff',
    jp: '虚式「茈」', flavour: 'Red times Blue. Imaginary mass, erases on contact.' },
  { id: 'fuga', name: 'Divine Flame', from: 'jogo', power: 2.4, col: '#ff7a2a',
    jp: '蒼炎', flavour: 'A pixel-perfect firestorm.' },
  { id: 'thorns', name: 'Wooden Ravage', from: 'hanami', power: 2.0, col: '#4a7a3a',
    jp: '樹操', flavour: 'Spawned from the ground like level geometry.' },
  { id: 'transfig', name: 'Idle Transfiguration', from: 'mahito', power: 2.3, col: '#ff9ec4',
    jp: '無為転変', flavour: 'You edit the shape, not the soul. Cleaner that way.' },
  { id: 'savestate', name: 'Save / Load', from: 'videogame', power: 0, col: '#ffe14d',
    jp: 'セーブ＆ロード', flavour: 'Rewind your own damage by 5 seconds.', heal: true },
  { id: 'iframes', name: 'Invincibility Frames', from: 'videogame', power: 0, col: '#3ddcff',
    jp: '無敵時間', flavour: 'Air-dash cancel. You simply do not have a hitbox for a bit.', iframe: true },
  { id: 'boogie', name: 'Boogie Woogie', from: 'todo', power: 1.7, col: '#ffd24a',
    jp: 'ブギウギ', flavour: 'Clap. Swap. Punch from where they are not looking.' }
];

function copyableUnlocked() {
  return COPYABLE.filter(c => G.flags['copy_' + c.id]);
}
