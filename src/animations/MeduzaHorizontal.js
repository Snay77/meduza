import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";

export default class MeduzaHorizontal {
    constructor() {
        this.container = null;

        this.init();
    }

    init() {
        gsap.registerPlugin(ScrollTrigger, Flip);

        this.setupElements();
        // this.createMusic();
        this.initCardMusic();
        this.createHorizontalPinAnimation();
        this.createCardsAnimation();
    }

    // createMusic() {
    //     const music = document.getElementById("bgMusic");
    //     const btn = document.getElementById("playMusicBtn");

    //     if (!music || !btn) return;

    //     btn.addEventListener("click", () => {
    //         music.play()
    //             .then(() => {
    //                 console.log("Music started 🎧");

    //                 // animation de disparition
    //                 btn.style.opacity = "0";
    //                 btn.style.pointerEvents = "none";

    //                 // suppression totale après fade
    //                 setTimeout(() => btn.remove(), 300);
    //             })
    //             .catch((err) => {
    //                 console.log("Erreur:", err);
    //             });
    //     });
    // }

    initCardMusic() {
        const cards = document.querySelectorAll(".cards");
        let currentAudio = null;

        cards.forEach(card => {
            const audio = card.querySelector("audio");
            const button = card.querySelector(".play-btn");

            button.addEventListener("click", (e) => {
                e.stopPropagation(); // évite déclenchement parent

                if (currentAudio && currentAudio !== audio) {
                    currentAudio.pause();
                    currentAudio.currentTime = 0;
                    document.querySelectorAll(".play-btn").forEach(btn => btn.textContent = "▶");
                }

                if (audio.paused) {
                    audio.play();
                    button.textContent = "⏸";
                    currentAudio = audio;
                } else {
                    audio.pause();
                    button.textContent = "▶";
                }
            });
        });
    }


    setupElements() {
        // Met en cache les éléments DOM principaux
        this.container = document.querySelector("#app");
        this.pinSection = document.querySelector(".sticky-wrapper-meduza");

        this.cards = [
            { id: "#card-1", endTranslateX: -2000, rotate: 45 },
            { id: "#card-2", endTranslateX: -1000, rotate: 30 },
            { id: "#card-3", endTranslateX: -2000, rotate: 45 },
            { id: "#card-4", endTranslateX: -1400, rotate: -30 },
        ]
    }

    createHorizontalPinAnimation() {
        ScrollTrigger.create({
            trigger: this.pinSection,
            start: "top top",
            end: `+=${window.innerHeight * 9}`,
            scrub: 1,
            pin: true,
            onUpdate: (self) => {
                gsap.to(this.pinSection, {
                    x: `${-350 * self.progress}vw`,
                    duration: 0.5,
                    ease: "power3.out"
                });
            }
        });
    }

    createCardsAnimation() {
        this.cards.forEach((card) => {
            ScrollTrigger.create({
                trigger: card.id,
                start: "top top",
                end: `+=${window.innerHeight * 12}`,
                scrub: 1,
                onUpdate: (self) => {
                    gsap.to(card.id, {
                        x: `${card.endTranslateX * self.progress}px`,
                        rotation: `${card.rotate * self.progress}deg`,
                        duration: 0.5,
                        ease: "power3.out",
                    });
                }
            });
        });
    }

}