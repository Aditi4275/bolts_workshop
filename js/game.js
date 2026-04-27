/* =============================================
   BOLT'S WORKSHOP — Game Engine
   8 Floors · Gates · Robot Discovery · Specials
   ============================================= */

; (function () {
  'use strict';

  // ─── CONFIG ──────────────────────────────────
  const CFG = {
    WORLD_WIDTH: 1500,
    GROUND_RATIO: 0.25,
    BOLT_SPEED: 240,
    COLLECT_RANGE: 75,
    STATION_RANGE: 110,
    GATE_RANGE: 80,
    GAME_DURATION: 60,
    BOLT_SPAWN_INTERVAL: 2,
    BOLTS_PER_SPAWN: 7,
    BOLT_MILESTONES: [10, 25, 50, 75, 100, 150, 200, 300, 500],

    GATE_POSITIONS: [330, 680, 1030],
    STATION_POSITION: 1320,

    LEVELS: [
      {
        name: 'Dusty Basement', floor: 1, theme: 'basement',
        bgTop: '#1A0E08', bgBot: '#2E1E16',
        groundTop: '#3A2820', groundBot: '#2A1A10',
        accent: '#D4A574', accentRGB: '212,165,116',
        glow: 'rgba(212,165,116,0.3)',
        gateCosts: [3, 5, 6],
        stationIcon: '🔧',
        robot: { name: 'Rusty', story: 'The first friend. Born from scrap metal and a hopeful spark. Rusty never stops smiling.', color: 'robot-amber', emoji: '🤖' },
        points: 20
      },
      {
        name: 'Steam Pipes', floor: 2, theme: 'steam',
        bgTop: '#1E1510', bgBot: '#2A1E15',
        groundTop: '#3A2A1A', groundBot: '#2A1A10',
        accent: '#C89450', accentRGB: '200,148,80',
        glow: 'rgba(200,148,80,0.3)',
        gateCosts: [4, 6, 7],
        stationIcon: '⚙️',
        robot: { name: 'Piston', story: 'Loves the sound of steam. Whistles when happy and dances to the rhythm of the pipes.', color: 'robot-brass', emoji: '⚙️' },
        points: 30
      },
      {
        name: 'Garden Lab', floor: 3, theme: 'garden',
        bgTop: '#0A1A0A', bgBot: '#152E15',
        groundTop: '#1A3A1A', groundBot: '#0A2A0A',
        accent: '#7ED957', accentRGB: '126,217,87',
        glow: 'rgba(126,217,87,0.3)',
        gateCosts: [5, 6, 8],
        stationIcon: '🌱',
        robot: { name: 'Sprout', story: 'Part robot, part garden. Flowers bloom wherever Sprout walks. Loves sunlight and hugs.', color: 'robot-leaf', emoji: '🌿' },
        points: 40
      },
      {
        name: 'Neon Circuit', floor: 4, theme: 'neon',
        bgTop: '#0A0A1E', bgBot: '#101030',
        groundTop: '#1A1A3A', groundBot: '#0A0A20',
        accent: '#00D4FF', accentRGB: '0,212,255',
        glow: 'rgba(0,212,255,0.3)',
        gateCosts: [5, 7, 9],
        stationIcon: '💻',
        robot: { name: 'Pixel', story: 'Sees the world in code. Dreams in binary and paints with light. A digital artist at heart.', color: 'robot-neon', emoji: '💎' },
        points: 50
      },
      {
        name: 'Crystal Cavern', floor: 5, theme: 'crystal',
        bgTop: '#150A20', bgBot: '#1E1030',
        groundTop: '#2A1A3A', groundBot: '#1A0A2A',
        accent: '#B88CFF', accentRGB: '184,140,255',
        glow: 'rgba(184,140,255,0.3)',
        gateCosts: [6, 8, 9],
        stationIcon: '🔮',
        robot: { name: 'Gem', story: 'Crystallized kindness. Shimmers with every emotion and sings lullabies to the cave crystals.', color: 'robot-crystal', emoji: '💜' },
        points: 60
      },
      {
        name: 'Forge Room', floor: 6, theme: 'forge',
        bgTop: '#1E0A08', bgBot: '#2A1510',
        groundTop: '#3A1A10', groundBot: '#2A0A08',
        accent: '#FF6B3D', accentRGB: '255,107,61',
        glow: 'rgba(255,107,61,0.3)',
        gateCosts: [7, 8, 10],
        stationIcon: '🔥',
        robot: { name: 'Ember', story: 'Forged in fire and tempered by love. Warm hugs guaranteed — literally radiates heat.', color: 'robot-ember', emoji: '🔥' },
        points: 70
      },
      {
        name: 'Sky Deck', floor: 7, theme: 'sky',
        bgTop: '#0A1830', bgBot: '#2A4060',
        groundTop: '#2A3A55', groundBot: '#1A2A40',
        accent: '#FFD93D', accentRGB: '255,217,61',
        glow: 'rgba(255,217,61,0.3)',
        gateCosts: [7, 9, 10],
        stationIcon: '🌤️',
        robot: { name: 'Zephyr', story: 'Light as air. Dances with the wind and tells stories whispered by the clouds.', color: 'robot-sky', emoji: '💨' },
        points: 80
      },
      {
        name: 'Core Chamber', floor: 8, theme: 'core',
        bgTop: '#0A0A18', bgBot: '#1A1A30',
        groundTop: '#2A2A45', groundBot: '#1A1A30',
        accent: '#FFFFFF', accentRGB: '255,255,255',
        glow: 'rgba(255,255,255,0.25)',
        gateCosts: [8, 10, 12],
        stationIcon: '✨',
        robot: { name: 'Nova', story: 'The brightest spark. Born from the heart of a star. Nova lights up every room and every heart.', color: 'robot-cosmic', emoji: '⭐' },
        points: 100
      }
    ],

    SPECIAL_ROBOTS: [
      {
        id: 'turbo', name: 'Turbo', emoji: '⚡',
        story: 'Built for speed! Turbo leaves a trail of lightning wherever they zoom.',
        condition: 'Collect 50+ bolts in total',
        ability: 'Movement speed +50%',
        color: 'robot-neon',
        check: (s) => s.totalBolts >= 50
      },
      {
        id: 'chronos', name: 'Chronos', emoji: '⏰',
        story: 'Master of time. Chronos bends the clock to give you more precious seconds.',
        condition: 'Complete 3 floors within 60 seconds',
        ability: '+15 bonus seconds',
        color: 'robot-brass',
        check: (s) => s.levelsIn60s >= 3
      },
      {
        id: 'magnet', name: 'Magnet', emoji: '🧲',
        story: 'Irresistible attraction! Bolts fly toward Magnet like moths to a flame.',
        condition: 'Collect 20+ bolts on a single floor',
        ability: 'Bolt collection range doubled',
        color: 'robot-amber',
        check: (s) => s.boltsThisLevel >= 20
      },
      {
        id: 'prism', name: 'Prism', emoji: '🌈',
        story: 'A living rainbow. Prism paints the workshop in magnificent colors.',
        condition: 'Discover 5+ robots total',
        ability: 'Rainbow background beautification',
        color: 'robot-crystal',
        check: (s) => s.discoveredRobots.length >= 5
      },
      {
        id: 'rocket', name: 'Rocket', emoji: '🚀',
        story: 'Full throttle! Rocket only knows one direction — forward, FAST.',
        condition: 'Reach Floor 6 or beyond',
        ability: 'Super speed boost when moving right',
        color: 'robot-ember',
        check: (s) => s.currentLevel >= 5
      },
      {
        id: 'timelord', name: 'TimeLord', emoji: '⌛',
        story: 'Keeper of the cosmic clock. TimeLord grants a generous gift of time itself.',
        condition: 'Collect 100+ bolts in total',
        ability: '+30 bonus seconds!',
        color: 'robot-cosmic',
        check: (s) => s.totalBolts >= 100
      }
    ],

    STORY_TEXT: "In a forgotten workshop with 8 mysterious floors, a small robot named Bolt wakes up... alone. " +
      "Each floor holds a hidden friend waiting to be built. " +
      "Collect bolts, unlock gates, and bring them to life — before the power runs out! ⚡"
  };

  // ─── STATE ───────────────────────────────────
  const state = {
    phase: 'INTRO',
    timer: CFG.GAME_DURATION,
    score: 0,
    currentLevel: 0,

    boltX: 100, boltTargetX: 100,
    boltMoving: false, boltDir: 1,
    cameraX: 0, viewportW: 0, viewportH: 0,

    bolts: 0,
    totalBolts: 0,
    boltsThisLevel: 0,
    levelsIn60s: 0,
    nextMilestoneIdx: 0,

    gates: [false, false, false],
    stationActive: false,
    stationBuilt: false,
    nearGate: -1,
    nearStation: false,

    activeBolts: [],
    boltIdCounter: 0,
    boltSpawnTimer: 0,

    discoveredRobots: [],
    specialsUnlocked: {},

    // Abilities
    speedMultiplier: 1,
    collectRangeMultiplier: 1,
    rightSpeedBoost: false,

    // Audio
    urgencyDroneStarted: false,
    timerAccum: 0,

    lastTimestamp: 0
  };

  // ─── DOM REFS ────────────────────────────────
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);
  const DOM = {};

  function cacheDom() {
    DOM.introScreen = $('#intro-screen');
    DOM.storyText = $('#story-text');
    DOM.startBtn = $('#start-btn');
    DOM.secretsBtn = $('#secrets-btn');
    DOM.introButtons = $('#intro-buttons');
    DOM.introInstr = $('#intro-instructions');

    DOM.secretsModal = $('#secrets-modal');
    DOM.secretsList = $('#secrets-list');
    DOM.closeSecretsBtn = $('#close-secrets-btn');

    DOM.hud = $('#hud');
    DOM.timerDisplay = $('#timer-display');
    DOM.timerValue = $('#timer-value');
    DOM.levelValue = $('#level-value');
    DOM.scoreValue = $('#score-value');
    DOM.boltsValue = $('#bolts-value');
    DOM.robotsValue = $('#robots-value');

    DOM.notifications = $('#notifications');
    DOM.powersHud = $('#powers-hud');
    DOM.viewport = $('#viewport');
    DOM.world = $('#world');
    DOM.bgFar = $('#bg-far');
    DOM.bgMid = $('#bg-mid');
    DOM.bgNear = $('#bg-near');
    DOM.ground = $('#ground');
    DOM.decorContainer = $('#decorations-container');
    DOM.gatesContainer = $('#gates-container');
    DOM.stationContainer = $('#station-container');
    DOM.bolt = $('#bolt');
    DOM.boltSpeech = $('#bolt-speech');
    DOM.boltsContainer = $('#bolts-container');
    DOM.friendsContainer = $('#friends-container');
    DOM.effectsContainer = $('#effects-container');

    DOM.levelBanner = $('#level-banner');
    DOM.levelBannerTitle = $('#level-banner-title');
    DOM.levelBannerSub = $('#level-banner-subtitle');

    DOM.gateProgress = $('#gate-progress');
    DOM.gateDots = [0, 1, 2].map(i => $(`#gate-dot-${i}`));
    DOM.gateDotStation = $('#gate-dot-station');
    DOM.gateConnectors = $$('.gate-connector');

    DOM.arrowLeft = $('#arrow-left');
    DOM.arrowRight = $('#arrow-right');

    DOM.levelTransition = $('#level-transition');
    DOM.transTitle = $('#transition-title');
    DOM.transRobot = $('#transition-robot');
    DOM.transRobotName = $('#transition-robot-name');
    DOM.transRobotStory = $('#transition-robot-story');

    DOM.gameOverScreen = $('#game-over-screen');
    DOM.gameoverTitle = $('#gameover-title');
    DOM.starRating = $('#star-rating');
    DOM.finalScore = $('#final-score');
    DOM.statFloors = $('#stat-floors');
    DOM.statBolts = $('#stat-bolts');
    DOM.statRobots = $('#stat-robots');
    DOM.robotsGallery = $('#robots-gallery');
    DOM.downloadBtn = $('#download-btn');
    DOM.replayBtn = $('#replay-btn');
  }

  // ─── AUDIO ───────────────────────────────────
  const GameAudio = (() => {
    let ctx;
    function getCtx() {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      return ctx;
    }
    function playTone(freq, duration, type, vol, delay) {
      try {
        const c = getCtx();
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = type || 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(vol || 0.1, c.currentTime + (delay || 0));
        gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + (delay || 0) + duration);
        osc.connect(gain); gain.connect(c.destination);
        osc.start(c.currentTime + (delay || 0));
        osc.stop(c.currentTime + (delay || 0) + duration);
      } catch (e) { }
    }
    return {
      pickup() { playTone(880, 0.1, 'sine', 0.08); playTone(1100, 0.1, 'sine', 0.06, 0.05); },
      build() { playTone(523, 0.15, 'triangle', 0.1); playTone(659, 0.15, 'triangle', 0.1, 0.12); playTone(784, 0.2, 'triangle', 0.1, 0.24); },
      robot() { playTone(600, 0.1, 'square', 0.05); playTone(800, 0.1, 'square', 0.05, 0.08); playTone(1000, 0.15, 'triangle', 0.06, 0.15); },
      unlock() { playTone(400, 0.15, 'triangle', 0.08); playTone(500, 0.15, 'triangle', 0.08, 0.1); playTone(600, 0.15, 'triangle', 0.08, 0.2); playTone(800, 0.25, 'triangle', 0.1, 0.3); },
      click() { playTone(660, 0.06, 'sine', 0.05); },
      special() { playTone(523, 0.2, 'triangle', 0.1); playTone(659, 0.2, 'triangle', 0.1, 0.15); playTone(784, 0.2, 'triangle', 0.1, 0.3); playTone(1047, 0.3, 'triangle', 0.12, 0.45); playTone(1319, 0.4, 'sine', 0.08, 0.6); },
      gameOver() { playTone(784, 0.3, 'sine', 0.08); playTone(659, 0.3, 'sine', 0.08, 0.25); playTone(523, 0.4, 'sine', 0.08, 0.5); playTone(784, 0.5, 'triangle', 0.06, 0.8); },
      victory() { playTone(523, 0.15, 'triangle', 0.1); playTone(659, 0.15, 'triangle', 0.1, 0.1); playTone(784, 0.15, 'triangle', 0.1, 0.2); playTone(1047, 0.3, 'triangle', 0.12, 0.3); playTone(1319, 0.4, 'sine', 0.1, 0.45); playTone(1568, 0.5, 'sine', 0.08, 0.6); },
      tick(freq, vol) { playTone(freq || 1000, 0.06, 'square', vol || 0.04); },
      startUrgencyDrone() {
        try {
          const c = getCtx();
          const osc = c.createOscillator(); const gain = c.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(80, c.currentTime);
          osc.frequency.linearRampToValueAtTime(200, c.currentTime + 10);
          gain.gain.setValueAtTime(0, c.currentTime);
          gain.gain.linearRampToValueAtTime(0.02, c.currentTime + 3);
          gain.gain.linearRampToValueAtTime(0.06, c.currentTime + 10);
          osc.connect(gain); gain.connect(c.destination);
          osc.start(); osc.stop(c.currentTime + 10);
        } catch (e) { }
      }
    };
  })();

  // ─── NOTIFICATIONS ──────────────────────────
  function notify(text, type) {
    const el = document.createElement('div');
    el.className = 'notification ' + (type || '');
    el.textContent = text;
    DOM.notifications.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }

  // ─── SPEECH BUBBLE ──────────────────────────
  let speechTimeout;
  function boltSay(text, duration) {
    clearTimeout(speechTimeout);
    DOM.boltSpeech.textContent = text;
    DOM.boltSpeech.classList.remove('hidden');
    speechTimeout = setTimeout(() => DOM.boltSpeech.classList.add('hidden'), duration || 2000);
  }

  // ─── EFFECTS ─────────────────────────────────
  function spawnSparkles(worldX, worldY, count, color) {
    const chars = ['✦', '✧', '⋆', '★', '♦'];
    for (let i = 0; i < (count || 5); i++) {
      const el = document.createElement('div');
      el.className = 'sparkle-effect';
      el.textContent = chars[Math.floor(Math.random() * chars.length)];
      el.style.left = (worldX + (Math.random() - 0.5) * 50) + 'px';
      el.style.top = (worldY + (Math.random() - 0.5) * 40) + 'px';
      el.style.color = color || '#FFD93D';
      el.style.animationDuration = (0.4 + Math.random() * 0.4) + 's';
      DOM.effectsContainer.appendChild(el);
      setTimeout(() => el.remove(), 800);
    }
  }

  function spawnDustMotes() {
    const groundY = state.viewportH * (1 - CFG.GROUND_RATIO);
    for (let i = 0; i < 12; i++) {
      const mote = document.createElement('div');
      mote.className = 'dust-mote';
      mote.style.left = Math.random() * CFG.WORLD_WIDTH + 'px';
      mote.style.top = (groundY * 0.5 + Math.random() * groundY * 0.4) + 'px';
      mote.style.animationDuration = (6 + Math.random() * 8) + 's';
      mote.style.animationDelay = Math.random() * 10 + 's';
      mote.style.width = (2 + Math.random() * 3) + 'px';
      mote.style.height = mote.style.width;
      DOM.world.appendChild(mote);
    }
  }

  // ─── THEME SYSTEM ───────────────────────────
  function applyTheme(level) {
    const r = document.documentElement.style;
    r.setProperty('--lvl-bg-1', level.bgTop);
    r.setProperty('--lvl-bg-2', level.bgBot);
    r.setProperty('--lvl-ground-1', level.groundTop);
    r.setProperty('--lvl-ground-2', level.groundBot);
    r.setProperty('--lvl-accent', level.accent);
    r.setProperty('--lvl-accent-rgb', level.accentRGB);
    r.setProperty('--lvl-glow', level.glow);

    // Apply background patterns per theme
    DOM.bgFar.style.background = `linear-gradient(180deg, ${level.bgTop} 0%, ${level.bgBot} 100%)`;

    switch (level.theme) {
      case 'basement':
        DOM.bgMid.style.background = `repeating-linear-gradient(90deg, transparent 0px, transparent 280px, rgba(60,40,25,0.4) 280px, rgba(60,40,25,0.4) 286px)`;
        DOM.bgMid.style.opacity = '0.5';
        break;
      case 'steam':
        DOM.bgMid.style.background = `repeating-linear-gradient(0deg, transparent 0px, transparent 60px, rgba(200,148,80,0.12) 60px, rgba(200,148,80,0.12) 72px)`;
        DOM.bgMid.style.opacity = '0.6';
        break;
      case 'garden':
        DOM.bgMid.style.background = `radial-gradient(circle at 20% 60%, rgba(126,217,87,0.08) 0%, transparent 40%), radial-gradient(circle at 70% 40%, rgba(126,217,87,0.06) 0%, transparent 35%)`;
        DOM.bgMid.style.opacity = '0.8';
        break;
      case 'neon':
        DOM.bgMid.style.background = `repeating-linear-gradient(0deg, transparent 0px, transparent 80px, rgba(0,212,255,0.04) 80px, rgba(0,212,255,0.04) 81px), repeating-linear-gradient(90deg, transparent 0px, transparent 80px, rgba(0,212,255,0.04) 80px, rgba(0,212,255,0.04) 81px)`;
        DOM.bgMid.style.opacity = '0.8';
        break;
      case 'crystal':
        DOM.bgMid.style.background = `radial-gradient(circle at 30% 30%, rgba(184,140,255,0.1) 0%, transparent 35%), radial-gradient(circle at 80% 60%, rgba(184,140,255,0.08) 0%, transparent 30%)`;
        DOM.bgMid.style.opacity = '0.7';
        break;
      case 'forge':
        DOM.bgMid.style.background = `radial-gradient(ellipse at 50% 100%, rgba(255,80,20,0.15) 0%, transparent 50%)`;
        DOM.bgMid.style.opacity = '0.8';
        break;
      case 'sky':
        DOM.bgMid.style.background = `radial-gradient(circle at 85% 20%, rgba(255,217,61,0.15) 0%, transparent 40%), linear-gradient(180deg, transparent 50%, rgba(255,217,61,0.05) 100%)`;
        DOM.bgMid.style.opacity = '0.8';
        break;
      case 'core':
        DOM.bgMid.style.background = `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.08) 0%, transparent 50%)`;
        DOM.bgMid.style.opacity = '0.8';
        break;
      default:
        DOM.bgMid.style.background = 'none';
        DOM.bgMid.style.opacity = '0.5';
    }
  }

  // ─── DECORATIONS ────────────────────────────
  function clearDecorations() {
    DOM.decorContainer.innerHTML = '';
    document.querySelectorAll('.dust-mote').forEach(m => m.remove());
  }

  function createDecor(cls, x, y, w, h, extras) {
    const el = document.createElement('div');
    el.className = 'level-decoration ' + cls;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    if (w) el.style.width = w + 'px';
    if (h) el.style.height = h + 'px';
    if (extras) Object.assign(el.style, extras);
    DOM.decorContainer.appendChild(el);
    return el;
  }

  function createDecorations(levelIndex) {
    clearDecorations();
    const level = CFG.LEVELS[levelIndex];
    const gY = state.viewportH * (1 - CFG.GROUND_RATIO);

    switch (level.theme) {
      case 'basement':
        createDecor('decor-cobweb', 10, 60, 70, 70);
        createDecor('decor-cobweb flip', 1420, 60, 70, 70);
        for (let i = 0; i < 5; i++) createDecor('decor-glow', 100 + i * 300, 80 + (i % 3) * 40, 50, 50);
        createDecor('decor-crate', 180, gY - 30, 45, 30);
        createDecor('decor-crate', 500, gY - 25, 35, 25);
        createDecor('decor-crate', 850, gY - 35, 50, 35);
        createDecor('decor-crate', 1200, gY - 28, 40, 28);
        break;

      case 'steam':
        for (let i = 0; i < 4; i++) {
          createDecor('decor-pipe', 50, 100 + i * 120, 300 + Math.random() * 200, 12);
          createDecor('decor-pipe', 800, 80 + i * 130, 250 + Math.random() * 200, 12);
        }
        for (let i = 0; i < 3; i++) createDecor('decor-pipe-vertical', 300 + i * 400, 60, 12, 200);
        for (let i = 0; i < 6; i++) createDecor('decor-steam', 150 + i * 250, gY - 60, 20, 40, { animationDelay: (i * 0.5) + 's' });
        for (let i = 0; i < 3; i++) createDecor('decor-gauge', 200 + i * 500, 150 + (i % 2) * 60, 30, 30);
        break;

      case 'garden':
        for (let i = 0; i < 6; i++) createDecor('decor-vine', 80 + i * 260, 0, 3, 120 + Math.random() * 100, { animationDelay: (i * 0.6) + 's' });
        const flowerColors = ['#FF9EAA', '#FFD93D', '#FF9EAA', '#B88CFF', '#7ED957'];
        for (let i = 0; i < 8; i++) {
          const c = flowerColors[i % flowerColors.length];
          createDecor('decor-flower', 60 + i * 180, gY - 50 - Math.random() * 80, 16, 16, { background: c, color: c });
        }
        for (let i = 0; i < 4; i++) createDecor('decor-pot', 150 + i * 350, gY - 24, 30, 24);
        break;

      case 'neon':
        const neonColors = ['#00D4FF', '#FF00FF', '#00FF88', '#FF6B6B'];
        for (let i = 0; i < 8; i++) {
          const c = neonColors[i % neonColors.length];
          createDecor('decor-neon', 50 + i * 180, 80 + (i % 3) * 80, 60 + Math.random() * 80, 3, { background: c, color: c });
        }
        for (let i = 0; i < 12; i++) {
          const c = neonColors[i % neonColors.length];
          createDecor('decor-circuit-node', 100 + i * 120, 100 + (i % 4) * 60, 8, 8, { background: c, color: c });
        }
        break;

      case 'crystal':
        for (let i = 0; i < 6; i++) {
          createDecor('decor-crystal', 100 + i * 240, gY - 40 - Math.random() * 30, 20, 35, { animationDelay: (i * 0.7) + 's' });
        }
        for (let i = 0; i < 4; i++) createDecor('decor-stalactite', 200 + i * 300, 0, 12, 60 + Math.random() * 40);
        for (let i = 0; i < 3; i++) {
          createDecor('decor-glow', 150 + i * 450, 100 + (i % 2) * 80, 60, 60, {
            background: 'radial-gradient(circle, rgba(184,140,255,0.25) 0%, transparent 70%)'
          });
        }
        break;

      case 'forge':
        for (let i = 0; i < 15; i++) {
          createDecor('decor-ember', 50 + Math.random() * 1400, gY - 10, 4, 4, {
            animationDelay: (Math.random() * 3) + 's',
            animationDuration: (2 + Math.random() * 2) + 's'
          });
        }
        const lava = document.createElement('div');
        lava.className = 'decor-lava';
        lava.style.bottom = '0';
        lava.style.width = '100%';
        DOM.decorContainer.appendChild(lava);
        for (let i = 0; i < 3; i++) {
          createDecor('decor-glow', 200 + i * 400, gY - 80, 70, 70, {
            background: 'radial-gradient(circle, rgba(255,100,20,0.2) 0%, transparent 70%)'
          });
        }
        break;

      case 'sky':
        for (let i = 0; i < 4; i++) {
          createDecor('decor-cloud', 50 + i * 380, 40 + (i % 3) * 50, 120 + Math.random() * 80, 30 + Math.random() * 20, {
            animationDelay: (i * 5) + 's', animationDuration: (15 + i * 5) + 's'
          });
        }
        createDecor('decor-glow', 1200, 30, 100, 100, {
          background: 'radial-gradient(circle, rgba(255,217,61,0.3) 0%, rgba(255,200,100,0.1) 50%, transparent 70%)'
        });
        break;

      case 'core':
        for (let i = 0; i < 30; i++) {
          createDecor('decor-star', Math.random() * 1500, Math.random() * (gY - 20), 2, 2, {
            animationDelay: (Math.random() * 5) + 's',
            animationDuration: (2 + Math.random() * 3) + 's'
          });
        }
        for (let i = 0; i < 3; i++) {
          createDecor('decor-aurora', 50 + i * 200, 80 + i * 60, 400, 40, {
            animationDelay: (i * 2) + 's'
          });
        }
        for (let i = 0; i < 4; i++) {
          createDecor('decor-pillar', 200 + i * 300, 0, 6, gY, {
            animationDelay: (i * 0.8) + 's'
          });
        }
        break;
    }

    spawnDustMotes();
  }

  // ─── LEVEL SYSTEM ───────────────────────────
  function loadLevel(levelIndex) {
    const level = CFG.LEVELS[levelIndex];
    state.currentLevel = levelIndex;
    state.boltsThisLevel = 0;
    state.gates = [false, false, false];
    state.stationActive = false;
    state.stationBuilt = false;
    state.nearGate = -1;
    state.nearStation = false;
    state.activeBolts = [];
    state.boltSpawnTimer = 0;
    state.boltX = 100;
    state.boltTargetX = 100;
    state.boltMoving = false;
    state.cameraX = 0;

    // Clear dynamic elements
    DOM.boltsContainer.innerHTML = '';
    DOM.friendsContainer.innerHTML = '';
    DOM.effectsContainer.innerHTML = '';
    DOM.gatesContainer.innerHTML = '';
    DOM.stationContainer.innerHTML = '';
    DOM.bolt.classList.remove('facing-left', 'walking', 'celebrating');
    DOM.bolt.classList.add('idle');
    DOM.bolt.style.left = '100px';
    DOM.boltSpeech.classList.add('hidden');

    // Apply theme
    applyTheme(level);
    createDecorations(levelIndex);

    // Create gates
    for (let i = 0; i < 3; i++) {
      const gateEl = document.createElement('div');
      gateEl.className = 'level-gate';
      gateEl.id = `gate-${i}`;
      gateEl.dataset.gateIndex = i;
      gateEl.style.left = CFG.GATE_POSITIONS[i] + 'px';
      gateEl.innerHTML = `
        <div class="gate-frame"></div>
        <div class="gate-lock">🔒</div>
        <div class="gate-cost-badge">🔩 ${level.gateCosts[i]}</div>
        <div class="gate-prompt hidden">Tap to Unlock!</div>
      `;
      DOM.gatesContainer.appendChild(gateEl);
    }

    // Create build station
    const stationEl = document.createElement('div');
    stationEl.className = 'build-station';
    stationEl.id = 'build-station';
    stationEl.style.left = CFG.STATION_POSITION + 'px';
    stationEl.innerHTML = `
      <div class="station-bench"></div>
      <div class="station-icon">${level.stationIcon}</div>
      <div class="station-label">🤖 Assembly</div>
      <div class="station-prompt hidden">Tap to Build!</div>
    `;
    DOM.stationContainer.appendChild(stationEl);

    // Update gate progress dots
    updateGateProgress();

    // Update HUD
    DOM.levelValue.textContent = `Floor ${level.floor}`;
    updateHUD();

    // Show level banner
    showLevelBanner(level);

    // Rainbow effect if Prism is active
    if (state.specialsUnlocked.prism) {
      DOM.viewport.classList.add('rainbow-active');
    }
  }

  function showLevelBanner(level) {
    DOM.levelBannerTitle.textContent = `🏭 Floor ${level.floor}: ${level.name}`;
    DOM.levelBannerSub.textContent = `Collect bolts · Unlock 3 gates · Build a robot friend!`;
    DOM.levelBanner.classList.remove('hidden');
    // Remove and re-add for animation restart
    DOM.levelBanner.style.animation = 'none';
    void DOM.levelBanner.offsetWidth;
    DOM.levelBanner.style.animation = '';
    setTimeout(() => DOM.levelBanner.classList.add('hidden'), 2800);
  }

  function updateGateProgress() {
    for (let i = 0; i < 3; i++) {
      DOM.gateDots[i].className = 'gate-dot';
      if (state.gates[i]) {
        DOM.gateDots[i].classList.add('unlocked');
        DOM.gateDots[i].textContent = '✅';
      } else {
        DOM.gateDots[i].textContent = '🔒';
        // Mark the first locked gate as active
        if (i === 0 || state.gates[i - 1]) {
          DOM.gateDots[i].classList.add('active');
        }
      }
    }

    // Connectors
    const connectors = DOM.gateConnectors;
    if (connectors[0]) connectors[0].className = 'gate-connector' + (state.gates[0] ? ' filled' : '');
    if (connectors[1]) connectors[1].className = 'gate-connector' + (state.gates[1] ? ' filled' : '');
    if (connectors[2]) connectors[2].className = 'gate-connector' + (state.gates[2] && state.stationBuilt ? ' filled' : '');

    // Station dot
    DOM.gateDotStation.className = 'gate-dot gate-dot-end';
    if (state.stationBuilt) {
      DOM.gateDotStation.classList.add('unlocked');
      DOM.gateDotStation.textContent = '✅';
    } else if (state.gates[0] && state.gates[1] && state.gates[2]) {
      DOM.gateDotStation.classList.add('active');
    }
  }

  // ─── BOLT SPAWNING ─────────────────────────
  function getAccessibleRange() {
    let maxX = CFG.GATE_POSITIONS[0] - 30;
    for (let i = 0; i < 3; i++) {
      if (state.gates[i]) {
        maxX = (i < 2) ? CFG.GATE_POSITIONS[i + 1] - 30 : CFG.WORLD_WIDTH - 50;
      } else break;
    }
    return { minX: 50, maxX };
  }

  function spawnBolts() {
    const range = getAccessibleRange();
    const groundY = state.viewportH * (1 - CFG.GROUND_RATIO);
    const count = CFG.BOLTS_PER_SPAWN + Math.floor(Math.random() * 3);

    for (let i = 0; i < count; i++) {
      const x = range.minX + Math.random() * (range.maxX - range.minX);
      const y = groundY - 30 - Math.random() * 80;
      const id = state.boltIdCounter++;

      const el = document.createElement('div');
      el.className = 'bolt-item';
      el.textContent = '🔩';
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      el.style.animationDelay = (Math.random() * 2) + 's';
      DOM.boltsContainer.appendChild(el);

      state.activeBolts.push({ id, x, y, el, collected: false });
    }
  }

  function collectBolt(bolt) {
    if (bolt.collected) return;
    bolt.collected = true;
    state.bolts++;
    state.totalBolts++;
    state.boltsThisLevel++;

    bolt.el.classList.add('collected');
    spawnSparkles(bolt.x + 18, bolt.y, 3, '#AAAACC');
    GameAudio.pickup();
    updateHUD();

    setTimeout(() => {
      bolt.el.remove();
      state.activeBolts = state.activeBolts.filter(b => b.id !== bolt.id);
    }, 400);

    const reactions = ['Got it!', 'Shiny!', 'Nice!', 'Yay!', 'More!', '⚡'];
    if (Math.random() < 0.3) boltSay(reactions[Math.floor(Math.random() * reactions.length)], 1000);

    // Check special robots
    checkSpecialRobots();

    const milestones = CFG.BOLT_MILESTONES;
    if (state.nextMilestoneIdx < milestones.length && state.totalBolts >= milestones[state.nextMilestoneIdx]) {
      const ms = milestones[state.nextMilestoneIdx];
      state.nextMilestoneIdx++;
      const bonus = ms * 2;
      state.score += bonus;
      notify(`🌟 Milestone! ${ms} Bolts Collected! +${bonus}pts`, 'special');
      GameAudio.special();
    }
  }

  function checkBoltCollection() {
    const range = CFG.COLLECT_RANGE * state.collectRangeMultiplier;
    for (const bolt of state.activeBolts) {
      if (bolt.collected) continue;
      const dx = Math.abs(state.boltX + 30 - bolt.x - 18);
      if (dx < range) collectBolt(bolt);
    }
  }

  function updateBoltSpawning(dt) {
    state.boltSpawnTimer += dt;
    if (state.boltSpawnTimer >= CFG.BOLT_SPAWN_INTERVAL) {
      state.boltSpawnTimer = 0;
      // Only spawn if not too many bolts already
      const uncollected = state.activeBolts.filter(b => !b.collected).length;
      if (uncollected < 25) spawnBolts();
    }
  }

  // ─── GATE SYSTEM ────────────────────────────
  function checkGateProximity() {
    let nearIdx = -1;
    for (let i = 0; i < 3; i++) {
      if (state.gates[i]) continue;
      // Must unlock gates in order
      if (i > 0 && !state.gates[i - 1]) continue;

      const gateX = CFG.GATE_POSITIONS[i] + 30;
      if (Math.abs(state.boltX + 30 - gateX) < CFG.GATE_RANGE) {
        nearIdx = i;
        break;
      }
    }

    if (nearIdx !== state.nearGate) {
      // Hide old prompt
      if (state.nearGate >= 0) {
        const oldGate = $(`#gate-${state.nearGate}`);
        if (oldGate) {
          const p = oldGate.querySelector('.gate-prompt');
          if (p) p.classList.add('hidden');
        }
      }
      // Show new prompt
      if (nearIdx >= 0) {
        const level = CFG.LEVELS[state.currentLevel];
        const cost = level.gateCosts[nearIdx];
        const gate = $(`#gate-${nearIdx}`);
        if (gate) {
          const p = gate.querySelector('.gate-prompt');
          if (p) {
            p.textContent = state.bolts >= cost ? `Tap! (${cost} 🔩)` : `Need ${cost} 🔩`;
            p.classList.remove('hidden');
          }
        }
      }
      state.nearGate = nearIdx;
    }
  }

  function unlockGate(gateIndex) {
    const level = CFG.LEVELS[state.currentLevel];
    const cost = level.gateCosts[gateIndex];
    if (state.bolts < cost) return;

    state.bolts -= cost;
    state.gates[gateIndex] = true;
    updateHUD();
    updateGateProgress();

    const gateEl = $(`#gate-${gateIndex}`);
    if (gateEl) {
      gateEl.classList.add('unlocked');
      const p = gateEl.querySelector('.gate-prompt');
      if (p) p.classList.add('hidden');
    }

    const stationX = CFG.GATE_POSITIONS[gateIndex];
    const groundY = state.viewportH * (1 - CFG.GROUND_RATIO);
    spawnSparkles(stationX + 30, groundY - 80, 8, level.accent);
    GameAudio.unlock();

    state.score += 10;
    notify(`🔓 Gate ${gateIndex + 1} unlocked! +10pts`, 'unlock');
    boltSay('Open! 🔓', 1500);

    // Spawn bolts in newly accessible area
    setTimeout(() => spawnBolts(), 500);
  }

  // ─── STATION / ROBOT BUILDING ───────────────
  function checkStationProximity() {
    if (state.stationBuilt) { state.nearStation = false; return; }
    if (!state.gates[0] || !state.gates[1] || !state.gates[2]) { state.nearStation = false; return; }

    const stationX = CFG.STATION_POSITION + 50;
    const near = Math.abs(state.boltX + 30 - stationX) < CFG.STATION_RANGE;

    if (near !== state.nearStation) {
      const station = $('#build-station');
      if (station) {
        const p = station.querySelector('.station-prompt');
        if (p) {
          if (near) p.classList.remove('hidden');
          else p.classList.add('hidden');
        }
      }
      state.nearStation = near;
    }
  }

  function buildRobot() {
    if (state.stationBuilt) return;
    state.stationBuilt = true;

    const level = CFG.LEVELS[state.currentLevel];
    const robot = level.robot;

    // Add to discovered
    state.discoveredRobots.push({
      name: robot.name,
      story: robot.story,
      color: robot.color,
      emoji: robot.emoji,
      floor: level.floor,
      special: false
    });

    state.score += level.points;
    updateHUD();
    updateGateProgress();

    // Visual: spawn friend at station
    const groundY = state.viewportH * (1 - CFG.GROUND_RATIO);
    const friendEl = document.createElement('div');
    friendEl.className = 'mini-friend ' + robot.color;
    friendEl.style.left = (CFG.STATION_POSITION + 40) + 'px';
    friendEl.style.top = (groundY - 10) + 'px';
    friendEl.innerHTML = createRobotHTML();
    DOM.friendsContainer.appendChild(friendEl);

    spawnSparkles(CFG.STATION_POSITION + 60, groundY - 40, 12, level.accent);
    GameAudio.robot();

    // Hide station prompt
    const station = $('#build-station');
    if (station) {
      const p = station.querySelector('.station-prompt');
      if (p) p.classList.add('hidden');
      station.querySelector('.station-label').textContent = '✅ Built!';
    }

    // Bolt celebrates
    DOM.bolt.classList.remove('celebrating');
    void DOM.bolt.offsetWidth;
    DOM.bolt.classList.add('celebrating');
    setTimeout(() => DOM.bolt.classList.remove('celebrating'), 600);

    boltSay(`${robot.name}! Hello! 💕`, 2500);
    notify(`🤖 ${robot.name} discovered! +${level.points}pts`, 'celebrate');

    // Check specials
    checkSpecialRobots();

    // Level transition after delay
    setTimeout(() => completeLevel(), 2500);
  }

  function createRobotHTML() {
    return `
      <div class="robot-char">
        <div class="antenna"><div class="antenna-stick"></div><div class="antenna-ball"></div></div>
        <div class="r-head">
          <div class="r-eye left"><div class="pupil"></div><div class="shine"></div></div>
          <div class="r-eye right"><div class="pupil"></div><div class="shine"></div></div>
          <div class="r-blush left"></div><div class="r-blush right"></div>
          <div class="r-mouth smile"></div>
        </div>
        <div class="r-body"><div class="r-heart">♥</div></div>
        <div class="r-arm left-arm"></div><div class="r-arm right-arm"></div>
        <div class="r-leg left-leg"></div><div class="r-leg right-leg"></div>
      </div>
    `;
  }

  // ─── LEVEL COMPLETION ───────────────────────
  function completeLevel() {
    if (state.phase !== 'PLAYING') return;

    const level = CFG.LEVELS[state.currentLevel];
    const elapsed = CFG.GAME_DURATION - state.timer;

    // Track levels completed in first 60 seconds
    if (elapsed <= 60) state.levelsIn60s++;

    // Check if all levels done
    if (state.currentLevel >= 7) {
      gameComplete();
      return;
    }

    // Show transition
    DOM.transTitle.textContent = `✨ Floor ${level.floor} Complete!`;
    DOM.transRobot.innerHTML = `<div class="${level.robot.color}">${createRobotHTML()}</div>`;
    DOM.transRobotName.textContent = level.robot.name;
    DOM.transRobotStory.textContent = `"${level.robot.story}"`;
    DOM.levelTransition.classList.remove('hidden');

    // Auto-advance after 2.5s
    setTimeout(() => {
      DOM.levelTransition.classList.add('hidden');
      loadLevel(state.currentLevel + 1);
    }, 2500);
  }

  // ─── SPECIAL ROBOTS ─────────────────────────
  function checkSpecialRobots() {
    for (const spec of CFG.SPECIAL_ROBOTS) {
      if (state.specialsUnlocked[spec.id]) continue;
      if (spec.check(state)) {
        unlockSpecialRobot(spec);
      }
    }
  }

  function unlockSpecialRobot(spec) {
    state.specialsUnlocked[spec.id] = true;

    // Add to discovered
    state.discoveredRobots.push({
      name: spec.name,
      story: spec.story,
      color: spec.color,
      emoji: spec.emoji,
      floor: '★',
      special: true
    });

    let powerText = '';
    let powerClass = '';

    // Apply ability
    switch (spec.id) {
      case 'turbo':
        state.speedMultiplier = 1.5;
        DOM.bolt.classList.add('speed-boost');
        powerText = 'Turbo Speed';
        powerClass = 'speed';
        break;
      case 'chronos':
        state.timer += 15;
        powerText = '+15s Time';
        powerClass = 'time';
        break;
      case 'magnet':
        state.collectRangeMultiplier = 2;
        powerText = 'Magnet Range';
        powerClass = 'magnet';
        break;
      case 'prism':
        DOM.viewport.classList.add('rainbow-active');
        powerText = 'Prism Aura';
        powerClass = 'prism';
        break;
      case 'rocket':
        state.rightSpeedBoost = true;
        powerText = 'Rocket Dash';
        powerClass = 'rocket';
        break;
      case 'timelord':
        state.timer += 30;
        powerText = '+30s Time';
        powerClass = 'time';
        break;
    }

    GameAudio.special();
    notify(`⭐ SECRET ROBOT: ${spec.name}! ${spec.ability}`, 'special');
    boltSay(`${spec.emoji} ${spec.name}!!!`, 3000);

    state.score += 50;
    updateHUD();

    if (['turbo', 'magnet', 'prism', 'rocket'].includes(spec.id)) {
      addPowerIndicator(spec.emoji, powerText, powerClass);
    }
  }

  function addPowerIndicator(emoji, text, cls) {
    DOM.powersHud.classList.remove('hidden');
    const el = document.createElement('div');
    el.className = `power-indicator ${cls}`;
    el.innerHTML = `<span>${emoji}</span><span>${text}</span>`;
    DOM.powersHud.appendChild(el);
  }

  // ─── MOVEMENT ───────────────────────────────
  function moveBolt(targetX) {
    const range = getAccessibleRange();
    targetX = Math.max(30, Math.min(targetX, range.maxX));
    state.boltTargetX = targetX;
    state.boltMoving = true;

    if (targetX > state.boltX + 5) {
      state.boltDir = 1;
      DOM.bolt.classList.remove('facing-left');
    } else if (targetX < state.boltX - 5) {
      state.boltDir = -1;
      DOM.bolt.classList.add('facing-left');
    }

    DOM.bolt.classList.add('walking');
    DOM.bolt.classList.remove('idle');
  }

  function updateBolt(dt) {
    if (!state.boltMoving) return;

    const dx = state.boltTargetX - state.boltX;
    if (Math.abs(dx) < 5) {
      state.boltMoving = false;
      state.boltX = state.boltTargetX;
      DOM.bolt.classList.remove('walking');
      DOM.bolt.classList.add('idle');
    } else {
      let speed = CFG.BOLT_SPEED * state.speedMultiplier;
      if (state.rightSpeedBoost && dx > 0) speed *= 1.8;
      const move = Math.sign(dx) * speed * dt;
      state.boltX += (Math.abs(move) > Math.abs(dx)) ? dx : move;
    }

    DOM.bolt.style.left = state.boltX + 'px';
    checkBoltCollection();
    checkGateProximity();
    checkStationProximity();
  }

  // ─── CAMERA ──────────────────────────────────
  function updateCamera() {
    const targetCamX = state.boltX - state.viewportW / 2 + 30;
    const maxCamX = CFG.WORLD_WIDTH - state.viewportW;
    state.cameraX += (Math.max(0, Math.min(targetCamX, maxCamX)) - state.cameraX) * 0.08;
    DOM.world.style.transform = `translateX(${-state.cameraX}px)`;

    // Arrow hints
    DOM.arrowLeft.classList.toggle('hidden', state.cameraX <= 50);
    const range = getAccessibleRange();
    DOM.arrowRight.classList.toggle('hidden', state.boltX >= range.maxX - state.viewportW * 0.4);
  }

  // ─── HUD ─────────────────────────────────────
  function updateHUD() {
    const mins = Math.floor(state.timer / 60);
    const secs = Math.floor(state.timer % 60);
    DOM.timerValue.textContent = mins + ':' + (secs < 10 ? '0' : '') + secs;

    if (state.timer <= 10) {
      DOM.timerDisplay.classList.add('critical');
      DOM.viewport.classList.add('urgency-vignette');
    } else if (state.timer <= 30) {
      DOM.timerDisplay.classList.add('urgent');
      DOM.timerDisplay.classList.remove('critical');
      DOM.viewport.classList.remove('urgency-vignette');
    } else {
      DOM.timerDisplay.classList.remove('urgent', 'critical');
      DOM.viewport.classList.remove('urgency-vignette');
    }

    DOM.scoreValue.textContent = state.score;
    DOM.boltsValue.textContent = state.bolts;
    DOM.robotsValue.textContent = state.discoveredRobots.length;
  }

  // ─── TIMER ───────────────────────────────────
  function updateTimer(dt) {
    state.timer -= dt;
    if (state.timer <= 0) {
      state.timer = 0;
      gameOver();
      return;
    }

    // Last 10 seconds — audio pitch escalation
    if (state.timer <= 10) {
      if (!state.urgencyDroneStarted) {
        state.urgencyDroneStarted = true;
        GameAudio.startUrgencyDrone();
      }

      const urgency = 1 - (state.timer / 10); // 0 → 1
      const tickFreq = 1000 + urgency * 1200;
      const tickVol = 0.04 + urgency * 0.06;
      const tickInterval = Math.max(0.25, 1 - urgency * 0.75);

      state.timerAccum += dt;
      if (state.timerAccum >= tickInterval) {
        state.timerAccum = 0;
        GameAudio.tick(tickFreq, tickVol);
      }
    } else if (state.timer <= 30) {
      state.timerAccum += dt;
      if (state.timerAccum >= 1) {
        state.timerAccum = 0;
        GameAudio.tick();
      }
    }

    updateHUD();
  }

  // ─── GAME OVER ──────────────────────────────
  function gameOver() {
    state.phase = 'GAME_OVER';
    GameAudio.gameOver();
    DOM.gameoverTitle.textContent = "⏰ Time's Up!";
    showGameOverScreen();
  }

  function gameComplete() {
    state.phase = 'GAME_OVER';
    state.score += 200; // completion bonus
    GameAudio.victory();
    DOM.gameoverTitle.textContent = "🏆 Workshop Complete!";
    showGameOverScreen();
  }

  function showGameOverScreen() {
    // Star rating
    let stars = 0;
    if (state.score >= 50) stars = 1;
    if (state.score >= 200) stars = 2;
    if (state.score >= 500) stars = 3;

    DOM.starRating.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      const span = document.createElement('span');
      span.className = 'star';
      span.textContent = i < stars ? '⭐' : '☆';
      DOM.starRating.appendChild(span);
    }

    DOM.finalScore.textContent = state.score;
    DOM.statFloors.textContent = state.currentLevel + (state.stationBuilt ? 1 : 0);
    DOM.statBolts.textContent = state.totalBolts;
    DOM.statRobots.textContent = state.discoveredRobots.length;

    // Robot gallery
    DOM.robotsGallery.innerHTML = '';
    state.discoveredRobots.forEach((robot, i) => {
      const card = document.createElement('div');
      card.className = 'gallery-robot-card' + (robot.special ? ' special-card' : '');
      card.style.animationDelay = (i * 0.1) + 's';
      card.innerHTML = `
        <div class="${robot.color} ${robot.special ? 'robot-special' : ''}">
          ${createRobotHTML()}
        </div>
        <div class="gallery-robot-name">${robot.special ? '⭐ ' : ''}${robot.name}</div>
        <div class="gallery-robot-story">${robot.story}</div>
      `;
      DOM.robotsGallery.appendChild(card);
    });

    if (state.discoveredRobots.length === 0) {
      DOM.robotsGallery.innerHTML = '<p style="color:var(--text-dim);font-size:0.85rem;">No robots discovered yet... Try again! 💪</p>';
    }

    DOM.hud.classList.add('hidden');
    DOM.viewport.classList.add('hidden');
    DOM.gameOverScreen.classList.remove('hidden');
  }

  // ─── SCORECARD DOWNLOAD ─────────────────────
  function downloadScorecard() {
    const canvas = $('#scorecard-canvas');
    canvas.width = 800;
    canvas.height = 1000 + state.discoveredRobots.length * 15;
    const ctx = canvas.getContext('2d');

    // Background
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#1A0E20');
    grad.addColorStop(0.5, '#12080A');
    grad.addColorStop(1, '#0A0610');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.strokeStyle = 'rgba(92,189,189,0.4)';
    ctx.lineWidth = 3;
    ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);

    // Inner glow border
    ctx.strokeStyle = 'rgba(255,217,61,0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Title
    ctx.font = 'bold 42px Fredoka One, Arial, sans-serif';
    ctx.fillStyle = '#FFD93D';
    ctx.textAlign = 'center';
    ctx.fillText("⚡ Bolt's Workshop ⚡", 400, 75);

    ctx.font = 'bold 18px Nunito, Arial, sans-serif';
    ctx.fillStyle = '#AA9080';
    ctx.fillText('SCORECARD', 400, 105);

    // Divider
    ctx.strokeStyle = 'rgba(255,217,61,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(100, 120); ctx.lineTo(700, 120); ctx.stroke();

    // Stars
    let stars = 0;
    if (state.score >= 50) stars = 1;
    if (state.score >= 200) stars = 2;
    if (state.score >= 500) stars = 3;
    const starText = (stars >= 1 ? '⭐' : '☆') + (stars >= 2 ? '⭐' : '☆') + (stars >= 3 ? '⭐' : '☆');
    ctx.font = '36px Arial';
    ctx.fillText(starText, 400, 165);

    // Score
    ctx.font = 'bold 56px Fredoka One, Arial, sans-serif';
    ctx.fillStyle = '#FFD93D';
    ctx.fillText(state.score, 400, 235);
    ctx.font = 'bold 16px Nunito, Arial, sans-serif';
    ctx.fillStyle = '#AA9080';
    ctx.fillText('POINTS', 400, 260);

    // Stats row
    const statsY = 310;
    const statsData = [
      { icon: '🏭', value: state.currentLevel + (state.stationBuilt ? 1 : 0), label: 'Floors' },
      { icon: '🔩', value: state.totalBolts, label: 'Bolts' },
      { icon: '🤖', value: state.discoveredRobots.length, label: 'Robots' },
      { icon: '⏱️', value: '2:00', label: 'Time' }
    ];
    statsData.forEach((s, i) => {
      const x = 150 + i * 170;
      ctx.font = '24px Arial';
      ctx.fillText(s.icon, x, statsY);
      ctx.font = 'bold 22px Fredoka One, Arial, sans-serif';
      ctx.fillStyle = '#FFF5E1';
      ctx.fillText(String(s.value), x, statsY + 30);
      ctx.font = '12px Nunito, Arial, sans-serif';
      ctx.fillStyle = '#AA9080';
      ctx.fillText(s.label, x, statsY + 48);
    });

    // Divider
    ctx.strokeStyle = 'rgba(255,217,61,0.2)';
    ctx.beginPath(); ctx.moveTo(100, 380); ctx.lineTo(700, 380); ctx.stroke();

    // Robots section
    ctx.font = 'bold 20px Fredoka One, Arial, sans-serif';
    ctx.fillStyle = '#FF9EAA';
    ctx.fillText('🤖 Discovered Robots', 400, 415);

    let robotY = 450;
    state.discoveredRobots.forEach((robot, i) => {
      const x = 400;

      // Robot card bg
      ctx.fillStyle = robot.special ? 'rgba(0,212,255,0.08)' : 'rgba(255,255,255,0.04)';
      ctx.strokeStyle = robot.special ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      roundRect(ctx, 100, robotY - 18, 600, 50, 10);
      ctx.fill(); ctx.stroke();

      // Draw simplified robot
      drawMiniBot(ctx, 145, robotY + 7, getRobotColors(robot.color));

      // Name
      ctx.font = 'bold 16px Fredoka One, Arial, sans-serif';
      ctx.fillStyle = robot.special ? '#00D4FF' : '#FFD93D';
      ctx.textAlign = 'left';
      ctx.fillText((robot.special ? '⭐ ' : '') + robot.name, 180, robotY + 2);

      // Story
      ctx.font = '11px Nunito, Arial, sans-serif';
      ctx.fillStyle = '#AA9080';
      ctx.fillText(robot.story.substring(0, 70) + (robot.story.length > 70 ? '...' : ''), 180, robotY + 20);

      // Floor
      ctx.textAlign = 'right';
      ctx.font = 'bold 12px Nunito, Arial, sans-serif';
      ctx.fillStyle = '#666';
      ctx.fillText(robot.special ? 'SECRET' : `Floor ${robot.floor}`, 680, robotY + 2);
      ctx.textAlign = 'center';

      robotY += 58;
    });

    // Footer
    ctx.font = 'italic 14px Nunito, Arial, sans-serif';
    ctx.fillStyle = '#666';
    ctx.textAlign = 'center';
    ctx.fillText('"Built with love in the old workshop" — Bolt', 400, robotY + 30);

    // Download
    try {
      const link = document.createElement('a');
      link.download = 'bolts-workshop-scorecard.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      notify('Download failed — try screenshot instead!', '');
    }
  }

  function getRobotColors(colorClass) {
    const colors = {
      'robot-amber': { head: '#D4A574', body: '#B88A5A', legs: '#9A7040', glow: '#FFD93D' },
      'robot-brass': { head: '#C89450', body: '#A07030', legs: '#886020', glow: '#FFA64D' },
      'robot-leaf': { head: '#7ED957', body: '#60B840', legs: '#4A9A30', glow: '#7ED957' },
      'robot-neon': { head: '#00D4FF', body: '#0090B0', legs: '#006080', glow: '#FF00FF' },
      'robot-crystal': { head: '#B88CFF', body: '#9A70E0', legs: '#8060C0', glow: '#B88CFF' },
      'robot-ember': { head: '#FF6B3D', body: '#E05020', legs: '#C04010', glow: '#FFD93D' },
      'robot-sky': { head: '#5CACEE', body: '#3A8ACC', legs: '#2A6AAA', glow: '#FFD93D' },
      'robot-cosmic': { head: '#DDD', body: '#CCC', legs: '#AAA', glow: '#FFF' }
    };
    return colors[colorClass] || colors['robot-amber'];
  }

  function drawMiniBot(ctx, x, y, c) {
    // Antenna
    ctx.strokeStyle = c.body; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, y - 10); ctx.lineTo(x, y - 18); ctx.stroke();
    ctx.fillStyle = c.glow;
    ctx.beginPath(); ctx.arc(x, y - 20, 3, 0, Math.PI * 2); ctx.fill();
    // Head
    ctx.fillStyle = c.head;
    roundRect(ctx, x - 10, y - 10, 20, 16, 6); ctx.fill();
    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(x - 4, y - 4, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 4, y - 4, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2A2A3A';
    ctx.beginPath(); ctx.arc(x - 4, y - 3, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 4, y - 3, 1.5, 0, Math.PI * 2); ctx.fill();
    // Body
    ctx.fillStyle = c.body;
    roundRect(ctx, x - 8, y + 7, 16, 12, 4); ctx.fill();
    // Legs
    ctx.fillStyle = c.legs;
    roundRect(ctx, x - 7, y + 20, 5, 6, 2); ctx.fill();
    roundRect(ctx, x + 2, y + 20, 5, 6, 2); ctx.fill();
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // ─── SECRET ROBOTS MODAL ────────────────────
  function populateSecretsModal() {
    DOM.secretsList.innerHTML = '';
    CFG.SPECIAL_ROBOTS.forEach(spec => {
      const card = document.createElement('div');
      card.className = 'secret-card';
      card.innerHTML = `
        <div class="secret-card-icon">${spec.emoji}</div>
        <div class="secret-card-info">
          <div class="secret-card-name">${spec.name}</div>
          <div class="secret-card-condition">🎯 ${spec.condition}</div>
          <div class="secret-card-ability">✨ Ability: ${spec.ability}</div>
        </div>
      `;
      DOM.secretsList.appendChild(card);
    });
  }

  // ─── GAME LOOP ──────────────────────────────
  function gameLoop(timestamp) {
    if (state.phase !== 'PLAYING') return;
    if (!state.lastTimestamp) state.lastTimestamp = timestamp;
    const dt = Math.min((timestamp - state.lastTimestamp) / 1000, 0.05);
    state.lastTimestamp = timestamp;

    updateTimer(dt);
    if (state.phase !== 'PLAYING') return;

    updateBolt(dt);
    updateCamera();
    updateBoltSpawning(dt);

    requestAnimationFrame(gameLoop);
  }

  // ─── INTRO ──────────────────────────────────
  function typewriterEffect(text, element, speed, callback) {
    let i = 0;
    element.innerHTML = '<span class="cursor"></span>';
    function type() {
      if (i < text.length) {
        element.innerHTML = text.substring(0, i + 1) + '<span class="cursor"></span>';
        i++;
        setTimeout(type, speed);
      } else {
        element.innerHTML = text;
        if (callback) callback();
      }
    }
    type();
  }

  function showIntro() {
    typewriterEffect(CFG.STORY_TEXT, DOM.storyText, 30, () => {
      DOM.introButtons.style.display = '';
      DOM.introInstr.style.display = '';
      DOM.introButtons.style.animation = 'fadeIn 0.6s ease';
      DOM.introInstr.style.animation = 'fadeIn 0.8s ease 0.3s both';
    });
  }

  // ─── START GAME ─────────────────────────────
  function startGame() {
    GameAudio.click();
    DOM.introScreen.style.opacity = '0';
    setTimeout(() => DOM.introScreen.classList.add('hidden'), 800);

    resetState();

    state.viewportW = DOM.viewport.offsetWidth || window.innerWidth;
    state.viewportH = DOM.viewport.offsetHeight || window.innerHeight;

    DOM.hud.classList.remove('hidden');
    DOM.viewport.classList.remove('hidden');

    loadLevel(0);

    state.phase = 'PLAYING';
    state.lastTimestamp = 0;
    requestAnimationFrame(gameLoop);

    setTimeout(() => boltSay("Let's find bolts! 🔩", 2500), 800);
  }

  function resetState() {
    state.timer = CFG.GAME_DURATION;
    state.score = 0;
    state.currentLevel = 0;
    state.boltX = 100; state.boltTargetX = 100;
    state.boltMoving = false; state.boltDir = 1;
    state.cameraX = 0;
    state.bolts = 0; state.totalBolts = 0; state.boltsThisLevel = 0;
    state.levelsIn60s = 0;
    state.nextMilestoneIdx = 0;
    state.gates = [false, false, false];
    state.stationActive = false; state.stationBuilt = false;
    state.nearGate = -1; state.nearStation = false;
    state.activeBolts = []; state.boltIdCounter = 0; state.boltSpawnTimer = 0;
    state.discoveredRobots = [];
    state.specialsUnlocked = {};
    state.speedMultiplier = 1;
    state.collectRangeMultiplier = 1;
    state.rightSpeedBoost = false;
    state.urgencyDroneStarted = false;
    state.timerAccum = 0;
    state.lastTimestamp = 0;

    DOM.powersHud.innerHTML = '';
    DOM.powersHud.classList.add('hidden');
    DOM.timerDisplay.classList.remove('urgent', 'critical');
    DOM.viewport.classList.remove('urgency-vignette', 'rainbow-active');
    DOM.bolt.classList.remove('speed-boost', 'facing-left', 'walking', 'celebrating');
    DOM.bolt.classList.add('idle');
    DOM.boltSpeech.classList.add('hidden');
  }

  // ─── EVENT LISTENERS ────────────────────────
  function setupEvents() {
    DOM.startBtn.addEventListener('click', startGame);

    DOM.secretsBtn.addEventListener('click', () => {
      GameAudio.click();
      populateSecretsModal();
      DOM.secretsModal.classList.remove('hidden');
    });

    DOM.closeSecretsBtn.addEventListener('click', () => {
      DOM.secretsModal.classList.add('hidden');
    });

    DOM.secretsModal.querySelector('.modal-overlay').addEventListener('click', () => {
      DOM.secretsModal.classList.add('hidden');
    });

    DOM.replayBtn.addEventListener('click', () => {
      DOM.gameOverScreen.classList.add('hidden');
      DOM.introScreen.classList.remove('hidden');
      DOM.introScreen.style.opacity = '1';
      showIntro();
    });

    DOM.downloadBtn.addEventListener('click', downloadScorecard);

    // Click/tap to move
    DOM.viewport.addEventListener('click', (e) => {
      if (state.phase !== 'PLAYING') return;
      const rect = DOM.viewport.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const worldX = clickX + state.cameraX;

      // Check if clicking a gate
      for (let i = 0; i < 3; i++) {
        if (state.gates[i]) continue;
        if (i > 0 && !state.gates[i - 1]) continue;
        const gateX = CFG.GATE_POSITIONS[i];
        const gateWorldX = gateX - state.cameraX;
        if (Math.abs(clickX - gateWorldX - 30) < 50) {
          if (Math.abs(state.boltX + 30 - gateX - 30) < CFG.GATE_RANGE) {
            unlockGate(i);
            return;
          }
        }
      }

      // Check if clicking station
      if (state.nearStation && !state.stationBuilt) {
        const stationWorldX = CFG.STATION_POSITION - state.cameraX;
        if (Math.abs(clickX - stationWorldX - 50) < 70) {
          buildRobot();
          return;
        }
      }

      GameAudio.click();
      moveBolt(worldX);
    });

    // Keyboard
    document.addEventListener('keydown', (e) => {
      if (state.phase !== 'PLAYING') return;

      const moveAmount = 200;
      if (e.key === 'ArrowRight' || e.key === 'd') {
        moveBolt(state.boltX + moveAmount);
      } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        moveBolt(state.boltX - moveAmount);
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (state.nearGate >= 0) {
          unlockGate(state.nearGate);
        } else if (state.nearStation && !state.stationBuilt) {
          buildRobot();
        }
      }
    });

    // Touch support for smoother mobile
    let touchStartX = 0;
    DOM.viewport.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    // Resize
    window.addEventListener('resize', () => {
      state.viewportW = DOM.viewport.offsetWidth || window.innerWidth;
      state.viewportH = DOM.viewport.offsetHeight || window.innerHeight;
    });
  }

  // ─── INIT ───────────────────────────────────
  function init() {
    cacheDom();
    setupEvents();
    showIntro();
    state.viewportW = window.innerWidth;
    state.viewportH = window.innerHeight;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
