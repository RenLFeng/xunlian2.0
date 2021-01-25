import Vue from 'vue'
import App from './App.vue'

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

import axios from 'axios'


Vue.prototype.$http = axios

Vue.use(ElementUI);
import i18n from '@/i18nload'
import Mint from 'mint-ui'
import 'mint-ui/lib/style.css'
import '@/assets/css/my-mint.css'
Vue.use(Mint);



import Vconsole from 'vconsole'
    let vConsole = new Vconsole()
    Vue.use(vConsole)




Vue.config.productionTip = false

new Vue({
  i18n,
  render: h => h(App),
}).$mount('#app')
