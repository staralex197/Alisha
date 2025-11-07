// Музыкальный плеер
const MusicPlayer = {
    audio: null,
    isPlaying: false,
    currentTrack: 0,
    updateInterval: null,
    isPlaylistOpen: false,
    audioInitialized: false,

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

        this.audioInitialized = true;
        console.log('✅ Музыкальный плеер инициализирован');
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
                // Показываем сообщение об ошибке
                this.showPlaybackError();
            });
        }
    },

    showPlaybackError() {
        const nowPlaying = document.getElementById('nowPlaying');
        const originalText = nowPlaying.textContent;
        
        nowPlaying.textContent = 'Ошибка воспроизведения 😔';
        nowPlaying.style.color = '#ff6b6b';
        
        setTimeout(() => {
            nowPlaying.textContent = originalText;
            nowPlaying.style.color = '';
        }, 3000);
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
            this.showPlaybackError();
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
