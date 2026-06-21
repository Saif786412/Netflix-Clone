// =========================================
// 1. Cloud Security: Firebase Imports & Config
// =========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  addDoc,
  updateDoc,
  collection,
  serverTimestamp,
  getDocs,
  deleteDoc,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
const firebaseConfig = {
  apiKey: "AIzaSyCWqgVbkU67YwJq-rCX6DDBpfGyzk41kYA",
  authDomain: "last-semester-project-netflix.firebaseapp.com",
  projectId: "last-semester-project-netflix",
  storageBucket: "last-semester-project-netflix.firebasestorage.app",
  messagingSenderId: "837800691983",
  appId: "1:837800691983:web:2943e805ebba00ed61167a",
  measurementId: "G-SMKM5VXF84"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const TITLE_IMAGE_EXTENSION_PATTERN = /\.(?:png|jpe?g|webp|gif|avif)$/i;
const MOVIE_TITLE_IMAGE_MAX_LENGTH = 2048;
const TITLE_CASE_SMALL_WORDS = new Set(["a", "an", "and", "as", "at", "but", "by", "for", "from", "in", "nor", "of", "on", "or", "the", "to", "vs", "with"]);
const SAFE_RELATIVE_IMAGE_PATH_PATTERN = /^(?:\.\/)?[a-z0-9][a-z0-9._~-]*(?:\/[a-z0-9][a-z0-9._~-]*)*\.(?:jpe?g|png|webp|gif|avif)(?:[?#][a-z0-9._~%!$&()*+,;=:@/?-]*)?$/i;
const UNSAFE_MEDIA_INPUT_PATTERN = /<\s*script|<[^>]*>|javascript:|data:|vbscript:|on(?:error|load|click|mouseover|mouseenter|mouseleave|focus|blur|submit|animationstart|transitionend)\s*=/i;
const ADMIN_DASHBOARD_TRANSITION_MS = 720;
const DELETE_CONFIRM_MODAL_TRANSITION_MS = 280;
const AUTH_MODAL_TRANSITION_MS = 720;
const AUTH_MODAL_TRANSITION_FALLBACK_MS = AUTH_MODAL_TRANSITION_MS + 100;
const AUTH_MODAL_REDUCED_MOTION_CLOSE_MS = 40;
const ADMIN_FORM_STATE_LEAVE_MS = 180;
const ADMIN_FORM_STATE_ENTER_MS = 280;
const TOAST_AUTO_DISMISS_MS = 3000;
const TOAST_EXIT_MS = 360;
const TOAST_MAX_VISIBLE = 4;
const BEFORE_TRENDING_NOW_PLACEMENT = "before-trending-now";
const HERO_LOGO_BADGE = "hero-logo";
const ALLOWED_MOVIE_PLACEMENTS = new Set([
  BEFORE_TRENDING_NOW_PLACEMENT,
  "after-todays-pick",
  "after-new-on-netflix",
  "after-us-tv-dramas",
  "after-continue-watching",
  "after-crowd-pleasers",
  "after-top-10",
  "after-memory",
  "after-kdrama",
  "after-only-on-netflix",
  "after-my-list"
]);
const MOVIE_BADGE_OPTIONS = Object.freeze([
  { value: "new", label: "New" },
  { value: "cloud", label: "Cloud" },
  { value: "top10", label: "Top 10" },
  { value: "recently-added", label: "Recently Added" },
  { value: HERO_LOGO_BADGE, label: "Logo in Hero Banner" }
]);
const MOVIE_BADGE_LABELS = new Map(MOVIE_BADGE_OPTIONS.map((badge) => [badge.value, badge.label]));
const ALLOWED_MOVIE_BADGES = new Set(MOVIE_BADGE_OPTIONS.map((badge) => badge.value));
const MOVIE_BADGES_PLACEHOLDER = "Movie Badges";
const POSTER_APPLY_TARGET_OPTIONS = Object.freeze([
  { value: "before", label: "Before Subscription Page" },
  { value: "after", label: "After Subscription Page" },
  { value: "both", label: "Both Pages" }
]);
const ALLOWED_POSTER_APPLY_TARGETS = new Set(POSTER_APPLY_TARGET_OPTIONS.map((target) => target.value));
const POSTER_APPLY_TARGETS_PLACEHOLDER = "Poster Image For";
const RANK_APPLY_TARGET_OPTIONS = Object.freeze([
  { value: "before", label: "Before Subscription Page" },
  { value: "after", label: "After Subscription Page" },
  { value: "both", label: "Both Pages" }
]);
const ALLOWED_RANK_APPLY_TARGETS = new Set(RANK_APPLY_TARGET_OPTIONS.map((target) => target.value));
const RANK_APPLY_TARGETS_PLACEHOLDER = "Display Rank For";
const TOAST_TYPES = new Set(["success", "error", "warning", "info"]);


// =========================================
// 2. Global Execution Environment
// =========================================
document.addEventListener('DOMContentLoaded', () => {
  console.log("System Initialized: JavaScript running successfully.");

  // -----------------------------------------
  // A. Original UI Features (Intact)
  // -----------------------------------------
  
  // Horizontal Scroll Logic
  const scrollContainer = document.querySelector('.cards');
  const prevButton = document.querySelector('.prev-button');
  const nextButton = document.querySelector('.next-button');
  const beforeTrendingMovieCardData = new WeakMap();
  let beforeTitleModalState = null;
  const BEFORE_TITLE_CLOSE_MS = 330;

  function updateButtonStates() {
    if (!scrollContainer || !prevButton || !nextButton) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
    prevButton.disabled = scrollLeft <= 0;
    nextButton.disabled = Math.ceil(scrollLeft + clientWidth) >= scrollWidth;
  }

  if (prevButton) {
    prevButton.addEventListener('click', () => scrollContainer.scrollBy({ left: -250, behavior: 'smooth' }));
  }
  if (nextButton) {
    nextButton.addEventListener('click', () => scrollContainer.scrollBy({ left: 250, behavior: 'smooth' }));
  }
  if (scrollContainer) {
    scrollContainer.addEventListener('scroll', updateButtonStates);
    scrollContainer.addEventListener('click', handleBeforeTrendingCardClick);
  }
  updateButtonStates();
  window.addEventListener('resize', updateButtonStates);
  loadHomepageMovies();
  loadFeaturedBanner();

  // Accordion Logic
  const accordionButtons = document.querySelectorAll('.accordion-button');
  accordionButtons.forEach(button => {
    button.addEventListener('click', () => {
      const accordionItem = button.parentElement;
      const accordionContent = button.nextElementSibling; 
      accordionItem.classList.toggle('active');
      if (accordionItem.classList.contains('active')) {
        accordionContent.style.maxHeight = accordionContent.scrollHeight + 'px';
      } else {
        accordionContent.style.maxHeight = '0';
      }
    });
  });

  // Language Selector Logic
  const allSelectorWrappers = document.querySelectorAll('.language-selector-wrapper, .language-selector-wrapper-1');
  allSelectorWrappers.forEach(wrapperElement => {
    const langButton = wrapperElement.querySelector('.language-selector-button');
    const optionsList = wrapperElement.querySelector('.language-options-list');
    const selectedLanguageSpan = wrapperElement.querySelector('.selected-language');

    if (!langButton || !optionsList || !selectedLanguageSpan) return;

    langButton.addEventListener('click', (event) => {
      event.stopPropagation(); 
      allSelectorWrappers.forEach(otherWrapper => {
        const otherOptionsList = otherWrapper.querySelector('.language-options-list');
        if (otherOptionsList && otherOptionsList !== optionsList && otherOptionsList.classList.contains('show')) {
          otherOptionsList.classList.remove('show');
        }
      });
      optionsList.classList.toggle('show');
    });

    optionsList.addEventListener('click', (event) => {
      if (event.target.tagName === 'LI' && event.target.dataset.langValue) {
        selectedLanguageSpan.textContent = event.target.textContent;
        optionsList.classList.remove('show'); 
      }
    });
  });

  document.addEventListener('click', (event) => {
    allSelectorWrappers.forEach(wrapperElement => {
      const optionsList = wrapperElement.querySelector('.language-options-list');
      if (optionsList && optionsList.classList.contains('show') && !wrapperElement.contains(event.target)) {
        optionsList.classList.remove('show'); 
      }
    });
  });

  // Recaptcha Logic
  const learnMoreButton = document.querySelector('[data-uia="recaptcha-learn-more-button"]');
  const disclosureContent = document.querySelector('[data-uia="recaptcha-disclosure"]');
  if (learnMoreButton && disclosureContent) {
    learnMoreButton.addEventListener('click', () => {
      disclosureContent.classList.toggle('is-active');
      learnMoreButton.textContent = disclosureContent.classList.contains('is-active') ? 'Hide details' : 'Learn more.';
    });
  }

  // -----------------------------------------
  // B. Cloud Security: IAM Auth Modal Logic
  // -----------------------------------------
  const authModal = document.getElementById('auth-modal');
  const navSignInBtn = document.querySelector('.signin'); 
  const closeModalBtn = document.getElementById('close-modal');
  
  const authForm = document.getElementById('auth-form');
  const authTitle = document.getElementById('auth-title');
  const authSubtitle = document.getElementById('auth-subtitle');
  const authSubmitBtn = document.querySelector('.auth-btn');
  const emailInput = document.getElementById('auth-email');
  const passwordInput = document.getElementById('auth-password');
  const authError = document.getElementById('auth-error');

  const toggleAuthLink = document.getElementById('toggle-auth');
  const authSwitchText = document.getElementById('auth-switch-text');

  const adminDashboardBtn = document.getElementById('admin-dashboard-btn');
  const movieForm = document.getElementById('movie-form');
  const cancelEditMovieBtn = document.getElementById('cancel-edit-movie');
  const movieList = document.getElementById('movie-list');
  const adminMovieSearch = document.getElementById('admin-movie-search');
  const clearMovieSearch = document.getElementById('clear-movie-search');
  const adminDashboard = document.getElementById('admin-dashboard');
  const closeAdminDashboard = document.getElementById('close-admin-dashboard');
  const toastRegion = document.getElementById('toast');
 

let currentRole = "guest";
let editingMovieId = null;
let isEditMode = false;
let editingOriginalBannerUrl = "";
let editingOriginalTrailerUrl = "";
let adminEditScrollFrame = null;
let adminEditRevealFrame = null;
let adminEditRevealTimer = null;
let adminEditFillFrame = null;
let adminEditFillTimer = null;
let adminEditClearTimer = null;
let adminDashboardCloseTimer = null;
let adminDeleteConfirmCloseTimer = null;
let adminDeleteConfirmRequest = null;
let adminDeleteConfirmTrigger = null;
let toastSequence = 0;
const toastQueue = [];
const activeToasts = new Map();
const afterSubscriptionPage = "netflix-after-subscription.html";

initPlacementDropdown();
initPosterApplyTargetDropdown();
initRankApplyTargetDropdown();
initMovieBadgesDropdown();

function prefersReducedMotion() {
    return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
}

function showToast(message, options = {}) {
    if (!toastRegion) return;

    const config = typeof options === "string" ? { type: options } : options;
    const type = TOAST_TYPES.has(config.type) ? config.type : "info";
    const title = cleanToastText(String(message || ""), "", 140);
    const detail = cleanToastText(String(config.detail || ""), "", 180);

    if (!title) return;

    toastQueue.push({
        id: ++toastSequence,
        title,
        detail,
        type,
        timer: null,
        element: null
    });

    processToastQueue();
}

function showFirestoreFailure(fallbackMessage, error) {
    showToast("Firestore Operation Failed", {
        type: "error",
        detail: getFirestoreFailureDetail(fallbackMessage, error)
    });
}

function getFirestoreFailureDetail(fallbackMessage, error) {
    const fallback = cleanToastText(fallbackMessage, "Request failed.", 120);
    const code = cleanToastText(String(error?.code || ""), "", 80);

    if (code === "permission-denied") {
        return "Permission denied by Firestore rules.";
    }

    return code ? `${fallback} ${code}` : fallback;
}

function cleanToastText(value, fallback = "", maxLength = 160) {
    if (typeof value !== "string") return fallback;

    const text = value.trim().replace(/\s+/g, " ");
    if (!text) return fallback;

    const unsafePattern = /<[^>]*>|javascript:|onerror=|onload=|onclick=|eval\(|document\.cookie|localStorage|sessionStorage/i;
    if (unsafePattern.test(text)) return fallback;

    return text.slice(0, maxLength);
}

function processToastQueue() {
    if (!toastRegion) return;

    while (activeToasts.size < TOAST_MAX_VISIBLE && toastQueue.length > 0) {
        mountToast(toastQueue.shift());
    }
}

function mountToast(toast) {
    const card = document.createElement("div");
    card.className = "toast-card";
    card.dataset.toastType = toast.type;
    card.setAttribute("role", toast.type === "error" ? "alert" : "status");

    const content = document.createElement("div");
    content.className = "toast-content";

    const title = document.createElement("div");
    title.className = "toast-title";
    title.textContent = toast.title;
    content.appendChild(title);

    if (toast.detail) {
        const detail = document.createElement("div");
        detail.className = "toast-detail";
        detail.textContent = toast.detail;
        content.appendChild(detail);
    }

    card.appendChild(content);
    toast.element = card;
    activeToasts.set(toast.id, toast);
    toastRegion.appendChild(card);

    window.requestAnimationFrame(() => {
        card.classList.add("is-visible");
    });

    toast.timer = window.setTimeout(() => {
        dismissToast(toast.id);
    }, TOAST_AUTO_DISMISS_MS);
}

function dismissToast(toastId) {
    const toast = activeToasts.get(toastId);
    if (!toast) return;

    activeToasts.delete(toastId);
    window.clearTimeout(toast.timer);

    const card = toast.element;
    if (!card) {
        processToastQueue();
        return;
    }

    let removed = false;
    const removeToast = () => {
        if (removed) return;

        removed = true;
        card.removeEventListener("transitionend", handleTransitionEnd);
        card.remove();
        processToastQueue();
    };
    const handleTransitionEnd = (event) => {
        if (event.target === card && event.propertyName === "opacity") {
            removeToast();
        }
    };

    card.addEventListener("transitionend", handleTransitionEnd);
    card.classList.remove("is-visible");
    card.classList.add("is-leaving");
    window.setTimeout(removeToast, prefersReducedMotion() ? 20 : TOAST_EXIT_MS + 80);
}

async function runSecondaryFollowUp(label, action) {
    try {
        return await action();
    } catch (error) {
        console.warn(`${label} failed:`, error?.code || error?.message || error);
        return null;
    }
}

function clearAdminEditFillTransition() {
    if (adminEditFillFrame) {
        window.cancelAnimationFrame(adminEditFillFrame);
    }

    window.clearTimeout(adminEditFillTimer);
    window.clearTimeout(adminEditClearTimer);
    adminEditFillFrame = null;
    adminEditFillTimer = null;
    adminEditClearTimer = null;
    movieForm?.classList.remove("form-state-leaving", "form-state-entering");
}

function runAdminEditFormStateSwap(applyState) {
    clearAdminEditFillTransition();

    if (!movieForm || prefersReducedMotion()) {
        applyState?.();
        return;
    }

    movieForm.classList.add("form-state-leaving");
    void movieForm.offsetWidth;

    adminEditClearTimer = window.setTimeout(() => {
        applyState?.();
        movieForm.classList.remove("form-state-leaving");
        movieForm.classList.add("form-state-entering");
        void movieForm.offsetWidth;
        adminEditClearTimer = null;

        adminEditFillFrame = window.requestAnimationFrame(() => {
            movieForm.classList.remove("form-state-entering");
            adminEditFillFrame = null;
            adminEditFillTimer = window.setTimeout(() => {
                adminEditFillTimer = null;
            }, ADMIN_FORM_STATE_ENTER_MS);
        });
    }, ADMIN_FORM_STATE_LEAVE_MS);
}

function clearAdminEditTransition() {
    if (adminEditScrollFrame) {
        window.cancelAnimationFrame(adminEditScrollFrame);
    }

    if (adminEditRevealFrame) {
        window.cancelAnimationFrame(adminEditRevealFrame);
    }

    window.clearTimeout(adminEditRevealTimer);
    adminEditScrollFrame = null;
    adminEditRevealFrame = null;
    adminEditRevealTimer = null;
}

function scrollAdminEditSectionIntoView(onScrollStart) {
    clearAdminEditTransition();

    const scrollContainer = movieForm?.closest(".admin-panel");
    const scrollTarget = movieForm?.closest(".admin-movie-manager") || movieForm;
    const startEditMotion = () => {
        onScrollStart?.();
    };

    if (!scrollContainer || !scrollTarget || !movieForm) {
        startEditMotion();
        return;
    }

    const containerRect = scrollContainer.getBoundingClientRect();
    const targetRect = scrollTarget.getBoundingClientRect();
    const formRect = movieForm.getBoundingClientRect();
    const currentFormPaddingBottom = Number.parseFloat(window.getComputedStyle(movieForm).paddingBottom) || 0;
    const editActionReserve = movieForm.classList.contains("edit-mode-active")
        ? 0
        : Math.max(0, 64 - currentFormPaddingBottom);
    const targetTop = scrollContainer.scrollTop + targetRect.top - containerRect.top - 4;
    const actionBottom = scrollContainer.scrollTop + formRect.bottom - containerRect.top + editActionReserve;
    const bottomPadding = 24;
    const maxScrollTop = Math.max(scrollContainer.scrollHeight - scrollContainer.clientHeight, 0);
    const destination = Math.min(
        Math.max(targetTop, actionBottom - scrollContainer.clientHeight + bottomPadding, 0),
        maxScrollTop
    );

    if (prefersReducedMotion()) {
        scrollContainer.scrollTop = destination;
        startEditMotion();
        return;
    }

    const start = scrollContainer.scrollTop;
    const distance = destination - start;

    if (Math.abs(distance) < 1) {
        adminEditScrollFrame = window.requestAnimationFrame(() => {
            startEditMotion();
            adminEditScrollFrame = null;
        });
        return;
    }

    const duration = Math.min(780, Math.max(620, Math.abs(distance) * 0.52));
    const startedAt = performance.now();
    const easeOutCubic = (progress) => 1 - Math.pow(1 - progress, 3);
    let hasStartedEditMotion = false;

    const step = (now) => {
        const progress = Math.min((now - startedAt) / duration, 1);
        scrollContainer.scrollTop = start + distance * easeOutCubic(progress);

        if (!hasStartedEditMotion) {
            hasStartedEditMotion = true;
            startEditMotion();
        }

        if (progress < 1) {
            adminEditScrollFrame = window.requestAnimationFrame(step);
        } else {
            adminEditScrollFrame = null;
        }
    };

    adminEditScrollFrame = window.requestAnimationFrame(step);
}

function revealCancelEditButton() {
    if (!cancelEditMovieBtn) return;

    if (cancelEditMovieBtn.classList.contains("show-edit-control") || prefersReducedMotion()) {
        cancelEditMovieBtn.classList.remove("is-revealing-edit-control");
        cancelEditMovieBtn.classList.add("show-edit-control");
        return;
    }

    cancelEditMovieBtn.classList.remove("show-edit-control", "is-revealing-edit-control");
    void cancelEditMovieBtn.offsetWidth;
    cancelEditMovieBtn.classList.add("is-revealing-edit-control");

    adminEditRevealFrame = window.requestAnimationFrame(() => {
        cancelEditMovieBtn.classList.add("show-edit-control");
        adminEditRevealFrame = null;
        adminEditRevealTimer = window.setTimeout(() => {
            cancelEditMovieBtn.classList.remove("is-revealing-edit-control");
            adminEditRevealTimer = null;
        }, 820);
    });
}

function initPlacementDropdown() {
    const dropdown = document.querySelector("[data-placement-dropdown]");
    const input = document.getElementById("movie-placement");

    if (!dropdown || !input || dropdown.dataset.bound === "true") {
        syncPlacementDropdown();
        return;
    }

    const toggle = dropdown.querySelector(".placement-dropdown-toggle");
    const options = dropdown.querySelectorAll("[data-placement-value]");

    if (!toggle || options.length === 0) return;

    dropdown.dataset.bound = "true";

    const closeDropdown = () => {
        dropdown.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
    };

    const toggleDropdown = () => {
        const isOpen = dropdown.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", String(isOpen));
    };

    toggle.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleDropdown();
    });

    toggle.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        toggleDropdown();
    });

    options.forEach((option) => {
        const toggleOption = () => {
            const placementValue = option.dataset.placementValue || "";
            const selectedPlacements = getSelectedMoviePlacements();
            const nextPlacements = selectedPlacements.includes(placementValue)
                ? selectedPlacements.filter((placement) => placement !== placementValue)
                : [...selectedPlacements, placementValue];

            setSelectedMoviePlacements(nextPlacements);
        };

        option.addEventListener("click", (event) => {
            event.stopPropagation();
            toggleOption();
        });

        option.addEventListener("keydown", (event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            event.stopPropagation();
            toggleOption();
        });
    });

    document.addEventListener("click", (event) => {
        if (!dropdown.contains(event.target)) {
            closeDropdown();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeDropdown();
        }
    });

    syncPlacementDropdown();
}

function getSelectedMoviePlacements() {
    const input = document.getElementById("movie-placement");
    const values = input?.value
        ? input.value.split(",").map((value) => value.trim())
        : [];

    return normalizeMoviePlacements(values);
}

function setSelectedMoviePlacements(placements = []) {
    const input = document.getElementById("movie-placement");
    const normalizedPlacements = normalizeMoviePlacements(placements);

    if (input) {
        input.value = normalizedPlacements.join(",");
        input.dispatchEvent(new Event("change", { bubbles: true }));
    }

    syncPlacementDropdown(normalizedPlacements);
}

function syncPlacementDropdown(placements = getSelectedMoviePlacements()) {
    const dropdown = document.querySelector("[data-placement-dropdown]");
    const label = dropdown?.querySelector(".placement-dropdown-label");
    const options = dropdown?.querySelectorAll("[data-placement-value]");
    const normalizedPlacements = normalizeMoviePlacements(placements);

    if (!dropdown || !label || !options) return;

    label.textContent = normalizedPlacements.length === 0
        ? "Movie Rows / Placement"
        : `${normalizedPlacements.length} row${normalizedPlacements.length === 1 ? "" : "s"} selected`;
    dropdown.classList.toggle("is-empty", normalizedPlacements.length === 0);

    options.forEach((option) => {
        const placementValue = option.dataset.placementValue || "";
        const isSelected = normalizedPlacements.includes(placementValue);
        option.classList.toggle("is-selected", isSelected);
        option.setAttribute("aria-selected", String(isSelected));
    });
}

function initPosterApplyTargetDropdown() {
    const field = document.querySelector("[data-poster-smart-field]");
    const input = document.getElementById("movie-poster-target");
    const posterInput = document.getElementById("movie-poster");
    const trigger = field?.querySelector(".poster-smart-trigger");

    if (!field || !input || !posterInput || !trigger || field.dataset.bound === "true") {
        syncPosterApplyTargetDropdown();
        return;
    }

    const options = field.querySelectorAll("[data-poster-target-value]");

    if (options.length === 0) return;

    field.dataset.bound = "true";
    const closeDropdown = () => {
        field.classList.remove("is-open");
        posterInput.setAttribute("aria-expanded", "false");
        trigger.setAttribute("aria-expanded", "false");
    };

    const toggleDropdown = () => {
        const isOpen = field.classList.toggle("is-open");
        posterInput.setAttribute("aria-expanded", String(isOpen));
        trigger.setAttribute("aria-expanded", String(isOpen));
    };

    trigger.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleDropdown();
    });

    trigger.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " " && event.key !== "ArrowDown") return;
        event.preventDefault();
        toggleDropdown();

        if (field.classList.contains("is-open")) {
            options[0]?.focus();
        }
    });

    options.forEach((option) => {
        const toggleOption = () => {
            const targetValue = option.dataset.posterTargetValue || "";
            setSelectedPosterApplyTarget(targetValue, {
                syncInput: shouldSyncPosterInputForTargetChange()
            });
            closeDropdown();
            posterInput.focus();
        };

        option.addEventListener("mousedown", (event) => {
            event.preventDefault();
        });

        option.addEventListener("click", (event) => {
            event.stopPropagation();
            toggleOption();
        });

        option.addEventListener("keydown", (event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            event.stopPropagation();
            toggleOption();
        });
    });

    document.addEventListener("click", (event) => {
        if (!field.contains(event.target)) {
            closeDropdown();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeDropdown();
        }
    });

    syncPosterApplyTargetDropdown();
}

