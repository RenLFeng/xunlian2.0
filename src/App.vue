<template>
  <div id="app">
    <mt-header :title="$mt(serverparams.headername)">
      <mt-button slot="left" icon="back" @click="goBack()">{{$mt('返回')}}</mt-button>
      <mt-button class="ellipse mybutton" slot="right" @click="viewresult">{{$mt('成绩单')}}</mt-button>
    </mt-header>
    <div class="mymain">
      <div class="video-warp" v-show="!bshowresult">
        <video
          src
          ref="appvideo"
          class="appvideo"
          x5-playsinline
          playsinline
          webkit-playsinline="true"
        >{{$mt('不支持视频播放')}}</video>
        <div class="curvideostate" @click="curplaystate">
          <div class="states">
            <img src="./assets/pyzjhf.png" v-if="step==''" />
          </div>
        </div>
      </div>
      <div class="content-warp">
        <!--
        <p  v-for="(oneitem,selindex) in srtlines"
                v-bind:key="selindex" ><span class="sentindextag">{{selindex+1}}</span>
          {{oneitem.subtitle}}</p>
        -->
        <div>
          <div class="answer" v-if="showanswre">
            <div class="content">
              <p class="text">{{$mt('标准答案')}}</p>
              <div class="bjanswer">{{srtlines[cursentindex].subtitle}}</div>
            </div>
          </div>
          <div v-if="!showanswre">
            <ul class="titinfo-wrap">
              <li class="leftw">
                <div class="len">{{cursentindex+1}}/{{srtlines.length}}</div>
                <div class="score">
                  <span v-if="cursentindex>0">
                    <a class="ellipse">{{$mt('上一句得分')}}:</a>
                    <span>
                      <!-- <span v-if="prescore=='false'">{{$mt('未听写')}}</span>
                      <span v-else>
                          <span  v-for="i in starScore(prescore)" :key="i" class="star">
                           <img src="./assets/star.svg" alt />
                         </span>
                      </span>-->
                      <span v-if="prescore=='false'">{{$mt('未听写')}}</span>
                      <span v-if="!prescore">{{$mt('%s分',[prescore])}}</span>
                      <span v-else v-for="i in starScore(prescore)" :key="i" class="star">
                        <img src="./assets/star.svg" alt />
                      </span>
                      <span class="starimg ban backf" v-if="showbanstar(prescore)">
                        <img src="./assets/star.svg" />
                      </span>
                    </span>
                  </span>
                  <span>
                    <a class="ellipse">{{$mt('当前得分')}}:</a>
                    <span
                      v-if="answers[cursentindex] && !answers[cursentindex].score "
                    >{{$mt('%s分',[answers[cursentindex].score])}}</span>
                    <span v-for="v in starScore(curscore)" :key="v" class="starimg">
                      <img style="width:18px" src="./assets/star.svg" />
                    </span>
                    <span class="starimg ban backf" v-if="showbanstar(curscore)">
                      <img src="./assets/star.svg" />
                    </span>
                  </span>
                </div>
              </li>
              <li></li>
              <li class="sp ellipse">
                <span @click="showsplabclick">{{$mt('速度')}}:{{$mt(playbackRatedes)}}</span>

                <!-- <span class="splab" v-if="showsplab">
                  <span @click="playbackRate=v.sp" v-for="(v,i) in sparr" :key="i">{{v.sp}}</span>
                </span>-->
              </li>

              <!-- <div style="float:right">
            <el-popover placement="bottom" title="{{$mt('速度设置')}}" width="200" trigger="click">
              <el-slider
                v-model="playbackRate"
                :min="50"
                :max="200"
                :step="10"
                :show-tooltip="false"
              ></el-slider>
              <span>{{playbackRate}}</span>
              <el-tag slot="reference">{{$mt('速度')}}:{{playbackRate/100}}</el-tag>
            </el-popover>
              </div>-->
            </ul>
            <p>
              <!-- <el-input
                ref="textarea"
                class="writesent"
                type="textarea"
                spellcheck="false"
                :rows="8"
                :placeholder="$mt('请输入听到的句子')"
                v-model="writecontent"
                @keyup.enter="dosubmit"
                :autofocus="isfocus"
              ></el-input>-->
              <textarea
                ref="textarea"
                class="writesent"
                type="textarea"
                spellcheck="false"
                :rows="10"
                :placeholder="$mt('请输入听到的句子')"
                v-model="writecontent"
                @keyup.enter="keyupsubmit"
                :autofocus="isfocus"
              ></textarea>
              <!-- <input type="text" :autofocus="true" /> -->
            </p>
          </div>
        </div>
        <div v-if="true" class="appfooter">
          <div v-if="!showanswre">
            <button @click="dosubmit" class="subbtn" :class="cansub?'act':''">{{$mt('提交')}}</button>
            <!-- <el-button @click="dosubmit" class="subbtn" :class="cansub?'act':''">{{$mt('提交')}}</el-button> -->
            <div style="text-align:center" class="oturtbtn">
              <el-button @click="present" class="ellipse">{{$mt('上一句')}}</el-button>
              <el-button @click="repeat" class="ellipse">{{$mt('播放')}}</el-button>
              <el-button
                @click="lookanswer"
                class="ellipse"
                v-if="answers[cursentindex]"
              >{{$mt('答案')}}</el-button>

              <el-button @click="nextsent" class="ellipse">{{$mt('下一句')}}</el-button>
            </div>
          </div>
          <el-button class="tingxiebtn" @click="tingx" v-if="showanswre">{{$mt('继续听写')}}</el-button>
        </div>
      </div>
    </div>
    <!--
      controls="controls"
    -->

    <el-container class="appcontainer" v-if="false">
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
      <el-main class="appmain" :class="showanswre?'showanswre':''">
        <!--
        <p  v-for="(oneitem,selindex) in srtlines"
                v-bind:key="selindex" ><span class="sentindextag">{{selindex+1}}</span>
          {{oneitem.subtitle}}</p>
        -->
        <div>
          <div class="answer" v-if="showanswre">
            <div class="content">
              <p class="text">{{$mt('标准答案')}}</p>
              <div class="bjanswer">{{srtlines[cursentindex].subtitle}}</div>
            </div>
          </div>
          <div v-if="!showanswre">
            <ul class="titinfo-wrap">
              <li class="leftw">
                <div class="len">{{cursentindex+1}}/{{srtlines.length}}</div>
                <div class="score">
                  <span v-if="cursentindex>0">
                    {{$mt('上一句得分')}}:
                    <span>
                      <span v-if="prescore=='false'">{{$mt('未听写')}}</span>
                      <span v-if="!prescore">{{prescore}}rgrg</span>
                      <span v-else v-for="i in starScore(prescore)" :key="i" class="star">
                        <img src="./assets/star.svg" alt />
                      </span>
                    </span>
                  </span>
                  <span>
                    {{$mt('当前得分')}}:
                    <span v-for="v in starScore(curscore)" :key="v" class="starimg">
                      <span v-if="v<=0">{{curscore}}</span>
                      <img style="width:18px" v-else src="./assets/star.svg" />
                    </span>
                  </span>
                </div>
              </li>
              <li></li>
              <li class="sp">
                <span @click="showsplabclick">{{$mt('速度')}}:{{$mt(playbackRatedes)}}</span>

                <!-- <span class="splab" v-if="showsplab">
                  <span @click="playbackRate=v.sp" v-for="(v,i) in sparr" :key="i">{{v.sp}}</span>
                </span>-->
              </li>

              <!-- <div style="float:right">
            <el-popover placement="bottom" :title="$mt('速度设置')" width="200" trigger="click">
              <el-slider
                v-model="playbackRate"
                :min="50"
                :max="200"
                :step="10"
                :show-tooltip="false"
              ></el-slider>
              <span>{{playbackRate}}</span>
              <el-tag slot="reference">{{$mt('速度')}}:{{playbackRate/100}}</el-tag>
            </el-popover>
              </div>-->
            </ul>
            <p>
              <el-input
                class="writesent"
                type="textarea"
                spellcheck="false"
                :rows="10"
                :placeholder="$mt('请输入听到的句子')"
                v-model="writecontent"
              ></el-input>
            </p>
          </div>
        </div>

        <!-- <div style="text-align:center">
          <el-button @click="repeat" ref="playbutton">{{$mt('播放')}}</el-button>
          <el-button type="primary" @click="dosubmit">{{$mt('提交')}}</el-button>
        </div>-->
      </el-main>

      <el-footer v-if="true" class="appfooter">
        <div v-if="!showanswre">
          <button @click="dosubmit" class="subbtn" :class="cansub?'act':''">{{$mt('提交')}}</button>
          <!-- <el-button @click="dosubmit" class="subbtn" :class="cansub?'act':''">{{$mt('提交')}}</el-button> -->
          <div style="text-align:center" class="oturtbtn">
            <mt-button @click="present" class="ellipse">{{$mt('上一句')}}</mt-button>
            <mt-button @click="lookanswer" class="ellipse">{{$mt('答案')}}</mt-button>

            <mt-button @click="nextsent" class="ellipse">{{$mt('下一句')}}</mt-button>
          </div>
        </div>
        <el-button class="tingxiebtn" @click="tingx" v-if="showanswre">{{$mt('继续听写')}}</el-button>
      </el-footer>
    </el-container>
    <!-- <div class="">
      <div class="titinfo"></div>
      <div class="textarea-wrap">
        <el-input
          class="writesent"
          type="textarea"
          spellcheck="false"
          :rows="8"
          :placeholder="$mt('请输入听到的句子')"
          v-model="writecontent"
        ></el-input>
      </div>
      <div class="btn-wrap">
        <el-button>{{$mt('提交')}}</el-button>
        <el-button @click="present">{{$mt('上一句')}}</el-button>
        <el-button @click="lookanswer">{{$mt('答案')}}</el-button>
        <el-button @click="nextsent">{{$mt('下一句')}}</el-button>
      </div>
    </div>-->
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
          @click="serverparams.readonly?goBack():bshowresult=false"
        >{{$mt('返回')}}</mt-button>
      </mt-header>

      <div class="listContainer bshowresult">
        <div style="width:100%;height:100%;overflow:scroll" class="scrolling-scroll">
          <el-card class="box-card" v-for="(oneitem,selindex) in srtlines" v-bind:key="selindex">
            <div v-if="typeof answers[selindex] != 'undefined'">
              <p>
                <span v-if="!answers[selindex].score">{{$mt('%s分',[answers[selindex].score])}}</span>
                <span v-for="v in starScore(answers[selindex].score)" :key="v" class="star">
                  <img src="./assets/star.svg" alt />
                </span>
                <span class="starimg ban backf res" v-if="showbanstar(answers[selindex].score)">
                  <img src="./assets/star.svg" />
                </span>
                <span class="num">{{selindex+1}}/{{srtlines.length}}</span>
              </p>
              <div class="my-wrap text-wrap">
                <span class="tit">{{$mt('你的拼写')}}</span>
                <p class="my text">{{answers[selindex].writecontent}}</p>
              </div>
              <div class="ans-wrap text-wrap">
                <p class="tit">{{$mt('标准答案')}}</p>
                <p class="ans text">{{oneitem.subtitle}}</p>
              </div>
            </div>
            <div v-else>{{selindex+1}}{{$mt('未听写')}}</div>
          </el-card>
        </div>
      </div>
    </mt-popup>

    <!--
    <el-dialog
            title="{{$mt('成绩单')}}"
            :visible.sync="bshowresult"
            width="100%"
            >

      <el-card class="box-card"  v-for="(oneitem,selindex) in srtlines"
          v-bind:key="selindex" >
        <div v-if="typeof answers[selindex] != 'undefined'">
          <p>{{$mt('分数')}}： <el-tag>{{answers[selindex].score}}</el-tag></p>
          <p> {{$mt('作答')}}： {{answers[selindex].writecontent}}</p>
          <p>{{$mt('参考答案')}}： {{oneitem.subtitle}}</p>
        </div>
        <div v-else>
          {{$mt('未听写')}}
        </div>

      </el-card>


      <span slot="footer" class="dialog-footer">
    <el-button @click="bshowresult = false">{{$mt('取')}} {{$mt('消')}}</el-button>
    <el-button type="primary" @click="bshowresult = false">{{$mt('确')}} {{$mt('定')}}</el-button>
  </span>
    </el-dialog>
    -->
  </div>
