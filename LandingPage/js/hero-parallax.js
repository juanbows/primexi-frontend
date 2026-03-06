"use strict";

/* ─── PRIME XI — Premium Parallax Hero (Integrated Module) ─────────────────── */
/* This script manages only the hero section's frame-sequence animation,        */
/* variant switching, and loading overlay.                                       */
/* It does NOT touch the cursor, nav, features, stats, footer, etc.             */

const HERO_CONFIG = {
    appName: "PRIME XI",
    appDescription:
        "Una plataforma de análisis impulsada por IA que ofrece alineaciones óptimas, selección de capitán y recomendaciones de transferencia para cada jornada de la Premier League.",
    defaultThemeColor: "#00FF85",
    initialPreloadCount: 20,
    variants: [
        {
            title: "CONTROL MODE",
            subtitle: "SAFE PICKS + CONSISTENCY",
            description:
                "Construye un XI semanal estable con confianza en el capitán y proyecciones ponderadas por fixture.",
            themeColor: "#00FF85",
            frameCount: 192,
            sequenceUrl:
                "https://rbypiwjphnhfgbvqnuoq.supabase.co/storage/v1/object/public/prime-xi-animations/ef_anim/frame_000_delay-0.041s.webp",
        },
        {
            title: "AGGRESSION MODE",
            subtitle: "CAPTAIN UPSIDE",
            description:
                "Maximiza los resultados techo con selecciones explosivas de capitán y transferencias de alto impacto.",
            themeColor: "#26D5FF",
            frameCount: 192,
            sequenceUrl:
                "https://rbypiwjphnhfgbvqnuoq.supabase.co/storage/v1/object/public/prime-xi-animations/eh_anim/frame_000_delay-0.041s.webp",
        },
        {
            title: "DIFFERENTIAL MODE",
            subtitle: "CLIMB THE RANKS",
            description:
                "Diferenciales calculados y transferencias inteligentes diseñadas para ganar ventaja en el ranking.",
            themeColor: "#FFCF40",
            frameCount: 192,
            sequenceUrl:
                "https://rbypiwjphnhfgbvqnuoq.supabase.co/storage/v1/object/public/prime-xi-animations/bf_anim/frame_000_delay-0.041s.webp",
        },
    ],
};

const HERO_MAX_FRAME_INDEX = 191;
const HERO_FRAME_SUFFIX = "_delay-0.041s.webp";

const heroState = {
    variants: [],
    activeVariant: 0,
    frameCache: new Map(),
    lastRenderedFrame: -1,
    scheduledScrollFrame: 0,
    scheduledRenderFrame: 0,
};

const heroDom = {};

function heroClamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function heroSanitizeVariants(variants) {
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

function heroBuildFrameUrl(basePath, index) {
    const safeIndex = heroClamp(index, 0, HERO_MAX_FRAME_INDEX);
    return `${basePath}/frame_${String(safeIndex).padStart(3, "0")}${HERO_FRAME_SUFFIX}`;
}

function heroGetVariantStore(variantIndex) {
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

function heroLoadFrame(variantIndex, frameIndex) {
    const variant = heroState.variants[variantIndex];
    const idx = heroClamp(frameIndex, 0, variant.maxIndex);
    const store = heroGetVariantStore(variantIndex);

    if (store.loaded[idx] && store.images[idx]) {
        return Promise.resolve(store.images[idx]);
    }
    if (store.loading.has(idx)) {
        return store.loading.get(idx);
    }

    const promise = new Promise((resolve, reject) => {
        const img = new Image();
        img.decoding = "async";
        img.src = heroBuildFrameUrl(variant.basePath, idx);
        img.onload = () => {
            store.images[idx] = img;
            store.loaded[idx] = true;
            store.loading.delete(idx);
            resolve(img);
        };
        img.onerror = () => {
            store.loading.delete(idx);
            reject(new Error(`Failed to load frame ${idx}`));
        };
    });

    store.loading.set(idx, promise);
    return promise;
}

async function heroPreloadInitialFrames(variantIndex, onProgress) {
    const variant = heroState.variants[variantIndex];
    const total = Math.min(HERO_CONFIG.initialPreloadCount, variant.frameCount);
    let loaded = 0;

    const tasks = [];
    for (let index = 0; index < total; index += 1) {
        tasks.push(
            heroLoadFrame(variantIndex, index)
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

function heroLazyLoadRemainingFrames(variantIndex) {
    const variant = heroState.variants[variantIndex];
    const store = heroGetVariantStore(variantIndex);
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

    const concurrency = 4;
    let cursor = 0;
    const runWorker = async () => {
        while (cursor < queue.length) {
            const idx = queue[cursor];
            cursor += 1;
            try {
                await heroLoadFrame(variantIndex, idx);
            } catch (error) {
                // Skip failed frame
            }
        }
    };

    for (let worker = 0; worker < concurrency; worker += 1) {
        runWorker();
    }
}

function heroFindNearestLoadedFrame(variantIndex, targetFrame) {
    const variant = heroState.variants[variantIndex];
    const store = heroGetVariantStore(variantIndex);
    const safeFrame = heroClamp(targetFrame, 0, variant.maxIndex);

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

function heroGetScrollFrameIndex(variant) {
    const start = heroDom.heroSection.offsetTop;
    const end = start + heroDom.heroSection.offsetHeight - window.innerHeight;
    if (end <= start) {
        return 0;
    }
    const progress = heroClamp((window.scrollY - start) / (end - start), 0, 1);
    return Math.round(progress * variant.maxIndex);
}

function heroRenderFrameForCurrentScroll(force = false) {
    const variant = heroState.variants[heroState.activeVariant];
    const desired = heroClamp(heroGetScrollFrameIndex(variant), 0, variant.maxIndex);
    const frameToRender = heroFindNearestLoadedFrame(heroState.activeVariant, desired);
    if (!force && frameToRender === heroState.lastRenderedFrame) {
        return;
    }

    const store = heroGetVariantStore(heroState.activeVariant);
    const image = store.images[frameToRender];
    if (!image) {
        return;
    }

    heroDom.heroFrame.src = image.src;
    heroState.lastRenderedFrame = frameToRender;

    if (!store.loaded[desired]) {
        heroLoadFrame(heroState.activeVariant, desired)
            .then(() => heroRequestRenderFrame(true))
            .catch(() => null);
    }
}

function heroRequestRenderFrame(force = false) {
    if (heroState.scheduledRenderFrame) {
        return;
    }
    heroState.scheduledRenderFrame = window.requestAnimationFrame(() => {
        heroState.scheduledRenderFrame = 0;
        heroRenderFrameForCurrentScroll(force);
    });
}

function heroScheduleScrollUpdate() {
    if (heroState.scheduledScrollFrame) {
        return;
    }
    heroState.scheduledScrollFrame = window.requestAnimationFrame(() => {
        heroState.scheduledScrollFrame = 0;
        heroRequestRenderFrame(false);
    });
}

function heroApplyThemeColor(color) {
    document.documentElement.style.setProperty("--accent", color || HERO_CONFIG.defaultThemeColor);
}

function heroFormatVariantIndex(index) {
    return String(index + 1).padStart(2, "0");
}

function heroFadeHeroTextToVariant(variant) {
    heroDom.heroText.classList.add("is-fading");
    window.setTimeout(() => {
        if (heroDom.heroBrand) heroDom.heroBrand.textContent = HERO_CONFIG.appName;
        if (heroDom.heroTitle) heroDom.heroTitle.textContent = variant.title;
        if (heroDom.heroSubtitle) heroDom.heroSubtitle.textContent = variant.subtitle;
        if (heroDom.heroDescription) {
            heroDom.heroDescription.textContent = `${variant.description}`;
        }
        if (heroDom.variantNumber) {
            heroDom.variantNumber.textContent = heroFormatVariantIndex(heroState.activeVariant);
        }
        heroDom.heroText.classList.remove("is-fading");
    }, 190);
}

function heroShowVariantLoading(isVisible, label) {
    if (!heroDom.variantLoading) return;
    if (label) {
        heroDom.variantLoading.textContent = label;
    }
    heroDom.variantLoading.classList.toggle("is-visible", isVisible);
}

async function heroSwitchVariant(nextVariantIndex) {
    const total = heroState.variants.length;
    const resolved = ((nextVariantIndex % total) + total) % total;
    if (resolved === heroState.activeVariant) {
        return;
    }

    heroShowVariantLoading(true, "Cargando...");
    await heroPreloadInitialFrames(resolved);

    heroState.activeVariant = resolved;
    heroState.lastRenderedFrame = -1;
    const variant = heroState.variants[heroState.activeVariant];
    heroApplyThemeColor(variant.themeColor || HERO_CONFIG.defaultThemeColor);
    heroFadeHeroTextToVariant(variant);
    heroLazyLoadRemainingFrames(heroState.activeVariant);
    heroRequestRenderFrame(true);
    heroShowVariantLoading(false);
}

function heroBindInteractions() {
    if (heroDom.prevVariant) {
        heroDom.prevVariant.addEventListener("click", () => {
            heroSwitchVariant(heroState.activeVariant - 1);
        });
    }
    if (heroDom.nextVariant) {
        heroDom.nextVariant.addEventListener("click", () => {
            heroSwitchVariant(heroState.activeVariant + 1);
        });
    }

    window.addEventListener("scroll", heroScheduleScrollUpdate, { passive: true });
    window.addEventListener("resize", () => heroRequestRenderFrame(true));
}

function heroCacheDomNodes() {
    heroDom.loadingOverlay = document.getElementById("loadingOverlay");
    heroDom.loadingBar = document.getElementById("loadingBar");
    heroDom.loadingPercent = document.getElementById("loadingPercent");
    heroDom.heroSection = document.getElementById("hero");
    heroDom.heroFrame = document.getElementById("heroFrame");
    heroDom.heroText = document.getElementById("heroText");
    heroDom.heroBrand = document.getElementById("heroBrand");
    heroDom.heroTitle = document.getElementById("heroTitle");
    heroDom.heroSubtitle = document.getElementById("heroSubtitle");
    heroDom.heroDescription = document.getElementById("heroDescription");
    heroDom.variantNumber = document.getElementById("variantNumber");
    heroDom.variantLoading = document.getElementById("variantLoading");
    heroDom.prevVariant = document.getElementById("prevVariant");
    heroDom.nextVariant = document.getElementById("nextVariant");
}

async function heroInit() {
    heroCacheDomNodes();

    // Bail out if hero section not found (safety check)
    if (!heroDom.heroSection || !heroDom.heroFrame) {
        console.warn("Hero parallax: required DOM elements not found.");
        return;
    }

    heroState.variants = heroSanitizeVariants(HERO_CONFIG.variants);

    const initialVariant = heroState.variants[heroState.activeVariant];
    heroApplyThemeColor(initialVariant.themeColor || HERO_CONFIG.defaultThemeColor);

    heroFadeHeroTextToVariant(initialVariant);
    heroShowVariantLoading(false);

    await heroPreloadInitialFrames(heroState.activeVariant, (loaded, total) => {
        const percent = Math.round((loaded / total) * 100);
        if (heroDom.loadingBar) heroDom.loadingBar.style.width = `${percent}%`;
        if (heroDom.loadingPercent) heroDom.loadingPercent.textContent = `Cargando ${percent}%`;
    });

    heroLazyLoadRemainingFrames(heroState.activeVariant);
    heroRequestRenderFrame(true);
    heroBindInteractions();

    // Remove loading overlay
    if (heroDom.loadingOverlay) {
        heroDom.loadingOverlay.style.opacity = "0";
        window.setTimeout(() => {
            heroDom.loadingOverlay.remove();
        }, 500);
    }
}

document.addEventListener("DOMContentLoaded", heroInit);
