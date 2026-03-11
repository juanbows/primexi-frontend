"use strict";

const HERO_CONFIG = {
    appName: "PRIME XI",
    appDescription:
        "Asistente avanzado para Fantasy Premier League con recomendaciones de XI, capitanes y transferencias.",
    initialPreloadCount: 20,
    defaultThemeColor: "#00FF85",
    variants: [
        {
            title: "MODO CONTROL",
            subtitle: "ELECCIONES SEGURAS + CONSISTENCIA",
            badgeText: "Control",
            description:
                "Construye un XI estable con capitanes de alta confianza y proyecciones por fixture.",
            themeColor: "#00FF85",
            frameCount: 192,
            sequenceUrl:
                "https://rbypiwjphnhfgbvqnuoq.supabase.co/storage/v1/object/public/prime-xi-animations/ef_anim/frame_000_delay-0.041s.webp",
        },
        {
            title: "MODO AGRESIVO",
            subtitle: "TECHO DE CAPITAN",
            badgeText: "Agresivo",
            description:
                "Maximiza el techo de puntos con capitanes explosivos y transferencias de alto impacto.",
            themeColor: "#26D5FF",
            frameCount: 192,
            sequenceUrl:
                "https://rbypiwjphnhfgbvqnuoq.supabase.co/storage/v1/object/public/prime-xi-animations/eh_anim/frame_000_delay-0.041s.webp",
        },
        {
            title: "MODO DIFERENCIAL",
            subtitle: "ESCALA EN EL RANKING",
            badgeText: "Diferencial",
            description:
                "Diferenciales calculados y decisiones optimizadas para ganar posiciones.",
            themeColor: "#FFCF40",
            frameCount: 192,
            sequenceUrl:
                "https://rbypiwjphnhfgbvqnuoq.supabase.co/storage/v1/object/public/prime-xi-animations/bf_anim/frame_000_delay-0.041s.webp",
        },
    ],
};

const HERO_MAX_FRAME_INDEX = 191;
const HERO_FRAME_SUFFIX = "_delay-0.041s.webp";
const PAGE_LOADER_MIN_VISIBLE_MS = 7000;

const heroState = {
    variants: [],
    activeVariant: 0,
    frameCache: new Map(),
    lastRenderedFrame: -1,
    scheduledRenderFrame: 0,
    scheduledScrollFrame: 0,
};

const heroDom = {};

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function hidePageLoader() {
    document.body.classList.remove("pp-is-loading");
    if (heroDom.pageLoaderVideo) {
        heroDom.pageLoaderVideo.pause();
    }
    if (!heroDom.pageLoader) {
        return;
    }
    heroDom.pageLoader.classList.add("is-hidden");
}

function hidePageLoaderWithMinimumDuration(loaderStartTime) {
    const elapsed = performance.now() - loaderStartTime;
    const remaining = Math.max(PAGE_LOADER_MIN_VISIBLE_MS - elapsed, 0);
    window.setTimeout(() => {
        hidePageLoader();
    }, remaining);
}

function initHeaderScroll() {
    const header = document.querySelector("header");
    if (!header) {
        return;
    }

    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            header.style.background = "rgba(61, 25, 91, 0.95)";
            header.style.borderBottomColor = "rgba(0, 255, 133, 0.2)";
        } else {
            header.style.background = "rgba(61, 25, 91, 0.7)";
            header.style.borderBottomColor = "rgba(255, 255, 255, 0.05)";
        }
    });
}

function initHeaderLogoAutoSize() {
    const header = document.querySelector("header");
    const logo = document.getElementById("pp-header-logo");
    if (!header || !logo) {
        return;
    }

    const syncLogoSize = () => {
        const headerHeight = header.getBoundingClientRect().height;
        const targetHeight = clamp(Math.round(headerHeight * 0.62), 36, 64);
        logo.style.height = `${targetHeight}px`;
    };

    syncLogoSize();

    if ("ResizeObserver" in window) {
        const observer = new ResizeObserver(syncLogoSize);
        observer.observe(header);
    } else {
        window.addEventListener("resize", syncLogoSize);
    }

    window.addEventListener("load", syncLogoSize);
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", (event) => {
            const targetSelector = anchor.getAttribute("href");
            if (!targetSelector) {
                return;
            }

            const target = document.querySelector(targetSelector);
            if (!target) {
                return;
            }

            event.preventDefault();
            const header = document.querySelector("header");
            const offset = header ? header.offsetHeight + 8 : 0;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;

            window.scrollTo({
                top: Math.max(top, 0),
                behavior: "smooth",
            });
        });
    });
}