function getSelectedPosterApplyTarget() {
    const input = document.getElementById("movie-poster-target");
    return normalizePosterApplyTarget(input?.value || "");
}

function setSelectedPosterApplyTarget(target = "", options = {}) {
    const input = document.getElementById("movie-poster-target");
    const normalizedTarget = normalizePosterApplyTarget(target);

    if (input) {
        input.value = normalizedTarget;
        input.dispatchEvent(new Event("change", { bubbles: true }));
    }

    syncPosterApplyTargetDropdown(normalizedTarget);

    if (options.syncInput === true) {
        updatePosterInputForSelectedTarget();
    }
}

function syncPosterApplyTargetDropdown(target = getSelectedPosterApplyTarget()) {
    const field = document.querySelector("[data-poster-smart-field]");
    const posterInput = document.getElementById("movie-poster");
    const options = field?.querySelectorAll("[data-poster-target-value]");
    const normalizedTarget = normalizePosterApplyTarget(target);

    if (!field || !options) return;

    field.classList.toggle("is-empty", normalizedTarget === "");
    posterInput?.setAttribute("aria-label", normalizedTarget === ""
        ? POSTER_APPLY_TARGETS_PLACEHOLDER
        : `Poster Image URL for ${getPosterApplyTargetLabel(normalizedTarget)}`);

    options.forEach((option) => {
        const targetValue = option.dataset.posterTargetValue || "";
        const isSelected = normalizedTarget === targetValue;
        option.classList.toggle("is-selected", isSelected);
        option.setAttribute("aria-selected", String(isSelected));
    });
}

