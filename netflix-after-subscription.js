import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  serverTimestamp
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

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const LANDING_PAGE = "netflix-before-subscription.html";
const AUTH_SPLASH_MIN_DURATION_MS = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 250 : 2600;
const authSplashStartedAt = performance.now();
const MAX_DESCRIPTION_LENGTH = 500;
const HERO_TRANSITION_MS = 900;
const HERO_MEDIA_CROSSFADE_MS = 1000;
const HERO_POSTER_HOLD_MS = 5500;
const INITIAL_POSTER_HOLD_MS = 3500;
const INITIAL_HERO_REVEAL_COMPLETE_MS = HERO_TRANSITION_MS;
const HERO_UNDERLAY_ROW_CLASS = "is-hero-underlay-row";
const HERO_ROW_MEDIA_UNDERLAY_BLEED_PX = 18;
const HERO_COPY_WRAP_LIFT_CAP_PX = 56;
const ADMIN_DASHBOARD_TRANSITION_MS = 720;
const DELETE_CONFIRM_MODAL_TRANSITION_MS = 280;
const ADMIN_FORM_STATE_LEAVE_MS = 180;
const ADMIN_FORM_STATE_ENTER_MS = 280;
const TOAST_AUTO_DISMISS_MS = 3000;
const TOAST_EXIT_MS = 360;
const TOAST_MAX_VISIBLE = 4;
const VIEW_TRANSITION_FALLBACK_MS = 820;
const MY_LIST_CARD_REMOVE_MS = 260;
const MY_LIST_GRID_REFRESH_LEAVE_MS = 180;
const MY_LIST_GRID_REFRESH_ENTER_MS = 360;
const MY_LIST_CHECK_ICON_PATH = "M9.55 16.85 4.4 11.7l1.42-1.42 3.73 3.73 8.63-8.63 1.42 1.42z";
const HERO_TRAILER_STATE_CLASSES = Object.freeze([
  "is-trailer-loading",
  "is-video-playing",
  "is-trailer-resting"
]);
const HERO_TRAILER_SOURCE_CLASSES = Object.freeze([
  "is-native-trailer",
  "is-embed-trailer",
  "is-youtube-trailer",
  "is-youtube-shorts",
  "is-vimeo-trailer",
  "is-trailer-priming",
  "is-youtube-guarded",
  "is-trailer-fallback"
]);
const DEFAULT_HERO_ROW_VISIBILITY_PROFILE = Object.freeze({
  posterLift: "var(--hero-row-overlap-lift)",
  trailerLift: "clamp(48px, 3.6vw, 64px)",
  copyWrapLiftScale: "1"
});
const HERO_ROW_VISIBILITY_PROFILES = Object.freeze({
  "man of steel": {
    posterLift: "calc(var(--hero-row-overlap-lift) + clamp(0px, calc(760px - 100vh), 24px))",
    trailerLift: "clamp(30px, 2.2vw, 42px)",
    copyWrapLiftScale: "1"
  },
  "the vampire diaries": {
    posterLift: "calc(var(--hero-row-overlap-lift) + clamp(0px, calc(760px - 100vh), 24px))",
    trailerLift: "clamp(30px, 2.2vw, 42px)",
    copyWrapLiftScale: "1"
  },
  "the girl next door": {
    posterLift: "var(--hero-row-overlap-lift)",
    trailerLift: "clamp(50px, 3.7vw, 66px)",
    copyWrapLiftScale: "1"
  },
  titanic: {
    posterLift: "clamp(18px, 1.1vw, 24px)",
    trailerLift: "clamp(34px, 2.1vw, 42px)",
    copyWrapLiftScale: "0"
  }
});
const FIRST_ROW_SINGLE_PAGE_SIZE = 6;
const TRAILER_VIDEO_EXTENSION_PATTERN = /\.(mp4|webm|ogg)$/i;
const TITLE_IMAGE_EXTENSION_PATTERN = /\.(?:png|jpe?g|webp|gif|avif)$/i;
const MOVIE_TITLE_IMAGE_MAX_LENGTH = 2048;
const TITLE_CASE_SMALL_WORDS = new Set(["a", "an", "and", "as", "at", "but", "by", "for", "from", "in", "nor", "of", "on", "or", "the", "to", "vs", "with"]);
const SAFE_RELATIVE_VIDEO_PATH_PATTERN = /^(?:\.\/)?[a-z0-9][a-z0-9._~-]*(?:\/[a-z0-9][a-z0-9._~-]*)*\.(?:mp4|webm|ogg)(?:[?#][a-z0-9._~%!$&()*+,;=:@/?-]*)?$/i;
const SAFE_RELATIVE_IMAGE_PATH_PATTERN = /^(?:\.\/)?[a-z0-9][a-z0-9._~-]*(?:\/[a-z0-9][a-z0-9._~-]*)*\.(?:jpe?g|png|webp|gif|avif)(?:[?#][a-z0-9._~%!$&()*+,;=:@/?-]*)?$/i;
const UNSAFE_MEDIA_INPUT_PATTERN = /<\s*script|<[^>]*>|javascript:|data:|vbscript:|on(?:error|load|click|mouseover|mouseenter|mouseleave|focus|blur|submit|animationstart|transitionend)\s*=/i;
const TRAILER_UNAVAILABLE_MESSAGE = "Trailer preview is unavailable for this source.";
const SOCIAL_UNAVAILABLE_MESSAGE = "Trailer preview is unavailable because this platform blocks embedded playback.";
const FALLBACK_ARTWORK = "https://occ-0-5005-3647.1.nflxso.net/dnm/api/v6/0Qzqdxw-HG1AiOKLWWPsFOUDA2E/AAAABYyuDS3jMdUSFgPqmuhdBsnuRqn22QUvsOO-kl2cPVItJ_JdqvRhcXENABlZAXoWr5j8k3UcSCJtgNAN6SQNnKgiTSdoiW3dQls.jpg?r=1af";
const MY_LIST_REMOVAL_STORAGE_PREFIX = "netflix-my-list-page-removed";
const HERO_LOGO_BADGE = "hero-logo";
const HERO_LOGO_SRC = "badges/netflix-original.png.webp";

const referenceMovies = [
  ["Berlin and the Lady with an Ermine", "Crime Drama", "2026", "A", "1h 56m", "https://occ-0-5005-3647.1.nflxso.net/dnm/api/v6/0Qzqdxw-HG1AiOKLWWPsFOUDA2E/AAAABRuucyWxd7CqePGO_ayWqA1j2UyWaqOqbmAQwY20Dr3aYXxfEZeZgREYlalvTH9Dux9z4ZHMbCxgiuKJrpLx5y2NE6JF6e_1TRXJvLjbpjSXCC9dA_9k4UfiTQsYri3R3A7llULbAsx4ZhZ2JT0RfwSuN9KfoY6Pd68zYBbzCX7o.jpg?r=d95", ["top", "new", "usDrama", "top10", "only"], 0, "A master thief turns an ambitious duke into the mark for a daring art heist."],
  ["The WONDERfools", "Action Comedy", "2026", "U/A 16+", "48m", "https://occ-0-5005-3647.1.nflxso.net/dnm/api/v6/0Qzqdxw-HG1AiOKLWWPsFOUDA2E/AAAABaWv1qk2kxHXnFDf1uFTn2ypdHz5UOeIjqR_wFP8j5oK3njup51DpGbptUNnUSl_sjfGm9tYUn5FibepV-4dSoeDARUPF1qgcf7ArIoU2BfOozDeojD6K4tHDTrLOFR1wlBUZ5kST3I7yp9kAYzRTEv2UE-3MkADEYIJyJFpgf9Y.jpg?r=e38", ["top", "new", "crowd", "top10", "memory"], 0, "A chaotic group stumbles into superpowers as panic rises around them."],
  ["KARTAVYA", "Action Thriller", "2026", "U/A 16+", "2h 12m", "https://occ-0-5005-3647.1.nflxso.net/dnm/api/v6/0Qzqdxw-HG1AiOKLWWPsFOUDA2E/AAAABbh9zCmHJAcMbJvkVPxYYZD7ijKGD0aPAfnyz1OqXO2fHwj0N3zq5MjmviqZJ5B27cgBLhHHg1AWBSvOb38zRyRY7xdfot--PKX9wufXay5ZN5h3rSj8T6m82HFC70vFkOw64na3ob6yMAoBYoM3Bb28HRKrQ2HEJNcemTs2WlEU.jpg?r=f1b", ["new", "crowd", "top10"], 0, "A police officer must choose how far duty can carry him when threats close in."],
  ["Blue Beetle", "Superhero Action", "2023", "U/A 13+", "2h 7m", "https://occ-0-5005-3647.1.nflxso.net/dnm/api/v6/0Qzqdxw-HG1AiOKLWWPsFOUDA2E/AAAABUySEvnoOFRBAeV9_Ucp0QRpEUXHOaCdVl2JZvUgZV0QTcRCaGsl6n12PUV014LvUtr15ans87oVbC_0mBeS-Noer4oWVT8TUbDKZ3L8VumdJGTAl3n7nsyrCIO5_hMpllCERubbNezr33pZ2cWD4_xs2dFitu5u0ODPnDA3CcZnlm_Ot8vrwtVYF0lS2VrelwDvni3cyWmbA2ma2PERF8wkSMmlZQjDEGfsltA.webp?r=290", ["top", "crowd", "memory"], 0, "A young graduate bonds with alien technology and becomes a reluctant hero."],
  ["Aquaman and the Lost Kingdom", "Fantasy Action", "2023", "U/A 13+", "2h 4m", "https://occ-0-5005-3647.1.nflxso.net/dnm/api/v6/0Qzqdxw-HG1AiOKLWWPsFOUDA2E/AAAABYycKGAxyYNgmrB-mzhADaaE8HdLyZI99Rm1fl3g3Tz88IQLNTrPB1-rbc_GGEMoqUo6CPrKjvzD3Pu4CTmjHy3hSiFQRLsq0AYUv2vMsHRJP__2t5LcAvGRFqeDYw7niD0OD_NggVV3eoey4egpwCiZpMV9gafaBraBJlbgky_CKEZlfcm2CiXer_iybPp_lK3b3G3_MkxT-bR1lGV8HZXPFW02x9Zwsv5mGD0.webp?r=a11", ["top10", "crowd", "memory"], 0, "An ancient weapon forces Aquaman into an uneasy alliance to save the world."],
  ["Hierarchy", "K-Drama", "2024", "U/A 16+", "1 Season", "https://occ-0-5005-3647.1.nflxso.net/dnm/api/v6/0Qzqdxw-HG1AiOKLWWPsFOUDA2E/AAAABZxZK7BI4ey48jf9el3kfUJED6khQICFJXCxmIz5g6lrIwwPIdfNiSPfRoxBFebgPdYRjMDXsvAgo34hYwt9udo0PRINVT8kgIA.jpg?r=371", ["usDrama", "kdrama", "only"], 0, "A transfer student shakes the order at a school ruled by the elite."],
  ["Trap", "Mystery Thriller", "2024", "U/A 13+", "1h 45m", "https://occ-0-5005-3647.1.nflxso.net/dnm/api/v6/0Qzqdxw-HG1AiOKLWWPsFOUDA2E/AAAABXLzemVjQT9L-bwGnaq5uxdQQHbNhC2W_8_q3zEuIDDZ7s3kjUY-br-WAl3ETrouEPMCopQccYbCh8u0hTkuKMR3fZ7eJIpWFUvM9-N-ldXjQYaZjlHPcHAkZbC7AD2VNz0MShLSwYgNFaAOzlpPj0KPBV9KGv8jAIFFTylCsDTTg1dCgJAxQpSNxHCNNKUoNnmVLfME2WO45942VRVIuIPM9R51RP9pgoiYaX4.webp?r=7e3", ["new", "crowd", "memory"], 0, "A father and daughter enter a concert that hides a dangerous operation."],
  ["Red Rose", "US TV Drama", "2023", "A", "1 Season", "https://occ-0-5005-3647.1.nflxso.net/dnm/api/v6/0Qzqdxw-HG1AiOKLWWPsFOUDA2E/AAAABf6mvo9KnGo2XtVBIw6L3qSWX_eQp5k6gU79U7GbG5r0c8d6Wnlfeqzv3eVm7LLoZHnnmLACNOFxrOPfW8H2M-TZzhVAcivNn9M.jpg?r=54c", ["usDrama", "continue", "memory"], 62, "A group of teens downloads an app that makes impossible demands."],
  ["Bloodhounds", "Korean Action", "2026", "A", "1 Season", "https://occ-0-5005-3647.1.nflxso.net/dnm/api/v6/0Qzqdxw-HG1AiOKLWWPsFOUDA2E/AAAABc_KH8-ncFz0StrVMwo9e2qMcauBypTPjKxi3_ex3qktTCva-BNqy8Cs-VrBdrB0vcS9jk5NlNAoiE4KKJ-UTYsABiuAFssfAH0.jpg?r=44c", ["top", "continue", "top10"], 45, "Two young boxers risk everything to protect the people they love."],
  ["The Babysitter", "Horror Comedy", "2017", "A", "1h 25m", "https://occ-0-5005-3647.1.nflxso.net/dnm/api/v6/0Qzqdxw-HG1AiOKLWWPsFOUDA2E/AAAABZkdEtrCVJDOESPGSwRam3tNvAeZBNxrtqb1jqjvknMwR2PVHEiGB5Oae9bWFI3SnEeNg203sJKb6fWU4aT97K-BYm4dNM6FtGU.jpg?r=044", ["continue", "crowd", "memory"], 38, "A late-night discovery turns a quiet babysitting job into a cult nightmare."],
  ["Sonic the Hedgehog 3", "Family Adventure", "2024", "U/A 7+", "1h 49m", "https://occ-0-5005-3647.1.nflxso.net/dnm/api/v6/0Qzqdxw-HG1AiOKLWWPsFOUDA2E/AAAABQWTXHoi6TOXys2LvDycLn9BvPCMm-7Y6c_rP7nGOeUTzpbKUuBL9WWsmxBnU3RRk5jFmGsiljDgYzKiQrpF6CFYRBQYruPqQuM62Ua_TrqmHiGPdm5lALCqBfP9tcy_7wBPmrINHN7ZaFSBCpzkA2tf5gg_nvYW2fLSltYcPJbs.webp?r=39e", ["continue", "crowd", "memory"], 76, "Sonic, Tails and Knuckles race into chaos against a powerful rival."],
  ["Swapped", "Family Fantasy", "2026", "U/A 7+", "1h 42m", "https://occ-0-5005-3647.1.nflxso.net/dnm/api/v6/0Qzqdxw-HG1AiOKLWWPsFOUDA2E/AAAABT-4-9gFR2AaP8B4yC8p32henF89L2JwnfPNSPugtVvM1bTYG0RaJlvZ4Q7mN8ClLCyUPa3x5SENFGkhVRgt_o6yJtKd2uTeOaOpzUc7R78fovqBg_kUBQkQ188kStPsNSFB5FBUi0P51C_YK0WFPTUmAuYYLl5xF1UFdCbSJKINvd5kMkvVIPIyNM-0ieUNn5a_5NGuBAN13ZBKyhFYymcfPI92gZckDC4z_bg.jpg?r=339", ["continue", "crowd", "top10"], 24, "A tiny creature and a bird swap bodies and stumble into adventure."],
  ["STAND BY ME Doraemon", "Family Animation", "2014", "U/A 7+", "1h 34m", "https://occ-0-5005-3647.1.nflxso.net/dnm/api/v6/0Qzqdxw-HG1AiOKLWWPsFOUDA2E/AAAABdRsdBt05joFcTDr6EJmD0a6ysXAH5T9cTGvdOHnwra6EzJC4KIQ2QGpYRSF_HVGofNqnMFFJyA8uM0JKczxzr92OgbhIrkfFBo.webp?r=549", ["crowd", "memory"], 0, "Nobita tries to change his present so Doraemon can return to the future."],
  ["Chennai Express", "Indian Comedy", "2013", "U/A 13+", "2h 21m", "https://occ-0-5005-3647.1.nflxso.net/dnm/api/v6/0Qzqdxw-HG1AiOKLWWPsFOUDA2E/AAAABa2Iyt51YLf8uWehUvxqQOfFFLZZuPWoBaON1azra-MY1lWjjV4JEf8vc3RpFIrEHz1b3bnOp8iaih4ZNnhdhbl5LpiOGZ1Wel8.webp?r=49d", ["crowd", "memory"], 0, "A routine journey becomes a runaway romance full of trouble and charm."],
  ["Dhurandhar", "Spy Thriller", "2025", "A", "2h 35m", "https://occ-0-5005-3647.1.nflxso.net/dnm/api/v6/0Qzqdxw-HG1AiOKLWWPsFOUDA2E/AAAABdPuGbl6EFuKztVHJ_nYqI0WJ9dCM0mySx4v8ALlUDpboXTPDhP4LmHfWTllef_MTQN9h-GNiGXI26GfhmbasXNSKLowXdY27W2oDJ4ukCth0Wfqi0yzDGBW6LxcixNyPRUjJoH3yqt05bu7ks9Nw3PVOeptWkB1FaY.webp?r=439", ["top", "new", "crowd"], 0, "An operative enters a violent network and works to bring it down from within."],
  ["PK", "Comedy Drama", "2014", "U/A 13+", "2h 26m", "https://occ-0-5005-3647.1.nflxso.net/dnm/api/v6/0Qzqdxw-HG1AiOKLWWPsFOUDA2E/AAAABbLa9ly25FTW5b9GJicx1BpWzO_i55pPXOhr4e-VfysLZok77EXt-X_s06OIELLwJgzFs2TDVS2URpFbP_TOdPtHHMb10A8rzag.webp?r=8ab", ["crowd", "memory"], 0, "A stranger asks innocent questions that challenge long-held beliefs."],
  ["Weak Hero", "K-Drama", "2025", "A", "2 Seasons", "https://occ-0-5005-3647.1.nflxso.net/dnm/api/v6/0Qzqdxw-HG1AiOKLWWPsFOUDA2E/AAAABaK3rbWS3ODl8KWzuWlxHCjQH_rkFBodDX6Gc9FTQTA5aC_9zfsxpnrb30qTnAfPdzKflEygvni-GxjP2xYAVJ1QkWtiUqZTFiw.jpg?r=adc", ["top10", "kdrama", "only"], 0, "A quiet student confronts bullies and discovers how dangerous his world can be."],
  ["Business Proposal", "K-Drama", "2022", "U/A 13+", "1 Season", "https://occ-0-5005-3647.1.nflxso.net/dnm/api/v6/0Qzqdxw-HG1AiOKLWWPsFOUDA2E/AAAABWM7Ffq0qvx8bJJINATOaO384CuaawLCbkzeSrRVaOwYx1Vd3ua3RXwLLwlaU4jiyI4-FS7xv91w-i6eKU4K9LkBGs3pkeiI88U.jpg?r=690", ["kdrama", "only", "myList"], 0, "A blind date goes sideways when an employee meets her CEO in disguise."],
  ["Vincenzo", "K-Drama", "2021", "U/A 16+", "1 Season", "https://occ-0-5005-3647.1.nflxso.net/dnm/api/v6/0Qzqdxw-HG1AiOKLWWPsFOUDA2E/AAAABd1NNI3KquQMRL_ewFytXpVGlMf0vOOWmo5wMu2iugNG-dmf7PnQhYnQe8VUNt6FCl-sTC8_ToInhy7k7z3eseJaw85WL-w8gr4.jpg?r=c8b", ["kdrama", "only", "crowd", "myList"], 0, "A mafia lawyer serves justice with style against a powerful company."],
  ["When Life Gives You Tangerines", "K-Drama", "2025", "U/A 13+", "1 Season", "https://occ-0-5005-3647.1.nflxso.net/dnm/api/v6/0Qzqdxw-HG1AiOKLWWPsFOUDA2E/AAAABdTe6UL2pSJlFFd4ex8D97MIMzoDSxuBTXyl6Z2AsqXBZOG5oWgrSm3UKabwqm1Z0hTCJNnsj5OPL5YcxpeEQ3EhCX0_afFIRaQ.jpg?r=499", ["kdrama", "crowd", "myList"], 0, "An island romance grows into a lifetime of setbacks, warmth and triumphs."],
  ["Cashero", "K-Drama", "2025", "U/A 16+", "1 Season", "https://occ-0-5005-3647.1.nflxso.net/dnm/api/v6/0Qzqdxw-HG1AiOKLWWPsFOUDA2E/AAAABYUp0mieaqy-kM_J3qxZ7lbk9qpCkux4Ab5p_R3w9wDhxOuaIkiJlZcIGOtY1XdiyCfmr9vXXZJuW1N6QnEE4KGCrGwHcMnap8M.jpg?r=e29", ["top", "new", "kdrama"], 0, "A man inherits super strength with one costly catch."],
  ["King the Land", "K-Drama", "2023", "U/A 13+", "1 Season", "https://occ-0-5005-3647.1.nflxso.net/dnm/api/v6/0Qzqdxw-HG1AiOKLWWPsFOUDA2E/AAAABYZvf469zAy3g03n_qH1-P9x1mPmLwfq2vKK-frmG-Vp5TY8SOvPplvtcNE77J14YHevI3knvLBrXZ-D53478e7AKf6YcPlgLBg.jpg?r=d64", ["kdrama", "only", "myList"], 0, "A charming heir clashes with the hardworking employee he cannot ignore."],
  ["Bon Appetit, Your Majesty", "K-Drama", "2025", "U/A 13+", "1 Season", "https://occ-0-5005-3647.1.nflxso.net/dnm/api/v6/0Qzqdxw-HG1AiOKLWWPsFOUDA2E/AAAABXJ7dmkTcJT5kL1ys5yml1mhs33WJYI3QFLe85FpR6GZE9eaLAeBcTt09DRyLH5FdA4d1xIJEys8ovATqGRXbKLSJpXX2uoELpU.jpg?r=f98", ["new", "kdrama", "only"], 0, "A modern chef lands in the royal court and wins over a tyrant king."],
  ["My Demon", "K-Drama", "2023", "U/A 16+", "1 Season", FALLBACK_ARTWORK, ["top", "kdrama", "only", "myList"], 0, "A powerless demon and an icy heiress become entangled by fate and danger."]
];

const fallbackMovies = referenceMovies.map((item, index) => {
  const [title, category, year, rating, duration, artworkUrl, rows, progress, description] = item;

  return {
    id: `fallback-${index + 1}`,
    title,
    category,
    year,
    rating,
    duration,
    rank: index + 1,
    tag: "",
    badges: [],
    progress,
    posterUrl: artworkUrl,
    bannerUrl: artworkUrl,
    trailerUrl: "",
    description,
    rows
  };
});

const fallbackHero = fallbackMovies[0] || {
  id: "fallback-hero",
  title: "Netflix",
  category: "Movie",
  year: "2026",
  rating: "U/A 16+",
  duration: "",
  rank: 1,
  tag: "",
  badges: [],
  progress: 0,
  posterUrl: FALLBACK_ARTWORK,
  bannerUrl: FALLBACK_ARTWORK,
  trailerUrl: "",
  description: "Watch something cinematic tonight.",
  rows: ["top", "new", "only"]
};

const rowDefinitions = [
  { key: "top", title: "Today's Top Picks for You", limit: 10, singlePage: true, pageSize: FIRST_ROW_SINGLE_PAGE_SIZE },
  { key: "new", title: "New on Netflix", limit: 10 },
  { key: "usDrama", title: "US TV Dramas", limit: 10 },
  { key: "continue", title: "Continue Watching", limit: 10 },
  { key: "crowd", title: "Crowd Pleasers", limit: 10 },
  { key: "top10", title: "Top 10 Shows in India Today", limit: 10, ranked: true },
  { key: "memory", title: "Erase My Memory So I Can Watch Again", limit: 10 },
  { key: "kdrama", title: "K-Dramas for Beginners", limit: 10 },
  { key: "only", title: "Only on Netflix", limit: 10 },
  { key: "myList", title: "My List", limit: 10 }
];

const BEFORE_TRENDING_NOW_PLACEMENT = "before-trending-now";
const AFTER_PLACEMENT_BY_ROW_KEY = Object.freeze({
  top: "after-todays-pick",
  new: "after-new-on-netflix",
  usDrama: "after-us-tv-dramas",
  continue: "after-continue-watching",
  crowd: "after-crowd-pleasers",
  top10: "after-top-10",
  memory: "after-memory",
  kdrama: "after-kdrama",
  only: "after-only-on-netflix",
  myList: "after-my-list"
});
const AFTER_ROW_KEY_BY_PLACEMENT = Object.freeze(
  Object.fromEntries(Object.entries(AFTER_PLACEMENT_BY_ROW_KEY).map(([key, placement]) => [placement, key]))
);
const ALLOWED_MOVIE_PLACEMENTS = new Set([
  BEFORE_TRENDING_NOW_PLACEMENT,
  ...Object.values(AFTER_PLACEMENT_BY_ROW_KEY)
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

const state = {
  currentUser: null,
  currentRole: "guest",
  cloudMovies: [],
  catalog: [...fallbackMovies],
  activeHero: fallbackHero,
  activeModalMovie: null,
  activeTrailerMovie: null,
  myList: [],
  myListPageRemovedKeys: new Set(),
  isSigningOut: false,
  toastQueue: [],
  activeToasts: new Map(),
  toastSequence: 0,
  heroReplayTimer: null,
  heroStartTimer: null,
  heroRevealTimer: null,
  heroYouTubeCommandTimer: null,
  heroControlSweepTimer: null,
  heroEmbedResetTimer: null,
  heroEmbedResetFallbackTimer: null,
  heroStopCleanupTimer: null,
  activeHeroEmbedSrc: "",
  activeHeroEmbedProvider: "",
  heroGuardCycle: 0,
  heroNeedsEmbedReset: false,
  hasCompletedInitialHeroPosterHold: false,
  hasRevealedInitialHeroPoster: false,
  hasFinishedInitialHeroReveal: false,
  hasDeferredInitialHeroBoundarySettle: false,
  hasPreparedInitialHeroMediaBoundary: false,
  isInitialHeroPosterLoaded: false,
  initialHeroPosterReadyPromise: null,
  initialHeroPosterRevealToken: 0,
  initialHeroRevealFinishTimer: null,
  pendingInitialHeroTrailerMovie: null,
  heroImageLoadToken: 0,
  heroPosterAspectRatio: 0,
  initialHeroMediaTransition: "",
  initialHeroMediaTransitionPriority: "",
  lastHeroControlSuppressAt: 0,
  heroEmbedLoadHandler: null,
  heroEndHandler: null,
  heroCanPlayHandler: null,
  heroErrorHandler: null,
  heroBoundaryRaf: null,
  heroTitleTransitionTimer: null,
  heroTitleTransitionRaf: null,
  activeHoverCard: null,
  cardHoverHideTimer: null,
  trailerModalVideoErrorHandler: null,
  trailerModalFrameLoadHandler: null,
  trailerModalFrameFallbackTimer: null,
  trailerModalSession: 0,
  adminEditScrollFrame: null,
  adminEditRevealFrame: null,
  adminEditRevealTimer: null,
  adminEditFillFrame: null,
  adminEditFillTimer: null,
  adminEditClearTimer: null,
  adminDashboardCloseTimer: null,
  adminDeleteConfirmCloseTimer: null,
  adminDeleteConfirmRequest: null,
  adminDeleteConfirmTrigger: null,
  activeView: "browse",
  viewTransition: null,
  viewTransitionFrame: null,
  viewTransitionTimer: null,
  navigationSyncFrame: null,
  myListGridRefreshTimer: null,
  myListGridRefreshFrame: null
};

const elements = {};

document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  bindNavigation();
  bindTitleModal();
  bindAdminDashboard();
  bindTitleCardHoverState();

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      state.currentUser = null;
      state.currentRole = "guest";
      state.myListPageRemovedKeys = new Set();
      lockAdminUI();

      if (!state.isSigningOut) {
        window.location.replace(LANDING_PAGE);
      }
      return;
    }

    state.currentUser = user;
    loadMyListPageRemovedKeys();
    state.currentRole = await getUserRole(user.uid);
    updateProfileUI(user, state.currentRole);
    updateAdminUI();
    await refreshCatalog();
    await hideAuthGate();
  });
});

function cacheElements() {
  elements.authGate = document.getElementById("auth-gate");
  elements.memberNav = document.getElementById("member-nav");
  elements.heroBillboard = document.getElementById("hero-billboard");
  elements.heroPoster = document.getElementById("hero-poster");
  elements.heroTrailer = document.getElementById("hero-trailer");
  elements.heroEmbedShell = document.getElementById("hero-embed-shell");
  elements.heroEmbedTrailer = document.getElementById("hero-embed-trailer");
  elements.heroMediaShield = document.getElementById("hero-media-shield");
  elements.heroKicker = document.getElementById("hero-kicker");
  elements.heroTitle = document.getElementById("hero-title");
  elements.heroMeta = document.getElementById("hero-meta");
  elements.heroDescription = document.getElementById("hero-description");
  elements.heroRatingTag = document.getElementById("hero-rating-tag");
  elements.heroPlayBtn = document.getElementById("hero-play-btn");
  elements.heroInfoBtn = document.getElementById("hero-info-btn");
  elements.viewStage = document.getElementById("home");
  elements.browseView = document.getElementById("browse-view");
  elements.rowsRoot = document.getElementById("rows-root");
  elements.myListPage = document.getElementById("my-list-page");
  elements.myListGrid = document.getElementById("my-list-grid");
  elements.navLinks = Array.from(document.querySelectorAll(".nav-link"));
  elements.searchForm = document.getElementById("search-form");
  elements.searchToggle = document.getElementById("search-toggle");
  elements.titleSearch = document.getElementById("title-search");
  elements.notificationButton = document.getElementById("notification-button");
  elements.notificationMenu = document.getElementById("notification-menu");
  elements.profileButton = document.getElementById("profile-button");
  elements.profileMenu = document.getElementById("profile-menu");
  elements.profileEmail = document.getElementById("profile-email");
  elements.profileRole = document.getElementById("profile-role");
  elements.profileAvatar = document.getElementById("profile-avatar");
  elements.profileAvatarSmall = document.getElementById("profile-avatar-small");
  elements.signOutBtn = document.getElementById("sign-out-btn");
  elements.profileAdminLink = document.getElementById("profile-admin-link");
  elements.adminDashboardBtn = document.getElementById("admin-dashboard-btn");
  elements.titleModal = document.getElementById("title-modal");
  elements.closeTitleModal = document.getElementById("close-title-modal");
  elements.modalImage = document.getElementById("modal-image");
  elements.modalTitle = document.getElementById("modal-title");
  elements.modalMeta = document.getElementById("modal-meta");
  elements.modalDescription = document.getElementById("modal-description");
  elements.modalPlayBtn = document.getElementById("modal-play-btn");
  elements.modalListBtn = document.getElementById("modal-list-btn");
  elements.trailerModal = document.getElementById("trailer-modal");
  elements.trailerModalPanel = document.getElementById("trailer-modal-panel");
  elements.closeTrailerModal = document.getElementById("close-trailer-modal");
  elements.trailerModalTitle = document.getElementById("trailer-modal-title");
  elements.trailerModalVideo = document.getElementById("trailer-modal-video");
  elements.trailerModalFrame = document.getElementById("trailer-modal-frame");
  elements.trailerModalFallback = document.getElementById("trailer-modal-fallback");
  elements.trailerModalFallbackText = document.getElementById("trailer-modal-fallback-text");
  elements.adminDashboard = document.getElementById("admin-dashboard");
  elements.closeAdminDashboard = document.getElementById("close-admin-dashboard");
  elements.totalMoviesCount = document.getElementById("total-movies-count");
  elements.currentRoleStatus = document.getElementById("current-role-status");
  elements.securityLogCount = document.getElementById("security-log-count");
  elements.movieForm = document.getElementById("movie-form");
  elements.saveMovieBtn = document.getElementById("save-movie-btn") || elements.movieForm?.querySelector('button[type="submit"]');
  elements.cancelEditMovieBtn = document.getElementById("cancel-edit-movie");
  elements.adminMovieSearch = document.getElementById("admin-movie-search");
  elements.clearMovieSearch = document.getElementById("clear-movie-search");
  elements.movieList = document.getElementById("movie-list");
  elements.toast = document.getElementById("toast");
}

function bindNavigation() {
  window.addEventListener("scroll", updateNavAppearance, { passive: true });
  window.addEventListener("scroll", positionActiveTitleCardHover, { passive: true });
  window.addEventListener("resize", () => {
    updateNavAppearance();
    hideTitleCardHover();
    settleHeroMediaBoundary();
  }, { passive: true });
  window.addEventListener("hashchange", scheduleNavigationSyncFromLocation);
  window.addEventListener("popstate", scheduleNavigationSyncFromLocation);
  window.addEventListener("load", settleHeroMediaBoundary, { once: true });
  document.fonts?.ready?.then(settleHeroMediaBoundary).catch(() => {});
  updateNavAppearance();

  elements.navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const requestedView = link.dataset.view;
      setActiveNav(link);

      if (requestedView === "my-list") {
        showMyListPage({ historyMode: "push" });
      } else {
        showHomeView(requestedView || "home", {
          hash: link.hash || "#home",
          historyMode: "push"
        });
      }
    });
  });

  syncNavigationFromLocation({ animate: false });

  elements.searchToggle?.addEventListener("click", () => {
    const isOpen = elements.searchForm.classList.toggle("is-open");
    if (isOpen) {
      elements.titleSearch.focus();
    } else {
      elements.titleSearch.value = "";
      filterRenderedCards("");
    }
  });

  elements.titleSearch?.addEventListener("input", () => {
    filterRenderedCards(elements.titleSearch.value);
  });

  elements.notificationButton?.addEventListener("click", (event) => {
    event.stopPropagation();
    const shouldOpen = elements.notificationMenu.hidden;
    closeMenus();
    elements.notificationMenu.hidden = !shouldOpen;
    elements.notificationButton.setAttribute("aria-expanded", String(shouldOpen));
  });

  elements.profileButton?.addEventListener("click", (event) => {
    event.stopPropagation();
    const shouldOpen = elements.profileMenu.hidden;
    closeMenus();
    elements.profileMenu.hidden = !shouldOpen;
    elements.profileButton.setAttribute("aria-expanded", String(shouldOpen));
  });

  document.addEventListener("click", (event) => {
    const clickedInsideProfile = elements.profileMenu?.contains(event.target) || elements.profileButton?.contains(event.target);
    const clickedInsideNotifications = elements.notificationMenu?.contains(event.target) || elements.notificationButton?.contains(event.target);

    if (!clickedInsideProfile && !clickedInsideNotifications) {
      closeMenus();
    }
  });

  elements.signOutBtn?.addEventListener("click", handleSignOut);
  elements.profileAdminLink?.addEventListener("click", openAdminDashboard);
  elements.adminDashboardBtn?.addEventListener("click", openAdminDashboard);
  elements.heroPlayBtn?.addEventListener("click", () => playMovie(state.activeHero));
  elements.heroInfoBtn?.addEventListener("click", () => openTitleModal(state.activeHero));
  bindHeroMediaShield();
  bindHeroControlSuppression();
}

