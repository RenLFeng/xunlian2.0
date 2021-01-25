/*
 *  cjy: 封装与原生代码的通信；   调用原生函数； 原生函数回调
 *  注意： 仅做通信； 公共类；  主要不要混杂其他的业务代码
 */



import {
    Base64
} from 'js-base64';

var devapiversion = 3;

var nativebridge = {};


nativebridge.platform = ''
nativebridge.os = ''; //! os 类型; 与是否是weixin端无关
nativebridge.apiversion = 0; //! 接口版本，用于判断支持的功能，例如录音等
nativebridge.isdebug = false; //! 是否调试模式/开发环境

nativebridge.callbacktimeout = 5000; //! 默认5秒超时



nativebridge.detectplatform = function () {
    var ua = navigator.userAgent;
    // ua = 'ExsoftIosWeb;version1'
    console.log(ua);
    //alert(ua);
    let os = '';

    let pa = '';
    if (ua.indexOf('ExsoftIosWeb') > -1) {
        pa = 'exsoftios';
        os = 'ios'
    }
    if (ua.indexOf('miniProgram') > -1 ||
        ua.indexOf('wechatdevtools') > -1
    ) {
        //   pa = 'miniprogram';  //! cjy: 为了wx的通用性（windows端）， 不再通过ua判断
        //!
    }
    if (window.ExsoftAndroid) {
        pa = 'exsoftandroid';
        os = 'android'
    }
    if (window.ExsoftWindows) {
        //! 检测是否是大屏端
        if (ua.indexOf('WebDaPing') > -1) {
            pa = 'exsoftdaping';
        } else {
            pa = 'exsoftwindows';
        }
        os = 'windows'
    }

    function wxready() {
        console.log('jsbridge ready:' + window.__wxjs_environment);

        if (window.__wxjs_environment === 'miniprogram') // true
        {
            nativebridge.platform = 'miniprogram'
        } else {
            // wx的网页会走这里
            // alert(window.__wxjs_environment);
        }
    }

    if (pa == 'miniprogram' || pa == '') {
        //! windows电脑端， 无法通过ua来判断是否是小程序

        if (!window.WeixinJSBridge || !window.WeixinJSBridge.invoke) {
            document.addEventListener('WeixinJSBridgeReady', wxready, false)
            //! 设置超时
            let wxtimeout = () => {}
            setTimeout(wxtimeout, 3000)
        } else {
            //  ready()
            console.log('weixin js bridge ok');
            pa = 'miniprogram'
        }
    }


    if (pa != '') {
        //! 解析api版本
        console.log(ua);
        let strarray = ua.split(';');
        if (strarray.length >= 2) {
            //  let iv = strarray[1];
            for (let i = 1; i < strarray.length; i++) {
                let iv = strarray[i]
                if (iv.substr(0, 7) == 'version') {
                    nativebridge.apiversion = parseInt(iv.substr(7))
                    break;
                }
            }

        }
    }
    if (process.env.NODE_ENV == 'development') {
        nativebridge.apiversion = devapiversion;
    }
    nativebridge.os = os;

    if (process.env.NODE_ENV == "development") {
        nativebridge.isdebug = true
    }

    nativebridge.platform = pa;



    return pa;
}

nativebridge.printinfo = function () {
    console.log(navigator.userAgent);
    console.log('in detectplatform:' + nativebridge.platform + ' apiversion:' + nativebridge.apiversion + ' os:' + nativebridge.os);
}




nativebridge.nativecallbacks = {};

nativebridge.nativelisten = function (funname, funcallback) {
    nativebridge.nativecallbacks[funname] = funcallback;
}


