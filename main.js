// ==========================
// HERO CANVAS BACKGROUND
// ==========================
function initHeroCanvas() {
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');

  let width, height;
  let particles = [];

  const PARTICLE_COUNT = 160;
  const MAX_DEPTH = 600;
  const FOV = 400;
  const speedMultiplier = 0.9; // (e.g. 0.05 very slow, 0.5 fast)


  const mouse = {
    x: null,
    y: null,
    radius: 150
  };

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() {
      this.reset();
    }

   reset(spawnFar = true) {
    // Random X/Y around center
    this.x = (Math.random() - 0.5) * width;
    this.y = (Math.random() - 0.5) * height;

    // Spawn depth
    this.z = spawnFar ? Math.random() * MAX_DEPTH + 200 : Math.random() * 200;

    this.baseSize = Math.random() * 1.2 + 0.4;

    // Constant base speed (so far particles still move)
    this.speed = 1 + Math.random() * 1.5;
  }

  update() {
    // Always move forward
    this.z -= this.speed * speedMultiplier;

    if (this.z <= 0) {
      this.reset(true);
    }
  }

  project() {
    const scale = FOV / this.z;
    this.screenX = this.x * scale + width / 2;
    this.screenY = this.y * scale + height / 2;
    this.screenSize = this.baseSize * scale;
    this.alpha = Math.min(1, this.screenSize * 0.8);
  }

  applyMouse() {
    if (mouse.x === null || mouse.y === null) return;
    const dx = this.screenX - mouse.x;
    const dy = this.screenY - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < mouse.radius && dist > 0) {
      const force = (1 - dist / mouse.radius) * 18;
      this.x += (dx / dist) * force;
      this.y += (dy / dist) * force;
    }
  }

  isOutOfBounds() {
    return (
      this.screenX < -100 ||
      this.screenX > width + 100 ||
      this.screenY < -100 ||
      this.screenY > height + 100
    );
  }

  draw() {
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.screenX, this.screenY, this.screenSize, 0, Math.PI * 2);
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(255,220,150,0.6)';
    ctx.fillStyle = '#f5efe0';
    ctx.globalAlpha = this.alpha;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();

    // If particle flies off screen edges → reset
    if (this.isOutOfBounds()) {
      this.reset(true);
    }
  }
}

  function initParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      p.update();
      p.project();
      p.applyMouse();
      p.draw();

      if (p.isOutOfBounds()) {
        p.reset();
      }
    });

    requestAnimationFrame(animate);
  }

  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  initParticles();
  animate();
}

// ==========================
// NAV INTERACTIONS (placeholder)
// ==========================
function initNav() {
  // future nav logic
}

// ==========================
// OTHER UI INTERACTIONS (placeholder)
// ==========================
function initUI() {
  // future UI logic
}

// ==========================
// INIT
// ==========================
document.addEventListener('DOMContentLoaded', () => {
  initHeroCanvas();
  // initNav();
  // initUI();
});
