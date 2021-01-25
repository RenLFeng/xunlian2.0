/*
 * 训练的公共类；
 *
 */

var xunliancommon = {}

import nativebridge from '@/nativebridge'
import nativeobject from './nativeobject'

import common from './common'



xunliancommon.isSupport = () => {
    if (process.env.NODE_ENV == "development") {
        return true
    }
    if (nativebridge.apiversion >= 1) {
        return true
    }
    return false
}

xunliancommon.doback = (vuethis) => {
    if (vuethis.backaction == 'history') {
        if (process.env.NODE_ENV != "development") {
            if (window) {
                if (window.parent) {
                    if (window.parent.window) {
                        if (window.parent.window.exsoftcalldp) {
                            nativeobject.callparent();
                            return;
                        }
                    }
                }
            }
        }
        window.history.go(-1);
    } else {
        nativebridge.ncall('jsBackMain', {})
    }
}
let xlntype=0;
xunliancommon.parseUrlArg = (vuethis, loadvideocb, xunliantype) => {
    let docb = true
    if (!loadvideocb) {
        docb = false
    }
    console.log('window href:' + window.location.href)
    nativebridge.printinfo();
    let urlparam = common.parseURL(window.location.href)
    console.log('parse url arg:' + JSON.stringify(urlparam))
    if (urlparam['videourl']) {
        vuethis.videourl = decodeURIComponent(urlparam['videourl'])

    }
    if (urlparam['srturl']) {
        vuethis.srturl = decodeURIComponent(urlparam['srturl'])
    }
    if (urlparam['backaction']) {
        vuethis.backaction = decodeURIComponent(urlparam['backaction'])
    }
    if (urlparam['lang']) {
        vuethis.lang = decodeURIComponent(urlparam['lang'])
    }
    let nxunliantype = 0
    if (xunliantype == 'faying') {
        xlntype=10
        nxunliantype = 10
    } else if (xunliantype == 'tingxie') {
        xlntype=11
        nxunliantype = 11
    } else if (xunliantype == 'peiying') {
        xlntype=12
        nxunliantype = 12
    }
    let sparams = vuethis.serverparams
    sparams.xunliantype = nxunliantype
    if (urlparam['aboutid']) {
        sparams.cookie = urlparam['cookie']
        sparams.readonly = JSON.parse(urlparam['readonly'])
        sparams.aboutid = urlparam['aboutid']
        sparams.abouttype = urlparam['abouttype']
        sparams.userid = urlparam['userid']
        // sparams.recsave = urlparam['recsave']  //! 是否录音保存到服务器；一般只有任务里的才保存服务器。方便老师和其他学生查看
        sparams.hasparam = true
        sparams.recsave = true
    } else {
        //! 测试代码
        sparams.cookie = null
        sparams.aboutid = 1
        sparams.abouttype = 0
        sparams.userid = 9
        sparams.hasparam = true
        sparams.recsave = true
        // sparams.readonly = true
    }
    if (urlparam['headername']) {
        sparams.headername = decodeURIComponent(urlparam['headername'])
    } else {
        sparams.headername=xunliancommon.headername(vuethis,nxunliantype)
    }
    if (loadvideocb && nativebridge.os == 'ios' &&
        vuethis.videourl.indexOf('.mp4') > 0
    ) {
        //! ios 尝试使用m3u8， 取得更好的效果： 流式播放
        let m3u8path = vuethis.videourl + '.m3u8';
        docb = false;
        console.log('begin check m3u8');
        vuethis.$http.get(m3u8path)
            .then((res) => {
                vuethis.videourl = m3u8path
                loadvideocb();
            })
            .catch((res) => {
                console.log('check m3u8 failed');
                loadvideocb();
            })
    }
    if (docb) {
        loadvideocb();
    }
}
xunliancommon.nopingce = (vuethis) => {
    // && nativebridge.platform=='exsoftios'
    if (nativebridge.apiversion >= 3 && vuethis.lang == 'en_us') {
        return true;
    }
    return false;
}
xunliancommon.headername = (vthis,type) => {
    let arr = {
        2: '口语训练',
        10: '发音训练',
        11: '听写训练',
        12: '配音训练'
    }
    return arr[type]
}
xunliancommon.isvalidtext = (text, blog) => {
    if (blog) {
        console.log(text);
        console.log(typeof text);
    }

    if (text != ' ' && text != '\r' && text != '\n' && text != '\t') {

        return true;
    }
    if (blog) {
        console.log('invalid text');
        console.log(text);
    }

    return false;
}



xunliancommon.getrecpath = (vuethis, sindex) => {
    let sp = vuethis.serverparams
    let szret = 'xunlian_'
    szret += sp.xunliantype
    if (sp.hasparam) {
        //! 本地记录追加；防止切换账户，本地录音记录混淆
        szret += sp.userid + '_'
        szret += sp.aboutid + '_'
        szret += sp.abouttype
    }
    szret += '_' + sindex
    return szret + '.wav'
}

xunliancommon.loadresult = (vuethis) => {
    let sparams = vuethis.serverparams
    if (sparams.hasparam) {
        let usersrecordfile = sessionStorage.getItem("usersrecordfile") || '{}';
        usersrecordfile = JSON.parse(usersrecordfile);
        let httpload = () => {
            //! 尝试加载历史记录
            vuethis.$http.post('/api/xunlian/info', {
                    where: {
                        aboutid: sparams.aboutid,
                        abouttype: sparams.abouttype,
                        userid: sparams.userid,
                        xunliantype: sparams.xunliantype
                    },
                    detail: true
                })
                .then((res) => {
                    if (res.data.code == 0) {
                        xunliancommon.loadresultfn(res.data.data.detail, sparams, vuethis);
                    }
                })
        }
        // httpload();

        if (sparams.xunliantype != 11 && usersrecordfile[sparams.aboutid] && usersrecordfile[sparams.aboutid][sparams.userid] && usersrecordfile[sparams.aboutid][sparams.userid][sparams.xunliantype]) {
            let data = usersrecordfile[sparams.aboutid][sparams.userid][sparams.xunliantype];
            console.log('sessionStorage 本地存储查询', data);
            xunliancommon.loadresultfn(data, sparams, vuethis);
        } else {
            httpload();
        }
    }
}
xunliancommon.loadresultfn = (data, sparams, vuethis) => {
    // let dresult = data
    // let tarray = dresult.detail
    let tarray = data
    let answers = vuethis.answers
    let maxsentindex = 0;
    let minsentindex = 0;
    if (tarray.length) {
        minsentindex = tarray[0]['sentindex'];
    }
    for (let i = 0; i < tarray.length; i++) {
        let curi = tarray[i]
        let sentindex = curi.sentindex
        minsentindex = sentindex < minsentindex ? sentindex : minsentindex
        let answerobj = null
        if (!answers[sentindex]) {
            answers[sentindex] = {}
        }
        answerobj = answers[sentindex]
        if (sentindex > maxsentindex) {
            maxsentindex = sentindex
        }
        if (curi.info && typeof curi.info == 'string') {
            try {
                let cinfo = JSON.parse(curi.info)
                if (cinfo.writecontent) {
                    answerobj.writecontent = cinfo.writecontent
                }
                if (cinfo.errormsg) {
                    answerobj.errormsg = cinfo.errormsg
                    vuethis.srtlines[sentindex].subtitle = common.replacetext(vuethis.srtlines[sentindex].subtitle, answerobj.errormsg, true);
                    if (sparams.xunliantype == '10') {
                        vuethis.tempsrtlines[sentindex].subtitle = vuethis.srtlines[sentindex].subtitle;
                    }
                }
            } catch (e) {
                //console.log(e)
            }
        }
        answerobj.score = curi.score
        if (curi.recfile) {
            answerobj.recordfile = curi.recfile
        } else {
            //! 映射为本地的录音文件，方便回放
            answerobj.recordfile = xunliancommon.getrecpath(vuethis, sentindex)
        }

        vuethis.srtlines[sentindex].recordPro = 100
    }
    if (tarray.length > 0) {
        if (!sparams.readonly) {
            if (minsentindex >= 1) {
                minsentindex = minsentindex - 1;
            }
            // vuethis.onanswerloaded(minsentindex);
            vuethis.onanswerloaded(maxsentindex);
        }
    }
    if (sparams.readonly) {
        if (sparams.xunliantype != 12) {
            vuethis.viewresult();
        }
    }
    console.log('tempsrtlines', vuethis.tempsrtlines)
    console.log('srtlines', vuethis.srtlines)
    // vuethis.onanswerloaded(2);
}
xunliancommon.cachelocal = (recordfile, sentindex, score, vuethis, errormsg = null) => {
    let infoobj = {};
    if (errormsg && errormsg.dp_msg) {
        infoobj.errormsg = errormsg;
    } else {

    }
    infoobj = JSON.stringify(infoobj);
    let sparams = vuethis.serverparams
    let usersrecordfile = sessionStorage.getItem("usersrecordfile") || '{}';
    usersrecordfile = JSON.parse(usersrecordfile);
    let pushfn = (xunliantype) => {
        xunliantype.push({
            aboutid: sparams.aboutid,
            abouttype: sparams.abouttype,
            info: infoobj,
            recfile: recordfile,
            score: score,
            sentindex: sentindex,
            userid: sparams.userid,
            xunliantype: sparams.xunliantype,
        })
    };
    if (usersrecordfile[sparams.aboutid] && usersrecordfile[sparams.aboutid][sparams.userid]) {
        let userid = usersrecordfile[sparams.aboutid][sparams.userid];
        if (userid[sparams.xunliantype]) {
            let curallfiles = userid[sparams.xunliantype];
            let hasindex = false;
            for (let v of curallfiles) {
                if (v.sentindex == sentindex) {
                    v.recfile = recordfile;
                    v.score = score;
                    v.info = infoobj;
                    hasindex = true;
                }
            }
            if (!hasindex) {
                pushfn(userid[sparams.xunliantype]);
            }
        } else {
            userid[sparams.xunliantype] = [];
            pushfn(userid[sparams.xunliantype]);
        }
    } else {
        if (usersrecordfile[sparams.aboutid]) {
            let aboutid = usersrecordfile[sparams.aboutid];
            aboutid[sparams.userid] = {};
            aboutid[sparams.userid][sparams.xunliantype] = [];
            pushfn(aboutid[sparams.userid][sparams.xunliantype]);
        } else {
            usersrecordfile[sparams.aboutid] = {};
            let aboutid = usersrecordfile[sparams.aboutid];
            aboutid[sparams.userid] = {};
            aboutid[sparams.userid][sparams.xunliantype] = [];
            pushfn(aboutid[sparams.userid][sparams.xunliantype]);
        }
    }
    console.log('设置本地存储', usersrecordfile);
    usersrecordfile = JSON.stringify(usersrecordfile);
    sessionStorage.setItem("usersrecordfile", usersrecordfile);
};
xunliancommon.xunlianready = (vuethis) => {
    let sp = vuethis.serverparams;
    if (!vuethis.srtlines.length) {
        return;
    }
    if (!sp.videoready) {
        return;
    }
    if (!sp.ready) {
        sp.ready = true; //! 避免重入
        xunliancommon.loadresult(vuethis)
    }
}

