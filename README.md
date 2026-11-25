# 🍳 Wok Rush — chop, fry and plate orders through a night-market dinner rush

[![make.fun](https://make.fun/badge/competition/best-cooking-game-20261125-0137)](https://make.fun/c/best-cooking-game-20261125-0137)
[![make.fun entry](https://make.fun/badge/entry/best-cooking-game-20261125-0137)](https://make.fun/c/best-cooking-game-20261125-0137)

A complete cooking game in plain static files — no build step, no network requests, no
borrowed art, music or names. Everything on screen is drawn in code; every sound is
synthesized live with WebAudio.

## How to play

You run a wok station at a night market. Orders appear on the board with a timer each.
Cook every order before its timer runs out — or the customers walk away and you lose a
heart. Lose three hearts, or survive the full 3-minute shift, and the shift ends.

- **Move** — WASD / arrow keys, or click anywhere on the floor (click a station to walk
  there and work it on arrival).
- **Grab ingredients** — click a pantry crate, or stand at the pantry and press 1–7.
- **Cook** — press E at a station: the chopping board chops greens and chili, the wok
  fries eggs, the stock pot boils noodles and rice, the charcoal grill sears chicken and
  shrimp. A finished dish waits on the station — leave it too long and it burns.
- **Plate** — press E at a plating counter to add a cooked item to the plate.
- **Serve** — when a plate holds exactly the three items an order asks for, press Q at
  the serving hatch or click the matching order ticket. Fast serves and streaks pay more.

Seven recipes combine the same seven ingredients in different ways, so every order sends
you on a different route through the kitchen — and the rush ramps: orders arrive faster
and their timers shrink as the shift goes on.

## Run it

```sh
node --experimental-strip-types serve.ts
# open http://localhost:8080
```

Screenshots are staged from the real game with `?shot=cover|assembly|rush|serve&seed=1`
(see `shots.json`); the same seed always stages the same frame.

## Layout

- `game/index.html` — the page: one canvas, one module script.
- `game/src/config.js` — every tuning number: recipes, stations, the rush ramp.
- `game/src/random.js` — the seeded random source behind the order pattern.
- `game/src/audio.js` — every sound, synthesized with WebAudio.
- `game/src/world.js` — the rules: orders, stations, hands, plates, score, hearts.
- `game/src/input.js` — keyboard and mouse.
- `game/src/render.js` — everything the player sees, drawn in code.
- `game/src/shots.js` — the four screenshot scenes, staged from real game state.
- `game/src/main.js` — boot and the one loop.
- `main.ts` — hands the game in: copies `game/` and `screenshots/` to `/output` and
  writes `/output/dossier.json` with the vendored make.fun library.

## License

MIT — see [LICENSE](LICENSE).
