// Библиотека для работы со стихами с современными авторскими произведениями
class PoemsLibrary {
    constructor() {
        this.poems = this.getBuiltInPoems();
        this.isTyping = false;
        this.currentAnimation = null;
        this.currentElement = null;
    }

    getBuiltInPoems() {
        return [
            {
                "id": 1,
                "title": "Невыносимо",
                "author": "Вера Полозкова",
                "year": "2015",
                "text": "невыносимо\nкогда тебя нет\nи нечем дышать\nкогда ты ушел\nи некуда спать\n\nневыносимо\nкогда ты пришел\nи нечем дышать\nкогда ты со мной\nи некуда деться"
            },
            {
                "id": 2,
                "title": "Любовь",
                "author": "Алексей Цветков",
                "year": "2000",
                "text": "Любовь — это когда ты идешь по улице\nи видишь в каждом встречном его черты.\nЛюбовь — это когда ты слышишь в каждом шуме\nего шаги, его дыханье, его мечты.\n\nЛюбовь — это болезнь, которую не лечат,\nа только облегчают на время боль.\nЛюбовь — это когда ты готов отдать всё,\nчтобы он был счастлив, хоть на часок."
            },
            {
                "id": 3,
                "title": "Я тебя никогда не забуду",
                "author": "Александр Кушнер",
                "year": "2002",
                "text": "Я тебя никогда не забуду.\nТы вошла в мое сердце, как в храм.\nТы вошла в мое сердце, как в улей,\nГде медовая полночь гудит.\n\nТы вошла в мое сердце, как в устье\nОстановленной где-то реки.\nТы вошла в мое сердце, как в искусство,\nКак в стихи, как в болезнь, как в тоску."
            },
            {
                "id": 4,
                "title": "Баллада о прокуренной квартире",
                "author": "Иосиф Бродский",
                "year": "1972",
                "text": "Когда тебя нет, в прокуренной квартире\nвозникает пространство. И время в нем бьется\nо стены, как муха о стекло.\n\nТы ушла, оставив на столе окурки,\nчашки с чаем, крошки на скатерти —\nвсе, что называется \"быт\".\nНо без тебя этот быт\nпревратился в пытку.\n\nИ я понимаю, что любовь —\nэто не счастье, а крест.\nИ нести его нужно молча,\nне ожидая наград."
            },
            {
                "id": 5,
                "title": "Определение поэзии",
                "author": "Арсений Тарковский",
                "year": "1982",
                "text": "Поэзия — это то, что остается\nкогда уходят все слова.\nЭто молчание между строчками,\nэто дыхание между рифмами.\n\nПоэзия — это не то, что сказано,\nа то, что понято без слов.\nЭто встреча двух одиночеств\nв пространстве одного стиха."
            },
            {
                "id": 6,
                "title": "Ночь",
                "author": "Анна Ахматова",
                "year": "1914",
                "text": "Тот же голос, тот же взгляд,\nТе же волосы льняные.\nВсе, как год тому назад.\n\nСквозь стекло лучи дневные\nВ комнату мою глядят.\nТолько я сама не та..."
            },
            {
                "id": 7,
                "title": "Я научилась просто, мудро жить",
                "author": "Анна Ахматова",
                "year": "1912",
                "text": "Я научилась просто, мудро жить,\nСмотреть на небо и молиться Богу,\nИ долго перед вечером бродить,\nЧтоб утомить ненужную тревогу.\n\nКогда шуршат в овраге лопухи\nИ никнет гроздь рябины желто-красной,\nСлагаю я веселые стихи\nО жизни тленной, тленной и прекрасной."
            },
            {
                "id": 8,
                "title": "Бьется сердце беспокойное",
                "author": "Борис Пастернак",
                "year": "1956",
                "text": "Бьется сердце беспокойное,\nКак птица в клетке за стеной.\nЖду тебя, мое спокойное,\nМой неслух, мой беспокойный.\n\nТы придешь — и все изменится,\nСтанет тихо и светло.\nТолько сердце продолжает биться,\nБудто что-то не дошло."
            },
            {
                "id": 9,
                "title": "Любить иных — тяжелый крест",
                "author": "Борис Пастернак",
                "year": "1931",
                "text": "Любить иных — тяжелый крест,\nА ты прекрасна без извилин,\nИ прелести твоей секрет\nРазгадке жизни равносилен.\n\nВесной слышны щелчки проталин,\nИ ты с утра до темна дома.\nТвой голос — будто звук металла,\nКоторым бьются о стекло."
            },
            {
                "id": 10,
                "title": "Одиночество",
                "author": "Евгений Евтушенко",
                "year": "1963",
                "text": "Одиночество — это когда вечером\nвозвращаешься в пустую квартиру\nи понимаешь, что тебя никто не ждет.\n\nОдиночество — это когда включаешь телевизор\nне для того, чтобы смотреть,\nа для того, чтобы в квартире были голоса.\n\nОдиночество — это когда понимаешь,\nчто самая большая роскошь —\nэто услышать: \"Я тебя ждала\"."
            },
            {
                "id": 11,
                "title": "Со мною вот что происходит",
                "author": "Маргарита Алигер",
                "year": "1940",
                "text": "Со мною вот что происходит:\nКо мне мой старый друг не ходит,\nА ходят маленькие дети\nИ просят: \"Поиграйте, дети!\"\n\nА я играю. Я богата.\nИ жизнь моя не поката,\nА как река, глубока, широка,\nИ в ней так много берегов."
            },
            {
                "id": 12,
                "title": "Никого не будет в доме",
                "author": "Борис Пастернак",
                "year": "1931",
                "text": "Никого не будет в доме,\nКроме сумерек. Один\nЗимний день в сквозном проеме\nНезадернутых гардин.\n\nТолько белых мокрых комьев\nБыстрый промельк маховой,\nТолько крыши, снег, и, кроме\nКрыш и снега, никого."
            },
            {
                "id": 13,
                "title": "Снег идет",
                "author": "Борис Пастернак",
                "year": "1957",
                "text": "Снег идет, снег идет.\nК белым звездочкам в буране\nТянутся цветы герани\nЗа оконный переплет.\n\nСнег идет, и все в смятеньи,\nВсе пускается в полет,\nЧерной лестницы ступени,\nПерекрестка поворот."
            },
            {
                "id": 14,
                "title": "Я могу тебя очень ждать",
                "author": "Эдуард Асадов",
                "year": "1970",
                "text": "Я могу тебя очень ждать,\nДолго-долго и верно-верно,\nИ ночами могу не спать\nГод, и два, и всю жизнь, наверно!\n\nПусть листочки у ворот\nПожелтеют и облетают,\nПусть сугробы снега у ворот\nКак султаны заночают.\n\nПусть проходят за годом год...\nЯ могу тебя очень ждать,\nКак никто на свете не ждал!"
            },
            {
                "id": 15,
                "title": "Стихи о неизвестном солдате",
                "author": "Иосиф Бродский",
                "year": "1986",
                "text": "Ни креста, ни камня не поставят\nНа могиле этой. Никогда.\nТолько ветер свистнет, да осядет\nПыль на травы. Да пройдет беда.\n\nТолько звезды ночью посветят\nХолодным, равнодушным светом.\nТолько время медленно катит\nСвои волны к вечному рассвету."
            }
        ];
    }

