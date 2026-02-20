// PRIME XI - Interactivity Script

document.addEventListener('DOMContentLoaded', () => {
    console.log('PRIME XI Landing Page Loaded');

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

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Intersection Observer for animations on scroll
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transition = 'opacity 1s ease-out, transform 1s ease-out';
        section.style.transform = 'translateY(20px)';

        const animatedObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.05 });

        animatedObserver.observe(section);
    });

    // ============================================
    // PHASE 1: Mouse Parallax 3D + Hero Tilt
    // ============================================
    initHero3D();
});

/**
 * Mouse-tracking 3D parallax for the Hero section.
 * Each element moves at a different speed/depth creating
 * a genuine sense of 3D layered space.
 *
 * Layers (front → back):
 *   floating-card   : z+30  — moves most
 *   dashboard-mockup: z+10  — main tilt target
 *   hero-content    : subtle shift
 *   hero-blob-1/2   : slow drift (far background)
 */
function initHero3D() {
    // Skip on touch-only devices (no hover = no effect)
    if (window.matchMedia('(hover: none)').matches) return;

    const hero = document.getElementById('hero-section');
    const mockup = document.getElementById('dashboard-mockup');
    const floatCard = document.getElementById('floating-card');
    const content = document.getElementById('hero-content');
    const blob1 = document.getElementById('hero-blob-1');
    const blob2 = document.getElementById('hero-blob-2');

    if (!hero) return;

    // Track desired position (normalised -0.5 → +0.5)
    let targetX = 0, targetY = 0;
    // Smoothed current position (lerpd each frame)
    let currX = 0, currY = 0;

    // Floating-card bob offset (replaces old CSS animate-float)
    let bobTime = 0;

    hero.addEventListener('mousemove', (e) => {
        const r = hero.getBoundingClientRect();
        targetX = (e.clientX - r.left) / r.width - 0.5;
        targetY = (e.clientY - r.top) / r.height - 0.5;
    });

    hero.addEventListener('mouseleave', () => {
        targetX = 0;
        targetY = 0;
    });

    const lerp = (a, b, t) => a + (b - a) * t;

    function tick() {
        // Smooth interpolation (0.07 = silky, 0.15 = snappier)
        currX = lerp(currX, targetX, 0.07);
        currY = lerp(currY, targetY, 0.07);
        bobTime += 0.018;

        const bobY = Math.sin(bobTime) * 10; // ±10px vertical bob

        // --- Dashboard Mockup (main tilt) ---
        if (mockup) {
            mockup.style.transform = `
                perspective(1000px)
                rotateY(${currX * 22}deg)
                rotateX(${-currY * 16}deg)
                translateZ(10px)
            `;
        }

        // --- Floating Rank Card (counter depth + bob) ---
        if (floatCard) {
            floatCard.style.transform = `
                perspective(800px)
                rotateY(${-currX * 12}deg)
                rotateX(${currY * 8}deg)
                translateZ(30px)
                translateY(${bobY}px)
            `;
        }

        // --- Hero Text (very subtle shift, near layer) ---
        if (content) {
            content.style.transform = `
                translateX(${currX * 10}px)
                translateY(${currY * 6}px)
            `;
        }

        // --- Background blobs (slow drift, far layer) ---
        if (blob1) {
            blob1.style.transform = `translate(${currX * 50}px, ${currY * 35}px)`;
        }
        if (blob2) {
            blob2.style.transform = `translate(${-currX * 30}px, ${-currY * 22}px)`;
        }

        requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
}

// ============================================
// YouTube API for video background
// ============================================
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
