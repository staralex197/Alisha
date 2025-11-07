// Основная логика приложения с улучшенной адаптивностью
const QuizApp = {
    // Конфигурация
    config: {
        BOT_TOKEN: '8519621124:AAEtDBYSAeNW16UQiAGy0epAwwt989v9Tzs',
        CHAT_ID: '1490495592',
        JSONBIN_ID: '690bda1cae596e708f473589',
        JSONBIN_API_KEY: '$2a$10$nFkbrwHZpy3T9KrGUS6RxecAFiNTyKuGe.DZjFqoWYEUcbGS27YRC',
        ADMIN_CHAT_ID: '1490495592'
    },

    // Глобальные переменные
    userAnswers: {},
    currentQuestion: 0,
    questions: [],
    isLoading: true,
    isOnline: true,
    botErrorCount: 0,
    maxBotErrors: 5,
    isMobile: false,

    // Инициализация приложения
    async init() {
        console.log('🚀 Инициализация приложения...');
        
        this.detectDeviceType();
        this.showLoadingScreen();
        this.loadFromStorage();
        
        try {
            // Проверяем онлайн статус
            this.isOnline = navigator.onLine;
            this.setupOnlineListeners();
            this.setupThemeToggle();
            
            // Параллельная загрузка с таймаутом
            await Promise.race([
                Promise.all([
                    this.loadQuestions(),
                    this.preloadResources()
                ]),
                new Promise(resolve => setTimeout(resolve, 5000))
            ]);
            
            this.generateQuestionScreens();
            
            // Инициализируем компоненты с проверкой
            if (typeof MusicPlayer !== 'undefined') MusicPlayer.init();
            if (typeof HeartAnimation !== 'undefined') HeartAnimation.init();
            this.initColorInversion();
            
            // Запускаем обработку сообщений от бота только если онлайн
            if (this.isOnline) {
                this.startBotMessagePolling();
            }
            
            setTimeout(() => {
                this.hideLoadingScreen();
                this.showWelcomeScreen();
            }, 800);
            
        } catch (error) {
            console.error('Ошибка инициализации:', error);
            this.showErrorScreen();
        }
    },

    // Определение типа устройства
    detectDeviceType() {
        this.isMobile = window.innerWidth <= 768;
        console.log(`📱 Устройство: ${this.isMobile ? 'Мобильное' : 'Десктоп'}`);
    },

    // Настройка переключателя тем
    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;

        themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Обработка клавиатуры
        themeToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    },

    // Переключение темы
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Обновляем текст переключателя
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

        // Обновляем стили плеера
        this.updatePlayerTheme();
    },

    // Обновление темы плеера
    updatePlayerTheme() {
        const player = document.getElementById('musicPlayer');
        if (!player) return;

        // Принудительное обновление стилей
        player.style.background = 'var(--player-bg)';
        player.style.color = 'var(--player-text)';
    },

    // Настройка слушателей онлайн статуса
    setupOnlineListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('✅ Онлайн соединение восстановлено');
            this.showTemporaryMessage('Соединение восстановлено ✅', 'success');
            this.startBotMessagePolling();
            this.sendPendingResults();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('⚠️ Оффлайн режим');
            this.showTemporaryMessage('Оффлайн режим ⚠️', 'warning');
        });

        // Слушатель ресайза для адаптивности
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    },

    // Обработка изменения размера окна
    handleResize() {
        this.detectDeviceType();
        
        // Обновляем позиции элементов при ресайзе
        if (typeof HeartAnimation !== 'undefined') {
            HeartAnimation.handleResize();
        }
    },

    // Загрузка из localStorage
    loadFromStorage() {
        try {
            const saved = localStorage.getItem('quizAppData');
            if (saved) {
                const data = JSON.parse(saved);
                this.userAnswers = data.userAnswers || {};
                this.questions = data.questions || this.getDefaultQuestions();
                console.log('✅ Данные загружены из localStorage');
            }
        } catch (e) {
            console.log('❌ Ошибка загрузки из localStorage:', e);
        }
    },

    // Сохранение в localStorage
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

    // Отправка накопившихся результатов
    async sendPendingResults() {
        const pending = localStorage.getItem('pendingResults');
        if (pending && this.isOnline) {
            try {
                const results = JSON.parse(pending);
                await this.sendResultsToTelegram(results.poem);
                localStorage.removeItem('pendingResults');
                console.log('✅ Накопившиеся результаты отправлены');
            } catch (error) {
                console.log('❌ Ошибка отправки накопившихся результатов:', error);
            }
        }
    },

    // Опрос сообщений от бота
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

    // Обработка сообщений от бота
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
            this.sendBotMessage(message.chat.id, 
                `📋 Доступные команды:\n` +
                `/update_questions [JSON] - обновить вопросы\n` +
                `/get_questions - получить текущие вопросы\n` +
                `/help - справка по командам`
            );
        }
    },

    // Команда обновления вопросов
    async handleUpdateQuestionsCommand(message) {
        try {
            const questionsText = message.text.replace('/update_questions', '').trim();
            
            if (!questionsText) {
                this.sendBotMessage(message.chat.id, 
                    '❌ Отправь JSON с вопросами после команды.\n' +
                    'Пример: /update_questions [{"id":1,"text":"Вопрос?","theme":"Тема"}]'
                );
                return;
            }
            
            const newQuestions = JSON.parse(questionsText);
            
            if (!Array.isArray(newQuestions)) {
                throw new Error('Вопросы должны быть массивом');
            }
            
            if (newQuestions.length === 0) {
                throw new Error('Массив вопросов не может быть пустым');
            }
            
            const success = await this.updateQuestionsInJSONBin(newQuestions);
            
            if (success) {
                this.sendBotMessage(message.chat.id, '✅ Вопросы успешно обновлены!');
                this.questions = newQuestions;
                this.generateQuestionScreens();
                this.saveToStorage();
                
                // Показываем уведомление пользователю
                this.showTemporaryMessage('Вопросы обновлены! 🔄', 'success');
            } else {
                this.sendBotMessage(message.chat.id, '❌ Ошибка обновления вопросов');
            }
            
        } catch (error) {
            console.error('Ошибка обработки команды:', error);
            this.sendBotMessage(message.chat.id, 
                `❌ Ошибка: ${error.message}\n\n` +
                `Правильный формат:\n` +
                `\`\`\`json\n` +
                `[\n` +
                `  {\n` +
                `    "id": 1,\n` +
                `    "text": "Твой вопрос?",\n` +
                `    "theme": "🎯 Тема",\n` +
                `    "suggestions": ["Вариант1", "Вариант2"]\n` +
                `  }\n` +
                `]\n` +
                `\`\`\``
            );
        }
    },

    // Команда получения текущих вопросов
    async handleGetQuestionsCommand(message) {
        try {
            const currentQuestions = await this.getCurrentQuestionsFromJSONBin();
            const questionsJSON = JSON.stringify(currentQuestions, null, 2);
            
            this.sendBotMessage(message.chat.id, 
                `📝 Текущие вопросы:\n\n\`\`\`json\n${questionsJSON}\n\`\`\``
            );
        } catch (error) {
            this.sendBotMessage(message.chat.id, '❌ Ошибка получения вопросов');
        }
    },

    // Отправка сообщения через бота
    async sendBotMessage(chatId, text) {
        if (!this.isOnline) {
            console.log('⚠️ Пропускаем отправку сообщения: оффлайн режим');
            return false;
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch(`https://api.telegram.org/bot${this.config.BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    chat_id: chatId,
                    text: text,
                    parse_mode: 'Markdown'
                }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            return response.ok;
        } catch (error) {
            console.error('❌ Ошибка отправки сообщения:', error.message);
            return false;
        }
    },

    // Обновление вопросов в JSONBin
    async updateQuestionsInJSONBin(newQuestions) {
        if (!this.isOnline) {
            console.log('⚠️ Пропускаем обновление JSONBin: оффлайн режим');
            return false;
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch(`https://api.jsonbin.io/v3/b/${this.config.JSONBIN_ID}`, {
                method: 'PUT',
                headers: {
                    'X-Master-Key': this.config.JSONBIN_API_KEY,
                    'Content-Type': 'application/json',
                    'X-Bin-Versioning': 'false'
                },
                body: JSON.stringify({
                    questions: newQuestions
                }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            return response.ok;
        } catch (error) {
            console.error('❌ Ошибка обновления вопросов:', error.message);
            return false;
        }
    },

    // Получение текущих вопросов из JSONBin
    async getCurrentQuestionsFromJSONBin() {
        if (!this.isOnline) {
            console.log('⚠️ Пропускаем загрузку из JSONBin: оффлайн режим');
            return this.questions.length > 0 ? this.questions : this.getDefaultQuestions();
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
                return data.record.questions || this.getDefaultQuestions();
            }
            return this.getDefaultQuestions();
        } catch (error) {
            console.log('⚠️ Ошибка загрузки из JSONBin:', error.message);
            return this.getDefaultQuestions();
        }
    },

    // Загрузка вопросов
    async loadQuestions() {
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

    // Показать экран загрузки
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        const progressBar = document.getElementById('loadingProgress');
        
        if (loadingScreen) {
            loadingScreen.classList.add('active');
            
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 25;
                if (progress > 90) progress = 90;
                if (progressBar) {
                    progressBar.style.width = progress + '%';
                    progressBar.setAttribute('aria-valuenow', Math.round(progress));
                }
                
                if (progress >= 90) {
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
            progressBar.setAttribute('aria-valuenow', 100);
            
            setTimeout(() => {
                loadingScreen.classList.remove('active');
                loadingScreen.classList.add('hidden');
            }, 500);
        }
    },

    // Показать экран приветствия
    showWelcomeScreen() {
        this.nextScreen('screen-welcome');
        if (typeof HeartAnimation !== 'undefined') {
            HeartAnimation.startHearts();
        }
    },

    // Показать экран ошибки
    showErrorScreen() {
        this.nextScreen('screen-error');
    },

    // Предзагрузка ресурсов
    async preloadResources() {
        return new Promise((resolve) => {
            // Предзагружаем критические ресурсы
            setTimeout(resolve, 1000);
        });
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

    // Генерация экранов вопросов с улучшенной адаптивностью
    generateQuestionScreens() {
        const container = document.getElementById('questions-container');
        if (!container) {
            console.error('❌ Контейнер вопросов не найден');
            return;
        }
        
        container.innerHTML = '';

        this.questions.forEach((question, index) => {
            const questionNumber = index + 1;
            const progressWidth = (questionNumber / this.questions.length) * 100;
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
                                                 onclick="quiz.goToQuestion(${i + 1})"
                                                 aria-label="Вопрос ${i + 1}"></div>
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

        // Добавляем обработчики клавиатуры для улучшенной доступности
        this.setupKeyboardNavigation();
    },

    // Настройка навигации с клавиатуры
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Escape для скрытия формулировок
            if (e.key === 'Escape') {
                const visibleFormulation = document.querySelector('.formulation-section[style*="display: block"]');
                if (visibleFormulation) {
                    const questionNum = visibleFormulation.id.replace('formulation', '');
                    this.hideFormulation(questionNum);
                }
            }
            
            // Enter для сохранения ответа когда текстовое поле в фокусе
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                const activeInput = document.querySelector('.user-input:focus');
                if (activeInput) {
                    const questionNum = activeInput.id.replace('input', '');
                    this.saveAnswer(questionNum);
                }
            }
        });
    },

    // Экранирование HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Навигация между вопросами
    goToQuestion(questionNumber) {
        if (questionNumber >= 1 && questionNumber <= this.questions.length) {
            this.currentQuestion = questionNumber;
            this.nextScreen('screen' + questionNumber);
            this.updateProgressSteps();
            
            // Фокус на поле ввода для улучшенной доступности
            setTimeout(() => {
                const input = document.getElementById(`input${questionNumber}`);
                if (input) input.focus();
            }, 300);
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
        if (typeof HeartAnimation !== 'undefined') {
            HeartAnimation.startHearts();
        }
    },

    nextScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            // Плавная прокрутка к верху с учетом мобильных устройств
            window.scrollTo({ 
                top: 0, 
                behavior: this.isMobile ? 'auto' : 'smooth' 
            });
        }
    },

    updateCharacterCount(questionNum) {
        const input = document.getElementById(`input${questionNum}`);
        const count = document.getElementById(`count${questionNum}`);
        if (input && count) {
            const length = input.value.length;
            count.textContent = `${length}/500 символов`;
            
            // Визуальная индикация при приближении к лимиту
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
            
            // Вибрация на мобильных устройствах
            if (this.isMobile && navigator.vibrate) {
                navigator.vibrate(50);
            }
        }
    },

    saveAnswer(questionNum) {
        const input = document.getElementById(`input${questionNum}`);
        if (!input) return;

        const userText = input.value.trim();
        if (userText.length < 3) {
            this.showTemporaryMessage('Пожалуйста, напиши немного больше 🤗', 'warning');
            
            // Вибрация на мобильных
            if (this.isMobile && navigator.vibrate) {
                navigator.vibrate(200);
            }
            return;
        }

        const question = this.questions[questionNum - 1];
        this.userAnswers[questionNum] = {
            original: userText,
            formulated: userText,
            questionText: question.text
        };

        this.saveToStorage();

        if (questionNum === this.questions.length) {
            this.showFinalScreen();
        } else {
            this.nextQuestion();
        }
    },

    // Временное сообщение с улучшенной адаптивностью
    showTemporaryMessage(message, type = 'info') {
        // Удаляем существующие сообщения
        document.querySelectorAll('.temp-message').forEach(msg => msg.remove());

        const messageDiv = document.createElement('div');
        messageDiv.className = `temp-message temp-message-${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: ${this.isMobile ? '10px' : '20px'};
            left: 50%;
            transform: translateX(-50%);
            padding: ${this.isMobile ? '10px 16px' : '12px 20px'};
            background: ${type === 'warning' ? 'var(--accent-red)' : 
                        type === 'success' ? 'var(--accent-green)' : 'var(--accent-purple)'};
            color: white;
            border-radius: 25px;
            z-index: 10000;
            animation: fadeInOut 3s ease-in-out;
            font-weight: 500;
            box-shadow: var(--shadow);
            font-size: ${this.isMobile ? '0.9em' : '1em'};
            max-width: ${this.isMobile ? '90vw' : '400px'};
            text-align: center;
            word-wrap: break-word;
        `;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
    },

    // Остальные методы остаются без изменений...
    // [Остальной код из оригинального файла сохраняется]
};

// Добавляем CSS для анимаций сообщений
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        15% { opacity: 1; transform: translateX(-50%) translateY(0); }
        85% { opacity: 1; transform: translateX(-50%) translateY(0); }
        100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
    }
`;
document.head.appendChild(style);

window.quiz = QuizApp;

// Инициализация при загрузке DOM
window.addEventListener('DOMContentLoaded', () => {
    QuizApp.init();
});

// Обработка видимости страницы для оптимизации
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Страница не видна - экономим ресурсы
        if (typeof HeartAnimation !== 'undefined') {
            HeartAnimation.stopHearts();
        }
    } else {
        // Страница снова видна
        if (typeof HeartAnimation !== 'undefined' && QuizApp.currentQuestion > 0) {
            HeartAnimation.startHearts();
        }
    }
});
