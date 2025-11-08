// Анимация сердечек с увеличенной высотой полета
const HeartAnimation = {
    heartsContainer: null,
    animationInterval: null,
    isRunning: false,
    heartCount: 0,
    maxHearts: 25,
    isMobile: false,
    resizeTimeout: null,

    heartTypes: [
        '💖', '💗', '💓', '💘', '💝', '💕', '💞', '❤️', '🧡', '💛', '💚', '💙', '💜'
    ],

    animationTypes: ['float', 'float-slow', 'float-fast', 'spin', 'bounce', 'drift'],

    init() {
        try {
            this.detectDeviceType();
            this.heartsContainer = document.getElementById('heartsContainer');
            
            if (!this.heartsContainer) {
                this.createHeartsContainer();
            }
            
            this.addHeartStyles();
            this.setupEventListeners();
            
            console.log('💖 Анимация сердечек инициализирована');
            
        } catch (error) {
            console.error('❌ Ошибка инициализации сердечек:', error);
        }
    },

    detectDeviceType() {
        this.isMobile = window.innerWidth <= 768;
        this.maxHearts = this.isMobile ? 15 : 25;
        console.log(`💖 Сердечки: ${this.isMobile ? 'Мобильный режим' : 'Десктоп режим'}`);
    },

    createHeartsContainer() {
        this.heartsContainer = document.createElement('div');
        this.heartsContainer.id = 'heartsContainer';
        this.heartsContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
            overflow: hidden;
        `;
        document.body.appendChild(this.heartsContainer);
    },

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopHearts();
            } else if (this.isRunning) {
                this.startHearts();
            }
        });
    },

    handleResize() {
        const now = Date.now();
        
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }

        this.resizeTimeout = setTimeout(() => {
            this.detectDeviceType();
            
            if (this.isRunning) {
                this.clearHearts();
                this.startHearts();
            }
        }, 250);
    },

    addHeartStyles() {
        if (document.getElementById('heart-styles')) return;

        const styles = `
            <style id="heart-styles">
                .heart {
                    position: absolute;
                    pointer-events: none;
                    user-select: none;
                    z-index: -1;
                    animation-timing-function: ease-in-out;
                    will-change: transform, opacity;
                    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
                }

                [data-theme="light"] .heart {
                    opacity: 0.25;
                    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.03));
                }

                [data-theme="dark"] .heart {
                    opacity: 0.3;
                    filter: drop-shadow(0 2px 6px rgba(0,0,0,0.15));
                }

                .heart.float {
                    animation: floatUp 12s ease-in-out forwards;
                }

                .heart.float-slow {
                    animation: floatUp 16s ease-in-out forwards;
                }

                .heart.float-fast {
                    animation: floatUp 8s ease-in-out forwards;
                }

                .heart.spin {
                    animation: floatUpSpin 14s ease-in-out forwards;
                }

                .heart.bounce {
                    animation: floatUpBounce 10s ease-in-out forwards;
                }

                .heart.drift {
                    animation: floatUpDrift 13s ease-in-out forwards;
                }

                /* СЕРДЕЧКИ ПРОЛЕТАЮТ ДО САМОГО ВЕРХА */
                @keyframes floatUp {
                    0% {
                        transform: translateY(100vh) rotate(0deg) scale(0.7);
                        opacity: 0.1;
                    }
                    20% {
                        transform: translateY(70vh) rotate(90deg) scale(0.8);
                        opacity: 0.3;
                    }
                    50% {
                        transform: translateY(30vh) rotate(180deg) scale(0.9);
                        opacity: 0.4;
                    }
                    80% {
                        transform: translateY(-20vh) rotate(270deg) scale(0.8);
                        opacity: 0.3;
                    }
                    100% {
                        transform: translateY(-100vh) rotate(360deg) scale(0.7);
                        opacity: 0;
                    }
                }

                @keyframes floatUpSpin {
                    0% {
                        transform: translateY(100vh) rotate(0deg) scale(0.7);
                        opacity: 0.1;
                    }
                    100% {
                        transform: translateY(-100vh) rotate(720deg) scale(0.7);
                        opacity: 0;
                    }
                }

                @keyframes floatUpBounce {
                    0%, 100% {
                        transform: translateY(100vh);
                        opacity: 0.1;
                    }
                    25% {
                        transform: translateY(70vh);
                        opacity: 0.3;
                    }
                    50% {
                        transform: translateY(40vh);
                        opacity: 0.4;
                    }
                    75% {
                        transform: translateY(10vh);
                        opacity: 0.3;
                    }
                    100% {
                        transform: translateY(-100vh);
                        opacity: 0;
                    }
                }

                @keyframes floatUpDrift {
                    0% {
                        transform: translateY(100vh) translateX(0) rotate(0deg);
                        opacity: 0.1;
                    }
                    50% {
                        transform: translateY(30vh) translateX(50px) rotate(180deg);
                        opacity: 0.4;
                    }
                    100% {
                        transform: translateY(-100vh) translateX(100px) rotate(360deg);
                        opacity: 0;
                    }
                }

                /* Адаптивность для мобильных */
                @media (max-width: 768px) {
                    .heart {
                        font-size: 14px !important;
                    }
                    
                    @keyframes floatUp {
                        0% {
                            transform: translateY(100vh) rotate(0deg) scale(0.7);
                            opacity: 0.1;
                        }
                        100% {
                            transform: translateY(-80vh) rotate(360deg) scale(0.7);
                            opacity: 0;
                        }
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .heart {
                        animation: none !important;
                        opacity: 0.05;
                    }
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    },

    startHearts() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.clearHearts();
        
        const creationInterval = this.isMobile ? 1200 : 800;
        const heartsPerInterval = this.isMobile ? 2 : 3;
        
        this.animationInterval = setInterval(() => {
            if (this.heartCount < this.maxHearts) {
                this.createRandomHearts(heartsPerInterval);
            }
        }, creationInterval);
        
        console.log('💖 Анимация сердечек запущена');
    },

    stopHearts() {
        this.isRunning = false;
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }
        console.log('💖 Анимация сердечек остановлена');
    },

    createRandomHearts(count) {
        for (let i = 0; i < count; i++) {
            requestAnimationFrame(() => {
                if (this.heartCount < this.maxHearts) {
                    this.createHeart();
                }
            });
        }
    },

    createHeart() {
        if (!this.heartsContainer || this.heartCount >= this.maxHearts) return;

        const heart = document.createElement('div');
        heart.className = 'heart';
        
        const randomHeart = this.heartTypes[Math.floor(Math.random() * this.heartTypes.length)];
        heart.innerHTML = randomHeart;
        
        const x = Math.random() * window.innerWidth;
        const y = window.innerHeight + 20;
        
        heart.style.left = x + 'px';
        heart.style.top = y + 'px';
        
        const baseSize = this.isMobile ? 14 : 16;
        const size = baseSize + Math.random() * 12;
        heart.style.fontSize = size + 'px';
        
        const randomAnim = this.animationTypes[Math.floor(Math.random() * this.animationTypes.length)];
        heart.classList.add(randomAnim);
        
        const baseDuration = this.isMobile ? 8 : 10;
        const duration = baseDuration + Math.random() * 8;
        heart.style.animationDuration = duration + 's';
        
        const delay = Math.random() * 4;
        heart.style.animationDelay = delay + 's';
        
        const theme = document.documentElement.getAttribute('data-theme');
        heart.style.opacity = theme === 'light' ? '0.2' : '0.25';

        this.heartCount++;
        
        const removeHeart = () => {
            if (heart.parentNode) {
                heart.parentNode.removeChild(heart);
                this.heartCount--;
            }
        };

        heart.addEventListener('animationend', removeHeart);
        heart.addEventListener('animationcancel', removeHeart);

        this.heartsContainer.appendChild(heart);
    },

    clearHearts() {
        if (this.heartsContainer) {
            const hearts = this.heartsContainer.querySelectorAll('.heart');
            hearts.forEach(heart => {
                heart.style.animation = 'none';
                heart.style.opacity = '0';
                heart.style.transition = 'opacity 0.5s ease';
                
                setTimeout(() => {
                    if (heart.parentNode) {
                        heart.parentNode.removeChild(heart);
                    }
                }, 500);
            });
            
            this.heartCount = 0;
        }
    },

    setIntensity(intensity) {
        this.maxHearts = Math.max(15, Math.min(40, intensity));
        
        if (this.isRunning) {
            this.stopHearts();
            this.startHearts();
        }
    },

    getStats() {
        return {
            isRunning: this.isRunning,
            heartCount: this.heartCount,
            maxHearts: this.maxHearts,
            isMobile: this.isMobile
        };
    },

    restart() {
        this.stopHearts();
        this.clearHearts();
        this.startHearts();
    }
};

window.addEventListener('resize', () => {
    clearTimeout(HeartAnimation.resizeTimeout);
    HeartAnimation.resizeTimeout = setTimeout(() => {
        HeartAnimation.handleResize();
    }, 250);
});

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        HeartAnimation.init();
        HeartAnimation.startHearts();
    }, 1000);
});

window.HeartAnimation = HeartAnimation;
