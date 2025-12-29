const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { alpha: true });

// Dynamic year (current year + 1)
const yearEl = document.getElementById("year");
// New Year animation target year
const today = new Date();
const currentYear = today.getFullYear();
const nextNewYear = new Date(currentYear + 1, 0, 1); // Jan 1 of next year
const targetYear = today < nextNewYear ? currentYear + 1 : currentYear + 2;
// Set text content
yearEl.textContent = targetYear;

function resize() {
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", resize);
resize();

const rockets = [];
const particles = [];

const rand = (a, b) => a + Math.random() * (b - a);

function launch(x = rand(0.2, 0.8) * innerWidth, y = innerHeight) {
  rockets.push({
    x, y,
    vx: rand(-1.2, 1.2),
    vy: rand(-10.5, -13.5),
    life: 0,
    explodeAt: rand(45, 75),
  });
}

function explode(x, y) {
  const count = Math.floor(rand(60, 90));
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2) * (i / count) + rand(-0.05, 0.05);
    const speed = rand(2.0, 6.0);
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      g: 0.06,
      drag: 0.992,
      size: rand(1.5, 3.2),
      life: 0,
      max: rand(55, 95),
      h: rand(0, 360),
      s: rand(70, 100),
      l: rand(55, 70),
    });
  }
}

let auto = true;
let autoTimer = 0;

function clearCanvas() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
}

function step() {
  // trails
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(0, 0, innerWidth, innerHeight);

  // rockets
  for (let i = rockets.length - 1; i >= 0; i--) {
    const r = rockets[i];
    r.life++;
    r.vy += 0.08;
    r.x += r.vx;
    r.y += r.vy;

    ctx.beginPath();
    ctx.arc(r.x, r.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fill();

    if (r.life >= r.explodeAt || r.vy >= -1) {
      explode(r.x, r.y);
      rockets.splice(i, 1);
    }
  }

  // particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life++;
    p.vx *= p.drag;
    p.vy *= p.drag;
    p.vy += p.g;
    p.x += p.vx;
    p.y += p.vy;

    const t = p.life / p.max;
    const alpha = Math.max(0, 1 - t);

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${p.h}, ${p.s}%, ${p.l}%, ${alpha})`;
    ctx.fill();

    if (p.life >= p.max) particles.splice(i, 1);
  }

  // auto launches
  if (auto) {
    autoTimer++;
    if (autoTimer % 25 === 0) launch();
  }

  requestAnimationFrame(step);
}
step();

// UI + interactions
const btnLaunch = document.getElementById("btnLaunch");
const btnToggleAuto = document.getElementById("btnToggleAuto");
const btnClear = document.getElementById("btnClear");

btnLaunch.addEventListener("click", () => {
  launch();
  launch(rand(0.2, 0.8) * innerWidth);
});

btnToggleAuto.addEventListener("click", () => {
  auto = !auto;
  btnToggleAuto.textContent = `Auto: ${auto ? "ON" : "OFF"}`;
  btnToggleAuto.setAttribute("aria-pressed", String(auto));
});

btnClear.addEventListener("click", () => {
  rockets.length = 0;
  particles.length = 0;
  clearCanvas();
});

// click/tap anywhere
window.addEventListener("pointerdown", (e) => {
  launch(e.clientX, innerHeight);
  launch(e.clientX + rand(-60, 60), innerHeight);
});

// initial show
for (let i = 0; i < 6; i++) setTimeout(() => launch(), i * 220);