function initRankApplyTargetDropdown() {
    const field = document.querySelector("[data-rank-smart-field]");
    const input = document.getElementById("movie-rank-target");
    const rankInput = document.getElementById("movie-rank");
    const trigger = field?.querySelector(".poster-smart-trigger");

    if (!field || !input || !rankInput || !trigger || field.dataset.bound === "true") {
        syncRankApplyTargetDropdown();
        return;
    }

    const options = field.querySelectorAll("[data-rank-target-value]");

    if (options.length === 0) return;

    field.dataset.bound = "true";
    const closeDropdown = () => {
        field.classList.remove("is-open");
        rankInput.setAttribute("aria-expanded", "false");
        trigger.setAttribute("aria-expanded", "false");
    };

    const toggleDropdown = () => {
        const isOpen = field.classList.toggle("is-open");
        rankInput.setAttribute("aria-expanded", String(isOpen));
        trigger.setAttribute("aria-expanded", String(isOpen));
    };

    trigger.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleDropdown();
    });

    trigger.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " " && event.key !== "ArrowDown") return;
        event.preventDefault();
        toggleDropdown();

        if (field.classList.contains("is-open")) {
            options[0]?.focus();
        }
    });

    options.forEach((option) => {
        const toggleOption = () => {
            const targetValue = option.dataset.rankTargetValue || "";
            setSelectedRankApplyTarget(targetValue, {
                syncInput: shouldSyncRankInputForTargetChange()
            });
            closeDropdown();
            rankInput.focus();
        };

        option.addEventListener("mousedown", (event) => {
            event.preventDefault();
        });

        option.addEventListener("click", (event) => {
            event.stopPropagation();
            toggleOption();
        });

        option.addEventListener("keydown", (event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            event.stopPropagation();
            toggleOption();
        });
    });

    document.addEventListener("click", (event) => {
        if (!field.contains(event.target)) {
            closeDropdown();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeDropdown();
        }
    });

    syncRankApplyTargetDropdown();
}

function getSelectedRankApplyTarget() {
    const input = document.getElementById("movie-rank-target");
    return normalizeRankApplyTarget(input?.value || "");
}

function setSelectedRankApplyTarget(target = "", options = {}) {
    const input = document.getElementById("movie-rank-target");
    const normalizedTarget = normalizeRankApplyTarget(target);

    if (input) {
        input.value = normalizedTarget;
        input.dispatchEvent(new Event("change", { bubbles: true }));
    }

    syncRankApplyTargetDropdown(normalizedTarget);

    if (options.syncInput === true) {
        updateRankInputForSelectedTarget();
    }
}

function syncRankApplyTargetDropdown(target = getSelectedRankApplyTarget()) {
    const field = document.querySelector("[data-rank-smart-field]");
    const rankInput = document.getElementById("movie-rank");
    const options = field?.querySelectorAll("[data-rank-target-value]");
    const normalizedTarget = normalizeRankApplyTarget(target);

    if (!field || !options) return;

    field.classList.toggle("is-empty", normalizedTarget === "");
    rankInput?.setAttribute("aria-label", normalizedTarget === ""
        ? RANK_APPLY_TARGETS_PLACEHOLDER
        : `Display Rank / Position for ${getRankApplyTargetLabel(normalizedTarget)}`);

    options.forEach((option) => {
        const targetValue = option.dataset.rankTargetValue || "";
        const isSelected = normalizedTarget === targetValue;
        option.classList.toggle("is-selected", isSelected);
        option.setAttribute("aria-selected", String(isSelected));
    });
}

function initMovieBadgesDropdown() {
    const dropdown = document.querySelector("[data-badges-dropdown]");
    const input = document.getElementById("movie-badges");

    if (!dropdown || !input) return;

    if (dropdown.dataset.bound === "true") {
        syncMovieBadgesDropdown();
        return;
    }

    const toggle = dropdown.querySelector(".placement-dropdown-toggle");
    const options = dropdown.querySelectorAll("[data-badge-value]");

    if (!toggle || options.length === 0) return;

    dropdown.dataset.bound = "true";

    const closeDropdown = () => {
        dropdown.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
    };

    const toggleDropdown = () => {
        const isOpen = dropdown.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", String(isOpen));
    };

    toggle.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleDropdown();
    });

    toggle.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        toggleDropdown();
    });

    options.forEach((option) => {
        option.addEventListener("click", (event) => {
            event.stopPropagation();
            const badgeValue = option.dataset.badgeValue || "";

            if (badgeValue === "none") {
                setSelectedMovieBadges([]);
                closeDropdown();
                return;
            }

            const badges = getSelectedMovieBadges();
            const updatedBadges = badges.includes(badgeValue)
                ? badges.filter((badge) => badge !== badgeValue)
                : [...badges, badgeValue];

            setSelectedMovieBadges(updatedBadges);
        });
    });

    document.addEventListener("click", (event) => {
        if (!dropdown.contains(event.target)) {
            closeDropdown();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeDropdown();
        }
    });

    syncMovieBadgesDropdown();
}

function getSelectedMovieBadges() {
    const input = document.getElementById("movie-badges");
    const values = input?.value
        ? input.value.split(",").map((value) => value.trim())
        : [];

    return normalizeMovieBadges(values);
}

function setSelectedMovieBadges(badges = []) {
    const input = document.getElementById("movie-badges");
    const normalizedBadges = normalizeMovieBadges(badges);

    if (input) {
        input.value = normalizedBadges.join(",");
        input.dispatchEvent(new Event("change", { bubbles: true }));
    }

    syncMovieBadgesDropdown(normalizedBadges);
}

function syncMovieBadgesDropdown(badges = getSelectedMovieBadges()) {
    const dropdown = document.querySelector("[data-badges-dropdown]");
    const label = dropdown?.querySelector(".placement-dropdown-label");
    const options = dropdown?.querySelectorAll("[data-badge-value]");
    const normalizedBadges = normalizeMovieBadges(badges);

    if (!dropdown || !label || !options) return;

    label.textContent = normalizedBadges.length > 0
        ? normalizedBadges.map((badge) => MOVIE_BADGE_LABELS.get(badge)).filter(Boolean).join(", ")
        : MOVIE_BADGES_PLACEHOLDER;
    dropdown.classList.toggle("is-empty", normalizedBadges.length === 0);

    options.forEach((option) => {
        const badgeValue = option.dataset.badgeValue || "";
        const isSelected = badgeValue === "none"
            ? normalizedBadges.length === 0
            : normalizedBadges.includes(badgeValue);

        option.classList.toggle("is-selected", isSelected);
        option.setAttribute("aria-selected", String(isSelected));
    });
}

  let isSignUpMode = false;
  let currentUser = null; // Track global state

function handleBeforeTrendingCardClick(event) {
    if (!(event.target instanceof Element)) return;

    const clickedPoster = event.target.closest(".movies img");

    if (!clickedPoster || !scrollContainer?.contains(clickedPoster)) return;

    const card = clickedPoster.closest(".card-item");

    if (!card) return;

    event.preventDefault();
    event.stopPropagation();

    openBeforeTitleModal(card, clickedPoster);
}

function rememberBeforeTrendingCardData(card, movie) {
    if (!card || !movie) return;

    const title = getBeforeMovieDisplayTitle(movie, "Untitled Movie", 80);

    beforeTrendingMovieCardData.set(card, {
        title,
        category: getDisplayText(movie.category, "", 50),
        year: getDisplayText(String(movie.year || ""), "", 8),
        rating: getDisplayText(movie.rating, "", 20),
        description: getDisplayText(movie.description, "Start your membership to watch this title and more on Netflix.", 500)
    });

    card.dataset.title = title;
    card.dataset.category = getDisplayText(movie.category, "", 50);
    card.dataset.year = getDisplayText(String(movie.year || ""), "", 8);
    card.dataset.rating = getDisplayText(movie.rating, "", 20);
    card.dataset.description = getDisplayText(movie.description, "", 500);
}

function getDisplayText(value, fallback = "", maxLength = 160) {
    const text = typeof value === "string" ? value.trim() : "";

    if (!text) return fallback;

    return text.length > maxLength ? `${text.slice(0, maxLength - 3).trim()}...` : text;
}

function getCleanMovieTitle(value, fallback = "Untitled Movie", maxLength = 90) {
    const rawValue = typeof value === "string" ? value.trim() : "";
    if (!rawValue) return fallback;

    const derivedTitle = deriveTitleFromImageFilename(rawValue);
    if (derivedTitle) return getDisplayText(derivedTitle, fallback, maxLength);
    if (hasUnsafeMovieTitleText(rawValue)) return fallback;

    return getDisplayText(rawValue.replace(/\s+/g, " "), fallback, maxLength);
}

function getBeforeMovieDisplayTitle(movie, fallback = "Untitled Movie", maxLength = 90) {
    const rawTitle = typeof movie?.title === "string" ? movie.title.trim() : "";
    const explicitTitle = getExplicitMovieDisplayTitle(movie, maxLength);

    if (rawTitle && sanitizeTitleImageInput(rawTitle) && explicitTitle) {
        return explicitTitle;
    }

    return getCleanMovieTitle(rawTitle || explicitTitle, fallback, maxLength);
}

function getAdminMovieDisplayTitle(movie, fallback = "Untitled Movie") {
    const rawTitle = typeof movie?.title === "string" ? movie.title.trim() : "";

    if (rawTitle && !sanitizeTitleImageInput(rawTitle)) {
        return getCleanMovieTitle(rawTitle, fallback, 90);
    }

    const explicitTitle = getExplicitMovieDisplayTitle(movie);
    if (explicitTitle) return explicitTitle;

    const derivedTitle = deriveTitleFromImageFilename(rawTitle);
    return derivedTitle || fallback;
}

function getExplicitMovieDisplayTitle(movie, maxLength = 90) {
    return [
        movie?.displayTitle,
        movie?.name,
        movie?.altTitle
    ].map((value) => getSafeAdminTitleText(value, maxLength)).find(Boolean) || "";
}

function getSafeAdminTitleText(value, maxLength = 90) {
    if (typeof value !== "string") return "";

    const text = value.trim();
    if (!text || sanitizeTitleImageInput(text) || hasUnsafeMovieTitleText(text)) return "";

    return text.replace(/\s+/g, " ").slice(0, maxLength);
}

