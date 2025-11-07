// Анимация сердечек с правильным z-index и светлой темой
const HeartAnimation = {
    heartsContainer: null,
    animationInterval: null,
    isRunning: false,
    heartCount: 0,
    maxHearts: 15, // Меньше сердечек
    isMobile: false,
    resizeTimeout: null,

    // Более светлые сердечки для светлой темы
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
        this.maxHearts = this.isMobile ? 8 : 15; // Еще меньше сердечек на мобильных
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
            z-index: -1; /* Сердечки ПОД всем контентом */
            overflow: hidden;
        `;
        document.body.appendChild(this.heartsContainer);
    },

    // Настройка слушателей событий
    setupEventListeners() {
        // Оптимизированный ресайз с debounce
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Остановка анимации при скрытии страницы
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopHearts();
            } else if (this.isRunning) {
                this.startHearts();
            }
        });
    },

    // Обработка ресайза с оптимизацией
    handleResize() {
        const now = Date.now();
        
        // Очищаем предыдущий таймаут
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

    // Добавляем CSS стили для анимаций
    addHeartStyles() {
        if (document.getElementById('heart-styles')) return;

        const styles = `
            <style id="heart-styles">
                .heart {
                    position: absolute;
                    pointer-events: none;
                    user-select: none;
                    z-index: -1; /* Сердечки под всем контентом */
                    animation-timing-function: ease-in-out;
                    will-change: transform, opacity;
                    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
                }

                /* СВЕТЛЫЕ сердечки для светлой темы */
                [data-theme="light"] .heart {
                    opacity: 0.15; /* Еще более прозрачные */
                    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.05));
                }

                [data-theme="dark"] .heart {
                    opacity: 0.25;
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
                        opacity: 0.2;
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
                        opacity: 0.2;
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

                /* Адаптивность для мобильных */
                @media (max-width: 768px) {
                    .heart {
                        font-size: 12px !important;
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
        
        const creationInterval = this.isMobile ? 2000 : 1500;
        const heartsPerInterval = this.isMobile ? 1 : 1;
        
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

    // Создание группы случайных сердечек
    createRandomHearts(count) {
        for (let i = 0; i < count; i++) {
            requestAnimationFrame(() => {
                if (this.heartCount < this.maxHearts) {
                    this.createHeart();
                }
            });
        }
    },

    // Создание одного сердечка - генерируем по всей площади экрана
    createHeart() {
        if (!this.heartsContainer || this.heartCount >= this.maxHearts) return;

        const heart = document.createElement('div');
        heart.className = 'heart';
        
        // Случайное сердечко
        const randomHeart = this.heartTypes[Math.floor(Math.random() * this.heartTypes.length)];
        heart.innerHTML = randomHeart;
        
        // Случайная позиция по ВСЕЙ ПЛОЩАДИ ЭКРАНА
        const x = Math.random() * window.innerWidth;
        const y = window.innerHeight + 50; // Начинаем ниже экрана
        
        heart.style.left = x + 'px';
        heart.style.top = y + 'px';
        
        // Меньший размер
        const baseSize = this.isMobile ? 10 : 12;
        const size = baseSize + Math.random() * 8;
        heart.style.fontSize = size + 'px';
        
        // Случайная анимация
        const randomAnim = this.animationTypes[Math.floor(Math.random() * this.animationTypes.length)];
        heart.classList.add(randomAnim);
        
        // Случайные параметры анимации
        const baseDuration = this.isMobile ? 5 : 7;
        const duration = baseDuration + Math.random() * 5;
        heart.style.animationDuration = duration + 's';
        
        const delay = Math.random() * 2;
        heart.style.animationDelay = delay + 's';
        
        // Еще более прозрачные сердечки
        const theme = document.documentElement.getAttribute('data-theme');
        heart.style.opacity = theme === 'light' ? '0.08' : '0.12';

        this.heartCount++;
        
        // Удаляем после анимации
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

    // Плавное изменение интенсивности
    setIntensity(intensity) {
        this.maxHearts = Math.max(8, Math.min(30, intensity));
        
        if (this.isRunning) {
            this.stopHearts();
            this.startHearts();
        }
    },

    // Получение статистики
    getStats() {
        return {
            isRunning: this.isRunning,
            heartCount: this.heartCount,
            maxHearts: this.maxHearts,
            isMobile: this.isMobile
        };
    },

    // Перезапуск анимации
    restart() {
        this.stopHearts();
        this.clearHearts();
        this.startHearts();
    }
};

// Оптимизированный слушатель ресайза
window.addEventListener('resize', () => {
    clearTimeout(HeartAnimation.resizeTimeout);
    HeartAnimation.resizeTimeout = setTimeout(() => {
        HeartAnimation.handleResize();
    }, 250);
});

// Автоматическая инициализация
document.addEventListener('DOMContentLoaded', () => {
    // Задержка для параллельной загрузки ресурсов
    setTimeout(() => {
        HeartAnimation.init();
        HeartAnimation.startHearts();
    }, 1000);
});

// Глобальные методы для отладки
window.HeartAnimation = HeartAnimation;
