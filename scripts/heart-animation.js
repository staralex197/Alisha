// Анимация сердечек с правильным z-index и светлой темой
const HeartAnimation = {
    heartsContainer: null,
    animationInterval: null,
    isRunning: false,
    heartCount: 0,
    maxHearts: 30, // Меньше сердечек
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
        this.maxHearts = this.isMobile ? 20 : 30;
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
            z-index: 0; /* Сердечки ПОД всем контентом */
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
                    z-index: 0;
                    animation-timing-function: ease-in-out;
                    will-change: transform, opacity;
                    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
                }

                /* Светлые сердечки для светлой темы */
                [data-theme="light"] .heart {
                    opacity: 0.6;
                    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.05));
                }

                [data-theme="dark"] .heart {
                    opacity: 0.8;
                    filter: drop-shadow(0 2px 6px rgba(0,0,0,0.2));
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
                        transform: translateY(0) rotate(0deg) scale(0.8);
                        opacity: 0.7;
                    }
                    50% {
                        transform: translateY(-200px) rotate(180deg) scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-400px) rotate(360deg) scale(0.6);
                        opacity: 0;
                    }
                }

                @keyframes floatUpSpin {
                    0% {
                        transform: translateY(0) rotate(0deg) scale(0.8);
                        opacity: 0.7;
                    }
                    100% {
                        transform: translateY(-350px) rotate(360deg) scale(0.6);
                        opacity: 0;
                    }
                }

                @keyframes floatUpBounce {
                    0%, 100% {
                        transform: translateY(0);
                        opacity: 0.7;
                    }
                    50% {
                        transform: translateY(-250px);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-400px);
                        opacity: 0;
                    }
                }

                @keyframes floatUpDrift {
                    0% {
                        transform: translateY(0) translateX(0) rotate(0deg);
                        opacity: 0.7;
                    }
                    100% {
                        transform: translateY(-380px) translateX(50px) rotate(360deg);
                        opacity: 0;
                    }
                }

                /* Адаптивность для мобильных */
                @media (max-width: 768px) {
                    .heart {
                        font-size: 18px !important;
                    }
                    
                    @keyframes floatUp {
                        100% {
                            transform: translateY(-300px) rotate(360deg);
                        }
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .heart {
                        animation: none !important;
                        opacity: 0.3;
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
        
        const creationInterval = this.isMobile ? 1500 : 1000;
        const heartsPerInterval = this.isMobile ? 1 : 2;
        
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

    // Создание одного сердечка
    createHeart() {
        if (!this.heartsContainer || this.heartCount >= this.maxHearts) return;

        const heart = document.createElement('div');
        heart.className = 'heart';
        
        // Случайное сердечко
        const randomHeart = this.heartTypes[Math.floor(Math.random() * this.heartTypes.length)];
        heart.innerHTML = randomHeart;
        
        // Случайная позиция по всей площади экрана
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        
        heart.style.left = x + 'px';
        heart.style.top = y + 'px';
        
        // Размер в зависимости от устройства
        const baseSize = this.isMobile ? 14 : 16;
        const size = baseSize + Math.random() * 20;
        heart.style.fontSize = size + 'px';
        
        // Случайная анимация
        const randomAnim = this.animationTypes[Math.floor(Math.random() * this.animationTypes.length)];
        heart.classList.add(randomAnim);
        
        // Случайные параметры анимации
        const baseDuration = this.isMobile ? 8 : 10;
        const duration = baseDuration + Math.random() * 8;
        heart.style.animationDuration = duration + 's';
        
        const delay = Math.random() * 3;
        heart.style.animationDelay = delay + 's';
        
        // Прозрачность в зависимости от темы
        const theme = document.documentElement.getAttribute('data-theme');
        heart.style.opacity = theme === 'light' ? 0.4 + Math.random() * 0.3 : 0.6 + Math.random() * 0.4;

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
            // Плавное исчезновение вместо мгновенного удаления
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
        this.maxHearts = Math.max(20, Math.min(100, intensity));
        
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
    }, 1000);
});

// Глобальные методы для отладки
window.HeartAnimation = HeartAnimation;

// Hotkeys для разработки (только в development)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'h') {
            e.preventDefault();
            if (HeartAnimation.isRunning) {
                HeartAnimation.stopHearts();
                console.log('💖 Анимация остановлена (debug)');
            } else {
                HeartAnimation.startHearts();
                console.log('💖 Анимация запущена (debug)');
            }
        }
        
        if (e.ctrlKey && e.key === 'r') {
            e.preventDefault();
            HeartAnimation.restart();
            console.log('💖 Анимация перезапущена (debug)');
        }
    });
}
