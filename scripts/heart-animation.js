// Анимация сердечек
const HeartAnimation = {
    heartsContainer: null,
    animationInterval: null,
    isRunning: false,

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
            this.createRandomHearts(2 + Math.floor(Math.random() * 2)); // 2-3 сердечка
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
                this.createHeart();
            }, i * 200); // Небольшая задержка между созданиями
        }
    },

    createHeart() {
        if (!this.heartsContainer) return;

        const heart = document.createElement('div');
        heart.className = 'heart';
        heart.innerHTML = '💖';
        
        // Случайная начальная позиция с любой стороны экрана
        const startPosition = this.getRandomStartPosition();
        heart.style.left = startPosition.x + 'px';
        heart.style.top = startPosition.y + 'px';
        
        // Случайный размер
        const size = 16 + Math.random() * 24; // 16-40px
        heart.style.fontSize = size + 'px';
        
        // Случайный тип анимации
        const animations = ['spin-left', 'spin-right', 'spin-slow', ''];
        const randomAnim = animations[Math.floor(Math.random() * animations.length)];
        if (randomAnim) {
            heart.classList.add(randomAnim);
        }
        
        // Случайная длительность анимации (3-8 секунд)
        const duration = 3 + Math.random() * 5;
        heart.style.animationDuration = duration + 's';
        
        // Случайная задержка
        heart.style.animationDelay = (Math.random() * 2) + 's';
        
        // Удаляем сердечко после завершения анимации
        heart.addEventListener('animationend', () => {
            if (heart.parentNode) {
                heart.parentNode.removeChild(heart);
            }
        });
        
        this.heartsContainer.appendChild(heart);
    },

    getRandomStartPosition() {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        // Выбираем случайную сторону для появления
        const side = Math.floor(Math.random() * 4); // 0: верх, 1: право, 2: низ, 3: лево
        
        switch(side) {
            case 0: // Верх
                return {
                    x: Math.random() * screenWidth,
                    y: -50
                };
            case 1: // Право
                return {
                    x: screenWidth + 50,
                    y: Math.random() * screenHeight
                };
            case 2: // Низ
                return {
                    x: Math.random() * screenWidth,
                    y: screenHeight + 50
                };
            case 3: // Лево
                return {
                    x: -50,
                    y: Math.random() * screenHeight
                };
            default:
                return { x: Math.random() * screenWidth, y: -50 };
        }
    },

    clearHearts() {
        if (this.heartsContainer) {
            this.heartsContainer.innerHTML = '';
        }
    }
};

// Создаем глобальную ссылку
window.HeartAnimation = HeartAnimation;
