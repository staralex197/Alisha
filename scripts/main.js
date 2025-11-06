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

    // Инициализация приложения
    async init() {
        console.log('🚀 Инициализация приложения...');
        
        await this.loadQuestions();
        this.generateQuestionScreens();
        MusicPlayer.init();
        
        console.log('✅ Приложение инициализировано');
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
                    "Моя сила проявляется в том, что {ответ}",
                    "Я особенно ценю в себе: {ответ.именительный}",
                    "Что делает меня особенным: {ответ}",
                    "Моя уникальная черта - {ответ}",
                    "Я горжусь своей способностью {ответ.союз}"
                ]
            },
            {
                id: 2,
                text: "Какая у тебя самая заветная мечта? О чём ты чаще всего фантазируешь?",
                theme: "🌈 Твои мечты",
                suggestions: ["Путешествия", "Семья", "Творчество", "Помощь другим", "Личностный рост"],
                templates: [
                    "Я мечтаю о том, чтобы {ответ.союз}",
                    "Мои самые сокровенные желания: {ответ.именительный}",
                    "В своих фантазиях я вижу: {ответ}",
                    "Я стремлюсь к: {ответ.именительный}",
                    "Моя главная цель: {ответ}"
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

            const screenHTML = `
                <div class="screen" id="screen${questionNumber}">
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
                        <div class="character-count" id="count${questionNumber}">0/500 символов</div>
                        <textarea class="user-input" id="input${questionNumber}" 
                                  placeholder="Напиши здесь всё, что считаешь важным... 💭" 
                                  maxlength="500" 
                                  oninput="quiz.updateCharacterCount(${questionNumber})"></textarea>
                        
                        <div class="buttons">
                            <button class="btn btn-primary" onclick="quiz.saveAnswer(${questionNumber})">💖 Записать мой ответ</button>
                            <button class="btn btn-secondary" onclick="quiz.showFormulation(${questionNumber})">✨ Красиво оформить</button>
                        </div>
                    </div>

                    <div class="formulation-section" id="formulation${questionNumber}">
                        <div class="formulation-text" id="formulationText${questionNumber}"></div>
                        <div class="buttons">
                            <button class="btn btn-success" onclick="quiz.acceptFormulation(${questionNumber})">✅ Нравится</button>
                            <button class="btn btn-secondary" onclick="quiz.reformulate(${questionNumber})">🔄 Переформулировать</button>
                        </div>
                    </div>

                    <div class="progress">
                        <div class="progress-bar" style="width: ${progressWidth}%"></div>
                    </div>
                </div>
            `;
            container.innerHTML += screenHTML;
        });
    },

    // Основные функции приложения
    startQuestions() {
        if (this.questions.length === 0) {
            alert('Вопросы загружаются... Пожалуйста, подожди немного');
            return;
        }
        this.nextScreen('screen1');
        this.createHearts();
    },

    nextScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
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

        this.userAnswers[questionNum] = {
            original: userText,
            formulated: userText
        };

        this.moveToNextQuestion(questionNum);
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
            
            this.userAnswers[questionNum] = {
                original: userText,
                formulated: formulation
            };
        }
    },

    acceptFormulation(questionNum) {
        const formulationDiv = document.getElementById(`formulation${questionNum}`);
        if (formulationDiv) {
            formulationDiv.style.display = 'none';
        }
        this.moveToNextQuestion(questionNum);
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

    moveToNextQuestion(currentQ) {
        if (currentQ < this.questions.length) {
            this.nextScreen('screen' + (currentQ + 1));
            this.createHearts();
        } else {
            this.showFinalScreen();
        }
    },

    async showFinalScreen() {
        this.nextScreen('screen-final');
        
        // Получаем случайное стихотворение
        const poem = PoemsLibrary.getRandomPoem();
        document.getElementById('finalPoem').innerHTML = `
            <div class="poem-title">«${poem.title}»</div>
            <div class="poem-text">${poem.text}</div>
            <div class="poem-author">${poem.author}${poem.year ? ', ' + poem.year + ' год' : ''}</div>
        `;

        await this.sendResultsToTelegram(poem);
    },

    async sendResultsToTelegram(poem) {
        let message = `💫 *НОВЫЕ ОТВЕТЫ!*\n\n`;

        for (let i = 1; i <= this.questions.length; i++) {
            if (this.userAnswers[i]) {
                const question = this.questions[i-1];
                message += `*${question.theme}*\n`;
                message += `💭 *Ответ:* ${this.userAnswers[i].formulated}\n\n`;
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


createHearts() {
    const container = document.getElementById('heartsContainer');
    if (container) {
        container.innerHTML = '';
        
        // Создаем больше сердечек - 8 вместо 3
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const heart = document.createElement('div');
                heart.className = 'heart';
                heart.innerHTML = '💖';
                
                // Случайная позиция
                heart.style.left = Math.random() * 100 + '%';
                
                // Случайная задержка анимации
                heart.style.animationDelay = Math.random() * 3 + 's';
                
                // Случайный размер
                const size = 20 + Math.random() * 20;
                heart.style.fontSize = size + 'px';
                
                // Случайный тип анимации
                const animations = ['spin-left', 'spin-right', 'spin-slow', ''];
                const randomAnim = animations[Math.floor(Math.random() * animations.length)];
                if (randomAnim) {
                    heart.classList.add(randomAnim);
                }
                
                // Случайная длительность анимации
                const duration = 5 + Math.random() * 4;
                heart.style.animationDuration = duration + 's';
                
                container.appendChild(heart);
            }, i * 300); // Уменьшаем задержку между созданиями
        }
    }
},

    restartQuiz() {
        this.userAnswers = {};
        this.currentQuestion = 0;
        
        document.querySelectorAll('.user-input').forEach(input => input.value = '');
        document.querySelectorAll('.character-count').forEach(count => count.textContent = '0/500 символов');
        document.querySelectorAll('.formulation-section').forEach(form => form.style.display = 'none');
        
        this.nextScreen('screen-welcome');
        this.createHearts();
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

        // Исправление двойных мягких знаков
        result = result.replace(/тьсяь/g, 'ться');
        result = result.replace(/стьь/g, 'сть');
        result = result.replace(/тьь/g, 'ть');
        
        return result;
    },

    // === ЗАМЕНИТЬ эти функции в scripts/main.js ===

formatPrepositional(text) {
    const words = text.split(' ');
    const lastWord = words[words.length - 1].toLowerCase();
    
    // Склонение последнего слова
    let declinedWord = lastWord;
    
    // Женский род (окончания -а, -я)
    if (lastWord.endsWith('а') && !lastWord.endsWith('ка') && !lastWord.endsWith('га')) {
        declinedWord = lastWord.slice(0, -1) + 'е';
    }
    else if (lastWord.endsWith('я') && !lastWord.endsWith('ния')) {
        declinedWord = lastWord.slice(0, -1) + 'е';
    }
    // Мужской род (окончания -ь)
    else if (lastWord.endsWith('ь')) {
        declinedWord = lastWord.slice(0, -1) + 'и';
    }
    // Существительные на -ость, -асть
    else if (lastWord.endsWith('ость') || lastWord.endsWith('асть')) {
        declinedWord = lastWord.slice(0, -2) + 'ости';
    }
    // Существительные на -ие
    else if (lastWord.endsWith('ие')) {
        declinedWord = lastWord.slice(0, -2) + 'ии';
    }
    // Для несклоняемых слов оставляем как есть
    else if (['забота', 'внимательность', 'творчество', 'путешествия', 'семья', 'сила воли', 'личный рост'].includes(lastWord)) {
        declinedWord = lastWord;
    }
    
    words[words.length - 1] = declinedWord;
    return words.join(' ');
},

formatConjunction(text) {
    const words = text.split(' ');
    const lastWord = words[words.length - 1].toLowerCase();
    
    let conjugatedWord = lastWord;
    
    // Инфинитивы (окончания -ть, -ться)
    if (lastWord.endsWith('ть') || lastWord.endsWith('ться')) {
        conjugatedWord = lastWord;
    }
    // Существительные женского рода (преобразуем в глагол)
    else if (lastWord.endsWith('а') || lastWord.endsWith('я')) {
        if (lastWord === 'семья') {
            conjugatedWord = 'создать семью';
        } else if (lastWord === 'забота') {
            conjugatedWord = 'заботиться';
        } else if (lastWord === 'внимательность') {
            conjugatedWord = 'быть внимательным';
        } else if (lastWord === 'творчество') {
            conjugatedWord = 'творить';
        } else {
            conjugatedWord = lastWord.slice(0, -1) + 'ить';
        }
    }
    // Для других случаев оставляем как есть
    else if (['путешествия', 'сила воли', 'личный рост', 'помощь другим'].includes(lastWord)) {
        conjugatedWord = lastWord;
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
