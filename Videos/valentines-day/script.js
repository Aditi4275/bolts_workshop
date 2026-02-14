/* ═══════════════════════════════════════════════════
   Valentine's Day Website — Interactive JavaScript
   ═══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    initFloatingHearts();
    initScrollAnimations();
    initBouquetPetals();
    initCollage();
    initLightbox();


});



/* ═══════════ FLOATING HEARTS CANVAS ═══════════ */
function initFloatingHearts() {
    const canvas = document.getElementById('heartsCanvas');
    const ctx = canvas.getContext('2d');
    let hearts = [];
    const heartSymbols = ['♥', '♡', '❤', '💕', '💗'];
    const colors = [
        'rgba(255, 107, 138, 0.6)',
        'rgba(192, 0, 62, 0.5)',
        'rgba(255, 194, 209, 0.5)',
        'rgba(212, 165, 116, 0.4)',
        'rgba(139, 10, 58, 0.5)'
    ];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    class Heart {
        constructor() {
            this.reset();
            this.y = Math.random() * canvas.height;
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = canvas.height + 30;
            this.size = Math.random() * 18 + 8;
            this.speedY = Math.random() * 1.2 + 0.3;
            this.speedX = (Math.random() - 0.5) * 0.6;
            this.opacity = Math.random() * 0.5 + 0.2;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * 0.03;
            this.symbol = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.wobble = Math.random() * Math.PI * 2;
            this.wobbleSpeed = Math.random() * 0.02 + 0.01;
        }

        update() {
            this.y -= this.speedY;
            this.wobble += this.wobbleSpeed;
            this.x += this.speedX + Math.sin(this.wobble) * 0.5;
            this.rotation += this.rotationSpeed;

            if (this.y < -30) this.reset();
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.font = `${this.size}px serif`;
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.opacity;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.symbol, 0, 0);
            ctx.restore();
        }
    }

    // Create hearts
    const heartCount = Math.min(35, Math.floor(window.innerWidth / 40));
    for (let i = 0; i < heartCount; i++) {
        hearts.push(new Heart());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        hearts.forEach(heart => {
            heart.update();
            heart.draw();
        });
        requestAnimationFrame(animate);
    }

    animate();
}

/* ═══════════ SCROLL ANIMATIONS ═══════════ */
function initScrollAnimations() {
    // Animate wish cards on scroll
    const wishCards = document.querySelectorAll('.wish-card');
    const sections = document.querySelectorAll('.bouquet-section, .memories-section, .love-frame-section');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, delay);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    wishCards.forEach(card => observer.observe(card));

    // Fade in sections
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => {
        section.classList.add('fade-in-section');
        sectionObserver.observe(section);
    });
}

/* ═══════════ BOUQUET PETAL ANIMATION ═══════════ */
function initBouquetPetals() {
    const container = document.getElementById('petalsContainer');
    const petals = ['🌸', '🌺', '🏵️', '💮', '🌹'];

    function createPetal() {
        const petal = document.createElement('span');
        petal.classList.add('petal');
        petal.textContent = petals[Math.floor(Math.random() * petals.length)];
        petal.style.left = Math.random() * 100 + '%';
        petal.style.animationDuration = (Math.random() * 3 + 3) + 's';
        petal.style.fontSize = (Math.random() * 0.8 + 0.8) + 'rem';
        container.appendChild(petal);

        petal.addEventListener('animationend', () => petal.remove());
    }

    // Create petals periodically when bouquet is in view
    const bouquetObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const petalInterval = setInterval(() => {
                    if (!entry.isIntersecting) {
                        clearInterval(petalInterval);
                        return;
                    }
                    createPetal();
                }, 800);
                entry.target._petalInterval = petalInterval;
            } else {
                if (entry.target._petalInterval) {
                    clearInterval(entry.target._petalInterval);
                }
            }
        });
    }, { threshold: 0.3 });

    bouquetObserver.observe(container.parentElement);
}

/* ═══════════ COLLAGE SCROLL ANIMATION & LIGHTBOX ═══════════ */
function initCollage() {
    const collageItems = document.querySelectorAll('.collage-item');

    // Staggered scroll-reveal
    const collageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                // Find index among all items for stagger delay
                const allItems = Array.from(collageItems);
                const idx = allItems.indexOf(entry.target);
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, idx * 150);
                collageObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -30px 0px'
    });

    collageItems.forEach(item => {
        collageObserver.observe(item);

        // Click to open lightbox
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            if (img) openLightbox(img.src);
        });
    });
}


/* ═══════════ LIGHTBOX ═══════════ */
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const closeBtn = document.getElementById('lightboxClose');
    const overlay = lightbox.querySelector('.lightbox-overlay');

    closeBtn.addEventListener('click', closeLightbox);
    overlay.addEventListener('click', closeLightbox);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });
}

function openLightbox(src) {
    const lightbox = document.getElementById('lightbox');
    const image = document.getElementById('lightboxImage');
    image.src = src;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}