function deriveTitleFromImageFilename(value) {
    if (!sanitizeTitleImageInput(value)) return "";

    const cleanValue = String(value || "").trim();
    let pathValue = cleanValue.split(/[?#]/)[0];

    try {
        if (/^[a-z][a-z\d+.-]*:/i.test(cleanValue)) {
            pathValue = new URL(cleanValue).pathname;
        }
    } catch {
        return "";
    }

    const filename = safeDecode(pathValue).split("/").filter(Boolean).pop() || "";
    const baseName = filename
        .replace(TITLE_IMAGE_EXTENSION_PATTERN, "")
        .replace(/(?:[-_\s]+)?(?:movie[-_\s]*title|title[-_\s]*logo|title|logo)(?:[-_\s]+(?:(?:copy|export|final|v)[-_\s]*)?\d+|\s*\(\d+\))?$/i, "")
        .replace(/[-_]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    return toTitleCase(baseName);
}

function toTitleCase(value) {
    const words = String(value || "")
        .toLowerCase()
        .split(" ")
        .filter(Boolean);

    return words.map((word, index) => {
        const isSmallWord = index > 0 && index < words.length - 1 && TITLE_CASE_SMALL_WORDS.has(word);
        if (isSmallWord) return word;
        return word.replace(/\b[a-z0-9]/g, (character) => character.toUpperCase());
    }).join(" ");
}

function getBeforeTitleModalData(card, poster) {
    const cloudData = beforeTrendingMovieCardData.get(card) || {};
    const rank = getDisplayText(card.querySelector(".numbers")?.textContent || card.dataset.rank || "", "", 8);
    const imageTitle = getCleanMovieTitle(
        getDisplayText(poster.getAttribute("alt") || "", "", 90).replace(/\s+poster$/i, "").trim(),
        "",
        90
    );
    const title = getCleanMovieTitle(cloudData.title || imageTitle || card.dataset.title || "", "", 90) || `Trending Now #${rank || "1"}`;
    const year = cloudData.year || getDisplayText(card.dataset.year || "", "", 8);
    const rating = cloudData.rating || getDisplayText(card.dataset.rating || "", "", 20);
    const category = cloudData.category || getDisplayText(card.dataset.category || "", "", 50);
    const metaItems = [year, rating, category].filter(Boolean);
    const description = cloudData.description ||
        getDisplayText(card.dataset.description || "", "", 500) ||
        "Start your membership to watch this title and more on Netflix.";

    if (metaItems.length === 0) {
        metaItems.push("Popular on Netflix");
    }

    return {
        title,
        metaItems,
        description,
        imageSrc: poster.currentSrc || poster.src,
        imageAlt: `${title} artwork`
    };
}

function createBeforeTitleModal(data) {
    const overlay = document.createElement("div");
    overlay.className = "before-title-overlay";
    overlay.setAttribute("aria-hidden", "true");

    const shell = document.createElement("div");
    shell.className = "before-title-modal-shell";
    shell.setAttribute("role", "dialog");
    shell.setAttribute("aria-modal", "true");
    shell.setAttribute("aria-labelledby", "before-title-modal-heading");

    const panel = document.createElement("div");
    panel.className = "before-title-modal-panel";

    const media = document.createElement("div");
    media.className = "before-title-modal-media";

    const image = document.createElement("img");
    image.src = data.imageSrc;
    image.alt = data.imageAlt;
    media.appendChild(image);

    const content = document.createElement("div");
    content.className = "before-title-modal-content";

    const title = document.createElement("h2");
    title.id = "before-title-modal-heading";
    title.textContent = data.title;

    const meta = document.createElement("div");
    meta.className = "before-title-modal-meta";
    data.metaItems.forEach((item) => {
        const metaItem = document.createElement("span");
        metaItem.textContent = item;
        meta.appendChild(metaItem);
    });

    const description = document.createElement("p");
    description.className = "before-title-modal-description";
    description.textContent = data.description;

    const getStarted = document.createElement("button");
    getStarted.className = "before-title-get-started";
    getStarted.type = "button";
    getStarted.setAttribute("aria-label", `Get started to watch ${data.title}`);
    getStarted.textContent = "Get Started";

    content.appendChild(title);
    content.appendChild(meta);
    content.appendChild(description);
    content.appendChild(getStarted);

    panel.appendChild(media);
    panel.appendChild(content);
    shell.appendChild(panel);

    overlay.addEventListener("click", closeBeforeTitleModal);
    shell.addEventListener("click", (event) => {
        if (event.target === shell) {
            closeBeforeTitleModal();
        }
    });
    getStarted.addEventListener("click", () => {
        closeBeforeTitleModal();

        window.setTimeout(() => {
            if (!currentUser && typeof openModal === "function") {
                openModal();
                return;
            }

            document.querySelector(".hero-buttons input")?.focus();
        }, 180);
    });

    return {
        overlay,
        shell,
        panel,
        media,
        image,
        content
    };
}

async function openBeforeTitleModal(card, poster) {
    if (beforeTitleModalState?.isAnimating || beforeTitleModalState?.isOpen) return;

    const sourceRect = poster.getBoundingClientRect();
    const data = getBeforeTitleModalData(card, poster);
    const modal = createBeforeTitleModal(data);

    beforeTitleModalState = {
        isAnimating: true,
        isOpen: false,
        card,
        poster,
        sourceRect,
        modal
    };

    document.body.classList.add("before-title-modal-open");
    poster.classList.add("before-title-source-hidden");
    document.body.appendChild(modal.overlay);
    document.body.appendChild(modal.shell);

    const targetRect = modal.panel.getBoundingClientRect();
    const cardTransform = getBeforeTitlePanelTransform(sourceRect, targetRect);
    const animTiming = { duration: BEFORE_TITLE_CLOSE_MS, easing: 'cubic-bezier(0.45, 0, 0.55, 1)', fill: 'forwards' };
    const panelKeyframes = [
        { opacity: 0, transform: cardTransform, boxShadow: '0 4px 12px rgba(0,0,0,0.28)' },
        { opacity: 1, transform: 'translate3d(0,0,0) scale(1)', boxShadow: '0 24px 86px rgba(0,0,0,0.78)' }
    ];

    modal.panel.animate(panelKeyframes, animTiming);
    modal.overlay.animate([{ opacity: 0 }, { opacity: 1 }], animTiming);
    modal.shell.classList.add("is-revealed");

    beforeTitleModalState.isAnimating = false;
    beforeTitleModalState.isOpen = true;
}

async function closeBeforeTitleModal() {
    const state = beforeTitleModalState;

    if (!state || state.isAnimating) return;

    state.isAnimating = true;

    const { modal, poster, sourceRect } = state;
    const currentRect = modal.panel.getBoundingClientRect();
    const destinationRect = poster.getBoundingClientRect?.() || sourceRect;
    const cardTransform = getBeforeTitlePanelTransform(destinationRect, currentRect);
    const animTiming = { duration: BEFORE_TITLE_CLOSE_MS, easing: 'cubic-bezier(0.45, 0, 0.55, 1)', fill: 'forwards' };

    modal.panel.animate([
        { opacity: 1, transform: 'translate3d(0,0,0) scale(1)', boxShadow: '0 24px 86px rgba(0,0,0,0.78)' },
        { opacity: 0, transform: cardTransform, boxShadow: '0 4px 12px rgba(0,0,0,0.28)' }
    ], animTiming);
    modal.overlay.animate([{ opacity: 1 }, { opacity: 0 }], animTiming);

    await wait(BEFORE_TITLE_CLOSE_MS);

    if (beforeTitleModalState !== state) return;

    poster.classList.remove("before-title-source-hidden");
    modal.shell.remove();
    modal.overlay.remove();
    document.body.classList.remove("before-title-modal-open");
    beforeTitleModalState = null;
}

function getBeforeTitlePanelTransform(sourceRect, targetRect) {
    if (!sourceRect?.width || !targetRect?.width || !targetRect?.height) {
        return "translate3d(0, 12px, 0) scale(0.94)";
    }

    const sourceCenterX = sourceRect.left + sourceRect.width / 2;
    const sourceCenterY = sourceRect.top + sourceRect.height / 2;
    const targetCenterX = targetRect.left + targetRect.width / 2;
    const targetCenterY = targetRect.top + targetRect.height / 2;
    const translateX = sourceCenterX - targetCenterX;
    const translateY = sourceCenterY - targetCenterY;
    const scaleX = clampBeforeTitleValue(sourceRect.width / targetRect.width, 0.24, 0.86);
    const scaleY = clampBeforeTitleValue(sourceRect.height / targetRect.height, 0.24, 0.86);

    return `translate3d(${translateX.toFixed(2)}px, ${translateY.toFixed(2)}px, 0) scale(${scaleX.toFixed(4)}, ${scaleY.toFixed(4)})`;
}

function clampBeforeTitleValue(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function wait(duration) {
    return new Promise((resolve) => window.setTimeout(resolve, duration));
}

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && beforeTitleModalState?.isOpen) {
        closeBeforeTitleModal();
    }
});

  async function logSecurityEvent(eventType, userEmail, status) {
  try {
    await addDoc(collection(db, "adminData", "securityLogs", "events"), {
      eventType: eventType,
      userEmail: userEmail || "unknown",
      status: status,
      timestamp: serverTimestamp(),
      role: currentRole || "guest"
    });

    console.log("[SECURITY LOG] Event stored:", eventType);

  } catch (error) {
    console.error("Security logging failed:", error.message);
  }
}

  function showAuthError(message) {
    if (!authError) return;
    authError.textContent = message;
    authError.classList.remove('hidden');
  }

  function clearAuthError() {
    if (!authError) return;
    authError.textContent = "";
    authError.classList.add('hidden');
  }

  if (!authModal || !navSignInBtn || !closeModalBtn || !authForm) {
      console.error("Auth elements not found. Check HTML IDs.");
      return;
  }

  let authModalFrame = null;
  let authModalOpenTimer = null;
  let authModalCloseTimer = null;
  let authModalTransitionTarget = null;
  let authModalTransitionHandler = null;
  let authRedirectStarted = false;

  function clearAuthModalTransition() {
      if (authModalFrame) {
          window.cancelAnimationFrame(authModalFrame);
          authModalFrame = null;
      }

      window.clearTimeout(authModalOpenTimer);
      authModalOpenTimer = null;

      window.clearTimeout(authModalCloseTimer);
      authModalCloseTimer = null;

      if (authModalTransitionTarget && authModalTransitionHandler) {
          authModalTransitionTarget.removeEventListener('transitionend', authModalTransitionHandler);
      }

      authModalTransitionTarget = null;
      authModalTransitionHandler = null;
  }

  function resetAuthModalForm() {
      authForm.reset();
      clearAuthError();
  }

  function isAuthModalShowing() {
      return !authModal.classList.contains('hidden') && !authModal.classList.contains('is-closing');
  }

  const openModal = () => {
      if (isAuthModalShowing()) return;

      clearAuthModalTransition();
      authModal.classList.remove('is-closing');
      authModal.classList.add('is-entering');
      authModal.classList.remove('hidden');
      authModal.setAttribute('aria-hidden', 'false');

      void authModal.offsetWidth;

      if (prefersReducedMotion()) {
          authModal.classList.remove('is-entering');
          return;
      }

      const finishOpening = () => {
          if (!authModal.classList.contains('is-entering')) return;
          authModal.classList.remove('is-entering');
          if (authModalFrame) {
              window.cancelAnimationFrame(authModalFrame);
          }
          authModalFrame = null;
          window.clearTimeout(authModalOpenTimer);
          authModalOpenTimer = null;
      };

      authModalFrame = window.requestAnimationFrame(finishOpening);
      authModalOpenTimer = window.setTimeout(finishOpening, 50);
  };

  const closeModal = () => {
      if (authModal.classList.contains('hidden')) {
          clearAuthModalTransition();
          authModal.classList.remove('is-entering', 'is-closing');
          authModal.setAttribute('aria-hidden', 'true');
          resetAuthModalForm();
          return;
      }

      if (authModal.classList.contains('is-closing')) return;

      clearAuthModalTransition();
      authModal.classList.remove('is-entering');
      authModal.classList.add('is-closing');
      authModal.setAttribute('aria-hidden', 'true');

      const finishClosing = () => {
          clearAuthModalTransition();
          authModal.classList.add('hidden');
          authModal.classList.remove('is-closing', 'is-entering');
          resetAuthModalForm();
      };

      if (prefersReducedMotion()) {
          authModalCloseTimer = window.setTimeout(finishClosing, AUTH_MODAL_REDUCED_MOTION_CLOSE_MS);
          return;
      }

      authModalTransitionHandler = (event) => {
          if (event.target === authModal && event.propertyName === 'transform') {
              finishClosing();
          }
      };
      authModalTransitionTarget = authModal;
      authModal.addEventListener('transitionend', authModalTransitionHandler);

      authModalCloseTimer = window.setTimeout(finishClosing, AUTH_MODAL_TRANSITION_FALLBACK_MS);
  };

  const redirectToAfterSubscription = () => {
      if (authRedirectStarted) return;
      authRedirectStarted = true;

      window.location.replace(afterSubscriptionPage);
  };

  closeModalBtn.addEventListener('click', closeModal);

  authModal.addEventListener('click', (event) => {
      if (event.target.closest('.auth-box') || event.target.closest('#close-modal')) return;
      closeModal();
  });

  document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !authModal.classList.contains('hidden')) {
          closeModal();
      }
  });

  // Toggle between Sign In and Sign Up (WITH INPUT PURGE)
  if (toggleAuthLink) {
      toggleAuthLink.addEventListener('click', (e) => {
          e.preventDefault();
          isSignUpMode = !isSignUpMode;
          
          // SECURITY CLEAR: Prevent autofill mismatch between modes
          emailInput.value = '';
          passwordInput.value = '';
          clearAuthError();

          authTitle.innerText = isSignUpMode ? "Sign Up" : "Sign In";
          authSubmitBtn.innerText = isSignUpMode ? "Sign Up" : "Sign In";
          authSwitchText.innerText = isSignUpMode ? "Already have an account? " : "New to Netflix? ";
          toggleAuthLink.innerText = isSignUpMode ? "Sign in now." : "Sign up now.";

          // Toggle subtitle visibility
          if (isSignUpMode) {
              authSubtitle.classList.add('hidden');
          } else {
              authSubtitle.classList.remove('hidden');
          }
      });
  }

  // Form Submission Logic
  authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearAuthError();
      const originalBtnText = authSubmitBtn.innerText;
      authSubmitBtn.innerText = "Processing...";
      authSubmitBtn.disabled = true;

      // DATA SANITIZATION
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();

      if (!email || !password) {
    showAuthError("Please enter both email and password.");
    authSubmitBtn.innerText = originalBtnText;
    authSubmitBtn.disabled = false;
    return;
}

