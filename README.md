# AstroDrift 🚀

**[Play it live →](https://tiyaagarwal.github.io/AstroDrift/)**

A browser-based space shooter built with vanilla JavaScript and the Canvas API. No dependencies, no build step — open `index.html` and play.

## Gameplay

Navigate a lone spacecraft through an ever-denser asteroid field. Shoot rocks apart, dodge the debris, collect power-ups, and survive as many waves as you can. Every wave adds more asteroids and raises the stakes.

## Controls

| Action | Keyboard | Mobile |
|---|---|---|
| Rotate left | ← / A | ◀ button |
| Rotate right | → / D | ▶ button |
| Thrust | ↑ / W | ▲ button |
| Fire | Space / F | ● button |
| Pause / Resume | P / Esc | — |

## Features

- **Wave progression** — each wave spawns more asteroids; large rocks split into medium, then small
- **Particle system** — thruster exhaust, explosion bursts, and power-up sparkles
- **Parallax star field** — three-layer background that reacts to ship velocity
- **Power-ups** (drop from destroyed asteroids):
  - 🛡 **Shield** — absorbs one hit (6 s)
  - ⚡ **Rapid Fire** — 3× fire rate (5 s)
  - ♥ **Extra Life** — up to 5 lives
- **HUD** — live score, wave counter, life icons, power-up timers
- **Persistent high score** via `localStorage`
- **Mobile-friendly** — touch controls appear automatically on touch devices
- **Pause** — press P or Esc mid-wave

## Project Structure

```
game-space-explorer/
├── index.html          entry point and UI overlays
├── css/
│   └── style.css       layout, overlays, buttons, touch controls
└── js/
    ├── game.js         main game loop and state machine
    ├── player.js       ship physics, shooting, power-up state
    ├── asteroids.js    wave spawning, splitting, drawing
    ├── powerups.js     drop logic, pulse animation
    ├── particles.js    thruster, explosion, sparkle effects
    ├── stars.js        parallax star field
    ├── hud.js          HUD rendering and wave banner
    └── utils.js        shared math helpers
```

## Scoring

| Asteroid | Points |
|---|---|
| Large | 20 |
| Medium | 50 |
| Small | 100 |

## Running locally

```bash
# Any static file server works — for example:
npx serve .
# or
python3 -m http.server
```

Then open `http://localhost:3000` (or whichever port your server uses).

> Opening `index.html` directly from the filesystem also works in most browsers — the game uses ES modules, which some browsers require a server for. If you see a CORS error, use a local server instead.
