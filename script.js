const revealItems = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.18,
    rootMargin: "0px 0px -40px 0px",
  }
);

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index * 40, 240)}ms`;
  observer.observe(item);
});

const magneticItems = document.querySelectorAll(".magnetic");

magneticItems.forEach((item) => {
  item.addEventListener("pointermove", (event) => {
    const rect = item.getBoundingClientRect();
    const offsetX = event.clientX - rect.left - rect.width / 2;
    const offsetY = event.clientY - rect.top - rect.height / 2;

    item.style.transform = `translate(${offsetX * 0.08}px, ${offsetY * 0.08}px)`;
  });

  item.addEventListener("pointerleave", () => {
    item.style.transform = "";
  });
});

const motionSafe = window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
const portraitFrame = document.querySelector(".portrait-frame");
const projectShowcase = document.querySelector("[data-project-showcase]");
const showcaseTrack = projectShowcase?.querySelector("[data-project-track]");
const showcaseCards = showcaseTrack ? [...showcaseTrack.querySelectorAll("[data-showcase-card]")] : [];

let showcaseMetrics = null;
let motionFrame = null;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const updatePortraitFrame = () => {
  if (!portraitFrame || !motionSafe) {
    return;
  }

  const offset = Math.min(window.scrollY * 0.028, 18);
  portraitFrame.style.transform = `translate3d(0, ${offset}px, 0)`;
};

const updateProjectShowcase = () => {
  if (!projectShowcase || !showcaseTrack) {
    return;
  }

  if (!showcaseMetrics || window.innerWidth <= 1080 || !motionSafe) {
    showcaseTrack.style.transform = "";
    showcaseCards.forEach((card) => {
      card.style.opacity = "";
      card.style.transform = "";
    });
    return;
  }

  const { startOffset, totalTravel } = showcaseMetrics;
  const scrollRange = Math.max(projectShowcase.offsetHeight - window.innerHeight, 1);
  const current = window.scrollY - projectShowcase.offsetTop;
  const progress = clamp(current / scrollRange, 0, 1);
  const translateX = startOffset - totalTravel * progress;

  showcaseTrack.style.transform = `translate3d(${translateX}px, 0, 0)`;

  showcaseCards.forEach((card, index) => {
    const stagger = index * 0.05;
    const cardProgress = clamp((progress - stagger) / 0.32, 0, 1);
    const opacity = 0.38 + cardProgress * 0.62;
    const translateY = (1 - cardProgress) * 28;
    const scale = 0.94 + cardProgress * 0.06;

    card.style.opacity = opacity.toFixed(3);
    card.style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
  });
};

const measureProjectShowcase = () => {
  if (!projectShowcase || !showcaseTrack) {
    return;
  }

  if (window.innerWidth <= 1080 || !motionSafe) {
    projectShowcase.style.height = "auto";
    showcaseMetrics = null;
    updateProjectShowcase();
    return;
  }

  const sticky = projectShowcase.querySelector(".project-showcase-sticky");
  const distance = Math.max(showcaseTrack.scrollWidth - sticky.clientWidth, 0);
  const startOffset = Math.min(sticky.clientWidth * 0.22, 220);
  const totalTravel = distance + startOffset;
  const shellHeight = window.innerHeight + totalTravel + 180;

  projectShowcase.style.height = `${Math.max(shellHeight, 1200)}px`;
  showcaseMetrics = { distance, startOffset, totalTravel };
  updateProjectShowcase();
};

const runMotionUpdates = () => {
  motionFrame = null;
  updatePortraitFrame();
  updateProjectShowcase();
};

const scheduleMotionUpdates = () => {
  if (motionFrame !== null) {
    return;
  }

  motionFrame = window.requestAnimationFrame(runMotionUpdates);
};

window.addEventListener("scroll", scheduleMotionUpdates, { passive: true });
window.addEventListener("resize", () => {
  measureProjectShowcase();
  scheduleMotionUpdates();
});

updatePortraitFrame();
measureProjectShowcase();
scheduleMotionUpdates();
