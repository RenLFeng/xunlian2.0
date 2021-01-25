<template>
  <div id="app">
    <mt-header title="影视配音">
      <mt-button slot="left" icon="back" @click="goBack()">返回</mt-button>
      <mt-button slot="right" @click="viewresult">成绩单</mt-button>
    </mt-header>
    <div class="pei-main" v-if="false">
      <div class="video-wrap">
        <video
          src
          ref="appvideo"
          class="appvideo"
          x5-playsinline
          playsinline
          webkit-playsinline="true"
          preload="true"
        >不支持视频播放</video>
        <div class="v-controls" v-if="seeResult">
          <div class="progress-wrap">
            <span>02:11</span>
            <span class="progress-bar">
              <span class="bar" :style="`width:${30}%`"></span>
            </span>
            <span>12:10</span>
          </div>
          <div class="play-btn">
            <span class="np">上一句</span>
            <span class="playstate arrow-play">
              <!-- <a class="pause">||</a> -->
            </span>
            <span class="np">下一句</span>
          </div>
        </div>
      </div>

      <div class="curpeiying-wrap" v-if="!seeResult">
        <div class="sitem" v-for="(oneitem,selindex) in srtlines" v-bind:key="selindex">
          <div class="finsh-score">
            <span class="len">{{selindex+1}}/{{srtlines.length}}</span>
            <div class="star-wrap">
              <span v-for="i in 5" :key="i">
                <img src="./assets/star.svg" alt />
              </span>
            </div>
          </div>

          <p class="subtitle">{{oneitem.subtitle}}</p>
          <div class="controls">
            <span class="sp">慢</span>
            <span class="progress-bar">
              <span class="bar" :style="`width:${30}%`"></span>
            </span>
            <span class="time">3.10s</span>
            <span class="play btn arrow-play">
              <!-- <a class="pause">||</a> -->
            </span>
            <span class="rying btn">
              <img src="./assets/luying.svg" alt />
            </span>
          </div>
        </div>
      </div>

      <div class="peiying-result-wrap" v-if="seeResult">
        <p class="sitem" v-for="(oneitem,selindex) in srtlines" v-bind:key="selindex">
          <span class>{{selindex+1}}</span>
          {{oneitem.subtitle}}
        </p>
      </div>
    </div>

    <!--
      controls="controls"
    -->
    <el-container class="appcontainer" v-if="true">
      <el-header class="appheader">
        <!-- <div id="vs" class="appvideo" ref="xgplayer"></div> -->
        <!--
        <Xgplayer :config="config" class="appvideo"/>
        -->

        <video
          src
          ref="appvideo"
          class="appvideo"
          x5-playsinline
          playsinline
          webkit-playsinline="true"
          preload="true"
        >不支持视频播放</video>
      </el-header>

      <el-main class="appmain">
        <!--
        <p  v-for="(oneitem,selindex) in srtlines"
                v-bind:key="selindex" ><span class="sentindextag">{{selindex+1}}</span>
          {{oneitem.subtitle}}</p>
        -->
        <div>
          <el-tag>{{cursentindex+1}}/{{srtlines.length}}</el-tag>
          当前得分：{{scoredesc}}
          <div style="float:right">
            <el-popover placement="bottom" title="速度设置" width="200" trigger="click">
              <el-slider
                v-model="playbackRate"
                :min="50"
                :max="200"
                :step="10"
                :show-tooltip="false"
              ></el-slider>
              <el-tag slot="reference">速度:{{playbackRate/100}}</el-tag>
            </el-popover>
          </div>
        </div>
        <div class="kouyudisplay">
          <div v-if="step=='record'">配音中，请发言</div>
          <div v-else-if="step=='listen'">听原音</div>
          <div v-else-if="step=='listenrecord'">请听原音</div>
          <div v-else-if="step=='playrecord'">回放中</div>
          <div v-else>点击按钮开始配音</div>
        </div>
        <div style="text-align:center">
          <el-button @click="setforcestep('playrecord', false)">回放配音</el-button>
          <el-button
            type="warning"
            class
            @click="setforcestep('stoprecord', false)"
            v-if="step=='record'"
          >停止配音</el-button>
          <el-button type="primary" @click="step = 'listenrecord'" v-else>开始配音</el-button>
          <el-button @click="setforcestep('listen', false)">播放原音</el-button>
        </div>
      </el-main>

      <el-footer class="appfooter">
        <div style="text-align:center">
          <el-button @click="present">上一句</el-button>

          <el-button @click="nextsent">下一句</el-button>
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
      <mt-header title="成绩单">
        <mt-button slot="left" icon="back" @click="bshowresult=false">返回</mt-button>
      </mt-header>

      <div class="listContainer">
        <div style="width:100%;height:100%;overflow:scroll">
          <el-card class="box-card" v-for="(oneitem,selindex) in srtlines" v-bind:key="selindex">
            <div v-if="typeof answers[selindex] != 'undefined'">
              <p>
                分数：
                <el-tag>{{answers[selindex].score}}</el-tag>
              </p>
              <p>
                配音：
                <el-button @click="playhistory(selindex)">播放录音</el-button>
              </p>
              <p>字幕： {{oneitem.subtitle}}</p>
            </div>
            <div v-else>{{selindex+1}}未配音</div>
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

