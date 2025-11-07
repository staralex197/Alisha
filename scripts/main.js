/* CSS переменные для темной и светлой тем с улучшенным дизайном */
:root[data-theme="dark"] {
    --primary-bg: #0f0f23;
    --secondary-bg: #1a1a2e;
    --surface-bg: rgba(30, 30, 46, 0.7);
    --container-bg: rgba(30, 30, 46, 0.6);
    --glass-effect: rgba(17, 17, 27, 0.5);
    --glass-border: rgba(255, 255, 255, 0.15);
    
    --text-primary: #e2e8f0;
    --text-secondary: #a0aec0;
    --text-muted: #718096;
    
    --accent-purple: #c084fc;
    --accent-pink: #f472b6;
    --accent-blue: #60a5fa;
    --accent-green: #34d399;
    --accent-red: #f87171;
    --accent-yellow: #fbbf24;
    
    --player-bg: rgba(30, 30, 46, 0.8);
    --player-text: rgba(255, 255, 255, 0.95);
    --player-secondary: rgba(255, 255, 255, 0.7);
    --player-accent: #c084fc;
    
    --shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    --shadow-hover: 0 25px 50px rgba(0, 0, 0, 0.5);
    --shadow-small: 0 4px 12px rgba(0, 0, 0, 0.25);
}

:root[data-theme="light"] {
    --primary-bg: #f0f4f8;
    --secondary-bg: #e2e8f0;
    --surface-bg: rgba(255, 255, 255, 0.7);
    --container-bg: rgba(255, 255, 255, 0.6);
    --glass-effect: rgba(255, 255, 255, 0.5);
    --glass-border: rgba(0, 0, 0, 0.1);
    
    --text-primary: #2d3748;
    --text-secondary: #4a5568;
    --text-muted: #718096;
    
    --accent-purple: #805ad5;
    --accent-pink: #d53f8c;
    --accent-blue: #3182ce;
    --accent-green: #38a169;
    --accent-red: #e53e3e;
    --accent-yellow: #d69e2e;
    
    --player-bg: rgba(255, 255, 255, 0.8);
    --player-text: rgba(45, 55, 72, 0.95);
    --player-secondary: rgba(45, 55, 72, 0.7);
    --player-accent: #805ad5;
    
    --shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    --shadow-hover: 0 25px 50px rgba(0, 0, 0, 0.15);
    --shadow-small: 0 4px 12px rgba(0, 0, 0, 0.08);
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    background: linear-gradient(135deg, var(--primary-bg) 0%, var(--secondary-bg) 100%);
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    min-height: 100vh;
    margin: 0;
    padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
    overflow-x: hidden;
    line-height: 1.6;
    color: var(--text-primary);
    transition: background-color 0.3s ease, color 0.3s ease;
    position: relative;
}

/* Фоновый градиент для красоты */
body::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: 
        radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.05) 0%, transparent 50%);
    pointer-events: none;
    z-index: -1;
}

/* ПЕРЕКЛЮЧАТЕЛЬ ТЕМ */
.theme-toggle {
    position: fixed;
    top: 80px;
    right: 20px;
    z-index: 1001;
    background: var(--surface-bg);
    backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid var(--glass-border);
    border-radius: 50px;
    padding: 10px 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    color: var(--text-primary);
    font-size: 0.9em;
    font-weight: 500;
    box-shadow: var(--shadow-small);
}

.theme-toggle:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-hover);
}

.theme-icon {
    font-size: 1.1em;
}

.theme-text {
    white-space: nowrap;
}

/* ЭКРАН ЗАГРУЗКИ */
.loading-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, var(--primary-bg) 0%, var(--secondary-bg) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    transition: opacity 0.5s ease;
}

.loading-screen.hidden {
    opacity: 0;
    pointer-events: none;
}

.loading-content {
    text-align: center;
    color: var(--text-primary);
    max-width: 400px;
    padding: 0 20px;
}