function initSectionReveal() {
    document.querySelectorAll("section:not(#hero)").forEach((section) => {
        section.style.opacity = "0";
        section.style.transition = "opacity 1s ease-out, transform 1s ease-out";
        section.style.transform = "translateY(20px)";

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        return;
                    }
                    entry.target.style.opacity = "1";
                    entry.target.style.transform = "translateY(0)";
                });
            },
            { threshold: 0.05 }
        );

        observer.observe(section);
    });
}

function sanitizeVariants(variants) {
    return variants.map((variant) => {
        const frameCount = Math.min(variant.frameCount || 192, 192);
        const maxIndex = Math.min(frameCount - 1, HERO_MAX_FRAME_INDEX);
        const basePath = variant.sequenceUrl.replace(
            /\/frame_\d{3}_delay-0\.041s\.webp$/,
            ""
        );
        return { ...variant, frameCount, maxIndex, basePath };
    });
}

function buildFrameUrl(basePath, index) {
    const safeIndex = clamp(index, 0, HERO_MAX_FRAME_INDEX);
    return `${basePath}/frame_${String(safeIndex).padStart(3, "0")}${HERO_FRAME_SUFFIX}`;
}

function getVariantStore(variantIndex) {
    if (!heroState.frameCache.has(variantIndex)) {
        const variant = heroState.variants[variantIndex];
        heroState.frameCache.set(variantIndex, {
            images: new Array(variant.frameCount),
            loaded: new Array(variant.frameCount).fill(false),
            loading: new Map(),
            lazyStarted: false,
        });
    }
    return heroState.frameCache.get(variantIndex);
}

function loadFrame(variantIndex, frameIndex) {
    const variant = heroState.variants[variantIndex];
    const idx = clamp(frameIndex, 0, variant.maxIndex);
    const store = getVariantStore(variantIndex);

    if (store.loaded[idx] && store.images[idx]) {
        return Promise.resolve(store.images[idx]);
    }
    if (store.loading.has(idx)) {
        return store.loading.get(idx);
    }

    const promise = new Promise((resolve, reject) => {
        const img = new Image();
        img.decoding = "async";
        img.src = buildFrameUrl(variant.basePath, idx);
        img.onload = () => {
            store.images[idx] = img;
            store.loaded[idx] = true;
            store.loading.delete(idx);
            resolve(img);
        };
        img.onerror = () => {
            store.loading.delete(idx);
            reject(new Error(`No se pudo cargar el frame ${idx}`));
        };
    });

    store.loading.set(idx, promise);
    return promise;
}

async function preloadInitialFrames(variantIndex, onProgress) {
    const variant = heroState.variants[variantIndex];
    const total = Math.min(HERO_CONFIG.initialPreloadCount, variant.frameCount);
    let loaded = 0;

    const tasks = [];
    for (let index = 0; index < total; index += 1) {
        tasks.push(
            loadFrame(variantIndex, index)
                .catch(() => null)
                .finally(() => {
                    loaded += 1;
                    if (onProgress) {
                        onProgress(loaded, total);
                    }
                })
        );
    }

    await Promise.all(tasks);
}

