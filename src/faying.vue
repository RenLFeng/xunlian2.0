<template>
  <div id="app">
    <mt-header :title="$mt(serverparams.headername)">
      <mt-button slot="left" icon="back" @click="goBack()">{{$mt('返回')}}</mt-button>
      <mt-button slot="right" @click="viewresult">{{$mt('成绩单')}}</mt-button>
    </mt-header>

    <!--
      controls="controls"
    -->
    <div class="main mymain" style="background:#f0f0f0">
      <!-- <div ref="aa">
        I am 20 years old,
        and I'm a student.
      </div>-->
      <div
        class="top"
        ref="carwarp"
        v-on:touchstart="pyTouchStart"
        v-on:touchmove="pyTouchMove"
        v-on:touchend="pyTouchEnd"
      >
        <!-- <div class="content">{{curtext}}</div> -->
        <!-- <div
          class="content"
          id="carousel"
          v-on:touchstart="pyTouchStart"
          v-on:touchmove="pyTouchMove"
          v-on:touchend="pyTouchEnd"
        >-->
        <div
          class="item"
          :class="{}"
          ref="caritem"
          v-for="(oneitem,selindex)  in tempsrtlines"
          :key="selindex"
          :style="`z-index:${tempsrtlines.length-selindex}`"
        >
          <!-- <span>index:{{selindex}}</span> -->
          <div class="content-text subtitle" v-html="oneitem.subtitle"></div>
        </div>
        <!-- <el-carousel
            :initial-index="carindex"
            :autoplay="false"
            ref="car"
            @change="onchange"
            arrow="never"
          >
            <el-carousel-item
              v-for="(oneitem,selindex)  in srtlines"
              :key="selindex"
              ref="caritem"
              :id="`caritem${selindex}`"
            >
              <h3>{{oneitem.subtitle}}</h3>
            </el-carousel-item>
        </el-carousel>-->
        <!-- </div> -->
        <p class="click-controls" v-if="windowsplat && !bshowresult">
          <span class="pre" @click="clicktoxunlian(false)">{{$mt('上一个')}}</span>
          <span class="next" @click="clicktoxunlian(true)">{{$mt('下一个')}}</span>
        </p>
      </div>
      <div class="bot">
        <div class="scoretit">
          <el-tag class="len">{{cursentindex+1}}/{{srtlines.length}}</el-tag>
          <span class="star">
            <span>
              <p v-if="scoredesc!=curscore">{{scoredesc}}</p>
              <span v-else @click.stop="errordetail({},cursentindex)">
                <span v-if="answers[cursentindex]&& curscore<(avscore/2)">{{$mt('%s分',[0])}} </span>
                <span v-for="(v,i) in starScore(curscore)" :key="i" class="starimg">
                  <img src="./assets/star.svg" />
                </span>
                <span class="starimg ban curbackf" v-if="showbanstar(curscore)">
                  <img src="./assets/star.svg" />
                </span>
                <!-- v-if="answers[cursentindex]&&answers[cursentindex].score<100" -->
                <a class="qitusens" style="left:-29px;top:0" v-if="showerrormsg(cursentindex)">?</a>
              </span>
            </span>
          </span>
        </div>
        <div class="kouyudisplay">
          <div>
            <div v-if="step=='record'">{{$mt('录音中')}}，{{$mt('请朗读')}}</div>
            <div v-else-if="step=='playrecord'">{{$mt('录音回放中')}}</div>
            <div v-else>{{$mt('请点击按钮开始训练')}}..</div>
          </div>
          <div class="btns">
            <a>
              <img src="./assets/fyhf.png" v-if="step=='playrecord'" class="btnimg" />

              <img v-else src="./assets/fyplayd.png" class="btnimg" @click="playcurrec" />
              <span>{{$mt('回放')}}</span>
            </a>
            <a @click=" itemrecord()">
              <img
                v-if="step=='record'"
                src="./assets/fyreing.png"
                class="btnimg"
                @click="step='record'"
              />
              <img v-else src="./assets/fyre.png" class="btnimg" />
              <span>{{recordtxt}}</span>
            </a>
            <!-- <el-button @click="pre">{{$mt('上一句')}}</el-button>
            <el-button @click="nex">{{$mt('下一句')}}</el-button>-->
          </div>
        </div>
        <!-- 
        <div style="text-align:center">
          <el-button @click="step='playrecord'">{{$mt('回放录音')}}</el-button>
          <el-button type="warning" class @click="step='stoprecord'" v-if="step=='record'">{{$mt('停止录音')}}</el-button>
          <el-button type="primary" @click="step='record'" v-else>{{$mt('开始录音')}}</el-button>
        </div>-->
        <!-- <div style="text-align:center">
          <el-button @click="present">{{$mt('上一句')}}</el-button>
          
          <el-button @click="repeat">{{$mt('重复当前句')}}</el-button>
         
          <el-button @click="nextsent">{{$mt('下一句')}}</el-button>
        </div>-->
      </div>
    </div>
    <el-container class="appcontainer" v-if="false">
      <el-header class="appheader">
        <div class="appvideo xunliantext">
          <div class="intable">
            <div class="intablecell">{{curtext}}</div>
          </div>
        </div>
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
        </div>
        <div class="kouyudisplay">
          <div v-if="step=='record'">{{$mt('录音中')}}，{{$mt('请朗读')}}</div>
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
          >{{$mt('录音')}}</el-button>
          <el-button type="primary" @click="step='record'" v-else>{{$mt('开始录音')}}</el-button>
        </div>
      </el-main>

      <el-footer class="appfooter">
        <div style="text-align:center">
          <el-button @click="present">{{$mt('上一句')}}</el-button>
          <!--
          <el-button @click="repeat">{{$mt('重复当前句')}}</el-button>
          -->
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
        <mt-button
          slot="left"
          icon="back"
          @click="serverparams.readonly?goBack():bshowresult=false;"
        >{{$mt('返回')}}</mt-button>
      </mt-header>
      <div class="listContainer">
        <div style="width:100%;height:100%;overflow:scroll" class="scrolling-scroll">
          <el-card class="box-card" v-for="(oneitem,selindex) in srtlines" v-bind:key="selindex">
            <div v-if="typeof answers[selindex] != 'undefined'">
              <p class="titscore" :class="!showerrormsg(selindex)?'act':''">
                <!-- {{$mt('分数')}}：
                <el-tag>{{answers[selindex].score}}</el-tag>-->

                <span class="star" @click.stop="errordetail(oneitem,selindex)">
                  <span v-for="v in starScore(answers[selindex].score)" :key="v" class="starimg">
                    <img src="./assets/star.svg" alt />
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
                <span v-if="answers[selindex].score<(avscore/2)" style>{{$mt('%s分',[0])}}</span>
                <span class="len">{{selindex+1}}/{{srtlines.length}}</span>
              </p>
              <div class="reshf-warp">
                {{$mt('录音回放')}}
                <img
                  src="./assets/reshfing.png"
                  v-if="oneitem.playrecord && step =='playrecord'"
                  class="reshfimg"
                />
                <img
                  v-else
                  src="./assets/reshf.png"
                  class="reshfimg"
                  @click="playhistory(selindex)"
                />
                <!-- <el-button @click="playhistory(selindex)">{{$mt('播放录音')}}</el-button> -->
              </div>
              <div class="resanswer">
                <span class="tit">{{$mt('标准答案')}}</span>
                <p class="content" v-html="oneitem.subtitle"></p>
              </div>
            </div>
            <div v-else>{{selindex+1}}{{$mt('未录音')}}</div>
          </el-card>
        </div>
      </div>
    </mt-popup>
    <div class="mark" v-if="showmark" @click="closeerrmsg()"></div>
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
  </div>
