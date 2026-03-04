import * as THREE from 'three';

/**
 * PRIME XI — 3D Tactical Armor Module
 * Converts the video loop into a physical 3D holographic object.
 */

const armorCfg = {
    mouseSensitivity: 0.001,
    lerpFactor: 0.05,
    zoom: { start: 1000, end: 500 }
};

let renderer, scene, camera, armorGroup;
let videoElement, videoTexture;
let mouse = new THREE.Vector2();
let targetRotation = new THREE.Vector2(0, 0);

function initChamber() {
    const container = document.getElementById('chamber-experience');
    if (!container) return;

    // 1. Scene & Camera Setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 5000);
    camera.position.z = armorCfg.zoom.start;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const canvas = renderer.domElement;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    container.appendChild(canvas);

    armorGroup = new THREE.Group();
    scene.add(armorGroup);

    // 2. The Interactive Video Hologram (The Armor)
    // Create hidden video element for texture
    videoElement = document.createElement('video');
    videoElement.src = '../img/loop_jersey.webp';
    videoElement.loop = true;
    videoElement.muted = true;
    videoElement.setAttribute('playsinline', '');
    videoElement.play();

    videoTexture = new THREE.VideoTexture(videoElement);
    videoTexture.colorSpace = THREE.SRGBColorSpace;

    // The Main Armor Plane (A high-quality 3D surface)
    const armorGeo = new THREE.PlaneGeometry(600, 800);
    const armorMat = new THREE.MeshPhysicalMaterial({
        map: videoTexture,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
        metalness: 0.5,
        roughness: 0.2,
        emissive: 0x00FF85,
        emissiveIntensity: 0.15,
    });
    const armorMesh = new THREE.Mesh(armorGeo, armorMat);
    armorGroup.add(armorMesh);

    // Add a holographic "Branding Frame" around the jersey
    const frameGeo = new THREE.PlaneGeometry(650, 850);
    const frameWire = new THREE.LineSegments(
        new THREE.EdgesGeometry(frameGeo),
        new THREE.LineBasicMaterial({ color: 0x00FF85, transparent: true, opacity: 0.3 })
    );
    frameWire.position.z = -5;
    armorGroup.add(frameWire);

    // 3. Floating Data Nodes (Parented to Armor for linked rotation)
    const nodes = [
        { x: -400, y: 300, z: 100, label: "POLY-FIBER SCAN" },
        { x: 450, y: -200, z: 200, label: "TACTICAL SYNC" },
        { x: -350, y: -350, z: 50, label: "AERO-CORE" }
    ];

    nodes.forEach(n => {
        const nodeGroup = new THREE.Group();
        nodeGroup.position.set(n.x, n.y, n.z);

        // Small floating point
        const dot = new THREE.Mesh(
            new THREE.SphereGeometry(4, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0x00FF85 })
        );
        nodeGroup.add(dot);

        // Connection Line
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(-n.x * 0.2, -n.y * 0.2, -n.z * 0.5)
        ]);
        const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0x00FF85, transparent: true, opacity: 0.2 }));
        nodeGroup.add(line);

        armorGroup.add(nodeGroup);
    });

    // 4. Lighting Configuration
    const ambient = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambient);

    const greenPoint = new THREE.PointLight(0x00FF85, 5, 2000);
    greenPoint.position.set(500, 500, 500);
    scene.add(greenPoint);

    // 5. Input Listeners
    window.addEventListener('mousemove', (e) => {
        // Normalized Mouse (-0.5 to 0.5)
        mouse.x = (e.clientX / window.innerWidth) - 0.5;
        mouse.y = (e.clientY / window.innerHeight) - 0.5;
    });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    animateArmor();
}

function animateArmor() {
    requestAnimationFrame(animateArmor);

    // Physical Rotation (The Armor itself rotates)
    const rotY = mouse.x * 0.8; // Up to 45 deg approx
    const rotX = mouse.y * -0.5;

    targetRotation.x = lerp(targetRotation.x, rotX, armorCfg.lerpFactor);
    targetRotation.y = lerp(targetRotation.y, rotY, armorCfg.lerpFactor);

    armorGroup.rotation.x = targetRotation.x;
    armorGroup.rotation.y = targetRotation.y;

    // Scroll Zoom
    const container = document.getElementById('chamber-experience');
    if (container) {
        const rect = container.getBoundingClientRect();
        const viewHeight = window.innerHeight;
        if (rect.top < viewHeight && rect.bottom > 0) {
            const progress = Math.min(1, Math.max(0, (viewHeight - rect.top) / (viewHeight + rect.height)));
            const targetZ = armorCfg.zoom.start - (progress * (armorCfg.zoom.start - armorCfg.zoom.end));
            camera.position.z = lerp(camera.position.z, targetZ, 0.05);
        }
    }

    renderer.render(scene, camera);
}

function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
}

initChamber();
