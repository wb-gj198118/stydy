class RecordingVideo {
    // 播放时长
    duration = 0
    // 录制流媒体
    mediaRecorder
    // 录制的数据
    recordedBlobs
    // 倒计时interlval
    intervalId
    // 摄像头流媒体
    stream
    // 录制时长
    maxD = 15
    // 倒计时初始值
    count = 15
    // 页面dom
    gumVideo = document.querySelector('#gum')
    gumVideo2 = document.querySelector('#gum2')
    recordButton = document.querySelector('#record')
    playButton = document.querySelector('#play')
    downloadButton = document.querySelector('#download')
    tEL = document.getElementById('tEl')
    constructor() {
        const constraints = {
            audio: true,
            video: {
                facingMode: "user",
                width: 400,//视频宽度
                height: 400,//视频高度
                frameRate: 60,//每秒60帧
            }
        }
        const isSecureOrigin = location.protocol === 'https:' || location.hostname === 'localhost'
        if (!isSecureOrigin) {
            alert('getUserMedia() 必须在https或localhost下使用')
            location.protocol = 'HTTPS'
        }
        this.recordButton.onclick = () => this.toggleRecording()
        this.playButton.onclick = () => this.play()
        this.downloadButton.onclick = () => this.download()
        this.gumVideo2.width = constraints.video.width
        this.gumVideo2.height = constraints.video.height
        // 获取摄像头流媒体
        this.getUserMedia(constraints,(stream) => {
            // 摄像头流媒体成功回调
            this.recordButton.disabled = false
            this.stream = stream
            this.gumVideo.srcObject = stream
        },(e) => {
            // 摄像头流媒体失败回调
            if (error.message === 'Permission denied') {
                alert('您已经禁止使用摄像头，请到设置-通用-微信存储空间-管理微信存储空间-点击‘清理其他微信账号聊天数据’')
            }
            console.log('navigator.getUserMedia error: ', error)
        })
        
    }
    // 获取摄像头流媒体
    getUserMedia(constraints, success, error) {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            //最新的标准API
            navigator.mediaDevices.getUserMedia(constraints).then(success).catch(error)
        } else if (navigator.webkitGetUserMedia) {
            //webkit核心浏览器
            navigator.webkitGetUserMedia(constraints, success, error)
        } else if (navigator.mozGetUserMedia) {
            //firfox浏览器
            navigator.mozGetUserMedia(constraints, success, error)
        } else if (navigator.getUserMedia) {
            //旧版API
            navigator.getUserMedia(constraints, success, error)
        }
    }
    // 开始录制的事件
    toggleRecording() {
        const tEl = this.tEL
        if (this.recordButton.textContent === '开始录制') {
            tEl.innerHTML = ''
            this.startRecording()
            clearInterval(this.intervalId)
            tEl.innerHTML = '剩余时间：'+this.count+'秒'
            this.count--
            this.intervalId = setInterval(()  => {
                tEl.innerHTML = '剩余时间：'+this.count+'秒'
                if (this.count <= 0) {
                    clearInterval(this.intervalId)
                    this.duration = this.maxD - this.count
                    this.count = this.maxD
                    this.stopRecording()
                    this.recordButton.textContent = '开始录制'
                    this.downloadButton.disabled = false
                    this.playButton.disabled = false
                } else {
                    this.count--
                }
                
            }, 1000)
        } else {
            clearInterval(this.intervalId)
            
            this.duration = this.maxD - this.count
            this.count = this.maxD
            this.stopRecording()
            this.recordButton.textContent = '开始录制'
            this.playButton.disabled = false
            this.downloadButton.disabled = false
        }
    }
    // 开始录制
    startRecording() {
        const isSafari = !(!(/Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)))

        this.recordedBlobs = []
        const options = { 
            audioBitsPerSecond: 128000,
            videoBitsPerSecond: 2500000,
            mimeType: isSafari ? 'video/mp4' : 'video/webm'
        }
        try {
            this.mediaRecorder = new MediaRecorder(this.stream, options)
        } catch (e) {
            alert('MediaRecorder创建失败: ' + e + '. mimeType: ' + options.mimeType)
            return
        }
        this.recordButton.textContent = '结束录制'
        this.downloadButton.disabled = true
        this.playButton.disabled = true
        
        // 录制中
        this.mediaRecorder.ondataavailable = event => {
            if (event.data && event.data.size > 0) {
                this.recordedBlobs.push(event.data)
            }
        }
        // 录制结束回调
        this.mediaRecorder.onstop = event => {
            console.log('Recorder stopped: ', event)
        }
        // 开始录制
        this.mediaRecorder.start(10);
    }
    // 停止录制
    stopRecording() {
        tEl.innerHTML = '录制完成'
        this.mediaRecorder.stop()
    }
    // 下载视频
    download() {
        const blob = new Blob(this.recordedBlobs, { type: 'video/mp4' })
        const a = document.createElement('a')
        a.setAttribute('download', Date.now() + '.mp4')
        a.href = URL.createObjectURL(blob)
        a.click()
    }
    // 点击播放
    play() {
        const { recordedBlobs, gumVideo2 } = this
        const blob = new Blob(recordedBlobs, { type: 'video/mp4' })
        const size = parseInt(blob.size / 1024)
        let strSize = ''
        if (size < 1024) {
            strSize = size + 'KB'
        } else {
            strSize = (size/1024).toFixed(2) + 'MB'
        }
        alert('播放时长：' + this.duration + '秒, 大小：'+strSize)
        const videoURL = URL.createObjectURL(blob)
        gumVideo2.style.display = ''
        gumVideo2.src = videoURL
    }
    
}

new RecordingVideo();