/**
 * PRIME XI — 3D Football Module
 * Three.js r165 (ES Module via importmap)
 * Nike-style ball | neon data treatment | SVG connection lines
 */

import * as THREE from 'three';

// ─────────────────────────────────────────────
//  CONSTANTS & CONFIG
// ─────────────────────────────────────────────
const COLORS = {
    neonGreen: 0x00FF85,
    cyan: 0x04F5FF,
    pink: 0xE90052,
    purple: 0x3D195B,
    dark: 0x020617,
    white: 0xffffff,
};

const cfg = {
    rotSpeed: 0.004,
    ballRadius: 2,
    segments: 64,
    canvasSize: { w: 600, h: 600 },
};

// ─────────────────────────────────────────────
//  NIKE-STYLE BALL TEXTURE (procedural canvas)
// ─────────────────────────────────────────────
function buildNikeTexture() {
    const size = 1024;
    const cv = document.createElement('canvas');
    cv.width = size;
    cv.height = size;
    const ctx = cv.getContext('2d');

    // Base — white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Nike Flight pattern: irregular hexagonal patches in dark colors
    // We generate a Voronoi-like approximation with predefined seed points
    const seeds = [
        [0.14, 0.18], [0.42, 0.08], [0.78, 0.15], [0.92, 0.42],
        [0.82, 0.72], [0.60, 0.92], [0.28, 0.88], [0.06, 0.65],
        [0.30, 0.50], [0.65, 0.50], [0.50, 0.28], [0.50, 0.72],
        [0.18, 0.35], [0.82, 0.28], [0.20, 0.70], [0.78, 0.68],
    ];

    const colors = [
        '#12122a', '#1a1230', '#0d0d22', '#151528',
        '#181830', '#121225', '#0a0a1e', '#161632',
        '#1c1c3a', '#0e0e28', '#191938', '#111128',
        '#141430', '#0c0c20', '#171735', '#0b0b1f',
    ];

    // Draw patches
    seeds.forEach(([sx, sy], i) => {
        const px = sx * size;
        const py = sy * size;
        const r = size * (0.10 + Math.sin(i * 1.37) * 0.03);
        const grad = ctx.createRadialGradient(px, py, 0, px, py, r);
        grad.addColorStop(0, colors[i % colors.length]);
        grad.addColorStop(0.7, colors[i % colors.length]);
        grad.addColorStop(1, 'rgba(255,255,255,0)');

        ctx.beginPath();
        // Pentagon / hexagon outline
        const sides = i % 2 === 0 ? 5 : 6;
        for (let j = 0; j < sides; j++) {
            const angle = (j / sides) * Math.PI * 2 - Math.PI / 2;
            const jitter = r * (0.85 + Math.sin(j * 3 + i) * 0.15);
            const x = px + Math.cos(angle) * jitter;
            const y = py + Math.sin(angle) * jitter;
            j === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
    });

    // Seam lines (thin white curves over dark patches)
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 3;
    seeds.forEach(([sx, sy], i) => {
        const px = sx * size;
        const py = sy * size;
        const r = size * 0.09;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.stroke();
    });

    // Subtle neon overlay (very faint green tint)
    ctx.fillStyle = 'rgba(0,255,133,0.04)';
    ctx.fillRect(0, 0, size, size);

    const tex = new THREE.CanvasTexture(cv);
    tex.needsUpdate = true;
    return tex;
}

// ─────────────────────────────────────────────
//  SCENE SETUP
// ─────────────────────────────────────────────
let renderer, scene, camera, ball, wireMesh, animId;

function setupScene(canvas) {
    const { w, h } = getCanvasDimensions();

    // Renderer
    renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
    });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 0, 8);

    // Lights
    setupLights();

    // Ball
    const geo = new THREE.SphereGeometry(cfg.ballRadius, cfg.segments, cfg.segments);
    const texture = buildNikeTexture();

    const mat = new THREE.MeshPhysicalMaterial({
        map: texture,
        roughness: 0.35,
        metalness: 0.05,
        clearcoat: 0.6,
        clearcoatRoughness: 0.2,
        envMapIntensity: 0.8,
    });

    ball = new THREE.Mesh(geo, mat);
    scene.add(ball);

    // Wireframe overlay — subtle neon data layer
    const wireMat = new THREE.MeshBasicMaterial({
        color: COLORS.neonGreen,
        wireframe: true,
        transparent: true,
        opacity: 0.06,
    });
    wireMesh = new THREE.Mesh(geo, wireMat);
    scene.add(wireMesh);

    // Outer glow sphere (slightly larger, emissive)
    const glowGeo = new THREE.SphereGeometry(cfg.ballRadius * 1.03, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
        color: COLORS.neonGreen,
        transparent: true,
        opacity: 0.04,
        side: THREE.BackSide,
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    scene.add(glowMesh);

    // Data ring — equatorial orbit ring
    const ringGeo = new THREE.TorusGeometry(cfg.ballRadius * 1.35, 0.015, 8, 80);
    const ringMat = new THREE.MeshBasicMaterial({
        color: COLORS.cyan,
        transparent: true,
        opacity: 0.5,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2.5;
    scene.add(ringMesh);

    // Second ring tilted
    const ring2Mesh = new THREE.Mesh(ringGeo.clone(), new THREE.MeshBasicMaterial({
        color: COLORS.neonGreen,
        transparent: true,
        opacity: 0.3,
    }));
    ring2Mesh.rotation.x = Math.PI / 4;
    ring2Mesh.rotation.z = Math.PI / 5;
    scene.add(ring2Mesh);

    scene.userData.rings = [ringMesh, ring2Mesh];
}

function setupLights() {
    // Ambient — keep ball dark base
    const ambient = new THREE.AmbientLight(0x111122, 1.5);
    scene.add(ambient);

    // Key light — neon green, upper left
    const greenLight = new THREE.PointLight(COLORS.neonGreen, 80, 20);
    greenLight.position.set(-4, 5, 5);
    scene.add(greenLight);

    // Fill light — cyan, lower right
    const cyanLight = new THREE.PointLight(COLORS.cyan, 50, 20);
    cyanLight.position.set(5, -3, 4);
    scene.add(cyanLight);

    // Rim / back light — pink accent
    const pinkLight = new THREE.PointLight(COLORS.pink, 25, 18);
    pinkLight.position.set(0, -5, -4);
    scene.add(pinkLight);

    // Front fill — white, weak
    const frontLight = new THREE.PointLight(COLORS.white, 20, 15);
    frontLight.position.set(0, 0, 8);
    scene.add(frontLight);
}

// ─────────────────────────────────────────────
//  ANIMATE LOOP
// ─────────────────────────────────────────────
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function animate() {
    animId = requestAnimationFrame(animate);

    if (!prefersReduced) {
        const t = Date.now() * 0.001;
        ball.rotation.y += cfg.rotSpeed;
        ball.rotation.x = Math.sin(t * 0.2) * 0.08;
        wireMesh.rotation.y = ball.rotation.y;
        wireMesh.rotation.x = ball.rotation.x;

        const [r1, r2] = scene.userData.rings;
        if (r1) r1.rotation.z += 0.003;
        if (r2) r2.rotation.y += 0.005;
    }

    renderer.render(scene, camera);
}

// ─────────────────────────────────────────────
//  SVG CONNECTION LINES
// ─────────────────────────────────────────────
function buildSVGLines() {
    const svg = document.getElementById('ball-svg-lines');
    const nodes = document.querySelectorAll('.stat-node');
    const canvas = document.getElementById('ball-canvas');
    if (!svg || !canvas || !nodes.length) return;

    function redraw() {
        svg.innerHTML = '';
        const canvasRect = canvas.getBoundingClientRect();
        const svgRect = svg.getBoundingClientRect();
        const cx = canvasRect.left - svgRect.left + canvasRect.width / 2;
        const cy = canvasRect.top - svgRect.top + canvasRect.height / 2;

        nodes.forEach((node, i) => {
            const r = node.getBoundingClientRect();
            const nx = r.left - svgRect.left + r.width / 2;
            const ny = r.top - svgRect.top + r.height / 2;

            // Gradient for each line
            const gradId = `lineGrad${i}`;
            const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
            grad.setAttribute('id', gradId);
            grad.setAttribute('gradientUnits', 'userSpaceOnUse');
            grad.setAttribute('x1', cx); grad.setAttribute('y1', cy);
            grad.setAttribute('x2', nx); grad.setAttribute('y2', ny);

            const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop1.setAttribute('offset', '0%');
            stop1.setAttribute('stop-color', i % 2 === 0 ? '#00FF85' : '#04F5FF');
            stop1.setAttribute('stop-opacity', '0.9');

            const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop2.setAttribute('offset', '100%');
            stop2.setAttribute('stop-color', i % 2 === 0 ? '#00FF85' : '#04F5FF');
            stop2.setAttribute('stop-opacity', '0.1');

            grad.appendChild(stop1);
            grad.appendChild(stop2);
            defs.appendChild(grad);
            svg.appendChild(defs);

            // Line
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', cx); line.setAttribute('y1', cy);
            line.setAttribute('x2', nx); line.setAttribute('y2', ny);
            line.setAttribute('stroke', `url(#${gradId})`);
            line.setAttribute('stroke-width', '1.5');
            line.setAttribute('class', 'data-line');
            svg.appendChild(line);

            // Dot at node end
            const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            dot.setAttribute('cx', nx); dot.setAttribute('cy', ny); dot.setAttribute('r', '3');
            dot.setAttribute('fill', i % 2 === 0 ? '#00FF85' : '#04F5FF');
            dot.setAttribute('opacity', '0.8');
            svg.appendChild(dot);
        });
    }

    redraw();
    window.addEventListener('resize', () => setTimeout(redraw, 100));
    // Run again after fonts/layout settle
    setTimeout(redraw, 500);
    setTimeout(redraw, 1500);
}

// ─────────────────────────────────────────────
//  RESPONSIVE RESIZE
// ─────────────────────────────────────────────
function getCanvasDimensions() {
    const isMobile = window.innerWidth < 768;
    const size = isMobile ? Math.min(window.innerWidth * 0.85, 340) : 540;
    return { w: size, h: size };
}

function onResize() {
    const { w, h } = getCanvasDimensions();
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
}

// ─────────────────────────────────────────────
//  INIT
// ─────────────────────────────────────────────
function init() {
    const canvas = document.getElementById('ball-canvas');
    if (!canvas) return;

    setupScene(canvas);
    animate();
    buildSVGLines();

    window.addEventListener('resize', onResize);

    // IntersectionObserver — pause animation when off-screen
    const section = document.getElementById('ball-station');
    if (section) {
        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    if (!animId) animate();
                } else {
                    cancelAnimationFrame(animId);
                    animId = null;
                }
            },
            { threshold: 0.1 }
        );
        io.observe(section);
    }
}

// Wait for DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