if (isSignUpMode && password.length < 6) {
    showAuthError("Password must be at least 6 characters long.");
    authSubmitBtn.innerText = originalBtnText;
    authSubmitBtn.disabled = false;
    return;
}

      // SECURITY AUDIT LOGGING
      console.warn(`[SECURITY AUDIT] Mode: ${isSignUpMode ? "SIGN UP" : "SIGN IN"}`);
      console.warn(`[SECURITY AUDIT] Auth request received.`);

      try {
          if (isSignUpMode) {
              const userCredential = await createUserWithEmailAndPassword(auth, email, password);

await setDoc(doc(db, "users", userCredential.user.uid), {
    email: userCredential.user.email,
    role: "user",
    createdAt: new Date().toISOString()
});

await logSecurityEvent(
  "USER_SIGNUP",
  userCredential.user.email,
  "SUCCESS"
);

console.log("Standard user account provisioned successfully.");
          } else {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    await logSecurityEvent(
      "USER_LOGIN",
      userCredential.user.email,
      "SUCCESS"
    );

    console.log("Authentication successful.");
}
          redirectToAfterSubscription();
          
      } catch (error) {
          console.error("Auth Error:", error.code);
          if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
              showAuthError("Invalid email or password.");
          } else if (error.code === 'auth/email-already-in-use') {
              showAuthError("An account already exists with this email. Please Sign in.");
          } else if (error.code === 'auth/weak-password') {
              showAuthError("Password must be at least 6 characters long.");
          } else {
              showAuthError("Authentication failed. Please try again.");
          }
      } finally {
          authSubmitBtn.innerText = originalBtnText;
          authSubmitBtn.disabled = false;
      }
  });

  async function getUserRole(uid) {
    try {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            return userSnap.data().role || "user";
        }

        return "user";
    } catch (error) {
        console.error("Role lookup failed:", error.code);
        return "user";
    }
}

// Global State Observer (THE SINGLE SOURCE OF TRUTH)

function lockAdminUI() {
    currentRole = "guest";
    document.body.classList.remove("admin-user");

    if (adminDashboard) {
        adminDashboard.classList.add("hidden");
    }
}

async function verifyAdminSession() {
    if (!currentUser) return false;

    const latestRole = await getUserRole(currentUser.uid);
    currentRole = latestRole;

    if (latestRole !== "admin") {
        lockAdminUI();

        await logSecurityEvent(
            "ADMIN_SESSION_REVOKED_OR_DENIED",
            currentUser?.email,
            "BLOCKED"
        );

        return false;
    }

    document.body.classList.add("admin-user");
    return true;
}

onAuthStateChanged(auth, async (user) => {
    currentUser = user;

    if (user) {
        const role = await getUserRole(user.uid);
        currentRole = role;

        console.log("Valid JWT active for:", user.email);
        console.log("RBAC Role:", role);

        navSignInBtn.innerText = "Sign Out";

        if (role === "admin") {
            document.body.classList.add("admin-user");
            console.log("Admin privileges granted.");
        } else {
            document.body.classList.remove("admin-user");

            if (adminDashboard) {
                adminDashboard.classList.add("hidden");
            }

            console.log("Standard user access granted.");
        }

        redirectToAfterSubscription();

    } else {
        currentUser = null;
        lockAdminUI();

        console.log("No active session.");
        navSignInBtn.innerText = "Sign In";
    }
});

if (adminDashboardBtn && adminDashboard && closeAdminDashboard) {
    adminDashboard.setAttribute(
        "aria-hidden",
        adminDashboard.classList.contains("hidden") ? "true" : "false"
    );

    adminDashboardBtn.addEventListener("click", async () => {
        const adminVerified = await verifyAdminSession();

        if (!adminVerified) {
            showToast("Permission Denied", {
                type: "error",
                detail: "Admin privileges are required."
            });
            return;
        }

        openAdminDashboardModal();
        await loadAdminAnalytics();
        await loadAdminMovies();
    });

    closeAdminDashboard.addEventListener("click", () => {
        closeAdminDashboardModal();
    });

    adminDashboard.addEventListener("click", (event) => {
        if (event.target === adminDashboard) {
            closeAdminDashboardModal();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && isAdminDeleteConfirmOpen()) {
            event.preventDefault();
            closeAdminDeleteConfirmModal();
            return;
        }

        if (event.key === "Escape" && isAdminDashboardOpen()) {
            closeAdminDashboardModal();
        }
    });
}

function isAdminDashboardOpen() {
    return Boolean(
        adminDashboard
            && !adminDashboard.classList.contains("hidden")
            && !adminDashboard.classList.contains("is-closing")
    );
}

function openAdminDashboardModal() {
    if (!adminDashboard) return;

    window.clearTimeout(adminDashboardCloseTimer);
    adminDashboardCloseTimer = null;
    adminDashboard.classList.remove("is-closing");
    adminDashboard.classList.remove("hidden");
    adminDashboard.setAttribute("aria-hidden", "false");
}

function closeAdminDashboardModal() {
    const dashboard = adminDashboard;
    if (!dashboard) return;

    if (dashboard.classList.contains("hidden")) {
        dashboard.classList.remove("is-closing");
        dashboard.setAttribute("aria-hidden", "true");
        return;
    }

    if (dashboard.classList.contains("is-closing")) return;

    window.clearTimeout(adminDashboardCloseTimer);
    dashboard.setAttribute("aria-hidden", "true");

    if (prefersReducedMotion()) {
        dashboard.classList.remove("is-closing");
        dashboard.classList.add("hidden");
        adminDashboardCloseTimer = null;
        return;
    }

    const panel = dashboard.querySelector(".admin-panel");
    let backdropDone = false;
    let panelDone = !panel;
    let closeFinished = false;

    const cleanupCloseListeners = () => {
        dashboard.removeEventListener("transitionend", handleTransitionEnd);
        panel?.removeEventListener("transitionend", handleTransitionEnd);
    };

    const finishClose = () => {
        if (closeFinished) return;

        closeFinished = true;
        window.clearTimeout(adminDashboardCloseTimer);
        cleanupCloseListeners();
        dashboard.classList.add("hidden");
        dashboard.classList.remove("is-closing");
        adminDashboardCloseTimer = null;
    };

    const handleTransitionEnd = (event) => {
        if (!dashboard.classList.contains("is-closing")) return;

        if (event.currentTarget === dashboard && event.target === dashboard && event.propertyName === "opacity") {
            backdropDone = true;
        }

        if (event.currentTarget === panel && event.target === panel && event.propertyName === "transform") {
            panelDone = true;
        }

        if (backdropDone && panelDone) {
            finishClose();
        }
    };

    cleanupCloseListeners();
    dashboard.classList.remove("is-closing");
    dashboard.classList.remove("hidden");

    window.requestAnimationFrame(() => {
        if (!dashboard || dashboard.classList.contains("hidden")) return;

        dashboard.addEventListener("transitionend", handleTransitionEnd);
        panel?.addEventListener("transitionend", handleTransitionEnd);
        dashboard.classList.add("is-closing");
        adminDashboardCloseTimer = window.setTimeout(finishClose, ADMIN_DASHBOARD_TRANSITION_MS + 120);
    });
}

function getAdminDeleteConfirmModal() {
    let modal = document.getElementById("admin-delete-confirm-modal");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "admin-delete-confirm-modal";
    modal.className = "admin-delete-modal hidden";
    modal.setAttribute("aria-hidden", "true");

    const dialog = document.createElement("section");
    dialog.className = "admin-delete-dialog";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", "admin-delete-title");
    dialog.setAttribute("aria-describedby", "admin-delete-message admin-delete-movie-title admin-delete-warning");

    const accent = document.createElement("span");
    accent.className = "admin-delete-accent";

    const title = document.createElement("h2");
    title.id = "admin-delete-title";
    title.className = "admin-delete-title";
    title.textContent = "Delete Movie";

    const message = document.createElement("p");
    message.id = "admin-delete-message";
    message.className = "admin-delete-message";
    message.textContent = "Are you sure you want to delete this movie?";

    const movieTitle = document.createElement("p");
    movieTitle.id = "admin-delete-movie-title";
    movieTitle.className = "admin-delete-movie-title";

    const warning = document.createElement("p");
    warning.id = "admin-delete-warning";
    warning.className = "admin-delete-warning";
    warning.textContent = "This action cannot be undone.";

    const actions = document.createElement("div");
    actions.className = "admin-delete-actions";

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.className = "admin-delete-cancel";
    cancelButton.textContent = "No, Keep Movie";

    const confirmButton = document.createElement("button");
    confirmButton.type = "button";
    confirmButton.className = "admin-delete-confirm";
    confirmButton.textContent = "Yes, Delete Movie";

    modal.addEventListener("click", (event) => {
        if (event.target === modal) closeAdminDeleteConfirmModal();
    });

    cancelButton.addEventListener("click", () => {
        closeAdminDeleteConfirmModal();
    });

    confirmButton.addEventListener("click", () => {
        confirmAdminDeleteMovie();
    });

    actions.append(cancelButton, confirmButton);
    dialog.append(accent, title, message, movieTitle, warning, actions);
    modal.appendChild(dialog);
    document.body.appendChild(modal);

    return modal;
}

function isAdminDeleteConfirmOpen() {
    const modal = document.getElementById("admin-delete-confirm-modal");
    return Boolean(
        modal
        && !modal.classList.contains("hidden")
        && !modal.classList.contains("is-closing")
    );
}

function openAdminDeleteConfirmModal(movieId, movieTitle, trigger = null) {
    if (!movieId) return;

    const modal = getAdminDeleteConfirmModal();
    const title = modal.querySelector(".admin-delete-movie-title");
    const cancelButton = modal.querySelector(".admin-delete-cancel");
    const confirmButton = modal.querySelector(".admin-delete-confirm");
    const safeMovieTitle = cleanToastText(String(movieTitle || ""), "Untitled Movie", 90);

    adminDeleteConfirmRequest = { movieId };
    adminDeleteConfirmTrigger = trigger || document.activeElement;

    if (title) title.textContent = safeMovieTitle;
    if (cancelButton) cancelButton.disabled = false;
    if (confirmButton) {
        confirmButton.disabled = false;
        confirmButton.textContent = "Yes, Delete Movie";
    }

    window.clearTimeout(adminDeleteConfirmCloseTimer);
    adminDeleteConfirmCloseTimer = null;
    modal.classList.remove("is-closing");
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");

    window.requestAnimationFrame(() => {
        modal.classList.add("is-visible");
        cancelButton?.focus({ preventScroll: true });
    });
}

function closeAdminDeleteConfirmModal({ restoreFocus = true } = {}) {
    const modal = document.getElementById("admin-delete-confirm-modal");
    if (!modal) return;

    const finishClose = () => {
        window.clearTimeout(adminDeleteConfirmCloseTimer);
        modal.classList.add("hidden");
        modal.classList.remove("is-visible", "is-closing");
        modal.setAttribute("aria-hidden", "true");
        adminDeleteConfirmRequest = null;
        adminDeleteConfirmCloseTimer = null;

        if (restoreFocus && adminDeleteConfirmTrigger?.isConnected) {
            adminDeleteConfirmTrigger.focus({ preventScroll: true });
        }

        adminDeleteConfirmTrigger = null;
    };

    if (modal.classList.contains("hidden") || prefersReducedMotion()) {
        finishClose();
        return;
    }

    modal.classList.remove("is-visible");
    modal.classList.add("is-closing");
    modal.setAttribute("aria-hidden", "true");
    window.clearTimeout(adminDeleteConfirmCloseTimer);
    adminDeleteConfirmCloseTimer = window.setTimeout(
        finishClose,
        DELETE_CONFIRM_MODAL_TRANSITION_MS + 40
    );
}

async function confirmAdminDeleteMovie() {
    const request = adminDeleteConfirmRequest;
    const modal = document.getElementById("admin-delete-confirm-modal");
    const cancelButton = modal?.querySelector(".admin-delete-cancel");
    const confirmButton = modal?.querySelector(".admin-delete-confirm");

    if (!request || confirmButton?.disabled) return;

    if (cancelButton) cancelButton.disabled = true;
    if (confirmButton) {
        confirmButton.disabled = true;
        confirmButton.textContent = "Deleting...";
    }

    closeAdminDeleteConfirmModal({ restoreFocus: false });
    await deleteMovie(request.movieId);
}

