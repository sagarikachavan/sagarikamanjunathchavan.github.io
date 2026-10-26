// Navigation and mobile menu
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");
const year = document.getElementById("year");

// Set current year
if (year) {
  year.textContent = new Date().getFullYear().toString();
}

// Mobile menu toggle
if (menuToggle && navMenu) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    
    // Animate menu bars
    const spans = menuToggle.querySelectorAll("span");
    if (isOpen) {
      spans[0].style.transform = "rotate(45deg) translate(5px, 5px)";
      spans[1].style.opacity = "0";
      spans[2].style.transform = "rotate(-45deg) translate(7px, -6px)";
    } else {
      spans[0].style.transform = "none";
      spans[1].style.opacity = "1";
      spans[2].style.transform = "none";
    }
  });

  // Close menu when clicking links
  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      
      // Reset menu bars
      const spans = menuToggle.querySelectorAll("span");
      spans[0].style.transform = "none";
      spans[1].style.opacity = "1";
      spans[2].style.transform = "none";
    });
  });
}

// Active navigation link highlighting
const sections = Array.from(document.querySelectorAll("main section[id], footer[id]"));
const navLinks = Array.from(document.querySelectorAll(".nav-menu a"));

if (sections.length && navLinks.length) {
  const setActiveLink = () => {
    const scrollY = window.scrollY + 120;
    let activeId = sections[0].id;

    sections.forEach((section) => {
      if (section.offsetTop <= scrollY) {
        activeId = section.id;
      }
    });

    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${activeId}`;
      link.classList.toggle("active", isActive);
    });
  };

  window.addEventListener("scroll", setActiveLink, { passive: true });
  setActiveLink();
}

// Scroll animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, observerOptions);

// Observe elements for animation
document.addEventListener("DOMContentLoaded", () => {
  const animatedElements = document.querySelectorAll(
    ".card, .highlight-card, .stat-item"
  );
  
  animatedElements.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(el);
  });
});

// Header scroll effect
const header = document.querySelector(".site-header");
let lastScrollY = window.scrollY;

window.addEventListener("scroll", () => {
  const currentScrollY = window.scrollY;
  
  if (currentScrollY > 100) {
    header.style.background = "rgba(244, 246, 239, 0.98)";
    header.style.boxShadow = "0 4px 18px rgba(32, 43, 37, 0.08)";
  } else {
    header.style.background = "rgba(244, 246, 239, 0.94)";
    header.style.boxShadow = "none";
  }
  
  lastScrollY = currentScrollY;
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Typing effect for hero title (optional enhancement)
const heroTitle = document.querySelector('.hero-title');
if (heroTitle) {
  const titleLines = heroTitle.querySelectorAll('.title-line');
  titleLines.forEach((line, index) => {
    line.style.animationDelay = `${index * 0.2}s`;
  });
}

// Parallax effect for hero background
const heroBg = document.querySelector('.hero-bg-animation');
if (heroBg) {
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallax = scrolled * 0.5;
    heroBg.style.transform = `translateY(${parallax}px)`;
  });
}

// Add hover effect to cards
document.querySelectorAll('.card, .highlight-card').forEach(card => {
  card.addEventListener('mouseenter', function() {
    this.style.transform = 'translateY(-5px) scale(1.02)';
  });
  
  card.addEventListener('mouseleave', function() {
    this.style.transform = 'translateY(0) scale(1)';
  });
});

console.log("🚀 Portfolio website loaded successfully!");

const playIntro = document.getElementById("playIntro");
const avatarInvite = playIntro?.querySelector(".avatar-invite");
const hero = document.querySelector(".hero");
const introAudio = document.getElementById("introAudio");
const introStatus = document.getElementById("introStatus");

if (playIntro && avatarInvite && hero && introAudio) {
  const resetIntro = () => {
    hero.classList.remove("is-speaking");
    playIntro.setAttribute("aria-pressed", "false");
    playIntro.setAttribute("aria-label", "Hear Sagarika's introduction");
    playIntro.title = "Play the introduction";
    avatarInvite.textContent = "Meet Sagarika";
    window.avatarScene?.setSpeaking(false);
  };

  playIntro.addEventListener("click", async () => {
    if (!introAudio.paused) {
      introAudio.pause();
      introAudio.currentTime = 0;
      resetIntro();
      return;
    }

    introAudio.currentTime = 0;
    introStatus.textContent = "Playing Sagarika's introduction.";

    try {
      await introAudio.play();
    } catch {
      introStatus.textContent = "The introduction could not play. Please reload the page and try again.";
      resetIntro();
    }
  });

  introAudio.addEventListener("play", () => {
    hero.classList.add("is-speaking");
    playIntro.setAttribute("aria-pressed", "true");
    playIntro.setAttribute("aria-label", "Stop Sagarika's introduction");
    playIntro.title = "Stop the introduction";
    avatarInvite.textContent = "Stop introduction";
    window.avatarScene?.setSpeaking(true);
  });
  introAudio.addEventListener("pause", resetIntro);
  introAudio.addEventListener("ended", () => {
    resetIntro();
    introStatus.textContent = "Introduction finished.";
  });
  introAudio.addEventListener("error", () => {
    resetIntro();
    introStatus.textContent = "The introduction audio could not be loaded.";
  });
}
