# 🚀 GALAXY STRIKER 3D // SPACE ARCADE WARFARE

A state-of-the-art **3D Space Arcade Shooter** built with **Three.js**, **Modern CSS**, and **Web Audio API**.

![Genre](https://img.shields.io/badge/Genre-3D%20Space%20Arcade%20Shooter-00f3ff?style=for-the-badge)
![Tech](https://img.shields.io/badge/Tech-Three.js%20%7C%20WebAudio%20%7C%20Vanilla%20JS-ffb703?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-Desktop%20%26%20Mobile%20Touch-00ff88?style=for-the-badge)

---

## 🌟 Game Highlights

- **🛸 Procedural 3D Starfighters**: Responsive banking rolls, animated thruster plasma plumes, reflective canopy glass, and glowing energy shield bubbles.
- **⚡ 5 Weapon Tiers**:
  1. *Pulse Laser Mk-I* (Precision single beam)
  2. *Dual Cannons Mk-II* (Twin fire cannons)
  3. *Plasma Spread Mk-III* (3-way spread pattern)
  4. *Quad Gatling Mk-IV* (High velocity 4-bolt barrage)
  5. *Quantum Lance Mk-V* (Piercing hyper-beams that burn through all enemies in a line)
- **🚀 Secondary Armaments**:
  - **Homing Micro-Missiles (`[F]`)**: Autonomous smart-seeking warheads that track the nearest targets.
  - **Nova EMP Bomb (`[Q]` / `[E]`)**: Screen-clearing shockwave pulse that vaporizes all hostile laser fire and heavily damages surrounding warships.
- **🛠️ Fleet Dry-Dock / Hangar Upgrades**:
  - Spend collected scrap metal to upgrade **Plasma Cannons**, **Deflector Shields**, **Nanite Hull Armor**, **Homing Missiles**, and **Overdrive Thrusters**.
  - Customize your hull paint with glowing neon schemes (*Cyan Pulse*, *Solar Gold*, *Blood Crimson*, *Emerald Ghost*, *Void Amethyst*).
- **👾 Diverse Void Armada & Epic Boss**:
  - *Scout Drones*: Fast zigzagging swarms.
  - *Viper Interceptors*: Flanking agile predators.
  - *Void Cruisers*: Armored dreadnoughts with heavy turrets.
  - *Asteroid Hazards*: Tumbling obstacles that break into salvageable scrap minerals.
  - *Sector Boss - Apex Titan Dreadnought*: Multi-phase boss with targetable wing turrets, reactor core vulnerability, spiral bullet barrages, and rage mode!
- **🔊 Procedural Web Audio Synthesizer**:
  - 100% self-contained sound effects engine with dynamic laser pings, rocket whooshes, resonant explosion sub-bass, pickup chimes, boss sirens, and Synthwave BGM. Zero external MP3 files needed!
- **📱 Universal Compatibility**:
  - Full Desktop keyboard/mouse controls + dynamic on-screen virtual joystick and touch fire buttons for mobile/tablets.
  - 100% offline capability with local `lib/three.min.js`.

---

## 🕹️ Pilot Controls

| Action | Desktop Controls | Mobile / Touch |
| :--- | :--- | :--- |
| **Maneuver Starfighter** | `W`, `A`, `S`, `D` or `Arrow Keys` | Virtual Joystick (Left) |
| **Primary Blasters** | `Left Click` or `Spacebar` (Hold for auto-fire) | `FIRE` Button |
| **Afterburner Boost** | `Shift` or `Right Click` | `BOOST` Button |
| **Homing Missiles** | `F` Key | Smart Missile Lock |
| **Nova EMP Bomb** | `Q` or `E` Key | `BOMB` Button |
| **Pause / Tactical Command** | `P` or `Escape` | Pause Icon |
| **Mute / Unmute Audio** | `M` Key | Speaker Icon |

---

## 🚀 How to Run the Game

### Method 1: Instant Launcher (Windows)
Double-click `start_game.bat` inside this folder. It will:
1. Start the local high-speed web server on `http://localhost:4050`.
2. Automatically launch your default web browser to the game!

### Method 2: Manual Terminal Run
```bash
node server.cjs
```
Then navigate to: `http://localhost:4050` in Chrome, Edge, Firefox, or Safari.

---

## 🗂️ Project Directory Structure

```
galaxy-striker-3d/
├── index.html            # Main game HTML with HUD, Hangar, and screens
├── style.css             # Cybernetic sci-fi theme, HUD, and glassmorphism styling
├── game.js               # Three.js 3D game engine, procedural models & Web Audio
├── server.cjs            # Lightweight zero-dependency HTTP server
├── start_game.bat        # 1-Click Windows game launcher
├── push_to_github.bat    # Git helper script
├── lib/
│   └── three.min.js      # Offline Three.js library bundle
└── README.md             # Game manual and documentation
```
