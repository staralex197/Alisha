// Библиотека стихотворений
const PoemsLibrary = {
    poems: [],

    async loadPoems() {
        try {
            const response = await fetch('data/poems.json');
            const data = await response.json();
            this.poems = data.poems;
            console.log('✅ Библиотека стихотворений загружена:', this.poems.length, 'стихотворений');
        } catch (error) {
            console.error('Ошибка загрузки библиотеки стихотворений:', error);
            // Резервная база
            this.poems = this.getFallbackPoems();
        }
    },

    getFallbackPoems() {
        return [
            {
                "title": "Любовь вечна",
                "author": "Искренние чувства",
                "year": "2024",
                "text": "Любовь - это то, что делает нас сильнее,\nТо, что дарит нам крылья и заставляет парить.\nВ каждом взгляде, в каждом слове, в каждом жесте\nМы находим отражение того, кого готовы любить."
            }
        ];
    },

    getRandomPoem() {
        if (this.poems.length === 0) {
            return this.getFallbackPoems()[0];
        }
        const randomIndex = Math.floor(Math.random() * this.poems.length);
        return this.poems[randomIndex];
    }
};

// Загружаем стихи при инициализации
PoemsLibrary.loadPoems();