.loading-spinner {
    width: 60px;
    height: 60px;
    border: 4px solid var(--text-muted);
    border-left: 4px solid var(--accent-purple);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 30px;
}

.loading-content h1 {
    font-size: clamp(1.8em, 5vw, 2.2em);
    margin-bottom: 15px;
    color: var(--text-primary);
}

.loading-content p {
    font-size: clamp(1em, 3vw, 1.1em);
    opacity: 0.9;
    margin-bottom: 30px;
    color: var(--text-secondary);
}

.loading-progress {
    width: 100%;
    height: 6px;
    background: var(--text-muted);
    border-radius: 3px;
    overflow: hidden;
}

.loading-progress-bar {
    height: 100%;
    background: linear-gradient(90deg, var(--accent-pink), var(--accent-purple));
    border-radius: 3px;
    width: 0%;
    transition: width 0.3s ease;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* АДАПТИВНЫЙ МУЗЫКАЛЬНЫЙ ПЛЕЕР - ИСПРАВЛЕННЫЙ */
.music-player {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: var(--player-bg);
    backdrop-filter: blur(20px) saturate(180%);
    border-bottom: 1px solid var(--glass-border);
    z-index: 1000;
    transition: all 0.3s ease;
    padding: 8px 0;
}

.player-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 20px;
}

.player-main {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    flex-wrap: wrap;
}

/* Мобильная версия плеера */
.music-player.mobile-layout .player-main {
    flex-direction: column;
    gap: 10px;
}

.music-player.mobile-layout .player-track-info {
    width: 100%;
    justify-content: center;
}

.music-player.mobile-layout .player-controls {
    width: 100%;
    justify-content: center;
}

.music-player.mobile-layout .progress-container {
    width: 100%;
    order: 3;
    margin: 5px 0;
}

.music-player.mobile-layout .player-extra {
    width: 100%;
    justify-content: space-between;
    order: 4;
}

/* Десктоп версия плеера */
.music-player.desktop-layout .player-main {
    flex-direction: row;
}

.player-track-info {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 12px;
}

.track-cover {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: linear-gradient(135deg, var(--accent-pink), var(--accent-purple));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1em;
    color: var(--text-primary);
    box-shadow: var(--shadow-small);
    flex-shrink: 0;
}

.track-details {
    flex: 1;
    min-width: 0;
}

.track-title {
    font-size: 0.9em;
    color: var(--player-text);
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.track-artist {
    font-size: 0.8em;
    color: var(--player-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.player-controls {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
}

.control-btn {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    font-size: 0.9em;
    cursor: pointer;
    color: var(--player-text);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    box-shadow: var(--shadow-small);
    flex-shrink: 0;
}

.control-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
    box-shadow: var(--shadow);
}

.play-btn {
    width: 42px;
    height: 42px;
    background: rgba(255, 255, 255, 0.15);
    font-size: 1em;
}

.progress-container {
    flex: 2;
    max-width: 400px;
    height: 5px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;
    position: relative;
    cursor: pointer;
    transition: all 0.3s ease;
    flex-shrink: 0;
}

.progress-container:hover {
    height: 6px;
}

.progress-bar-music {
    height: 100%;
    background: linear-gradient(90deg, var(--player-accent), var(--accent-blue));
    width: 0%;
    transition: width 0.1s linear;
    border-radius: 3px;
}

.player-extra {
    display: flex;
    align-items: center;
    gap: 15px;
    flex-shrink: 0;
}

.time-display {
    font-size: 0.8em;
    color: var(--player-secondary);
    white-space: nowrap;
    font-weight: 500;
    flex-shrink: 0;
}

.volume-container {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
}

.volume-icon {
    cursor: pointer;
    transition: transform 0.2s ease;
    font-size: 1.1em;
}

.volume-icon:hover {
    transform: scale(1.1);
}

.volume-slider {
    width: 80px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    height: 4px;
    outline: none;
    -webkit-appearance: none;
    transition: all 0.3s ease;
}

.volume-slider:hover {
    height: 5px;
}

.volume-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--player-accent);
    cursor: pointer;
    box-shadow: var(--shadow-small);
    transition: all 0.3s ease;
}

