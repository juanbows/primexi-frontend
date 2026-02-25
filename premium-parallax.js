"use strict";

const CONFIG = {
  appName: "PRIME XI",
  appDescription:
    "A data-driven fantasy football platform that provides optimal lineups, captain picks, and transfer recommendations for every Premier League gameweek.",
  defaultThemeColor: "#00FF85",
  initialPreloadCount: 20,
  variants: [
    {
      title: "CONTROL MODE",
      subtitle: "SAFE PICKS + CONSISTENCY",
      description:
        "Build a stable weekly XI with captain confidence and fixture-weighted projections.",
      themeColor: "#00FF85",
      frameCount: 192,
      sequenceUrl:
        "https://rbypiwjphnhfgbvqnuoq.supabase.co/storage/v1/object/public/prime-xi-animations/ef_anim/frame_000_delay-0.041s.webp",
    },
    {
      title: "AGGRESSION MODE",
      subtitle: "CAPTAIN UPSIDE",
      description:
        "Maximize ceiling outcomes with explosive captain picks and high-impact transfers.",
      themeColor: "#26D5FF",
      frameCount: 192,
      sequenceUrl:
        "https://rbypiwjphnhfgbvqnuoq.supabase.co/storage/v1/object/public/prime-xi-animations/eh_anim/frame_000_delay-0.041s.webp",
    },
    {
      title: "DIFFERENTIAL MODE",
      subtitle: "CLIMB THE RANKS",
      description:
        "Calculated differentials and smart transfers designed to gain rank advantage.",
      themeColor: "#FFCF40",
      frameCount: 192,
      sequenceUrl:
        "https://rbypiwjphnhfgbvqnuoq.supabase.co/storage/v1/object/public/prime-xi-animations/bf_anim/frame_000_delay-0.041s.webp",
    },
  ],
};

const MAX_FRAME_INDEX = 191;
const FRAME_SUFFIX = "_delay-0.041s.webp";

const state = {
  variants: [],
  activeVariant: 0,
  frameCache: new Map(),
  lastRenderedFrame: -1,
  scheduledScrollFrame: 0,
  scheduledRenderFrame: 0,
};

const dom = {};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function sanitizeVariants(variants) {
  return variants.map((variant) => {
    const frameCount = Math.min(variant.frameCount || 192, 192);
    const maxIndex = Math.min(frameCount - 1, MAX_FRAME_INDEX);
    const basePath = variant.sequenceUrl.replace(
      /\/frame_\d{3}_delay-0\.041s\.webp$/,
      ""
    );
    return { ...variant, frameCount, maxIndex, basePath };
  });
}

function buildFrameUrl(basePath, index) {
  const safeIndex = clamp(index, 0, MAX_FRAME_INDEX);
  return `${basePath}/frame_${String(safeIndex).padStart(3, "0")}${FRAME_SUFFIX}`;
}

function getVariantStore(variantIndex) {
  if (!state.frameCache.has(variantIndex)) {
    const variant = state.variants[variantIndex];
    state.frameCache.set(variantIndex, {
      images: new Array(variant.frameCount),
      loaded: new Array(variant.frameCount).fill(false),
      loading: new Map(),
      lazyStarted: false,
    });
  }
  return state.frameCache.get(variantIndex);
}

function loadFrame(variantIndex, frameIndex) {
  const variant = state.variants[variantIndex];
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
      reject(new Error(`Failed to load frame ${idx}`));
    };
  });

  store.loading.set(idx, promise);
  return promise;
}

async function preloadInitialFrames(variantIndex, onProgress) {
  const variant = state.variants[variantIndex];
  const total = Math.min(CONFIG.initialPreloadCount, variant.frameCount);
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
  const variant = state.variants[variantIndex];
  const store = getVariantStore(variantIndex);
  if (store.lazyStarted) {
    return;
  }
  store.lazyStarted = true;

  const queue = [];
  for (let index = CONFIG.initialPreloadCount; index < variant.frameCount; index += 1) {
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
        await loadFrame(variantIndex, idx);
      } catch (error) {
        // Skip failed frame and continue loading the rest.
      }
    }
  };

  for (let worker = 0; worker < concurrency; worker += 1) {
    runWorker();
  }
}