function isSafeText(value, maxLength = 120) {
    if (
        typeof value !== "string" ||
        value.trim().length === 0 ||
        value.trim().length > maxLength
    ) {
        return false;
    }

    const xssPattern = /<[^>]*>|javascript:|onerror=|onload=|onclick=|eval\(|document\.cookie|localStorage|sessionStorage/i;

    return !xssPattern.test(value);
}

function cleanMovieTitle(value, fallback = "", maxLength = 90) {
    if (typeof value !== "string") return fallback;

    const title = value.trim();
    if (!title) return fallback;

    const titleImage = sanitizeTitleImageInput(title);
    if (titleImage) return titleImage.value;
    if (hasUnsafeMovieTitleText(title)) return fallback;

    return title.replace(/\s+/g, " ").slice(0, maxLength);
}

function isSafeMovieTitle(value, maxLength = 90) {
    if (typeof value !== "string") return false;

    const title = value.trim();
    if (!title) return false;
    if (sanitizeTitleImageInput(title)) return true;

    return title.length <= maxLength && cleanMovieTitle(title, "", maxLength).length > 0;
}

function sanitizeTitleImageInput(value) {
    if (typeof value !== "string") return null;

    const cleanValue = value.trim();
    if (!cleanValue || cleanValue.length > MOVIE_TITLE_IMAGE_MAX_LENGTH) return null;
    if (hasUnsafeMediaInput(cleanValue)) return null;
    if (/[\u0000-\u001f\u007f<>"'\\]/.test(cleanValue)) return null;
    if (/^[a-zA-Z]:[\\/]/.test(cleanValue)) return null;
    if (/^(?:file|blob):/i.test(cleanValue)) return null;

    if (/^[a-z][a-z\d+.-]*:/i.test(cleanValue)) {
        try {
            const url = new URL(cleanValue);
            if (!["http:", "https:"].includes(url.protocol)) return null;
            if (url.username || url.password) return null;
            if (!isTitleImageUrl(url)) return null;
            return {
                kind: "url",
                value: url.href,
                url
            };
        } catch {
            return null;
        }
    }

    if (cleanValue.startsWith("/") || cleanValue.startsWith("//") || cleanValue.includes("://")) {
        return null;
    }

    const relativePath = normalizeSafeRelativeImagePath(cleanValue);
    if (!relativePath) return null;

    return {
        kind: "relative",
        value: relativePath
    };
}

function hasUnsafeMovieTitleText(value) {
    const decodedValue = safeDecode(value);
    return [value, decodedValue].some((candidate) => (
        /[\u0000-\u001f\u007f]/.test(candidate) ||
        /[<>]/.test(candidate) ||
        /^[a-zA-Z]:[\\/]/.test(candidate) ||
        /(?:^|\s|["'(<])(?:javascript|data|vbscript|file|blob)\s*:/i.test(candidate) ||
        /^[a-z][a-z\d+.-]*:\/\//i.test(candidate) ||
        candidate.includes("://") ||
        /\bon[a-z]+\s*=/i.test(candidate) ||
        /\beval\s*\(|document\.cookie|localStorage|sessionStorage/i.test(candidate)
    ));
}

function isTitleImageUrl(url) {
    const decodedPath = safeDecode(url.pathname).toLowerCase();
    const encodedPath = url.pathname.toLowerCase();
    return TITLE_IMAGE_EXTENSION_PATTERN.test(decodedPath) || TITLE_IMAGE_EXTENSION_PATTERN.test(encodedPath);
}

function isValidYear(value) {
    const year = Number(value);
    const currentYear = new Date().getFullYear() + 2;
    return Number.isInteger(year) && year >= 1900 && year <= currentYear;
}

function isValidRank(value) {
    return getSanitizedRank(value) !== null;
}

function getSanitizedRank(value) {
    const rank = Number(value);
    return Number.isInteger(rank) && rank >= 1 && rank <= 100 ? rank : null;
}

function isSafeUrl(value, required = false) {
    const cleanValue = value.trim();

    if (!cleanValue && !required) return true;
    if (!cleanValue && required) return false;

    try {
        const url = new URL(cleanValue);
        const allowedProtocols = ["https:"];

        return allowedProtocols.includes(url.protocol) &&
            !cleanValue.toLowerCase().startsWith("javascript:") &&
            !cleanValue.toLowerCase().includes("<script");
    } catch {
        return false;
    }
}

function cleanImageUrl(value, fallback = "") {
    const safeInput = sanitizeImageInput(value);
    return safeInput ? safeInput.value : fallback;
}

function isSafeImageUrl(value, required = false) {
    if (!value && !required) return true;
    return cleanImageUrl(value, "") !== "";
}

function sanitizeImageInput(value) {
    if (typeof value !== "string") return null;

    const cleanValue = value.trim();
    if (!cleanValue) return null;
    if (hasUnsafeMediaInput(cleanValue)) return null;
    if (/[\u0000-\u001f\u007f<>"'\\]/.test(cleanValue)) return null;
    if (/^[a-zA-Z]:[\\/]/.test(cleanValue)) return null;
    if (/^(?:file|blob):/i.test(cleanValue)) return null;

    if (/^[a-z][a-z\d+.-]*:/i.test(cleanValue)) {
        try {
            const url = new URL(cleanValue);
            if (url.protocol !== "https:") return null;
            if (url.username || url.password) return null;
            return {
                kind: "url",
                value: url.href,
                url
            };
        } catch {
            return null;
        }
    }

    if (cleanValue.startsWith("/") || cleanValue.startsWith("//") || cleanValue.includes("://")) {
        return null;
    }

    const relativePath = normalizeSafeRelativeImagePath(cleanValue);
    if (!relativePath) return null;

    return {
        kind: "relative",
        value: relativePath
    };
}

function hasUnsafeMediaInput(value) {
    const decodedValue = safeDecode(value);
    return UNSAFE_MEDIA_INPUT_PATTERN.test(value) || UNSAFE_MEDIA_INPUT_PATTERN.test(decodedValue);
}

function normalizeSafeRelativeImagePath(value) {
    const cleanValue = value.replace(/^\.\/+/, "");
    const pathOnly = cleanValue.split(/[?#]/)[0];

    if (!SAFE_RELATIVE_IMAGE_PATH_PATTERN.test(cleanValue)) return "";
    if (!pathOnly || pathOnly.includes("//")) return "";
    if (pathOnly.split("/").some((segment) => segment === "." || segment === ".." || segment === "")) return "";

    return cleanValue;
}

function safeDecode(value) {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

function isValidPlacement(value) {
    return typeof value === "string" && ALLOWED_MOVIE_PLACEMENTS.has(value);
}

function normalizeMoviePlacements(placements, legacyPlacement = "") {
    const placementValues = Array.isArray(placements)
        ? [...placements]
        : typeof placements === "string" && placements
            ? placements.split(",")
            : [];

    if (placementValues.length === 0 && isValidPlacement(legacyPlacement)) {
        placementValues.push(legacyPlacement);
    }

    return placementValues.reduce((normalizedPlacements, placement) => {
        const placementValue = typeof placement === "string" ? placement.trim() : "";

        if (isValidPlacement(placementValue) && !normalizedPlacements.includes(placementValue)) {
            normalizedPlacements.push(placementValue);
        }

        return normalizedPlacements;
    }, []);
}

function isValidPlacements(placements) {
    const normalizedPlacements = normalizeMoviePlacements(placements);
    return Array.isArray(placements) && normalizedPlacements.length > 0 && normalizedPlacements.length === placements.length;
}

function isValidPosterApplyTarget(value) {
    return typeof value === "string" && ALLOWED_POSTER_APPLY_TARGETS.has(value);
}

function normalizePosterApplyTarget(target) {
    const targetValue = typeof target === "string" ? target.trim() : "";
    return isValidPosterApplyTarget(targetValue) ? targetValue : "";
}

function isValidPosterApplyTargetSelection(target) {
    return normalizePosterApplyTarget(target) !== "";
}

function getPosterTargetFieldUpdates(posterUrl, target = "") {
    const updates = {};
    if (!posterUrl) return updates;

    const normalizedTarget = normalizePosterApplyTarget(target);

    if (normalizedTarget === "before" || normalizedTarget === "both") {
        updates.beforePosterUrl = posterUrl;
    }

    if (normalizedTarget === "after" || normalizedTarget === "both") {
        updates.afterPosterUrl = posterUrl;
    }

    return updates;
}

function getPosterApplyTargetLabel(target) {
    return POSTER_APPLY_TARGET_OPTIONS.find((option) => option.value === target)?.label || POSTER_APPLY_TARGETS_PLACEHOLDER;
}

function getPosterEditValues() {
    return {
        before: movieForm?.dataset.posterBeforeUrl || "",
        after: movieForm?.dataset.posterAfterUrl || "",
        legacy: movieForm?.dataset.posterLegacyUrl || ""
    };
}

function getPosterInputValueForTarget(target, values = getPosterEditValues()) {
    const normalizedTarget = normalizePosterApplyTarget(target);
    const shouldUseLegacyFallback = !values.before && !values.after;

    if (normalizedTarget === "before") return values.before || (shouldUseLegacyFallback ? values.legacy : "");
    if (normalizedTarget === "after") return values.after || (shouldUseLegacyFallback ? values.legacy : "");
    if (normalizedTarget === "both") {
        if (values.before && values.before === values.after) return values.before;
        return shouldUseLegacyFallback ? values.legacy : "";
    }

    return "";
}

function shouldSyncPosterInputForTargetChange() {
    return Boolean(isEditMode && editingMovieId);
}

function updatePosterInputForSelectedTarget() {
    const posterInput = document.getElementById("movie-poster");
    if (!posterInput) return;
    const posterInputValue = getPosterInputValueForTarget(getSelectedPosterApplyTarget());
    posterInput.value = posterInputValue;
    setLoadedPosterInputValue(posterInputValue);
}

function setLoadedPosterInputValue(value) {
    if (!movieForm) return;
    movieForm.dataset.posterLoadedUrl = value || "";
}

function getLoadedPosterInputValue() {
    return movieForm?.dataset.posterLoadedUrl || "";
}

function setPosterEditValues(movie) {
    if (!movieForm) return;
    movieForm.dataset.posterBeforeUrl = cleanImageUrl(movie?.beforePosterUrl || "", "");
    movieForm.dataset.posterAfterUrl = cleanImageUrl(movie?.afterPosterUrl || "", "");
    movieForm.dataset.posterLegacyUrl = cleanImageUrl(movie?.posterUrl || "", "");
    setLoadedPosterInputValue("");
}

function clearPosterEditValues() {
    if (!movieForm) return;
    delete movieForm.dataset.posterBeforeUrl;
    delete movieForm.dataset.posterAfterUrl;
    delete movieForm.dataset.posterLegacyUrl;
    delete movieForm.dataset.posterLoadedUrl;
}

function isValidRankApplyTarget(value) {
    return typeof value === "string" && ALLOWED_RANK_APPLY_TARGETS.has(value);
}

function normalizeRankApplyTarget(target) {
    const targetValue = typeof target === "string" ? target.trim() : "";
    return isValidRankApplyTarget(targetValue) ? targetValue : "";
}

function isValidRankApplyTargetSelection(target) {
    return normalizeRankApplyTarget(target) !== "";
}

function getRankTargetFieldUpdates(rank, target = "") {
    const updates = {};
    const sanitizedRank = getSanitizedRank(rank);
    if (sanitizedRank === null) return updates;

    const normalizedTarget = normalizeRankApplyTarget(target);

    if (normalizedTarget === "before" || normalizedTarget === "both") {
        updates.beforeRank = sanitizedRank;
    }

    if (normalizedTarget === "after" || normalizedTarget === "both") {
        updates.afterRank = sanitizedRank;
    }

    return updates;
}

function getRankApplyTargetLabel(target) {
    return RANK_APPLY_TARGET_OPTIONS.find((option) => option.value === target)?.label || RANK_APPLY_TARGETS_PLACEHOLDER;
}

function formatRankInputValue(value) {
    const rank = getSanitizedRank(value);
    return rank === null ? "" : String(rank);
}

function getRankEditValues() {
    return {
        before: movieForm?.dataset.rankBeforeValue || "",
        after: movieForm?.dataset.rankAfterValue || "",
        legacy: movieForm?.dataset.rankLegacyValue || ""
    };
}

function getRankInputValueForTarget(target, values = getRankEditValues()) {
    const normalizedTarget = normalizeRankApplyTarget(target);
    const beforeRank = getSanitizedRank(values.before);
    const afterRank = getSanitizedRank(values.after);
    const legacyRank = getSanitizedRank(values.legacy);
    const shouldUseLegacyFallback = beforeRank === null && afterRank === null;

    if (normalizedTarget === "before") {
        return formatRankInputValue(beforeRank ?? (shouldUseLegacyFallback ? legacyRank : null));
    }

    if (normalizedTarget === "after") {
        return formatRankInputValue(afterRank ?? (shouldUseLegacyFallback ? legacyRank : null));
    }

    if (normalizedTarget === "both") {
        if (beforeRank !== null && beforeRank === afterRank) return formatRankInputValue(beforeRank);
        return formatRankInputValue(shouldUseLegacyFallback ? legacyRank : null);
    }

    return "";
}

function shouldSyncRankInputForTargetChange() {
    return Boolean(isEditMode && editingMovieId);
}

function updateRankInputForSelectedTarget() {
    const rankInput = document.getElementById("movie-rank");
    if (!rankInput) return;
    rankInput.value = getRankInputValueForTarget(getSelectedRankApplyTarget());
}

function setRankEditValues(movie) {
    if (!movieForm) return;
    movieForm.dataset.rankBeforeValue = formatRankInputValue(movie?.beforeRank);
    movieForm.dataset.rankAfterValue = formatRankInputValue(movie?.afterRank);
    movieForm.dataset.rankLegacyValue = formatRankInputValue(movie?.rank);
}

function clearRankEditValues() {
    if (!movieForm) return;
    delete movieForm.dataset.rankBeforeValue;
    delete movieForm.dataset.rankAfterValue;
    delete movieForm.dataset.rankLegacyValue;
}

function getRankApplyTargetForMovieEdit(movie, preferredTarget = "before") {
    const beforeRank = getSanitizedRank(movie?.beforeRank);
    const afterRank = getSanitizedRank(movie?.afterRank);
    const legacyRank = getSanitizedRank(movie?.rank);
    const normalizedPreferredTarget = normalizeRankApplyTarget(preferredTarget) || "before";

    if (beforeRank !== null && afterRank !== null && beforeRank === afterRank) return "both";
    if (beforeRank !== null && afterRank === null) return "before";
    if (afterRank !== null && beforeRank === null) return "after";
    if (beforeRank !== null && afterRank !== null) return normalizedPreferredTarget;
    if (legacyRank !== null) return "both";

    return normalizedPreferredTarget;
}

function getBeforeMovieSortRank(movie) {
    return getSanitizedRank(movie?.beforeRank) ?? getSanitizedRank(movie?.rank) ?? 999;
}

function getBeforePagePosterUrl(movie, fallback = "") {
    return cleanImageUrl(movie?.beforePosterUrl, "") ||
        cleanImageUrl(movie?.afterPosterUrl, "") ||
        cleanImageUrl(movie?.posterUrl, fallback);
}

function normalizeMovieBadges(badges) {
    if (!Array.isArray(badges)) return [];

    return badges.reduce((normalizedBadges, badge) => {
        const badgeValue = typeof badge === "string" ? badge.trim().toLowerCase() : "";

        if (ALLOWED_MOVIE_BADGES.has(badgeValue) && !normalizedBadges.includes(badgeValue)) {
            normalizedBadges.push(badgeValue);
        }

        return normalizedBadges;
    }, []);
}

function isValidMovieBadges(badges) {
    return Array.isArray(badges) && badges.length === normalizeMovieBadges(badges).length;
}

function validateMovieInput(movieData) {
    if (!isSafeMovieTitle(movieData.title, 80)) {
        return "Movie title must be normal text or a safe title image URL/path.";
    }

    if (!isSafeText(movieData.category, 50)) {
        return "Category is required and must not contain unsafe characters.";
    }

    if (!isValidPlacements(movieData.placements)) {
        return "Movie Rows / Placement requires at least one valid row.";
    }

    if (!isValidMovieBadges(movieData.badges)) {
        return "Movie badges must use the available badge options.";
    }

    if (!isValidYear(movieData.year)) {
        return "Release year must be between 1900 and the current year.";
    }

    if (!isSafeText(movieData.rating, 20)) {
        return "Rating / age restriction is required and must be valid.";
    }

    if (!isValidRank(movieData.rank)) {
        return "Display rank must be a number between 1 and 100.";
    }

    if (!isValidRankApplyTargetSelection(movieData.rankApplyTarget)) {
        return "Display Rank For requires a valid page selection.";
    }

    if (!isValidPosterApplyTargetSelection(movieData.posterApplyTarget)) {
        return "Poster Image For requires a valid page selection.";
    }

    if (!isSafeImageUrl(movieData.posterUrl, movieData.isEditing !== true)) {
        return "Poster image must be a valid HTTPS image URL or safe relative project image path.";
    }

    if (!isSafeImageUrl(movieData.bannerUrl, false)) {
        return "Banner image must be a valid HTTPS image URL, safe relative project image path, or left empty.";
    }

    if (!isSafeUrl(movieData.trailerUrl, false)) {
        return "Trailer URL must be a valid HTTPS link or left empty.";
    }

    if (!isSafeText(movieData.description, 500)) {
        return "Description is required and must be under 500 characters without unsafe characters.";
    }

    return null;
}


async function loadFeaturedBanner() {
    const mainSection = document.querySelector(".main");
    const heroSection = document.querySelector(".hero");

    if (!mainSection || !heroSection) return;

    const heroTitle = heroSection.querySelector("span:nth-child(1)");
    const heroMeta = heroSection.querySelector("span:nth-child(2)");
    const heroDescription = heroSection.querySelector("span:nth-child(3)");

    mainSection.classList.add("featured-banner-transition");

    setTimeout(() => {
        mainSection.style.backgroundImage = "";

        if (heroTitle) {
            const titleBreak = document.createElement("br");
            heroTitle.replaceChildren(
                document.createTextNode("Unlimited movies,"),
                titleBreak,
                document.createTextNode(" shows, and more")
            );
        }

        if (heroMeta) {
            heroMeta.textContent = "Starts at ₹149. Cancel at any time.";
        }

        if (heroDescription) {
            heroDescription.textContent = "Ready to watch? Enter your email to create or restart your membership.";
        }

        mainSection.classList.remove("featured-banner-transition");
    }, 220);
}

async function loadHomepageMovies() {
    if (!scrollContainer) return;

    try {
        const staticCards = Array.from(scrollContainer.querySelectorAll(".card-item:not(.cloud-movie-card)")).map((card, index) => {
            return {
                type: "static",
                rank: Number(card.dataset.rank) || index + 1,
                element: card.cloneNode(true)
            };
        });

        const querySnapshot = await getDocs(collection(db, "movies"));
        const cloudMovies = [];

        querySnapshot.forEach((docItem) => {
            const movie = docItem.data();

            if (!normalizeMoviePlacements(movie.placements, movie.placement).includes(BEFORE_TRENDING_NOW_PLACEMENT)) return;

            cloudMovies.push({
                type: "cloud",
                id: docItem.id,
                rank: getBeforeMovieSortRank(movie),
                movie
            });
        });

        const allMovies = [...staticCards, ...cloudMovies];
        allMovies.sort((a, b) => a.rank - b.rank);

        scrollContainer.replaceChildren();

        allMovies.forEach((item, index) => {
            if (item.type === "static") {
                const numberBox = item.element.querySelector(".numbers");
                if (numberBox) {
                    numberBox.textContent = index + 1;
                    numberBox.dataset.number = index + 1;
                }

                scrollContainer.appendChild(item.element);
            }

            if (item.type === "cloud") {
                const movieCard = document.createElement("div");
                movieCard.className = "card-item cloud-movie-card";
                movieCard.dataset.rank = item.rank;
                const displayTitle = getBeforeMovieDisplayTitle(item.movie);
                rememberBeforeTrendingCardData(movieCard, item.movie);

               const numberBox = document.createElement("div");
numberBox.className = "numbers";
numberBox.dataset.number = index + 1;
numberBox.textContent = index + 1;

const moviesBox = document.createElement("div");
moviesBox.className = "movies";

const movieLink = document.createElement("a");
movieLink.href = item.movie.trailerUrl || "#";
movieLink.target = "_blank";
movieLink.rel = "noopener noreferrer";

const movieImg = document.createElement("img");
movieImg.src = getBeforePagePosterUrl(item.movie, "");
movieImg.alt = `${displayTitle} poster`;

movieLink.appendChild(movieImg);
moviesBox.appendChild(movieLink);

movieCard.appendChild(numberBox);
movieCard.appendChild(moviesBox);

scrollContainer.appendChild(movieCard);

            }
        });

        updateButtonStates();
        console.log("Hybrid ranked movies loaded successfully.");

    } catch (error) {
        console.error("Hybrid movie loading failed:", error.message);
    }
}

async function loadAdminAnalytics() {
    if (currentRole !== "admin") return;

    const totalMoviesCount = document.getElementById("total-movies-count");
    const currentRoleStatus = document.getElementById("current-role-status");
    const securityLogCount = document.getElementById("security-log-count");

    try {
        const movieSnapshot = await getDocs(collection(db, "movies"));
        const logSnapshot = await getDocs(collection(db, "adminData", "securityLogs", "events"));

        if (totalMoviesCount) {
            totalMoviesCount.textContent = `${movieSnapshot.size} movies`;
        }

        if (currentRoleStatus) {
            currentRoleStatus.textContent = currentRole === "admin" ? "Admin Verified" : "Standard User";
        }

        if (securityLogCount) {
            securityLogCount.textContent = `${logSnapshot.size} audit events`;
        }

    } catch (error) {
        console.warn("Admin analytics refresh failed:", error.message);

        if (totalMoviesCount) totalMoviesCount.textContent = "Unavailable";
        if (securityLogCount) securityLogCount.textContent = "Unavailable";
    }
}

async function deleteMovie(movieId) {
    if (currentRole !== "admin") {
        showToast("Permission Denied", {
            type: "error",
            detail: "Admin privileges are required."
        });
        return;
    }

    try {
        await deleteDoc(doc(db, "movies", movieId));

        showToast("Movie Deleted Successfully", { type: "success" });

        await Promise.all([
            runSecondaryFollowUp("Admin analytics refresh", () => loadAdminAnalytics()),
            runSecondaryFollowUp("Admin movie list refresh", () => loadAdminMovies()),
            runSecondaryFollowUp("Homepage movie refresh", () => loadHomepageMovies()),
            runSecondaryFollowUp("Featured banner refresh", () => loadFeaturedBanner())
        ]);
    } catch (error) {
        console.error("Delete failed:", error);
        showFirestoreFailure("Failed to delete movie.", error);
    }
}

async function loadAdminMovies() {
    if (!movieList || currentRole !== "admin") return;

    movieList.innerHTML = "<p>Loading movie records...</p>";

    try {
        const querySnapshot = await getDocs(collection(db, "movies"));
        movieList.innerHTML = "";

        if (querySnapshot.empty) {
           movieList.innerHTML = `<p class="movie-empty-state">No movies added yet.</p>`;
            return;
        }

        const searchTerm = adminMovieSearch ? adminMovieSearch.value.trim().toLowerCase() : "";

const filteredMovies = [];

querySnapshot.forEach((docItem) => {
    const movie = docItem.data();
    const displayTitle = getAdminMovieDisplayTitle(movie);

    const searchableText = [
        displayTitle,
        movie.category,
        movie.year,
        movie.rating
    ].join(" ").toLowerCase();

    if (!searchTerm || searchableText.includes(searchTerm)) {
        filteredMovies.push({ docItem, movie });
    }
});

if (filteredMovies.length === 0) {
    movieList.innerHTML = `<p class="movie-empty-state">No matching movies found.</p>`;
    return;
}

filteredMovies.forEach(({ docItem, movie }) => {
            const displayTitle = getAdminMovieDisplayTitle(movie);

            const movieCard = document.createElement("div");
            movieCard.className = "movie-admin-item";

const posterImg = document.createElement("img");
posterImg.className = "admin-movie-poster";
posterImg.src = getBeforePagePosterUrl(movie, "");
posterImg.alt = `${displayTitle} poster`;

const infoBox = document.createElement("div");
infoBox.className = "admin-movie-info";

const titleEl = document.createElement("h3");
titleEl.textContent = displayTitle;

const metaBox = document.createElement("div");
metaBox.className = "admin-movie-meta";

[movie.category || "Uncategorized", movie.year || "Year N/A", movie.rating || "Rating N/A"].forEach((value) => {
    const span = document.createElement("span");
    span.textContent = value;
    metaBox.appendChild(span);
});

const actionsBox = document.createElement("div");
actionsBox.className = "admin-movie-actions";

const editBtn = document.createElement("button");
editBtn.className = "edit-movie-btn";
editBtn.dataset.id = docItem.id;
editBtn.textContent = "Edit Movie";

const deleteBtn = document.createElement("button");
deleteBtn.className = "delete-movie-btn";
deleteBtn.dataset.id = docItem.id;
deleteBtn.textContent = "Delete Movie";
const featureBtn = document.createElement("button");
featureBtn.className = "feature-movie-btn";
featureBtn.dataset.id = docItem.id;
featureBtn.textContent = movie.featured ? "Featured Banner Active" : "Set as Featured";

const removeFeatureBtn = document.createElement("button");
removeFeatureBtn.className = "remove-feature-btn";
removeFeatureBtn.textContent = "Remove Banner";

if (!movie.featured) {
    removeFeatureBtn.style.display = "none";
}

actionsBox.appendChild(editBtn);
actionsBox.appendChild(deleteBtn);
actionsBox.appendChild(featureBtn);
actionsBox.appendChild(removeFeatureBtn);


infoBox.appendChild(titleEl);
infoBox.appendChild(metaBox);
infoBox.appendChild(actionsBox);

movieCard.appendChild(posterImg);
movieCard.appendChild(infoBox);

movieList.appendChild(movieCard);


editBtn.addEventListener("click", () => {
    editingMovieId = docItem.id;
    isEditMode = true;
    editingOriginalBannerUrl = cleanImageUrl(movie.bannerUrl || "", "");
    editingOriginalTrailerUrl = (movie.trailerUrl || "").trim();

    runAdminEditFormStateSwap(() => {
        document.getElementById('movie-title').value = movie.title || "";
        document.getElementById('movie-category').value = movie.category || "";
        setSelectedMoviePlacements(normalizeMoviePlacements(movie.placements, movie.placement));
        setSelectedMovieBadges(movie.badges);
        setPosterEditValues(movie);
        setSelectedPosterApplyTarget("before", { syncInput: true });
        setRankEditValues(movie);
        setSelectedRankApplyTarget(getRankApplyTargetForMovieEdit(movie, "before"), { syncInput: true });
        document.getElementById('movie-year').value = movie.year || "";
        document.getElementById('movie-rating').value = movie.rating || "";
        document.getElementById('movie-banner').value = movie.bannerUrl || "";
        document.getElementById('movie-trailer').value = movie.trailerUrl || "";
        document.getElementById('movie-description').value = movie.description || "";
        document.getElementById('movie-title')?.blur();
        movieForm.querySelector('button[type="submit"]').innerText = "Update Movie";
    });

    scrollAdminEditSectionIntoView(() => {
        movieForm.classList.add("edit-mode-active");
        revealCancelEditButton();
    });
});

deleteBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    openAdminDeleteConfirmModal(docItem.id, displayTitle, deleteBtn);
});

featureBtn.addEventListener("click", async () => {
    if (currentRole !== "admin") {
        showToast("Permission Denied", {
            type: "error",
            detail: "Admin privileges are required."
        });
        return;
    }

    try {
        const allMoviesSnapshot = await getDocs(collection(db, "movies"));
        const resetPromises = [];

        allMoviesSnapshot.forEach((movieDoc) => {
            resetPromises.push(
                updateDoc(doc(db, "movies", movieDoc.id), {
                    featured: false
                })
            );
        });

        await Promise.all(resetPromises);

        await updateDoc(doc(db, "movies", docItem.id), {
            featured: true,
            featuredAt: serverTimestamp(),
            featuredBy: currentUser?.email || "unknown"
        });

        showToast("Banner Updated Successfully", { type: "success" });

        await Promise.all([
            runSecondaryFollowUp("Featured banner audit log", () => logSecurityEvent(
                "FEATURED_BANNER_UPDATED",
                currentUser?.email,
                "SUCCESS"
            )),
            runSecondaryFollowUp("Admin movie list refresh", () => loadAdminMovies()),
            runSecondaryFollowUp("Homepage movie refresh", () => loadHomepageMovies())
        ]);

if (adminDashboard) {
    adminDashboard.classList.add("hidden");
}

setTimeout(async () => {
    await runSecondaryFollowUp("Featured banner refresh", () => loadFeaturedBanner());
}, 180);

    } catch (error) {
        console.error("Featured movie update failed:", error);

        void runSecondaryFollowUp("Featured banner failure audit log", () => logSecurityEvent(
            "FEATURED_BANNER_UPDATE_FAILED",
            currentUser?.email,
            "FAILED"
        ));

        showFirestoreFailure("Failed to update featured banner.", error);
    }
});
removeFeatureBtn.addEventListener("click", async () => {
    if (currentRole !== "admin") {
        showToast("Permission Denied", {
            type: "error",
            detail: "Admin privileges are required."
        });
        return;
    }

    try {

        await updateDoc(doc(db, "movies", docItem.id), {
            featured: false
        });

        showToast("Banner Updated Successfully", {
    type: "success",
    detail: "Featured banner removed."
});

        await Promise.all([
            runSecondaryFollowUp("Featured banner removal audit log", () => logSecurityEvent(
                "FEATURED_BANNER_REMOVED",
                currentUser?.email,
                "SUCCESS"
            )),
            runSecondaryFollowUp("Admin movie list refresh", () => loadAdminMovies()),
            runSecondaryFollowUp("Homepage movie refresh", () => loadHomepageMovies())
        ]);

if (adminDashboard) {
    adminDashboard.classList.add("hidden");
}

setTimeout(async () => {
    await runSecondaryFollowUp("Featured banner refresh", () => loadFeaturedBanner());
}, 180);

    } catch (error) {

        console.error("Failed to remove featured banner:", error);

        showFirestoreFailure("Could not remove featured banner.", error);
    }
});
});


} catch (error) {
    movieList.innerHTML = `<p class="movie-load-error">Failed to load movies.</p>`;
    console.warn("Admin movie list refresh failed:", error.message);
}
}

if (adminMovieSearch) {
    adminMovieSearch.addEventListener("input", () => {
        loadAdminMovies();
    });
}

if (clearMovieSearch) {
    clearMovieSearch.addEventListener("click", () => {
        adminMovieSearch.value = "";
        loadAdminMovies();
    });
}

if (movieForm) {
    movieForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (currentRole !== "admin") {
            showToast("Permission Denied", {
                type: "error",
                detail: "Admin privileges are required."
            });
            return;
        }

        const wasEditingMovie = Boolean(isEditMode && editingMovieId);
        const currentEditingMovieId = editingMovieId;

        const movieData = {
            title: document.getElementById('movie-title').value.trim(),
            category: document.getElementById('movie-category').value.trim(),
            placements: getSelectedMoviePlacements(),
            placement: getSelectedMoviePlacements()[0] || "",
            badges: getSelectedMovieBadges(),
            year: document.getElementById('movie-year').value.trim(),
            rating: document.getElementById('movie-rating').value.trim(),
            rank: getSanitizedRank(document.getElementById('movie-rank').value),
            rankApplyTarget: getSelectedRankApplyTarget(),
            posterUrl: document.getElementById('movie-poster').value.trim(),
            posterApplyTarget: getSelectedPosterApplyTarget(),
            bannerUrl: document.getElementById('movie-banner').value.trim(),
            trailerUrl: document.getElementById('movie-trailer').value.trim(),
            description: document.getElementById('movie-description').value.trim(),
            isEditing: wasEditingMovie,
            createdAt: serverTimestamp(),
            createdBy: currentUser?.email || "unknown"
        };

        const validationError = validateMovieInput(movieData);

if (validationError) {
    void runSecondaryFollowUp("Validation audit log", () => logSecurityEvent(
        "MOVIE_INPUT_REJECTED",
        currentUser?.email,
        "BLOCKED"
    ));

    showToast("Validation Errors", {
        type: "warning",
        detail: validationError
    });
    return;
}

movieData.title = cleanMovieTitle(movieData.title, "", 80);
movieData.rank = getSanitizedRank(movieData.rank);
movieData.posterUrl = cleanImageUrl(movieData.posterUrl, "");
movieData.bannerUrl = cleanImageUrl(movieData.bannerUrl, "");
const loadedPosterUrl = cleanImageUrl(getLoadedPosterInputValue(), "");
const posterUrlForTargetUpdate = wasEditingMovie && movieData.posterUrl === loadedPosterUrl
    ? ""
    : movieData.posterUrl;
const posterTargetUpdates = getPosterTargetFieldUpdates(posterUrlForTargetUpdate, movieData.posterApplyTarget);
const rankTargetUpdates = getRankTargetFieldUpdates(movieData.rank, movieData.rankApplyTarget);
const movieWriteData = {
    ...movieData,
    ...posterTargetUpdates,
    ...rankTargetUpdates
};
delete movieWriteData.rank;
delete movieWriteData.rankApplyTarget;
delete movieWriteData.posterUrl;
delete movieWriteData.posterApplyTarget;
delete movieWriteData.isEditing;

const bannerChanged = wasEditingMovie && movieData.bannerUrl !== editingOriginalBannerUrl;
const trailerChanged = wasEditingMovie && movieData.trailerUrl !== editingOriginalTrailerUrl;
const successLogType = wasEditingMovie ? "MOVIE_UPDATED" : "MOVIE_CREATED";
const failureLogType = wasEditingMovie ? "MOVIE_UPDATE_FAILED" : "MOVIE_CREATE_FAILED";

       try {
    if (wasEditingMovie) {
        await updateDoc(doc(db, "movies", currentEditingMovieId), {
            ...movieWriteData,
            updatedAt: serverTimestamp(),
            updatedBy: currentUser?.email || "unknown"
        });

        showToast("Movie Updated Successfully", { type: "success" });
        if (bannerChanged) showToast("Banner Updated Successfully", { type: "success" });
        if (trailerChanged) showToast("Trailer Updated Successfully", { type: "success" });
    } else {
        await addDoc(collection(db, "movies"), movieWriteData);

        showToast("Movie Added Successfully", { type: "success" });
    }

} catch (error) {
    console.error("Movie save failed:", error);

    void runSecondaryFollowUp("Movie save failure audit log", () => logSecurityEvent(
        failureLogType,
        currentUser?.email,
        "FAILED"
    ));

    showFirestoreFailure("Failed to save movie.", error);
    return;
}

editingMovieId = null;
isEditMode = false;
editingOriginalBannerUrl = "";
editingOriginalTrailerUrl = "";
clearAdminEditTransition();
clearAdminEditFillTransition();
movieForm.querySelector('button[type="submit"]').innerText = "Add Movie";
cancelEditMovieBtn.classList.remove("is-revealing-edit-control");
cancelEditMovieBtn.classList.remove("show-edit-control");
movieForm.classList.remove("edit-mode-active");
movieForm.reset();
setSelectedMoviePlacements([]);
setSelectedMovieBadges([]);
setSelectedRankApplyTarget("");
clearRankEditValues();
setSelectedPosterApplyTarget("");
clearPosterEditValues();

await Promise.all([
    runSecondaryFollowUp("Movie save audit log", () => logSecurityEvent(
        successLogType,
        currentUser?.email,
        "SUCCESS"
    )),
    runSecondaryFollowUp("Admin movie list refresh", () => loadAdminMovies()),
    runSecondaryFollowUp("Admin analytics refresh", () => loadAdminAnalytics()),
    runSecondaryFollowUp("Homepage movie refresh", () => loadHomepageMovies()),
    runSecondaryFollowUp("Featured banner refresh", () => loadFeaturedBanner())
]);
    });
}

if (cancelEditMovieBtn) {
    cancelEditMovieBtn.addEventListener("click", () => {
        if (!prefersReducedMotion()) {
            clearAdminEditTransition();
            editingMovieId = null;
            isEditMode = false;
            editingOriginalBannerUrl = "";
            editingOriginalTrailerUrl = "";
            cancelEditMovieBtn.classList.remove("is-revealing-edit-control");
            cancelEditMovieBtn.classList.remove("show-edit-control");
            movieForm.classList.remove("edit-mode-active");

            runAdminEditFormStateSwap(() => {
                movieForm.reset();
                setSelectedMoviePlacements([]);
                setSelectedMovieBadges([]);
                setSelectedRankApplyTarget("");
                clearRankEditValues();
                setSelectedPosterApplyTarget("");
                clearPosterEditValues();
                movieForm.querySelector('button[type="submit"]').innerText = "Add Movie";
            });
            return;
        }

        editingMovieId = null;
        isEditMode = false;
        editingOriginalBannerUrl = "";
        editingOriginalTrailerUrl = "";

        clearAdminEditTransition();
        clearAdminEditFillTransition();
        movieForm.reset();
        setSelectedMoviePlacements([]);
        setSelectedMovieBadges([]);
        setSelectedRankApplyTarget("");
        clearRankEditValues();
        setSelectedPosterApplyTarget("");
        clearPosterEditValues();
        movieForm.querySelector('button[type="submit"]').innerText = "Add Movie";
        cancelEditMovieBtn.classList.remove("is-revealing-edit-control");
        cancelEditMovieBtn.classList.remove("show-edit-control");
        movieForm.classList.remove("edit-mode-active");
       



    });
}
if (movieList) {
    movieList.addEventListener('click', async (e) => {
        if (!e.target.classList.contains('delete-movie-btn')) return;

        if (currentRole !== "admin") {
            showToast("Permission Denied", {
                type: "error",
                detail: "Admin privileges are required."
            });
            return;
        }

        const movieId = e.target.dataset.id;
        const movieTitle = e.target.closest(".movie-admin-item")?.querySelector(".admin-movie-info h3")?.textContent || "Untitled Movie";
        openAdminDeleteConfirmModal(movieId, movieTitle, e.target);
    });
}

  // Header Button Routing
  navSignInBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    if (currentUser) {
        const logoutEmail = currentUser.email;

        await logSecurityEvent(
            "USER_LOGOUT",
            logoutEmail,
            "SUCCESS"
        );

        await signOut(auth);

        showToast("Securely Signed Out", { type: "info" });
        console.log("User token purged.");
    } else {
        openModal();
    }
});
});
