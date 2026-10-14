# DIGITAL GENESIS — Chapter 1

A story-driven 8/16-bit jujutsu RPG starring **Kenji Sato**, a twelve-year-old
special grade sorcerer whose brain reads the universe as source code — and
**Orange**, the neon pumpkin with administrator privileges who lives in his soul.

Play it: **https://fomomrjb.github.io/digital-genesis/**

---

## The story

It follows the anime arc by arc, with Kenji written into it.

**Chapter 1 — The Strongest's Student** (22 missions, levels 1-30)
The Shibuya subway awakening · Gojo's rooftop recruitment · Jujutsu High ·
first exorcism · Junpei at the cinema · the Cursed Womb finger bearer ·
Yasohachi Bridge · the Death Painting brothers and Choso · the Kyoto
Goodwill Event · Hanami in the west woods · Mechamaru's betrayal ·
Hidden Inventory and Premature Death as playable flashbacks (Toji, then
Geto) · Yuta's execution order · the Shibuya Incident across five
missions — Jogo, the Prison Realm, Dagon, Nanami's overtime, Mahito —
Sukuna's rampage into Mahoraga · Shinjuku · the Culling Game broadcast.

**Chapter 2 — The Culling Game** (9 missions, levels 31-47)
Tengen and rule ten · Tokyo No.1 with Megumi and Reggie Star · Tokyo No.2
with Charles Bernard, Kirara Hoshi and Kinji Hakari's Idle Death Gamble ·
Sendai with Yuta against Uro and Ryu · Higuruma's courtroom · Takaba ·
Kashimo · and a cliffhanger with a hundred points banked and rule ten
unspent.

Chapter 2 sits behind a spoiler gate on the chapter select, because it
starts after the Shibuya Incident. Material past that point is written
but parked in `CHAPTER2_LOCKED` and deliberately left out of the chapter
registry — nothing from it can appear in game until it is added back.

## Progression

Manga-paced: every arc guarantees the techniques Kenji has in that arc.

| Level | Unlocked |
|---|---|
| 1 | Punch, and the entire **ORANGE Suite** — Creative Mode, Admin Mute, Heal, Survival, Spectator, Teleport, Disguise |
| 2 | CE Strike |
| 3 | **Null** |
| 5 | **Absolute Solver** + passive pixel shielding |
| 8 | **Video Game Copy** |
| 11 | **Lag Spike** |
| 14 | **Asset Flip** |
| 17 | **Black Flash** |
| 20 | **Domain Expansion: Sandbox Mode — Developer Tools** |
| 25 | **Domain Expansion: Error 404 — Cosmos Format** |
| 30 | **Orange Flash** |
| 33-60 | Null Zone · Solver: Skyline · Packet Loss · Soul Trade · Binding Vow: Overclock · **Dual Domain** · Orange Admin Ban · **Orange Flash: Full Release** |

## Systems

**Battle — Deltarune-style.** FIGHT / TECH / ITEM / ACT / DOMAIN / SPARE.
Attacks run a timing bar: stop the marker dead centre, and **the bar gets
faster with every hit you land**. Punch is a 3-hit combo, CE Strike 4, Black
Flash 5, Orange Flash 7. Land a whole combo perfectly and you can proc a
**BLACK FLASH** — full cut-in, red-black lightning, 0.000001s deviation
readout, x2.5 damage.

**Dodging.** The enemy turn is bullet hell inside a soul box. Grazing charges
FOCUS, and FOCUS is what pays for a domain.

Characters fight like themselves. Gojo's Red and Blue drag your soul in and
shove it away; Sukuna rains Malevolent Shrine cleaves and summons Divine Dogs
and Nue once he is wearing Megumi; Mahito throws walls of hands with one gap
and sends hands that chase the soul directly; Hakari floods the box with
bouncing pachinko balls; Higuruma slams a gavel that scatters the verdict;
Kashimo strings a live wire across the arena; Choso fires supersonic piercing
blood; Dagon sends waves with one gap and a death swarm of fish; Hanami drifts
lingering poison; Toji just moves faster than you; Mechamaru paints a targeting
reticle on you before the shell lands; Kirara magnetises you toward a point;
Charles closes the manga panel borders in; Reggie's paper turns into a car
mid-flight; Uro drops the sky; Ryu sweeps one absurd beam; Mahoraga's wheel
spins faster every turn it adapts; and Takaba does whatever he thinks is funny.

**Domains — Hollow Knight-style.** Expanding a barrier switches the game to a
side-view action fight with jumping, dashing, slashes, pogo hits and focus
healing.
*Sandbox Mode* hands you a live developer menu: turn off the enemy's gravity,
set your speed to 1000%, drop render distance to zero to blind them, spawn
Hollow Purples at zero cost.
*Error 404* runs the sure-hit: a 30-second format where the target loses
senses at 3s, has their technique uninstalled at 10s, and becomes pixelated
smoke at 30s.

**Death is not a game over.** When Kenji drops to 0 HP you take control of
Orange. Win the fight as a pumpkin with three hearts, then run **ORANGE HEAL**
to pull Kenji's pristine files off the backup server. Lose as Orange and
*then* it's a game over.

**Orange Disguise.** Ghost Face robe, white mask, golden Executioner knife.
Ignores defence and binding vows. One use per fight, because it is absurd.

**Command console.** Press `/` for an in-game chat console: `/help`, `/god`,
`/tp <area>`, `/battle <enemy>`, `/domain`, `/bf`, `/of`, `/lv 30`, `/money`,
`/unlock all`, `/mission <n>` and more. `/admin` (or `` ` ``) opens the
Sandbox-themed developer panel with cheat toggles, story jumps, battle spawns
and one-click cinematics.

**Dollars, skins and emotes.** Exorcisms pay cash. Spend it at Orange's
definitely-legal shop on skins and emote packs with Fortnite-style rarities —
Common through Mythic. Purple Guy is Legendary. Hakari Dance is Epic. Ghost
Face Protocol and King of Curses are Mythic.

## Controls

| Key | Action |
|---|---|
| Arrows / WASD | Move, dodge, aim |
| Z / Enter | Confirm, jump, time your hit |
| X / Shift | Cancel, run, slash (in domains) |
| C | Menu — also the domain developer menu |
| B | Emote wheel |
| R | Dash · V | Focus-heal (in domains) |
| / | Command console |
| ` | Admin panel |
| F | Fullscreen |

## Running it locally

No build step, no dependencies — it is plain HTML, CSS and JavaScript.

```bash
python3 -m http.server 8777
```

Then open `http://localhost:8777`.

## Credits

Original character, technique and fight concepts by **fomomrjb**.
Kenji Sato, Digital Genesis, the ORANGE Suite and Orange are his.
Jujutsu Kaisen characters appear as an unofficial, non-commercial fan work.
All code, pixel art, chiptune music and sound here is generated for this project.
