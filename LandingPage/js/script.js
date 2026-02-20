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
