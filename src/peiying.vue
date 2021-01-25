<template>
  <div id="app">
    <mt-header :title="$mt(serverparams.headername)">
      <mt-button slot="left" icon="back" @click="goBack()">{{$mt('返回')}}</mt-button>
    </mt-header>
    <div class="mark" v-if="showerrdetail" @click="closeerrmsg()"></div>
    <div class="errmsg-wrap" :class="showerrdetail?'show':''">
      <div class="tit">
        <span>
          <span class="sm">{{$mt('说明')}}:&nbsp;</span>
          <span class="emsg">{{$mt(errcodetrl(curerrdpMsg.except_info))}}</span>
        </span>
        <button class="msgclose" @click.stop="closeerrmsg()">x</button>
      </div>
      <div class="content">
        <div class="msg-item" v-for="(v,i) in curerrdpMsg.dp_msg" :key="i">
          <p>
            <span class="cn">
              {{$mt(v.content)}}
              <b>:</b>
            </span>
            <span class="msg">{{$mt(errcodetrl(v.dp_message))}}</span>
          </p>
        </div>
        <!-- <span class="cn" v-for="(v,i) in curerrdpMsg.dp_msg" :key="i">
          {{$mt(v.content)}}&nbsp;
          <span class="msg">{{$mt(errcodetrl(v.dp_message))}}</span>
        </span>-->
      </div>
    </div>
    <!-- controls -->
    <div class="pei-main" v-if="true">
      <!-- <div class="mark" v-if="showerrdetail"></div>
      <div class="errmsg-wrap" :class="showerrdetail?'show':''">
        <div class="tit">
          <span>
            <span class="sm">{{$mt('说明')}}:&nbsp;</span>
            <span class="emsg">{{$mt(errcodetrl(curerrdpMsg.except_info))}}</span>
          </span>
          <button class="msgclose" @click.stop="closeerrmsg()">x</button>
        </div>
        <div class="content">
          <div class="msg-item" v-for="(v,i) in curerrdpMsg.dp_msg" :key="i">
            <p>
              <span class="cn">
                {{$mt(v.content)}}
                <b>:</b>
              </span>
              <span class="msg">{{$mt(errcodetrl(v.dp_message))}}</span>
            </p>
          </div>
        </div>
      </div>-->
      <div class="video-wrap" ref="videowrap">
        <video
          src
          ref="appvideo"
          class="appvideo"
          x5-playsinline
          playsinline
          webkit-playsinline="true"
          preload="true"
        >{{$mt('不支持视频播放')}}</video>
        <div class="curvideostate" @click="curplaystate">
          <div class="states">
            <img src="./assets/pyzjhf.png" v-if="step==''" />
          </div>
        </div>
      </div>
      <!-- :touchstart="pyTouchStart"
        :touchmove="pyTouchMove"
      :touchend="pyTouchEnd"-->

      <!-- <div v-if="true" style="position: fixed;z-index: 9;width:100%;     text-align: center;">
        <div v-if="step=='record'">{{$mt('配音中')}}，{{$mt('请发言')}}</div>
        <div v-else-if="step=='listen'">{{$mt('听原音')}}</div>
        <div v-else-if="step=='listenrecord'">{{$mt('请听原音')}}</div>
        <div v-else-if="step=='playrecord'">{{$mt('回放中')}}</div>
        <div v-else>{{$mt('点击按钮开始配音')}}</div>
        <p
          style="position: absolute;
    right: 20px;
    top: 0;
    margin: 0;"
          v-if="scoredesc!=curscore"
        >{{scoredesc}}</p>
      </div>-->

      <!-- v-on:touchstart="pyTouchStart"
        v-on:touchmove="pyTouchMove"
      v-on:touchend="pyTouchEnd"-->
      <div
        id="curpeiyingbox"
        class="curpeiying-wrap overflow-scroll"
        v-if="!seeResult"
        ref="curpeiyingwrap"
        v-on:touchend="pyTouchEnd"
      >
        <!--  -->
        <div
          class="sitem"
          v-for="(oneitem,selindex) in srtlines"
          v-bind:key="selindex"
          ref="peyiitem"
        >
          <div class="finsh-score" @click="itemplaylisten(selindex)">
            <span class="len">{{selindex+1}}/{{srtlines.length}}</span>
            <div class="star-wrap">
              <span v-if="hasresult(selindex)">
                <span v-if="scoredesc!=curscore && selindex==cursentindex">{{scoredesc}}</span>
                <span
                  v-else
                  style="position: relative;"
                  @click.stop="errordetail(oneitem,selindex)"
                >
                  <span v-if="answers[selindex].score<(avscore/2)">{{$mt('%s分',[0])}}</span>
                  <span v-for="i in starScore(answers[selindex].score)" :key="i" class="starimg">
                    <img src="./assets/star.svg" />
                  </span>
                  <span class="starimg ban backf" v-if="showbanstar(answers[selindex].score)">
                    <img src="./assets/star.svg" />
                  </span>
                  <a
                    class="qitusens"
                    :class="answers[selindex].score<(avscore/2)?'act':''"
                    v-if="showerrormsg(selindex)"
                  >?</a>
                </span>
              </span>
            </div>
          </div>

          <p
            class="subtitle"
            id="subtitle"
            @click="itemplaylisten(selindex)"
            v-html="oneitem.subtitle"
          ></p>
          <div class="controls">
            <span
              class="sp"
              :class="oneitem.speed==60?'act':''"
              @click.stop="itemrecsp(selindex)"
            >{{$mt('慢')}}</span>
            <span class="progress-bar">
              <span class="bar" :style="`width:${oneitem.recordPro}%`"></span>
            </span>
            <span class="time">{{parseplaytime(oneitem.endsec-oneitem.startsec)}}s</span>
            <span class="btnss">
              <img
                @click.stop="playhistory(selindex)"
                src="./assets/pyhf.png"
                alt
                class="playrecord-img pyhfimg"
                v-if="!oneitem.playing&&oneitem.recordPro || step=='listen'&& oneitem.recordPro"
              />
              <span class="pyhf2 pyhfimg" v-if="step=='playrecord'&&oneitem.playing ">
                <img src="./assets/pyhf2.png" alt class="playrecord-img" />
                <a class>||</a>
              </span>
              <span
                class="luying-wrap"
                v-if="!serverparams.readonly"
                @click.stop="itemrecord(selindex)"
              >
                <img
                  v-if="step=='record' &&　oneitem.playing"
                  class="luying tz"
                  src="./assets/fyreing.png"
                  alt
                />
                <img class="luying" src="./assets/luying.svg" alt v-else />
              </span>
            </span>
            <!-- <span class="rying btn" >
              v-if="oneitem.isrecord"
            </span>-->
          </div>
        </div>
        <!-- <el-button type="primary" class="seeres" @click="seeResult=true">{{$mt('观看配音')}}</el-button> -->
      </div>

      <!-- <div class="peiying-result-wrap" v-if="seeResult" ref="pyresultwrap">
        <p class="zm" style>{{$mt('字幕')}}</p>
        <p
          class="sitem"
          ref="resitem"
          :class="cursentindex==selindex?'act':''"
          v-for="(oneitem,selindex) in srtlines"
          v-bind:key="selindex"
        >{{oneitem.subtitle}}</p>
      </div>-->
    </div>

    <!--
      controls="controls"
    -->
    <el-container class="appcontainer" v-if="false">
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
            <el-popover placement="bottom" :title="$mt('速度设置')" width="200" trigger="click">
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
          <div v-if="step=='record'">{{$mt('配音中')}}，{{$mt('请发言')}}</div>
          <div v-else-if="step=='listen'">{{$mt('听原音')}}</div>
          <div v-else-if="step=='listenrecord'">{{$mt('请听原音')}}</div>
          <div v-else-if="step=='playrecord'">{{$mt('回放中')}}</div>
          <div v-else>{{$mt('点击按钮开始配音')}}</div>
        </div>
        <div style="text-align:center">
          <el-button @click="setforcestep('playrecord', false)">{{$mt('回放配音')}}</el-button>
          <el-button
            type="warning"
            class
            @click="setforcestep('stoprecord', false)"
            v-if="step=='record'"
          >{{$mt('停止配音')}}</el-button>
          <el-button type="primary" @click="step = 'listenrecord'" v-else>{{$mt('开始配音')}}</el-button>
          <el-button @click="setforcestep('listen', false)">{{$mt('播放原音')}}</el-button>
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
                {{$mt('配音')}}：
                <el-button @click="playhistory(selindex)">{{$mt('播放录音')}}</el-button>
              </p>
              <p>{{$mt('字幕')}}： {{oneitem.subtitle}}</p>
            </div>
            <div v-else>{{selindex+1}}{{$mt('未配音')}}</div>
          </el-card>
        </div>
      </div>
    </mt-popup>
  </div>