.volume-slider::-webkit-slider-thumb:hover {
    transform: scale(1.2);
}

/* Кнопка плейлиста */
.playlist-toggle {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 10px;
    padding: 8px 16px;
    font-size: 0.8em;
    cursor: pointer;
    color: var(--player-text);
    transition: all 0.3s ease;
    white-space: nowrap;
    font-weight: 500;
    box-shadow: var(--shadow-small);
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
}

.playlist-toggle:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
    box-shadow: var(--shadow);
}

.playlist-icon {
    font-size: 1em;
}

.playlist-text {
    font-weight: 500;
}

/* Плейлист - исправленное поведение */
.playlist-container {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    background: var(--glass-effect);
    backdrop-filter: blur(20px) saturate(180%);
    display: none;
}

.playlist-container.open {
    max-height: min(300px, 50vh);
    display: block;
}

.playlist {
    padding: 15px 20px;
    max-height: 280px;
    overflow-y: auto;
}

.playlist-item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-bottom: 6px;
    color: var(--player-text);
    border: 1px solid transparent;
    background: rgba(255, 255, 255, 0.05);
}

.playlist-item:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: var(--glass-border);
    transform: translateX(5px);
}

.playlist-item.active {
    background: rgba(255, 255, 255, 0.15);
    border-left: 4px solid var(--player-accent);
    box-shadow: var(--shadow);
}

.playlist-item-icon {
    margin-right: 15px;
    font-size: 1em;
    opacity: 0.9;
    transition: all 0.3s ease;
    flex-shrink: 0;
}

.playlist-item:hover .playlist-item-icon {
    transform: scale(1.1);
}

.playlist-item-info {
    flex-grow: 1;
    min-width: 0;
}

