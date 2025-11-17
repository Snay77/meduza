// animations/HorizontalScroll.js
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Classe gérant le défilement horizontal avec parallaxe et animations
 * Utilise GSAP et ScrollTrigger pour créer un effet de scroll horizontal fluide
 */
export default class HorizontalScroll {
  constructor() {
    // Éléments du conteneur DOM
    this.stickySection = null; // Section qui reste fixe pendant le scroll
    this.slidesContainer = null; // Conteneur de toutes les slides
    this.slider = null; // Zone visible du slider
    this.slides = []; // Tableau de toutes les slides individuelles

    // Dimensions calculées
    this.stickyHeight = 0; // Hauteur totale du scroll vertical (6x la hauteur de la fenêtre)
    this.totalMove = 0; // Distance totale de déplacement horizontal
    this.slideWidth = 0; // Largeur d'une slide

    // État de l'animation
    this.currentVisibleIndex = null; // Index de la slide actuellement visible

    // Instances pour le nettoyage
    this.scrollTrigger = null; // Instance ScrollTrigger pour le nettoyage
    this.observer = null; // IntersectionObserver pour détecter les slides visibles
    this.titleAnimations = []; // Tableau des animations des titres en cours

    this.init();
  }

  /**
   * Initialise tous les composants de l'animation
   * Suit un ordre précis : éléments → dimensions → états → observateur → animation
   */
  init() {
    gsap.registerPlugin(ScrollTrigger);

    this.setupElements();
    this.setupDimensions();
    this.setupInitialStates();
    this.createIntersectionObserver();
    this.createScrollAnimation();
  }

  /**
   * Récupère et met en cache les éléments DOM nécessaires
   * Utilise querySelector pour accéder aux éléments de la page
   */
  setupElements() {
    // Met en cache les éléments DOM pour éviter des requêtes multiples
    this.stickySection = document.querySelector(".--sticky");
    this.slidesContainer = document.querySelector(".slides");
    this.slider = document.querySelector(".slider");

    if (!this.stickySection || !this.slidesContainer || !this.slider) return;

    // Convertit la NodeList des slides en tableau avec gsap.utils
    this.slides = gsap.utils.toArray(".slide");
  }

  /**
   * Calcule les dimensions nécessaires pour l'animation
   * - stickyHeight : hauteur virtuelle du scroll (6x la hauteur viewport)
   * - totalMove : distance totale que les slides doivent parcourir
   * - slideWidth : largeur d'une slide pour les calculs de progression
   */
  setupDimensions() {
    if (!this.slider || !this.slidesContainer) return;

    // Calcule les dimensions pour l'animation
    this.stickyHeight = window.innerHeight * 6; // Hauteur totale du scroll
    this.totalMove = this.slidesContainer.offsetWidth - this.slider.offsetWidth; // Distance à parcourir
    this.slideWidth = this.slider.offsetWidth; // Largeur de la zone visible
  }

  /**
   * Définit les états initiaux des éléments avant l'animation
   * Place tous les titres hors de vue (y: -200) pour l'animation d'entrée
   */
  setupInitialStates() {
    if (!this.slides.length) return;

    // Configure l'état initial de tous les titres (cachés vers le haut)
    this.slides.forEach((slide) => {
      const title = slide.querySelector(".title h1");
      if (title) {
        gsap.set(title, { y: -200 });
      }
    });
  }

  /**
   * Crée un IntersectionObserver pour détecter quelle slide est visible
   * Surveille quand une slide atteint 25% de visibilité pour déclencher l'animation du titre
   */
  createIntersectionObserver() {
    if (!this.slider || !this.slides.length) return;

    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      {
        root: this.slider, // Observe par rapport au slider (viewport horizontal)
        threshold: [0, 0.25], // Déclenche à 0% et 25% de visibilité
      }
    );