xunliancommon.saveresult = (vuethis, sentindex, score, writecontent, errormsg = null) => {
    let sp = vuethis.serverparams
    if (sp.hasparam) {
        let finishnum = 0
        let countscore = 0
        let sa = vuethis.answers
        let appendcur = true
        for (let skey in sa) {
            if (skey == sentindex) {
                appendcur = false
                finishnum += 1
                countscore += parseInt(score)
            } else {
                finishnum += 1
                if (sa[skey].score) {
                    countscore += parseInt(sa[skey].score)
                }
            }
        }
        if (appendcur) {
            finishnum += 1
            countscore += parseInt(score)
        }
        let totalnum = vuethis.srtlines.length
        if (totalnum <= finishnum) {
            totalnum = finishnum
        }
        //! 计算当前整体的平均得分
        let avgscore = countscore / (totalnum)
        let tongjiobj = {
            aboutid: sp.aboutid,
            abouttype: sp.abouttype,
            xunliantype: sp.xunliantype,
            userid: sp.userid,
            totalnum: totalnum,
            finishnum: finishnum,
            score: avgscore
        }
        console.log(tongjiobj);
        let detailobj = {
            aboutid: sp.aboutid,
            abouttype: sp.abouttype,
            xunliantype: sp.xunliantype,
            userid: sp.userid,
            sentindex: sentindex,
            score: score,
        }
        let infoobj = {}
        if (writecontent && sp.xunliantype == '11') {
            infoobj.writecontent = writecontent
        }
        if (errormsg && errormsg.dp_msg) {
            infoobj.errormsg = errormsg;
        }
        detailobj.info = JSON.stringify(infoobj)
        vuethis.$http.post('/api/xunlian/update', {
            detail: detailobj,
            tongji: tongjiobj
        }).then(res => {
            if (res.data.code == 0) {
                if (sp.xunliantype == 11 && sentindex < vuethis.srtlines.length - 1) {
                    vuethis.nextsent();
                    return;
                }
                if (sp.xunliantype == 11 && sentindex == vuethis.srtlines.length-1) {
                    vuethis.repeat();
                }
            }
            if (res.data.code == '-1' && sp.xunliantype == 11 && res.data.msg == 'not join in') {
                vuethis.nextsent();
            }
        })
    }
}
const pcdata = {
    'en_us': [
        // {
        //     "eof": 1,
        //     "result": {
        //         "duration": "2.550",
        //         "fluency": 95,
        //         "integrity": 100,
        //         "kernel_version": "3.5.5",
        //         "overall": 89,
        //         "pronunciation": 86,
        //         "rear_tone": "fall",
        //         "resource_version": "2.2.0",
        //         "rhythm": 94,
        //         "speed": 190,
        //         "words": [{
        //                 "phonics": [{
        //                     "overall": 78,
        //                     "phoneme": [
        //                         "a瑟"
        //                     ],
        //                     "spell": "I"
        //                 }],
        //                 "scores": {
        //                     "overall": 80,
        //                     "pronunciation": 80
        //                 },
        //                 "span": {
        //                     "end": 48,
        //                     "start": 31
        //                 },
        //                 "word": "I"
        //             },
        //             {
        //                 "phonics": [{
        //                     "overall": 82,
        //                     "phoneme": [
        //                         "n",
        //                         "o",
        //                         "n"
        //                     ],
        //                     "spell": "known"
        //                 }],
        //                 "scores": {
        //                     "overall": 83,
        //                     "pronunciation": 83
        //                 },
        //                 "span": {
        //                     "end": 81,
        //                     "start": 48
        //                 },
        //                 "word": "known"
        //             },
        //             {
        //                 "phonics": [{
        //                     "overall": 85,
        //                     "phoneme": [
        //                         "冒",
        //                         "蓹"
        //                     ],
        //                     "spell": "the"
        //                 }],
        //                 "scores": {
        //                     "overall": 79,
        //                     "pronunciation": 79
        //                 },
        //                 "span": {
        //                     "end": 92,
        //                     "start": 81
        //                 },
        //                 "word": "the"
        //             },
        //             {
        //                 "phonics": [{
        //                     "overall": 74,
        //                     "phoneme": [
        //                         "p",
        //                         "l",
        //                         "e",
        //                         "s"
        //                     ],
        //                     "spell": "place"
        //                 }],
        //                 "scores": {
        //                     "overall": 75,
        //                     "pronunciation": 75
        //                 },
        //                 "span": {
        //                     "end": 136,
        //                     "start": 92
        //                 },
        //                 "word": "place"
        //             },
        //             {
        //                 "phonics": [{
        //                     "overall": 94,
        //                     "phoneme": [
        //                         "v",
        //                         "蓻",
        //                         "r",
        //                         "瑟"
        //                     ],
        //                     "spell": "very"
        //                 }],
        //                 "scores": {
        //                     "overall": 99,
        //                     "pronunciation": 99
        //                 },
        //                 "span": {
        //                     "end": 178,
        //                     "start": 145
        //                 },
        //                 "word": "very"
        //             },
        //             {
        //                 "phonics": [{
        //                     "overall": 98,
        //                     "phoneme": [
        //                         "w",
        //                         "蓻",
        //                         "l"
        //                     ],
        //                     "spell": "well."
        //                 }],
        //                 "scores": {
        //                     "overall": 99,
        //                     "pronunciation": 99
        //                 },
        //                 "span": {
        //                     "end": 220,
        //                     "start": 178
        //                 },
        //                 "word": "well."
        //             }
        //         ]
        //     },
        //     "version": "3.0.0"
        // },
        {
            "data": {
                "read_sentence": {
                    "version": "6.5.0.1011",
                    "rec_paper": {
                        "read_chapter": {
                            "beg_pos": "0",
                            "content": "My name is Nick Raducanu,",
                            "end_pos": "214",
                            "except_info": "0",
                            "is_rejected": "false",
                            "total_score": "18.946300",
                            "word_count": "5",
                            "sentence": {
                                "end_pos": "214",
                                "index": "0",
                                "total_score": "25.946300",
                                "word_count": "5",
                                "word": [{
                                    "dp_message": "0",
                                    "end_pos": "70",
                                    "index": "0",
                                    "property": "0",
                                    "total_score": "44.020760",
                                    "syll": {
                                        "beg_pos": "55",
                                        "content": "m ay",
                                        "end_pos": "70",
                                        "syll_accent": "0",
                                        "syll_score": "44.020760",
                                        "phone": [{
                                            "content": "m",
                                            "dp_message": "0",
                                            "end_pos": "62",
                                            "beg_pos": "55"
                                        }, {
                                            "beg_pos": "62",
                                            "content": "ay",
                                            "dp_message": "0",
                                            "end_pos": "70"
                                        }]
                                    },
                                    "beg_pos": "55",
                                    "content": "my",
                                    "global_index": "0"
                                }, {
                                    "total_score": "54.436000",
                                    "syll": {
                                        "syll_accent": "0",
                                        "syll_score": "54.436000",
                                        "phone": [{
                                            "beg_pos": "70",
                                            "content": "n",
                                            "dp_message": "0",
                                            "end_pos": "78"
                                        }, {
                                            "end_pos": "88",
                                            "beg_pos": "78",
                                            "content": "ey",
                                            "dp_message": "0"
                                        }, {
                                            "beg_pos": "88",
                                            "content": "m",
                                            "dp_message": "0",
                                            "end_pos": "91"
                                        }],
                                        "beg_pos": "70",
                                        "content": "n ey m",
                                        "end_pos": "91"
                                    },
                                    "beg_pos": "70",
                                    "content": "name",
                                    "dp_message": "0",
                                    "end_pos": "91",
                                    "global_index": "1",
                                    "index": "1",
                                    "property": "0"
                                }, {
                                    "dp_message": "0",
                                    "end_pos": "130",
                                    "index": "2",
                                    "property": "0",
                                    "total_score": "52.876900",
                                    "beg_pos": "91",
                                    "content": "is",
                                    "global_index": "2",
                                    "syll": {
                                        "beg_pos": "91",
                                        "content": "ih z",
                                        "end_pos": "130",
                                        "syll_accent": "0",
                                        "syll_score": "52.876900",
                                        "phone": [{
                                            "beg_pos": "91",
                                            "content": "ih",
                                            "dp_message": "0",
                                            "end_pos": "110"
                                        }, {
                                            "beg_pos": "110",
                                            "content": "z",
                                            "dp_message": "0",
                                            "end_pos": "130"
                                        }]
                                    }
                                }, {
                                    "content": "nick",
                                    "dp_message": "16",
                                    "end_pos": "130",
                                    "global_index": "3",
                                    "index": "3",
                                    "property": "0",
                                    "total_score": "0.000000",
                                    "beg_pos": "130"
                                }, {
                                    "dp_message": "16",
                                    "end_pos": "130",
                                    "global_index": "4",
                                    "index": "4",
                                    "property": "0",
                                    "total_score": "0.000000",
                                    "beg_pos": "130",
                                    "content": "raducanu"
                                }],
                                "beg_pos": "0",
                                "content": "my name is nick raducanu"
                            }
                        }
                    },
                    "lan": "en",
                    "type": "study"
                }
            },
            "code": "0",
            "desc": "success",
            "sid": "wse00f223b9@dxad5e130689b66f1a00"
        },
        {
            "data": {
                "read_sentence": {
                    "version": "6.5.0.1011",
                    "rec_paper": {
                        "read_chapter": {
                            "sentence": [{
                                "content": "I'm 23 years old, and I'm from the United States.",
                                "end_pos": "342",
                                "index": "0",
                                "total_score": "59.514120",
                                "word_count": "5",
                                "word": [{
                                        "content": "years",
                                        "dp_message": "0",
                                        "global_index": "2",
                                        "total_score": "0.000000",
                                        "beg_pos": "192",
                                        "index": "0",
                                        "property": "0",
                                        "end_pos": "198"
                                    },
                                    {
                                        "beg_pos": "198",
                                        "content": "from",
                                        "dp_message": "16",
                                        "end_pos": "198",
                                        "global_index": "6",
                                        "index": "6",
                                        "property": "0",
                                        "total_score": "0.000000"
                                    }
                                ],
                                "beg_pos": "0"
                            }, ],
                            "beg_pos": "0",
                            "content": "I'm 23 years old, and I'm from the United States.",
                            "end_pos": "342",
                            "except_info": "0",
                            "is_rejected": "false",
                            "total_score": "0.000000",
                            "word_count": "5"
                        }
                    },
                    "lan": "en",
                    "type": "study"
                }
            },
            "code": "0",
            "desc": "success",
            "sid": "wse00f222c0@dxad5e130688da6f1a00"
        },
        {
            "data": {
                "read_sentence": {
                    "version": "6.5.0.1011",
                    "rec_paper": {
                        "read_chapter": {
                            "sentence": [{
                                "content": "I speak English, and I also speak French.",
                                "end_pos": "342",
                                "index": "0",
                                "total_score": "59.514120",
                                "word_count": "5",
                                "word": [{
                                        "content": "English",
                                        "dp_message": "0",
                                        "global_index": "2",
                                        "total_score": "100",
                                        "beg_pos": "192",
                                        "index": "0",
                                        "property": "0",
                                        "end_pos": "198"
                                    },
                                    {
                                        "beg_pos": "198",
                                        "content": "speak",
                                        "dp_message": "16",
                                        "end_pos": "198",
                                        "global_index": "6",
                                        "index": "6",
                                        "property": "0",
                                        "total_score": "100"
                                    }
                                ],
                                "beg_pos": "0"
                            }, ],
                            "beg_pos": "0",
                            "content": "I speak English, and I also speak French.",
                            "end_pos": "342",
                            "except_info": "0",
                            "is_rejected": "false",
                            "total_score": "100",
                            "word_count": "5"
                        }
                    },
                    "lan": "en",
                    "type": "study"
                }
            },
            "code": "0",
            "desc": "success",
            "sid": "wse00f222c0@dxad5e130688da6f1a00"
        },
        {},
        {
            "data": {
                "read_sentence": {
                    "version": "6.5.0.1011",
                    "rec_paper": {
                        "read_chapter": {
                            "sentence": [{
                                "content": "I am 20 years old, and I'm a student.",
                                "end_pos": "342",
                                "index": "0",
                                "total_score": "59.514120",
                                "word_count": "5",
                                "word": [{
                                        "content": "and",
                                        "dp_message": "0",
                                        "global_index": "5",
                                        "total_score": "0",
                                        "beg_pos": "192",
                                        "index": "5",
                                        "property": "0",
                                        "end_pos": "198"
                                    },
                                    {
                                        "beg_pos": "198",
                                        "content": "I'm",
                                        "dp_message": "16",
                                        "end_pos": "198",
                                        "global_index": "6",
                                        "index": "6",
                                        "property": "0",
                                        "total_score": "0"
                                    },
                                    {
                                        "beg_pos": "198",
                                        "content": "a",
                                        "dp_message": "16",
                                        "end_pos": "198",
                                        "global_index": "7",
                                        "index": "7",
                                        "property": "0",
                                        "total_score": "0"
                                    },
                                    {
                                        "beg_pos": "198",
                                        "content": "student",
                                        "dp_message": "16",
                                        "end_pos": "198",
                                        "global_index": "8",
                                        "index": "8",
                                        "property": "0",
                                        "total_score": "0"
                                    }
                                ],
                                "beg_pos": "0"
                            }, ],
                            "beg_pos": "0",
                            "content": "I am 20 years old, and I'm a student.",
                            "end_pos": "342",
                            "except_info": "0",
                            "is_rejected": "false",
                            "total_score": "66",
                            "word_count": "5"
                        }
                    },
                    "lan": "en",
                    "type": "study"
                }
            },
            "code": "0",
            "desc": "success",
            "sid": "wse00f222c0@dxad5e130688da6f1a00"
        }
    ],
    'zh_cn': [{
            "data": {
                "read_sentence": {
                    "rec_tree": {
                        "read_sentence": {
                            "content": "我的名字是张三",
                            "end_pos": "210",
                            "time_len": "210",
                            "sentence": {
                                "beg_pos": "0",
                                "content": "我的名字是张三",
                                "end_pos": "0",
                                "time_len": "0",
                                "word": [{
                                    "syll": {
                                        "symbol": "wo3",
                                        "time_len": "0",
                                        "phone": [{
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "0",
                                            "beg_pos": "0",
                                            "content": "_u"
                                        }, {
                                            "is_yun": "1",
                                            "mono_tone": "TONE3",
                                            "rec_node_type": "paper",
                                            "time_len": "0",
                                            "beg_pos": "0",
                                            "dp_message": "16",
                                            "perr_level_msg": "0",
                                            "content": "uo",
                                            "end_pos": "0"
                                        }],
                                        "beg_pos": "0",
                                        "content": "我",
                                        "dp_message": "16",
                                        "end_pos": "0",
                                        "rec_node_type": "paper"
                                    },
                                    "beg_pos": "0",
                                    "content": "我",
                                    "end_pos": "0",
                                    "symbol": "wo3",
                                    "time_len": "0"
                                }, {
                                    "beg_pos": "0",
                                    "content": "的",
                                    "end_pos": "0",
                                    "symbol": "de5",
                                    "time_len": "0",
                                    "syll": {
                                        "beg_pos": "0",
                                        "content": "的",
                                        "dp_message": "16",
                                        "end_pos": "0",
                                        "rec_node_type": "paper",
                                        "symbol": "de5",
                                        "time_len": "0",
                                        "phone": [{
                                            "time_len": "0",
                                            "beg_pos": "0",
                                            "content": "d",
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper"
                                        }, {
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "is_yun": "1",
                                            "perr_level_msg": "0",
                                            "time_len": "0",
                                            "beg_pos": "0",
                                            "content": "e",
                                            "mono_tone": "TONE0",
                                            "rec_node_type": "paper"
                                        }]
                                    }
                                }, {
                                    "syll": {
                                        "symbol": "ming2",
                                        "time_len": "0",
                                        "phone": [{
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "0",
                                            "beg_pos": "0",
                                            "content": "m"
                                        }, {
                                            "dp_message": "16",
                                            "mono_tone": "TONE2",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "0",
                                            "beg_pos": "0",
                                            "content": "ing",
                                            "end_pos": "0",
                                            "is_yun": "1"
                                        }],
                                        "beg_pos": "0",
                                        "content": "名",
                                        "dp_message": "16",
                                        "end_pos": "0",
                                        "rec_node_type": "paper"
                                    },
                                    "beg_pos": "0",
                                    "content": "名",
                                    "end_pos": "0",
                                    "symbol": "ming2",
                                    "time_len": "0"
                                }, {
                                    "content": "字",
                                    "end_pos": "0",
                                    "symbol": "zi9",
                                    "time_len": "0",
                                    "syll": {
                                        "symbol": "zi9",
                                        "time_len": "0",
                                        "phone": [{
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "0",
                                            "beg_pos": "0",
                                            "content": "z"
                                        }, {
                                            "time_len": "0",
                                            "content": "ii",
                                            "dp_message": "16",
                                            "is_yun": "1",
                                            "mono_tone": "TONE0",
                                            "rec_node_type": "paper",
                                            "beg_pos": "0",
                                            "end_pos": "0",
                                            "perr_level_msg": "0"
                                        }],
                                        "beg_pos": "0",
                                        "content": "字",
                                        "dp_message": "16",
                                        "end_pos": "0",
                                        "rec_node_type": "paper"
                                    },
                                    "beg_pos": "0"
                                }, {
                                    "content": "是",
                                    "end_pos": "0",
                                    "symbol": "shi4",
                                    "time_len": "0",
                                    "syll": {
                                        "symbol": "shi4",
                                        "time_len": "0",
                                        "phone": [{
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "0",
                                            "beg_pos": "0",
                                            "content": "sh"
                                        }, {
                                            "end_pos": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "content": "iii",
                                            "dp_message": "16",
                                            "mono_tone": "TONE4",
                                            "time_len": "0",
                                            "beg_pos": "0",
                                            "is_yun": "1"
                                        }],
                                        "beg_pos": "0",
                                        "content": "是",
                                        "dp_message": "16",
                                        "end_pos": "0",
                                        "rec_node_type": "paper"
                                    },
                                    "beg_pos": "0"
                                }, {
                                    "beg_pos": "0",
                                    "content": "张",
                                    "end_pos": "0",
                                    "symbol": "zhang1",
                                    "time_len": "0",
                                    "syll": {
                                        "phone": [{
                                            "rec_node_type": "paper",
                                            "time_len": "0",
                                            "beg_pos": "0",
                                            "content": "zh",
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "is_yun": "0",
                                            "perr_level_msg": "0"
                                        }, {
                                            "mono_tone": "TONE1",
                                            "time_len": "0",
                                            "end_pos": "0",
                                            "content": "ang",
                                            "dp_message": "16",
                                            "is_yun": "1",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "beg_pos": "0"
                                        }],
                                        "beg_pos": "0",
                                        "content": "张",
                                        "dp_message": "16",
                                        "end_pos": "0",
                                        "rec_node_type": "paper",
                                        "symbol": "zhang1",
                                        "time_len": "0"
                                    }
                                }, {
                                    "beg_pos": "0",
                                    "content": "三",
                                    "end_pos": "0",
                                    "symbol": "san1",
                                    "time_len": "0",
                                    "syll": {
                                        "rec_node_type": "paper",
                                        "symbol": "san1",
                                        "time_len": "0",
                                        "phone": [{
                                            "beg_pos": "0",
                                            "content": "s",
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "0"
                                        }, {
                                            "content": "an",
                                            "dp_message": "16",
                                            "is_yun": "1",
                                            "mono_tone": "TONE1",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "0",
                                            "beg_pos": "0",
                                            "end_pos": "0"
                                        }],
                                        "beg_pos": "0",
                                        "content": "三",
                                        "dp_message": "16",
                                        "end_pos": "0"
                                    }
                                }]
                            },
                            "beg_pos": "0"
                        }
                    },
                    "lan": "cn",
                    "type": "study",
                    "version": "6,5,0,1028",
                    "rec_paper": {
                        "read_sentence": {
                            "except_info": "28676",
                            "is_rejected": "true",
                            "time_len": "210",
                            "total_score": "15.965686",
                            "sentence": {
                                "beg_pos": "0",
                                "content": "我的名字是张三",
                                "end_pos": "0",
                                "time_len": "0",
                                "total_score": "15.965686",
                                "word": [{
                                    "time_len": "0",
                                    "syll": {
                                        "beg_pos": "0",
                                        "content": "我",
                                        "dp_message": "16",
                                        "end_pos": "0",
                                        "rec_node_type": "paper",
                                        "symbol": "wo3",
                                        "time_len": "0",
                                        "phone": [{
                                            "time_len": "0",
                                            "beg_pos": "0",
                                            "content": "_u",
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper"
                                        }, {
                                            "beg_pos": "0",
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "is_yun": "1",
                                            "mono_tone": "TONE3",
                                            "time_len": "0",
                                            "content": "uo",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper"
                                        }]
                                    },
                                    "beg_pos": "0",
                                    "content": "我",
                                    "end_pos": "0",
                                    "symbol": "wo3"
                                }, {
                                    "symbol": "de5",
                                    "time_len": "0",
                                    "syll": {
                                        "time_len": "0",
                                        "phone": [{
                                            "end_pos": "0",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "0",
                                            "beg_pos": "0",
                                            "content": "d",
                                            "dp_message": "16"
                                        }, {
                                            "content": "e",
                                            "dp_message": "16",
                                            "mono_tone": "TONE0",
                                            "time_len": "0",
                                            "rec_node_type": "paper",
                                            "beg_pos": "0",
                                            "end_pos": "0",
                                            "is_yun": "1",
                                            "perr_level_msg": "0"
                                        }],
                                        "beg_pos": "0",
                                        "content": "的",
                                        "dp_message": "16",
                                        "end_pos": "0",
                                        "rec_node_type": "paper",
                                        "symbol": "de5"
                                    },
                                    "beg_pos": "0",
                                    "content": "的",
                                    "end_pos": "0"
                                }, {
                                    "end_pos": "0",
                                    "symbol": "ming2",
                                    "time_len": "0",
                                    "syll": {
                                        "rec_node_type": "paper",
                                        "symbol": "ming2",
                                        "time_len": "0",
                                        "phone": [{
                                            "beg_pos": "0",
                                            "content": "m",
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "0"
                                        }, {
                                            "content": "ing",
                                            "end_pos": "0",
                                            "mono_tone": "TONE2",
                                            "time_len": "0",
                                            "beg_pos": "0",
                                            "dp_message": "16",
                                            "is_yun": "1",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper"
                                        }],
                                        "beg_pos": "0",
                                        "content": "名",
                                        "dp_message": "16",
                                        "end_pos": "0"
                                    },
                                    "beg_pos": "0",
                                    "content": "名"
                                }, {
                                    "beg_pos": "0",
                                    "content": "字",
                                    "end_pos": "0",
                                    "symbol": "zi9",
                                    "time_len": "0",
                                    "syll": {
                                        "content": "字",
                                        "dp_message": "16",
                                        "end_pos": "0",
                                        "rec_node_type": "paper",
                                        "symbol": "zi9",
                                        "time_len": "0",
                                        "phone": [{
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "0",
                                            "beg_pos": "0",
                                            "content": "z",
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "is_yun": "0"
                                        }, {
                                            "beg_pos": "0",
                                            "content": "ii",
                                            "end_pos": "0",
                                            "is_yun": "1",
                                            "perr_level_msg": "0",
                                            "dp_message": "16",
                                            "mono_tone": "TONE0",
                                            "rec_node_type": "paper",
                                            "time_len": "0"
                                        }],
                                        "beg_pos": "0"
                                    }
                                }, {
                                    "time_len": "0",
                                    "syll": {
                                        "beg_pos": "0",
                                        "content": "是",
                                        "dp_message": "16",
                                        "end_pos": "0",
                                        "rec_node_type": "paper",
                                        "symbol": "shi4",
                                        "time_len": "0",
                                        "phone": [{
                                            "beg_pos": "0",
                                            "content": "sh",
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "0"
                                        }, {
                                            "beg_pos": "0",
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "is_yun": "1",
                                            "perr_level_msg": "0",
                                            "time_len": "0",
                                            "content": "iii",
                                            "mono_tone": "TONE4",
                                            "rec_node_type": "paper"
                                        }]
                                    },
                                    "beg_pos": "0",
                                    "content": "是",
                                    "end_pos": "0",
                                    "symbol": "shi4"
                                }, {
                                    "beg_pos": "0",
                                    "content": "张",
                                    "end_pos": "0",
                                    "symbol": "zhang1",
                                    "time_len": "0",
                                    "syll": {
                                        "rec_node_type": "paper",
                                        "symbol": "zhang1",
                                        "time_len": "0",
                                        "phone": [{
                                            "time_len": "0",
                                            "beg_pos": "0",
                                            "content": "zh",
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper"
                                        }, {
                                            "content": "ang",
                                            "dp_message": "16",
                                            "mono_tone": "TONE1",
                                            "time_len": "0",
                                            "beg_pos": "0",
                                            "end_pos": "0",
                                            "is_yun": "1",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper"
                                        }],
                                        "beg_pos": "0",
                                        "content": "张",
                                        "dp_message": "16",
                                        "end_pos": "0"
                                    }
                                }, {
                                    "beg_pos": "0",
                                    "content": "三",
                                    "end_pos": "0",
                                    "symbol": "san1",
                                    "time_len": "0",
                                    "syll": {
                                        "beg_pos": "0",
                                        "content": "三",
                                        "dp_message": "16",
                                        "end_pos": "0",
                                        "rec_node_type": "paper",
                                        "symbol": "san1",
                                        "time_len": "0",
                                        "phone": [{
                                            "time_len": "0",
                                            "beg_pos": "0",
                                            "content": "s",
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper"
                                        }, {
                                            "is_yun": "1",
                                            "rec_node_type": "paper",
                                            "beg_pos": "0",
                                            "content": "an",
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "mono_tone": "TONE1",
                                            "perr_level_msg": "0",
                                            "time_len": "0"
                                        }]
                                    }
                                }]
                            },
                            "beg_pos": "0",
                            "content": "我的名字是张三",
                            "end_pos": "210"
                        }
                    }
                }
            },
            "code": "0",
            "desc": "success",
            "sid": "wse00ff7b2b@dx989b13117bca6f2300"
        },

        {
            "desc": "success",
            "sid": "wse00ff7baa@dx989b13117c2b6f2300",
            "data": {
                "read_sentence": {
                    "type": "study",
                    "version": "6,5,0,1028",
                    "rec_paper": {
                        "read_sentence": {
                            "end_pos": "223",
                            "except_info": "0",
                            "is_rejected": "false",
                            "time_len": "223",
                            "total_score": "49.153664",
                            "sentence": {
                                "total_score": "49.153664",
                                "word": [{
                                    "beg_pos": "0",
                                    "content": "我",
                                    "end_pos": "38",
                                    "symbol": "wo3",
                                    "time_len": "38",
                                    "syll": [{
                                        "beg_pos": "0",
                                        "content": "fil",
                                        "dp_message": "32",
                                        "end_pos": "1",
                                        "rec_node_type": "fil",
                                        "time_len": "1",
                                        "phone": {
                                            "beg_pos": "0",
                                            "content": "fil",
                                            "dp_message": "32",
                                            "end_pos": "1",
                                            "rec_node_type": "fil",
                                            "time_len": "1"
                                        }
                                    }, {
                                        "rec_node_type": "paper",
                                        "symbol": "wo3",
                                        "time_len": "37",
                                        "phone": [{
                                            "time_len": "3",
                                            "beg_pos": "1",
                                            "content": "_u",
                                            "dp_message": "0",
                                            "end_pos": "4",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper"
                                        }, {
                                            "beg_pos": "4",
                                            "content": "uo",
                                            "dp_message": "0",
                                            "end_pos": "38",
                                            "is_yun": "1",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "mono_tone": "TONE3",
                                            "time_len": "34"
                                        }],
                                        "beg_pos": "1",
                                        "content": "我",
                                        "dp_message": "0",
                                        "end_pos": "38"
                                    }]
                                }, {
                                    "end_pos": "60",
                                    "symbol": "de5",
                                    "time_len": "22",
                                    "syll": {
                                        "end_pos": "60",
                                        "rec_node_type": "paper",
                                        "symbol": "de0",
                                        "time_len": "22",
                                        "phone": [{
                                            "content": "d",
                                            "dp_message": "0",
                                            "end_pos": "44",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "6",
                                            "beg_pos": "38"
                                        }, {
                                            "mono_tone": "TONE0",
                                            "content": "e",
                                            "dp_message": "0",
                                            "end_pos": "60",
                                            "is_yun": "1",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "16",
                                            "beg_pos": "44"
                                        }],
                                        "beg_pos": "38",
                                        "content": "的",
                                        "dp_message": "0"
                                    },
                                    "beg_pos": "38",
                                    "content": "的"
                                }, {
                                    "time_len": "30",
                                    "syll": {
                                        "beg_pos": "60",
                                        "content": "名",
                                        "dp_message": "0",
                                        "end_pos": "90",
                                        "rec_node_type": "paper",
                                        "symbol": "ming2",
                                        "time_len": "30",
                                        "phone": [{
                                            "time_len": "12",
                                            "beg_pos": "60",
                                            "content": "m",
                                            "dp_message": "0",
                                            "end_pos": "72",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper"
                                        }, {
                                            "beg_pos": "72",
                                            "end_pos": "90",
                                            "is_yun": "1",
                                            "rec_node_type": "paper",
                                            "content": "ing",
                                            "dp_message": "0",
                                            "mono_tone": "TONE2",
                                            "perr_level_msg": "0",
                                            "time_len": "18"
                                        }]
                                    },
                                    "beg_pos": "60",
                                    "content": "名",
                                    "end_pos": "90",
                                    "symbol": "ming2"
                                }, {
                                    "symbol": "zi9",
                                    "time_len": "24",
                                    "syll": {
                                        "content": "字",
                                        "dp_message": "0",
                                        "end_pos": "114",
                                        "rec_node_type": "paper",
                                        "symbol": "zi0",
                                        "time_len": "24",
                                        "phone": [{
                                            "dp_message": "0",
                                            "end_pos": "100",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "10",
                                            "beg_pos": "90",
                                            "content": "z"
                                        }, {
                                            "content": "ii",
                                            "end_pos": "114",
                                            "mono_tone": "TONE0",
                                            "perr_level_msg": "0",
                                            "time_len": "14",
                                            "beg_pos": "100",
                                            "dp_message": "0",
                                            "is_yun": "1",
                                            "rec_node_type": "paper"
                                        }],
                                        "beg_pos": "90"
                                    },
                                    "beg_pos": "90",
                                    "content": "字",
                                    "end_pos": "114"
                                }, {
                                    "content": "是",
                                    "end_pos": "223",
                                    "symbol": "shi4",
                                    "time_len": "109",
                                    "syll": [{
                                        "dp_message": "0",
                                        "end_pos": "223",
                                        "rec_node_type": "sil",
                                        "time_len": "109",
                                        "phone": {
                                            "rec_node_type": "sil",
                                            "time_len": "109",
                                            "beg_pos": "114",
                                            "content": "sil",
                                            "dp_message": "0",
                                            "end_pos": "223"
                                        },
                                        "beg_pos": "114",
                                        "content": "sil"
                                    }, {
                                        "phone": [{
                                            "dp_message": "16",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "content": "sh"
                                        }, {
                                            "is_yun": "1",
                                            "mono_tone": "TONE4",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "content": "iii",
                                            "dp_message": "16"
                                        }],
                                        "beg_pos": "223",
                                        "content": "是",
                                        "dp_message": "16",
                                        "end_pos": "223",
                                        "rec_node_type": "paper",
                                        "symbol": "shi4",
                                        "time_len": "0"
                                    }],
                                    "beg_pos": "114"
                                }, {
                                    "time_len": "0",
                                    "syll": {
                                        "phone": [{
                                            "dp_message": "16",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "content": "zh"
                                        }, {
                                            "is_yun": "1",
                                            "mono_tone": "TONE1",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "content": "ang",
                                            "dp_message": "16"
                                        }],
                                        "beg_pos": "223",
                                        "content": "张",
                                        "dp_message": "16",
                                        "end_pos": "223",
                                        "rec_node_type": "paper",
                                        "symbol": "zhang1",
                                        "time_len": "0"
                                    },
                                    "beg_pos": "223",
                                    "content": "张",
                                    "end_pos": "223",
                                    "symbol": "zhang1"
                                }, {
                                    "symbol": "san1",
                                    "time_len": "0",
                                    "syll": {
                                        "content": "三",
                                        "dp_message": "16",
                                        "end_pos": "223",
                                        "rec_node_type": "paper",
                                        "symbol": "san1",
                                        "time_len": "0",
                                        "phone": [{
                                            "content": "s",
                                            "dp_message": "16",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper"
                                        }, {
                                            "is_yun": "1",
                                            "mono_tone": "TONE1",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "content": "an",
                                            "dp_message": "16"
                                        }],
                                        "beg_pos": "223"
                                    },
                                    "beg_pos": "223",
                                    "content": "三",
                                    "end_pos": "223"
                                }],
                                "beg_pos": "0",
                                "content": "我的名字是张三",
                                "end_pos": "223",
                                "time_len": "223"
                            },
                            "beg_pos": "0",
                            "content": "我的名字是张三"
                        }
                    },
                    "rec_tree": {
                        "read_sentence": {
                            "beg_pos": "0",
                            "content": "我的名字是张三",
                            "end_pos": "223",
                            "time_len": "223",
                            "sentence": {
                                "time_len": "223",
                                "word": [{
                                    "content": "我",
                                    "end_pos": "38",
                                    "symbol": "wo3",
                                    "time_len": "38",
                                    "syll": [{
                                        "dp_message": "32",
                                        "end_pos": "1",
                                        "rec_node_type": "fil",
                                        "time_len": "1",
                                        "phone": {
                                            "end_pos": "1",
                                            "rec_node_type": "fil",
                                            "time_len": "1",
                                            "beg_pos": "0",
                                            "content": "fil",
                                            "dp_message": "32"
                                        },
                                        "beg_pos": "0",
                                        "content": "fil"
                                    }, {
                                        "time_len": "37",
                                        "phone": [{
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "3",
                                            "beg_pos": "1",
                                            "content": "_u",
                                            "dp_message": "0",
                                            "end_pos": "4"
                                        }, {
                                            "mono_tone": "TONE3",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "content": "uo",
                                            "dp_message": "0",
                                            "is_yun": "1",
                                            "beg_pos": "4",
                                            "end_pos": "38",
                                            "time_len": "34"
                                        }],
                                        "beg_pos": "1",
                                        "content": "我",
                                        "dp_message": "0",
                                        "end_pos": "38",
                                        "rec_node_type": "paper",
                                        "symbol": "wo3"
                                    }],
                                    "beg_pos": "0"
                                }, {
                                    "content": "的",
                                    "end_pos": "60",
                                    "symbol": "de5",
                                    "time_len": "22",
                                    "syll": {
                                        "dp_message": "0",
                                        "end_pos": "60",
                                        "rec_node_type": "paper",
                                        "symbol": "de0",
                                        "time_len": "22",
                                        "phone": [{
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "6",
                                            "beg_pos": "38",
                                            "content": "d",
                                            "dp_message": "0",
                                            "end_pos": "44"
                                        }, {
                                            "rec_node_type": "paper",
                                            "time_len": "16",
                                            "content": "e",
                                            "end_pos": "60",
                                            "is_yun": "1",
                                            "perr_level_msg": "0",
                                            "beg_pos": "44",
                                            "dp_message": "0",
                                            "mono_tone": "TONE0"
                                        }],
                                        "beg_pos": "38",
                                        "content": "的"
                                    },
                                    "beg_pos": "38"
                                }, {
                                    "beg_pos": "60",
                                    "content": "名",
                                    "end_pos": "90",
                                    "symbol": "ming2",
                                    "time_len": "30",
                                    "syll": {
                                        "rec_node_type": "paper",
                                        "symbol": "ming2",
                                        "time_len": "30",
                                        "phone": [{
                                            "beg_pos": "60",
                                            "content": "m",
                                            "dp_message": "0",
                                            "end_pos": "72",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "12"
                                        }, {
                                            "dp_message": "0",
                                            "is_yun": "1",
                                            "rec_node_type": "paper",
                                            "beg_pos": "72",
                                            "content": "ing",
                                            "end_pos": "90",
                                            "mono_tone": "TONE2",
                                            "perr_level_msg": "0",
                                            "time_len": "18"
                                        }],
                                        "beg_pos": "60",
                                        "content": "名",
                                        "dp_message": "0",
                                        "end_pos": "90"
                                    }
                                }, {
                                    "content": "字",
                                    "end_pos": "114",
                                    "symbol": "zi9",
                                    "time_len": "24",
                                    "syll": {
                                        "dp_message": "0",
                                        "end_pos": "114",
                                        "rec_node_type": "paper",
                                        "symbol": "zi0",
                                        "time_len": "24",
                                        "phone": [{
                                            "end_pos": "100",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "10",
                                            "beg_pos": "90",
                                            "content": "z",
                                            "dp_message": "0"
                                        }, {
                                            "time_len": "14",
                                            "beg_pos": "100",
                                            "content": "ii",
                                            "end_pos": "114",
                                            "mono_tone": "TONE0",
                                            "dp_message": "0",
                                            "is_yun": "1",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper"
                                        }],
                                        "beg_pos": "90",
                                        "content": "字"
                                    },
                                    "beg_pos": "90"
                                }, {
                                    "end_pos": "223",
                                    "symbol": "shi4",
                                    "time_len": "109",
                                    "syll": [{
                                        "end_pos": "223",
                                        "rec_node_type": "sil",
                                        "time_len": "109",
                                        "phone": {
                                            "content": "sil",
                                            "dp_message": "0",
                                            "end_pos": "223",
                                            "rec_node_type": "sil",
                                            "time_len": "109",
                                            "beg_pos": "114"
                                        },
                                        "beg_pos": "114",
                                        "content": "sil",
                                        "dp_message": "0"
                                    }, {
                                        "dp_message": "16",
                                        "end_pos": "223",
                                        "rec_node_type": "paper",
                                        "symbol": "shi4",
                                        "time_len": "0",
                                        "phone": [{
                                            "rec_node_type": "paper",
                                            "content": "sh",
                                            "dp_message": "16",
                                            "is_yun": "0",
                                            "perr_level_msg": "0"
                                        }, {
                                            "content": "iii",
                                            "dp_message": "16",
                                            "is_yun": "1",
                                            "mono_tone": "TONE4",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper"
                                        }],
                                        "beg_pos": "223",
                                        "content": "是"
                                    }],
                                    "beg_pos": "114",
                                    "content": "是"
                                }, {
                                    "beg_pos": "223",
                                    "content": "张",
                                    "end_pos": "223",
                                    "symbol": "zhang1",
                                    "time_len": "0",
                                    "syll": {
                                        "rec_node_type": "paper",
                                        "symbol": "zhang1",
                                        "time_len": "0",
                                        "phone": [{
                                            "content": "zh",
                                            "dp_message": "16",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper"
                                        }, {
                                            "content": "ang",
                                            "dp_message": "16",
                                            "is_yun": "1",
                                            "mono_tone": "TONE1",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper"
                                        }],
                                        "beg_pos": "223",
                                        "content": "张",
                                        "dp_message": "16",
                                        "end_pos": "223"
                                    }
                                }, {
                                    "beg_pos": "223",
                                    "content": "三",
                                    "end_pos": "223",
                                    "symbol": "san1",
                                    "time_len": "0",
                                    "syll": {
                                        "end_pos": "223",
                                        "rec_node_type": "paper",
                                        "symbol": "san1",
                                        "time_len": "0",
                                        "phone": [{
                                            "content": "s",
                                            "dp_message": "16",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper"
                                        }, {
                                            "mono_tone": "TONE1",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "content": "an",
                                            "dp_message": "16",
                                            "is_yun": "1"
                                        }],
                                        "beg_pos": "223",
                                        "content": "三",
                                        "dp_message": "16"
                                    }
                                }],
                                "beg_pos": "0",
                                "content": "我的名字是张三",
                                "end_pos": "223"
                            }
                        }
                    },
                    "lan": "cn"
                }
            },
            "code": "0"
        },

        {
            "data": {
                "read_sentence": {
                    "version": "6,5,0,1028",
                    "rec_paper": {
                        "read_sentence": {
                            "sentence": {
                                "content": "我的名字是张三",
                                "end_pos": "219",
                                "time_len": "219",
                                "total_score": "59.576626",
                                "word": [{
                                    "syll": [{
                                        "time_len": "3",
                                        "phone": {
                                            "time_len": "3",
                                            "beg_pos": "0",
                                            "content": "sil",
                                            "dp_message": "0",
                                            "end_pos": "3",
                                            "rec_node_type": "sil"
                                        },
                                        "beg_pos": "0",
                                        "content": "sil",
                                        "dp_message": "0",
                                        "end_pos": "3",
                                        "rec_node_type": "sil"
                                    }, {
                                        "symbol": "wo3",
                                        "time_len": "0",
                                        "phone": [{
                                            "content": "_u",
                                            "dp_message": "16",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper"
                                        }, {
                                            "is_yun": "1",
                                            "mono_tone": "TONE3",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "content": "uo",
                                            "dp_message": "16"
                                        }],
                                        "beg_pos": "3",
                                        "content": "我",
                                        "dp_message": "16",
                                        "end_pos": "3",
                                        "rec_node_type": "paper"
                                    }],
                                    "beg_pos": "0",
                                    "content": "我",
                                    "end_pos": "3",
                                    "symbol": "wo3",
                                    "time_len": "3"
                                }, {
                                    "symbol": "de5",
                                    "time_len": "0",
                                    "syll": {
                                        "content": "的",
                                        "dp_message": "16",
                                        "end_pos": "3",
                                        "rec_node_type": "paper",
                                        "symbol": "de0",
                                        "time_len": "0",
                                        "phone": [{
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "content": "d",
                                            "dp_message": "16"
                                        }, {
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "content": "e",
                                            "dp_message": "16",
                                            "is_yun": "1",
                                            "mono_tone": "TONE0"
                                        }],
                                        "beg_pos": "3"
                                    },
                                    "beg_pos": "3",
                                    "content": "的",
                                    "end_pos": "3"
                                }, {
                                    "beg_pos": "3",
                                    "content": "名",
                                    "end_pos": "50",
                                    "symbol": "ming2",
                                    "time_len": "47",
                                    "syll": {
                                        "beg_pos": "3",
                                        "content": "名",
                                        "dp_message": "0",
                                        "end_pos": "50",
                                        "rec_node_type": "paper",
                                        "symbol": "ming2",
                                        "time_len": "47",
                                        "phone": [{
                                            "beg_pos": "3",
                                            "content": "m",
                                            "dp_message": "0",
                                            "end_pos": "34",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "31"
                                        }, {
                                            "beg_pos": "34",
                                            "content": "ing",
                                            "dp_message": "0",
                                            "end_pos": "50",
                                            "is_yun": "1",
                                            "mono_tone": "TONE2",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "16"
                                        }]
                                    }
                                }, {
                                    "beg_pos": "50",
                                    "content": "字",
                                    "end_pos": "91",
                                    "symbol": "zi9",
                                    "time_len": "41",
                                    "syll": {
                                        "phone": [{
                                            "content": "z",
                                            "dp_message": "0",
                                            "end_pos": "60",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "10",
                                            "beg_pos": "50"
                                        }, {
                                            "time_len": "31",
                                            "perr_level_msg": "0",
                                            "content": "ii",
                                            "dp_message": "0",
                                            "end_pos": "91",
                                            "is_yun": "1",
                                            "mono_tone": "TONE0",
                                            "rec_node_type": "paper",
                                            "beg_pos": "60"
                                        }],
                                        "beg_pos": "50",
                                        "content": "字",
                                        "dp_message": "0",
                                        "end_pos": "91",
                                        "rec_node_type": "paper",
                                        "symbol": "zi0",
                                        "time_len": "41"
                                    }
                                }, {
                                    "time_len": "39",
                                    "syll": {
                                        "phone": [{
                                            "content": "sh",
                                            "dp_message": "0",
                                            "end_pos": "106",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "15",
                                            "beg_pos": "91"
                                        }, {
                                            "is_yun": "1",
                                            "mono_tone": "TONE4",
                                            "perr_level_msg": "0",
                                            "time_len": "24",
                                            "content": "iii",
                                            "dp_message": "0",
                                            "end_pos": "130",
                                            "rec_node_type": "paper",
                                            "beg_pos": "106"
                                        }],
                                        "beg_pos": "91",
                                        "content": "是",
                                        "dp_message": "0",
                                        "end_pos": "130",
                                        "rec_node_type": "paper",
                                        "symbol": "shi4",
                                        "time_len": "39"
                                    },
                                    "beg_pos": "91",
                                    "content": "是",
                                    "end_pos": "130",
                                    "symbol": "shi4"
                                }, {
                                    "time_len": "24",
                                    "syll": {
                                        "phone": [{
                                            "content": "zh",
                                            "dp_message": "0",
                                            "end_pos": "136",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "6",
                                            "beg_pos": "130"
                                        }, {
                                            "content": "ang",
                                            "dp_message": "0",
                                            "end_pos": "154",
                                            "is_yun": "1",
                                            "mono_tone": "TONE1",
                                            "time_len": "18",
                                            "beg_pos": "136",
                                            "rec_node_type": "paper",
                                            "perr_level_msg": "0"
                                        }],
                                        "beg_pos": "130",
                                        "content": "张",
                                        "dp_message": "0",
                                        "end_pos": "154",
                                        "rec_node_type": "paper",
                                        "symbol": "zhang1",
                                        "time_len": "24"
                                    },
                                    "beg_pos": "130",
                                    "content": "张",
                                    "end_pos": "154",
                                    "symbol": "zhang1"
                                }, {
                                    "time_len": "65",
                                    "syll": [{
                                        "beg_pos": "154",
                                        "content": "三",
                                        "dp_message": "0",
                                        "end_pos": "190",
                                        "rec_node_type": "paper",
                                        "symbol": "san1",
                                        "time_len": "36",
                                        "phone": [{
                                            "beg_pos": "154",
                                            "content": "s",
                                            "dp_message": "0",
                                            "end_pos": "164",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "10"
                                        }, {
                                            "content": "an",
                                            "dp_message": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "beg_pos": "164",
                                            "end_pos": "190",
                                            "is_yun": "1",
                                            "mono_tone": "TONE1",
                                            "time_len": "26"
                                        }]
                                    }, {
                                        "phone": {
                                            "beg_pos": "190",
                                            "content": "sil",
                                            "end_pos": "219",
                                            "time_len": "29"
                                        },
                                        "beg_pos": "190",
                                        "content": "sil",
                                        "dp_message": "0",
                                        "end_pos": "219",
                                        "rec_node_type": "sil",
                                        "time_len": "29"
                                    }],
                                    "beg_pos": "154",
                                    "content": "三",
                                    "end_pos": "219",
                                    "symbol": "san1"
                                }],
                                "beg_pos": "0"
                            },
                            "beg_pos": "0",
                            "content": "我的名字是张三",
                            "end_pos": "219",
                            "except_info": "0",
                            "is_rejected": "false",
                            "time_len": "219",
                            "total_score": "59.576626"
                        }
                    },
                    "rec_tree": {
                        "read_sentence": {
                            "beg_pos": "0",
                            "content": "我的名字是张三",
                            "end_pos": "219",
                            "time_len": "219",
                            "sentence": {
                                "beg_pos": "0",
                                "content": "我的名字是张三",
                                "end_pos": "219",
                                "time_len": "219",
                                "word": [{
                                    "symbol": "wo3",
                                    "time_len": "3",
                                    "syll": [{
                                        "phone": {
                                            "rec_node_type": "sil",
                                            "time_len": "3",
                                            "beg_pos": "0",
                                            "content": "sil",
                                            "dp_message": "0",
                                            "end_pos": "3"
                                        },
                                        "beg_pos": "0",
                                        "content": "sil",
                                        "dp_message": "0",
                                        "end_pos": "3",
                                        "rec_node_type": "sil",
                                        "time_len": "3"
                                    }, {
                                        "phone": [{
                                            "dp_message": "16",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "content": "_u"
                                        }, {
                                            "rec_node_type": "paper",
                                            "content": "uo",
                                            "dp_message": "16",
                                            "is_yun": "1",
                                            "mono_tone": "TONE3",
                                            "perr_level_msg": "0"
                                        }],
                                        "beg_pos": "3",
                                        "content": "我",
                                        "dp_message": "16",
                                        "end_pos": "3",
                                        "rec_node_type": "paper",
                                        "symbol": "wo3",
                                        "time_len": "0"
                                    }],
                                    "beg_pos": "0",
                                    "content": "我",
                                    "end_pos": "3"
                                }, {
                                    "syll": {
                                        "dp_message": "16",
                                        "end_pos": "3",
                                        "rec_node_type": "paper",
                                        "symbol": "de0",
                                        "time_len": "0",
                                        "phone": [{
                                            "rec_node_type": "paper",
                                            "content": "d",
                                            "dp_message": "16",
                                            "is_yun": "0",
                                            "perr_level_msg": "0"
                                        }, {
                                            "content": "e",
                                            "dp_message": "16",
                                            "is_yun": "1",
                                            "mono_tone": "TONE0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper"
                                        }],
                                        "beg_pos": "3",
                                        "content": "的"
                                    },
                                    "beg_pos": "3",
                                    "content": "的",
                                    "end_pos": "3",
                                    "symbol": "de5",
                                    "time_len": "0"
                                }, {
                                    "beg_pos": "3",
                                    "content": "名",
                                    "end_pos": "50",
                                    "symbol": "ming2",
                                    "time_len": "47",
                                    "syll": {
                                        "time_len": "47",
                                        "phone": [{
                                            "end_pos": "34",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "31",
                                            "beg_pos": "3",
                                            "content": "m",
                                            "dp_message": "0"
                                        }, {
                                            "time_len": "16",
                                            "is_yun": "1",
                                            "mono_tone": "TONE2",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "beg_pos": "34",
                                            "content": "ing",
                                            "dp_message": "0",
                                            "end_pos": "50"
                                        }],
                                        "beg_pos": "3",
                                        "content": "名",
                                        "dp_message": "0",
                                        "end_pos": "50",
                                        "rec_node_type": "paper",
                                        "symbol": "ming2"
                                    }
                                }, {
                                    "end_pos": "91",
                                    "symbol": "zi9",
                                    "time_len": "41",
                                    "syll": {
                                        "end_pos": "91",
                                        "rec_node_type": "paper",
                                        "symbol": "zi0",
                                        "time_len": "41",
                                        "phone": [{
                                            "content": "z",
                                            "dp_message": "0",
                                            "end_pos": "60",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "10",
                                            "beg_pos": "50"
                                        }, {
                                            "beg_pos": "60",
                                            "dp_message": "0",
                                            "end_pos": "91",
                                            "content": "ii",
                                            "is_yun": "1",
                                            "mono_tone": "TONE0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "31"
                                        }],
                                        "beg_pos": "50",
                                        "content": "字",
                                        "dp_message": "0"
                                    },
                                    "beg_pos": "50",
                                    "content": "字"
                                }, {
                                    "end_pos": "130",
                                    "symbol": "shi4",
                                    "time_len": "39",
                                    "syll": {
                                        "end_pos": "130",
                                        "rec_node_type": "paper",
                                        "symbol": "shi4",
                                        "time_len": "39",
                                        "phone": [{
                                            "rec_node_type": "paper",
                                            "time_len": "15",
                                            "beg_pos": "91",
                                            "content": "sh",
                                            "dp_message": "0",
                                            "end_pos": "106",
                                            "is_yun": "0",
                                            "perr_level_msg": "0"
                                        }, {
                                            "is_yun": "1",
                                            "rec_node_type": "paper",
                                            "time_len": "24",
                                            "dp_message": "0",
                                            "content": "iii",
                                            "end_pos": "130",
                                            "mono_tone": "TONE4",
                                            "perr_level_msg": "0",
                                            "beg_pos": "106"
                                        }],
                                        "beg_pos": "91",
                                        "content": "是",
                                        "dp_message": "0"
                                    },
                                    "beg_pos": "91",
                                    "content": "是"
                                }, {
                                    "beg_pos": "130",
                                    "content": "张",
                                    "end_pos": "154",
                                    "symbol": "zhang1",
                                    "time_len": "24",
                                    "syll": {
                                        "end_pos": "154",
                                        "rec_node_type": "paper",
                                        "symbol": "zhang1",
                                        "time_len": "24",
                                        "phone": [{
                                            "content": "zh",
                                            "dp_message": "0",
                                            "end_pos": "136",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "6",
                                            "beg_pos": "130"
                                        }, {
                                            "is_yun": "1",
                                            "mono_tone": "TONE1",
                                            "rec_node_type": "paper",
                                            "time_len": "18",
                                            "dp_message": "0",
                                            "content": "ang",
                                            "end_pos": "154",
                                            "perr_level_msg": "0",
                                            "beg_pos": "136"
                                        }],
                                        "beg_pos": "130",
                                        "content": "张",
                                        "dp_message": "0"
                                    }
                                }, {
                                    "symbol": "san1",
                                    "time_len": "65",
                                    "syll": [{
                                        "time_len": "36",
                                        "phone": [{
                                            "end_pos": "164",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "10",
                                            "beg_pos": "154",
                                            "content": "s",
                                            "dp_message": "0"
                                        }, {
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "beg_pos": "164",
                                            "end_pos": "190",
                                            "mono_tone": "TONE1",
                                            "time_len": "26",
                                            "content": "an",
                                            "dp_message": "0",
                                            "is_yun": "1"
                                        }],
                                        "beg_pos": "154",
                                        "content": "三",
                                        "dp_message": "0",
                                        "end_pos": "190",
                                        "rec_node_type": "paper",
                                        "symbol": "san1"
                                    }, {
                                        "rec_node_type": "sil",
                                        "time_len": "29",
                                        "phone": {
                                            "beg_pos": "190",
                                            "content": "sil",
                                            "end_pos": "219",
                                            "time_len": "29"
                                        },
                                        "beg_pos": "190",
                                        "content": "sil",
                                        "dp_message": "0",
                                        "end_pos": "219"
                                    }],
                                    "beg_pos": "154",
                                    "content": "三",
                                    "end_pos": "219"
                                }]
                            }
                        }
                    },
                    "lan": "cn",
                    "type": "study"
                }
            },
            "code": "0",
            "desc": "success",
            "sid": "wse00ff7b2f@dxad5e13117c706f1a00"
        },

        {
            "data": {
                "read_sentence": {
                    "lan": "cn",
                    "type": "study",
                    "version": "6,5,0,1028",
                    "rec_paper": {
                        "read_sentence": {
                            "total_score": "80.014328",
                            "sentence": {
                                "total_score": "80.014328",
                                "word": [{
                                    "beg_pos": "0",
                                    "content": "我",
                                    "end_pos": "28",
                                    "symbol": "wo3",
                                    "time_len": "28",
                                    "syll": [{
                                        "beg_pos": "0",
                                        "content": "fil",
                                        "dp_message": "32",
                                        "end_pos": "1",
                                        "rec_node_type": "fil",
                                        "time_len": "1",
                                        "phone": {
                                            "beg_pos": "0",
                                            "content": "fil",
                                            "dp_message": "32",
                                            "end_pos": "1",
                                            "rec_node_type": "fil",
                                            "time_len": "1"
                                        }
                                    }, {
                                        "time_len": "27",
                                        "phone": [{
                                            "end_pos": "4",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "3",
                                            "beg_pos": "1",
                                            "content": "_u",
                                            "dp_message": "0"
                                        }, {
                                            "perr_level_msg": "0",
                                            "time_len": "24",
                                            "dp_message": "0",
                                            "end_pos": "28",
                                            "is_yun": "1",
                                            "mono_tone": "TONE3",
                                            "beg_pos": "4",
                                            "content": "uo",
                                            "rec_node_type": "paper"
                                        }],
                                        "beg_pos": "1",
                                        "content": "我",
                                        "dp_message": "0",
                                        "end_pos": "28",
                                        "rec_node_type": "paper",
                                        "symbol": "wo3"
                                    }]
                                }, {
                                    "end_pos": "52",
                                    "symbol": "de5",
                                    "time_len": "24",
                                    "syll": {
                                        "rec_node_type": "paper",
                                        "symbol": "de0",
                                        "time_len": "24",
                                        "phone": [{
                                            "time_len": "6",
                                            "beg_pos": "28",
                                            "content": "d",
                                            "dp_message": "0",
                                            "end_pos": "34",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper"
                                        }, {
                                            "content": "e",
                                            "is_yun": "1",
                                            "mono_tone": "TONE0",
                                            "rec_node_type": "paper",
                                            "beg_pos": "34",
                                            "dp_message": "0",
                                            "end_pos": "52",
                                            "perr_level_msg": "0",
                                            "time_len": "18"
                                        }],
                                        "beg_pos": "28",
                                        "content": "的",
                                        "dp_message": "0",
                                        "end_pos": "52"
                                    },
                                    "beg_pos": "28",
                                    "content": "的"
                                }, {
                                    "symbol": "ming2",
                                    "time_len": "26",
                                    "syll": {
                                        "content": "名",
                                        "dp_message": "0",
                                        "end_pos": "78",
                                        "rec_node_type": "paper",
                                        "symbol": "ming2",
                                        "time_len": "26",
                                        "phone": [{
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "12",
                                            "beg_pos": "52",
                                            "content": "m",
                                            "dp_message": "0",
                                            "end_pos": "64",
                                            "is_yun": "0"
                                        }, {
                                            "beg_pos": "64",
                                            "dp_message": "0",
                                            "end_pos": "78",
                                            "mono_tone": "TONE2",
                                            "content": "ing",
                                            "is_yun": "1",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "14"
                                        }],
                                        "beg_pos": "52"
                                    },
                                    "beg_pos": "52",
                                    "content": "名",
                                    "end_pos": "78"
                                }, {
                                    "time_len": "28",
                                    "syll": {
                                        "beg_pos": "78",
                                        "content": "字",
                                        "dp_message": "0",
                                        "end_pos": "106",
                                        "rec_node_type": "paper",
                                        "symbol": "zi0",
                                        "time_len": "28",
                                        "phone": [{
                                            "beg_pos": "78",
                                            "content": "z",
                                            "dp_message": "0",
                                            "end_pos": "86",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "8"
                                        }, {
                                            "content": "ii",
                                            "end_pos": "106",
                                            "rec_node_type": "paper",
                                            "beg_pos": "86",
                                            "dp_message": "0",
                                            "is_yun": "1",
                                            "mono_tone": "TONE0",
                                            "perr_level_msg": "0",
                                            "time_len": "20"
                                        }]
                                    },
                                    "beg_pos": "78",
                                    "content": "字",
                                    "end_pos": "106",
                                    "symbol": "zi9"
                                }, {
                                    "beg_pos": "106",
                                    "content": "是",
                                    "end_pos": "134",
                                    "symbol": "shi4",
                                    "time_len": "28",
                                    "syll": {
                                        "end_pos": "134",
                                        "rec_node_type": "paper",
                                        "symbol": "shi4",
                                        "time_len": "28",
                                        "phone": [{
                                            "rec_node_type": "paper",
                                            "time_len": "14",
                                            "beg_pos": "106",
                                            "content": "sh",
                                            "dp_message": "0",
                                            "end_pos": "120",
                                            "is_yun": "0",
                                            "perr_level_msg": "0"
                                        }, {
                                            "end_pos": "134",
                                            "is_yun": "1",
                                            "mono_tone": "TONE4",
                                            "time_len": "14",
                                            "content": "iii",
                                            "dp_message": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "beg_pos": "120"
                                        }],
                                        "beg_pos": "106",
                                        "content": "是",
                                        "dp_message": "0"
                                    }
                                }, {
                                    "beg_pos": "134",
                                    "content": "张",
                                    "end_pos": "162",
                                    "symbol": "zhang1",
                                    "time_len": "28",
                                    "syll": {
                                        "end_pos": "162",
                                        "rec_node_type": "paper",
                                        "symbol": "zhang1",
                                        "time_len": "28",
                                        "phone": [{
                                            "content": "zh",
                                            "dp_message": "0",
                                            "end_pos": "146",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "12",
                                            "beg_pos": "134"
                                        }, {
                                            "content": "ang",
                                            "dp_message": "0",
                                            "end_pos": "162",
                                            "is_yun": "1",
                                            "mono_tone": "TONE1",
                                            "time_len": "16",
                                            "beg_pos": "146",
                                            "rec_node_type": "paper",
                                            "perr_level_msg": "0"
                                        }],
                                        "beg_pos": "134",
                                        "content": "张",
                                        "dp_message": "0"
                                    }
                                }, {
                                    "symbol": "san1",
                                    "time_len": "50",
                                    "syll": [{
                                        "time_len": "32",
                                        "phone": [{
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "10",
                                            "beg_pos": "162",
                                            "content": "s",
                                            "dp_message": "0",
                                            "end_pos": "172"
                                        }, {
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "22",
                                            "beg_pos": "172",
                                            "end_pos": "194",
                                            "mono_tone": "TONE1",
                                            "content": "an",
                                            "dp_message": "0",
                                            "is_yun": "1"
                                        }],
                                        "beg_pos": "162",
                                        "content": "三",
                                        "dp_message": "0",
                                        "end_pos": "194",
                                        "rec_node_type": "paper",
                                        "symbol": "san1"
                                    }, {
                                        "phone": {
                                            "beg_pos": "194",
                                            "content": "sil",
                                            "end_pos": "212",
                                            "time_len": "18"
                                        },
                                        "beg_pos": "194",
                                        "content": "sil",
                                        "dp_message": "0",
                                        "end_pos": "212",
                                        "rec_node_type": "sil",
                                        "time_len": "18"
                                    }],
                                    "beg_pos": "162",
                                    "content": "三",
                                    "end_pos": "212"
                                }],
                                "beg_pos": "0",
                                "content": "我的名字是张三",
                                "end_pos": "212",
                                "time_len": "212"
                            },
                            "beg_pos": "0",
                            "content": "我的名字是张三",
                            "end_pos": "212",
                            "except_info": "0",
                            "is_rejected": "false",
                            "time_len": "212"
                        }
                    },
                    "rec_tree": {
                        "read_sentence": {
                            "beg_pos": "0",
                            "content": "我的名字是张三",
                            "end_pos": "212",
                            "time_len": "212",
                            "sentence": {
                                "beg_pos": "0",
                                "content": "我的名字是张三",
                                "end_pos": "212",
                                "time_len": "212",
                                "word": [{
                                    "end_pos": "28",
                                    "symbol": "wo3",
                                    "time_len": "28",
                                    "syll": [{
                                        "end_pos": "1",
                                        "rec_node_type": "fil",
                                        "time_len": "1",
                                        "phone": {
                                            "beg_pos": "0",
                                            "content": "fil",
                                            "dp_message": "32",
                                            "end_pos": "1",
                                            "rec_node_type": "fil",
                                            "time_len": "1"
                                        },
                                        "beg_pos": "0",
                                        "content": "fil",
                                        "dp_message": "32"
                                    }, {
                                        "end_pos": "28",
                                        "rec_node_type": "paper",
                                        "symbol": "wo3",
                                        "time_len": "27",
                                        "phone": [{
                                            "rec_node_type": "paper",
                                            "time_len": "3",
                                            "beg_pos": "1",
                                            "content": "_u",
                                            "dp_message": "0",
                                            "end_pos": "4",
                                            "is_yun": "0",
                                            "perr_level_msg": "0"
                                        }, {
                                            "is_yun": "1",
                                            "time_len": "24",
                                            "dp_message": "0",
                                            "content": "uo",
                                            "end_pos": "28",
                                            "mono_tone": "TONE3",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "beg_pos": "4"
                                        }],
                                        "beg_pos": "1",
                                        "content": "我",
                                        "dp_message": "0"
                                    }],
                                    "beg_pos": "0",
                                    "content": "我"
                                }, {
                                    "beg_pos": "28",
                                    "content": "的",
                                    "end_pos": "52",
                                    "symbol": "de5",
                                    "time_len": "24",
                                    "syll": {
                                        "end_pos": "52",
                                        "rec_node_type": "paper",
                                        "symbol": "de0",
                                        "time_len": "24",
                                        "phone": [{
                                            "content": "d",
                                            "dp_message": "0",
                                            "end_pos": "34",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "6",
                                            "beg_pos": "28"
                                        }, {
                                            "content": "e",
                                            "is_yun": "1",
                                            "mono_tone": "TONE0",
                                            "beg_pos": "34",
                                            "end_pos": "52",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "18",
                                            "dp_message": "0"
                                        }],
                                        "beg_pos": "28",
                                        "content": "的",
                                        "dp_message": "0"
                                    }
                                }, {
                                    "time_len": "26",
                                    "syll": {
                                        "phone": [{
                                            "rec_node_type": "paper",
                                            "time_len": "12",
                                            "beg_pos": "52",
                                            "content": "m",
                                            "dp_message": "0",
                                            "end_pos": "64",
                                            "is_yun": "0",
                                            "perr_level_msg": "0"
                                        }, {
                                            "content": "ing",
                                            "dp_message": "0",
                                            "end_pos": "78",
                                            "mono_tone": "TONE2",
                                            "beg_pos": "64",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "14",
                                            "is_yun": "1"
                                        }],
                                        "beg_pos": "52",
                                        "content": "名",
                                        "dp_message": "0",
                                        "end_pos": "78",
                                        "rec_node_type": "paper",
                                        "symbol": "ming2",
                                        "time_len": "26"
                                    },
                                    "beg_pos": "52",
                                    "content": "名",
                                    "end_pos": "78",
                                    "symbol": "ming2"
                                }, {
                                    "content": "字",
                                    "end_pos": "106",
                                    "symbol": "zi9",
                                    "time_len": "28",
                                    "syll": {
                                        "dp_message": "0",
                                        "end_pos": "106",
                                        "rec_node_type": "paper",
                                        "symbol": "zi0",
                                        "time_len": "28",
                                        "phone": [{
                                            "end_pos": "86",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "8",
                                            "beg_pos": "78",
                                            "content": "z",
                                            "dp_message": "0"
                                        }, {
                                            "mono_tone": "TONE0",
                                            "beg_pos": "86",
                                            "end_pos": "106",
                                            "is_yun": "1",
                                            "rec_node_type": "paper",
                                            "time_len": "20",
                                            "content": "ii",
                                            "dp_message": "0",
                                            "perr_level_msg": "0"
                                        }],
                                        "beg_pos": "78",
                                        "content": "字"
                                    },
                                    "beg_pos": "78"
                                }, {
                                    "symbol": "shi4",
                                    "time_len": "28",
                                    "syll": {
                                        "content": "是",
                                        "dp_message": "0",
                                        "end_pos": "134",
                                        "rec_node_type": "paper",
                                        "symbol": "shi4",
                                        "time_len": "28",
                                        "phone": [{
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "14",
                                            "beg_pos": "106",
                                            "content": "sh",
                                            "dp_message": "0",
                                            "end_pos": "120",
                                            "is_yun": "0"
                                        }, {
                                            "content": "iii",
                                            "is_yun": "1",
                                            "perr_level_msg": "0",
                                            "time_len": "14",
                                            "beg_pos": "120",
                                            "dp_message": "0",
                                            "end_pos": "134",
                                            "mono_tone": "TONE4",
                                            "rec_node_type": "paper"
                                        }],
                                        "beg_pos": "106"
                                    },
                                    "beg_pos": "106",
                                    "content": "是",
                                    "end_pos": "134"
                                }, {
                                    "symbol": "zhang1",
                                    "time_len": "28",
                                    "syll": {
                                        "content": "张",
                                        "dp_message": "0",
                                        "end_pos": "162",
                                        "rec_node_type": "paper",
                                        "symbol": "zhang1",
                                        "time_len": "28",
                                        "phone": [{
                                            "dp_message": "0",
                                            "end_pos": "146",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "12",
                                            "beg_pos": "134",
                                            "content": "zh"
                                        }, {
                                            "dp_message": "0",
                                            "is_yun": "1",
                                            "rec_node_type": "paper",
                                            "time_len": "16",
                                            "beg_pos": "146",
                                            "content": "ang",
                                            "end_pos": "162",
                                            "mono_tone": "TONE1",
                                            "perr_level_msg": "0"
                                        }],
                                        "beg_pos": "134"
                                    },
                                    "beg_pos": "134",
                                    "content": "张",
                                    "end_pos": "162"
                                }, {
                                    "beg_pos": "162",
                                    "content": "三",
                                    "end_pos": "212",
                                    "symbol": "san1",
                                    "time_len": "50",
                                    "syll": [{
                                        "end_pos": "194",
                                        "rec_node_type": "paper",
                                        "symbol": "san1",
                                        "time_len": "32",
                                        "phone": [{
                                            "content": "s",
                                            "dp_message": "0",
                                            "end_pos": "172",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "10",
                                            "beg_pos": "162"
                                        }, {
                                            "beg_pos": "172",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "22",
                                            "content": "an",
                                            "dp_message": "0",
                                            "end_pos": "194",
                                            "is_yun": "1",
                                            "mono_tone": "TONE1"
                                        }],
                                        "beg_pos": "162",
                                        "content": "三",
                                        "dp_message": "0"
                                    }, {
                                        "time_len": "18",
                                        "phone": {
                                            "beg_pos": "194",
                                            "content": "sil",
                                            "end_pos": "212",
                                            "time_len": "18"
                                        },
                                        "beg_pos": "194",
                                        "content": "sil",
                                        "dp_message": "0",
                                        "end_pos": "212",
                                        "rec_node_type": "sil"
                                    }]
                                }]
                            }
                        }
                    }
                }
            },
            "code": "0",
            "desc": "success",
            "sid": "wse00ff7b5a@dxad5e13117c936f1a00"
        },

        {
            "data": {
                "read_sentence": {
                    "lan": "cn",
                    "type": "study",
                    "version": "6,5,0,1028",
                    "rec_paper": {
                        "read_sentence": {
                            "time_len": "210",
                            "total_score": "15.965686",
                            "sentence": [{
                                "end_pos": "0",
                                "time_len": "0",
                                "total_score": "15.965686",
                                "word": [{
                                    "time_len": "0",
                                    "syll": {
                                        "phone": [{
                                            "content": "_u",
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "0",
                                            "beg_pos": "0"
                                        }, {
                                            "content": "uo",
                                            "end_pos": "0",
                                            "is_yun": "1",
                                            "mono_tone": "TONE3",
                                            "beg_pos": "0",
                                            "dp_message": "16",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "0"
                                        }],
                                        "beg_pos": "0",
                                        "content": "我",
                                        "dp_message": "16",
                                        "end_pos": "0",
                                        "rec_node_type": "paper",
                                        "symbol": "wo3",
                                        "time_len": "0"
                                    },
                                    "beg_pos": "0",
                                    "content": "我",
                                    "end_pos": "0",
                                    "symbol": "wo3"
                                }, {
                                    "end_pos": "0",
                                    "symbol": "de5",
                                    "time_len": "0",
                                    "syll": {
                                        "rec_node_type": "paper",
                                        "symbol": "de5",
                                        "time_len": "0",
                                        "phone": [{
                                            "beg_pos": "0",
                                            "content": "d",
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "0"
                                        }, {
                                            "beg_pos": "0",
                                            "content": "e",
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "is_yun": "1",
                                            "mono_tone": "TONE0",
                                            "rec_node_type": "paper",
                                            "perr_level_msg": "0",
                                            "time_len": "0"
                                        }],
                                        "beg_pos": "0",
                                        "content": "的",
                                        "dp_message": "16",
                                        "end_pos": "0"
                                    },
                                    "beg_pos": "0",
                                    "content": "的"
                                }, {
                                    "beg_pos": "0",
                                    "content": "名",
                                    "end_pos": "0",
                                    "symbol": "ming2",
                                    "time_len": "0",
                                    "syll": {
                                        "rec_node_type": "paper",
                                        "symbol": "ming2",
                                        "time_len": "0",
                                        "phone": [{
                                            "beg_pos": "0",
                                            "content": "m",
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "0"
                                        }, {
                                            "content": "ing",
                                            "dp_message": "16",
                                            "is_yun": "1",
                                            "rec_node_type": "paper",
                                            "time_len": "0",
                                            "beg_pos": "0",
                                            "end_pos": "0",
                                            "mono_tone": "TONE2",
                                            "perr_level_msg": "0"
                                        }],
                                        "beg_pos": "0",
                                        "content": "名",
                                        "dp_message": "16",
                                        "end_pos": "0"
                                    }
                                }, {
                                    "beg_pos": "0",
                                    "content": "字",
                                    "end_pos": "0",
                                    "symbol": "zi9",
                                    "time_len": "0",
                                    "syll": {
                                        "rec_node_type": "paper",
                                        "symbol": "zi9",
                                        "time_len": "0",
                                        "phone": [{
                                            "beg_pos": "0",
                                            "content": "z",
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "0"
                                        }, {
                                            "content": "ii",
                                            "end_pos": "0",
                                            "is_yun": "1",
                                            "perr_level_msg": "0",
                                            "time_len": "0",
                                            "beg_pos": "0",
                                            "dp_message": "16",
                                            "mono_tone": "TONE0",
                                            "rec_node_type": "paper"
                                        }],
                                        "beg_pos": "0",
                                        "content": "字",
                                        "dp_message": "16",
                                        "end_pos": "0"
                                    }
                                }, {
                                    "content": "是",
                                    "end_pos": "0",
                                    "symbol": "shi4",
                                    "time_len": "0",
                                    "syll": {
                                        "symbol": "shi4",
                                        "time_len": "0",
                                        "phone": [{
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "0",
                                            "beg_pos": "0",
                                            "content": "sh"
                                        }, {
                                            "content": "iii",
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "mono_tone": "TONE4",
                                            "beg_pos": "0",
                                            "is_yun": "1",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "0"
                                        }],
                                        "beg_pos": "0",
                                        "content": "是",
                                        "dp_message": "16",
                                        "end_pos": "0",
                                        "rec_node_type": "paper"
                                    },
                                    "beg_pos": "0"
                                }, {
                                    "beg_pos": "0",
                                    "content": "张",
                                    "end_pos": "0",
                                    "symbol": "zhang1",
                                    "time_len": "0",
                                    "syll": {
                                        "end_pos": "0",
                                        "rec_node_type": "paper",
                                        "symbol": "zhang1",
                                        "time_len": "0",
                                        "phone": [{
                                            "content": "zh",
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "0",
                                            "beg_pos": "0"
                                        }, {
                                            "is_yun": "1",
                                            "time_len": "0",
                                            "content": "ang",
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "mono_tone": "TONE1",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "beg_pos": "0"
                                        }],
                                        "beg_pos": "0",
                                        "content": "张",
                                        "dp_message": "16"
                                    }
                                }, {
                                    "time_len": "0",
                                    "syll": {
                                        "beg_pos": "0",
                                        "content": "三",
                                        "dp_message": "16",
                                        "end_pos": "0",
                                        "rec_node_type": "paper",
                                        "symbol": "san1",
                                        "time_len": "0",
                                        "phone": [{
                                            "beg_pos": "0",
                                            "content": "s",
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "0"
                                        }, {
                                            "dp_message": "16",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "0",
                                            "beg_pos": "0",
                                            "content": "an",
                                            "end_pos": "0",
                                            "is_yun": "1",
                                            "mono_tone": "TONE1"
                                        }]
                                    },
                                    "beg_pos": "0",
                                    "content": "三",
                                    "end_pos": "0",
                                    "symbol": "san1"
                                }],
                                "beg_pos": "0",
                                "content": "我的名字是张三"
                            }, {
                                "content": "天真",
                                "end_pos": "0",
                                "time_len": "0",
                                "total_score": "15.965686",
                                "word": [{
                                    "syll": {
                                        "dp_message": "16",
                                        "end_pos": "0",
                                        "rec_node_type": "paper",
                                        "symbol": "tian1",
                                        "time_len": "0",
                                        "phone": [{
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "0",
                                            "beg_pos": "0",
                                            "content": "t",
                                            "dp_message": "16",
                                            "end_pos": "0"
                                        }, {
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "0",
                                            "end_pos": "0",
                                            "is_yun": "1",
                                            "mono_tone": "TONE1",
                                            "beg_pos": "0",
                                            "content": "ian",
                                            "dp_message": "16"
                                        }],
                                        "beg_pos": "0",
                                        "content": "天"
                                    },
                                    "beg_pos": "0",
                                    "content": "天",
                                    "end_pos": "0",
                                    "symbol": "tian1",
                                    "time_len": "0"
                                }, {
                                    "beg_pos": "0",
                                    "content": "真",
                                    "end_pos": "0",
                                    "symbol": "zhen1",
                                    "time_len": "0",
                                    "syll": {
                                        "end_pos": "0",
                                        "rec_node_type": "paper",
                                        "symbol": "zhen1",
                                        "time_len": "0",
                                        "phone": [{
                                            "rec_node_type": "paper",
                                            "time_len": "0",
                                            "beg_pos": "0",
                                            "content": "zh",
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "is_yun": "0",
                                            "perr_level_msg": "0"
                                        }, {
                                            "is_yun": "1",
                                            "mono_tone": "TONE1",
                                            "rec_node_type": "paper",
                                            "time_len": "0",
                                            "end_pos": "0",
                                            "content": "en",
                                            "dp_message": "16",
                                            "perr_level_msg": "0",
                                            "beg_pos": "0"
                                        }],
                                        "beg_pos": "0",
                                        "content": "真",
                                        "dp_message": "16"
                                    }
                                }],
                                "beg_pos": "0"
                            }],
                            "beg_pos": "0",
                            "content": "我的名字是张三天真",
                            "end_pos": "210",
                            "except_info": "28676",
                            "is_rejected": "true"
                        }
                    },
                    "rec_tree": {
                        "read_sentence": {
                            "time_len": "210",
                            "sentence": [{
                                "content": "我的名字是张三",
                                "end_pos": "0",
                                "time_len": "0",
                                "word": [{
                                    "end_pos": "0",
                                    "symbol": "wo3",
                                    "time_len": "0",
                                    "syll": {
                                        "rec_node_type": "paper",
                                        "symbol": "wo3",
                                        "time_len": "0",
                                        "phone": [{
                                            "beg_pos": "0",
                                            "content": "_u",
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "0"
                                        }, {
                                            "dp_message": "16",
                                            "is_yun": "1",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "0",
                                            "beg_pos": "0",
                                            "content": "uo",
                                            "end_pos": "0",
                                            "mono_tone": "TONE3"
                                        }],
                                        "beg_pos": "0",
                                        "content": "我",
                                        "dp_message": "16",
                                        "end_pos": "0"
                                    },
                                    "beg_pos": "0",
                                    "content": "我"
                                }, {
                                    "beg_pos": "0",
                                    "content": "的",
                                    "end_pos": "0",
                                    "symbol": "de5",
                                    "time_len": "0",
                                    "syll": {
                                        "end_pos": "0",
                                        "rec_node_type": "paper",
                                        "symbol": "de5",
                                        "time_len": "0",
                                        "phone": [{
                                            "rec_node_type": "paper",
                                            "time_len": "0",
                                            "beg_pos": "0",
                                            "content": "d",
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "is_yun": "0",
                                            "perr_level_msg": "0"
                                        }, {
                                            "content": "e",
                                            "dp_message": "16",
                                            "is_yun": "1",
                                            "mono_tone": "TONE0",
                                            "time_len": "0",
                                            "beg_pos": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "end_pos": "0"
                                        }],
                                        "beg_pos": "0",
                                        "content": "的",
                                        "dp_message": "16"
                                    }
                                }, {
                                    "beg_pos": "0",
                                    "content": "名",
                                    "end_pos": "0",
                                    "symbol": "ming2",
                                    "time_len": "0",
                                    "syll": {
                                        "end_pos": "0",
                                        "rec_node_type": "paper",
                                        "symbol": "ming2",
                                        "time_len": "0",
                                        "phone": [{
                                            "rec_node_type": "paper",
                                            "time_len": "0",
                                            "beg_pos": "0",
                                            "content": "m",
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "is_yun": "0",
                                            "perr_level_msg": "0"
                                        }, {
                                            "end_pos": "0",
                                            "perr_level_msg": "0",
                                            "content": "ing",
                                            "dp_message": "16",
                                            "is_yun": "1",
                                            "mono_tone": "TONE2",
                                            "rec_node_type": "paper",
                                            "time_len": "0",
                                            "beg_pos": "0"
                                        }],
                                        "beg_pos": "0",
                                        "content": "名",
                                        "dp_message": "16"
                                    }
                                }, {
                                    "content": "字",
                                    "end_pos": "0",
                                    "symbol": "zi9",
                                    "time_len": "0",
                                    "syll": {
                                        "symbol": "zi9",
                                        "time_len": "0",
                                        "phone": [{
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "0",
                                            "beg_pos": "0",
                                            "content": "z",
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "is_yun": "0"
                                        }, {
                                            "is_yun": "1",
                                            "time_len": "0",
                                            "beg_pos": "0",
                                            "end_pos": "0",
                                            "mono_tone": "TONE0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "content": "ii",
                                            "dp_message": "16"
                                        }],
                                        "beg_pos": "0",
                                        "content": "字",
                                        "dp_message": "16",
                                        "end_pos": "0",
                                        "rec_node_type": "paper"
                                    },
                                    "beg_pos": "0"
                                }, {
                                    "syll": {
                                        "dp_message": "16",
                                        "end_pos": "0",
                                        "rec_node_type": "paper",
                                        "symbol": "shi4",
                                        "time_len": "0",
                                        "phone": [{
                                            "end_pos": "0",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "0",
                                            "beg_pos": "0",
                                            "content": "sh",
                                            "dp_message": "16"
                                        }, {
                                            "mono_tone": "TONE4",
                                            "beg_pos": "0",
                                            "dp_message": "16",
                                            "is_yun": "1",
                                            "rec_node_type": "paper",
                                            "time_len": "0",
                                            "content": "iii",
                                            "end_pos": "0",
                                            "perr_level_msg": "0"
                                        }],
                                        "beg_pos": "0",
                                        "content": "是"
                                    },
                                    "beg_pos": "0",
                                    "content": "是",
                                    "end_pos": "0",
                                    "symbol": "shi4",
                                    "time_len": "0"
                                }, {
                                    "symbol": "zhang1",
                                    "time_len": "0",
                                    "syll": {
                                        "time_len": "0",
                                        "phone": [{
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "0",
                                            "beg_pos": "0",
                                            "content": "zh",
                                            "dp_message": "16",
                                            "end_pos": "0"
                                        }, {
                                            "content": "ang",
                                            "dp_message": "16",
                                            "mono_tone": "TONE1",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "0",
                                            "beg_pos": "0",
                                            "end_pos": "0",
                                            "is_yun": "1"
                                        }],
                                        "beg_pos": "0",
                                        "content": "张",
                                        "dp_message": "16",
                                        "end_pos": "0",
                                        "rec_node_type": "paper",
                                        "symbol": "zhang1"
                                    },
                                    "beg_pos": "0",
                                    "content": "张",
                                    "end_pos": "0"
                                }, {
                                    "content": "三",
                                    "end_pos": "0",
                                    "symbol": "san1",
                                    "time_len": "0",
                                    "syll": {
                                        "symbol": "san1",
                                        "time_len": "0",
                                        "phone": [{
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "0",
                                            "beg_pos": "0",
                                            "content": "s",
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "is_yun": "0"
                                        }, {
                                            "perr_level_msg": "0",
                                            "beg_pos": "0",
                                            "end_pos": "0",
                                            "is_yun": "1",
                                            "mono_tone": "TONE1",
                                            "rec_node_type": "paper",
                                            "time_len": "0",
                                            "content": "an",
                                            "dp_message": "16"
                                        }],
                                        "beg_pos": "0",
                                        "content": "三",
                                        "dp_message": "16",
                                        "end_pos": "0",
                                        "rec_node_type": "paper"
                                    },
                                    "beg_pos": "0"
                                }],
                                "beg_pos": "0"
                            }, {
                                "beg_pos": "0",
                                "content": "天真",
                                "end_pos": "0",
                                "time_len": "0",
                                "word": [{
                                    "end_pos": "0",
                                    "symbol": "tian1",
                                    "time_len": "0",
                                    "syll": {
                                        "end_pos": "0",
                                        "rec_node_type": "paper",
                                        "symbol": "tian1",
                                        "time_len": "0",
                                        "phone": [{
                                            "rec_node_type": "paper",
                                            "time_len": "0",
                                            "beg_pos": "0",
                                            "content": "t",
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "is_yun": "0",
                                            "perr_level_msg": "0"
                                        }, {
                                            "content": "ian",
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "mono_tone": "TONE1",
                                            "time_len": "0",
                                            "beg_pos": "0",
                                            "is_yun": "1",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper"
                                        }],
                                        "beg_pos": "0",
                                        "content": "天",
                                        "dp_message": "16"
                                    },
                                    "beg_pos": "0",
                                    "content": "天"
                                }, {
                                    "beg_pos": "0",
                                    "content": "真",
                                    "end_pos": "0",
                                    "symbol": "zhen1",
                                    "time_len": "0",
                                    "syll": {
                                        "content": "真",
                                        "dp_message": "16",
                                        "end_pos": "0",
                                        "rec_node_type": "paper",
                                        "symbol": "zhen1",
                                        "time_len": "0",
                                        "phone": [{
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "0",
                                            "beg_pos": "0",
                                            "content": "zh"
                                        }, {
                                            "is_yun": "1",
                                            "mono_tone": "TONE1",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "0",
                                            "content": "en",
                                            "end_pos": "0",
                                            "beg_pos": "0",
                                            "dp_message": "16"
                                        }],
                                        "beg_pos": "0"
                                    }
                                }]
                            }],
                            "beg_pos": "0",
                            "content": "我的名字是张三天真",
                            "end_pos": "210"
                        }
                    }
                }
            },
            "code": "0",
            "desc": "success",
            "sid": "wse00ff7319@dx5db613117cea6f2b00"
        },

        {
            "data": {
                "read_sentence": {
                    "lan": "cn",
                    "type": "study",
                    "version": "6,5,0,1028",
                    "rec_paper": {
                        "read_sentence": {
                            "time_len": "210",
                            "total_score": "15.965686",
                            "sentence": [{
                                "end_pos": "0",
                                "time_len": "0",
                                "total_score": "15.965686",
                                "word": [{
                                    "time_len": "0",
                                    "syll": {
                                        "phone": [{
                                            "content": "_u",
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "0",
                                            "beg_pos": "0"
                                        }, {
                                            "content": "uo",
                                            "end_pos": "0",
                                            "is_yun": "1",
                                            "mono_tone": "TONE3",
                                            "beg_pos": "0",
                                            "dp_message": "16",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "0"
                                        }],
                                        "beg_pos": "0",
                                        "content": "我",
                                        "dp_message": "16",
                                        "end_pos": "0",
                                        "rec_node_type": "paper",
                                        "symbol": "wo3",
                                        "time_len": "0"
                                    },
                                    "beg_pos": "0",
                                    "content": "我",
                                    "end_pos": "0",
                                    "symbol": "wo3"
                                }, {
                                    "end_pos": "0",
                                    "symbol": "de5",
                                    "time_len": "0",
                                    "syll": {
                                        "rec_node_type": "paper",
                                        "symbol": "de5",
                                        "time_len": "0",
                                        "phone": [{
                                            "beg_pos": "0",
                                            "content": "d",
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "0"
                                        }, {
                                            "beg_pos": "0",
                                            "content": "e",
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "is_yun": "1",
                                            "mono_tone": "TONE0",
                                            "rec_node_type": "paper",
                                            "perr_level_msg": "0",
                                            "time_len": "0"
                                        }],
                                        "beg_pos": "0",
                                        "content": "的",
                                        "dp_message": "16",
                                        "end_pos": "0"
                                    },
                                    "beg_pos": "0",
                                    "content": "的"
                                }, {
                                    "beg_pos": "0",
                                    "content": "名",
                                    "end_pos": "0",
                                    "symbol": "ming2",
                                    "time_len": "0",
                                    "syll": {
                                        "rec_node_type": "paper",
                                        "symbol": "ming2",
                                        "time_len": "0",
                                        "phone": [{
                                            "beg_pos": "0",
                                            "content": "m",
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "0"
                                        }, {
                                            "content": "ing",
                                            "dp_message": "16",
                                            "is_yun": "1",
                                            "rec_node_type": "paper",
                                            "time_len": "0",
                                            "beg_pos": "0",
                                            "end_pos": "0",
                                            "mono_tone": "TONE2",
                                            "perr_level_msg": "0"
                                        }],
                                        "beg_pos": "0",
                                        "content": "名",
                                        "dp_message": "16",
                                        "end_pos": "0"
                                    }
                                }, {
                                    "beg_pos": "0",
                                    "content": "字",
                                    "end_pos": "0",
                                    "symbol": "zi9",
                                    "time_len": "0",
                                    "syll": {
                                        "rec_node_type": "paper",
                                        "symbol": "zi9",
                                        "time_len": "0",
                                        "phone": [{
                                            "beg_pos": "0",
                                            "content": "z",
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "0"
                                        }, {
                                            "content": "ii",
                                            "end_pos": "0",
                                            "is_yun": "1",
                                            "perr_level_msg": "0",
                                            "time_len": "0",
                                            "beg_pos": "0",
                                            "dp_message": "16",
                                            "mono_tone": "TONE0",
                                            "rec_node_type": "paper"
                                        }],
                                        "beg_pos": "0",
                                        "content": "字",
                                        "dp_message": "16",
                                        "end_pos": "0"
                                    }
                                }, {
                                    "content": "是",
                                    "end_pos": "0",
                                    "symbol": "shi4",
                                    "time_len": "0",
                                    "syll": {
                                        "symbol": "shi4",
                                        "time_len": "0",
                                        "phone": [{
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "0",
                                            "beg_pos": "0",
                                            "content": "sh"
                                        }, {
                                            "content": "iii",
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "mono_tone": "TONE4",
                                            "beg_pos": "0",
                                            "is_yun": "1",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "0"
                                        }],
                                        "beg_pos": "0",
                                        "content": "是",
                                        "dp_message": "16",
                                        "end_pos": "0",
                                        "rec_node_type": "paper"
                                    },
                                    "beg_pos": "0"
                                }, {
                                    "beg_pos": "0",
                                    "content": "张",
                                    "end_pos": "0",
                                    "symbol": "zhang1",
                                    "time_len": "0",
                                    "syll": {
                                        "end_pos": "0",
                                        "rec_node_type": "paper",
                                        "symbol": "zhang1",
                                        "time_len": "0",
                                        "phone": [{
                                            "content": "zh",
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "0",
                                            "beg_pos": "0"
                                        }, {
                                            "is_yun": "1",
                                            "time_len": "0",
                                            "content": "ang",
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "mono_tone": "TONE1",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "beg_pos": "0"
                                        }],
                                        "beg_pos": "0",
                                        "content": "张",
                                        "dp_message": "16"
                                    }
                                }, {
                                    "time_len": "0",
                                    "syll": {
                                        "beg_pos": "0",
                                        "content": "三",
                                        "dp_message": "16",
                                        "end_pos": "0",
                                        "rec_node_type": "paper",
                                        "symbol": "san1",
                                        "time_len": "0",
                                        "phone": [{
                                            "beg_pos": "0",
                                            "content": "s",
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "0"
                                        }, {
                                            "dp_message": "16",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "0",
                                            "beg_pos": "0",
                                            "content": "an",
                                            "end_pos": "0",
                                            "is_yun": "1",
                                            "mono_tone": "TONE1"
                                        }]
                                    },
                                    "beg_pos": "0",
                                    "content": "三",
                                    "end_pos": "0",
                                    "symbol": "san1"
                                }],
                                "beg_pos": "0",
                                "content": "我的名字是张三"
                            }, {
                                "content": "天真",
                                "end_pos": "0",
                                "time_len": "0",
                                "total_score": "15.965686",
                                "word": [{
                                    "syll": {
                                        "dp_message": "16",
                                        "end_pos": "0",
                                        "rec_node_type": "paper",
                                        "symbol": "tian1",
                                        "time_len": "0",
                                        "phone": [{
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "0",
                                            "beg_pos": "0",
                                            "content": "t",
                                            "dp_message": "16",
                                            "end_pos": "0"
                                        }, {
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "0",
                                            "end_pos": "0",
                                            "is_yun": "1",
                                            "mono_tone": "TONE1",
                                            "beg_pos": "0",
                                            "content": "ian",
                                            "dp_message": "16"
                                        }],
                                        "beg_pos": "0",
                                        "content": "天"
                                    },
                                    "beg_pos": "0",
                                    "content": "天",
                                    "end_pos": "0",
                                    "symbol": "tian1",
                                    "time_len": "0"
                                }, {
                                    "beg_pos": "0",
                                    "content": "真",
                                    "end_pos": "0",
                                    "symbol": "zhen1",
                                    "time_len": "0",
                                    "syll": {
                                        "end_pos": "0",
                                        "rec_node_type": "paper",
                                        "symbol": "zhen1",
                                        "time_len": "0",
                                        "phone": [{
                                            "rec_node_type": "paper",
                                            "time_len": "0",
                                            "beg_pos": "0",
                                            "content": "zh",
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "is_yun": "0",
                                            "perr_level_msg": "0"
                                        }, {
                                            "is_yun": "1",
                                            "mono_tone": "TONE1",
                                            "rec_node_type": "paper",
                                            "time_len": "0",
                                            "end_pos": "0",
                                            "content": "en",
                                            "dp_message": "16",
                                            "perr_level_msg": "0",
                                            "beg_pos": "0"
                                        }],
                                        "beg_pos": "0",
                                        "content": "真",
                                        "dp_message": "16"
                                    }
                                }],
                                "beg_pos": "0"
                            }],
                            "beg_pos": "0",
                            "content": "我的名字是张三天真",
                            "end_pos": "210",
                            "except_info": "28676",
                            "is_rejected": "true"
                        }
                    },
                    "rec_tree": {
                        "read_sentence": {
                            "time_len": "210",
                            "sentence": [{
                                    "content": "我的名字是张三",
                                    "end_pos": "0",
                                    "time_len": "0",
                                    "word": [{
                                        "end_pos": "0",
                                        "symbol": "wo3",
                                        "time_len": "0",
                                        "syll": {
                                            "rec_node_type": "paper",
                                            "symbol": "wo3",
                                            "time_len": "0",
                                            "phone": [{
                                                "beg_pos": "0",
                                                "content": "_u",
                                                "dp_message": "16",
                                                "end_pos": "0",
                                                "is_yun": "0",
                                                "perr_level_msg": "0",
                                                "rec_node_type": "paper",
                                                "time_len": "0"
                                            }, {
                                                "dp_message": "16",
                                                "is_yun": "1",
                                                "perr_level_msg": "0",
                                                "rec_node_type": "paper",
                                                "time_len": "0",
                                                "beg_pos": "0",
                                                "content": "uo",
                                                "end_pos": "0",
                                                "mono_tone": "TONE3"
                                            }],
                                            "beg_pos": "0",
                                            "content": "我",
                                            "dp_message": "16",
                                            "end_pos": "0"
                                        },
                                        "beg_pos": "0",
                                        "content": "我"
                                    }, {
                                        "beg_pos": "0",
                                        "content": "的",
                                        "end_pos": "0",
                                        "symbol": "de5",
                                        "time_len": "0",
                                        "syll": {
                                            "end_pos": "0",
                                            "rec_node_type": "paper",
                                            "symbol": "de5",
                                            "time_len": "0",
                                            "phone": [{
                                                "rec_node_type": "paper",
                                                "time_len": "0",
                                                "beg_pos": "0",
                                                "content": "d",
                                                "dp_message": "16",
                                                "end_pos": "0",
                                                "is_yun": "0",
                                                "perr_level_msg": "0"
                                            }, {
                                                "content": "e",
                                                "dp_message": "16",
                                                "is_yun": "1",
                                                "mono_tone": "TONE0",
                                                "time_len": "0",
                                                "beg_pos": "0",
                                                "perr_level_msg": "0",
                                                "rec_node_type": "paper",
                                                "end_pos": "0"
                                            }],
                                            "beg_pos": "0",
                                            "content": "的",
                                            "dp_message": "16"
                                        }
                                    }, {
                                        "beg_pos": "0",
                                        "content": "名",
                                        "end_pos": "0",
                                        "symbol": "ming2",
                                        "time_len": "0",
                                        "syll": {
                                            "end_pos": "0",
                                            "rec_node_type": "paper",
                                            "symbol": "ming2",
                                            "time_len": "0",
                                            "phone": [{
                                                "rec_node_type": "paper",
                                                "time_len": "0",
                                                "beg_pos": "0",
                                                "content": "m",
                                                "dp_message": "16",
                                                "end_pos": "0",
                                                "is_yun": "0",
                                                "perr_level_msg": "0"
                                            }, {
                                                "end_pos": "0",
                                                "perr_level_msg": "0",
                                                "content": "ing",
                                                "dp_message": "16",
                                                "is_yun": "1",
                                                "mono_tone": "TONE2",
                                                "rec_node_type": "paper",
                                                "time_len": "0",
                                                "beg_pos": "0"
                                            }],
                                            "beg_pos": "0",
                                            "content": "名",
                                            "dp_message": "16"
                                        }
                                    }, {
                                        "content": "字",
                                        "end_pos": "0",
                                        "symbol": "zi9",
                                        "time_len": "0",
                                        "syll": {
                                            "symbol": "zi9",
                                            "time_len": "0",
                                            "phone": [{
                                                "perr_level_msg": "0",
                                                "rec_node_type": "paper",
                                                "time_len": "0",
                                                "beg_pos": "0",
                                                "content": "z",
                                                "dp_message": "16",
                                                "end_pos": "0",
                                                "is_yun": "0"
                                            }, {
                                                "is_yun": "1",
                                                "time_len": "0",
                                                "beg_pos": "0",
                                                "end_pos": "0",
                                                "mono_tone": "TONE0",
                                                "perr_level_msg": "0",
                                                "rec_node_type": "paper",
                                                "content": "ii",
                                                "dp_message": "16"
                                            }],
                                            "beg_pos": "0",
                                            "content": "字",
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "rec_node_type": "paper"
                                        },
                                        "beg_pos": "0"
                                    }, {
                                        "syll": {
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "rec_node_type": "paper",
                                            "symbol": "shi4",
                                            "time_len": "0",
                                            "phone": [{
                                                "end_pos": "0",
                                                "is_yun": "0",
                                                "perr_level_msg": "0",
                                                "rec_node_type": "paper",
                                                "time_len": "0",
                                                "beg_pos": "0",
                                                "content": "sh",
                                                "dp_message": "16"
                                            }, {
                                                "mono_tone": "TONE4",
                                                "beg_pos": "0",
                                                "dp_message": "16",
                                                "is_yun": "1",
                                                "rec_node_type": "paper",
                                                "time_len": "0",
                                                "content": "iii",
                                                "end_pos": "0",
                                                "perr_level_msg": "0"
                                            }],
                                            "beg_pos": "0",
                                            "content": "是"
                                        },
                                        "beg_pos": "0",
                                        "content": "是",
                                        "end_pos": "0",
                                        "symbol": "shi4",
                                        "time_len": "0"
                                    }, {
                                        "symbol": "zhang1",
                                        "time_len": "0",
                                        "syll": {
                                            "time_len": "0",
                                            "phone": [{
                                                "is_yun": "0",
                                                "perr_level_msg": "0",
                                                "rec_node_type": "paper",
                                                "time_len": "0",
                                                "beg_pos": "0",
                                                "content": "zh",
                                                "dp_message": "16",
                                                "end_pos": "0"
                                            }, {
                                                "content": "ang",
                                                "dp_message": "16",
                                                "mono_tone": "TONE1",
                                                "perr_level_msg": "0",
                                                "rec_node_type": "paper",
                                                "time_len": "0",
                                                "beg_pos": "0",
                                                "end_pos": "0",
                                                "is_yun": "1"
                                            }],
                                            "beg_pos": "0",
                                            "content": "张",
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "rec_node_type": "paper",
                                            "symbol": "zhang1"
                                        },
                                        "beg_pos": "0",
                                        "content": "张",
                                        "end_pos": "0"
                                    }, {
                                        "content": "三",
                                        "end_pos": "0",
                                        "symbol": "san1",
                                        "time_len": "0",
                                        "syll": {
                                            "symbol": "san1",
                                            "time_len": "0",
                                            "phone": [{
                                                "perr_level_msg": "0",
                                                "rec_node_type": "paper",
                                                "time_len": "0",
                                                "beg_pos": "0",
                                                "content": "s",
                                                "dp_message": "16",
                                                "end_pos": "0",
                                                "is_yun": "0"
                                            }, {
                                                "perr_level_msg": "0",
                                                "beg_pos": "0",
                                                "end_pos": "0",
                                                "is_yun": "1",
                                                "mono_tone": "TONE1",
                                                "rec_node_type": "paper",
                                                "time_len": "0",
                                                "content": "an",
                                                "dp_message": "16"
                                            }],
                                            "beg_pos": "0",
                                            "content": "三",
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "rec_node_type": "paper"
                                        },
                                        "beg_pos": "0"
                                    }],
                                    "beg_pos": "0"
                                },
                                {
                                    "beg_pos": "0",
                                    "content": "天真",
                                    "end_pos": "0",
                                    "time_len": "0",
                                    "word": [{
                                        "end_pos": "0",
                                        "symbol": "tian1",
                                        "time_len": "0",
                                        "syll": {
                                            "end_pos": "0",
                                            "rec_node_type": "paper",
                                            "symbol": "tian1",
                                            "time_len": "0",
                                            "phone": [{
                                                "rec_node_type": "paper",
                                                "time_len": "0",
                                                "beg_pos": "0",
                                                "content": "t",
                                                "dp_message": "16",
                                                "end_pos": "0",
                                                "is_yun": "0",
                                                "perr_level_msg": "0"
                                            }, {
                                                "content": "ian",
                                                "dp_message": "16",
                                                "end_pos": "0",
                                                "mono_tone": "TONE1",
                                                "time_len": "0",
                                                "beg_pos": "0",
                                                "is_yun": "1",
                                                "perr_level_msg": "0",
                                                "rec_node_type": "paper"
                                            }],
                                            "beg_pos": "0",
                                            "content": "天",
                                            "dp_message": "16"
                                        },
                                        "beg_pos": "0",
                                        "content": "天"
                                    }, {
                                        "beg_pos": "0",
                                        "content": "真",
                                        "end_pos": "0",
                                        "symbol": "zhen1",
                                        "time_len": "0",
                                        "syll": {
                                            "content": "真",
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "rec_node_type": "paper",
                                            "symbol": "zhen1",
                                            "time_len": "0",
                                            "phone": [{
                                                "dp_message": "16",
                                                "end_pos": "0",
                                                "is_yun": "0",
                                                "perr_level_msg": "0",
                                                "rec_node_type": "paper",
                                                "time_len": "0",
                                                "beg_pos": "0",
                                                "content": "zh"
                                            }, {
                                                "is_yun": "1",
                                                "mono_tone": "TONE1",
                                                "perr_level_msg": "0",
                                                "rec_node_type": "paper",
                                                "time_len": "0",
                                                "content": "en",
                                                "end_pos": "0",
                                                "beg_pos": "0",
                                                "dp_message": "16"
                                            }],
                                            "beg_pos": "0"
                                        }
                                    }]
                                }
                            ],
                            "beg_pos": "0",
                            "content": "我的名字是张三天真",
                            "end_pos": "210"
                        }
                    }
                }
            },
            "code": "0",
            "desc": "success",
            "sid": "wse00ff7319@dx5db613117cea6f2b00"
        },

        {
            "data": {
                "read_sentence": {
                    "lan": "cn",
                    "type": "study",
                    "version": "6,5,0,1028",
                    "rec_paper": {
                        "read_sentence": {
                            "time_len": "210",
                            "total_score": "68.965686",
                            "sentence": [{
                                "end_pos": "0",
                                "time_len": "0",
                                "total_score": "15.965686",
                                "word": [{
                                    "beg_pos": "0",
                                    "content": "我",
                                    "end_pos": "38",
                                    "symbol": "wo3",
                                    "time_len": "38",
                                    "syll": [{
                                        "beg_pos": "0",
                                        "content": "fil",
                                        "dp_message": "32",
                                        "end_pos": "1",
                                        "rec_node_type": "fil",
                                        "time_len": "1",
                                        "phone": {
                                            "beg_pos": "0",
                                            "content": "fil",
                                            "dp_message": "32",
                                            "end_pos": "1",
                                            "rec_node_type": "fil",
                                            "time_len": "1"
                                        }
                                    }, {
                                        "rec_node_type": "paper",
                                        "symbol": "wo3",
                                        "time_len": "37",
                                        "phone": [{
                                            "time_len": "3",
                                            "beg_pos": "1",
                                            "content": "_u",
                                            "dp_message": "0",
                                            "end_pos": "4",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper"
                                        }, {
                                            "beg_pos": "4",
                                            "content": "uo",
                                            "dp_message": "0",
                                            "end_pos": "38",
                                            "is_yun": "1",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "mono_tone": "TONE3",
                                            "time_len": "34"
                                        }],
                                        "beg_pos": "1",
                                        "content": "我",
                                        "dp_message": "0",
                                        "end_pos": "38"
                                    }]
                                }, {
                                    "end_pos": "60",
                                    "symbol": "de5",
                                    "time_len": "22",
                                    "syll": {
                                        "end_pos": "60",
                                        "rec_node_type": "paper",
                                        "symbol": "de0",
                                        "time_len": "22",
                                        "phone": [{
                                            "content": "d",
                                            "dp_message": "0",
                                            "end_pos": "44",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "6",
                                            "beg_pos": "38"
                                        }, {
                                            "mono_tone": "TONE0",
                                            "content": "e",
                                            "dp_message": "0",
                                            "end_pos": "60",
                                            "is_yun": "1",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "16",
                                            "beg_pos": "44"
                                        }],
                                        "beg_pos": "38",
                                        "content": "的",
                                        "dp_message": "0"
                                    },
                                    "beg_pos": "38",
                                    "content": "的"
                                }, {
                                    "time_len": "30",
                                    "syll": {
                                        "beg_pos": "60",
                                        "content": "名",
                                        "dp_message": "0",
                                        "end_pos": "90",
                                        "rec_node_type": "paper",
                                        "symbol": "ming2",
                                        "time_len": "30",
                                        "phone": [{
                                            "time_len": "12",
                                            "beg_pos": "60",
                                            "content": "m",
                                            "dp_message": "0",
                                            "end_pos": "72",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper"
                                        }, {
                                            "beg_pos": "72",
                                            "end_pos": "90",
                                            "is_yun": "1",
                                            "rec_node_type": "paper",
                                            "content": "ing",
                                            "dp_message": "0",
                                            "mono_tone": "TONE2",
                                            "perr_level_msg": "0",
                                            "time_len": "18"
                                        }]
                                    },
                                    "beg_pos": "60",
                                    "content": "名",
                                    "end_pos": "90",
                                    "symbol": "ming2"
                                }, {
                                    "symbol": "zi9",
                                    "time_len": "24",
                                    "syll": {
                                        "content": "字",
                                        "dp_message": "0",
                                        "end_pos": "114",
                                        "rec_node_type": "paper",
                                        "symbol": "zi0",
                                        "time_len": "24",
                                        "phone": [{
                                            "dp_message": "0",
                                            "end_pos": "100",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "10",
                                            "beg_pos": "90",
                                            "content": "z"
                                        }, {
                                            "content": "ii",
                                            "end_pos": "114",
                                            "mono_tone": "TONE0",
                                            "perr_level_msg": "0",
                                            "time_len": "14",
                                            "beg_pos": "100",
                                            "dp_message": "0",
                                            "is_yun": "1",
                                            "rec_node_type": "paper"
                                        }],
                                        "beg_pos": "90"
                                    },
                                    "beg_pos": "90",
                                    "content": "字",
                                    "end_pos": "114"
                                }, {
                                    "content": "是",
                                    "end_pos": "223",
                                    "symbol": "shi4",
                                    "time_len": "109",
                                    "syll": [{
                                        "dp_message": "0",
                                        "end_pos": "223",
                                        "rec_node_type": "sil",
                                        "time_len": "109",
                                        "phone": {
                                            "rec_node_type": "sil",
                                            "time_len": "109",
                                            "beg_pos": "114",
                                            "content": "sil",
                                            "dp_message": "0",
                                            "end_pos": "223"
                                        },
                                        "beg_pos": "114",
                                        "content": "sil"
                                    }, {
                                        "phone": [{
                                            "dp_message": "16",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "content": "sh"
                                        }, {
                                            "is_yun": "1",
                                            "mono_tone": "TONE4",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "content": "iii",
                                            "dp_message": "16"
                                        }],
                                        "beg_pos": "223",
                                        "content": "是",
                                        "dp_message": "16",
                                        "end_pos": "223",
                                        "rec_node_type": "paper",
                                        "symbol": "shi4",
                                        "time_len": "0"
                                    }],
                                    "beg_pos": "114"
                                }, {
                                    "time_len": "0",
                                    "syll": {
                                        "phone": [{
                                            "dp_message": "16",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "content": "zh"
                                        }, {
                                            "is_yun": "1",
                                            "mono_tone": "TONE1",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "content": "ang",
                                            "dp_message": "16"
                                        }],
                                        "beg_pos": "223",
                                        "content": "张",
                                        "dp_message": "16",
                                        "end_pos": "223",
                                        "rec_node_type": "paper",
                                        "symbol": "zhang1",
                                        "time_len": "0"
                                    },
                                    "beg_pos": "223",
                                    "content": "张",
                                    "end_pos": "223",
                                    "symbol": "zhang1"
                                }, {
                                    "symbol": "san1",
                                    "time_len": "0",
                                    "syll": {
                                        "content": "三",
                                        "dp_message": "16",
                                        "end_pos": "223",
                                        "rec_node_type": "paper",
                                        "symbol": "san1",
                                        "time_len": "0",
                                        "phone": [{
                                            "content": "s",
                                            "dp_message": "16",
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper"
                                        }, {
                                            "is_yun": "1",
                                            "mono_tone": "TONE1",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "content": "an",
                                            "dp_message": "16"
                                        }],
                                        "beg_pos": "223"
                                    },
                                    "beg_pos": "223",
                                    "content": "三",
                                    "end_pos": "223"
                                }],
                                "beg_pos": "0",
                                "content": "我的名字是张三"
                            }, {
                                "content": "天真",
                                "end_pos": "0",
                                "time_len": "0",
                                "total_score": "15.965686",
                                "word": [{
                                    "syll": {
                                        "dp_message": "16",
                                        "end_pos": "0",
                                        "rec_node_type": "paper",
                                        "symbol": "tian1",
                                        "time_len": "0",
                                        "phone": [{
                                            "is_yun": "0",
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "0",
                                            "beg_pos": "0",
                                            "content": "t",
                                            "dp_message": "16",
                                            "end_pos": "0"
                                        }, {
                                            "perr_level_msg": "0",
                                            "rec_node_type": "paper",
                                            "time_len": "0",
                                            "end_pos": "0",
                                            "is_yun": "1",
                                            "mono_tone": "TONE1",
                                            "beg_pos": "0",
                                            "content": "ian",
                                            "dp_message": "16"
                                        }],
                                        "beg_pos": "0",
                                        "content": "天"
                                    },
                                    "beg_pos": "0",
                                    "content": "天",
                                    "end_pos": "0",
                                    "symbol": "tian1",
                                    "time_len": "0"
                                }, {
                                    "beg_pos": "0",
                                    "content": "真",
                                    "end_pos": "0",
                                    "symbol": "zhen1",
                                    "time_len": "0",
                                    "syll": {
                                        "end_pos": "0",
                                        "rec_node_type": "paper",
                                        "symbol": "zhen1",
                                        "time_len": "0",
                                        "phone": [{
                                            "rec_node_type": "paper",
                                            "time_len": "0",
                                            "beg_pos": "0",
                                            "content": "zh",
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "is_yun": "0",
                                            "perr_level_msg": "0"
                                        }, {
                                            "is_yun": "1",
                                            "mono_tone": "TONE1",
                                            "rec_node_type": "paper",
                                            "time_len": "0",
                                            "end_pos": "0",
                                            "content": "en",
                                            "dp_message": "16",
                                            "perr_level_msg": "0",
                                            "beg_pos": "0"
                                        }],
                                        "beg_pos": "0",
                                        "content": "真",
                                        "dp_message": "16"
                                    }
                                }],
                                "beg_pos": "0"
                            }],
                            "beg_pos": "0",
                            "content": "我的名字是张三天真",
                            "end_pos": "210",
                            "except_info": "0",
                            "is_rejected": "false"
                        }
                    },
                    "rec_tree": {
                        "read_sentence": {
                            "time_len": "210",
                            "sentence": [{
                                    "content": "我的名字是张三",
                                    "end_pos": "0",
                                    "time_len": "0",
                                    "word": [{
                                        "end_pos": "0",
                                        "symbol": "wo3",
                                        "time_len": "0",
                                        "syll": {
                                            "rec_node_type": "paper",
                                            "symbol": "wo3",
                                            "time_len": "0",
                                            "phone": [{
                                                "beg_pos": "0",
                                                "content": "_u",
                                                "dp_message": "16",
                                                "end_pos": "0",
                                                "is_yun": "0",
                                                "perr_level_msg": "0",
                                                "rec_node_type": "paper",
                                                "time_len": "0"
                                            }, {
                                                "dp_message": "16",
                                                "is_yun": "1",
                                                "perr_level_msg": "0",
                                                "rec_node_type": "paper",
                                                "time_len": "0",
                                                "beg_pos": "0",
                                                "content": "uo",
                                                "end_pos": "0",
                                                "mono_tone": "TONE3"
                                            }],
                                            "beg_pos": "0",
                                            "content": "我",
                                            "dp_message": "16",
                                            "end_pos": "0"
                                        },
                                        "beg_pos": "0",
                                        "content": "我"
                                    }, {
                                        "beg_pos": "0",
                                        "content": "的",
                                        "end_pos": "0",
                                        "symbol": "de5",
                                        "time_len": "0",
                                        "syll": {
                                            "end_pos": "0",
                                            "rec_node_type": "paper",
                                            "symbol": "de5",
                                            "time_len": "0",
                                            "phone": [{
                                                "rec_node_type": "paper",
                                                "time_len": "0",
                                                "beg_pos": "0",
                                                "content": "d",
                                                "dp_message": "16",
                                                "end_pos": "0",
                                                "is_yun": "0",
                                                "perr_level_msg": "0"
                                            }, {
                                                "content": "e",
                                                "dp_message": "16",
                                                "is_yun": "1",
                                                "mono_tone": "TONE0",
                                                "time_len": "0",
                                                "beg_pos": "0",
                                                "perr_level_msg": "0",
                                                "rec_node_type": "paper",
                                                "end_pos": "0"
                                            }],
                                            "beg_pos": "0",
                                            "content": "的",
                                            "dp_message": "16"
                                        }
                                    }, {
                                        "beg_pos": "0",
                                        "content": "名",
                                        "end_pos": "0",
                                        "symbol": "ming2",
                                        "time_len": "0",
                                        "syll": {
                                            "end_pos": "0",
                                            "rec_node_type": "paper",
                                            "symbol": "ming2",
                                            "time_len": "0",
                                            "phone": [{
                                                "rec_node_type": "paper",
                                                "time_len": "0",
                                                "beg_pos": "0",
                                                "content": "m",
                                                "dp_message": "16",
                                                "end_pos": "0",
                                                "is_yun": "0",
                                                "perr_level_msg": "0"
                                            }, {
                                                "end_pos": "0",
                                                "perr_level_msg": "0",
                                                "content": "ing",
                                                "dp_message": "16",
                                                "is_yun": "1",
                                                "mono_tone": "TONE2",
                                                "rec_node_type": "paper",
                                                "time_len": "0",
                                                "beg_pos": "0"
                                            }],
                                            "beg_pos": "0",
                                            "content": "名",
                                            "dp_message": "16"
                                        }
                                    }, {
                                        "content": "字",
                                        "end_pos": "0",
                                        "symbol": "zi9",
                                        "time_len": "0",
                                        "syll": {
                                            "symbol": "zi9",
                                            "time_len": "0",
                                            "phone": [{
                                                "perr_level_msg": "0",
                                                "rec_node_type": "paper",
                                                "time_len": "0",
                                                "beg_pos": "0",
                                                "content": "z",
                                                "dp_message": "16",
                                                "end_pos": "0",
                                                "is_yun": "0"
                                            }, {
                                                "is_yun": "1",
                                                "time_len": "0",
                                                "beg_pos": "0",
                                                "end_pos": "0",
                                                "mono_tone": "TONE0",
                                                "perr_level_msg": "0",
                                                "rec_node_type": "paper",
                                                "content": "ii",
                                                "dp_message": "16"
                                            }],
                                            "beg_pos": "0",
                                            "content": "字",
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "rec_node_type": "paper"
                                        },
                                        "beg_pos": "0"
                                    }, {
                                        "syll": {
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "rec_node_type": "paper",
                                            "symbol": "shi4",
                                            "time_len": "0",
                                            "phone": [{
                                                "end_pos": "0",
                                                "is_yun": "0",
                                                "perr_level_msg": "0",
                                                "rec_node_type": "paper",
                                                "time_len": "0",
                                                "beg_pos": "0",
                                                "content": "sh",
                                                "dp_message": "16"
                                            }, {
                                                "mono_tone": "TONE4",
                                                "beg_pos": "0",
                                                "dp_message": "16",
                                                "is_yun": "1",
                                                "rec_node_type": "paper",
                                                "time_len": "0",
                                                "content": "iii",
                                                "end_pos": "0",
                                                "perr_level_msg": "0"
                                            }],
                                            "beg_pos": "0",
                                            "content": "是"
                                        },
                                        "beg_pos": "0",
                                        "content": "是",
                                        "end_pos": "0",
                                        "symbol": "shi4",
                                        "time_len": "0"
                                    }, {
                                        "symbol": "zhang1",
                                        "time_len": "0",
                                        "syll": {
                                            "time_len": "0",
                                            "phone": [{
                                                "is_yun": "0",
                                                "perr_level_msg": "0",
                                                "rec_node_type": "paper",
                                                "time_len": "0",
                                                "beg_pos": "0",
                                                "content": "zh",
                                                "dp_message": "16",
                                                "end_pos": "0"
                                            }, {
                                                "content": "ang",
                                                "dp_message": "16",
                                                "mono_tone": "TONE1",
                                                "perr_level_msg": "0",
                                                "rec_node_type": "paper",
                                                "time_len": "0",
                                                "beg_pos": "0",
                                                "end_pos": "0",
                                                "is_yun": "1"
                                            }],
                                            "beg_pos": "0",
                                            "content": "张",
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "rec_node_type": "paper",
                                            "symbol": "zhang1"
                                        },
                                        "beg_pos": "0",
                                        "content": "张",
                                        "end_pos": "0"
                                    }, {
                                        "content": "三",
                                        "end_pos": "0",
                                        "symbol": "san1",
                                        "time_len": "0",
                                        "syll": {
                                            "symbol": "san1",
                                            "time_len": "0",
                                            "phone": [{
                                                "perr_level_msg": "0",
                                                "rec_node_type": "paper",
                                                "time_len": "0",
                                                "beg_pos": "0",
                                                "content": "s",
                                                "dp_message": "16",
                                                "end_pos": "0",
                                                "is_yun": "0"
                                            }, {
                                                "perr_level_msg": "0",
                                                "beg_pos": "0",
                                                "end_pos": "0",
                                                "is_yun": "1",
                                                "mono_tone": "TONE1",
                                                "rec_node_type": "paper",
                                                "time_len": "0",
                                                "content": "an",
                                                "dp_message": "16"
                                            }],
                                            "beg_pos": "0",
                                            "content": "三",
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "rec_node_type": "paper"
                                        },
                                        "beg_pos": "0"
                                    }],
                                    "beg_pos": "0"
                                },
                                {
                                    "beg_pos": "0",
                                    "content": "天真",
                                    "end_pos": "0",
                                    "time_len": "0",
                                    "word": [{
                                        "end_pos": "0",
                                        "symbol": "tian1",
                                        "time_len": "0",
                                        "syll": {
                                            "end_pos": "0",
                                            "rec_node_type": "paper",
                                            "symbol": "tian1",
                                            "time_len": "0",
                                            "phone": [{
                                                "rec_node_type": "paper",
                                                "time_len": "0",
                                                "beg_pos": "0",
                                                "content": "t",
                                                "dp_message": "16",
                                                "end_pos": "0",
                                                "is_yun": "0",
                                                "perr_level_msg": "0"
                                            }, {
                                                "content": "ian",
                                                "dp_message": "16",
                                                "end_pos": "0",
                                                "mono_tone": "TONE1",
                                                "time_len": "0",
                                                "beg_pos": "0",
                                                "is_yun": "1",
                                                "perr_level_msg": "0",
                                                "rec_node_type": "paper"
                                            }],
                                            "beg_pos": "0",
                                            "content": "天",
                                            "dp_message": "16"
                                        },
                                        "beg_pos": "0",
                                        "content": "天"
                                    }, {
                                        "beg_pos": "0",
                                        "content": "真",
                                        "end_pos": "0",
                                        "symbol": "zhen1",
                                        "time_len": "0",
                                        "syll": {
                                            "content": "真",
                                            "dp_message": "16",
                                            "end_pos": "0",
                                            "rec_node_type": "paper",
                                            "symbol": "zhen1",
                                            "time_len": "0",
                                            "phone": [{
                                                "dp_message": "16",
                                                "end_pos": "0",
                                                "is_yun": "0",
                                                "perr_level_msg": "0",
                                                "rec_node_type": "paper",
                                                "time_len": "0",
                                                "beg_pos": "0",
                                                "content": "zh"
                                            }, {
                                                "is_yun": "1",
                                                "mono_tone": "TONE1",
                                                "perr_level_msg": "0",
                                                "rec_node_type": "paper",
                                                "time_len": "0",
                                                "content": "en",
                                                "end_pos": "0",
                                                "beg_pos": "0",
                                                "dp_message": "16"
                                            }],
                                            "beg_pos": "0"
                                        }
                                    }]
                                }
                            ],
                            "beg_pos": "0",
                            "content": "我的名字是张三天真",
                            "end_pos": "210"
                        }
                    }
                }
            },
            "code": "0",
            "desc": "success",
            "sid": "wse00ff7319@dx5db613117cea6f2b00"
        },
    ]
}