.playlist-item-title {
    font-size: 0.9em;
    font-weight: 600;
    color: var(--player-text);
    margin-bottom: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.playlist-item-artist {
    font-size: 0.8em;
    color: var(--player-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.playlist-item-duration {
    font-size: 0.8em;
    color: var(--player-secondary);
    margin-left: 15px;
    font-weight: 500;
    flex-shrink: 0;
}

/* ОСНОВНОЙ КОНТЕЙНЕР - полупрозрачный */
.container {
    background: var(--container-bg);
    backdrop-filter: blur(20px) saturate(180%);
    border-radius: 25px;
    padding: clamp(20px, 4vw, 40px);
    box-shadow: var(--shadow);
    max-width: min(800px, 90vw);
    width: 90%;
    position: relative;
    min-height: min(500px, 80vh);
    margin: clamp(100px, 12vh, 140px) auto 40px;
    transition: all 0.3s ease;
    border: 1px solid var(--glass-border);
    overflow: hidden;
}

.screen {
    display: none;
    animation: fadeInUp 0.6s ease;
}

.screen.active {
    display: block;
}

.welcome-content,
.final-content,
.error-content {
    text-align: center;
    max-width: 600px;
    margin: 0 auto;
}

h1 {
    color: var(--text-primary);
    margin-bottom: clamp(20px, 3vh, 25px);
    font-size: clamp(1.8em, 5vw, 2.5em);
    background: linear-gradient(45deg, var(--accent-pink), var(--accent-purple), var(--accent-blue), var(--accent-green));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 700;
    line-height: 1.2;
}

.question-text {
    font-size: clamp(1.1em, 3vw, 1.3em);
    color: var(--text-secondary);
    margin-bottom: clamp(25px, 4vh, 35px);
    line-height: 1.7;
    min-height: clamp(40px, 6vh, 60px);
    text-align: center;
}

.input-section {
    margin: clamp(25px, 4vh, 35px) 0;
}

.user-input {
    width: 100%;
    min-height: clamp(80px, 15vh, 120px);
    max-height: clamp(100px, 20vh, 150px);
    padding: clamp(15px, 3vw, 20px);
    border: 2px solid var(--glass-border);
    border-radius: 18px;
    font-size: clamp(1em, 2vw, 1.1em);
    font-family: inherit;
    resize: none;
    transition: all 0.3s ease;
    margin-bottom: 20px;
    background: var(--glass-effect);
    box-shadow: var(--shadow-small);
    line-height: 1.6;
    color: var(--text-primary);
    overflow-y: auto;
}

.user-input:focus {
    outline: none;
    border-color: var(--accent-purple);
    box-shadow: 0 0 0 4px rgba(192, 132, 252, 0.1), var(--shadow);
    transform: translateY(-2px);
}

.user-input::placeholder {
    color: var(--text-muted);
    font-style: italic;
}

.buttons {
    display: flex;
    gap: clamp(10px, 2vw, 15px);
    justify-content: center;
    flex-wrap: wrap;
    margin-top: 10px;
}

.btn {
    padding: clamp(12px, 2vw, 14px) clamp(20px, 3vw, 30px);
    border: none;
    border-radius: 50px;
    font-size: clamp(1em, 2vw, 1.1em);
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: min(180px, 100%);
    font-weight: 600;
    box-shadow: var(--shadow);
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(10px);
    flex: 1;
    max-width: 300px;
}

.btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s ease;
}

.btn:hover::before {
    left: 100%;
}

.btn-primary {
    background: linear-gradient(135deg, var(--accent-pink), var(--accent-purple));
    color: var(--text-primary);
    border: 1px solid var(--glass-border);
}

.btn-secondary {
    background: linear-gradient(135deg, var(--accent-blue), var(--accent-green));
    color: var(--text-primary);
    border: 1px solid var(--glass-border);
}

.btn-success {
    background: linear-gradient(135deg, var(--accent-green), var(--accent-blue));
    color: var(--text-primary);
    border: 1px solid var(--glass-border);
}

.btn-outline {
    background: transparent;
    border: 2px solid var(--accent-purple);
    color: var(--accent-purple);
}

.btn:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-hover);
}

.btn:active {
    transform: translateY(-1px);
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
}

.character-count {
    text-align: right;
    color: var(--text-secondary);
    font-size: 0.9em;
    margin-top: -15px;
    margin-bottom: 15px;
    font-weight: 500;
}

/* ОКОШКО ФОРМУЛИРОВКИ */
.formulation-section {
    background: linear-gradient(135deg, rgba(192, 132, 252, 0.1), rgba(96, 165, 250, 0.1));
    color: var(--text-primary);
    padding: clamp(20px, 3vw, 25px);
    border-radius: 20px;
    margin: clamp(15px, 2vh, 20px) 0;
    text-align: left;
    display: none;
    animation: slideInUp 0.5s ease;
    box-shadow: var(--shadow);
    border: 1px solid var(--glass-border);
    backdrop-filter: blur(10px);
    max-height: min(200px, 30vh);
    overflow-y: auto;
}

.formulation-text {
    font-size: clamp(1em, 2vw, 1.1em);
    line-height: 1.6;
    margin-bottom: 20px;
    font-weight: 500;
}

/* Стихотворение - убираем ползунок */
.poem-container {
    background: linear-gradient(135deg, rgba(192, 132, 252, 0.1), rgba(96, 165, 250, 0.1));
    color: var(--text-primary);
    padding: clamp(20px, 3vw, 30px);
    border-radius: 20px;
    margin: clamp(20px, 3vh, 30px) 0;
    text-align: center;
    box-shadow: var(--shadow);
    border: 1px solid var(--glass-border);
    backdrop-filter: blur(10px);
    max-height: min(400px, 50vh);
    overflow-y: auto;
}

/* Убираем скроллбар для стихотворения */
.poem-container::-webkit-scrollbar {
    display: none;
}

