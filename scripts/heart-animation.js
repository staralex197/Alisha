// Анимация сердечек с полной адаптивностью
const HeartAnimation = {
    heartsContainer: null,
    animationInterval: null,
    isRunning: false,
    heartCount: 0,
    maxHearts: 80,
    isMobile: false,
    lastResize: 0,
    resizeTimeout: null,

    // Разные виды сердечек
    heartTypes: [
        '💖', '💗', '💓', '💘', '💝', '💕', '💞', '❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '❣️'
    ],

    // Типы анимаций
    animationTypes: ['float', 'float-slow', 'float-fast', 'spin', 'bounce', 'drift'],

    init() {
        try {
            this.detectDeviceType();
            this.heartsContainer = document.getElementById('heartsContainer');
            
            if (!this.heartsContainer) {
                console.warn('⚠️ Контейнер для сердечек не найден, создаем новый');
                this.createHeartsContainer();
            }
            
            this.addHeartStyles();
            this.setupEventListeners();
            
            console.log('💖 Анимация сердечек инициализирована');
            
        } catch (error) {
            console.error('❌ Ошибка инициализации сердечек:', error);
        }
    },

    // Определение типа устройства
    detectDeviceType() {
        this.isMobile = window.innerWidth <= 768;
        this.maxHearts = this.isMobile ? 40 : 80; // Меньше сердечек на мобильных
        console.log(`💖 Сердечки: ${this.isMobile ? 'Мобильный режим' : 'Десктоп режим'}`);
    },

    // Создаем контейнер если не существует
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
            z-index: 1;
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

        // Touch события для мобильных
        if (this.isMobile) {
            document.addEventListener('touchstart', () => {
                this.createBurstHearts(3);
            });
        }
    },

    // Обработка ресайза с оптимизацией
    handleResize() {
        const now = Date.now();
        if (now - this.lastResize < 100) return; // Debounce
        
        this.lastResize = now;
        
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
                    z-index: 1;
                    animation-timing-function: ease-in-out;
                    will-change: transform, opacity;
                    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
                }

                /* Базовые анимации */
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

                /* Ключевые кадры анимаций */
                @keyframes floatUp {
                    0% {
                        transform: translateY(0) rotate(0deg) scale(0.8);
                        opacity: 0.7;
                    }
                    20% {
                        transform: translateY(-50px) rotate(90deg) scale(1);
                        opacity: 0.9;
                    }
                    50% {
                        transform: translateY(-150px) rotate(180deg) scale(1.1);
                        opacity: 1;
                    }
                    80% {
                        transform: translateY(-250px) rotate(270deg) scale(0.9);
                        opacity: 0.8;
                    }
                    100% {
                        transform: translateY(-350px) rotate(360deg) scale(0.6);
                        opacity: 0;
                    }
                }

                @keyframes floatUpSpin {
                    0% {
                        transform: translateY(0) rotate(0deg) scale(0.8);
                        opacity: 0.7;
                    }
                    30% {
                        transform: translateY(-80px) rotate(120deg) scale(1.1);
                        opacity: 1;
                    }
                    70% {
                        transform: translateY(-180px) rotate(240deg) scale(1);
                        opacity: 0.8;
                    }
                    100% {
                        transform: translateY(-300px) rotate(360deg) scale(0.6);
                        opacity: 0;
                    }
                }

                @keyframes floatUpBounce {
                    0%, 100% {
                        transform: translateY(0);
                        opacity: 0.7;
                    }
                    25% {
                        transform: translateY(-60px) translateX(20px);
                    }
                    50% {
                        transform: translateY(-120px) translateX(-10px);
                        opacity: 1;
                    }
                    75% {
                        transform: translateY(-180px) translateX(15px);
                    }
                    100% {
                        transform: translateY(-250px) translateX(0);
                        opacity: 0;
                    }
                }

                @keyframes floatUpDrift {
                    0% {
                        transform: translateY(0) translateX(0) rotate(0deg);
                        opacity: 0.7;
                    }
                    33% {
                        transform: translateY(-100px) translateX(30px) rotate(120deg);
                        opacity: 0.9;
                    }
                    66% {
                        transform: translateY(-200px) translateX(-20px) rotate(240deg);
                        opacity: 0.8;
                    }
                    100% {
                        transform: translateY(-320px) translateX(10px) rotate(360deg);
                        opacity: 0;
                    }
                }

                /* Адаптивность для мобильных */
                @media (max-width: 768px) {
                    .heart {
                        font-size: 20px !important;
                    }
                    
                    @keyframes floatUp {
                        100% {
                            transform: translateY(-250px) rotate(360deg);
                        }
                    }
                    
                    @keyframes floatUpSpin {
                        100% {
                            transform: translateY(-200px) rotate(360deg);
                        }
                    }
                    
                    @keyframes floatUpBounce {
                        100% {
                            transform: translateY(-180px) translateX(0);
                        }
                    }
                }

                /* Поддержка reduced-motion */
                @media (prefers-reduced-motion: reduce) {
                    .heart {
                        animation: none !important;
                        opacity: 0.3;
                    }
                }

                /* Темная тема оптимизация */
                [data-theme="dark"] .heart {
                    filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4));
                }

                [data-theme="light"] .heart {
                    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    },

    startHearts() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.clearHearts();
        
        // Разная частота создания сердечек в зависимости от устройства
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

    // Создание группы случайных сердечек
    createRandomHearts(count) {
        for (let i = 0; i < count; i++) {
            // Используем requestAnimationFrame для лучшей производительности
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
        
        // Безопасная позиция (избегаем контейнер с вопросами)
        const safePosition = this.getSafePosition();
        if (!safePosition) return;
        
        heart.style.left = safePosition.x + 'px';
        heart.style.top = safePosition.y + 'px';
        
        // Размер в зависимости от устройства
        const baseSize = this.isMobile ? 16 : 18;
        const size = baseSize + Math.random() * (this.isMobile ? 20 : 30);
        heart.style.fontSize = size + 'px';
        
        // Случайная анимация
        const randomAnim = this.animationTypes[Math.floor(Math.random() * this.animationTypes.length)];
        heart.classList.add(randomAnim);
        
        // Случайные параметры анимации
        const baseDuration = this.isMobile ? 6 : 8;
        const duration = baseDuration + Math.random() * 6;
        heart.style.animationDuration = duration + 's';
        
        const delay = Math.random() * 2;
        heart.style.animationDelay = delay + 's';
        
        // Случайная прозрачность
        heart.style.opacity = 0.6 + Math.random() * 0.4;
        
        // Случайный цветовой оттенок
        this.applyRandomColor(heart);

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

    // Создание всплеска сердечек (для тач-событий)
    createBurstHearts(count) {
        if (!this.isRunning) return;
        
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                this.createHeart();
            }, i * 100);
        }
    },

    // Применение случайного цветового оттенка
    applyRandomColor(heart) {
        const hue = Math.random() * 360;
        const saturation = 70 + Math.random() * 30;
        const lightness = 50 + Math.random() * 20;
        
        heart.style.filter += ` hue-rotate(${hue}deg) saturate(${saturation}%) brightness(${lightness}%)`;
    },

    // Получение безопасной позиции для сердечка
    getSafePosition() {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        // Ищем все контейнеры которые нужно избегать
        const questionContainer = document.querySelector('.container, .question-content, .screen.active');
        const playerContainer = document.querySelector('.music-player');
        const avoidElements = [];
        
        if (questionContainer) avoidElements.push(questionContainer);
        if (playerContainer) avoidElements.push(playerContainer);
        
        // Пытаемся найти безопасную позицию (больше попыток на мобильных)
        const maxAttempts = this.isMobile ? 20 : 15;
        
        for (let i = 0; i < maxAttempts; i++) {
            const position = this.getRandomEdgePosition(screenWidth, screenHeight);
            
            let isSafe = true;
            for (const element of avoidElements) {
                const rect = element.getBoundingClientRect();
                const buffer = this.isMobile ? 100 : 80; // Больший буфер на мобильных
                
                const isOverlapping = 
                    position.x >= rect.left - buffer && 
                    position.x <= rect.right + buffer &&
                    position.y >= rect.top - buffer && 
                    position.y <= rect.bottom + buffer;
                
                if (isOverlapping) {
                    isSafe = false;
                    break;
                }
            }
            
            if (isSafe) {
                return position;
            }
        }
        
        // Если не нашли безопасную позицию - возвращаем позицию по краю
        return this.getRandomEdgePosition(screenWidth, screenHeight);
    },

    // Генерация случайной позиции по краям экрана
    getRandomEdgePosition(screenWidth, screenHeight) {
        const side = Math.floor(Math.random() * 4);
        const offset = this.isMobile ? 40 : 30;
        
        switch(side) {
            case 0: // Верх
                return {
                    x: Math.random() * screenWidth,
                    y: -offset
                };
            case 1: // Право
                return {
                    x: screenWidth + offset,
                    y: Math.random() * screenHeight
                };
            case 2: // Низ
                return {
                    x: Math.random() * screenWidth,
                    y: screenHeight + offset
                };
            case 3: // Лево
                return {
                    x: -offset,
                    y: Math.random() * screenHeight
                };
            default:
                return { x: Math.random() * screenWidth, y: -offset };
        }
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
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
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

// Экспорт для модульных систем
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HeartAnimation;
}
