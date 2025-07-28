"use strict";

// === DOM Elements

const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
const btnCloseModal = document.querySelector(".btn--close-modal");
const btnsOpenModal = document.querySelectorAll(".btn--show-modal");

const btnScrollTo = document.querySelector(".btn--scroll-to");
const section1 = document.querySelector("#section--1");

const tabs = document.querySelectorAll(".operations__tab");
const tabsContainer = document.querySelector(".operations__tab-container");
const tabsContent = document.querySelectorAll(".operations__content");

const nav = document.querySelector(".nav");
const header = document.querySelector(".header");
const allSections = document.querySelectorAll(".section");

const imgTargets = document.querySelectorAll("img[data-src]");

const slides = document.querySelectorAll(".slide");
const slider = document.querySelector(".slider");

const btnLeft = document.querySelector(".slider__btn--left");
const btnRight = document.querySelector(".slider__btn--right");

const dotContainer = document.querySelector(".dots");

// --- Modal window

const openModal = e => {
    e.preventDefault();
    modal.classList.remove("hidden");
    overlay.classList.remove("hidden");
};

const closeModal = () => {
    modal.classList.add("hidden");
    overlay.classList.add("hidden");
};

btnsOpenModal.forEach(btnOpenModal => btnOpenModal.addEventListener("click", openModal));

btnCloseModal.addEventListener("click", closeModal);
overlay.addEventListener("click", closeModal);

document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) {
        closeModal();
    }
});

// --- Scroll Learn More

btnScrollTo.addEventListener("click", e => section1.scrollIntoView({ behavior: "smooth" }));

// --- Page Navigation

document.querySelector(".nav__links").addEventListener("click", function (e) {
    e.preventDefault();

    if (e.target.classList.contains("nav__link"))
        document.querySelector(e.target.getAttribute("href")).scrollIntoView({ behavior: "smooth" });
});

// --- Tabbed component

tabsContainer.addEventListener("click", function (e) {
    e.preventDefault();
    const clicked = e.target.closest(".operations__tab");

    if (!clicked) return;

    tabs.forEach(t => t.classList.remove("operations__tab--active"));
    tabsContent.forEach(c => c.classList.remove("operations__content--active"));

    clicked.classList.add("operations__tab--active");
    document.querySelector(`.operations__content--${clicked.dataset.tab}`).classList.add("operations__content--active");
});

// --- Mednu fade animation

const handleHover = function (e) {
    if (e.target.classList.contains("nav__link")) {
        const link = e.target;
        const siblings = link.closest(".nav").querySelectorAll(".nav__link");
        const logo = link.closest(".nav").querySelector("img");

        siblings.forEach(el => {
            if (el !== link) el.style.opacity = this;
        });
        logo.style.opacity = this;
    }
};

nav.addEventListener("mouseover", handleHover.bind(0.5));
nav.addEventListener("mouseout", handleHover.bind(1));

// --- Sticky Navbar

const stickyNav = ([entry]) => (!entry.isIntersecting ? nav.classList.add("sticky") : nav.classList.remove("sticky"));

const headerObserver = new IntersectionObserver(stickyNav, {
    root: null,
    threshold: 0,
    rootMargin: `-${nav.getBoundingClientRect().height}px`,
});
headerObserver.observe(header);

// --- Reveal sections

const revealSection = function (entries, observer) {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        entry.target.classList.remove("section--hidden");
        observer.unobserve(entry.target);
    });
};

const sectionObserver = new IntersectionObserver(revealSection, {
    root: null,
    threshold: 0.15,
});

allSections.forEach(section => {
    section.classList.add("section--hidden");
    sectionObserver.observe(section);
});

// --- Lazy loading images

const loadImg = function (entries, observer) {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        entry.target.src = entry.target.dataset.src;
        entry.target.addEventListener("load", () => {
            entry.target.classList.remove("lazy-img");
        });

        observer.unobserve(entry.target);
    });
};

const imgObserver = new IntersectionObserver(loadImg, {
    root: null,
    threshold: 0,
    rootMargin: "200px",
});

imgTargets.forEach(img => imgObserver.observe(img));

// --- Slider

let curSlide = 0;
const maxSlide = slides.length - 1; // counting from 0

const createDots = () => {
    slides.forEach((_, i) => {
        dotContainer.insertAdjacentHTML("beforeend", `<button class="dots__dot", data-slide="${i}"></button>`);
    });
};

const activateDot = slide => {
    document.querySelectorAll(".dots__dot").forEach(dot => dot.classList.remove("dots__dot--active"));
    document.querySelector(`.dots__dot[data-slide="${slide}"]`).classList.add("dots__dot--active");
};

const goToSlide = slide => {
    slides.forEach((s, i) => (s.style.transform = `translateX(${100 * (i - slide)}%)`));
};

const nextSlide = () => {
    if (curSlide === maxSlide) {
        curSlide = 0;
    } else curSlide++;

    goToSlide(curSlide);
    activateDot(curSlide);
};

const prevSlide = () => {
    if (curSlide === 0) {
        curSlide = maxSlide;
    } else curSlide--;
    goToSlide(curSlide);
    activateDot(curSlide);
};

const init = () => {
    goToSlide(0);
    createDots();
    activateDot(0);
};
init();

btnRight.addEventListener("click", nextSlide);
btnLeft.addEventListener("click", prevSlide);

document.addEventListener("keydown", function (e) {
    e.key === "ArrowLeft" && prevSlide();
    if (e.key === "ArrowRight") nextSlide();
});

dotContainer.addEventListener("click", function (e) {
    if (e.target.classList.contains("dots__dot")) {
        curSlide = Number(e.target.dataset.slide);
        goToSlide(curSlide);
        activateDot(curSlide);
    }
});