.poem-container {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

.poem-title {
    font-size: clamp(1.4em, 4vw, 1.8em);
    margin-bottom: 20px;
    font-style: italic;
    font-weight: 600;
    color: var(--accent-purple);
}

.poem-text {
    font-size: clamp(1em, 2vw, 1.1em);
    line-height: 1.8;
    font-style: italic;
    white-space: pre-line;
    font-weight: 500;
}

.poem-author {
    font-size: clamp(0.9em, 2vw, 1em);
    margin-top: 20px;
    font-style: normal;
    opacity: 0.9;
    font-weight: 600;
    color: var(--accent-blue);
}

/* ПРОГРЕСС БАР И НАВИГАЦИЯ */
.progress-navigation {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: clamp(20px, 3vh, 25px) 0;
    gap: 15px;
    flex-wrap: wrap;
}

.progress-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 15px;
    min-width: 0;
}

.progress {
    flex: 1;
    height: 8px;
    background: var(--text-muted);
    border-radius: 4px;
    overflow: hidden;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
}

.progress-bar {
    height: 100%;
    background: linear-gradient(90deg, var(--accent-pink), var(--accent-purple), var(--accent-blue));
    border-radius: 4px;
    transition: width 0.5s ease;
    position: relative;
}

.progress-bar::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    animation: shimmer 2s infinite;
}

/* Индикаторы вопросов - исправленные */
.progress-steps {
    display: flex;
    gap: 8px;
    margin-top: 12px;
    flex-wrap: wrap;
    justify-content: center;
}

.progress-step {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--text-muted);
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid transparent;
    flex-shrink: 0;
}

.progress-step.active {
    background: var(--accent-purple);
    transform: scale(1.2);
    box-shadow: 0 0 0 3px rgba(192, 132, 252, 0.2);
}

.progress-step.completed {
    background: var(--accent-green);
}

.progress-step:hover {
    transform: scale(1.3);
    box-shadow: 0 0 0 3px rgba(192, 132, 252, 0.3);
}

.nav-buttons {
    display: flex;
    gap: clamp(8px, 2vw, 12px);
    flex-shrink: 0;
}

.nav-btn {
    padding: clamp(8px, 2vw, 10px) clamp(15px, 3vw, 20px);
    border: none;
    border-radius: 25px;
    font-size: clamp(0.9em, 2vw, 0.95em);
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
    min-width: min(100px, 100%);
    box-shadow: var(--shadow-small);
    backdrop-filter: blur(10px);
    flex: 1;
}

.nav-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
}

.nav-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: var(--shadow);
}

.suggestion-buttons {
    display: flex;
    gap: clamp(6px, 1vw, 10px);
    flex-wrap: wrap;
    justify-content: center;
    margin-bottom: 15px;
}

.suggestion-btn {
    padding: clamp(6px, 1vw, 8px) clamp(12px, 2vw, 16px);
    background: rgba(192, 132, 252, 0.1);
    border: 2px solid rgba(192, 132, 252, 0.3);
    border-radius: 20px;
    color: var(--accent-purple);
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: clamp(0.85em, 2vw, 0.9em);
    font-weight: 500;
    flex-shrink: 0;
}

.suggestion-btn:hover {
    background: rgba(192, 132, 252, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(192, 132, 252, 0.2);
}

/* АНИМАЦИИ */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(40px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes slideInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
}

/* КОНТЕЙНЕР ДЛЯ СЕРДЕЧЕК */
.hearts-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0; /* Сердечки ПОД всем контентом */
}

/* СТИЛИ ДЛЯ СТИХОТВОРЕНИЙ */
.poem-card {
    background: var(--surface-bg);
    border-radius: 20px;
    padding: clamp(20px, 3vw, 30px);
    margin: clamp(15px, 2vh, 20px) 0;
    box-shadow: var(--shadow);
    border: 1px solid var(--glass-border);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(10px);
}

.poem-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--accent-pink), var(--accent-purple), var(--accent-blue), var(--accent-green));
}

.poem-card:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-hover);
}

