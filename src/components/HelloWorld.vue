<template>
  <div>
      <div slot="libBox"    class="libBox">
        <div class="auto">
          <video id="video" width="480" height="320" autoplay></video>
          <canvas id="canvas" width="480" height="320" style="display: none;"></canvas>
           <img src="" id="img" width="480" height="320" style="margin-left: 20px;">
          <div>
            <el-button  type="primary" @click="takePhoto">拍照</el-button>
              <el-button type="primary" @click="sure"  v-loading.fullscreen.lock="loading">人脸认证</el-button>
              <el-button type="primary" @click="uploadFace" v-loading.fullscreen.lock="loading">上传人脸</el-button>

          </div>
            <br>
            <div>
              <el-upload
                      class="upload-demo"
                      action="https://jsonplaceholder.typicode.com/posts/"
                      :show-file-list="false"
                      :before-upload="beforeUpload">
                  <el-button size="small" type="primary">点击上传</el-button>
              </el-upload>
          </div>
        </div>
      </div>
      <el-dialog
              title="文字解析"
              :visible.sync="dialogVisible"
              :before-close="handleClose">
          <el-row v-for="item in content">{{item.words}}</el-row>
          <span slot="footer" class="dialog-footer">
    <el-button @click="dialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
  </span>
      </el-dialog>


  </div>
</template>
<script>
    import {recognizeOCR, registerFace, requestverify} from "@/api";

  export default {
    name: "livingvalidation",
    props: ["response"],
    /*	authuor wenbin by 2019-03-26
        response:{
        isShowDialog: false, //是否展示
        title: "活体检测", //标题
        item: {}	需要传入数据用于子组件使用
    },*/
    data: function() {
      return {
          doUpload:"/api/ocr",
          content:[],
          loading:false,
        File:"", //上传图片文件
        streamPicture:"",
          dialogVisible:false,
        loadingStatus: {
          isShowDialogMark: false,
          loadingTitle: "等待"
        },
      }
    },
    created:function(){
      this.$message.success('先进行人脸识别 识别成功方可进行新增布控');
    },

    mounted: function() {
      this.initCamera();
    },
    methods: {

         beforeUpload(file){
            let fd = new FormData();
            fd.append('file',file);//传文件
             recognizeOCR(fd).then(res=>{
                 if(res.words_result!=null){
                     this.$message({
                         type:'success',
                         message:'上传成功！'
                     })
                     this.content=res.words_result;
                     this.dialogVisible=true;
                 }else{
                     this.$message({
                         type:'error',
                         message:'上传失败'
                     })
                 }
                 this.loading=false;

             })


        },
      //初始化摄像头 获取摄像头权限
      initCamera(){
        let self = this;
        navigator.getUserMedia  = navigator.getUserMedia ||navigator.webkitGetUserMedia ||navigator.mozGetUserMedia;
        if (navigator.getUserMedia) {
          //调用用户媒体设备, 访问摄像头
          navigator.getUserMedia({video : {width: 480, height: 320}},function(stream) {
            var video = document.querySelector('video');
            video.srcObject = stream;
            self.streamPicture = stream; //关闭摄像头需要用
            video.onloadedmetadata = function(e) {
              video.play();
            };
          }, function(err) {
            console.log("访问用户媒体设备失败: " + err.name);
          })
        } else {
          self.$message.error('不支持访问用户媒体');
        }
      },
      //拍照点击
      takePhoto(){
        let canvas = document.getElementById('canvas');
        let context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, 480, 320);
        // 获取图片base64链接
        var image = canvas.toDataURL('image/png');
        // 定义一个img
        var img = document.getElementById("img");
        //设置属性和src
        //img.id = "imgBoxxx";
        img.src = image;
        //将图片添加到页面中
        //document.body.appendChild(img);
        function dataURLtoFile(dataurl, filename) {
          var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
                  bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          return new File([u8arr], filename, {type: mime});
        }
        this.File = dataURLtoFile(image, 'aa.png');
        //console.log(dataURLtoFile(image, 'aa.png'));
        return dataURLtoFile(image, 'aa.png');
      },








        uploadFace() {
          this.loading=true;
            // debugger;
            var self = this;
            //console.log(this.File);
            if (this.File == "") { //如果不点击拍照
                self.$message.warning(`请先拍照再点击确定`);
                return;
            }
            this.loadingStatus.isShowDialogMark = true;
            var formData = new FormData();
            formData.append("file", this.File);

            registerFace(formData).then(res => {
                if(res.error_msg=='SUCCESS'){
                    this.$message({
                        type:'success',
                        message:'上传成功！'
                    })
                }else{
                    this.$message({
                        type:'error',
                        message:'上传失败'
                    })
                }
                this.loading=false;

            });
        },
      //确认图片上传 人脸识别 确定权限
      sure(){
          this.loading=true;
        // debugger;
        var self = this;
        //console.log(this.File);
        if(this.File == ""){ //如果不点击拍照
          self.$message.warning(`请先拍照再点击确定`);
          return;
        }
        this.loadingStatus.isShowDialogMark = true;
        var formData = new FormData();
        formData.append("file",this.File);
        formData.append("user","lxy");


        requestverify(formData).then(res=>{
            console.log(res);
          if(res.error_msg=='SUCCESS') {
              if (res.result.user_list[0].user_id == 'user2' && res.result.user_list[0].group_id == 'group001') {
                  this.$message({
                      type: "success",
                      message: '认证成功！'
                  });
              }else{
                  this.$message({
                      type:'error',
                      message:'非法用户'
                  })
              }
              this.loading = false;
          }else{
              this.$message({
                  type:'error',
                  message:'非法用户'
              })
          }

        });
        // $.ajax({
        //   type: "POST", // 数据提交类型
        //   url: "/gateway/disposition-service/face_verification", // 发送地址
        //   data: formData, //发送数据
        //   async: true, // 是否异步
        //   processData: false, //processData 默认为false，当设置为true的时候,jquery ajax 提交的时候不会序列化 data，而是直接使用data
        //   contentType: false,
        //   success:function(data){
        //     if(data.data){
        //       self.$refs.addDialogRef.closeDialog();//关闭 dialog 组件 和 摄像机流
        //       self.$emit('realAddNewTask'); //触发父组件realAddNewTask方法 弹出新建布控窗口
        //       self.$message.success(`${data.message}`);
        //     }else{
        //       self.$message.warning(`${data.message}`);
        //     }
        //     self.loadingStatus.isShowDialogMark = false;
        //   },
        //   error:function(e){
        //     self.loadingStatus.isShowDialogMark = false;
        //     self.$message.warning(`${e}`);
        //     //console.log("不成功"+e);
        //   }
        // });
      },
      closeDialog(){
        //console.log("closeDialog");
        if(this.streamPicture){
          this.streamPicture.getTracks()[0].stop();//如果是活体检测界面 关闭摄像机
        }
      }
    },
  }
</script>