function findNearestLoadedFrame(variantIndex, targetFrame) {
  const variant = state.variants[variantIndex];
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
  const start = dom.heroSection.offsetTop;
  const end = start + dom.heroSection.offsetHeight - window.innerHeight;
  if (end <= start) {
    return 0;
  }
  const progress = clamp((window.scrollY - start) / (end - start), 0, 1);
  return Math.round(progress * variant.maxIndex);
}

function renderFrameForCurrentScroll(force = false) {
  const variant = state.variants[state.activeVariant];
  const desired = clamp(getScrollFrameIndex(variant), 0, variant.maxIndex);
  const frameToRender = findNearestLoadedFrame(state.activeVariant, desired);
  if (!force && frameToRender === state.lastRenderedFrame) {
    return;
  }

  const store = getVariantStore(state.activeVariant);
  const image = store.images[frameToRender];
  if (!image) {
    return;
  }

  dom.heroFrame.src = image.src;
  state.lastRenderedFrame = frameToRender;

  if (!store.loaded[desired]) {
    loadFrame(state.activeVariant, desired)
      .then(() => requestRenderFrame(true))
      .catch(() => null);
  }
}

function requestRenderFrame(force = false) {
  if (state.scheduledRenderFrame) {
    return;
  }
  state.scheduledRenderFrame = window.requestAnimationFrame(() => {
    state.scheduledRenderFrame = 0;
    renderFrameForCurrentScroll(force);
  });
}

function getTopNavHeight() {
  return (dom.topNav && dom.topNav.offsetHeight) ? dom.topNav.offsetHeight : 84;
}

function scheduleScrollUpdate() {
  if (state.scheduledScrollFrame) {
    return;
  }
  state.scheduledScrollFrame = window.requestAnimationFrame(() => {
    state.scheduledScrollFrame = 0;
    requestRenderFrame(false);
    updateActiveNavLink();
  });
}

function applyThemeColor(color) {
  document.documentElement.style.setProperty("--accent", color || CONFIG.defaultThemeColor);
}

function formatVariantIndex(index) {
  return String(index + 1).padStart(2, "0");
}

function updateStaticBrandText() {
  dom.brandName.textContent = CONFIG.appName;
  dom.loadingBrand.textContent = CONFIG.appName;
  dom.footerBrand.textContent = CONFIG.appName;
}

function updateProductDescription(variant) {
  dom.productDescription.textContent = CONFIG.appDescription;
  dom.heroDescription.textContent = `${variant.description} ${CONFIG.appDescription}`;
}

function fadeHeroTextToVariant(variant) {
  dom.heroText.classList.add("is-fading");
  window.setTimeout(() => {
    dom.heroBrand.textContent = CONFIG.appName;
    dom.heroTitle.textContent = variant.title;
    dom.heroSubtitle.textContent = variant.subtitle;
    updateProductDescription(variant);
    dom.variantNumber.textContent = formatVariantIndex(state.activeVariant);
    dom.heroText.classList.remove("is-fading");
  }, 190);
}

function showVariantLoading(isVisible, label) {
  if (label) {
    dom.variantLoading.textContent = label;
  }
  dom.variantLoading.classList.toggle("is-visible", isVisible);
}

async function switchVariant(nextVariantIndex) {
  const total = state.variants.length;
  const resolved = ((nextVariantIndex % total) + total) % total;
  if (resolved === state.activeVariant) {
    return;
  }

  showVariantLoading(true, "Loading...");
  await preloadInitialFrames(resolved);

  state.activeVariant = resolved;
  state.lastRenderedFrame = -1;
  const variant = state.variants[state.activeVariant];
  applyThemeColor(variant.themeColor || CONFIG.defaultThemeColor);
  fadeHeroTextToVariant(variant);
  lazyLoadRemainingFrames(state.activeVariant);
  requestRenderFrame(true);
  showVariantLoading(false);
}

function updateActiveNavLink() {
  const sections = document.querySelectorAll("main section");
  let currentSectionId = "";
  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.35 && rect.bottom > window.innerHeight * 0.3) {
      currentSectionId = section.id;
    }
  });

  document.querySelectorAll("[data-link]").forEach((link) => {
    const isActive = link.getAttribute("href") === `#${currentSectionId}`;
    link.classList.toggle("is-active", isActive);
  });
}

