/* =============================================
   BOLT'S WORKSHOP — Game Engine
   ============================================= */

;(function () {
  'use strict';

  // ─── CONFIG ──────────────────────────────────
  const CFG = {
    WORLD_WIDTH: 4500,
    GROUND_RATIO: 0.28,
    BOLT_SPEED: 220,       // px per second
    COLLECT_RANGE: 70,
    STATION_RANGE: 100,
    GAME_DURATION: 120,    // seconds
    PART_RESPAWN_DELAY: 6, // seconds
    PARTS_PER_SPAWN: 4,
    PRODUCTION_INTERVAL: 4, // seconds between robot productions

    ZONES: [
      { id: 0, start: 0,    end: 1480, partTypes: ['gear', 'bolt_part'] },
      { id: 1, start: 1500, end: 2980, partTypes: ['circuit', 'motor', 'gear'] },
      { id: 2, start: 3000, end: 4450, partTypes: ['lens', 'circuit', 'motor'] }
    ],

    MACHINES: [
      {
        name: 'Spark Welder',
        desc: 'A simple welder that fuses scrap into little round bots!',
        icon: '⚡',
        emoji: '🔥',
        zone: 0,
        capacity: 3,
        points: 10,
        required: { gear: 3, bolt_part: 2 }
      },
      {
        name: 'Gyro Assembler',
        desc: 'A precision assembler that spins together medium bots.',
        icon: '🌀',
        emoji: '⚙️',
        zone: 1,
        capacity: 4,
        points: 20,
        required: { circuit: 2, motor: 2, gear: 1 }
      },
      {
        name: 'Quantum Fabricator',
        desc: 'An advanced fabricator that materializes special glowing bots!',
        icon: '💎',
        emoji: '✨',
        zone: 2,
        capacity: 5,
        points: 50,
        required: { lens: 2, circuit: 2, motor: 1 }
      }
    ],

    PART_INFO: {
      gear:      { emoji: '⚙️', name: 'Gear',    color: '#FFA64D' },
      bolt_part: { emoji: '🔩', name: 'Bolt',    color: '#AAAACC' },
      circuit:   { emoji: '⚡', name: 'Circuit', color: '#7ED957' },
      motor:     { emoji: '🔋', name: 'Motor',   color: '#FF6B6B' },
      lens:      { emoji: '🔮', name: 'Lens',    color: '#B88CFF' }
    },

    FRIEND_COLORS: ['friend-pink', 'friend-purple', 'friend-yellow', 'friend-green', 'friend-orange'],

    STORY_TEXT: "In a forgotten corner of an old workshop, a small robot named Bolt wakes up... alone. " +
               "The workshop is full of dusty parts and faded blueprints. " +
               "Some machines here can create new robots — friends for Bolt! " +
               "Quick, the emergency power won't last long... ⚡"
  };

  // ─── STATE ───────────────────────────────────
  const state = {
    phase: 'INTRO', // INTRO, PLAYING, GAME_OVER
    timer: CFG.GAME_DURATION,
    score: 0,
    friendsCount: 0,

    // Bolt
    boltX: 200,
    boltTargetX: 200,
    boltMoving: false,
    boltDir: 1, // 1 = right, -1 = left

    // Camera
    cameraX: 0,
    viewportW: 0,
    viewportH: 0,

    // Inventory
    inventory: { gear: 0, bolt_part: 0, circuit: 0, motor: 0, lens: 0 },

    // Zones
    zonesUnlocked: [true, false, false],

    // Machines
    machines: [
      { built: false, produced: 0, producing: false, prodTimer: 0 },
      { built: false, produced: 0, producing: false, prodTimer: 0 },
      { built: false, produced: 0, producing: false, prodTimer: 0 }
    ],

    // Parts on ground
    activeParts: [],
    partIdCounter: 0,
    partRespawnTimers: [0, 0, 0],

    // Friends on screen
    friends: [],

    // UI
    nearStation: -1,
    buildPanelOpen: false,
    buildPanelStation: -1,

    // Time tracking
    lastTimestamp: 0,
    timerAccum: 0

  };

  // ─── DOM REFS ────────────────────────────────
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const DOM = {};

  function cacheDom() {
    DOM.introScreen    = $('#intro-screen');
    DOM.storyText      = $('#story-text');
    DOM.startBtn       = $('#start-btn');
    DOM.introInstr     = $('#intro-instructions');

    DOM.hud            = $('#hud');
    DOM.timerDisplay   = $('#timer-display');
    DOM.timerValue     = $('#timer-value');
    DOM.scoreValue     = $('#score-value');
    DOM.friendsValue   = $('#friends-value');
    DOM.inventoryDisp  = $('#inventory-display');

    DOM.notifications  = $('#notifications');
    DOM.viewport       = $('#viewport');
    DOM.world          = $('#world');
    DOM.ground         = $('#ground');
    DOM.bolt           = $('#bolt');
    DOM.boltSpeech     = $('#bolt-speech');
    DOM.partsContainer = $('#parts-container');
    DOM.friendsContainer = $('#friends-container');
    DOM.effectsContainer = $('#effects-container');

    DOM.arrowLeft      = $('#arrow-left');
    DOM.arrowRight     = $('#arrow-right');

    DOM.gates = [null, $('#gate-2'), $('#gate-3')];
    DOM.stations = [
      $('#station-0'),
      $('#station-1'),
      $('#station-2')
    ];

    DOM.buildPanel     = $('#build-panel');
    DOM.machineName    = $('#machine-name');
    DOM.machineDesc    = $('#machine-desc');
    DOM.blueprintDisp  = $('#blueprint-display');
    DOM.partsNeeded    = $('#parts-needed');
    DOM.buildBtn       = $('#build-btn');
    DOM.panelHint      = $('#panel-hint');
    DOM.closePanelBtn  = $('#close-panel-btn');

    DOM.gameOverScreen = $('#game-over-screen');
    DOM.starRating     = $('#star-rating');
    DOM.finalScore     = $('#final-score');
    DOM.finalFriends   = $('#final-friends-text');
    DOM.friendsGallery = $('#friends-gallery');
    DOM.replayBtn      = $('#replay-btn');
  }

  // ─── AUDIO (Web Audio API Synth) ─────────────
  const Audio = (() => {
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
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(c.currentTime + (delay || 0));
        osc.stop(c.currentTime + (delay || 0) + duration);
      } catch (e) { /* audio not available */ }
    }

    return {
      pickup() {
        playTone(880, 0.1, 'sine', 0.08);
        playTone(1100, 0.1, 'sine', 0.06, 0.05);
      },
      build() {
        playTone(523, 0.15, 'triangle', 0.1);
        playTone(659, 0.15, 'triangle', 0.1, 0.12);
        playTone(784, 0.2, 'triangle', 0.1, 0.24);
      },
      robot() {
        playTone(600, 0.1, 'square', 0.05);
        playTone(800, 0.1, 'square', 0.05, 0.08);
      },
      unlock() {
        playTone(400, 0.15, 'triangle', 0.08);
        playTone(500, 0.15, 'triangle', 0.08, 0.1);
        playTone(600, 0.15, 'triangle', 0.08, 0.2);
        playTone(800, 0.25, 'triangle', 0.1, 0.3);
      },
      click() {
        playTone(660, 0.06, 'sine', 0.05);
      },
      gameOver() {
        playTone(784, 0.3, 'sine', 0.08);
        playTone(659, 0.3, 'sine', 0.08, 0.25);
        playTone(523, 0.4, 'sine', 0.08, 0.5);
        playTone(784, 0.5, 'triangle', 0.06, 0.8);
      },
      tick() {
        playTone(1000, 0.03, 'sine', 0.04);
      }
    };
  })();

  // ─── INVENTORY UI ────────────────────────────
  function initInventoryUI() {
    DOM.inventoryDisp.innerHTML = '';
    for (const key in CFG.PART_INFO) {
      const info = CFG.PART_INFO[key];
      const el = document.createElement('div');
      el.className = 'inv-item';
      el.id = 'inv-' + key;
      el.innerHTML = `<span>${info.emoji}</span><span class="inv-count" id="inv-count-${key}">0</span>`;
      DOM.inventoryDisp.appendChild(el);
    }
  }

  function updateInventoryUI() {
    for (const key in state.inventory) {
      const countEl = $(`#inv-count-${key}`);
      if (countEl) countEl.textContent = state.inventory[key];
    }
  }

  function bumpInventoryItem(partType) {
    const el = $(`#inv-${partType}`);
    if (el) {
      el.classList.remove('bump');
      void el.offsetWidth; // reflow
      el.classList.add('bump');
    }
  }

  // ─── NOTIFICATIONS ──────────────────────────
  function notify(text, type) {
    const el = document.createElement('div');
    el.className = 'notification ' + (type || '');
    el.textContent = text;
    DOM.notifications.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }

  // ─── SPEECH BUBBLE ──────────────────────────
  let speechTimeout;
  function boltSay(text, duration) {
    clearTimeout(speechTimeout);
    DOM.boltSpeech.textContent = text;
    DOM.boltSpeech.classList.remove('hidden');
    speechTimeout = setTimeout(() => {
      DOM.boltSpeech.classList.add('hidden');
    }, duration || 2000);
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
    for (let i = 0; i < 15; i++) {
      const mote = document.createElement('div');
      mote.className = 'dust-mote';
      mote.style.left = Math.random() * CFG.WORLD_WIDTH + 'px';
      mote.style.top = (state.viewportH * 0.4 + Math.random() * state.viewportH * 0.3) + 'px';
      mote.style.animationDuration = (6 + Math.random() * 8) + 's';
      mote.style.animationDelay = Math.random() * 10 + 's';
      mote.style.width = (2 + Math.random() * 3) + 'px';
      mote.style.height = mote.style.width;
      DOM.world.appendChild(mote);
    }
  }

  // ─── PARTS SYSTEM ───────────────────────────
  function spawnPartsInZone(zoneIndex) {
    const zone = CFG.ZONES[zoneIndex];
    if (!state.zonesUnlocked[zoneIndex]) return;

    const groundY = state.viewportH * (1 - CFG.GROUND_RATIO);

    for (let i = 0; i < CFG.PARTS_PER_SPAWN; i++) {
      const type = zone.partTypes[Math.floor(Math.random() * zone.partTypes.length)];
      const info = CFG.PART_INFO[type];
      const x = zone.start + 80 + Math.random() * (zone.end - zone.start - 160);
      const y = groundY - 30 - Math.random() * 60;

      const id = state.partIdCounter++;
      const el = document.createElement('div');
      el.className = 'part-item';
      el.id = 'part-' + id;
      el.dataset.partId = id;
      el.textContent = info.emoji;
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      el.style.animationDelay = (Math.random() * 2) + 's';

      DOM.partsContainer.appendChild(el);

      state.activeParts.push({
        id, type, x, y, el, zone: zoneIndex, collected: false
      });
    }
  }

  function collectPart(part) {
    if (part.collected) return;
    part.collected = true;
    state.inventory[part.type]++;

    // Visual
    part.el.classList.add('collected');
    spawnSparkles(part.x + 18, part.y, 4, CFG.PART_INFO[part.type].color);
    Audio.pickup();
    bumpInventoryItem(part.type);
    updateInventoryUI();

    // Remove after animation
    setTimeout(() => {
      part.el.remove();
      state.activeParts = state.activeParts.filter(p => p.id !== part.id);
    }, 500);

    // Cute reaction
    const reactions = ['Found it!', 'Shiny!', 'Ooh!', 'Nice!', 'Got it!', 'Yay!'];
    boltSay(reactions[Math.floor(Math.random() * reactions.length)], 1200);
  }

  function checkPartCollection() {
    for (const part of state.activeParts) {
      if (part.collected) continue;
      const dx = Math.abs(state.boltX + 30 - part.x - 18);
      if (dx < CFG.COLLECT_RANGE) {
        collectPart(part);
      }
    }
  }

  function updatePartRespawn(dt) {
    for (let i = 0; i < 3; i++) {
      if (!state.zonesUnlocked[i]) continue;

      // Count active parts in this zone
      const activeParts = state.activeParts.filter(p => p.zone === i && !p.collected);
      if (activeParts.length === 0) {
        state.partRespawnTimers[i] += dt;
        if (state.partRespawnTimers[i] >= CFG.PART_RESPAWN_DELAY) {
          state.partRespawnTimers[i] = 0;
          spawnPartsInZone(i);
        }
      } else {
        state.partRespawnTimers[i] = 0;
      }
    }
  }

  // ─── MACHINE BUILDING ──────────────────────
  function openBuildPanel(stationIndex) {
    if (state.buildPanelOpen) return;
    if (state.machines[stationIndex].built) return;

    state.buildPanelOpen = true;
    state.buildPanelStation = stationIndex;
    const machine = CFG.MACHINES[stationIndex];

    DOM.machineName.textContent = machine.icon + ' ' + machine.name;
    DOM.machineDesc.textContent = machine.desc;
    DOM.blueprintDisp.textContent = machine.emoji;

    updateBuildPanel();

    DOM.buildPanel.classList.remove('hidden');
    Audio.click();
  }

  function updateBuildPanel() {
    const stationIndex = state.buildPanelStation;
    if (stationIndex < 0) return;
    const machine = CFG.MACHINES[stationIndex];

    DOM.partsNeeded.innerHTML = '';
    let canBuild = true;

    for (const [partType, needed] of Object.entries(machine.required)) {
      const info = CFG.PART_INFO[partType];
      const have = state.inventory[partType];
      const fulfilled = have >= needed;
      if (!fulfilled) canBuild = false;

      const slot = document.createElement('div');
      slot.className = 'part-slot' + (fulfilled ? ' fulfilled' : '');
      slot.innerHTML = `
        <span class="part-icon">${info.emoji}</span>
        <span class="part-count">${have}/${needed}</span>
      `;
      DOM.partsNeeded.appendChild(slot);
    }

    DOM.buildBtn.disabled = !canBuild;
    DOM.panelHint.textContent = canBuild
      ? 'All parts ready! Hit Build!'
      : 'Collect parts from the workshop!';
  }

  function closeBuildPanel() {
    state.buildPanelOpen = false;
    state.buildPanelStation = -1;
    DOM.buildPanel.classList.add('hidden');
  }

  function buildMachine() {
    const idx = state.buildPanelStation;
    if (idx < 0) return;
    const machineCfg = CFG.MACHINES[idx];

    // Consume parts
    for (const [partType, needed] of Object.entries(machineCfg.required)) {
      state.inventory[partType] -= needed;
    }
    updateInventoryUI();

    // Mark built
    state.machines[idx].built = true;
    state.machines[idx].producing = true;
    state.machines[idx].prodTimer = 0;

    // Visual: show machine on station
    const stationEl = DOM.stations[idx];
    const machineEl = stationEl.querySelector('.station-machine');
    machineEl.innerHTML = machineCfg.emoji;
    machineEl.classList.remove('hidden');
    machineEl.classList.add('active');
    stationEl.querySelector('.station-sign').style.borderColor = '#7ED957';
    stationEl.querySelector('.station-sign').textContent = '✅ ' + machineCfg.name;

    // Effects
    const rect = stationEl.getBoundingClientRect();
    const stationX = parseFloat(stationEl.style.left) + 50;
    const groundY = state.viewportH * (1 - CFG.GROUND_RATIO);
    spawnSparkles(stationX, groundY - 40, 10, '#FFD93D');
    Audio.build();

    notify('🔧 ' + machineCfg.name + ' built!', 'success');
    boltSay('It works! ✨', 2000);

    closeBuildPanel();
  }

  function updateMachineProduction(dt) {
    for (let i = 0; i < state.machines.length; i++) {
      const m = state.machines[i];
      const cfg = CFG.MACHINES[i];
      if (!m.built || !m.producing) continue;

      m.prodTimer += dt;
      if (m.prodTimer >= CFG.PRODUCTION_INTERVAL) {
        m.prodTimer = 0;
        m.produced++;

        // Produce a robot friend!
        produceRobotFriend(i);

        // Check capacity
        if (m.produced >= cfg.capacity) {
          m.producing = false;
          // Deplete machine visual
          const machineEl = DOM.stations[i].querySelector('.station-machine');
          machineEl.classList.remove('active');
          machineEl.classList.add('depleted');

          // Unlock next zone
          if (i + 1 < state.zonesUnlocked.length && !state.zonesUnlocked[i + 1]) {
            unlockZone(i + 1);
          }

          notify('⚠️ ' + cfg.name + ' capacity reached!', '');
        }
      }
    }
  }

  // ─── ROBOT FRIENDS ──────────────────────────
  function produceRobotFriend(machineIndex) {
    const cfg = CFG.MACHINES[machineIndex];
    const stationEl = DOM.stations[machineIndex];
    const stationX = parseFloat(stationEl.style.left);
    const groundY = state.viewportH * (1 - CFG.GROUND_RATIO);

    // Score
    state.score += cfg.points;
    state.friendsCount++;
    updateHUD();

    // Create friend visually
    const colorClass = CFG.FRIEND_COLORS[Math.floor(Math.random() * CFG.FRIEND_COLORS.length)];
    const friendX = stationX + 100 + (state.friends.length % 6) * 40;
    const friendY = groundY - 10;

    const el = document.createElement('div');
    el.className = 'mini-friend ' + colorClass;
    el.style.left = friendX + 'px';
    el.style.top = friendY + 'px';
    el.innerHTML = `
      <div class="robot-char">
        <div class="antenna"><div class="antenna-stick"></div><div class="antenna-ball"></div></div>
        <div class="r-head">
          <div class="r-eye left"><div class="pupil"></div><div class="shine"></div></div>
          <div class="r-eye right"><div class="pupil"></div><div class="shine"></div></div>
          <div class="r-blush left"></div>
          <div class="r-blush right"></div>
          <div class="r-mouth smile"></div>
        </div>
        <div class="r-body"><div class="r-heart">♥</div></div>
        <div class="r-arm left-arm"></div>
        <div class="r-arm right-arm"></div>
        <div class="r-leg left-leg"></div>
        <div class="r-leg right-leg"></div>
      </div>
    `;
    DOM.friendsContainer.appendChild(el);

    state.friends.push({ el, x: friendX, color: colorClass });

    // Effects
    spawnSparkles(friendX + 15, friendY - 30, 8, '#FFB6C1');
    Audio.robot();

    // Production indicator above station
    const indicator = document.createElement('div');
    indicator.className = 'production-indicator';
    indicator.textContent = '+' + cfg.points + ' pts! 🤖';
    indicator.style.left = stationX + 50 + 'px';
    indicator.style.top = (groundY - 140) + 'px';
    DOM.world.appendChild(indicator);
    setTimeout(() => indicator.remove(), 1000);

    // Bolt celebrates
    DOM.bolt.classList.remove('celebrating');
    void DOM.bolt.offsetWidth;
    DOM.bolt.classList.add('celebrating');
    setTimeout(() => DOM.bolt.classList.remove('celebrating'), 600);

    // Speech
    const phrases = ['New friend!', 'Welcome!', 'Hello! 💕', 'Yay! 🎉', 'Hi there!', 'Buddy! 🤖'];
    boltSay(phrases[Math.floor(Math.random() * phrases.length)], 1800);

    notify('🤖 New robot friend! +' + cfg.points + 'pts', 'celebrate');
  }

  // ─── ZONE UNLOCKING ─────────────────────────
  function unlockZone(zoneIndex) {
    if (state.zonesUnlocked[zoneIndex]) return;
    state.zonesUnlocked[zoneIndex] = true;

    // Gate animation
    if (DOM.gates[zoneIndex]) {
      DOM.gates[zoneIndex].classList.add('unlocked');
    }

    // Spawn parts in new zone
    setTimeout(() => {
      spawnPartsInZone(zoneIndex);
    }, 800);

    Audio.unlock();
    notify('🔓 New workshop zone discovered!', 'unlock');
    boltSay('A new area! 🗺️', 2500);
  }

  // ─── BOLT MOVEMENT ──────────────────────────
  function moveBolt(targetX) {
    // Clamp to unlocked zones
    let maxX = 0;
    for (let i = state.zonesUnlocked.length - 1; i >= 0; i--) {
      if (state.zonesUnlocked[i]) {
        maxX = CFG.ZONES[i].end;
        break;
      }
    }
    targetX = Math.max(30, Math.min(targetX, maxX - 30));
    state.boltTargetX = targetX;
    state.boltMoving = true;

    // Set direction
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
      const move = Math.sign(dx) * CFG.BOLT_SPEED * dt;
      if (Math.abs(move) > Math.abs(dx)) {
        state.boltX = state.boltTargetX;
      } else {
        state.boltX += move;
      }
    }

    // Position Bolt
    DOM.bolt.style.left = state.boltX + 'px';

    // Check part collection
    checkPartCollection();

    // Check station proximity
    checkStationProximity();
  }

  // ─── STATION PROXIMITY ──────────────────────
  function checkStationProximity() {
    let nearIdx = -1;
    for (let i = 0; i < DOM.stations.length; i++) {
      if (!state.zonesUnlocked[CFG.MACHINES[i].zone]) continue;
      if (state.machines[i].built) continue;

      const stationX = parseFloat(DOM.stations[i].style.left) + 50;
      if (Math.abs(state.boltX + 30 - stationX) < CFG.STATION_RANGE) {
        nearIdx = i;
        break;
      }
    }

    if (nearIdx !== state.nearStation) {
      // Hide old prompt
      if (state.nearStation >= 0) {
        DOM.stations[state.nearStation].querySelector('.station-prompt').classList.add('hidden');
      }
      // Show new prompt
      if (nearIdx >= 0) {
        DOM.stations[nearIdx].querySelector('.station-prompt').classList.remove('hidden');
      }
      state.nearStation = nearIdx;
    }
  }

  // ─── CAMERA ──────────────────────────────────
  function updateCamera() {
    const targetCamX = state.boltX - state.viewportW / 2 + 30;
    const maxCamX = CFG.WORLD_WIDTH - state.viewportW;
    state.cameraX += (Math.max(0, Math.min(targetCamX, maxCamX)) - state.cameraX) * 0.08;
    DOM.world.style.transform = `translateX(${-state.cameraX}px)`;

    // Arrow hints
    if (state.cameraX > 50) {
      DOM.arrowLeft.classList.remove('hidden');
    } else {
      DOM.arrowLeft.classList.add('hidden');
    }

    let maxZoneEnd = 0;
    for (let i = state.zonesUnlocked.length - 1; i >= 0; i--) {
      if (state.zonesUnlocked[i]) { maxZoneEnd = CFG.ZONES[i].end; break; }
    }
    if (state.boltX < maxZoneEnd - state.viewportW * 0.6) {
      DOM.arrowRight.classList.remove('hidden');
    } else {
      DOM.arrowRight.classList.add('hidden');
    }
  }

  // ─── HUD UPDATE ──────────────────────────────
  function updateHUD() {
    const mins = Math.floor(state.timer / 60);
    const secs = Math.floor(state.timer % 60);
    DOM.timerValue.textContent = mins + ':' + (secs < 10 ? '0' : '') + secs;

    if (state.timer <= 30) {
      DOM.timerDisplay.classList.add('urgent');
    } else {
      DOM.timerDisplay.classList.remove('urgent');
    }

    DOM.scoreValue.textContent = state.score;
    DOM.friendsValue.textContent = state.friendsCount;
  }

  // ─── TIMER ───────────────────────────────────
  function updateTimer(dt) {
    state.timer -= dt;
    if (state.timer <= 0) {
      state.timer = 0;
      gameOver();
      return;
    }

    // Tick sound in last 10 seconds
    state.timerAccum += dt;
    if (state.timer <= 10 && state.timerAccum >= 1) {
      state.timerAccum = 0;
      Audio.tick();
    }

    updateHUD();
  }

  // ─── GAME OVER ──────────────────────────────
  function gameOver() {
    state.phase = 'GAME_OVER';

    Audio.gameOver();

    // Star rating
    let stars = 0;
    if (state.score >= 30) stars = 1;
    if (state.score >= 100) stars = 2;
    if (state.score >= 200) stars = 3;

    DOM.starRating.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      const span = document.createElement('span');
      span.className = 'star';
      span.textContent = i < stars ? '⭐' : '☆';
      DOM.starRating.appendChild(span);
    }

    DOM.finalScore.textContent = state.score;
    DOM.finalFriends.textContent = state.friendsCount + ' Robot Friend' + (state.friendsCount !== 1 ? 's' : '') + ' Made!';

    // Friends gallery
    DOM.friendsGallery.innerHTML = '';
    state.friends.forEach((friend, i) => {
      const wrap = document.createElement('div');
      wrap.className = 'gallery-friend ' + friend.color;
      wrap.style.animationDelay = (i * 0.1) + 's';
      wrap.innerHTML = `
        <div class="robot-char">
          <div class="antenna"><div class="antenna-stick"></div><div class="antenna-ball"></div></div>
          <div class="r-head">
            <div class="r-eye left"><div class="pupil"></div><div class="shine"></div></div>
            <div class="r-eye right"><div class="pupil"></div><div class="shine"></div></div>
            <div class="r-blush left"></div>
            <div class="r-blush right"></div>
            <div class="r-mouth smile"></div>
          </div>
          <div class="r-body"><div class="r-heart">♥</div></div>
          <div class="r-arm left-arm"></div>
          <div class="r-arm right-arm"></div>
          <div class="r-leg left-leg"></div>
          <div class="r-leg right-leg"></div>
        </div>
      `;
      DOM.friendsGallery.appendChild(wrap);
    });

    // If no friends
    if (state.friendsCount === 0) {
      DOM.finalFriends.textContent = "Bolt is still alone... Try again! 💪";
    }

    DOM.hud.classList.add('hidden');
    DOM.viewport.classList.add('hidden');
    DOM.gameOverScreen.classList.remove('hidden');
  }

  // ─── GAME LOOP ──────────────────────────────
  function gameLoop(timestamp) {
    if (state.phase !== 'PLAYING') return;

    if (!state.lastTimestamp) state.lastTimestamp = timestamp;
    const dt = Math.min((timestamp - state.lastTimestamp) / 1000, 0.05); // cap delta
    state.lastTimestamp = timestamp;

    // Update
    updateTimer(dt);
    if (state.phase !== 'PLAYING') return; // timer may have ended game

    updateBolt(dt);
    updateCamera();
    updatePartRespawn(dt);
    updateMachineProduction(dt);

    // Update build panel if open
    if (state.buildPanelOpen) {
      updateBuildPanel();
    }

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
    typewriterEffect(CFG.STORY_TEXT, DOM.storyText, 35, () => {
      DOM.startBtn.style.display = '';
      DOM.introInstr.style.display = '';
      DOM.startBtn.style.animation = 'fadeIn 0.6s ease';
      DOM.introInstr.style.animation = 'fadeIn 0.8s ease 0.3s both';
    });
  }

  // ─── START GAME ─────────────────────────────
  function startGame() {
    Audio.click();

    // Fade out intro
    DOM.introScreen.style.opacity = '0';
    setTimeout(() => {
      DOM.introScreen.classList.add('hidden');
    }, 800);

    // Reset state
    resetState();

    // Measure viewport
    state.viewportW = DOM.viewport.offsetWidth || window.innerWidth;
    state.viewportH = DOM.viewport.offsetHeight || window.innerHeight;

    // Setup
    initInventoryUI();
    updateInventoryUI();
    updateHUD();

    // Position Bolt
    state.boltX = 200;
    state.boltTargetX = 200;
    DOM.bolt.style.left = state.boltX + 'px';
    DOM.bolt.classList.add('idle');

    // Spawn initial parts
    spawnPartsInZone(0);

    // Spawn dust motes for atmosphere
    spawnDustMotes();

    // Show game UI
    DOM.hud.classList.remove('hidden');
    DOM.viewport.classList.remove('hidden');

    // Start
    state.phase = 'PLAYING';
    state.lastTimestamp = 0;
    requestAnimationFrame(gameLoop);

    // Initial speech
    setTimeout(() => boltSay("Let's find some parts! 🔍", 2500), 500);
  }

  function resetState() {
    state.timer = CFG.GAME_DURATION;
    state.score = 0;
    state.friendsCount = 0;
    state.boltX = 200;
    state.boltTargetX = 200;
    state.boltMoving = false;
    state.boltDir = 1;
    state.cameraX = 0;
    state.inventory = { gear: 0, bolt_part: 0, circuit: 0, motor: 0, lens: 0 };
    state.zonesUnlocked = [true, false, false];
    state.machines = [
      { built: false, produced: 0, producing: false, prodTimer: 0 },
      { built: false, produced: 0, producing: false, prodTimer: 0 },
      { built: false, produced: 0, producing: false, prodTimer: 0 }
    ];
    state.activeParts = [];
    state.partIdCounter = 0;
    state.partRespawnTimers = [0, 0, 0];
    state.friends = [];
    state.nearStation = -1;
    state.buildPanelOpen = false;
    state.buildPanelStation = -1;
    state.timerAccum = 0;

    // Reset DOM
    DOM.partsContainer.innerHTML = '';
    DOM.friendsContainer.innerHTML = '';
    DOM.effectsContainer.innerHTML = '';
    DOM.bolt.classList.remove('facing-left', 'walking', 'celebrating');
    DOM.bolt.classList.add('idle');
    DOM.boltSpeech.classList.add('hidden');
    DOM.timerDisplay.classList.remove('urgent');

    // Reset gates
    if (DOM.gates[1]) DOM.gates[1].classList.remove('unlocked');
    if (DOM.gates[2]) DOM.gates[2].classList.remove('unlocked');

    // Reset stations
    DOM.stations.forEach((sEl, i) => {
      const machineEl = sEl.querySelector('.station-machine');
      machineEl.classList.add('hidden');
      machineEl.classList.remove('active', 'depleted');
      machineEl.innerHTML = '';
      sEl.querySelector('.station-prompt').classList.add('hidden');
      sEl.querySelector('.station-sign').textContent = '🔧 ' + CFG.MACHINES[i].name;
      sEl.querySelector('.station-sign').style.borderColor = '';
    });

    // Remove dust motes
    document.querySelectorAll('.dust-mote').forEach(m => m.remove());
    document.querySelectorAll('.production-indicator').forEach(p => p.remove());
  }

  // ─── EVENT LISTENERS ────────────────────────
  function setupEvents() {
    // Start button
    DOM.startBtn.addEventListener('click', startGame);

    // Replay button
    DOM.replayBtn.addEventListener('click', () => {
      DOM.gameOverScreen.classList.add('hidden');
      DOM.introScreen.classList.remove('hidden');
      DOM.introScreen.style.opacity = '1';
      showIntro();
    });

    // Click to move in viewport
    DOM.viewport.addEventListener('click', (e) => {
      if (state.phase !== 'PLAYING' || state.buildPanelOpen) return;

      const rect = DOM.viewport.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const worldX = clickX + state.cameraX;
      Audio.click();
      moveBolt(worldX);
    });

    // Station clicks
    DOM.stations.forEach((sEl, i) => {
      sEl.addEventListener('click', (e) => {
        e.stopPropagation();
        if (state.phase !== 'PLAYING') return;
        if (state.nearStation === i && !state.machines[i].built) {
          openBuildPanel(i);
        }
      });
    });

    // Build button
    DOM.buildBtn.addEventListener('click', () => {
      if (!DOM.buildBtn.disabled) {
        buildMachine();
      }
    });

    // Close panel
    DOM.closePanelBtn.addEventListener('click', closeBuildPanel);

    // Panel overlay click to close
    DOM.buildPanel.querySelector('.panel-overlay').addEventListener('click', closeBuildPanel);

    // Keyboard
    document.addEventListener('keydown', (e) => {
      if (state.phase !== 'PLAYING') return;

      if (e.key === 'Escape' && state.buildPanelOpen) {
        closeBuildPanel();
        return;
      }

      if (state.buildPanelOpen) return;

      // Arrow key movement
      const moveAmount = 200;
      if (e.key === 'ArrowRight' || e.key === 'd') {
        moveBolt(state.boltX + moveAmount);
      } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        moveBolt(state.boltX - moveAmount);
      } else if ((e.key === ' ' || e.key === 'Enter') && state.nearStation >= 0) {
        e.preventDefault();
        openBuildPanel(state.nearStation);
      }
    });

    // Resize handler
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

    // Set initial viewport size
    state.viewportW = window.innerWidth;
    state.viewportH = window.innerHeight;
  }

  // Start when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
