// animations/ComplexHorizontal.js
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";

/**
 * Classe gérant une animation complexe de scroll horizontal
 * Combine un effet marquee, une transition FLIP d'image, et un scroll horizontal
 * Utilise GSAP, ScrollTrigger et Flip pour créer des transitions fluides
 */
export default class ComplexHorizontal {
  constructor() {
    // Éléments DOM principaux
    this.container = null; // Conteneur principal (#app)
    this.marqueeSection = null; // Section du marquee défilant
    this.marqueeTrack = null; // Piste du marquee (élément qui se déplace)
    this.marqueeItems = []; // Items individuels du marquee
    this.pinnedMarqueeImg = null; // Image du marquee qui sera clonée et animée
    this.horizontalSection = null; // Section avec le scroll horizontal
    this.horizontalWrapper = null; // Wrapper contenant les slides horizontales
    this.horizontalSlides = []; // Slides individuelles du scroll horizontal

    // Gestion du clone d'image
    this.pinnedImgClone = null; // Clone de l'image épinglée (position fixe)
    this.isImgCloneActive = false; // Indique si le clone est actuellement actif
    this.flipAnimation = null; // Animation FLIP pour transformer l'image

    // Valeurs de couleurs CSS
    this.lightColor = null; // Couleur claire du fond
    this.darkColor = null; // Couleur sombre du fond

    // ScrollTriggers pour le nettoyage
    this.scrollTriggers = []; // Tableau de tous les ScrollTriggers créés

    this.init();
  }

  /**
   * Initialise tous les composants de l'animation
   * Configure les éléments, couleurs et crée toutes les animations
   */
  init() {
    gsap.registerPlugin(ScrollTrigger, Flip);

    this.setupElements();
    this.setupColors();
    this.createMarqueeAnimation();
    this.createHorizontalPinAnimation();
    this.createCloneManagementTriggers();
    this.createMainScrollAnimation();
  }

  /**
   * Récupère et met en cache tous les éléments DOM nécessaires
   */
  setupElements() {
    // Met en cache les éléments DOM principaux
    this.container = document.querySelector("#app");
    this.marqueeSection = document.querySelector(".marquee");
    this.marqueeTrack = document.querySelector(".marquee__track");
    this.horizontalSection = document.querySelector(".horizontal");
    this.horizontalWrapper = document.querySelector(".horizontal__wrapper");

    if (!this.marqueeSection || !this.horizontalSection) return;

    // Convertit les NodeLists en tableaux
    this.marqueeItems = gsap.utils.toArray(".marquee__item");
    this.horizontalSlides = gsap.utils.toArray(".horizontal__slide");

    // Trouve l'image du marquee qui sera épinglée et transformée
    const pinnedItem = document.querySelector(".marquee__item--pin");
    if (pinnedItem) {
      this.pinnedMarqueeImg = pinnedItem.querySelector("img");
    }
  }

  /**
   * Récupère les variables CSS de couleur définies dans :root
   */
  setupColors() {
    // Récupère les valeurs des variables CSS --color-light et --color-dark
    const computedStyle = getComputedStyle(document.documentElement);
    this.lightColor = computedStyle.getPropertyValue("--color-light").trim();
    this.darkColor = computedStyle.getPropertyValue("--color-dark").trim();
  }

  /**
   * Crée l'animation du marquee défilant
   * Le marquee se déplace de -75% à -50% pendant que la section entre dans la vue
   */
  createMarqueeAnimation() {
    if (!this.marqueeTrack) return;

    const trigger = ScrollTrigger.create({
      trigger: this.marqueeSection, // Déclenche sur la section marquee
      start: "top bottom", // Commence quand le haut atteint le bas de la fenêtre
      end: "top top", // Termine quand le haut atteint le haut de la fenêtre
      scrub: true, // Synchronise avec le scroll
      onUpdate: (self) => {
        const progress = self.progress; // Progression de 0 à 1
        const xPosition = -75 + progress * 25; // De -75% à -50%
        gsap.set(this.marqueeTrack, {
          x: `${xPosition}%`,
        });
      },
    });

    this.scrollTriggers.push(trigger);
  }

  /**
   * Épingle la section horizontale pour permettre le scroll horizontal
   * La section reste fixée pendant 5x la hauteur de la fenêtre
   */
  createHorizontalPinAnimation() {
    if (!this.horizontalSection) return;

    const trigger = ScrollTrigger.create({
      trigger: this.horizontalSection,
      start: "top top", // Épingle quand le haut atteint le haut de la fenêtre
      end: () => `+=${window.innerHeight * 5}`, // Maintient pendant 5 hauteurs viewport
      pin: true, // Fixe l'élément
    });

    this.scrollTriggers.push(trigger);
  }

