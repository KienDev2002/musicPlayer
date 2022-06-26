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

    // config: lấy object từ json mang về qua parse convert sang string
    // localStorage là https://blog.logrocket.com/localstorage-javascript-complete-guide/#:~:text=localStorage%20in%20JavaScript.-,What%20is%20localStorage%20in%20JavaScript%3F,the%20browser%20window%20is%20closed.
    //khi chưa lưu key-value mặc định sẽ là {} rỗng.
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},


    // set config key và value cho localStorage
    setConfig(key, value) {
        this.config[key] = value; //set vafo object
        // luư vào localStorage chuyển qua json rồi set cho local
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },


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

    // setconfig
    // định nghĩa thuộc tính cho object
    getCurrentSong() {
        Object.defineProperty(this, 'currentSong', {
            get() {
                return this.songs[this.currentIndex];
            }
        })
    },

    // xử lý lắng nghe event
    handleEvent() {
        var _this = this;
        var cdWidth = Cd.offsetWidth;

        // xử lý quay, trả về đối tượng animate
        var cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' } //để quay 360 độ
        ], {
            duration: 10000, //thời gia gian quay 1 vòng 360
            iterations: Infinity, // quay vô hạn
        })
        cdThumbAnimate.pause(); // tắt quay bằng animate.pause()

        // CD change width when windown scroll
        window.onscroll = () => {
            var scrollCd = document.documentElement.scrollTop || window.scrollY;
            var newScrollCd = cdWidth - scrollCd;
            Cd.style.width = newScrollCd > 0 ? newScrollCd + 'px' : 0;
            Cd.style.opacity = newScrollCd / cdWidth;
        }

        // xử lý khi play
        playBtn.onclick = () => {
            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        }

        // khi được play
        audio.onplay = () => {
            _this.isPlaying = true;
            player.classList.add('playing')
            cdThumbAnimate.play(); //bật quay cd
        }

        // khi bị pause
        audio.onpause = () => {
            _this.isPlaying = false;
            player.classList.remove('playing')
            cdThumbAnimate.pause(); //tắt quay cd 
        }


        // khi tiến độ bài hát thay đổi.
        audio.ontimeupdate = () => {
            if (audio.duration) {
                var progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercent;
            }
        }


        // xử lý khi tua
        progress.oninput = (e) => {
            const seekTime = e.target.value * audio.duration / 100;
            audio.currentTime = seekTime;

        }


        // khi next song
        nextSongbtn.onclick = () => {
            // random song
            if (_this.isRandom) {

                musicPlayed.push(_this.currentIndex);
                _this.playRandomSong();
            } else {
                _this.nextSong();
            }

            audio.play();
            _this.render();
            // scroll to view 
            _this.scrollToView();
        }

        // khi prev song
        prevSongbtn.onclick = () => {
            // random song
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
            // scroll to view 
            _this.scrollToView();
        }

        // bật / tắt  random song
        randombtn.onclick = () => {
            _this.isRandom = !_this.isRandom;
            // set config khi click random cho localstorage gồm key và value
            _this.setConfig('isRandom', _this.isRandom)
            randombtn.classList.toggle('active', _this.isRandom);
        }

        // lặp lại 1 song
        repeatbtn.onclick = () => {
            _this.isRepeat = !_this.isRepeat;
            // set config khi click repeat cho localstorage gồm key và value
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatbtn.classList.toggle('active', _this.isRepeat);
        }

        // xử lý next song khi audio kết thúc
        audio.onended = () => {
            if (_this.isRepeat) {
                audio.play();
            } else {
                nextSongbtn.click();
            }
        }


        // lắng nghe hành vi của playList đê khi thêm song thì nó kiểu gì cũng trả về cái song mk click
        renderPlayList.onclick = (e) => {
            // e.target: lấy các element mà mình click vào
            // e.target.closest(): trả về cái node chính nó hoặc trả về node cha của nó là song.
            const songNode = e.target.closest('.song:not(.active)');
            if (songNode || e.target.closest('.option')) {
                // xử lý chuyển bài khi click
                if (songNode) {
                    // vì trong attribute data-index của mỗi song có index khác nhau là chuỗi sau đó chuyển sang number 
                    var indexSongNode = Number(songNode.dataset.index);
                    _this.currentIndex = indexSongNode;
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play()
                }

                // xử lý khi click opition
                if (e.target.closest('.option')) {

                }
            }
        }
    },


    // hiển thị playlist
    render() {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index===this.currentIndex ? 'active' : ''}" data-index = ${index}>
            <div class="thumb" style="background-image: url('${song.image}')">
            </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class = "loadingPlay ${index===this.currentIndex ? 'active' : ''}">
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
        });
        renderPlayList.innerHTML = htmls.join('');
    },

    // scroll to view 
    scrollToView() {
        var _this = this;
        setTimeout(() => {
            if (_this.currentIndex === 0 || _this.currentIndex === 1 || _this.currentIndex === 3) {
                var scrollIndexCurrent = {
                    behavior: "smooth", //hành vi mềm mại
                    block: "center", //vị trí kéo khối, căn theo chiều dọc gần đến phạm nhìn thấy
                };
            } else {
                var scrollIndexCurrent = {
                    behavior: "smooth", //hành vi mềm mại
                    block: "nearest", //vị trí kéo khối, căn theo chiều dọc gần đến phạm nhìn thấy
                }
            }
            $('.song.active').scrollIntoView(scrollIndexCurrent);
        }, 300)
    },


    // load bài hát hiện tại
    loadCurrentSong() {
        Heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },


    // load config đọc từ localstore rồi lưu vào config sau đó hiển thị cho random và repeta
    loadConfig() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },

    // next song
    nextSong() {

        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },

    // prev song
    prevSong() {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },

    // play radom Song
    playRandomSong() {
        let newSong;
        if (musicPlayed.length == this.songs.length) {
            musicPlayed = [];
        }
        do {
            newSong = Math.floor(Math.random() * this.songs.length);
        } while (musicPlayed.includes(newSong));

        this.currentIndex = newSong;
        this.loadCurrentSong();
    },
    start() {

        // load cấu hình vào object
        this.loadConfig();

        // định nghĩa thuộc tính cho object
        this.getCurrentSong();


        // xử lý lắng nghe event
        this.handleEvent();

        // load bài hát hiện tại
        this.loadCurrentSong()

        // hiển thị playList
        this.render();

        // hiển thị trạng  thái ban đầu của btn repeat và random
        randombtn.classList.toggle('active', this.isRandom);
        repeatbtn.classList.toggle('active', this.isRepeat);
    }
}

app.start();