//! cjy: xgplayer 在ios端体验不好； 1.不能解决流式播放问题
//import Xgplayer from 'xgplayer-vue';
//import Player from 'xgplayer';
//import 'xgplayer-mp4';

export default {
  name: "peiying",
  data() {
    let odata = {
      videourl: "",
      srturl: "",
      srtlines: [],
      cursentindex: 0, //! 当前句子id
      timerid: null, //!  定时器id
      step: "", //! 当前阶段： listen record play
      prestep: "",
      writecontent: "", //! 当前听写的内容
      answers: {}, //! 学生的作答
      bshowresult: false,

      backaction: "",
      lang: "en_us",

      playobj: null, //!  当前播放
      recordobj: null, //! 当前record
      currecordfile: "",

      scoredesc: "",
      curscore: 0,
      playbackRate: 100,
      config: {
        id: "vs",
        url: "/v2.mp4",
        //    url:[{src:'v2.mp4',type:"video/mp4"}],
        preloadTime: 3
      },
      tagid: 0,

      serverparams: {},
      seeResult: false
    };
    return odata;
  },
  mounted() {
    this.srturl = "http://192.168.40.104:8875/v2.srt";
    this.videourl = "http://192.168.40.104:8875/v2.mp4";
    this.srturl = common.getDomainUrl() + "/v2.srt";
    this.videourl = common.getDomainUrl() + "/v2.mp4";
    // this.videourl = common.getDomainUrl() + '/downloads/bankefile/20200701/dbf35784b5b226d17ab589824faf70ab.mp4.m3u8';
    let loadcb = () => {
      this.loadsrt();
      this.loadvideo();
      this.starttimer();
    };
    xunliancommon.parseUrlArg(this, loadcb, "peiying");
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
      console.log("onstepchanged，cur step:" + step);

      this.tagid = this.tagid + 1;
      let curtagid = this.tagid;

      let domuteplay = () => {
        if (curtagid == this.tagid) {
          let appvideo = this.$refs.appvideo;
          let sent = this.srtlines[this.cursentindex];
          appvideo.currentTime = sent.startsec;
          appvideo.muted = true; //! 静默播放
          appvideo.play();
        }
      };

      if (step == "record") {
        let filepath = xunliancommon.getrecpath(this, this.cursentindex); //'peiying_' + this.cursentindex + ".wav";
        this.currecordfile = "";
        this.recordobj = nativeobject.newrecord({
          path: filepath,
          onrecordstart: domuteplay
        });
        this.recordobj.start();
      }
      if (step == "listen" || step == "listenrecord") {
        let appvideo = this.$refs.appvideo;
        let sent = this.srtlines[this.cursentindex];

        appvideo.currentTime = sent.startsec;
        appvideo.muted = false;
        appvideo.play();
      }
      if (
        // step == 'record' ||
        step == "playrecord"
      ) {
        //domuteplay();
      }
      if (step == "playrecord") {
        if (this.currecordfile) {
          this.playobj = nativeobject.newplay({
            path: this.currecordfile,
            onplaystart: domuteplay
          });
          this.playobj.play();
        }
      }
      if (step == "stoprecord") {
        //! tudo. 打分请求
        //! 回放录音
        this.step = "playrecord";

        let sindex = this.cursentindex;
        let scorecb = (ncode, score) => {
          if (sindex == this.cursentindex) {
            if (ncode != 0) {
              let desc = "打分失败，错误码：" + ncode;
              this.scoredesc = desc;
              this.curscore = 0;
            } else {
              this.scoredesc = score;
              this.curscore = score;
            }
          }
        };
        this.scoredesc = "打分中...";
        // setTimeout(scorecb(0, 66), 3000);
        // this.xunliansave(scorecb)
        // return;
        xunliancommon.dowavscore(
          this,
          this.currecordfile,
          this.srtlines[sindex].subtitle,
          this.lang,
          scorecb
        );
      }
    },
    xunliansave(cb) {
      let postobj = {
        audio: this.currecordfile,
        text: this.srtlines[this.cursentindex].subtitle,
        lang: "en_us"
      };
      postobj.xunliansave = {
        aboutid: this.serverparams.aboutid,
        abouttype: this.serverparams.abouttype,
        xunliantype: this.serverparams.xunliantype,
        sentindex: this.cursentindex
      };
      
      this.$http
        .post("/api/voice/pingce", postobj)
        .then(res => {
          if (res.data.code == "0") {
            cb(0, 66);
          }
        })
        .catch(err => {});
    },
    getLimitTimeMSec() {
      let sline = this.srtlines[this.cursentindex];
      let limittime = sline.endsec - sline.startsec;
      //! 加上速度的变量
      limittime /= this.playbackRate / 100;
      //! cjy: 加上半秒钟的播放器误差
      limittime += 0.5;
      limittime *= 2; //! 最多2倍时间
      if (limittime > 0) {
        if (limittime < 3) {
          limittime = 3;
        }
      } else {
        limittime = 60; //! 时间异常； 赋予一个比较大的时间
      }
      return limittime * 1000;
    },
    ontimer() {
      let appvideo = this.$refs.appvideo;
      if (
        appvideo &&
        !appvideo.paused &&
        (this.step == "listen" ||
          this.step == "listenrecord" ||
          this.step == "playrecord" ||
          this.step == "record")
      ) {
        let sline = this.srtlines[this.cursentindex];
        let delay = 0;
        //! 如果是录制或录制播放，给予一定的延迟时间，方便录制完
        if (this.step == "record" || this.step == "playrecord") {
          delay = 0.1;
        }
        let cmptime = appvideo.currentTime - delay;
        if (cmptime > sline.endsec) {
          console.log("timer step pause:" + this.step);
          appvideo.pause();
          if (this.step == "listenrecord") {
            this.step = "record";
          } else if (this.step != "record") {
            this.step = "";
          } else if (this.step == "record") {
            this.step = "stoprecord"; //! 同步停止录音
          } else if (this.step == "playrecord") {
            this.step = "";
          }
        }
      }
      if (this.step == "record") {
        //! 自动停止录音; 防止网页版ios安全限制，不能非click播放的场景
        if (this.recordobj) {
          let limittime = this.getLimitTimeMSec();
          if (this.recordobj.getRecordTimeMs() > limittime) {
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
      if (appvideo) {
        // console.log(appvideo);
        appvideo.src = this.videourl;
        appvideo.load();

        //! cjy: 预先加载播放，防止android的第一句不能设置到正确的起始时间点
        appvideo.muted = true;
        appvideo.play();
        //  let sent = this.srtlines[0];
        //  appvideo.currentTime = sent.startsec;
        setTimeout(() => {
          appvideo.pause();
          this.serverparams.videoready = true;
          xunliancommon.xunlianready(this);
        }, 500);
      }
      let xg = this.$refs.xgplayer;
      if (xg) {
        //let  player = new Player(this.config)
      }
      this.config.url = this.videourl;
    },
    present() {
      let li = this.cursentindex - 1;
      this.dosent(li);
    },
    repeat() {
      this.dosent(this.cursentindex);
    },
    onanswerloaded(maxsentindex) {
      this.dosent(maxsentindex + 1);
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

        //！ 赋值历史答案
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

      // this.step = 'listenrecord';
      this.setforcestep("listenrecord");
    },
    setforcestep(step, bforce = true) {
      if (this.step == step) {
        if (bforce) {
          this.onstepchanged(); //! 强制重新开始
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
          this.srtlines = vsrt.lines;
          console.log("srt file", this.srtlines);
          xunliancommon.xunlianready(this);
        })
        .catch(res => {
          this.$message.error("打开字幕失败，无法训练");
        });
    }
  },
  components: {
    //Xgplayer
  }
};
</script>

<style>
#app {
  height: 100%;
  background: #f0f0f0;
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
  cjy; 使用block会使得scroll的计算不正常
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
  width: 100% !important;
  height: 211px !important;
  object-fit: fill;
}

.writesent {
  width: 100%;
}

.sentindextag {
  margin-right: 10px;
  border-radius: 2px;
  background-color: orange;
  color: white;
}

.appfooter {
}
/*  */
.video-wrap {
  position: relative;
}
.video-wrap video {
  background: #000;
}
/* video controls */
.video-wrap .v-controls {
  position: relative;
  left: 0;
  bottom: 4px;
  z-index: 10;
  color: #fff;
  width: 100%;
  background: #000;
  height: 120px;
}
.progress-wrap {
  display: flex;
  width: 95%;
  margin: 0 auto;
  height: 40px;
  align-items: center;
}
.progress-wrap .progress-bar {
  position: relative;
  width: 71%;
  margin: 0 10px;
  background: #cce8ff;
  height: 3px;
  border-radius: 3px;
}
.progress-wrap .progress-bar .bar {
  position: absolute;
  max-width: 100%;
  background: #0089ff;
  height: 100%;
  border-radius: 3px;
}
.v-controls .play-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;
}
.v-controls .play-btn span.np {
  width: 75px;
  height: 30px;
  text-align: center;
  border-radius: 30px;
  border: 1px solid #fff;
  line-height: 30px;
}
.v-controls .play-btn .playstate {
  position: relative;
  width: 63px;
  height: 63px;
  border: 1px solid #fff;
  border-radius: 63px;
  margin: 0 15px;
}
.v-controls .play-btn .playstate .pause {
  position: absolute;
  height: 24px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  font-size: 35px;
  overflow: hidden;
  font-weight: bold;
  display: flex;
  align-items: center;
}
.arrow-play::after {
  width: 2px;
  height: 0;
  border: 15px solid transparent;
  border-bottom-color: #fff;
  position: absolute;
  top: 36%;
  left: 50%;
  content: "";
  border-radius: 3px;
  transform: translate(-50%, -50%);
}
/* curpeiying-wrap */
.curpeiying-wrap {
  margin: 0 10px;
}
.curpeiying-wrap .sitem {
  box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.16);
  border-radius: 10px;
  /* padding: 10px 10px 0; */
  margin: 15px 0;
  background: #fff;
  padding: 10px 0;
}
.curpeiying-wrap .sitem > * {
  padding: 0 10px;
}
.curpeiying-wrap .sitem .finsh-score {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.curpeiying-wrap .sitem .finsh-score .star-wrap span {
  /* float: right; */
  margin: 0 3px;
}
.curpeiying-wrap .len {
  color: #5d5d5d;
}
.curpeiying-wrap .subtitle {
  font-size: 24px;
}
.curpeiying-wrap .controls {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  border-top: 1px solid #ccc;
}
.curpeiying-wrap .controls .btn {
  width: 34px;
  height: 34px;
  /* border: 1px solid #ccc; */
  border-radius: 34px;
  margin: 0 8px;
}
.curpeiying-wrap .controls .play {
  position: relative;
  background: #0089ff;
}
.curpeiying-wrap .controls .sp {
  color: #999;
  width: 23px;
  height: 23px;
  border: 1px solid #999;
  border-radius: 23px;
  text-align: center;
}
.curpeiying-wrap .controls .sp.act {
  color: #ff8900;
  border-color: #ff8900;
}
.curpeiying-wrap .controls .time {
  color: #999;
}
.curpeiying-wrap .controls .arrow-play::after {
  border-width: 9px;
}
.curpeiying-wrap .controls .play .pause {
  position: absolute;
  height: 14px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  font-size: 25px;
  overflow: hidden;
  font-weight: bold;
  display: flex;
  align-items: center;
  color: #fff;
}
.curpeiying-wrap .controls .progress-bar {
  position: relative;
  width: 44%;
  margin: 0 10px;
  background: #cce8ff;
  height: 3px;
  border-radius: 3px;
}
.curpeiying-wrap .controls .progress-bar .bar {
  position: absolute;
  max-width: 100%;
  height: 100%;
  border-radius: 3px;
}
/*peiying-result-wrap */
.peiying-result-wrap .sitem {
  margin: 0;
  padding: 15px;
  display: flex;
  align-items: center;
}
.peiying-result-wrap .sitem.act {
  background: #ffdeb8;
  font-size: 24px;
}
</style>