  /**
   * Crée les triggers pour gérer la création/suppression du clone d'image
   * et le déclenchement de l'animation FLIP
   */
  createCloneManagementTriggers() {
    if (!this.marqueeSection || !this.pinnedMarqueeImg) return;

    // Trigger pour créer/supprimer le clone de l'image
    const cloneTrigger = ScrollTrigger.create({
      trigger: this.marqueeSection,
      start: "top top",
      onEnter: () => this.createPinnedImgClone(), // Crée le clone en entrant
      onEnterBack: () => this.createPinnedImgClone(), // Recrée en revenant
      onLeaveBack: () => this.removePinnedImgClone(), // Supprime en sortant vers le haut
    });

    this.scrollTriggers.push(cloneTrigger);

    // Trigger pour initialiser l'animation FLIP
    const flipTrigger = ScrollTrigger.create({
      trigger: this.horizontalSection,
      start: "top 50%", // Commence au milieu de la fenêtre
      end: () => `+=${window.innerHeight * 5.5}`,
      onEnter: () => this.initializeFlipAnimation(), // Lance le FLIP
      onLeaveBack: () => this.resetFlipAnimation(), // Réinitialise en remontant
    });

    this.scrollTriggers.push(flipTrigger);
  }

  /**
   * Crée le ScrollTrigger principal qui orchestre toute l'animation
   * Gère le changement de couleur, le FLIP et le scroll horizontal
   */
  createMainScrollAnimation() {
    if (!this.horizontalSection) return;

    const trigger = ScrollTrigger.create({
      trigger: this.horizontalSection,
      start: "top 50%",
      end: () => `+=${window.innerHeight * 5.5}`,
      onUpdate: (self) => this.handleMainScrollUpdate(self),
    });

    this.scrollTriggers.push(trigger);
  }

  /**
   * Crée un clone de l'image épinglée en position fixe
   * Le clone est positionné exactement sur l'image originale puis sera animé
   */
  createPinnedImgClone() {
    if (this.isImgCloneActive || !this.pinnedMarqueeImg) return;

    // Obtient la position actuelle de l'image originale
    const rect = this.pinnedMarqueeImg.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Crée un clone de l'image
    this.pinnedImgClone = this.pinnedMarqueeImg.cloneNode(true);

    // Configure les styles initiaux du clone (position fixe sur l'original)
    gsap.set(this.pinnedImgClone, {
      position: "fixed", // Position fixe sur l'écran
      left: centerX - this.pinnedMarqueeImg.offsetWidth / 2 + "px",
      top: centerY - this.pinnedMarqueeImg.offsetHeight / 2 + "px",
      width: this.pinnedMarqueeImg.offsetWidth + "px",
      height: this.pinnedMarqueeImg.offsetHeight + "px",
      transform: "rotate(-5deg)", // Rotation initiale
      transformOrigin: "center center",
      pointerEvents: "none", // Pas d'interaction souris
      willChange: "transform", // Optimisation performance
      zIndex: 100, // Au-dessus des autres éléments
    });

    // Ajoute le clone au DOM et cache l'image originale
    document.body.appendChild(this.pinnedImgClone);
    gsap.set(this.pinnedMarqueeImg, { opacity: 0 });
    this.isImgCloneActive = true;
  }

  /**
   * Supprime le clone de l'image et réaffiche l'image originale
   */
  removePinnedImgClone() {
    if (!this.isImgCloneActive) return;

    if (this.pinnedImgClone) {
      this.pinnedImgClone.remove();
      this.pinnedImgClone = null;
    }

    if (this.pinnedMarqueeImg) {
      gsap.set(this.pinnedMarqueeImg, { opacity: 1 });
    }

    this.isImgCloneActive = false;
  }

  /**
   * Initialise l'animation FLIP pour transformer l'image
   * FLIP = First, Last, Invert, Play
   * Capture l'état initial, définit l'état final, puis anime la transition
   */
  initializeFlipAnimation() {
    if (!this.pinnedImgClone || !this.isImgCloneActive || this.flipAnimation)
      return;

    // Capture l'état actuel de l'image (First)
    const state = Flip.getState(this.pinnedImgClone);

    // Définit l'état cible : plein écran sans rotation (Last)
    gsap.set(this.pinnedImgClone, {
      position: "fixed",
      left: "0px",
      top: "0px",
      width: "100%", // Pleine largeur
      height: "100svh", // Pleine hauteur viewport
      transform: "rotate(0deg)", // Pas de rotation
      transformOrigin: "center center",
    });

    // Crée l'animation FLIP (Invert & Play)
    // L'animation sera contrôlée manuellement via progress()
    this.flipAnimation = Flip.from(state, {
      duration: 1,
      ease: "none", // Linéaire, contrôlé par le scroll
      paused: true, // Animation en pause, contrôlée manuellement
    });
  }

  /**
   * Réinitialise l'animation FLIP et les états initiaux
   */
  resetFlipAnimation() {
    if (this.flipAnimation) {
      this.flipAnimation.kill();
      this.flipAnimation = null;
    }

    // Réinitialise la couleur de fond à la couleur claire
    if (this.container) {
      gsap.set(this.container, {
        backgroundColor: this.lightColor,
      });
    }

    // Réinitialise la position du wrapper horizontal
    if (this.horizontalWrapper) {
      gsap.set(this.horizontalWrapper, {
        x: "0%",
      });
    }
  }

