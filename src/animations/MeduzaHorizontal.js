import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";

export default class MeduzaHorizontal {
    constructor() {
        this.container = null;

        this.beatTween = null;

        this.beatColorTween = null;

        this.cardsBeatTween = null

        this.init();
    }

    init() {
        gsap.registerPlugin(ScrollTrigger, Flip);

        this.setupElements();

        this.initCardMusic();
        this.createHorizontalPinAnimation();
        this.createCardsAnimation();
    }




    setupElements() {
        this.container = document.querySelector("#app");
        this.pinSection = document.querySelector(".sticky-wrapper-meduza");

        this.cards = [
            { id: "#card-1", endTranslateX: -2000, rotate: 45 },
            { id: "#card-2", endTranslateX: -1000, rotate: 30 },
            { id: "#card-3", endTranslateX: -2000, rotate: 45 },
            { id: "#card-4", endTranslateX: -1400, rotate: -30 },
            { id: "#card-5", endTranslateX: -1400, rotate: 60 },
            { id: "#card-6", endTranslateX: -1400, rotate: -45 },
            { id: "#card-7", endTranslateX: -1400, rotate: 25 },
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

    initCardMusic() {
        const cards = document.querySelectorAll(".cards");
        let currentAudio = null;

        cards.forEach(card => {
            const audio = card.querySelector("audio");
            const toggle = card.querySelector(".play-btn");

            if (!audio || !toggle) return;

            toggle.addEventListener("change", () => {
                if (currentAudio && currentAudio !== audio) {
                    currentAudio.pause();
                    currentAudio.currentTime = 0;

                    document.querySelectorAll(".play-btn").forEach(btn => {
                        if (btn !== toggle) btn.checked = false;
                    });
                }

                if (toggle.checked) {
                    audio.play().then(() => {
                        currentAudio = audio;
                        this.startBeatPulse(124);
                    }).catch(err => {
                        console.log("Erreur lecture audio:", err);
                        toggle.checked = false;
                    });
                } else {
                    audio.pause();
                    this.stopBeatPulse();
                }

            });
            audio.addEventListener("ended", () => {
                toggle.checked = false;
                this.stopBeatPulse();
            });
        });
    }


    startBeatPulse(bpm = 124) {
        if (this.beatTween || this.beatColorTween || this.cardsBeatTween) return;

        const intervalMs = (60_000 / bpm) / 2;

        this.beatTween = gsap.to(".video-blur-overlay", {
            backdropFilter: "blur(25px)",
            "-webkit-backdrop-filter": "blur(25px)",
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            duration: intervalMs / 1000,
        });

        this.beatColorTween = gsap.to(".video-color-pulse", {
            opacity: 0.9,
            scale: 1.05,
            transformOrigin: "center center",
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            duration: intervalMs / 1000,
        });

        this.cardsBeatTween = gsap.to(".sticky-wrapper-meduza .cards", {
            scale: 1.08,
            transformOrigin: "center center",
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            duration: intervalMs / 1000,
        });
    }


    stopBeatPulse() {
        if (this.beatTween) {
            this.beatTween.kill();
            this.beatTween = null;
        }

        if (this.beatColorTween) {
            this.beatColorTween.kill();
            this.beatColorTween = null;
        }

        if (this.cardsBeatTween) {
            this.cardsBeatTween.kill();
            this.cardsBeatTween = null;
        }

        gsap.to(".video-blur-overlay", {
            backdropFilter: "blur(15px)",
            "-webkit-backdrop-filter": "blur(15px)",
            duration: 0.4,
            ease: "power2.out",
        });

        gsap.to(".video-color-pulse", {
            opacity: 0,
            scale: 1,
            duration: 0.4,
            ease: "power2.out",
        });

        gsap.to(".sticky-wrapper-meduza .cards", {
            scale: 1,
            duration: 0.3,
            ease: "power2.out",
        });
    }

}