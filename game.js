/**
 * ==========================================================
 * GALAXY STRIKER 3D - GAME ENGINE
 * Core 3D Space Arcade Architecture using Three.js & Web Audio
 * ==========================================================
 */

(function () {
  'use strict';

  /* ==========================================================
     1. AUDIO SYNTHESIZER ENGINE (Pure Web Audio API)
     ========================================================== */
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.sfxVolume = 0.8;
      this.musicVolume = 0.65;
      this.muted = false;
      this.bgmPlaying = false;
      this.bgmTimer = null;
      this.bgmStep = 0;
    }

    init() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggleMute() {
      this.muted = !this.muted;
      if (this.muted && this.bgmPlaying) {
        this.stopBgm();
      } else if (!this.muted && !this.bgmPlaying) {
        this.startBgm();
      }
      return this.muted;
    }

    // Laser firing chirp
    playLaser(isPlayer = true, pitchMod = 1) {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = isPlayer ? 'sawtooth' : 'square';
      const startFreq = isPlayer ? 880 * pitchMod : 520 * pitchMod;
      const endFreq = isPlayer ? 120 : 80;

      osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + 0.12);

      const vol = (isPlayer ? 0.25 : 0.15) * this.sfxVolume;
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.13);
    }

    // Missile launch whoosh
    playMissileLaunch() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.3 * this.sfxVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.26);
    }

    // Dynamic explosion sound with filtered noise
    playExplosion(intensity = 1) {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;

      const duration = Math.min(0.8, 0.3 + intensity * 0.2);
      const bufferSize = this.ctx.sampleRate * duration;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600 * intensity, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + duration);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.45 * this.sfxVolume * Math.min(1.5, intensity), this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      // Deep sub-oscillator thump
      const sub = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(140, this.ctx.currentTime);
      sub.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + duration);
      subGain.gain.setValueAtTime(0.4 * this.sfxVolume, this.ctx.currentTime);
      subGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      sub.connect(subGain);
      subGain.connect(this.ctx.destination);

      whiteNoise.start();
      whiteNoise.stop(this.ctx.currentTime + duration);
      sub.start();
      sub.stop(this.ctx.currentTime + duration);
    }

    // Shield impact deflection ping
    playShieldHit() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.35 * this.sfxVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.16);
    }

    // Scrap crystal pickup chime (harmonic arpeggio)
    playScrapPickup(streak = 1) {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      const pitch = notes[(streak - 1) % notes.length];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.25 * this.sfxVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    }

    // Nova Bomb EMP boom
    playNovaBomb() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1500, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 1.2);

      gain.gain.setValueAtTime(0.6 * this.sfxVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 1.25);
    }

    // Boss warning klaxon
    playBossWarning() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      for (let i = 0; i < 3; i++) {
        const t = now + i * 0.45;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, t);
        osc.frequency.setValueAtTime(660, t + 0.15);

        gain.gain.setValueAtTime(0.35 * this.sfxVolume, t);
        gain.gain.setValueAtTime(0.35 * this.sfxVolume, t + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.4);
      }
    }

    // Upgrade Fanfare
    playUpgradeSuccess() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;

      const chords = [440, 554.37, 659.25, 880];
      const now = this.ctx.currentTime;

      chords.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.2 * this.sfxVolume, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.36);
      });
    }

    // Procedural Synthwave BGM loop
    startBgm() {
      if (this.bgmPlaying || this.muted) return;
      this.bgmPlaying = true;
      const bpm = 126;
      const interval = (60 / bpm) / 4; // 16th notes

      const bassNotes = [110, 110, 110, 110, 98, 98, 98, 98, 87.31, 87.31, 87.31, 87.31, 123.47, 123.47, 130.81, 130.81];
      const leadNotes = [440, 0, 523.25, 0, 587.33, 0, 659.25, 587.33, 523.25, 0, 440, 0, 392, 0, 440, 0];

      this.bgmTimer = setInterval(() => {
        if (!this.bgmPlaying || this.muted) return;
        this.init();
        if (!this.ctx) return;

        const idx = this.bgmStep % 16;
        const now = this.ctx.currentTime;

        // Bass synth pulse
        if (this.bgmStep % 2 === 0) {
          const bassOsc = this.ctx.createOscillator();
          const bassGain = this.ctx.createGain();
          bassOsc.type = 'sawtooth';
          bassOsc.frequency.setValueAtTime(bassNotes[idx] * 0.5, now);

          const bassFilter = this.ctx.createBiquadFilter();
          bassFilter.type = 'lowpass';
          bassFilter.frequency.setValueAtTime(450, now);

          bassGain.gain.setValueAtTime(0.12 * this.musicVolume, now);
          bassGain.gain.exponentialRampToValueAtTime(0.001, now + interval * 1.5);

          bassOsc.connect(bassFilter);
          bassFilter.connect(bassGain);
          bassGain.connect(this.ctx.destination);
          bassOsc.start(now);
          bassOsc.stop(now + interval * 1.6);
        }

        // Cyber Arp lead
        const lead = leadNotes[idx];
        if (lead > 0) {
          const leadOsc = this.ctx.createOscillator();
          const leadGain = this.ctx.createGain();
          leadOsc.type = 'triangle';
          leadOsc.frequency.setValueAtTime(lead, now);

          leadGain.gain.setValueAtTime(0.08 * this.musicVolume, now);
          leadGain.gain.exponentialRampToValueAtTime(0.001, now + interval * 1.2);

          leadOsc.connect(leadGain);
          leadGain.connect(this.ctx.destination);
          leadOsc.start(now);
          leadOsc.stop(now + interval * 1.3);
        }

        this.bgmStep++;
      }, interval * 1000);
    }

    stopBgm() {
      this.bgmPlaying = false;
      if (this.bgmTimer) {
        clearInterval(this.bgmTimer);
        this.bgmTimer = null;
      }
    }
  }

  /* ==========================================================
     2. SAVE & UPGRADE PROGRESSION SYSTEM
     ========================================================== */
  const SAVE_KEY = 'GALAXY_STRIKER_SAVE_V1';

  const DEFAULT_SAVE = {
    scrap: 200, // starting scrap gift to try first upgrade!
    highScore: 0,
    shipColor: '#00f3ff',
    upgrades: {
      blaster: 1,  // 1 to 5
      shield: 1,   // 1 to 5
      hull: 1,     // 1 to 5
      missile: 1,  // 1 to 5
      thruster: 1  // 1 to 5
    }
  };

  const UPGRADE_CONFIG = {
    blaster: {
      title: 'Plasma Cannons',
      max: 5,
      costs: [0, 150, 300, 550, 900],
      descriptions: [
        'Twin pulse lasers with high precision targeting.',
        'Dual focused laser cannons with increased fire rate.',
        'Triple spread plasma blasts covering wide forward arc.',
        'Quad rapid-fire gatling cannons with high velocity.',
        'Quantum Lance: Twin hyper-beams piercing all enemies!'
      ]
    },
    shield: {
      title: 'Deflector Shields',
      max: 5,
      costs: [0, 120, 250, 450, 750],
      descriptions: [
        'Reinforced energy barrier with fast recharge capacitors.',
        'Enhanced shield capacity (130 SP) with quicker recharge.',
        'Advanced shield matrix (160 SP) absorbing heavy impacts.',
        'Overcharged shield barrier (200 SP) with passive shock-absorbers.',
        'Invictus Aegis (250 SP) with rapid nano-cell regeneration!'
      ]
    },
    hull: {
      title: 'Titanium Composite Hull',
      max: 5,
      costs: [0, 100, 220, 400, 700],
      descriptions: [
        'High-tensile armor plating with nanite repair systems.',
        'Reinforced titanium plating (130 HP) resists blast pressure.',
        'Dense alloy hull (165 HP) with auto-sealing bulkheads.',
        'Heavy battlecruiser plating (210 HP) and repair nanites.',
        'Dreadnought Bastion Hull (260 HP) with passive self-repair!'
      ]
    },
    missile: {
      title: 'Homing Micro-Missiles',
      max: 5,
      costs: [0, 180, 320, 550, 850],
      descriptions: [
        'Autonomous tracking swarm missiles for elite targets (4 payload).',
        'Enhanced propellant and payload (6 missiles, faster lock).',
        'Heavy warheads with explosive splash radius (8 missiles).',
        'Rapid reload missile bay with cluster warheads (10 missiles).',
        'Apex Swarm: 12 high-velocity autonomous tracking torpedoes!'
      ]
    },
    thruster: {
      title: 'Overdrive Thrusters',
      max: 5,
      costs: [0, 110, 240, 420, 680],
      descriptions: [
        'Ion afterburners for high speed maneuvers and evading fire.',
        'Increased top flight speed (+20%) and faster roll agility.',
        'Extended afterburner boost capacity and faster recharge.',
        'Twin-vectored plasma thrusters with micro-warp drift.',
        'Chronos Hyper-Engines: Insane agility & extended turbo boost!'
      ]
    }
  };

  class SaveManager {
    constructor() {
      this.data = this.load();
    }

    load() {
      try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          return { ...DEFAULT_SAVE, ...parsed, upgrades: { ...DEFAULT_SAVE.upgrades, ...parsed.upgrades } };
        }
      } catch (e) {
        console.warn('Failed to load save data, using default', e);
      }
      return JSON.parse(JSON.stringify(DEFAULT_SAVE));
    }

    save() {
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(this.data));
      } catch (e) {
        console.warn('Failed to save data', e);
      }
    }

    addScrap(amount) {
      this.data.scrap += amount;
      this.save();
      return this.data.scrap;
    }

    spendScrap(amount) {
      if (this.data.scrap >= amount) {
        this.data.scrap -= amount;
        this.save();
        return true;
      }
      return false;
    }

    setHighScore(score) {
      if (score > this.data.highScore) {
        this.data.highScore = score;
        this.save();
        return true;
      }
      return false;
    }

    reset() {
      this.data = JSON.parse(JSON.stringify(DEFAULT_SAVE));
      this.save();
    }
  }

  /* ==========================================================
     3. 3D MODELS BUILDER (Three.js Procedural Meshes)
     ========================================================== */
  class ModelFactory {
    // Player Starfighter
    static createPlayerShip(shipColor = '#00f3ff') {
      const shipGroup = new THREE.Group();

      // Fuselage / Hull (Bright titanium silver with high specular gloss)
      const bodyGeo = new THREE.ConeGeometry(1.2, 5.5, 6);
      bodyGeo.rotateX(-Math.PI / 2);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        roughness: 0.25,
        metalness: 0.8
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      shipGroup.add(body);

      // Color Trim / Accents (Glowing neon)
      const accentGeo = new THREE.BoxGeometry(0.85, 0.42, 3.8);
      const accentMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(shipColor),
        emissive: new THREE.Color(shipColor),
        emissiveIntensity: 0.85,
        roughness: 0.2,
        metalness: 0.7
      });
      const accent = new THREE.Mesh(accentGeo, accentMat);
      accent.position.set(0, 0.22, 0.2);
      shipGroup.add(accent);

      // Wings (Sleek composite with colored wing edge stripes)
      const wingShape = new THREE.Shape();
      wingShape.moveTo(0, 1.5);
      wingShape.lineTo(4.5, -1.8);
      wingShape.lineTo(4.2, -2.4);
      wingShape.lineTo(0, -1.2);
      wingShape.lineTo(-4.2, -2.4);
      wingShape.lineTo(-4.5, -1.8);
      wingShape.closePath();

      const extrudeSettings = { depth: 0.22, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.1, bevelThickness: 0.1 };
      const wingGeo = new THREE.ExtrudeGeometry(wingShape, extrudeSettings);
      wingGeo.rotateX(Math.PI / 2);
      wingGeo.center();
      const wingMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.3,
        metalness: 0.85
      });
      const wings = new THREE.Mesh(wingGeo, wingMat);
      wings.position.set(0, -0.05, 0.2);
      shipGroup.add(wings);

      // Wingtip Cannons
      const cannonGeo = new THREE.CylinderGeometry(0.14, 0.18, 2.4, 8);
      cannonGeo.rotateX(Math.PI / 2);
      const cannonMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });

      const leftCannon = new THREE.Mesh(cannonGeo, cannonMat);
      leftCannon.position.set(-3.8, -0.05, 0.4);
      const rightCannon = new THREE.Mesh(cannonGeo, cannonMat);
      rightCannon.position.set(3.8, -0.05, 0.4);
      shipGroup.add(leftCannon);
      shipGroup.add(rightCannon);

      // Cockpit Canopy Glass
      const canopyGeo = new THREE.SphereGeometry(0.68, 16, 16);
      canopyGeo.scale(0.85, 0.65, 2.2);
      const canopyMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(shipColor),
        roughness: 0.1,
        metalness: 0.9,
        transparent: true,
        opacity: 0.9,
        emissive: new THREE.Color(shipColor),
        emissiveIntensity: 0.8
      });
      const canopy = new THREE.Mesh(canopyGeo, canopyMat);
      canopy.position.set(0, 0.55, -0.2);
      shipGroup.add(canopy);

      // Twin Thruster Nozzles & Glowing Plasma Trails
      const thrusterGeo = new THREE.CylinderGeometry(0.38, 0.48, 0.9, 8);
      thrusterGeo.rotateX(Math.PI / 2);
      const thrusterMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 });

      const leftThruster = new THREE.Mesh(thrusterGeo, thrusterMat);
      leftThruster.position.set(-0.9, 0, 2.5);
      const rightThruster = new THREE.Mesh(thrusterGeo, thrusterMat);
      rightThruster.position.set(0.9, 0, 2.5);
      shipGroup.add(leftThruster);
      shipGroup.add(rightThruster);

      // Animated Thruster Plasma Cones
      const flameGeo = new THREE.ConeGeometry(0.35, 2.0, 8);
      flameGeo.rotateX(-Math.PI / 2);
      flameGeo.translate(0, 0, 1.0);
      const flameMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(shipColor),
        transparent: true,
        opacity: 0.9
      });
      const leftFlame = new THREE.Mesh(flameGeo, flameMat);
      leftFlame.position.set(-0.9, 0, 2.8);
      const rightFlame = new THREE.Mesh(flameGeo, flameMat);
      rightFlame.position.set(0.9, 0, 2.8);
      shipGroup.add(leftFlame);
      shipGroup.add(rightFlame);

      // Attached Ship Point Light for brilliant illumination
      const shipLight = new THREE.PointLight(new THREE.Color(shipColor), 2.0, 25);
      shipLight.position.set(0, 3, 0);
      shipGroup.add(shipLight);

      // 3D Targeting Reticle Ahead of Ship
      const reticleGeo = new THREE.RingGeometry(0.65, 0.78, 16);
      reticleGeo.rotateX(Math.PI / 2);
      const reticleMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(shipColor),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.65
      });
      const reticle = new THREE.Mesh(reticleGeo, reticleMat);
      reticle.position.set(0, 0, -18);
      shipGroup.add(reticle);

      // Shield Bubble Dome (Flashing when hit)
      const shieldGeo = new THREE.SphereGeometry(4.8, 16, 16);
      const shieldMat = new THREE.MeshBasicMaterial({
        color: 0x00f3ff,
        transparent: true,
        opacity: 0,
        wireframe: true
      });
      const shield = new THREE.Mesh(shieldGeo, shieldMat);
      shipGroup.add(shield);

      shipGroup.userData = {
        leftFlame,
        rightFlame,
        shield,
        accentMat,
        canopyMat,
        flameMat,
        shipLight,
        reticle
      };

      return shipGroup;
    }

    // 1. Scout Drone Enemy
    static createScoutDrone() {
      const droneGroup = new THREE.Group();
      const bodyGeo = new THREE.OctahedronGeometry(1.4, 0);
      bodyGeo.scale(1.2, 0.7, 1.8);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        roughness: 0.3,
        metalness: 0.8,
        emissive: 0x7f1d1d,
        emissiveIntensity: 0.4
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      droneGroup.add(body);

      // Eye sensor
      const eyeGeo = new THREE.SphereGeometry(0.4, 8, 8);
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.position.set(0, 0, 1.1);
      droneGroup.add(eye);

      return droneGroup;
    }

    // 2. Viper Interceptor Enemy
    static createInterceptor() {
      const ship = new THREE.Group();
      const bodyGeo = new THREE.ConeGeometry(1.1, 4.5, 4);
      bodyGeo.rotateX(Math.PI / 2);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x7c3aed,
        roughness: 0.25,
        metalness: 0.85,
        emissive: 0x4c1d95,
        emissiveIntensity: 0.5
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      ship.add(body);

      // Forward-swept aggressive wings
      const wingGeo = new THREE.BoxGeometry(5.2, 0.15, 1.4);
      const wingMat = new THREE.MeshStandardMaterial({ color: 0x2e1065, metalness: 0.9 });
      const wings = new THREE.Mesh(wingGeo, wingMat);
      wings.position.set(0, 0, -0.4);
      wings.rotation.y = 0.2;
      ship.add(wings);

      return ship;
    }

    // 3. Void Cruiser Heavy Warship
    static createCruiser() {
      const cruiser = new THREE.Group();
      const hullGeo = new THREE.BoxGeometry(3.5, 1.8, 7.5);
      const hullMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.4,
        metalness: 0.85
      });
      const hull = new THREE.Mesh(hullGeo, hullMat);
      cruiser.add(hull);

      // Heavy armor plates
      const plateGeo = new THREE.BoxGeometry(4.2, 0.6, 5.0);
      const plateMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xb45309,
        emissiveIntensity: 0.35,
        metalness: 0.8
      });
      const plates = new THREE.Mesh(plateGeo, plateMat);
      plates.position.set(0, 0.4, 0);
      cruiser.add(plates);

      // Turrets
      const turretGeo = new THREE.CylinderGeometry(0.6, 0.7, 0.6, 8);
      const turretMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9 });
      const t1 = new THREE.Mesh(turretGeo, turretMat);
      t1.position.set(0, 1.1, 1.5);
      const t2 = new THREE.Mesh(turretGeo, turretMat);
      t2.position.set(0, 1.1, -1.5);
      cruiser.add(t1);
      cruiser.add(t2);

      return cruiser;
    }

    // 4. Asteroid Hazard
    static createAsteroid() {
      const size = 1.6 + Math.random() * 1.8;
      const geo = new THREE.DodecahedronGeometry(size, 1);

      // Deform vertices for realistic cratered asteroid surface
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const vx = pos.getX(i);
        const vy = pos.getY(i);
        const vz = pos.getZ(i);
        const noise = 1 + (Math.sin(vx * 3) + Math.cos(vy * 3) + Math.sin(vz * 3)) * 0.12;
        pos.setXYZ(i, vx * noise, vy * noise, vz * noise);
      }
      geo.computeVertexNormals();

      const mat = new THREE.MeshStandardMaterial({
        color: 0x52525b,
        roughness: 0.85,
        metalness: 0.2
      });
      const ast = new THREE.Mesh(geo, mat);
      ast.userData = {
        rotX: (Math.random() - 0.5) * 1.5,
        rotY: (Math.random() - 0.5) * 1.5,
        rotZ: (Math.random() - 0.5) * 1.5
      };
      return ast;
    }

    // 5. Boss - Apex Titan Dreadnought
    static createBossDreadnought() {
      const boss = new THREE.Group();

      // Main armored core
      const coreGeo = new THREE.BoxGeometry(8, 3.2, 14);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0x1e1b4b,
        roughness: 0.35,
        metalness: 0.9
      });
      const core = new THREE.Mesh(coreGeo, coreMat);
      boss.add(core);

      // Glowing Reactor Core (Weak Point)
      const reactorGeo = new THREE.SphereGeometry(1.6, 16, 16);
      const reactorMat = new THREE.MeshBasicMaterial({
        color: 0xff0055
      });
      const reactor = new THREE.Mesh(reactorGeo, reactorMat);
      reactor.position.set(0, 1.4, 0);
      boss.add(reactor);

      // Heavy Outrigger Wings
      const wingGeo = new THREE.BoxGeometry(9, 1.2, 6);
      const wingMat = new THREE.MeshStandardMaterial({
        color: 0x312e81,
        metalness: 0.85,
        roughness: 0.3
      });

      const leftWing = new THREE.Mesh(wingGeo, wingMat);
      leftWing.position.set(-8.5, 0, 1);
      leftWing.rotation.z = -0.08;
      boss.add(leftWing);

      const rightWing = new THREE.Mesh(wingGeo, wingMat);
      rightWing.position.set(8.5, 0, 1);
      rightWing.rotation.z = 0.08;
      boss.add(rightWing);

      // Heavy Cannon Turrets
      const turretGeo = new THREE.CylinderGeometry(1.2, 1.4, 2.5, 12);
      turretGeo.rotateX(Math.PI / 2);
      const turretMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xb45309,
        emissiveIntensity: 0.5,
        metalness: 0.9
      });

      const leftTurret = new THREE.Mesh(turretGeo, turretMat);
      leftTurret.position.set(-11, 0.4, 4);
      boss.add(leftTurret);

      const rightTurret = new THREE.Mesh(turretGeo, turretMat);
      rightTurret.position.set(11, 0.4, 4);
      boss.add(rightTurret);

      boss.userData = {
        reactor,
        leftTurret,
        rightTurret
      };

      return boss;
    }

    // Scrap Floating Crystal Drop
    static createScrapCrystal() {
      const geo = new THREE.OctahedronGeometry(0.7, 0);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x00ff88,
        emissive: 0x00ff88,
        emissiveIntensity: 0.8,
        roughness: 0.1,
        metalness: 0.9
      });
      const crystal = new THREE.Mesh(geo, mat);
      return crystal;
    }
  }

  /* ==========================================================
     4. GAME ENGINE MAIN LOGIC
     ========================================================== */
  class GalaxyStrikerGame {
    constructor() {
      this.sound = new SoundEngine();
      this.saveManager = new SaveManager();

      this.state = 'MENU'; // 'MENU' | 'PLAYING' | 'HANGAR' | 'GAMEOVER' | 'VICTORY' | 'PAUSED'
      this.score = 0;
      this.wave = 1;
      this.scrapCollectedThisRun = 0;
      this.enemiesKilled = 0;
      this.multiplier = 1;
      this.multiplierTimer = 0;

      // Player Vessel Stats (computed from upgrades)
      this.playerStats = {
        maxHp: 100,
        hp: 100,
        maxShield: 100,
        shield: 100,
        shieldRegenTimer: 0,
        speed: 38,
        boostCapacity: 100,
        boost: 100,
        isBoosting: false,
        blasterTier: 1,
        fireDelay: 0.18,
        lastFireTime: 0,
        missileCapacity: 6,
        missiles: 6,
        lastMissileTime: 0,
        bombReady: true,
        bombCooldown: 0
      };

      // Entities collections
      this.playerShip = null;
      this.playerLasers = [];
      this.playerMissiles = [];
      this.enemies = [];
      this.enemyBullets = [];
      this.particles = [];
      this.scrapCrystals = [];
      this.floatingTexts = [];
      this.novaShockwaves = [];

      // Wave & Spawning
      this.waveTimer = 0;
      this.waveSpawnQueue = [];
      this.bossEntity = null;
      this.screenShakeIntensity = 0;

      // Inputs
      this.keys = {};
      this.mouse = { x: 0, y: 0, isDown: false };
      this.touchJoy = { x: 0, y: 0, active: false };

      this.initDom();
      this.initThree();
      this.bindInputs();
      this.applyUpgradesToPlayer();
      this.updateMenuStats();

      // Launch Animation Loop
      this.lastTimestamp = performance.now();
      requestAnimationFrame(this.renderLoop.bind(this));
    }

    /* ---------------- DOM UI INITIALIZATION ---------------- */
    initDom() {
      // DOM Elements Cache
      this.dom = {
        hud: document.getElementById('hud-overlay'),
        score: document.getElementById('hud-score'),
        multiplier: document.getElementById('hud-multiplier'),
        waveTitle: document.getElementById('hud-wave-title'),
        scrap: document.getElementById('hud-scrap'),
        shieldBar: document.getElementById('shield-bar'),
        shieldText: document.getElementById('shield-val-text'),
        hullBar: document.getElementById('hull-bar'),
        hullText: document.getElementById('hull-val-text'),
        boostBar: document.getElementById('boost-bar'),
        boostText: document.getElementById('boost-val-text'),
        primaryWeaponName: document.getElementById('primary-weapon-name'),
        weaponDots: document.querySelectorAll('#weapon-level-badges .lvl-dot'),
        missileCount: document.getElementById('missile-count'),
        bombStatus: document.getElementById('bomb-status'),
        damageFlash: document.getElementById('damage-flash'),
        waveBanner: document.getElementById('wave-banner'),
        waveBannerTitle: document.getElementById('wave-banner-title'),
        waveBannerSub: document.getElementById('wave-banner-sub'),
        bossHud: document.getElementById('boss-hud'),
        bossBarFill: document.getElementById('boss-bar-fill'),
        bossPhase: document.getElementById('boss-phase'),
        floatingContainer: document.getElementById('floating-text-container'),

        // Screens
        screenMenu: document.getElementById('screen-main-menu'),
        screenHangar: document.getElementById('screen-hangar'),
        screenGameOver: document.getElementById('screen-game-over'),
        screenVictory: document.getElementById('screen-victory'),
        modalControls: document.getElementById('modal-controls'),
        modalSettings: document.getElementById('modal-settings'),
        modalPause: document.getElementById('modal-pause'),

        // Menu stats
        menuHighScore: document.getElementById('menu-high-score'),
        menuScrapBank: document.getElementById('menu-scrap-bank'),
        hangarScrap: document.getElementById('hangar-scrap-val')
      };

      // Button listeners
      document.getElementById('btn-play-game').onclick = () => this.startGame();
      document.getElementById('btn-open-hangar').onclick = () => this.openHangar();
      document.getElementById('btn-open-controls').onclick = () => this.openModal(this.dom.modalControls);
      document.getElementById('btn-open-settings').onclick = () => this.openModal(this.dom.modalSettings);

      document.getElementById('btn-hangar-back').onclick = () => this.openMenu();
      document.getElementById('btn-hangar-launch').onclick = () => this.startGame();

      document.getElementById('btn-pause').onclick = () => this.togglePause();
      document.getElementById('btn-resume').onclick = () => this.togglePause();
      document.getElementById('btn-pause-hangar').onclick = () => { this.closeModal(this.dom.modalPause); this.openHangar(); };
      document.getElementById('btn-pause-menu').onclick = () => { this.closeModal(this.dom.modalPause); this.openMenu(); };

      document.getElementById('btn-retry-mission').onclick = () => this.startGame();
      document.getElementById('btn-go-hangar').onclick = () => this.openHangar();
      document.getElementById('btn-go-menu').onclick = () => this.openMenu();

      document.getElementById('btn-vic-next').onclick = () => this.nextWaveSector();
      document.getElementById('btn-vic-hangar').onclick = () => this.openHangar();
      document.getElementById('btn-vic-menu').onclick = () => this.openMenu();

      document.getElementById('btn-toggle-sound').onclick = () => {
        const isMuted = this.sound.toggleMute();
        document.getElementById('sound-icon').textContent = isMuted ? '🔇' : '🔊';
      };

      // Modal close buttons
      document.querySelectorAll('[data-close]').forEach(btn => {
        btn.onclick = () => {
          const target = document.getElementById(btn.getAttribute('data-close'));
          if (target) this.closeModal(target);
        };
      });

      // Settings sliders
      const sfxSlider = document.getElementById('setting-sfx');
      sfxSlider.oninput = (e) => { this.sound.sfxVolume = e.target.value / 100; };
      const musicSlider = document.getElementById('setting-music');
      musicSlider.oninput = (e) => { this.sound.musicVolume = e.target.value / 100; };

      document.getElementById('btn-reset-save').onclick = () => {
        if (confirm('Are you sure you want to reset all scrap and hangar upgrades?')) {
          this.saveManager.reset();
          this.applyUpgradesToPlayer();
          this.updateHangarUI();
          this.updateMenuStats();
          alert('Fleet data reset successfully.');
        }
      };

      // Ship Paint selector in Hangar
      document.querySelectorAll('.skin-btn').forEach(btn => {
        btn.onclick = () => {
          document.querySelectorAll('.skin-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const color = btn.getAttribute('data-color');
          this.saveManager.data.shipColor = color;
          this.saveManager.save();
          this.rebuildPlayerShipMesh(color);
        };
      });

      // Upgrade buttons in Hangar
      document.querySelectorAll('.btn-upgrade').forEach(btn => {
        const tree = btn.getAttribute('data-tree');
        btn.onclick = () => this.purchaseUpgrade(tree);
      });

      // Touch controls
      this.bindTouchControls();
    }

    /* ---------------- THREE.JS SCENE SETUP ---------------- */
    initThree() {
      const container = document.getElementById('canvas-container');

      this.scene = new THREE.Scene();
      this.scene.fog = new THREE.FogExp2(0x030712, 0.007);

      this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
      this.camera.position.set(0, 16, 26);
      this.camera.lookAt(0, 0, -8);

      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.25;
      container.appendChild(this.renderer.domElement);

      // Ambient & Directional Lighting
      const hemiLight = new THREE.HemisphereLight(0x67e8f9, 0x0f172a, 0.95);
      this.scene.add(hemiLight);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
      this.scene.add(ambientLight);

      const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
      sunLight.position.set(15, 40, 25);
      this.scene.add(sunLight);

      const frontFillLight = new THREE.DirectionalLight(0x38bdf8, 0.9);
      frontFillLight.position.set(0, 5, -40);
      this.scene.add(frontFillLight);

      // Starfield Particle System (1,600 stars drifting past)
      this.initStarfield();

      // Create Player Starfighter
      this.rebuildPlayerShipMesh(this.saveManager.data.shipColor);

      // Window resize handler
      window.addEventListener('resize', () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
      });
    }

    initStarfield() {
      const starCount = 1800;
      const starGeo = new THREE.BufferGeometry();
      const positions = new Float32Array(starCount * 3);
      const colors = new Float32Array(starCount * 3);

      for (let i = 0; i < starCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 160;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 2] = -Math.random() * 260 + 40;

        // Slight star color variation (cyan, white, amber)
        const tint = Math.random();
        if (tint > 0.8) {
          colors[i * 3] = 0.5; colors[i * 3 + 1] = 0.9; colors[i * 3 + 2] = 1.0;
        } else if (tint > 0.6) {
          colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.85; colors[i * 3 + 2] = 0.5;
        } else {
          colors[i * 3] = 1.0; colors[i * 3 + 1] = 1.0; colors[i * 3 + 2] = 1.0;
        }
      }

      starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const starMat = new THREE.PointsMaterial({
        size: 0.85,
        vertexColors: true,
        transparent: true,
        opacity: 0.85
      });

      this.starPoints = new THREE.Points(starGeo, starMat);
      this.scene.add(this.starPoints);
    }

    rebuildPlayerShipMesh(color) {
      if (this.playerShip) {
        this.scene.remove(this.playerShip);
      }
      this.playerShip = ModelFactory.createPlayerShip(color);
      this.playerShip.position.set(0, 0, 8);
      this.scene.add(this.playerShip);
    }

    /* ---------------- INPUT BINDINGS ---------------- */
    bindInputs() {
      window.addEventListener('keydown', (e) => {
        this.keys[e.code] = true;

        if (e.code === 'KeyP' || e.code === 'Escape') {
          if (this.state === 'PLAYING' || this.state === 'PAUSED') {
            this.togglePause();
          }
        }

        if (e.code === 'KeyQ' || e.code === 'KeyE') {
          if (this.state === 'PLAYING') this.triggerNovaBomb();
        }

        if (e.code === 'KeyF') {
          if (this.state === 'PLAYING') this.launchMissiles();
        }

        if (e.code === 'KeyM') {
          this.sound.toggleMute();
          document.getElementById('sound-icon').textContent = this.sound.muted ? '🔇' : '🔊';
        }
      });

      window.addEventListener('keyup', (e) => {
        this.keys[e.code] = false;
      });

      window.addEventListener('mousemove', (e) => {
        // Normalized mouse screen coordinate [-1 to 1]
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      });

      window.addEventListener('mousedown', (e) => {
        if (e.button === 0) {
          this.mouse.isDown = true;
          this.sound.init();
        }
      });

      window.addEventListener('mouseup', (e) => {
        if (e.button === 0) this.mouse.isDown = false;
      });
    }

    bindTouchControls() {
      const joyZone = document.getElementById('joystick-zone');
      const joyNub = document.getElementById('joystick-nub');
      let touchId = null;
      let startX = 0;
      let startY = 0;

      if (!joyZone) return;

      joyZone.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.changedTouches[0];
        touchId = touch.identifier;
        const rect = joyZone.getBoundingClientRect();
        startX = rect.left + rect.width / 2;
        startY = rect.top + rect.height / 2;
        this.sound.init();
      }, { passive: false });

      joyZone.addEventListener('touchmove', (e) => {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
          const touch = e.changedTouches[i];
          if (touch.identifier === touchId) {
            const dx = touch.clientX - startX;
            const dy = touch.clientY - startY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxR = 40;
            const angle = Math.atan2(dy, dx);
            const clampedDist = Math.min(dist, maxR);

            const nx = Math.cos(angle) * clampedDist;
            const ny = Math.sin(angle) * clampedDist;

            joyNub.style.transform = `translate(calc(-50% + ${nx}px), calc(-50% + ${ny}px))`;
            this.touchJoy.x = nx / maxR;
            this.touchJoy.y = ny / maxR;
            this.touchJoy.active = true;
          }
        }
      }, { passive: false });

      const resetJoy = () => {
        touchId = null;
        joyNub.style.transform = 'translate(-50%, -50%)';
        this.touchJoy.x = 0;
        this.touchJoy.y = 0;
        this.touchJoy.active = false;
      };

      joyZone.addEventListener('touchend', resetJoy);
      joyZone.addEventListener('touchcancel', resetJoy);

      // Touch Buttons
      const fireBtn = document.getElementById('touch-fire-btn');
      if (fireBtn) {
        fireBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.mouse.isDown = true; });
        fireBtn.addEventListener('touchend', (e) => { e.preventDefault(); this.mouse.isDown = false; });
      }

      const bombBtn = document.getElementById('touch-bomb-btn');
      if (bombBtn) {
        bombBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.triggerNovaBomb(); });
      }

      const boostBtn = document.getElementById('touch-boost-btn');
      if (boostBtn) {
        boostBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.keys['ShiftLeft'] = true; });
        boostBtn.addEventListener('touchend', (e) => { e.preventDefault(); this.keys['ShiftLeft'] = false; });
      }
    }

    /* ---------------- UPGRADE & STAT CALCULATIONS ---------------- */
    applyUpgradesToPlayer() {
      const ups = this.saveManager.data.upgrades;

      // Blaster
      this.playerStats.blasterTier = ups.blaster;
      this.playerStats.fireDelay = Math.max(0.1, 0.22 - (ups.blaster - 1) * 0.025);

      // Shields
      const shieldTiers = [100, 130, 160, 200, 250];
      this.playerStats.maxShield = shieldTiers[ups.shield - 1];
      this.playerStats.shield = this.playerStats.maxShield;

      // Hull
      const hpTiers = [100, 130, 165, 210, 260];
      this.playerStats.maxHp = hpTiers[ups.hull - 1];
      this.playerStats.hp = this.playerStats.maxHp;

      // Missiles
      const missileTiers = [4, 6, 8, 10, 12];
      this.playerStats.missileCapacity = missileTiers[ups.missile - 1];
      this.playerStats.missiles = this.playerStats.missileCapacity;

      // Thrusters
      this.playerStats.speed = 36 + (ups.thruster - 1) * 5.5;

      this.updateHudStats();
    }

    purchaseUpgrade(tree) {
      const cfg = UPGRADE_CONFIG[tree];
      const curLvl = this.saveManager.data.upgrades[tree];

      if (curLvl >= cfg.max) return;

      const cost = cfg.costs[curLvl];
      if (this.saveManager.spendScrap(cost)) {
        this.saveManager.data.upgrades[tree]++;
        this.saveManager.save();
        this.sound.playUpgradeSuccess();
        this.applyUpgradesToPlayer();
        this.updateHangarUI();
        this.updateMenuStats();
      } else {
        alert('Insufficient Scrap! Destroy more enemy vessels in battle to collect scrap.');
      }
    }

    updateHangarUI() {
      const scrap = this.saveManager.data.scrap;
      this.dom.hangarScrap.textContent = scrap;

      // Specs display
      document.getElementById('spec-hp').textContent = `${this.playerStats.maxHp} HP`;
      document.getElementById('spec-shield').textContent = `${this.playerStats.maxShield} SP`;
      document.getElementById('spec-dps').textContent = `TIER ${this.playerStats.blasterTier}`;
      document.getElementById('spec-missiles').textContent = `${this.playerStats.missileCapacity} TUBES`;

      // Update each upgrade card
      Object.keys(UPGRADE_CONFIG).forEach(tree => {
        const cfg = UPGRADE_CONFIG[tree];
        const lvl = this.saveManager.data.upgrades[tree];

        const lvlElem = document.getElementById(`up-lvl-blaster`.replace('blaster', tree));
        const fillElem = document.getElementById(`up-fill-blaster`.replace('blaster', tree));
        const descElem = document.getElementById(`up-desc-blaster`.replace('blaster', tree));
        const costElem = document.getElementById(`up-cost-blaster`.replace('blaster', tree));
        const btn = document.getElementById(`btn-up-blaster`.replace('blaster', tree));

        if (lvlElem) lvlElem.textContent = lvl >= cfg.max ? 'MAX TIER' : `LVL ${lvl} / ${cfg.max}`;
        if (fillElem) fillElem.style.width = `${(lvl / cfg.max) * 100}%`;
        if (descElem) descElem.textContent = cfg.descriptions[lvl - 1];

        if (lvl >= cfg.max) {
          costElem.textContent = 'MAXED';
          btn.disabled = true;
        } else {
          const cost = cfg.costs[lvl];
          costElem.textContent = `${cost} SCRAP`;
          btn.disabled = scrap < cost;
        }
      });
    }

    updateMenuStats() {
      this.dom.menuHighScore.textContent = `${this.saveManager.data.highScore.toLocaleString()} PTS`;
      this.dom.menuScrapBank.textContent = `${this.saveManager.data.scrap.toLocaleString()} ⚙️`;
    }

    /* ---------------- SCREEN TRANSITIONS ---------------- */
    openMenu() {
      this.state = 'MENU';
      this.sound.stopBgm();
      this.dom.hud.classList.add('hidden');
      this.dom.hud.style.display = 'none';

      this.dom.screenMenu.classList.add('active');
      this.dom.screenMenu.classList.remove('hidden');
      this.dom.screenMenu.style.display = 'flex';

      this.dom.screenHangar.classList.add('hidden');
      this.dom.screenHangar.classList.remove('active');
      this.dom.screenHangar.style.display = 'none';

      this.dom.screenGameOver.classList.add('hidden');
      this.dom.screenGameOver.classList.remove('active');
      this.dom.screenGameOver.style.display = 'none';

      this.dom.screenVictory.classList.add('hidden');
      this.dom.screenVictory.classList.remove('active');
      this.dom.screenVictory.style.display = 'none';

      this.updateMenuStats();
    }

    openHangar() {
      this.state = 'HANGAR';
      this.dom.hud.classList.add('hidden');
      this.dom.hud.style.display = 'none';

      this.dom.screenMenu.classList.remove('active');
      this.dom.screenMenu.classList.add('hidden');
      this.dom.screenMenu.style.display = 'none';

      this.dom.screenHangar.classList.remove('hidden');
      this.dom.screenHangar.classList.add('active');
      this.dom.screenHangar.style.display = 'flex';

      this.dom.screenGameOver.classList.add('hidden');
      this.dom.screenGameOver.classList.remove('active');
      this.dom.screenGameOver.style.display = 'none';

      this.dom.screenVictory.classList.add('hidden');
      this.dom.screenVictory.classList.remove('active');
      this.dom.screenVictory.style.display = 'none';

      this.updateHangarUI();
    }

    startGame() {
      this.state = 'PLAYING';
      this.score = 0;
      this.wave = 1;
      this.scrapCollectedThisRun = 0;
      this.enemiesKilled = 0;
      this.multiplier = 1;
      this.multiplierTimer = 0;

      // Reset dynamic entities
      this.clearEntities();
      this.applyUpgradesToPlayer();

      this.playerShip.position.set(0, 0, 8);
      this.playerShip.rotation.set(0, 0, 0);

      // Hide all menu overlays completely
      this.dom.screenMenu.classList.remove('active');
      this.dom.screenMenu.classList.add('hidden');
      this.dom.screenMenu.style.display = 'none';

      this.dom.screenHangar.classList.remove('active');
      this.dom.screenHangar.classList.add('hidden');
      this.dom.screenHangar.style.display = 'none';

      this.dom.screenGameOver.classList.remove('active');
      this.dom.screenGameOver.classList.add('hidden');
      this.dom.screenGameOver.style.display = 'none';

      this.dom.screenVictory.classList.remove('active');
      this.dom.screenVictory.classList.add('hidden');
      this.dom.screenVictory.style.display = 'none';

      // Show HUD
      this.dom.hud.classList.remove('hidden');
      this.dom.hud.style.display = 'flex';

      this.sound.startBgm();
      this.startWave(this.wave);
    }

    nextWaveSector() {
      this.state = 'PLAYING';
      this.wave++;
      this.dom.screenVictory.classList.add('hidden');
      this.dom.screenVictory.classList.remove('active');
      this.dom.screenVictory.style.display = 'none';

      this.dom.hud.classList.remove('hidden');
      this.dom.hud.style.display = 'flex';
      this.startWave(this.wave);
    }

    togglePause() {
      if (this.state === 'PLAYING') {
        this.state = 'PAUSED';
        this.openModal(this.dom.modalPause);
      } else if (this.state === 'PAUSED') {
        this.state = 'PLAYING';
        this.closeModal(this.dom.modalPause);
      }
    }

    openModal(modal) {
      if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
      }
    }

    closeModal(modal) {
      if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
      }
    }

    clearEntities() {
      // Remove bullets, enemies, particles from scene
      [...this.playerLasers, ...this.playerMissiles, ...this.enemyBullets, ...this.enemies, ...this.scrapCrystals, ...this.novaShockwaves].forEach(e => {
        if (e.mesh) this.scene.remove(e.mesh);
      });
      this.playerLasers = [];
      this.playerMissiles = [];
      this.enemyBullets = [];
      this.enemies = [];
      this.scrapCrystals = [];
      this.novaShockwaves = [];
      this.bossEntity = null;
      this.dom.bossHud.classList.add('hidden');
    }

    /* ---------------- WAVE & ENEMY LOGIC ---------------- */
    startWave(waveNum) {
      this.wave = waveNum;
      this.dom.waveTitle.textContent = `WAVE ${waveNum < 10 ? '0' + waveNum : waveNum} // SECTOR ORION`;

      // Wave announcement banner
      this.dom.waveBannerTitle.textContent = waveNum === 5 ? '⚠️ CAPITAL BOSS: APEX TITAN' : `WAVE ${waveNum < 10 ? '0' + waveNum : waveNum} INCOMING`;
      this.dom.waveBannerSub.textContent = waveNum === 5 ? 'DREADNOUGHT DETECTED - ALL UNITS FOCUS FIRE' : 'HOSTILE FLEET DETECTED - ENGAGE AT WILL';
      this.dom.waveBanner.classList.remove('hidden');
      setTimeout(() => this.dom.waveBanner.classList.add('hidden'), 2800);

      this.waveSpawnQueue = [];

      if (waveNum === 5) {
        // Boss Wave!
        this.sound.playBossWarning();
        setTimeout(() => this.spawnBoss(), 1500);
      } else {
        // Immediate targets so action starts the split second "LAUNCH MISSION" is clicked!
        this.spawnEnemyAt('scout', -7, -25);
        this.spawnEnemyAt('scout', 7, -28);
        this.spawnEnemyAt('asteroid', -11, -18);
        this.spawnEnemyAt('asteroid', 11, -22);

        // Regular waves: create squads
        const scoutCount = 4 + waveNum * 2;
        const interceptorCount = Math.floor(waveNum * 1.5);
        const cruiserCount = waveNum >= 3 ? Math.floor(waveNum * 0.7) : 0;
        const asteroidCount = 2 + waveNum;

        for (let i = 0; i < scoutCount; i++) {
          this.waveSpawnQueue.push({ type: 'scout', delay: 1.0 + i * 1.2 });
        }
        for (let i = 0; i < interceptorCount; i++) {
          this.waveSpawnQueue.push({ type: 'interceptor', delay: 2.5 + i * 2.2 });
        }
        for (let i = 0; i < cruiserCount; i++) {
          this.waveSpawnQueue.push({ type: 'cruiser', delay: 5.0 + i * 3.8 });
        }
        for (let i = 0; i < asteroidCount; i++) {
          this.waveSpawnQueue.push({ type: 'asteroid', delay: 1.8 + i * 2.0 });
        }
      }
      this.waveTimer = 0;
    }

    spawnEnemyAt(type, spawnX, spawnZ) {
      let mesh, hp, scoreVal, scrapVal, speed;

      if (type === 'scout') {
        mesh = ModelFactory.createScoutDrone();
        hp = 22;
        scoreVal = 100;
        scrapVal = 15;
        speed = 18;
      } else if (type === 'interceptor') {
        mesh = ModelFactory.createInterceptor();
        hp = 45;
        scoreVal = 250;
        scrapVal = 30;
        speed = 22;
      } else if (type === 'cruiser') {
        mesh = ModelFactory.createCruiser();
        hp = 140;
        scoreVal = 600;
        scrapVal = 70;
        speed = 10;
      } else {
        // Asteroid
        mesh = ModelFactory.createAsteroid();
        hp = 35;
        scoreVal = 80;
        scrapVal = 25;
        speed = 14;
      }

      mesh.position.set(spawnX, 0, spawnZ);
      this.scene.add(mesh);

      const enemy = {
        type,
        mesh,
        hp,
        maxHp: hp,
        scoreVal,
        scrapVal,
        speed,
        shootTimer: 0.8 + Math.random() * 1.5,
        targetX: spawnX,
        phaseTime: Math.random() * 10
      };

      this.enemies.push(enemy);
      return enemy;
    }

    spawnEnemy(type) {
      const spawnX = (Math.random() - 0.5) * 44;
      const spawnZ = -45 - Math.random() * 15;
      return this.spawnEnemyAt(type, spawnX, spawnZ);
    }

    spawnBoss() {
      const mesh = ModelFactory.createBossDreadnought();
      mesh.position.set(0, 0, -50);
      this.scene.add(mesh);

      this.bossEntity = {
        type: 'boss',
        mesh,
        hp: 950,
        maxHp: 950,
        scoreVal: 5000,
        scrapVal: 500,
        phase: 1,
        attackTimer: 0,
        leftTurretHp: 180,
        rightTurretHp: 180
      };

      this.dom.bossHud.classList.remove('hidden');
      this.dom.bossBarFill.style.width = '100%';
      this.dom.bossPhase.textContent = 'PHASE 1';
      this.addCombatFloatText(0, 5, 'APEX TITAN ENGAGED', '#ff0055');
    }

    /* ---------------- PLAYER WEAPONS & COMBAT ---------------- */
    firePlayerPrimary() {
      const now = performance.now() / 1000;
      if (now - this.playerStats.lastFireTime < this.playerStats.fireDelay) return;
      this.playerStats.lastFireTime = now;

      const pPos = this.playerShip.position;
      const tier = this.playerStats.blasterTier;

      const createBolt = (offsetX, angle = 0, isLance = false) => {
        const boltGeo = isLance ? new THREE.CylinderGeometry(0.25, 0.25, 6, 8) : new THREE.CylinderGeometry(0.12, 0.12, 2.2, 6);
        boltGeo.rotateX(Math.PI / 2);
        const boltMat = new THREE.MeshBasicMaterial({
          color: isLance ? 0x9d4edd : (tier >= 3 ? 0x00f3ff : 0x38bdf8)
        });
        const bolt = new THREE.Mesh(boltGeo, boltMat);
        bolt.position.set(pPos.x + offsetX, pPos.y, pPos.z - 2.2);

        this.scene.add(bolt);
        this.playerLasers.push({
          mesh: bolt,
          vx: Math.sin(angle) * 75,
          vz: -Math.cos(angle) * 75,
          damage: 18 + tier * 5,
          isLance
        });
      };

      if (tier === 1) {
        createBolt(0);
      } else if (tier === 2) {
        createBolt(-0.8);
        createBolt(0.8);
      } else if (tier === 3) {
        createBolt(0);
        createBolt(-1.0, -0.09);
        createBolt(1.0, 0.09);
      } else if (tier === 4) {
        createBolt(-0.6);
        createBolt(0.6);
        createBolt(-1.5, -0.12);
        createBolt(1.5, 0.12);
      } else {
        // Tier 5: Quantum Lance
        createBolt(-1.2, 0, true);
        createBolt(1.2, 0, true);
        createBolt(0, 0, true);
      }

      this.sound.playLaser(true, 1 + tier * 0.1);
    }

    launchMissiles() {
      const now = performance.now() / 1000;
      if (this.playerStats.missiles <= 0) return;
      if (now - this.playerStats.lastMissileTime < 0.5) return;
      this.playerStats.lastMissileTime = now;
      this.playerStats.missiles--;
      this.dom.missileCount.textContent = `${this.playerStats.missiles} / ${this.playerStats.missileCapacity}`;

      const pPos = this.playerShip.position;
      const count = Math.min(4, this.playerStats.missileCapacity);

      for (let i = 0; i < count; i++) {
        const mGeo = new THREE.ConeGeometry(0.2, 1.2, 6);
        mGeo.rotateX(-Math.PI / 2);
        const mMat = new THREE.MeshStandardMaterial({
          color: 0xffb703,
          emissive: 0xff5400,
          emissiveIntensity: 0.6
        });
        const mMesh = new THREE.Mesh(mGeo, mMat);
        const side = i % 2 === 0 ? -1 : 1;
        mMesh.position.set(pPos.x + side * (1.2 + i * 0.4), pPos.y, pPos.z);
        this.scene.add(mMesh);

        this.playerMissiles.push({
          mesh: mMesh,
          vx: side * (15 + Math.random() * 8),
          vz: -10,
          target: this.findClosestEnemy(mMesh.position),
          damage: 55,
          lifetime: 3.5
        });
      }

      this.sound.playMissileLaunch();
    }

    triggerNovaBomb() {
      if (!this.playerStats.bombReady) return;
      this.playerStats.bombReady = false;
      this.playerStats.bombCooldown = 15; // 15s recharge
      this.dom.bombStatus.textContent = '15s RECHARGE';
      this.dom.bombStatus.classList.remove('glowing-gold');

      const pPos = this.playerShip.position;

      // 3D Expanding Shockwave Ring
      const ringGeo = new THREE.RingGeometry(1, 3, 32);
      ringGeo.rotateX(Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xffb703,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(pPos);
      this.scene.add(ring);

      this.novaShockwaves.push({
        mesh: ring,
        radius: 1,
        maxRadius: 65,
        speed: 55
      });

      // Eradicate all enemy bullets
      this.enemyBullets.forEach(b => {
        if (b.mesh) this.scene.remove(b.mesh);
      });
      this.enemyBullets = [];

      // Heavy damage to all enemies
      this.enemies.forEach(e => {
        this.damageEnemy(e, 150);
      });
      if (this.bossEntity) {
        this.damageBoss(200);
      }

      this.screenShakeIntensity = 18;
      this.sound.playNovaBomb();
      this.addCombatFloatText(pPos.x, pPos.z, '⚡ EMP NOVA DETONATED', '#ffb703');
    }

    findClosestEnemy(pos) {
      if (this.bossEntity) return this.bossEntity;
      let closest = null;
      let minDst = Infinity;
      this.enemies.forEach(e => {
        const dst = pos.distanceTo(e.mesh.position);
        if (dst < minDst) {
          minDst = dst;
          closest = e;
        }
      });
      return closest;
    }

    /* ---------------- DAMAGE & EXPLOSIONS ---------------- */
    damageEnemy(enemy, damage) {
      enemy.hp -= damage;
      this.addCombatFloatText(enemy.mesh.position.x, enemy.mesh.position.z, `-${Math.round(damage)}`, '#00f3ff');

      if (enemy.hp <= 0) {
        this.destroyEnemy(enemy);
      }
    }

    destroyEnemy(enemy) {
      const idx = this.enemies.indexOf(enemy);
      if (idx !== -1) this.enemies.splice(idx, 1);

      this.createExplosion(enemy.mesh.position, 1.2);
      this.sound.playExplosion(1.0);
      this.scene.remove(enemy.mesh);

      // Score & Multiplier
      this.score += enemy.scoreVal * this.multiplier;
      this.enemiesKilled++;
      this.multiplier = Math.min(8, this.multiplier + 1);
      this.multiplierTimer = 4.0; // 4s to keep combo

      // Drop Scrap Crystals
      const count = Math.min(5, Math.ceil(enemy.scrapVal / 15));
      for (let i = 0; i < count; i++) {
        this.spawnScrapDrop(enemy.mesh.position, Math.round(enemy.scrapVal / count));
      }

      this.updateHudStats();
    }

    damageBoss(damage) {
      if (!this.bossEntity) return;
      this.bossEntity.hp -= damage;
      const pct = Math.max(0, (this.bossEntity.hp / this.bossEntity.maxHp) * 100);
      this.dom.bossBarFill.style.width = `${pct}%`;
      this.addCombatFloatText(this.bossEntity.mesh.position.x, this.bossEntity.mesh.position.z, `-${Math.round(damage)}`, '#ff0055');

      // Phase transitions
      if (pct < 35 && this.bossEntity.phase < 3) {
        this.bossEntity.phase = 3;
        this.dom.bossPhase.textContent = 'PHASE 3: ENRAGED';
        this.addCombatFloatText(0, 0, '⚠️ REACTOR CRITICAL - MAXIMUM FIREPOWER', '#ff0055');
        this.sound.playBossWarning();
      } else if (pct < 70 && this.bossEntity.phase < 2) {
        this.bossEntity.phase = 2;
        this.dom.bossPhase.textContent = 'PHASE 2';
      }

      if (this.bossEntity.hp <= 0) {
        this.defeatBoss();
      }
    }

    defeatBoss() {
      const pos = this.bossEntity.mesh.position;
      // Grand explosions cascade
      for (let i = 0; i < 8; i++) {
        setTimeout(() => {
          this.createExplosion(new THREE.Vector3(
            pos.x + (Math.random() - 0.5) * 12,
            pos.y + (Math.random() - 0.5) * 4,
            pos.z + (Math.random() - 0.5) * 10
          ), 2.5);
          this.sound.playExplosion(2.0);
          this.screenShakeIntensity = 15;
        }, i * 220);
      }

      setTimeout(() => {
        if (this.bossEntity && this.bossEntity.mesh) {
          this.scene.remove(this.bossEntity.mesh);
        }
        this.bossEntity = null;
        this.dom.bossHud.classList.add('hidden');

        // Victory Screen!
        this.triggerVictory();
      }, 1800);
    }

    damagePlayer(damage) {
      // Shield absorbs first
      if (this.playerStats.shield > 0) {
        this.sound.playShieldHit();
        this.playerShip.userData.shield.material.opacity = 0.8;
        if (this.playerStats.shield >= damage) {
          this.playerStats.shield -= damage;
          damage = 0;
        } else {
          damage -= this.playerStats.shield;
          this.playerStats.shield = 0;
        }
      }

      if (damage > 0) {
        this.playerStats.hp -= damage;
        this.screenShakeIntensity = 12;

        // Red screen damage flash
        this.dom.damageFlash.classList.add('flash-active');
        setTimeout(() => this.dom.damageFlash.classList.remove('flash-active'), 180);
      }

      this.playerStats.shieldRegenTimer = 3.5; // 3.5s delay before shields start recharging
      this.updateHudStats();

      if (this.playerStats.hp <= 0) {
        this.triggerGameOver();
      }
    }

    triggerGameOver() {
      this.state = 'GAMEOVER';
      this.sound.playExplosion(2.5);
      this.createExplosion(this.playerShip.position, 3.0);
      this.sound.stopBgm();

      // Save high score and scrap
      this.saveManager.setHighScore(this.score);
      this.saveManager.addScrap(this.scrapCollectedThisRun);

      document.getElementById('go-score').textContent = `${this.score.toLocaleString()} PTS`;
      document.getElementById('go-wave').textContent = `Wave ${this.wave}`;
      document.getElementById('go-kills').textContent = this.enemiesKilled;
      document.getElementById('go-scrap').textContent = `+${this.scrapCollectedThisRun} ⚙️`;

      setTimeout(() => {
        this.dom.hud.classList.add('hidden');
        this.dom.hud.style.display = 'none';
        this.dom.screenGameOver.classList.remove('hidden');
        this.dom.screenGameOver.classList.add('active');
        this.dom.screenGameOver.style.display = 'flex';
      }, 900);
    }

    triggerVictory() {
      this.state = 'VICTORY';
      this.sound.stopBgm();

      const sectorBounty = 600;
      this.scrapCollectedThisRun += sectorBounty;
      this.saveManager.addScrap(this.scrapCollectedThisRun);
      this.saveManager.setHighScore(this.score);

      document.getElementById('vic-score').textContent = `${this.score.toLocaleString()} PTS`;
      document.getElementById('vic-scrap').textContent = `+${this.scrapCollectedThisRun} ⚙️`;
      document.getElementById('vic-high-score').textContent = `${this.saveManager.data.highScore.toLocaleString()} PTS`;

      this.dom.hud.classList.add('hidden');
      this.dom.hud.style.display = 'none';
      this.dom.screenVictory.classList.remove('hidden');
      this.dom.screenVictory.classList.add('active');
      this.dom.screenVictory.style.display = 'flex';
    }

    spawnScrapDrop(pos, value) {
      const crystal = ModelFactory.createScrapCrystal();
      crystal.position.copy(pos);
      crystal.position.x += (Math.random() - 0.5) * 3;
      crystal.position.z += (Math.random() - 0.5) * 3;
      this.scene.add(crystal);

      this.scrapCrystals.push({
        mesh: crystal,
        value,
        vz: 6 + Math.random() * 4
      });
    }

    createExplosion(pos, scale = 1.0) {
      const particleCount = Math.round(28 * scale);
      const colors = [0xff0055, 0xffb703, 0x00f3ff, 0xffffff];

      for (let i = 0; i < particleCount; i++) {
        const geo = new THREE.BoxGeometry(0.25 * scale, 0.25 * scale, 0.25 * scale);
        const mat = new THREE.MeshBasicMaterial({
          color: colors[Math.floor(Math.random() * colors.length)]
        });
        const p = new THREE.Mesh(geo, mat);
        p.position.copy(pos);
        this.scene.add(p);

        const theta = Math.random() * Math.PI * 2;
        const phi = (Math.random() - 0.5) * Math.PI;
        const speed = (10 + Math.random() * 25) * scale;

        this.particles.push({
          mesh: p,
          vx: Math.cos(theta) * Math.cos(phi) * speed,
          vy: Math.sin(phi) * speed,
          vz: Math.sin(theta) * Math.cos(phi) * speed,
          life: 1.0,
          decay: 1.8 + Math.random() * 1.5
        });
      }
    }

    addCombatFloatText(x3d, z3d, text, color = '#fff') {
      const vec = new THREE.Vector3(x3d, 0, z3d);
      vec.project(this.camera);

      const x = (vec.x * 0.5 + 0.5) * window.innerWidth;
      const y = (-(vec.y * 0.5) + 0.5) * window.innerHeight;

      const el = document.createElement('div');
      el.className = 'combat-float-num';
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.color = color;
      el.textContent = text;

      this.dom.floatingContainer.appendChild(el);
      setTimeout(() => el.remove(), 850);
    }

    /* ---------------- HUD UPDATES ---------------- */
    updateHudStats() {
      this.dom.score.textContent = this.score.toLocaleString();
      this.dom.multiplier.textContent = `x${this.multiplier}`;
      this.dom.scrap.textContent = this.scrapCollectedThisRun;

      // Shield bar
      const shieldPct = Math.max(0, Math.round((this.playerStats.shield / this.playerStats.maxShield) * 100));
      this.dom.shieldBar.style.width = `${shieldPct}%`;
      this.dom.shieldText.textContent = `${shieldPct}%`;

      // Hull bar
      const hullPct = Math.max(0, Math.round((this.playerStats.hp / this.playerStats.maxHp) * 100));
      this.dom.hullBar.style.width = `${hullPct}%`;
      this.dom.hullText.textContent = `${hullPct}%`;
      if (hullPct < 25) {
        this.dom.hullBar.className = 'gauge-fill hull-fill danger';
      } else if (hullPct < 55) {
        this.dom.hullBar.className = 'gauge-fill hull-fill warning';
      } else {
        this.dom.hullBar.className = 'gauge-fill hull-fill';
      }

      // Boost bar
      const boostPct = Math.round(this.playerStats.boost);
      this.dom.boostBar.style.width = `${boostPct}%`;
      this.dom.boostText.textContent = this.playerStats.isBoosting ? 'OVERDRIVE' : (boostPct >= 99 ? 'READY' : `${boostPct}%`);

      // Weapons HUD
      const weaponNames = ['PULSE LASER MK-I', 'DUAL CANNONS MK-II', 'PLASMA SPREAD MK-III', 'QUAD GATLING MK-IV', 'QUANTUM LANCE MK-V'];
      this.dom.primaryWeaponName.textContent = weaponNames[this.playerStats.blasterTier - 1];

      this.dom.weaponDots.forEach((dot, idx) => {
        if (idx < this.playerStats.blasterTier) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }

    /* ---------------- MAIN ENGINE LOOP ---------------- */
    renderLoop(timestamp) {
      requestAnimationFrame(this.renderLoop.bind(this));

      const dt = Math.min((timestamp - this.lastTimestamp) / 1000, 0.1);
      this.lastTimestamp = timestamp;

      // Starfield forward drift animation
      if (this.starPoints) {
        const speed = this.state === 'PLAYING' && this.playerStats.isBoosting ? 130 : 50;
        const pos = this.starPoints.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          let z = pos.getZ(i);
          z += speed * dt;
          if (z > 40) z = -220;
          pos.setZ(i, z);
        }
        pos.needsUpdate = true;
      }

      // State-specific updates
      if (this.state === 'PLAYING') {
        this.updateGameLogic(dt);
      } else if (this.state === 'HANGAR' || this.state === 'MENU') {
        // Slow idle showcase rotation
        if (this.playerShip) {
          this.playerShip.rotation.y += 0.45 * dt;
          this.playerShip.position.set(0, Math.sin(timestamp * 0.002) * 0.4, 6);
        }
      }

      // Dynamic Camera follow & screen shake
      this.updateCamera(dt);

      this.renderer.render(this.scene, this.camera);
    }

    updateGameLogic(dt) {
      this.updatePlayerMovement(dt);
      this.updatePlayerWeapons(dt);
      this.updateWavesAndSpawning(dt);
      this.updateEnemies(dt);
      this.updateProjectiles(dt);
      this.updateParticles(dt);
      this.updateScrapDrops(dt);
      this.updateRegenAndTimers(dt);
    }

    updatePlayerMovement(dt) {
      let moveX = 0;
      let moveZ = 0;

      // Keyboard
      if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveX -= 1;
      if (this.keys['KeyD'] || this.keys['ArrowRight']) moveX += 1;
      if (this.keys['KeyW'] || this.keys['ArrowUp']) moveZ -= 1;
      if (this.keys['KeyS'] || this.keys['ArrowDown']) moveZ += 1;

      // Touch Joystick override
      if (this.touchJoy.active) {
        moveX = this.touchJoy.x;
        moveZ = this.touchJoy.y;
      }

      // Boost Overdrive
      const boostRequested = this.keys['ShiftLeft'] || this.keys['ShiftRight'];
      if (boostRequested && this.playerStats.boost > 10) {
        this.playerStats.isBoosting = true;
        this.playerStats.boost = Math.max(0, this.playerStats.boost - 35 * dt);
      } else {
        this.playerStats.isBoosting = false;
        this.playerStats.boost = Math.min(100, this.playerStats.boost + 15 * dt);
      }

      const currentSpeed = this.playerStats.speed * (this.playerStats.isBoosting ? 1.6 : 1.0);

      // Apply movement with boundary constraints
      const p = this.playerShip.position;
      p.x += moveX * currentSpeed * dt;
      p.z += moveZ * currentSpeed * dt;

      p.x = Math.max(-24, Math.min(24, p.x));
      p.z = Math.max(-18, Math.min(12, p.z));

      // Dynamic Banking / Roll on turn
      const targetRoll = -moveX * 0.55;
      const targetPitch = moveZ * 0.25;
      this.playerShip.rotation.z += (targetRoll - this.playerShip.rotation.z) * 10 * dt;
      this.playerShip.rotation.x += (targetPitch - this.playerShip.rotation.x) * 10 * dt;

      // Thruster flame scale
      const flameScale = this.playerStats.isBoosting ? 2.2 : (moveZ < 0 ? 1.4 : 1.0);
      if (this.playerShip.userData.leftFlame) {
        this.playerShip.userData.leftFlame.scale.set(1, 1, flameScale);
        this.playerShip.userData.rightFlame.scale.set(1, 1, flameScale);
      }

      // Shield bubble fade out
      if (this.playerShip.userData.shield.material.opacity > 0) {
        this.playerShip.userData.shield.material.opacity = Math.max(0, this.playerShip.userData.shield.material.opacity - 2.5 * dt);
      }
    }

    updatePlayerWeapons(dt) {
      // Auto-fire or hold click/space
      if (this.mouse.isDown || this.keys['Space']) {
        this.firePlayerPrimary();
      }

      // Nova bomb cooldown
      if (!this.playerStats.bombReady) {
        this.playerStats.bombCooldown -= dt;
        if (this.playerStats.bombCooldown <= 0) {
          this.playerStats.bombReady = true;
          this.dom.bombStatus.textContent = 'READY';
          this.dom.bombStatus.classList.add('glowing-gold');
        } else {
          this.dom.bombStatus.textContent = `${Math.ceil(this.playerStats.bombCooldown)}s RECHARGE`;
        }
      }
    }

    updateWavesAndSpawning(dt) {
      this.waveTimer += dt;

      // Process spawn queue
      for (let i = this.waveSpawnQueue.length - 1; i >= 0; i--) {
        const item = this.waveSpawnQueue[i];
        if (this.waveTimer >= item.delay) {
          this.spawnEnemy(item.type);
          this.waveSpawnQueue.splice(i, 1);
        }
      }

      // Wave completion check
      if (this.waveSpawnQueue.length === 0 && this.enemies.length === 0 && !this.bossEntity) {
        if (this.wave < 5) {
          this.startWave(this.wave + 1);
        }
      }
    }

    updateEnemies(dt) {
      const pPos = this.playerShip.position;

      // Regular enemies
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const enemy = this.enemies[i];
        const m = enemy.mesh;
        enemy.phaseTime += dt;

        if (enemy.type === 'scout') {
          // Zigzag dive
          m.position.z += enemy.speed * dt;
          m.position.x += Math.sin(enemy.phaseTime * 3.5) * 14 * dt;
        } else if (enemy.type === 'interceptor') {
          // Tracks player X, dives
          m.position.z += enemy.speed * dt;
          m.position.x += (pPos.x - m.position.x) * 1.8 * dt;
        } else if (enemy.type === 'cruiser') {
          // Slow tank advance
          m.position.z += enemy.speed * dt;
        } else {
          // Asteroid tumbling
          m.position.z += enemy.speed * dt;
          m.rotation.x += m.userData.rotX * dt;
          m.rotation.y += m.userData.rotY * dt;
        }

        // Enemy shooting
        if (enemy.type !== 'asteroid') {
          enemy.shootTimer -= dt;
          if (enemy.shootTimer <= 0 && m.position.z < pPos.z - 4) {
            this.enemyShoot(enemy);
            enemy.shootTimer = 1.2 + Math.random() * 1.4;
          }
        }

        // Collision with player
        if (m.position.distanceTo(pPos) < 3.2) {
          this.damagePlayer(35);
          this.destroyEnemy(enemy);
          continue;
        }

        // Offscreen cleanup
        if (m.position.z > 22) {
          this.scene.remove(m);
          this.enemies.splice(i, 1);
        }
      }

      // Boss AI
      if (this.bossEntity) {
        this.updateBoss(dt);
      }
    }

    updateBoss(dt) {
      const boss = this.bossEntity;
      const m = boss.mesh;
      const pPos = this.playerShip.position;

      // Boss slow sweeping movement
      m.position.z = Math.min(-18, m.position.z + 8 * dt);
      m.position.x = Math.sin(performance.now() * 0.001) * 14;

      boss.attackTimer += dt;
      const interval = boss.phase === 3 ? 0.9 : 1.6;

      if (boss.attackTimer >= interval) {
        boss.attackTimer = 0;

        if (boss.phase === 1) {
          // Dual wing cannons
          this.spawnEnemyBullet(m.position.x - 11, m.position.z + 4, 0, 32, 0xff0055);
          this.spawnEnemyBullet(m.position.x + 11, m.position.z + 4, 0, 32, 0xff0055);
        } else if (boss.phase === 2) {
          // 3-way spread from center
          [-0.2, 0, 0.2].forEach(angle => {
            this.spawnEnemyBullet(m.position.x, m.position.z + 5, Math.sin(angle) * 28, Math.cos(angle) * 28, 0xffb703);
          });
        } else {
          // Phase 3 Enraged: 5-way spread + wing shots
          [-0.35, -0.18, 0, 0.18, 0.35].forEach(angle => {
            this.spawnEnemyBullet(m.position.x, m.position.z + 5, Math.sin(angle) * 32, Math.cos(angle) * 32, 0xff0055);
          });
        }
        this.sound.playLaser(false, 0.7);
      }
    }

    enemyShoot(enemy) {
      const pos = enemy.mesh.position;
      const pPos = this.playerShip.position;
      const dirX = (pPos.x - pos.x);
      const dirZ = (pPos.z - pos.z);
      const len = Math.sqrt(dirX * dirX + dirZ * dirZ);

      const speed = 34;
      this.spawnEnemyBullet(pos.x, pos.z + 1.2, (dirX / len) * speed, (dirZ / len) * speed, 0xff0055);
      this.sound.playLaser(false, 1.2);
    }

    spawnEnemyBullet(x, z, vx, vz, color) {
      const geo = new THREE.SphereGeometry(0.35, 8, 8);
      const mat = new THREE.MeshBasicMaterial({ color });
      const bullet = new THREE.Mesh(geo, mat);
      bullet.position.set(x, 0, z);
      this.scene.add(bullet);

      this.enemyBullets.push({
        mesh: bullet,
        vx,
        vz,
        damage: 18
      });
    }

    updateProjectiles(dt) {
      const pPos = this.playerShip.position;

      // 1. Player Lasers
      for (let i = this.playerLasers.length - 1; i >= 0; i--) {
        const laser = this.playerLasers[i];
        const m = laser.mesh;
        m.position.x += laser.vx * dt;
        m.position.z += laser.vz * dt;

        // Check enemy hits
        let hit = false;
        for (let j = 0; j < this.enemies.length; j++) {
          const enemy = this.enemies[j];
          if (m.position.distanceTo(enemy.mesh.position) < 2.4) {
            this.damageEnemy(enemy, laser.damage);
            hit = !laser.isLance; // Piercing Lance does not disappear!
            break;
          }
        }

        // Check boss hit
        if (!hit && this.bossEntity) {
          if (m.position.distanceTo(this.bossEntity.mesh.position) < 8.0) {
            this.damageBoss(laser.damage);
            hit = !laser.isLance;
          }
        }

        if (hit || m.position.z < -80 || Math.abs(m.position.x) > 40) {
          this.scene.remove(m);
          this.playerLasers.splice(i, 1);
        }
      }

      // 2. Player Homing Missiles
      for (let i = this.playerMissiles.length - 1; i >= 0; i--) {
        const mis = this.playerMissiles[i];
        const m = mis.mesh;
        mis.lifetime -= dt;

        // Retarget if current target is dead
        if (!mis.target || (mis.target.hp && mis.target.hp <= 0)) {
          mis.target = this.findClosestEnemy(m.position);
        }

        if (mis.target && mis.target.mesh) {
          const tPos = mis.target.mesh.position;
          const dx = tPos.x - m.position.x;
          const dz = tPos.z - m.position.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          const turnRate = 6.0;

          mis.vx += (dx / dist) * turnRate * 60 * dt;
          mis.vz += (dz / dist) * turnRate * 60 * dt;

          const spd = Math.sqrt(mis.vx * mis.vx + mis.vz * mis.vz);
          const maxSpd = 50;
          if (spd > maxSpd) {
            mis.vx = (mis.vx / spd) * maxSpd;
            mis.vz = (mis.vz / spd) * maxSpd;
          }

          m.rotation.y = Math.atan2(-mis.vx, -mis.vz);
        }

        m.position.x += mis.vx * dt;
        m.position.z += mis.vz * dt;

        // Check collision
        let hit = false;
        for (let j = 0; j < this.enemies.length; j++) {
          const e = this.enemies[j];
          if (m.position.distanceTo(e.mesh.position) < 2.5) {
            this.damageEnemy(e, mis.damage);
            hit = true;
            break;
          }
        }
        if (!hit && this.bossEntity && m.position.distanceTo(this.bossEntity.mesh.position) < 7.0) {
          this.damageBoss(mis.damage);
          hit = true;
        }

        if (hit || mis.lifetime <= 0) {
          this.createExplosion(m.position, 1.4);
          this.sound.playExplosion(1.1);
          this.scene.remove(m);
          this.playerMissiles.splice(i, 1);
        }
      }

      // 3. Enemy Bullets
      for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
        const bullet = this.enemyBullets[i];
        const m = bullet.mesh;
        m.position.x += bullet.vx * dt;
        m.position.z += bullet.vz * dt;

        // Player collision
        if (m.position.distanceTo(pPos) < 2.2) {
          this.damagePlayer(bullet.damage);
          this.scene.remove(m);
          this.enemyBullets.splice(i, 1);
          continue;
        }

        if (m.position.z > 25 || Math.abs(m.position.x) > 35) {
          this.scene.remove(m);
          this.enemyBullets.splice(i, 1);
        }
      }

      // 4. Nova Shockwaves
      for (let i = this.novaShockwaves.length - 1; i >= 0; i--) {
        const wave = this.novaShockwaves[i];
        wave.radius += wave.speed * dt;
        wave.mesh.scale.set(wave.radius, wave.radius, 1);
        wave.mesh.material.opacity = Math.max(0, 1 - wave.radius / wave.maxRadius);

        if (wave.radius >= wave.maxRadius) {
          this.scene.remove(wave.mesh);
          this.novaShockwaves.splice(i, 1);
        }
      }
    }

    updateParticles(dt) {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.life -= p.decay * dt;
        p.mesh.position.x += p.vx * dt;
        p.mesh.position.y += p.vy * dt;
        p.mesh.position.z += p.vz * dt;
        p.mesh.scale.setScalar(Math.max(0.01, p.life));

        if (p.life <= 0) {
          this.scene.remove(p.mesh);
          this.particles.splice(i, 1);
        }
      }
    }

    updateScrapDrops(dt) {
      const pPos = this.playerShip.position;

      for (let i = this.scrapCrystals.length - 1; i >= 0; i--) {
        const drop = this.scrapCrystals[i];
        const m = drop.mesh;
        m.rotation.y += 3.5 * dt;
        m.rotation.x += 2.0 * dt;

        // Magnetic attraction to player
        const dist = m.position.distanceTo(pPos);
        if (dist < 14) {
          const dirX = (pPos.x - m.position.x) / dist;
          const dirZ = (pPos.z - m.position.z) / dist;
          m.position.x += dirX * 35 * dt;
          m.position.z += dirZ * 35 * dt;
        } else {
          m.position.z += drop.vz * dt;
        }

        // Collection pickup
        if (dist < 2.0) {
          this.scrapCollectedThisRun += drop.value;
          this.sound.playScrapPickup(this.multiplier);
          this.addCombatFloatText(pPos.x, pPos.z, `+${drop.value} ⚙️`, '#00ff88');
          this.updateHudStats();

          this.scene.remove(m);
          this.scrapCrystals.splice(i, 1);
          continue;
        }

        if (m.position.z > 22) {
          this.scene.remove(m);
          this.scrapCrystals.splice(i, 1);
        }
      }
    }

    updateRegenAndTimers(dt) {
      // Shield recharge
      if (this.playerStats.shieldRegenTimer > 0) {
        this.playerStats.shieldRegenTimer -= dt;
      } else if (this.playerStats.shield < this.playerStats.maxShield) {
        const regenRate = 22 + (this.saveManager.data.upgrades.shield - 1) * 8;
        this.playerStats.shield = Math.min(this.playerStats.maxShield, this.playerStats.shield + regenRate * dt);
        this.updateHudStats();
      }

      // Combo Multiplier timer
      if (this.multiplierTimer > 0) {
        this.multiplierTimer -= dt;
        if (this.multiplierTimer <= 0 && this.multiplier > 1) {
          this.multiplier = 1;
          this.updateHudStats();
        }
      }
    }

    updateCamera(dt) {
      // Dynamic camera follow with smooth damping
      const p = this.playerShip.position;
      const targetCamX = p.x * 0.45;
      const targetCamY = 16 + (this.playerStats.isBoosting ? 2.5 : 0);
      const targetCamZ = p.z + 18 + (this.playerStats.isBoosting ? 3 : 0);

      this.camera.position.x += (targetCamX - this.camera.position.x) * 4 * dt;
      this.camera.position.y += (targetCamY - this.camera.position.y) * 4 * dt;
      this.camera.position.z += (targetCamZ - this.camera.position.z) * 4 * dt;

      // Dynamic FOV widening on boost
      const targetFov = this.playerStats.isBoosting ? 74 : 65;
      this.camera.fov += (targetFov - this.camera.fov) * 6 * dt;
      this.camera.updateProjectionMatrix();

      // Screen shake damping
      if (this.screenShakeIntensity > 0) {
        this.camera.position.x += (Math.random() - 0.5) * this.screenShakeIntensity * 0.08;
        this.camera.position.y += (Math.random() - 0.5) * this.screenShakeIntensity * 0.08;
        this.screenShakeIntensity = Math.max(0, this.screenShakeIntensity - 35 * dt);
      }

      this.camera.lookAt(p.x * 0.25, 0, p.z - 10);
    }
  }

  // Initialize game on DOM ready
  window.addEventListener('DOMContentLoaded', () => {
    window.gameInstance = new GalaxyStrikerGame();
  });
})();