function initSectionReveal() {
  const sections = document.querySelectorAll("main .content-section");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) {
    sections.forEach((section) => section.classList.add("is-visible"));
    return;
  }

  sections.forEach((section, index) => {
    section.classList.add("reveal-section");
    section.style.setProperty("--reveal-delay", `${Math.min(index * 70, 300)}ms`);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        const section = entry.target;
        if (section.dataset.revealing === "1") {
          return;
        }
        section.dataset.revealing = "1";
        window.setTimeout(() => {
          section.classList.add("is-visible");
        }, 90);
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -38% 0px",
    }
  );

  sections.forEach((section) => observer.observe(section));
}

function bindInteractions() {
  dom.prevVariant.addEventListener("click", () => {
    switchVariant(state.activeVariant - 1);
  });
  dom.nextVariant.addEventListener("click", () => {
    switchVariant(state.activeVariant + 1);
  });

  document.querySelectorAll("a[href^='#'], [data-scroll]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const selector = link.getAttribute("href") || link.getAttribute("data-scroll");
      if (!selector || !selector.startsWith("#")) {
        return;
      }
      const target = document.querySelector(selector);
      if (!target) {
        return;
      }
      event.preventDefault();
      const topOffset = getTopNavHeight() + 10;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - topOffset;
      window.scrollTo({
        top: Math.max(0, targetTop),
        behavior: "smooth",
      });
    });
  });

  window.addEventListener("scroll", scheduleScrollUpdate, { passive: true });
  window.addEventListener("resize", () => requestRenderFrame(true));
}

function cacheDomNodes() {
  dom.loadingOverlay = document.getElementById("loadingOverlay");
  dom.loadingBar = document.getElementById("loadingBar");
  dom.loadingPercent = document.getElementById("loadingPercent");
  dom.loadingBrand = document.getElementById("loadingBrand");
  dom.siteRoot = document.getElementById("siteRoot");
  dom.topNav = document.querySelector(".top-nav");
  dom.brandName = document.getElementById("brandName");
  dom.footerBrand = document.getElementById("footerBrand");
  dom.heroSection = document.getElementById("hero");
  dom.heroFrame = document.getElementById("heroFrame");
  dom.heroText = document.getElementById("heroText");
  dom.heroBrand = document.getElementById("heroBrand");
  dom.heroTitle = document.getElementById("heroTitle");
  dom.heroSubtitle = document.getElementById("heroSubtitle");
  dom.heroDescription = document.getElementById("heroDescription");
  dom.variantNumber = document.getElementById("variantNumber");
  dom.variantLoading = document.getElementById("variantLoading");
  dom.prevVariant = document.getElementById("prevVariant");
  dom.nextVariant = document.getElementById("nextVariant");
  dom.productDescription = document.getElementById("productDescription");
}

async function init() {
  cacheDomNodes();
  state.variants = sanitizeVariants(CONFIG.variants);
  document.documentElement.setAttribute("data-mode", "dark");
  updateStaticBrandText();

  const initialVariant = state.variants[state.activeVariant];
  applyThemeColor(initialVariant.themeColor || CONFIG.defaultThemeColor);

  fadeHeroTextToVariant(initialVariant);
  showVariantLoading(false);

  await preloadInitialFrames(state.activeVariant, (loaded, total) => {
    const percent = Math.round((loaded / total) * 100);
    dom.loadingBar.style.width = `${percent}%`;
    dom.loadingPercent.textContent = `Loading ${percent}%`;
  });

  lazyLoadRemainingFrames(state.activeVariant);
  requestRenderFrame(true);
  bindInteractions();
  initSectionReveal();
  updateActiveNavLink();

  dom.siteRoot.classList.remove("is-loading");
  dom.loadingOverlay.style.opacity = "0";
  window.setTimeout(() => {
    dom.loadingOverlay.remove();
  }, 360);

  document.getElementById("year").textContent = String(new Date().getFullYear());
}

document.addEventListener("DOMContentLoaded", init);