  /**
   * Gère la mise à jour principale du scroll
   * Orchestre les trois phases : changement de couleur (0-5%), FLIP (0-20%), scroll horizontal (20-95%)
   * @param {ScrollTrigger} self - Instance ScrollTrigger avec les infos de progression
   */
  handleMainScrollUpdate(self) {
    const progress = self.progress; // Progression globale de 0 à 1

    // Phase 1 : Transition de couleur de fond (0-5% du scroll)
    this.updateBackgroundColor(progress);

    // Phase 2 : Animation FLIP de l'image (0-20% du scroll)
    this.updateFlipAnimation(progress);

    // Phase 3 : Scroll horizontal et mouvement d'image (20-95% du scroll)
    this.updateHorizontalScroll(progress);
  }

  /**
   * Gère la transition de la couleur de fond
   * Passe de la couleur claire à la couleur sombre sur les 5 premiers pourcents
   * @param {number} progress - Progression globale (0 à 1)
   */
  updateBackgroundColor(progress) {
    if (!this.container) return;

    if (progress <= 0.05) {
      // Calcule la progression de la couleur (0 à 1 sur les 5 premiers pourcents)
      const bgColorProgress = Math.min(progress / 0.05, 1);
      // Interpole entre couleur claire et couleur sombre
      const newBgColor = gsap.utils.interpolate(
        this.lightColor,
        this.darkColor,
        bgColorProgress
      );
      gsap.set(this.container, {
        backgroundColor: newBgColor,
      });
    } else {
      // Au-delà de 5%, maintient la couleur sombre
      gsap.set(this.container, {
        backgroundColor: this.darkColor,
      });
    }
  }

  /**
   * Contrôle la progression de l'animation FLIP
   * L'image se transforme de sa taille/rotation initiale vers plein écran sur 20% du scroll
   * @param {number} progress - Progression globale (0 à 1)
   */
  updateFlipAnimation(progress) {
    if (!this.flipAnimation) return;

    if (progress <= 0.2) {
      // Calcule la progression du FLIP (0 à 1 sur les 20 premiers pourcents)
      const scaleProgress = progress / 0.2;
      this.flipAnimation.progress(scaleProgress); // Contrôle manuel de l'animation
    } else {
      // Au-delà de 20%, l'animation FLIP est complète
      this.flipAnimation.progress(1);
    }
  }

  /**
   * Gère le défilement horizontal et le mouvement de l'image
   * Entre 20% et 95% du scroll, les slides défilent horizontalement
   * L'image se déplace plus vite pour créer un effet de profondeur
   * @param {number} progress - Progression globale (0 à 1)
   */
  updateHorizontalScroll(progress) {
    if (progress > 0.2 && progress <= 0.95) {
      // Calcule la progression horizontale (0 à 1 entre 20% et 95%)
      const horizontalProgress = (progress - 0.2) / 0.75;

      // Déplace le wrapper horizontal (les slides)
      if (this.horizontalWrapper) {
        // Se déplace de 0% à -66.67% (2/3 de la largeur totale)
        const wrapperTranslateX = -66.67 * horizontalProgress;
        gsap.set(this.horizontalWrapper, {
          x: `${wrapperTranslateX}%`,
        });
      }

      // Déplace le clone d'image (plus vite que les slides pour l'effet parallaxe)
      if (this.pinnedImgClone) {
        // Calcule le déplacement de l'image : (66.67% / 100) * 3 slides * progression
        const slideMovement = (66.67 / 100) * 3 * horizontalProgress;
        // L'image se déplace à 100% de ce mouvement (soit 3x plus vite que les slides)
        const imageTranslateX = -slideMovement * 100;
        gsap.set(this.pinnedImgClone, {
          x: `${imageTranslateX}%`,
        });
      }
    } else if (progress > 0.95) {
      // Après 95%, fixe les positions finales
      if (this.pinnedImgClone) {
        gsap.set(this.pinnedImgClone, {
          x: "-200%", // Image complètement sortie à gauche
        });
      }
      if (this.horizontalWrapper) {
        gsap.set(this.horizontalWrapper, {
          x: "-66.67%", // Wrapper à sa position finale
        });
      }
    }
  }

  /**
   * Rafraîchit tous les ScrollTriggers
   * Utile après un redimensionnement de fenêtre
   */
  refresh() {
    ScrollTrigger.refresh();
  }

  /**
   * Nettoie toutes les animations et réinitialise les éléments
   * Supprime tous les ScrollTriggers, animations et clones
   */
  destroy() {
    // Détruit tous les ScrollTriggers créés
    this.scrollTriggers.forEach((trigger) => trigger.kill());
    this.scrollTriggers = [];

    // Détruit l'animation FLIP
    if (this.flipAnimation) {
      this.flipAnimation.kill();
      this.flipAnimation = null;
    }

    // Supprime le clone s'il existe
    this.removePinnedImgClone();

    // Réinitialise tous les éléments en supprimant les propriétés inline
    if (this.container) {
      gsap.set(this.container, { clearProps: "backgroundColor" });
    }
    if (this.marqueeTrack) {
      gsap.set(this.marqueeTrack, { clearProps: "all" });
    }
    if (this.horizontalWrapper) {
      gsap.set(this.horizontalWrapper, { clearProps: "all" });
    }
  }
}
