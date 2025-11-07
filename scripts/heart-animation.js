// Анимация сердечек
const HeartAnimation = {
    heartsContainer: null,
    animationInterval: null,
    isRunning: false,
    heartCount: 0,
    maxHearts: 80,

    // Разные виды сердечек
    heartTypes: [
        '💖', '💗', '💓', '💘', '💝', '💕', '💞', '❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '❣️'
    ],

    // Типы анимаций (соответствуют CSS классам)
    animationTypes: ['float', 'float-slow', 'float-fast', 'spin', 'bounce'],

    init() {
        try {
            this.heartsContainer = document.getElementById('heartsContainer');
            if (!this.heartsContainer) {
                console.warn('⚠️ Контейнер для сердечек не найден, создаем новый');
                this.createHeartsContainer();
            }
            
            this.addHeartStyles(); // Добавляем CSS стили
            console.log('💖 Анимация сердечек инициализирована');
            
        } catch (error) {
            console.error('❌ Ошибка инициализации сердечек:', error);
        }
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
                }

                /* Анимация плавного всплывания */
                .heart.float {
                    animation: floatUp 8s ease-in-out forwards;
                }

                .heart.float-slow {
                    animation: floatUp 12s ease-in-out forwards;
                }

                .heart.float-fast {
                    animation: floatUp 5s ease-in-out forwards;
                }

                /* Анимация с вращением */
                .heart.spin {
                    animation: floatUpSpin 10s ease-in-out forwards;
                }

                /* Анимация с подпрыгиванием */
                .heart.bounce {
                    animation: floatUpBounce 7s ease-in-out forwards;
                }

                @keyframes floatUp {
                    0% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 0.8;
                    }
                    50% {
                        transform: translateY(-100px) rotate(180deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-250px) rotate(360deg);
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

                /* Адаптивность для мобильных */
                @media (max-width: 768px) {
                    .heart {
                        font-size: 20px !important;
                    }
                    
                    @keyframes floatUp {
                        100% {
                            transform: translateY(-200px) rotate(360deg);
                        }
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
        
        // Создаем сердечки каждую секунду
        this.animationInterval = setInterval(() => {
            if (this.heartCount < this.maxHearts) {
                this.createRandomHearts(2 + Math.floor(Math.random() * 3)); // 2-4 сердечка
            }
        }, 800); // Чаще создаем сердечки
        
        console.log('💖 Анимация сердечек запущена');
    },

    stopHearts() {
        this.isRunning = false;
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }
        this.clearHearts();
        console.log('💖 Анимация сердечек остановлена');
    },

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
        
        // Случайный размер
        const size = 18 + Math.random() * 30;
        heart.style.fontSize = size + 'px';
        
        // Случайная анимация
        const randomAnim = this.animationTypes[Math.floor(Math.random() * this.animationTypes.length)];
        heart.classList.add(randomAnim);
        
        // Случайные параметры анимации
        const duration = 4 + Math.random() * 8;
        heart.style.animationDuration = duration + 's';
        
        const delay = Math.random() * 3;
        heart.style.animationDelay = delay + 's';
        
        // Случайная прозрачность и цветовые эффекты
        heart.style.opacity = 0.6 + Math.random() * 0.4;
        
        // Случайное смещение по X для разнообразия траекторий
        if (Math.random() > 0.5) {
            heart.style.setProperty('--random-x', (Math.random() * 100 - 50) + 'px');
        }

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

    getSafePosition() {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        // Ищем все контейнеры которые нужно избегать
        const questionContainer = document.querySelector('.container, .question-content, .screen.active');
        const avoidElements = questionContainer ? [questionContainer] : [];
        
        // Пытаемся найти безопасную позицию
        for (let i = 0; i < 15; i++) {
            const position = this.getRandomEdgePosition(screenWidth, screenHeight);
            
            let isSafe = true;
            for (const element of avoidElements) {
                const rect = element.getBoundingClientRect();
                const buffer = 80; // Больший буфер
                
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
        
        // Если не нашли - возвращаем позицию по краю
        return this.getRandomEdgePosition(screenWidth, screenHeight);
    },

    getRandomEdgePosition(screenWidth, screenHeight) {
        const side = Math.floor(Math.random() * 4);
        const offset = 30;
        
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
            this.heartsContainer.innerHTML = '';
            this.heartCount = 0;
        }
    },

    // Обновление при ресайзе
    handleResize() {
        if (this.isRunning) {
            this.clearHearts();
        }
    },

    // Плавное изменение интенсивности
    setIntensity(intensity) {
        this.maxHearts = Math.max(20, Math.min(100, intensity));
    }
};

// Слушаем ресайз окна
window.addEventListener('resize', () => {
    HeartAnimation.handleResize();
});

// Автоматическая инициализация
document.addEventListener('DOMContentLoaded', () => {
    HeartAnimation.init();
});

window.HeartAnimation = HeartAnimation;