    // Commence à observer toutes les slides
    this.slides.forEach((slide) => this.observer.observe(slide));
  }

  /**
   * Gère les changements de visibilité des slides
   * Anime les titres en fonction de la slide actuellement visible
   * @param {IntersectionObserverEntry[]} entries - Entrées de l'observer
   */
  handleIntersection(entries) {
    entries.forEach((entry) => {
      const currentIndex = this.slides.indexOf(entry.target);
      const titles = this.slides.map((slide) =>
        slide.querySelector(".title h1")
      );

      if (entry.intersectionRatio >= 0.25) {
        // La slide est suffisamment visible (>= 25%)
        this.currentVisibleIndex = currentIndex;
        this.animateTitles(titles, currentIndex);
      } else if (
        entry.intersectionRatio < 0.25 &&
        this.currentVisibleIndex === currentIndex
      ) {
        // La slide actuellement affichée devient moins visible
        const prevIndex = currentIndex - 1;
        this.currentVisibleIndex = prevIndex >= 0 ? prevIndex : null;
        this.animateTitles(titles, prevIndex);
      }
    });
  }

  /**
   * Anime les titres des slides
   * Le titre de la slide active apparaît (y: 0), les autres disparaissent (y: -200)
   * @param {HTMLElement[]} titles - Tableau des éléments h1 des titres
   * @param {number} activeIndex - Index de la slide active
   */
  animateTitles(titles, activeIndex) {
    titles.forEach((title, index) => {
      if (!title) return;

      const animation = gsap.to(title, {
        y: index === activeIndex ? 0 : -200, // Active : visible, autres : cachés
        duration: 0.5,
        ease: "power2.out", // Courbe d'animation fluide
        overwrite: true, // Écrase les animations précédentes
      });

      // Stocke l'animation pour un nettoyage potentiel
      this.titleAnimations.push(animation);
    });
  }

  /**
   * Crée l'animation principale de scroll horizontal
   * Utilise ScrollTrigger pour transformer le scroll vertical en mouvement horizontal
   */
  createScrollAnimation() {
    if (!this.stickySection || !this.slidesContainer || !this.slides.length)
      return;

    this.scrollTrigger = ScrollTrigger.create({
      trigger: this.stickySection, // Élément déclencheur
      start: "top top", // Démarre quand le haut de la section atteint le haut de la fenêtre
      end: `+=${this.stickyHeight}px`, // Termine après stickyHeight pixels de scroll
      scrub: 1, // Synchronise l'animation avec le scroll (1 = léger lissage)
      pin: true, // Fixe l'élément pendant l'animation
      pinSpacing: true, // Ajoute de l'espace en dessous pour le scroll
      onUpdate: (self) => this.handleScrollUpdate(self), // Callback à chaque update
    });
  }

  /**
   * Gère la mise à jour du scroll
   * Calcule la position horizontale et applique l'effet de parallaxe
   * @param {ScrollTrigger} self - Instance ScrollTrigger avec les infos de progression
   */
  handleScrollUpdate(self) {
    const progress = self.progress; // Progression du scroll (0 à 1)
    const mainMove = progress * this.totalMove; // Distance parcourue en pixels

    // Déplace le conteneur des slides horizontalement
    gsap.set(this.slidesContainer, {
      x: -mainMove, // Négatif pour déplacer vers la gauche
    });

    // Calcule la slide courante et sa progression interne
    const currentSlide = Math.floor(mainMove / this.slideWidth); // Index de la slide visible
    const slideProgress = (mainMove % this.slideWidth) / this.slideWidth; // Progression dans la slide (0 à 1)

    // Applique l'effet de parallaxe aux images
    this.applyImageParallax(currentSlide, slideProgress);
  }

  /**
   * Applique l'effet de parallaxe aux images des slides
   * Les images se déplacent plus lentement que les slides pour créer de la profondeur
   * @param {number} currentSlide - Index de la slide actuellement visible
   * @param {number} slideProgress - Progression dans la slide courante (0 à 1)
   */
  applyImageParallax(currentSlide, slideProgress) {
    this.slides.forEach((slide, index) => {
      const image = slide.querySelector("img");
      if (!image) return;

      if (index === currentSlide || index === currentSlide + 1) {
        // Calcule le parallaxe pour la slide actuelle et la suivante
        const relativeProgress =
          index === currentSlide ? slideProgress : slideProgress - 1;
        const parallaxAmount = relativeProgress * this.slideWidth * 0.25; // 25% de décalage

        gsap.set(image, {
          x: parallaxAmount, // Déplace l'image horizontalement
          scale: 1.35, // Zoom pour éviter les bords vides
        });
      } else {
        // Réinitialise les autres images
        gsap.set(image, {
          x: 0,
          scale: 1.35,
        });
      }
    });
  }

  /**
   * Actualise les dimensions et le ScrollTrigger
   * Utile lors du redimensionnement de la fenêtre
   */
  refresh() {
    // Recalcule les dimensions avec la nouvelle taille de fenêtre
    this.setupDimensions();

    // Rafraîchit le ScrollTrigger avec les nouvelles dimensions
    if (this.scrollTrigger) {
      this.scrollTrigger.refresh();
    }
  }

  /**
   * Nettoie toutes les animations et observateurs
   * Réinitialise les éléments à leur état initial
   * Important pour éviter les fuites mémoire et les conflits
   */
  destroy() {
    // Détruit le ScrollTrigger
    if (this.scrollTrigger) {
      this.scrollTrigger.kill();
    }

    // Déconnecte l'IntersectionObserver
    if (this.observer) {
      this.observer.disconnect();
    }

    // Arrête toutes les animations de titres en cours
    this.titleAnimations.forEach((animation) => {
      if (animation) animation.kill();
    });
    this.titleAnimations = [];

    // Réinitialise les éléments à leur état initial en supprimant les propriétés inline
    if (this.slidesContainer) {
      gsap.set(this.slidesContainer, { clearProps: "all" });
    }

    this.slides.forEach((slide) => {
      const img = slide.querySelector("img");
      const title = slide.querySelector(".title h1");

      if (img) gsap.set(img, { clearProps: "all" });
      if (title) gsap.set(title, { clearProps: "all" });
    });
  }
}
