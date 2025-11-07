// Основная логика приложения
const QuizApp = {
    // Конфигурация
    config: {
        BOT_TOKEN: '8519621124:AAEtDBYSAeNW16UQiAGy0epAwwt989v9Tzs',
        CHAT_ID: '1490495592',
        JSONBIN_ID: '690bda1cae596e708f473589',
        JSONBIN_API_KEY: '$2a$10$nFkbrwHZpy3T9KrGUS6RxecAFiNTyKuGe.DZjFqoWYEUcbGS27YRC'
    },

    // Глобальные переменные
    userAnswers: {},
    currentQuestion: 0,
    questions: [],
    isLoading: true,

    // Инициализация приложения
    async init() {
        console.log('🚀 Инициализация приложения...');
        
        // Показываем экран загрузки
        this.showLoadingScreen();
        
        try {
            // Загружаем вопросы
            await this.loadQuestions();
            
            // Предзагрузка ресурсов
            await this.preloadResources();
            
            // Инициализация компонентов
            this.generateQuestionScreens();
            MusicPlayer.init();
            HeartAnimation.init();
            this.initColorInversion();
            
            // Завершение загрузки
            setTimeout(() => {
                this.hideLoadingScreen();
                this.showWelcomeScreen();
            }, 800);
            
        } catch (error) {
            console.error('Ошибка инициализации:', error);
            this.showErrorScreen();
        }
    },

    // Показать экран загрузки
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        const progressBar = document.getElementById('loadingProgress');
        
        if (loadingScreen) {
            loadingScreen.classList.add('active');
            
            // Анимация прогресс-бара
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 25;
                if (progress > 95) progress = 95;
                progressBar.style.width = progress + '%';
                
                if (progress >= 95) {
                    clearInterval(interval);
                }
            }, 150);
        }
    },

    // Скрыть экран загрузки
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        const progressBar = document.getElementById('loadingProgress');
        
        if (loadingScreen && progressBar) {
            progressBar.style.width = '100%';
            
            setTimeout(() => {
                loadingScreen.classList.remove('active');
                loadingScreen.classList.add('hidden');
            }, 200);
        }
    },

    // Показать экран приветствия
    showWelcomeScreen() {
        this.nextScreen('screen-welcome');
        HeartAnimation.startHearts();
    },

    // Показать экран ошибки
    showErrorScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.innerHTML = `
                <div class="loading-content">
                    <div style="font-size: 3em; margin-bottom: 20px;">😔</div>
                    <h1>Что-то пошло не так</h1>
                    <p>Попробуйте обновить страницу</p>
                    <button class="btn btn-primary" onclick="window.location.reload()">Обновить</button>
                </div>
            `;
        }
    },

    // Предзагрузка ресурсов
    async preloadResources() {
        return new Promise((resolve) => {
            setTimeout(resolve, 600);
        });
    },

    // Загрузка вопросов
    async loadQuestions() {
        try {
            const response = await fetch(`https://api.jsonbin.io/v3/b/${this.config.JSONBIN_ID}/latest`, {
                headers: {
                    'X-Master-Key': this.config.JSONBIN_API_KEY,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.questions = data.record.questions || this.getDefaultQuestions();
            } else {
                this.questions = this.getDefaultQuestions();
            }
        } catch (error) {
            console.error('Ошибка загрузки вопросов:', error);
            this.questions = this.getDefaultQuestions();
        }
    },

    // Резервные вопросы
    getDefaultQuestions() {
        return [
            {
                id: 1,
                text: "Опиши, в чём твоя самая сильная сторона? Что делает тебя особенным?",
                theme: "🌟 Твоя уникальность",
                suggestions: ["Чувствительность", "Внимательность", "Забота", "Креативность", "Сила воли"],
                templates: [
                    "Моя сила проявляется в {ответ.предложный}",
                    "Я особенно ценю в себе способность {ответ.союз}",
                    "Что делает меня особенным - это {ответ.именительный}",
                    "Моя уникальная черта - {ответ.именительный}",
                    "Я горжусь тем, что могу {ответ.союз}"
                ]
            },
            {
                id: 2,
                text: "Какая у тебя самая заветная мечта? О чём ты чаще всего фантазируешь?",
                theme: "🌈 Твои мечты",
                suggestions: ["Путешествия", "Семья", "Творчество", "Помощь другим", "Личностный рост"],
                templates: [
                    "Я мечтаю о {ответ.предложный}",
                    "Мои самые сокровенные желания связаны с {ответ.предложный}",
                    "В своих фантазиях я вижу себя {ответ.союз}",
                    "Я стремлюсь к {ответ.предложный}",
                    "Моя главная цель - {ответ.именительный}"
                ]
            }
        ];
    },

    // Генерация экранов вопросов
    generateQuestionScreens() {
        const container = document.getElementById('questions-container');
        container.innerHTML = '';

        this.questions.forEach((question, index) => {
            const questionNumber = index + 1;
            const progressWidth = (questionNumber / this.questions.length) * 100;
            const savedAnswer = this.userAnswers[questionNumber];

            const screenHTML = `
                <div class="screen" id="screen${questionNumber}">
                    <div class="question-content">
                        <h1>${question.theme}</h1>
                        <p class="question-text">${question.text}</p>
                        
                        ${question.suggestions && question.suggestions.length > 0 ? `
                        <div class="suggestion-buttons">
                            ${question.suggestions.map(suggestion => 
                                `<button class="suggestion-btn" onclick="quiz.addSuggestion(${questionNumber}, '${suggestion.replace(/'/g, "\\'")}')">${suggestion}</button>`
                            ).join('')}
                        </div>
                        ` : ''}

                        <div class="input-section">
                            <div class="character-count" id="count${questionNumber}">${savedAnswer?.original?.length || 0}/500 символов</div>
                            <textarea class="user-input" id="input${questionNumber}" 
                                      placeholder="Напиши здесь всё, что считаешь важным... 💭" 
                                      maxlength="500" 
                                      oninput="quiz.updateCharacterCount(${questionNumber})">${savedAnswer?.original || ''}</textarea>
                            
                            <div class="progress-navigation">
                                <div class="progress-wrapper">
                                    <div class="progress">
                                        <div class="progress-bar" style="width: ${progressWidth}%"></div>
                                    </div>
                                    <div class="progress-steps">
                                        ${this.questions.map((_, i) => `
                                            <div class="progress-step ${i + 1 === questionNumber ? 'active' : ''} ${i + 1 < questionNumber ? 'completed' : ''}" 
                                                 onclick="quiz.goToQuestion(${i + 1})"></div>
                                        `).join('')}
                                    </div>
                                </div>
                                <div class="nav-buttons">
                                    <button class="nav-btn btn-outline" onclick="quiz.previousQuestion()" ${questionNumber === 1 ? 'disabled' : ''}>
                                        ⬅ Назад
                                    </button>
                                    <button class="nav-btn btn-primary" onclick="quiz.saveAnswer(${questionNumber})">
                                        ${questionNumber === this.questions.length ? 'Завершить 💫' : 'Далее ➡'}
                                    </button>
                                </div>
                            </div>

                            <div class="buttons">
                                <button class="btn btn-secondary" onclick="quiz.showFormulation(${questionNumber})">
                                    ✨ Красиво оформить
                                </button>
                            </div>
                        </div>

                        <div class="formulation-section" id="formulation${questionNumber}">
                            <div class="formulation-text" id="formulationText${questionNumber}"></div>
                            <div class="buttons">
                                <button class="btn btn-outline" onclick="quiz.hideFormulation(${questionNumber})">
                                    ↩ Вернуться
                                </button>
                                <button class="btn btn-success" onclick="quiz.acceptFormulation(${questionNumber})">
                                    ✅ Сохранить
                                </button>
                                <button class="btn btn-secondary" onclick="quiz.reformulate(${questionNumber})">
                                    🔄 Переформулировать
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML += screenHTML;
        });
    },

    // Навигация между вопросами
    goToQuestion(questionNumber) {
        if (questionNumber >= 1 && questionNumber <= this.questions.length) {
            this.currentQuestion = questionNumber;
            this.nextScreen('screen' + questionNumber);
            this.updateProgressSteps();
        }
    },

    previousQuestion() {
        if (this.currentQuestion > 1) {
            this.currentQuestion--;
            this.nextScreen('screen' + this.currentQuestion);
            this.updateProgressSteps();
        }
    },

    nextQuestion() {
        if (this.currentQuestion < this.questions.length) {
            this.currentQuestion++;
            this.nextScreen('screen' + this.currentQuestion);
            this.updateProgressSteps();
        }
    },

    updateProgressSteps() {
        document.querySelectorAll('.progress-step').forEach((step, index) => {
            const questionNumber = index + 1;
            step.classList.toggle('active', questionNumber === this.currentQuestion);
            step.classList.toggle('completed', questionNumber < this.currentQuestion);
        });
    },

    // Основные функции приложения
    startQuestions() {
        this.currentQuestion = 1;
        this.nextScreen('screen1');
        this.updateProgressSteps();
        HeartAnimation.startHearts();
    },

    nextScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    },

    updateCharacterCount(questionNum) {
        const input = document.getElementById(`input${questionNum}`);
        const count = document.getElementById(`count${questionNum}`);
        if (input && count) {
            count.textContent = `${input.value.length}/500 символов`;
        }
    },

    addSuggestion(questionNum, text) {
        const input = document.getElementById(`input${questionNum}`);
        if (input) {
            const currentText = input.value.trim();
            if (currentText === '') {
                input.value = text;
            } else {
                const lastChar = currentText.slice(-1);
                const connectors = ['.', '!', '?', ';', ','];
                const separator = connectors.includes(lastChar) ? ' ' : '. ';
                input.value = currentText + separator + text;
            }
            this.updateCharacterCount(questionNum);
            input.focus();
        }
    },

    saveAnswer(questionNum) {
        const input = document.getElementById(`input${questionNum}`);
        if (!input) return;

        const userText = input.value.trim();
        if (userText.length < 3) {
            alert('Пожалуйста, напиши немного больше 🤗');
            return;
        }

        const question = this.questions[questionNum - 1];
        this.userAnswers[questionNum] = {
            original: userText,
            formulated: userText,
            questionText: question.text
        };

        if (questionNum === this.questions.length) {
            this.showFinalScreen();
        } else {
            this.nextQuestion();
        }
    },

    showFormulation(questionNum) {
        const input = document.getElementById(`input${questionNum}`);
        if (!input) return;

        const userText = input.value.trim();
        if (userText.length < 3) {
            alert('Напиши хотя бы пару слов 💭');
            return;
        }

        const formulation = this.generateSmartFormulation(questionNum, userText);
        const formulationDiv = document.getElementById(`formulation${questionNum}`);
        const formulationText = document.getElementById(`formulationText${questionNum}`);

        if (formulationDiv && formulationText) {
            formulationText.innerHTML = formulation;
            formulationDiv.style.display = 'block';
            
            const question = this.questions[questionNum - 1];
            this.userAnswers[questionNum] = {
                original: userText,
                formulated: formulation,
                questionText: question.text
            };
        }
    },

    hideFormulation(questionNum) {
        const formulationDiv = document.getElementById(`formulation${questionNum}`);
        if (formulationDiv) {
            formulationDiv.style.display = 'none';
        }
    },

    acceptFormulation(questionNum) {
        this.hideFormulation(questionNum);
        
        if (questionNum === this.questions.length) {
            this.showFinalScreen();
        } else {
            this.nextQuestion();
        }
    },

    reformulate(questionNum) {
        const input = document.getElementById(`input${questionNum}`);
        if (!input) return;

        const userText = input.value.trim();
        const newFormulation = this.generateSmartFormulation(questionNum, userText);
        const formulationText = document.getElementById(`formulationText${questionNum}`);

        if (formulationText) {
            formulationText.innerHTML = newFormulation;
            this.userAnswers[questionNum].formulated = newFormulation;
        }
    },

    async showFinalScreen() {
        this.nextScreen('screen-final');
        
        // Получаем случайное стихотворение из библиотеки
        let poem = this.getRandomPoem();
        
        const finalPoemElement = document.getElementById('finalPoem');
        
        if (poem && finalPoemElement) {
            finalPoemElement.innerHTML = `
                <div class="poem-title">«${poem.title}»</div>
                <div class="poem-text">${poem.text.replace(/\n/g, '<br>')}</div>
                <div class="poem-author">${poem.author}${poem.year ? ', ' + poem.year + ' год' : ''}</div>
                ${poem.tags ? `<div class="poem-tags">${poem.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : ''}
            `;
        }

        await this.sendResultsToTelegram(poem);
    },

    // Получение случайного стиха из библиотеки
    getRandomPoem() {
        try {
            // Пытаемся получить стих из библиотеки poemsLibrary
            if (window.poemsLibrary && typeof window.poemsLibrary.getRandomPoem === 'function') {
                const poem = window.poemsLibrary.getRandomPoem();
                if (poem && poem.title && poem.text) {
                    console.log('📚 Стих взят из библиотеки poemsLibrary');
                    return poem;
                }
            }
            
            // Если библиотека не доступна, используем встроенные стихи
            console.log('📚 Библиотека poemsLibrary не доступна, используем встроенные стихи');
            return this.getFallbackPoem();
            
        } catch (error) {
            console.error('Ошибка получения стиха:', error);
            return this.getFallbackPoem();
        }
    },

    // Резервные стихи (только если библиотека не работает)
    getFallbackPoem() {
        const fallbackPoems = [
            {
                title: "Ты - моё вдохновение",
                author: "Для тебя",
                year: "2024",
                tags: ["любовь", "вдохновение"],
                text: `Ты - утренний свет в моих окнах,
Ты - шепот звезды в тишине,
Ты - музыка неба высокого,
Что льется так нежно во сне.`
            },
            {
                title: "Улыбка твоя", 
                author: "Для тебя",
                year: "2024",
                tags: ["улыбка", "свет"],
                text: `Улыбка твоя - как солнце весеннее,
Что тает зима в его светлых лучах,
В твоих глазах - целая вселенная,
Где счастье мое в самых ярких красках.`
            }
        ];
        
        return fallbackPoems[Math.floor(Math.random() * fallbackPoems.length)];
    },

    async sendResultsToTelegram(poem) {
        let message = `💫 *НОВЫЕ ОТВЕТЫ!*\n\n`;

        for (let i = 1; i <= this.questions.length; i++) {
            if (this.userAnswers[i]) {
                const answer = this.userAnswers[i];
                message += `*${this.questions[i-1].theme}*\n`;
                message += `❓ *Вопрос:* ${answer.questionText}\n`;
                message += `📝 *Оригинал:* ${answer.original}\n`;
                message += `✨ *Формулировка:* ${answer.formulated}\n\n`;
            }
        }

        message += `📜 *Стихотворение:*\n`;
        message += `«${poem.title}»\n`;
        message += `*Автор:* ${poem.author}\n`;
        if (poem.year) {
            message += `*Год:* ${poem.year}\n`;
        }
        message += `\n⏰ *Время:* ${new Date().toLocaleString('ru-RU')}\n`;
        message += `📊 *Всего вопросов:* ${this.questions.length}`;

        // Отправка в Telegram
        try {
            await fetch(`https://api.telegram.org/bot${this.config.BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: this.config.CHAT_ID,
                    text: message,
                    parse_mode: 'Markdown'
                })
            });
        } catch (error) {
            console.log('Ошибка отправки в Telegram:', error);
        }
    },

    restartQuiz() {
        this.userAnswers = {};
        this.currentQuestion = 0;
        
        document.querySelectorAll('.user-input').forEach(input => input.value = '');
        document.querySelectorAll('.character-count').forEach(count => count.textContent = '0/500 символов');
        document.querySelectorAll('.formulation-section').forEach(form => form.style.display = 'none');
        
        this.nextScreen('screen-welcome');
        HeartAnimation.startHearts();
    },

    // Динамическая инверсия цветов
    initColorInversion() {
        const player = document.getElementById('musicPlayer');
        const container = document.getElementById('mainContainer');
        
        if (!player || !container) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const intersectionRatio = entry.intersectionRatio;
                
                if (intersectionRatio > 0.3) {
                    player.classList.remove('light-text');
                    player.classList.add('dark-text');
                } else {
                    player.classList.remove('dark-text');
                    player.classList.add('light-text');
                }
            });
        }, { 
            threshold: [0, 0.1, 0.3, 0.5, 1],
            rootMargin: '-50px 0px 0px 0px'
        });

        observer.observe(container);
    },

    // Умные формулировки
    applySmartTemplate(template, userText) {
        const cleanText = userText.trim().replace(/[.!?]$/, '');
        const lowerText = cleanText.toLowerCase();
        
        let result = template
            .replace(/{ответ\.предложный}/g, this.formatPrepositional(lowerText))
            .replace(/{ответ\.именительный}/g, this.formatNominative(cleanText))
            .replace(/{ответ\.союз}/g, this.formatConjunction(lowerText))
            .replace(/{ответ}/g, lowerText);

        return result;
    },

    formatPrepositional(text) {
        const words = text.split(' ');
        const lastWord = words[words.length - 1].toLowerCase();
        
        let declinedWord = lastWord;
        
        if (lastWord.endsWith('а') && !lastWord.endsWith('ка') && !lastWord.endsWith('га')) {
            declinedWord = lastWord.slice(0, -1) + 'е';
        }
        else if (lastWord.endsWith('я') && !lastWord.endsWith('ния')) {
            declinedWord = lastWord.slice(0, -1) + 'е';
        }
        else if (lastWord.endsWith('ь')) {
            declinedWord = lastWord.slice(0, -1) + 'и';
        }
        else if (lastWord.endsWith('ость') || lastWord.endsWith('асть')) {
            declinedWord = lastWord.slice(0, -2) + 'ости';
        }
        else if (lastWord.endsWith('ие')) {
            declinedWord = lastWord.slice(0, -2) + 'ии';
        }
        
        // Специальные случаи
        const specialCases = {
            'забота': 'заботе',
            'внимательность': 'внимательности', 
            'творчество': 'творчестве',
            'путешествия': 'путешествиях',
            'семья': 'семье',
            'сила воли': 'силе воли',
            'личный рост': 'личном росте',
            'помощь другим': 'помощи другим'
        };
        
        if (specialCases[lastWord]) {
            declinedWord = specialCases[lastWord];
        }
        
        words[words.length - 1] = declinedWord;
        return words.join(' ');
    },

    formatNominative(text) {
        return text;
    },

    formatConjunction(text) {
        const words = text.split(' ');
        const lastWord = words[words.length - 1].toLowerCase();
        
        let conjugatedWord = lastWord;
        
        // Специальные случаи
        const specialCases = {
            'забота': 'заботиться о других',
            'внимательность': 'быть внимательным', 
            'творчество': 'творить',
            'путешествия': 'путешествовать',
            'семья': 'создать семью',
            'сила воли': 'проявлять силу воли',
            'личный рост': 'развиваться личностно',
            'помощь другим': 'помогать другим'
        };
        
        if (specialCases[lastWord]) {
            conjugatedWord = specialCases[lastWord];
        }
        else if (lastWord.endsWith('а') || lastWord.endsWith('я')) {
            conjugatedWord = lastWord.slice(0, -1) + 'ить';
        }
        
        words[words.length - 1] = conjugatedWord;
        return words.join(' ');
    },

    generateSmartFormulation(questionNum, userText) {
        const question = this.questions[questionNum - 1];
        
        if (question.templates && question.templates.length > 0) {
            const template = question.templates[Math.floor(Math.random() * question.templates.length)];
            return this.applySmartTemplate(template, userText);
        }
        
        return this.generateFallbackFormulation(questionNum, userText);
    },

    generateFallbackFormulation(questionNum, userText) {
        const cleanText = userText.toLowerCase().replace(/[.!?]$/, '');
        const formulations = [
            `Я думаю, что ${cleanText}`,
            `Для меня это означает, что ${cleanText}`,
            `Я чувствую, что ${cleanText}`,
            `Мой опыт показывает, что ${cleanText}`,
            `Я считаю, что ${cleanText}`
        ];
        
        return formulations[Math.floor(Math.random() * formulations.length)];
    }
};

// Создаем глобальную ссылку
window.quiz = QuizApp;

// Инициализируем приложение после загрузки страницы
window.addEventListener('DOMContentLoaded', () => {
    QuizApp.init();
});
