<template>
  <div id="app">
    <mt-header :title="$mt(serverparams.headername)">
      <mt-button slot="left" icon="back" @click="goBack()">{{$mt('返回')}}</mt-button>
      <mt-button slot="right" @click="viewresult">{{$mt('成绩单')}}</mt-button>
    </mt-header>

    <!--
      controls="controls"
    -->
    <el-container class="appcontainer">
      <el-header class="appheader">
        <video
          src
          ref="appvideo"
          class="appvideo"
          x5-playsinline
          playsinline
          webkit-playsinline="true"
        >{{$mt('不支持视频播放')}}</video>
      </el-header>

      <el-main class="appmain">
        <!--
        <p  v-for="(oneitem,selindex) in srtlines"
                v-bind:key="selindex" ><span class="sentindextag">{{selindex+1}}</span>
          {{oneitem.subtitle}}</p>
        -->
        <div>
          <el-tag>{{cursentindex+1}}/{{srtlines.length}}</el-tag>

          {{$mt('当前得分')}}：{{scoredesc}}
          <div style="float:right">
            <el-popover placement="bottom" :title=" $mt('速度设置')" width="200" trigger="click">
              <el-slider
                v-model="playbackRate"
                :min="50"
                :max="200"
                :step="10"
                :show-tooltip="false"
              ></el-slider>
              <el-tag slot="reference">{{$mt('速度')}}:{{playbackRate/100}}</el-tag>
            </el-popover>
          </div>
        </div>
        <div class="kouyudisplay">
          <div v-if="step=='record'">{{$mt('录音中')}}</div>
          <div v-else-if="step=='listen'">{{$mt('请听原音')}}</div>
          <div v-else-if="step=='listenrecord'">{{$mt('请听原音')}}</div>
          <div v-else-if="step=='playrecord'">{{$mt('录音回放中')}}</div>
          <div v-else>{{$mt('请点击按钮开始训练')}}..</div>
        </div>
        <div style="text-align:center">
          <el-button @click="step='playrecord'">{{$mt('回放录音')}}</el-button>
          <el-button
            type="warning"
            class
            @click="step='stoprecord'"
            v-if="step=='record'"
          >{{$mt('停止录音')}}</el-button>
          <el-button type="primary" @click="step='listenrecord'" v-else>{{$mt('开始训练')}}</el-button>
          <el-button @click="step='listen'">{{$mt('播放原音')}}</el-button>
        </div>
      </el-main>

      <el-footer class="appfooter">
        <div style="text-align:center">
          <el-button @click="present">{{$mt('上一句')}}</el-button>
          <el-button @click="nextsent">{{$mt('下一句')}}</el-button>
        </div>
      </el-footer>
    </el-container>

    <mt-popup
      v-model="bshowresult"
      position="right"
      class="popup-right"
      :modal="true"
      style="background:#f0f0f0"
    >
      <mt-header :title="$mt('成绩单')">
        <mt-button slot="left" icon="back" @click="bshowresult=false">{{$mt('返回')}}</mt-button>
      </mt-header>

      <div class="listContainer">
        <div style="width:100%;height:100%;overflow:scroll">
          <el-card class="box-card" v-for="(oneitem,selindex) in srtlines" v-bind:key="selindex">
            <div v-if="typeof answers[selindex] != 'undefined'">
              <p>
                {{$mt('分数')}}：
                <el-tag>{{answers[selindex].score}}</el-tag>
              </p>
              <p>
                {{$mt('录音')}}：
                <el-button @click="playhistory(selindex)">{{$mt('播放录音')}}</el-button>
              </p>
              <p>{{$mt('参考答案')}}： {{oneitem.subtitle}}</p>
            </div>
            <div v-else>{{selindex+1}} {{$mt('未录音')}}</div>
          </el-card>
        </div>
      </div>
    </mt-popup>
  </div>
</template>

<script>
import HelloWorld from "./components/HelloWorld.vue";

import Srt from "@/srt";
import xunliancommon from "@/xunliancommon";
import common from "@/common";

import nativebridge from "@/nativebridge";
import nativeobject from "@/nativeobject";