</template>

<script>
import HelloWorld from "./components/HelloWorld.vue";

import Srt from "@/srt";
import xunliancommon from "@/xunliancommon";
import common from "@/common";

import nativebridge from "@/nativebridge";
import nativeobject from "@/nativeobject";
import { MessageBox } from "mint-ui";
export default {
  name: "Faying",
  data() {
    let odata = {
      starScore: common.starScore,
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
      scoredesc: "",

      playobj: null, //!  {{$mt('当前播放')}}
      recordobj: null, //! {{$mt('当前')}}record
      currecordfile: "",
      curscore: 0,
      curtext: "",
      lang: "en_us", //! {{$mt('语系')}}
      backaction: "",

      serverparams: {}, //! {{$mt('服务器参数')}}；{{$mt('用于提交和保存')}}
      touchStartPoint: 0,
      distance: 0,
      curitem: {},
      carindex: 0,
      cureditItem: {
        playrecord: false
      },
      rotatenum: 0,
      canmove: true,
      preitemstates: false,
      tempsrtlines: [],
      setscore: false,
      initload: true,
      showerrdetail: false,
      showmark: false,
      curerrdpMsg: {
        dp_msg: []
      },
      errcodetrl: common.errcodetrl,
      showbanstar: common.showbanstar,
      avscore:33
    };
    return odata;
  },
  mounted() {
    // this.$nextTick(() => {
    //   // console.log(this.$refs.aa);
    //   common.replacetext(this.$refs.aa, {
    //     except_info: "28676",
    //     dp_msg: [
    //       {
    //         global_index: 2,
    //         content: "20",
    //         dp_message: "20786"
    //       },
    //        {
    //         global_index: "4",
    //         content: "old",
    //         dp_message: "20786"
    //       },
    //        {
    //         global_index: "5",
    //         content: "and",
    //         dp_message: "20786"
    //       },
    //          {
    //         global_index: "6",
    //         content: "i'm",
    //         dp_message: "20786"
    //       },
    //          {
    //         global_index: "8",
    //         content: "student",
    //         dp_message: "20786"
    //       },
    //            {
    //         global_index: "10",
    //         content: "",
    //         dp_message: "20786"
    //       }
    //     ]
    //   });
    // });

    this.srturl = "http://192.168.40.104:8875/v2.srt";
    this.videourl = "http://192.168.40.104:8875/v2.mp4";
    this.srturl = common.getDomainUrl() + "/v2.srt";
    this.videourl = common.getDomainUrl() + "/v2.mp4";
    xunliancommon.parseUrlArg(this, null, "faying");
    this.loadsrt();
    this.starttimer();
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
      if (!newValue) {
        if (this.cureditItem.playrecord) {
          this.cureditItem.playrecord = false;
        }
      }
      this.onstepchanged();
    },
    cursentindex: function(newv, oldv) {
      this.carindex = newv;
      // this.setcurerrormsg(this.carindex);
    },
    bshowresult: function(newv, oldv) {
      if (!newv) {
        if (!this.serverparams.readonly) {
          console.log("bshowresult", this.serverparams);
          let sentindex = this.cursentindex;
          let cfile = "";
          if (this.answers[sentindex]) {
            cfile = this.answers[sentindex].recordfile;
            let score = this.answers[sentindex].score;
            this.curscore = score;
            this.scoredesc = score;
          } else {
            this.curscore = 0;
            this.scoredesc = "";
          }
          this.currecordfile = cfile;
          console.log("999", this.currecordfile);
        }
        this.stopallplay();
        this.stopallrecord();
        this.step = "";
      }
    }
  },
  computed: {
    recordtxt() {
      if (this.step == "record") {
        return this.$mt("停止录音");
      }
      if (this.step == "stoprecord") {
        return this.$mt("录音");
      }
      return this.$mt("录音");
    },

    // canshowcurerrormsg() {
    //   if (this.curerrdpMsg.dp_msg) {
    //     if (this.curerrdpMsg.dp_msg.length) {
    //       return true;
    //     }
    //   }
    //   return false;
    // },
    windowsplat() {
      if (nativebridge.platform == "exsoftwindows") {
        return true;
      }
      return false;
    },
    curcarindex() {
      return this.cursentindex;
    }
  },
  methods: {
    setcurerrormsg(index) {
      if (this.answers[index]) {
        if (this.answers[index].errormsg) {
          this.curerrdpMsg = this.answers[index].errormsg;
          if (!this.curerrdpMsg.dp_msg) {
            this.curerrdpMsg.dp_msg = [];
          }
        }
      }
    },
    pyTouchStart(event) {
      if (!this.canmove || this.setscore) return;
      this.touchStartPoint = event.targetTouches[0].pageX;
      this.distance = 0;
      this.rotatenum = 0;
      // this.curitem = document.getElementById(`caritem${this.cursentindex}`);
      this.curitem = this.$refs.caritem[0];
      // this.canmove = true;
      this.preitemstates = false;
      //  this.nextitem = this.$refs.caritem[this.cursentindex+1];
      // this.curitem.style.transition = "none";
    },
    pyTouchMove(event) {
      // if (!this.canmove) return;
      if (event.targetTouches.length > 1 || this.setscore) {
        return;
      }
      this.distance = this.touchStartPoint - event.targetTouches[0].pageX;
      this.rotatenum += 1;
      // console.log("distance", this.distance);
      // console.log("curitem", this.curitem);
      if (this.distance > 0) {
        if (this.canmove && this.curcarindex < this.$refs.caritem.length - 1) {
          if (!this.preitemstates) {
            // console.log("xia", this.cursentindex);
            // console.log(this.srtlines[this.cursentindex + 1].subtitle);
            this.$refs.caritem[1].innerHTML = `<div class="content-text">${
              this.srtlines[this.cursentindex + 1].subtitle
            }</div>`;
          }
          this.preitemstates = true;
          this.curitem.style.transform = `rotate(-${this.distance /
            10}deg) translate(-${this.distance}px,0) scale(0.95)`;
        } else {
          this.distance = 0;
        }
      } else {
        if (this.canmove && this.curcarindex > 0) {
          if (!this.preitemstates) {
            // console.log("shang", this.cursentindex - 1);
            // console.log(this.srtlines[this.cursentindex - 1].subtitle);
            this.$refs.caritem[1].innerHTML = `<div class="content-text">${
              this.srtlines[this.cursentindex - 1].subtitle
            }</div>`;
          }
          this.preitemstates = true;
          this.curitem.style.transform = `rotate(${Math.abs(this.distance) /
            10}deg) translate(${Math.abs(this.distance)}px,0) scale(0.95)`;
        } else {
          this.distance = 0;
        }
      }
    },
    pyTouchEnd(event = null) {
      // console.log(this.$refs.caritem);
      // return;
      let next = true;
      if (!this.canmove || !Math.abs(this.distance) || this.setscore) return;
      if (Math.abs(this.distance) < this.$refs.carwarp.clientWidth / 3) {
        this.curitem.classList.add("backcar");
        setTimeout(() => {
          this.curitem.classList.remove("backcar");
          this.curitem.style.transform = `rotate(0deg) translate(0,0) scale(1)`;
        }, 300);
        return;
      }
      if (this.distance > 0) {
        // this.curitem.classList.add("nextcar");
      } else {
        // this.curitem.classList.add("precar");
        next = false;
      }
      this.toxunlian(next);
      // this.canmove = false;
      // setTimeout(() => {
      //   if (next) {
      //     this.curitem.classList.remove("nextcar");
      //     let fist = this.tempsrtlines.shift();
      //     this.tempsrtlines.push(fist);
      //     this.nextsent();
      //   } else {
      //     let last = this.tempsrtlines.pop();
      //     this.tempsrtlines.unshift(last);
      //     this.curitem.classList.remove("precar");
      //     this.present();
      //   }
      //   this.curitem.style.transform = `rotate(0deg) translate(0,0) scale(1)`;
      //   this.canmove = true;
      //   console.log("index", this.cursentindex);
      // }, 300);
    },
    toxunlian(next) {
      if (next) {
        this.curitem.classList.add("nextcar");
      } else {
        this.curitem.classList.add("precar");
      }
      this.canmove = false;
      setTimeout(() => {
        console.log("index  srtlines", this.srtlines);
        if (next) {
          this.curitem.classList.remove("nextcar");
          let fist = this.tempsrtlines.shift();
          this.tempsrtlines.push(fist);
          this.nextsent();
        } else {
          let last = this.tempsrtlines.pop();
          this.tempsrtlines.unshift(last);
          this.curitem.classList.remove("precar");
          this.present();
        }
        this.curitem.style.transform = `rotate(0deg) translate(0,0) scale(1)`;
        this.canmove = true;
        console.log("index", this.cursentindex);
        this.$nextTick(() => {
          if (this.answers[this.cursentindex]) {
            if (this.answers[this.cursentindex].errormsg) {
              let errormsg = this.answers[this.cursentindex].errormsg;
              if (errormsg.dp_msg) {
                if (errormsg.dp_msg.length) {
                  // console.log("是范德萨的", errormsg);
                  // console.log(
                  //   "麻烦的开始了",
                  //   this.curitem.querySelector(".subtitle").innerText
                  // );
                  // console.log(
                  //   "麻烦的开始了",
                  //   this.$refs.caritem[0].querySelector(".subtitle")
                  // );
                  // console.log("tempsrtlines", this.tempsrtlines);
                  // console.log("srtlines", this.srtlines);
                  common.replacetext(
                    this.curitem.querySelector(".subtitle"),
                    errormsg
                  );
                }
              }
            }
          }
        });
      }, 300);
      // this.setcurerrormsg(this.cursentindex);
    },
    clicktoxunlian(next) {
      if (!this.canmove) return;
      if (next) {
        if (this.cursentindex >= this.srtlines.length - 1) return;
      }
      if (!next) {
        if (this.cursentindex == 0) return;
      }
      this.curitem = this.$refs.caritem[0];
      if (!this.preitemstates) {
        let index = next ? this.cursentindex + 1 : this.cursentindex - 1;
        this.$refs.caritem[1].innerHTML = `<div class="content-text">${this.srtlines[index].subtitle}</div>`;
      }
      this.preitemstates = true;
      this.toxunlian(next);
    },
    carnext(index) {
      this.$nextTick(() => {
        this.curitem = this.$refs.caritem[0];
        for (let i = 0; i < index; i++) {
          let fist = this.tempsrtlines.shift();
          this.tempsrtlines.push(fist);
          this.curitem.style.transform = `rotate(0deg) translate(0,0) scale(1)`;
        }
      });
    },
    onchange() {
      console.log(v);
    },
    carprev() {
      this.$refs.car.prev();
    },
    playcurrec() {
      if (!this.currecordfile) return;
      this.step = "playrecord";
    },
    goBack() {
      xunliancommon.doback(this);
    },
    stopallplay() {
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
    itemrecord() {
      if (process.env.NODE_ENV != "development") {
        if (nativebridge.apiversion < 1) {
          let msg = this.$mt("请在最新版APP中使用录音");
          if (nativebridge.platform == "miniprogram") {
            msg = this.$mt("小程序中无法使用录音功能") + "," + msg;
          }
          MessageBox({
            title: this.$mt("提示"),
            message: msg,
            confirmButtonText: this.$mt("确定")
          }).then(() => {});
          return;
        }
      }

      if (this.step == "record") {
        this.step = "stoprecord";
        return;
      }
      this.step = "record";
    },
    playhistory(cindex) {
      this.stopallplay();
      this.stopallrecord();
      console.log("playhistory cindex", cindex);
      console.log("playhistory answers", this.answers);
      if (this.answers[cindex]) {
        //   this.cureditItem = this.srtlines[cindex];
        // for (let v of this.srtlines) {
        //   v.playrecord = false;
        // }
        // this.cureditItem.playrecord = true;
        // let rfile = this.answers[cindex].recordfile;
        // if (rfile) {
        //   this.stopallplay();
        //   this.stopallrecord();
        //   this.playobj = nativeobject.newplay({
        //     path: rfile
        //   });
        //   this.playobj.play();
        // }
        this.cureditItem = this.srtlines[cindex];
        for (let v of this.srtlines) {
          v.playrecord = false;
        }
        this.step = "";
        this.cureditItem.playrecord = true;
        let rfile = this.answers[cindex].recordfile;
        if (rfile) {
          this.currecordfile = rfile;
          console.log("{{$mt('回放')}} playhistory", this.currecordfile);
          this.step = "playrecord";
          this.onstepchanged();
          // this.setforcestep("playrecord");
        }
      }
    },
    onstepchanged() {
      let step = this.step;
      this.stopallplay();
      this.stopallrecord();
      if (step == "record") {
        this.setscore = true;
        let filepath = xunliancommon.getrecpath(this, this.cursentindex); //'faying_' + this.cursentindex + ".wav";
        this.currecordfile = "";
        this.recordobj = nativeobject.newrecord({ path: filepath });
        this.recordobj.start();
      } else if (step == "playrecord") {
        console.log("{{$mt('回放')}}", this.currecordfile);
        if (this.currecordfile) {
          this.playobj = nativeobject.newplay({
            path: this.currecordfile
          });
          this.playobj.play();
        }
      } else if (step == "stoprecord") {
        //! tudo. {{$mt('打分请求')}}
        //! {{$mt('回放录音')}}
        this.step = "playrecord";
        let sindex = this.cursentindex;
        let scorecb = (ncode, score, errormsg = null) => {
          console.log("scorecb 回调errormsg", errormsg);
          if (sindex == this.cursentindex) {
            if (ncode != 0) {
              let desc =
                this.$mt("打分失败") + "," + this.$mt("错误码") + "" + ncode;
              this.scoredesc = desc;
              this.curscore = 0;
            } else {
              this.scoredesc = score;
              this.curscore = score;
              if (process.env.NODE_ENV != "development") {
                xunliancommon.saveresult(
                  this,
                  this.cursentindex,
                  score,
                  this.currecordfile,
                  errormsg
                );
              }
              xunliancommon.cachelocal(
                this.currecordfile,
                sindex,
                score,
                this,
                errormsg
              );
              let el = this.$refs.caritem[0].querySelector(".subtitle");
              this.srtlines[this.cursentindex].subtitle = common.replacetext(
                el,
                errormsg
              );
            }
            this.answers[sindex].score = score;
            this.answers[sindex].errormsg = errormsg;
            // this.curerrdpMsg = errormsg;
            console.log("this.cursentindex", this.cursentindex);
          }
          this.setscore = false;
        };
        if (!this.answers[sindex]) {
          this.answers[sindex] = {};
        }
        this.answers[sindex].recordfile = this.currecordfile;
        this.scoredesc = this.$mt("打分中") + "...";
        if (process.env.NODE_ENV == "development") {
          xunliancommon.modata(this.lang, sindex);
        }
        xunliancommon.dowavscore(
          this,
          this.currecordfile,
          // this.srtlines[sindex].subtitle,
          this.$refs.caritem[0].querySelector(".subtitle").innerText,
          this.lang,
          scorecb
        );
      }
    },
    getLimitTimeMSec() {
      let sline = this.srtlines[this.cursentindex];
      let limittime = sline.endsec - sline.startsec;
      //! cjy: {{$mt('加上半秒钟的误差')}}
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
      // console.log(1);
      if (this.step == "record") {
        //! {{$mt('自动停止录音')}}
        if (this.recordobj) {
          let limittime = this.getLimitTimeMSec();
          // console.log("句子时间", limittime);
          // console.log("录音时长", this.recordobj.getRecordTimeMs());
          if (this.recordobj.getRecordTimeMs() > limittime) {
            this.step = "stoprecord";
            console.log("录音结束，开始打分");
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
    loadvideo() {},
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
      if (this.step == "record" || this.step == "playrecord") return;
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
    onanswerloaded(maxsentindex) {
      //! cjy: {{$mt('目前直接定位到最后训练的语句')}}
      // if (maxsentindex < 0 || maxsentindex >= this.srtlines.length) {
      //   return;
      // }
      if (maxsentindex == this.srtlines.length - 1) {
        maxsentindex--;
      }
      this.dosent(maxsentindex + 1);
      this.carnext(maxsentindex + 1);
    },
    dosent(sentindex) {
      if (sentindex < 0 || sentindex >= this.srtlines.length) {
        return;
      }
      // this.$refs.car.setActiveItem(sentindex);
      if (this.cursentindex != sentindex) {
        this.savecurwrite();

        //！ {{$mt('赋值历史答案')}}
        let cfile = "";
        if (this.answers[sentindex]) {
          cfile = this.answers[sentindex].recordfile;
          let score = this.answers[sentindex].score;
          this.curscore = score;
          this.scoredesc = score;
        } else {
          this.curscore = 0;
          this.scoredesc = "";
        }
        this.currecordfile = cfile;
      }

      this.cursentindex = sentindex;
      this.loadcurtext();
      this.setforcestep("");
    },
    setforcestep(step, bforce = true) {
      if (this.step == step) {
        if (bforce) {
          this.onstepchanged(); //! {{$mt('强制重新开始')}}
        }
      } else {
        this.step = step;
      }
    },
    loadcurtext() {
      let sz = "";
      if (this.srtlines[this.cursentindex]) {
        sz = this.srtlines[this.cursentindex].subtitle;
      }
      this.curtext = sz;
    },
    loadsrt() {
      this.$http
        .get(this.srturl)
        .then(res => {
          //console.log(res);
          let vsrt = new Srt(res.data);
          for (let i = 0; i < vsrt.lines.length; i++) {
            let v = vsrt.lines[i];
              v.subtitle = v.subtitle.replace(/[\s!！#$%&(（)）,，, :* 、.。;；？@[\]^_`{}~‘’“”《》￥【】+=|·…]/g, " ");
            v.playrecord = false;
            v.showdetail = false;
            if (i == 0) {
              v.isact = true;
            } else {
              v.isact = false;
            }
          }
          this.srtlines = vsrt.lines;
          this.tempsrtlines = JSON.parse(JSON.stringify(this.srtlines));
          //  console.log(this.srtlines);
          this.loadcurtext();
          this.serverparams.videoready = true;
          xunliancommon.xunlianready(this);
        })
        .catch(res => {
          this.$message.error(
            this.$mt("打开字幕失败") + "，" + this.$mt("无法训练")
          );
        });
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
      //  this.setcurerrormsg(this.cursentindex);
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
    // [Swipe.name]: Swipe,
    // [SwipeItem.name]: SwipeItem
  }
};
</script>

<style>
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
.mymain {
  width: 100%;
  height: 100%;
  overflow: scroll;
}
.mint-header {
  position: fixed !important;
  width: 100% !important;
  left: 0 !important;
  top: 0 !important;
}
.mint-header {
  background: #fff !important;
  color: #000 !important;
}
.mint-header-button.is-left {
  color: #0089ff !important;
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
.listContainer .titscore {
  position: relative;
  height: 36px;
  margin: 0;
  margin-left: 10px;
}
.listContainer .titscore.act {
  margin-left: 0;
}
.listContainer .len {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translate(0, -50%);
  height: 90%;
  padding: 0 10px;
  background: #ff8900;
  color: #fff;
  display: flex;
  align-items: center;
}

.listContainer .reshfimg {
  width: 66px;
}
.listContainer .reshf-warp {
  display: flex;
  flex-direction: column;
  color: #aaaaaa;
}
.listContainer .resanswer .tit {
  color: #aaaaaa;
}
.listContainer .content {
  font-size: 24px;
  color: #5d5d5d;
}
.appcontainer {
  height: 100%;
  padding-top: 50px;
  position: fixed;
  width: 100%;
  left: 0;
  top: 0;
  background: #f0f0f0;
}

.kouyudisplay {
  text-align: center;
  font-size: 25px;
  line-height: 25px;
  margin-bottom: 20px;
  margin-top: 10px;
  color: #5d5d5d;
  font-size: 18px;
}

.appheader {
  height: 300px !important;
  margin: 0px !important;
  padding: 0px !important;
}
.appvideo {
  height: 300px;
}
.xunliantext {
  text-align: center;
  font-size: 25px;
  margin: 20px;
  overflow-y: scroll;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 0 5px 5px #e5e5e5;
}
.intable {
  width: 100%;
  height: 100%;
  padding: 10px 15px;
}
.intablecell {
  /* display: table-cell;
  vertical-align: middle; */

  text-align: center;
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
.top {
  position: relative;
  height: 300px;
  width: 90%;
  border-radius: 10px;
  margin: 10px auto;
  box-shadow: 0 0 5px 5px #e5e5e5;
  background: #fff;
  overflow: hidden;
}
.top .click-controls {
  position: absolute;
  width: 100%;
  left: 0;
  height: 30px;
  top: 50%;
  transform: translate(0, -50%);
  z-index: 999999999999;
}
.top .click-controls span {
  position: absolute;
  width: 60px;
  height: 30px;
  background: rgba(0, 0, 0, 0.2);
  color: #fff;
  font-size: 12px;
  top: 50%;
  line-height: 30px;
  text-align: center;
  transform: translate(0, -50%);
  border-radius: 50px;
}
.top .click-controls .next {
  right: 10px;
}
.top .click-controls .pre {
  left: 10px;
}
.top > .item {
  position: absolute;
  width: 100%;
  height: 100%;
  background: #fff;
  transform-origin: bottom;
  font-size: 24px;
  color: #5d5d5d;
  border-radius: 10px;
}
.top > .item:nth-child(1) {
  box-shadow: 0 0 15px 7px #999;
}
.top > .item .content-text {
  padding: 30px 10px;
  position: absolute;
  width: 94%;
  height: 82%;
  overflow: scroll;
}
.top > .item.backcar {
  transition: all 0.3s;
  transform: rotate(0deg) translate(0, 0) scale(1) !important;
}
.top > .item.nextcar {
  transition: all 0.3s;
  transform: translate(-110%, 110%) scale(1) !important;
}
.top > .item.precar {
  transition: all 0.3s;
  transform: translate(100%, 100%) scale(1) !important;
}
.top .content {
  padding: 30px 10px 10px;
  text-align: center;
  font-size: 24px;
  color: #5d5d5d;
  position: relative;
}
.top .content .slide {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.bot {
  width: 98%;
  height: calc(100vh - 400px);
  background: #f0f0f0;
}
.scoretit {
  position: relative;
  padding: 0 10px;
}
.scoretit .star {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translate(0, -50%);
}
.titscore .star {
  position: relative;
}
.scoretit .len {
  height: 45px;
  width: 57px;
  line-height: 45px;
  text-align: center;
  font-size: 16px;
  border-radius: 5px;
  background: #f1f8ff;
}

.starimg {
  padding: 0 3px;
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
  left: 16px;
  top: 0;
  background: #f0f0f0;
}
.starimg.ban.curbackf::after {
 opacity: .5;
}
.starimg.ban.backf::after {
  background: rgba(255, 255, 255, 0.6);
}
.btns {
  display: flex;
  justify-content: space-around;
  margin-top: 38px;
}
.btnimg {
  width: 100px;
  height: 100px;
}
.btns a {
  display: flex;
  flex-direction: column;
  text-align: center;
}
.el-carousel_item:nth-child(2n) {
  background: #9999aa;
}
.el-carousel_item:nth-child(2n + 1) {
  background: #d3dce6;
}
.el-carousel__indicators {
  display: none !important;
}
.is-animating {
  /* transform: rotate(0deg) scale(1) !important;
  transform-origin: bottom !important; */
}
.is-active {
  /* box-shadow: 0 0 5px 5px #e5e5e5; */
  /* transform: rotate(0deg) scale(1) !important;
  transform-origin: bottom !important; */
}
.scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

::-webkit-scrollbar {
  display: none;
}
.readonly {
}
.scrolling-scroll {
  -webkit-overflow-scrolling: touch;
}
.errred {
  color: #f00 !important;
}

.errmsg-wrap {
  position: absolute;
  width: 70%;
  height: 150px;
  margin: 0 auto;
  left: 50%;
  top: -100%;
  transform: translate(-50%, 0);
  opacity: 0;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 8px;
  transition: all 0.4s;
}
.errmsg-wrap.show {
  top: 109px;
  opacity: 1;
  z-index: 9999;
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
.msg-item p .cn {
  color: #f00;
  font-size: 20px;
}
.msg-item p .cn b {
  color: #000;
}
.errmsg-wrap .content .cn {
  color: #f00;
  font-size: 20px;
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
  z-index: 9998;
}
.qitusens {
  display: inline-block;
  width: 22px;
  height: 22px;
  position: absolute;
  top: -5px;
  left: -25px;
  border: 1px solid #ccc;
  border-radius: 50%;
  text-align: center;
  background: #fdf0dc;
  color: #ef9376;
}
.qitusens.act {
  top: 0;
}
</style>