function bindHeroMediaShield() {
  if (!elements.heroMediaShield) return;

  const quietMediaInteraction = (event) => {
    event.stopPropagation();
    elements.heroEmbedTrailer?.blur();
    elements.heroTrailer?.blur();
  };

  const blockMediaActivation = (event) => {
    event.preventDefault();
    quietMediaInteraction(event);
  };

  [
    "click",
    "dblclick",
    "contextmenu",
    "dragstart"
  ].forEach((eventName) => {
    elements.heroMediaShield.addEventListener(eventName, blockMediaActivation, { passive: false });
  });

  [
    "mousedown",
    "mouseup",
    "pointerdown",
    "pointerup",
    "touchstart",
    "touchend"
  ].forEach((eventName) => {
    elements.heroMediaShield.addEventListener(eventName, quietMediaInteraction, { passive: true });
  });
}

function bindHeroControlSuppression() {
  const suppress = () => enforceHeroControlsHidden();
  const resume = () => resumeHeroTrailerCleanly();
  const lifecycleOptions = { passive: true, capture: true };

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      markHeroEmbedForCleanReset();
      suppress();
      return;
    }

    resume();
  }, lifecycleOptions);

  window.addEventListener("focus", resume, lifecycleOptions);
  window.addEventListener("blur", () => {
    markHeroEmbedForCleanReset();
    suppress();
  }, lifecycleOptions);
  window.addEventListener("pageshow", resume, lifecycleOptions);
  window.addEventListener("pagehide", () => {
    markHeroEmbedForCleanReset();
    suppress();
  }, lifecycleOptions);
  window.addEventListener("mousemove", suppress, { passive: true });
  window.addEventListener("pointermove", suppress, { passive: true });
}

function enforceHeroControlsHidden(force = false) {
  const now = Date.now();
  const shouldForce = force === true;

  if (!shouldForce && now - state.lastHeroControlSuppressAt < 350) return;
  state.lastHeroControlSuppressAt = now;

  const video = elements.heroTrailer;

  if (video) {
    video.removeAttribute("controls");
    video.controls = false;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.disablePictureInPicture = true;
    video.disableRemotePlayback = true;
    video.setAttribute("controlslist", "nodownload noplaybackrate noremoteplayback");
    video.setAttribute("tabindex", "-1");
    video.blur();
  }

  const embed = elements.heroEmbedTrailer;

  if (embed) {
    embed.setAttribute("tabindex", "-1");
    embed.setAttribute("aria-hidden", "true");
    embed.style.pointerEvents = "none";
    embed.blur();
  }

  clearNativeMediaSessionControls();
}

function markHeroEmbedForCleanReset() {
  if (elements.heroBillboard?.classList.contains("is-youtube-trailer")) {
    state.heroNeedsEmbedReset = true;
    clearHeroYouTubeRevealTimers();

    if (elements.heroBillboard.classList.contains("is-video-playing")) {
      keepHeroYouTubeEmbedVisibleForRecovery();
    } else {
      hideHeroYouTubeEmbedForGuard();
    }
  }
}

function resumeHeroTrailerCleanly() {
  enforceHeroControlsHidden(true);

  const video = elements.heroTrailer;
  if (video && !video.hidden && video.src && !elements.heroBillboard?.classList.contains("is-trailer-resting")) {
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  }

  const billboard = elements.heroBillboard;
  if (!billboard?.classList.contains("is-youtube-trailer")) return;

  if (state.heroNeedsEmbedReset && shouldResetHeroEmbed()) {
    resetHeroYouTubeEmbed();
  } else if (billboard.classList.contains("is-video-playing")) {
    recoverLoadedHeroYouTubeEmbedInPlace();
  }

  state.heroNeedsEmbedReset = false;
}

function shouldResetHeroEmbed() {
  const embed = elements.heroEmbedTrailer;
  const embedShell = elements.heroEmbedShell;

  return !embed?.src || embed.hidden || embedShell?.hidden === true;
}

function hideHeroYouTubeEmbedForGuard() {
  const billboard = elements.heroBillboard;
  const embedShell = elements.heroEmbedShell;
  const embed = elements.heroEmbedTrailer;

  if (!billboard?.classList.contains("is-youtube-trailer") || !embedShell || !embed) return state.heroGuardCycle;

  state.heroGuardCycle += 1;
  billboard.classList.add("is-trailer-priming", "is-youtube-guarded");
  embedShell.hidden = false;
  embedShell.classList.add("is-resetting");
  embed.hidden = false;
  enforceHeroControlsHidden(true);

  return state.heroGuardCycle;
}

function revealHeroYouTubeEmbedAfterGuard(guardCycle = state.heroGuardCycle) {
  const billboard = elements.heroBillboard;
  const embedShell = elements.heroEmbedShell;
  const embed = elements.heroEmbedTrailer;

  if (!billboard?.classList.contains("is-youtube-trailer") || !embedShell || !embed?.src) return;
  if (guardCycle !== state.heroGuardCycle) {
    state.heroEmbedResetTimer = null;
    return;
  }

  if (document.hidden) {
    state.heroNeedsEmbedReset = true;
    state.heroEmbedResetTimer = null;
    return;
  }

  enforceHeroControlsHidden(true);
  embedShell.classList.remove("is-resetting");
  billboard.classList.remove("is-trailer-priming", "is-youtube-guarded");
  prepareHeroTitleTransition();
  showHeroTrailerPlaying(billboard, "is-embed-trailer");
  state.heroEmbedResetTimer = null;
}

function clearHeroYouTubeRevealTimers() {
  window.clearTimeout(state.heroRevealTimer);
  window.clearTimeout(state.heroEmbedResetTimer);
  window.clearTimeout(state.heroEmbedResetFallbackTimer);
  state.heroRevealTimer = null;
  state.heroEmbedResetTimer = null;
  state.heroEmbedResetFallbackTimer = null;
}

function recoverLoadedHeroYouTubeEmbedInPlace() {
  const embed = elements.heroEmbedTrailer;

  if (!embed?.src) return;

  const recoverCycle = keepHeroYouTubeEmbedVisibleForRecovery();
  window.clearTimeout(state.heroEmbedResetTimer);
  window.clearTimeout(state.heroEmbedResetFallbackTimer);
  state.heroEmbedResetFallbackTimer = null;
  sendHeroYouTubePlaybackCommand();
  const finishRecovery = () => {
    if (recoverCycle !== state.heroGuardCycle) return;
    keepHeroYouTubeEmbedVisibleForRecovery();
    sendHeroYouTubePlaybackCommand();
    state.heroEmbedResetTimer = null;
  };

  finishRecovery();
}

function keepHeroYouTubeEmbedVisibleForRecovery() {
  const billboard = elements.heroBillboard;
  const embedShell = elements.heroEmbedShell;
  const embed = elements.heroEmbedTrailer;

  if (!billboard?.classList.contains("is-youtube-trailer") || !embedShell || !embed?.src) return state.heroGuardCycle;

  state.heroGuardCycle += 1;
  embedShell.hidden = false;
  embedShell.classList.remove("is-resetting");
  embed.hidden = false;
  prepareHeroTitleTransition();
  showHeroTrailerPlaying(billboard, "is-embed-trailer");
  enforceHeroControlsHidden(true);

  return state.heroGuardCycle;
}

function sendHeroYouTubePlaybackCommand() {
  const embed = elements.heroEmbedTrailer;
  if (!embed?.src || !embed.contentWindow) return;

  try {
    const targetOrigin = new URL(embed.src).origin;
    ["mute", "playVideo"].forEach((func) => {
      embed.contentWindow.postMessage(JSON.stringify({ event: "command", func, args: [] }), targetOrigin);
    });
  } catch {
    // Cross-frame playback commands are best-effort; the visual recovery must never depend on them.
  }
}

function resetHeroYouTubeEmbed() {
  const billboard = elements.heroBillboard;
  const embedShell = elements.heroEmbedShell;
  const embed = elements.heroEmbedTrailer;
  const src = state.activeHeroEmbedSrc || embed?.src || "";

  if (!billboard?.classList.contains("is-youtube-trailer") || !embedShell || !embed || !src) return;

  window.clearTimeout(state.heroEmbedResetTimer);
  window.clearTimeout(state.heroEmbedResetFallbackTimer);
  state.heroEmbedResetTimer = null;
  state.heroEmbedResetFallbackTimer = null;

  const guardCycle = hideHeroYouTubeEmbedForGuard();

  const finishCleanReset = () => {
    enforceHeroControlsHidden(true);
    window.clearTimeout(state.heroEmbedResetTimer);
    revealHeroYouTubeEmbedAfterGuard(guardCycle);
  };

  embed.hidden = true;
  embed.removeAttribute("src");

  state.heroEmbedResetTimer = window.setTimeout(() => {
    embed.hidden = false;
    embed.addEventListener("load", finishCleanReset, { once: true });
    embed.src = src;
    enforceHeroControlsHidden(true);
  }, 80);
}

function startHeroControlSweep() {
  if (state.heroControlSweepTimer) return;

  state.heroControlSweepTimer = window.setInterval(() => {
    enforceHeroControlsHidden();
  }, 800);
}

function clearNativeMediaSessionControls() {
  if (!("mediaSession" in navigator)) return;

  try {
    navigator.mediaSession.metadata = null;
    [
      "play",
      "pause",
      "previoustrack",
      "nexttrack",
      "seekbackward",
      "seekforward",
      "seekto"
    ].forEach((action) => {
      try {
        navigator.mediaSession.setActionHandler(action, null);
      } catch {
        // Unsupported actions can vary by browser.
      }
    });
  } catch {
    // Media Session is optional; failing here should never affect playback.
  }
}

function updateNavAppearance() {
  if (!elements.memberNav) return;

  const heroCopyTop = elements.heroBillboard
    ? elements.heroBillboard.getBoundingClientRect().top + window.scrollY
    : 0;

  const navHeight = elements.memberNav.offsetHeight || 70;
  const darkBeforeHeroText = Math.max(heroCopyTop + navHeight * 0.6, 12);

  elements.memberNav.classList.toggle(
    "is-scrolled",
    window.scrollY >= darkBeforeHeroText
  );
}

function shouldDelayInitialHeroWork() {
  return !state.hasFinishedInitialHeroReveal;
}

function setHeroTrailerState(billboard, nextState = "") {
  if (!billboard) return;

  HERO_TRAILER_STATE_CLASSES.forEach((className) => {
    if (className !== nextState) {
      billboard.classList.remove(className);
    }
  });

  if (nextState) {
    billboard.classList.add(nextState);
  }
}

function clearHeroTrailerSourceState(billboard) {
  if (!billboard) return;
  billboard.classList.remove(...HERO_TRAILER_SOURCE_CLASSES, "is-hero-title-transitioning");
}

function showHeroTrailerLoading(billboard) {
  if (!billboard) return;
  clearHeroTrailerSourceState(billboard);
  setHeroTrailerState(billboard, "is-trailer-loading");
}

function showHeroTrailerPlaying(billboard, sourceClass) {
  if (!billboard) return;
  billboard.classList.remove("is-updating", "is-trailer-fallback", "is-trailer-priming", "is-youtube-guarded");
  setHeroTrailerState(billboard, "is-video-playing");
  if (sourceClass) {
    billboard.classList.add(sourceClass);
  }
  settleHeroMediaBoundary();
}

function showHeroTrailerResting(billboard) {
  if (!billboard) return;
  billboard.classList.remove("is-updating", "is-trailer-loading", "is-trailer-fallback", "is-trailer-priming", "is-youtube-guarded");
  setHeroTrailerState(billboard, "is-trailer-resting");
  settleHeroMediaBoundary();
}

function clearHeroTrailerState(billboard) {
  if (!billboard) return;
  setHeroTrailerState(billboard);
  clearHeroTrailerSourceState(billboard);
  billboard.classList.remove("is-updating");
}

function scheduleHeroMediaBoundaryUpdate() {
  if (!elements.heroBillboard || !elements.rowsRoot) return;
  if (shouldDelayInitialHeroWork()) {
    state.hasDeferredInitialHeroBoundarySettle = true;
    return;
  }
  if (state.heroBoundaryRaf) return;

  state.heroBoundaryRaf = window.requestAnimationFrame(() => {
    state.heroBoundaryRaf = null;
    updateHeroMediaBoundary();
  });
}

function settleHeroMediaBoundary() {
  if (shouldDelayInitialHeroWork()) {
    state.hasDeferredInitialHeroBoundarySettle = true;
    return;
  }

  updateHeroMediaBoundary();
  [120, 500, 1200].forEach((delay) => {
    window.setTimeout(updateHeroMediaBoundary, delay);
  });
}

