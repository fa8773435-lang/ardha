(() => {
  'use strict';

  /* ---------- Elemen & state ---------- */
  const $ = (selector, root = document) => root.querySelector(selector);
  const scenes = [...document.querySelectorAll('.scene')];
  const counter = $('#counter');
  const progressFill = $('#progressFill');
  const progressLabel = $('#progressLabel');
  const dateDisplay = $('#dateDisplay');
  const feedback = $('#feedback');
  const options = $('#dateOptions');
  const music = $('#music');
  const musicToggle = $('#musicToggle');
  const loveLayer = $('#loveLayer');
  const burstLayer = $('#burstLayer');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rand = (min, max) => min + Math.random() * (max - min);
  const palette = ['#89664c', '#b28a70', '#c4a484', '#c98f84', '#d9a99c'];
  let current = 0;
  let unlocked = false;
  let heartTimer = 0;

  /* ---------- Memuat script cadangan (foto & musik versi base64) ---------- */
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src; s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  /* ---------- FOTO: coba beberapa lokasi, lalu cadangan ---------- */
  const photo = $('#heroPhoto');
  const photoFrame = photo ? photo.closest('.photo-frame') : null;
  const photoPaths = ['assets/ardha-photo.jpg', 'ardha-photo.jpg', '../assets/ardha-photo.jpg'];
  let photoStage = 1; // index 0 sudah dipakai di atribut src HTML
  let photoFallbackTried = false;

  function photoFailed() {
    if (photoStage < photoPaths.length) { photo.src = photoPaths[photoStage++]; return; }
    if (!photoFallbackTried) {
      photoFallbackTried = true;
      loadScript('fallback/photo-fallback.js')
        .then(() => { if (window.__PHOTO_B64) photo.src = window.__PHOTO_B64; else photoFrame.classList.add('missing'); })
        .catch(() => photoFrame.classList.add('missing'));
      return;
    }
    photoFrame.classList.add('missing');
  }
  if (photo) {
    photo.addEventListener('error', photoFailed);
    if (photo.complete && photo.naturalWidth === 0) photoFailed();
  }

  /* ---------- MUSIK: coba beberapa lokasi, lalu cadangan ---------- */
  const musicPaths = ['assets/birthday-music.mp3', 'birthday-music.mp3', '../assets/birthday-music.mp3'];
  let musicStage = 1; // index 0 sudah dipakai di atribut src HTML
  let musicFallbackTried = false;
  let musicWanted = false;
  music.volume = 0.8;

  function musicFailed() {
    if (musicStage < musicPaths.length) { music.src = musicPaths[musicStage++]; music.load(); return; }
    if (musicFallbackTried) return;
    musicFallbackTried = true;
    loadScript('fallback/music-fallback.js')
      .then(() => { if (window.__MUSIC_B64) { music.src = window.__MUSIC_B64; music.load(); } })
      .catch(() => {});
  }
  function syncMusicButton() {
    const playing = !music.paused;
    musicToggle.textContent = playing ? '♫' : '♪';
    musicToggle.classList.toggle('on', playing);
    musicToggle.setAttribute('aria-label', playing ? 'Matikan musik' : 'Aktifkan musik');
  }
  async function playMusic() {
    musicWanted = true;
    try { await music.play(); } catch { /* menunggu interaksi atau file belum siap; dicoba lagi saat canplay */ }
    syncMusicButton();
  }
  music.addEventListener('error', musicFailed);
  music.addEventListener('canplay', () => { if (musicWanted && music.paused) music.play().catch(() => {}); });
  music.addEventListener('play', syncMusicButton);
  music.addEventListener('pause', syncMusicButton);
  musicToggle.addEventListener('click', () => {
    if (music.paused) playMusic(); else { musicWanted = false; music.pause(); }
  });

  /* ---------- EFEK HATI: layer melayang per halaman ---------- */
  const heartConfigs = [
    { n: 26, min: 12, max: 38, dur: [9, 18],  o: [.22, .62], mode: 'rise' }, // 1 opening
    { n: 10, min: 10, max: 22, dur: [12, 20], o: [.14, .32], mode: 'rise' }, // 2 kunci
    { n: 16, min: 12, max: 30, dur: [10, 18], o: [.20, .50], mode: 'rise' }, // 3 foto
    { n: 14, min: 10, max: 24, dur: [12, 20], o: [.16, .40], mode: 'fall' }, // 4 ucapan
    { n: 12, min: 10, max: 26, dur: [10, 18], o: [.18, .45], mode: 'rise' }, // 5 jarak
    { n: 12, min: 10, max: 24, dur: [12, 20], o: [.16, .38], mode: 'fall' }, // 6 alasan
    { n: 18, min: 12, max: 30, dur: [9, 16],  o: [.20, .50], mode: 'rise' }, // 7 kalender
    { n: 34, min: 14, max: 40, dur: [8, 15],  o: [.25, .60], mode: 'rise' }  // 8 penutup
  ];
  function buildHearts(index) {
    const cfg = heartConfigs[index];
    const factor = (window.innerWidth < 760 ? .6 : 1) * (reduceMotion ? .3 : 1);
    loveLayer.className = `love-layer ${cfg.mode}`;
    loveLayer.textContent = '';
    for (let i = 0; i < Math.round(cfg.n * factor); i++) {
      const heart = document.createElement('i');
      heart.style.cssText = [
        `--x:${rand(0, 96).toFixed(1)}%`,
        `--s:${rand(cfg.min, cfg.max).toFixed(0)}px`,
        `--c:${palette[i % palette.length]}`,
        `--o:${rand(cfg.o[0], cfg.o[1]).toFixed(2)}`,
        `--d:${rand(cfg.dur[0], cfg.dur[1]).toFixed(1)}s`,
        `--delay:${(-rand(0, cfg.dur[1])).toFixed(1)}s`,
        `--drift:${rand(-45, 45).toFixed(0)}px`
      ].join(';');
      loveLayer.appendChild(heart);
    }
  }
  function swapHearts(index, instant) {
    window.clearTimeout(heartTimer);
    if (instant) { buildHearts(index); loveLayer.style.opacity = '1'; return; }
    loveLayer.style.opacity = '0';
    heartTimer = window.setTimeout(() => { buildHearts(index); loveLayer.style.opacity = '1'; }, 330);
  }

  /* ---------- EFEK HATI: ledakan saat momen penting ---------- */
  function burstAt(x, y, amount = 16, spread = 170) {
    const total = reduceMotion ? Math.min(amount, 5) : amount;
    for (let i = 0; i < total; i++) {
      const angle = rand(0, Math.PI * 2), dist = rand(50, spread);
      const pop = document.createElement('i');
      pop.className = 'pop';
      pop.style.cssText = [
        `--x:${x}px`, `--y:${y}px`, `--s:${rand(14, 30).toFixed(0)}px`,
        `--c:${palette[Math.floor(rand(0, palette.length))]}`,
        `--dx:${(Math.cos(angle) * dist).toFixed(0)}px`,
        `--dy:${(Math.sin(angle) * dist - rand(20, 80)).toFixed(0)}px`,
        `--r:${rand(-40, 40).toFixed(0)}deg`, `--d:${rand(1.1, 1.9).toFixed(2)}s`
      ].join(';');
      pop.addEventListener('animationend', () => pop.remove());
      burstLayer.appendChild(pop);
    }
  }
  function burstFrom(el, amount, spread) {
    const r = el.getBoundingClientRect();
    burstAt(r.left + r.width / 2, r.top + r.height / 2, amount, spread);
  }

  /* ---------- HATI BERJALAN DI PETA (Kediri → Jepang) ---------- */
  const map = $('.map');
  const route = $('.route');
  const trail = [];
  let trailFrame = 0;
  if (map && route && !reduceMotion) {
    for (let i = 0; i < 6; i++) {
      const heart = document.createElement('i');
      heart.className = 'heart trail-heart';
      map.appendChild(heart); trail.push(heart);
    }
  }
  function trailTick(time) {
    const length = route.getTotalLength();
    const sx = map.clientWidth / 700, sy = map.clientHeight / 230;
    trail.forEach((el, k) => {
      const progress = ((time / 7000) + k / trail.length) % 1;
      const point = route.getPointAtLength(progress * length);
      const fade = Math.sin(progress * Math.PI);
      el.style.opacity = (fade * .85).toFixed(2);
      el.style.transform = `translate(${point.x * sx}px,${point.y * sy}px) translate(-50%,-50%) scale(${(.6 + fade * .7).toFixed(2)})`;
    });
    trailFrame = requestAnimationFrame(trailTick);
  }
  function setTrail(active) {
    cancelAnimationFrame(trailFrame);
    if (active && trail.length) trailFrame = requestAnimationFrame(trailTick);
  }

  /* ---------- Animasi masuk per halaman (urut & halus) ---------- */
  // [selector, kelas]; kelas default 'rv'. Urutan array = urutan muncul.
  const revealPlan = {
    0: [['.eyebrow'], ['.script'], ['h1 .w'], ['h2'], ['.rule'], ['.muted'], ['.primary']],
    1: [['.intro > *'], ['.lock', 'rv-card'], ['.options button']],
    2: [['.intro > *'], ['.photo-frame', 'rv-photo'], ['.photo-wrap > .script']],
    3: [['.intro > *'], ['.greeting', 'rv-card'], ['.letter-text p'], ['.greeting .signature'], ['.next']],
    4: [['.intro > *'], ['.map', 'rv-card'], ['.place'], ['.distance-text p'], ['.primary']],
    5: [['.intro > *'], ['.reason', 'rv-card'], ['.next']],
    6: [['.intro > *'], ['.calendar-message'], ['.primary']],
    7: [['.intro > *'], ['.final-card', 'rv-card'], ['.final-text > *'], ['.restart'], ['.bottom-note']]
  };
  Object.entries(revealPlan).forEach(([index, steps]) => {
    let order = 0;
    steps.forEach(([selector, cls = 'rv']) => {
      scenes[index].querySelectorAll(selector).forEach(el => {
        el.classList.add(cls);
        el.style.setProperty('--i', Math.min(order, 16));
        order += cls === 'rv' ? 1 : 2; // kartu/foto diberi jeda lebih
      });
    });
  });

  /* ---------- Navigasi scene ---------- */
  function showScene(index) {
    if (index < 0 || index >= scenes.length || (index > 1 && !unlocked)) return;
    const first = scenes[index].classList.contains('active') && index === current && !loveLayer.childElementCount;
    scenes.forEach((scene, i) => {
      scene.classList.toggle('active', i === index);
      scene.setAttribute('aria-hidden', String(i !== index));
      if (i === index) scene.scrollTop = 0;
    });
    current = index;
    const number = String(index + 1).padStart(2, '0');
    counter.textContent = `${number} / 08`;
    progressLabel.textContent = `${number} — 08`;
    progressFill.style.width = `${((index + 1) / scenes.length) * 100}%`;
    swapHearts(index, first);
    setTrail(index === 4);
    if (index === scenes.length - 1) window.setTimeout(() => burstAt(window.innerWidth / 2, window.innerHeight * .45, 26, 240), 650);
  }
  document.querySelectorAll('[data-next]').forEach(button => button.addEventListener('click', () => showScene(current + 1)));
  $('#home').addEventListener('click', event => { event.preventDefault(); showScene(0); });

  // Tombol "Mulai kejutan": nyalakan musik (butuh klik pengunjung) + ledakan hati
  const startButton = $('.opening [data-next]');
  if (startButton) startButton.addEventListener('click', () => { playMusic(); burstFrom(startButton, 18, 200); });

  /* ---------- Permainan tanggal ---------- */
  function resetGame() {
    unlocked = false;
    dateDisplay.textContent = '_ _ _ _ _ _';
    feedback.textContent = 'Pilih salah satu tanggal di atas.';
    feedback.className = 'feedback';
    options.querySelectorAll('button').forEach(button => { button.disabled = false; button.classList.remove('selected'); });
    const lockCard = $('.lock'); if (lockCard) lockCard.classList.remove('shake');
  }
  options.addEventListener('click', event => {
    const button = event.target.closest('[data-value]');
    if (!button || button.disabled || unlocked) return;
    const answer = button.dataset.value;
    button.classList.add('selected');
    dateDisplay.textContent = answer.split('').join(' ');
    if (answer === '151225') {
      unlocked = true;
      feedback.textContent = 'Kunci terbuka! Kejutan untukmu dimulai 🤎';
      feedback.className = 'feedback success';
      options.querySelectorAll('button').forEach(item => item.disabled = true);
      burstFrom($('.lock-icon'), 22, 200);
      window.setTimeout(() => showScene(2), 1000);
    } else {
      feedback.textContent = 'Kunci salah! Coba tanggal yang lain, ya.';
      feedback.className = 'feedback error';
      const card = $('.lock');
      card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
      window.setTimeout(() => card.classList.remove('shake'), 450);
      window.setTimeout(() => {
        button.classList.remove('selected');
        dateDisplay.textContent = '_ _ _ _ _ _';
        feedback.textContent = 'Belum tepat. Coba sekali lagi 🤎';
        feedback.className = 'feedback';
      }, 850);
    }
  });
  $('#resetGame').addEventListener('click', resetGame);
  $('#restart').addEventListener('click', () => { resetGame(); showScene(0); });

  /* ---------- Kalender November 2001 (7 November 2001 = Rabu) ---------- */
  const calendar = $('#calendarDays');
  const offset = new Date(2001, 10, 1).getDay();
  const daysInMonth = new Date(2001, 11, 0).getDate();
  for (let i = 0; i < offset; i++) {
    const blank = document.createElement('span'); blank.setAttribute('aria-hidden', 'true'); calendar.appendChild(blank);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const cell = day === 7 ? document.createElement('button') : document.createElement('span');
    cell.textContent = day;
    cell.style.animationDelay = `${(offset + day) * 22}ms`;
    if (day === 7) {
      cell.type = 'button'; cell.className = 'special';
      cell.setAttribute('aria-label', '7 November 2001, tanggal kelahiran Mas Ardha');
      cell.addEventListener('click', () => {
        const message = $('#calendarMessage');
        message.innerHTML = '<small>THE DAY YOU WERE BORN</small><p>7 November 2001 — hari ketika manusia favoritku hadir. 🤎</p>';
        message.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 500 });
        burstFrom(cell, 24, 210);
      });
    }
    calendar.appendChild(cell);
  }

  /* ---------- Kucing di halaman pertama ---------- */
  const cat = $('#cat');
  const bubble = $('#catBubble');
  const catLines = [
    'meow~ selamat ulang tahun, Mas! 🤍',
    'mrrp~ ada kejutan buat Mas Ardha',
    'purrr... klik "Mulai kejutan", yaa',
    'nyaa~ aku juga sayang Mas Ardha',
    'meow! semoga semua doamu terkabul 🤎'
  ];
  let catIndex = 0, bubbleTimer = 0;
  function say(text, ms = 3800) {
    bubble.textContent = text;
    bubble.classList.add('show');
    window.clearTimeout(bubbleTimer);
    bubbleTimer = window.setTimeout(() => bubble.classList.remove('show'), ms);
  }
  cat.addEventListener('click', () => {
    cat.classList.remove('jump'); void cat.offsetWidth; cat.classList.add('jump');
    window.setTimeout(() => cat.classList.remove('jump'), 600);
    say(catLines[catIndex++ % catLines.length]);
    const r = cat.getBoundingClientRect();
    burstAt(r.left + r.width / 2, r.top + r.height * .25, 12, 130);
  });
  window.setTimeout(() => { if (current === 0) say(catLines[0], 4800); }, 1700);

  // Mata kucing mengikuti kursor / sentuhan
  const catSvg = $('.cat-svg');
  window.addEventListener('pointermove', event => {
    if (current !== 0 || reduceMotion) return;
    const r = catSvg.getBoundingClientRect();
    const dx = event.clientX - (r.left + r.width * .5);
    const dy = event.clientY - (r.top + r.height * .46);
    const dist = Math.hypot(dx, dy) || 1;
    const k = Math.min(1, dist / 260);
    cat.style.setProperty('--ex', `${(dx / dist * 2.6 * k).toFixed(2)}px`);
    cat.style.setProperty('--ey', `${(dy / dist * 2.2 * k).toFixed(2)}px`);
  }, { passive: true });

  // Sesekali ada hati kecil keluar dari kucing
  window.setInterval(() => {
    if (current !== 0 || document.hidden || reduceMotion) return;
    const heart = document.createElement('i');
    heart.className = 'cat-love';
    heart.style.left = `${rand(38, 62).toFixed(0)}%`;
    heart.style.setProperty('--dx', `${rand(-28, 28).toFixed(0)}px`);
    heart.addEventListener('animationend', () => heart.remove());
    cat.appendChild(heart);
  }, 2800);

  /* ---------- Mulai ---------- */
  syncMusicButton();
  resetGame();
  showScene(0);
})();
