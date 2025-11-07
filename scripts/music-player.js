// Умный музыкальный плеер с полной адаптивностью
const MusicPlayer = {
    audio: null,
    isPlaying: false,
    currentTrack: 0,
    updateInterval: null,
    isPlaylistOpen: false,
    audioInitialized: false,
    isLoading: false,
    volume: 0.2,
    fadeInterval: null,
    autoPlayEnabled: false,
    isMobile: false,

    // Треки будут загружаться автоматически
    tracks: [],

    async init() {
        try {
            this.detectDeviceType();
            this.audio = new Audio();
            this.audio.volume = 0;
            this.audio.preload = 'metadata';
            
            // Улучшенная обработка ошибок загрузки
            await this.loadTracksFromFolder();
            
            // События для обработки ошибок
            this.setupAudioEvents();
            
            // Инициализация UI
            this.initializeUI();
            
            this.audioInitialized = true;
            console.log('✅ Музыкальный плеер инициализирован, треков:', this.tracks.length);
            
            // Автоматическое плавное воспроизведение с задержкой
            setTimeout(() => {
                this.autoPlayWithFade();
            }, 2000);
            
        } catch (error) {
            console.error('❌ Ошибка инициализации плеера:', error);
            this.showFallbackPlayer();
        }
    },

    // Определение типа устройства
    detectDeviceType() {
        this.isMobile = window.innerWidth <= 768;
        console.log(`🎵 Плеер: ${this.isMobile ? 'Мобильный режим' : 'Десктоп режим'}`);
    },

    // Автоматическая загрузка треков из папки music
    async loadTracksFromFolder() {
        try {
            const trackFiles = [
                '2hug_-_Nasha_zhizn_79029104.mp3',
                'Basta_-_Ty_ta_61892966.mp3', 
                'MATRANG_-_Privet_64870751.mp3',
                'PHARAOH_Caxttx_-_Bojjsbjend_64493563.mp3'
            ];

            this.tracks = [];
            
            for (const filename of trackFiles) {
                const track = {
                    name: this.formatTrackName(filename),
                    artist: this.getArtistFromFilename(filename),
                    url: `music/${filename}`,
                    duration: '0:00',
                    filename: filename
                };
                
                // Пытаемся получить реальную длительность
                try {
                    await this.loadTrackDuration(track);
                } catch (e) {
                    console.warn(`Не удалось загрузить длительность для ${filename}`);
                }
                
                this.tracks.push(track);
            }

            if (this.tracks.length === 0) {
                throw new Error('Треки не найдены');
            }

        } catch (error) {
            console.error('❌ Ошибка загрузки треков:', error);
            // Fallback треки
            this.tracks = [{
                name: "Демо трек",
                artist: "Музыкальный плеер",
                url: "#",
                duration: "3:00"
            }];
        }
    },

    // Загрузка длительности трека
    loadTrackDuration(track) {
        return new Promise((resolve, reject) => {
            const tempAudio = new Audio();
            tempAudio.src = track.url;
            
            tempAudio.addEventListener('loadedmetadata', () => {
                track.duration = this.formatTime(tempAudio.duration);
                tempAudio.remove();
                resolve();
            });
            
            tempAudio.addEventListener('error', () => {
                tempAudio.remove();
                reject(new Error('Ошибка загрузки метаданных'));
            });
            
            // Таймаут
            setTimeout(() => {
                tempAudio.remove();
                reject(new Error('Таймаут загрузки'));
            }, 5000);
        });
    },

    // Форматирование имени файла в читаемое название
    formatTrackName(filename) {
        return filename
            .replace(/\.mp3$/, '')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/^\d+/, '') // Убираем цифры в начале
            .trim();
    },

    // Извлечение имени артиста из文件名
    getArtistFromFilename(filename) {
        const parts = filename.split('_-_');
        if (parts[0]) {
            return parts[0]
                .replace(/_/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase())
                .trim();
        }
        return 'Неизвестный артист';
    },

    setupAudioEvents() {
        this.audio.addEventListener('error', (e) => {
            console.error('❌ Ошибка аудио:', e);
            this.handleAudioError();
        });
        
        this.audio.addEventListener('loadstart', () => {
            this.showLoadingState();
        });
        
        this.audio.addEventListener('canplay', () => {
            this.hideLoadingState();
        });
        
        this.audio.addEventListener('ended', () => {
            this.nextTrack();
        });
        
        this.audio.addEventListener('waiting', () => {
            this.showLoadingState();
        });
        
        this.audio.addEventListener('canplaythrough', () => {
            this.hideLoadingState();
        });

        // Обработка ресайза для адаптивности
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    },

    // Обработка изменения размера
    handleResize() {
        this.detectDeviceType();
        this.updatePlayerLayout();
    },

    // Обновление layout плеера в зависимости от устройства
    updatePlayerLayout() {
        const player = document.getElementById('musicPlayer');
        if (!player) return;

        if (this.isMobile) {
            player.classList.add('mobile-layout');
            player.classList.remove('desktop-layout');
        } else {
            player.classList.add('desktop-layout');
            player.classList.remove('mobile-layout');
        }
    },

    initializeUI() {
        this.updateTrackInfo(0);
        this.renderPlaylist();
        
        // Прогресс бар по клику
        const progressContainer = document.getElementById('progressContainer');
        if (progressContainer) {
            progressContainer.addEventListener('click', (e) => {
                this.handleProgressClick(e);
            });

            // Touch события для мобильных
            progressContainer.addEventListener('touchstart', (e) => {
                this.handleProgressClick(e);
            });
        }

        // Инициализация громкости
        const volumeSlider = document.getElementById('volumeSlider');
        if (volumeSlider) {
            volumeSlider.value = this.volume * 100;
            this.updateVolumeSlider(volumeSlider.value);

            // Touch события для громкости
            volumeSlider.addEventListener('touchstart', (e) => {
                e.stopPropagation();
            });
        }

        // ИСПРАВЛЕНИЕ: правильный обработчик для кнопки плейлиста
        const playlistToggle = document.getElementById('playlistToggle');
        if (playlistToggle) {
            playlistToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.togglePlaylist();
            });

            // Touch события
            playlistToggle.addEventListener('touchstart', (e) => {
                e.stopPropagation();
                this.togglePlaylist();
            });
        }

        // Обработка кликов вне плейлиста для закрытия
        document.addEventListener('click', (e) => {
            if (this.isPlaylistOpen && !e.target.closest('.music-player')) {
                this.closePlaylist();
            }
        });

        // Клавиатурные shortcuts
        this.setupKeyboardShortcuts();

        // Обновляем layout
        this.updatePlayerLayout();
    },

    // Настройка клавиатурных shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Пропускаем если пользователь вводит текст
            if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;

            switch(e.key) {
                case ' ':
                    e.preventDefault();
                    this.togglePlay();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextTrack();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.previousTrack();
                    break;
                case 'p':
                case 'P':
                    e.preventDefault();
                    this.togglePlaylist();
                    break;
                case 'Escape':
                    this.closePlaylist();
                    break;
            }
        });
    },

    // Плавное автовоспроизведение
    async autoPlayWithFade() {
        if (!this.audioInitialized || this.isPlaying || this.autoPlayEnabled) return;
        
        try {
            this.autoPlayEnabled = true;
            console.log('🎵 Запуск плавного автовоспроизведения...');
            
            // Загружаем первый трек если нужно
            if (!this.audio.src || this.audio.src !== this.tracks[this.currentTrack].url) {
                await this.loadTrack(this.currentTrack, false);
            }
            
            // Начинаем воспроизведение с нулевой громкостью
            await this.audio.play();
            this.isPlaying = true;
            this.updatePlayButton('⏸');
            this.startProgressUpdate();
            
            // Плавное увеличение громкости до 20%
            this.fadeIn(0, this.volume, 3000);
            
        } catch (error) {
            console.error('❌ Ошибка автовоспроизведения:', error);
            this.autoPlayEnabled = false;
            
            // Показываем сообщение об ошибке
            if (error.name === 'NotAllowedError') {
                this.showTemporaryMessage('Нажмите Play для начала воспроизведения 🎵', 'info');
            }
        }
    },

    // Плавное увеличение громкости (fade-in)
    fadeIn(startVolume, endVolume, duration = 3000) {
        this.stopFade();
    
        const startTime = performance.now();
        const initialVolume = this.audio.volume;
        
        const fadeFrame = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeProgress = progress < 0.5 
                ? 4 * progress * progress * progress 
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;
            
            this.audio.volume = initialVolume + (endVolume - initialVolume) * easeProgress;
            
            if (progress < 1) {
                this.fadeInterval = requestAnimationFrame(fadeFrame);
            } else {
                this.audio.volume = endVolume;
                this.fadeInterval = null;
            }
        };
        
        this.fadeInterval = requestAnimationFrame(fadeFrame);
    },

    // Плавное уменьшение громкости (fade-out)
    fadeOut(startVolume, endVolume, duration = 2000, onComplete = null) {
        this.stopFade();
    
        const startTime = performance.now();
        const initialVolume = this.audio.volume;
        
        const fadeFrame = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            this.audio.volume = initialVolume + (endVolume - initialVolume) * easeProgress;
            
            if (progress < 1) {
                this.fadeInterval = requestAnimationFrame(fadeFrame);
            } else {
                this.audio.volume = endVolume;
                this.fadeInterval = null;
                if (onComplete) onComplete();
            }
        };
        
        this.fadeInterval = requestAnimationFrame(fadeFrame);
    },

    // Остановка fade анимации
    stopFade() {
        if (this.fadeInterval) {
            cancelAnimationFrame(this.fadeInterval);
            this.fadeInterval = null;
        }
    },

    formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    },

    updateTrackInfo(index) {
        const nowPlaying = document.getElementById('nowPlaying');
        const trackArtist = document.getElementById('trackArtist');
        const duration = document.getElementById('duration');
        
        if (nowPlaying) nowPlaying.textContent = this.tracks[index].name;
        if (trackArtist) trackArtist.textContent = this.tracks[index].artist;
        if (duration) duration.textContent = this.tracks[index].duration;
    },

    togglePlay() {
        if (!this.audioInitialized) {
            this.init();
            return;
        }

        if (this.isPlaying) {
            this.pauseWithFade();
        } else {
            this.playWithFade();
        }

        // Вибрация на мобильных
        if (this.isMobile && navigator.vibrate) {
            navigator.vibrate(30);
        }
    },

    // Воспроизведение с fade-in
    async playWithFade() {
        if (!this.audioInitialized || this.isLoading) return;

        try {
            // Если аудио еще не загружено, загружаем текущий трек
            if (!this.audio.src || this.audio.src !== this.tracks[this.currentTrack].url) {
                await this.loadTrack(this.currentTrack, false);
            }
            
            const currentVolume = this.audio.volume;
            await this.audio.play();
            this.isPlaying = true;
            this.updatePlayButton('⏸');
            this.startProgressUpdate();
            
            // Плавное увеличение громкости до текущего уровня
            if (currentVolume < this.volume) {
                this.fadeIn(currentVolume, this.volume, 2000);
            }
            
        } catch (error) {
            console.error('❌ Ошибка воспроизведения:', error);
            this.handlePlaybackError(error);
        }
    },

    // Пауза с fade-out
    pauseWithFade() {
        if (!this.audioInitialized) return;
        
        const currentVolume = this.audio.volume;
        
        // Плавное уменьшение громкости перед паузой
        this.fadeOut(currentVolume, 0, 1000, () => {
            this.audio.pause();
            this.isPlaying = false;
            this.updatePlayButton('▶');
            this.stopProgressUpdate();
        });
    },

    updatePlayButton(icon) {
        const playBtn = document.getElementById('playBtn');
        if (playBtn) {
            playBtn.textContent = icon;
            playBtn.setAttribute('aria-label', icon === '▶' ? 'Воспроизвести' : 'Пауза');
            
            // Анимация нажатия на мобильных
            if (this.isMobile) {
                playBtn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    playBtn.style.transform = '';
                }, 150);
            }
        }
    },

    handleAudioError() {
        this.showErrorMessage('Ошибка загрузки трека 😔');
        this.isLoading = false;
        this.hideLoadingState();
    },

    handlePlaybackError(error) {
        let message = 'Ошибка воспроизведения';
        
        if (error.name === 'NotAllowedError') {
            message = 'Разрешите автовоспроизведение в браузере 🎵';
        } else if (error.name === 'NotSupportedError') {
            message = 'Формат не поддерживается';
        }
        
        this.showErrorMessage(message);
        this.isLoading = false;
        this.hideLoadingState();
    },

    showErrorMessage(message) {
        const nowPlaying = document.getElementById('nowPlaying');
        if (!nowPlaying) return;
        
        const originalText = nowPlaying.textContent;
        const originalColor = nowPlaying.style.color;
        
        nowPlaying.textContent = message;
        nowPlaying.style.color = 'var(--accent-red)';
        
        setTimeout(() => {
            nowPlaying.textContent = originalText;
            nowPlaying.style.color = originalColor;
        }, 3000);
    },

    showLoadingState() {
        this.isLoading = true;
        const nowPlaying = document.getElementById('nowPlaying');
        if (nowPlaying) {
            nowPlaying.textContent = 'Загрузка... ⏳';
        }
    },

    hideLoadingState() {
        this.isLoading = false;
        this.updateTrackInfo(this.currentTrack);
    },

    startProgressUpdate() {
        this.stopProgressUpdate();
        
        this.updateInterval = setInterval(() => {
            if (this.audio && this.audio.duration && !isNaN(this.audio.duration)) {
                const progress = (this.audio.currentTime / this.audio.duration) * 100;
                const musicProgress = document.getElementById('musicProgress');
                const currentTime = document.getElementById('currentTime');
                
                if (musicProgress) {
                    musicProgress.style.width = progress + '%';
                    musicProgress.setAttribute('aria-valuenow', Math.round(progress));
                }
                if (currentTime) {
                    currentTime.textContent = this.formatTime(this.audio.currentTime);
                }
            }
        }, 500);
    },

    stopProgressUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    },

    handleProgressClick(e) {
        if (!this.audio || !this.audio.duration || this.isLoading) return;
        
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        this.audio.currentTime = percent * this.audio.duration;
        
        const progress = percent * 100;
        const musicProgress = document.getElementById('musicProgress');
        if (musicProgress) {
            musicProgress.style.width = progress + '%';
            musicProgress.setAttribute('aria-valuenow', Math.round(progress));
        }

        // Вибрация на мобильных
        if (this.isMobile && navigator.vibrate) {
            navigator.vibrate(50);
        }
    },

    setVolume(volume) {
        this.volume = volume / 100;
        
        // Если музыка играет, плавно меняем громкость
        if (this.audio && this.isPlaying) {
            this.fadeIn(this.audio.volume, this.volume, 800);
        } else if (this.audio) {
            this.audio.volume = this.volume;
        }
        
        this.updateVolumeSlider(volume);

        // Вибрация на мобильных
        if (this.isMobile && navigator.vibrate) {
            navigator.vibrate(20);
        }
    },

    updateVolumeSlider(volume) {
        const volumeSlider = document.getElementById('volumeSlider');
        if (volumeSlider) {
            volumeSlider.style.background = `linear-gradient(90deg, var(--player-accent) ${volume}%, rgba(255, 255, 255, 0.2) ${volume}%)`;
        }
    },

    nextTrack() {
        this.currentTrack = (this.currentTrack + 1) % this.tracks.length;
        this.loadTrackWithFade(this.currentTrack);

        // Вибрация на мобильных
        if (this.isMobile && navigator.vibrate) {
            navigator.vibrate(50);
        }
    },

    previousTrack() {
        this.currentTrack = (this.currentTrack - 1 + this.tracks.length) % this.tracks.length;
        this.loadTrackWithFade(this.currentTrack);

        // Вибрация на мобильных
        if (this.isMobile && navigator.vibrate) {
            navigator.vibrate(50);
        }
    },

    // Загрузка трека с плавным переходом
    async loadTrackWithFade(index) {
        if (!this.audioInitialized) {
            this.init();
            return;
        }

        const wasPlaying = this.isPlaying;
        
        // Плавно уменьшаем громкость текущего трека
        if (wasPlaying) {
            await new Promise(resolve => {
                this.fadeOut(this.audio.volume, 0, 800, resolve);
            });
        }
        
        // Загружаем новый трек
        await this.loadTrack(index, false);
        
        // Плавно увеличиваем громкость нового трека
        if (wasPlaying) {
            this.audio.volume = 0;
            await this.audio.play();
            this.isPlaying = true;
            this.updatePlayButton('⏸');
            this.startProgressUpdate();
            this.fadeIn(0, this.volume, 2000);
        }
    },

    async loadTrack(index, autoPlay = false) {
        if (!this.audioInitialized) {
            this.init();
            return;
        }

        this.currentTrack = index;
        this.showLoadingState();
        
        try {
            // Останавливаем текущее воспроизведение и fade
            this.stopFade();
            this.audio.pause();
            this.isPlaying = false;
            this.updatePlayButton('▶');
            this.stopProgressUpdate();
            
            // Сбрасываем прогресс
            const musicProgress = document.getElementById('musicProgress');
            const currentTime = document.getElementById('currentTime');
            
            if (musicProgress) {
                musicProgress.style.width = '0%';
                musicProgress.setAttribute('aria-valuenow', 0);
            }
            if (currentTime) {
                currentTime.textContent = '0:00';
            }
            
            // Загружаем новый трек
            this.audio.src = this.tracks[index].url;
            this.audio.load();
            
            this.updateTrackInfo(index);
            this.renderPlaylist();
            
            // Воспроизводим если нужно
            if (autoPlay) {
                this.audio.volume = 0;
                await this.audio.play();
                this.isPlaying = true;
                this.updatePlayButton('⏸');
                this.startProgressUpdate();
                this.fadeIn(0, this.volume, 2000);
            }
            
        } catch (error) {
            console.error('❌ Ошибка загрузки трека:', error);
            this.handleAudioError();
        }
    },

    // ИСПРАВЛЕНИЕ: правильное открытие/закрытие плейлиста
    togglePlaylist() {
        const playlistContainer = document.getElementById('playlistContainer');
        if (!playlistContainer) return;
        
        this.isPlaylistOpen = !this.isPlaylistOpen;
        
        if (this.isPlaylistOpen) {
            this.openPlaylist();
        } else {
            this.closePlaylist();
        }

        // Вибрация на мобильных
        if (this.isMobile && navigator.vibrate) {
            navigator.vibrate(30);
        }
    },

    openPlaylist() {
        const playlistContainer = document.getElementById('playlistContainer');
        if (!playlistContainer) return;

        playlistContainer.style.maxHeight = this.isMobile ? '200px' : '300px';
        playlistContainer.classList.add('open');
        playlistContainer.hidden = false;
        this.isPlaylistOpen = true;

        // Фокус на плейлист для доступности
        setTimeout(() => {
            const firstItem = playlistContainer.querySelector('.playlist-item');
            if (firstItem) firstItem.focus();
        }, 100);
    },

    closePlaylist() {
        const playlistContainer = document.getElementById('playlistContainer');
        if (!playlistContainer) return;

        playlistContainer.style.maxHeight = '0';
        playlistContainer.classList.remove('open');
        this.isPlaylistOpen = false;

        setTimeout(() => {
            playlistContainer.hidden = true;
        }, 400);
    },

    renderPlaylist() {
        const playlist = document.getElementById('playlist');
        if (!playlist) return;
        
        playlist.innerHTML = '';
        
        this.tracks.forEach((track, index) => {
            const playlistItem = document.createElement('div');
            playlistItem.className = `playlist-item ${index === this.currentTrack ? 'active' : ''}`;
            playlistItem.setAttribute('role', 'button');
            playlistItem.setAttribute('tabindex', '0');
            playlistItem.setAttribute('aria-label', `Воспроизвести ${track.name} - ${track.artist}`);
            playlistItem.onclick = () => this.selectTrack(index);
            playlistItem.onkeypress = (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    this.selectTrack(index);
                }
            };

            // Touch события
            playlistItem.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.selectTrack(index);
            });
            
            playlistItem.innerHTML = `
                <div class="playlist-item-icon" aria-hidden="true">
                    ${index === this.currentTrack ? '🎵' : '🎶'}
                </div>
                <div class="playlist-item-info">
                    <div class="playlist-item-title">${this.escapeHtml(track.name)}</div>
                    <div class="playlist-item-artist">${this.escapeHtml(track.artist)}</div>
                </div>
                <div class="playlist-item-duration" aria-hidden="true">${track.duration}</div>
            `;
            
            playlist.appendChild(playlistItem);
        });
    },

    selectTrack(index) {
        if (index === this.currentTrack && this.isPlaying) {
            this.pauseWithFade();
        } else {
            this.loadTrackWithFade(index);
        }
        
        this.renderPlaylist();
        
        // Автоматически закрываем плейлист на мобильных устройствах
        if (this.isMobile) {
            setTimeout(() => this.closePlaylist(), 500);
        }

        // Вибрация на мобильных
        if (this.isMobile && navigator.vibrate) {
            navigator.vibrate(50);
        }
    },

    // Временные сообщения
    showTemporaryMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `player-message player-message-${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 60px;
            left: 50%;
            transform: translateX(-50%);
            padding: 10px 16px;
            background: ${type === 'warning' ? 'var(--accent-red)' : 
                        type === 'success' ? 'var(--accent-green)' : 'var(--accent-purple)'};
            color: white;
            border-radius: 20px;
            z-index: 10001;
            animation: fadeInOut 3s ease-in-out;
            font-weight: 500;
            box-shadow: var(--shadow);
            font-size: 0.9em;
            max-width: 300px;
            text-align: center;
        `;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
    },

    // Fallback плеер
    showFallbackPlayer() {
        const player = document.getElementById('musicPlayer');
        if (player) {
            player.innerHTML = `
                <div class="player-container">
                    <div class="player-main">
                        <div class="player-track-info">
                            <div class="track-cover" aria-hidden="true">🎵</div>
                            <div class="track-details">
                                <div class="track-title">Музыка временно недоступна</div>
                                <div class="track-artist">Попробуйте позже</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    },

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Публичные методы
    playTrack(index) {
        this.currentTrack = index;
        this.loadTrackWithFade(index);
    },

    stop() {
        this.pauseWithFade();
        if (this.audio) {
            this.audio.currentTime = 0;
        }
    },

    // Очистка ресурсов
    destroy() {
        this.stop();
        this.stopProgressUpdate();
        this.stopFade();
        if (this.audio) {
            this.audio.removeEventListener('ended', this.nextTrack);
            this.audio = null;
        }
        this.audioInitialized = false;
        this.autoPlayEnabled = false;
    }
};

// Добавляем CSS для сообщений плеера
const playerStyle = document.createElement('style');
playerStyle.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        15% { opacity: 1; transform: translateX(-50%) translateY(0); }
        85% { opacity: 1; transform: translateX(-50%) translateY(0); }
        100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
    }
    
    .mobile-layout .player-main {
        flex-direction: column;
        gap: 10px;
    }
    
    .mobile-layout .player-extra {
        width: 100%;
        justify-content: space-between;
    }
    
    .desktop-layout .player-main {
        flex-direction: row;
        gap: 15px;
    }
`;
document.head.appendChild(playerStyle);

window.MusicPlayer = MusicPlayer;

document.addEventListener('DOMContentLoaded', () => {
    MusicPlayer.init();
});

// Оптимизация для фоновых вкладок
document.addEventListener('visibilitychange', () => {
    if (document.hidden && MusicPlayer.audioInitialized) {
        // Уменьшаем громкость в фоновой вкладке
        if (MusicPlayer.isPlaying) {
            MusicPlayer.audio.volume = Math.min(MusicPlayer.volume, 0.1);
        }
    } else if (MusicPlayer.audioInitialized) {
        // Восстанавливаем громкость
        if (MusicPlayer.isPlaying) {
            MusicPlayer.audio.volume = MusicPlayer.volume;
        }
    }
});
