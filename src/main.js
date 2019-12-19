import Vue from 'vue'
import App from './App.vue'
import router from './router/router.js'
import ElementUI, { Message } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './assets/css/global.css'
import './assets/fonts/iconfont.css'
import axios from 'axios'
// 配置请求根路径
axios.defaults.baseURL = `http://127.0.0.1:8888/api/private/v1/`
Vue.prototype.$http = axios
Vue.prototype.$message = Message
Vue.config.productionTip = false
Vue.use(ElementUI)
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