</template>

<script>
import HelloWorld from "./components/HelloWorld.vue";

import Srt from "@/srt";
import xunliancommon from "@/xunliancommon";
import common from "@/common";
import nativebridge from "@/nativebridge";

export default {
  name: "App",
  data() {
    let odata = {
      spindex: 2,
      sparr: [
        {
          sp: 0.6
        },
        {
          sp: 0.8
        },
        {
          sp: 1.0
        },
        {
          sp: 1.2
        },
        {
          sp: 1.4
        }
      ],
      videourl: "",
      srturl: "",
      srtlines: [],
      cursentindex: 0, //! {{$mt('当前句子')}}id
      timerid: null, //!  {{$mt('定时器')}}id
      step: "", //! {{$mt('当前阶段')}}： listen write
      writecontent: "", //! {{$mt('当前听写的内容')}}
      answers: {}, //! {{$mt('学生的作答')}}
      bshowresult: false,
      scoredesc: "",
      curscore: 0,
      playbackRate: 1.0,

      backaction: "",
      lang: "en_us",

      serverparams: {},
      showanswre: false,
      starScore: common.starScore,
      showbanstar: common.showbanstar,
      nativeplay: true,
      hasplay: false,
      muted: false,
      watchplay: false,
      initplay: false
    };
    return odata;
  },
  computed: {
    isfocus() {
      if (
        nativebridge.platform != "exsoftios" ||
        nativebridge.platform != "exsoftandroid"
      ) {
        return true;
      }
      return false;
    },

    titname() {
      if (this.serverparams.headername) {
        return this.serverparams.headername;
      }
      return this.$mt("听写训练");
    },
    playbackRatedes() {
      if (this.playbackRate == 0.6) {
        return "很慢";
      } else if (this.playbackRate == 0.8) {
        return "慢";
      } else if (this.playbackRate == 1.0) {
        return "标准";
      } else if (this.playbackRate == 1.2) {
        return "快";
      } else if (this.playbackRate == 1.4) {
        return "很快";
      } else {
        return "标准";
      }
    },
    prescore() {
      let id = JSON.parse(JSON.stringify(this.cursentindex));
      id -= 1;
      if (this.answers[id]) {
        return this.answers[id].score;
      }
      return "false";
    },
    cansub() {
      if (!this.writecontent) {
        return false;
      }
      return true;
    }
  },
  watch: {
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
      }
    }
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
    xunliancommon.parseUrlArg(this, loadcb, "tingxie");
  },
  destroyed() {
    if (this.timerid) {
      clearInterval(this.timerid);
    }
    this.removeEventListeners();
  },
  methods: {
    goBack() {
      xunliancommon.doback(this);
    },
    onplaybackrate() {
      let appvideo = this.$refs.appvideo;
      if (appvideo) {
        appvideo.playbackRate = this.playbackRate;
      }
    },
    curplaystate() {
      console.log("{{$mt('自定义播放')}} this.cursentindex", this.cursentindex);
      if (this.step == "listen") return;
      this.repeat();
    },
    ontimer() {
      if (this.step == "listen") {
        let sline = this.srtlines[this.cursentindex];
        let appvideo = this.$refs.appvideo;
        if (appvideo.currentTime >= sline.endsec || appvideo.ended) {
          appvideo.pause();
          this.step = "";
          this.isplay = false;
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
      //appvideo.play();
      //! cjy: {{$mt('预先加载播放')}}，{{$mt('防止')}}android{{$mt('的第一句不能设置到正确的起始时间点')}}
      appvideo.muted = true;
      appvideo.play();
      setTimeout(() => {
        appvideo.pause();
        this.serverparams.videoready = true;
        xunliancommon.xunlianready(this);
      }, 200);
    },
    present() {
      let li = this.cursentindex - 1;
      this.dosent(li);
    },
    lookanswer() {
      this.showanswre = true;
    },
    tingx() {
      this.showanswre = false;
      console.log(this.answers);
    },
    repeat() {
      // if (!this.hasplay) {
      //   this.muted = true;
      //   this.dosent(this.cursentindex);
      //   let timer = setTimeout(() => {
      //     console.log("{{$mt('初始化')}}  this.repeat(); {{$mt('播放')}}");
      //     this.repeat();
      //     clearTimeout(timer);
      //   }, 100);
      //   return;
      // }
      this.dosent(this.cursentindex);
    },
    nextsent() {
      let li = this.cursentindex + 1;
      console.log(li);
      this.dosent(li);
    },
    viewresult() {
      // this.savecurwrite();
      this.bshowresult = true;
    },
    savecurwrite() {
      if (!this.writecontent) {
        return;
      }
      if (!this.answers[this.cursentindex]) {
        this.answers[this.cursentindex] = {};
      }
      this.answers[this.cursentindex].writecontent = this.writecontent;
      let keyanswer = this.srtlines[this.cursentindex].subtitle;
      let score = xunliancommon.textScore(this.writecontent, keyanswer);
      this.answers[this.cursentindex].score = score;
      this.curscore = score;
      this.scoredesc = score;
      if (this.cursentindex < this.srtlines.length - 1) {
        this.writecontent = "";
      }
      xunliancommon.saveresult(
        this,
        this.cursentindex,
        score,
        this.answers[this.cursentindex].writecontent
      );
    },
    keyupsubmit(e) {
      if (this.writecontent.length < 2) {
        this.writecontent = "";
        return;
      }
      this.dosubmit();
    },
    dosubmit() {
      this.savecurwrite();
    },
    onanswerloaded(maxsindex) {
      if (maxsindex == this.srtlines.length - 1) {
        maxsindex--;
      }
      // this.hasplay = true;
      this.dosent(maxsindex + 1, true); //! cjy: {{$mt('一般这里不能进行有声播放')}}； {{$mt('浏览器安全限制')}}，{{$mt('必须用户先产生交互')}}
      //   this.$refs.playbutton.$el.click();
    },
    dosent(sentindex, first = false) {
      console.log("dosent:" + sentindex);
      if (sentindex < 0 || sentindex >= this.srtlines.length) {
        return;
      }

      if (this.cursentindex != sentindex) {
        // this.savecurwrite();  //! cjy: {{$mt('不再自动保存')}}； {{$mt('用户提交再保存')}}

        //！ {{$mt('赋值历史答案')}}
        let writec = "";
        let score = 0;
        if (this.answers[sentindex]) {
          writec = this.answers[sentindex].writecontent;
          this.scoredesc = this.curscore = this.answers[sentindex].score;
        } else {
          this.scoredesc = "";
          this.curscore = 0;
        }
        this.writecontent = writec;
      }

      this.cursentindex = sentindex;
      if (!first) {
        this.step = "listen";
        let sent = this.srtlines[this.cursentindex];
        let appvideo = this.$refs.appvideo;
        let senttime = sent.startsec;
        appvideo.muted = false;
        if (this.muted) {
          appvideo.muted = this.muted;
          this.muted = false;
        }
        this.nativeplay = false;
        if (senttime > appvideo.duration) {
          for (let i = this.cursentindex; i > -1; i--) {
            let v = this.srtlines[i];
            if (v.startsec < appvideo.duration) {
              senttime = v.startsec;
            }
          }
        }

        // console.log("mediaplaying   currentTime", appvideo.currentTime);
        // console.log("mediaplaying   duration", appvideo.duration);

        appvideo.currentTime = senttime;
        appvideo.play();
        this.isplay = true;
        // if (!this.hasplay) {
        //   let timer = setTimeout(() => {
        //     appvideo.currentTime = senttime;
        //     console.log(
        //       "mediaplaying peiying  currentTime max>>> setTimeout",
        //       appvideo.currentTime
        //     );
        //     this.hasplay = true;
        //     this.isplay = true;
        //     clearTimeout(timer);
        //   }, 100);
        // } else {
        //   appvideo.currentTime = senttime;
        //   this.isplay = true;
        // }
      }
    },
    stopallplay() {
      let appvideo = this.$refs.appvideo;
      if (appvideo) {
        appvideo.pause();
      }
    },
    onstepchanged() {},
    setforcestep(step, bforce = true) {
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
          //console.log(res);
          let vsrt = new Srt(res.data);
          this.srtlines = vsrt.lines;
          console.log("dfkj", this.srtlines);
          this.addEventListeners();
          xunliancommon.xunlianready(this);
        })
        .catch(res => {
          this.$message.error(
            this.$mt("打开字幕失败") + "" + this.$mt("无法训练")
          );
        });
    },
    showsplabclick() {
      this.spindex++;
      if (this.spindex >= this.sparr.length) {
        this.spindex = 0;
      }
      this.playbackRate = this.sparr[this.spindex].sp;
    },
    addEventListeners: function() {
      const self = this;
      self.$refs.appvideo.addEventListener("play", self.mediaplaying);
      self.$refs.appvideo.addEventListener("ended", self.mediaEndplay);
      self.$refs.appvideo.addEventListener("timeupdate", self._currentTime);
    },
    removeEventListeners: function() {
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
      let appvideo = this.$refs.appvideo;
      let currentTime = appvideo.currentTime;
      if (!this.hasplay) {
        this.watchcurplaytime();
      }
      return;
      if (currentTime > 0 && !this.step && this.nativeplay) {
        appvideo.pause();
        console.log("_currentTime step", this.step);
        // this.repeat();
        if (this.hasplay) {
          console.log("nativeplay {{$mt('播放')}}");
          this.repeat();
          return;
        }
        this.muted = true;
        this.repeat();
        let timer = setTimeout(() => {
          console.log("{{$mt('初始化')}} nativeplay {{$mt('播放')}}");
          this.repeat();
          clearTimeout(timer);
        }, 10);
      }
    },
    mediaplaying() {
      let appvideo = this.$refs.appvideo;
      appvideo.classList.add("active");
      if (!this.step) {
        appvideo.muted = false;
        if (!this.hasplay) {
          this.initplay = false;
          return;
        }
        this.repeat(this.cursentindex);
      }
      // if (!this.step) {
      //   this.nativeplay = true;

      // let appvideo = this.$refs.appvideo;
      // appvideo.pause();
      // console.log("_currentTime step", this.step);
      // // this.repeat();
      // if (this.hasplay) {
      //   console.log("nativeplay {{$mt('播放')}}");
      //   this.repeat();
      //   return;
      // }
      // this.muted = true;
      // this.repeat();
      // let timer = setTimeout(() => {
      //   console.log("{{$mt('初始化')}} nativeplay {{$mt('播放')}}");
      //   this.repeat();
      //   clearTimeout(timer);
      // }, 10);
      // }
    },
    mediaEndplay() {
      this.step = "";
    }
  },
  components: {}
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