function lazyLoadRemainingFrames(variantIndex) {
    const variant = heroState.variants[variantIndex];
    const store = getVariantStore(variantIndex);
    if (store.lazyStarted) {
        return;
    }
    store.lazyStarted = true;

    const queue = [];
    for (let index = HERO_CONFIG.initialPreloadCount; index < variant.frameCount; index += 1) {
        if (!store.loaded[index]) {
            queue.push(index);
        }
    }

    let cursor = 0;
    const concurrency = 4;
    const runWorker = async () => {
        while (cursor < queue.length) {
            const idx = queue[cursor];
            cursor += 1;
            try {
                await loadFrame(variantIndex, idx);
            } catch (error) {
                // Continue loading the queue even if one frame fails.
            }
        }
    };

    for (let worker = 0; worker < concurrency; worker += 1) {
        runWorker();
    }
}

function findNearestLoadedFrame(variantIndex, targetFrame) {
    const variant = heroState.variants[variantIndex];
    const store = getVariantStore(variantIndex);
    const safeFrame = clamp(targetFrame, 0, variant.maxIndex);

    if (store.loaded[safeFrame]) {
        return safeFrame;
    }

    for (let offset = 1; offset <= variant.maxIndex; offset += 1) {
        const previous = safeFrame - offset;
        const next = safeFrame + offset;
        if (previous >= 0 && store.loaded[previous]) {
            return previous;
        }
        if (next <= variant.maxIndex && store.loaded[next]) {
            return next;
        }
    }

    return 0;
}

function getScrollFrameIndex(variant) {
    const start = heroDom.heroSection.offsetTop;
    const end = start + heroDom.heroSection.offsetHeight - window.innerHeight;
    if (end <= start) {
        return 0;
    }
    const progress = clamp((window.scrollY - start) / (end - start), 0, 1);
    return Math.round(progress * variant.maxIndex);
}

function requestHeroRender(force) {
    if (heroState.scheduledRenderFrame) {
        return;
    }
    heroState.scheduledRenderFrame = window.requestAnimationFrame(() => {
        heroState.scheduledRenderFrame = 0;
        renderHeroFrameForCurrentScroll(force);
    });
}

function renderHeroFrameForCurrentScroll(force) {
    const variant = heroState.variants[heroState.activeVariant];
    const desired = clamp(getScrollFrameIndex(variant), 0, variant.maxIndex);
    const frameToRender = findNearestLoadedFrame(heroState.activeVariant, desired);

    if (!force && frameToRender === heroState.lastRenderedFrame) {
        return;
    }

    const store = getVariantStore(heroState.activeVariant);
    const image = store.images[frameToRender];
    if (!image) {
        return;
    }

    heroDom.heroFrame.src = image.src;
    heroState.lastRenderedFrame = frameToRender;

    if (!store.loaded[desired]) {
        loadFrame(heroState.activeVariant, desired)
            .then(() => requestHeroRender(true))
            .catch(() => null);
    }
}

function showVariantLoading(isVisible, label) {
    if (label) {
        heroDom.variantLoading.textContent = label;
    }
    heroDom.variantLoading.classList.toggle("is-visible", isVisible);
}

function applyThemeColor(color) {
    document.documentElement.style.setProperty(
        "--pp-accent",
        color || HERO_CONFIG.defaultThemeColor
    );
}

function formatVariantIndex(index) {
    return String(index + 1).padStart(2, "0");
}

function fadeHeroTextToVariant(variant) {
    heroDom.heroText.classList.add("is-fading");
    window.setTimeout(() => {
        heroDom.heroBrand.textContent = HERO_CONFIG.appName;
        heroDom.heroBadgeText.textContent = variant.badgeText || "Control";
        heroDom.heroTitle.textContent = variant.title;
        heroDom.heroSubtitle.textContent = variant.subtitle;
        heroDom.heroDescription.textContent = `${variant.description} ${HERO_CONFIG.appDescription}`;
        heroDom.variantNumber.textContent = formatVariantIndex(heroState.activeVariant);
        heroDom.heroText.classList.remove("is-fading");
    }, 190);
}

