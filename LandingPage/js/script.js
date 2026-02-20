// PRIME XI - Advanced Interactivity & 3D Script

document.addEventListener('DOMContentLoaded', () => {
    console.log('PRIME XI Advanced Dashboard Initialized');

    // --- Global Initializers ---
    initCustomCursor();
    initAtmosphereParticles();
    initHero3D();
    initFeatureCards();
    initMagneticElements();
    initScrollTriggers();
    initStepConnector();
    initConfetti();

    // Header scroll background effect
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.background = 'rgba(61, 25, 91, 0.95)';
            header.style.borderBottomColor = 'rgba(0, 255, 133, 0.2)';
        } else {
            header.style.background = 'rgba(61, 25, 91, 0.7)';
            header.style.borderBottomColor = 'rgba(255, 255, 255, 0.05)';
        }
    });

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });
});

// --- 1. Custom Cursor with Dynamics ---
function initCustomCursor() {
    const cursor = document.getElementById('custom-cursor');
    const halo = document.getElementById('cursor-halo');
    if (!cursor || !halo) return;

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let haloX = 0, haloY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.style.opacity = "1";
        halo.style.opacity = "1";
    });

    const animate = () => {
        // Smooth easing for cursor
        cursorX = lerp(cursorX, mouseX, 0.2);
        cursorY = lerp(cursorY, mouseY, 0.2);
        // Slower easing for halo to create "trail"
        haloX = lerp(haloX, mouseX, 0.1);
        haloY = lerp(haloY, mouseY, 0.1);

        cursor.style.transform = `translate(${cursorX - 12}px, ${cursorY - 12}px)`;
        halo.style.transform = `translate(${haloX - 24}px, ${haloY - 24}px)`;

        requestAnimationFrame(animate);
    };
    animate();

    // Scale effects on interactive elements
    document.querySelectorAll('a, button, .feature-card').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform += ' scale(2.5)';
            halo.style.borderColor = 'rgba(0, 255, 133, 0.8)';
            halo.style.width = '60px';
            halo.style.height = '60px';
        });
        el.addEventListener('mouseleave', () => {
            halo.style.borderColor = 'rgba(0, 255, 133, 0.3)';
            halo.style.width = '48px';
            halo.style.height = '48px';
        });
    });
}

// --- 2. Atmosphere Particle Field (Canvas) ---
function initAtmosphereParticles() {
    const canvas = document.getElementById('atmosphere-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let w, h, particles = [];
    const particleCount = 100;

    const resize = () => {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = Math.random() * 1.5 + 0.5;
            this.alpha = Math.random() * 0.5 + 0.1;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > w) this.vx *= -1;
            if (this.y < 0 || this.y > h) this.vy *= -1;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 255, 133, ${this.alpha})`;
            ctx.fill();
        }
    }

    for (let i = 0; i < particleCount; i++) particles.push(new Particle());

    function render() {
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        // Draw connections
        ctx.lineWidth = 0.5;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0, 255, 133, ${0.1 * (1 - dist / 150)})`;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(render);
    }
    render();
}

// --- 3. Hero 3D Parallax & Glitch (Enhanced) ---
function initHero3D() {
    if (window.matchMedia('(hover: none)').matches) return;

    const hero = document.getElementById('hero-section');
    const mockup = document.getElementById('dashboard-mockup');
    const floatCard = document.getElementById('floating-card');
    const content = document.getElementById('hero-content');
    const blob1 = document.getElementById('hero-blob-1');
    const blob2 = document.getElementById('hero-blob-2');

    let targetX = 0, targetY = 0;
    let currX = 0, currY = 0;
    let bobTime = 0;

    hero.addEventListener('mousemove', (e) => {
        const r = hero.getBoundingClientRect();
        targetX = (e.clientX - r.left) / r.width - 0.5;
        targetY = (e.clientY - r.top) / r.height - 0.5;
    });

    hero.addEventListener('mouseleave', () => { targetX = 0; targetY = 0; });

    function tick() {
        currX = lerp(currX, targetX, 0.08);
        currY = lerp(currY, targetY, 0.08);
        bobTime += 0.02;

        if (mockup) {
            mockup.style.transform = `perspective(1200px) rotateY(${currX * 25}deg) rotateX(${-currY * 18}deg) translateZ(15px)`;
        }
        if (floatCard) {
            floatCard.style.transform = `perspective(800px) rotateY(${-currX * 15}deg) rotateX(${currY * 10}deg) translateZ(40px) translateY(${Math.sin(bobTime) * 8}px)`;
        }
        if (content) {
            content.style.transform = `perspective(1000px) translate3d(${currX * 12}px, ${currY * 8}px, 5px)`;
        }
        if (blob1) blob1.style.transform = `translate(${currX * 60}px, ${currY * 40}px)`;
        if (blob2) blob2.style.transform = `translate(${-currX * 40}px, ${-currY * 30}px)`;

        requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

// --- 4. Feature Cards Interaction ---
function initFeatureCards() {
    const cards = document.querySelectorAll('.feature-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const r = card.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            card.style.transform = `perspective(1000px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg) translateZ(10px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        });
    });
}

// --- 5. Magnetic Buttons ---
function initMagneticElements() {
    const magnets = document.querySelectorAll('button:not(.no-mag), .magnetic');
    magnets.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const r = el.getBoundingClientRect();
            const centerX = r.left + r.width / 2;
            const centerY = r.top + r.height / 2;
            const dx = e.clientX - centerX;
            const dy = e.clientY - centerY;
            el.style.transform = `translate(${dx * 0.3}px, ${dy * 0.3}px)`;
        });
        el.addEventListener('mouseleave', () => {
            el.style.transform = 'translate(0, 0)';
        });
    });
}

