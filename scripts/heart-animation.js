// Анимация сердечек с увеличенным количеством
const HeartAnimation = {
    heartsContainer: null,
    animationInterval: null,
    isRunning: false,
    heartCount: 0,
    maxHearts: 25, // УВЕЛИЧЕНО количество сердечек
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
        this.maxHearts = this.isMobile ? 15 : 25; // УВЕЛИЧЕНО на мобильных
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
                    opacity: 0.2; /* УВЕЛИЧЕНА прозрачность */
                    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.05));
                }

                [data-theme="dark"] .heart {
                    opacity: 0.3; /* УВЕЛИЧЕНА прозрачность */
                    filter: drop-shadow(0 2px 6px rgba(0,0,0,0.15));
                }

                .heart.float {
                    animation: floatUp 8s ease-in-out forwards;
                }

                .heart.float-slow {
                    animation: floatUp 12s ease-in-out forwards;
                }

                .heart.float-fast {
                    animation: floatUp 5s ease-in-out forwards;
                }

                .heart.spin {
                    animation: floatUpSpin 10s ease-in-out forwards;
                }

                .heart.bounce {
                    animation: floatUpBounce 7s ease-in-out forwards;
                }

                .heart.drift {
                    animation: floatUpDrift 9s ease-in-out forwards;
                }

                @keyframes floatUp {
                    0% {
                        transform: translateY(0) rotate(0deg) scale(0.7);
                        opacity: 0.1;
                    }
                    50% {
                        transform: translateY(-200px) rotate(180deg) scale(0.9);
                        opacity: 0.3; /* УВЕЛИЧЕНА видимость */
                    }
                    100% {
                        transform: translateY(-400px) rotate(360deg) scale(0.5);
                        opacity: 0;
                    }
                }

                @keyframes floatUpSpin {
                    0% {
                        transform: translateY(0) rotate(0deg) scale(0.7);
                        opacity: 0.1;
                    }
                    100% {
                        transform: translateY(-350px) rotate(360deg) scale(0.5);
                        opacity: 0;
                    }
                }

                @keyframes floatUpBounce {
                    0%, 100% {
                        transform: translateY(0);
                        opacity: 0.1;
                    }
                    50% {
                        transform: translateY(-250px);
                        opacity: 0.3; /* УВЕЛИЧЕНА видимость */
                    }
                    100% {
                        transform: translateY(-400px);
                        opacity: 0;
                    }
                }

                @keyframes floatUpDrift {
                    0% {
                        transform: translateY(0) translateX(0) rotate(0deg);
                        opacity: 0.1;
                    }
                    100% {
                        transform: translateY(-380px) translateX(50px) rotate(360deg);
                        opacity: 0;
                    }
                }

                @media (max-width: 768px) {
                    .heart {
                        font-size: 14px !important; /* УВЕЛИЧЕН размер на мобильных */
                    }
                    
                    @keyframes floatUp {
                        100% {
                            transform: translateY(-200px) rotate(360deg);
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
        
        const creationInterval = this.isMobile ? 1500 : 1000; // УВЕЛИЧЕНА частота создания
        const heartsPerInterval = this.isMobile ? 2 : 3; // УВЕЛИЧЕНО количество за раз
        
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
        const y = window.innerHeight + 50;
        
        heart.style.left = x + 'px';
        heart.style.top = y + 'px';
        
        const baseSize = this.isMobile ? 14 : 16; // УВЕЛИЧЕН размер
        const size = baseSize + Math.random() * 10;
        heart.style.fontSize = size + 'px';
        
        const randomAnim = this.animationTypes[Math.floor(Math.random() * this.animationTypes.length)];
        heart.classList.add(randomAnim);
        
        const baseDuration = this.isMobile ? 6 : 8; // УВЕЛИЧЕНА длительность
        const duration = baseDuration + Math.random() * 6;
        heart.style.animationDuration = duration + 's';
        
        const delay = Math.random() * 3; // УВЕЛИЧЕНА задержка
        heart.style.animationDelay = delay + 's';
        
        const theme = document.documentElement.getAttribute('data-theme');
        heart.style.opacity = theme === 'light' ? '0.15' : '0.25';

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
        this.maxHearts = Math.max(15, Math.min(40, intensity)); // УВЕЛИЧЕН диапазон
        
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