      // Получить случайный стих
    getRandomPoem() {
        if (this.poems.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * this.poems.length);
        return this.poems[randomIndex];
    }

    // Получить все стихи
    getAllPoems() {
        return this.poems;
    }

    // Анимация печати текста
    async typeText(element, text, speed = 40) {
        if (this.isTyping) {
            this.stopTyping();
        }

        this.isTyping = true;
        this.currentElement = element;
        element.innerHTML = '';
        element.style.borderRight = '2px solid var(--primary)';
        
        let i = 0;
        let lineBreaks = 0;
        
        return new Promise((resolve) => {
            this.currentAnimation = setInterval(() => {
                if (i < text.length) {
                    const char = text[i];
                    
                    if (char === '\n') {
                        element.innerHTML += '<br>';
                        lineBreaks++;
                        
                        // Небольшая пауза после каждой строфы
                        if (lineBreaks % 2 === 0) {
                            clearInterval(this.currentAnimation);
                            setTimeout(() => {
                                this.currentAnimation = setInterval(() => {
                                    if (i < text.length) {
                                        const nextChar = text[i];
                                        // Продолжаем с того же места
                                        this.addCharacter(element, nextChar);
                                        i++;
                                        element.scrollTop = element.scrollHeight;
                                    } else {
                                        this.finishTyping(element, resolve);
                                    }
                                }, speed);
                            }, 300);
                            return;
                        }
                    } else {
                        this.addCharacter(element, char);
                    }
                    
                    element.scrollTop = element.scrollHeight;
                    i++;
                } else {
                    this.finishTyping(element, resolve);
                }
            }, speed);
        });
    }

    // Добавить символ с обработкой специальных символов
    addCharacter(element, char) {
        if (char === ' ') {
            element.innerHTML += '&nbsp;';
        } else if (char === '\t') {
            element.innerHTML += '&nbsp;&nbsp;&nbsp;&nbsp;';
        } else {
            element.innerHTML += char;
        }
    }

    // Завершение анимации
    finishTyping(element, resolve) {
        clearInterval(this.currentAnimation);
        this.isTyping = false;
        this.currentAnimation = null;
        this.currentElement = null;
        element.style.borderRight = 'none';
        if (resolve) resolve();
    }

    // Остановка анимации
    stopTyping() {
        if (this.currentAnimation) {
            clearInterval(this.currentAnimation);
            this.isTyping = false;
            this.currentAnimation = null;
            if (this.currentElement) {
                this.currentElement.style.borderRight = 'none';
                this.currentElement = null;
            }
        }
    }

    // Создать HTML для стиха (БЕЗ ТЕГОВ)
    createPoemHTML(poem) {
        return `
            <div class="poem-card fade-in" data-poem-id="${poem.id}">
                <h3 class="poem-title">${this.escapeHtml(poem.title)}</h3>
                <div class="poem-meta">
                    <span class="poem-author">${this.escapeHtml(poem.author)}</span>
                    <span class="poem-year">${this.escapeHtml(poem.year)}</span>
                </div>
                <div class="poem-text">${this.escapeHtml(poem.text).replace(/\n/g, '<br>')}</div>
            </div>
        `;
    }

    // Экранирование HTML
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Создаем глобальный экземпляр
window.poemsLibrary = new PoemsLibrary();
