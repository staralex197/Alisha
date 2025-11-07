/* Основная логика приложения с ИСПРАВЛЕННЫМИ ИНДИКАТОРАМИ И ЧИСТЫМИ ОТВЕТАМИ */
const QuizApp = {
    config: {
        BOT_TOKEN: '8519621124:AAEtDBYSAeNW16UQiAGy0epAwwt989v9Tzs',
        CHAT_ID: '1490495592',
        JSONBIN_ID: '690bda1cae596e708f473589',
        JSONBIN_API_KEY: '$2a$10$nFkbrwHZpy3T9KrGUS6RxecAFiNTyKuGe.DZjFqoWYEUcbGS27YRC',
        ADMIN_CHAT_ID: '1490495592'
    },

    userAnswers: {},
    currentQuestion: 0,
    questions: [],
    isLoading: true,
    isOnline: true,
    botErrorCount: 0,
    maxBotErrors: 5,
    isMobile: false,
    initializationTimeout: null,

    async init() {
        console.log('🚀 Инициализация приложения...');
        
        try {
            this.showLoadingScreen();
            this.detectDeviceType();
            this.loadFromStorage();
            
            this.initializationTimeout = setTimeout(() => {
                if (this.isLoading) {
                    console.log('⚠️ Таймаут инициализации, принудительный запуск');
                    this.forceInitialization();
                }
            }, 10000);

            this.isOnline = navigator.onLine;
            this.setupOnlineListeners();
            this.setupThemeToggle();
            
            await this.safeInitialization();
            
        } catch (error) {
            console.error('Критическая ошибка инициализации:', error);
            this.forceInitialization();
        }
    },

    async safeInitialization() {
        try {
            await Promise.race([
                Promise.all([
                    this.loadQuestions().catch(error => {
                        console.log('⚠️ Ошибка загрузки вопросов:', error);
                        this.questions = this.getDefaultQuestions();
                    }),
                    this.preloadResources()
                ]),
                new Promise(resolve => setTimeout(resolve, 3000))
            ]);

            this.generateQuestionScreens();
            
            this.safeComponentInitialization();
            
            if (this.isOnline) {
                this.startBotMessagePolling();
            }
            
            this.completeInitialization();
            
        } catch (error) {
            console.error('Ошибка безопасной инициализации:', error);
            this.forceInitialization();
        }
    },

    safeComponentInitialization() {
        try {
            if (typeof MusicPlayer !== 'undefined' && MusicPlayer.init) {
                MusicPlayer.init().catch(error => {
                    console.log('⚠️ Ошибка инициализации плеера:', error);
                });
            }
        } catch (error) {
            console.log('⚠️ Ошибка при инициализации MusicPlayer:', error);
        }

        try {
            if (typeof HeartAnimation !== 'undefined' && HeartAnimation.init) {
                HeartAnimation.init();
            }
        } catch (error) {
            console.log('⚠️ Ошибка при инициализации HeartAnimation:', error);
        }

        try {
            this.initColorInversion();
        } catch (error) {
            console.log('⚠️ Ошибка при инициализации color inversion:', error);
        }
    },

    forceInitialization() {
        console.log('🔄 Принудительная инициализация...');
        
        if (!this.questions || this.questions.length === 0) {
            this.questions = this.getDefaultQuestions();
        }
        
        this.generateQuestionScreens();
        this.completeInitialization();
    },

    completeInitialization() {
        if (this.initializationTimeout) {
            clearTimeout(this.initializationTimeout);
            this.initializationTimeout = null;
        }
        
        this.isLoading = false;
        
        setTimeout(() => {
            this.hideLoadingScreen();
            this.showWelcomeScreen();
            console.log('✅ Приложение успешно инициализировано');
        }, 500);
    },

    detectDeviceType() {
        this.isMobile = window.innerWidth <= 768;
        console.log(`📱 Устройство: ${this.isMobile ? 'Мобильное' : 'Десктоп'}`);
    },

    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) {
            console.log('⚠️ Переключатель темы не найден');
            return;
        }

        themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });

        themeToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    },

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const themeText = themeToggle.querySelector('.theme-text');
            const themeIcon = themeToggle.querySelector('.theme-icon');
            
            if (newTheme === 'dark') {
                themeText.textContent = 'Светлая';
                themeIcon.textContent = '☀️';
            } else {
                themeText.textContent = 'Тёмная';
                themeIcon.textContent = '🌙';
            }
        }
    },

    setupOnlineListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('✅ Онлайн соединение восстановлено');
            this.startBotMessagePolling();
            this.sendPendingResults();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('⚠️ Оффлайн режим');
        });
    },

    // ИСПРАВЛЕННАЯ загрузка из localStorage - ОЧИЩАЕМ ОТВЕТЫ
    loadFromStorage() {
        try {
            const saved = localStorage.getItem('quizAppData');
            if (saved) {
                const data = JSON.parse(saved);
                // Загружаем только вопросы, ответы очищаем
                this.questions = data.questions || this.getDefaultQuestions();
                this.userAnswers = {}; // ВСЕГДА ОЧИЩАЕМ ОТВЕТЫ
                console.log('✅ Вопросы загружены из localStorage, ответы очищены');
            } else {
                this.questions = this.getDefaultQuestions();
                this.userAnswers = {};
            }
        } catch (e) {
            console.log('❌ Ошибка загрузки из localStorage:', e);
            this.questions = this.getDefaultQuestions();
            this.userAnswers = {}; // Очищаем при ошибке
        }
    },

    saveToStorage() {
        try {
            const data = {
                userAnswers: this.userAnswers,
                questions: this.questions,
                timestamp: Date.now()
            };
            localStorage.setItem('quizAppData', JSON.stringify(data));
        } catch (e) {
            console.log('❌ Ошибка сохранения в localStorage:', e);
        }
    },

    async loadQuestions() {
        if (!this.isOnline) {
            console.log('⚠️ Оффлайн режим, используем локальные вопросы');
            this.questions = this.getDefaultQuestions();
            return;
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch(`https://api.jsonbin.io/v3/b/${this.config.JSONBIN_ID}/latest`, {
                headers: {
                    'X-Master-Key': this.config.JSONBIN_API_KEY,
                    'Content-Type': 'application/json'
                },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                const data = await response.json();
                this.questions = data.record.questions || this.getDefaultQuestions();
                console.log('✅ Вопросы загружены из JSONBin');
                this.saveToStorage();
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            console.log('⚠️ Используем встроенные вопросы:', error.message);
            this.questions = this.getDefaultQuestions();
        }
    },

    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        const progressBar = document.getElementById('loadingProgress');
        
        if (loadingScreen) {
            loadingScreen.classList.add('active');
            loadingScreen.classList.remove('hidden');
            
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 25;
                if (progress > 85) progress = 85;
                if (progressBar) {
                    progressBar.style.width = progress + '%';
                    progressBar.setAttribute('aria-valuenow', Math.round(progress));
                }
                
                if (progress >= 85) {
                    clearInterval(interval);
                }
            }, 200);
        }
    },

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        const progressBar = document.getElementById('loadingProgress');
        
        if (loadingScreen && progressBar) {
            progressBar.style.width = '100%';
            progressBar.setAttribute('aria-valuenow', 100);
            
            setTimeout(() => {
                loadingScreen.classList.remove('active');
                loadingScreen.classList.add('hidden');
            }, 500);
        }
    },

    showWelcomeScreen() {
        this.nextScreen('screen-welcome');
        try {
            if (typeof HeartAnimation !== 'undefined' && HeartAnimation.startHearts) {
                HeartAnimation.startHearts();
            }
        } catch (error) {
            console.log('⚠️ Ошибка запуска сердечек:', error);
        }
    },

    showErrorScreen() {
        this.nextScreen('screen-error');
    },

    async preloadResources() {
        return new Promise((resolve) => {
            setTimeout(resolve, 1000);
        });
    },

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

    // Генерация экранов вопросов с ПУСТЫМИ полями ввода
    generateQuestionScreens() {
        const container = document.getElementById('questions-container');
        if (!container) {
            console.error('❌ Контейнер вопросов не найден');
            return;
        }
        
        container.innerHTML = '';

        this.questions.forEach((question, index) => {
            const questionNumber = index + 1;
            const savedAnswer = this.userAnswers[questionNumber];

            const screenHTML = `
                <div class="screen" id="screen${questionNumber}">
                    <div class="question-content">
                        <h1>${this.escapeHtml(question.theme)}</h1>
                        <p class="question-text">${this.escapeHtml(question.text)}</p>
                        
                        ${question.suggestions && question.suggestions.length > 0 ? `
                        <div class="suggestion-buttons">
                            ${question.suggestions.map(suggestion => 
                                `<button class="suggestion-btn" onclick="quiz.addSuggestion(${questionNumber}, '${this.escapeHtml(suggestion.replace(/'/g, "\\'"))}')">${this.escapeHtml(suggestion)}</button>`
                            ).join('')}
                        </div>
                        ` : ''}

                        <div class="input-section">
                            <div class="character-count" id="count${questionNumber}">0/500 символов</div>
                            <textarea class="user-input" id="input${questionNumber}" 
                                      placeholder="Напиши здесь всё, что считаешь важным... 💭" 
                                      maxlength="500" 
                                      oninput="quiz.updateCharacterCount(${questionNumber})"></textarea>
                            
                            <div class="progress-navigation">
                                <div class="progress-wrapper">
                                    <div class="progress-steps">
                                        ${this.questions.map((_, i) => `
                                            <div class="progress-step" 
                                                 onclick="quiz.goToQuestion(${i + 1})"
                                                 data-question="${i + 1}"></div>
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

        this.updateProgressSteps();
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

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

    // ИСПРАВЛЕННЫЙ МЕТОД: правильное обновление индикаторов
    updateProgressSteps() {
        const progressSteps = document.querySelectorAll('.progress-step');
        
        progressSteps.forEach((step, index) => {
            const questionNumber = index + 1;
            
            step.classList.remove('active', 'completed');
            
            if (questionNumber === this.currentQuestion) {
                step.classList.add('active');
            }
            else if (this.userAnswers[questionNumber]) {
                step.classList.add('completed');
            }
        });
    },

    startQuestions() {
        this.currentQuestion = 1;
        this.nextScreen('screen1');
        this.updateProgressSteps();
        try {
            if (typeof HeartAnimation !== 'undefined' && HeartAnimation.startHearts) {
                HeartAnimation.startHearts();
            }
        } catch (error) {
            console.log('⚠️ Ошибка запуска сердечек:', error);
        }
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
            const length = input.value.length;
            count.textContent = `${length}/500 символов`;
            
            if (length > 450) {
                count.style.color = 'var(--accent-red)';
            } else if (length > 400) {
                count.style.color = 'var(--accent-yellow)';
            } else {
                count.style.color = 'var(--text-secondary)';
            }
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
            this.showTemporaryMessage('Пожалуйста, напиши немного больше 🤗', 'warning');
            return;
        }

        const question = this.questions[questionNum - 1];
        this.userAnswers[questionNum] = {
            original: userText,
            formulated: userText,
            questionText: question.text
        };

        this.saveToStorage();
        this.updateProgressSteps();

        if (questionNum === this.questions.length) {
            this.showFinalScreen();
        } else {
            this.nextQuestion();
        }
    },

    showTemporaryMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `temp-message temp-message-${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 20px;
            background: ${type === 'warning' ? 'var(--accent-red)' : 
                        type === 'success' ? 'var(--accent-green)' : 'var(--accent-purple)'};
            color: white;
            border-radius: 25px;
            z-index: 10000;
            animation: fadeInOut 3s ease-in-out;
            font-weight: 500;
            box-shadow: var(--shadow);
        `;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
    },

    showFormulation(questionNum) {
        const input = document.getElementById(`input${questionNum}`);
        if (!input) return;

        const userText = input.value.trim();
        if (userText.length < 3) {
            this.showTemporaryMessage('Напиши хотя бы пару слов 💭', 'warning');
            return;
        }

        const formulation = this.generateSmartFormulation(questionNum, userText);
        const formulationDiv = document.getElementById(`formulation${questionNum}`);
        const formulationText = document.getElementById(`formulationText${questionNum}`);

        if (formulationDiv && formulationText) {
            formulationText.innerHTML = this.escapeHtml(formulation);
            formulationDiv.style.display = 'block';
            
            const question = this.questions[questionNum - 1];
            this.userAnswers[questionNum] = {
                original: userText,
                formulated: formulation,
                questionText: question.text
            };
            
            this.saveToStorage();
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
        
        this.updateProgressSteps();
        
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
            formulationText.innerHTML = this.escapeHtml(newFormulation);
            this.userAnswers[questionNum].formulated = newFormulation;
            this.saveToStorage();
        }
    },

    async showFinalScreen() {
        this.nextScreen('screen-final');
        
        let poem = this.getRandomPoem();
        
        const finalPoemElement = document.getElementById('finalPoem');
        
        if (poem && finalPoemElement) {
            finalPoemElement.innerHTML = `
                <div class="poem-card fade-in">
                    <h3 class="poem-title">«${this.escapeHtml(poem.title)}»</h3>
                    <div class="poem-meta">
                        <span class="poem-author">${this.escapeHtml(poem.author)}</span>
                        <span class="poem-year">${this.escapeHtml(poem.year)}</span>
                    </div>
                    <div class="poem-text typing-area" id="finalPoemText"></div>
                </div>
            `;

            const typingArea = document.getElementById('finalPoemText');
            if (typingArea && window.poemsLibrary) {
                await window.poemsLibrary.typeText(typingArea, poem.text, 40);
            }
        }

        await this.sendResultsToTelegram(poem);
    },

    getRandomPoem() {
        try {
            if (window.poemsLibrary && typeof window.poemsLibrary.getRandomPoem === 'function') {
                const poem = window.poemsLibrary.getRandomPoem();
                if (poem && poem.title && poem.text) {
                    return poem;
                }
            }
            return this.getFallbackPoem();
        } catch (error) {
            return this.getFallbackPoem();
        }
    },

    getFallbackPoem() {
        return {
            title: "Для тебя",
            author: "С любовью", 
            year: "2024",
            text: "Ты - самое прекрасное, что случилось со мной...\nТвои глаза - как звёзды в ночи,\nТвоя улыбка - как солнце весной,\nИ в каждом твоём слове - музыка души."
        };
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

        message += `📜 *Стихотворение для пользователя:*\n`;
        message += `*Название:* «${poem.title}»\n`;
        message += `*Автор:* ${poem.author}\n`;
        if (poem.year) {
            message += `*Год:* ${poem.year}\n`;
        }
        message += `\n*Текст стихотворения:*\n`;
        message += `\`\`\`\n${poem.text}\n\`\`\`\n`;

        message += `\n⏰ *Время отправки:* ${new Date().toLocaleString('ru-RU')}\n`;
        message += `📊 *Всего вопросов:* ${this.questions.length}`;

        try {
            const success = await this.sendBotMessage(this.config.CHAT_ID, message);
            
            if (!success && this.isOnline) {
                localStorage.setItem('pendingResults', JSON.stringify({
                    poem: poem,
                    timestamp: Date.now()
                }));
                console.log('💾 Результаты сохранены для последующей отправки');
            }
        } catch (error) {
            console.log('❌ Ошибка отправки в Telegram:', error);
            localStorage.setItem('pendingResults', JSON.stringify({
                poem: poem,
                timestamp: Date.now()
            }));
        }
    },

    // ИСПРАВЛЕННЫЙ перезапуск - полная очистка
    restartQuiz() {
        this.userAnswers = {};
        this.currentQuestion = 0;
        
        // Очищаем все поля ввода
        document.querySelectorAll('.user-input').forEach(input => {
            input.value = '';
        });
        
        document.querySelectorAll('.character-count').forEach(count => {
            count.textContent = '0/500 символов';
            count.style.color = '';
        });
        
        document.querySelectorAll('.formulation-section').forEach(form => {
            form.style.display = 'none';
        });
        
        this.nextScreen('screen-welcome');
        
        try {
            if (typeof HeartAnimation !== 'undefined' && HeartAnimation.startHearts) {
                HeartAnimation.startHearts();
            }
        } catch (error) {
            console.log('⚠️ Ошибка запуска сердечек:', error);
        }
        
        this.saveToStorage();
        this.updateProgressSteps();
    },

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
    },

    startBotMessagePolling() {
        if (!this.isOnline) {
            console.log('⚠️ Пропускаем опрос бота: оффлайн режим');
            return;
        }

        if (this.botErrorCount >= this.maxBotErrors) {
            console.log('❌ Прерываем опрос бота: слишком много ошибок');
            return;
        }

        let lastUpdateId = 0;
        let isPolling = true;
        
        const pollBot = async () => {
            if (!isPolling || !this.isOnline) return;
            
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);
                
                const response = await fetch(
                    `https://api.telegram.org/bot${this.config.BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}&timeout=5`,
                    { signal: controller.signal }
                );
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data.ok && data.result.length > 0) {
                    data.result.forEach(update => {
                        if (update.message) {
                            this.processBotMessage(update.message);
                        }
                        lastUpdateId = update.update_id;
                    });
                    this.botErrorCount = 0;
                }
            } catch (error) {
                this.botErrorCount++;
                console.log(`❌ Ошибка опроса бота (${this.botErrorCount}/${this.maxBotErrors}):`, error.message);
                
                if (this.botErrorCount >= this.maxBotErrors) {
                    console.log('🚫 Прекращаем опрос бота из-за множественных ошибок');
                    isPolling = false;
                    return;
                }
            }
            
            const delay = this.botErrorCount > 0 ? Math.min(30000, this.botErrorCount * 2000) : 1000;
            setTimeout(pollBot, delay);
        };
        
        pollBot();
    },

    processBotMessage(message) {
        if (message.chat.id.toString() !== this.config.ADMIN_CHAT_ID) return;
        
        const text = message.text;
        
        if (text.startsWith('/update_questions')) {
            this.handleUpdateQuestionsCommand(message);
        }
        else if (text === '/get_questions') {
            this.handleGetQuestionsCommand(message);
        }
        else if (text === '/help') {
            this.handleHelpCommand(message);
        }
    },

    async sendBotMessage(chatId, text) {
        if (!this.isOnline) {
            console.log('⚠️ Оффлайн режим, сообщение не отправлено');
            return false;
        }

        try {
            const response = await fetch(`https://api.telegram.org/bot${this.config.BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: text,
                    parse_mode: 'Markdown'
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            console.log('✅ Сообщение отправлено в Telegram');
            return true;
        } catch (error) {
            console.log('❌ Ошибка отправки в Telegram:', error);
            return false;
        }
    },

    async sendPendingResults() {
        const pending = localStorage.getItem('pendingResults');
        if (pending && this.isOnline) {
            try {
                const data = JSON.parse(pending);
                await this.sendResultsToTelegram(data.poem);
                localStorage.removeItem('pendingResults');
                console.log('✅ Ожидающие результаты отправлены');
            } catch (error) {
                console.log('❌ Ошибка отправки ожидающих результатов:', error);
            }
        }
    },

    handleUpdateQuestionsCommand(message) {
        console.log('🔄 Команда обновления вопросов получена');
    },

    handleGetQuestionsCommand(message) {
        console.log('📋 Команда получения вопросов получена');
    },

    handleHelpCommand(message) {
        console.log('❓ Команда помощи получена');
    },

    initColorInversion() {
        // Заглушка для будущей функциональности
    }
};

window.quiz = QuizApp;

document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const themeText = themeToggle.querySelector('.theme-text');
        const themeIcon = themeToggle.querySelector('.theme-icon');
        if (savedTheme === 'dark') {
            themeText.textContent = 'Светлая';
            themeIcon.textContent = '☀️';
        } else {
            themeText.textContent = 'Тёмная';
            themeIcon.textContent = '🌙';
        }
    }
    
    setTimeout(() => {
        QuizApp.init();
    }, 100);
});
