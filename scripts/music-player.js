// Умный музыкальный плеер с ИСПРАВЛЕННЫМ ЗВУКОМ
const MusicPlayer = {
    audio: null,
    isPlaying: false,
    currentTrack: 0,
    updateInterval: null,
    isPlaylistOpen: false,
    audioInitialized: false,
    isLoading: false,
    volume: 0.2, // Начинаем с 20% громкости
    fadeInterval: null,
    autoPlayEnabled: false,
    isMobile: false,
    isMuted: false,
    previousVolume: 0.2,
    loadedTracks: new Set(),

    tracks: [],

    async init() {
        try {
            this.detectDeviceType();
            this.audio = new Audio();
            this.audio.volume = this.volume;
            this.audio.preload = 'metadata';
            
            this.audio.controls = false;
            
            await this.loadTracksFromFolder();
            this.setupAudioEvents();
            this.initializeUI();
            
            this.audioInitialized = true;
            console.log('✅ Музыкальный плеер инициализирован');
            
            setTimeout(() => {
                this.autoPlayWithFade();
            }, 2000);
            
        } catch (error) {
            console.error('❌ Ошибка инициализации плеера:', error);
        }
    },

    detectDeviceType() {
        this.isMobile = window.innerWidth <= 768;
        console.log(`🎵 Плеер: ${this.isMobile ? 'Мобильный режим' : 'Десктоп режим'}`);
    },

    async loadTracksFromFolder() {
        try {
            const trackFiles = [
                '2hug_-_Nasha_zhizn_79029104.mp3',
                'Basta_-_Ty_ta_61892966.mp3', 
                'MATRANG_-_Privet_64870751.mp3',
                'PHARAOH_Caxttx_-_Bojjsbjend_64493563.mp3'
            ];

            this.tracks = [];
            this.loadedTracks.clear();
            
            for (const filename of trackFiles) {
                if (this.loadedTracks.has(filename)) {
                    console.log(`⚠️ Пропускаем дубликат: ${filename}`);
                    continue;
                }
                
                this.loadedTracks.add(filename);
                
                const track = {
                    name: this.formatTrackName(filename),
                    artist: this.getArtistFromFilename(filename),
                    url: `music/${filename}`,
                    duration: '0:00',
                    filename: filename
                };
                
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

            console.log(`✅ Загружено ${this.tracks.length} треков`);

        } catch (error) {
            console.error('❌ Ошибка загрузки треков:', error);
            this.tracks = [{
                name: "Демо трек",
                artist: "Музыкальный плеер",
                url: "#",
                duration: "3:00"
            }];
        }
    },

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
            
            setTimeout(() => {
                tempAudio.remove();
                reject(new Error('Таймаут загрузки'));
            }, 5000);
        });
    },

    formatTrackName(filename) {
        return filename
            .replace(/\.mp3$/, '')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/^\d+/, '')
            .trim();
    },

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

        window.addEventListener('resize', () => {
            this.handleResize();
        });
    },

    handleResize() {
        this.detectDeviceType();
        this.updatePlayerLayout();
    },

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
        
        const progressContainer = document.getElementById('progressContainer');
        if (progressContainer) {
            progressContainer.addEventListener('click', (e) => {
                this.handleProgressClick(e);
            });
        }

        const volumeSlider = document.getElementById('volumeSlider');
        if (volumeSlider) {
            volumeSlider.value = this.volume * 100;
            this.updateVolumeSlider(volumeSlider.value);
            
            // Добавляем обработчик изменения громкости
            volumeSlider.addEventListener('input', (e) => {
                this.setVolume(e.target.value);
            });
        }

        const playlistToggle = document.getElementById('playlistToggle');
        if (playlistToggle) {
            playlistToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.togglePlaylist();
            });
        }

        // ИСПРАВЛЕННАЯ кнопка звука
        const volumeIcon = document.querySelector('.volume-icon');
        if (volumeIcon) {
            volumeIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMute();
            });
        }

        document.addEventListener('click', (e) => {
            if (this.isPlaylistOpen && !e.target.closest('.music-player') && !e.target.closest('.playlist-container')) {
                this.closePlaylist();
            }
        });

        this.updatePlayerLayout();
    },

    // ПОЛНОСТЬЮ ПЕРЕПИСАННАЯ ФУНКЦИЯ: Переключение звука
    toggleMute() {
        if (!this.audioInitialized) return;
        
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            // Сохраняем текущую громкость и выключаем звук
            this.previousVolume = this.audio.volume;
            this.audio.volume = 0;
            this.updateVolumeIcon('🔇');
            
            // Обновляем слайдер
            const volumeSlider = document.getElementById('volumeSlider');
            if (volumeSlider) {
                volumeSlider.value = 0;
                this.updateVolumeSlider(0);
            }
        } else {
            // Включаем звук на предыдущую громкость
            this.audio.volume = this.previousVolume;
            this.volume = this.previousVolume;
            this.updateVolumeIcon('🔊');
            
            // Обновляем слайдер
            const volumeSlider = document.getElementById('volumeSlider');
            if (volumeSlider) {
                volumeSlider.value = this.previousVolume * 100;
                this.updateVolumeSlider(this.previousVolume * 100);
            }
        }
        
        console.log(`🔊 Звук: ${this.isMuted ? 'выключен' : 'включен'}, громкость: ${this.audio.volume}`);
    },

    updateVolumeIcon(icon) {
        const volumeIcon = document.querySelector('.volume-icon');
        if (volumeIcon) {
            volumeIcon.textContent = icon;
        }
    },

    autoPlayWithFade() {
        if (!this.audioInitialized || this.isPlaying || this.autoPlayEnabled) return;
        
        try {
            this.autoPlayEnabled = true;
            
            if (!this.audio.src || this.audio.src !== this.tracks[this.currentTrack].url) {
                this.loadTrack(this.currentTrack, false);
            }
            
            this.audio.volume = 0;
            this.audio.play().then(() => {
                this.isPlaying = true;
                this.updatePlayButton('⏸');
                this.startProgressUpdate();
                this.fadeIn(0, 0.2, 3000);
            }).catch(error => {
                console.log('Автовоспроизведение заблокировано:', error);
            });
            
        } catch (error) {
            console.error('❌ Ошибка автовоспроизведения:', error);
            this.autoPlayEnabled = false;
        }
    },

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

    async playWithFade() {
        if (!this.audioInitialized || this.isLoading) return;

        try {
            if (!this.audio.src || this.audio.src !== this.tracks[this.currentTrack].url) {
                await this.loadTrack(this.currentTrack, false);
            }
            
            const currentVolume = this.audio.volume;
            await this.audio.play();
            this.isPlaying = true;
            this.updatePlayButton('⏸');
            this.startProgressUpdate();
            
            if (currentVolume < this.volume) {
                this.fadeIn(currentVolume, this.volume, 2000);
            }
            
        } catch (error) {
            console.error('❌ Ошибка воспроизведения:', error);
            this.handlePlaybackError(error);
        }
    },

    pauseWithFade() {
        if (!this.audioInitialized) return;
        
        const currentVolume = this.audio.volume;
        
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
        }
    },

    // ИСПРАВЛЕННАЯ функция установки громкости
    setVolume(volume) {
        const newVolume = volume / 100;
        this.volume = newVolume;
        this.audio.volume = newVolume;
        
        // Обновляем состояние mute
        if (newVolume > 0) {
            this.isMuted = false;
            this.previousVolume = newVolume;
            this.updateVolumeIcon('🔊');
        } else {
            this.isMuted = true;
            this.updateVolumeIcon('🔇');
        }
        
        this.updateVolumeSlider(volume);
        console.log(`🔊 Громкость установлена: ${newVolume}`);
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
    },

    previousTrack() {
        this.currentTrack = (this.currentTrack - 1 + this.tracks.length) % this.tracks.length;
        this.loadTrackWithFade(this.currentTrack);
    },

    async loadTrackWithFade(index) {
        if (!this.audioInitialized) return;

        const wasPlaying = this.isPlaying;
        
        if (wasPlaying) {
            await new Promise(resolve => {
                this.fadeOut(this.audio.volume, 0, 800, resolve);
            });
        }
        
        await this.loadTrack(index, false);
        
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
        if (!this.audioInitialized) return;

        this.currentTrack = index;
        this.showLoadingState();
        
        try {
            this.stopFade();
            this.audio.pause();
            this.isPlaying = false;
            this.updatePlayButton('▶');
            this.stopProgressUpdate();
            
            const musicProgress = document.getElementById('musicProgress');
            const currentTime = document.getElementById('currentTime');
            
            if (musicProgress) {
                musicProgress.style.width = '0%';
            }
            if (currentTime) {
                currentTime.textContent = '0:00';
            }
            
            this.audio.src = this.tracks[index].url;
            this.audio.controls = false;
            this.audio.load();
            
            this.updateTrackInfo(index);
            this.renderPlaylist();
            
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

    togglePlaylist() {
        if (this.isPlaylistOpen) {
            this.closePlaylist();
        } else {
            this.openPlaylist();
        }
    },

    openPlaylist() {
        const playlistContainer = document.getElementById('playlistContainer');
        if (!playlistContainer) return;

        playlistContainer.style.display = 'block';
        
        if (this.isMobile) {
            playlistContainer.style.transform = 'translateY(0)';
            playlistContainer.style.opacity = '1';
        } else {
            playlistContainer.style.maxHeight = '300px';
        }
        
        playlistContainer.classList.add('open');
        this.isPlaylistOpen = true;
        console.log('📋 Плейлист открыт');
    },

    closePlaylist() {
        const playlistContainer = document.getElementById('playlistContainer');
        if (!playlistContainer) return;

        if (this.isMobile) {
            playlistContainer.style.transform = 'translateY(100%)';
            playlistContainer.style.opacity = '0';
        } else {
            playlistContainer.style.maxHeight = '0';
        }
        
        playlistContainer.classList.remove('open');
        
        setTimeout(() => {
            if (!playlistContainer.classList.contains('open')) {
                playlistContainer.style.display = 'none';
            }
        }, 400);
        
        this.isPlaylistOpen = false;
        console.log('📋 Плейлист закрыт');
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
        this.audioInitialized = false;
        this.autoPlayEnabled = false;
    }
};

window.MusicPlayer = MusicPlayer;

document.addEventListener('DOMContentLoaded', () => {
    MusicPlayer.init();
});
