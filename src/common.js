import {
    Indicator,
    Toast,
    MessageBox
} from "mint-ui";
var common = {}
common.starScore = score => {
        score = parseInt(score);
        let starnum = 0;
        let arr = [];
        if (score >= 95) {
            score = 100;
        }
        if (score < 33) {
            return arr;
        }
        starnum = parseInt(score / 33);
        if (starnum == 0) {
            return arr;
        }
        for (let i = 0; i < starnum; i++) {
            arr.push(i + 1);
        }
        return arr;
    },
    common.showbanstar = (score) => {
        if (!score) return false;
        let avscore = 33;
        let curscore = parseFloat(score);

        if (curscore < avscore && curscore > avscore / 2) {
            return true;
        }
        if (curscore % avscore >= avscore / 2) {
            return true;
        }
        return false;
    }
common.parseplaytime = s => {
        if (!s) {
            return 0
        }
        let sv = parseFloat(s)
        if (isNaN(sv)) {
            return 0
        }
        if (sv < 0) {
            return 0
        }
        if (sv > 100) {
            return 100
        }
        return Math.floor(sv * 10) / 10
    },
    common.parseURL = (url) => {
        var query = url && url.split('?')[1]
        var queryArr = query && query.split('&')
        var params = {}
        queryArr &&
            queryArr.forEach(function (item) {
                var key = item.split('=')[0]
                var value = item.split('=')[1]
                params[key] = value
            })
        return params
    }


common.getDomainUrl = (suburl = null) => {
    let szret = window.location.protocol;
    szret += '//';
    szret += window.location.hostname;
    // szret += ":";
    let port = window.location.port;
    //szret += window.location.port;
    if (process.env.NODE_ENV == "development") {
        //  szret = 'http://192.168.1.133:'
        // port = 9982;
    }
    if (port) {
        szret += ":";
        szret += port;
    }
    if (suburl) {
        szret += suburl
    }
    return szret;
}
common.getCookie = (name) => {
    let arr, reg = new RegExp("(^|)" + name + "=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg)) {
        let cookie = unescape(arr[2]);
        if (cookie && cookie.length > 10) {
            return cookie;
        }
    }
    return null;
}
common.rtrim = (text) => {
    var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
    return text == null ?
        "" :
        (text + "").replace(rtrim, "");
}
common.replacetext = (el, errormsg, init = false) => {
    const errvl = errormsg.dp_msg;
    console.log('replacetext 读错单词', errvl);
    let txt = '';
    let srccontent = [];
    if (errormsg.content) {
        if (errormsg.content.length) {
            srccontent = JSON.parse(JSON.stringify(errormsg.content));
        }
    }
    let str = "";
    if (errvl.length) {
        for (let item of errvl) {
            srccontent[item.global_index] = `<span class="errred">${item.content}</span>`;
        }
    }
    console.log('dist content', srccontent)
    for (let i = 0; i < srccontent.length; i++) {
        let item = srccontent[i];
        str += item + '\n';
    }
    if (!init) {
        el.innerHTML = str;
    }
    console.log('replacetext str', str);
    console.log('replacetext errormsg', errormsg);
    return str;
}
common.errcodetrl = (code) => {
    switch (code) {
        case '16':
            return '该单词漏读或者完全读错';
        case '32':
            return '该单词增读';
        case '28673':
            return '语音无音或者音量小';
        case '28676':
            return '检测到乱说型';
        case '28680':
            return '检测到可能音噪比较低';
        case '28690':
            return '检测到语音为截幅';
        case '28689':
            return '没有音频输入，请检测音频或者录音是否正常';
        default:
            return '';
    }
}
common.defaultlangs = [{
        name: '简体中文',
        type: 'zh'
    },
    {
        name: '英文',
        type: 'en'
    },
    {
        name: '日文',
        type: 'jp'
    },
    {
        name: '韩文',
        type: 'kor'
    },
    {
        name: '法语',
        type: 'fra'
    },
    {
        name: '德语',
        type: 'de'
    },
    // {
    //     name: '印尼文',
    //     type: 'indonesian'
    // },
];
common.FanyiLangs = () => {
    let temp = [];
    for (let v of common.defaultlangs) {
        if (v.type == 'indonesian' || v.type == 'zh') {
            continue;
        }
        temp.push(v.type);
    }
    return temp;
};
common.loadlang = ($http, langurl, i18n, hasToLang = '') => {
    let curlang = hasToLang ? hasToLang : i18n.locale;
    console.log('loadlang langurl', langurl);
    console.log('loadlang langurl i18n.locale', curlang);
    console.log('loadlang langurl i18n', i18n);
    const uplang = () => {
        if (curlang == 'zh' || i18n.vm.messages[curlang]) {
            i18n.locale = curlang;
            localStorage.setItem("lang", i18n.locale);
            return;
        }
        Toast('暂不支持该语言')
    }
    if (curlang == 'zh') {
        uplang();
        return
    };
    const upmessage = (loadmsg) => {
        if (hasToLang) {
            uplang();
        }
        i18n.vm.messages[curlang] = {
            ...loadmsg
        };
        sessionStorage.setItem('xunlianloadfanyimessages', JSON.stringify(i18n.vm.messages));
    }
    if (i18n.vm.messages[curlang] && !Object.keys(i18n.vm.messages[curlang]).length) {
        Indicator.open('loading...');
        $http
            .get(langurl + `?time=${new Date().getTime()}`)
            .then(res => {
                console.log(res.data);
                upmessage(res.data);
                Indicator.close();
            })
            .catch(err => {
                Toast(err)
                Indicator.close();
                if (!hasToLang) {
                    i18n.locale = 'zh';
                    localStorage.setItem("lang", 'zh');
                }

            });
        return;
    }
    uplang();
}
export default common;