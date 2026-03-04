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
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Add classes for animations (simple approach)
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

    // --- Interactive Features Section Logic ---
    const featuresSection = document.getElementById('features');
    const featureCards = document.querySelectorAll('.feature-card');

    if (featuresSection) {
        featuresSection.addEventListener('mousemove', (e) => {
            const rects = featuresSection.getBoundingClientRect();
            const x = e.clientX - rects.left;
            const y = e.clientY - rects.top;

            // Actualizar luz global del fondo
            featuresSection.style.setProperty('--bg-glow-x', `${x}px`);
            featuresSection.style.setProperty('--bg-glow-y', `${y}px`);

            // Efecto de Parallax sutil en las cards
            featureCards.forEach(card => {
                const cardRect = card.getBoundingClientRect();
                const cardX = e.clientX - cardRect.left;
                const cardY = e.clientY - cardRect.top;

                // Variables para el brillo interno de la card
                card.style.setProperty('--mouse-x', `${cardX}px`);
                card.style.setProperty('--mouse-y', `${cardY}px`);
            });
        });

        // Oscilación de valores "LIVE"
        const liveValues = document.querySelectorAll('.live-value');
        setInterval(() => {
            liveValues.forEach(el => {
                const baseValue = parseFloat(el.getAttribute('data-value'));
                const step = parseFloat(el.getAttribute('data-step') || 0.01);
                const jitter = (Math.random() - 0.5) * step * 2;
                const newValue = (baseValue + jitter).toFixed(step < 0.1 ? 2 : 1);
                el.innerText = newValue;
            });
        }, 1500);

        // Activación de elementos al hacer scroll
        const chartPath = document.querySelector('.chart-path');
        const rankProgress = document.getElementById('rank-progress');

        const intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (entry.target.classList.contains('chart-path')) {
                        entry.target.classList.add('active');
                        // Activar puntos de la gráfica secuencialmente
                        document.querySelectorAll('.chart-point').forEach((pt, i) => {
                            setTimeout(() => pt.classList.add('active'), 500 + (i * 300));
                        });
                    }
                    if (entry.target.id === 'rank-progress') {
                        entry.target.style.width = '45.2%';
                    }
                }
            });
        }, { threshold: 0.2 });

        if (chartPath) intersectionObserver.observe(chartPath);
        if (rankProgress) intersectionObserver.observe(rankProgress);

        // Radar Chart Animation
        const radarPoints = document.getElementById('radar-points');
        const radarObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    radarPoints.setAttribute('points', '100,30 165,70 140,155 60,155 35,70');
                }
            });
        }, { threshold: 0.5 });
        if (radarPoints) radarObserver.observe(radarPoints);

        // --- War Room Mouse Glow ---
        const warRoomSection = document.getElementById('war-room');
        if (warRoomSection) {
            warRoomSection.addEventListener('mousemove', (e) => {
                const rect = warRoomSection.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                warRoomSection.style.setProperty('--mouse-x', `${x}px`);
                warRoomSection.style.setProperty('--mouse-y', `${y}px`);
            });
        }


        // Soporte para Mobile (Touch)
        featuresSection.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            const rects = featuresSection.getBoundingClientRect();
            const x = touch.clientX - rects.left;
            const y = touch.clientY - rects.top;

            featuresSection.style.setProperty('--bg-glow-x', `${x}px`);
            featuresSection.style.setProperty('--bg-glow-y', `${y}px`);
        }, { passive: true });
    }
});

// YouTube API for playback speed
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