.poem-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 2px solid rgba(192, 132, 252, 0.1);
    font-size: 0.9em;
    color: var(--text-secondary);
    font-weight: 500;
    flex-wrap: wrap;
    gap: 10px;
}

.poem-year {
    color: var(--text-muted);
    font-style: italic;
}

.poem-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    justify-content: center;
    margin-top: 15px;
}

.tag {
    background: linear-gradient(135deg, rgba(192, 132, 252, 0.1), rgba(96, 165, 250, 0.1));
    padding: 5px 12px;
    border-radius: 15px;
    font-size: 0.8em;
    color: var(--accent-purple);
    border: 1px solid rgba(192, 132, 252, 0.2);
    font-weight: 500;
    transition: all 0.3s ease;
}

.tag:hover {
    background: linear-gradient(135deg, rgba(192, 132, 252, 0.2), rgba(96, 165, 250, 0.2));
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(192, 132, 252, 0.2);
}

/* Анимация печати */
.typing-area {
    min-height: clamp(100px, 20vh, 150px);
    border-right: 3px solid var(--accent-pink);
    animation: blink 1s infinite;
    line-height: 1.7;
    margin-bottom: 20px;
    color: var(--text-primary);
    font-size: clamp(1em, 2vw, 1.1em);
    text-align: center;
    white-space: pre-line;
    font-weight: 500;
    padding: 15px;
    border-radius: 10px;
    background: rgba(17, 17, 27, 0.4);
}

@keyframes blink {
    0%, 50% { border-color: var(--accent-pink); }
    51%, 100% { border-color: transparent; }
}

.loading {
    text-align: center;
    padding: 20px;
    font-size: clamp(1em, 2vw, 1.1em);
    color: var(--text-secondary);
    font-weight: 500;
}

/* Временные сообщения */
.temp-message {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 20px;
    background: var(--accent-purple);
    color: white;
    border-radius: 25px;
    z-index: 10000;
    animation: fadeInOut 3s ease-in-out;
    font-weight: 500;
    box-shadow: var(--shadow);
}

.temp-message-warning {
    background: var(--accent-red);
}

@keyframes fadeInOut {
    0% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
    15% { opacity: 1; transform: translateX(-50%) translateY(0); }
    85% { opacity: 1; transform: translateX(-50%) translateY(0); }
    100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
}

/* Адаптивность для очень маленьких экранов */
@media (max-width: 480px) {
    .music-player {
        padding: 6px 0;
    }
    
    .player-container {
        padding: 0 10px;
    }
    
    .track-cover {
        width: 30px;
        height: 30px;
    }
    
    .track-title {
        font-size: 0.8em;
    }
    
    .track-artist {
        font-size: 0.75em;
    }
    
    .control-btn {
        width: 32px;
        height: 32px;
    }
    
    .play-btn {
        width: 36px;
        height: 36px;
    }
    
    .volume-container {
        display: flex;
        align-items: center;
        gap: 5px;
    }
    
    .volume-slider {
        width: 50px;
    }
    
    .playlist-toggle .playlist-text {
        display: none;
    }
    
    .theme-toggle {
        top: 70px;
        right: 10px;
        padding: 8px 12px;
    }
    
    .theme-text {
        display: none;
    }
}

/* Планшеты */
@media (min-width: 769px) and (max-width: 1024px) {
    .music-player .player-main {
        flex-wrap: nowrap;
    }
    
    .music-player .progress-container {
        max-width: 200px;
    }
}

/* Очень большие экраны */
@media (min-width: 1920px) {
    .container {
        max-width: 900px;
    }
    
    .player-container {
        max-width: 1600px;
    }
}

/* Улучшенная поддержка тач-устройств */
@media (hover: none) and (pointer: coarse) {
    .btn, .nav-btn, .suggestion-btn, .control-btn {
        min-height: 44px;
        min-width: 44px;
    }
    
    .progress-step {
        min-width: 20px;
        min-height: 20px;
    }
    
    .user-input {
        font-size: 16px;
    }
}