let curmodata = {};
//! scorecb: { code:0, score:xx}
xunliancommon.modata = (lang, sindex) => {
    curmodata = pcdata[lang][sindex];
};
xunliancommon.dowavscore = (vuethis, wavpath, text, langin, scorecb) => {
    // let cookie= common.getCookie('EXSOFTSSID');  //本地获取 windows 异常
    let cookie = vuethis.serverparams.cookie;
    console.log('dowavscore cookie', cookie);
    let url = '/api/voice/pingce';
    if (cookie && cookie != null) {
        url += `?cookie=${cookie}`;
    }
    url = common.getDomainUrl(url);
    console.log(url);
    let lang = langin || 'en_us';
    let nopc = xunliancommon.nopingce(vuethis);
    let resultcb = (resobj) => {
        console.log('in dowavscore cb resobj', resobj);
        if(nopc){console.log('js声通离线评测')}
        let done = false;
        let ncode = -1;
        if (resobj && resobj.code == 0 || resobj.eof == 1 && resobj.result) {
            try {
                let cdata = null;
                if (resobj.code == 0) {
                    cdata = JSON.parse(resobj.data);
                }
                if (resobj.eof == 1 && resobj.result) {
                    cdata = resobj;
                }
                console.log('in dowavscore cb resobj cdata', cdata);
                if (cdata.code == 0 || cdata.eof == 1 && cdata.result) {
                    if (nopc) {
                      
                        let result = cdata.result;
                        let score = Math.floor(result.overall);
                        let errormsg = {};
                        let dp_msg = [];
                        let tempcontent = [];
                        for (let v of result.words) {
                            tempcontent.push(v.word)
                        }
                        errormsg.content = tempcontent;
                        errormsg.dp_msg = dp_msg;
                        errormsg.except_info = 0;
                        errormsg.is_rejected = false;
                        scorecb(0, score, errormsg);
                        done = true;
                    } else {
                        let sentenceobj = {};
                        let rec_paper = cdata.data.read_sentence.rec_paper
                        let ci = null;
                        if (rec_paper.read_chapter) {
                            ci = rec_paper.read_chapter
                        }
                        if (rec_paper.read_sentence) {
                            ci = rec_paper.read_sentence
                        }
                        if (rec_paper.read_word) {
                            ci = rec_paper.read_word
                        }
                        if (ci.sentence) {
                            sentenceobj.content = ci.content;
                            sentenceobj.sentence = ci.sentence;
                            sentenceobj.except_info = ci.except_info;
                            sentenceobj.is_rejected = ci.is_rejected;
                        }
                        let score = Math.floor(ci.total_score);
                        if (ci.is_rejected == 'true') {
                            //! 视为0分
                            console.log('rejected, as zero');
                            score = 0;
                        }
                        console.log(score);
                        done = true;
                        scorecb(0, score, xunliancommon.geterrtext(sentenceobj, lang));
                    }
                } else {
                    ncode = cdata.code ? cdata.code : '-1';
                }
            } catch (e) {
                console.log(e);
            }
        }
        if (!done) {
            console.log('!done ', );
            scorecb(ncode, 0);
        }
    }
    let argobj = {}
    argobj.url = url;
    let postobj = {}
    postobj.audio = wavpath
    postobj.text = text;
    postobj.lang = lang;
    postobj.detail = true;
    if (vuethis.serverparams.recsave) {
        let sp = vuethis.serverparams;
        postobj.xunliansave = {
            aboutid: sp.aboutid,
            abouttype: sp.abouttype,
            xunliantype: sp.xunliantype,
            sentindex: vuethis.cursentindex,
            userid: sp.userid
        }
    }
    if (nopc) {
        postobj.noPingce = true;
    }
    argobj.post = postobj
    argobj.postprop = {
        "audio": "filebase64"
    }
    console.log(vuethis.serverparams.xunliantype + 'xunlain 打分需要data', argobj);
    argobj.resultcb = resultcb;
    let cbkey = new Date().getTime();
    if (process.env.NODE_ENV == "development") {
        argobj.key = cbkey
        setTimeout(() => {
            window.exsoftnative("callcallback", {
                data: {
                    code: 0,
                    data: JSON.stringify(curmodata),
                },
                key: cbkey
            }, true);
        }, 5000);
    }
    nativeobject.httppost(argobj);
}
xunliancommon.geterrtext = (sentenceobj, lang = 'en_us') => {
        if (!sentenceobj.sentence) return "";
        let content = sentenceobj.content.split(' ');
        let sentence = [];
        if (Array.isArray(sentenceobj.sentence)) {
            sentence = sentenceobj.sentence;
        } else {
            sentence.push(sentenceobj.sentence);
        }
        console.log("评测详情 sentence", sentenceobj);
        console.log(" sentence", sentence);
        let errormsg = {};
        let dp_msg = [];
        let tempcontent = [];
        let gindex = -1;
        for (let sitem of sentence) {
            let sword = sitem.word;
            let tempsword = [];
            if (Array.isArray(sword)) {
                tempsword = sword;
            } else {
                tempsword.push(sword);
            }
            for (let i = 0; i < tempsword.length; i++) {
                gindex++;
                let item = tempsword[i];
                if (lang == 'en_us') {
                    if (item.total_score) {
                        tempcontent.push(content[item.global_index]);
                    }
                    if (item.total_score && !parseInt(item.total_score)) {
                        let index = item.global_index;
                        dp_msg.push({
                            global_index: index,
                            content: content[index],
                            dp_message: item.dp_message,
                        });
                    }
                } else {
                    tempcontent.push(item.content);
                    let syll = null;
                    if (item.syll) {
                        syll = item.syll;
                        if (Array.isArray(syll)) {
                            for (let syitem of syll) {
                                if (syitem.rec_node_type == 'paper') {
                                    if (syitem.dp_message != '0') {
                                        dp_msg.push({
                                            global_index: gindex,
                                            content: syitem.content,
                                            dp_message: syitem.dp_message,
                                        });
                                    }
                                }
                            }
                        } else {
                            if (syll.dp_message != '0') {
                                dp_msg.push({
                                    global_index: gindex,
                                    content: syll.content,
                                    dp_message: syll.dp_message,
                                });
                            }
                        }
                    }
                }
            }
        }
        console.log('tempcontent', tempcontent);
        errormsg.content = tempcontent;
        errormsg.dp_msg = dp_msg;
        errormsg.except_info = sentenceobj.except_info;
        errormsg.is_rejected = sentenceobj.is_rejected;
        console.log("未得分单词 errormsg", errormsg);
        // errortext
        return errormsg;
    },
    //！ 文本打分
    xunliancommon.textScore = (usertext, answertext) => {
        if (!usertext.length || !answertext.length) {
            return 0;
        }
        let useroffset = 0;
        let i = 0;
        let j = 0;
        let matchlen = 0;
        let curmatch = 0;
        let totallen = 0;
        let userlen = 0;
        let answerlen = 0;
        //  console.log('textscore, usertext len:'+usertext.length);
        for (i = 0; i < answertext.length; i++) {
            if (xunliancommon.isvalidtext(answertext[i])) {
                answerlen++;
            }
        }
        for (i = 0; i < usertext.length; i++) {
            if (xunliancommon.isvalidtext(usertext[i])) {
                userlen++;
            }
        }
        if (!userlen || !answerlen) {
            return 0;
        }
        let minimatch = Math.min(answerlen, 2);
        let searchlen = 3;
        for (i = 0; i < answertext.length;) {
            curmatch = 0;
            if (!xunliancommon.isvalidtext(answertext[i])) {
                i++
                continue;
            }
            let curi = i;
            for (j = useroffset; j < usertext.length && curi < answertext.length;) {
                if (answertext[curi] == usertext[j]) {
                    if (xunliancommon.isvalidtext(answertext[curi])) {
                        curmatch++;
                    }
                    curi++;
                    j++;
                    continue;
                } else {
                    if (curmatch >= minimatch) {
                        break;
                    }
                    curmatch = 0;
                    if (j - useroffset > searchlen) {

                        break;
                    }
                    curi = i;
                    j++;
                }
            }
            if (curmatch >= minimatch) {
                matchlen += curmatch;
                // console.log(matchlen);
                useroffset = j;
                i = curi;
            } else {
                i++;
            }
        }
        let score = (matchlen / answerlen) * 100;
        // console.log(userlen);
        // console.log(answerlen);
        if (userlen > answerlen) { //! 多拼的
            score *= answerlen / userlen;
        }
        if (score > 100) {
            score = 100;
        }
        if (score < 0) {
            score = 0;
        }
        score = Math.floor(score);
        return score;
    }



export default xunliancommon;