//! cjy: nativecalled 由原生调用； js不要调用
nativebridge.nativecalled = function (funname, strbase64, moni = false) {
    // console.log('window 对象 训练', window);
    try {
    
        let objarg = null;
        if (!moni) {
            if (strbase64 && strbase64.length > 0) {
                console.log(strbase64.length);
                let result = Base64.decode(strbase64);
                console.log(result);
                try {
                    objarg = JSON.parse(result);
                } catch (e) {
                    console.log(e)
                }
            }
        } else {
            objarg = strbase64;
        }
        console.log('in nativebridge.nativecalled 训练',objarg);
        if (
            //objarg &&     //! cjy: null也走回调
            (typeof nativebridge.nativecallbacks[funname] == 'function')) {
           
            nativebridge.nativecallbacks[funname](objarg);
        }
    } catch (e) {

        console.log('nativecode.native exception, funname:' + funname + " strarg:" + strbase64);
        console.log(e);
    }
}
nativebridge.genid = function (len) {
    //! 生成题目的唯一id，尽可能减少重复
    len = len || 32;
    var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'; /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
    var maxPos = $chars.length;
    var pwd = '';
    let i = 0;
    for (i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
}


nativebridge.callresultcb = {};

nativebridge.oncallresult = function (key, dataobj, istimeout = false) {
    // console.log('exsoftnative 时间 训练',new Date().getTime());
    console.log(' in oncallresult  训练 dataobj', dataobj);
    if (process.env.NODE_ENV != "development") {
        if (window) {
            if (window.parent) {
                if (window.parent.window) {
                    if (window.parent.window.exsoftnative&&dataobj==null) {
                        return;
                    }
                }
            }
        }
    }
    let cbs = nativebridge.callresultcb;
    console.log('in oncallresult 训练 cbs', cbs);
    if (cbs[key]) {
        let ck = cbs[key];
        if (ck.timeoutid) {
            clearTimeout(ck.timeoutid);
            ck.timeoutid = null;
        }
        if (typeof dataobj == 'string') {
            if (dataobj.substr(0, 1) == '{') { //！ 可能为json类型
                try {
                    let tmpobj = JSON.parse(dataobj)
                    dataobj = tmpobj
                } catch (e) {
                    console.log('oncallresult ,parse dataobjfailed:');
                    console.log(e);
                }
            }
        }
        if (ck.resultcb && !istimeout) {
            try {
                ck.resultcb(dataobj)
            } catch (e) {
                console.log('nativebridge: onncallresult cb exception:');
                console.log(e)
            }
        }
        if (ck.finnalcb) {
            try {
                ck.finnalcb(istimeout);
            } catch (e) {
                console.log('nativebridge: onfinal cb exception:');
                console.log(e)
            }
        }
        delete cbs[key]
    } else {
        //   console.log('oncallresult, not found cb for key:'+key)
    }
}

nativebridge.ncall = function (funname, argobj, callbackobj = null) {
    //console.log("nativecode, ncall:"+funname);

    //  if (process.env.NODE_ENV == "development"
    //&& nativecode.platform == ''
    // )
    {
        console.log('nativecode.platform:' + nativebridge.platform + 'ncall:' + funname + " argobj:" + JSON.stringify(argobj));
    }
    //return;

    try {

        // if (!nativecode.issupportfun(funname)) {
        //     return null;
        // }
        //
        // if (nativecode.platform == 'miniprogram') {
        //     return nativecode.wxcall(funname, argobj);
        // }


        let szret = "";
        if (!argobj) {
            argobj = {};
        }

        if (callbackobj) {
            //! 注入监听回调
            if (!callbackobj.callbackkey) {
                argobj.callbackkey = nativebridge.genid();
            } else {
                argobj.callbackkey = callbackobj.callbackkey;
            }
            let cobj = {};
            cobj.resultcb = callbackobj.resultcb;
            cobj.finnalcb = callbackobj.finnalcb;

            let timeoutcb = () => {
                nativebridge.oncallresult(argobj.callbackkey, null, true)
            }
            let timeoutmsec = nativebridge.callbacktimeout;
            if (typeof callbackobj.callbacktimeout != 'undefined') {
                timeoutmsec = callbackobj.callbacktimeout;
            }
            if (timeoutmsec > 0) {
                cobj.timeoutid = setTimeout(timeoutcb, timeoutmsec);
            }
            nativebridge.callresultcb[argobj.callbackkey] = cobj;

        }

        let pa = nativebridge.platform;
        if (window.ExsoftAndroid) {
            //! android 平台
            szret = window.ExsoftAndroid.ncall(funname, JSON.stringify(argobj));
            // console.log("nativecode, android ret:"+szret);
        } else if (window.ExsoftWindows) {
            //! windows 平台
            let fullobj = {
                funname: funname,
                argobj: argobj,
            };
            szret = window.ExsoftWindows(JSON.stringify(fullobj));
        } else {
            //! 判断ios
            if (pa == 'exsoftios') {
                //! ios平台; 使用prompt 用来hack
                let fullobj = {
                    funname: funname,
                    argobj: argobj,
                };
                //
                if (nativebridge.apiversion >= 1) {
                    window.webkit.messageHandlers.jsToOcWithPrams.postMessage({
                        "params": JSON.stringify(fullobj)
                    })
                } else {
                    //! old method
                    szret = prompt(JSON.stringify(fullobj));
                }
            }
        }

        if (szret == "") {
            if (pa.length > 0) {
                return {};
            }
            return null;
        }

        try {
            let res = JSON.parse(szret);
            return res;
        } catch (e) {
            return {
                ret: szret
            };
        }

    } catch (e) {
        console.log(e);
    }

    return null;
}

nativebridge.inited = 0;



//! 初始化； 调一次， 设置cookie等; 注意在最低部，否则无法识别
nativebridge.initfirst = function () {
    if (nativebridge.inited) {
        return;
    }
    nativebridge.inited = 1;
    nativebridge.platform = nativebridge.detectplatform();
    window.exsoftnative = nativebridge.nativecalled;
    let platform = nativebridge.platform;
    window.exsoftnativexunlian = nativebridge.nativecalled;
    window.has = true;

    let callbackcb = (argobj) => {
        if (argobj.key) {
            //! 格式：  key：xx，  data：retobj
            nativebridge.oncallresult(argobj.key, argobj.data, false);
        }
    }
    nativebridge.nativelisten('callcallback', callbackcb);

    console.log('nativebridge.initfirst22');

    return 1;
}


nativebridge.doneinit = nativebridge.initfirst();

export default nativebridge;