.appheader {
  background-color: black;
  color: #333;
  height: 211px !important;
  margin: 0px !important;
  padding: 0px !important;
}
.appvideo {
  width: 0%;
  height: 211px !important;
  object-fit: contain;
}
.appvideo.active {
  width: 100% !important;
}

.el-textarea {
}
.writesent {
  width: 100%;
  border-radius: 6px;
  border-color: #999;
}
.writesent textarea {
  width: 100%;
  border-radius: 7px !important;
  border-color: #707070 !important;
}

.sentindextag {
  border-radius: 2px;
  background-color: orange;
  color: white;
}
.appfooter {
  /* position: fixed; */
  width: 100%;
  height: auto !important;
  left: 0;
  bottom: 0px;
}
.appfooter .el-button {
  font-size: 18px !important;
}
.appfooter .subbtn {
  width: 100%;
  background: #aaaaaa;
  color: #fff;
  margin-bottom: 15px;
  padding: 18px 0px;
  border: none;
  border-radius: 5px;
  font-size: 18px;
}
.appfooter .subbtn.act {
  background: #0089ff;
}
.appfooter .oturtbtn .el-button {
  padding: 10px 0;
  font-size: 16px !important;
}
.appfooter .oturtbtn .el-button.ellipse {
  width: 80px;
}
.appmain {
  padding: 10px 10px 0 !important;
  flex: none !important;
}
.titinfo-wrap {
  padding: 0;
  margin: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #5d5d5d;
}
.titinfo-wrap .ellipse {
  display: inline-block;
  width: 110px;
}
.titinfo-wrap li {
  list-style: none;
}
.titinfo-wrap li.leftw {
  display: flex;
}
.titinfo-wrap li.leftw .len {
  height: 43px;
  width: 50px;
  border: 1px solid #ccc;
  border-radius: 5px;
  line-height: 45px;
  text-align: center;
}
.titinfo-wrap li.leftw .score {
  display: flex;
  flex-direction: column;
  padding-left: 3px;
}
.titinfo-wrap li.sp {
  position: relative;
  height: 43px;
  width: 80px;
  border: 1px solid #ccc;
  border-radius: 5px;
  line-height: 45px;
  text-align: center;
}
.el-card {
  margin: 10px !important;
  padding: 15px !important;
  border-radius: 10px !important;
}
.el-card__body {
  padding: 0 !important;
}
.bshowresult .text {
  font-size: 24px;
  color: #5d5d5d;
  margin: 0;
}
.text-wrap {
  margin-bottom: 15px;
}
.text-wrap .tit {
  color: #999;
}
.bshowresult .tit {
  margin: 0;
}
.bshowresult .num {
  float: right;
  width: 66px;
  height: 36px;
  background: #ff8900;
  color: #fff;
  text-align: center;
  line-height: 36px;
}
.error {
  color: #f00;
}
.answer {
}
.answer .content {
  position: relative;
  height: calc(100vh - 380px);
  background: #fff;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0 0 7px 1px #e5e5e5;
  padding-top: 30px;
}
.answer .content .text {
  position: absolute;
  color: #999;
  margin: 0;
  background: #fff;
  left: 10px;
  top: 10px;
}
.tingxiebtn {
  background: #0089ff !important;
  color: #fff !important;
  position: fixed;
  bottom: 6px;
  left: 50%;
  transform: translate(-50%, 0);
  padding: 12px 35px !important;
}
.star {
  padding-right: 2px;
}
.star img {
  width: 18px;
}
.splab {
  position: absolute;
  z-index: 9;
  left: 50%;
  width: 30px;
  display: flex;
  flex-direction: column;
  bottom: -127px;
  background: rgba(0, 0, 0, 0.2);
  margin-left: -15px;
}
.splab span {
  height: 30px;
  line-height: 30px;
  text-align: center;
}
.bjanswer {
  padding: 30px 10px 10px;
  text-align: center;
  font-size: 24px;
  color: #5d5d5d;
  background: #fff;
}
.readonly {
  opacity: 0;
}