export default {
  name: "Kouyu",
  data() {
    let odata = {
      videourl: "",
      srturl: "",
      srtlines: [],
      cursentindex: 0, //!  {{$mt('当前句子')}}id
      timerid: null, //!   {{$mt('定时器')}}id
      step: "", //!  {{$mt('当前阶段')}}： listen record play
      prestep: "",
      writecontent: "", //!  {{$mt('当前听写的内容')}}
      answers: {}, //!  {{$mt('学生的作答')}}
      bshowresult: false,

      playobj: null, //!   {{$mt('当前播放')}}
      recordobj: null, //!  {{$mt('当前')}}record
      currecordfile: "",

      scoredesc: "",
      curscore: 0,
      playbackRate: 100,
      lang: "en_us",
      backaction: ""
    };
    return odata;
  },
  mounted() {
    this.srturl = "http://192.168.40.104:8875/v2.srt";
    this.videourl = "http://192.168.40.104:8875/v2.mp4";
    this.srturl = common.getDomainUrl() + "/v2.srt";
    this.videourl = common.getDomainUrl() + "/v2.mp4";
    let loadcb = () => {
      this.loadsrt();
      this.loadvideo();
      this.starttimer();
    };
    xunliancommon.parseUrlArg(this, loadcb, "kouyu");
  },
  destroyed() {
    if (this.timerid) {
      clearInterval(this.timerid);
    }
    this.stopallplay();
    this.stopallrecord();
  },
  watch: {
    step: function(newValue, oldValue) {
      this.onstepchanged();
    },
    playbackRate: function(newValue, oldValue) {
      this.onplaybackrate();
    }
  },
  methods: {
    goBack() {
      xunliancommon.doback(this);
    },
    onplaybackrate() {
      let appvideo = this.$refs.appvideo;
      if (appvideo) {
        appvideo.playbackRate = this.playbackRate / 100;
      }
    },
    stopallplay() {
      let appvideo = this.$refs.appvideo;
      if (appvideo) {
        appvideo.pause();
      }

      if (this.playobj) {
        this.playobj.stop();
        this.playobj = null;
      }
    },
    stopallrecord() {
      if (this.recordobj) {
        this.recordobj.stop();
        this.currecordfile = this.recordobj.path;
        this.recordobj = null;
      }
    },
    playhistory(cindex) {
      if (this.answers[cindex]) {
        let rfile = this.answers[cindex].recordfile;
        if (rfile) {
          this.stopallplay();
          this.stopallrecord();
          this.playobj = nativeobject.newplay({
            path: rfile
          });
          this.playobj.play();
        }
      }
    },
    onstepchanged() {
      let step = this.step;
      this.stopallplay();
      this.stopallrecord();
      if (step == "record") {
        let filepath = xunliancommon.getrecpath(this, this.cursentindex); //'kouyu_' + this.cursentindex + ".wav";
        this.currecordfile = "";
        this.recordobj = nativeobject.newrecord({ path: filepath });
        this.recordobj.start();
      } else if (step == "listen" || step == "listenrecord") {
        let appvideo = this.$refs.appvideo;
        let sent = this.srtlines[this.cursentindex];
        appvideo.currentTime = sent.startsec;
        appvideo.muted = false;
        appvideo.play();
      } else if (step == "playrecord") {
        if (this.currecordfile) {
          this.playobj = nativeobject.newplay({
            path: this.currecordfile
          });
          this.playobj.play();
        }
      } else if (step == "stoprecord") {
        //! tudo.  {{$mt('打分请求')}}
        //!  {{$mt('回放录音')}}
        this.step = "playrecord";

        let sindex = this.cursentindex;
        let scorecb = (ncode, score) => {
          if (sindex == this.cursentindex) {
            if (ncode != 0) {
              let desc =
                this.$mt("打分失败") + "，" + this.$mt("错误码") + "：" + ncode;
              this.scoredesc = desc;
              this.curscore = 0;
            } else {
              this.scoredesc = score;
              this.curscore = score;
            }
          }
        };
        this.scoredesc = this.$mt("打分中") + "...";
        xunliancommon.dowavscore(
          this,
          this.currecordfile,
          this.srtlines[sindex].subtitle,
          this.lang,
          scorecb
        );
      }
    },
    getLimitTimeMSec() {
      let sline = this.srtlines[this.cursentindex];
      let limittime = sline.endsec - sline.startsec;
      //!  {{$mt('加上速度的变量')}}
      //  console.log(limittime);
      limittime /= this.playbackRate / 100;
      //! cjy:  {{$mt('加上半秒钟的播放器误差')}}
      limittime += 0.5;
      limittime *= 2; //!  {{$mt('最多')}}2 {{$mt('倍时间')}}
      if (limittime > 0) {
        if (limittime < 3) {
          limittime = 3;
        }
      } else {
        limittime = 60; //!  {{$mt('时间异常')}}；  {{$mt('赋予一个比较大的时间')}}
      }
      return limittime * 1000;
    },
    ontimer() {
      if (this.step == "listen" || this.step == "listenrecord") {
        let sline = this.srtlines[this.cursentindex];
        let appvideo = this.$refs.appvideo;
        if (appvideo.currentTime > sline.endsec) {
          appvideo.pause();
          if (this.step == "listenrecord") {
            this.step = "record";
          } else {
            this.step = "";
          }
        }
      } else if (this.step == "record") {
        //!  {{$mt('自动停止录音')}}
        if (this.recordobj) {
          let limittime = this.getLimitTimeMSec();
          if (this.recordobj.getRecordTimeMs() > limittime) {
            console.log("record stop, for over the limittime:" + limittime);
            // console.log(this.recordobj.getRecordTime());
            this.step = "stoprecord";
          }
        }
      } else if (this.step == "playrecord") {
        if (this.playobj) {
          let limittime = this.getLimitTimeMSec();
          if (this.playobj.getPlayTimeMs() > limittime) {
            this.step = "";
          }
        }
      }
    },
    starttimer() {
      if (!this.timerid) {
        let fn = () => {
          this.ontimer();
        };
        this.timerid = setInterval(fn, 50);
      }
    },
    loadvideo() {
      let appvideo = this.$refs.appvideo;
      console.log(appvideo);
      appvideo.src = this.videourl;
      appvideo.load();
      //! cjy:  {{$mt('预先加载播放')}}， {{$mt('防止')}}android {{$mt('的第一句不能设置到正确的起始时间点')}}
      appvideo.muted = true;
      appvideo.play();
      setTimeout(() => {
        appvideo.pause();
      }, 200);
    },
    present() {
      let li = this.cursentindex - 1;
      this.dosent(li);
    },
    repeat() {
      this.dosent(this.cursentindex);
    },
    nextsent() {
      let li = this.cursentindex + 1;
      this.dosent(li);
    },
    viewresult() {
      this.savecurwrite();
      this.bshowresult = true;
    },
    savecurwrite() {
      if (!this.currecordfile) {
        return;
      }

      if (!this.answers[this.cursentindex]) {
        this.answers[this.cursentindex] = {};
      }
      this.stopallplay();
      this.stopallrecord();
      this.answers[this.cursentindex].recordfile = this.currecordfile;
      //  let keyanswer = this.srtlines[this.cursentindex].subtitle;
      this.answers[this.cursentindex].score = this.curscore;
    },
    dosent(sentindex) {
      if (sentindex < 0 || sentindex >= this.srtlines.length) {
        return;
      }

      if (this.cursentindex != sentindex) {
        this.savecurwrite();

        //！  {{$mt('赋值历史答案')}}
        let cfile = "";
        if (this.answers[sentindex]) {
          cfile = this.answers[sentindex].recordfile;
          this.scoredesc = this.curscore = this.answers[sentindex].score;
        } else {
          this.scoredesc = "";
          this.curscore = 0;
        }
        this.currecordfile = cfile;
      }

      this.cursentindex = sentindex;

      //   this.step = 'listenrecord';
      //! cjy: {{$mt('不自动开始')}}
      this.setforcestep("listenrecord");
    },
    setforcestep(step, bforce = true) {
      if (this.step == step) {
        if (bforce) {
          this.onstepchanged(); //!  {{$mt('强制重新开始')}}
        }
      } else {
        this.step = step;
      }
    },
    loadsrt() {
      this.$http
        .get(this.srturl)
        .then(res => {
          //console.log(res);
          let vsrt = new Srt(res.data);
          for (let i = 0; i < vsrt.lines.length; i++) {
            let v = vsrt.lines[i];
            v.subtitle = v.subtitle.replace(
              /[\s!！#$%&(（)）,，, :* 、.。;；？@[\]^_`{}~‘’“”《》￥【】+=·…]/g,
              " "
            );
          }
          this.srtlines = vsrt.lines;
          //  console.log(this.srtlines);
        })
        .catch(res => {
          this.$message.error(
            this.$mt("打开字幕失败") + "，" + this.$mt("无法训练")
          );
        });
    }
  },
  components: {}
};
</script>

<style>
#app {
  height: 100%;
}

html {
  height: 100%;
}
body {
  height: 100%;
  margin: 0;
}

.listContainer {
  height: 100%;
  padding-top: 50px;
  position: fixed;
  width: 100%;
  left: 0;
  top: 0;
  display: table;
  /*
  cjy;  {{$mt('使用')}}block {{$mt('会使得')}}scroll {{$mt('的计算不正常')}}
   */
}

.appcontainer {
  height: 100%;
  padding-top: 50px;
  position: fixed;
  width: 100%;
  left: 0;
  top: 0;
}

.kouyudisplay {
  text-align: center;
  font-size: 25px;
  line-height: 25px;
  margin-bottom: 20px;
  margin-top: 10px;
}

.appheader {
  background-color: black;
  color: #333;
  height: 300px !important;
  margin: 0px !important;
  padding: 0px !important;
}
.appvideo {
  width: 100%;
  height: 300px;
}

.writesent {
  width: 100%;
}

.sentindextag {
  border-radius: 2px;
  background-color: orange;
  color: white;
}

.appfooter {
}
</style>
