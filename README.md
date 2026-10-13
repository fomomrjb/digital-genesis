# DIGITAL GENESIS — Chapter 1

A story-driven 8/16-bit jujutsu RPG starring **Kenji Sato**, a twelve-year-old
special grade sorcerer whose brain reads the universe as source code — and
**Orange**, the neon pumpkin with administrator privileges who lives in his soul.

Play it: **https://fomomrjb.github.io/digital-genesis/**

---

## Chapter 1

Thirteen story missions, from the Shibuya subway where Kenji's technique
awakened to the ruins of Shinjuku and the first move of the Culling Game.
Roughly an hour to finish, longer if you take side missions, grind Orange's
challenges, and buy out the shop.

Progression is manga-paced: every arc guarantees the techniques Kenji has in
that arc, so you unlock things in the order the story earns them.

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
| 30 | **Orange Flash** (100x the impact of a black flash) |

## Systems

**Battle — Deltarune-style.** FIGHT / TECH / ITEM / ACT / DOMAIN / SPARE.
Attacks run a timing bar: stop the marker dead centre, and **the bar gets
faster with every hit you land**. Punch is a 3-hit combo, CE Strike 4, Black
Flash 5, Orange Flash 7. Land a whole combo perfectly and you can proc a
**BLACK FLASH** — full cut-in, red-black lightning, 0.000001s deviation
readout, x2.5 damage.

**Dodging.** The enemy turn is bullet hell inside a soul box. Grazing charges
FOCUS, and FOCUS is what pays for a domain.

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
