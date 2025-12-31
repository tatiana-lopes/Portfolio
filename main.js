gsap.registerPlugin(ScrollTrigger);
const projectCards = gsap.utils.toArray('#horizontal .project-card');

gsap.to(projectCards, {
    xPercent: -100 * (projectCards.length - 1),
   scrollTrigger: {
       trigger: '#horizontal',
       scrub: true,
       pin: true,
       anticipatePin: 1,
       //add extra space to scroll to the end of the last card
       end: () => "+=" + document.querySelector('#horizontal').offsetWidth ,
     
   },
    ease: "none",
});



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
    const SPAWN_Z_MIN = MAX_DEPTH * 0.25;
    const SPAWN_Z_MAX = MAX_DEPTH * 0.45;
    const FOV = 400;
    const speedMultiplier = 0.9; // (e.g. 0.05 very slow, 0.5 fast)
    let isPressing = false;

    const mouse = {
        x: null,
        y: null,
        radius: 120
    };

    function resize() {
        const rect = canvas.getBoundingClientRect();
        width = canvas.width = rect.width;
        height = canvas.height = rect.height;
    }
    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            this.reset();
        }

        reset(spawnFar = true) {
            this.boost = 1;
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
            this.z -= this.speed * speedMultiplier * this.boost;

            if (this.boost > 1) {
                this.boost *= 0.9;
            }

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

    function spawnParticles(count = 12) {
        const spawnZ = MAX_DEPTH * 0.20;

        for (let i = 0; i < count; i++) {
            const p = new Particle();

            const worldX =
                (mouse.x - width / 2) * (spawnZ / FOV);
            const worldY =
                (mouse.y - height / 2) * (spawnZ / FOV);

            p.x = worldX + (Math.random() - 0.5) * 40;
            p.y = worldY + (Math.random() - 0.5) * 40;
            p.z = spawnZ;
            p.baseSize *= 0.25;

            particles.push(p);
        }

        // Keep total stable
        if (particles.length > PARTICLE_COUNT) {
            particles.splice(0, particles.length - PARTICLE_COUNT);
        }
    }

    function initParticles() {
        particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push(new Particle());
        }
    }

    // Animation control: requestAnimationFrame id so we can cancel when not needed
    let rafId = null;
    let canvasVisible = true; // assume visible initially

    function animate() {
        ctx.clearRect(0, 0, width, height);

        particles.forEach(p => {
            p.update();
            p.project();
            // ignore apply mouse if I click to spawn.
            if (!isPressing) {
                p.applyMouse(mouse.x, mouse.y);
            }
            p.draw();

            if (p.isOutOfBounds()) {
                p.reset();
            }
        });

        rafId = requestAnimationFrame(animate);
    }

    function startAnimation() {
        if (!rafId) {
            rafId = requestAnimationFrame(animate);
        }
    }

    function stopAnimation() {
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
    }

    // Pause when the canvas is not visible in the viewport (improves performance)
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(entries => {
            const e = entries[0];
            if (e && e.isIntersecting) {
                canvasVisible = true;
                // only start if page is visible
                if (document.visibilityState === 'visible') startAnimation();
            } else {
                canvasVisible = false;
                stopAnimation();
            }
        }, { threshold: 0.05 });

        io.observe(canvas);
    }

    // Also respect page visibility (tab hidden)
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            stopAnimation();
        } else if (document.visibilityState === 'visible' && canvasVisible) {
            startAnimation();
        }
    });

    window.addEventListener("mousedown", () => {
        isPressing = true;
    });

    window.addEventListener("mouseup", () => {
        isPressing = false;
    });

    window.addEventListener('mousemove', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    window.addEventListener('click', () => {
        spawnParticles(20);
    });

    window.addEventListener('touchstart', e => {
        isPressing = true;
        const touch = e.touches[0];
        mouse.x = touch.clientX;
        mouse.y = touch.clientY;
        spawnParticles(20);
    });

    window.addEventListener('touchend', () => {
        isPressing = false;
        mouse.x = null;
        mouse.y = null;
    });


    initParticles();
    animate();
}



// ==========================
// INIT
// ==========================
document.addEventListener('DOMContentLoaded', () => {
    initHeroCanvas();

 
});

// TODO : Add scroll-based parallax to particles

