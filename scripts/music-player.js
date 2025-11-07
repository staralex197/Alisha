// Музыкальный плеер
const MusicPlayer = {
    audio: null,
    isPlaying: false,
    currentTrack: 0,
    updateInterval: null,
    isPlaylistOpen: false,
    audioInitialized: false,
    isLoading: false,
    volume: 0.2, // 20% громкость по умолчанию
    fadeInterval: null,
    autoPlayEnabled: false,

    tracks: [
        {
            name: "Наша жизнь",
            artist: "2hug",
            url: "https://github.com/staralex197/Alisha/raw/refs/heads/main/music/2hug_-_Nasha_zhizn_79029104.mp3",
            duration: "3:11"
        },
        {
            name: "Ты та...",
            artist: "Баста", 
            url: "https://github.com/staralex197/Alisha/raw/refs/heads/main/music/Basta_-_Ty_ta_61892966.mp3",
            duration: "3:56"
        },
        {
            name: "Привет",
            artist: "MATRANG, Баста",
            url: "https://github.com/staralex197/Alisha/raw/refs/heads/main/music/MATRANG_-_Privet_64870751.mp3",
            duration: "3:13"
        },
        {
            name: "Бойсбэнд",
            artist: "PHARAON, Ca$$xttx",
            url: "https://github.com/staralex197/Alisha/raw/refs/heads/main/music/PHARAOH_Caxttx_-_Bojjsbjend_64493563.mp3",
            duration: "2:58"
        }
    ],

    init() {
        try {
            this.audio = new Audio();
            this.audio.volume = 0; // Начинаем с нулевой громкости
            this.audio.preload = 'metadata';
            
            // События для обработки ошибок
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

            // Инициализация UI
            this.updateTrackInfo(0);
            this.renderPlaylist();
            
            // Прогресс бар по клику
            const progressContainer = document.getElementById('progressContainer');
            if (progressContainer) {
                progressContainer.addEventListener('click', (e) => {
                    this.handleProgressClick(e);
                });
            }

            // Инициализация громкости
            const volumeSlider = document.getElementById('volumeSlider');
            if (volumeSlider) {
                volumeSlider.value = this.volume * 100;
                this.updateVolumeSlider(volumeSlider.value);
            }

            this.audioInitialized = true;
            console.log('✅ Музыкальный плеер инициализирован');
            
            // Автоматическое плавное воспроизведение через 2 секунды после загрузки
            setTimeout(() => {
                this.autoPlayWithFade();
            }, 2000);
            
        } catch (error) {
            console.error('❌ Ошибка инициализации плеера:', error);
        }
    },

    // Плавное автовоспроизведение
    async autoPlayWithFade() {
        if (!this.audioInitialized || this.isPlaying || this.autoPlayEnabled) return;
        
        try {
            this.autoPlayEnabled = true;
            console.log('🎵 Запуск плавного автовоспроизведения...');
            
            // Загружаем первый трек если нужно
            if (!this.audio.src || this.audio.src !== this.tracks[this.currentTrack].url) {
                await this.loadTrack(this.currentTrack, false); // false - не воспроизводить сразу
            }
            
            // Начинаем воспроизведение с нулевой громкостью
            await this.audio.play();
            this.isPlaying = true;
            this.updatePlayButton('⏸');
            this.startProgressUpdate();
            
            // Плавное увеличение громкости до 20%
            this.fadeIn(0, this.volume, 3000); // 3 секунды fade-in
            
        } catch (error) {
            console.error('❌ Ошибка автовоспроизведения:', error);
            this.autoPlayEnabled = false;
            
            // Показываем дружелюбное сообщение
            if (error.name === 'NotAllowedError') {
                this.showTemporaryMessage('Нажмите ▶ для воспроизведения музыки', 'info');
            }
        }
    },

    // Плавное увеличение громкости (fade-in)
    fadeIn(startVolume, endVolume, duration = 3000) {
        this.stopFade(); // Останавливаем предыдущий fade
    
        const startTime = performance.now();
        const initialVolume = this.audio.volume;
        
        const fadeFrame = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Кубическая easing функция для плавности
            const easeProgress = progress < 0.5 
                ? 4 * progress * progress * progress 
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;
            
            this.audio.volume = initialVolume + (endVolume - initialVolume) * easeProgress;
            
            if (progress < 1) {
                this.fadeInterval = requestAnimationFrame(fadeFrame);
            } else {
                this.audio.volume = endVolume; // Гарантируем точное значение
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
            
            // Кубическая easing функция
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
        nowPlaying.style.color = '#ff6b6b';
        
        setTimeout(() => {
            nowPlaying.textContent = originalText;
            nowPlaying.style.color = originalColor;
        }, 3000);
    },

    // Временное сообщение
    showTemporaryMessage(message, type = 'info') {
        // Убедимся, что у нас есть стили для сообщений
        if (!document.getElementById('music-message-styles')) {
            const style = document.createElement('style');
            style.id = 'music-message-styles';
            style.textContent = `
                .music-temp-message {
                    position: fixed;
                    top: 80px;
                    right: 20px;
                    padding: 10px 16px;
                    background: var(--primary);
                    color: white;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    z-index: 10001;
                    animation: musicMessageFade 4s ease-in-out;
                    max-width: 250px;
                    text-align: center;
                }
                
                @keyframes musicMessageFade {
                    0% { opacity: 0; transform: translateX(100px); }
                    15% { opacity: 1; transform: translateX(0); }
                    85% { opacity: 1; transform: translateX(0); }
                    100% { opacity: 0; transform: translateX(100px); }
                }
            `;
            document.head.appendChild(style);
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'music-temp-message';
        messageDiv.textContent = message;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 4000);
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
    },

    updateVolumeSlider(volume) {
        const volumeSlider = document.getElementById('volumeSlider');
        if (volumeSlider) {
            volumeSlider.style.background = `linear-gradient(90deg, var(--primary) ${volume}%, var(--surface) ${volume}%)`;
        }
    },

    nextTrack() {
        this.currentTrack = (this.currentTrack + 1) % this.tracks.length;
        this.loadTrackWithFade(this.currentTrack);
    },

    previousTrack() {
        this.currentTrack = (this.currentTrack - 1 + this.tracks.length) % this.tracks.length;
        this.loadTrackWithFade(this.currentTrack);
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
                this.audio.volume = 0; // Начинаем с тишины
                await this.audio.play();
                this.isPlaying = true;
                this.updatePlayButton('⏸');
                this.startProgressUpdate();
                this.fadeIn(0, this.volume, 2000); // Плавное появление
            }
            
        } catch (error) {
            console.error('❌ Ошибка загрузки трека:', error);
            this.handleAudioError();
        }
    },

    togglePlaylist() {
        const playlistContainer = document.getElementById('playlistContainer');
        if (!playlistContainer) return;
        
        this.isPlaylistOpen = !this.isPlaylistOpen;
        
        if (this.isPlaylistOpen) {
            playlistContainer.style.display = 'block';
            playlistContainer.setAttribute('aria-hidden', 'false');
            this.renderPlaylist();
        } else {
            playlistContainer.style.display = 'none';
            playlistContainer.setAttribute('aria-hidden', 'true');
        }
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
        
        if (window.innerWidth <= 767) {
            setTimeout(() => this.togglePlaylist(), 500);
        }
    },

    escapeHtml(text) {
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

window.MusicPlayer = MusicPlayer;

document.addEventListener('DOMContentLoaded', () => {
    MusicPlayer.init();
});
