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
    const speedMultiplier = 0.9;
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


const gallery = document.querySelector('.gallery');
const galleryimages = document.querySelectorAll('.gallery img');
const img_angle = 360 / gallery.children.length;

// helper to compute which image index is currently front-facing
function getFrontIndex() {
    if (!gallery || !galleryimages || galleryimages.length === 0) return 0;
    try {
        const galleryRot = typeof getGalleryRotationYDeg === 'function' ? getGalleryRotationYDeg() : 0;
        let bestIdx = 0;
        let bestDiff = 360;
        galleryimages.forEach((_, idx) => {
            const assigned = (idx + 1) * img_angle;
            const diff = normalizeDeg(assigned - galleryRot);
            if (Math.abs(diff) < Math.abs(bestDiff)) {
                bestDiff = diff;
                bestIdx = idx;
            }
        });
        return bestIdx;
    } catch (e) {
        return 0;
    }
}


const projectBtn = document.querySelector('.projects-btn');
// track which project is currently selected in the gallery
let currentSelectedProject = null;


// NOTE: auto-selection is performed AFTER we assign data-project on each
// image (below). See the block after the galleryimages.forEach loop.

// Attach transition listeners to the gallery (transform is applied to the gallery, not the individual images)
if (gallery) {
    gallery.addEventListener('transitionstart', () => {
        if (projectBtn) projectBtn.style.visibility = 'hidden';
    });

    gallery.addEventListener('transitionend', () => {
        if (projectBtn) projectBtn.style.visibility = 'visible';
    });
}

// Redirect the projects button to an individual project page when clicked.
// If a project has been selected in the gallery, navigate to `projects/<id>.html`.
if (projectBtn) {
    projectBtn.addEventListener('click', () => {
        if (currentSelectedProject) {
            // navigate to the project-specific page inside the projects/ folder
            window.location.href = `projects/${currentSelectedProject}.html`;
        } else {
            // fallback to the projects list page
            window.location.href = 'projects.html';
        }
    });
}

galleryimages.forEach((img, i) => {

    // derive a stable project id for each image. Priority:
    // 1) data-project attribute (if already present in HTML)
    // 2) id attribute
    // 3) alt text normalized
    // 4) fallback to index-based id (project1, project2...)
    const fallbackId = `project${i + 1}`;
    const fromAlt = img.getAttribute('alt') ? img.getAttribute('alt').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') : '';
    const projectId = img.dataset.project || img.id || (fromAlt || fallbackId);
    // store it on the element so other code can read it later
    img.dataset.project = projectId;

    // include a centering translate so images are centered in the .gallery before 3D transforms
    img.style.transform = `translate(-50%,-30%) rotateX(0deg) rotateY(${(i + 1) * img_angle}deg) translateZ(${gallery.children.length * 6}vw)`;

    // hover: only apply highlight/shadow when this image is the front-facing one
    img.onmouseenter = () => {
        try {
            const frontIdx = getFrontIndex();
            if (i === frontIdx) {
           
                img.style.boxShadow = '0 4px 12px rgba(255, 234, 0, 0.899)';
            } else {
                // explicitly clear any CSS hover shadow for non-front images
          
                img.style.boxShadow = 'none';
            }
        } catch (err) {
            // fallback: do not apply special styling if detection fails
            img.style.boxShadow = '';
        }
    };

    img.onmouseleave = () => {
        // always clear inline styles on leave so CSS baseline applies normally
    
        img.style.boxShadow = '';
    };
 

    img.onclick = (e) => {
        // If clicked image is already front-facing, don't hide the button or
        // trigger another rotation; just select it.
        const button = document.querySelector('.projects-btn');
        try {
            const galleryRot = typeof getGalleryRotationYDeg === 'function' ? getGalleryRotationYDeg() : 0;
            let bestIdx = 0;
            let bestDiff = 360;
            galleryimages.forEach((_, idx) => {
                const assigned = (idx + 1) * img_angle;
                const diff = normalizeDeg(assigned - galleryRot);
                if (Math.abs(diff) < Math.abs(bestDiff)) {
                    bestDiff = diff;
                    bestIdx = idx;
                }
            });

            if (i === bestIdx) {
                // already front-facing: only set selection and ensure button visible
                // redirect to the project page
                 window.location.href = `projects/${projectId}.html`;
                
                currentSelectedProject = projectId;
                if (button) button.style.visibility = 'visible';
                return;
            }
        } catch (err) {
            console.warn('Error detecting front image', err);
            // fall back to rotating
        }

        // hide the projects button while the gallery is animating
        if (button) button.style.visibility = 'hidden';

        // rotate the gallery visually toward the clicked image
        gallery.style.transform = `perspective(4000px)  rotateX(-5deg) rotateY(-${(i + 1) * img_angle}deg)`;

        // record the selected project id so the View Project button can
        // navigate to the correct anchor. Do not redirect immediately; the
        // user will press the button to go to the project page.
        currentSelectedProject = projectId;
    }
});

// Auto-detect which gallery image is currently front-facing and use that
// as the default selected project. This reads the computed transform on
// the gallery (which may come from CSS or earlier scripts) and finds the
// image whose assigned rotateY is closest to the viewer.
function getGalleryRotationYDeg() {
    if (!gallery) return 0;
    const cs = getComputedStyle(gallery).transform;
    if (!cs || cs === 'none') return 0;
    try {
        const m = new DOMMatrixReadOnly(cs);
        // For a rotateY, m11 = cos(θ), m13 = sin(θ) -> θ = atan2(m13, m11)
        const rad = Math.atan2(m.m13, m.m11);
        return rad * 180 / Math.PI;
    } catch (e) {
        return 0;
    }
}

function normalizeDeg(deg) {
    let d = ((deg % 360) + 540) % 360 - 180; // map to (-180,180]
    return d;
}

try {
    if (galleryimages.length > 0 && gallery) {
        const galleryRot = getGalleryRotationYDeg();
        let bestIdx = 0;
        let bestDiff = 360;
        galleryimages.forEach((img, i) => {
            const assigned = (i + 1) * img_angle; // same formula used for placement
            // compute difference between assigned image angle and gallery rotation
            const diff = normalizeDeg(assigned - galleryRot);
            if (Math.abs(diff) < Math.abs(bestDiff)) {
                bestDiff = diff;
                bestIdx = i;
            }
        });

        const frontImg = galleryimages[bestIdx];
        // ensure dataset.project exists (we set it in the loop above)
        const pid = frontImg && frontImg.dataset && frontImg.dataset.project ? frontImg.dataset.project : null;
        if (pid) {
            currentSelectedProject = pid;
            // rotate gallery to align exactly to that image (keeps UI consistent)
            gallery.style.transform = `perspective(4000px)  rotateX(-5deg) rotateY(-${(bestIdx + 1) * img_angle}deg)`;
            if (projectBtn) projectBtn.style.visibility = 'visible';
        }
    }
} catch (err) {
    console.warn('Failed to auto-detect front gallery image', err);
}


const line = document.getElementById('line');
function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight;
    const winHeight = window.innerHeight;
    const scrollable = docHeight - winHeight;
    const progress = scrollable > 0 ? scrollTop / scrollable : 0;
    const clamped = Math.min(Math.max(progress, 0), 1);
    line.style.transform = `scaleX(${clamped}) scaleY(1.45)`;
}
window.addEventListener('scroll', updateScrollProgress);
window.addEventListener('resize', updateScrollProgress);
updateScrollProgress();
