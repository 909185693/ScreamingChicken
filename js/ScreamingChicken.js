var Canvas = null
var CTX = null
var bMousePressed = false
var Images = new Map()
var Hits = new Array()
var BackgroundMusicAudio = null
var Audios = new Array()
var CurrentAudioIndex = 0
var ClickNum = 0

// 设置 Cookie
function SetCookie(Name, Value, ExpireDays) {
    var Now = new Date();
    Now.setTime(Now.getTime() + (ExpireDays * 24 * 60 * 60 * 1000))
    var Expires = 'expires=' + Now.toGMTString()
    var Path = 'path=/'
    document.cookie = Name + '=' + Value + '; ' + Expires + '; ' + Path;
}

// 获取 Cookie
function GetCookie(Name) {
    var CName = Name + '='
    var CookieSplit = document.cookie.split(';')
    for (var i = 0; i < CookieSplit.length; i++) {
        var C = CookieSplit[i].trim();
        if (C.indexOf(CName) == 0) return C.substring(CName.length, C.length);
    }
    return '';
}

// 获取ClickNum 
function GetClickNum() {
    let Now = new Date()
    let Year = Now.getFullYear()
    let Month = Now.getMonth() + 1
    let Day = Now.getDate()
    let Name = 'ClickNum_' + Year + (Month < 10 ? '0' + Month : Month) + (Day < 10 ? '0' + Day : Day)
    let Value = GetCookie(Name)
    if (Value == '') {
        return 0
    }
    else {
        return parseInt(Value)
    }
}

// 设置ClickNum
function SetClickNum(Num) {
    let Now = new Date()
    let Year = Now.getFullYear()
    let Month = Now.getMonth() + 1
    let Day = Now.getDate()
    let Name = 'ClickNum_' + Year + (Month < 10 ? '0' + Month : Month) + (Day < 10 ? '0' + Day : Day)
    SetCookie(Name, Num, 1)
}

// 图片加载
async function ImageLoader(Key, Src) {
    return new Promise((resolve, reject) => {
        let NewImage = new Image()
        NewImage.src = Src
        NewImage.onload = function () {
            Images.set(Key, this)
            resolve()
        }
    })
}

/**
 * Html 事件
 */
window.onload = async function () {
    Canvas = document.getElementById('canvas')
    Canvas.width = Canvas.clientWidth
    Canvas.height = Canvas.clientHeight
    Canvas.addEventListener('click', OnCanvasClick)
    Canvas.addEventListener('touchstart', OnCanvasMouseDown)
    Canvas.addEventListener('touchend', OnCanvasMouseUp)
    Canvas.addEventListener('mousedown', OnCanvasMouseDown)
    Canvas.addEventListener('mouseup', OnCanvasMouseUp)

    CTX = Canvas.getContext('2d')

    await ImageLoader('Chicken_01', './images/Chicken_01.png')
    await ImageLoader('Chicken_02', './images/Chicken_02.png')
    await ImageLoader('Chicken_03', './images/Chicken_03.png')

    window.setInterval(function () {
        CTX.clearRect(0, 0, Canvas.clientWidth, Canvas.clientHeight)

        Draw()
    }, 1000 / 60)

    ClickNum = GetClickNum()
}

function OnCanvasClick(e) {
    Hits.push({
        X: e.offsetX + (Math.random() * 500 - 250),
        Y: e.offsetY,
        Text: '尖叫+1 快乐+1',
        Duration: 1.0
    })

    ClickNum = GetClickNum()
    ClickNum++
    SetClickNum(ClickNum)
}

function OnCanvasMouseDown(e) {
    bMousePressed = true

    if (BackgroundMusicAudio == null) {
        BackgroundMusicAudio = new Audio('./sounds/BackgroundMusic.mp3')
        BackgroundMusicAudio.loop = true
        BackgroundMusicAudio.play()
    }

    if (Audios.length < 3) {
        let ChickenAudios = ['./sounds/Chicken_01.mp3', './sounds/Chicken_02.mp3', './sounds/Chicken_03.mp3']
        let ChickenAudio = new Audio(ChickenAudios[Math.floor(Math.random() * 3)])
        ChickenAudio.loop = false
        ChickenAudio.play()
        Audios.push(ChickenAudio)
    }
    else {
        let Audio = Audios[CurrentAudioIndex]
        if (Audio && Audio.currentTime >= Audio.duration) {
            Audio.currentTime = 0
            Audio.play()

            CurrentAudioIndex = (CurrentAudioIndex + 1) % 3
        }
    }
}

function OnCanvasMouseUp(e) {
    bMousePressed = false
}

function Draw() {
    let DrawX = Canvas.clientWidth * 0.5
    let DrawY = Canvas.clientHeight * 0.5
    let Image = null
    if (bMousePressed) {
        Image = Images.get('Chicken_02')
        CTX.fillStyle = '#00ff00'
    }
    else {
        Image = Images.get('Chicken_01')
        CTX.fillStyle = '#ff0000'
    }

    let Scale = Canvas.width / 1080
    if (Image) {
        CTX.drawImage(Image, DrawX - Image.width * Scale * 0.5, DrawY - Image.height * Scale * 0.5, Image.width * Scale, Image.height * Scale)
    }

    CTX.font = "48px Yahei"
    CTX.fillText('N♥Z', 0, 48)

    CTX.font = "24px Yahei"
    CTX.fillText('本日欢乐次数：' + ClickNum, 0, 96)

    CTX.font = "20px Yahei"
    for (let i = 0; i < Hits.length; i++) {
        let Hit = Hits[i]

        Hit.Duration -= 0.016666
        if (Hit.Duration > 0) {
            CTX.fillText(Hit.Text, Hit.X, Hit.Y - (1 / Hit.Duration) * 25)
        }
        else {
            Hits.splice(i, 1)
            break
        }
    }
}