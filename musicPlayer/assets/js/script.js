const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

/*
    1. render songs
    2. scroll top
    3. play / pause / seek
    4. cd rotate
    5. next/prev
    6. random
    7. next/repeat when ended
    8. active song
    9. scroll active song into view
    10. play song when click
    11. repeat & random not change when refresh
*/

const PLAYER_STORAGE_KEY = 'F8_PLAYER';

const renderPlayList = $('.playlist');
const Cd = $('.cd');
const Heading = $('header h2');
const cdThumb = $('.cd .cd-thumb');
const audio = $('audio');
const playBtn = $('.btn-toggle-play');
const player = $('.player')
const progress = $('#progress');
const nextSongbtn = $('.btn-next');
const prevSongbtn = $('.btn-prev');
const randombtn = $('.btn-random');
const repeatbtn = $('.btn-repeat');
var musicPlayed = [];


const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    songs: [{
            name: 'Baby',
            singer: 'Justin Bieber; Ludacris',
            path: './assets/music/Baby - Justin Bieber_ Ludacris.mp3',
            image: './assets/img/baby.jpg'
        },
        {
            name: 'Unstoppable',
            singer: 'Sia',
            path: './assets/music/Unstoppable - Sia.mp3',
            image: './assets/img/Unstoppable.jpg'
        }, {
            name: 'Cheap Thrills',
            singer: 'Sia',
            path: './assets/music/Cheap Thrills - Sia.mp3',
            image: './assets/img/CheapThrills.jpg'
        }, {
            name: 'Easy On Me',
            singer: ' Adele',
            path: './assets/music/Easy On Me - Adele.mp3',
            image: './assets/img/easyOnME.jpg'
        }, {
            name: 'Girls Like You',
            singer: 'Maroon 5; Cardi B',
            path: './assets/music/Girls Like You - Maroon 5_ Cardi B.mp3',
            image: './assets/img/girlsLikeYou.jpg'
        }, {
            name: 'Marry You',
            singer: 'Bruno Mars',
            path: './assets/music/Marry You - Bruno Mars.mp3',
            image: './assets/img/marryYou.jpg'
        }, {
            name: 'No Promise',
            singer: 'Chara',
            path: './assets/music/No Promises - Shayne Ward.mp3',
            image: './assets/img/noPromises.jpg'
        },
    ],

    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},

    setConfig(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },

    // lấy song hiện tại
    getCurrentSong() {
        Object.defineProperty(this, 'currentSong', {
            get() {
                return this.songs[this.currentIndex];
            }
        })
    },


    // render song
    render() {
        var htmls = this.songs.map((song, index) => {

            return `
                <div class="song ${this.currentIndex == index ? 'active' : ''}" data-index = ${index}>
                <div class="thumb" style="background-image: url('${song.image}')">
                </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class = "loadingPlay ${this.currentIndex == index ? 'active' : ''}">
                        <div class="playingSong">
                            <span></span>
                        </div>
                        <div class="playingSong">
                            <span></span>
                        </div>
                        <div class="playingSong">
                            <span></span>
                        </div>
                        <div class="playingSong">
                            <span></span>
                        </div>
                        <div class="playingSong">
                            <span></span>
                        </div>
                        
                    </div>
                    <div class="option">
                        
                        <i class="fas fa-ellipsis-h"></i> 
                    </div>
                </div>
                `;
        })
        renderPlayList.innerHTML = htmls.join('');
    },


    // xử lý sự kiện
    handleEvent() {
        let _this = this;
        // cd change width
        let widthCd = Cd.offsetWidth;
        window.onscroll = () => {
            let scrollTopY = document.documentElement.scrollTop || window.scrollY;
            let newScrollCd = widthCd - scrollTopY;
            Cd.style.width = newScrollCd > 0 ? newScrollCd + 'px' : 0;
            Cd.style.opacity = newScrollCd / widthCd;
        }

        // xử lý cd quay
        var animateCdThumb = cdThumb.animate([{
            transform: 'rotate(360deg)'
        }], {
            duration: 10000,
            iterations: Infinity,
        })
        animateCdThumb.pause();

        // play song
        playBtn.onclick = () => {
            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        }


        // xử lý khi bật
        audio.onplay = () => {
            _this.isPlaying = true;
            player.classList.add('playing');
            animateCdThumb.play();
        }

        // xử lý khi tắt
        audio.onpause = () => {
            _this.isPlaying = false;
            player.classList.remove('playing');
            animateCdThumb.pause();
        }


        // xử lý progress
        audio.ontimeupdate = () => {
            if (audio.duration) {
                let progressProsent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressProsent;
            }
        }

        // tua
        progress.oninput = (e) => {
            let songCurrentSecond = Math.floor(e.target.value * audio.duration / 100);
            audio.currentTime = songCurrentSecond;
        }

        // next song
        nextSongbtn.onclick = () => {
            if (_this.isRandom) {
                musicPlayed.push(_this.currentIndex);
                console.log(musicPlayed)
                _this.radomSong();
            } else {
                _this.nextSong();

            }
            audio.play();
            _this.render();
            this.scrollIntoView();
        }

        // prev song
        prevSongbtn.onclick = () => {
            if (_this.isRandom) {
                musicPlayed.push(_this.currentIndex);
                console.log(musicPlayed)
                _this.radomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
            this.scrollIntoView();
        }

        // random
        randombtn.onclick = () => {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            randombtn.classList.toggle('active', _this.isRandom);
        }

        // repeat
        repeatbtn.onclick = () => {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatbtn.classList.toggle('active', _this.isRepeat);
        }

        // khi kết thúc
        audio.onended = () => {
            if (this.isRepeat) {
                audio.play();
            } else {
                nextSongbtn.click();
            }
        }

        // click sau đó phát nó
        renderPlayList.onclick = (e) => {
            var nodeSong = e.target.closest('.song:not(.active)');
            if (nodeSong || e.target.closest('.option')) {
                if (nodeSong) {
                    var currentIndexClick = Number(nodeSong.dataset.index);
                    _this.currentIndex = currentIndexClick;
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play();
                }

                if (e.target.closest('.option')) {

                }
            }
        }

    },

    // next song
    nextSong() {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },

    // random
    radomSong() {
        if (musicPlayed.length === this.songs.length - 1) {
            musicPlayed = [];
        }
        do {
            var SongRandom = Math.floor(Math.random() * this.songs.length);
        } while (musicPlayed.includes(SongRandom));

        this.currentIndex = SongRandom;
        this.loadCurrentSong();
    },

    prevSong() {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },

    // load song current
    loadCurrentSong() {
        Heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },

    // scroll into view
    scrollIntoView() {
        setTimeout(() => {
            if (this.currentIndex === 0 || this.currentIndex === 1 || this.currentIndex === 3) {
                var ObjectScrollView = {
                    behavior: "smooth",
                    block: "center",
                };
            } else {
                var ObjectScrollView = {
                    behavior: "smooth",
                    block: "nearest",
                };
            }
            $('.song.active').scrollIntoView(ObjectScrollView);
        }, 300)
    },

    // hieenr thị true false của random và repeat
    loadConfig() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },

    // method run first
    start() {
        // load config
        this.loadConfig();


        // render song
        this.render()

        // lấy bài hát hiện tại
        this.getCurrentSong();

        this.loadCurrentSong();

        // xử lý sự kiện
        this.handleEvent();
        randombtn.classList.toggle('active', this.isRandom);
        repeatbtn.classList.toggle('active', this.isRepeat);
    }
}

app.start();