import * as THREE from 'three';

/**
 * PRIME XI — 3D War Room Experience (Holographic Armor)
 * Real 3D implementation where the jersey follows the cursor directly.
 * USES: THREE.VideoTexture + THREE.AdditiveBlending for a floating hologram feel.
 */

const config = {
    lerpFactor: 0.05,
    maxPosOffset: { x: 300, y: 200 }, // Max distance from center
    maxRotation: 0.15,               // Radians
    cameraZ: { start: 900, end: 650 }
};

let scene, camera, renderer, mesh;
let animId = null;

const mouseNorm = new THREE.Vector2(0, 0); // -0.5 to 0.5
const currentPos = new THREE.Vector2(0, 0);
const currentRot = new THREE.Vector2(0, 0);

function init() {
    const section = document.getElementById('war-room-3d');
    const canvasWrap = document.getElementById('war-room-canvas-container');
    if (!section || !canvasWrap) return;

    const W = window.innerWidth;
    const H = window.innerHeight;

    // 1. Scene Setup
    scene = new THREE.Scene();

    // 2. Camera Setup
    camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 5000);
    camera.position.set(0, 0, config.cameraZ.start);

    // 3. Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    canvasWrap.appendChild(renderer.domElement);

    // 4. Hidden Video Element
    const video = document.createElement('video');
    video.src = '../img/Jersey_with_fire_energy.mp4';
    video.loop = true;
    video.muted = true;
    video.setAttribute('playsinline', '');
    video.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;opacity:0;';
    document.body.appendChild(video);

    video.play().catch(() => {
        const startOnGesture = () => {
            video.play();
            section.removeEventListener('mousemove', startOnGesture);
            document.removeEventListener('click', startOnGesture);
        };
        section.addEventListener('mousemove', startOnGesture);
        document.addEventListener('click', startOnGesture);
    });

    // 5. VideoTexture + Holographic Material
    const texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace;

    const geometry = new THREE.PlaneGeometry(1600, 900);
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        blending: THREE.AdditiveBlending, // Key for holographic feel: removes black bg
        opacity: 0.9,
        side: THREE.DoubleSide,
    });

    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // 6. Mouse Listener for Interaction
    section.addEventListener('mousemove', (e) => {
        const rect = section.getBoundingClientRect();
        // Calculate normalized position -0.5 to 0.5
        mouseNorm.x = (e.clientX - rect.left) / rect.width - 0.5;
        mouseNorm.y = (e.clientY - rect.top) / rect.height - 0.5;
    });

    // Reset when leaving section
    section.addEventListener('mouseleave', () => {
        mouseNorm.set(0, 0);
    });

    // 7. Responsive handling
    window.addEventListener('resize', () => {
        const nW = window.innerWidth;
        const nH = window.innerHeight;
        camera.aspect = nW / nH;
        camera.updateProjectionMatrix();
        renderer.setSize(nW, nH);
    });

    // 8. IntersectionObserver to manage performance
    const io = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
            if (!animId) animLoop();
        } else {
            cancelAnimationFrame(animId);
            animId = null;
        }
    }, { threshold: 0.1 });
    io.observe(section);

    animLoop();
}

function animLoop() {
    animId = requestAnimationFrame(animLoop);

    // INTERACTION: Direct Follow (Position)
    const targetPosX = mouseNorm.x * config.maxPosOffset.x;
    const targetPosY = -mouseNorm.y * config.maxPosOffset.y;

    currentPos.x += (targetPosX - currentPos.x) * config.lerpFactor;
    currentPos.y += (targetPosY - currentPos.y) * config.lerpFactor;

    mesh.position.x = currentPos.x;
    mesh.position.y = currentPos.y;

    // INTERACTION: Dynamic Rotation (Tilted based on position)
    const targetRotY = mouseNorm.x * config.maxRotation * 2;
    const targetRotX = mouseNorm.y * config.maxRotation * 2;

    currentRot.x += (targetRotX - currentRot.x) * config.lerpFactor;
    currentRot.y += (targetRotY - currentRot.y) * config.lerpFactor;

    mesh.rotation.y = currentRot.y;
    mesh.rotation.x = currentRot.x;

    // INTERACTION: Scroll Depth (Subtle zoom)
    const section = document.getElementById('war-room-3d');
    if (section) {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            const progress = Math.min(1, Math.max(0,
                (window.innerHeight - rect.top) / (window.innerHeight + rect.height)
            ));
            const targetZ = config.cameraZ.start - (progress * (config.cameraZ.start - config.cameraZ.end));
            camera.position.z += (targetZ - camera.position.z) * 0.05;
        }
    }

    renderer.render(scene, camera);
}

const lerp = (start, end, factor) => start + (end - start) * factor;

// Start the engine
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