async function switchVariant(nextVariantIndex) {
    const total = heroState.variants.length;
    const resolved = ((nextVariantIndex % total) + total) % total;
    if (resolved === heroState.activeVariant) {
        return;
    }

    showVariantLoading(true, "Cargando...");
    await preloadInitialFrames(resolved);

    heroState.activeVariant = resolved;
    heroState.lastRenderedFrame = -1;
    const variant = heroState.variants[heroState.activeVariant];
    applyThemeColor(variant.themeColor || HERO_CONFIG.defaultThemeColor);
    fadeHeroTextToVariant(variant);
    lazyLoadRemainingFrames(heroState.activeVariant);
    requestHeroRender(true);
    showVariantLoading(false);
}

function cacheHeroDomNodes() {
    heroDom.pageLoader = document.getElementById("pp-page-loader");
    heroDom.pageLoaderVideo = document.getElementById("pp-page-loader-video");
    heroDom.heroSection = document.getElementById("hero");
    heroDom.heroFrame = document.getElementById("pp-hero-frame");
    heroDom.heroText = document.getElementById("pp-hero-text");
    heroDom.heroBrand = document.getElementById("pp-hero-brand");
    heroDom.heroBadgeText = document.getElementById("pp-hero-badge-text");
    heroDom.heroTitle = document.getElementById("pp-hero-title");
    heroDom.heroSubtitle = document.getElementById("pp-hero-subtitle");
    heroDom.heroDescription = document.getElementById("pp-hero-description");
    heroDom.variantNumber = document.getElementById("pp-variant-number");
    heroDom.variantLoading = document.getElementById("pp-variant-loading");
    heroDom.prevVariant = document.getElementById("pp-prev-variant");
    heroDom.nextVariant = document.getElementById("pp-next-variant");

    return Boolean(
        heroDom.heroSection &&
        heroDom.heroFrame &&
        heroDom.heroText &&
        heroDom.heroBrand &&
        heroDom.heroBadgeText &&
        heroDom.heroTitle &&
        heroDom.heroSubtitle &&
        heroDom.heroDescription &&
        heroDom.variantNumber &&
        heroDom.variantLoading &&
        heroDom.prevVariant &&
        heroDom.nextVariant
    );
}

function bindHeroInteractions() {
    heroDom.prevVariant.addEventListener("click", () => {
        switchVariant(heroState.activeVariant - 1);
    });
    heroDom.nextVariant.addEventListener("click", () => {
        switchVariant(heroState.activeVariant + 1);
    });

    window.addEventListener(
        "scroll",
        () => {
            if (heroState.scheduledScrollFrame) {
                return;
            }
            heroState.scheduledScrollFrame = window.requestAnimationFrame(() => {
                heroState.scheduledScrollFrame = 0;
                requestHeroRender(false);
            });
        },
        { passive: true }
    );

    window.addEventListener("resize", () => requestHeroRender(true));
}

function initPageLoaderVideo() {
    if (!heroDom.pageLoaderVideo) {
        return;
    }

    const playPromise = heroDom.pageLoaderVideo.play();
    if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => null);
    }
}

async function initParallaxHero() {
    const loaderStartTime = performance.now();

    if (!cacheHeroDomNodes()) {
        hidePageLoaderWithMinimumDuration(loaderStartTime);
        return;
    }

    heroState.variants = sanitizeVariants(HERO_CONFIG.variants);
    const initialVariant = heroState.variants[heroState.activeVariant];

    initPageLoaderVideo();
    applyThemeColor(initialVariant.themeColor || HERO_CONFIG.defaultThemeColor);
    fadeHeroTextToVariant(initialVariant);
    showVariantLoading(true, "Cargando 0%");

    await preloadInitialFrames(heroState.activeVariant, (loaded, total) => {
        const percent = Math.round((loaded / total) * 100);
        showVariantLoading(true, `Cargando ${percent}%`);
    });

    lazyLoadRemainingFrames(heroState.activeVariant);
    requestHeroRender(true);
    bindHeroInteractions();
    showVariantLoading(false);
    hidePageLoaderWithMinimumDuration(loaderStartTime);
}

document.addEventListener("DOMContentLoaded", () => {
    initHeaderScroll();
    initHeaderLogoAutoSize();
    initSmoothScroll();
    initSectionReveal();
    initParallaxHero().catch(() => hidePageLoader());
});
