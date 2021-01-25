import Vue from 'vue'
import common from '@/common';
import VueI18n from 'vue-i18n';
import axios from 'axios'
const sprintf = require('sprintf-js').sprintf;
Vue.use(VueI18n);
let lang = '';
let UrlParams = common.parseURL(window.location.href);
console.log('fanyi loadlang', window.location.href, "UrlParams", UrlParams);
let tempMessages = {};
let localmessages = sessionStorage.getItem('xunlianloadfanyimessages') || '';
let haslocalmsg = false;
if (UrlParams.flang) {
    console.log('Urlhasflang', UrlParams.flang);
    lang = UrlParams.flang;
}
for (let v of common.FanyiLangs()) {
    tempMessages[v] = {};
}
if (localmessages) {
    localmessages = JSON.parse(localmessages);
    haslocalmsg = true;
    tempMessages = {
        ...tempMessages,
        ...localmessages
    }
}
const i18n = new VueI18n({
    locale: lang || 'zh',
    // locale: lang || localStorage.getItem('lang') || 'zh',
    messages: tempMessages,
    silentTranslationWarn: true
})
const $t = (key) => {
    let values = [],
        len = arguments.length - 1;
    while (len-- > 0) values[len] = arguments[len + 1];
    return i18n._t.apply(i18n, [key, i18n.locale, i18n._getMessages(), this].concat(values))
}
Vue.prototype.$mt = (str, sprintfobj = null, groupindex = -1) => {
    let langkey = common.rtrim(str);
    if (i18n.locale == 'zh') {
        if (sprintfobj) {
            let arrval = Object.values(sprintfobj);
            return sprintf(langkey, ...arrval);
        }
        return langkey;
    }
    let langobj = $t(`${langkey}`);
    if (groupindex>=0 && Array.isArray(langobj)) {
        if (sprintfobj) {
            let arrval = Object.values(sprintfobj);
            return sprintf(langobj[groupindex], ...arrval);
        }
        return langobj[groupindex];
    } else {
        if (sprintfobj) {
            let arrval = Object.values(sprintfobj);
            return sprintf(langobj, ...arrval);
        }
        return langobj;
    }
    //   return i18n._t.apply(i18n, [langkey, i18n.locale, i18n._getMessages(), this].concat({
    //       ...sprintfobj
    //   }))
};
const langurl = common.getDomainUrl(`/xunlian/lang_${i18n.locale}.json`);
common.loadlang(axios, langurl, i18n);
export default i18n;