</template>

<script>
// var sheight = document.getElementById("curpeiyingbox").clientHeight;
import HelloWorld from "./components/HelloWorld.vue";
import Srt from "@/srt";
import xunliancommon from "@/xunliancommon";
import common from "@/common";
import nativebridge from "@/nativebridge";
import nativeobject from "@/nativeobject";
import { MessageBox, Indicator } from "mint-ui";
//! cjy: xgplayer {{$mt('在')}}ios{{$mt('端体验不好')}}； 1.{{$mt('不能解决流式播放问题')}}
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
      cursentindex: 0, //! {{$mt('当前句子')}}id
      timerid: null, //!  {{$mt('定时器')}}id
      step: "", //! {{$mt('当前阶段')}}： listen record play
      prestep: "",
      writecontent: "", //! {{$mt('当前听写的内容')}}
      answers: {}, //! {{$mt('学生的作答')}}
      bshowresult: false,

      backaction: "",
      lang: "en_us",

      playobj: null, //!  {{$mt('当前播放')}}
      recordobj: null, //! {{$mt('当前')}}record
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
      seeResult: false,

      // touchStartPoint {{$mt('记录起始点')}}Y{{$mt('坐标')}}
      touchStartPoint: 0,
      // distance {{$mt('记录划动的距离')}}
      distance: 0,
      // touchTop: (sheight * 2) / 5

      oldScrollTop: 0,
      scrollTop: 0,
      scrollCount: 0,

      listenprodes: "00:00",
      listenprobar: 0,

      durationtime: "00:00",

      testindex: 0,
      starScore: common.starScore,

      canScrollevent: true,
      scrolltime: null,
      prescrollCount: 0,
      hasplay: false,
      initplay: false,
      nativeplay: true,
      muted: false,

      p: 0,
      t: 0,
      preindex: 0,
      toel: {},
      toelindex: 0,
      scrollbox: {},
      touchEnd: false,
      canmove: false,
      listenclick: false,
      showerrdetail: false,
      showmark: false,
      curerrdpMsg: {},
      errcodetrl: common.errcodetrl,
      showbanstar: common.showbanstar,
      avscore: 33,
      tempindex: -1,
      itemplaymaxtwo: false,
      itemplayda: false,
      watchplay: false,
      playrecording: false,
      loadinitplay: false,
      recordhf:false,
    };
    return odata;
  },
  computed: {
    canshowcurerrormsg() {
      if (this.answers[this.cursentindex]) {
        if (this.answers[this.cursentindex].errormsg) {
          if (this.answers[this.cursentindex].errormsg.dp_msg) {
            if (this.answers[this.cursentindex].errormsg.dp_msg.length) {
              return true;
            }
          }
        }
      }
      return false;
    },
    iosplatform() {
      // return false;
      if (nativebridge.platform == "exsoftandroid") {
        return false;
      }
      if (nativebridge.platform == "miniprogram") {
        return false;
      }
      return true;
    }
  },
  created() {},
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

    let scrollWrap = this.$refs.curpeiyingwrap;
    scrollWrap.addEventListener("scroll", this.handleScroll, false);
  },
  destroyed() {
    if (this.timerid) {
      clearInterval(this.timerid);
    }
    this.stopallplay();
    this.stopallrecord();
    window.removeEventListener("scroll", this.handleScroll);
    this.removeEventListeners();
  },
  watch: {
    touchEnd: function(n, o) {
      // if (n) {
      //   // this.gotoel(this.toel, this.toelindex, this.scrollbox);
      //   if (!this.canmove) {
      //     this.gotoel(this.toel, this.toelindex, this.scrollbox);
      //   }
      // }
    },
    step: function(newValue, oldValue) {
      if (!newValue) {
        let appvideo = this.$refs.appvideo;
        this.srtlines[this.cursentindex].playing = false;
        this.canScrollevent = true;
        this.playrecording = false;
        appvideo.muted = false;
      }

      this.onstepchanged();
    },
    playbackRate: function(newValue, oldValue) {
      this.onplaybackrate();
    },
    initplay: function(newv, oldv) {
      if (newv) {
        let appvideo = this.$refs.appvideo;
        let sent = this.srtlines[this.cursentindex];
        let senttime = sent.startsec;
        let endttime = sent.endsec;
        appvideo.currentTime = senttime;
        appvideo.play();
        this.watchplay = true;
        if (this.step == "playrecord") {
          if (!this.hasplay) {
            this.ontimer();
          }
        }
      }
    }
    // cursentindex: function(newv, oldv) {
    //   if (newv) {
    //     let appvideo = this.$refs.appvideo;
    //     appvideo.play();
    //   }
    // }
    // scrollTop: function(newValue, oldValue) {
    //   console.log("watch", newValue);
    //   setTimeout(() => {
    //     if (newValue == this.$refs.curpeiyingwrap.scrollTop) {
    //       console.log("{{$mt('结束')}}");
    //       this.oldScrollTop = newValue;
    //     }
    //   }, 20);
    //   if (this.oldScrollTop == oldValue) {
    //     console.log("kais");
    //   }
    // }
  },
  methods: {
    //     errcodetrl(code){
    //     return '发'
    //     // switch(code){
    //     //     case
    //     // }
    // },
    hasresult(index) {
      if (this.answers[index]) {
        return true;
      }
      return false;
    },
    handleScroll() {
      if (!this.canScrollevent) return;
      clearTimeout(this.scrolltime);
      this.scrolltime = null;
      this.scrollCount = this.$refs.curpeiyingwrap.scrollTop;
      // console.log("{{$mt('滚动高度')}}", this.scrollCount);
      // console.log("========");
      this.scrolltime = setTimeout(() => {
        if (this.scrollCount == this.$refs.curpeiyingwrap.scrollTop) {
          let clientHeight = this.$refs.curpeiyingwrap.clientHeight;
          let scrollHeight = this.$refs.curpeiyingwrap.scrollHeight;
          // console.log("tingzi scroll");
          // console.log(" scrollCount", this.scrollCount);
          // console.log(" prescrollCount", this.prescrollCount);
          let scrollbox = this.$refs.curpeiyingwrap;
          let that = this;
          let toel = {};
          let index = 0;
          let fx = this.scrollCount - this.prescrollCount;
          for (let i = 0; i < this.$refs.peyiitem.length; i++) {
            let v = this.$refs.peyiitem[i];
            // console.log("el", i);
            // console.log("el offsetTop", v.offsetTop);
            //    console.log("el clientHeight", v.clientHeight);
            // if (v.offsetTop > this.scrollCount) {
            if (this.scrollCount > (v.offsetTop * 2 + v.clientHeight) / 2) {
              //  if (this.scrollCount > v.clientHeight / 2) {
              // toel.item = v;
              // toel.index = i;
              index = i;
              // alert(i);
            }
          }
          toel = this.$refs.peyiitem[index];
          if (this.scrollCount > (toel.offsetTop * 2 + toel.clientHeight) / 2) {
            //  if (this.scrollCount > toel.clientHeight / 2) {
            index += 1;
            toel = this.$refs.peyiitem[index];
            // alert("a2");
            if (
              // fx > 0 &&
              // this.scrollCount + clientHeight == scrollHeight
              scrollHeight > clientHeight &&
              this.scrollCount + clientHeight == scrollHeight
            ) {
              // alert('a3')
              index = this.$refs.peyiitem.length - 1;
              toel = this.$refs.peyiitem[index];
            }
          }
          console.log("el", toel);
          console.log("el index", index);
          // console.log("el offsetTop", toel.offsetTop);
          // return;
          let scrollcb = function() {
            if (that.hasplay) {
              that.setforcestep("listen");
            }
            that.prescrollCount = that.$refs.curpeiyingwrap.scrollTop;
            setTimeout(() => {
              that.canScrollevent = true;
            }, 10);
          };
          let option = {
            type: true,
            container: scrollbox,
            curtop: this.scrollCount,
            dis: 0,
            cb: scrollcb
          };
          let toscrolltop = toel.offsetTop;
          let dis = toscrolltop - this.scrollCount;
          // console.log('toscrolltop',toscrolltop);
          // console.log('this.scrollCount',this.scrollCount);
          // alert(dis)
          // return;
          if (dis > 0) {
            option.dis = dis - 15;
          } else {
            // console.log("toscrolltop", toscrolltop);
            // console.log("this.scrollCount", this.scrollCount);
            // console.log("dis", dis);
            option.type = false;
            option.dis = Math.abs(dis - 10);
          }
          this.canScrollevent = false;
          this.cursentindex = index;
          this.scrollAnimation(option);
        }
      }, 80);
      // console.log("scrollHeight", this.$refs.curpeiyingwrap.scrollHeight);
      // console.log("offsetHeight", this.$refs.curpeiyingwrap.offsetHeight);
      //   console.log(document.documentElement.clientHeight+'-----------'+window.innerHeight); // {{$mt('可视区域高度')}}
      //   console.log(document.body.scrollTop); // {{$mt('滚动高度')}}
      //   console.log(document.body.offsetHeight); // {{$mt('文档高度')}}
      // let scrollTop = this.$refs.curpeiyingwrap.scrollTop;
    },

    // handleScroll() {
    //   // console.log(this.$refs.curpeiyingwrap.scrollTop);
    //   if (!this.canScrollevent) return;
    //   clearTimeout(this.scrolltime);
    //   this.scrolltime = null;
    //   this.scrollCount = this.$refs.curpeiyingwrap.scrollTop;
    //   this.p = this.$refs.curpeiyingwrap.scrollTop;
    //   // console.log("{{$mt('滚动高度')}}", this.scrollCount);
    //   // console.log("========");
    //   let Orientation = true;
    //   if (this.t <= this.p) {
    //   } else {
    //     Orientation = false;
    //   }
    //   this.scrolltime = setTimeout(() => {
    //     let stopdesit = this.$refs.curpeiyingwrap.scrollTop;
    //     if (this.scrollCount == this.$refs.curpeiyingwrap.scrollTop) {
    //       let clientHeight = this.$refs.curpeiyingwrap.clientHeight;
    //       let scrollHeight = this.$refs.curpeiyingwrap.scrollHeight;
    //       // console.log("tingzi scroll");
    //       // console.log(" scrollCount", this.scrollCount);
    //       // console.log(" prescrollCount", this.prescrollCount);
    //       let scrollbox = this.$refs.curpeiyingwrap;
    //       let that = this;
    //       let toel = {};
    //       let index = 0;
    //       let fx = Math.abs(this.scrollCount - this.prescrollCount);
    //       for (let i = 0; i < this.$refs.peyiitem.length; i++) {
    //         let v = this.$refs.peyiitem[i];
    //         if (v.offsetTop > stopdesit) {
    //           index = i;
    //           // console.log("滚动距离", fx);
    //           // console.log("滚动距离 v.clientHeight", v.clientHeight);
    //           // console.log("滚动距离 scrollHeight", scrollHeight);
    //           // console.log(
    //           //   "滚动距离 this.scrollCount + clientHeight 和",
    //           //   this.scrollCount + clientHeight + 269
    //           // );
    //           if (!Orientation) {
    //             index--;
    //             if (fx < v.clientHeight / 3) {
    //               index++;
    //             }
    //             if (index == -1) {
    //               index = 0;
    //             }
    //           } else {
    //             if (fx < v.clientHeight / 3) {
    //               index--;
    //             }
    //           }
    //           toel = this.$refs.peyiitem[index];
    //           this.toel = toel;
    //           this.toelindex = index;
    //           this.scrollbox = scrollbox;
    //           this.canmove = true;
    //           this.gotoel(this.toel, this.toelindex, this.scrollbox);
    //           return;
    //         }
    //       }
    //       this.toel = this.$refs.peyiitem[this.$refs.peyiitem.length - 1];
    //       this.toelindex = this.$refs.peyiitem.length - 1;
    //       this.scrollbox = scrollbox;
    //       this.canmove = true;
    //       this.gotoel(this.toel, this.toelindex, this.scrollbox);
    //     }
    //   }, 100);
    //   setTimeout(() => {
    //     this.t = this.p;
    //   }, 0);
    //   // console.log("scrollHeight", this.$refs.curpeiyingwrap.scrollHeight);
    //   // console.log("offsetHeight", this.$refs.curpeiyingwrap.offsetHeight);
    //   //   console.log(document.documentElement.clientHeight+'-----------'+window.innerHeight); // {{$mt('可视区域高度')}}
    //   //   console.log(document.body.scrollTop); // {{$mt('滚动高度')}}
    //   //   console.log(document.body.offsetHeight); // {{$mt('文档高度')}}
    //   // let scrollTop = this.$refs.curpeiyingwrap.scrollTop;
    // },
    gotoel(toel, index, scrollbox) {
      let that = this;
      // if (!that.touchEnd) return;
      // console.log("index", index);
      // console.log("aaa index", index);
      // console.log("aaa toel", toel);
      // console.log("aaa offsetTop", toel.offsetTop);
      let scrollcb = function() {
        if (that.hasplay) {
          that.setforcestep("listen");
        }
        that.prescrollCount = that.$refs.curpeiyingwrap.scrollTop;
        setTimeout(() => {
          that.canScrollevent = true;
          that.canmove = false;
          that.touchEnd = false;
        }, 10);
      };
      let option = {
        type: true,
        container: scrollbox,
        curtop: this.scrollCount,
        dis: 0,
        cb: scrollcb
      };
      let toscrolltop = toel.offsetTop;
      let dis = toscrolltop - this.scrollCount;
      // console.log('toscrolltop',toscrolltop);
      // console.log('this.scrollCount',this.scrollCount);
      // alert(dis)
      // return;
      if (dis > 0) {
        option.dis = dis - 15;
      } else {
        // console.log("toscrolltop", toscrolltop);
        // console.log("this.scrollCount", this.scrollCount);
        // console.log("dis", dis);
        option.type = false;
        option.dis = Math.abs(dis - 10);
      }
      this.canScrollevent = false;
      this.cursentindex = index;
      console.log("cursentindex", this.cursentindex);
      this.scrollAnimation(option);
    },
    scrollAnimation(obj, sp = 5) {
      let that = this;
      let time = setInterval(function() {
        if (obj.dis <= 0) {
          clearInterval(time);
          if (obj.cb) {
            obj.cb();
          }
          return;
        }
        obj.dis -= sp;
        if (obj.type) {
          obj.container.scrollTop = obj.curtop += sp;
        } else {
          obj.container.scrollTop = obj.curtop -= sp;
        }
      }, 10);
    },
    goBack() {
      if (this.seeResult) {
        this.seeResult = false;
        return;
      }
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
        console.log("");
        this.recordobj.stop();
        this.currecordfile = this.recordobj.path;
        this.recordobj = null;
      }
    },
    itemrecsp(index) {
      let sp = this.srtlines[index].speed;
      if (sp == 100) {
        sp = 60;
      } else {
        sp = 100;
      }
      this.srtlines[index].speed = sp;
      this.playbackRate = sp;
    },
    playhistory(cindex) {
      this.recordhf=false;
      this.cursentindex = cindex;
      for (let v of this.srtlines) {
        v.playing = false;
      }
      this.srtlines[cindex].playing = true;
      if (this.answers[cindex]) {
        this.currecordfile = this.answers[cindex].recordfile;
        if (this.hasplay) {
          this.setforcestep("playrecord");
        } else {
          this.itemplaylisten(cindex, true);
          setTimeout(() => {
            let appvideo = this.$refs.appvideo;
            appvideo.pause();
            this.itemplaylisten(cindex, true);
            this.setforcestep("playrecord");
          }, 100);
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
          let senttime = sent.startsec;
          appvideo.muted = true;
          if (senttime > appvideo.duration) {
            for (let i = this.cursentindex; i > -1; i--) {
              let v = this.srtlines[i];
              if (v.startsec < appvideo.duration) {
                senttime = v.startsec;
              }
            }
          }
          appvideo.currentTime = senttime;
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
        this.playbackRate = this.srtlines[this.cursentindex].speed;
        let appvideo = this.$refs.appvideo;
        let sent = this.srtlines[this.cursentindex];
        let senttime = sent.startsec;
        console.log("mediaplaying peiying {{$mt('多少')}}", sent);

        if (senttime > appvideo.duration) {
          console.log("mediaplaying peiying  max>>>  duration", sent);
          for (let i = this.cursentindex; i > -1; i--) {
            let v = this.srtlines[i];
            if (v.startsec < appvideo.duration) {
              senttime = v.startsec;
            }
          }
        }
        appvideo.muted = false;
        if (this.muted) {
          appvideo.muted = true;
        }
        appvideo.currentTime = senttime;
        appvideo.play();
      }
      if (step == "playrecord") {
        if (this.currecordfile) {
          this.playobj = nativeobject.newplay({
            path: this.currecordfile
            // onplaystart: domuteplay
          });
          if(this.recordhf){
            this.playobj.onplaystart=domuteplay;
          }
          this.playobj.play();
          if (!this.recordhf) {
            domuteplay();
          }
        }
      }
      if (step == "stoprecord") {
        this.recordhf = true;
        //! tudo. {{$mt('打分请求')}}
        //! {{$mt('回放录音')}}
        this.step = "playrecord";
        let sindex = this.cursentindex;
        let scorecb = (ncode, score, errormsg = null) => {
          console.log("scorecb errormsg", errormsg);
          if (sindex == this.cursentindex) {
            if (ncode != 0) {
              let desc =
                this.$mt("打分失败") + "，" + this.$mt("错误码") + "：" + ncode;
              this.scoredesc = desc;
              this.curscore = 0;
              if (process.env.NODE_ENV != "development") {
                xunliancommon.saveresult(
                  this,
                  this.cursentindex,
                  score,
                  this.currecordfile,
                  errormsg
                );
              }
            } else {
              this.scoredesc = score;
              this.curscore = score;
              // if (process.env.NODE_ENV != "development") {
              xunliancommon.saveresult(
                this,
                this.cursentindex,
                score,
                this.currecordfile,
                errormsg
              );
              // }
              xunliancommon.cachelocal(
                this.currecordfile,
                sindex,
                score,
                this,
                errormsg
              );
              let el = this.$refs.peyiitem[this.cursentindex].querySelector(
                ".subtitle"
              );
              common.replacetext(el, errormsg);
            }
            this.answers[sindex].score = score;
            this.answers[sindex].errormsg = errormsg;
            console.log("this.cursentindex", this.cursentindex);
          }
        };
        if (!this.answers[sindex]) {
          this.answers[sindex] = {};
        }
        this.answers[sindex].recordfile = this.currecordfile;
        this.scoredesc = this.$mt("打分中") + "...";
        let moindex = this.lang == "en_us" ? sindex : sindex;
        if (process.env.NODE_ENV == "development") {
          xunliancommon.modata(this.lang, moindex);
        }
        xunliancommon.dowavscore(
          this,
          this.currecordfile,
          // this.srtlines[sindex].subtitle,
          this.$refs.peyiitem[sindex].querySelector(".subtitle").innerText,
          this.lang,
          scorecb
        );
      }
    },
    firstloadFn(senttime, video, set) {},
    getLimitTimeMSec() {
      let sline = this.srtlines[this.cursentindex];
      let limittime = sline.endsec - sline.startsec;
      //! {{$mt('加上速度的变量')}}
      limittime /= this.playbackRate / 100;
      //! cjy: {{$mt('加上半秒钟的播放器误差')}}
      limittime += 0.5;
      limittime *= 2; //! {{$mt('最多')}}2{{$mt('倍时间')}}
      if (limittime > 0) {
        if (limittime < 3) {
          limittime = 3;
        }
      } else {
        limittime = 60; //! {{$mt('时间异常')}}； {{$mt('赋予一个比较大的时间')}}
      }
      return limittime * 1000;
    },
    ontimer() {
      let appvideo = this.$refs.appvideo;
      this.durationtime = this.toMs(appvideo.duration);
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
        //! {{$mt('如果是录制或录制播放')}}，{{$mt('给予一定的延迟时间')}}，{{$mt('方便录制完')}}
        if (this.step == "record" || this.step == "playrecord") {
          delay = 0.1;
        }
        let cmptime = appvideo.currentTime - delay;
        if (cmptime >= sline.endsec) {
          console.log("timer step pause:" + this.step);
          appvideo.pause();
          if (this.step == "listenrecord") {
            // this.step = "record";
          } else if (this.step != "record") {
            this.step = "";
          } else if (this.step == "record") {
            this.step = "stoprecord"; //! {{$mt('同步停止录音')}}
            sline.recordPro = 100;
          } else if (this.step == "playrecord") {
            this.step = "";
          }
        }
        this.listenprodes = this.toMs(cmptime);
        this.listenprobar = (cmptime / appvideo.duration) * 100;
        if (this.step == "record") {
          sline.recordPro =
            ((cmptime - sline.startsec) / (sline.endsec - sline.startsec)) *
            100;
        }
      }
      if (this.step == "record") {
        //! {{$mt('自动停止录音')}}; {{$mt('防止网页版')}}ios{{$mt('安全限制')}}，{{$mt('不能非')}}click{{$mt('播放的场景')}}
        if (this.recordobj) {
          let limittime = this.getLimitTimeMSec();
          if (this.recordobj.getRecordTimeMs() >= limittime) {
            this.step = "stoprecord";
          }
        }
      } else if (this.step == "playrecord") {
        if (this.playobj) {
          let limittime = this.getLimitTimeMSec();
          if (this.playobj.getPlayTimeMs() >= limittime) {
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

        //! cjy: {{$mt('预先加载播放')}}，{{$mt('防止')}}android{{$mt('的第一句不能设置到正确的起始时间点')}}
        appvideo.muted = true;
        appvideo.play();
        setTimeout(() => {
          appvideo.pause();
          console.log("video{{$mt('总时间')}}", appvideo.duration);
          this.addEventListeners();
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
    onanswerloaded(maxsentindex) {
      if (this.serverparams.readonly) {
      } else {
        if (maxsentindex == this.srtlines.length - 1) {
          maxsentindex--;
        }
        this.canScrollevent = false;
        this.dosent(maxsentindex + 1, true);
        let scrollbox = this.$refs.curpeiyingwrap;
        let toel = this.$refs.peyiitem[maxsentindex + 1];
        scrollbox.scrollTop = toel.offsetTop - 15;
        setTimeout(() => {
          this.canScrollevent = true;
        }, 200);
      }
    },
    present() {
      let li = this.cursentindex - 1;
      this.dosent(li);
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
      this.answers[this.cursentindex].score = this.curscore;

      console.log("answers", this.answers);
    },
    curplaystate() {
      console.log("{{$mt('自定义播放')}} this.cursentindex", this.cursentindex);
      if (this.step == "listen") return;
      this.itemplaylisten(this.cursentindex);
      // if (this.step == "listen") {
      //   let appvideo = this.$refs.appvideo;
      //   if (!appvideo.paused) {
      //     appvideo.pause();
      //   } else {
      //     appvideo.play();
      //   }
      // } else if (this.step == "") {
      //   this.setforcestep("listen");
      // }
    },
    itemplaylisten(index, muted = false) {
      this.nativeplay = false;
      this.listenclick = true;
      this.cursentindex = index;
      this.muted = muted;
      if (!this.canScrollevent) {
        // this.$message({
        //   message: "{{$mt('录音中')}}，{{$mt('请等待')}}",
        //   type: "warning"
        // });
        // return;
      }
      if (index == this.cursentindex) {
        this.setforcestep("listen");
        return;
      }
      return;
      let that = this;

      let scrollbox = this.$refs.curpeiyingwrap;
      let curscTop = scrollbox.scrollTop;
      let toel = this.$refs.peyiitem[index];
      let scrollcb = function() {
        that.setforcestep("listen");
        setTimeout(() => {
          that.canScrollevent = true;
        }, 10);
      };
      let option = {
        type: true,
        container: scrollbox,
        curtop: curscTop,
        dis: 0,
        cb: scrollcb
      };

      let toscrolltop = toel.offsetTop;
      let dis = toscrolltop - curscTop;
      option.dis = dis - 15;
      this.canScrollevent = false;
      this.scrollAnimation(option);
    },
    itemrecord(index) {
      if (process.env.NODE_ENV != "development") {
        if (nativebridge.apiversion < 1) {
          let msg = this.$mt("请在最新版APP中使用录音");
          if (nativebridge.platform == "miniprogram") {
            msg = this.$mt("小程序中无法使用录音功能") + "，" + msg;
          }
          MessageBox({
            title: this.$mt("提示"),
            message: msg,
            confirmButtonText: this.$mt("确定")
          }).then(() => {});
          return;
        }
      }
      if (!this.hasplay) {
        this.$message({
          message: this.$mt("请先播放一遍原音"),
          type: "warning"
        });
        return;
      }
      if (this.step == "record") {
        this.step = "stoprecord";
        return;
      }
      this.canScrollevent = false;
      this.playbackRate = this.srtlines[index].speed;
      this.cursentindex = index;
      for (let v of this.srtlines) {
        v.playing = false;
      }
      this.srtlines[index].playing = true;
      this.setforcestep("record");
    },
    dosent(sentindex, first = false) {
      if (sentindex < 0 || sentindex >= this.srtlines.length) {
        return;
      }

      if (this.cursentindex != sentindex) {
        this.savecurwrite();
        //！ {{$mt('赋值历史答案')}}
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
      if (!first) {
        this.setforcestep("listenrecord");
      }
    },
    setforcestep(step, bforce = true) {
      console.log("setforcestep>>>", this.step);
      if (this.step == step) {
        if (bforce) {
          this.onstepchanged(); //! {{$mt('强制重新开始')}}
        }
      } else {
        this.step = step;
      }
    },
    loadsrt() {
      this.$http
        .get(this.srturl)
        .then(res => {
          let vsrt = new Srt(res.data);
          for (let i = 0; i < vsrt.lines.length; i++) {
            let v = vsrt.lines[i];
            v.subtitle = v.subtitle.replace(
              /[\s!！#$%&(（)）,，, :* 、.。;；？@[\]^_`{}~‘’“”《》￥【】+=|·…]/g,
              " "
            );
            v.speed = 100;
            v.recordPro = 0;
            v.playing = false;
            v.showdetail = false;
            // v.isplayrecord = false;
            // v.isrecord = false;
          }
          this.srtlines = vsrt.lines;
          console.log(this.srtlines);

          xunliancommon.xunlianready(this);
        })
        .catch(res => {
          this.$message.error(
            this.$mt("打开字幕失败") + "，" + this.$mt("无法训练")
          );
        });
    },
    pyTouchStart(event) {
      this.touchStartPoint = event.targetTouches[0].pageY;
      this.distance = 0;
      this.scrollCount = this.$refs.curpeiyingwrap.scrollTop;
    },
    pyTouchMove(event) {
      if (event.targetTouches.length > 1) {
        return;
      }
      this.distance = this.touchStartPoint - event.targetTouches[0].pageY;
      // if (this.distance <= 0 && !this.scrollCount) {
      //   return;
      //
      // console.log(this.distance);
      if (this.distance > 0) {
        this.$refs.curpeiyingwrap.scrollTop = this.distance + this.scrollCount;
      } else {
        this.$refs.curpeiyingwrap.scrollTop =
          this.scrollCount - Math.abs(this.distance);
      }
    },

    pyTouchEnd(event) {
      this.touchEnd = true;
      this.canmove = !this.canmove;
      return;

      if (!this.distance) return;
      if (this.distance <= 0 && !this.scrollCount) {
        return;
      }
      let that = this;
      // this.scrollCount += this.distance;
      // if (this.scrollCount <= 0) {
      //   this.scrollCount = 0;
      // }
      // console.log("=======");
      // console.log("{{$mt('距离')}}", this.distance);
      let scrollbox = this.$refs.curpeiyingwrap;
      let curscTop = scrollbox.scrollTop;
      let preEl = this.$refs.peyiitem[this.cursentindex - 1];
      let curEl = this.$refs.peyiitem[this.cursentindex];
      let nextEl = this.$refs.peyiitem[this.cursentindex + 1];
      let scrollcb = function() {
        that.setforcestep("listen");
      };
      let option = {
        type: true,
        container: scrollbox,
        curtop: curscTop,
        dis: 0,
        cb: scrollcb
      };
      if (this.distance > 0) {
        if (this.distance > curEl.clientHeight / 2) {
          let nextscrolltop = nextEl.offsetTop;
          let dis = nextscrolltop - curscTop;
          option.dis = dis;
          this.scrollAnimation(option);
          this.cursentindex++;
        } else {
          option.type = false;
          option.dis = this.distance;
          this.scrollAnimation(option);
        }
      } else {
        if (Math.abs(this.distance) > preEl.clientHeight / 2) {
          let pretscrolltop = preEl.offsetTop;
          let dis = curscTop - pretscrolltop;
          option.type = false;
          option.dis = dis;
          this.scrollAnimation(option);
          this.cursentindex--;
        } else {
          option.dis = Math.abs(this.distance);
          this.scrollAnimation(option);
        }
      }
      this.touchStartPoint = 0;
    },
    // pyresultwrapscorll(ty) {
    //   let pyresultwrap = this.$refs.pyresultwrap;
    //   let index = this.cursentindex;
    //   if (ty) {
    //     index += 1;
    //   } else {
    //     index -= 1;
    //   }
    //   let netEl = this.$refs.resitem[index];
    //   pyresultwrap.scrollTop = netEl.offsetTop;
    // },
    parseplaytime(s) {
      if (!s) {
        return 0;
      }
      let sv = parseFloat(s);
      if (isNaN(sv)) {
        return 0;
      }
      if (sv < 0) {
        return 0;
      }
      return Math.floor(sv * 10) / 10;
    },
    toMs(time) {
      var m = Math.floor(time / 60);
      m = m > 9 ? m : "0" + m;
      var s = Math.floor(time % 60);
      s = s > 9 ? s : "0" + s;
      return m + ":" + s;
    },
    addEventListeners() {
      const self = this;
      self.$refs.appvideo.addEventListener("play", self.mediaplaying);
      self.$refs.appvideo.addEventListener("ended", self.mediaEndplay);
      self.$refs.appvideo.addEventListener("timeupdate", self._currentTime);
    },
    removeEventListeners() {
      const self = this;
      self.$refs.appvideo.addEventListener("play", self.mediaplaying);
      self.$refs.appvideo.addEventListener("ended", self.mediaEndplay);
      self.$refs.appvideo.addEventListener("timeupdate", self._currentTime);
    },
    watchcurplaytime() {
      let appvideo = this.$refs.appvideo;
      let currentTime = appvideo.currentTime;
      let sent = this.srtlines[this.cursentindex];
      let senttime = sent.startsec;
      let endttime = sent.endsec;
      if (!this.initplay) {
        if (currentTime > 0.1) {
          console.log("设置时间");
          this.initplay = true;
        }
      }
      if (this.watchplay && currentTime > endttime) {
        this.nativeplay = true;

        // appvideo.pause();
        // appvideo.currentTime = senttime;
        this.hasplay = true;
        this.watchplay = false;
        this.initplay = false;
      }
    },
    _currentTime() {
      if (!this.hasplay) {
        this.watchcurplaytime();
      }
    },
    mediaplaying() {
      // let videowrap = this.$refs.videowrap;
      // videowrap.classList.add("playing");
      let appvideo = this.$refs.appvideo;
      appvideo.classList.add("active");
      if (!this.step) {
        appvideo.muted = false;
        if (!this.hasplay) {
          this.initplay = false;
          return;
        }
        this.itemplaylisten(this.cursentindex);
      }
    },
    mediaEndplay() {
      console.log("appvideoend>>>>");
      this.$refs.appvideo.pause();
      let sline = this.srtlines[this.cursentindex];
      if (this.step == "listenrecord") {
      } else if (this.step != "record") {
        this.step = "";
      } else if (this.step == "record") {
        this.step = "stoprecord"; //! {{$mt('同步停止录音')}}
        sline.recordPro = 100;
      } else if (this.step == "playrecord") {
        this.step = "";
      }
    },
    errordetail(oneitem, i) {
      if (this.answers[i].errormsg) {
        if (this.answers[i].errormsg.dp_msg) {
          if (!this.answers[i].errormsg.dp_msg.length) {
            return;
          }
        }
      }
      this.curerrdpMsg = this.answers[i].errormsg;
      this.showerrdetail = true;
      this.showmark = true;
      console.log(this.answers[i]);
    },
    closeerrmsg() {
      this.showerrdetail = false;
      this.showmark = false;
    },
    showerrormsg(index) {
      if (this.answers[index]) {
        if (this.answers[index].errormsg) {
          if (this.answers[index].errormsg.dp_msg) {
            if (this.answers[index].errormsg.dp_msg.length) {
              return true;
            }
          }
        }
      }
      return false;
    }
  },
  components: {
    //Xgplayer
  }
};
</script>

<style>
.mint-header {
  background: #fff !important;
  color: #000 !important;
}
.mint-header-button.is-left {
  color: #0089ff !important;
}
.mint-header {
  position: fixed !important;
  width: 100% !important;
  left: 0 !important;
  top: 0 !important;
}
#app {
  height: 93%;
  padding-top: 50px;
  position: fixed;
  width: 100%;
  left: 0;
  top: 0;
  overflow: hidden;
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
  cjy; {{$mt('使用')}}block{{$mt('会使得')}}scroll{{$mt('的计算不正常')}}
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
  width: 0% !important;
  height: 211px !important;
  object-fit: contain;
}
.appvideo.active {
  width: 100% !important;
}
.appvideo.active + .curvideostate {
  background: none;
}
.appvideo.active + .curvideostate .states {
  display: none;
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
.curvideostate {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: #000;
}
.states {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
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
  height: 6px;
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
  position: relative;
  /* margin: 0 10px; */
  height: calc(100vh - 265px);
  overflow: scroll;
  /* overflow: hidden; */
}
.curpeiying-wrap .seeres {
  position: fixed;
  bottom: 0;
  left: 50%;
  text-align: center;
  z-index: 11;
  transform: translate(-50%, 0);
  padding: 12px 35px;
}
.curpeiying-wrap .sitem {
  position: relative;
  box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.16);
  border-radius: 10px;
  padding: 10px 5px 0;
  margin: 15px 10px;
  background: #fff;
  height: 229px;
  min-height: 229px;
}
.curpeiying-wrap .sitem:last-child {
  margin-bottom: 269px;
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
  margin: 0 3px;
}
.curpeiying-wrap .len {
  color: #5d5d5d;
}
.curpeiying-wrap .subtitle {
  width: calc(100% - 30px);
  position: absolute;
  font-size: 24px;
  padding: 20px 10px;
  margin: 0;
  word-break: break-all;
  height: 148px;
  height: calc(100% - 131px);
  overflow-y: auto;
}
.curpeiying-wrap .controls {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  border-top: 1px solid #ccc;
  padding: 0;
  position: absolute;
  width: 100%;
  bottom: 0;
  left: 0;
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
}
.curpeiying-wrap .controls .play.act {
  position: relative;
  background: #0089ff;
}
.curpeiying-wrap .controls .play.dasbel {
  background: #999;
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
  height: 6px;
  border-radius: 3px;
}
.curpeiying-wrap .controls .progress-bar .bar {
  position: absolute;
  max-width: 100%;
  height: 100%;
  border-radius: 3px;
  background: #0089ff;
}
/*peiying-result-wrap */
.peiying-result-wrap {
  position: relative;
  overflow: hidden;
  height: calc(100vh - 385px);
}
.peiying-result-wrap .sitem {
  position: relative;
  margin: 0;
  padding: 15px;
  display: flex;
  align-items: center;
}
.peiying-result-wrap .sitem.act {
  background: #ffdeb8;
  font-size: 24px;
  color: #633500;
}
.zm {
  text-align: center;
  background: #e6ecf2;
  margin: 0;
  padding: 2px 0;
}
.playrecord-img {
  width: 33px;
  height: 33px;
}
.pyhf2 {
  position: relative;
  display: inline-block;
  width: 33px;
  height: 33px;
  margin: 0;
}
.pyhf2 a {
  position: absolute;
  left: 50%;
  top: 50%;
  color: #fff;
  transform: translate(-50%, -50%);
  font-size: 12px;
  font-weight: bold;
}
.btnss {
  width: 100px;
}
.btnss .pyhfimg {
  float: left;
}

.btnss .luying {
  float: right;
}
.luying-wrap .luying.tz {
  width: 40px;
  height: 40px;
}
.btnss > * {
  margin: 0 5px;
}

.scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

::-webkit-scrollbar {
  display: none;
}
.overflow-scroll {
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
}
/* video::-webkit-media-controls-overlay-play-button {
  display: none !important;
} */
video::-webkit-media-controls {
  display: none !important;
}
.errred {
  color: #f00 !important;
}
.qitusens {
  display: inline-block;
  width: 22px;
  height: 22px;
  position: absolute;
  top: -5px;
  left: -26px;
  border: 1px solid #ccc;
  border-radius: 50%;
  text-align: center;
  background: #fdf0dc;
  color: #ef9376;
}
.qitusens.act {
  top: 0;
}
.errmsg-wrap {
  position: absolute;
  width: 70%;
  height: 150px;
  margin: 0 auto;
  left: 50%;
  top: -100%;
  opacity: 0;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 8px;
  transition: all 0.4s;
  transform: translate(-50%, -50%);
}
.errmsg-wrap.show {
  top: 55%;
  opacity: 1;
  z-index: 10;
}
.errmsg-wrap .tit {
  width: calc(100% - 20px);
  border-bottom: 1px solid #ccc;
}
.tit .sm {
  font-size: 14px;
  color: #ff8900;
}
.tit .emsg {
  font-size: 12px;
}
.msgclose {
  position: absolute;
  right: 3px;
  top: 5px;
  width: 20px;
  height: 20px;
  border: 1px solid #ccc;
  border-radius: 50%;
  text-align: center;
  color: #ccc;
}
.errmsg-wrap .content {
  width: 100%;
  height: calc(100% - 32px);
  word-break: break-all;
  overflow: scroll;
}
.errmsg-wrap .content .msg-item {
  padding: 5px;
  border-bottom: 1px dashed #ccc;
}
.errmsg-wrap .content .msg-item p {
  margin: 0;
}
.errmsg-wrap .content .cn {
  color: #f00;
  font-size: 20px;
}
.msg-item p .cn b {
  color: #000;
}
.errmsg-wrap .content .cn .msg {
  color: #848484;
  font-size: 14px;
}
.msg-item p .msg {
  /* display: block; */
  padding-left: 10px;
  color: #666;
  font-size: 14px;
}
.mark {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1;
}
.mark {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1;
}
.starimg {
  position: relative;
  width: 24px;
  height: 24px;
  display: inline-block;
}
.starimg.ban::after {
  position: absolute;
  width: 100%;
  height: 100%;
  content: "";
  left: 13px;
  top: 0;
  background: #f0f0f0;
}
.starimg.ban.backf::after {
  background: rgba(255, 255, 255, 0.6);
}
</style>
