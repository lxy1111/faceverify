<template>
    <div id="facelogin">
        <h1 class="title is-1">{{FaceisDetected}}</h1>
        <!-- <p>{{FaceisDetected}}</p> -->
        <div class="content-cam">
            <div class="camera-wrp">
                <video width="320" height="320" ref="videoDom" id="video_cam" preload autoplay loop muted></video>
                <canvas width="320" height="320" ref="canvasDOM" id="face_detect"></canvas>
                <div class="control-btn"></div>
                <button type="button" name="button" @click="openCamera">点击我拍照</button>
            </div>
            <div class="images-wrp sec">
                <!-- <p class="title is-5">Image taken</p> -->
                <div
                        :class="`img-item img-item-${index}`"
                        v-for="(image, index) in images"
                        :key="`img-wrp-${index}`"
                        :style="`background-image: url('${image}')`"
                ></div>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    name: 'facelogin',
    data() {
        return {
            count: 0,
            isdetected: '请您保持脸部在画面中央',
            videoEl: {},
            canvasEL: {},
            images: [],
            trackCcv: false,
            trackTracking: false,
            autoCaptureTrackTraking: false,
            userMediaConstraints: {
                audio: false,
                video: {
// ideal（应用最理想的）
                    width: {
                        min: 320,
                        ideal: 1280,
                        max: 1920
                    },
                    height: {
                        min: 240,
                        ideal: 720,
                        max: 1080
                    },
// frameRate受限带宽传输时，低帧率可能更适宜
                    frameRate: {
                        min: 15,
                        ideal: 30,
                        max: 60
                    },
// 摄像头翻转
                    facingMode: 'user'
                }
            }
        }
    },
    computed: {
        FaceisDetected() {
            return this.isdetected
        }
    },
    created() {
     //   this.changeView()
    },


    mounted() {
// The getUserMedia interface is used for handling camera input.
// Some browsers need a prefix so here we're covering all the options
        navigator.getMedia =
            navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia
        this.init()
    },
    methods: {
        openCamera () {

            var video = document.getElementById('video_cam');
            var canvas = document.getElementById('face_detect');
            var context = canvas.getContext('2d');

            var tracker = new tracking.ObjectTracker('face');
            tracker.setInitialScale(4);
            tracker.setStepSize(2);
            tracker.setEdgesDensity(0.1);

            this.trackerTask = tracking.track('#video_cam', tracker, { camera: true });

            tracker.on('track', function(event) {
                context.clearRect(0, 0, canvas.width, canvas.height);

                event.data.forEach(function(rect) {
                    context.font = '11px Helvetica';
                    context.fillText("已识别到人脸，请点击拍照",100,40);
                    context.strokeStyle = '#a64ceb';
                    context.strokeRect(rect.x, rect.y, rect.width, rect.height);
                });
            });

        },
        async init() {
            this.videoEl = this.$refs.videoDom
            this.canvasEL = this.$refs.canvasDOM
            await navigator.mediaDevices
                .getUserMedia(this.userMediaConstraints)
                .then(this.getMediaStreamSuccess)
                .catch(this.getMediaStreamError)
            await this.onPlay()


        },
        async onPlay() {
            // debugHelper.log('onPlay')


            this.onTrackTracking()
            //this.onDetectFace()
            this.onTakeCam()
        },
        changeView() {
            this.setTitle('刷脸登陆')
            this.setBackDisabled(false)
            this.setBackIcon('arrow_back')
            msgbus.vm.setBottomNavVisible(false)
            msgbus.vm.setBottomBtnVisible(false)
            msgbus.vm.setMsgInputVisible({value: false})
        },


        onTrackTracking() {
            const context = this
            const video = this.videoEl
            const canvas = this.canvasEL
            const canvasContext = canvas.getContext('2d')
            let tracker = new tracking.ObjectTracker('face')


            video.pause()
            video.src = ''
            tracker.setInitialScale(4)
            tracker.setStepSize(2)
            tracker.setEdgesDensity(0.1)
            tracking.track('#video_cam', tracker, {camera: true})
            tracker.on('track', function (event) {
                const {autoCaptureTrackTraking} = context
                canvasContext.clearRect(0, 0, canvas.width, canvas.height)
                event.data.forEach(function ({x, y, width, height}) {
                    canvasContext.strokeStyle = '#a64ceb'
                    canvasContext.strokeRect(x, y, width, height)
                    canvasContext.font = '11px Helvetica'
                    canvasContext.fillStyle = '#fff'
                })


                if (event.data!=null && context.count <= 10) {
                    if (context.count < 0) context.count = 0
                    context.count += 1
//debugHelper.log(context.count)
                    if (context.count > 10) {
                        context.isdetected = '已检测到人脸，正在登录'
                        canvasContext.drawImage(video, 0, 0, 320, 320);

                        var snapData = canvas.toDataURL('image/jpeg',1.0)
                        // var imgSrc = "data:image/png;" + snapData;
                        const a = document.createElement('a')
                        a.href = snapData
                        a.setAttribute('download', 'chart-download')
                        a.click()
                        this.stopMediaStreamTrack()
//context.$router.push({ name: 'pwdlogin' })
                    }
                } else {
                    context.count -= 1
                    if (context.count < 0) context.isdetected = '请您保持脸部在画面中央'
//this.isdetected = '已检测到人脸，正在登录'
                }

            })
        },
        onDownloadFile(item) {
            const link = document.createElement('a')
            link.href = item
            link.download = `cahyo-${new Date().toISOString()}.png`
            link.click()


            link.remove()
        },
        onTakeCam() {
            const canvas = document.createElement('canvas')
            const video = this.$el.querySelector('#video_cam')
            const canvasContext = canvas.getContext('2d')


            if (video.videoWidth && video.videoHeight) {
                const isBiggerW = video.videoWidth > video.videoHeight
                const fixVidSize = isBiggerW ? video.videoHeight : video.videoWidth
                let offsetLeft = 0
                let offsetTop = 0


                if (isBiggerW) offsetLeft = (video.videoWidth - fixVidSize) / 2
                else offsetTop = (video.videoHeight - fixVidSize) / 2


// make canvas size 300px
                canvas.width = canvas.height = 300
                const {width, height} = canvas


                canvasContext.drawImage(
                    video,
                    offsetLeft,
                    offsetTop,
                    fixVidSize,
                    fixVidSize,
                    0,
                    0,
                    width,
                    height
                )
                const image = canvas.toDataURL('image/png')
                this.images.push(image)
            }
        },
        onDetectFace(param, index) {
            const imgItem = document.querySelector(`.img-item-${index}`)
            const image = new Image()
            image.src = param


            const tracker = new tracking.ObjectTracker('face')
            tracker.setStepSize(1.7)
            tracking.track(image, tracker)


            tracker.on('track', function (event) {
                event.data.forEach(function (rect) {
                    window.plot(rect.x, rect.y, rect.width, rect.height)
                })
            })


            window.plot = function (x, y, w, h) {
                const rect = document.createElement('div')
                document.querySelector(`.img-item-${index}`).appendChild(rect)
                rect.classList.add('rect')
                rect.style.width = w + 'px'
                rect.style.height = h + 'px'
                rect.style.left = x + 'px'
                rect.style.top = y + 'px'
                rect.style.border = '2px solid yellow'
                rect.style.position = 'absolute'
            }
        },
        getMediaStreamSuccess(stream) {
            window.stream = stream // make stream available to browser console
            this.videoEl.srcObject = stream
           // debugHelper.log('getMediaStreamSuccess1')
//this.$store.commit('setVideoCanvasObject', this.videoEl)
          //  debugHelper.log('getMediaStreamSuccess2')
        },
// 视频媒体流失败
        getMediaStreamError(error) {
            alert('视频媒体流获取错误' + error)
        },
// 结束媒体流
        stopMediaStreamTrack() {
            clearInterval(this.timeInterval)
            if (typeof window.stream === 'object') {
                this.videoEl.srcObject = null
//this.$store.commit('setVideoCanvasObject', '')
                window.stream.getTracks().forEach(track => track.stop())
            }
        }
    }
}
</script>
<style lang="less" scoped>
    .camera-wrp{
        height: 100vh;
        width: 100%;
        position: relative;
        >* {
            position: absolute;
            left: 0;
            right: 0;
            margin: auto;
        }
        video, canvas {
            top: 0;
        }
        .buttonDiv {
            bottom: 10px;
        }
    }

</style>