// --- 6. Scroll Triggers: Counters & Chart ---
function initScrollTriggers() {
    const statsSection = document.getElementById('stats');
    const chartPath = document.querySelector('.chart-line');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.id === 'stats') {
                    animateCounters();
                    if (chartPath) chartPath.style.animation = 'dash 3s ease-in-out forwards';
                }
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.3 });

    if (statsSection) observer.observe(statsSection);
}

function animateCounters() {
    const stats = document.querySelectorAll('#stats span.block.text-3xl');
    stats.forEach(stat => {
        const targetStr = stat.textContent;
        const target = parseFloat(targetStr.replace(/[^0-9.]/g, ''));
        const suffix = targetStr.replace(/[0-9.]/g, '');
        let count = 0;
        const duration = 2000;
        const step = (target / duration) * 16;

        const timer = setInterval(() => {
            count += step;
            if (count >= target) {
                stat.textContent = targetStr;
                clearInterval(timer);
            } else {
                stat.textContent = (count % 1 === 0 ? count : count.toFixed(1)) + suffix;
            }
        }, 16);
    });
}

// --- 7. SVG Step Connector ---
function initStepConnector() {
    const steps = document.querySelectorAll('#how-it-works .group');
    const path = document.getElementById('connector-path');
    if (!path || steps.length < 2) return;

    function updatePath() {
        let d = `M ${steps[0].offsetLeft + steps[0].offsetWidth / 2} ${steps[0].offsetTop + steps[0].offsetHeight / 1.5}`;
        for (let i = 1; i < steps.length; i++) {
            const x = steps[i].offsetLeft + steps[i].offsetWidth / 2;
            const y = steps[i].offsetTop + steps[i].offsetHeight / 1.5;
            d += ` L ${x} ${y}`;
        }
        path.setAttribute('d', d);
        const len = path.getTotalLength();
        path.style.strokeDasharray = len;
        path.style.strokeDashoffset = len;
    }

    window.addEventListener('resize', updatePath);
    updatePath();

    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            path.style.transition = 'stroke-dashoffset 2s ease-in-out';
            path.style.strokeDashoffset = '0';
        }
    }, { threshold: 0.5 });
    observer.observe(document.getElementById('how-it-works'));
}

// --- 8. Confetti Feedback ---
function initConfetti() {
    const cta = document.querySelector('button.bg-accent-green');
    if (!cta) return;

    cta.addEventListener('click', () => {
        const duration = 3 * 1000;
        const end = Date.now() + duration;

        (function frame() {
            confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#00FF85', '#3D195B'] });
            confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#00FF85', '#3D195B'] });
            if (Date.now() < end) requestAnimationFrame(frame);
        }());
    });
}

// Helpers
const lerp = (a, b, t) => a + (b - a) * t;

// Confetti Minimal Implementation (using a tiny utility if needed or simple canvas)
// For now, let's inject the canvas-confetti script if not present
if (typeof confetti === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
    document.head.appendChild(script);
}

// YouTube API boilerplate (fixed and preserved)
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('hero-player', {
        events: {
            'onReady': (event) => {
                event.target.setPlaybackRate(1.5);
                event.target.playVideo();
            }
        }
    });
}