.video-warp {
  position: relative;
  background-color: black;
  color: #333;
  height: 211px !important;
  margin: 0px !important;
  padding: 0px !important;
}
.curvideostate {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: #000;
}
.appvideo.active + .curvideostate {
  background: none;
}
.states {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.content-warp {
  padding: 10px;
  overflow: scroll;
  height: calc(100% - 242px);
}
.scrolling-scroll {
  -webkit-overflow-scrolling: touch;
}
.mint-header {
  position: fixed !important;
  width: 100% !important;
  left: 0 !important;
  top: 0 !important;
}
.mymain {
  width: 100%;
  height: 100%;
}
/* video::-webkit-media-controls-overlay-play-button {
  display: none !important;
} */
video::-webkit-media-controls {
  display: none;
}
.mybutton {
  width: 100px;
}
.ellipse {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.starimg {
  position: relative;
  width: 18px;
  height: 18px;
  display: inline-block;
}
.starimg.ban img {
  width: 18px;
}
.starimg.ban::after {
  position: absolute;
  width: 100%;
  height: 100%;
  content: "";
  left: 9px;
  top: 0;
  background: #f0f0f0;
}
.starimg.ban.backf::after {
  background: rgb(240, 240, 240,.6);
}
.starimg.ban.backf.res::after {
  background: rgba(255,255,255,.6);
}
</style>
