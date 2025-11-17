import "./style.scss";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";

// Import animation classes
import LenisScroll from "./animations/LenisScroll.js";
import ComplexHorizontal from "./animations/ComplexHorizontal.js";
import HorizontalScroll from "./animations/HorizontalScroll.js";
import MeduzaHorizontal from "./animations/MeduzaHorizontal.js";

// Register GSAP plugins globally
gsap.registerPlugin(ScrollTrigger, SplitText, Flip);

class App {
  constructor() {
    this.animations = [];
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    // Initialize smooth scroll
    this.lenis = new LenisScroll();

    // Initialize animations
    this.initializeAnimations();

    // Setup resize handler
    this.setupResizeHandler();

    // Setup page visibility handler
    this.setupVisibilityHandler();
  }

  initializeAnimations() {
    // Initialize complex horizontal scroll if the section exists
    if (document.querySelector(".--home")) {
      this.horizontalScroll = new HorizontalScroll();
      this.animations.push(this.horizontalScroll);
    }

    // Initialize complex horizontal scroll if the section exists
    if (document.querySelector(".--complex")) {
      this.complexHorizontal = new ComplexHorizontal();
      this.animations.push(this.complexHorizontal);
    }
    
    if (document.querySelector(".home-meduza")) {
      this.meduzaHorizontal = new MeduzaHorizontal();
      this.animations.push(this.meduzaHorizontal);
    }
  }

  setupResizeHandler() {
    let resizeTimer;

    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        // Refresh ScrollTrigger on resize
        ScrollTrigger.refresh();

        // Refresh animations
        if (this.complexHorizontal) {
          this.complexHorizontal.refresh();
        }
      }, 250);
    });
  }

  setupVisibilityHandler() {
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        // Pause animations when page is hidden
        // Add any pause logic here if needed
      } else {
        // Resume animations when page is visible
        // Add any resume logic here if needed
      }
    });
  }

  destroy() {
    // Clean up all animations
    this.animations.forEach((animation) => {
      if (animation && typeof animation.destroy === "function") {
        animation.destroy();
      }
    });

    // Destroy Lenis
    if (this.lenis) {
      this.lenis.destroy();
    }

    // Kill all ScrollTriggers
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  }
}

// Initialize the app
const app = new App();

// Export for potential use in other modules
export default app;
