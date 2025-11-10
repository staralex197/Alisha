// Умный музыкальный плеер с ИСПРАВЛЕННОЙ ГРОМКОСТЬЮ и ПЛЕЙЛИСТОМ
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
    isMuted: false,
    previousVolume: 0.2,
    loadedTracks: new Set(),
    initialized: false,
    playlistClickHandler: null,

    tracks: [],

    async init() {
        // Защита от множественной инициализации
        if (this.initialized) {
            console.log('⚠️ Плеер уже инициализирован');
            return;
        }
        
        try {
            this.initialized = true;
            console.log('🎵 Инициализируем музыкальный плеер...');
            
            this.detectDeviceType();
            this.audio = new Audio();
            this.audio.volume = this.volume;
            this.audio.preload = 'metadata';
            
            this.audio.controls = false;
            
            await this.loadTracksFromFolder();
            this.setupAudioEvents();
            this.initializeUI();
            
            this.audioInitialized = true;
            console.log('✅ Музыкальный плеер успешно инициализирован');
            
            setTimeout(() => {
                this.autoPlayWithFade();
            }, 2000);
            
        } catch (error) {
            console.error('❌ Ошибка инициализации плеера:', error);
            this.handleError('Не удалось инициализировать плеер. Проверьте сеть.');
        }
    },

    detectDeviceType() {
        this.isMobile = window.innerWidth <= 768;
    },

    async loadTracksFromFolder() {
        // Временно используем библиотеку стихов как заглушку для музыки
        if (typeof window.PoemsLibrary !== 'undefined' && window.PoemsLibrary.tracks.length > 0) {
            this.tracks = window.PoemsLibrary.tracks.map(t => ({
                title: t.title,
                artist: t.artist,
                src: t.src // Предполагаем, что src - это путь к аудиофайлу
            }));
            console.log(`🎵 Загружено ${this.tracks.length} треков из библиотеки.`);
        } else {
            // Если PoemsLibrary не содержит треков, используем заглушки
            this.tracks = [
                { title: 'The Quiet', artist: 'Pensive', src: 'music/quiet.mp3' },
                { title: 'Stars Fall', artist: 'Starlight', src: 'music/stars.mp3' },
                { title: 'Whisper', artist: 'Silent', src: 'music/whisper.mp3' }
            ];
            console.log('🎵 Загружены 3 трека-заглушки.');
        }

        // Рандомизация начального трека
        this.currentTrack = Math.floor(Math.random() * this.tracks.length);
    },

    setupAudioEvents() {
        this.audio.addEventListener('loadedmetadata', () => {
            this.updateTrackInfo();
            this.updateProgress();
            this.isLoading = false;
        });

        this.audio.addEventListener('timeupdate', () => {
            if (!this.isLoading) {
                this.updateProgress();
            }
        });

        this.audio.addEventListener('ended', () => {
            this.nextTrack();
        });

        this.audio.addEventListener('error', (e) => {
            console.error('❌ Ошибка аудио:', this.audio.error.code, e);
            this.handleError('Ошибка воспроизведения аудио.');
            this.updatePlayButton();
        });
    },

    initializeUI() {
        this.renderPlaylist();
        this.setupControls();
        this.updateTrackInfo();
        this.updatePlayButton();
    },

    setupControls() {
        document.getElementById('playBtn').addEventListener('click', () => this.togglePlayPause());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextTrack());
        document.getElementById('prevBtn').addEventListener('click', () => this.prevTrack());
        document.getElementById('volumeIcon').addEventListener('click', () => this.toggleMute());
        document.getElementById('volumeSlider').addEventListener('input', (e) => this.setVolume(e.target.value));
        document.getElementById('playlistToggle').addEventListener('click', () => this.togglePlaylist());
        document.getElementById('progressBarWrap').addEventListener('click', (e) => this.handleProgressClick(e));
        
        // Установка начального значения громкости
        document.getElementById('volumeSlider').value = this.volume;
    },

    handleError(message) {
        // Отображение сообщения об ошибке
        const errorElement = document.getElementById('playerError');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 5000);
        }
    },

    togglePlayPause() {
        if (!this.audioInitialized || this.isLoading) return;

        if (this.isPlaying) {
            this.pauseWithFade();
        } else {
            this.playWithFade();
        }
    },

    playWithFade() {
        if (this.isPlaying) return;
        this.stopFade(); // Останавливаем любое затухание

        const targetVolume = this.isMuted ? 0 : this.volume;
        this.audio.volume = 0;
        this.audio.play().then(() => {
            this.isPlaying = true;
            this.startFade(targetVolume, 'in');
            this.updatePlayButton();
            this.startProgressUpdate();
            console.log(`🎵 Воспроизведение: ${this.tracks[this.currentTrack].title}`);
        }).catch(error => {
            console.error('❌ Ошибка при попытке play:', error);
            this.handleError('Не удалось начать воспроизведение.');
        });
    },

    pauseWithFade() {
        if (!this.isPlaying) return;
        this.stopFade();
        this.startFade(0, 'out', () => {
            if (this.audio) {
                this.audio.pause();
            }
            this.isPlaying = false;
            this.updatePlayButton();
            this.stopProgressUpdate();
            console.log(`⏸️ Пауза: ${this.tracks[this.currentTrack].title}`);
        });
    },

    loadTrackWithFade(index) {
        this.currentTrack = index;
        this.isLoading = true;
        this.updatePlayButton();

        this.stopFade();
        
        // Быстрое затухание текущего трека
        this.startFade(0, 'out', () => {
            this.audio.src = this.tracks[this.currentTrack].src;
            this.audio.currentTime = 0;
            this.audio.load();
            this.audio.oncanplaythrough = () => {
                this.audio.oncanplaythrough = null; // Удалить слушателя после первого выполнения
                this.playWithFade();
            };
            this.updateTrackInfo();
            this.renderPlaylist();
            console.log(`🔄 Загружен трек: ${this.tracks[this.currentTrack].title}`);
        });
    },

    autoPlayWithFade() {
        if (this.audioInitialized && !this.autoPlayEnabled) {
            this.autoPlayEnabled = true;
            // Проверка, чтобы избежать ошибок с неопределенным src
            if (this.tracks.length > 0 && !this.audio.src) {
                 this.audio.src = this.tracks[this.currentTrack].src;
                 this.audio.load();
            }
            
            // Пытаемся начать воспроизведение (для мобильных может потребовать взаимодействия)
            this.audio.play().then(() => {
                this.isPlaying = true;
                this.updatePlayButton();
                this.startProgressUpdate();
                this.startFade(this.volume, 'in');
                console.log('▶️ Автоплей успешно начат');
            }).catch(e => {
                console.log('⚠️ Автоплей заблокирован. Ожидание взаимодействия с пользователем.', e);
                // Продолжаем в режиме паузы, пока пользователь не нажмет кнопку
                this.isPlaying = false;
                this.updatePlayButton();
            });
        }
    },

    startFade(targetVolume, direction, callback) {
        if (!this.audio) return;

        const startVolume = this.audio.volume;
        const duration = 1500; // 1.5 секунды
        let startTime = null;

        const animateFade = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(1, elapsed / duration);

            let newVolume;

            if (direction === 'in') {
                newVolume = startVolume + (targetVolume - startVolume) * progress;
            } else {
                newVolume = startVolume + (targetVolume - startVolume) * progress;
            }

            if (this.audio) {
                this.audio.volume = Math.max(0, Math.min(targetVolume, newVolume));
            }


            if (progress < 1) {
                this.fadeInterval = requestAnimationFrame(animateFade);
            } else {
                this.stopFade();
                if (callback) callback();
            }
        };

        this.fadeInterval = requestAnimationFrame(animateFade);
    },

    stopFade() {
        if (this.fadeInterval) {
            cancelAnimationFrame(this.fadeInterval);
            this.fadeInterval = null;
        }
    },

    nextTrack() {
        this.currentTrack = (this.currentTrack + 1) % this.tracks.length;
        this.loadTrackWithFade(this.currentTrack);
    },

    prevTrack() {
        this.currentTrack = (this.currentTrack - 1 + this.tracks.length) % this.tracks.length;
        this.loadTrackWithFade(this.currentTrack);
    },

    setVolume(newVolume) {
        this.volume = parseFloat(newVolume);
        if (this.audio) {
            this.audio.volume = this.volume;
            this.isMuted = this.volume === 0;
            this.updateVolumeUI();
        }
    },

    toggleMute() {
        if (this.isMuted) {
            this.isMuted = false;
            this.volume = this.previousVolume > 0 ? this.previousVolume : 0.2;
        } else {
            this.previousVolume = this.volume;
            this.isMuted = true;
            this.volume = 0;
        }
        
        if (this.audio) {
            this.audio.volume = this.volume;
        }

        document.getElementById('volumeSlider').value = this.volume;
        this.updateVolumeUI();
    },

    updateVolumeUI() {
        const volumeIcon = document.getElementById('volumeIcon');
        if (this.isMuted || this.volume === 0) {
            volumeIcon.textContent = '🔇';
        } else if (this.volume < 0.5) {
            volumeIcon.textContent = '🔈';
        } else {
            volumeIcon.textContent = '🔊';
        }
    },

    updateTrackInfo() {
        const track = this.tracks[this.currentTrack];
        document.getElementById('trackTitle').textContent = this.escapeHtml(track.title);
        document.getElementById('trackArtist').textContent = this.escapeHtml(track.artist);
        document.getElementById('trackCover').textContent = '🎵'; // Просто иконка
    },

    updatePlayButton() {
        const playBtn = document.getElementById('playBtn');
        if (this.isLoading) {
             playBtn.innerHTML = '<div class="loading-spinner-small"></div>';
             playBtn.classList.add('loading');
        } else {
             playBtn.classList.remove('loading');
             playBtn.textContent = this.isPlaying ? '⏸️' : '▶️';
        }
    },

    startProgressUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        this.updateInterval = setInterval(() => {
            if (this.isPlaying && !this.isLoading) {
                this.updateProgress();
            }
        }, 500);
    },

    stopProgressUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    },

    updateProgress() {
        if (!this.audio || isNaN(this.audio.duration)) return;

        const currentTime = this.audio.currentTime;
        const duration = this.audio.duration;
        const progressPercent = (currentTime / duration) * 100;

        document.getElementById('progressBar').style.width = `${progressPercent}%`;
        document.getElementById('currentTime').textContent = this.formatTime(currentTime);
        document.getElementById('duration').textContent = this.formatTime(duration);
    },

    handleProgressClick(e) {
        if (!this.audio || isNaN(this.audio.duration)) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const duration = this.audio.duration;

        // Вычисляем новое время
        const newTime = (clickX / rect.width) * duration;
        
        // Устанавливаем новое время и обновляем прогресс
        this.audio.currentTime = newTime;
        this.updateProgress();

        // Если не играло, начать воспроизведение
        if (!this.isPlaying) {
             this.playWithFade();
        }
    },

    formatTime(seconds) {
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec.toString().padStart(2, '0')}`;
    },

    togglePlaylist() {
        this.isPlaylistOpen = !this.isPlaylistOpen;
        const container = document.getElementById('playlistContainer');
        
        if (this.isPlaylistOpen) {
            container.classList.add('open');
            this.renderPlaylist();
            this.setupPlaylistCloseListener();
        } else {
            container.classList.remove('open');
            this.removePlaylistCloseListener();
        }
    },

    closePlaylist() {
        if (this.isPlaylistOpen) {
            this.isPlaylistOpen = false;
            document.getElementById('playlistContainer').classList.remove('open');
            this.removePlaylistCloseListener();
        }
    },

    setupPlaylistCloseListener() {
        // Закрытие по клику вне плейлиста
        this.playlistClickHandler = (event) => {
            const container = document.getElementById('playlistContainer');
            const toggle = document.getElementById('playlistToggle');
            if (container && toggle && !container.contains(event.target) && !toggle.contains(event.target)) {
                this.closePlaylist();
            }
        };
        // Небольшая задержка, чтобы избежать немедленного закрытия
        setTimeout(() => {
            document.addEventListener('click', this.playlistClickHandler);
        }, 100);
    },

    removePlaylistCloseListener() {
        if (this.playlistClickHandler) {
            document.removeEventListener('click', this.playlistClickHandler);
            this.playlistClickHandler = null;
        }
    },

    renderPlaylist() {
        const playlist = document.getElementById('playlist');
        if (!playlist) return;

        playlist.innerHTML = '';
        
        this.tracks.forEach((track, index) => {
            const playlistItem = document.createElement('div');
            playlistItem.className = `playlist-item ${index === this.currentTrack ? 'active' : ''}`;
            playlistItem.setAttribute('data-index', index);
            playlistItem.addEventListener('click', () => this.selectTrack(index));
            
            playlistItem.innerHTML = `
                <div class="playlist-item-title">${this.escapeHtml(track.title)}</div>
                <div class="playlist-item-artist">${this.escapeHtml(track.artist)}</div>
            `;
            
            playlist.appendChild(playlistItem);
        });
        
        console.log('✅ Плейлист отрендерен');
    },

    selectTrack(index) {
        // ИСПРАВЛЕННАЯ ЛОГИКА: если клик на текущий играющий трек, то пауза
        if (index === this.currentTrack && this.isPlaying) {
            this.pauseWithFade();
        } else {
            this.loadTrackWithFade(index);
        }
        
        this.renderPlaylist();
        
        if (this.isMobile) {
            setTimeout(() => this.closePlaylist(), 1000);
        }
    },

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

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

    destroy() {
        this.stop();
        this.stopProgressUpdate();
        this.stopFade();
        if (this.audio) {
            this.audio.removeEventListener('ended', this.nextTrack);
            this.audio = null;
        }
        if (this.playlistClickHandler) {
            document.removeEventListener('click', this.playlistClickHandler);
        }
        this.audioInitialized = false;
        this.autoPlayEnabled = false;
        this.initialized = false;
    }
};

window.MusicPlayer = MusicPlayer;

document.addEventListener('DOMContentLoaded', function() {
    // Стиль для маленького спиннера, используемого в кнопке Play/Pause
    const style = document.createElement('style');
    style.innerHTML = `
        .loading-spinner-small {
            border: 2px solid rgba(255, 255, 255, 0.4);
            border-top: 2px solid #fff;
            border-radius: 50%;
            width: 14px;
            height: 14px;
            animation: spin 1s linear infinite;
        }
        .play-btn.loading {
             background: #7b6ef6 !important;
             box-shadow: 0 4px 8px rgba(108, 92, 231, 0.4);
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    MusicPlayer.init();
});
