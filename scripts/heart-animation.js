// Анимация сердечек
const HeartAnimation = {
    heartsContainer: null,
    animationInterval: null,
    isRunning: false,
    heartCount: 0,
    maxHearts: 50,

    init() {
        this.heartsContainer = document.getElementById('heartsContainer');
        if (!this.heartsContainer) {
            console.error('Контейнер для сердечек не найден');
            return;
        }
        console.log('💖 Анимация сердечек инициализирована');
    },

    startHearts() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.clearHearts();
        
        // Создаем 2-3 сердечка в секунду
        this.animationInterval = setInterval(() => {
            if (this.heartCount < this.maxHearts) {
                this.createRandomHearts(2 + Math.floor(Math.random() * 2)); // 2-3 сердечка
            }
        }, 1000);
        
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
            setTimeout(() => {
                if (this.heartCount < this.maxHearts) {
                    this.createHeart();
                }
            }, i * 300); // Задержка между созданиями
        }
    },

    createHeart() {
        if (!this.heartsContainer) return;

        const heart = document.createElement('div');
        heart.className = 'heart';
        heart.innerHTML = '💖';
        
        // Получаем безопасную позицию
        const safePosition = this.getSafePosition();
        if (!safePosition) return; // Не нашли безопасную позицию
        
        heart.style.left = safePosition.x + 'px';
        heart.style.top = safePosition.y + 'px';
        
        // Случайный размер (16-40px)
        const size = 16 + Math.random() * 24;
        heart.style.fontSize = size + 'px';
        
        // Случайный тип анимации
        const animations = ['spin-left', 'spin-right', 'spin-slow', 'spin-fast', ''];
        const randomAnim = animations[Math.floor(Math.random() * animations.length)];
        if (randomAnim) {
            heart.classList.add(randomAnim);
        }
        
        // Случайная длительность анимации (3-8 секунд)
        const duration = 3 + Math.random() * 5;
        heart.style.animationDuration = duration + 's';
        
        // Случайная задержка
        heart.style.animationDelay = (Math.random() * 2) + 's';
        
        // Случайная прозрачность
        heart.style.opacity = 0.7 + Math.random() * 0.3;
        
        // Увеличиваем счетчик
        this.heartCount++;
        
        // Удаляем сердечко после завершения анимации
        heart.addEventListener('animationend', () => {
            if (heart.parentNode) {
                heart.parentNode.removeChild(heart);
                this.heartCount--;
            }
        });

        this.heartsContainer.appendChild(heart);
    },

    getSafePosition() {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const container = document.querySelector('.container');
        
        if (!container) {
            return this.getRandomEdgePosition(screenWidth, screenHeight);
        }
        
        const containerRect = container.getBoundingClientRect();
        
        // Пытаемся найти безопасную позицию (макс 10 попыток)
        for (let i = 0; i < 10; i++) {
            const position = this.getRandomEdgePosition(screenWidth, screenHeight);
            
            // Проверяем не попадает ли позиция в контейнер или близко к нему
            const buffer = 50; // буферная зона вокруг контейнера
            const isInContainer = 
                position.x >= containerRect.left - buffer && 
                position.x <= containerRect.right + buffer &&
                position.y >= containerRect.top - buffer && 
                position.y <= containerRect.bottom + buffer;
            
            if (!isInContainer) {
                return position;
            }
        }
        
        // Если не нашли безопасную позицию, возвращаем случайную на краю
        return this.getRandomEdgePosition(screenWidth, screenHeight);
    },

    getRandomEdgePosition(screenWidth, screenHeight) {
        // Выбираем случайную сторону для появления (0: верх, 1: право, 2: низ, 3: лево)
        const side = Math.floor(Math.random() * 4);
        const offset = 20; // Отступ от края
        
        switch(side) {
            case 0: // Верх
                return {
                    x: Math.random() * (screenWidth - 100) + 50,
                    y: -offset
                };
            case 1: // Право
                return {
                    x: screenWidth + offset,
                    y: Math.random() * (screenHeight - 100) + 50
                };
            case 2: // Низ
                return {
                    x: Math.random() * (screenWidth - 100) + 50,
                    y: screenHeight + offset
                };
            case 3: // Лево
                return {
                    x: -offset,
                    y: Math.random() * (screenHeight - 100) + 50
                };
            default:
                return { 
                    x: Math.random() * (screenWidth - 100) + 50, 
                    y: -offset 
                };
        }
    },

    clearHearts() {
        if (this.heartsContainer) {
            this.heartsContainer.innerHTML = '';
            this.heartCount = 0;
        }
    },

    // Обновление позиций при ресайзе
    handleResize() {
        // При изменении размера окна пересоздаем сердечки
        if (this.isRunning) {
            this.clearHearts();
        }
    }
};

// Слушаем ресайз окна
window.addEventListener('resize', () => {
    HeartAnimation.handleResize();
});

// Создаем глобальную ссылку
window.HeartAnimation = HeartAnimation;