function syncHeroUnderlayRow(firstRow) {
  if (!elements.rowsRoot) return;

  elements.rowsRoot.querySelectorAll(`.${HERO_UNDERLAY_ROW_CLASS}`).forEach((row) => {
    if (row !== firstRow) row.classList.remove(HERO_UNDERLAY_ROW_CLASS);
  });

  firstRow?.classList.add(HERO_UNDERLAY_ROW_CLASS);
}

function getPixelLineHeight(element, fallbackRatio) {
  const styles = window.getComputedStyle(element);
  const lineHeight = Number.parseFloat(styles.lineHeight);
  if (Number.isFinite(lineHeight)) return lineHeight;

  const fontSize = Number.parseFloat(styles.fontSize);
  return Number.isFinite(fontSize) ? fontSize * fallbackRatio : 0;
}

function prepareHeroTitleTransition() {
  // Intentionally left empty to allow pure CSS transform scaling
  return;
}

function getHeroCopyWrapLiftValue() {
  const rowsRoot = elements.rowsRoot;
  const title = elements.heroTitle;
  const description = elements.heroDescription;

  if (!rowsRoot || !title || !description) return 0;

  const titleLineHeight = getPixelLineHeight(title, 0.9);
  const descriptionLineHeight = getPixelLineHeight(description, 1.34);
  const titleExtra = Math.max(0, title.offsetHeight - titleLineHeight);
  const descriptionExtra = Math.max(0, description.offsetHeight - descriptionLineHeight * 2);
  const wrapLift = Math.min(titleExtra + descriptionExtra, HERO_COPY_WRAP_LIFT_CAP_PX);
  const profileScale = Number.parseFloat(
    window.getComputedStyle(rowsRoot).getPropertyValue("--hero-copy-wrap-lift-scale")
  );
  return wrapLift * (Number.isFinite(profileScale) ? Math.max(0, profileScale) : 1);
}

function updateHeroCopyWrapLift() {
  const rowsRoot = elements.rowsRoot;
  if (!rowsRoot) return;

  const scaledWrapLift = getHeroCopyWrapLiftValue();

  rowsRoot.style.setProperty(
    "--hero-copy-wrap-lift",
    scaledWrapLift > 1 ? `${scaledWrapLift.toFixed(2)}px` : "0px"
  );
}

function getHeroRowVisibilityProfile(movie) {
  const titleKey = String(movie?.title || "")
    .trim()
    .toLowerCase();

  return HERO_ROW_VISIBILITY_PROFILES[titleKey] || DEFAULT_HERO_ROW_VISIBILITY_PROFILE;
}

function applyHeroRowVisibilityProfile(movie) {
  if (!elements.rowsRoot) return;

  const profile = getHeroRowVisibilityProfile(movie);
  elements.rowsRoot.style.setProperty("--hero-row-poster-lift", profile.posterLift);
  elements.rowsRoot.style.setProperty("--hero-row-trailer-lift", profile.trailerLift);
  elements.rowsRoot.style.setProperty("--hero-copy-wrap-lift-scale", profile.copyWrapLiftScale);
  elements.rowsRoot.style.setProperty("--hero-copy-wrap-lift", "0px");
}

function getTranslateY(element) {
  if (!element) return 0;

  const transform = window.getComputedStyle(element).transform;
  if (!transform || transform === "none") return 0;

  const matrix = new DOMMatrixReadOnly(transform);
  return Number.isFinite(matrix.m42) ? matrix.m42 : 0;
}

function setHeroMediaUnderlay(value) {
  const numericValue = Number(value);
  const underlay = Number.isFinite(numericValue) ? Math.max(0, Math.ceil(numericValue)) : 0;

  elements.heroBillboard?.style.setProperty("--hero-row-media-underlay", `${underlay}px`);
}

function setPostHeroRowsBackgroundPull(value) {
  const numericValue = Number(value);
  const pullUp = Number.isFinite(numericValue) ? Math.max(0, Math.ceil(numericValue)) : 0;

  elements.rowsRoot?.style.setProperty("--post-hero-bg-pull-up", `${pullUp}px`);
}

function isInitialHeroMediaBoundaryCandidate() {
  const billboard = elements.heroBillboard;
  const heroMedia = billboard?.querySelector(".hero-media");

  if (
    !billboard ||
    !heroMedia ||
    !billboard.classList.contains("is-initial-poster-loading")
  ) {
    return false;
  }

  const mediaRect = heroMedia.getBoundingClientRect();
  const posterAspectRatio = state.heroPosterAspectRatio;
  const mediaAspectRatio = mediaRect.height > 0 ? mediaRect.width / mediaRect.height : 0;

  return (
    Number.isFinite(posterAspectRatio) &&
    posterAspectRatio > 0 &&
    Number.isFinite(mediaAspectRatio) &&
    mediaAspectRatio > 0 &&
    posterAspectRatio < mediaAspectRatio
  );
}

function prepareInitialHeroMediaBoundary() {
  const billboard = elements.heroBillboard;
  const rowsRoot = elements.rowsRoot;
  const heroMedia = billboard?.querySelector(".hero-media");

  if (
    !billboard ||
    !rowsRoot ||
    !heroMedia ||
    !isInitialHeroMediaBoundaryCandidate()
  ) {
    return false;
  }

  const visibleRows = Array.from(
    rowsRoot.querySelectorAll(".movie-row:not(.is-filtered-empty)")
  );
  const firstRow = visibleRows[0] || rowsRoot.querySelector(".movie-row");
  const firstRowCards = firstRow
    ? Array.from(firstRow.querySelectorAll(".title-card:not(.is-filtered) .card-visual"))
    : [];

  if (!firstRowCards.length) return false;

  syncHeroUnderlayRow(firstRow);
  const heroRect = billboard.getBoundingClientRect();
  const cardBottom = Math.max(
    ...firstRowCards.map((card) => card.getBoundingClientRect().bottom)
  );
  const rowOffset = getTranslateY(rowsRoot);
  const currentWrapLift = Number.parseFloat(
    window.getComputedStyle(rowsRoot).getPropertyValue("--hero-copy-wrap-lift")
  ) || 0;
  const finalWrapLift = getHeroCopyWrapLiftValue();
  const finalCardBottom = cardBottom - rowOffset - (finalWrapLift - currentWrapLift);
  const rawUnderlay = finalCardBottom - heroRect.bottom;

  if (rawUnderlay <= 0) return false;

  const nextRow = visibleRows.find((row) => row !== firstRow);
  const nextRowTop = nextRow ? nextRow.getBoundingClientRect().top : cardBottom;

  state.initialHeroMediaTransition = heroMedia.style.getPropertyValue("transition");
  state.initialHeroMediaTransitionPriority = heroMedia.style.getPropertyPriority("transition");
  heroMedia.style.setProperty("transition", "none");

  rowsRoot.style.setProperty(
    "--hero-copy-wrap-lift",
    finalWrapLift > 1 ? `${finalWrapLift.toFixed(2)}px` : "0px"
  );
  setHeroMediaUnderlay(rawUnderlay + HERO_ROW_MEDIA_UNDERLAY_BLEED_PX);
  setPostHeroRowsBackgroundPull(nextRowTop - cardBottom);
  void heroMedia.offsetHeight;

  state.hasPreparedInitialHeroMediaBoundary = true;
  return true;
}

function finishPreparedInitialHeroMediaBoundary() {
  if (!state.hasPreparedInitialHeroMediaBoundary) return false;

  const heroMedia = elements.heroBillboard?.querySelector(".hero-media");

  if (heroMedia) {
    if (state.initialHeroMediaTransition) {
      heroMedia.style.setProperty(
        "transition",
        state.initialHeroMediaTransition,
        state.initialHeroMediaTransitionPriority
      );
    } else {
      heroMedia.style.removeProperty("transition");
    }
  }

  state.hasPreparedInitialHeroMediaBoundary = false;
  state.initialHeroMediaTransition = "";
  state.initialHeroMediaTransitionPriority = "";
  return true;
}

function updateHeroMediaBoundary() {
  // HARD GUARD: Never calculate layout while the hero is revealing
  if (elements.heroBillboard?.classList.contains("is-initial-poster-revealing")) {
    state.hasDeferredInitialHeroBoundarySettle = true;
    return;
  }

  if (shouldDelayInitialHeroWork()) {
    state.hasDeferredInitialHeroBoundarySettle = true;
    return;
  }

  const billboard = elements.heroBillboard;
  const rowsRoot = elements.rowsRoot;
  if (!billboard || !rowsRoot) return;

  updateHeroCopyWrapLift();

  const visibleRows = Array.from(
    rowsRoot.querySelectorAll(".movie-row:not(.is-filtered-empty)")
  );

  const firstRow = visibleRows[0] || rowsRoot.querySelector(".movie-row");

  if (!firstRow) {
    syncHeroUnderlayRow(null);
    setHeroMediaUnderlay(0);
    setPostHeroRowsBackgroundPull(0);
    return;
  }

  syncHeroUnderlayRow(firstRow);

  const heroRect = billboard.getBoundingClientRect();

  const firstRowCards = Array.from(
    firstRow.querySelectorAll(".title-card:not(.is-filtered) .card-visual")
  );

  if (!firstRowCards.length) {
    setHeroMediaUnderlay(0);
    setPostHeroRowsBackgroundPull(0);
    return;
  }

  const cardBottom = Math.max(
    ...firstRowCards.map((card) => card.getBoundingClientRect().bottom)
  );
  const firstLoadRowOffset = billboard.classList.contains("is-initial-poster-loading") && !document.body.classList.contains("is-ready")
    ? getTranslateY(rowsRoot)
    : 0;

  const rawUnderlay = cardBottom - firstLoadRowOffset - heroRect.bottom;
  const underlay = Math.max(0, rawUnderlay) + HERO_ROW_MEDIA_UNDERLAY_BLEED_PX;
  const nextRow = visibleRows.find((row) => row !== firstRow);
  const nextRowTop = nextRow ? nextRow.getBoundingClientRect().top : cardBottom;

  setHeroMediaUnderlay(underlay);
  setPostHeroRowsBackgroundPull(nextRowTop - cardBottom);
}

