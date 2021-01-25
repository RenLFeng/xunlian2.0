import Vue from 'vue'
import peiying from './peiying.vue'

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

import axios from 'axios'

Vue.prototype.$http = axios
import i18n from '@/i18nload'
Vue.use(ElementUI);

import Mint from 'mint-ui'
import 'mint-ui/lib/style.css'
import '@/assets/css/my-mint.css'
Vue.use(Mint);


import Vconsole from 'vconsole'
let vConsole = new Vconsole()
Vue.use(vConsole)

// document.documentElement.addEventListener('touchstart',function(e){
//   if(e.touches.length>1){
//     e.preventDefault();
//   }
// },{passive:false})


Vue.config.productionTip = false;

new Vue({
  i18n,
  render: h => h(peiying),
}).$mount('#app')