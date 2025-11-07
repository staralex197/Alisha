// Музыкальный плеер
const MusicPlayer = {
    audio: null,
    isPlaying: false,
    currentTrack: 0,
    updateInterval: null,
    isPlaylistOpen: false,
    audioInitialized: false,
    colorAnalyzer: null,

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
        this.audio = new Audio();
        this.audio.volume = 0.5;
        this.audio.src = this.tracks[0].url;
        this.audio.load();
        
        this.updateTrackInfo(0);
        this.renderPlaylist();
        
        this.audio.addEventListener('ended', () => {
            this.nextTrack();
        });

        // Прогресс бар по клику
        document.getElementById('progressContainer').addEventListener('click', (e) => {
            if (!this.audio || !this.audio.duration) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            this.audio.currentTime = percent * this.audio.duration;
        });

        // Инициализируем анализатор цветов
        this.initColorAnalyzer();

        this.audioInitialized = true;
        console.log('✅ Музыкальный плеер инициализирован');
    },

    // Анализатор цветов для динамической инверсии
    initColorAnalyzer() {
        this.colorAnalyzer = {
            canvas: document.createElement('canvas'),
            ctx: null,
            isInitialized: false,
            lastScrollY: 0,
            debounceTimer: null,

            init() {
                this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
                this.canvas.width = 1;
                this.canvas.height = 1;
                this.isInitialized = true;
                
                // Слушаем скролл и ресайз с дебаунсом
                window.addEventListener('scroll', () => this.handleScroll());
                window.addEventListener('resize', () => this.handleScroll());
                
                // Первоначальная проверка
                this.updatePlayerColors();
            },

            handleScroll() {
                const currentScrollY = window.scrollY;
                
                // Проверяем только если скролл заметный (больше 10px)
                if (Math.abs(currentScrollY - this.lastScrollY) > 10) {
                    this.lastScrollY = currentScrollY;
                    
                    // Дебаунс - проверяем не чаще чем раз в 50мс
                    clearTimeout(this.debounceTimer);
                    this.debounceTimer = setTimeout(() => {
                        this.updatePlayerColors();
                    }, 50);
                }
            },

            updatePlayerColors() {
                if (!this.isInitialized) return;

                const player = document.getElementById('musicPlayer');
                if (!player) return;

                const rect = player.getBoundingClientRect();
                
                // Анализируем несколько точек под плеером
                const samplePoints = [
                    { x: rect.left + rect.width * 0.5, y: rect.top + rect.height * 0.5 }, // центр
                    { x: rect.left + rect.width * 0.2, y: rect.top + rect.height * 0.5 }, // лево
                    { x: rect.left + rect.width * 0.8, y: rect.top + rect.height * 0.5 }, // право
                    { x: rect.left + rect.width * 0.5, y: rect.top + rect.height * 0.2 }, // верх
                    { x: rect.left + rect.width * 0.5, y: rect.top + rect.height * 0.8 }  // низ
                ];

                let totalBrightness = 0;
                let sampleCount = 0;

                samplePoints.forEach(point => {
                    const brightness = this.getPixelBrightness(point.x, point.y + window.scrollY);
                    if (brightness !== null) {
                        totalBrightness += brightness;
                        sampleCount++;
                    }
                });

                if (sampleCount > 0) {
                    const averageBrightness = totalBrightness / sampleCount;
                    this.applyColorScheme(player, averageBrightness);
                }
            },

            getPixelBrightness(x, y) {
                try {
                    // Сохраняем текущее состояние canvas
                    this.canvas.width = 1;
                    this.canvas.height = 1;
                    
                    // Копируем пиксель с экрана
                    this.ctx.drawWindow(window, x, y, 1, 1, "rgb(255,255,255)");
                    
                    // Получаем данные пикселя
                    const imageData = this.ctx.getImageData(0, 0, 1, 1);
                    const data = imageData.data;
                    
                    // Вычисляем яркость (формула восприятия)
                    const brightness = (data[0] * 299 + data[1] * 587 + data[2] * 114) / 1000;
                    return brightness;
                } catch (error) {
                    // Если нет доступа к пикселям (cross-origin), используем fallback
                    return this.getFallbackBrightness();
                }
            },

            getFallbackBrightness() {
                // Fallback: определяем яркость по позиции скролла
                const scrollY = window.scrollY;
                const windowHeight = window.innerHeight;
                
                // Если плеер в верхней части экрана - темный фон, иначе светлый
                return scrollY < windowHeight * 0.3 ? 30 : 200;
            },

            applyColorScheme(player, brightness) {
                // Яркость от 0 (черный) до 255 (белый)
                // Порог для переключения - 128
                if (brightness > 128) {
                    // Светлый фон - темный текст
                    player.classList.remove('light-text');
                    player.classList.add('dark-text');
                } else {
                    // Темный фон - светлый текст
                    player.classList.remove('dark-text');
                    player.classList.add('light-text');
                }
            }
        };

        this.colorAnalyzer.init();
    },

    formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    },

    updateTrackInfo(index) {
        document.getElementById('nowPlaying').textContent = this.tracks[index].name;
        document.getElementById('trackArtist').textContent = this.tracks[index].artist;
        document.getElementById('duration').textContent = this.tracks[index].duration;
    },

    togglePlay() {
        if (!this.audioInitialized) {
            this.init();
        }

        if (this.isPlaying) {
            this.audio.pause();
            document.getElementById('playBtn').textContent = '▶';
            this.isPlaying = false;
            this.stopProgressUpdate();
        } else {
            this.audio.play().then(() => {
                document.getElementById('playBtn').textContent = '⏸';
                this.isPlaying = true;
                this.startProgressUpdate();
            }).catch(error => {
                console.log('Ошибка воспроизведения:', error);
            });
        }
    },

    startProgressUpdate() {
        this.updateInterval = setInterval(() => {
            if (this.audio.duration) {
                const progress = (this.audio.currentTime / this.audio.duration) * 100;
                document.getElementById('musicProgress').style.width = progress + '%';
                document.getElementById('currentTime').textContent = this.formatTime(this.audio.currentTime);
            }
        }, 1000);
    },

    stopProgressUpdate() {
        clearInterval(this.updateInterval);
    },

    setVolume(volume) {
        if (this.audio) {
            this.audio.volume = volume / 100;
        }
    },

    nextTrack() {
        this.currentTrack = (this.currentTrack + 1) % this.tracks.length;
        this.loadTrack(this.currentTrack);
    },

    previousTrack() {
        this.currentTrack = (this.currentTrack - 1 + this.tracks.length) % this.tracks.length;
        this.loadTrack(this.currentTrack);
    },

    loadTrack(index) {
        if (!this.audioInitialized) {
            this.init();
        }

        this.currentTrack = index;
        this.audio.src = this.tracks[index].url;
        document.getElementById('musicProgress').style.width = '0%';
        document.getElementById('currentTime').textContent = '0:00';
        
        this.audio.play().then(() => {
            this.isPlaying = true;
            document.getElementById('playBtn').textContent = '⏸';
            this.updateTrackInfo(index);
            this.startProgressUpdate();
            this.renderPlaylist();
        }).catch(error => {
            console.log('Ошибка воспроизведения:', error);
        });
    },

    togglePlaylist() {
        const playlistContainer = document.getElementById('playlistContainer');
        this.isPlaylistOpen = !this.isPlaylistOpen;
        
        if (this.isPlaylistOpen) {
            playlistContainer.classList.add('open');
        } else {
            playlistContainer.classList.remove('open');
        }
    },

    renderPlaylist() {
        const playlist = document.getElementById('playlist');
        playlist.innerHTML = '';
        
        this.tracks.forEach((track, index) => {
            const playlistItem = document.createElement('div');
            playlistItem.className = `playlist-item ${index === this.currentTrack ? 'active' : ''}`;
            playlistItem.onclick = () => this.selectTrack(index);
            
            playlistItem.innerHTML = `
                <div class="playlist-item-icon">${index === this.currentTrack ? '🎵' : '🎶'}</div>
                <div class="playlist-item-info">
                    <div class="playlist-item-title">${track.name}</div>
                    <div class="playlist-item-artist">${track.artist}</div>
                </div>
                <div class="playlist-item-duration">${track.duration}</div>
            `;
            
            playlist.appendChild(playlistItem);
        });
    },

    selectTrack(index) {
        this.currentTrack = index;
        this.loadTrack(index);
        this.renderPlaylist();
        
        // Автоматически закрываем плейлист на мобильных устройствах
        if (window.innerWidth <= 767) {
            this.togglePlaylist();
        }
    }
};

// Создаем глобальную ссылку для HTML атрибутов
window.musicPlayer = MusicPlayer;
