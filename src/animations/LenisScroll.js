import Lenis from "lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";

export default class LenisScroll {
  constructor() {
    this.lenis = null;
    this.init();
  }

  init() {
    this.setupLenis();
    this.bindScrollTrigger();
    this.startAnimation();
  }

  setupLenis() {
    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      normalizeWheel: true,
    });
  }

  bindScrollTrigger() {
    this.lenis.on("scroll", ScrollTrigger.update);
  }

  startAnimation() {
    const raf = (time) => {
      this.lenis.raf(time * 1000);
    };

    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
  }

  destroy() {
    if (this.lenis) {
      this.lenis.destroy();
    }
  }
}