function setActiveNav(activeLink) {
  elements.navLinks.forEach((link) => {
    const isActive = link === activeLink;
    link.classList.toggle("is-active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function updateViewHistory(hash, historyMode) {
  if (!historyMode || !hash) return;

  const nextUrl = `${window.location.pathname}${window.location.search}${hash}`;

  if (historyMode === "replace" || window.location.hash === hash) {
    window.history.replaceState(null, "", nextUrl);
  } else {
    window.history.pushState(null, "", nextUrl);
  }
}

function getNavigationLinkForHash(hash) {
  return elements.navLinks.find((link) => link.hash === hash)
    || elements.navLinks.find((link) => link.dataset.view === "home")
    || null;
}

function syncNavigationFromLocation(options = {}) {
  const { animate = true } = options;
  const hash = window.location.hash || "#home";
  const activeLink = getNavigationLinkForHash(hash);
  if (!activeLink) return;

  setActiveNav(activeLink);

  if (activeLink.dataset.view === "my-list") {
    showMyListPage({ animate });
    return;
  }

  showHomeView(activeLink.dataset.view || "home", {
    animate,
    hash
  });
}

function scheduleNavigationSyncFromLocation() {
  hideTitleCardHover();

  if (state.navigationSyncFrame) {
    window.cancelAnimationFrame(state.navigationSyncFrame);
  }

  state.navigationSyncFrame = window.requestAnimationFrame(() => {
    state.navigationSyncFrame = null;
    syncNavigationFromLocation();
  });
}

function clearViewTransition() {
  if (state.viewTransitionFrame) {
    window.cancelAnimationFrame(state.viewTransitionFrame);
  }

  window.clearTimeout(state.viewTransitionTimer);

  const transition = state.viewTransition;
  if (transition?.target) {
    transition.target.removeEventListener("transitionend", transition.handleTransitionEnd);
  }

  state.viewTransitionFrame = null;
  state.viewTransitionTimer = null;
  state.viewTransition = null;
}

function finishViewTransition(transition, invokeComplete = true) {
  if (!transition || state.viewTransition !== transition) return;

  clearViewTransition();

  transition.source.classList.remove("is-active", "is-entering", "is-leaving");
  transition.source.classList.add("view-hidden");
  transition.source.setAttribute("aria-hidden", "true");

  transition.target.classList.remove("view-hidden", "is-entering", "is-leaving");
  transition.target.classList.add("is-active");
  transition.target.setAttribute("aria-hidden", "false");

  elements.viewStage?.classList.remove("is-switching", "is-to-my-list", "is-to-browse");
  if (elements.viewStage) {
    elements.viewStage.style.height = "";
  }

  state.activeView = transition.targetView;

  if (state.activeView === "browse") {
    scheduleHeroMediaBoundaryUpdate();
  }

  if (invokeComplete) {
    transition.onComplete?.();
  }
}

function switchPageView(targetView, options = {}) {
  const { animate = true, onComplete } = options;
  const target = targetView === "my-list" ? elements.myListPage : elements.browseView;
  if (!target || !elements.viewStage) {
    onComplete?.();
    return;
  }

  if (state.viewTransition) {
    finishViewTransition(state.viewTransition, false);
  }

  const source = state.activeView === "my-list" ? elements.myListPage : elements.browseView;

  if (source === target) {
    target.classList.remove("view-hidden", "is-entering", "is-leaving");
    target.classList.add("is-active");
    target.setAttribute("aria-hidden", "false");
    onComplete?.();
    return;
  }

  const shouldAnimate = animate && !prefersReducedMotion();
  const sourceHeight = Math.max(source?.getBoundingClientRect().height || 0, elements.viewStage.offsetHeight);

  target.classList.remove("view-hidden", "is-active", "is-leaving");
  target.classList.add("is-entering");
  target.setAttribute("aria-hidden", "false");

  const targetHeight = Math.max(target.scrollHeight, target.getBoundingClientRect().height);

  if (!shouldAnimate || !source) {
    source?.classList.remove("is-active", "is-entering", "is-leaving");
    source?.classList.add("view-hidden");
    source?.setAttribute("aria-hidden", "true");
    target.classList.remove("is-entering");
    target.classList.add("is-active");
    elements.viewStage.style.height = "";
    state.activeView = targetView;
    onComplete?.();
    return;
  }

  elements.viewStage.style.height = `${sourceHeight}px`;
  elements.viewStage.classList.add(
    "is-switching",
    targetView === "my-list" ? "is-to-my-list" : "is-to-browse"
  );

  void target.offsetWidth;

  source.classList.remove("is-active", "is-entering");
  source.classList.add("is-leaving");
  source.setAttribute("aria-hidden", "true");

  const transition = {
    source,
    target,
    targetView,
    onComplete,
    handleTransitionEnd: null
  };

  transition.handleTransitionEnd = (event) => {
    if (event.target === target && event.propertyName === "transform") {
      finishViewTransition(transition);
    }
  };

  state.viewTransition = transition;
  target.addEventListener("transitionend", transition.handleTransitionEnd);

  state.viewTransitionFrame = window.requestAnimationFrame(() => {
    elements.viewStage.style.height = `${targetHeight}px`;
    target.classList.remove("is-entering");
    target.classList.add("is-active");
    state.viewTransitionFrame = null;
  });

  state.viewTransitionTimer = window.setTimeout(() => {
    finishViewTransition(transition);
  }, VIEW_TRANSITION_FALLBACK_MS);
}

function scrollToBrowseDestination(viewName, hash, animate = true) {
  const behavior = animate && !prefersReducedMotion() ? "smooth" : "auto";

  if (viewName === "home") {
    window.scrollTo({ top: 0, behavior });
    return;
  }

  const targetId = (hash || "").replace(/^#/, "");
  const target = targetId ? document.getElementById(targetId) : null;

  if (target) {
    target.scrollIntoView({ behavior, block: "start" });
  } else {
    window.scrollTo({ top: 0, behavior });
  }
}

function showHomeView(viewName = "home", options = {}) {
  const {
    animate = true,
    hash = viewName === "home" ? "#home" : `#${viewName}`,
    historyMode = null
  } = options;

  hideTitleCardHover();
  updateViewHistory(hash, historyMode);
  document.body.classList.remove("showing-my-list-page");

  switchPageView("browse", {
    animate,
    onComplete: () => scrollToBrowseDestination(viewName, hash, animate)
  });
}

function showMyListPage(options = {}) {
  const { animate = true, historyMode = null } = options;

  hideTitleCardHover();
  renderMyListPage();
  updateViewHistory("#my-list-page", historyMode);
  document.body.classList.add("showing-my-list-page");
  window.scrollTo({
    top: 0,
    behavior: animate && !prefersReducedMotion() ? "smooth" : "auto"
  });
  switchPageView("my-list", { animate });
}

function bindTitleModal() {
  elements.closeTitleModal?.addEventListener("click", closeTitleModal);
  elements.titleModal?.addEventListener("click", (event) => {
    if (event.target === elements.titleModal) {
      closeTitleModal();
    }
  });
  elements.modalPlayBtn?.addEventListener("click", () => playMovie(state.activeModalMovie));
  elements.modalListBtn?.addEventListener("click", () => addToMyList(state.activeModalMovie));

  elements.closeTrailerModal?.addEventListener("click", closeTrailerModal);
  elements.trailerModal?.addEventListener("click", (event) => {
    if (event.target === elements.trailerModal) {
      closeTrailerModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    if (elements.trailerModal && !elements.trailerModal.classList.contains("hidden")) {
      closeTrailerModal();
      return;
    }

    if (elements.titleModal && !elements.titleModal.classList.contains("hidden")) {
      closeTitleModal();
    }
  });
}

function bindAdminDashboard() {
  elements.adminDashboard?.setAttribute(
    "aria-hidden",
    elements.adminDashboard.classList.contains("hidden") ? "true" : "false"
  );

  elements.closeAdminDashboard?.addEventListener("click", () => {
    closeAdminDashboardModal();
  });

  elements.adminDashboard?.addEventListener("click", (event) => {
    if (event.target === elements.adminDashboard) {
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

  bindPlacementDropdown();
  bindPosterApplyTargetDropdown();
  bindRankApplyTargetDropdown();
  bindMovieBadgesDropdown();

  elements.movieForm?.addEventListener("submit", handleMovieFormSubmit);

  elements.cancelEditMovieBtn?.addEventListener("click", () => {
    clearMovieEditState(true);
  });

  elements.adminMovieSearch?.addEventListener("input", () => {
    loadAdminMovies(false);
  });

  elements.clearMovieSearch?.addEventListener("click", () => {
    elements.adminMovieSearch.value = "";
    loadAdminMovies(false);
  });
}

function bindPlacementDropdown() {
  const dropdown = document.querySelector("[data-placement-dropdown]");
  const input = document.getElementById("movie-placement");

  if (!dropdown || !input) return;

  if (dropdown.dataset.bound === "true") {
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

function bindPosterApplyTargetDropdown() {
  const field = document.querySelector("[data-poster-smart-field]");
  const input = document.getElementById("movie-poster-target");
  const posterInput = document.getElementById("movie-poster");
  const trigger = field?.querySelector(".poster-smart-trigger");

  if (!field || !input || !posterInput || !trigger) return;

  if (field.dataset.bound === "true") {
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

function bindRankApplyTargetDropdown() {
  const field = document.querySelector("[data-rank-smart-field]");
  const input = document.getElementById("movie-rank-target");
  const rankInput = document.getElementById("movie-rank");
  const trigger = field?.querySelector(".poster-smart-trigger");

  if (!field || !input || !rankInput || !trigger) return;

  if (field.dataset.bound === "true") {
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

function bindMovieBadgesDropdown() {
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

function closeMenus() {
  if (elements.profileMenu) {
    elements.profileMenu.hidden = true;
    elements.profileButton?.setAttribute("aria-expanded", "false");
  }

  if (elements.notificationMenu) {
    elements.notificationMenu.hidden = true;
    elements.notificationButton?.setAttribute("aria-expanded", "false");
  }
}

async function hideAuthGate() {
  if (!state.hasRevealedInitialHeroPoster && state.initialHeroPosterReadyPromise) {
    try {
      await state.initialHeroPosterReadyPromise;
    } catch {
      // The page should still enter if a hero image source fails.
    }
  }

  const isInitialHeroEntry = !state.hasRevealedInitialHeroPoster;
  if (isInitialHeroEntry && isInitialHeroMediaBoundaryCandidate()) {
    try {
      await document.fonts?.ready;
    } catch {
      // Continue with the currently available font metrics.
    }
    prepareInitialHeroMediaBoundary();
  }

  const remainingSplashTime = AUTH_SPLASH_MIN_DURATION_MS - (performance.now() - authSplashStartedAt);
  if (remainingSplashTime > 0) {
    await new Promise((resolve) => window.setTimeout(resolve, remainingSplashTime));
  }

  document.body.classList.add("is-ready");
  revealInitialHeroPoster();

  if (!isInitialHeroEntry) {
    settleHeroMediaBoundary();
    window.setTimeout(settleHeroMediaBoundary, 1400);
  }

  if (!elements.authGate) return;

  elements.authGate.classList.add("auth-gate-dismissed");
  window.setTimeout(() => {
    elements.authGate.classList.add("hidden");
  }, 840);
}

function updateProfileUI(user, role) {
  const email = cleanText(user.email, "Signed in", 120);
  const initials = getInitials(email);

  if (elements.profileEmail) elements.profileEmail.textContent = email;
  if (elements.profileRole) elements.profileRole.textContent = role === "admin" ? "Admin verified" : "Standard user";
  if (elements.profileAvatar) elements.profileAvatar.textContent = initials;
  if (elements.profileAvatarSmall) elements.profileAvatarSmall.textContent = initials;
}

function getInitials(email) {
  const cleanEmail = typeof email === "string" ? email.trim() : "";
  if (!cleanEmail) return "N";

  const localPart = cleanEmail.split("@")[0] || "netflix";
  const pieces = localPart.split(/[._-]+/).filter(Boolean);
  const initials = pieces.length > 1
    ? `${pieces[0][0] || "N"}${pieces[1][0] || "F"}`
    : localPart.slice(0, 2);

  return initials.toUpperCase();
}

async function handleSignOut() {
  if (!state.currentUser) return;

  state.isSigningOut = true;

  await logSecurityEvent("USER_LOGOUT", "SUCCESS");
  await signOut(auth);
  window.location.replace(LANDING_PAGE);
}

async function getUserRole(uid) {
  try {
    const userSnap = await getDoc(doc(db, "users", uid));
    if (userSnap.exists()) {
      return userSnap.data().role === "admin" ? "admin" : "user";
    }
  } catch (error) {
    console.error("Role lookup failed:", error.code || error.message);
  }

  return "user";
}

function updateAdminUI() {
  if (state.currentRole === "admin") {
    document.body.classList.add("admin-user");
  } else {
    lockAdminUI();
  }
}

function lockAdminUI() {
  document.body.classList.remove("admin-user");
  closeAdminDashboardModal();
}

async function verifyAdminSession() {
  if (!state.currentUser) return false;

  const latestRole = await getUserRole(state.currentUser.uid);
  state.currentRole = latestRole;
  updateProfileUI(state.currentUser, latestRole);

  if (latestRole !== "admin") {
    lockAdminUI();
    await logSecurityEvent("ADMIN_SESSION_REVOKED_OR_DENIED", "BLOCKED");
    return false;
  }

  document.body.classList.add("admin-user");
  return true;
}

async function refreshCatalog(options = {}) {
  const { rowKeys = null, refreshHero = true, refreshMyList = true } = options;

  state.cloudMovies = await loadCloudMovies();
  state.catalog = uniqueMovies([...state.cloudMovies, ...fallbackMovies]);
  state.myList = await loadMyList();

  if (refreshHero) {
    renderHero();
  }

  if (Array.isArray(rowKeys)) {
    if (rowKeys.length > 0) {
      renderRows(rowKeys);
    }
  } else {
    renderRows();
  }

  if (refreshMyList) {
    renderMyListPage();
  }
}

async function loadCloudMovies() {
  try {
    const snapshot = await getDocs(collection(db, "movies"));
    const movies = [];

    snapshot.forEach((movieDoc, index) => {
      const normalized = normalizeCloudMovie(movieDoc.id, movieDoc.data(), index);
      if (normalized) movies.push(normalized);
    });

    return sortMoviesByRank(movies);
  } catch (error) {
    console.error("Movie catalog load failed:", error.code || error.message);
    return [];
  }
}

async function loadMyList() {
  if (!state.currentUser) return [];

  try {
    const snapshot = await getDocs(collection(db, "users", state.currentUser.uid, "watchlist"));
    const movies = [];

    snapshot.forEach((movieDoc, index) => {
      const data = movieDoc.data();
      const matched = state.catalog.find((movie) => {
        const key = movie.firestoreId || movie.id;
        return key === movieDoc.id || movie.title === data.title;
      });
      const fallback = matched || fallbackMovies[index % fallbackMovies.length] || fallbackHero;
      const normalized = normalizeSavedMovie(movieDoc.id, data, fallback, index);
      if (normalized) movies.push(normalized);
    });

    return movies;
  } catch (error) {
    console.warn("My List load failed:", error.code || error.message);
    return [];
  }
}

function normalizeSavedMovie(id, movie, fallback, index) {
  if (!movie || typeof movie !== "object") return null;

  const fallbackPosterUrl = getAfterPagePosterUrl(fallback, FALLBACK_ARTWORK);

  return {
    id: `saved-${id}`,
    firestoreId: id,
    title: cleanMovieTitle(movie.title || fallback.title, fallback.title, 90),
    displayTitle: getExplicitMovieDisplayTitle(movie) || getExplicitMovieDisplayTitle(fallback),
    category: cleanText(movie.category || fallback.category, fallback.category, 60),
    year: cleanText(String(movie.year || fallback.year), fallback.year, 20),
    rating: cleanText(movie.rating || fallback.rating, fallback.rating, 22),
    duration: cleanText(movie.duration || fallback.duration || "", fallback.duration || "", 24),
    description: cleanText(movie.description || fallback.description, fallback.description, MAX_DESCRIPTION_LENGTH),
    rank: getSanitizedRank(movie.rank) ?? 999,
    beforeRank: getSanitizedRank(movie.beforeRank),
    afterRank: getSanitizedRank(movie.afterRank),
    tag: movie.featured === true ? "Featured" : "",
    badges: normalizeMovieBadges(movie.badges),
    progress: Number(movie.progress || fallback.progress || 0),
    posterUrl: getAfterPagePosterUrl(movie, fallbackPosterUrl),
    beforePosterUrl: cleanImageUrl(movie.beforePosterUrl, ""),
    afterPosterUrl: cleanImageUrl(movie.afterPosterUrl, ""),
    bannerUrl: cleanImageUrl(movie.bannerUrl, ""),
    trailerUrl: cleanTrailerUrl(movie.trailerUrl || fallback.trailerUrl, ""),
    featured: movie.featured === true,
    rows: ["myList"]
  };
}

function normalizeCloudMovie(id, movie, index) {
  if (!movie || typeof movie !== "object") return null;

  const title = cleanMovieTitle(movie.title, "Untitled Movie", 90);
  const category = cleanText(movie.category, "Movie", 60);
  const year = cleanText(String(movie.year || "Year N/A"), "Year N/A", 20);
  const rating = cleanText(movie.rating, "Rating N/A", 22);
  const duration = cleanText(movie.duration || movie.runtime || "", "", 24);
  const description = cleanText(movie.description, "Now streaming on Netflix.", MAX_DESCRIPTION_LENGTH);
  const rank = getSanitizedRank(movie.rank) ?? 999;
  const beforeRank = getSanitizedRank(movie.beforeRank);
  const afterRank = getSanitizedRank(movie.afterRank);
  const bannerUrl = cleanImageUrl(movie.bannerUrl, "");
  const beforePosterUrl = cleanImageUrl(movie.beforePosterUrl, "");
  const afterPosterUrl = cleanImageUrl(movie.afterPosterUrl, "");
  const posterUrl = getAfterPagePosterUrl(movie, FALLBACK_ARTWORK);
  const trailerUrl = cleanTrailerUrl(movie.trailerUrl, "");
  const placements = normalizeMoviePlacements(movie.placements, movie.placement);
  const rowKeys = getAfterRowKeysForPlacements(placements);
  const badges = normalizeMovieBadges(movie.badges);

  return {
    id: `cloud-${id}`,
    firestoreId: id,
    title,
    displayTitle: getExplicitMovieDisplayTitle(movie),
    category,
    year,
    rating,
    duration,
    description,
    rank,
    beforeRank,
    afterRank,
    tag: movie.featured === true ? "Featured" : "",
    badges,
    progress: 0,
    posterUrl,
    beforePosterUrl,
    afterPosterUrl,
    bannerUrl,
    trailerUrl,
    placements,
    placement: placements[0] || "",
    featured: movie.featured === true,
    rows: rowKeys
  };
}

function getMovieBannerImageUrl(movie) {
  return getMovieHeroArtworkUrl(movie, FALLBACK_ARTWORK);
}

function hasHeroBannerEligibility(movie) {
  const bannerUrl = cleanImageUrl(movie?.bannerUrl, "");
  const trailerUrl = cleanTrailerUrl(movie?.trailerUrl, "");
  const trailer = trailerUrl ? getTrailerSource(trailerUrl) : null;

  return Boolean(
    bannerUrl &&
    trailerUrl &&
    trailer &&
    trailer.type !== "unsupported" &&
    !(trailer.type === "embed" && trailer.heroSafe === false)
  );
}

function renderHero() {
  const heroCandidates = state.cloudMovies.filter(hasHeroBannerEligibility);
  const forcedFeatured = heroCandidates.find((movie) => movie.featured);
  const afterPlacementMovies = heroCandidates.filter((movie) => getAfterRowKeysForPlacements(movie.placements).length > 0);
  const heroPool = afterPlacementMovies.length > 0 ? afterPlacementMovies : fallbackMovies;
  const randomMovie = heroPool[Math.floor(Math.random() * heroPool.length)] || fallbackHero;
  const selectedHeroMovie = forcedFeatured || randomMovie;
  state.activeHero = selectedHeroMovie;
  applyHeroRowVisibilityProfile(selectedHeroMovie);
  const shouldAnimateHeroUpdate = state.hasRevealedInitialHeroPoster;
  const billboard = elements.heroBillboard;

  if (shouldAnimateHeroUpdate) {
    stopHeroTrailer();
    billboard?.classList.add("is-updating");
  } else {
    billboard?.classList.remove("is-updating");
  }

  renderHeroKicker(selectedHeroMovie);
  renderHeroTitle(selectedHeroMovie);
  if (elements.heroMeta) elements.heroMeta.textContent = formatMeta(selectedHeroMovie);
  if (elements.heroDescription) elements.heroDescription.textContent = selectedHeroMovie.description;
  if (elements.heroRatingTag) elements.heroRatingTag.textContent = selectedHeroMovie.rating || "U/A 16+";

  const backgroundUrl = getMovieBannerImageUrl(selectedHeroMovie);
  const posterReadyPromise = setHeroPosterImage(backgroundUrl);

  if (shouldAnimateHeroUpdate) {
    window.setTimeout(() => {
      billboard?.classList.remove("is-updating");
    }, 420);
  }

  if (shouldAnimateHeroUpdate) {
    Promise.resolve(posterReadyPromise).finally(() => {
      if (state.activeHero === selectedHeroMovie) {
        setupHeroTrailer(selectedHeroMovie, { skipReset: true });
      }
    });
  } else {
    state.pendingInitialHeroTrailerMovie = selectedHeroMovie;
  }
  updateNavAppearance();
}

function renderHeroKicker(movie) {
  if (!elements.heroKicker) return;

  const hasHeroLogoBadge = normalizeMovieBadges(movie?.badges).includes(HERO_LOGO_BADGE);
  elements.heroKicker.replaceChildren();
  elements.heroKicker.classList.toggle("has-hero-logo", hasHeroLogoBadge);
  elements.heroKicker.classList.toggle("is-empty", !hasHeroLogoBadge);

  if (!hasHeroLogoBadge) return;

  const logoFrame = document.createElement("span");
  logoFrame.className = "hero-kicker-logo";

  const logo = document.createElement("img");
  logo.src = HERO_LOGO_SRC;
  logo.alt = "Netflix";
  logoFrame.appendChild(logo);
  elements.heroKicker.appendChild(logoFrame);
}

function renderHeroTitle(movie) {
  if (!elements.heroTitle) return;

  const title = cleanMovieTitle(movie?.title, "Untitled Movie", 90);
  const titleImage = sanitizeTitleImageInput(title);
  elements.heroTitle.classList.toggle("has-title-image", Boolean(titleImage));

  if (!titleImage) {
    elements.heroTitle.textContent = title;
    return;
  }

  const image = document.createElement("img");
  image.className = "hero-title-image";
  image.src = titleImage.value;
  image.alt = getTitleImageAltText(titleImage.value);
  image.decoding = "async";
  image.loading = "eager";
  image.referrerPolicy = "no-referrer";
  elements.heroTitle.replaceChildren(image);
}

function getTitleImageAltText(value) {
  const title = deriveTitleFromImageFilename(value);
  return title ? `${title} title logo` : "Title logo";
}

function getAdminMovieDisplayTitle(movie, fallback = "Untitled Movie") {
  const rawTitle = typeof movie?.title === "string" ? movie.title.trim() : "";

  if (rawTitle && !sanitizeTitleImageInput(rawTitle)) {
    return cleanMovieTitle(rawTitle, fallback, 90);
  }

  const explicitTitle = getExplicitMovieDisplayTitle(movie);
  if (explicitTitle) return explicitTitle;

  const derivedTitle = deriveTitleFromImageFilename(rawTitle);
  return derivedTitle || fallback;
}

function getMovieTitleDisplayText(movie, fallback = "Untitled Movie") {
  const rawTitle = typeof movie?.title === "string" ? movie.title.trim() : "";

  if (rawTitle && !sanitizeTitleImageInput(rawTitle)) {
    return cleanMovieTitle(rawTitle, fallback, 90);
  }

  const explicitTitle = getExplicitMovieDisplayTitle(movie);
  if (explicitTitle) return explicitTitle;

  return deriveTitleFromImageFilename(rawTitle) || fallback;
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

function setHeroPosterImage(backgroundUrl) {
  if (!elements.heroPoster) return Promise.resolve();

  elements.heroPoster.alt = "";
  elements.heroPoster.loading = "eager";
  elements.heroPoster.decoding = "async";
  elements.heroPoster.setAttribute("fetchpriority", "high");

  const revealToken = state.heroImageLoadToken + 1;
  const isInitialHeroPoster = !state.hasRevealedInitialHeroPoster && Boolean(elements.heroBillboard);
  const targetUrl = backgroundUrl || getHeroPosterFallbackUrl();
  state.heroImageLoadToken = revealToken;
  state.initialHeroPosterRevealToken = revealToken;
  state.isInitialHeroPosterLoaded = false;
  state.heroPosterAspectRatio = 0;
  state.hasPreparedInitialHeroMediaBoundary = false;
  state.initialHeroMediaTransition = "";
  state.initialHeroMediaTransitionPriority = "";

  if (isInitialHeroPoster) {
    elements.heroPoster.classList.remove("is-loaded");
    document.body.classList.add("is-preparing-hero");
    elements.heroBillboard.classList.add("is-initial-poster-loading");
    elements.heroBillboard.classList.remove("is-initial-poster-revealing");
  }

  const readyPromise = loadDecodedHeroPosterImage(targetUrl, revealToken)
    .then(async (loadedUrl) => {
      if (revealToken !== state.heroImageLoadToken || !loadedUrl) return;

      elements.heroPoster.src = loadedUrl;
      void elements.heroPoster.offsetWidth;

      if (isInitialHeroPoster) {
        state.isInitialHeroPosterLoaded = true;
        revealInitialHeroPoster();
      }

      if (!isInitialHeroPoster) {
        elements.heroPoster.classList.add("is-loaded");
      }

      if (revealToken !== state.heroImageLoadToken) return;
    });

  if (isInitialHeroPoster) {
    state.initialHeroPosterReadyPromise = readyPromise;
  }

  return readyPromise;
}

function getHeroPosterFallbackUrl() {
  return getMovieHeroArtworkUrl(fallbackHero, FALLBACK_ARTWORK);
}

function loadDecodedHeroPosterImage(imageUrl, revealToken, allowFallback = true) {
  const sourceUrl = imageUrl || getHeroPosterFallbackUrl();
  const fallbackUrl = getHeroPosterFallbackUrl();

  return new Promise((resolve) => {
    const preloadImage = new Image();
    preloadImage.decoding = "async";
    preloadImage.setAttribute("fetchpriority", "high");

    const loadFallback = () => {
      if (!allowFallback || sourceUrl === fallbackUrl) {
        resolve(fallbackUrl);
        return;
      }

      loadDecodedHeroPosterImage(fallbackUrl, revealToken, false).then(resolve);
    };

    preloadImage.onload = async () => {
      if (revealToken !== state.heroImageLoadToken) {
        resolve("");
        return;
      }

      try {
        if (typeof preloadImage.decode === "function") {
          await preloadImage.decode();
        }
      } catch {
        loadFallback();
        return;
      }

      if (revealToken !== state.heroImageLoadToken) {
        resolve("");
        return;
      }

      const intrinsicWidth = preloadImage.naturalWidth;
      const intrinsicHeight = preloadImage.naturalHeight;
      state.heroPosterAspectRatio = intrinsicHeight > 0
        ? intrinsicWidth / intrinsicHeight
        : 0;

      resolve(sourceUrl);
    };

    preloadImage.onerror = () => {
      loadFallback();
    };

    preloadImage.src = sourceUrl;

    if (preloadImage.complete) {
      window.requestAnimationFrame(() => preloadImage.onload());
    }
  });
}

function revealInitialHeroPoster() {
  const billboard = elements.heroBillboard;

  if (
    !billboard ||
    state.hasRevealedInitialHeroPoster ||
    !state.isInitialHeroPosterLoaded ||
    !document.body.classList.contains("is-ready")
  ) {
    return;
  }

  state.hasRevealedInitialHeroPoster = true;

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      document.body.classList.remove("is-preparing-hero");
      billboard.classList.remove("is-updating");
      billboard.classList.remove("is-initial-poster-loading");
      billboard.classList.add("is-initial-poster-revealing");
      elements.heroPoster.classList.add("is-loaded");

      window.clearTimeout(state.initialHeroRevealFinishTimer);
      state.initialHeroRevealFinishTimer = window.setTimeout(
        finishInitialHeroReveal,
        INITIAL_HERO_REVEAL_COMPLETE_MS
      );
    });
  });
}

function finishInitialHeroReveal() {
  if (state.hasFinishedInitialHeroReveal) return;

  state.hasFinishedInitialHeroReveal = true;
  state.initialHeroRevealFinishTimer = null;
  elements.heroBillboard?.classList.remove("is-initial-poster-revealing");

  const pendingHero = state.pendingInitialHeroTrailerMovie;
  state.pendingInitialHeroTrailerMovie = null;

  if (state.hasDeferredInitialHeroBoundarySettle) {
    state.hasDeferredInitialHeroBoundarySettle = false;
  }

  const hadPreparedInitialBoundary = finishPreparedInitialHeroMediaBoundary();
  if (!hadPreparedInitialBoundary) {
    settleHeroMediaBoundary();
  }

  if (pendingHero) {
    setupHeroTrailer(pendingHero);
  }
}

function setupHeroTrailer(movie, options = {}) {
  if (shouldDelayInitialHeroWork()) {
    state.pendingInitialHeroTrailerMovie = movie;
    return;
  }

  if (!options.skipReset) {
    stopHeroTrailer();
  }

  window.clearTimeout(state.heroStopCleanupTimer);
  state.heroStopCleanupTimer = null;

  const trailerUrl = cleanTrailerUrl(movie.trailerUrl, "");
  const video = elements.heroTrailer;
  const embed = elements.heroEmbedTrailer;
  const embedShell = elements.heroEmbedShell;
  const billboard = elements.heroBillboard;

  if (!trailerUrl || !video || !embed || !embedShell || !billboard) {
    if (billboard) {
      clearHeroTrailerState(billboard);
      billboard.classList.add("is-trailer-fallback");
    }
    return;
  }

  const trailer = getTrailerSource(trailerUrl);

  if (!trailer || trailer.type === "unsupported" || (trailer.type === "embed" && trailer.heroSafe === false)) {
    clearHeroTrailerState(billboard);
    billboard.classList.add("is-trailer-fallback");
    return;
  }

  showHeroTrailerLoading(billboard);
  const shouldHoldPoster = !state.hasCompletedInitialHeroPosterHold;
  state.hasCompletedInitialHeroPosterHold = true;

  const startHeroMedia = () => {
    if (trailer.type === "embed") {
      setupHeroEmbedTrailer(trailer, billboard, embedShell, embed);
    } else {
      setupNativeHeroTrailer(trailer, billboard, video);
    }
  };

  if (shouldHoldPoster) {
    state.heroStartTimer = window.setTimeout(startHeroMedia, INITIAL_POSTER_HOLD_MS);
    return;
  }

  startHeroMedia();
}

function setupNativeHeroTrailer(trailer, billboard, video) {
  startHeroControlSweep();
  video.hidden = false;
  video.src = trailer.url;
  video.setAttribute("aria-hidden", "true");
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.autoplay = true;
  video.loop = false;
  video.preload = "auto";
  enforceHeroControlsHidden(true);

  const restartNativeTrailerCycle = () => {
    state.heroReplayTimer = null;
    if (!video.src) return;
    if (document.hidden) {
      state.heroReplayTimer = window.setTimeout(restartNativeTrailerCycle, 1000);
      return;
    }

    try {
      video.currentTime = 0;
    } catch {
      // Some media sources may not be seekable immediately after ending.
    }

    const playPromise = video.play();

    if (playPromise && typeof playPromise.then === "function") {
      playPromise
        .then(() => {
          enforceHeroControlsHidden(true);
          prepareHeroTitleTransition();
          showHeroTrailerPlaying(billboard, "is-native-trailer");
        })
        .catch(() => markHeroTrailerFallback(billboard));
    } else {
      enforceHeroControlsHidden(true);
      prepareHeroTitleTransition();
      showHeroTrailerPlaying(billboard, "is-native-trailer");
    }
  };

  let hasRevealed = false;
  const revealNativeTrailer = () => {
    if (hasRevealed || !video.src) return;
    hasRevealed = true;

    window.clearTimeout(state.heroRevealTimer);
    const startNativePlayback = () => {
      state.heroRevealTimer = null;
      const playPromise = video.play();

      if (playPromise && typeof playPromise.then === "function") {
        playPromise
          .then(() => {
            prepareHeroTitleTransition();
            showHeroTrailerPlaying(billboard, "is-native-trailer");
          })
          .catch(() => markHeroTrailerFallback(billboard));
      } else {
        prepareHeroTitleTransition();
        showHeroTrailerPlaying(billboard, "is-native-trailer");
      }
    };

    startNativePlayback();
  };

  state.heroCanPlayHandler = revealNativeTrailer;
  state.heroErrorHandler = () => markHeroTrailerFallback(billboard);
  state.heroEndHandler = () => {
    if (!video.src) return;

    window.clearTimeout(state.heroReplayTimer);
    showHeroTrailerResting(billboard);

    state.heroReplayTimer = window.setTimeout(restartNativeTrailerCycle, HERO_POSTER_HOLD_MS);
  };

  video.addEventListener("loadeddata", state.heroCanPlayHandler, { once: true });
  video.addEventListener("canplay", state.heroCanPlayHandler, { once: true });
  video.addEventListener("loadeddata", enforceHeroControlsHidden);
  video.addEventListener("canplay", enforceHeroControlsHidden);
  video.addEventListener("play", enforceHeroControlsHidden);
  video.addEventListener("playing", enforceHeroControlsHidden);
  video.addEventListener("ended", state.heroEndHandler);
  video.addEventListener("error", state.heroErrorHandler, { once: true });
  video.load();
}

function setupHeroEmbedTrailer(trailer, billboard, embedShell, embed) {
  startHeroControlSweep();
  state.activeHeroEmbedSrc = trailer.url;
  state.activeHeroEmbedProvider = trailer.provider;
  state.heroNeedsEmbedReset = false;
  const isYouTube = trailer.provider === "youtube";

  if (state.heroEmbedLoadHandler) {
    embed.removeEventListener("load", state.heroEmbedLoadHandler);
  }

  embedShell.hidden = false;
  embedShell.classList.toggle("is-resetting", isYouTube);
  embed.hidden = false;
  embed.setAttribute("aria-hidden", "true");
  embed.setAttribute("tabindex", "-1");
  embed.setAttribute("allow", "autoplay; encrypted-media");
  embed.style.pointerEvents = "none";
  embed.blur();

  billboard.classList.toggle("is-youtube-trailer", isYouTube);
  billboard.classList.toggle("is-youtube-shorts", trailer.isShorts === true);
  billboard.classList.toggle("is-vimeo-trailer", trailer.provider === "vimeo");
  billboard.classList.toggle("is-trailer-priming", isYouTube);
  billboard.classList.toggle("is-youtube-guarded", isYouTube);
  const setupGuardCycle = isYouTube ? hideHeroYouTubeEmbedForGuard() : state.heroGuardCycle;

  window.clearTimeout(state.heroRevealTimer);
  let hasRevealed = false;
  const revealEmbed = () => {
    if (hasRevealed || !embed.src) return;
    hasRevealed = true;

    if (isYouTube) {
      revealHeroYouTubeEmbedAfterGuard(setupGuardCycle);
    } else {
      embedShell.classList.remove("is-resetting");
      prepareHeroTitleTransition();
      showHeroTrailerPlaying(billboard, "is-embed-trailer");
    }

    state.heroRevealTimer = null;
  };

  state.heroEmbedLoadHandler = () => {
    enforceHeroControlsHidden(true);
    window.clearTimeout(state.heroRevealTimer);
    revealEmbed();
  };

  embed.addEventListener("load", state.heroEmbedLoadHandler, { once: true });
  embed.src = trailer.url;
}

function markHeroTrailerFallback(billboard) {
  clearHeroTrailerState(billboard);
  billboard.classList.add("is-trailer-fallback");
  window.clearTimeout(state.heroTitleTransitionTimer);
  window.cancelAnimationFrame(state.heroTitleTransitionRaf);
  state.heroTitleTransitionTimer = null;
  state.heroTitleTransitionRaf = null;
  billboard.classList.remove("is-hero-title-transitioning");
  billboard.style.removeProperty("--hero-title-rest-height");
  billboard.style.removeProperty("--hero-title-video-height");
}

function cleanupStoppedHeroMediaSources(previousVideoSrc = "", previousEmbedSrc = "") {
  const video = elements.heroTrailer;

  if (video && previousVideoSrc && video.src === previousVideoSrc) {
    video.removeAttribute("src");
    video.hidden = true;
    video.load();
  }

  if (elements.heroEmbedShell && previousEmbedSrc && elements.heroEmbedTrailer?.src === previousEmbedSrc) {
    elements.heroEmbedShell.classList.remove("is-resetting");
    elements.heroEmbedShell.hidden = true;
  }

  const embed = elements.heroEmbedTrailer;

  if (embed && previousEmbedSrc && embed.src === previousEmbedSrc) {
    embed.hidden = true;
    embed.removeAttribute("src");
  }
}

function stopHeroTrailer() {
  window.clearTimeout(state.heroReplayTimer);
  window.clearTimeout(state.heroStartTimer);
  window.clearTimeout(state.heroRevealTimer);
  window.clearTimeout(state.heroYouTubeCommandTimer);
  window.clearTimeout(state.heroEmbedResetTimer);
  window.clearTimeout(state.heroEmbedResetFallbackTimer);
  window.clearTimeout(state.heroStopCleanupTimer);
  window.clearTimeout(state.heroTitleTransitionTimer);
  window.cancelAnimationFrame(state.heroTitleTransitionRaf);
  window.clearInterval(state.heroControlSweepTimer);
  const billboard = elements.heroBillboard;
  const wasPlaying = billboard?.classList.contains("is-video-playing") === true;
  const previousVideoSrc = elements.heroTrailer?.getAttribute("src") ? elements.heroTrailer.src : "";
  const previousEmbedSrc = elements.heroEmbedTrailer?.getAttribute("src") ? elements.heroEmbedTrailer.src : "";
  const shouldAnimateReset = wasPlaying && document.body.classList.contains("is-ready");
  state.heroReplayTimer = null;
  state.heroStartTimer = null;
  state.heroRevealTimer = null;
  state.heroYouTubeCommandTimer = null;
  state.heroEmbedResetTimer = null;
  state.heroEmbedResetFallbackTimer = null;
  state.heroStopCleanupTimer = null;
  state.heroTitleTransitionTimer = null;
  state.heroTitleTransitionRaf = null;
  state.heroControlSweepTimer = null;
  state.activeHeroEmbedSrc = "";
  state.activeHeroEmbedProvider = "";
  state.heroGuardCycle += 1;
  state.heroNeedsEmbedReset = false;

  if (elements.heroTrailer) {
    elements.heroTrailer.pause();
    if (state.heroEndHandler) {
      elements.heroTrailer.removeEventListener("ended", state.heroEndHandler);
    }
    if (state.heroCanPlayHandler) {
      elements.heroTrailer.removeEventListener("loadeddata", state.heroCanPlayHandler);
      elements.heroTrailer.removeEventListener("canplay", state.heroCanPlayHandler);
    }
    if (state.heroErrorHandler) {
      elements.heroTrailer.removeEventListener("error", state.heroErrorHandler);
    }
    elements.heroTrailer.removeEventListener("play", enforceHeroControlsHidden);
    elements.heroTrailer.removeEventListener("playing", enforceHeroControlsHidden);
    elements.heroTrailer.removeEventListener("loadeddata", enforceHeroControlsHidden);
    elements.heroTrailer.removeEventListener("canplay", enforceHeroControlsHidden);
  }

  if (elements.heroEmbedShell) {
    elements.heroEmbedShell.classList.remove("is-resetting");
  }

  if (elements.heroEmbedTrailer) {
    elements.heroEmbedTrailer.removeEventListener("load", enforceHeroControlsHidden);
    if (state.heroEmbedLoadHandler) {
      elements.heroEmbedTrailer.removeEventListener("load", state.heroEmbedLoadHandler);
    }
  }

  state.heroEndHandler = null;
  state.heroCanPlayHandler = null;
  state.heroErrorHandler = null;
  state.heroEmbedLoadHandler = null;

  if (shouldAnimateReset) {
    showHeroTrailerResting(billboard);
    state.heroStopCleanupTimer = window.setTimeout(() => {
      cleanupStoppedHeroMediaSources(previousVideoSrc, previousEmbedSrc);
      state.heroStopCleanupTimer = null;
    }, HERO_MEDIA_CROSSFADE_MS);
  } else {
    cleanupStoppedHeroMediaSources(previousVideoSrc, previousEmbedSrc);
    clearHeroTrailerState(billboard);
  }

  billboard?.style.removeProperty("--hero-title-rest-height");
  billboard?.style.removeProperty("--hero-title-video-height");
}

function getTrailerSource(rawUrl) {
  const safeInput = sanitizeTrailerInput(rawUrl);
  if (!safeInput) return null;

  if (safeInput.kind === "relative") {
    return {
      type: "video",
      provider: "local",
      url: safeInput.value,
      safeUrl: safeInput.value,
      aspect: "wide"
    };
  }

  const url = safeInput.url;

  if (isDirectVideoUrl(url)) {
    return {
      type: "video",
      provider: isFirebaseStorageUrl(url) ? "firebase" : "direct",
      url: safeInput.value,
      safeUrl: safeInput.value,
      aspect: "wide"
    };
  }

  const youtube = getYouTubeDetails(url);
  if (youtube?.id) {
    return {
      type: "embed",
      provider: "youtube",
      isShorts: youtube.isShorts,
      heroSafe: true,
      aspect: youtube.isShorts ? "vertical" : "wide",
      url: buildYouTubeEmbedUrl(youtube.id, youtube.start),
      safeUrl: safeInput.value,
      allow: "autoplay; encrypted-media; picture-in-picture"
    };
  }

  if (hostMatches(url.hostname, ["vimeo.com"])) {
    const vimeoId = extractVimeoId(url);
    if (vimeoId) {
      return {
        type: "embed",
        provider: "vimeo",
        heroSafe: true,
        aspect: "wide",
        url: buildVimeoEmbedUrl(vimeoId),
        safeUrl: safeInput.value,
        allow: "autoplay; encrypted-media; picture-in-picture"
      };
    }
  }

  const socialSource = getSocialTrailerSource(url, safeInput.value);
  if (socialSource) return socialSource;

  return {
    type: "unsupported",
    provider: "https",
    url: safeInput.value,
    safeUrl: safeInput.value,
    message: TRAILER_UNAVAILABLE_MESSAGE
  };
}

function sanitizeTrailerInput(value) {
  if (typeof value !== "string") return null;

  const cleanValue = value.trim();
  if (!cleanValue) return null;
  if (/[\u0000-\u001f\u007f<>"'\\]/.test(cleanValue)) return null;
  if (/^[a-zA-Z]:[\\/]/.test(cleanValue)) return null;
  if (/^(?:javascript|data|file|vbscript|blob):/i.test(cleanValue)) return null;

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

  const relativePath = normalizeSafeRelativeVideoPath(cleanValue);
  if (!relativePath) return null;

  return {
    kind: "relative",
    value: relativePath
  };
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

function hasUnsafeMediaInput(value) {
  const decodedValue = safeDecode(value);
  return UNSAFE_MEDIA_INPUT_PATTERN.test(value) || UNSAFE_MEDIA_INPUT_PATTERN.test(decodedValue);
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

function normalizeSafeRelativeVideoPath(value) {
  const cleanValue = value.replace(/^\.\/+/, "");
  const pathOnly = cleanValue.split(/[?#]/)[0];

  if (!SAFE_RELATIVE_VIDEO_PATH_PATTERN.test(cleanValue)) return "";
  if (!pathOnly || pathOnly.includes("//")) return "";
  if (pathOnly.split("/").some((segment) => segment === "." || segment === ".." || segment === "")) return "";

  return cleanValue;
}

function normalizeSafeRelativeImagePath(value) {
  const cleanValue = value.replace(/^\.\/+/, "");
  const pathOnly = cleanValue.split(/[?#]/)[0];

  if (!SAFE_RELATIVE_IMAGE_PATH_PATTERN.test(cleanValue)) return "";
  if (!pathOnly || pathOnly.includes("//")) return "";
  if (pathOnly.split("/").some((segment) => segment === "." || segment === ".." || segment === "")) return "";

  return cleanValue;
}

function isDirectVideoUrl(url) {
  const path = safeDecode(url.pathname).toLowerCase();
  if (TRAILER_VIDEO_EXTENSION_PATTERN.test(path)) return true;

  const encodedPath = url.pathname.toLowerCase();
  if (TRAILER_VIDEO_EXTENSION_PATTERN.test(encodedPath)) return true;

  return isFirebaseStorageUrl(url) && url.searchParams.get("alt") === "media";
}

function isTitleImageUrl(url) {
  const decodedPath = safeDecode(url.pathname).toLowerCase();
  const encodedPath = url.pathname.toLowerCase();
  return TITLE_IMAGE_EXTENSION_PATTERN.test(decodedPath) || TITLE_IMAGE_EXTENSION_PATTERN.test(encodedPath);
}

function isFirebaseStorageUrl(url) {
  return hostMatches(url.hostname, ["firebasestorage.googleapis.com", "storage.googleapis.com"])
    || url.hostname.toLowerCase().endsWith(".firebasestorage.app");
}

function getSocialTrailerSource(url, safeUrl) {
  const pinterest = getPinterestEmbedUrl(url);
  if (pinterest) {
    return {
      type: "embed",
      provider: "pinterest",
      heroSafe: false,
      aspect: "vertical",
      url: pinterest,
      safeUrl,
      allow: "autoplay; encrypted-media",
      message: SOCIAL_UNAVAILABLE_MESSAGE
    };
  }

  const instagram = getInstagramEmbedUrl(url);
  if (instagram) {
    return {
      type: "embed",
      provider: "instagram",
      heroSafe: false,
      aspect: "vertical",
      url: instagram,
      safeUrl,
      allow: "autoplay; encrypted-media; picture-in-picture",
      message: SOCIAL_UNAVAILABLE_MESSAGE
    };
  }

  const tiktok = getTikTokEmbedUrl(url);
  if (tiktok) {
    return {
      type: "embed",
      provider: "tiktok",
      heroSafe: false,
      aspect: "vertical",
      url: tiktok,
      safeUrl,
      allow: "autoplay; encrypted-media; picture-in-picture",
      message: SOCIAL_UNAVAILABLE_MESSAGE
    };
  }

  if (isKnownSocialHost(url.hostname)) {
    return {
      type: "unsupported",
      provider: "social",
      url: safeUrl,
      safeUrl,
      message: SOCIAL_UNAVAILABLE_MESSAGE
    };
  }

  return null;
}

function getPinterestEmbedUrl(url) {
  if (!hostMatches(url.hostname, ["pinterest.com", "pinterest.co.uk", "pin.it"])) return "";

  const parts = url.pathname.split("/").filter(Boolean);
  const pinIndex = parts.indexOf("pin");
  const pinId = pinIndex >= 0 ? parts[pinIndex + 1] : parts.find((part) => /^\d{6,}$/.test(part));

  return pinId && /^\d{6,}$/.test(pinId)
    ? `https://assets.pinterest.com/ext/embed.html?id=${encodeURIComponent(pinId)}`
    : "";
}

function getInstagramEmbedUrl(url) {
  if (!hostMatches(url.hostname, ["instagram.com"])) return "";

  const parts = url.pathname.split("/").filter(Boolean);
  const type = ["p", "reel", "tv"].includes(parts[0]) ? parts[0] : "";
  const shortcode = parts[1] || "";

  return type && /^[a-zA-Z0-9_-]{5,64}$/.test(shortcode)
    ? `https://www.instagram.com/${type}/${shortcode}/embed`
    : "";
}

function getTikTokEmbedUrl(url) {
  if (!hostMatches(url.hostname, ["tiktok.com"])) return "";

  const parts = url.pathname.split("/").filter(Boolean);
  const videoIndex = parts.indexOf("video");
  const id = videoIndex >= 0 ? parts[videoIndex + 1] : url.searchParams.get("item_id");

  return id && /^\d{6,32}$/.test(id)
    ? `https://www.tiktok.com/embed/v2/${id}`
    : "";
}

function isKnownSocialHost(hostname) {
  return hostMatches(hostname, [
    "facebook.com",
    "instagram.com",
    "tiktok.com",
    "twitter.com",
    "x.com",
    "threads.net",
    "pinterest.com",
    "pin.it",
    "reddit.com",
    "linkedin.com",
    "snapchat.com"
  ]);
}

function getYouTubeDetails(url) {
  const host = normalizeHost(url.hostname);
  let id = null;
  let isShorts = false;

  if (host === "youtu.be") {
    id = sanitizeYouTubeId(url.pathname.slice(1));
  }

  if (hostMatches(host, ["youtube.com", "youtube-nocookie.com"])) {
    if (url.pathname.startsWith("/shorts/")) {
      id = sanitizeYouTubeId(url.pathname.split("/")[2]);
      isShorts = true;
    } else if (url.pathname.startsWith("/embed/")) {
      id = sanitizeYouTubeId(url.pathname.split("/")[2]);
    } else if (url.pathname.startsWith("/live/")) {
      id = sanitizeYouTubeId(url.pathname.split("/")[2]);
    } else if (url.searchParams.has("v")) {
      id = sanitizeYouTubeId(url.searchParams.get("v"));
    }
  }

  if (!id) return null;

  return {
    id,
    isShorts,
    start: getYouTubeStartTime(url)
  };
}

function getYouTubeStartTime(url) {
  const rawStart = url.searchParams.get("start") || url.searchParams.get("t");
  if (!rawStart) return 0;

  if (/^\d+$/.test(rawStart)) {
    return Number(rawStart);
  }

  const match = rawStart.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?/i);
  if (!match) return 0;

  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);
  return (hours * 3600) + (minutes * 60) + seconds;
}

function buildYouTubeEmbedUrl(videoId, start = 0) {
  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    controls: "0",
    modestbranding: "1",
    rel: "0",
    showinfo: "0",
    playsinline: "1",
    disablekb: "1",
    fs: "0",
    autohide: "1",
    html5: "1",
    enablejsapi: "1",
    iv_load_policy: "3",
    cc_load_policy: "0",
    loop: "1",
    playlist: videoId
  });

  if (/^https?:/.test(window.location.origin)) {
    params.set("origin", window.location.origin);
    params.set("widget_referrer", window.location.origin);
  }

  if (start > 0) {
    params.set("start", String(start));
  }

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

function extractVimeoId(url) {
  const parts = url.pathname.split("/").filter(Boolean);
  const videoIndex = parts.indexOf("video");
  const id = videoIndex >= 0 ? parts[videoIndex + 1] : parts.find((part) => /^\d+$/.test(part));
  return id && /^\d+$/.test(id) ? id : null;
}

function buildVimeoEmbedUrl(videoId) {
  const params = new URLSearchParams({
    background: "1",
    autoplay: "1",
    muted: "1",
    loop: "1",
    controls: "0",
    title: "0",
    byline: "0",
    portrait: "0",
    dnt: "1"
  });

  return `https://player.vimeo.com/video/${videoId}?${params.toString()}`;
}

function sanitizeYouTubeId(id) {
  if (!id) return null;
  const cleanId = id.trim();
  return /^[a-zA-Z0-9_-]{6,20}$/.test(cleanId) ? cleanId : null;
}

function hostMatches(hostname, domains) {
  const host = normalizeHost(hostname);
  return domains.some((domain) => host === domain || host.endsWith(`.${domain}`));
}

function normalizeHost(hostname) {
  return String(hostname || "").toLowerCase().replace(/^(?:www\.|m\.)/, "");
}

function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function renderRows(rowKeys = null) {
  if (!elements.rowsRoot) return;
  hideTitleCardHover();

  if (Array.isArray(rowKeys)) {
    const definitions = [...new Set(rowKeys)]
      .map((rowKey) => rowDefinitions.find((definition) => definition.key === rowKey))
      .filter(Boolean);

    if (definitions.length === 0) return;

    for (const definition of definitions) {
      const currentRow = document.getElementById(getRowId(definition.key));

      if (!currentRow || !currentRow.parentElement) {
        renderRows();
        return;
      }

      currentRow.replaceWith(createMovieRow(definition));
    }
  } else {
    const rows = rowDefinitions.map((definition) => createMovieRow(definition));
    elements.rowsRoot.replaceChildren(...rows);
  }

  if (elements.titleSearch?.value) {
    filterRenderedCards(elements.titleSearch.value);
  }

  settleHeroMediaBoundary();
}

function createMovieRow(definition) {
  const section = createElement("section", `movie-row${definition.ranked ? " ranked-row" : ""}${definition.key === "continue" ? " continue-row" : ""}`);
  section.id = getRowId(definition.key);
  section.classList.toggle("single-page-row", definition.singlePage === true);

  const header = createElement("div", "row-header");
  const title = createElement("h2", "row-title", definition.title);
  const indicators = createElement("div", "row-indicators");
  indicators.setAttribute("aria-hidden", "true");

  const viewport = createElement("div", "row-viewport");
  const prevButton = createSliderHandle("handle handlePrev", "Previous", "‹");
  const nextButton = createSliderHandle("handle handleNext active", "Next", "›");

  header.append(title, indicators);

  const track = createElement("div", "row-track");
  track.setAttribute("aria-label", definition.title);

  const movies = selectMoviesForRow(definition);
  movies.forEach((movie, index) => {
    track.appendChild(createTitleCard(movie, definition.ranked, index + 1, definition.key));
  });

  if (definition.singlePage) {
    prevButton.hidden = true;
    nextButton.hidden = true;
    indicators.hidden = true;
  }

  prevButton.addEventListener("click", () => {
    if (definition.singlePage) return;
    track.scrollBy({ left: -getRowScrollAmount(track), behavior: "smooth" });
  });

  nextButton.addEventListener("click", () => {
    if (definition.singlePage) return;
    track.scrollBy({ left: getRowScrollAmount(track), behavior: "smooth" });
  });

  prevButton.addEventListener("keydown", (event) => {
    handleSliderKeydown(event, track, -1);
  });

  nextButton.addEventListener("keydown", (event) => {
    handleSliderKeydown(event, track, 1);
  });

  track.addEventListener("scroll", () => {
    positionActiveTitleCardHover();
    if (!definition.singlePage) {
      updateRowControls(section, track, prevButton, nextButton, indicators);
    }
  }, { passive: true });
  window.addEventListener("resize", () => {
    if (!definition.singlePage) {
      updateRowControls(section, track, prevButton, nextButton, indicators);
    }
  }, { passive: true });

  viewport.append(prevButton, track, nextButton);
  section.append(header, viewport);
  window.requestAnimationFrame(() => {
    if (!definition.singlePage) {
      updateRowControls(section, track, prevButton, nextButton, indicators);
    }
  });
  return section;
}

function createSliderHandle(className, label, icon) {
  const handle = createElement("span", className);
  const indicator = document.createElementNS("http://www.w3.org/2000/svg", "svg");
indicator.classList.add("indicator-icon");
indicator.setAttribute("viewBox", "0 0 24 24");
indicator.setAttribute("aria-hidden", "true");

const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
path.setAttribute(
  "d",
  icon === "‹"
    ? "M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"
    : "M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"
);

indicator.appendChild(path);
  handle.setAttribute("role", "button");
  handle.setAttribute("aria-label", label);
  handle.tabIndex = 0;
  handle.appendChild(indicator);
  return handle;
}

function getRowScrollAmount(track) {
  return track.clientWidth * 0.8;
}

function handleSliderKeydown(event, track, direction) {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  track.scrollBy({ left: getRowScrollAmount(track) * direction, behavior: "smooth" });
}

function updateRowControls(section, track, prevButton, nextButton, indicators) {
  const maxScroll = Math.max(track.scrollWidth - track.clientWidth, 0);
  const hasOverflow = maxScroll > 6;
  section.classList.toggle("has-overflow", hasOverflow);

  const atStart = track.scrollLeft <= 8;
  const atEnd = track.scrollLeft >= maxScroll - 8;
  const showPrev = hasOverflow && !atStart;
  const showNext = hasOverflow && !atEnd;

  prevButton.hidden = !showPrev;
  nextButton.hidden = !showNext;
  prevButton.classList.toggle("active", showPrev);
  nextButton.classList.toggle("active", showNext);
  prevButton.tabIndex = showPrev ? 0 : -1;
  nextButton.tabIndex = showNext ? 0 : -1;

  const pageCount = hasOverflow ? Math.min(7, Math.max(2, Math.ceil(track.scrollWidth / Math.max(track.clientWidth, 1)))) : 0;
  syncIndicators(indicators, pageCount, track, maxScroll);

  const currentPage = maxScroll > 0 && pageCount > 1
    ? Math.min(pageCount - 1, Math.round((track.scrollLeft / maxScroll) * (pageCount - 1)))
    : 0;

  Array.from(indicators.children).forEach((indicator, index) => {
    indicator.classList.toggle("is-active", index === currentPage);
  });
}

function syncIndicators(indicators, pageCount, track, maxScroll) {
  while (indicators.children.length > pageCount) {
    indicators.lastElementChild.remove();
  }

  while (indicators.children.length < pageCount) {
    const indicator = createElement("button", "row-indicator");
    indicator.type = "button";
    indicator.tabIndex = -1;
    indicator.addEventListener("click", () => {
      const index = Array.from(indicators.children).indexOf(indicator);
      const currentCount = indicators.children.length;
      const currentMaxScroll = Math.max(track.scrollWidth - track.clientWidth, 0);
      const target = currentCount > 1 ? currentMaxScroll * (index / (currentCount - 1)) : 0;
      track.scrollTo({ left: target, behavior: "smooth" });
    });
    indicators.appendChild(indicator);
  }
}

function selectMoviesForRow(definition) {
  const cloud = getCloudMatches(definition.key);

  if (definition.key === "myList") {
    const staticMovies = getMyListMovies().slice(0, definition.limit);
    return insertRankedCloudMovies(staticMovies, cloud);
  }

  const fallback = fallbackMovies.filter((movie) => movie.rows.includes(definition.key));
  const filler = fallbackMovies.filter((movie) => !movie.rows.includes(definition.key));
  const staticMovies = uniqueMovies([...fallback, ...filler]).slice(0, definition.limit);

  const movies = insertRankedCloudMovies(staticMovies, cloud);

  if (definition.singlePage) {
    return movies.slice(0, definition.pageSize || FIRST_ROW_SINGLE_PAGE_SIZE);
  }

  return movies;
}

function getCloudMatches(key) {
  const placement = AFTER_PLACEMENT_BY_ROW_KEY[key];

  if (!placement) {
    return [];
  }

  return sortMoviesByRank(
    state.cloudMovies.filter((movie) => normalizeMoviePlacements(movie.placements, movie.placement).includes(placement))
  );
}

function insertRankedCloudMovies(staticMovies, cloudMovies) {
  const row = uniqueMovies(staticMovies).map((movie) => ({ type: "static", movie }));
  const rankedCloud = sortMoviesByRank(uniqueMovies(cloudMovies)).map((movie) => ({ type: "cloud", movie }));

  rankedCloud.forEach((item) => {
    const rank = getMovieSortRank(item.movie);
    const targetIndex = rank === 999 ? row.length : Math.min(Math.max(rank - 1, 0), row.length);
    let insertIndex = targetIndex;

    while (
      insertIndex < row.length &&
      row[insertIndex].type === "cloud" &&
      getMovieSortRank(row[insertIndex].movie) === rank
    ) {
      insertIndex += 1;
    }

    row.splice(insertIndex, 0, item);
  });

  return row.map((item) => item.movie);
}

function getMyListMovies() {
  const fallbackList = fallbackMovies.filter((movie) => movie.rows.includes("myList"));
  return state.myList.length > 0 ? uniqueMovies([...state.myList, ...fallbackList]) : fallbackList;
}

function getMyListPageMovies() {
  return getMyListMovies().filter((movie) => !state.myListPageRemovedKeys.has(getMyListMovieKey(movie)));
}

function getMyListMovieKey(movie) {
  return String(movie?.firestoreId || movie?.id || movie?.title || "");
}

function isMovieInMyList(movie) {
  const movieKey = getMyListMovieKey(movie);
  if (!movieKey || state.myListPageRemovedKeys.has(movieKey)) return false;
  return getMyListMovies().some((item) => getMyListMovieKey(item) === movieKey);
}

function updateMyListToggleControl(button) {
  const movie = button?._myListMovie;
  if (!movie) return;

  const inMyList = isMovieInMyList(movie);
  const action = inMyList ? "Remove from My List" : "Add to My List";
  const displayTitle = getMovieTitleDisplayText(movie);
  const tooltip = button.closest(".card-action-tooltip-shell")?.querySelector(".card-action-tooltip");

  button.classList.toggle("is-in-my-list", inMyList);
  button.setAttribute("aria-label", `${action}: ${displayTitle}`);
  button.setAttribute("aria-pressed", String(inMyList));

  if (tooltip) {
    tooltip.textContent = action;
  }
}

function syncMyListToggleControls(movieKey = "") {
  document.querySelectorAll(".my-list-toggle-action").forEach((button) => {
    if (movieKey && button.dataset.myListKey !== movieKey) return;
    updateMyListToggleControl(button);
  });
}

function getMyListRemovalStorageKey() {
  return state.currentUser?.uid
    ? `${MY_LIST_REMOVAL_STORAGE_PREFIX}:${state.currentUser.uid}`
    : "";
}

function loadMyListPageRemovedKeys() {
  const storageKey = getMyListRemovalStorageKey();

  if (!storageKey) {
    state.myListPageRemovedKeys = new Set();
    return;
  }

  try {
    const savedKeys = JSON.parse(window.localStorage.getItem(storageKey) || "[]");
    state.myListPageRemovedKeys = new Set(Array.isArray(savedKeys) ? savedKeys.filter(Boolean).map(String) : []);
  } catch (error) {
    console.warn("My List removal preferences unavailable:", error.message);
    state.myListPageRemovedKeys = new Set();
  }
}

function persistMyListPageRemovedKeys() {
  const storageKey = getMyListRemovalStorageKey();
  if (!storageKey) return;

  try {
    window.localStorage.setItem(storageKey, JSON.stringify([...state.myListPageRemovedKeys]));
  } catch (error) {
    console.warn("Could not save My List removal preferences:", error.message);
  }
}

function createTitleCard(movie, ranked, rankNumber, rowKey, options = {}) {
  const isMyListPageCard = options.isMyListPageCard === true;
  const displayTitle = getMovieTitleDisplayText(movie);
  const card = createElement("article", `title-card${ranked ? " ranked-card" : ""}`);
  card.dataset.title = `${displayTitle} ${movie.category} ${movie.year}`.toLowerCase();

  if (ranked) {
    const number = createElement("span", "rank-number", String(rankNumber));
    card.appendChild(number);
  }

  const visual = createElement("button", "card-visual");
  visual.type = "button";
  visual.setAttribute("aria-label", `More info about ${displayTitle}`);

  const image = document.createElement("img");
  image.src = cleanImageUrl(movie.posterUrl, FALLBACK_ARTWORK);
  image.alt = `${displayTitle} artwork`;
  image.loading = "lazy";
  image.referrerPolicy = "no-referrer";
  image.addEventListener("error", () => {
    card.classList.add("image-failed");
  });

  visual.append(image);

  getMovieBadgeLabels(movie).forEach((badgeText, index) => {
    const badge = createElement("span", "status-badge", badgeText);
    if (index > 0) {
      badge.style.top = `${8 + (index * 24)}px`;
    }
    visual.appendChild(badge);
  });

  const progressBar = rowKey === "continue"
    ? createProgressBar(movie.progress || 12)
    : null;
  const hoverPanel = createHoverPanel(movie, { isMyListPageCard });

  visual.addEventListener("click", () => openTitleModal(movie));

  const hoverSurface = ranked ? createElement("div", "ranked-card-media") : card;

  hoverSurface.append(visual);
  if (progressBar) {
    hoverSurface.appendChild(progressBar);
  }
  hoverSurface.appendChild(hoverPanel);

  if (ranked) {
    card.appendChild(hoverSurface);
  }

  return card;
}

function bindTitleCardHoverState() {
  [elements.rowsRoot, elements.myListGrid].filter(Boolean).forEach((root) => {
    root.addEventListener("pointerover", handleTitleCardPointerOver);
    root.addEventListener("pointerout", handleTitleCardPointerOut);
    root.addEventListener("pointerleave", hideTitleCardHover);
    root.addEventListener("focusin", handleTitleCardFocusIn);
    root.addEventListener("focusout", handleTitleCardFocusOut);
  });

  document.addEventListener("pointermove", handleTitleCardPointerMove, { passive: true });
  document.addEventListener("pointerdown", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target?.closest(".title-card")) {
      hideTitleCardHover();
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      hideTitleCardHover();
    }
  });
  window.addEventListener("blur", hideTitleCardHover);
}

function getEventTitleCard(event) {
  const root = event.currentTarget;
  const target = event.target instanceof Element ? event.target : null;
  const card = target?.closest(".title-card");

  if (!card || !(root instanceof Element) || !root.contains(card) || card.classList.contains("is-filtered")) {
    return null;
  }

  return card;
}

function handleTitleCardPointerOver(event) {
  const card = getEventTitleCard(event);
  if (!card || card === state.activeHoverCard) return;

  const relatedTarget = event.relatedTarget instanceof Element ? event.relatedTarget : null;
  if (relatedTarget && card.contains(relatedTarget)) return;

  showTitleCardHover(card);
}

function handleTitleCardPointerOut(event) {
  const card = getEventTitleCard(event);
  if (!card || card !== state.activeHoverCard) return;

  const relatedTarget = event.relatedTarget instanceof Element ? event.relatedTarget : null;
  if (relatedTarget && card.contains(relatedTarget)) return;
  if (isPointInsideTitleCardHover(card, event.clientX, event.clientY)) return;

  scheduleHideTitleCardHover(card);
}

function handleTitleCardPointerMove(event) {
  if (window.matchMedia("(max-width: 860px)").matches) {
    hideTitleCardHover();
    return;
  }

  const target = event.target instanceof Element
    ? event.target
    : document.elementFromPoint(event.clientX, event.clientY);
  const card = target?.closest(".title-card");

  if (card && !card.classList.contains("is-filtered")) {
    if (card !== state.activeHoverCard) {
      showTitleCardHover(card);
    }
    return;
  }

  if (
    state.activeHoverCard &&
    !isPointInsideTitleCardHover(state.activeHoverCard, event.clientX, event.clientY)
  ) {
    hideTitleCardHover();
  }
}

function handleTitleCardFocusIn(event) {
  const card = getEventTitleCard(event);
  if (card) {
    showTitleCardHover(card);
  }
}

function handleTitleCardFocusOut(event) {
  const card = getEventTitleCard(event);
  if (!card) return;

  window.setTimeout(() => {
    if (!card.contains(document.activeElement)) {
      scheduleHideTitleCardHover(card);
    }
  }, 0);
}

function alignTitleCardHover(card) {
  if (window.matchMedia("(max-width: 860px)").matches) {
    resetTitleCardHover(card);
    return;
  }

  const track = card.closest(".row-track");
  const row = card.closest(".movie-row");
  const trackRect = track?.getBoundingClientRect();
  const cardRect = card.getBoundingClientRect();
  const styles = window.getComputedStyle(card);
  const scale = Number.parseFloat(styles.getPropertyValue("--card-hover-scale")) || 1.18;
  let layoutWidth = card.offsetWidth || cardRect.width;
  let layoutLeft = track
    ? trackRect.left + card.offsetLeft - track.scrollLeft
    : cardRect.left;

  if (card.classList.contains("ranked-card")) {
    const media = card.querySelector(".ranked-card-media");

    if (media) {
      const mediaWidth = media.offsetWidth || media.getBoundingClientRect().width || layoutWidth;
      const rankedHoverWidth = resolveCssLength(card, "var(--ranked-hover-width)", mediaWidth);
      const rankedHoverSpread = resolveCssLength(
        card,
        "var(--ranked-hover-spread)",
        Math.max((rankedHoverWidth - mediaWidth) / 2, 0)
      );
      const rankedNumberWidth = resolveCssLength(
        card,
        "var(--ranked-number-width)",
        media.offsetLeft || 0
      );

      layoutWidth = rankedHoverWidth;
      layoutLeft = (track
        ? trackRect.left + card.offsetLeft - track.scrollLeft
        : cardRect.left) + rankedNumberWidth - rankedHoverSpread;
    }
  }
  const safeLeft = Math.max(trackRect?.left ?? 0, 8);
  const safeRight = Math.min(trackRect?.right ?? window.innerWidth, window.innerWidth - 8);
  const expandedWidth = layoutWidth * scale;
  const expandedLeft = layoutLeft + ((layoutWidth - expandedWidth) / 2);
  const expandedRight = expandedLeft + expandedWidth;
  let shift = 0;

  if (expandedLeft < safeLeft) {
    shift = safeLeft - expandedLeft;
  }

  if (expandedRight + shift > safeRight) {
    shift = safeRight - expandedRight;
  }

  if (row) {
    window.clearTimeout(row.hoverResetTimer);
    row.hoverResetTimer = null;
  }
  card.style.setProperty("--hover-shift-x", `${Math.round(shift)}px`);
  row?.classList.add("is-hovering-card");
}

function isPointInsideTitleCardHover(card, x, y) {
  if (!card || !Number.isFinite(x) || !Number.isFinite(y)) return false;

  const hoverElements = [
    card,
    card.querySelector(".ranked-card-media"),
    card.querySelector(".card-visual"),
    card.querySelector(".card-hover-panel")
  ].filter(Boolean);

  return hoverElements.some((element) => {
    const rect = element.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  });
}

function showTitleCardHover(card) {
  if (!card || window.matchMedia("(max-width: 860px)").matches) {
    hideTitleCardHover();
    return;
  }

  if (state.activeHoverCard === card) {
    alignTitleCardHover(card);
    return;
  }

  clearTitleCardHoverState();

  state.activeHoverCard = card;
  alignTitleCardHover(card);
  card.classList.add("is-hovering-preview");
  card.closest(".movie-row")?.classList.add("is-hovering-card");
}

function scheduleHideTitleCardHover(card) {
  clearTitleCardHoverState(card);
}

function hideTitleCardHover() {
  clearTitleCardHoverState();
}

function clearTitleCardHoverState(cardToClear = null) {
  window.clearTimeout(state.cardHoverHideTimer);
  state.cardHoverHideTimer = null;

  const cards = cardToClear
    ? [cardToClear]
    : Array.from(document.querySelectorAll(".title-card.is-hovering-preview"));

  cards.forEach((card) => {
    card.classList.remove("is-hovering-preview");
    resetTitleCardHover(card);
  });

  if (!cardToClear && state.activeHoverCard && !cards.includes(state.activeHoverCard)) {
    state.activeHoverCard.classList.remove("is-hovering-preview");
    resetTitleCardHover(state.activeHoverCard);
  }

  if (!cardToClear || state.activeHoverCard === cardToClear) {
    state.activeHoverCard = null;
  }
}

function positionActiveTitleCardHover() {
  hideTitleCardHover();
}

function resolveCssLength(element, cssValue, fallback) {
  const probe = document.createElement("span");
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.pointerEvents = "none";
  probe.style.width = cssValue;
  probe.style.height = "0";
  probe.style.padding = "0";
  probe.style.border = "0";

  element.appendChild(probe);
  const width = probe.getBoundingClientRect().width;
  probe.remove();

  return Number.isFinite(width) && width > 0 ? width : fallback;
}

function resetTitleCardHover(card) {
  card.style.removeProperty("--hover-shift-x");
  const row = card.closest(".movie-row");
  if (!row) return;

  window.clearTimeout(row.hoverResetTimer);
  row.hoverResetTimer = null;

  if (!row.querySelector(".title-card.is-hovering-preview")) {
    row.classList.remove("is-hovering-card");
  }
}

function createProgressBar(progress) {
  const track = createElement("span", "progress-track");
  const fill = createElement("span", "progress-fill");
  fill.style.width = `${Math.min(Math.max(Number(progress) || 0, 5), 96)}%`;
  track.appendChild(fill);
  return track;
}

function getMovieBadgeLabels(movie) {
  return normalizeMovieBadges(movie?.badges)
    .filter((badge) => badge !== HERO_LOGO_BADGE)
    .map((badge) => MOVIE_BADGE_LABELS.get(badge))
    .filter(Boolean);
}

function createHoverPanel(movie, options = {}) {
  const panel = createElement("div", "card-hover-panel");
  const actionRow = createElement("div", "card-action-row");
  const displayTitle = getMovieTitleDisplayText(movie);

  const playButton = createIconButton("mini-action play-mini", `Play ${displayTitle}`, "M6 4.75v14.5c0 .83.91 1.34 1.62.91l11.58-7.25a1.07 1.07 0 0 0 0-1.82L7.62 3.84A1.07 1.07 0 0 0 6 4.75z");
  playButton.addEventListener("click", (event) => {
    event.stopPropagation();
    playMovie(movie);
  });

  const listControl = options.isMyListPageCard
    ? createMyListRemoveControl(movie)
    : createAddToMyListControl(movie);

  const likeButton = createOutlinedIconButton(
    "mini-action",
    `Like ${displayTitle}`,
    getMainThumbsUpOutlinePaths(),
    { className: "thumb-outline-icon", strokeWidth: "1.65" }
  );
  likeButton.addEventListener("click", (event) => {
    event.stopPropagation();
    showToast(`Liked ${displayTitle}.`);
  });
  const likeControl = createLikeReactionControl(movie, likeButton);

  const infoButton = createIconButton("mini-action mini-action-info", `More info about ${displayTitle}`, "M6.35 8.65 12 14.3l5.65-5.65 1.4 1.4L12 17.1 4.95 10.05z");
  infoButton.addEventListener("click", (event) => {
    event.stopPropagation();
    openTitleModal(movie);
  });

  actionRow.append(playButton, listControl, likeControl, infoButton);

  const title = createElement("p", "card-meta-title", displayTitle);
  const meta = createElement("div", "card-meta-line");
  meta.append(
    createElement("span", "maturity-pill", movie.rating),
    createElement("span", "", movie.year),
    createElement("span", "", movie.duration || "HD"),
    createElement("span", "", movie.category)
  );

  const genres = createElement("div", "card-genre-line");
  getGenreTags(movie).forEach((tag) => {
    genres.appendChild(createElement("span", "", tag));
  });

  panel.append(actionRow, title, meta, genres);
  return panel;
}

function createAddToMyListControl(movie) {
  const movieKey = getMyListMovieKey(movie);
  const listButton = createElement("button", "mini-action add-to-list-action my-list-toggle-action");
  const plusIcon = createOutlinedSvgIcon(getAddToListPlusOutlinePaths(), { strokeWidth: "1.4" });
  const checkIcon = createSvgIcon(MY_LIST_CHECK_ICON_PATH);

  listButton.type = "button";
  listButton.dataset.myListKey = movieKey;
  listButton._myListMovie = movie;
  plusIcon.classList.add("my-list-toggle-plus");
  checkIcon.classList.add("my-list-toggle-check");
  listButton.append(plusIcon, checkIcon);

  const shell = createActionTooltipControl(listButton, "Add to My List");
  updateMyListToggleControl(listButton);

  listButton.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (listButton.disabled) return;

    listButton.classList.add("is-updating");

    if (isMovieInMyList(movie)) {
      await removeFromMyList(movie, listButton, { animateCard: false });
    } else {
      listButton.disabled = true;
      await addToMyList(movie);
    }

    listButton.disabled = false;
    listButton.classList.remove("is-updating");
    syncMyListToggleControls(movieKey);
  });

  return shell;
}

function createActionTooltipControl(button, tooltipText) {
  const shell = createElement("span", "card-action-tooltip-shell");
  const tooltip = createElement("span", "card-action-tooltip", tooltipText);
  const tooltipId = `card-action-tooltip-${Math.random().toString(36).slice(2)}`;

  tooltip.id = tooltipId;
  tooltip.setAttribute("role", "tooltip");
  button.setAttribute("aria-describedby", tooltipId);

  shell.append(button, tooltip);
  return shell;
}

function createLikeReactionControl(movie, button) {
  const shell = createActionTooltipControl(button, "Like this");
  const displayTitle = getMovieTitleDisplayText(movie);
  shell.classList.add("like-reaction-shell");

  const flyout = createElement("span", "like-reaction-flyout");
  flyout.setAttribute("aria-label", "Reaction options");

  const dislikeButton = createReactionOption(
    "Thumbs Down",
    createThumbReactionIcon("down"),
    "Not for me",
    () => showToast(`Not for me: ${displayTitle}.`)
  );
  dislikeButton.classList.add("thumb-reaction-option");

  const thumbsUpButton = createReactionOption(
    "Thumbs Up",
    createThumbReactionIcon("up"),
    "I Like this",
    () => showToast(`Liked ${displayTitle}.`)
  );
  thumbsUpButton.classList.add("thumb-reaction-option");

  const loveButton = createReactionOption(
    "Love This!",
    createHeartReactionIcon(),
    "Love This!",
    () => showToast(`Loved ${displayTitle}.`)
  );

  flyout.append(dislikeButton, thumbsUpButton, loveButton);
  shell.appendChild(flyout);
  return shell;
}

function createReactionOption(ariaLabel, icon, tooltipText, onSelect) {
  const button = createElement("button", "mini-action like-reaction-option");
  const tooltip = createElement("span", "like-reaction-tooltip", tooltipText);
  const tooltipId = `like-reaction-tooltip-${Math.random().toString(36).slice(2)}`;

  button.type = "button";
  button.setAttribute("aria-label", ariaLabel);
  button.setAttribute("aria-describedby", tooltipId);
  button.setAttribute("aria-pressed", "false");
  tooltip.id = tooltipId;
  tooltip.setAttribute("role", "tooltip");

  button.append(typeof icon === "string" ? createSvgIcon(icon) : icon, tooltip);
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    button.parentElement?.querySelectorAll(".like-reaction-option").forEach((option) => {
      const isSelected = option === button;
      option.classList.toggle("is-selected", isSelected);
      option.setAttribute("aria-pressed", String(isSelected));
    });
    onSelect?.();
  });
  return button;
}

function createOutlinedIconButton(className, ariaLabel, pathDs, options = {}) {
  const button = createElement("button", className);
  button.type = "button";
  button.setAttribute("aria-label", ariaLabel);
  button.appendChild(createOutlinedSvgIcon(pathDs, options));
  return button;
}

function createOutlinedSvgIcon(pathDs, options = {}) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", "15");
  svg.setAttribute("height", "15");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  if (options.className) {
    svg.classList.add(options.className);
  }

  pathDs.forEach((pathD) => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathD);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", options.strokeWidth || "2");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    if (options.transform) {
      path.setAttribute("transform", options.transform);
    }
    svg.appendChild(path);
  });

  return svg;
}

function getAddToListPlusOutlinePaths() {
  return [
    "M12 5v14",
    "M5 12h14"
  ];
}

function getMainThumbsUpOutlinePaths() {
  return getLoweredThumbsUpOutlinePaths();
}

function getLoweredThumbsUpOutlinePaths() {
  return [
    "M14.8 5.9c-.07 1.32-.4 2.68-.95 4.1h4.9c.99 0 1.77.76 1.8 1.73.02.57-.25 1.1-.69 1.43.49.32.69.94.47 1.49-.17.43-.54.75-.98.87.32.38.36.92.1 1.35-.25.4-.72.62-1.19.53.39.46.84 1.24.75 1.95a1.78 1.78 0 0 1-1.71 1.28H5.15a1.78 1.78 0 0 1-1.78-1.78v-6.92a1.78 1.78 0 0 1 1.78-1.78h2.42c.7 0 1.34-.39 1.66-1.01 1-1.66 1.92-3.41 2.6-5.14.3-.76 1.19-1.18 1.95-.92.88.31 1.3 1.3 1.02 2.72Z"
  ];
}

function getLoweredThumbsDownOutlinePaths() {
  return [
    "M14.8 18.1c-.07-1.32-.4-2.68-.95-4.1h4.9c.99 0 1.77-.76 1.8-1.73.02-.57-.25-1.1-.69-1.43.49-.32.69-.94.47-1.49-.17-.43-.54-.75-.98-.87.32-.38.36-.92.1-1.35-.25-.4-.72-.62-1.19-.53.39-.46.84-1.24.75-1.95a1.78 1.78 0 0 0-1.71-1.28H5.15a1.78 1.78 0 0 0-1.78 1.78v6.92a1.78 1.78 0 0 0 1.78 1.78h2.42c.7 0 1.34.39 1.66 1.01 1 1.66 1.92 3.41 2.6 5.14.3.76 1.19 1.18 1.95.92.88-.31 1.3-1.3 1.02-2.72Z"
  ];
}

function createThumbReactionIcon(direction) {
  const paths = direction === "down"
    ? getLoweredThumbsDownOutlinePaths()
    : getLoweredThumbsUpOutlinePaths();

  return createOutlinedSvgIcon(paths, {
    className: "thumb-outline-icon",
    strokeWidth: "2.15"
  });
}

function createHeartReactionIcon() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", "18");
  svg.setAttribute("height", "18");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  svg.classList.add("heart-reaction-icon");

  const heart = document.createElementNS("http://www.w3.org/2000/svg", "path");
  heart.setAttribute("d", "M12 20.35C8.12 16.98 3.15 13.62 3.15 8.95c0-2.48 1.92-4.35 4.28-4.35 1.78 0 3.35 1 4.07 2.42.72-1.42 2.29-2.42 4.07-2.42 2.36 0 4.28 1.87 4.28 4.35 0 4.67-4.97 8.03-7.85 11.4z");
  heart.setAttribute("fill", "none");
  heart.setAttribute("stroke", "currentColor");
  heart.setAttribute("stroke-width", "2.15");
  heart.setAttribute("stroke-linecap", "round");
  heart.setAttribute("stroke-linejoin", "round");

  svg.appendChild(heart);
  return svg;
}

function createMyListRemoveControl(movie) {
  const shell = createElement("span", "my-list-remove-shell");
  const tooltip = createElement("span", "my-list-remove-tooltip", "Remove from My List");
  const tooltipId = `my-list-remove-tooltip-${Math.random().toString(36).slice(2)}`;
  const displayTitle = getMovieTitleDisplayText(movie);
  tooltip.id = tooltipId;
  tooltip.setAttribute("role", "tooltip");

  const button = createIconButton("mini-action my-list-remove-action", `Remove ${displayTitle} from My List`, MY_LIST_CHECK_ICON_PATH);
  button.setAttribute("aria-describedby", tooltipId);
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    removeFromMyList(movie, button);
  });

  shell.append(button, tooltip);
  return shell;
}

function createIconButton(className, ariaLabel, pathD) {
  const button = createElement("button", className);
  button.type = "button";
  button.setAttribute("aria-label", ariaLabel);
  button.appendChild(createSvgIcon(pathD));
  return button;
}

function createSvgIcon(pathD) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", "18");
  svg.setAttribute("height", "18");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("fill", "currentColor");
  path.setAttribute("d", pathD);
  svg.appendChild(path);
  return svg;
}

function getGenreTags(movie) {
  const category = cleanText(movie.category, "Drama", 80);
  const lower = category.toLowerCase();

  if (lower.includes("k-drama") || lower.includes("korean")) return ["Emotional", "Romantic", "Binge-worthy"];
  if (lower.includes("action")) return ["Explosive", "Gritty", "Adrenaline"];
  if (lower.includes("comedy")) return ["Quirky", "Feel-good", "Witty"];
  if (lower.includes("thriller") || lower.includes("mystery")) return ["Suspenseful", "Dark", "Tense"];
  if (lower.includes("family") || lower.includes("animation")) return ["Family", "Adventure", "Imaginative"];
  return ["Dramatic", "Character-driven", "Cinematic"];
}

function openTitleModal(movie) {
  if (!movie || !elements.titleModal) return;

  const displayTitle = getMovieTitleDisplayText(movie);
  state.activeModalMovie = movie;
  elements.modalImage.src = getMovieBannerImageUrl(movie);
  elements.modalImage.alt = `${displayTitle} artwork`;
  elements.modalTitle.textContent = displayTitle;
  elements.modalPlayBtn?.setAttribute("aria-label", `Play ${displayTitle}`);
  elements.modalListBtn?.setAttribute("aria-label", `Add ${displayTitle} to My List`);
  elements.modalMeta.textContent = formatMeta(movie);
  elements.modalDescription.textContent = movie.description;
  elements.titleModal.classList.remove("hidden");
}

function closeTitleModal() {
  elements.titleModal?.classList.add("hidden");
  state.activeModalMovie = null;
}

function playMovie(movie) {
  if (!movie) return;

  const trailer = getTrailerSource(movie.trailerUrl);
  if (!trailer) {
    showToast("Trailer URL not available for this title.");
    return;
  }

  openTrailerModal(movie, trailer);
}

function openTrailerModal(movie, trailer) {
  if (!movie || !trailer || !elements.trailerModal) return;

  const displayTitle = getMovieTitleDisplayText(movie, "Title");
  resetTrailerModalPlayer();
  state.trailerModalSession += 1;
  const session = state.trailerModalSession;
  state.activeTrailerMovie = movie;

  if (elements.trailerModalTitle) {
    elements.trailerModalTitle.textContent = `${displayTitle} Trailer`;
  }

  elements.trailerModalPanel?.classList.toggle("is-vertical-trailer", trailer.aspect === "vertical");
  elements.trailerModal.classList.remove("hidden");
  renderTrailerModalSource(trailer, session);
}

function closeTrailerModal() {
  state.trailerModalSession += 1;
  resetTrailerModalPlayer();
  elements.trailerModal?.classList.add("hidden");
  state.activeTrailerMovie = null;
}

function renderTrailerModalSource(trailer, session) {
  if (!trailer) {
    showTrailerFallback({ message: TRAILER_UNAVAILABLE_MESSAGE });
    return;
  }

  if (trailer.type === "video") {
    setupNativeTrailerModal(trailer, session);
    return;
  }

  if (trailer.type === "embed") {
    setupEmbedTrailerModal(trailer, session);
    return;
  }

  showTrailerFallback(trailer);
}

function setupNativeTrailerModal(trailer, session) {
  const video = elements.trailerModalVideo;
  if (!video) {
    showTrailerFallback(trailer);
    return;
  }

  video.hidden = false;
  video.src = trailer.url;
  video.muted = true;
  video.defaultMuted = true;
  video.autoplay = true;
  video.loop = true;
  video.playsInline = true;
  video.controls = false;
  video.disablePictureInPicture = true;
  video.disableRemotePlayback = true;
  video.setAttribute("controlslist", "nodownload noplaybackrate noremoteplayback");
  video.setAttribute("tabindex", "-1");

  state.trailerModalVideoErrorHandler = () => {
    if (session === state.trailerModalSession) showTrailerFallback(trailer);
  };
  video.addEventListener("error", state.trailerModalVideoErrorHandler, { once: true });
  video.load();

  const playPromise = video.play();
  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch(() => {
      if (session === state.trailerModalSession) showTrailerFallback(trailer);
    });
  }
}

function setupEmbedTrailerModal(trailer, session) {
  const frame = elements.trailerModalFrame;
  if (!frame) {
    showTrailerFallback(trailer);
    return;
  }

  frame.hidden = false;
  frame.setAttribute("allow", trailer.allow || "autoplay; encrypted-media; picture-in-picture");
  frame.setAttribute("tabindex", "-1");
  frame.dataset.provider = trailer.provider || "embed";

  state.trailerModalFrameLoadHandler = () => {
    if (session !== state.trailerModalSession) return;
    window.clearTimeout(state.trailerModalFrameFallbackTimer);
    state.trailerModalFrameFallbackTimer = null;
  };

  frame.addEventListener("load", state.trailerModalFrameLoadHandler, { once: true });
  frame.src = trailer.url;

  if (trailer.provider !== "youtube" && trailer.provider !== "vimeo") {
    state.trailerModalFrameFallbackTimer = window.setTimeout(() => {
      if (session === state.trailerModalSession && !elements.trailerModal?.classList.contains("hidden") && frame.src === trailer.url) {
        showTrailerFallback(trailer);
      }
    }, 7000);
  }
}

function showTrailerFallback(trailer) {
  window.clearTimeout(state.trailerModalFrameFallbackTimer);
  state.trailerModalFrameFallbackTimer = null;

  if (elements.trailerModalVideo) {
    elements.trailerModalVideo.pause();
    if (state.trailerModalVideoErrorHandler) {
      elements.trailerModalVideo.removeEventListener("error", state.trailerModalVideoErrorHandler);
    }
    elements.trailerModalVideo.removeAttribute("src");
    elements.trailerModalVideo.hidden = true;
    elements.trailerModalVideo.load();
  }

  if (elements.trailerModalFrame) {
    if (state.trailerModalFrameLoadHandler) {
      elements.trailerModalFrame.removeEventListener("load", state.trailerModalFrameLoadHandler);
    }
    elements.trailerModalFrame.removeAttribute("src");
    elements.trailerModalFrame.hidden = true;
  }

  state.trailerModalVideoErrorHandler = null;
  state.trailerModalFrameLoadHandler = null;

  if (elements.trailerModalFallbackText) {
    elements.trailerModalFallbackText.textContent = trailer?.message || TRAILER_UNAVAILABLE_MESSAGE;
  }

  if (elements.trailerModalFallback) {
    elements.trailerModalFallback.hidden = false;
  }
}

function resetTrailerModalPlayer() {
  window.clearTimeout(state.trailerModalFrameFallbackTimer);
  state.trailerModalFrameFallbackTimer = null;

  if (elements.trailerModalVideo) {
    elements.trailerModalVideo.pause();
    if (state.trailerModalVideoErrorHandler) {
      elements.trailerModalVideo.removeEventListener("error", state.trailerModalVideoErrorHandler);
    }
    elements.trailerModalVideo.removeAttribute("src");
    elements.trailerModalVideo.hidden = true;
    elements.trailerModalVideo.load();
  }

  if (elements.trailerModalFrame) {
    if (state.trailerModalFrameLoadHandler) {
      elements.trailerModalFrame.removeEventListener("load", state.trailerModalFrameLoadHandler);
    }
    elements.trailerModalFrame.removeAttribute("src");
    elements.trailerModalFrame.hidden = true;
    delete elements.trailerModalFrame.dataset.provider;
  }

  if (elements.trailerModalFallback) {
    elements.trailerModalFallback.hidden = true;
  }

  elements.trailerModalPanel?.classList.remove("is-vertical-trailer");
  state.trailerModalVideoErrorHandler = null;
  state.trailerModalFrameLoadHandler = null;
}

async function addToMyList(movie) {
  if (!movie || !state.currentUser) return false;
  const movieKey = getMyListMovieKey(movie);
  if (!movieKey) return false;

  try {
    await setDoc(doc(db, "users", state.currentUser.uid, "watchlist", movieKey), {
      title: movie.title,
      displayTitle: getMovieTitleDisplayText(movie),
      category: movie.category,
      year: movie.year,
      rating: movie.rating,
      duration: movie.duration || "",
      description: movie.description || "",
      posterUrl: getAfterPagePosterUrl(movie, ""),
      beforePosterUrl: cleanImageUrl(movie.beforePosterUrl, ""),
      afterPosterUrl: cleanImageUrl(movie.afterPosterUrl, ""),
      bannerUrl: cleanImageUrl(movie.bannerUrl, ""),
      trailerUrl: cleanTrailerUrl(movie.trailerUrl, ""),
      progress: movie.progress || 0,
      addedAt: serverTimestamp()
    }, { merge: true });

    const savedMovie = normalizeSavedMovie(movieKey, movie, movie, 0);
    if (savedMovie) {
      state.myListPageRemovedKeys.delete(movieKey);
      persistMyListPageRemovedKeys();
      state.myList = uniqueMovies([savedMovie, ...state.myList]);
      syncMyListToggleControls(movieKey);
      renderMyListPage({ animate: true, preserveHover: true });
    }

    showToast(`${getMovieTitleDisplayText(movie)} added to My List.`);
    return true;
  } catch (error) {
    console.error("Watchlist update failed:", error.code || error.message);
    showFirestoreFailure("Could not update My List.", error);
    return false;
  }
}

async function removeFromMyList(movie, control, options = {}) {
  const { animateCard = true } = options;
  const movieKey = getMyListMovieKey(movie);
  if (!movie || !movieKey || !control || control.classList.contains("is-removing")) return false;

  const card = animateCard ? control.closest(".title-card") : null;
  control.disabled = true;
  control.classList.add("is-removing");
  card?.classList.add("is-removing-from-my-list");

  try {
    const deletion = state.currentUser
      ? deleteDoc(doc(db, "users", state.currentUser.uid, "watchlist", movieKey))
      : Promise.resolve();

    await Promise.all([
      deletion,
      animateCard ? wait(MY_LIST_CARD_REMOVE_MS) : Promise.resolve()
    ]);

    state.myList = state.myList.filter((item) => getMyListMovieKey(item) !== movieKey);
    state.myListPageRemovedKeys.add(movieKey);
    persistMyListPageRemovedKeys();
    syncMyListToggleControls(movieKey);
    renderMyListPage({ animate: true, preserveHover: !animateCard });

    if (!animateCard) {
      control.disabled = false;
      control.classList.remove("is-removing");
    }

    showToast(`${getMovieTitleDisplayText(movie)} removed from My List.`);
    return true;
  } catch (error) {
    console.error("Watchlist removal failed:", error.code || error.message);
    control.disabled = false;
    control.classList.remove("is-removing");
    card?.classList.remove("is-removing-from-my-list");
    showFirestoreFailure("Could not remove from My List.", error);
    return false;
  }
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function filterRenderedCards(queryText) {
  hideTitleCardHover();
  const query = queryText.trim().toLowerCase();

  document.querySelectorAll(".movie-row").forEach((row) => {
    let visibleCount = 0;

    row.querySelectorAll(".title-card").forEach((card) => {
      const matches = !query || card.dataset.title.includes(query);
      card.classList.toggle("is-filtered", !matches);
      if (matches) visibleCount += 1;
    });

    row.classList.toggle("is-filtered-empty", visibleCount === 0);
  });

  scheduleHeroMediaBoundaryUpdate();
}

function renderMyListPage(options = {}) {
  if (!elements.myListGrid) return;
  if (!options.preserveHover) {
    hideTitleCardHover();
  }

  if (state.myListGridRefreshFrame) {
    window.cancelAnimationFrame(state.myListGridRefreshFrame);
    state.myListGridRefreshFrame = null;
  }

  window.clearTimeout(state.myListGridRefreshTimer);
  state.myListGridRefreshTimer = null;

  const renderContent = () => {
    const movies = getMyListPageMovies();

    if (movies.length === 0) {
      elements.myListGrid.replaceChildren(createElement("p", "my-list-empty", "Titles you add will appear here."));
      return;
    }

    const cards = movies.map((movie) => createTitleCard(movie, false, 0, "myList", { isMyListPageCard: true }));
    elements.myListGrid.replaceChildren(...cards);
  };

  if (!options.animate || prefersReducedMotion()) {
    elements.myListGrid.classList.remove("is-refreshing", "is-entering-refresh");
    renderContent();
    return;
  }

  elements.myListGrid.classList.add("is-refreshing");
  state.myListGridRefreshTimer = window.setTimeout(() => {
    renderContent();
    elements.myListGrid.classList.remove("is-refreshing");
    elements.myListGrid.classList.add("is-entering-refresh");

    state.myListGridRefreshFrame = window.requestAnimationFrame(() => {
      elements.myListGrid.classList.remove("is-entering-refresh");
      state.myListGridRefreshFrame = null;
    });

    state.myListGridRefreshTimer = window.setTimeout(() => {
      elements.myListGrid.classList.remove("is-entering-refresh");
      state.myListGridRefreshTimer = null;
    }, MY_LIST_GRID_REFRESH_ENTER_MS);
  }, MY_LIST_GRID_REFRESH_LEAVE_MS);
}

async function openAdminDashboard() {
  closeMenus();

  const verified = await verifyAdminSession();
  if (!verified) {
    showToast("Permission Denied", {
      type: "error",
      detail: "Admin privileges are required."
    });
    return;
  }

  openAdminDashboardModal();
  await Promise.all([
    loadAdminAnalytics(false),
    loadAdminMovies(false)
  ]);
}

function isAdminDashboardOpen() {
  return Boolean(
    elements.adminDashboard
      && !elements.adminDashboard.classList.contains("hidden")
      && !elements.adminDashboard.classList.contains("is-closing")
  );
}

function openAdminDashboardModal() {
  if (!elements.adminDashboard) return;

  window.clearTimeout(state.adminDashboardCloseTimer);
  state.adminDashboardCloseTimer = null;
  elements.adminDashboard.classList.remove("is-closing");
  elements.adminDashboard.classList.remove("hidden");
  elements.adminDashboard.setAttribute("aria-hidden", "false");
}

function closeAdminDashboardModal() {
  const dashboard = elements.adminDashboard;
  if (!dashboard) return;

  if (dashboard.classList.contains("hidden")) {
    dashboard.classList.remove("is-closing");
    dashboard.setAttribute("aria-hidden", "true");
    return;
  }

  if (dashboard.classList.contains("is-closing")) return;

  window.clearTimeout(state.adminDashboardCloseTimer);
  dashboard.setAttribute("aria-hidden", "true");

  if (prefersReducedMotion()) {
    dashboard.classList.remove("is-closing");
    dashboard.classList.add("hidden");
    state.adminDashboardCloseTimer = null;
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
    window.clearTimeout(state.adminDashboardCloseTimer);
    cleanupCloseListeners();
    dashboard.classList.add("hidden");
    dashboard.classList.remove("is-closing");
    state.adminDashboardCloseTimer = null;
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
    state.adminDashboardCloseTimer = window.setTimeout(finishClose, ADMIN_DASHBOARD_TRANSITION_MS + 120);
  });
}

async function loadAdminAnalytics(verifyFirst = true) {
  if (verifyFirst && !(await verifyAdminSession())) return;

  try {
    const movieSnapshot = await getDocs(collection(db, "movies"));
    const logSnapshot = await getDocs(collection(db, "adminData", "securityLogs", "events"));

    elements.totalMoviesCount.textContent = `${movieSnapshot.size} movies`;
    elements.currentRoleStatus.textContent = "Admin Verified";
    elements.securityLogCount.textContent = `${logSnapshot.size} audit events`;
  } catch (error) {
    console.warn("Admin analytics refresh failed:", error.code || error.message);
    elements.totalMoviesCount.textContent = "Unavailable";
    elements.currentRoleStatus.textContent = state.currentRole === "admin" ? "Admin Verified" : "Standard User";
    elements.securityLogCount.textContent = "Unavailable";
  }
}

async function loadAdminMovies(verifyFirst = true) {
  if (verifyFirst && !(await verifyAdminSession())) return;
  setMovieListMessage("Loading movie records...");

  try {
    const snapshot = await getDocs(collection(db, "movies"));
    const searchTerm = elements.adminMovieSearch?.value.trim().toLowerCase() || "";
    const records = [];

    snapshot.forEach((movieDoc) => {
      const movie = movieDoc.data();
      const displayTitle = getAdminMovieDisplayTitle(movie);
      const searchableText = [
        displayTitle,
        movie.category,
        movie.year,
        movie.rating
      ].join(" ").toLowerCase();

      if (!searchTerm || searchableText.includes(searchTerm)) {
        records.push({ id: movieDoc.id, movie });
      }
    });

    if (records.length === 0) {
      setMovieListMessage(searchTerm ? "No matching movies found." : "No movies added yet.");
      return;
    }

    const cards = records
      .sort((a, b) => getAfterMovieSortRank(a.movie) - getAfterMovieSortRank(b.movie))
      .map((record) => createAdminMovieCard(record.id, record.movie));

    elements.movieList.replaceChildren(...cards);
  } catch (error) {
    console.warn("Admin movie list refresh failed:", error.code || error.message);
    setMovieListMessage("Failed to load movies.");
  }
}

function createAdminMovieCard(movieId, movie) {
  const normalized = normalizeCloudMovie(movieId, movie, 0) || fallbackHero;
  const displayTitle = getAdminMovieDisplayTitle(movie, normalized.title || "Untitled Movie");
  const card = createElement("div", "movie-admin-item");

  const image = document.createElement("img");
  image.className = "admin-movie-poster";
  image.src = getAfterPagePosterUrl(movie, FALLBACK_ARTWORK);
  image.alt = `${displayTitle} poster`;
  image.referrerPolicy = "no-referrer";

  const info = createElement("div", "admin-movie-info");
  const title = createElement("h3", "", displayTitle);
  const meta = createElement("div", "admin-movie-meta");

  [normalized.category, normalized.year, normalized.rating].forEach((value) => {
    meta.appendChild(createElement("span", "", String(value)));
  });

  const actions = createElement("div", "admin-movie-actions");
  const editButton = createElement("button", "edit-movie-btn", "Edit Movie");
  const deleteButton = createElement("button", "delete-movie-btn", "Delete Movie");
  const featureButton = createElement("button", "feature-movie-btn", movie.featured ? "Featured Banner Active" : "Set as Featured");
  const removeFeatureButton = createElement("button", "edit-movie-btn remove-feature-btn", "Remove Banner");

  editButton.type = "button";
  deleteButton.type = "button";
  featureButton.type = "button";
  removeFeatureButton.type = "button";
  removeFeatureButton.hidden = movie.featured !== true;

  editButton.addEventListener("click", () => startMovieEdit(movieId, movie));
  deleteButton.addEventListener("click", () => {
    openAdminDeleteConfirmModal({
      movieId,
      movieTitle: displayTitle,
      placements: normalizeMoviePlacements(movie.placements, movie.placement),
      trigger: deleteButton
    });
  });
  featureButton.addEventListener("click", () => setFeaturedMovie(movieId));
  removeFeatureButton.addEventListener("click", () => removeFeaturedMovie(movieId));

  actions.append(editButton, deleteButton, featureButton, removeFeatureButton);
  info.append(title, meta, actions);
  card.append(image, info);
  return card;
}

async function handleMovieFormSubmit(event) {
  event.preventDefault();

  if (!(await verifyAdminSession())) {
    showToast("Permission Denied", {
      type: "error",
      detail: "Admin privileges are required."
    });
    return;
  }

  const editingMovieId = elements.movieForm.dataset.editingMovieId;
  const movieData = gatherMovieFormData();
  movieData.isEditing = Boolean(editingMovieId);
  const validationError = validateMovieInput(movieData);

  if (validationError) {
    void runSecondaryFollowUp("Validation audit log", () => logSecurityEvent("MOVIE_INPUT_REJECTED", "BLOCKED"));
    showToast("Validation Errors", {
      type: "warning",
      detail: validationError
    });
    return;
  }

  movieData.title = cleanMovieTitle(movieData.title, "", 80);
  movieData.rank = getSanitizedRank(movieData.rank);
  movieData.trailerUrl = cleanTrailerUrl(movieData.trailerUrl, "");
  movieData.posterUrl = cleanImageUrl(movieData.posterUrl, "");
  movieData.bannerUrl = cleanImageUrl(movieData.bannerUrl, "");
  const loadedPosterUrl = cleanImageUrl(getLoadedPosterInputValue(), "");
  const posterUrlForTargetUpdate = movieData.isEditing && movieData.posterUrl === loadedPosterUrl
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

  const originalPlacements = elements.movieForm.dataset.originalPlacements
    ? elements.movieForm.dataset.originalPlacements.split(",")
    : [];
  const affectedPlacements = editingMovieId ? [...originalPlacements, ...movieData.placements] : movieData.placements;
  const affectedRowKeys = getAfterRowKeysForPlacements(affectedPlacements);
  const shouldRefreshHero = Boolean(editingMovieId && state.activeHero?.firestoreId === editingMovieId);
  const originalBannerUrl = elements.movieForm.dataset.originalBannerUrl || "";
  const originalTrailerUrl = elements.movieForm.dataset.originalTrailerUrl || "";
  const bannerChanged = Boolean(editingMovieId && movieData.bannerUrl !== originalBannerUrl);
  const trailerChanged = Boolean(editingMovieId && movieData.trailerUrl !== originalTrailerUrl);
  const successLogType = editingMovieId ? "MOVIE_UPDATED" : "MOVIE_CREATED";
  const failureLogType = editingMovieId ? "MOVIE_UPDATE_FAILED" : "MOVIE_CREATE_FAILED";

  try {
    if (editingMovieId) {
      await updateDoc(doc(db, "movies", editingMovieId), {
        ...movieWriteData,
        updatedAt: serverTimestamp(),
        updatedBy: state.currentUser.email || "unknown"
      });
      showToast("Movie Updated Successfully", { type: "success" });
      if (bannerChanged) showToast("Banner Updated Successfully", { type: "success" });
      if (trailerChanged) showToast("Trailer Updated Successfully", { type: "success" });
    } else {
      await addDoc(collection(db, "movies"), {
        ...movieWriteData,
        createdAt: serverTimestamp(),
        createdBy: state.currentUser.email || "unknown"
      });
      showToast("Movie Added Successfully", { type: "success" });
    }
  } catch (error) {
    console.error("Movie save failed:", error.code || error.message);
    void runSecondaryFollowUp("Movie save failure audit log", () => logSecurityEvent(failureLogType, "FAILED"));
    showFirestoreFailure("Failed to save movie.", error);
    return;
  }

  clearMovieEditState();
  await runAdminMovieFollowUps({
    logEventType: successLogType,
    catalogOptions: {
      rowKeys: affectedRowKeys,
      refreshHero: shouldRefreshHero,
      refreshMyList: affectedRowKeys.includes("myList")
    }
  });
}

function gatherMovieFormData() {
  const placements = getSelectedMoviePlacements();

  return {
    title: getFieldValue("movie-title"),
    category: getFieldValue("movie-category"),
    placements,
    placement: placements[0] || "",
    badges: getSelectedMovieBadges(),
    year: getFieldValue("movie-year"),
    rating: getFieldValue("movie-rating"),
    rank: getSanitizedRank(getFieldValue("movie-rank")),
    rankApplyTarget: getSelectedRankApplyTarget(),
    posterUrl: getFieldValue("movie-poster"),
    posterApplyTarget: getSelectedPosterApplyTarget(),
    bannerUrl: getFieldValue("movie-banner"),
    trailerUrl: getFieldValue("movie-trailer"),
    description: getFieldValue("movie-description")
  };
}

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
}

function clearAdminEditFillTransition() {
  if (state.adminEditFillFrame) {
    window.cancelAnimationFrame(state.adminEditFillFrame);
  }

  window.clearTimeout(state.adminEditFillTimer);
  window.clearTimeout(state.adminEditClearTimer);
  state.adminEditFillFrame = null;
  state.adminEditFillTimer = null;
  state.adminEditClearTimer = null;
  elements.movieForm?.classList.remove("form-state-leaving", "form-state-entering");
}

function runAdminEditFormStateSwap(applyState) {
  clearAdminEditFillTransition();

  if (!elements.movieForm || prefersReducedMotion()) {
    applyState?.();
    return;
  }

  const form = elements.movieForm;
  form.classList.add("form-state-leaving");
  void form.offsetWidth;

  state.adminEditClearTimer = window.setTimeout(() => {
    applyState?.();
    form.classList.remove("form-state-leaving");
    form.classList.add("form-state-entering");
    void form.offsetWidth;
    state.adminEditClearTimer = null;

    state.adminEditFillFrame = window.requestAnimationFrame(() => {
      form.classList.remove("form-state-entering");
      state.adminEditFillFrame = null;
      state.adminEditFillTimer = window.setTimeout(() => {
        state.adminEditFillTimer = null;
      }, ADMIN_FORM_STATE_ENTER_MS);
    });
  }, ADMIN_FORM_STATE_LEAVE_MS);
}

function clearAdminEditTransition() {
  if (state.adminEditScrollFrame) {
    window.cancelAnimationFrame(state.adminEditScrollFrame);
  }

  if (state.adminEditRevealFrame) {
    window.cancelAnimationFrame(state.adminEditRevealFrame);
  }

  window.clearTimeout(state.adminEditRevealTimer);
  state.adminEditScrollFrame = null;
  state.adminEditRevealFrame = null;
  state.adminEditRevealTimer = null;
}

function getAdminEditScrollContainer() {
  return elements.movieForm?.closest(".admin-panel") || null;
}

function getAdminEditScrollTarget() {
  return elements.movieForm?.closest(".admin-movie-manager") || elements.movieForm;
}

function scrollAdminEditSectionIntoView(onScrollStart) {
  clearAdminEditTransition();

  const scrollContainer = getAdminEditScrollContainer();
  const scrollTarget = getAdminEditScrollTarget();

  const startEditMotion = () => {
    onScrollStart?.();
  };

  if (!scrollContainer || !scrollTarget) {
    startEditMotion();
    return;
  }

  const containerRect = scrollContainer.getBoundingClientRect();
  const targetRect = scrollTarget.getBoundingClientRect();
  const formRect = elements.movieForm.getBoundingClientRect();
  const currentFormPaddingBottom = Number.parseFloat(window.getComputedStyle(elements.movieForm).paddingBottom) || 0;
  const editActionReserve = elements.movieForm.classList.contains("edit-mode-active")
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
    state.adminEditScrollFrame = window.requestAnimationFrame(() => {
      startEditMotion();
      state.adminEditScrollFrame = null;
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
      state.adminEditScrollFrame = window.requestAnimationFrame(step);
    } else {
      state.adminEditScrollFrame = null;
    }
  };

  state.adminEditScrollFrame = window.requestAnimationFrame(step);
}

function revealCancelEditButton() {
  const button = elements.cancelEditMovieBtn;
  if (!button) return;

  if (button.classList.contains("show-edit-control") || prefersReducedMotion()) {
    button.classList.remove("is-revealing-edit-control");
    button.classList.add("show-edit-control");
    return;
  }

  button.classList.remove("show-edit-control", "is-revealing-edit-control");
  void button.offsetWidth;
  button.classList.add("is-revealing-edit-control");

  state.adminEditRevealFrame = window.requestAnimationFrame(() => {
    button.classList.add("show-edit-control");
    state.adminEditRevealFrame = null;
    state.adminEditRevealTimer = window.setTimeout(() => {
      button.classList.remove("is-revealing-edit-control");
      state.adminEditRevealTimer = null;
    }, 900);
  });
}

function startMovieEdit(movieId, movie) {
  elements.movieForm.dataset.editingMovieId = movieId;
  const placements = normalizeMoviePlacements(movie.placements, movie.placement);
  elements.movieForm.dataset.originalPlacements = placements.join(",");
  elements.movieForm.dataset.originalBannerUrl = cleanImageUrl(movie.bannerUrl || "", "");
  elements.movieForm.dataset.originalTrailerUrl = cleanTrailerUrl(movie.trailerUrl || "", "");

  runAdminEditFormStateSwap(() => {
    setFieldValue("movie-title", movie.title || "");
    setFieldValue("movie-category", movie.category || "");
    setSelectedMoviePlacements(placements);
    setSelectedMovieBadges(movie.badges);
    setPosterEditValues(movie);
    setSelectedPosterApplyTarget("after", { syncInput: true });
    setRankEditValues(movie);
    setSelectedRankApplyTarget(getRankApplyTargetForMovieEdit(movie, "after"), { syncInput: true });
    setFieldValue("movie-year", movie.year || "");
    setFieldValue("movie-rating", movie.rating || "");
    setFieldValue("movie-banner", movie.bannerUrl || "");
    setFieldValue("movie-trailer", movie.trailerUrl || "");
    setFieldValue("movie-description", movie.description || "");
    document.getElementById("movie-title")?.blur();
    elements.saveMovieBtn.textContent = "Update Movie";
  });

  scrollAdminEditSectionIntoView(() => {
    elements.movieForm.classList.add("edit-mode-active");
    revealCancelEditButton();
  });
}

function clearMovieEditState(animateValues = false) {
  if (!elements.movieForm) return;

  if (animateValues && !prefersReducedMotion()) {
    clearAdminEditTransition();
    delete elements.movieForm.dataset.editingMovieId;
    delete elements.movieForm.dataset.originalPlacements;
    delete elements.movieForm.dataset.originalBannerUrl;
    delete elements.movieForm.dataset.originalTrailerUrl;
    elements.movieForm.classList.remove("edit-mode-active");
    elements.cancelEditMovieBtn.classList.remove("is-revealing-edit-control");
    elements.cancelEditMovieBtn.classList.remove("show-edit-control");

    runAdminEditFormStateSwap(() => {
      elements.movieForm.reset();
      setSelectedMoviePlacements([]);
      setSelectedMovieBadges([]);
      setSelectedRankApplyTarget("");
      clearRankEditValues();
      setSelectedPosterApplyTarget("");
      clearPosterEditValues();
      elements.saveMovieBtn.textContent = "Add Movie";
    });
    return;
  }

  clearAdminEditTransition();
  clearAdminEditFillTransition();
  delete elements.movieForm.dataset.editingMovieId;
  delete elements.movieForm.dataset.originalPlacements;
  delete elements.movieForm.dataset.originalBannerUrl;
  delete elements.movieForm.dataset.originalTrailerUrl;
  elements.movieForm.reset();
  setSelectedMoviePlacements([]);
  setSelectedMovieBadges([]);
  setSelectedRankApplyTarget("");
  clearRankEditValues();
  setSelectedPosterApplyTarget("");
  clearPosterEditValues();
  elements.saveMovieBtn.textContent = "Add Movie";
  elements.movieForm.classList.remove("edit-mode-active");
  elements.cancelEditMovieBtn.classList.remove("is-revealing-edit-control");
  elements.cancelEditMovieBtn.classList.remove("show-edit-control");
}

function getAdminDeleteConfirmModal() {
  if (elements.adminDeleteConfirmModal) return elements.adminDeleteConfirmModal;

  const modal = createElement("div", "admin-delete-modal hidden");
  const dialog = createElement("section", "admin-delete-dialog");
  const accent = createElement("span", "admin-delete-accent");
  const title = createElement("h2", "admin-delete-title", "Delete Movie");
  const message = createElement("p", "admin-delete-message", "Are you sure you want to delete this movie?");
  const movieTitle = createElement("p", "admin-delete-movie-title");
  const warning = createElement("p", "admin-delete-warning", "This action cannot be undone.");
  const actions = createElement("div", "admin-delete-actions");
  const cancelButton = createElement("button", "admin-delete-cancel", "No, Keep Movie");
  const confirmButton = createElement("button", "admin-delete-confirm", "Yes, Delete Movie");

  title.id = "admin-delete-title";
  message.id = "admin-delete-message";
  movieTitle.id = "admin-delete-movie-title";
  warning.id = "admin-delete-warning";
  cancelButton.type = "button";
  confirmButton.type = "button";

  modal.setAttribute("aria-hidden", "true");
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("aria-labelledby", title.id);
  dialog.setAttribute("aria-describedby", `${message.id} ${movieTitle.id} ${warning.id}`);

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

  elements.adminDeleteConfirmModal = modal;
  elements.adminDeleteConfirmMovieTitle = movieTitle;
  elements.adminDeleteConfirmCancel = cancelButton;
  elements.adminDeleteConfirmButton = confirmButton;

  return modal;
}

function isAdminDeleteConfirmOpen() {
  return Boolean(
    elements.adminDeleteConfirmModal
      && !elements.adminDeleteConfirmModal.classList.contains("hidden")
      && !elements.adminDeleteConfirmModal.classList.contains("is-closing")
  );
}

function openAdminDeleteConfirmModal({ movieId, movieTitle, placements = [], trigger = null } = {}) {
  if (!movieId) return;

  const modal = getAdminDeleteConfirmModal();
  const safeMovieTitle = cleanText(String(movieTitle || ""), "Untitled Movie", 90);

  state.adminDeleteConfirmRequest = {
    movieId,
    placements: normalizeMoviePlacements(placements)
  };
  state.adminDeleteConfirmTrigger = trigger || document.activeElement;

  elements.adminDeleteConfirmMovieTitle.textContent = safeMovieTitle;
  elements.adminDeleteConfirmCancel.disabled = false;
  elements.adminDeleteConfirmButton.disabled = false;
  elements.adminDeleteConfirmButton.textContent = "Yes, Delete Movie";

  window.clearTimeout(state.adminDeleteConfirmCloseTimer);
  state.adminDeleteConfirmCloseTimer = null;
  modal.classList.remove("is-closing");
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");

  window.requestAnimationFrame(() => {
    modal.classList.add("is-visible");
    elements.adminDeleteConfirmCancel.focus({ preventScroll: true });
  });
}

function closeAdminDeleteConfirmModal({ restoreFocus = true } = {}) {
  const modal = elements.adminDeleteConfirmModal;
  if (!modal) return;

  const finishClose = () => {
    window.clearTimeout(state.adminDeleteConfirmCloseTimer);
    modal.classList.add("hidden");
    modal.classList.remove("is-visible", "is-closing");
    modal.setAttribute("aria-hidden", "true");
    state.adminDeleteConfirmRequest = null;
    state.adminDeleteConfirmCloseTimer = null;

    if (restoreFocus && state.adminDeleteConfirmTrigger?.isConnected) {
      state.adminDeleteConfirmTrigger.focus({ preventScroll: true });
    }

    state.adminDeleteConfirmTrigger = null;
  };

  if (modal.classList.contains("hidden") || prefersReducedMotion()) {
    finishClose();
    return;
  }

  modal.classList.remove("is-visible");
  modal.classList.add("is-closing");
  modal.setAttribute("aria-hidden", "true");
  window.clearTimeout(state.adminDeleteConfirmCloseTimer);
  state.adminDeleteConfirmCloseTimer = window.setTimeout(
    finishClose,
    DELETE_CONFIRM_MODAL_TRANSITION_MS + 40
  );
}

async function confirmAdminDeleteMovie() {
  const request = state.adminDeleteConfirmRequest;
  if (!request || elements.adminDeleteConfirmButton.disabled) return;

  elements.adminDeleteConfirmCancel.disabled = true;
  elements.adminDeleteConfirmButton.disabled = true;
  elements.adminDeleteConfirmButton.textContent = "Deleting...";

  closeAdminDeleteConfirmModal({ restoreFocus: false });
  await deleteMovie(request.movieId, request.placements);
}

async function deleteMovie(movieId, placements = []) {
  if (!(await verifyAdminSession())) {
    showToast("Permission Denied", {
      type: "error",
      detail: "Admin privileges are required."
    });
    return;
  }

  try {
    await deleteDoc(doc(db, "movies", movieId));
    showToast("Movie Deleted Successfully", { type: "success" });
  } catch (error) {
    console.error("Delete failed:", error.code || error.message);
    void runSecondaryFollowUp("Movie delete failure audit log", () => logSecurityEvent("MOVIE_DELETE_FAILED", "FAILED"));
    showFirestoreFailure("Failed to delete movie.", error);
    return;
  }

  const affectedRowKeys = getAfterRowKeysForPlacements(placements);
  await runAdminMovieFollowUps({
    logEventType: "MOVIE_DELETED",
    catalogOptions: {
      rowKeys: affectedRowKeys,
      refreshHero: state.activeHero?.firestoreId === movieId,
      refreshMyList: affectedRowKeys.includes("myList")
    }
  });
}

async function setFeaturedMovie(movieId) {
  if (!(await verifyAdminSession())) {
    showToast("Permission Denied", {
      type: "error",
      detail: "Admin privileges are required."
    });
    return;
  }

  try {
    const snapshot = await getDocs(collection(db, "movies"));
    const updates = [];

    snapshot.forEach((movieDoc) => {
      updates.push(updateDoc(doc(db, "movies", movieDoc.id), { featured: false }));
    });

    await Promise.all(updates);
    await updateDoc(doc(db, "movies", movieId), {
      featured: true,
      featuredAt: serverTimestamp(),
      featuredBy: state.currentUser.email || "unknown"
    });

    showToast("Banner Updated Successfully", { type: "success" });
  } catch (error) {
    console.error("Featured movie update failed:", error.code || error.message);
    void runSecondaryFollowUp("Featured banner failure audit log", () => logSecurityEvent("FEATURED_BANNER_UPDATE_FAILED", "FAILED"));
    showFirestoreFailure("Failed to update featured banner.", error);
    return;
  }

  await runAdminMovieFollowUps({
    logEventType: "FEATURED_BANNER_UPDATED",
    catalogOptions: {}
  });
}

async function removeFeaturedMovie(movieId) {
  if (!(await verifyAdminSession())) {
    showToast("Permission Denied", {
      type: "error",
      detail: "Admin privileges are required."
    });
    return;
  }

  try {
    await updateDoc(doc(db, "movies", movieId), { featured: false });
    showToast("Banner Updated Successfully", {
      type: "success",
      detail: "Featured banner removed."
    });
  } catch (error) {
    console.error("Featured banner removal failed:", error.code || error.message);
    void runSecondaryFollowUp("Featured banner removal failure audit log", () => logSecurityEvent("FEATURED_BANNER_REMOVE_FAILED", "FAILED"));
    showFirestoreFailure("Could not remove featured banner.", error);
    return;
  }

  await runAdminMovieFollowUps({
    logEventType: "FEATURED_BANNER_REMOVED",
    catalogOptions: {}
  });
}

async function runAdminMovieFollowUps({ logEventType = "", catalogOptions = {} } = {}) {
  await Promise.all([
    logEventType
      ? runSecondaryFollowUp("Admin audit log", () => logSecurityEvent(logEventType, "SUCCESS"))
      : Promise.resolve(),
    runSecondaryFollowUp("Admin movie list refresh", () => loadAdminMovies(false)),
    runSecondaryFollowUp("Admin analytics refresh", () => loadAdminAnalytics(false))
  ]);

  await runSecondaryFollowUp("Catalog refresh", () => refreshCatalog(catalogOptions));
}

async function runSecondaryFollowUp(label, action) {
  try {
    return await action();
  } catch (error) {
    console.warn(`${label} failed:`, error?.code || error?.message || error);
    return null;
  }
}

function setMovieListMessage(message) {
  let className = "";

  if (message === "No matching movies found." || message === "No movies added yet.") {
    className = "movie-empty-state";
  } else if (message === "Failed to load movies.") {
    className = "movie-load-error";
  }

  const paragraph = createElement("p", className, message);
  elements.movieList.replaceChildren(paragraph);
}

async function logSecurityEvent(eventType, status) {
  try {
    await addDoc(collection(db, "adminData", "securityLogs", "events"), {
      eventType,
      status,
      userEmail: state.currentUser?.email || "unknown",
      role: state.currentRole || "guest",
      source: "netflix-after-subscription",
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.warn("Security log write unavailable:", error.code || error.message);
  }
}

function validateMovieInput(movieData) {
  if (!isSafeMovieTitle(movieData.title, 80)) {
    return "Movie title must be normal text or a safe .png, .jpg, .jpeg, .webp, .gif, or .avif title image URL/path.";
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

  if (!isSafeText(movieData.rating, 22)) {
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

  if (!isSafeTrailerUrl(movieData.trailerUrl, false)) {
    return "Trailer must be an HTTPS link, supported social trailer URL, or safe relative .mp4/.webm/.ogg project path.";
  }

  if (!isSafeText(movieData.description, MAX_DESCRIPTION_LENGTH)) {
    return "Description is required and must be under 500 characters without unsafe characters.";
  }

  return null;
}

function formatMeta(movie) {
  return [movie.category || "Movie", movie.year || "Year N/A", movie.rating || "Rating N/A", movie.duration || ""]
    .filter(Boolean)
    .join(" | ");
}

function uniqueMovies(movies) {
  const seen = new Set();

  return movies.filter((movie) => {
    const key = movie.firestoreId || movie.id || movie.title;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sortMoviesByRank(movies) {
  return [...movies].sort((a, b) => {
    const rankDifference = getMovieSortRank(a) - getMovieSortRank(b);
    if (rankDifference !== 0) return rankDifference;
    return String(a?.title || "").localeCompare(String(b?.title || ""), undefined, { sensitivity: "base" });
  });
}

function getMovieSortRank(movie) {
  return getAfterMovieSortRank(movie);
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
    before: elements.movieForm?.dataset.posterBeforeUrl || "",
    after: elements.movieForm?.dataset.posterAfterUrl || "",
    legacy: elements.movieForm?.dataset.posterLegacyUrl || ""
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
  return Boolean(elements.movieForm?.dataset.editingMovieId);
}

function updatePosterInputForSelectedTarget() {
  const posterInput = document.getElementById("movie-poster");
  if (!posterInput) return;
  const posterInputValue = getPosterInputValueForTarget(getSelectedPosterApplyTarget());
  posterInput.value = posterInputValue;
  setLoadedPosterInputValue(posterInputValue);
}

function setLoadedPosterInputValue(value) {
  if (!elements.movieForm) return;
  elements.movieForm.dataset.posterLoadedUrl = value || "";
}

function getLoadedPosterInputValue() {
  return elements.movieForm?.dataset.posterLoadedUrl || "";
}

function setPosterEditValues(movie) {
  if (!elements.movieForm) return;
  elements.movieForm.dataset.posterBeforeUrl = cleanImageUrl(movie?.beforePosterUrl || "", "");
  elements.movieForm.dataset.posterAfterUrl = cleanImageUrl(movie?.afterPosterUrl || "", "");
  elements.movieForm.dataset.posterLegacyUrl = cleanImageUrl(movie?.posterUrl || "", "");
  setLoadedPosterInputValue("");
}

function clearPosterEditValues() {
  if (!elements.movieForm) return;
  delete elements.movieForm.dataset.posterBeforeUrl;
  delete elements.movieForm.dataset.posterAfterUrl;
  delete elements.movieForm.dataset.posterLegacyUrl;
  delete elements.movieForm.dataset.posterLoadedUrl;
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
    before: elements.movieForm?.dataset.rankBeforeValue || "",
    after: elements.movieForm?.dataset.rankAfterValue || "",
    legacy: elements.movieForm?.dataset.rankLegacyValue || ""
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
  return Boolean(elements.movieForm?.dataset.editingMovieId);
}

function updateRankInputForSelectedTarget() {
  const rankInput = document.getElementById("movie-rank");
  if (!rankInput) return;
  rankInput.value = getRankInputValueForTarget(getSelectedRankApplyTarget());
}

function setRankEditValues(movie) {
  if (!elements.movieForm) return;
  elements.movieForm.dataset.rankBeforeValue = formatRankInputValue(movie?.beforeRank);
  elements.movieForm.dataset.rankAfterValue = formatRankInputValue(movie?.afterRank);
  elements.movieForm.dataset.rankLegacyValue = formatRankInputValue(movie?.rank);
}

function clearRankEditValues() {
  if (!elements.movieForm) return;
  delete elements.movieForm.dataset.rankBeforeValue;
  delete elements.movieForm.dataset.rankAfterValue;
  delete elements.movieForm.dataset.rankLegacyValue;
}

function getRankApplyTargetForMovieEdit(movie, preferredTarget = "after") {
  const beforeRank = getSanitizedRank(movie?.beforeRank);
  const afterRank = getSanitizedRank(movie?.afterRank);
  const legacyRank = getSanitizedRank(movie?.rank);
  const normalizedPreferredTarget = normalizeRankApplyTarget(preferredTarget) || "after";

  if (beforeRank !== null && afterRank !== null && beforeRank === afterRank) return "both";
  if (beforeRank !== null && afterRank === null) return "before";
  if (afterRank !== null && beforeRank === null) return "after";
  if (beforeRank !== null && afterRank !== null) return normalizedPreferredTarget;
  if (legacyRank !== null) return "both";

  return normalizedPreferredTarget;
}

function getAfterMovieSortRank(movie) {
  return getSanitizedRank(movie?.afterRank) ?? getSanitizedRank(movie?.rank) ?? 999;
}

function getAfterPagePosterUrl(movie, fallback = FALLBACK_ARTWORK) {
  return cleanImageUrl(movie?.afterPosterUrl, "") ||
    cleanImageUrl(movie?.posterUrl, "") ||
    fallback;
}

function getMovieHeroArtworkUrl(movie, fallback = FALLBACK_ARTWORK) {
  return cleanImageUrl(movie?.bannerUrl, "") ||
    cleanImageUrl(movie?.afterPosterUrl, "") ||
    cleanImageUrl(movie?.posterUrl, "") ||
    fallback;
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

function getAfterRowKeyForPlacement(placement) {
  return AFTER_ROW_KEY_BY_PLACEMENT[placement] || "";
}

function getAfterRowKeysForPlacements(placements) {
  return [...new Set(
    normalizeMoviePlacements(placements)
      .map((placement) => getAfterRowKeyForPlacement(placement))
      .filter(Boolean)
  )];
}

function cleanText(value, fallback = "", maxLength = 160) {
  if (typeof value !== "string") return fallback;

  const text = value.trim().replace(/\s+/g, " ");
  if (!text) return fallback;

  const unsafePattern = /<[^>]*>|javascript:|onerror=|onload=|onclick=|eval\(|document\.cookie|localStorage|sessionStorage/i;
  if (unsafePattern.test(text)) return fallback;

  return text.slice(0, maxLength);
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

function isSafeText(value, maxLength = 120) {
  return cleanText(value, "", maxLength).length > 0 && value.trim().length <= maxLength;
}

function cleanImageUrl(value, fallback = "") {
  const safeInput = sanitizeImageInput(value);
  return safeInput ? safeInput.value : fallback;
}

function cleanTrailerUrl(value, fallback = "") {
  const safeInput = sanitizeTrailerInput(value);
  return safeInput ? safeInput.value : fallback;
}

function isSafeImageUrl(value, required = false) {
  if (!value && !required) return true;
  return cleanImageUrl(value, "") !== "";
}

function isSafeTrailerUrl(value, required = false) {
  if (!value && !required) return true;
  return cleanTrailerUrl(value, "") !== "";
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

function getFieldValue(id) {
  return document.getElementById(id)?.value.trim() || "";
}

function setFieldValue(id, value) {
  const input = document.getElementById(id);
  if (input) {
    input.value = value;

    if (id === "movie-placement") {
      syncPlacementDropdown(input.value);
    }
  }
}

function createElement(tagName, className = "", text = "") {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== "") element.textContent = text;
  return element;
}

function showToast(message, options = {}) {
  if (!elements.toast) return;

  const config = typeof options === "string" ? { type: options } : options;
  const type = TOAST_TYPES.has(config.type) ? config.type : "info";
  const title = cleanText(String(message || ""), "", 140);
  const detail = cleanText(String(config.detail || ""), "", 180);

  if (!title) return;

  state.toastQueue.push({
    id: ++state.toastSequence,
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
  const fallback = cleanText(fallbackMessage, "Request failed.", 120);
  const code = cleanText(String(error?.code || ""), "", 80);

  if (code === "permission-denied") {
    return "Permission denied by Firestore rules.";
  }

  return code ? `${fallback} ${code}` : fallback;
}

function processToastQueue() {
  if (!elements.toast) return;

  while (state.activeToasts.size < TOAST_MAX_VISIBLE && state.toastQueue.length > 0) {
    mountToast(state.toastQueue.shift());
  }
}

function mountToast(toast) {
  const card = document.createElement("div");
  card.className = "toast-card";
  card.dataset.toastType = toast.type;
  card.setAttribute("role", toast.type === "error" ? "alert" : "status");

  const content = createElement("div", "toast-content");
  const title = createElement("div", "toast-title", toast.title);
  content.appendChild(title);

  if (toast.detail) {
    content.appendChild(createElement("div", "toast-detail", toast.detail));
  }

  card.appendChild(content);
  toast.element = card;
  state.activeToasts.set(toast.id, toast);
  elements.toast.appendChild(card);

  window.requestAnimationFrame(() => {
    card.classList.add("is-visible");
  });

  toast.timer = window.setTimeout(() => {
    dismissToast(toast.id);
  }, TOAST_AUTO_DISMISS_MS);
}

function dismissToast(toastId) {
  const toast = state.activeToasts.get(toastId);
  if (!toast) return;

  state.activeToasts.delete(toastId);
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

function getRowId(key) {
  const ids = {
    top: "top-picks",
    new: "new-popular",
    usDrama: "shows",
    crowd: "movies",
    top10: "top-10",
    continue: "continue-watching",
    memory: "watch-again",
    kdrama: "languages",
    only: "only-on-netflix",
    myList: "my-list-row"
  };

  return ids[key] || key;
}
